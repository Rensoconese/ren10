import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootPackage = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const astroRoot = path.join(root, 'packages', 'astro');
const astroPackage = JSON.parse(fs.readFileSync(path.join(astroRoot, 'package.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(astroRoot, 'catalog.json'), 'utf8'));

assert.equal(astroPackage.version, rootPackage.version, 'Astro package version must match ren10');
assert.equal(astroPackage.peerDependencies.ren10, `^${rootPackage.version}`, 'Astro ren10 peer range must track the root package');
assert.equal(astroPackage.repository.directory, 'packages/astro', 'Astro repository directory must be relative to the git root');
assert.equal(astroPackage.engines.node, '>=22.12.0', 'Astro 7 package must require a supported Node version');
assert.equal(astroPackage.publishConfig.access, 'public', 'Scoped Astro package must publish publicly');
assert.equal(astroPackage.publishConfig.provenance, true, 'Astro package must publish with provenance');
for (const keyword of ['astro-integration', 'astro-component', 'withastro', 'ui', 'accessibility']) {
  assert.ok(astroPackage.keywords.includes(keyword), `Astro package must include the ${keyword} catalog keyword`);
}
assert.equal(catalog.schemaVersion, 1);
assert.equal(catalog.components.length, 53);
assert.equal(new Set(catalog.components.map((component) => component.import)).size, 53, 'Astro imports must be unique');

for (const component of catalog.components) {
  assert.ok(fs.existsSync(path.join(astroRoot, 'components', `${component.exportName}.astro`)), `Missing ${component.exportName}.astro`);
  assert.match(component.contract, /^ren10\/components\/(?:primitives|composites|patterns)\//);
}

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npmCache = fs.mkdtempSync(path.join(os.tmpdir(), 'ren10-npm-cache-'));
let packed;
try {
  packed = spawnSync(npm, ['pack', '--dry-run', '--json', '--cache', npmCache, astroRoot], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'pipe',
  });
} finally {
  fs.rmSync(npmCache, { recursive: true, force: true });
}
assert.equal(packed.status, 0, `npm pack --dry-run failed:\n${packed.stdout}\n${packed.stderr}`);
const report = JSON.parse(packed.stdout)[0];
const filenames = new Set(report.files.map((file) => file.path));
for (const required of ['README.md', 'LICENSE', 'package.json', 'integration.js', 'catalog.json', 'components/Button.astro', 'components/index.js']) {
  assert.ok(filenames.has(required), `Packed @ren10/astro is missing ${required}`);
}
assert.equal([...filenames].filter((filename) => filename.endsWith('.astro')).length, 53);

console.log(`@ren10/astro package: OK (${catalog.components.length} components; ${report.files.length} packed files)`);
