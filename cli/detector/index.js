import {
  mkdir,
  readFile,
  readdir,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import { REGISTRY } from '../registry.js';

const COLOR_PRIMITIVES = ['blue', 'gray', 'red', 'green', 'orange', 'yellow', 'teal', 'purple', 'pink'];
const SOURCE_EXTENSIONS = new Set(['.html', '.htm', '.css', '.js', '.mjs']);
const SKIP_DIRECTORIES = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', '.ren10']);

const PROFILES = Object.freeze({
  generic: { includeProviderRules: false, promoteWarnings: false },
  codex: { includeProviderRules: true, promoteWarnings: false },
  strict: { includeProviderRules: true, promoteWarnings: true },
});

const RULES = Object.freeze([
  rule('hardcoded-color', 'error', 'tokens', 'Use a semantic --color-* or component --ren-* token.'),
  rule('primitive-color-token', 'error', 'tokens', 'Map primitive palette values through a semantic color token.'),
  rule('off-scale-font-size', 'warning', 'typography', 'Use a --text-* token from the Ren10 type scale.'),
  rule('off-scale-radius', 'warning', 'shape', 'Use a --radius-* token from the Ren10 radius scale.'),
  rule('tight-leading', 'error', 'typography', 'Use line-height of at least 1.3 for multiline text.'),
  rule('heading-order', 'error', 'semantics', 'Keep heading levels sequential.'),
  rule('broken-image', 'error', 'content', 'Use a real image source or remove the image element.'),
  rule('button-type', 'error', 'semantics', 'Declare type="button" or type="submit" explicitly.'),
  rule('clipped-overlay-risk', 'warning', 'layout', 'Move overlays outside clipping ancestors or allow visible overflow.'),
  rule('content-overflow', 'error', 'layout', 'Constrain or intentionally scroll overflowing content.', null, 'browser'),
  rule('text-viewport-edge', 'error', 'layout', 'Add a Ren10 center/container primitive with horizontal breathing room.', null, 'browser'),
  rule('cramped-padding', 'warning', 'spacing', 'Use a semantic spacing token for internal padding.', null, 'browser'),
  rule('long-line', 'warning', 'typography', 'Constrain prose with ren-center-prose or an equivalent readable measure.', null, 'browser'),
  rule('low-contrast', 'error', 'accessibility', 'Use an AA-safe semantic foreground/background token pair.', null, 'browser'),
  rule('bespoke-layout', 'warning', 'layout', 'Prefer a Ren10 layout primitive before custom flex/grid CSS.', 'codex'),
  rule('decorative-grid-background', 'warning', 'aesthetics', 'Reserve grid-line backgrounds for functional canvases or measurement surfaces.', 'codex'),
  rule('monotonous-spacing', 'warning', 'spacing', 'Group related elements tightly and separate distinct sections more generously.', 'codex', 'browser'),
]);

function rule(id, severity, category, suggestion, profile = null, engine = 'static') {
  return Object.freeze({ id, severity, category, suggestion, profile, engine });
}

async function buildDesignManifest(packageRoot) {
  const pkg = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
  const tokenFiles = await collectFiles(path.join(packageRoot, 'tokens'), new Set(['.css']));
  const tokenValues = {};
  for (const file of tokenFiles) {
    const source = await readFile(file, 'utf8');
    for (const match of source.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
      tokenValues[match[1]] = match[2].trim();
    }
  }

  const names = Object.keys(tokenValues).sort();
  const layoutsSource = await readFile(path.join(packageRoot, 'base', 'layouts.md'), 'utf8');
  const layouts = [...new Set(
    [...layoutsSource.matchAll(/`(ren-[a-z0-9-*]+)`/gi)]
      .map((match) => match[1])
      .filter((name) => !name.includes('*')),
  )].sort();
  const counts = Object.values(REGISTRY).reduce((acc, component) => {
    acc[component.layer] = (acc[component.layer] ?? 0) + 1;
    acc.total += 1;
    return acc;
  }, { primitives: 0, composites: 0, patterns: 0, total: 0 });

  return {
    schemaVersion: 1,
    generatedFrom: 'canonical-ren10-contracts',
    system: { name: 'Ren10', package: pkg.name, version: pkg.version },
    sources: ['ren-design.md', 'tokens/tokens.md', 'base/layouts.md', 'components/components.md'],
    tokens: {
      semantic: names.filter((name) => name.startsWith('--color-')),
      component: names.filter((name) => name.startsWith('--ren-')),
      type: names.filter((name) => name.startsWith('--text-') || name.startsWith('--leading-') || name.startsWith('--font-')),
      space: names.filter((name) => name.startsWith('--space-')),
      radius: names.filter((name) => name.startsWith('--radius-')),
      values: tokenValues,
    },
    layouts,
    components: {
      counts,
      names: Object.values(REGISTRY).map((component) => component.dir).sort(),
    },
    profiles: Object.keys(PROFILES),
    rules: RULES.map(({ id, severity, category, profile, engine }) => ({ id, severity, category, profile, engine })),
  };
}

async function detectTargets(targets, options = {}) {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const profileName = options.profile ?? 'generic';
  const profile = PROFILES[profileName];
  if (!profile) throw new Error(`Unknown detector profile "${profileName}".`);
  const manifest = options.manifest ?? await buildDesignManifest(options.packageRoot ?? cwd);
  const files = await resolveTargets(targets, cwd);
  const findings = [];

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const relativeFile = portable(path.relative(cwd, file) || path.basename(file));
    findings.push(...scanStaticSource(source, relativeFile, manifest, profileName));
  }

  const configured = filterFindings(findings, options.config ?? {});
  const normalized = configured
    .map((finding) => profile.promoteWarnings && finding.severity === 'warning'
      ? { ...finding, severity: 'error', promotedBy: 'strict' }
      : finding)
    .sort(compareFindings);
  const summary = summarize(normalized, files.length);

  return {
    schemaVersion: 1,
    profile: profileName,
    targets: targets.map(String),
    findings: normalized,
    summary,
    exitCode: summary.errors > 0 ? 1 : 0,
  };
}

