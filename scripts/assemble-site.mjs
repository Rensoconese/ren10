import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
export async function assembleSite(destination, base = '/ren10/') {
  if (!/^\/[\w/-]*\/$/.test(base) && base !== '/') throw new Error('Site base must be an absolute directory path');
  const excluded = ['docs/superpowers', 'docs/audits', 'docs/workflows'];
  await fs.mkdir(destination, { recursive: true });
  for (const name of ['index.html', 'index.css', 'foundation.css', 'LICENSE', 'ren-design.md', 'dist', 'tokens', 'base', 'components', 'utils', 'themes', 'site', 'docs', 'templates', 'create', 'examples']) {
    await fs.cp(path.join(root, name), path.join(destination, name), {
      recursive: true,
      filter: (source) => !excluded.some((prefix) => {
        const relative = path.relative(root, source).split(path.sep).join('/');
        return relative === prefix || relative.startsWith(prefix + '/');
      }) && !source.endsWith('.tgz'),
    });
  }
  const notFound = await fs.readFile(path.join(root, '404.html'), 'utf8');
  await fs.writeFile(path.join(destination, '404.html'), notFound.replace('__BASE_PATH__', base));
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  await assembleSite(path.resolve(process.argv[2] || '_site'), process.argv[3] || '/ren10/');
}
