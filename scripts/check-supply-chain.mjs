#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const errors = [];
if (!existsSync('package-lock.json')) errors.push('package-lock.json is required');
if (pkg.publishConfig?.provenance !== true) errors.push('npm provenance must remain enabled');
if (!pkg.repository?.url?.includes('github.com')) errors.push('GitHub repository metadata is required');
if (errors.length) { errors.forEach(console.error); process.exit(1); }
console.log(`Supply-chain contract OK (${pkg.name}@${pkg.version})`);
