import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { afterEach, test } from 'node:test';
import { access, copyFile, mkdtemp, mkdir, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import {
  STAGES,
  advancePacket,
  assertCleanAllowedFiles,
  nextStage,
  scaffoldPacket,
  validateInventory,
  validatePacketDir,
} from './lib/relume-workflow.mjs';

const execFileAsync = promisify(execFile);
const CLI = 'scripts/relume-workflow.mjs';

const roots = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))));

async function pathExists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

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
    evidence: {},
    ...overrides,
  };
  await writeFile(join(dir, 'packet.json'), `${JSON.stringify(packet, null, 2)}\n`);
  await writeFile(join(dir, 'reference-brief.md'), '# Reference Brief\n\n## Retrieved facts\n\n- Complete source inspected.\n');
  await writeFile(join(dir, 'translation-map.md'), '# Translation Map\n\n## Cascade risks\n\n- Native details inspected.\n');
  await writeFile(join(dir, 'acceptance.json'), '{"version":1,"criteria":[{"id":"one-chevron","kind":"structure","description":"One visible chevron","automated":true}]}\n');
  await writeFile(join(dir, 'render-matrix.json'), '{"version":1,"path":"/templates/blocks/nav-mega-menu.html","root":"[data-rbm-root]","states":[]}\n');
  return dir;
}

async function makeTemplateRoot(partial = false) {
  const templateRoot = await mkdtemp(join(tmpdir(), 'ren10-relume-templates-'));
  roots.push(templateRoot);
  await writeFile(
    join(templateRoot, 'reference-brief.md'),
    '# Reference Brief\n\n## Retrieved facts\n\n- Complete source inspected.\n',
  );
  if (!partial) {
    await writeFile(
      join(templateRoot, 'translation-map.md'),
      '# Translation Map\n\n## Cascade risks\n\n- Native details inspected.\n',
    );
    await writeFile(
      join(templateRoot, 'acceptance.json'),
      '{"version":1,"criteria":[{"id":"one-chevron","kind":"structure","description":"One visible chevron","automated":true}]}\n',
    );
  }
  return templateRoot;
}

async function writeEvidence(dir, name, body) {
  const path = join(dir, name);
  await writeFile(path, typeof body === 'string' ? body : `${JSON.stringify(body)}\n`);
  return path;
}

function referenceEvidence(overrides = {}) {
  return {
    stage: 'reference',
    passed: true,
    source: 'relume-mcp',
    completeSource: true,
    ...overrides,
  };
}

function greenEvidence(overrides = {}) {
  return {
    stage: 'green',
    result: 'passed',
    reviewer: 'Codex',
    reviewedCommit: '73d1416',
    captures: {
      desktop: 'desktop-light-default.png',
      mobile: 'mobile-light-default.png',
    },
    capturesFresh: true,
    cascadeInspection: 'Inspected DOM semantics and CSS cascade for details/summary and layout primitives; no duplicate chevrons.',
    ...overrides,
  };
}

function reviewedEvidence(overrides = {}) {
  return {
    stage: 'reviewed',
    kind: 'human-acceptance',
    acceptor: 'product-owner',
    result: 'accepted',
    ...overrides,
  };
}

async function runCli(args, options = {}) {
  return execFileAsync(process.execPath, [CLI, ...args], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_NO_WARNINGS: '1' },
    ...options,
  });
}

async function expectCliFailure(args) {
  try {
    await runCli(args);
    assert.fail(`expected CLI to fail: ${args.join(' ')}`);
  } catch (error) {
    assert.equal(error.code, 1);
    return `${error.stderr ?? ''}${error.stdout ?? ''}${error.message ?? ''}`;
  }
}

// --- Task 3: operator templates ---

