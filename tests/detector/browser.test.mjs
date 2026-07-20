import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { detectUrl } from '../../cli/detector/browser.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = pathToFileURL(path.join(here, 'fixtures', 'browser-bad.html')).href;

test('detectUrl measures rendered geometry, typography, padding, and contrast', async () => {
  const result = await detectUrl(fixture, { profile: 'generic', viewport: { width: 1000, height: 800 } });
  const ids = new Set(result.findings.map((finding) => finding.rule));

  for (const expected of ['content-overflow', 'text-viewport-edge', 'tight-leading', 'long-line', 'cramped-padding', 'low-contrast']) {
    assert.ok(ids.has(expected), `missing ${expected}`);
  }
  assert.ok(result.findings.every((finding) => finding.engine === 'browser'));
  assert.ok(result.findings.every((finding) => finding.selector));
  assert.equal(result.exitCode, 1);
});

test('codex profile adds generated-layout spacing advisories without making them blocking', async () => {
  const result = await detectUrl(fixture, { profile: 'codex', viewport: { width: 1000, height: 800 } });
  const spacing = result.findings.find((finding) => finding.rule === 'monotonous-spacing');

  assert.equal(spacing?.severity, 'warning');
  assert.ok(spacing?.selector.includes('monotonous'));
});
