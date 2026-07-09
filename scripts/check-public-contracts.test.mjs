import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
const result = spawnSync(process.execPath, ['scripts/check-public-contracts.mjs'], { encoding: 'utf8' });
assert.equal(result.status, 0, result.stderr || result.stdout);
assert.match(result.stdout, /Public contracts: OK/);
console.log('Public contract checker: OK');
