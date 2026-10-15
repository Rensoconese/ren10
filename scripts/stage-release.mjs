#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { checkTrustedPublishing } from './check-publish-access.mjs';
import { decideStageAction, lookupRegistry } from './release-registry.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');
const oidc = process.argv.includes('--oidc');
if (oidc && !dryRun) checkTrustedPublishing(process.env, JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version);
const output = path.join(root, 'release-candidate.json');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ren10-release-'));
const records = [];
function npm(args, cwd = root) {
  const result = spawnSync('npm', args, { cwd, encoding: 'utf8', timeout: 120000 });
  if (result.error || result.status !== 0) {
    const code = result.stderr?.match(/npm (?:error|ERR!) code ([A-Z0-9_]+)/)?.[1] || 'COMMAND_FAILED';
    throw new Error(`npm ${args[0]} failed (${code}); raw authentication diagnostics are withheld. If this version is already staged, approve the original verified candidate in npm and rerun; OIDC cannot inspect or reuse private pending stages.`);
  }
  return result.stdout;
}
try {
  for (const relative of ['.', 'packages/astro']) {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, relative, 'package.json'), 'utf8'));
    assert.equal(pkg.publishConfig?.provenance, true);
    const [metadata] = JSON.parse(npm(['pack', path.join(root, relative), '--json', '--pack-destination', directory]));
    assert.equal(metadata.name, pkg.name);
    assert.equal(metadata.version, pkg.version);
    assert.equal(path.basename(metadata.filename), metadata.filename);
    const tarball = path.join(directory, metadata.filename);
    const bytes = fs.readFileSync(tarball);
    const expected = {
      name: pkg.name, version: pkg.version,
      integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
      shasum: createHash('sha1').update(bytes).digest('hex'),
    };
    assert.equal(expected.integrity, metadata.integrity);
    assert.equal(expected.shasum, metadata.shasum);
    const published = dryRun ? null : await lookupRegistry(pkg.name, pkg.version);
    // OIDC cannot list or download private stages. A duplicate version is rejected
    // by npm's shared staged/public version index, never assumed identical.
    const stages = !oidc && !dryRun && !published ? JSON.parse(npm(['stage', 'list', pkg.name, '--json'])) : [];
    assert.ok(Array.isArray(stages));
    const action = decideStageAction(expected, published, stages);
    if (action.state === 'pending') {
      assert.match(action.id, /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i);
      npm(['stage', 'download', action.id, '--json'], directory);
      const filename = `${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}-${action.id}.tgz`;
      const stagedBytes = fs.readFileSync(path.join(directory, filename));
      assert.equal(`sha512-${createHash('sha512').update(stagedBytes).digest('base64')}`,
        expected.integrity, 'Pending staged tarball differs from the verified candidate');
    }
    if (action.state === 'stage') {
      // Stage the already hashed tarball, not a second packing of the source.
      npm(['stage', 'publish', tarball, '--provenance', '--access', 'public', '--json',
        ...(dryRun ? ['--dry-run'] : [])]);
    }
    records.push(expected);
    console.log(`${pkg.name}@${pkg.version}: ${dryRun ? 'dry-run' : action.state}; ${expected.integrity}`);
    if (!dryRun) fs.writeFileSync(output, JSON.stringify(records, null, 2) + '\n');
  }
  if (!dryRun) console.log('Staging completed. Public release still requires maintainer approval with 2FA.');
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
