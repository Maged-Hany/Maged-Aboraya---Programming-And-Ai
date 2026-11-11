// High-speed zero-dependency Node.js server: in-memory caching, gzip/brotli compression, and instant bootstrap hydration.
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

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
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.svg']);
// Public directories (users.json is strictly blocked below)
const PUBLIC_DIRS = ['assets', 'data'];
const LANGS = new Set(['ar', 'en']);
const USERS_FILE = path.join(ROOT, 'data', 'users.json');
const VIDEOS_FILE = path.join(ROOT, 'data', 'videos.json');
const TEXTS_FILE = path.join(ROOT, 'data', 'texts.json');
const RATINGS_FILE = path.join(ROOT, 'data', 'ratings.json');
const META_FILE = path.join(ROOT, 'data', 'meta.json');

// In-memory caches for instant sub-millisecond responses
const staticCache = new Map();
const jsonCache = new Map();
let cachedStatus = null;

function readJSONCached(file) {
  try {
    const stat = fs.statSync(file);
    const hit = jsonCache.get(file);
    if (hit && hit.mtimeMs === stat.mtimeMs) return hit.data;
    const data = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
    jsonCache.set(file, { mtimeMs: stat.mtimeMs, data });
    return data;
  } catch (e) {
    return null;
  }
}

function readJSON(file) {
  return readJSONCached(file) || JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function computeStatus() {
  if (cachedStatus) return cachedStatus;
  const out = { questions: {} };
  for (const l of LANGS) {
    const dir = path.join(ROOT, 'data', 'lessons', l);
    out[l] = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')) : [];
    out.questions[l] = out[l].reduce((n, id) => {
      try {
        const d = readJSONCached(path.join(dir, id + '.json'));
        return n + ((d && d.quiz) || []).length + ((d && d.exercises) || []).length;
      } catch (e) {
        return n;
      }
    }, 0);
  }
  cachedStatus = out;
  return out;
}

const sendCompressed = (req, res, code, bodyBuffer, type = 'application/json; charset=utf-8', extra = {}, precompressed = null) => {
  const headers = { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', ...extra };
  const accept = (req && req.headers && req.headers['accept-encoding']) || '';
  const buf = Buffer.isBuffer(bodyBuffer) ? bodyBuffer : Buffer.from(String(bodyBuffer), 'utf8');

  if (buf.length > 512) {
    if (accept.includes('br')) {
      const br = precompressed && precompressed.br ? precompressed.br : zlib.brotliCompressSync(buf, {
        params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 }
      });
      headers['Content-Encoding'] = 'br';
      headers['Vary'] = 'Accept-Encoding';
      headers['Content-Length'] = br.length;
      res.writeHead(code, headers);
      return res.end(req.method === 'HEAD' ? undefined : br);
    }
    if (accept.includes('gzip')) {
      const gz = precompressed && precompressed.gz ? precompressed.gz : zlib.gzipSync(buf, { level: 6 });
      headers['Content-Encoding'] = 'gzip';
      headers['Vary'] = 'Accept-Encoding';
      headers['Content-Length'] = gz.length;
      res.writeHead(code, headers);
      return res.end(req.method === 'HEAD' ? undefined : gz);
    }
  }
  headers['Content-Length'] = buf.length;
  res.writeHead(code, headers);
  res.end(req.method === 'HEAD' ? undefined : buf);
};

const send = (res, code, body, type = 'application/json; charset=utf-8', extra = {}) => {
  res.writeHead(code, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(body);
};
const sendJSON = (res, code, obj, extra, req = null) => {
  const str = JSON.stringify(obj);
  if (req) return sendCompressed(req, res, code, str, 'application/json; charset=utf-8', extra);
  return send(res, code, str, 'application/json; charset=utf-8', extra);
};

function getUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    try { fs.writeFileSync(USERS_FILE, JSON.stringify({ users: {} }, null, 2), 'utf8'); } catch (e) {}
    return { users: {} };
  }
  return readJSONCached(USERS_FILE) || { users: {} };
}

function saveUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2), 'utf8');
  jsonCache.delete(USERS_FILE);
}

function getRatings() {
  if (!fs.existsSync(RATINGS_FILE)) {
    try { fs.writeFileSync(RATINGS_FILE, JSON.stringify({ courses: {} }, null, 2), 'utf8'); } catch (e) {}
    return { courses: {} };
  }
  return readJSONCached(RATINGS_FILE) || { courses: {} };
}

function saveRatings(data) {
  fs.writeFileSync(RATINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
  jsonCache.delete(RATINGS_FILE);
}

function computeCourseStats(courseId) {
  const rdb = getRatings();
  const cRatings = (rdb.courses && rdb.courses[courseId]) || {};
  const vals = Object.values(cRatings).map(Number).filter(n => n >= 1 && n <= 5);
  const count = vals.length;
  const avg = count > 0 ? Number((vals.reduce((a, b) => a + b, 0) / count).toFixed(1)) : 0;
  const udb = getUsers();
  const studentsCount = Object.keys((udb && udb.users) || {}).length;
  return { average: avg, count, studentsCount, ratings: cRatings };
}

function getVideos() {
  if (!fs.existsSync(VIDEOS_FILE)) {
    try { fs.writeFileSync(VIDEOS_FILE, JSON.stringify({}, null, 2), 'utf8'); } catch (e) {}
    return {};
  }
  return readJSONCached(VIDEOS_FILE) || {};
}

function saveVideos(data) {
  fs.writeFileSync(VIDEOS_FILE, JSON.stringify(data, null, 2), 'utf8');
  jsonCache.delete(VIDEOS_FILE);
}

function getTexts() {
  if (!fs.existsSync(TEXTS_FILE)) return null;
  return readJSONCached(TEXTS_FILE);
}

function saveTexts(data) {
  fs.writeFileSync(TEXTS_FILE, JSON.stringify(data, null, 2), 'utf8');
  jsonCache.delete(TEXTS_FILE);
}

function getBootstrapPayload() {
  return {
    meta: readJSONCached(META_FILE),
    status: computeStatus(),
    texts: getTexts(),
    videos: getVideos(),
    ratings: {
      students: computeCourseStats('students')
    }
  };
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

  // GET /api/bootstrap -> all initial state in 1 roundtrip
  if (method === 'GET' && parts[1] === 'bootstrap' && parts.length === 2) {
    return sendJSON(res, 200, getBootstrapPayload(), { 'Cache-Control': 'no-cache' }, req);
  }

  // GET /api/meta
  if (method === 'GET' && parts[1] === 'meta' && parts.length === 2) {
    return sendJSON(res, 200, readJSON(META_FILE), { 'Cache-Control': 'public, max-age=60' }, req);
  }

  // GET /api/lesson/:lang/:id
  if (method === 'GET' && parts[1] === 'lesson' && parts.length === 4) {
    const [, , lang, id] = parts;
    if (!LANGS.has(lang) || !/^\d-\d$/.test(id)) return sendJSON(res, 400, { error: 'طلب غير صالح / Bad request' }, {}, req);
    const file = path.join(ROOT, 'data', 'lessons', lang, id + '.json');
    if (!fs.existsSync(file)) return sendJSON(res, 404, { error: 'الدرس قيد الإعداد / Lesson not ready yet' }, {}, req);
    return sendJSON(res, 200, readJSON(file), { 'Cache-Control': 'public, max-age=300' }, req);
  }

  // GET /api/status -> which lessons exist per language
  if (method === 'GET' && parts[1] === 'status') {
    return sendJSON(res, 200, computeStatus(), { 'Cache-Control': 'public, max-age=60' }, req);
  }

  // GET /api/course/ratings/:courseId
  if (method === 'GET' && parts[1] === 'course' && parts[2] === 'ratings') {
    const courseId = (parts[3] || 'students').toLowerCase();
    const stats = computeCourseStats(courseId);
    return sendJSON(res, 200, { ok: true, courseId, ...stats }, { 'Cache-Control': 'no-cache' }, req);
  }

  // POST /api/course/ratings
  if (method === 'POST' && parts[1] === 'course' && parts[2] === 'ratings') {
    const payload = await readBody(req);
    const courseId = String(payload.courseId || 'students').trim().toLowerCase();
    const userKey = String(payload.userKey || 'anon').trim().toLowerCase();
    const stars = Math.round(Number(payload.stars || 0));
    if (!userKey || stars < 1 || stars > 5) {
      return sendJSON(res, 400, { error: 'Invalid rating value' });
    }
    const rdb = getRatings();
    if (!rdb.courses) rdb.courses = {};
    if (!rdb.courses[courseId]) rdb.courses[courseId] = {};
    rdb.courses[courseId][userKey] = stars;
    saveRatings(rdb);
    const stats = computeCourseStats(courseId);
    return sendJSON(res, 200, { ok: true, courseId, userStars: stars, ...stats });
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
    return sendJSON(res, 200, getVideos(), { 'Cache-Control': 'no-cache' }, req);
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
    return sendJSON(res, 200, { ok: true, texts: t }, { 'Cache-Control': 'no-cache' }, req);
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

function handleStatic(req, url, res) {
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

  let stat;
  try {
    stat = fs.statSync(file);
  } catch (e) {
    return send(res, 404, 'Not found', 'text/plain');
  }

  const ext = path.extname(file).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  // For index.html, inject bootstrap payload so first paint has zero API waterfall
  if (rel === '/index.html') {
    const rawHtml = fs.readFileSync(file, 'utf8');
    const bootstrapScript = `<script>window.__SYNTAX_BOOTSTRAP__=${JSON.stringify(getBootstrapPayload()).replace(/</g, '\\u003c')};</script>`;
    const hydratedHtml = rawHtml.includes('</head>')
      ? rawHtml.replace('</head>', `${bootstrapScript}\n</head>`)
      : bootstrapScript + rawHtml;
    return sendCompressed(req, res, 200, Buffer.from(hydratedHtml, 'utf8'), mime, {
      'Cache-Control': 'no-cache'
    });
  }

  let entry = staticCache.get(file);
  if (!entry || entry.mtimeMs !== stat.mtimeMs) {
    const data = fs.readFileSync(file);
    const etag = '"' + crypto.createHash('md5').update(data).digest('hex').slice(0, 16) + '"';
    let br = null;
    let gz = null;
    if (COMPRESSIBLE.has(ext) && data.length > 512) {
      try {
        br = zlib.brotliCompressSync(data, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } });
        gz = zlib.gzipSync(data, { level: 6 });
      } catch (e) {}
    }
    entry = { mtimeMs: stat.mtimeMs, data, etag, br, gz };
    staticCache.set(file, entry);
  }

  if (req.headers['if-none-match'] === entry.etag) {
    res.writeHead(304, {
      'ETag': entry.etag,
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    });
    return res.end();
  }

  const cacheHeader = ext === '.json'
    ? 'public, max-age=60, stale-while-revalidate=600'
    : 'public, max-age=3600, stale-while-revalidate=86400';

  return sendCompressed(req, res, 200, entry.data, mime, {
    'Cache-Control': cacheHeader,
    'ETag': entry.etag
  }, entry);
}

// Warm up status & metadata cache on startup
try {
  getBootstrapPayload();
} catch (e) {}

http.createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) return handleApi(req, url, res);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', 'text/plain');
    return handleStatic(req, url, res);
  } catch (e) {
    console.error(e);
    send(res, 500, 'Server error', 'text/plain');
  }
}).listen(PORT, () => console.log(`Study site running on http://localhost:${PORT}`));
