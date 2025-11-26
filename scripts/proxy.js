// Simple local proxy to bypass CORS for web development
// Proxies requests from http://localhost:3001 to the remote backend

const http = require('http');
const { URL } = require('url');

const TARGET = process.env.TARGET || 'https://backend-mobilize-transporte.onrender.com';
const PORT = process.env.PROXY_PORT ? Number(process.env.PROXY_PORT) : 3001;
// Ajusta a origin padrão para o Expo web (porta 8081 no nosso setup)
const ORIGIN = process.env.ALLOW_ORIGIN || '*';

function setCors(req, res) {
  const originHeader = req.headers.origin;
  // Permite qualquer origem para evitar bloqueios entre 8082/8083/localhost variantes
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type');
  res.setHeader('Vary', originHeader ? 'Origin' : '');
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
      const isHttps = targetUrl.protocol === 'https:';
      const lib = isHttps ? require('https') : require('http');

      const headers = {};
      if (req.headers['authorization']) headers['Authorization'] = req.headers['authorization'];
      if (req.headers['accept']) headers['Accept'] = req.headers['accept'];
      if (req.headers['content-type'] && !['GET', 'HEAD'].includes(req.method)) {
        headers['Content-Type'] = req.headers['content-type'];
      }

      const options = {
        method: req.method,
        headers,
      };

      const upstreamReq = lib.request(targetUrl, options, (upstreamRes) => {
        let respBody = '';
        upstreamRes.on('data', (chunk) => (respBody += chunk));
        upstreamRes.on('end', () => {
          const contentType = upstreamRes.headers['content-type'] || 'application/json';
          res.statusCode = upstreamRes.statusCode || 200;
          res.setHeader('Content-Type', contentType);
          res.end(respBody);
        });
      });

      upstreamReq.on('error', (err) => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Proxy error', error: String(err) }));
      });

      if (!['GET', 'HEAD'].includes(req.method) && body) {
        upstreamReq.write(body);
      }
      upstreamReq.end();
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Proxy error', error: String(err) }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`[proxy] Listening on http://localhost:${PORT} -> ${TARGET}`);
  console.log(`[proxy] CORS: Access-Control-Allow-Origin=*`);
});
