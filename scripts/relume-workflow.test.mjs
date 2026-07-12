import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  STAGES,
  assertCleanAllowedFiles,
  nextStage,
  validatePacketDir,
} from './lib/relume-workflow.mjs';

const roots = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))));

async function makePacket(overrides = {}) {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-'));
  roots.push(root);
  const dir = join(root, 'navbar5');
  await mkdir(dir);
  const packet = {
    version: 1,
    family: 'navbars',
    moduleId: 'navbar5',
    blockSlug: 'nav-mega-menu',
    blockPath: 'templates/blocks/nav-mega-menu.html',
    stage: 'reference',
    allowedFiles: [
      'templates/blocks/nav-mega-menu.html',
      'tests/components/blocks-navigation.spec.cjs',
    ],
    ...overrides,
  };
  await writeFile(join(dir, 'packet.json'), `${JSON.stringify(packet, null, 2)}\n`);
  await writeFile(join(dir, 'reference-brief.md'), '# Reference Brief\n\n## Retrieved facts\n\n- Complete source inspected.\n');
  await writeFile(join(dir, 'translation-map.md'), '# Translation Map\n\n## Cascade risks\n\n- Native details inspected.\n');
  await writeFile(join(dir, 'acceptance.json'), '{"version":1,"criteria":[{"id":"one-chevron","kind":"structure","description":"One visible chevron","automated":true}]}\n');
  await writeFile(join(dir, 'render-matrix.json'), '{"version":1,"path":"/templates/blocks/nav-mega-menu.html","root":"[data-rbm-root]","states":[]}\n');
  return dir;
}

test('validatePacketDir accepts a complete reference-stage packet', async () => {
  const dir = await makePacket();
  const result = await validatePacketDir(dir);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.packet.moduleId, 'navbar5');
});

test('validatePacketDir reports every missing required artifact', async () => {
  const dir = await makePacket();
  await rm(join(dir, 'translation-map.md'));
  await rm(join(dir, 'acceptance.json'));
  const result = await validatePacketDir(dir);
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, [
    'Missing required artifact: acceptance.json',
    'Missing required artifact: translation-map.md',
  ]);
});

test('stage order is fixed and cannot skip review', () => {
  assert.deepEqual(STAGES, ['reference', 'mapped', 'red', 'green', 'reviewed', 'accepted']);
  assert.equal(nextStage('green'), 'reviewed');
  assert.equal(nextStage('accepted'), null);
});

test('allowed file audit rejects undeclared changes', () => {
  assert.throws(
    () => assertCleanAllowedFiles(
      ['templates/blocks/nav-mega-menu.html', 'STATUS.md'],
      ['templates/blocks/nav-mega-menu.html'],
    ),
    /Out-of-scope changed file: STATUS\.md/,
  );
});