function scanStaticSource(source, file, manifest, profileName) {
  const findings = [];
  const cssRegions = cssRegionsForSource(source, file);

  for (const region of cssRegions) {
    scanRegex(region.source, /#[0-9a-f]{3,8}\b/gi, (match, line) => {
      addFinding(findings, 'hardcoded-color', file, region.startLine + line - 1,
        `Hardcoded color ${match[0]} bypasses the Ren10 semantic token layer.`, match[0], profileName);
    });
    const primitivePattern = new RegExp(`var\\(--(?:${COLOR_PRIMITIVES.join('|')})-[0-9]+\\)`, 'gi');
    scanRegex(region.source, primitivePattern, (match, line) => {
      addFinding(findings, 'primitive-color-token', file, region.startLine + line - 1,
        `Primitive palette token ${match[0]} is not valid consumer styling.`, match[0], profileName);
    });
    scanRegex(region.source, /font-size\s*:\s*([0-9]*\.?[0-9]+(?:px|rem))\b/gi, (match, line) => {
      if (!allowedLength(match[1], manifest.tokens.type, manifest.tokens.values)) {
        addFinding(findings, 'off-scale-font-size', file, region.startLine + line - 1,
          `Font size ${match[1]} is outside the documented Ren10 type scale.`, match[1], profileName);
      }
    });
    scanRegex(region.source, /border-radius\s*:\s*([0-9]*\.?[0-9]+(?:px|rem))\b/gi, (match, line) => {
      if (!allowedLength(match[1], manifest.tokens.radius, manifest.tokens.values)) {
        addFinding(findings, 'off-scale-radius', file, region.startLine + line - 1,
          `Border radius ${match[1]} is outside the documented Ren10 radius scale.`, match[1], profileName);
      }
    });
    scanRegex(region.source, /line-height\s*:\s*([0-9]*\.?[0-9]+)\b/gi, (match, line) => {
      if (Number(match[1]) < 1.3) {
        addFinding(findings, 'tight-leading', file, region.startLine + line - 1,
          `Unitless line-height ${match[1]} is below the Ren10 readability floor.`, match[1], profileName);
      }
    });
    scanRegex(region.source, /display\s*:\s*(flex|grid|inline-flex|inline-grid)\b/gi, (match, line) => {
      addFinding(findings, 'bespoke-layout', file, region.startLine + line - 1,
        `Custom display:${match[1]} may duplicate a Ren10 layout primitive.`, match[1], profileName);
    });
    scanRegex(region.source, /background(?:-image)?\s*:[^;]*(?:linear-gradient\([^;]+){2,}/gi, (match, line) => {
      if (/1px/i.test(match[0])) {
        addFinding(findings, 'decorative-grid-background', file, region.startLine + line - 1,
          'Two-axis hairline gradient grid detected as surface decoration.', 'grid-gradient', profileName);
      }
    });
  }

  if (/overflow\s*:\s*(?:hidden|clip)/i.test(source)
      && /position\s*:\s*(?:absolute|fixed)/i.test(source)
      && /(?:tooltip|popover|menu|dropdown)/i.test(source)) {
    const line = lineOf(source, source.search(/overflow\s*:/i));
    addFinding(findings, 'clipped-overlay-risk', file, line,
      'A clipping container and positioned overlay coexist in this file.', 'overflow-overlay', profileName);
  }

  if (/\.html?$/.test(file)) scanHtml(source, file, findings, profileName);
  return findings;
}

