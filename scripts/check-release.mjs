#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { findPublicVersionSurfaces } from './release-policy.mjs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const changelog = readFileSync('CHANGELOG.md', 'utf8');
const errors = [];
if (!/^## \[Unreleased\]/m.test(changelog)) errors.push('CHANGELOG.md needs an Unreleased section');
for (const file of ['COMPATIBILITY.md', 'MIGRATION.md', 'SHIPPING.md']) if (!existsSync(file)) errors.push(`Missing ${file}`);
if (!pkg.engines?.node) errors.push('package.json must declare engines.node');
if (pkg.scripts?.test !== 'npm run test:portable') errors.push('npm test must use the portable suite');
if (typeof pkg.scripts?.['test:portable'] !== 'string') errors.push('A portable test suite is required');
if (!pkg.scripts?.['test:visual:linux']) errors.push('A dedicated Linux visual gate is required');
const versionSurfaces = findPublicVersionSurfaces(process.cwd(), pkg.version);
errors.push(...versionSurfaces.errors);
if (versionSurfaces.surfaces.filter((surface) => surface.kind === 'html').length < 65) {
  errors.push('Public HTML version surface inventory is incomplete');
}
const lockPath = path.resolve('package-lock.json');
if (!existsSync(lockPath)) errors.push('package-lock.json is required');
else {
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) {
    errors.push('package-lock.json version must match package.json');
  }
}
if (errors.length) { errors.forEach(console.error); process.exit(1); }
console.log(`Release contract OK (${pkg.name}@${pkg.version})`);
