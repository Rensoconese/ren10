import assert from 'node:assert/strict';
import test from 'node:test';
import { checkPublishAccess } from './check-publish-access.mjs';
test('publishing is stopped before the core package when scoped membership is missing', () => {
  assert.throws(() => checkPublishAccess(args => args[0] === 'whoami' ? 'publisher' : '{"someone-else":"owner"}'), /must belong/);
});
test('a registry error does not imply permission to create the missing scoped package', () => {
  assert.throws(() => checkPublishAccess(args => { if (args[0] === 'whoami') return 'publisher'; throw new Error('E404'); }), /write access/);
});
test('authenticated organization membership satisfies the prerequisite', () => {
  assert.equal(checkPublishAccess(args => args[0] === 'whoami' ? 'publisher' : '{"publisher":"owner"}'), true);
});
test('the matching username owns its personal scope without an organization', () => {
  assert.equal(checkPublishAccess(args => {
    assert.equal(args[0], 'whoami');
    return 'ren10';
  }), true);
});
test('authentication failures expose a useful message without raw registry output', () => {
  assert.throws(() => checkPublishAccess(() => { throw new Error('private registry diagnostics'); }), {
    message: 'npm authentication is required before publishing either package',
  });
});
