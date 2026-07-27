import assert from 'node:assert/strict';
import { copyFile, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { installCodexHook, processHookEvent } from '../../cli/detector/hook.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, '../..');
const fixtures = path.join(here, 'fixtures');

test('hook reports fresh findings, tracks pending work, clears fixed work, and re-reports regressions', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'ren10-hook-'));
  const target = path.join(cwd, 'page.html');
  try {
    await copyFile(path.join(fixtures, 'bad.html'), target);
    const event = { tool_name: 'apply_patch', tool_input: { file_path: target } };

    const first = await processHookEvent(event, { cwd, packageRoot });
    assert.equal(first.status, 'findings');
    assert.ok(first.newFindings > 0);
    assert.equal(first.pendingFindings, first.findings.length);

    const repeated = await processHookEvent(event, { cwd, packageRoot });
    assert.equal(repeated.status, 'pending');
    assert.equal(repeated.newFindings, 0);
    assert.equal(repeated.pendingFindings, first.pendingFindings);

    await copyFile(path.join(fixtures, 'good.html'), target);
    const fixed = await processHookEvent(event, { cwd, packageRoot });
    assert.equal(fixed.status, 'clean');
    assert.equal(fixed.pendingFindings, 0);
    assert.ok(fixed.resolvedFindings > 0);

    await copyFile(path.join(fixtures, 'bad.html'), target);
    const regression = await processHookEvent(event, { cwd, packageRoot });
    assert.equal(regression.status, 'findings');
    assert.ok(regression.newFindings > 0);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('hook skips disabled, generated, unsupported, and oversized targets', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'ren10-hook-'));
  try {
    const large = path.join(cwd, 'large.html');
    await writeFile(large, `<main>${'x'.repeat(512)}</main>`);
    const result = await processHookEvent({ tool_input: { file_path: large } }, {
      cwd,
      packageRoot,
      config: { hook: { enabled: true, maxFileBytes: 64 }, detector: {} },
    });
    assert.equal(result.status, 'skipped');
    assert.equal(result.reason, 'max-file-bytes');
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('installCodexHook preserves existing hooks and adds one canonical Ren10 command', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'ren10-hook-install-'));
  try {
    const codexDir = path.join(cwd, '.codex');
    await writeFile(path.join(cwd, 'placeholder'), '');
    const result = await installCodexHook(cwd, {
      existing: { hooks: { SessionStart: [{ hooks: [{ type: 'command', command: 'echo existing' }] }] } },
    });
    const manifest = JSON.parse(await readFile(result.path, 'utf8'));
    assert.equal(manifest.hooks.SessionStart[0].hooks[0].command, 'echo existing');
    const commands = manifest.hooks.PostToolUse.flatMap((entry) => entry.hooks.map((hook) => hook.command));
    assert.deepEqual(commands.filter((command) => command === 'npx ren10 hook-run'), ['npx ren10 hook-run']);
    assert.equal(codexDir, path.dirname(result.path));
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
