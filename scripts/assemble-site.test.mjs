import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { assembleSite } from './assemble-site.mjs';

test('Pages artifact includes every CSS entrypoint and excludes internal research', async (t) => {
  const out = await fs.mkdtemp(path.join(os.tmpdir(), 'ren10-pages-'));
  t.after(() => fs.rm(out, { recursive: true, force: true }));
  await assembleSite(out, '/ren10/');
  const html = await fs.readFile(path.join(out, '404.html'), 'utf8');
  const base = html.match(/<base href="([^"]+)"/)[1];
  for (const missing of ['/ren10/missing', '/ren10/nested/missing']) {
    const document = new URL(missing, 'https://example.org');
    const effective = new URL(base, document);
    for (const [, target] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = new URL(target, effective);
      assert.ok(url.pathname.startsWith('/ren10/'));
      if (target === base) continue;
      await fs.access(path.join(out, url.pathname.slice('/ren10/'.length)));
    }
  }
  for (const file of ['foundation.css', 'dist/ren10.min.css', 'LICENSE']) await fs.access(path.join(out, file));
  assert.ok((await fs.readdir(path.join(out, 'dist'))).every(file => !file.endsWith('.tgz')));
  for (const directory of ['docs/audits', 'docs/superpowers', 'docs/workflows']) {
    await assert.rejects(fs.access(path.join(out, directory)));
  }
});
