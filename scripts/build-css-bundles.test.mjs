import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { bundleCss } from './build-css-bundles.mjs';

async function fixture(t, files) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'ren10-css-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  for (const [name, css] of Object.entries(files)) await writeFile(path.join(dir, name), css);
  return path.join(dir, 'entry.css');
}

test('preserves import layers, media, supports and repeated contextual imports', async (t) => {
  const entry = await fixture(t, {
    'entry.css': '@layer first, second; @import "part.css" layer(first); @import "part.css" layer(second) supports(display: grid) screen and (min-width: 40rem);',
    'part.css': '.sample { color: red; }',
  });
  const css = await bundleCss(entry);
  assert.match(css, /@layer first, second/);
  assert.match(css, /@layer first\s*\{/);
  assert.match(css, /@layer second\s*\{/);
  assert.match(css, /@supports\s*\(display: grid\)/);
  assert.match(css, /@media screen and \(min-width: 40rem\)/);
  assert.equal((css.match(/color: red/g) ?? []).length, 2);
});

test('missing local imports fail rather than emit incomplete CSS', async (t) => {
  const entry = await fixture(t, { 'entry.css': '@import "missing.css";' });
  await assert.rejects(bundleCss(entry), /Could not resolve/);
});

test('minification preserves significant string and calc whitespace', async (t) => {
  const entry = await fixture(t, { 'entry.css': '.sample::before { content: "a > b: ; { x }"; width: calc(100% - 2rem); }' });
  const css = await bundleCss(entry, { minify: true });
  assert.match(css, /a > b: ; \{ x \}/);
  assert.match(css, /calc\(100% - 2rem\)/);
});
