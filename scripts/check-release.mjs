#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findPublicVersionSurfaces } from './release-policy.mjs';
import { validateV0Adapter } from './check-v0-adapter.mjs';
import { validateStarterApproval } from './check-starter-approval.mjs';

export async function collectLifecycleErrors(root) {
  const errors = [];
  for (const [label, validate] of [
    ['v0 adapter', validateV0Adapter],
    ['starter approval', validateStarterApproval],
  ]) {
    const result = await validate(root);
    const diagnostics = Array.isArray(result?.errors) ? result.errors : [];
    if (result?.ok !== true || diagnostics.length > 0) {
      if (diagnostics.length === 0) errors.push(`${label}: validation failed without diagnostics`);
      else errors.push(...diagnostics.map((diagnostic) => `${label}: ${diagnostic}`));
    }
  }
  return errors;
}

export async function collectReleaseErrors(root = process.cwd()) {
  const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  const changelog = readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
  const errors = [];
  if (!/^## \[Unreleased\]/m.test(changelog)) errors.push('CHANGELOG.md needs an Unreleased section');
  for (const file of ['COMPATIBILITY.md', 'MIGRATION.md', 'SHIPPING.md']) {
    if (!existsSync(path.join(root, file))) errors.push(`Missing ${file}`);
  }
  if (!pkg.engines?.node) errors.push('package.json must declare engines.node');
  if (pkg.scripts?.test !== 'npm run test:portable') errors.push('npm test must use the portable suite');
  if (typeof pkg.scripts?.['test:portable'] !== 'string') errors.push('A portable test suite is required');
  if (!pkg.scripts?.['test:visual:linux']) errors.push('A dedicated Linux visual gate is required');
  const versionSurfaces = findPublicVersionSurfaces(root, pkg.version);
  errors.push(...versionSurfaces.errors);
  if (versionSurfaces.surfaces.filter((surface) => surface.kind === 'html').length < 65) {
    errors.push('Public HTML version surface inventory is incomplete');
  }
  const lockPath = path.join(root, 'package-lock.json');
  if (!existsSync(lockPath)) errors.push('package-lock.json is required');
  else {
    const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
    if (lock.version !== pkg.version || lock.packages?.['']?.version !== pkg.version) {
      errors.push('package-lock.json version must match package.json');
    }
  }
  errors.push(...await collectLifecycleErrors(root));
  return { pkg, errors };
}

async function main() {
  const { pkg, errors } = await collectReleaseErrors(process.cwd());
  if (errors.length) {
    errors.forEach((error) => console.error(error));
    process.exitCode = 1;
    return;
  }
  console.log(`Release contract OK (${pkg.name}@${pkg.version}; v0 adapter and starter approval valid)`);
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) await main();