test('workflow templates contain every mandatory gate', async () => {
  const templateRoot = join(process.cwd(), 'docs/workflows/relume-to-ren10/templates');
  const reference = await readFile(join(templateRoot, 'reference-brief.md'), 'utf8');
  const map = await readFile(join(templateRoot, 'translation-map.md'), 'utf8');
  const packet = await readFile(join(templateRoot, 'implementation-packet.md'), 'utf8');
  assert.match(reference, /## Retrieved facts/);
  assert.match(reference, /## Responsive states/);
  assert.match(reference, /## Unavailable evidence/);
  assert.match(map, /## RenDS mapping/);
  assert.match(map, /## Cascade risks/);
  assert.match(map, /primitive-zero\.md/);
  assert.match(packet, /## Required RED evidence/);
  assert.match(packet, /## Allowed files/);
  assert.match(packet, /## Required render matrix/);
  // Self-contained Grok packet: complete filled contents must be embedded
  // inline. Links/paths may only supplement and can never replace embeds.
  assert.match(packet, /self-contained/i);
  assert.match(packet, /embed(?: the)? complete filled contents/i);
  assert.match(packet, /inline/i);
  assert.match(packet, /supplemental only|can never replace/i);
  assert.doesNotMatch(packet, /Paste or link/i);
});

// --- Task 1: packet validation ---

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

// --- Finding 1: built-in scaffold defaults + transactional init ---

test('init creates a packet with deterministic paths using built-in scaffolds', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-cli-'));
  roots.push(root);
  const { stdout } = await runCli([
    'init',
    '--root', root,
    '--family', 'navbars',
    '--module', 'navbar6',
    '--block', 'nav-mega-menu-featured',
    '--path', 'templates/blocks/nav-mega-menu-featured.html',
  ]);
  assert.match(stdout, /Created workflow packet: .*navbar6/);
  const packetDir = join(root, 'navbar6');
  const packet = JSON.parse(await readFile(join(packetDir, 'packet.json'), 'utf8'));
  assert.equal(packet.stage, 'reference');
  assert.deepEqual(packet.allowedFiles, [
    'templates/blocks/nav-mega-menu-featured.html',
    'tests/components/blocks-navigation.spec.cjs',
  ]);
  const validated = await validatePacketDir(packetDir);
  assert.equal(validated.valid, true, validated.errors.join('\n'));
  const brief = await readFile(join(packetDir, 'reference-brief.md'), 'utf8');
  const map = await readFile(join(packetDir, 'translation-map.md'), 'utf8');
  assert.match(brief, /## Retrieved facts/);
  assert.match(map, /## Cascade risks/);
  const acceptance = JSON.parse(await readFile(join(packetDir, 'acceptance.json'), 'utf8'));
  assert.ok(Array.isArray(acceptance.criteria) && acceptance.criteria.length > 0);
});

test('init requires --test-path for non-navbar families', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-cli-'));
  roots.push(root);
  const output = await expectCliFailure([
    'init',
    '--root', root,
    '--family', 'heroes',
    '--module', 'hero3',
    '--block', 'hero-split',
    '--path', 'templates/blocks/hero-split.html',
  ]);
  assert.match(output, /--test-path/);
  assert.equal(await pathExists(join(root, 'hero3')), false);
});

test('init optional --template-root overrides built-in scaffolds', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-cli-'));
  roots.push(root);
  const templateRoot = await makeTemplateRoot();
  await runCli([
    'init',
    '--root', root,
    '--template-root', templateRoot,
    '--family', 'navbars',
    '--module', 'navbar6',
    '--block', 'nav-mega-menu-featured',
    '--path', 'templates/blocks/nav-mega-menu-featured.html',
  ]);
  const brief = await readFile(join(root, 'navbar6', 'reference-brief.md'), 'utf8');
  assert.match(brief, /Complete source inspected/);
});

test('failed init is transactional and leaves no partial target', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-cli-'));
  roots.push(root);
  const partialTemplates = await makeTemplateRoot(true);
  const output = await expectCliFailure([
    'init',
    '--root', root,
    '--template-root', partialTemplates,
    '--family', 'navbars',
    '--module', 'navbar6',
    '--block', 'nav-mega-menu-featured',
    '--path', 'templates/blocks/nav-mega-menu-featured.html',
  ]);
  assert.match(output, /./);
  assert.equal(await pathExists(join(root, 'navbar6')), false);
  const { stdout } = await runCli([
    'init',
    '--root', root,
    '--family', 'navbars',
    '--module', 'navbar6',
    '--block', 'nav-mega-menu-featured',
    '--path', 'templates/blocks/nav-mega-menu-featured.html',
  ]);
  assert.match(stdout, /Created workflow packet: .*navbar6/);
  assert.equal(await pathExists(join(root, 'navbar6', 'packet.json')), true);
});

// --- Finding 2: advancePacket evidence hardening ---

test('advance requires evidence and moves exactly one stage', async () => {
  const dir = await makePacket();
  const evidence = await writeEvidence(dir, 'reference-evidence.json', referenceEvidence());
  const updated = await advancePacket(dir, evidence);
  assert.equal(updated.stage, 'mapped');
  assert.equal(updated.evidence.reference, 'reference-evidence.json');
});

test('advance rejects evidence outside the packet directory', async () => {
  const dir = await makePacket();
  const externalRoot = await mkdtemp(join(tmpdir(), 'ren10-relume-external-'));
  roots.push(externalRoot);
  const external = join(externalRoot, 'reference-evidence.json');
  await writeFile(external, `${JSON.stringify(referenceEvidence())}\n`);
  await assert.rejects(
    () => advancePacket(dir, external),
    /inside the packet directory|packet-relative|path escape|must be inside/i,
  );
  const packet = JSON.parse(await readFile(join(dir, 'packet.json'), 'utf8'));
  assert.equal(packet.stage, 'reference');
});

test('advance rejects path-escaping evidence paths', async () => {
  const dir = await makePacket();
  const escapePath = join(dir, '..', 'escape-evidence.json');
  await writeFile(escapePath, `${JSON.stringify(referenceEvidence())}\n`);
  await assert.rejects(
    () => advancePacket(dir, escapePath),
    /inside the packet directory|packet-relative|path escape|must be inside/i,
  );
});

test('advance rejects malformed evidence JSON', async () => {
  const dir = await makePacket();
  const evidence = await writeEvidence(dir, 'bad-evidence.json', '{\n');
  await assert.rejects(
    () => advancePacket(dir, evidence),
    /valid JSON|malformed|Invalid evidence/i,
  );
});

test('advance rejects empty evidence object', async () => {
  const dir = await makePacket();
  const evidence = await writeEvidence(dir, 'empty-evidence.json', {});
  await assert.rejects(
    () => advancePacket(dir, evidence),
    /stage|passed/i,
  );
});

test('advance rejects evidence with wrong stage', async () => {
  const dir = await makePacket();
  const evidence = await writeEvidence(dir, 'wrong-stage.json', referenceEvidence({ stage: 'mapped' }));
  await assert.rejects(
    () => advancePacket(dir, evidence),
    /stage/i,
  );
});

test('advance rejects evidence when passed is not true', async () => {
  const dir = await makePacket();
  const evidence = await writeEvidence(dir, 'failed-evidence.json', referenceEvidence({ passed: false }));
  await assert.rejects(
    () => advancePacket(dir, evidence),
    /passed/i,
  );
});

test('advance rejects incomplete reference evidence (missing source)', async () => {
  const dir = await makePacket();
  const evidence = await writeEvidence(dir, 'incomplete-source.json', {
    stage: 'reference',
    passed: true,
    completeSource: true,
  });
  await assert.rejects(
    () => advancePacket(dir, evidence),
    /source|relume-mcp/i,
  );
});

test('advance rejects incomplete reference evidence (completeSource false)', async () => {
  const dir = await makePacket();
  const evidence = await writeEvidence(dir, 'incomplete-complete.json', referenceEvidence({
    completeSource: false,
  }));
  await assert.rejects(
    () => advancePacket(dir, evidence),
    /completeSource/i,
  );
});

test('advance stores evidence as packet-relative path', async () => {
  const dir = await makePacket();
  await mkdir(join(dir, 'evidence'));
  const evidence = await writeEvidence(dir, join('evidence', 'reference.json'), referenceEvidence());
  const updated = await advancePacket(dir, evidence);
  assert.equal(updated.evidence.reference, join('evidence', 'reference.json'));
  assert.equal(updated.stage, 'mapped');
});

test('advance accepts valid non-reference evidence without MCP fields', async () => {
  const dir = await makePacket({ stage: 'mapped' });
  const evidence = await writeEvidence(dir, 'mapped-evidence.json', {
    stage: 'mapped',
    passed: true,
  });
  const updated = await advancePacket(dir, evidence);
  assert.equal(updated.stage, 'red');
  assert.equal(updated.evidence.mapped, 'mapped-evidence.json');
});

// --- Finding 3: explicit CLI command schemas ---

test('advance CLI requires --evidence', async () => {
  const dir = await makePacket();
  const output = await expectCliFailure(['advance', dir]);
  assert.match(output, /Missing required argument: --evidence/);
});

test('validate CLI requires exactly one packet dir', async () => {
  const output = await expectCliFailure(['validate']);
  assert.match(output, /Usage:|exactly one|packet/i);
});

test('validate CLI rejects extra positionals', async () => {
  const dir = await makePacket();
  const output = await expectCliFailure(['validate', dir, 'extra']);
  assert.match(output, /Usage:|extra|unexpected|positional/i);
});

test('validate CLI rejects unknown flags', async () => {
  const dir = await makePacket();
  const output = await expectCliFailure(['validate', dir, '--foo', 'bar']);
  assert.match(output, /Unknown|Usage:|unexpected|--foo/i);
});

test('status CLI requires exactly one packet dir', async () => {
  const output = await expectCliFailure(['status']);
  assert.match(output, /Usage:|exactly one|packet/i);
});

test('status CLI rejects unknown flags', async () => {
  const dir = await makePacket();
  const output = await expectCliFailure(['status', dir, '--verbose']);
  assert.match(output, /Unknown|Usage:|unexpected|--verbose/i);
});

test('advance CLI requires exactly one packet dir', async () => {
  const output = await expectCliFailure(['advance', '--evidence', 'x.json']);
  assert.match(output, /Usage:|exactly one|packet/i);
});

test('advance CLI rejects extra positionals', async () => {
  const dir = await makePacket();
  const evidence = await writeEvidence(dir, 'reference-evidence.json', referenceEvidence());
  const output = await expectCliFailure(['advance', dir, 'extra', '--evidence', evidence]);
  assert.match(output, /Usage:|extra|unexpected|positional/i);
});

test('advance CLI rejects unknown flags', async () => {
  const dir = await makePacket();
  const evidence = await writeEvidence(dir, 'reference-evidence.json', referenceEvidence());
  const output = await expectCliFailure(['advance', dir, '--evidence', evidence, '--force']);
  assert.match(output, /Unknown|Usage:|unexpected|--force/i);
});

test('init CLI requires non-empty --family --module --block --path', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-cli-'));
  roots.push(root);
  for (const missing of ['family', 'module', 'block', 'path']) {
    const args = [
      'init',
      '--root', root,
      '--family', 'navbars',
      '--module', 'navbar6',
      '--block', 'nav-mega-menu-featured',
      '--path', 'templates/blocks/nav-mega-menu-featured.html',
    ];
    const flag = `--${missing}`;
    const index = args.indexOf(flag);
    args.splice(index, 2);
    const output = await expectCliFailure(args);
    assert.match(output, new RegExp(flag));
    assert.equal(await pathExists(join(root, 'navbar6')), false);
  }
});

test('init CLI rejects empty required flag values', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-cli-'));
  roots.push(root);
  const output = await expectCliFailure([
    'init',
    '--root', root,
    '--family', '',
    '--module', 'navbar6',
    '--block', 'nav-mega-menu-featured',
    '--path', 'templates/blocks/nav-mega-menu-featured.html',
  ]);
  assert.match(output, /--family|non-empty|empty/i);
  assert.equal(await pathExists(join(root, 'navbar6')), false);
});

test('init CLI rejects unknown flags before mutation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-cli-'));
  roots.push(root);
  const output = await expectCliFailure([
    'init',
    '--root', root,
    '--family', 'navbars',
    '--module', 'navbar6',
    '--block', 'nav-mega-menu-featured',
    '--path', 'templates/blocks/nav-mega-menu-featured.html',
    '--dry-run',
  ]);
  assert.match(output, /Unknown|Usage:|unexpected|--dry-run/i);
  assert.equal(await pathExists(join(root, 'navbar6')), false);
});

test('init CLI rejects extra positionals before mutation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-cli-'));
  roots.push(root);
  const output = await expectCliFailure([
    'init',
    'unexpected-positional',
    '--root', root,
    '--family', 'navbars',
    '--module', 'navbar6',
    '--block', 'nav-mega-menu-featured',
    '--path', 'templates/blocks/nav-mega-menu-featured.html',
  ]);
  assert.match(output, /Usage:|extra|unexpected|positional/i);
  assert.equal(await pathExists(join(root, 'navbar6')), false);
});

