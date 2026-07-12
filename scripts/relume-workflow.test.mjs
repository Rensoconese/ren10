import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { afterEach, test } from 'node:test';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  STAGES,
  assertCleanAllowedFiles,
  nextStage,
  validatePacketDir,
} from './lib/relume-workflow.mjs';

const execFileAsync = promisify(execFile);

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

async function makeTemplateRoot() {
  const templateRoot = await mkdtemp(join(tmpdir(), 'ren10-relume-templates-'));
  roots.push(templateRoot);
  await writeFile(
    join(templateRoot, 'reference-brief.md'),
    '# Reference Brief\n\n## Retrieved facts\n\n- Complete source inspected.\n',
  );
  await writeFile(
    join(templateRoot, 'translation-map.md'),
    '# Translation Map\n\n## Cascade risks\n\n- Native details inspected.\n',
  );
  await writeFile(
    join(templateRoot, 'acceptance.json'),
    '{"version":1,"criteria":[{"id":"one-chevron","kind":"structure","description":"One visible chevron","automated":true}]}\n',
  );
  return templateRoot;
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

test('validatePacketDir reports malformed acceptance.json', async () => {
  const dir = await makePacket();
  await writeFile(join(dir, 'acceptance.json'), '{\n');
  const result = await validatePacketDir(dir);
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /^Invalid acceptance\.json: /);
});

test('validatePacketDir reports malformed render-matrix.json', async () => {
  const dir = await makePacket();
  await writeFile(join(dir, 'render-matrix.json'), '{\n');
  const result = await validatePacketDir(dir);
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 1);
  assert.match(result.errors[0], /^Invalid render-matrix\.json: /);
});

test('init creates a packet with deterministic paths', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-cli-'));
  roots.push(root);
  const templateRoot = await makeTemplateRoot();
  const { stdout } = await execFileAsync(process.execPath, [
    'scripts/relume-workflow.mjs',
    'init',
    '--root', root,
    '--template-root', templateRoot,
    '--family', 'navbars',
    '--module', 'navbar6',
    '--block', 'nav-mega-menu-featured',
    '--path', 'templates/blocks/nav-mega-menu-featured.html',
  ], { cwd: process.cwd() });
  assert.match(stdout, /Created workflow packet: .*navbar6/);
  const packet = JSON.parse(await readFile(join(root, 'navbar6', 'packet.json'), 'utf8'));
  assert.equal(packet.stage, 'reference');
  assert.deepEqual(packet.allowedFiles, [
    'templates/blocks/nav-mega-menu-featured.html',
    'tests/components/blocks-navigation.spec.cjs',
  ]);
});

test('init requires --test-path for non-navbar families', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-cli-'));
  roots.push(root);
  try {
    await execFileAsync(process.execPath, [
      'scripts/relume-workflow.mjs',
      'init',
      '--root', root,
      '--family', 'heroes',
      '--module', 'hero3',
      '--block', 'hero-split',
      '--path', 'templates/blocks/hero-split.html',
    ], { cwd: process.cwd() });
    assert.fail('expected init to reject non-navbar family without --test-path');
  } catch (error) {
    assert.match(`${error.stderr ?? ''}${error.message}`, /--test-path/);
  }
});

test('advance requires evidence and moves exactly one stage', async () => {
  const dir = await makePacket();
  const evidence = join(dir, 'reference-evidence.json');
  await writeFile(evidence, '{"source":"relume-mcp","completeSource":true}\n');
  const { advancePacket } = await import('./lib/relume-workflow.mjs');
  const updated = await advancePacket(dir, evidence);
  assert.equal(updated.stage, 'mapped');
  assert.equal(updated.evidence.reference, 'reference-evidence.json');
});

test('advance CLI requires --evidence', async () => {
  const dir = await makePacket();
  try {
    await execFileAsync(process.execPath, [
      'scripts/relume-workflow.mjs',
      'advance',
      dir,
    ], { cwd: process.cwd(), env: { ...process.env, NODE_NO_WARNINGS: '1' } });
    assert.fail('expected advance CLI to reject missing --evidence');
  } catch (error) {
    assert.equal(error.code, 1);
    assert.equal((error.stderr ?? '').trim(), 'Missing required argument: --evidence');
  }
});
