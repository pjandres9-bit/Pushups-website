import { createServer } from 'http';
import { readFile, stat } from 'fs';
import { extname, join, resolve, normalize } from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
};

const server = createServer((req, res) => {
  const url = req.url.split('?')[0];
  const safePath = normalize(join(ROOT, url === '/' ? 'index.html' : url));

  // Block directory traversal
  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  const contentType = MIME[extname(safePath)] || 'text/plain';

  readFile(safePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500); res.end('Server Error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  Push-Up Tracker dev server`);
  console.log(`  → http://localhost:${PORT}\n`);
});
