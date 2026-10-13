#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isStableSemverAtLeast } from './release-policy.mjs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const errors = [];
const hasLockfile = existsSync('package-lock.json');
if (!hasLockfile) errors.push('package-lock.json is required');
let lock = {};
if (hasLockfile) {
  try { lock = JSON.parse(readFileSync('package-lock.json', 'utf8')); }
  catch (error) { errors.push(`package-lock.json is invalid: ${error.message}`); }
}
if (pkg.publishConfig?.provenance !== true) errors.push('npm provenance must remain enabled');
if (!pkg.repository?.url?.includes('github.com')) errors.push('GitHub repository metadata is required');
if (pkg.scripts?.['audit:runtime'] !== 'npm audit --omit=dev --audit-level=moderate') errors.push('Runtime moderate audit script is required');
if (pkg.scripts?.['audit:full'] !== 'npm audit --audit-level=moderate') errors.push('Full moderate audit script is required');
const jsYamlVersion = lock.packages?.['node_modules/js-yaml']?.version;
if (!isStableSemverAtLeast(jsYamlVersion, '4.1.2')) {
  errors.push(`js-yaml must be >=4.1.2, found ${jsYamlVersion || 'missing'}`);
}
// npm audit cannot see code embedded in dependency bundles. Check the installed
// artifact too, so a clean external dependency tree cannot hide the old copy.
if (lock.packages?.['node_modules/magicast']) {
  const magicastPath = 'node_modules/magicast/package.json';
  if (!existsSync(magicastPath)) errors.push('Installed Magicast is required for the embedded-dependency check');
  else {
    const magicast = JSON.parse(readFileSync(magicastPath, 'utf8'));
    const embedded = magicast.inlinedDependencies?.['source-map-js'];
    if (embedded && !isStableSemverAtLeast(embedded, '1.2.2')) {
      errors.push(`Magicast embeds vulnerable source-map-js ${embedded}; an external override alone is insufficient`);
    }
    const sourceMapVersion = lock.packages?.['node_modules/source-map-js']?.version;
    if (!isStableSemverAtLeast(sourceMapVersion, '1.2.2')) {
      errors.push(`source-map-js must be >=1.2.2, found ${sourceMapVersion || 'missing'}`);
    }
  }
}
// This is a real private security derivative, not an upstream release. npm's
// advisory matcher cannot assess local forks; verify the installed source too.
const bracesEntry = lock.packages?.['node_modules/braces'];
if (!bracesEntry || bracesEntry.name !== '@ren10/braces' || bracesEntry.version !== '3.0.3-ren10.1') {
  errors.push('The reviewed private patched braces artifact is required');
} else {
  const tarball = 'vendor/braces-3.0.3-ren10.1.tgz';
  const manifestPath = 'node_modules/braces/package.json';
  if (pkg.overrides?.braces !== '$braces' || pkg.devDependencies?.braces !== `file:${tarball}`) errors.push('The braces override must resolve the pinned root artifact');
  if (!existsSync(tarball) || `sha512-${createHash('sha512').update(readFileSync(tarball)).digest('base64')}` !== bracesEntry.integrity) errors.push('Patched braces tarball integrity does not match the lock');
  if (!existsSync(manifestPath)) errors.push('Installed patched braces manifest is required');
  else {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    if (manifest.name !== '@ren10/braces' || manifest.version !== '3.0.3-ren10.1' || manifest.ren10Patch?.upstreamName !== 'braces' || manifest.ren10Patch?.upstreamVersion !== '3.0.3' || manifest.ren10Patch?.maxNesting !== 128 || manifest.ren10Patch?.advisory !== 'GHSA-vfj7-8cjw-p6xm') errors.push('Patched braces identity or security provenance is invalid');
    for (const file of ['index.js', 'lib/compile.js', 'lib/constants.js', 'lib/expand.js', 'lib/parse.js', 'lib/stringify.js', 'lib/utils.js', 'lib/safety.js']) {
      const installed = `node_modules/braces/${file}`;
      if (!existsSync(installed) || createHash('sha256').update(readFileSync(installed)).digest('hex') !== manifest.ren10Patch?.codeHashes?.[file]) errors.push(`Patched braces code integrity failed: ${file}`);
    }
  }
}
if (errors.length) { errors.forEach(console.error); process.exit(1); }
console.log(`Supply-chain contract OK (${pkg.name}@${pkg.version})`);
