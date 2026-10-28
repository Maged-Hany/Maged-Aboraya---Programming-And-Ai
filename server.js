// Small zero-dependency Node.js server: serves the site and the lesson API.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 3000;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};
// Public directories (users.json is strictly blocked below)
const PUBLIC_DIRS = ['assets', 'data'];
const LANGS = new Set(['ar', 'en']);
const USERS_FILE = path.join(ROOT, 'data', 'users.json');
const VIDEOS_FILE = path.join(ROOT, 'data', 'videos.json');
const TEXTS_FILE = path.join(ROOT, 'data', 'texts.json');

const send = (res, code, body, type = 'application/json; charset=utf-8', extra = {}) => {
  res.writeHead(code, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(body);
};
const sendJSON = (res, code, obj, extra) => send(res, code, JSON.stringify(obj), undefined, extra);

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function getUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    try { fs.writeFileSync(USERS_FILE, JSON.stringify({ users: {} }, null, 2), 'utf8'); } catch(e) {}
    return { users: {} };
  }
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8').replace(/^\uFEFF/, ''));
  } catch (e) {
    return { users: {} };
  }
}

function saveUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getVideos() {
  if (!fs.existsSync(VIDEOS_FILE)) {
    try { fs.writeFileSync(VIDEOS_FILE, JSON.stringify({}, null, 2), 'utf8'); } catch(e) {}
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8').replace(/^\uFEFF/, ''));
  } catch (e) {
    return {};
  }
}

