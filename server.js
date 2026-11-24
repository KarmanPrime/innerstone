'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = fs.realpathSync(path.resolve(__dirname));
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const BLOCKED_BASENAMES = new Set(['server.js', 'package.json']);

function pathnameFromRequest(url) {
  if (typeof url !== 'string' || url.length === 0 || url[0] !== '/') {
    return null;
  }
  const end = url.search(/[?#]/);
  return end === -1 ? url : url.slice(0, end);
}

function resolveFile(url) {
  const pathname = pathnameFromRequest(url);
  if (pathname === null) {
    return { status: 400 };
  }

  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return { status: 400 };
  }

  if (decoded.includes('\0') || decoded.includes('\\')) {
    return { status: 400 };
  }

  const segments = decoded.split('/').filter((segment) => segment.length > 0);

  // Reject traversal, dotfiles, and hidden directories such as .git.
  if (segments.some((segment) => segment === '..' || segment.startsWith('.'))) {
    return { status: 403 };
  }

  const relativeSegments = segments.length === 0 ? ['index.html'] : segments;
  const basename = relativeSegments[relativeSegments.length - 1].toLowerCase();
  if (BLOCKED_BASENAMES.has(basename)) {
    return { status: 403 };
  }

  const filePath = path.resolve(ROOT, ...relativeSegments);
  const rootPrefix = ROOT.endsWith(path.sep) ? ROOT : `${ROOT}${path.sep}`;
  if (filePath !== ROOT && !filePath.startsWith(rootPrefix)) {
    return { status: 403 };
  }

  return { filePath };
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function sendText(res, status, body) {
  const payload = Buffer.from(body);
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': String(payload.length),
  });
  res.end(res.req.method === 'HEAD' ? undefined : payload);
}

function sendFile(req, res, filePath, size) {
  res.writeHead(200, {
    'Content-Type': contentTypeFor(filePath),
    'Content-Length': String(size),
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    res.destroy();
  });
  stream.pipe(res);
}

function isInsideRoot(realPath) {
  const rootPrefix = ROOT.endsWith(path.sep) ? ROOT : `${ROOT}${path.sep}`;
  return realPath === ROOT || realPath.startsWith(rootPrefix);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    sendText(res, 405, 'Method Not Allowed\n');
    return;
  }

  const resolved = resolveFile(req.url || '/');
  if (resolved.status) {
    const message = resolved.status === 403 ? 'Forbidden\n' : 'Bad Request\n';
    sendText(res, resolved.status, message);
    return;
  }

  fs.stat(resolved.filePath, (statErr, stat) => {
    if (statErr || !stat.isFile()) {
      sendText(res, 404, 'Not Found\n');
      return;
    }

    fs.realpath(resolved.filePath, (realErr, realPath) => {
      if (realErr || !isInsideRoot(realPath)) {
        sendText(res, 403, 'Forbidden\n');
        return;
      }
      sendFile(req, res, realPath, stat.size);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Innerstone listening on port ${PORT}`);
});
