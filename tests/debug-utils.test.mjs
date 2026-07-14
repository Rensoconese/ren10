import assert from 'node:assert/strict';
import { configureRenDebug, renDebug, isRenDebugEnabled } from '../utils/debug.js';

const calls = [];
const stop = configureRenDebug({ enabled: true, sink: { debug: (...args) => calls.push(args) } });
assert.equal(isRenDebugEnabled(), true);
renDebug('test', 'hello', { ok: true });
assert.equal(calls.length, 1);
assert.match(calls[0][0], /RenDS:test/);
stop();
assert.equal(isRenDebugEnabled(), false);
renDebug('test', 'ignored');
assert.equal(calls.length, 1);
console.log('debug utility tests passed');
