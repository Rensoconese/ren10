import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  CANONICAL_TAB_SELECTOR,
  LEGACY_TAB_SELECTOR,
  inspectProvenance,
  parseVersionMarker,
  scanSelectors,
} from './check-agent-provenance.mjs';

const repoRoot = path.resolve(import.meta.dirname, '..');

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function makeTempDir(prefix = 'ren10-provenance-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function writePackage(root, { version = '9.9.9', foundationOnly = false } = {}) {
  write(path.join(root, 'package.json'), `${JSON.stringify({ name: 'ren10', version }, null, 2)}\n`);
  write(path.join(root, 'ren-design.md'), '# ren-design\n');
  if (foundationOnly) {
    write(path.join(root, 'VERSION.md'), `ren10 ${version}\nscope: foundation-only\n`);
    return;
  }
  write(path.join(root, 'tokens/tokens.md'), '# tokens\n');
  write(path.join(root, 'base/layouts.md'), '# layouts\n');
  write(path.join(root, 'base/layouts.css'), '.ren-stack {}');
  write(path.join(root, 'components/primitives/ren-card/ren-card.css'), '.ren-card {}');
  write(path.join(root, 'components/components.md'), '# components\n');
  write(
    path.join(root, 'components/composites/ren-tabs/component.md'),
    '# ren-tabs Component Contract\n\nCanonical markup uses `.ren-tab-list` for the tab row.\n',
  );
}

function writeProject(root, { version = '0.13.0' } = {}) {
  write(path.join(root, 'package.json'), `${JSON.stringify({ name: 'consumer-app', dependencies: { ren10: version } }, null, 2)}\n`);
  writePackage(path.join(root, 'node_modules', 'ren10'), { version });
}

/**
 * A vendored foundation copy: the foundation entrypoint plus a VERSION.md
 * marker, and deliberately no package.json. This mirrors a consumer that
 * copied the foundation layer instead of installing the npm package.
 */
function writeVendoredFoundation(root, { version = '0.13.0', markerText } = {}) {
  write(path.join(root, 'foundation.css'), "/* RenDS — Foundation only */\n@import './tokens/index.css';\n");
  write(path.join(root, 'ren-design.md'), '# ren-design\n');
  write(path.join(root, 'tokens/tokens.md'), '# tokens\n');
  write(path.join(root, 'tokens/index.css'), ':root {}\n');
  write(path.join(root, 'base/layouts.md'), '# layouts\n');
  write(path.join(root, 'base/layouts.css'), '.ren-stack {}');
  write(
    path.join(root, 'VERSION.md'),
    markerText ?? `ren10 ${version}\nfoundation layer vendored by the host project\n`,
  );
}

