import assert from 'node:assert/strict';

export function validatePublishedPackage(expected, manifest) {
  assert.equal(manifest?.name, expected.name, 'Published package name differs');
  assert.equal(manifest.version, expected.version, 'Published version differs');
  assert.equal(manifest.dist?.integrity, expected.integrity, 'Published tarball integrity differs');
  assert.equal(manifest.dist?.attestations?.provenance?.predicateType,
    'https://slsa.dev/provenance/v1', 'Published provenance is missing');
  const attestation = new URL(manifest.dist.attestations.url);
  assert.equal(attestation.origin, 'https://registry.npmjs.org', 'Unexpected provenance registry');
  assert.equal(decodeURIComponent(attestation.pathname),
    `/-/npm/v1/attestations/${expected.name}@${expected.version}`, 'Provenance belongs to another package version');
}

export function decideStageAction(expected, published, stages) {
  if (published) {
    validatePublishedPackage(expected, published);
    return { state: 'published' };
  }
  const staged = stages.find(item => item.packageName === expected.name && item.version === expected.version);
  if (!staged) return { state: 'stage' };
  assert.equal(staged.shasum, expected.shasum, 'Existing staged tarball differs; review it before retrying');
  assert.equal(staged.tag, 'latest', 'Existing staged tag differs');
  assert.notEqual(staged.status, 'rejected', 'Existing stage was rejected');
  return { state: 'pending', id: staged.id };
}

export async function lookupRegistry(name, version) {
  const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/${encodeURIComponent(version)}`, {
    headers: { accept: 'application/json' }, signal: AbortSignal.timeout(10000),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Registry lookup failed (${response.status})`);
  return response.json();
}

export async function waitForPublished(expected, {
  timeoutMs = 0, intervalMs = 15000, lookup = lookupRegistry,
  now = Date.now, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  onPending = () => {},
} = {}) {
  const deadline = now() + timeoutMs;
  while (true) {
    const manifests = [];
    for (const pkg of expected) {
      let manifest;
      try { manifest = await lookup(pkg.name, pkg.version); }
      catch { onPending(`${pkg.name}: registry lookup unavailable`); continue; }
      if (!manifest) { onPending(`${pkg.name}@${pkg.version}: awaiting 2FA approval`); continue; }
      // An immutable version with different bytes is a hard failure, not a
      // transient registry error or permission to publish over that version.
      validatePublishedPackage(pkg, manifest);
      manifests.push(manifest);
    }
    if (manifests.length === expected.length) return manifests;
    if (now() >= deadline) throw new Error('Both exact release versions are not public with verified integrity and provenance');
    await sleep(Math.min(intervalMs, deadline - now()));
  }
}
