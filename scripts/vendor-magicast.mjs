#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// Only this exact upstream artifact may be transformed. Never patch node_modules.
const integrity = 'llBEhWm1SacoRwgHUoQJYtwp4PBLF4faQi5TCpIGyGs9n4y5+juI0tDgyKIfpqxckRHaHzouUEph3THklWh03w==';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = process.argv[2];
assert.ok(input, 'Usage: node scripts/vendor-magicast.mjs /path/to/official-magicast-0.5.4.tgz');
assert.equal(createHash('sha512').update(fs.readFileSync(input)).digest('base64'), integrity, 'Upstream tarball integrity changed');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'ren10-magicast-'));
try {
  execFileSync('tar', ['-xzf', path.resolve(input), '-C', temporary]);
  const directory = path.join(temporary, 'package');
  const bundlePath = path.join(directory, 'dist/builders-pgs2P7Vh.js');
  let bundle = fs.readFileSync(bundlePath, 'utf8');
  const begin = bundle.indexOf('//#region node_modules/.pnpm/source-map-js@1.2.1/node_modules/source-map-js/lib/base64.js');
  const end = bundle.indexOf('//#region vendor/recast/lib/util.ts');
  assert.ok(begin > 0 && end > begin, 'Expected complete embedded source-map-js region');
  bundle = 'import sourceMap from "source-map-js";\n' + bundle.slice(0, begin) + bundle.slice(end);
  const bridge = /var import_source_map = [\s\S]*?(?=const n\$2 = namedTypes\$1;)/;
  assert.equal((bundle.match(/var import_source_map = /g) || []).length, 1);
  bundle = bundle.replace(bridge, 'var import_source_map = sourceMap;\n');
  assert.ok(!/require_source_map|require_source_node|source-map-js@1\.2\.1/.test(bundle), 'Embedded source-map-js remains');
  fs.writeFileSync(bundlePath, bundle);
  const manifestPath = path.join(directory, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.name, 'magicast');
  assert.equal(manifest.version, '0.5.4');
  manifest.dependencies['source-map-js'] = '^1.2.2';
  delete manifest.inlinedDependencies['source-map-js'];
  manifest.private = true;
  manifest.ren10Patch = {
    revision: 1,
    upstream: 'https://registry.npmjs.org/magicast/-/magicast-0.5.4.tgz',
    upstreamIntegrity: `sha512-${integrity}`,
    change: 'Externalize the complete embedded source-map-js implementation to the patched dependency >=1.2.2',
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  const vendor = path.join(root, 'vendor');
  fs.mkdirSync(vendor, { recursive: true });
  execFileSync('npm', ['pack', '--ignore-scripts', '--cache', path.join(temporary, 'npm-cache'), '--pack-destination', vendor], { cwd: directory, stdio: 'pipe' });
  const output = path.join(vendor, 'magicast-0.5.4-ren10.1.tgz');
  fs.renameSync(path.join(vendor, 'magicast-0.5.4.tgz'), output);
  console.log(`Vendored Magicast written: ${output}`);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