test('scaffoldPacket uses built-in defaults without templateRoot', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-lib-'));
  roots.push(root);
  const packetDir = await scaffoldPacket({
    root,
    family: 'navbars',
    moduleId: 'navbar7',
    blockSlug: 'nav-simple',
    blockPath: 'templates/blocks/nav-simple.html',
  });
  assert.equal(packetDir, join(root, 'navbar7'));
  const result = await validatePacketDir(packetDir);
  assert.equal(result.valid, true, result.errors.join('\n'));
});

test('scaffoldPacket resolves absolute evidence-free packet path with resolve safety', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-lib-'));
  roots.push(root);
  const packetDir = await scaffoldPacket({
    root,
    family: 'navbars',
    moduleId: 'navbar8',
    blockSlug: 'nav-abs',
    blockPath: 'templates/blocks/nav-abs.html',
  });
  assert.equal(resolve(packetDir), resolve(join(root, 'navbar8')));
});

// --- Fix pass: stage-specific evidence schemas (green visual + reviewed human) ---

test('advance rejects generic {stage,passed:true} green evidence (cannot skip Codex visual review)', async () => {
  const dir = await makePacket({ stage: 'green' });
  const evidence = await writeEvidence(dir, 'green-generic.json', {
    stage: 'green',
    passed: true,
  });
  await assert.rejects(
    () => advancePacket(dir, evidence),
    /Codex|captures|reviewedCommit|cascade|result|green evidence/i,
  );
  const packet = JSON.parse(await readFile(join(dir, 'packet.json'), 'utf8'));
  assert.equal(packet.stage, 'green');
  assert.equal(packet.evidence.green, undefined);
});

