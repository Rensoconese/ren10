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
 * @param {string} rootPath
 * @param {string} candidatePath
 * @returns {boolean}
 */
function isInsideRoot(rootPath, candidatePath) {
  const rootWithSep = rootPath.endsWith(path.sep) ? rootPath : `${rootPath}${path.sep}`;
  return candidatePath === rootPath || candidatePath.startsWith(rootWithSep);
}

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
  if (!isInsideRoot(resolvedRoot, filePath)) {
    return { forbidden: true };
  }
  return { filePath };
}

/**
 * If the target exists, require its realpath to stay inside the real server
 * root. Missing targets stay 404 unless an ancestor realpath escapes (symlink
 * directory escape), which is 403.
 * @param {string} realRoot
 * @param {string} filePath
 * @returns {'ok' | 'forbidden' | 'missing'}
 */
function assertRealpathContained(realRoot, filePath) {
  try {
    const realTarget = fs.realpathSync(filePath);
    if (!isInsideRoot(realRoot, realTarget)) {
      return 'forbidden';
    }
    return 'ok';
  } catch (error) {
    if (!error || (error.code !== 'ENOENT' && error.code !== 'ENOTDIR')) {
      // ELOOP / EACCES / etc. — do not serve.
      return 'forbidden';
    }

    // Walk parents: a missing leaf under a symlinked-out directory must 403.
    let cursor = path.dirname(filePath);
    for (;;) {
      try {
        const realCursor = fs.realpathSync(cursor);
        if (!isInsideRoot(realRoot, realCursor)) {
          return 'forbidden';
        }
        return 'missing';
      } catch (parentError) {
        if (!parentError || (parentError.code !== 'ENOENT' && parentError.code !== 'ENOTDIR')) {
          return 'forbidden';
        }
        const parent = path.dirname(cursor);
        if (parent === cursor) {
          return 'missing';
        }
        cursor = parent;
      }
    }
  }
}

/**
 * @param {string} root
 * @returns {Promise<{ origin: string, close: () => Promise<void> }>}
 */
async function startStaticServer(root) {
  const resolvedRoot = path.resolve(root);
  let realRoot;
  try {
    realRoot = fs.realpathSync(resolvedRoot);
  } catch {
    realRoot = resolvedRoot;
  }

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
    const containment = assertRealpathContained(realRoot, filePath);
    if (containment === 'forbidden') {
      response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Forbidden');
      return;
    }
    if (containment === 'missing') {
      response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        // Race: disappeared after realpath, or not a readable file.
        if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
          response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
          response.end('Not found');
          return;
        }
        response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('Forbidden');
        return;
      }
      // Defense in depth: re-check realpath after read in case of replace races.
      const postCheck = assertRealpathContained(realRoot, filePath);
      if (postCheck !== 'ok') {
        response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('Forbidden');
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

module.exports = { startStaticServer, resolveSafeFilePath, assertRealpathContained, isInsideRoot };
