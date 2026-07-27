import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  addIgnoreFile,
  addIgnoreRule,
  addIgnoreValue,
  defaultConfig,
  loadConfig,
  writeConfig,
} from '../../cli/detector/config.js';

test('loadConfig returns stable defaults when no project config exists', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'ren10-config-'));
  try {
    assert.deepEqual(await loadConfig(cwd), defaultConfig());
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('config helpers persist narrow, canonical, auditable exceptions', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'ren10-config-'));
  try {
    let config = defaultConfig();
    config = addIgnoreRule(config, 'heading-order', 'Legacy imported article');
    config = addIgnoreFile(config, 'fixtures/**', 'Generated fixtures');
    config = addIgnoreValue(config, {
      rule: 'hardcoded-color',
      value: '#FF0000',
      files: ['templates/b.html', 'templates/a.html'],
      reason: 'Approved external brand color',
      now: new Date('2026-07-20T12:00:00.000Z'),
    });
    const configPath = await writeConfig(cwd, config);
    const saved = JSON.parse(await readFile(configPath, 'utf8'));

    assert.equal(saved.detector.ignoreRules[0].rule, 'heading-order');
    assert.equal(saved.detector.ignoreFiles[0].pattern, 'fixtures/**');
    assert.equal(saved.detector.ignoreValues[0].value, '#ff0000');
    assert.deepEqual(saved.detector.ignoreValues[0].files, ['templates/a.html', 'templates/b.html']);
    assert.equal(saved.detector.ignoreValues[0].reason, 'Approved external brand color');
    assert.deepEqual(await loadConfig(cwd), saved);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('a wildcard value must carry at least one file scope', () => {
  assert.throws(() => addIgnoreValue(defaultConfig(), {
    rule: 'off-scale-font-size',
    value: '*',
    files: [],
    reason: 'Too broad',
  }), /file scope/i);
});