test('advance rejects green evidence missing desktop or mobile captures', async () => {
  const dir = await makePacket({ stage: 'green' });
  const evidence = await writeEvidence(dir, 'green-no-mobile.json', greenEvidence({
    captures: { desktop: 'desktop-light-default.png' },
  }));
  await assert.rejects(
    () => advancePacket(dir, evidence),
    /mobile|captures/i,
  );
});

test('advance rejects green evidence without Codex reviewer identity', async () => {
  const dir = await makePacket({ stage: 'green' });
  const evidence = await writeEvidence(dir, 'green-wrong-reviewer.json', greenEvidence({
    reviewer: 'Grok',
  }));
  await assert.rejects(
    () => advancePacket(dir, evidence),
    /Codex|reviewer/i,
  );
});

test('advance rejects green evidence with invalid reviewedCommit', async () => {
  const dir = await makePacket({ stage: 'green' });
  const evidence = await writeEvidence(dir, 'green-bad-commit.json', greenEvidence({
    reviewedCommit: 'not a commit!!',
  }));
  await assert.rejects(
    () => advancePacket(dir, evidence),
    /reviewedCommit|commit|packet/i,
  );
});

test('advance rejects green evidence without cascade inspection proof', async () => {
  const dir = await makePacket({ stage: 'green' });
  const evidence = await writeEvidence(dir, 'green-no-cascade.json', greenEvidence({
    cascadeInspection: '',
  }));
  await assert.rejects(
    () => advancePacket(dir, evidence),
    /cascade/i,
  );
});

