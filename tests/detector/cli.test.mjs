import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const cli = path.join(root, 'cli', 'index.js');
const fixtures = path.join(here, 'fixtures');

function run(args, cwd = root) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
}

test('CLI manifest advertises the detector and design-context commands', () => {
  const result = run(['manifest', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  const names = payload.data.commands.map((command) => command.name);
  assert.ok(names.includes('detect'));
  assert.ok(names.includes('design-context'));
  assert.ok(names.includes('ignores'));
  assert.ok(names.includes('hooks'));
});

test('detect emits a typed JSON report and a blocking exit code only for errors', () => {
  const bad = run(['detect', path.join(fixtures, 'bad.html'), '--profile', 'codex', '--json']);
  assert.equal(bad.status, 1);
  const badPayload = JSON.parse(bad.stdout);
  assert.equal(badPayload.type, 'detector.report');
  assert.ok(badPayload.data.summary.errors > 0);

  const good = run(['detect', path.join(fixtures, 'good.html'), '--json']);
  assert.equal(good.status, 0, good.stderr);
  const goodPayload = JSON.parse(good.stdout);
  assert.equal(goodPayload.data.summary.total, 0);
});

test('design-context writes .ren10/design.json from package contracts', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'ren10-design-'));
  try {
    const result = run(['design-context', '--write', '--json'], cwd);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    const saved = JSON.parse(await readFile(path.join(cwd, '.ren10', 'design.json'), 'utf8'));
    assert.equal(payload.type, 'design-context.write');
    assert.equal(saved.system.version, '0.11.0');
    assert.equal(saved.components.counts.total, 53);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('ignores command validates and persists a file-scoped value exception', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'ren10-ignores-'));
  try {
    const result = run([
      'ignores', 'add-value', 'hardcoded-color', '#FF0000',
      '--file', 'templates/a.html', '--reason', 'Approved brand export', '--json',
    ], cwd);
    assert.equal(result.status, 0, result.stderr);
    const payload = JSON.parse(result.stdout);
    const config = JSON.parse(await readFile(path.join(cwd, '.ren10', 'config.json'), 'utf8'));
    assert.equal(payload.type, 'detector.ignores');
    assert.equal(config.detector.ignoreValues[0].value, '#ff0000');
    assert.deepEqual(config.detector.ignoreValues[0].files, ['templates/a.html']);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('hooks install writes a Codex manifest and hooks off disables runtime checks', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'ren10-hooks-'));
  try {
    const installed = run(['hooks', 'install', '--json'], cwd);
    assert.equal(installed.status, 0, installed.stderr);
    const hookManifest = JSON.parse(await readFile(path.join(cwd, '.codex', 'hooks.json'), 'utf8'));
    assert.ok(hookManifest.hooks.PostToolUse);

    const disabled = run(['hooks', 'off', '--json'], cwd);
    assert.equal(disabled.status, 0, disabled.stderr);
    const config = JSON.parse(await readFile(path.join(cwd, '.ren10', 'config.json'), 'utf8'));
    assert.equal(config.hook.enabled, false);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
