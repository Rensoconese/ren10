import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { afterEach, test } from 'node:test';
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import {
  STAGES,
  advancePacket,
  assertCleanAllowedFiles,
  nextStage,
  scaffoldPacket,
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
