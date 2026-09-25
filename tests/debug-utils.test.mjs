import assert from 'node:assert/strict';
import {
  areRenWarningsEnabled,
  configureRenDebug,
  isRenDebugEnabled,
  renDebug,
  renWarn,
} from '../utils/debug.js';

// ─── Traces: opt-in ───
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

// ─── Warnings: on by default, routed to the configured sink ───
// These report markup a component needs and cannot find, so they stay loud
// unless an application silences them explicitly.
assert.equal(areRenWarningsEnabled(), true, 'warnings default to on');

const warnings = [];
const stopWarn = configureRenDebug({ sink: { warn: (...args) => warnings.push(args) } });
renWarn('RenTable', 'Missing required table structure');
assert.equal(warnings.length, 1);
assert.equal(
  warnings[0][0],
  'RenTable: Missing required table structure',
  'the message must stay byte-identical to the console.warn it replaced',
);
assert.equal(warnings[0].length, 1, 'no trailing argument when details are omitted');

renWarn('RenTabs', 'No tablist found', { id: 'x' });
assert.equal(warnings.length, 2);
assert.deepEqual(warnings[1], ['RenTabs: No tablist found', { id: 'x' }]);
stopWarn();

// ─── Warnings: silenced on request ───
const silenced = [];
const stopSilent = configureRenDebug({
  warnings: false,
  sink: { warn: (...args) => silenced.push(args) },
});
assert.equal(areRenWarningsEnabled(), false);
renWarn('RenSlider', 'No input[type="range"] found');
assert.equal(silenced.length, 0, 'silenced warnings reach neither console nor sink');
stopSilent();
assert.equal(areRenWarningsEnabled(), true, 'teardown restores the warning default');

console.log('debug utility tests passed');
