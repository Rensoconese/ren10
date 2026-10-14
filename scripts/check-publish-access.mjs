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
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try { checkPublishAccess(); console.log('npm identity and organization prerequisite verified; publish enforces token write permissions.'); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
