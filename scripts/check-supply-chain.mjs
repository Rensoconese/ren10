#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
const errors = [];
if (!existsSync('package-lock.json')) errors.push('package-lock.json is required');
if (pkg.publishConfig?.provenance !== true) errors.push('npm provenance must remain enabled');
if (!pkg.repository?.url?.includes('github.com')) errors.push('GitHub repository metadata is required');
if (pkg.scripts?.['audit:runtime'] !== 'npm audit --omit=dev --audit-level=moderate') errors.push('Runtime moderate audit script is required');
if (pkg.scripts?.['audit:full'] !== 'npm audit --audit-level=moderate') errors.push('Full moderate audit script is required');
const jsYamlVersion = lock.packages?.['node_modules/js-yaml']?.version;
if (!jsYamlVersion || jsYamlVersion.localeCompare('4.1.2', undefined, { numeric: true }) < 0) {
  errors.push(`js-yaml must be >=4.1.2, found ${jsYamlVersion || 'missing'}`);
}
if (errors.length) { errors.forEach(console.error); process.exit(1); }
console.log(`Supply-chain contract OK (${pkg.name}@${pkg.version})`);
