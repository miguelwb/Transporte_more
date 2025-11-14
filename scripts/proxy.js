// Simple local proxy to bypass CORS for web development
// Proxies requests from http://localhost:3001 to the remote backend

const http = require('http');
const { URL } = require('url');

const TARGET = process.env.TARGET || 'https://backend-mobilize-transporte.onrender.com';
const PORT = process.env.PROXY_PORT ? Number(process.env.PROXY_PORT) : 3001;
// Ajusta a origin padrão para o Expo web (porta 8081 no nosso setup)
const ORIGIN = process.env.ALLOW_ORIGIN || 'http://localhost:8081';

function setCors(req, res) {
  const origin = req.headers.origin || ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Vary', 'Origin');
}

const server = http.createServer(async (req, res) => {
  setCors(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Build target URL
  const targetUrl = new URL(req.url, TARGET);

  // Collect request body
  let body = '';
  req.on('data', (chunk) => (body += chunk));
  req.on('end', async () => {
    try {
      const fetchOptions = {
        method: req.method,
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json',
          Authorization: req.headers['authorization'] || undefined,
        },
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : body,
      };

      const upstream = await fetch(targetUrl, fetchOptions);
      const text = await upstream.text();

      // Mirror status & content-type
      const contentType = upstream.headers.get('content-type') || 'application/json';
      // Preserve previously set CORS headers; only set status and content-type
      res.statusCode = upstream.status;
      res.setHeader('Content-Type', contentType);
      res.end(text);
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Proxy error', error: String(err) }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[proxy] Listening on http://localhost:${PORT} -> ${TARGET}`);
  console.log(`[proxy] Allow-Origin: ${ORIGIN}`);
});