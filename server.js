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
// Only these paths are public. Everything else in the folder (e.g. the PDF) stays private.
const PUBLIC_DIRS = ['assets'];
const LANGS = new Set(['ar', 'en']);

const send = (res, code, body, type = 'application/json; charset=utf-8', extra = {}) => {
  res.writeHead(code, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(body);
};
const sendJSON = (res, code, obj, extra) => send(res, code, JSON.stringify(obj), undefined, extra);

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

function handleApi(url, res) {
  const parts = url.pathname.split('/').filter(Boolean); // ['api', ...]
  // GET /api/meta
  if (parts[1] === 'meta' && parts.length === 2) {
    return sendJSON(res, 200, readJSON(path.join(ROOT, 'data', 'meta.json')), { 'Cache-Control': 'no-cache' });
  }
  // GET /api/lesson/:lang/:id
  if (parts[1] === 'lesson' && parts.length === 4) {
    const [, , lang, id] = parts;
    if (!LANGS.has(lang) || !/^\d-\d$/.test(id)) return sendJSON(res, 400, { error: 'bad request' });
    const file = path.join(ROOT, 'data', 'lessons', lang, id + '.json');
    if (!fs.existsSync(file)) return sendJSON(res, 404, { error: 'lesson not ready yet' });
    return sendJSON(res, 200, readJSON(file), { 'Cache-Control': 'no-cache' });
  }
  // GET /api/status -> which lessons exist per language
  if (parts[1] === 'status') {
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
  return sendJSON(res, 404, { error: 'not found' });
}

function handleStatic(url, res) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/' || rel === '/index.html' || !path.extname(rel) && !rel.startsWith('/assets')) rel = '/index.html';
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
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', 'text/plain');
    if (url.pathname.startsWith('/api/')) return handleApi(url, res);
    return handleStatic(url, res);
  } catch (e) {
    console.error(e);
    send(res, 500, 'Server error', 'text/plain');
  }
}).listen(PORT, () => console.log(`Study site running on http://localhost:${PORT}`));
