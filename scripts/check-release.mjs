#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const changelog = readFileSync('CHANGELOG.md', 'utf8');
const errors = [];
if (!/^## \[Unreleased\]/m.test(changelog)) errors.push('CHANGELOG.md needs an Unreleased section');
for (const file of ['COMPATIBILITY.md', 'MIGRATION.md', 'SHIPPING.md']) if (!existsSync(file)) errors.push(`Missing ${file}`);
if (!pkg.engines?.node) errors.push('package.json must declare engines.node');
if (pkg.scripts?.test !== 'npm run test:portable') errors.push('npm test must use the portable suite');
if (!pkg.scripts?.['test:visual:linux']) errors.push('A dedicated Linux visual gate is required');
for (const file of ['AGENTS.md', 'CLAUDE.md', '.cursorrules', '.windsurfrules', 'ren-design.md', 'docs/cli.html']) {
  const source = readFileSync(file, 'utf8');
  if (!source.includes(pkg.version)) errors.push(`${file} must expose package version ${pkg.version}`);
  if (/\b0\.9\.2\b/.test(source)) errors.push(`${file} still exposes stale version 0.9.2`);
}
if (errors.length) { errors.forEach(console.error); process.exit(1); }
console.log(`Release contract OK (${pkg.name}@${pkg.version})`);
