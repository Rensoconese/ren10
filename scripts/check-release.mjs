#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const changelog = readFileSync('CHANGELOG.md', 'utf8');
const errors = [];
if (!/^## \[Unreleased\]/m.test(changelog)) errors.push('CHANGELOG.md needs an Unreleased section');
for (const file of ['COMPATIBILITY.md', 'MIGRATION.md', 'SHIPPING.md']) if (!existsSync(file)) errors.push(`Missing ${file}`);
if (!pkg.engines?.node) errors.push('package.json must declare engines.node');
if (errors.length) { errors.forEach(console.error); process.exit(1); }
console.log(`Release contract OK (${pkg.name}@${pkg.version})`);
