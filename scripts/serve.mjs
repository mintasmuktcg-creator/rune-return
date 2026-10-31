import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { createCharacterService } from '../supabase/functions/_shared/character-service.js';
const lookup = createCharacterService();
const limits = new Map();
const root = resolve(process.argv.includes('--dist') ? 'dist' : '.');
const port = Number(process.env.PORT || 5180);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json' };
http.createServer(async (req, res) => {
  if (new URL(req.url, 'http://localhost').pathname === '/api/character') {
    res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store');
    const send = (status, body) => { res.writeHead(status).end(JSON.stringify(body)); };
    if (req.headers.origin && ![`http://127.0.0.1:${port}`, `http://localhost:${port}`].includes(req.headers.origin)) return send(403, { error: 'Origin not allowed.' });
    if (req.method !== 'POST') return send(405, { error: 'Use POST.' });
    if (!String(req.headers['content-type']).startsWith('application/json')) return send(415, { error: 'Use JSON.' });
    const ip = req.socket.remoteAddress, now = Date.now();
    let limit = limits.get(ip);
    if (!limit || now - limit.start > 60000) { limit = { start: now, count: 0 }; limits.set(ip, limit); }
    if (++limit.count > 30) return send(429, { error: 'Wait a minute before looking up more characters.' });
    try {
      let body = '';
      for await (const chunk of req) { body += chunk; if (body.length > 1024) return send(413, { error: 'Request too large.' }); }
      let values;
      try { values = JSON.parse(body); } catch { return send(400, { error: 'Expected JSON.' }); }
      if (!values || typeof values !== 'object' || Array.isArray(values)) return send(400, { error: 'Expected a character.' });
      return send(200, await lookup(values));
    } catch (error) { return send(error.status || 400, { error: error.message || 'Hiscores lookup failed.' }); }
  }
  let file;
  try { file = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname)); }
  catch { res.writeHead(400).end(); return; }
  if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  if (file === root) file = resolve(root, 'index.html');
  // Do not serve Git metadata, local files or source tooling.
  const allowed = ['index.html', 'app.js', 'core.js', 'data.js', 'characters.js', 'character-core.js', 'requirements.js', 'auth.js', 'config.js', 'styles.css', 'characters.css'].some(name => file === resolve(root, name)) || file === resolve(root, 'vendor/supabase.js') || file.startsWith(resolve(root, 'assets') + sep);
  if (!allowed) { res.writeHead(404).end(); return; }
  try { const data = await readFile(file); res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' }); res.end(data); }
  catch { res.writeHead(404).end('Not found'); }
}).listen(port, '127.0.0.1', () => console.log(`RuneReturn running at http://127.0.0.1:${port}`));
