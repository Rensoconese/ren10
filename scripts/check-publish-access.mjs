import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function checkPublishAccess(run = (args) => execFileSync('npm', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })) {
  let user;
  try { user = run(['whoami', '--registry=https://registry.npmjs.org']).trim(); }
  catch { throw new Error('npm authentication is required before publishing either package'); }
  if (!user) throw new Error('npm authentication is required before publishing either package');
  // A username can own its matching personal scope without an organization.
  if (user === 'ren10') return true;
  let members;
  try { members = JSON.parse(run(['org', 'ls', 'ren10', '--json'])); }
  catch { throw new Error('Verify organization membership and write access to @ren10 before publishing ren10'); }
  if (!Object.hasOwn(members, user)) throw new Error('The publishing identity must belong to the ren10 npm organization');
  // Organization membership is a prerequisite, not proof that a granular
  // token can publish. npm's publish request still enforces token permissions.
  return true;
}
export function checkTrustedPublishing(env, version) {
  assert.equal(env.GITHUB_ACTIONS, 'true', 'OIDC publication requires GitHub Actions');
  assert.equal(env.GITHUB_REPOSITORY, 'Rensoconese/ren10', 'Unexpected publishing repository');
  assert.equal(env.RELEASE_TAG, `v${version}`, 'Release tag must match the package version');
  assert.match(version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, 'Invalid release version');
  const workflow = `Rensoconese/ren10/.github/workflows/release.yml@`;
  const sourceRef = env.GITHUB_WORKFLOW_REF?.slice(workflow.length);
  assert.ok(env.GITHUB_WORKFLOW_REF?.startsWith(workflow), 'Only release.yml can stage packages');
  assert.ok(sourceRef === `refs/tags/v${version}` || sourceRef === 'refs/heads/main', 'Untrusted workflow ref');
  assert.ok(env.GITHUB_EVENT_NAME === 'push' || env.GITHUB_EVENT_NAME === 'workflow_dispatch', 'Unsupported release event');
  if (env.GITHUB_EVENT_NAME === 'push') assert.equal(env.GITHUB_REF, `refs/tags/v${version}`);
  else assert.ok(env.GITHUB_REF === 'refs/heads/main' || env.GITHUB_REF === `refs/tags/v${version}`, 'Unexpected dispatch ref');
  assert.ok(env.ACTIONS_ID_TOKEN_REQUEST_URL && env.ACTIONS_ID_TOKEN_REQUEST_TOKEN,
    'GitHub OIDC is unavailable; id-token: write is required');
  return true;
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    if (process.argv.includes('--oidc')) {
      const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
      checkTrustedPublishing(process.env, pkg.version);
      console.log('GitHub OIDC release context verified; npm staging enforces trusted publisher permissions.');
    } else {
      checkPublishAccess();
      console.log('npm identity and organization prerequisite verified; staging enforces token write permissions.');
    }
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
