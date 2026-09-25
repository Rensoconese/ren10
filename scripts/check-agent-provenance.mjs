#!/usr/bin/env node
/**
 * Read-only Ren10 agent provenance checker.
 *
 * Given project, package, or skill paths, reports which installed `ren10`
 * version an agent would actually read, the resolved real path (symlinks
 * included), hashes for a selected set of public contracts, and whether the
 * supplied skill still teaches selectors that no longer exist in the
 * installed contract (for example the legacy `.ren-tabs-list`).
 *
 * A vendored foundation-only copy can be recognized from its `VERSION.md`
 * marker even when it has no `package.json`.
 *
 * The checker never writes to disk, never touches global skill directories,
 * and never reads credentials or environment variables.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const LEGACY_TAB_SELECTOR = '.ren-tabs-list';
export const CANONICAL_TAB_SELECTOR = '.ren-tab-list';
export const VERSION_MARKER = 'VERSION.md';

/** Public contracts that identify the installed API surface. */
export const SELECTED_CONTRACTS = [
  'ren-design.md',
  'tokens/tokens.md',
  'base/layouts.md',
  'components/components.md',
  'components/composites/ren-tabs/component.md',
  'base/layouts.css',
  'components/primitives/ren-card/ren-card.css',
];

const TABS_CONTRACT = 'components/composites/ren-tabs/component.md';
const LEGACY_SELECTOR_PATTERN = String.raw`\.?ren-tabs-(?:list|trigger|content|panel)\b`;
const EXPLICIT_DEPRECATION = [
  new RegExp(String.raw`\b(?:never|avoid|don't|do not|must not)\s+(?:(?:use|copy|teach|write)\s+)?${LEGACY_SELECTOR_PATTERN}`, 'i'),
  new RegExp(String.raw`${LEGACY_SELECTOR_PATTERN}\s+(?:(?:is|was|has been)\s+)?(?:renamed|deprecated|removed|invalid|incorrect|not valid|not supported|must not be used)\b`, 'i'),
  new RegExp(String.raw`\b(?:deprecated|invalid|incorrect|removed)\s*(?:selector)?\s*:\s*${LEGACY_SELECTOR_PATTERN}`, 'i'),
];