function saveVideos(data) {
  fs.writeFileSync(VIDEOS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function getTexts() {
  if (!fs.existsSync(TEXTS_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(TEXTS_FILE, 'utf8').replace(/^\uFEFF/, ''));
  } catch (e) {
    return null;
  }
}

function saveTexts(data) {
  fs.writeFileSync(TEXTS_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function readBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2e6) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

async function handleApi(req, url, res) {
  const parts = url.pathname.split('/').filter(Boolean); // ['api', ...]
  const method = req.method;

  // GET /api/meta
  if (method === 'GET' && parts[1] === 'meta' && parts.length === 2) {
    return sendJSON(res, 200, readJSON(path.join(ROOT, 'data', 'meta.json')), { 'Cache-Control': 'no-cache' });
  }

  // GET /api/lesson/:lang/:id
  if (method === 'GET' && parts[1] === 'lesson' && parts.length === 4) {
    const [, , lang, id] = parts;
    if (!LANGS.has(lang) || !/^\d-\d$/.test(id)) return sendJSON(res, 400, { error: 'طلب غير صالح / Bad request' });
    const file = path.join(ROOT, 'data', 'lessons', lang, id + '.json');
    if (!fs.existsSync(file)) return sendJSON(res, 404, { error: 'الدرس قيد الإعداد / Lesson not ready yet' });
    return sendJSON(res, 200, readJSON(file), { 'Cache-Control': 'no-cache' });
  }

  // GET /api/status -> which lessons exist per language
  if (method === 'GET' && parts[1] === 'status') {
    const out = { questions: {} };
    for (const l of LANGS) {
      const dir = path.join(ROOT, 'data', 'lessons', l);
      out[l] = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')) : [];
      out.questions[l] = out[l].reduce((n, id) => {
        try { const d = readJSON(path.join(dir, id + '.json')); return n + (d.quiz || []).length + (d.exercises || []).length; } catch (e) { return n; }
      }, 0);
    }
    return sendJSON(res, 200, out, { 'Cache-Control': 'no-cache' });
  }

  // POST /api/auth/register
  if (method === 'POST' && parts[1] === 'auth' && parts[2] === 'register') {
    const payload = await readBody(req);
    const { username, name, gmail, countryCode, phone, password, stream, lang } = payload;
    const isAr = (lang || stream || 'ar') === 'ar';
    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanGmail = String(gmail || '').trim().toLowerCase();

    if (!cleanUser || !/^[a-z0-9_]{3,20}$/.test(cleanUser)) {
      return sendJSON(res, 400, {
        error: isAr
          ? 'يجب أن يتكوّن اسم المستخدم من 3 إلى 20 حرفًا إنجليزيًا أو رقمًا أو شرطة سفلية (_)'
          : 'Username must be 3-20 characters of letters, numbers, or underscores'
      });
    }
    if (!cleanGmail || !cleanGmail.endsWith('@gmail.com') || cleanGmail.length < 12) {
      return sendJSON(res, 400, {
        error: isAr
          ? 'يُرجى إدخال بريد Gmail صحيح ينتهي بـ @gmail.com'
          : 'A valid Gmail address (@gmail.com) is required'
      });
    }
    if (!phone || !/^\d{6,15}$/.test(String(phone).replace(/\D/g, ''))) {
      return sendJSON(res, 400, {
        error: isAr
          ? 'يُرجى إدخال رقم هاتف صحيح'
          : 'A valid phone number is required'
      });
    }
    if (!password || password.length < 6 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return sendJSON(res, 400, {
        error: isAr
          ? 'يجب أن تتكوّن كلمة المرور من 6 خانات على الأقل وتحتوي على حروف وأرقام'
          : 'Password must be at least 6 characters and contain letters and numbers'
      });
    }

    const db = getUsers();
    if (db.users[cleanUser]) {
      return sendJSON(res, 409, {
        error: isAr
          ? 'اسم المستخدم هذا مسجّل بالفعل، يُرجى اختيار اسم آخر'
          : 'Username is already registered'
      });
    }
    for (const u in db.users) {
      if (db.users[u].gmail === cleanGmail) {
        return sendJSON(res, 409, {
          error: isAr
            ? 'هذا البريد الإلكتروني (Gmail) مسجّل بالفعل'
            : 'This Gmail address is already registered'
        });
      }
    }

    db.users[cleanUser] = {
      username: cleanUser,
      name: String(name || cleanUser).trim(),
      gmail: cleanGmail,
      countryCode: countryCode || '+20',
      phone: String(phone).replace(/\D/g, ''),
      password: String(password),
      stream: stream === 'en' ? 'en' : 'ar',
      registeredAt: new Date().toISOString(),
      progress: { lessons: {} }
    };
    saveUsers(db);
    return sendJSON(res, 200, {
      ok: true,
      message: isAr ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully'
    });
  }

  // POST /api/auth/login
  if (method === 'POST' && parts[1] === 'auth' && parts[2] === 'login') {
    const { login, password, lang } = await readBody(req);
    const isAr = (lang || 'ar') === 'ar';
    const cleanLogin = String(login || '').trim().toLowerCase();
    const db = getUsers();
    let found = db.users[cleanLogin];
    if (!found) {
      for (const u in db.users) {
        if (db.users[u].gmail === cleanLogin) {
          found = db.users[u];
          break;
        }
      }
    }
    if (!found || found.password !== String(password)) {
      return sendJSON(res, 401, {
        error: isAr
          ? 'اسم المستخدم (أو البريد الإلكتروني) أو كلمة المرور غير صحيحة'
          : 'Invalid username/Gmail or password'
      });
    }

    const { password: _, ...userSafe } = found;
    return sendJSON(res, 200, { ok: true, user: userSafe });
  }

  // POST /api/user/progress
  if (method === 'POST' && parts[1] === 'user' && parts[2] === 'progress') {
    const { username, progress } = await readBody(req);
    const cleanUser = String(username || '').trim().toLowerCase();
    if (!cleanUser) return sendJSON(res, 400, { error: 'Username required' });
    const db = getUsers();
    if (db.users[cleanUser]) {
      db.users[cleanUser].progress = { ...(db.users[cleanUser].progress || {}), ...progress };
      saveUsers(db);
      return sendJSON(res, 200, { ok: true });
    }
    return sendJSON(res, 404, { error: 'User not found' });
  }

  // GET /api/user/progress/:username
  if (method === 'GET' && parts[1] === 'user' && parts[2] === 'progress' && parts[3]) {
    const cleanUser = parts[3].toLowerCase();
    const db = getUsers();
    if (db.users[cleanUser]) {
      return sendJSON(res, 200, { ok: true, progress: db.users[cleanUser].progress || {} });
    }
    return sendJSON(res, 404, { error: 'User not found' });
  }

  // GET /api/lesson/videos
  if (method === 'GET' && parts[1] === 'lesson' && parts[2] === 'videos') {
    return sendJSON(res, 200, getVideos(), { 'Cache-Control': 'no-cache' });
  }

  // POST /api/lesson/video
  if (method === 'POST' && parts[1] === 'lesson' && parts[2] === 'video') {
    const { lessonId, videoUrl } = await readBody(req);
    if (!lessonId) return sendJSON(res, 400, { error: 'Lesson ID required' });
    const v = getVideos();
    v[lessonId] = String(videoUrl || '').trim();
    saveVideos(v);
    return sendJSON(res, 200, { ok: true, videoUrl: v[lessonId] });
  }

  // GET /api/site/texts
  if (method === 'GET' && parts[1] === 'site' && parts[2] === 'texts') {
    const t = getTexts();
    return sendJSON(res, 200, { ok: true, texts: t }, { 'Cache-Control': 'no-cache' });
  }

  // POST /api/site/texts
  if (method === 'POST' && parts[1] === 'site' && parts[2] === 'texts') {
    const payload = await readBody(req);
    if (!payload || typeof payload !== 'object') {
      return sendJSON(res, 400, { error: 'Invalid payload' });
    }
    const current = getTexts() || { ar: {}, en: {} };
    if (payload.ar) current.ar = { ...(current.ar || {}), ...payload.ar };
    if (payload.en) current.en = { ...(current.en || {}), ...payload.en };
    saveTexts(current);
    return sendJSON(res, 200, { ok: true, texts: current });
  }

  return sendJSON(res, 404, { error: 'not found' });
}

function handleStatic(url, res) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/favicon.ico') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#12141a"/><rect x="7" y="16" width="4" height="10" rx="2" fill="#f4f1ea"/><rect x="14" y="6" width="4" height="20" rx="2" fill="#2f5bff"/><rect x="21" y="11" width="4" height="15" rx="2" fill="#f4f1ea"/></svg>`;
    return send(res, 200, svg, 'image/svg+xml', { 'Cache-Control': 'public, max-age=86400' });
  }
  if (rel === '/' || rel === '/index.html' || (!path.extname(rel) && !rel.startsWith('/assets') && !rel.startsWith('/data'))) rel = '/index.html';
  if (rel.replace(/\\/g, '/').includes('users.json')) return send(res, 403, 'Forbidden', 'text/plain');
  const top = rel.split('/').filter(Boolean)[0];
  if (rel !== '/index.html' && !PUBLIC_DIRS.includes(top)) return send(res, 404, 'Not found', 'text/plain');
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT)) return send(res, 403, 'Forbidden', 'text/plain');
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Not found', 'text/plain');
    const ext = path.extname(file).toLowerCase();
    const cache = 'no-store, no-cache, must-revalidate, proxy-revalidate';
    send(res, 200, data, MIME[ext] || 'application/octet-stream', { 'Cache-Control': cache, 'Pragma': 'no-cache', 'Expires': '0' });
  });
}

http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) return handleApi(req, url, res);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', 'text/plain');
    return handleStatic(url, res);
  } catch (e) {
    console.error(e);
    send(res, 500, 'Server error', 'text/plain');
  }
}).listen(PORT, () => console.log(`Study site running on http://localhost:${PORT}`));
