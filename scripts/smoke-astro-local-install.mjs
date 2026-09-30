import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ren10-astro-local-install-'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npmCache = path.join(temporaryRoot, 'npm-cache');
const run = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  assert.equal(result.status, 0, `${command} ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
};

try {
  // Pack the documented source artifacts, without invoking publication or hooks.
  const pack = (workspace = []) => {
    const report = JSON.parse(run(npm, [
      'pack', ...workspace, '--pack-destination', temporaryRoot,
      '--ignore-scripts', '--json', '--cache', npmCache,
    ], root))[0];
    return path.join(temporaryRoot, report.filename);
  };
  const coreTarball = pack();
  const adapterTarball = pack(['--workspace', '@ren10/astro']);
  const project = path.join(temporaryRoot, 'project');
  fs.cpSync(path.join(root, 'starters/astro'), project, { recursive: true });

  // Reuse the repository's already-installed Astro runtime to keep this smoke
  // deterministic/offline. Core and adapter must still come from real tarballs.
  const manifestPath = path.join(project, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.dependencies.astro = `file:${path.join(root, 'node_modules/astro')}`;
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  run(npm, [
    'install', coreTarball, adapterTarball, '--offline', '--ignore-scripts',
    '--legacy-peer-deps', '--no-audit', '--no-fund', '--cache', npmCache,
  ], project);

  const installedManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  for (const name of ['ren10', '@ren10/astro']) {
    assert.match(installedManifest.dependencies[name], /^file:.*\.tgz$/, `${name} must use its local tarball`);
    assert.equal(fs.lstatSync(path.join(project, 'node_modules', name)).isSymbolicLink(), false, `${name} must be installed from its archive, not linked to source`);
  }
  const core = JSON.parse(fs.readFileSync(path.join(project, 'node_modules/ren10/package.json'), 'utf8'));
  const adapter = JSON.parse(fs.readFileSync(path.join(project, 'node_modules/@ren10/astro/package.json'), 'utf8'));
  assert.equal(adapter.version, core.version, 'Packed core and adapter must match');
  assert.equal(adapter.peerDependencies.ren10, `^${core.version}`);
  run(process.execPath, [path.join(project, 'node_modules/astro/bin/astro.mjs'), 'build'], project);

  const html = fs.readFileSync(path.join(project, 'dist/index.html'), 'utf8');
  assert.match(html, /<ren-button\b/, 'Packed adapter must render the Light DOM button');
  assert.match(html, /class="ren-card"/, 'Packed adapter must render native card markup');
  assert.match(html, /data-theme="starter"/, 'Starter semantic theme must survive the build');
  const assets = fs.readdirSync(path.join(project, 'dist/_astro'));
  const assetText = (extension) => assets.filter((name) => name.endsWith(extension))
    .map((name) => fs.readFileSync(path.join(project, 'dist/_astro', name), 'utf8')).join('\n');
  assert.match(assetText('.css'), /\.ren-btn/, 'Packed component CSS must be bundled');
  assert.match(`${html}\n${assetText('.js')}`, /customElements\.define\(["'`]ren-button["'`]/, 'Packed component registration must be bundled');
  console.log(`Astro local tarball install: OK (ren10 + @ren10/astro ${core.version}; offline install; reused Astro runtime; starter build passed)`);
} finally {
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
