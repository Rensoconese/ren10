import assert from 'node:assert/strict';
import test from 'node:test';
import { decideStageAction, validatePublishedPackage, waitForPublished } from './release-registry.mjs';

const expected = { name: 'ren10', version: '0.14.1', integrity: 'sha512-candidate', shasum: 'candidate-sha1' };
const published = { ...expected, dist: { integrity: expected.integrity, attestations: {
  url: 'https://registry.npmjs.org/-/npm/v1/attestations/ren10@0.14.1',
  provenance: { predicateType: 'https://slsa.dev/provenance/v1' },
} } };
const staged = { id: 'candidate-stage', packageName: 'ren10', version: '0.14.1', shasum: expected.shasum, tag: 'latest', status: 'pending' };

test('an absent version is staged, while an identical pending version is reused', () => {
  assert.equal(decideStageAction(expected, null, []).state, 'stage');
  assert.equal(decideStageAction(expected, null, [staged]).state, 'pending');
  assert.equal(decideStageAction(expected, published, []).state, 'published');
});

test('a conflicting staged tarball, tag or rejected version blocks a retry', () => {
  for (const change of [{ shasum: 'other-artifact' }, { tag: 'next' }, { status: 'rejected' }]) {
    assert.throws(() => decideStageAction(expected, null, [{ ...staged, ...change }]));
  }
});

test('public verification requires the exact package, version, integrity and provenance', () => {
  assert.doesNotThrow(() => validatePublishedPackage(expected, published));
  for (const change of [{ name: '@ren10/astro' }, { version: '0.14.0' },
    { dist: { ...published.dist, integrity: 'sha512-other' } },
    { dist: { integrity: expected.integrity } },
    { dist: { ...published.dist, attestations: { ...published.dist.attestations,
      url: 'https://registry.npmjs.org/-/npm/v1/attestations/other@0.14.1' } } }]) {
    assert.throws(() => validatePublishedPackage(expected, { ...published, ...change }));
  }
});

test('publication waits for both approvals and rejects mismatched immutable content immediately', async () => {
  const astro = { ...expected, name: '@ren10/astro' };
  let elapsed = 0;
  const seen = [];
  const result = await waitForPublished([expected, astro], {
    timeoutMs: 20, intervalMs: 10, now: () => elapsed,
    sleep: async ms => { elapsed += ms; },
    lookup: async name => { seen.push(name); return name === 'ren10' || elapsed >= 10 ? { ...published, name, dist: { ...published.dist, attestations: { ...published.dist.attestations,
      url: name === 'ren10' ? published.dist.attestations.url : 'https://registry.npmjs.org/-/npm/v1/attestations/@ren10%2Fastro@0.14.1' } } } : null; },
  });
  assert.equal(result.length, 2);
  assert.ok(seen.includes('@ren10/astro'));
  assert.equal(elapsed, 10);
  await assert.rejects(() => waitForPublished([expected], {
    timeoutMs: 20, lookup: async () => ({ ...published, version: 'wrong' }),
  }), /version/);
});

test('unapproved versions and registry outages cannot become a successful release', async () => {
  for (const lookup of [async () => null, async () => { throw new Error('registry unavailable'); }]) {
    let elapsed = 0;
    await assert.rejects(() => waitForPublished([expected], {
      timeoutMs: 20, intervalMs: 10, now: () => elapsed,
      sleep: async ms => { elapsed += ms; }, lookup,
    }), /not public/);
  }
});