test('advance rejects green evidence when capturesFresh is not true', async () => {
  const dir = await makePacket({ stage: 'green' });
  const evidence = await writeEvidence(dir, 'green-stale.json', greenEvidence({
    capturesFresh: false,
  }));
  await assert.rejects(
    () => advancePacket(dir, evidence),
    /capturesFresh|fresh/i,
  );
});

test('advance accepts complete green visual-review evidence and stores packet-relative path', async () => {
  const dir = await makePacket({ stage: 'green' });
  const evidence = await writeEvidence(dir, 'green-evidence.json', greenEvidence({
    reviewedCommit: 'packet',
  }));
  const updated = await advancePacket(dir, evidence);
  assert.equal(updated.stage, 'reviewed');
  assert.equal(updated.evidence.green, 'green-evidence.json');
});

test('advance rejects generic {stage,passed:true} reviewed evidence (cannot skip human acceptance)', async () => {
  const dir = await makePacket({ stage: 'reviewed' });
  const evidence = await writeEvidence(dir, 'reviewed-generic.json', {
    stage: 'reviewed',
    passed: true,
  });
  await assert.rejects(
    () => advancePacket(dir, evidence),
    /human-acceptance|acceptor|result|reviewed evidence/i,
  );
  const packet = JSON.parse(await readFile(join(dir, 'packet.json'), 'utf8'));
  assert.equal(packet.stage, 'reviewed');
});

test('advance rejects automation acceptor for reviewed→accepted', async () => {
  const dir = await makePacket({ stage: 'reviewed' });
  for (const acceptor of ['automation', 'CI', 'bot', 'Codex', 'Grok', 'system']) {
    const evidence = await writeEvidence(dir, `reviewed-${acceptor}.json`, reviewedEvidence({ acceptor }));
    await assert.rejects(
      () => advancePacket(dir, evidence),
      /human|acceptor|automation/i,
    );
  }
  const packet = JSON.parse(await readFile(join(dir, 'packet.json'), 'utf8'));
  assert.equal(packet.stage, 'reviewed');
});

test('advance accepts explicit human acceptance evidence from reviewed', async () => {
  const dir = await makePacket({ stage: 'reviewed' });
  const evidence = await writeEvidence(dir, 'reviewed-evidence.json', reviewedEvidence());
  const updated = await advancePacket(dir, evidence);
  assert.equal(updated.stage, 'accepted');
  assert.equal(updated.evidence.reviewed, 'reviewed-evidence.json');
});

// --- Fix pass: moduleId / path traversal containment ---

test('scaffoldPacket rejects unsafe moduleId segments (no mutation outside root)', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-modid-'));
  roots.push(root);
  const parentBefore = new Set(await readdir(dirname(root)));
  const unsafe = ['..', '.', '../escape', 'foo/bar', 'foo\\bar', '/tmp/evil', 'C:\\evil', 'a/../b', ''];
  for (const moduleId of unsafe) {
    await assert.rejects(
      () => scaffoldPacket({
        root,
        family: 'navbars',
        moduleId,
        blockSlug: 'nav-x',
        blockPath: 'templates/blocks/nav-x.html',
      }),
      /module|slug|path|invalid|segment/i,
    );
  }
  assert.deepEqual(await readdir(root), []);
  const parentAfter = new Set(await readdir(dirname(root)));
  for (const name of parentAfter) {
    if (!parentBefore.has(name) && name !== root.split('/').pop()) {
      // Only the temp root itself may be new under tmpdir; no escape siblings from moduleId
    }
  }
  // Confirm no sibling named "escape" was created next to root
  assert.equal(await pathExists(join(dirname(root), 'escape')), false);
});

