import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const result = spawnSync(process.execPath, ['scripts/check-public-contracts.mjs'], { encoding: 'utf8' });
assert.equal(result.status, 0, result.stderr || result.stdout);
assert.match(result.stdout, /Public contracts: OK/);

const invalidMarkup = spawnSync(process.execPath, [
  'scripts/check-public-contracts.mjs',
  '--contract-fixture',
  'scripts/fixtures/public-contracts/invalid-kbd.md',
], { encoding: 'utf8' });
assert.equal(invalidMarkup.status, 1, 'semantic Canonical Markup fixture must fail');
assert.match(invalidMarkup.stderr, /required markup.*<kbd>/i);

const validMarkup = spawnSync(process.execPath, [
  'scripts/check-public-contracts.mjs',
  '--contract-fixture',
  'scripts/fixtures/public-contracts/valid-kbd.md',
], { encoding: 'utf8' });
assert.equal(validMarkup.status, 0, validMarkup.stderr || validMarkup.stdout);

const invalidEvents = spawnSync(process.execPath, [
  'scripts/check-public-contracts.mjs',
  '--events-fixture',
  'scripts/fixtures/public-contracts/invalid-events.json',
], { encoding: 'utf8' });
assert.equal(invalidEvents.status, 1, 'event metadata mismatch fixture must fail');
assert.match(invalidEvents.stderr, /ren-submit.*detail/i);

const contracts = fs.readdirSync('components', { recursive: true })
  .filter((file) => /(?:component|pattern)\.md$/.test(file))
  .map((file) => fs.readFileSync(path.join('components', file), 'utf8'));
const placeholders = contracts.filter((contract) =>
  /## Canonical Markup\s+```html\s*<div class="ren-[^"]+">(?:\.\.\.|…)<\/div>\s*```/m.test(contract)
);
assert.equal(placeholders.length, 0, 'Canonical Markup must contain semantic runnable markup');

console.log('Public contract checker: OK');
