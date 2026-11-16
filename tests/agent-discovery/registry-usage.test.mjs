import assert from 'node:assert/strict';
import test from 'node:test';
import { REGISTRY } from '../../cli/registry.js';

// `ren10 add` and `ren10 component` print each registry usage, and agents copy
// it verbatim. RenDS renders in the Light DOM, where slot="..." does nothing:
// menu, popover and sheet usages put their trigger in a slot, so the copied
// trigger was never wired (and, inside a host that hides itself when closed,
// disappeared after the first close).
test('registry usage never relies on slots', () => {
  const slotted = Object.entries(REGISTRY)
    .filter(([, entry]) => /\sslot=/.test(entry.usage ?? ''))
    .map(([key]) => key);
  assert.deepEqual(slotted, []);
});
