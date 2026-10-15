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

test('trusted publishing accepts only the release workflow, exact release tag and GitHub OIDC', async () => {
  const { checkTrustedPublishing } = await import('./check-publish-access.mjs');
  const env = {
    GITHUB_ACTIONS: 'true', GITHUB_REPOSITORY: 'Rensoconese/ren10',
    GITHUB_WORKFLOW_REF: 'Rensoconese/ren10/.github/workflows/release.yml@refs/tags/v0.14.1',
    GITHUB_EVENT_NAME: 'push', GITHUB_REF: 'refs/tags/v0.14.1', RELEASE_TAG: 'v0.14.1',
    ACTIONS_ID_TOKEN_REQUEST_URL: 'https://token.actions.githubusercontent.com/request',
    ACTIONS_ID_TOKEN_REQUEST_TOKEN: 'test-only-placeholder',
  };
  assert.equal(checkTrustedPublishing(env, '0.14.1'), true);
  for (const patch of [
    { GITHUB_ACTIONS: 'false' }, { GITHUB_REPOSITORY: 'another/repo' },
    { GITHUB_WORKFLOW_REF: 'Rensoconese/ren10/.github/workflows/untrusted.yml@refs/heads/main' },
    { GITHUB_WORKFLOW_REF: 'Rensoconese/ren10/.github/workflows/release.yml@refs/heads/feature' },
    { GITHUB_EVENT_NAME: 'pull_request' }, { RELEASE_TAG: 'v9.9.9' },
    { ACTIONS_ID_TOKEN_REQUEST_URL: '' }, { ACTIONS_ID_TOKEN_REQUEST_TOKEN: '' },
    { GITHUB_REF: 'refs/heads/main' },
  ]) assert.throws(() => checkTrustedPublishing({ ...env, ...patch }, '0.14.1'));
  assert.equal(checkTrustedPublishing({ ...env,
    GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/main',
    GITHUB_WORKFLOW_REF: 'Rensoconese/ren10/.github/workflows/release.yml@refs/heads/main',
  }, '0.14.1'), true);
});
