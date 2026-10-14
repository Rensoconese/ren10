#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { waitForPublished } from './release-registry.mjs';

const args = process.argv.slice(2);
const value = name => args[args.indexOf(name) + 1];
assert.ok(args.includes('--expected'), '--expected is required');
const expected = JSON.parse(fs.readFileSync(value('--expected'), 'utf8'));
const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
assert.deepEqual(expected.map(pkg => pkg.name).sort(), ['@ren10/astro', 'ren10']);
assert.ok(expected.every(pkg => pkg.version === version && pkg.integrity?.startsWith('sha512-')));
const seconds = args.includes('--wait-seconds') ? Number(value('--wait-seconds')) : 0;
assert.ok(Number.isInteger(seconds) && seconds >= 0 && seconds <= 1800);
await waitForPublished(expected, {
  timeoutMs: seconds * 1000,
  onPending: message => console.log(message),
});
console.log(`Both ${version} packages are public with exact tarball integrity and provenance.`);