test('scaffoldPacket rejects absolute and traversal blockPath/testPath', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-paths-'));
  roots.push(root);
  const badPaths = [
    '/absolute/block.html',
    '../outside.html',
    'templates//blocks/x.html',
    'templates/./blocks/x.html',
    'templates/blocks/../../secret.html',
    '',
  ];
  for (const blockPath of badPaths) {
    await assert.rejects(
      () => scaffoldPacket({
        root,
        family: 'navbars',
        moduleId: 'navbar-safe',
        blockSlug: 'nav-x',
        blockPath,
      }),
      /blockPath|repository-relative|traversal|absolute|path|empty/i,
    );
  }
  await assert.rejects(
    () => scaffoldPacket({
      root,
      family: 'heroes',
      moduleId: 'hero-safe',
      blockSlug: 'hero-x',
      blockPath: 'templates/blocks/hero-x.html',
      testPath: '../escape.spec.cjs',
    }),
    /testPath|repository-relative|traversal|absolute|path/i,
  );
  assert.equal(await pathExists(join(root, 'navbar-safe')), false);
  assert.equal(await pathExists(join(root, 'hero-safe')), false);
});

test('init CLI rejects module path traversal without mutating outside root', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-cli-trav-'));
  roots.push(root);
  const output = await expectCliFailure([
    'init',
    '--root', root,
    '--family', 'navbars',
    '--module', '../escape-module',
    '--block', 'nav-x',
    '--path', 'templates/blocks/nav-x.html',
  ]);
  assert.match(output, /module|slug|path|invalid|segment/i);
  assert.equal(await pathExists(join(root, 'escape-module')), false);
  assert.equal(await pathExists(join(dirname(root), 'escape-module')), false);
});

test('init CLI rejects traversal --path without mutation', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-cli-path-'));
  roots.push(root);
  const output = await expectCliFailure([
    'init',
    '--root', root,
    '--family', 'navbars',
    '--module', 'navbar9',
    '--block', 'nav-x',
    '--path', '../../etc/passwd',
  ]);
  assert.match(output, /path|traversal|repository-relative|absolute/i);
  assert.equal(await pathExists(join(root, 'navbar9')), false);
});

// --- Fix pass: symlink evidence containment ---

test('advance rejects evidence path that is a symlink to external JSON', async () => {
  const dir = await makePacket();
  const externalRoot = await mkdtemp(join(tmpdir(), 'ren10-relume-symlink-'));
  roots.push(externalRoot);
  const external = join(externalRoot, 'external-evidence.json');
  await writeFile(external, `${JSON.stringify(referenceEvidence())}\n`);
  const linkPath = join(dir, 'link-evidence.json');
  await symlink(external, linkPath);
  await assert.rejects(
    () => advancePacket(dir, linkPath),
    /symlink|symbolic link|inside the packet/i,
  );
  const packet = JSON.parse(await readFile(join(dir, 'packet.json'), 'utf8'));
  assert.equal(packet.stage, 'reference');
  assert.equal(packet.evidence.reference, undefined);
});

// --- Task 7: inventory validation and validate-all ---

test('inventory permits at most one in-progress module', async () => {
  const inventory = {
    version: 1,
    families: [{
      id: 'navbars',
      modules: [
        { id: 'navbar5', status: 'in_progress', packet: 'navbar5' },
        { id: 'navbar6', status: 'in_progress', packet: 'navbar6' },
      ],
    }],
  };
  assert.deepEqual(
    (await validateInventory(inventory, '/tmp/modules')).errors,
    ['Inventory may contain only one in_progress module; found navbar5, navbar6'],
  );
});

test('inventory rejects duplicate module ids across families', async () => {
  const inventory = {
    version: 1,
    families: [
      { id: 'navbars', modules: [{ id: 'navbar5', status: 'queued' }] },
      { id: 'headers', modules: [{ id: 'navbar5', status: 'queued' }] },
    ],
  };
  const result = await validateInventory(inventory, '/tmp/modules');
  assert.deepEqual(result.errors, ['Duplicate inventory module id: navbar5']);
});

test('accepted inventory entry requires an accepted packet', async () => {
  const modulesRoot = await mkdtemp(join(tmpdir(), 'ren10-inventory-'));
  roots.push(modulesRoot);
  const packetDir = await makePacket({ stage: 'green' });
  await mkdir(join(modulesRoot, 'navbar5'));
  for (const file of ['packet.json', 'reference-brief.md', 'translation-map.md', 'acceptance.json', 'render-matrix.json']) {
    await copyFile(join(packetDir, file), join(modulesRoot, 'navbar5', file));
  }
  const inventory = {
    version: 1,
    families: [{ id: 'navbars', modules: [{ id: 'navbar5', status: 'accepted', packet: 'navbar5' }] }],
  };
  const result = await validateInventory(inventory, modulesRoot);
  assert.deepEqual(result.errors, ['Accepted module navbar5 has packet stage green; expected accepted']);
});

test('inventory rejects nonexistent packet paths for in_progress modules', async () => {
  const modulesRoot = await mkdtemp(join(tmpdir(), 'ren10-inventory-missing-'));
  roots.push(modulesRoot);
  const inventory = {
    version: 1,
    families: [{
      id: 'navbars',
      modules: [{ id: 'navbar5', status: 'in_progress', packet: 'navbar5' }],
    }],
  };
  const result = await validateInventory(inventory, modulesRoot);
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ['Missing packet directory for module navbar5: navbar5']);
});

