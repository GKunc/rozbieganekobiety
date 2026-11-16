#!/usr/bin/env node
// Local preview server for src/ with live reload. No dependencies.
// Usage: node tools/serve.mjs [port=4321] [dir=src]   (or PORT=... env)
// - Serves folders as /path/ -> /path/index.html, like GitHub Pages.
// - Unknown paths get 404.html with status 404.
// - Saves under src/ reload open pages automatically (script injected only here, never in the built site).
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync, watch, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { SRC } from './lib.mjs';

const port = Number(process.argv[2] || process.env.PORT || 4321);
const root = resolve(process.argv[3] || SRC);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

const RELOAD = `<script>(()=>{try{const e=new EventSource('/__reload');e.onmessage=()=>location.reload();}catch{}})();</script>`;
const clients = new Set();

function resolveFile(urlPath) {
  let p;
  try { p = decodeURIComponent(urlPath.split(/[?#]/)[0]); } catch { return null; }
  const file = normalize(join(root, p));
  if (file !== root && !file.startsWith(root + sep)) return null; // no ../ escapes
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!p.endsWith('/')) return { redirect: p + '/' };
    const index = join(file, 'index.html');
    return existsSync(index) ? { file: index } : null;
  }
  return existsSync(file) ? { file } : null;
}

function send(res, status, file) {
  const type = TYPES[extname(file).toLowerCase()] || 'application/octet-stream';
  const headers = { 'Content-Type': type, 'Cache-Control': 'no-store' };
  if (type.startsWith('text/html')) {
    const body = readFileSync(file, 'utf8');
    const html = body.includes('</body>') ? body.replace(/<\/body>(?![\s\S]*<\/body>)/, RELOAD + '</body>') : body + RELOAD;
    res.writeHead(status, headers).end(html);
  } else {
    res.writeHead(status, headers);
    createReadStream(file).pipe(res);
  }
}

const server = createServer((req, res) => {
  if (req.url === '/__reload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
    res.write(': connected\n\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }
  const hit = resolveFile(req.url || '/');
  if (hit?.redirect) return res.writeHead(301, { Location: hit.redirect }).end();
  if (hit?.file) return send(res, 200, hit.file);
  const notFound = join(root, '404.html');
  if (existsSync(notFound)) return send(res, 404, notFound);
  res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
});

let timer;
try {
  watch(root, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => { for (const c of clients) c.write('data: reload\n\n'); }, 100);
  });
} catch {
  console.warn('File watching unavailable; live reload is off.');
}

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') console.error(`Port ${port} is already in use. Stop the other server or run: node tools/serve.mjs <other port>`);
  else console.error(e.message);
  process.exit(1);
});
server.listen(port, () => console.log(`Serving ${root} at http://localhost:${port}/ (live reload on)`));
