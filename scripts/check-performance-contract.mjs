#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const errors = [];
if (!pkg.engines?.node || !/^>=20/.test(pkg.engines.node)) errors.push('Node >=20 engine is required');
if (!existsSync('scripts/check-package-budgets.mjs')) errors.push('Package budget checker is required');
if (!existsSync('tests/visual')) errors.push('Visual test suite is required');
if (errors.length) { errors.forEach(console.error); process.exit(1); }
console.log('Performance contract OK: budgets, visual suite, Node engine');