function readJsonFile(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function hashFile(file) {
  return `sha256:${createHash('sha256').update(readFileSync(file)).digest('hex')}`;
}

function resolveInput(target) {
  const absolute = path.resolve(target);
  if (!existsSync(absolute)) return { absolute, exists: false, isDirectory: false, isFile: false };
  const stats = statSync(absolute);
  return {
    absolute,
    exists: true,
    isDirectory: stats.isDirectory(),
    isFile: stats.isFile(),
  };
}

/**
 * Walk up from `startDir` looking for an installed `ren10` package, either as
 * the directory holding package.json itself or inside a `node_modules/ren10`.
 */
function resolvePackageRoot(startDir) {
  let current = startDir;
  for (;;) {
    const ownPackage = readJsonFile(path.join(current, 'package.json'));
    if (ownPackage?.name === 'ren10') {
      return { root: current, source: 'package-directory' };
    }
    const nested = path.join(current, 'node_modules', 'ren10');
    if (readJsonFile(path.join(nested, 'package.json'))?.name === 'ren10') {
      return { root: nested, source: 'node_modules' };
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

/**
 * Conventional locations a project may vendor a foundation-only copy into when
 * it is not installed through `node_modules/ren10`.
 */
const VENDORED_SUBDIRS = [
  'ren10',
  'vendor/ren10',
  'src/vendor/ren10',
  'src/styles/ren10',
  'assets/ren10',
  'public/ren10',
];

/** Structural evidence that a directory is a copy of the ren10 package. */
function looksLikeRen10Copy(dir) {
  return [
    'foundation.css',
    'ren-design.md',
    'tokens/tokens.md',
    'tokens/index.css',
    'base/index.css',
    'base/layouts.md',
  ].some((marker) => existsSync(path.join(dir, marker)));
}

/** A VERSION.md only counts as a ren10 marker if it or its directory says so. */
function isRen10Marker(dir, text) {
  if (!looksLikeRen10Copy(dir)) return false;
  if (/\b(?:ren10|rends)\b/i.test(String(text))) return true;
  const foundation = path.join(dir, 'foundation.css');
  return existsSync(foundation)
    && existsSync(path.join(dir, 'tokens/index.css'))
    && /\b(?:ren10|rends)\b/i.test(readFileSync(foundation, 'utf8'));
}

/**
 * Resolve a vendored, foundation-only copy that has no package.json. The copy
 * is identified by a VERSION.md marker either at the given path, in a
 * conventional vendor subdirectory, or in a parent directory (which covers a
 * skill that lives inside the vendored copy).
 */
function resolveVendoredRoot(startDir) {
  const direct = [startDir, ...VENDORED_SUBDIRS.map((sub) => path.join(startDir, sub))];
  for (const candidate of direct) {
    const marker = path.join(candidate, VERSION_MARKER);
    if (existsSync(marker) && isRen10Marker(candidate, readFileSync(marker, 'utf8'))) {
      return { root: candidate, source: 'vendored' };
    }
  }

  let current = path.dirname(startDir);
  for (;;) {
    const marker = path.join(current, VERSION_MARKER);
    if (existsSync(marker) && isRen10Marker(current, readFileSync(marker, 'utf8'))) {
      return { root: current, source: 'vendored' };
    }
    const parent = path.dirname(current);
    if (parent === current) return null;
    current = parent;
  }
}

function resolveSkillDir(input, packageRoot) {
  const base = input.isFile ? path.dirname(input.absolute) : input.absolute;
  const candidates = [
    base,
    path.join(base, 'skills', 'rends'),
    packageRoot ? path.join(packageRoot.root, 'skills', 'rends') : null,
  ].filter(Boolean);

  if (input.isFile && path.basename(input.absolute).toLowerCase() === 'skill.md') {
    return base;
  }
  for (const candidate of candidates) {
    if (existsSync(path.join(candidate, 'SKILL.md'))) return candidate;
  }
  return null;
}

/**
 * VERSION.md is the convention for a vendored, foundation-only copy. Such a
 * copy intentionally ships a subset of the package, so missing composite
 * contracts are expected rather than an error.
 */
export function parseVersionMarker(text) {
  const value = String(text);
  const versionMatch = value.match(/(\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)/);
  const foundationOnly = !/\b(?:full package|scope\s*[:=]\s*full)\b/i.test(value) && (
    /\bfoundation[\s-]*only\b/i.test(value)
    || /\bscope\s*[:=]\s*foundation\b/i.test(value)
    || /\b(?:vendors?|vendored)\s+(?:the\s+)?(?:ren10\s+|rends\s+)?foundation\b/i.test(value)
    || /\bfoundation(?: layer)?\s+vendored\b/i.test(value)
  );
  return {
    version: versionMatch ? versionMatch[1] : null,
    commit: value.match(/\b[0-9a-f]{40}\b/i)?.[0] ?? null,
    foundationOnly,
  };
}

function classifyLegacyLine(line) {
  const prose = line.replace(/[`"]/g, '').replace(/'(\.?ren-tabs-\w+)'/g, '$1');
  if (EXPLICIT_DEPRECATION.some((pattern) => pattern.test(prose))) return 'warning';
  return 'error';
}

/**
 * Scan a text body for the legacy tab selector. Mentions wrapped in warnings,
 * deprecation notes, or shown next to the canonical selector are reported as
 * warnings so a teaching note is not mistaken for real stale guidance.
 */
export function scanSelectors(text, file = '<memory>') {
  const findings = [];
  const lines = String(text).split(/\r?\n/);
  lines.forEach((line, index) => {
    if (!/\bren-tabs-(list|trigger|content|panel)\b/.test(line)) return;
    findings.push({
      file,
      line: index + 1,
      text: line.trim(),
      severity: classifyLegacyLine(line),
    });
  });
  return findings;
}

/** Read and scan the markdown files that make up a supplied skill. */
export function scanSkill(skillDir) {
  if (!skillDir) {
    return {
      skillDir: null,
      files: [],
      findings: [],
      errors: [],
      warnings: [],
      notice: 'No SKILL.md found for this target; skipped legacy selector scan.',
    };
  }
  const files = ['SKILL.md', 'README.md']
    .map((name) => path.join(skillDir, name))
    .filter((file) => existsSync(file));
  const findings = [];
  for (const file of files) {
    for (const finding of scanSelectors(readFileSync(file, 'utf8'), file)) {
      findings.push(finding);
    }
  }
  return {
    skillDir,
    files,
    findings,
    errors: findings.filter((finding) => finding.severity === 'error'),
    warnings: findings.filter((finding) => finding.severity === 'warning'),
    notice: null,
  };
}

function inspectTabsContract(root) {
  if (!root) return null;
  const file = path.join(root, TABS_CONTRACT);
  if (!existsSync(file)) return null;
  const text = readFileSync(file, 'utf8');
  const findings = scanSelectors(text, file);
  return {
    file,
    hash: hashFile(file),
    hasCanonicalSelector: text.includes(CANONICAL_TAB_SELECTOR),
    legacyFindings: findings,
    errors: findings.filter((finding) => finding.severity === 'error'),
  };
}

function collectContracts(root) {
  if (!root) return [];
  return SELECTED_CONTRACTS.map((relative) => {
    const file = path.join(root, relative);
    const exists = existsSync(file);
    return {
      path: relative,
      file,
      exists,
      hash: exists ? hashFile(file) : null,
    };
  });
}

/**
 * Inspect one path. Returns a report instead of throwing so callers can print
 * actionable diagnostics for missing or unrelated paths.
 */
export function inspectProvenance(target, options = {}) {
  const input = options.input ?? resolveInput(target);
  const diagnostics = [];
  const warnings = [];

  if (!input.exists) {
    return {
      target: input.absolute,
      kind: 'missing',
      ok: false,
      installedVersion: null,
      realPath: null,
      packageSource: null,
      versionMarker: null,
      contracts: [],
      skill: null,
      diagnostics: [
        `Target not found: ${input.absolute}. Pass an existing project directory, ren10 package directory, or skills/rends path.`,
      ],
      warnings,
    };
  }

  const searchDir = input.isFile ? path.dirname(input.absolute) : input.absolute;
  const packageRoot = resolvePackageRoot(searchDir);
  const vendored = packageRoot ? null : resolveVendoredRoot(searchDir);
  const resolvedRoot = packageRoot?.root ?? vendored?.root ?? null;

  if (!resolvedRoot) {
    diagnostics.push(
      `No installed ren10 package resolved from ${input.absolute}. Run "npm install ren10", or pass the ren10 package directory, a vendored foundation copy with ${VERSION_MARKER}, or a skills/rends path explicitly.`,
    );
  }

  let installedVersion = null;
  let realPath = null;
  let versionMarker = null;
  if (resolvedRoot) {
    const packageJson = readJsonFile(path.join(resolvedRoot, 'package.json'));
    installedVersion = typeof packageJson?.version === 'string' ? packageJson.version : null;
    try {
      realPath = realpathSync(resolvedRoot);
    } catch {
      realPath = resolvedRoot;
    }

    const markerFile = path.join(resolvedRoot, VERSION_MARKER);
    if (existsSync(markerFile)) {
      versionMarker = { file: markerFile, ...parseVersionMarker(readFileSync(markerFile, 'utf8')) };
      if (versionMarker.version && installedVersion && versionMarker.version !== installedVersion) {
        warnings.push(
          `VERSION.md (${versionMarker.version}) does not match package.json (${installedVersion}).`,
        );
      }
    }
    if (!installedVersion) installedVersion = versionMarker?.version ?? null;
    if (!installedVersion && !versionMarker?.commit) {
      diagnostics.push(
        `Resolved copy at ${resolvedRoot} has no readable version. Add "version" to package.json or a version such as "ren10 0.13.0" to ${VERSION_MARKER}.`,
      );
    }
  }

  const foundationOnly = versionMarker?.foundationOnly === true
    || (Boolean(vendored) && existsSync(path.join(resolvedRoot, 'foundation.css'))
      && !existsSync(path.join(resolvedRoot, 'components/components.md')));
  const contracts = collectContracts(resolvedRoot);
  const tabsContract = inspectTabsContract(resolvedRoot);

  if (resolvedRoot && !foundationOnly) {
    for (const contract of contracts) {
      if (!contract.exists) {
        diagnostics.push(`Installed package is missing public contract ${contract.path}.`);
      }
    }
  }
  if (tabsContract?.errors.length) {
    diagnostics.push(
      `Installed tabs contract ${path.relative(resolvedRoot, tabsContract.file)} contains a legacy selector. The package copy is stale or corrupted.`,
    );
  }

  const skillDir = options.skillDir ?? resolveSkillDir(input, resolvedRoot ? { root: resolvedRoot } : null);
  const skill = scanSkill(skillDir);
  for (const finding of skill.errors) {
    diagnostics.push(
      `Legacy tab selector in ${finding.file}:${finding.line}: ${finding.text}. The installed contract uses ${CANONICAL_TAB_SELECTOR}, .ren-tab and .ren-tab-panel. Update the skill to route to the installed contract or CLI.`,
    );
  }
  for (const finding of skill.warnings) {
    warnings.push(
      `Legacy selector mentioned as a warning in ${finding.file}:${finding.line}: ${finding.text}`,
    );
  }
  if (skill.notice) warnings.push(skill.notice);
  if (foundationOnly) {
    warnings.push(
      'Foundation-only vendored copy detected via VERSION.md; full composite contract checks are skipped.',
    );
  }

  let kind = 'project';
  if (foundationOnly) kind = 'foundation-only';
  else if (packageRoot?.source === 'package-directory') kind = 'package';
  else if (!resolvedRoot) kind = skillDir ? 'skill' : 'unresolved';

  return {
    target: input.absolute,
    kind,
    ok: diagnostics.length === 0,
    installedVersion,
    realPath,
    packageSource: packageRoot?.source ?? (vendored ? 'vendored' : null),
    versionMarker,
    contracts,
    tabsContract,
    skill: {
      dir: skill.skillDir,
      files: skill.files,
      findings: skill.findings,
    },
    diagnostics,
    warnings,
  };
}

export function inspectMany(targets, options = {}) {
  return targets.map((target) => inspectProvenance(target, options));
}

function formatReport(report) {
  const lines = [];
  lines.push(`Target: ${report.target} [${report.kind}]`);
  if (report.installedVersion) lines.push(`  installed ren10: ${report.installedVersion}`);
  if (report.realPath) lines.push(`  resolved path:   ${report.realPath}`);
  if (report.packageSource) lines.push(`  package source:  ${report.packageSource}`);
  if (report.versionMarker) {
    lines.push(`  VERSION.md:      ${report.versionMarker.version ?? 'unknown version'}${report.versionMarker.foundationOnly ? ' (foundation-only)' : ''}`);
    if (report.versionMarker.commit) lines.push(`  source commit:   ${report.versionMarker.commit}`);
  }
  if (report.contracts.length) {
    lines.push('  selected contracts:');
    for (const contract of report.contracts) {
      lines.push(`    ${contract.exists ? contract.hash : 'missing'}  ${contract.path}`);
    }
  }
  if (report.skill?.dir) lines.push(`  skill:           ${report.skill.dir}`);
  for (const warning of report.warnings) lines.push(`  warning: ${warning}`);
  for (const diagnostic of report.diagnostics) lines.push(`  error:   ${diagnostic}`);
  return lines.join('\n');
}

export function runCli(argv = process.argv.slice(2)) {
  const targets = [];
  let json = false;
  let help = false;
  let skillDir;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') json = true;
    else if (arg === '--skill') {
      const target = argv[++i];
      if (!target || target.startsWith('--') || !existsSync(target)) {
        console.error('--skill requires an existing skill directory or SKILL.md file.');
        return 2;
      }
      skillDir = statSync(target).isFile() ? path.dirname(path.resolve(target)) : path.resolve(target);
      if (!existsSync(path.join(skillDir, 'SKILL.md'))) {
        console.error('--skill directory must contain SKILL.md.');
        return 2;
      }
    }
    else if (arg === '--help' || arg === '-h') help = true;
    else if (arg.startsWith('--')) {
      console.error(`Unknown option: ${arg}. Use --json or --help.`);
      return 2;
    } else {
      targets.push(arg);
    }
  }

  if (help) {
    console.log([
      'Usage: node scripts/check-agent-provenance.mjs [options] [path ...]',
      '',
      'Read-only provenance report for installed ren10 packages and agent skills.',
      'Paths may be project directories, package directories, skills/rends, or SKILL.md files.',
      '',
      'Options:',
      '  --json    Emit machine-readable JSON.',
      '  --skill PATH  Inspect an external skill against the supplied package/project.',
      '  --help    Show this message.',
    ].join('\n'));
    return 0;
  }

  const effectiveTargets = targets.length ? targets : [process.cwd()];
  const reports = inspectMany(effectiveTargets, { skillDir });
  const ok = reports.every((report) => report.ok);

  if (json) {
    console.log(JSON.stringify({ checker: 'ren10-agent-provenance', version: 1, ok, targets: reports }, null, 2));
  } else {
    console.log(`Ren10 agent provenance: ${reports.length} target(s)${ok ? '' : ' — issues found'}`);
    for (const report of reports) {
      console.log(formatReport(report));
      console.log('');
    }
  }
  return ok ? 0 : 1;
}

const isDirectRun = process.argv[1]
  && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url;

if (isDirectRun) {
  process.exitCode = runCli();
}

export { formatReport };
