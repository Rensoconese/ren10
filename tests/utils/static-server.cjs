const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

/**
 * Resolve a request URL to a file under `resolvedRoot`, or null when the
 * path is outside the root (including encoded traversal). Query strings and
 * fragments never affect the resolved file path.
 * @param {string} resolvedRoot
 * @param {string | undefined} requestUrl
 * @returns {{ filePath: string } | { forbidden: true } | { badRequest: true }}
 */
function resolveSafeFilePath(resolvedRoot, requestUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl || '/', 'http://127.0.0.1').pathname);
  } catch {
    return { badRequest: true };
  }

  if (pathname.includes('\0')) {
    return { badRequest: true };
  }

  // Strip leading slashes so path.join never treats the URL path as absolute.
  const relativePath = pathname.replace(/^\/+/, '');
  const filePath = path.normalize(path.join(resolvedRoot, relativePath));
  const rootWithSep = `${resolvedRoot}${path.sep}`;
  if (filePath !== resolvedRoot && !filePath.startsWith(rootWithSep)) {
    return { forbidden: true };
  }
  return { filePath };
}

/**
 * @param {string} root
 * @returns {Promise<{ origin: string, close: () => Promise<void> }>}
 */
async function startStaticServer(root) {
  const resolvedRoot = path.resolve(root);
  const server = http.createServer((request, response) => {
    const resolved = resolveSafeFilePath(resolvedRoot, request.url);
    if (resolved.badRequest) {
      response.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Bad request');
      return;
    }
    if (resolved.forbidden) {
      response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Forbidden');
      return;
    }

    const { filePath } = resolved;
    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
      }
      const extension = path.extname(filePath);
      const headers = { 'content-type': CONTENT_TYPES[extension] || 'application/octet-stream' };
      if (['.html', '.css', '.js'].includes(extension)) headers['cache-control'] = 'no-store';
      response.writeHead(200, headers);
      response.end(data);
    });
  });

  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', resolveListen);
  });

  const address = server.address();
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolveClose, rejectClose) => {
      server.close((error) => (error ? rejectClose(error) : resolveClose()));
    }),
  };
}

module.exports = { startStaticServer, resolveSafeFilePath };