test('inventory rejects duplicate family ids', async () => {
  const inventory = {
    version: 1,
    families: [
      { id: 'navbars', modules: [{ id: 'navbar5', status: 'queued' }] },
      { id: 'navbars', modules: [{ id: 'navbar6', status: 'queued' }] },
    ],
  };
  const result = await validateInventory(inventory, '/tmp/modules');
  assert.deepEqual(result.errors, ['Duplicate inventory family id: navbars']);
});

test('inventory rejects invalid version and module status', async () => {
  const inventory = {
    version: 2,
    families: [{
      id: 'navbars',
      modules: [{ id: 'navbar5', status: 'shipping' }],
    }],
  };
  const result = await validateInventory(inventory, '/tmp/modules');
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('inventory version must equal 1'));
  assert.ok(result.errors.some((e) => /Invalid inventory status for module navbar5/.test(e)));
});

test('inventory requires non-empty reason for skipped modules', async () => {
  const inventory = {
    version: 1,
    families: [{
      id: 'navbars',
      modules: [
        { id: 'navbar5', status: 'skipped' },
        { id: 'navbar6', status: 'skipped', reason: '   ' },
      ],
    }],
  };
  const result = await validateInventory(inventory, '/tmp/modules');
  assert.equal(result.valid, false);
  assert.ok(result.errors.includes('Skipped module navbar5 requires a non-empty reason'));
  assert.ok(result.errors.includes('Skipped module navbar6 requires a non-empty reason'));
});

test('inventory rejects malformed non-arrays and non-objects cleanly', async () => {
  assert.deepEqual(
    (await validateInventory(null, '/tmp/modules')).errors,
    ['Inventory must be a JSON object'],
  );
  assert.deepEqual(
    (await validateInventory([], '/tmp/modules')).errors,
    ['Inventory must be a JSON object'],
  );
  assert.deepEqual(
    (await validateInventory({ version: 1, families: 'navbars' }, '/tmp/modules')).errors,
    ['inventory.families must be an array'],
  );
  assert.deepEqual(
    (await validateInventory({ version: 1, families: [null] }, '/tmp/modules')).errors,
    ['inventory.families[0] must be an object'],
  );
  assert.deepEqual(
    (await validateInventory({
      version: 1,
      families: [{ id: 'navbars', modules: 'navbar5' }],
    }, '/tmp/modules')).errors,
    ['inventory.families[0].modules must be an array'],
  );
  assert.deepEqual(
    (await validateInventory({
      version: 1,
      families: [{ id: 'navbars', modules: [null] }],
    }, '/tmp/modules')).errors,
    ['inventory.families[0].modules[0] must be an object'],
  );
});

test('inventory rejects traversal and multi-segment packet paths', async () => {
  const modulesRoot = await mkdtemp(join(tmpdir(), 'ren10-inventory-trav-'));
  roots.push(modulesRoot);
  for (const packet of ['../escape', 'foo/bar', '/abs/path', '..', '.', 'navbar5/../x']) {
    const inventory = {
      version: 1,
      families: [{
        id: 'navbars',
        modules: [{ id: 'navbar5', status: 'accepted', packet }],
      }],
    };
    const result = await validateInventory(inventory, modulesRoot);
    assert.equal(result.valid, false, `expected invalid packet path: ${packet}`);
    assert.ok(
      result.errors.some((e) => /Invalid packet path for module navbar5|traversal|slug|segment|absolute|separators/i.test(e)),
      `packet ${packet}: ${result.errors.join('; ')}`,
    );
  }
});

test('inventory rejects packet path that is a symlink escape', async () => {
  const modulesRoot = await mkdtemp(join(tmpdir(), 'ren10-inventory-sym-'));
  roots.push(modulesRoot);
  const outside = await mkdtemp(join(tmpdir(), 'ren10-inventory-outside-'));
  roots.push(outside);
  const realPacket = await makePacket({ stage: 'accepted' });
  // Copy artifacts into outside so a naive open might succeed; containment must still fail.
  await symlink(realPacket, join(modulesRoot, 'navbar5'));
  const inventory = {
    version: 1,
    families: [{
      id: 'navbars',
      modules: [{ id: 'navbar5', status: 'accepted', packet: 'navbar5' }],
    }],
  };
  const result = await validateInventory(inventory, modulesRoot);
  assert.equal(result.valid, false);
  assert.ok(
    result.errors.some((e) => /symlink|symbolic link|inside modules root|escape/i.test(e)),
    result.errors.join('; '),
  );
});

