import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  PROFILES,
  RULES,
  buildDesignManifest,
  detectTargets,
  filterFindings,
  saveReview,
} from '../../cli/detector/index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(here, '../..');
const fixtures = path.join(here, 'fixtures');

test('buildDesignManifest derives machine-readable design context from canonical Ren10 sources', async () => {
  const manifest = await buildDesignManifest(packageRoot);

  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.system.name, 'Ren10');
  assert.equal(manifest.system.version, '0.11.0');
  assert.ok(manifest.sources.includes('ren-design.md'));
  assert.ok(manifest.tokens.semantic.includes('--color-accent'));
  assert.ok(manifest.tokens.type.includes('--text-base'));
  assert.ok(manifest.tokens.space.includes('--space-4'));
  assert.ok(manifest.tokens.radius.includes('--radius-md'));
  assert.ok(manifest.layouts.includes('ren-grid'));
  assert.equal(manifest.components.counts.total, 53);
  assert.deepEqual(manifest.profiles, ['generic', 'codex', 'strict']);
});

test('the registry separates objective failures from profile advisories', () => {
  assert.deepEqual(Object.keys(PROFILES).sort(), ['codex', 'generic', 'strict']);
  assert.ok(RULES.length >= 12);
  assert.equal(RULES.find((rule) => rule.id === 'hardcoded-color')?.severity, 'error');
  assert.equal(RULES.find((rule) => rule.id === 'bespoke-layout')?.severity, 'warning');
  assert.equal(RULES.find((rule) => rule.id === 'decorative-grid-background')?.profile, 'codex');
});

test('detectTargets reports deterministic Ren10 violations with actionable metadata', async () => {
  const manifest = await buildDesignManifest(packageRoot);
  const result = await detectTargets([path.join(fixtures, 'bad.html')], {
    cwd: packageRoot,
    manifest,
    profile: 'codex',
  });
  const ids = new Set(result.findings.map((finding) => finding.rule));

  for (const expected of [
    'hardcoded-color',
    'primitive-color-token',
    'off-scale-font-size',
    'off-scale-radius',
    'tight-leading',
    'heading-order',
    'broken-image',
    'button-type',
    'bespoke-layout',
    'clipped-overlay-risk',
  ]) {
    assert.ok(ids.has(expected), `missing ${expected}`);
  }
  assert.ok(result.findings.every((finding) => finding.file && finding.line > 0));
  assert.ok(result.findings.every((finding) => finding.message && finding.suggestion));
  assert.ok(result.summary.errors > 0);
  assert.ok(result.summary.warnings > 0);
  assert.equal(result.exitCode, 1);
});

test('generic profile leaves provider-specific aesthetics disabled and clean markup passes', async () => {
  const manifest = await buildDesignManifest(packageRoot);
  const result = await detectTargets([path.join(fixtures, 'good.html')], {
    cwd: packageRoot,
    manifest,
    profile: 'generic',
  });

  assert.deepEqual(result.findings, []);
  assert.equal(result.exitCode, 0);
  assert.equal(result.summary.errors, 0);
});

test('filterFindings applies narrow rule, value, and file exceptions without mutating input', () => {
  const findings = [
    { rule: 'heading-order', value: 'h1>h3', file: 'templates/a.html', severity: 'error' },
    { rule: 'hardcoded-color', value: '#ff0000', file: 'templates/a.html', severity: 'error' },
    { rule: 'hardcoded-color', value: '#00ff00', file: 'templates/b.html', severity: 'error' },
  ];
  const config = {
    detector: {
      ignoreRules: ['heading-order'],
      ignoreFiles: [],
      ignoreValues: [
        {
          rule: 'hardcoded-color',
          value: '#ff0000',
          files: ['templates/a.html'],
          reason: 'Approved fixture value',
        },
      ],
    },
  };

  const filtered = filterFindings(findings, config);
  assert.deepEqual(filtered.map((finding) => finding.value), ['#00ff00']);
  assert.equal(findings.length, 3);
});

test('strict profile promotes advisories to blocking findings', async () => {
  const manifest = await buildDesignManifest(packageRoot);
  const result = await detectTargets([path.join(fixtures, 'bad.html')], {
    cwd: packageRoot,
    manifest,
    profile: 'strict',
  });
  const layout = result.findings.find((finding) => finding.rule === 'bespoke-layout');

  assert.equal(layout?.severity, 'error');
  assert.equal(result.exitCode, 1);
});

test('saveReview writes a portable audit snapshot below .ren10/reviews', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'ren10-review-'));
  try {
    const result = {
      profile: 'generic',
      targets: ['templates/blocks/index.html'],
      findings: [],
      summary: { files: 1, errors: 0, warnings: 0 },
      exitCode: 0,
    };
    const reviewPath = await saveReview(result, { cwd, slug: 'Blocks Index' });
    const saved = JSON.parse(await readFile(reviewPath, 'utf8'));

    assert.match(reviewPath, /\.ren10\/reviews\/\d{4}-\d{2}-\d{2}__blocks-index\.json$/);
    assert.equal(saved.schemaVersion, 1);
    assert.equal(saved.profile, 'generic');
    assert.equal(saved.summary.files, 1);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});