test('inspects an installed package: version, real path, hashes, and skill', () => {
  const root = makeTempDir();
  try {
    writeProject(root, { version: '0.13.0' });
    write(path.join(root, 'skills/rends/SKILL.md'), '# Skill\n\nRead the installed contract first.\n');

    const report = inspectProvenance(root);
    assert.equal(report.ok, true);
    assert.equal(report.kind, 'project');
    assert.equal(report.installedVersion, '0.13.0');
    assert.equal(report.realPath, fs.realpathSync(path.join(root, 'node_modules', 'ren10')));
    assert.equal(report.skill.dir, path.join(root, 'skills', 'rends'));

    const design = report.contracts.find((contract) => contract.path === 'ren-design.md');
    assert.equal(design.exists, true);
    assert.match(design.hash, /^sha256:[0-9a-f]{64}$/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('identifies a foundation-only vendored copy without package.json', () => {
  const root = makeTempDir();
  try {
    writeVendoredFoundation(root, { version: '0.13.0' });

    const report = inspectProvenance(root);
    assert.equal(report.ok, true);
    assert.equal(report.kind, 'foundation-only');
    assert.equal(report.packageSource, 'vendored');
    assert.equal(report.installedVersion, '0.13.0');
    assert.equal(report.versionMarker.foundationOnly, true);
    assert.equal(report.realPath, fs.realpathSync(root));
    // Composite contracts are intentionally absent; that must not be an error.
    assert.equal(report.contracts.find((contract) => contract.path === 'components/components.md').exists, false);
    assert.equal(report.diagnostics.length, 0);
    assert.ok(report.warnings.some((line) => line.includes('Foundation-only')));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('recognizes a vendored foundation copy with descriptive VERSION.md wording', () => {
  const root = makeTempDir();
  try {
    writeVendoredFoundation(root, {
      markerText: 'Venus vendors the RenDS foundation here.\nVersion: 0.13.0\n',
    });

    const report = inspectProvenance(root);
    assert.equal(report.kind, 'foundation-only');
    assert.equal(report.installedVersion, '0.13.0');
    assert.equal(report.diagnostics.length, 0);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('detects a vendored foundation copy from structure alone when VERSION.md omits the word', () => {
  const root = makeTempDir();
  try {
    writeVendoredFoundation(root, { markerText: 'Version 0.13.0\nGenerated by the build.\n' });

    const report = inspectProvenance(root);
    assert.equal(report.kind, 'foundation-only');
    assert.equal(report.packageSource, 'vendored');
    assert.equal(report.installedVersion, '0.13.0');
    assert.equal(report.diagnostics.length, 0);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('finds a vendored foundation copy inside a project and scans its skill', () => {
  const root = makeTempDir();
  try {
    write(path.join(root, 'package.json'), `${JSON.stringify({ name: 'venus', version: '1.0.0' }, null, 2)}\n`);
    writeVendoredFoundation(path.join(root, 'vendor', 'ren10'));
    write(
      path.join(root, 'skills', 'rends', 'SKILL.md'),
      `# Skill\n\nUse \`${CANONICAL_TAB_SELECTOR}\`; never \`${LEGACY_TAB_SELECTOR}\`.\n`,
    );

    const report = inspectProvenance(root);
    assert.equal(report.ok, true);
    assert.equal(report.kind, 'foundation-only');
    assert.equal(report.realPath, fs.realpathSync(path.join(root, 'vendor', 'ren10')));
    assert.equal(report.skill.findings[0].severity, 'warning');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('flags a stale skill even when the installed copy is a vendored foundation', () => {
  const root = makeTempDir();
  try {
    write(path.join(root, 'package.json'), `${JSON.stringify({ name: 'venus', version: '1.0.0' }, null, 2)}\n`);
    writeVendoredFoundation(path.join(root, 'vendor', 'ren10'));
    write(path.join(root, 'skills/rends/SKILL.md'), '# Skill\n\nUse `.ren-tabs-list` for tabs.\n');

    const report = inspectProvenance(root);
    assert.equal(report.ok, false);
    assert.equal(report.kind, 'foundation-only');
    assert.equal(report.skill.findings[0].severity, 'error');
    assert.ok(report.diagnostics.some((line) => line.includes(LEGACY_TAB_SELECTOR)));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('reports an actionable version diagnostic for a vendored copy without a version', () => {
  const root = makeTempDir();
  try {
    writeVendoredFoundation(root, { markerText: 'RenDS foundation vendored copy.\n' });

    const report = inspectProvenance(root);
    assert.equal(report.kind, 'foundation-only');
    assert.equal(report.installedVersion, null);
    assert.ok(report.diagnostics.some((line) => line.includes('no readable version')));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('flags a stale skill that teaches the legacy tab selector', () => {
  const root = makeTempDir();
  try {
    writeProject(root);
    write(
      path.join(root, 'skills/rends/SKILL.md'),
      '# Skill\n\n- Use `.ren-tabs-list` for the tab row.\n',
    );

    const report = inspectProvenance(root);
    assert.equal(report.ok, false);
    assert.equal(report.skill.findings.length, 1);
    assert.equal(report.skill.findings[0].severity, 'error');
    assert.ok(report.diagnostics.some((line) => line.includes(LEGACY_TAB_SELECTOR) && line.includes(CANONICAL_TAB_SELECTOR)));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('accepts a current skill that only mentions the legacy selector as a warning', () => {
  const root = makeTempDir();
  try {
    writeProject(root);
    write(
      path.join(root, 'skills/rends/SKILL.md'),
      `# Skill\n\nUse \`${CANONICAL_TAB_SELECTOR}\`; never \`${LEGACY_TAB_SELECTOR}\`.\n`,
    );

    const report = inspectProvenance(root);
    assert.equal(report.ok, true);
    assert.equal(report.skill.findings.length, 1);
    assert.equal(report.skill.findings[0].severity, 'warning');
    assert.equal(report.diagnostics.length, 0);
    assert.ok(report.warnings.some((line) => line.includes('warning')));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('scanSelectors treats deprecation prose as a warning and code as an error', () => {
  const findings = scanSelectors([
    'The legacy `.ren-tabs-list` was renamed; use `.ren-tab-list`.',
    '.ren-tabs-list {',
    'Deprecated: `.ren-tabs-list` must not be used.',
  ].join('\n'));
  assert.deepEqual(findings.map((finding) => finding.severity), ['warning', 'error', 'warning']);
});

test('distinguishes a foundation-only vendored copy via VERSION.md', () => {
  const root = makeTempDir();
  try {
    writePackage(root, { version: '0.13.0', foundationOnly: true });

    const report = inspectProvenance(root);
    assert.equal(report.kind, 'foundation-only');
    assert.equal(report.installedVersion, '0.13.0');
    assert.equal(report.versionMarker.foundationOnly, true);
    assert.equal(report.diagnostics.length, 0);
    assert.ok(report.warnings.some((line) => line.includes('Foundation-only')));
    assert.equal(report.contracts.find((contract) => contract.path === 'tokens/tokens.md').exists, false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('flags an installed contract that still contains the legacy selector', () => {
  const root = makeTempDir();
  try {
    writePackage(root, { version: '0.13.0' });
    write(
      path.join(root, 'components/composites/ren-tabs/component.md'),
      '# ren-tabs Component Contract\n\n.ren-tabs-list {\n',
    );

    const report = inspectProvenance(root);
    assert.equal(report.ok, false);
    assert.ok(report.diagnostics.some((line) => line.includes('tabs contract')));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('returns an actionable diagnostic for a missing target', () => {
  const report = inspectProvenance(path.join(os.tmpdir(), 'ren10-does-not-exist-9f3a'));
  assert.equal(report.ok, false);
  assert.equal(report.kind, 'missing');
  assert.match(report.diagnostics[0], /not found/i);
});

test('resolves relative paths and paths containing spaces', () => {
  const root = makeTempDir('ren10 provenance space.');
  try {
    writeProject(root);
    const relative = path.relative(process.cwd(), root);
    assert.ok(relative.length > 0);

    const report = inspectProvenance(relative);
    assert.equal(report.ok, true);
    assert.equal(report.target, path.resolve(relative));
    assert.equal(report.installedVersion, '0.13.0');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('parseVersionMarker tolerates descriptive VERSION.md content', () => {
  assert.deepEqual(parseVersionMarker('ren10 v0.13.0 — foundation-only vendored copy'), {
    version: '0.13.0',
    commit: null,
    foundationOnly: true,
  });
  assert.deepEqual(parseVersionMarker('full package 0.12.1'), {
    version: '0.12.1',
    commit: null,
    foundationOnly: false,
  });
});

test('CLI emits parseable JSON for a stale skill', () => {
  const root = makeTempDir();
  try {
    writeProject(root);
    write(path.join(root, 'skills/rends/SKILL.md'), '# Skill\n\nUse `.ren-tabs-list`.\n');

    let output;
    let exitCode = 0;
    try {
      output = execFileSync(
        process.execPath,
        [path.join(repoRoot, 'scripts/check-agent-provenance.mjs'), '--json', root],
        { encoding: 'utf8' },
      );
    } catch (error) {
      exitCode = error.status;
      output = error.stdout;
    }
    assert.equal(exitCode, 1);
    const parsed = JSON.parse(output);
    assert.equal(parsed.checker, 'ren10-agent-provenance');
    assert.equal(parsed.ok, false);
    assert.equal(parsed.targets[0].skill.findings[0].severity, 'error');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('identifies the real foundation vendor shape by commit without inventing a version', () => {
  const root = makeTempDir();
  try {
    write(path.join(root, 'VERSION.md'), '# Vendored Ren10 foundation\n- Commit: `82f1d311dca809d739acf9111a7995e49e706ce2`\n- Vendored scope: `foundation.css`, `tokens/`, `base/`, and `LICENSE`\n');
    write(path.join(root, 'foundation.css'), '@import "base/index.css";');
    const report = inspectProvenance(root);
    assert.equal(report.ok, true);
    assert.equal(report.kind, 'foundation-only');
    assert.equal(report.installedVersion, null);
    assert.equal(report.versionMarker.commit, '82f1d311dca809d739acf9111a7995e49e706ce2');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('recognizes stale HTML classes as well as dotted selector prose', () => {
  const findings = scanSelectors('<button class="ren-tabs-trigger ren-tab">Text</button>\n<div class="ren-tabs-content">Content</div>');
  assert.equal(findings.length, 2);
  assert.ok(findings.every((finding) => finding.severity === 'error'));
});

test('CLI can inspect a separately installed skill against a project', () => {
  const root = makeTempDir();
  try {
    writeProject(path.join(root, 'project'));
    write(path.join(root, 'external skill/SKILL.md'), 'Read the installed contract.');
    const stdout = execFileSync(process.execPath, [path.join(repoRoot, 'scripts/check-agent-provenance.mjs'), '--json', '--skill', path.join(root, 'external skill/SKILL.md'), path.join(root, 'project')], { encoding: 'utf8' });
    const report = JSON.parse(stdout);
    assert.equal(report.ok, true);
    assert.equal(report.targets[0].skill.dir, path.join(root, 'external skill'));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('unrelated negation does not bless an instruction to use a stale selector', () => {
  const findings = scanSelectors('If it is not a link, use .ren-tabs-list\nUse the legacy .ren-tabs-trigger instead of a link');
  assert.ok(findings.every((finding) => finding.severity === 'error'));
});

test('mentioning foundation does not exempt a broken full package from contract checks', () => {
  const root = makeTempDir();
  try {
    writePackage(root);
    write(path.join(root, 'VERSION.md'), 'ren10 9.9.9 full package includes foundation and components');
    fs.rmSync(path.join(root, 'components/components.md'));
    const report = inspectProvenance(root);
    assert.equal(report.ok, false);
    assert.equal(report.kind, 'package');
    assert.ok(report.diagnostics.some((line) => line.includes('components/components.md')));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('does not accept an unrelated vendor marker or mislabel an empty directory as a skill', () => {
  const root = makeTempDir();
  try {
    write(path.join(root, 'vendor/VERSION.md'), 'Foundation 3.1.0 vendored package');
    write(path.join(root, 'vendor/foundation.css'), ':root {}');
    const report = inspectProvenance(root);
    assert.equal(report.ok, false);
    assert.equal(report.kind, 'unresolved');
    assert.equal(report.realPath, null);
    const vendor = inspectProvenance(path.join(root, 'vendor'));
    assert.equal(vendor.ok, false);
    assert.equal(vendor.realPath, null);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});


test('CLI executes through a symlinked package script', () => {
  const root = makeTempDir();
  try {
    writeProject(path.join(root, 'project'));
    const linkedScript = path.join(root, 'linked-checker.mjs');
    fs.symlinkSync(path.join(repoRoot, 'scripts/check-agent-provenance.mjs'), linkedScript);
    const stdout = execFileSync(process.execPath, [linkedScript, '--json', path.join(root, 'project')], { encoding: 'utf8' });
    const report = JSON.parse(stdout);
    assert.equal(report.checker, 'ren10-agent-provenance');
    assert.equal(report.ok, true);
    assert.equal(report.targets.length, 1);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