test('inventory validates in_progress and accepted packets with validatePacketDir', async () => {
  const modulesRoot = await mkdtemp(join(tmpdir(), 'ren10-inventory-full-'));
  roots.push(modulesRoot);
  const good = await makePacket({ stage: 'accepted' });
  await mkdir(join(modulesRoot, 'navbar5'));
  for (const file of ['packet.json', 'reference-brief.md', 'translation-map.md', 'acceptance.json', 'render-matrix.json']) {
    await copyFile(join(good, file), join(modulesRoot, 'navbar5', file));
  }
  // Incomplete in_progress packet: missing translation map
  await mkdir(join(modulesRoot, 'navbar6'));
  await writeFile(
    join(modulesRoot, 'navbar6', 'packet.json'),
    `${JSON.stringify({
      version: 1,
      family: 'navbars',
      moduleId: 'navbar6',
      blockSlug: 'nav-x',
      blockPath: 'templates/blocks/nav-x.html',
      stage: 'red',
      allowedFiles: ['templates/blocks/nav-x.html'],
      evidence: {},
    }, null, 2)}\n`,
  );
  await writeFile(join(modulesRoot, 'navbar6', 'reference-brief.md'), '# Reference Brief\n\n## Retrieved facts\n\n- x\n');
  await writeFile(join(modulesRoot, 'navbar6', 'acceptance.json'), '{"version":1,"criteria":[{"id":"a","kind":"structure","description":"a","automated":true}]}\n');
  await writeFile(join(modulesRoot, 'navbar6', 'render-matrix.json'), '{"version":1,"path":"/x","root":"[data-x]","states":[]}\n');
  // deliberately no translation-map.md

  const inventory = {
    version: 1,
    families: [{
      id: 'navbars',
      modules: [
        { id: 'navbar5', status: 'accepted', packet: 'navbar5' },
        { id: 'navbar6', status: 'in_progress', packet: 'navbar6' },
      ],
    }],
  };
  const result = await validateInventory(inventory, modulesRoot);
  assert.equal(result.valid, false);
  // Must surface validatePacketDir artifact errors, not only stage string checks
  assert.ok(
    result.errors.some((e) => /navbar6/.test(e) && /Missing required artifact: translation-map\.md/.test(e)),
    result.errors.join('; '),
  );
  assert.ok(!result.errors.some((e) => /navbar5/.test(e)), result.errors.join('; '));
});

test('inventory accepts the navbar5 pilot ledger shape', async () => {
  const modulesRoot = join(process.cwd(), 'docs/workflows/relume-to-ren10/modules');
  const inventory = {
    version: 1,
    families: [{
      id: 'navbars',
      sourceCategory: 'navbars',
      status: 'in_progress',
      baseline: 'navbar5',
      modules: [{
        id: 'navbar5',
        status: 'accepted',
        packet: 'navbar5',
        ren10Block: 'templates/blocks/nav-mega-menu.html',
      }],
    }],
  };
  const result = await validateInventory(inventory, modulesRoot);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test('validate-all CLI requires exactly one inventory path and is nonzero on failure', async () => {
  const missing = await expectCliFailure(['validate-all']);
  assert.match(missing, /Usage:|exactly one|inventory/i);

  const extra = await expectCliFailure(['validate-all', 'a.json', 'b.json']);
  assert.match(extra, /Usage:|extra|unexpected|positional|exactly one/i);

  const unknown = await expectCliFailure(['validate-all', 'a.json', '--force']);
  assert.match(unknown, /Unknown|Usage:|unexpected|--force/i);

  const modulesRoot = await mkdtemp(join(tmpdir(), 'ren10-inventory-cli-'));
  roots.push(modulesRoot);
  const inventoryPath = join(modulesRoot, 'inventory.json');
  await writeFile(inventoryPath, `${JSON.stringify({
    version: 1,
    families: [{
      id: 'navbars',
      modules: [
        { id: 'navbar5', status: 'in_progress', packet: 'navbar5' },
        { id: 'navbar6', status: 'in_progress', packet: 'navbar6' },
      ],
    }],
  }, null, 2)}\n`);
  // modules/ sibling expected by CLI
  await mkdir(join(modulesRoot, 'modules'));
  // place inventory at parent of modules: rewrite layout
  const root = await mkdtemp(join(tmpdir(), 'ren10-inventory-cli-root-'));
  roots.push(root);
  await mkdir(join(root, 'modules'));
  const inv = join(root, 'inventory.json');
  await writeFile(inv, `${JSON.stringify({
    version: 1,
    families: [{
      id: 'navbars',
      modules: [
        { id: 'navbar5', status: 'in_progress', packet: 'navbar5' },
        { id: 'navbar6', status: 'in_progress', packet: 'navbar6' },
      ],
    }],
  }, null, 2)}\n`);
  const failed = await expectCliFailure(['validate-all', inv]);
  assert.match(failed, /only one in_progress module/i);
});

test('validate-all CLI accepts committed navbar5 inventory', async () => {
  const inv = join(process.cwd(), 'docs/workflows/relume-to-ren10/inventory.json');
  const { stdout } = await runCli(['validate-all', inv]);
  assert.match(stdout, /Valid inventory/i);
});
