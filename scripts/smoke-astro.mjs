import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixture = path.join(root, 'tests', 'astro-fixture');
const output = path.join(fixture, 'dist');
const astroCli = path.join(root, 'node_modules', 'astro', 'bin', 'astro.mjs');
const fixtureNodeModules = path.join(fixture, 'node_modules');
const packageLink = path.join(fixtureNodeModules, 'ren10');

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(fixtureNodeModules, { recursive: true });
fs.rmSync(packageLink, { recursive: true, force: true });
fs.symlinkSync(root, packageLink, process.platform === 'win32' ? 'junction' : 'dir');

try {
  const result = spawnSync(process.execPath, [astroCli, 'build'], {
    cwd: fixture,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  assert.equal(
    result.status,
    0,
    `Astro fixture build failed:\n${result.stdout}\n${result.stderr}`,
  );

  const htmlPath = path.join(output, 'index.html');
  assert.ok(fs.existsSync(htmlPath), 'Astro fixture did not emit index.html');

  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /<ren-button\b/, 'Astro output lost the ren-button Light DOM host');
  assert.match(html, /<ren-dialog\b/, 'Astro output lost the ren-dialog Light DOM host');
  assert.match(html, /<article[^>]+class="ren-card"[^>]+data-fixture="card"/, 'Astro component did not preserve native markup or spread props');
  assert.match(html, /class="ren-badge ren-badge-success"/, 'Astro component did not merge canonical and consumer classes');
  assert.match(html, /data-theme="minimal-mono"/, 'Astro output lost the RenDS theme attribute');

  const assetsDir = path.join(output, '_astro');
  const assets = fs.readdirSync(assetsDir);
  const css = assets
    .filter((file) => file.endsWith('.css'))
    .map((file) => fs.readFileSync(path.join(assetsDir, file), 'utf8'))
    .join('\n');
  const js = assets
    .filter((file) => file.endsWith('.js'))
    .map((file) => fs.readFileSync(path.join(assetsDir, file), 'utf8'))
    .join('\n');
  const clientRuntime = `${html}\n${js}`;

  assert.match(css, /\.ren-command/, 'Full RenDS component CSS was not bundled');
  assert.match(css, /\.ren-card/, 'Granular Astro card CSS was not bundled');
  assert.match(css, /ren-command-in/, 'Top-level command keyframes were not bundled');
  assert.match(css, /ren-nav-slide-down/, 'Top-level nav keyframes were not bundled');
  assert.match(clientRuntime, /ren-button/, 'Button custom element runtime was not bundled');
  assert.match(clientRuntime, /ren-dialog/, 'Dialog custom element runtime was not bundled');
  assert.match(clientRuntime, /ren-files-added/, 'Dropzone initializer runtime was not bundled');
  assert.match(html, /Fixture toolbar/, 'Toolbar wrapper was not rendered');

  console.log(`Astro compatibility fixture: OK (${assets.length} built assets)`);
} finally {
  fs.rmSync(output, { recursive: true, force: true });
  fs.rmSync(packageLink, { recursive: true, force: true });
  if (fs.readdirSync(fixtureNodeModules).length === 0) fs.rmdirSync(fixtureNodeModules);
}