function scanHtml(source, file, findings, profileName) {
  let previousLevel = 0;
  for (const match of source.matchAll(/<h([1-6])\b[^>]*>/gi)) {
    const level = Number(match[1]);
    if (previousLevel && level > previousLevel + 1) {
      addFinding(findings, 'heading-order', file, lineOf(source, match.index),
        `Heading level jumps from h${previousLevel} to h${level}.`, `h${previousLevel}>h${level}`, profileName);
    }
    previousLevel = level;
  }

  for (const match of source.matchAll(/<img\b[^>]*>/gi)) {
    const src = match[0].match(/\bsrc\s*=\s*["']([^"']*)["']/i)?.[1] ?? '';
    if (!src || /(?:placeholder|example|todo|dummy)/i.test(src)) {
      addFinding(findings, 'broken-image', file, lineOf(source, match.index),
        `Image source "${src || '(missing)'}" is empty or a placeholder.`, src || '(missing)', profileName);
    }
  }

  for (const match of source.matchAll(/<button\b[^>]*>/gi)) {
    if (!/\btype\s*=/.test(match[0])) {
      addFinding(findings, 'button-type', file, lineOf(source, match.index),
        'Button has no explicit type and may submit an ancestor form unexpectedly.', '<button>', profileName);
    }
  }
}

function addFinding(findings, ruleId, file, line, message, value, profileName) {
  const definition = RULES.find((candidate) => candidate.id === ruleId);
  if (!definition || (definition.profile && profileName === 'generic')) return;
  findings.push({
    rule: ruleId,
    severity: definition.severity,
    category: definition.category,
    engine: definition.engine,
    file,
    line: Math.max(1, line),
    value,
    message,
    suggestion: definition.suggestion,
  });
}

