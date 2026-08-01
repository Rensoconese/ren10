import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'starters', 'astro');
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ren10-astro-starter-'));
const project = path.join(temporaryRoot, 'project');
const nodeModules = path.join(project, 'node_modules');

try {
  fs.cpSync(source, project, { recursive: true });
  fs.mkdirSync(path.join(nodeModules, '@ren10'), { recursive: true });
  fs.symlinkSync(root, path.join(nodeModules, 'ren10'), process.platform === 'win32' ? 'junction' : 'dir');
  fs.cpSync(path.join(root, 'packages', 'astro'), path.join(nodeModules, '@ren10', 'astro'), { recursive: true });
  fs.symlinkSync(path.join(root, 'node_modules', 'astro'), path.join(nodeModules, 'astro'), process.platform === 'win32' ? 'junction' : 'dir');

  const astroCli = path.join(root, 'node_modules', 'astro', 'bin', 'astro.mjs');
  const result = spawnSync(process.execPath, [astroCli, 'build'], {
    cwd: project,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  assert.equal(result.status, 0, `Astro starter build failed:\n${result.stdout}\n${result.stderr}`);

  const html = fs.readFileSync(path.join(project, 'dist', 'index.html'), 'utf8');
  assert.match(html, /data-theme="starter"/, 'Starter theme was not rendered');
  assert.match(html, /class="ren-link-skip"/, 'Starter skip link was not rendered');
  assert.match(html, /<ren-button\b/, 'Starter Button adapter was not rendered');
  assert.match(html, /class="ren-grid ren-grid-fit"/, 'Starter did not use the RenDS grid primitive');
  assert.ok(fs.readFileSync(path.join(project, 'AGENTS.md'), 'utf8').includes('npx ren10 manifest --json'));

  console.log('Ren10 Astro starter: OK');
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