function filterFindings(findings, config = {}) {
  const detector = config.detector ?? {};
  const ignoredRules = new Set((detector.ignoreRules ?? []).map((entry) => typeof entry === 'string' ? entry : entry.rule));
  const ignoredFiles = (detector.ignoreFiles ?? []).map((entry) => typeof entry === 'string' ? entry : entry.pattern);
  const ignoredValues = detector.ignoreValues ?? [];
  return findings.filter((finding) => {
    if (ignoredRules.has(finding.rule)) return false;
    if (ignoredFiles.some((pattern) => globMatches(finding.file, pattern))) return false;
    return !ignoredValues.some((entry) => {
      if (entry.rule !== finding.rule) return false;
      if (entry.value !== '*' && normalizeValue(entry.value) !== normalizeValue(finding.value)) return false;
      const files = entry.files ?? [];
      return files.length === 0 || files.some((pattern) => globMatches(finding.file, pattern));
    });
  });
}

async function saveReview(result, { cwd = process.cwd(), slug = 'review', now = new Date() } = {}) {
  const date = now.toISOString().slice(0, 10);
  const safeSlug = String(slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'review';
  const directory = path.join(cwd, '.ren10', 'reviews');
  const file = path.join(directory, `${date}__${safeSlug}.json`);
  await mkdir(directory, { recursive: true });
  await writeFile(file, `${JSON.stringify({
    schemaVersion: 1,
    createdAt: now.toISOString(),
    ...result,
  }, null, 2)}\n`, 'utf8');
  return file;
}

async function resolveTargets(targets, cwd) {
  const requested = targets.length ? targets : ['.'];
  const files = [];
  for (const target of requested) {
    const absolute = path.resolve(cwd, target);
    const targetStat = await stat(absolute);
    if (targetStat.isDirectory()) files.push(...await collectFiles(absolute, SOURCE_EXTENSIONS));
    else if (SOURCE_EXTENSIONS.has(path.extname(absolute).toLowerCase())) files.push(absolute);
  }
  return [...new Set(files)].sort();
}

async function collectFiles(directory, extensions) {
  const out = [];
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())) out.push(absolute);
    }
  }
  await walk(directory);
  return out;
}

function cssRegionsForSource(source, file) {
  if (/\.css$/.test(file)) return [{ source, startLine: 1 }];
  const regions = [];
  for (const match of source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    const bodyOffset = match.index + match[0].indexOf(match[1]);
    regions.push({ source: match[1], startLine: lineOf(source, bodyOffset) });
  }
  return regions;
}

function allowedLength(raw, tokenNames, tokenValues) {
  const target = lengthPx(raw);
  if (target == null) return true;
  return tokenNames.some((name) => lengthPx(tokenValues[name]) === target);
}

function lengthPx(raw) {
  const match = String(raw ?? '').trim().match(/^([0-9]*\.?[0-9]+)(px|rem)$/i);
  if (!match) return null;
  return Number(match[1]) * (match[2].toLowerCase() === 'rem' ? 16 : 1);
}

function scanRegex(source, regex, callback) {
  for (const match of source.matchAll(regex)) callback(match, lineOf(source, match.index));
}

function lineOf(source, index = 0) {
  return source.slice(0, Math.max(0, index)).split('\n').length;
}

function summarize(findings, files) {
  return {
    files,
    errors: findings.filter((finding) => finding.severity === 'error').length,
    warnings: findings.filter((finding) => finding.severity === 'warning').length,
    total: findings.length,
  };
}

function compareFindings(a, b) {
  return a.file.localeCompare(b.file) || a.line - b.line || a.rule.localeCompare(b.rule);
}

function portable(value) {
  return String(value).split(path.sep).join('/');
}

function normalizeValue(value) {
  return String(value ?? '').trim().toLowerCase();
}

function globMatches(file, glob) {
  const expression = portable(glob)
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '::DOUBLE_STAR::')
    .replace(/\*/g, '[^/]*')
    .replace(/::DOUBLE_STAR::/g, '.*');
  return new RegExp(`^${expression}$`).test(portable(file));
}

export {
  PROFILES,
  RULES,
  buildDesignManifest,
  detectTargets,
  filterFindings,
  saveReview,
};
