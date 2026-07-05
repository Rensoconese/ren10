#!/usr/bin/env node

/**
 * RenDS CLI — Scaffold and manage design system components
 * Commands: init, add, list
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { REGISTRY, getComponentsByLayer, getComponent, getAllComponents } from './registry.js';
import { RATIOS, generateTypeScaleCSS, listRatios } from './type-scale.js';
import {
  formatKnowledgeRows,
  loadJsonGraph,
  queryJsonGraph,
  querySqliteGraph,
  sqliteAvailable,
} from './knowledge-search.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RENDS_ROOT = path.resolve(__dirname, '..');

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

// Allowed values for --density / --shape (mirrors themes/appearance.css).
const DENSITY_VALUES = ['comfortable', 'compact', 'spacious'];
const SHAPE_VALUES   = ['rounded', 'sharp', 'pill'];

const args = process.argv.slice(2);
const command = args[0];
const API_VERSION = 1;
const RENDS_MARKER_START = '<!-- RENDS:START -->';
const RENDS_MARKER_END = '<!-- RENDS:END -->';

const RESPONSE_TYPES = {
  manifest: ['manifest'],
  component: ['component.list', 'component.detail'],
  docs: ['docs.list', 'docs.detail'],
  search: ['search'],
  build: ['build.help', 'build.kit'],
  doctor: ['doctor'],
  'agent-docs': ['agent-docs.write', 'agent-docs.remove'],
  knowledge: ['knowledge.path', 'knowledge.check', 'knowledge.query'],
};

const DOC_TOPICS = {
  design: {
    title: 'RenDS design contract',
    path: 'ren-design.md',
    aliases: ['ren-design', 'contract'],
  },
  tokens: {
    title: 'Token contract',
    path: 'tokens/tokens.md',
    aliases: ['token'],
  },
  layouts: {
    title: 'Layout primitives',
    path: 'base/layouts.md',
    aliases: ['layout'],
  },
  'primitive-zero': {
    title: 'Primitive Zero',
    path: 'base/primitive-zero.md',
    aliases: ['native', 'html'],
  },
  components: {
    title: 'Component router',
    path: 'components/components.md',
    aliases: ['component-router'],
  },
  knowledge: {
    title: 'Knowledge graph',
    path: 'knowledge/README.md',
    aliases: ['knowledge-graph'],
  },
  evals: {
    title: 'Agent evals',
    path: 'evals/README.md',
    aliases: ['evaluation', 'evaluations'],
  },
  'agent-ready-roadmap': {
    title: 'Agent-ready roadmap',
    path: 'docs/agent-ready-roadmap.md',
    aliases: ['agent-ready', 'roadmap-ai', 'ai-roadmap'],
  },
};

const COMMAND_SPECS = [
  {
    name: 'init',
    description: 'Initialize a new RenDS project',
    arguments: [],
    options: [
      { flag: '--scale <ratio>', type: 'string', description: 'Use a modular type scale' },
      { flag: '--base <px>', type: 'number', description: 'Base font size in px' },
      { flag: '--fluid', type: 'boolean', description: 'Generate fluid type values' },
      { flag: '--density <value>', type: 'enum', choices: DENSITY_VALUES, description: 'Density preset' },
      { flag: '--shape <value>', type: 'enum', choices: SHAPE_VALUES, description: 'Shape preset' },
    ],
  },
  {
    name: 'add',
    description: 'Add one or more components to a project',
    arguments: [{ name: 'component', required: false, variadic: true }],
    options: [{ flag: '--all', type: 'boolean', description: 'Add every component' }],
  },
  {
    name: 'remove',
    aliases: ['rm'],
    description: 'Remove installed components',
    arguments: [{ name: 'component', required: true, variadic: true }],
    options: [{ flag: '--force, -f', type: 'boolean', description: 'Bypass local override checks' }],
  },
  {
    name: 'upgrade',
    aliases: ['update'],
    description: 'Refresh installed components from package source',
    arguments: [{ name: 'component', required: false, variadic: true }],
    options: [
      { flag: '--force, -f', type: 'boolean', description: 'Overwrite without prompting' },
      { flag: '--dry-run', type: 'boolean', description: 'Preview changes without writing' },
    ],
  },
  {
    name: 'list',
    description: 'List available components',
    arguments: [],
    options: [{ flag: '--json', type: 'boolean', description: 'Emit typed JSON' }],
  },
  {
    name: 'component',
    description: 'Print component docs, imports, contract path, usage, and aiHints',
    arguments: [{ name: 'name', required: false }],
    options: [
      { flag: '--list', type: 'boolean', description: 'List components grouped by layer' },
      { flag: '--dense', type: 'boolean', description: 'Token-efficient output for agents' },
      { flag: '--json', type: 'boolean', description: 'Emit typed JSON' },
    ],
    json: true,
  },
  {
    name: 'docs',
    description: 'Print reference docs for tokens, layouts, components, evals, and roadmap',
    arguments: [{ name: 'topic', required: false }],
    options: [
      { flag: '--list', type: 'boolean', description: 'List doc topics' },
      { flag: '--dense', type: 'boolean', description: 'Token-efficient output for agents' },
      { flag: '--json', type: 'boolean', description: 'Emit typed JSON' },
    ],
    json: true,
  },
  {
    name: 'search',
    description: 'Search components, contracts, docs, examples, selectors, and tokens',
    arguments: [{ name: 'query', required: true, variadic: true }],
    options: [
      { flag: '--limit <n>', type: 'number', description: 'Maximum results' },
      { flag: '--json', type: 'boolean', description: 'Emit typed JSON' },
    ],
    json: true,
  },
  {
    name: 'build',
    description: 'Return a composition kit for a UI idea, or the page-building playbook',
    arguments: [{ name: 'query', required: false, variadic: true }],
    options: [
      { flag: '--limit <n>', type: 'number', description: 'Maximum search pool' },
      { flag: '--json', type: 'boolean', description: 'Emit typed JSON' },
    ],
    json: true,
  },
  {
    name: 'manifest',
    description: 'Emit the self-describing CLI manifest for agents',
    arguments: [],
    options: [{ flag: '--json', type: 'boolean', description: 'Emit typed JSON' }],
    json: true,
  },
  {
    name: 'doctor',
    description: 'Diagnose RenDS package health and agent-readiness',
    arguments: [],
    options: [{ flag: '--json', type: 'boolean', description: 'Emit typed JSON' }],
    json: true,
  },
  {
    name: 'agent-docs',
    description: 'Install, update, or remove generated RenDS context in agent docs',
    arguments: [],
    options: [
      { flag: '--agent <codex|claude|cursor|all>', type: 'enum', choices: ['codex', 'claude', 'cursor', 'all'], description: 'Target agent file preset' },
      { flag: '--agent-docs-path <path>', type: 'string', description: 'Explicit relative path to write' },
      { flag: '--remove', type: 'boolean', description: 'Remove generated RenDS block' },
      { flag: '--json', type: 'boolean', description: 'Emit typed JSON' },
    ],
    json: true,
  },
  {
    name: 'knowledge',
    description: 'Inspect and query the packaged RenDS knowledge graph',
    arguments: [{ name: 'subcommand', required: false }],
    options: [
      { flag: '--json', type: 'boolean', description: 'Emit typed JSON for query results' },
      { flag: '--limit <n>', type: 'number', description: 'Maximum query results' },
      { flag: '--source-json', type: 'boolean', description: 'Force JSON graph source instead of SQLite' },
    ],
    json: true,
  },
  {
    name: 'scales',
    description: 'List available type scale ratios',
    arguments: [],
    options: [],
  },
];

/**
 * Print error message and exit
 */
function error(message) {
  if (args.includes('--json')) {
    jsonError(message);
  }
  console.error(`${c.red}✗ Error${c.reset}: ${message}`);
  process.exit(1);
}

/**
 * Print success message
 */
function success(message) {
  console.log(`${c.green}✓${c.reset} ${message}`);
}

/**
 * Print info message
 */
function info(message) {
  console.log(`${c.cyan}ℹ${c.reset} ${message}`);
}

function readPackageJson() {
  try {
    return JSON.parse(fs.readFileSync(path.join(RENDS_ROOT, 'package.json'), 'utf8'));
  } catch {
    return { name: 'ren10', version: '0.0.0' };
  }
}

function jsonOut(type, data) {
  console.log(JSON.stringify({ apiVersion: API_VERSION, type, data }, null, 2));
}

function jsonError(message, code = 'ERR_UNKNOWN', suggestions = undefined) {
  const payload = { apiVersion: API_VERSION, error: message, code };
  if (suggestions) payload.suggestions = suggestions;
  console.log(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function hasFlag(flag) {
  return args.includes(flag);
}

function optionValue(flag, fallback = null) {
  const index = args.indexOf(flag);
  if (index === -1) return fallback;
  return args[index + 1] ?? fallback;
}

function parseLimit(fallback = 12) {
  const raw = optionValue('--limit');
  if (raw == null) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    error(`Invalid --limit value "${raw}". Use a positive integer.`);
  }
  return parsed;
}

function stripCommandFlags(values) {
  const out = [];
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === '--json' || value === '--dense' || value === '--list' || value === '--remove' || value === '--source-json') {
      continue;
    }
    if (value === '--limit' || value === '--agent' || value === '--agent-docs-path') {
      i++;
      continue;
    }
    if (value.startsWith('--')) continue;
    out.push(value);
  }
  return out;
}

function normalizeComponentName(input) {
  if (!input) return '';
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/^ren-/, '')
    .replace(/^ren_/, '')
    .replace(/\s+/g, '-');
}

function getComponentByAnyName(input) {
  const normalized = normalizeComponentName(input);
  if (!normalized) return null;
  const direct = getComponent(normalized);
  if (direct) return { key: normalized, meta: direct };
  for (const [key, meta] of Object.entries(REGISTRY)) {
    if (
      normalizeComponentName(meta.name) === normalized ||
      normalizeComponentName(meta.dir) === normalized ||
      normalizeComponentName(key) === normalized
    ) {
      return { key, meta };
    }
  }
  return null;
}

function contractNameFor(meta) {
  return meta.layer === 'patterns' ? 'pattern.md' : 'component.md';
}

function componentDirFor(meta) {
  return path.join(RENDS_ROOT, 'components', meta.layer, meta.dir);
}

function relFromRoot(absPath) {
  return path.relative(RENDS_ROOT, absPath).split(path.sep).join('/');
}

function readComponentContract(meta) {
  const file = path.join(componentDirFor(meta), contractNameFor(meta));
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
}

function extractMarkdownSection(markdown, heading) {
  const re = new RegExp(`^## ${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm');
  const match = markdown.match(re);
  if (!match || match.index == null) return '';
  const start = match.index + match[0].length;
  const next = markdown.slice(start).search(/^## /m);
  return (next === -1 ? markdown.slice(start) : markdown.slice(start, start + next)).trim();
}

function extractBullets(markdown, heading, limit = 6) {
  const bullets = [];
  let current = null;
  for (const line of extractMarkdownSection(markdown, heading).split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      if (current) bullets.push(current);
      current = trimmed.slice(2).trim();
      continue;
    }
    if (current && trimmed && !trimmed.startsWith('#')) {
      current = `${current} ${trimmed}`;
    }
  }
  if (current) bullets.push(current);
  return bullets.slice(0, limit);
}

function extractAiHints(markdown) {
  const section = extractMarkdownSection(markdown, 'aiHints');
  const fenced = section.match(/```yaml\s*([\s\S]*?)```/);
  return fenced ? fenced[1].trim() : section;
}

function buildComponentDetail(key, meta, { dense = false } = {}) {
  const dir = componentDirFor(meta);
  const contract = readComponentContract(meta);
  const cssPath = path.join(dir, meta.files.find((file) => file.endsWith('.css')) ?? '');
  const jsPath = path.join(dir, meta.files.find((file) => file.endsWith('.js')) ?? '');
  const detail = {
    key,
    name: meta.name,
    tag: meta.dir,
    layer: meta.layer,
    description: meta.description,
    files: meta.files.map((file) => `components/${meta.layer}/${meta.dir}/${file}`),
    deps: meta.deps ?? [],
    usage: meta.usage,
    contractPath: `components/${meta.layer}/${meta.dir}/${contractNameFor(meta)}`,
    cssPath: fs.existsSync(cssPath) ? relFromRoot(cssPath) : null,
    jsPath: fs.existsSync(jsPath) ? relFromRoot(jsPath) : null,
    aiHints: extractAiHints(contract),
    useWhen: extractBullets(contract, 'Use When'),
    avoidWhen: extractBullets(contract, 'Do Not Use When'),
  };

  if (dense) {
    detail.dense = [
      `${meta.dir}|${meta.layer}|${meta.description}`,
      `contract=${detail.contractPath}`,
      `imports=${detail.files.join(',')}${detail.deps.length ? `; deps=${detail.deps.join(',')}` : ''}`,
      detail.useWhen.length ? `use=${detail.useWhen.join('; ')}` : null,
      detail.avoidWhen.length ? `avoid=${detail.avoidWhen.join('; ')}` : null,
      `usage=${String(meta.usage).replace(/\s+/g, ' ').trim()}`,
    ].filter(Boolean).join('\n');
  }

  return detail;
}

function listComponentData() {
  const layers = getComponentsByLayer();
  return Object.fromEntries(
    Object.entries(layers).map(([layer, components]) => [
      layer,
      components.map((component) => ({
        key: component.key,
        name: component.name,
        tag: component.dir,
        description: component.description,
      })),
    ]),
  );
}

function findDocTopic(topic) {
  const normalized = String(topic ?? '').trim().toLowerCase();
  if (!normalized) return null;
  if (DOC_TOPICS[normalized]) return { key: normalized, ...DOC_TOPICS[normalized] };
  for (const [key, doc] of Object.entries(DOC_TOPICS)) {
    if ((doc.aliases ?? []).includes(normalized)) {
      return { key, ...doc };
    }
  }
  return null;
}

function buildDenseDoc(topic, body) {
  const headings = [...body.matchAll(/^#{1,3}\s+(.+)$/gm)].map((m) => m[1].trim()).slice(0, 10);
  const rules = body
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^-\s+/.test(line) && /(use|do not|never|always|must|required|prefer|load|run)/i.test(line))
    .map((line) => line.replace(/^-\s+/, ''))
    .slice(0, 12);
  return [
    `${topic.title}|path=${topic.path}`,
    headings.length ? `headings=${headings.join(' > ')}` : null,
    rules.length ? `rules=${rules.join('; ')}` : null,
  ].filter(Boolean).join('\n');
}

function buildManifest() {
  const pkg = readPackageJson();
  return {
    name: 'ren10',
    version: pkg.version,
    apiVersion: API_VERSION,
    description: pkg.description,
    globalOptions: [
      { flag: '--json', type: 'boolean', description: 'Emit typed JSON envelope when supported' },
      { flag: '--dense', type: 'boolean', description: 'Emit token-efficient docs when supported' },
      { flag: '--version, -v', type: 'boolean', description: 'Print CLI/package version' },
      { flag: '--help, -h', type: 'boolean', description: 'Print help' },
    ],
    commands: COMMAND_SPECS,
    jsonSupported: COMMAND_SPECS.filter((cmd) => cmd.json).map((cmd) => cmd.name).sort(),
    responseTypes: RESPONSE_TYPES,
    docs: Object.fromEntries(
      Object.entries(DOC_TOPICS).map(([key, doc]) => [key, { title: doc.title, path: doc.path, aliases: doc.aliases ?? [] }]),
    ),
  };
}

function runKnowledgeSearch(rawQuery, { limit = 12, forceJsonSource = false } = {}) {
  const knowledgeDir = path.join(RENDS_ROOT, 'knowledge');
  const sqlitePath = path.join(knowledgeDir, 'ren10-graph.sqlite');
  const jsonPath = path.join(knowledgeDir, 'ren10-graph.json');
  if (!fs.existsSync(sqlitePath) && !fs.existsSync(jsonPath)) {
    error(`Knowledge graph not found: ${knowledgeDir}`);
  }

  let rows;
  let source = 'SQLite';
  if (!forceJsonSource && fs.existsSync(sqlitePath) && sqliteAvailable()) {
    try {
      rows = querySqliteGraph(sqlitePath, rawQuery, limit);
    } catch (err) {
      if (!fs.existsSync(jsonPath)) error(err.message);
      source = 'JSON fallback';
      rows = queryJsonGraph(loadJsonGraph(jsonPath), rawQuery, limit);
    }
  } else {
    if (!fs.existsSync(jsonPath)) error(`JSON graph not found: ${jsonPath}`);
    source = 'JSON fallback';
    rows = queryJsonGraph(loadJsonGraph(jsonPath), rawQuery, limit);
  }

  return { rows, source };
}

function commandForSearchRow(row) {
  if (row.type === 'component') {
    return `npx ren10 component ${normalizeComponentName(row.name)} --dense`;
  }
  if (row.type === 'contract' && row.path) {
    const parts = row.path.split('/');
    const name = parts[parts.length - 2];
    return `npx ren10 component ${normalizeComponentName(name)} --dense`;
  }
  if (row.type === 'design-contract') return 'npx ren10 docs design --dense';
  if (row.type === 'tokens-contract' || String(row.path).includes('tokens/')) return 'npx ren10 docs tokens --dense';
  if (row.type === 'layouts-contract' || String(row.path).includes('layouts.md')) return 'npx ren10 docs layouts --dense';
  if (row.type === 'primitive-zero') return 'npx ren10 docs primitive-zero --dense';
  return row.path ? `open ${row.path}` : 'npx ren10 search';
}

function buildKit(query, limit = 20) {
  const { rows, source } = runKnowledgeSearch(query, { limit });
  const components = rows.filter((row) => row.type === 'component').slice(0, 8);
  const docs = rows.filter((row) => /contract|docs|tooling/.test(row.type)).slice(0, 6);
  const examples = rows.filter((row) => row.type === 'example').slice(0, 4);
  const tokens = rows.filter((row) => row.type === 'token').slice(0, 8);

  return {
    query,
    source,
    start: [
      'npx ren10 docs layouts --dense',
      'npx ren10 docs components --dense',
      components[0] ? commandForSearchRow(components[0]) : `npx ren10 search "${query}"`,
    ],
    frame: [
      'Pick a RenDS layout primitive first: ren-stack, ren-grid, ren-with-sidebar, ren-cover, ren-center, ren-cluster.',
      'Use native HTML/Primitive Zero for semantic headings, forms, lists, tables, details, and prose.',
    ],
    components: components.map((row) => ({ ...row, command: commandForSearchRow(row) })),
    docs: docs.map((row) => ({ ...row, command: commandForSearchRow(row) })),
    examples,
    tokens,
  };
}

function safeAgentDocsPath(target) {
  if (!target || target.startsWith('/') || target.includes('..')) {
    error(`Unsafe agent docs path "${target}". Use a relative path inside the package root.`);
  }
  return target;
}

function generatedAgentBlock() {
  const pkg = readPackageJson();
  const layers = getComponentsByLayer();
  const counts = Object.fromEntries(Object.entries(layers).map(([layer, comps]) => [layer, comps.length]));
  return [
    RENDS_MARKER_START,
    `RenDS v${pkg.version} · vanilla HTML/CSS/JS · Light DOM · ${getAllComponents().length} components`,
    '',
    'WORKFLOW — discover before writing UI:',
    '1. `npx ren10 build "<idea>"` — get a composition kit for the requested UI.',
    '2. `npx ren10 docs layouts --dense` — choose the page skeleton before custom CSS.',
    '3. `npx ren10 component <name> --dense` — read contract, imports, aiHints, usage.',
    '4. `npx ren10 doctor` — verify package health before shipping.',
    '',
    'RULES:',
    '- Vanilla only: no React/Vue/Svelte/JSX/TSX, no Tailwind, no shadcn/ui.',
    '- Use RenDS layout primitives before custom flex/grid CSS.',
    '- Use semantic/component tokens (`--color-*`, `--space-*`, `--ren-*`), never primitive palette tokens or hardcoded colors.',
    '- Real elements only: button, a, input, form, dialog, table, details.',
    '- Light DOM only; never attachShadow.',
    '',
    `COMPONENTS: primitives=${counts.primitives ?? 0}, composites=${counts.composites ?? 0}, patterns=${counts.patterns ?? 0}.`,
    'MORE CLI:',
    '  manifest --json          self-describing CLI surface',
    '  search "<query>"         search graph across components/docs/examples/tokens',
    '  docs <topic> --dense     design, tokens, layouts, primitive-zero, components, evals',
    '  component --list         all components grouped by layer',
    '  knowledge query "<q>"    packaged graph query; --json emits typed JSON',
    RENDS_MARKER_END,
  ].join('\n');
}

/**
 * Copy file from source to destination, creating dirs as needed
 */
function copyFile(src, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

/**
 * Copy component source into a consumer's flat rends/components/<name>/ folder.
 * Source components live under components/<layer>/<dir>/, so JS imports that
 * point at ../../../utils/ need one fewer ../ after copying.
 */
function copyComponentFile(src, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!src.endsWith('.js')) {
    fs.copyFileSync(src, dest);
    return;
  }

  const rewritten = fs
    .readFileSync(src, 'utf8')
    .replace(/from\s+(['"])\.\.\/\.\.\/\.\.\/utils\//g, 'from $1../../utils/');
  fs.writeFileSync(dest, rewritten);
}

/**
 * Copy directory recursively
 */
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src);
  entries.forEach((entry) => {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

/**
 * Command: ren10 init
 * Initialize a new RenDS project in current directory
 */
async function cmdInit() {
  const cwd = process.cwd();
  const rendsDir = path.join(cwd, 'rends');

  if (fs.existsSync(rendsDir)) {
    error('rends/ directory already exists');
  }

  // Parse --scale flag
  const scaleIdx = args.indexOf('--scale');
  const scaleKey = scaleIdx !== -1 ? args[scaleIdx + 1] : null;

  // Parse --base flag (base font size in px)
  const baseIdx = args.indexOf('--base');
  const basePx = baseIdx !== -1 ? parseFloat(args[baseIdx + 1]) : 16;

  // Parse --fluid flag
  const useFluid = args.includes('--fluid');

  // Parse --density and --shape flags (no default → omit attr when not set).
  const densityIdx = args.indexOf('--density');
  const densityKey = densityIdx !== -1 ? args[densityIdx + 1] : null;
  const shapeIdx   = args.indexOf('--shape');
  const shapeKey   = shapeIdx   !== -1 ? args[shapeIdx + 1]   : null;

  if (scaleKey && !RATIOS[scaleKey]) {
    const available = listRatios().map(r => `  ${c.cyan}${r.key.padEnd(18)}${c.reset}${r.name} (${r.value})`).join('\n');
    error(`Unknown scale ratio: "${scaleKey}"\n\nAvailable ratios:\n${available}`);
  }
  if (densityKey && !DENSITY_VALUES.includes(densityKey)) {
    error(`Unknown density: "${densityKey}". Must be one of: ${DENSITY_VALUES.join(', ')}.`);
  }
  if (shapeKey && !SHAPE_VALUES.includes(shapeKey)) {
    error(`Unknown shape: "${shapeKey}". Must be one of: ${SHAPE_VALUES.join(', ')}.`);
  }

  // Create directory structure
  fs.mkdirSync(rendsDir, { recursive: true });

  // Copy tokens
  const tokensDir = path.join(rendsDir, 'tokens');
  copyDir(path.join(RENDS_ROOT, 'tokens'), tokensDir);

  // If a scale was specified, regenerate typography.css with modular scale
  if (scaleKey) {
    const typographyCSS = generateTypeScaleCSS({
      base: basePx,
      ratio: scaleKey,
      fluid: useFluid,
    });
    fs.writeFileSync(path.join(tokensDir, 'primitives', 'typography.css'), typographyCSS);
    success(`Created rends/tokens/ with ${c.bold}${RATIOS[scaleKey].name}${c.reset} scale (${RATIOS[scaleKey].value})`);
  } else {
    success('Created rends/tokens/');
  }

  // Copy base
  const baseDir = path.join(rendsDir, 'base');
  copyDir(path.join(RENDS_ROOT, 'base'), baseDir);
  success('Created rends/base/');

  // Copy themes (preset themes + hex→tokens generator).
  // appearance.css is opt-in (not auto-imported in index.css below) so the
  // user pays nothing if they don't use [data-theme]. The generator is a
  // pure ES module the user can import at build time.
  const themesDir = path.join(rendsDir, 'themes');
  fs.mkdirSync(themesDir, { recursive: true });
  copyFile(
    path.join(RENDS_ROOT, 'themes', 'appearance.css'),
    path.join(themesDir, 'appearance.css')
  );
  copyFile(
    path.join(RENDS_ROOT, 'themes', 'theme-generator.js'),
    path.join(themesDir, 'theme-generator.js')
  );
  success('Created rends/themes/');

  // Create components directory
  const componentsDir = path.join(rendsDir, 'components');
  fs.mkdirSync(componentsDir, { recursive: true });
  success('Created rends/components/');

  // Create components/index.css.
  // The `/* @rends-imports */` marker is an explicit anchor used by
  // `npx ren10 add` to know where to splice new @import lines. Keep
  // it on its own line so the splice stays clean.
  const componentsIndexPath = path.join(componentsDir, 'index.css');
  const componentIndexContent = `/* ============================================
   RenDS — Components Layer
   ============================================
   Import component styles here as you add them.
   ============================================ */

/* @rends-imports */
`;
  fs.writeFileSync(componentsIndexPath, componentIndexContent);

  // Create root index.css
  const indexPath = path.join(rendsDir, 'index.css');
  const indexContent = `/* ============================================
   RenDS — Design System
   ============================================ */

@import './tokens/index.css';
@import './base/index.css';
@import './components/index.css';
`;
  fs.writeFileSync(indexPath, indexContent);
  success('Created rends/index.css');

  console.log(`\n${c.bold}Done!${c.reset} Add components with:\n`);
  console.log(`  ${c.cyan}npx ren10 add button${c.reset}`);
  console.log(`  ${c.cyan}npx ren10 add dialog${c.reset}`);
  console.log(`  ${c.cyan}npx ren10 add --all${c.reset}\n`);

  if (scaleKey) {
    console.log(`${c.dim}Type scale: ${RATIOS[scaleKey].name} (${RATIOS[scaleKey].value})${c.reset}`);
    console.log(`${c.dim}Base size:  ${basePx}px${c.reset}`);
    if (useFluid) console.log(`${c.dim}Fluid:      enabled${c.reset}`);
    console.log();
  }

  if (densityKey || shapeKey) {
    const attrParts = [];
    if (densityKey) attrParts.push(`data-density="${densityKey}"`);
    if (shapeKey)   attrParts.push(`data-shape="${shapeKey}"`);
    console.log(`${c.bold}Add these attributes to your ${c.cyan}<html>${c.reset}${c.bold} element:${c.reset}`);
    console.log(`  ${c.cyan}<html ${attrParts.join(' ')}>${c.reset}\n`);
    console.log(`${c.dim}themes/appearance.css already declares the matching CSS — no extra import needed.${c.reset}\n`);
  }
}

/**
 * Command: ren10 scales
 * List all available type scale ratios
 */
async function cmdScales() {
  const ratios = listRatios();
  console.log(`\n${c.bold}Available Type Scale Ratios${c.reset}\n`);
  console.log(`${c.dim}Use with: npx ren10 init --scale <ratio>${c.reset}\n`);

  ratios.forEach(r => {
    const marker = r.key === 'major-third' ? ` ${c.yellow}← default${c.reset}` : '';
    const recommended = ['minor-third', 'major-third', 'perfect-fourth'].includes(r.key) ? ` ${c.green}★${c.reset}` : '';
    console.log(`  ${c.cyan}${r.key.padEnd(18)}${c.reset}${r.name.padEnd(16)} ${c.dim}(${r.value})${c.reset}${recommended}${marker}`);
  });

  console.log(`\n${c.dim}★ = recommended for web${c.reset}\n`);
  console.log(`${c.bold}Examples:${c.reset}`);
  console.log(`  ${c.cyan}npx ren10 init --scale minor-third${c.reset}`);
  console.log(`  ${c.cyan}npx ren10 init --scale perfect-fourth --base 18${c.reset}`);
  console.log(`  ${c.cyan}npx ren10 init --scale major-third --fluid${c.reset}\n`);
}

/**
 * Command: ren10 add <component>
 * Add a component to the project
 */
/**
 * Add one component to rends/components/<name>/.
 * Returns the resolved meta so the caller can render usage examples,
 * or null if the component was skipped (unknown / already exists).
 *
 * @param {string} rendsDir   Absolute path to the consumer's rends/ folder.
 * @param {string} componentArg  Component name (will be lowercased).
 * @param {object} [opts]
 * @param {boolean} [opts.silent]  Suppress per-file ✓ / ℹ logs.
 *                                  Used by `add --all` to keep output tidy.
 */
function addOneComponent(rendsDir, componentArg, opts = {}) {
  const { silent = false } = opts;
  const componentName = componentArg.toLowerCase();
  const meta = getComponent(componentName);

  if (!meta) {
    if (!silent) {
      info(
        `Skipped "${componentName}" — unknown. Run "npx ren10 list" to see available components.`
      );
    }
    return null;
  }

  const componentDir = path.join(rendsDir, 'components', componentName);
  if (fs.existsSync(componentDir)) {
    if (!silent) {
      info(`Skipped "${componentName}" — already exists in rends/components/${componentName}`);
    }
    return null;
  }

  fs.mkdirSync(componentDir, { recursive: true });

  const srcComponentDir = path.join(RENDS_ROOT, 'components', meta.layer, meta.dir);
  if (!fs.existsSync(srcComponentDir)) {
    error(`Source component not found: ${srcComponentDir}`);
  }

  meta.files.forEach((file) => {
    const srcFile = path.join(srcComponentDir, file);
    const destFile = path.join(componentDir, file);
    if (!fs.existsSync(srcFile)) {
      error(`Registry file missing for "${componentName}": ${path.relative(RENDS_ROOT, srcFile)}`);
    }

    copyComponentFile(srcFile, destFile);
    if (!silent) success(`Copied ${componentName}/${file}`);
  });

  // Copy JS deps from utils/ if the component declares any.
  if (meta.deps && meta.deps.length > 0) {
    const utilsDir = path.join(rendsDir, 'utils');
    fs.mkdirSync(utilsDir, { recursive: true });

    const srcUtilsDir = path.join(RENDS_ROOT, 'utils');
    meta.deps.forEach((dep) => {
      const srcDep = path.join(srcUtilsDir, dep);
      const destDep = path.join(utilsDir, dep);
      if (fs.existsSync(srcDep) && !fs.existsSync(destDep)) {
        copyFile(srcDep, destDep);
        if (!silent) success(`Copied utils/${dep} (dependency)`);
      }
    });
  }

  // Append @import to components/index.css if not already there.
  // Strategy (in priority order):
  //   1. After the last existing @import line.
  //   2. Right after the `/* @rends-imports */` marker (init template).
  //   3. After the first `*/` (end of any header comment).
  //   4. Append at the end.
  const componentsIndexPath = path.join(rendsDir, 'components', 'index.css');
  let indexContent = fs.readFileSync(componentsIndexPath, 'utf8');
  const importLine = `@import './${componentName}/${meta.files[0]}';`;

  if (!indexContent.includes(importLine)) {
    const lines = indexContent.split('\n');

    const lastImportIdx = lines
      .map((l, i) => (l.trim().startsWith('@import') ? i : -1))
      .filter((i) => i >= 0)
      .pop();

    if (lastImportIdx !== undefined) {
      lines.splice(lastImportIdx + 1, 0, importLine);
    } else {
      const markerIdx = lines.findIndex((l) => l.trim() === '/* @rends-imports */');
      if (markerIdx >= 0) {
        lines.splice(markerIdx + 1, 0, importLine);
      } else {
        const closeCommentIdx = lines.findIndex((l) => l.includes('*/'));
        if (closeCommentIdx >= 0) {
          lines.splice(closeCommentIdx + 1, 0, '', importLine);
        } else {
          lines.push('', importLine);
        }
      }
    }
    fs.writeFileSync(componentsIndexPath, lines.join('\n'));
  }

  return meta;
}

async function cmdAdd() {
  const cwd = process.cwd();
  const rendsDir = path.join(cwd, 'rends');

  if (!fs.existsSync(rendsDir)) {
    error(
      'rends/ directory not found. Run "npx ren10 init" first'
    );
  }

  // Everything after `add` that isn't a flag. Supports
  //   npx ren10 add button
  //   npx ren10 add button dialog tooltip
  //   npx ren10 add --all
  const positional = args.slice(1).filter((a) => !a.startsWith('--'));

  if (args.includes('--all')) {
    return cmdAddAll();
  }

  if (positional.length === 0) {
    error('Please specify one or more component names, or use --all');
  }

  const added = [];
  for (const componentArg of positional) {
    const meta = addOneComponent(rendsDir, componentArg);
    if (meta) added.push(meta);
  }

  if (added.length === 0) {
    console.log(`\n${c.dim}No components added.${c.reset}\n`);
    return;
  }

  success(`Updated components/index.css`);

  // Render usage for each added component.
  console.log(`\n${c.bold}Usage:${c.reset}\n`);
  for (const meta of added) {
    console.log(`  ${c.dim}— ${meta.name} —${c.reset}`);
    console.log(meta.usage.split('\n').map((line) => `  ${line}`).join('\n'));
    console.log();
  }
}

/**
 * Command: ren10 add --all
 * Add all components at once
 */
async function cmdAddAll() {
  const cwd = process.cwd();
  const rendsDir = path.join(cwd, 'rends');

  if (!fs.existsSync(rendsDir)) {
    error('rends/ directory not found. Run "npx ren10 init" first');
  }

  const allComponents = getAllComponents();
  let added = 0;
  let skipped = 0;

  // Reuse the same per-component logic as `add <name>` so the splice
  // into components/index.css uses the `/* @rends-imports */` anchor
  // (or the appropriate fallback), instead of blindly concatenating
  // at end-of-file. Silent mode keeps the output to one summary line.
  for (const name of allComponents) {
    const meta = addOneComponent(rendsDir, name, { silent: true });
    if (meta) {
      added++;
    } else {
      skipped++;
    }
  }

  // Copy every utility file, not just the deps declared by the
  // components added in this pass. `add --all` is the "give me
  // everything" command, so the consumer expects the full utils/
  // folder to be present.
  const utilsDir = path.join(rendsDir, 'utils');
  fs.mkdirSync(utilsDir, { recursive: true });
  const srcUtilsDir = path.join(RENDS_ROOT, 'utils');
  if (fs.existsSync(srcUtilsDir)) {
    const utilFiles = fs.readdirSync(srcUtilsDir);
    utilFiles.forEach((file) => {
      const srcFile = path.join(srcUtilsDir, file);
      const destFile = path.join(utilsDir, file);
      if (fs.statSync(srcFile).isFile() && !fs.existsSync(destFile)) {
        copyFile(srcFile, destFile);
      }
    });
  }

  console.log();
  success(`Added ${added} components`);
  if (skipped > 0) {
    info(`Skipped ${skipped} components (already exist)`);
  }
  console.log();
}

/**
 * Command: ren10 list
 * List all available components
 */
async function cmdList() {
  const layers = getComponentsByLayer();

  if (hasFlag('--json')) {
    jsonOut('component.list', listComponentData());
    return;
  }

  console.log(`\n${c.bold}RenDS Components${c.reset} (${getAllComponents().length})\n`);

  const layerOrder = ['primitives', 'composites', 'patterns'];
  const layerLabels = {
    primitives: 'PRIMITIVES',
    composites: 'COMPOSITES',
    patterns: 'PATTERNS',
  };

  layerOrder.forEach((layer) => {
    const components = layers[layer] || [];
    if (components.length === 0) return;

    console.log(`${c.bold}${layerLabels[layer]}${c.reset}`);
    components.forEach((comp) => {
      console.log(`  ${c.cyan}${comp.key.padEnd(20)}${c.reset}${comp.description}`);
    });
    console.log();
  });
}

async function cmdManifest() {
  const manifest = buildManifest();
  if (hasFlag('--json')) {
    jsonOut('manifest', manifest);
    return;
  }
  console.log(`\n${c.bold}RenDS CLI Manifest${c.reset}\n`);
  console.log(`  name:        ${manifest.name}`);
  console.log(`  version:     ${manifest.version}`);
  console.log(`  apiVersion:  ${manifest.apiVersion}`);
  console.log(`  commands:    ${manifest.commands.length}`);
  console.log(`\n${c.dim}Machine-readable:${c.reset}`);
  console.log(`  ${c.cyan}npx ren10 manifest --json${c.reset}\n`);
}

async function cmdComponent() {
  const wantsList = hasFlag('--list') || !args[1];
  const dense = hasFlag('--dense');

  if (wantsList) {
    const data = listComponentData();
    if (hasFlag('--json')) {
      jsonOut('component.list', data);
      return;
    }
    console.log(`\n${c.bold}RenDS Components${c.reset} (${getAllComponents().length})\n`);
    for (const [layer, components] of Object.entries(data)) {
      console.log(`${c.bold}${layer.toUpperCase()}${c.reset}`);
      for (const component of components) {
        console.log(`  ${c.cyan}${component.key.padEnd(20)}${c.reset}${component.description}`);
      }
      console.log();
    }
    console.log(`${c.dim}Read one: npx ren10 component button --dense${c.reset}\n`);
    return;
  }

  const match = getComponentByAnyName(args[1]);
  if (!match) {
    const suggestions = getAllComponents()
      .filter((name) => name.includes(normalizeComponentName(args[1]).slice(0, 4)))
      .slice(0, 5)
      .map((name) => ({ name }));
    if (hasFlag('--json')) jsonError(`Unknown component "${args[1]}".`, 'ERR_UNKNOWN_COMPONENT', suggestions);
    error(`Unknown component "${args[1]}". Run "npx ren10 component --list".`);
  }

  const detail = buildComponentDetail(match.key, match.meta, { dense });
  if (hasFlag('--json')) {
    jsonOut('component.detail', detail);
    return;
  }

  if (dense) {
    console.log(detail.dense);
    return;
  }

  console.log(`\n${c.bold}${detail.name}${c.reset} ${c.dim}(${detail.tag})${c.reset}\n`);
  console.log(detail.description);
  console.log(`\n${c.bold}Contract:${c.reset} ${detail.contractPath}`);
  console.log(`${c.bold}Files:${c.reset}`);
  for (const file of detail.files) console.log(`  ${c.cyan}${file}${c.reset}`);
  if (detail.deps.length) {
    console.log(`${c.bold}Deps:${c.reset} ${detail.deps.join(', ')}`);
  }
  if (detail.useWhen.length) {
    console.log(`\n${c.bold}Use when:${c.reset}`);
    for (const item of detail.useWhen) console.log(`  - ${item}`);
  }
  if (detail.avoidWhen.length) {
    console.log(`\n${c.bold}Avoid when:${c.reset}`);
    for (const item of detail.avoidWhen) console.log(`  - ${item}`);
  }
  console.log(`\n${c.bold}Usage:${c.reset}\n${detail.usage}\n`);
}

async function cmdDocs() {
  const dense = hasFlag('--dense');
  const topicArg = stripCommandFlags(args.slice(1))[0];

  if (!topicArg || hasFlag('--list')) {
    const data = Object.fromEntries(
      Object.entries(DOC_TOPICS).map(([key, doc]) => [key, { title: doc.title, path: doc.path, aliases: doc.aliases ?? [] }]),
    );
    if (hasFlag('--json')) {
      jsonOut('docs.list', data);
      return;
    }
    console.log(`\n${c.bold}RenDS Docs${c.reset}\n`);
    for (const [key, doc] of Object.entries(data)) {
      console.log(`  ${c.cyan}${key.padEnd(22)}${c.reset}${doc.title} ${c.dim}${doc.path}${c.reset}`);
    }
    console.log(`\n${c.dim}Example: npx ren10 docs tokens --dense${c.reset}\n`);
    return;
  }

  const topic = findDocTopic(topicArg);
  if (!topic) {
    if (hasFlag('--json')) jsonError(`Unknown docs topic "${topicArg}".`, 'ERR_UNKNOWN_TOPIC');
    error(`Unknown docs topic "${topicArg}". Run "npx ren10 docs --list".`);
  }

  const absPath = path.join(RENDS_ROOT, topic.path);
  if (!fs.existsSync(absPath)) {
    if (hasFlag('--json')) jsonError(`Docs topic exists but file is missing: ${topic.path}`, 'ERR_FILE_NOT_FOUND');
    error(`Docs topic exists but file is missing: ${topic.path}`);
  }
  const body = fs.readFileSync(absPath, 'utf8');
  const data = {
    name: topic.key,
    title: topic.title,
    path: topic.path,
    body: dense ? undefined : body,
    dense: dense ? buildDenseDoc(topic, body) : undefined,
  };
  if (hasFlag('--json')) {
    jsonOut('docs.detail', data);
    return;
  }
  console.log(dense ? data.dense : body);
}

async function cmdSearch() {
  const query = stripCommandFlags(args.slice(1)).join(' ').trim();
  if (!query) error('Usage: npx ren10 search "dialog workflow" [--json] [--limit 12]');
  const limit = parseLimit(12);
  const { rows, source } = runKnowledgeSearch(query, {
    limit,
    forceJsonSource: hasFlag('--source-json') || process.env.RENDS_KNOWLEDGE_FORCE_JSON === '1',
  });
  const results = rows.map((row) => ({ ...row, command: commandForSearchRow(row) }));
  if (hasFlag('--json')) {
    jsonOut('search', { query, limit, source, results });
    return;
  }
  if (source !== 'SQLite') console.log(`${c.dim}Using ${source}.${c.reset}`);
  console.log(`\n${c.bold}Results for "${query}"${c.reset}\n`);
  for (const row of results) {
    console.log(`${c.cyan}${String(row.type).padEnd(12)}${c.reset} ${c.bold}${row.name}${c.reset}`);
    if (row.path) console.log(`  ${row.path}`);
    if (row.snippet) console.log(`  ${String(row.snippet).replace(/\s+/g, ' ').trim()}`);
    console.log(`  ${c.dim}→ ${row.command}${c.reset}\n`);
  }
}

async function cmdBuild() {
  const query = stripCommandFlags(args.slice(1)).join(' ').trim();
  if (!query) {
    const playbook = [
      'How to build a RenDS UI',
      '',
      '1. Start with intent: npx ren10 build "<what you are building>"',
      '2. Pick the frame: npx ren10 docs layouts --dense',
      '3. Read each component contract: npx ren10 component <name> --dense',
      '4. Use Primitive Zero for native semantic HTML.',
      '5. Verify: npx ren10 doctor && npm run lint && npm run test:evals',
    ].join('\n');
    if (hasFlag('--json')) {
      jsonOut('build.help', { playbook });
      return;
    }
    console.log(`\n${playbook}\n`);
    return;
  }

  const kit = buildKit(query, parseLimit(20));
  if (hasFlag('--json')) {
    jsonOut('build.kit', kit);
    return;
  }
  console.log(`\n${c.bold}Build kit for "${query}"${c.reset}\n`);
  console.log(`${c.bold}Start:${c.reset}`);
  for (const step of kit.start) console.log(`  ${c.cyan}${step}${c.reset}`);
  console.log(`\n${c.bold}Frame:${c.reset}`);
  for (const item of kit.frame) console.log(`  - ${item}`);
  if (kit.components.length) {
    console.log(`\n${c.bold}Components:${c.reset}`);
    for (const row of kit.components) console.log(`  ${c.cyan}${row.name.padEnd(22)}${c.reset}${row.command}`);
  }
  if (kit.docs.length) {
    console.log(`\n${c.bold}Docs:${c.reset}`);
    for (const row of kit.docs) console.log(`  ${c.cyan}${String(row.name).padEnd(22)}${c.reset}${row.command}`);
  }
  if (kit.examples.length) {
    console.log(`\n${c.bold}Examples:${c.reset}`);
    for (const row of kit.examples) console.log(`  ${c.cyan}${row.name}${c.reset} ${row.path}`);
  }
  console.log();
}

async function cmdDoctor() {
  const checks = [];
  const add = (id, label, status, message, fix = undefined) => {
    checks.push({ id, label, status, message, ...(fix ? { fix } : {}) });
  };
  const exists = (relPath) => fs.existsSync(path.join(RENDS_ROOT, relPath));

  const requiredDocs = ['ren-design.md', 'tokens/tokens.md', 'base/layouts.md', 'base/primitive-zero.md', 'components/components.md'];
  const missingDocs = requiredDocs.filter((file) => !exists(file));
  add(
    'contracts',
    'Root contracts',
    missingDocs.length ? 'fail' : 'pass',
    missingDocs.length ? `Missing: ${missingDocs.join(', ')}` : 'Root contracts are present.',
    missingDocs.length ? 'Restore the missing contract files before publishing.' : undefined,
  );

  const countContracts = (dir, file) => {
    const abs = path.join(RENDS_ROOT, dir);
    if (!fs.existsSync(abs)) return 0;
    return fs.readdirSync(abs, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(abs, entry.name, file))).length;
  };
  const counts = {
    primitives: countContracts('components/primitives', 'component.md'),
    composites: countContracts('components/composites', 'component.md'),
    patterns: countContracts('components/patterns', 'pattern.md'),
  };
  const countsOk = counts.primitives === 19 && counts.composites === 26 && counts.patterns === 8;
  add(
    'component-counts',
    'Component contract counts',
    countsOk ? 'pass' : 'fail',
    `primitives=${counts.primitives}/19, composites=${counts.composites}/26, patterns=${counts.patterns}/8.`,
    countsOk ? undefined : 'Regenerate or restore missing component contracts.',
  );

  let aiHints = 0;
  for (const group of [
    ['components/primitives', 'component.md'],
    ['components/composites', 'component.md'],
    ['components/patterns', 'pattern.md'],
  ]) {
    const [dir, file] = group;
    const abs = path.join(RENDS_ROOT, dir);
    if (!fs.existsSync(abs)) continue;
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const contract = path.join(abs, entry.name, file);
      if (fs.existsSync(contract) && fs.readFileSync(contract, 'utf8').includes('## aiHints')) aiHints++;
    }
  }
  add(
    'aihints',
    'aiHints coverage',
    aiHints === 53 ? 'pass' : 'fail',
    `${aiHints}/53 component contracts expose aiHints.`,
    aiHints === 53 ? undefined : 'Add or restore aiHints blocks in every component/pattern contract.',
  );

  const knowledgeFiles = ['knowledge/README.md', 'knowledge/ren10-graph.json', 'knowledge/ren10-graph.sqlite'];
  const missingKnowledge = knowledgeFiles.filter((file) => !exists(file));
  add(
    'knowledge',
    'Knowledge graph package files',
    missingKnowledge.length ? 'fail' : 'pass',
    missingKnowledge.length ? `Missing: ${missingKnowledge.join(', ')}` : 'Knowledge graph files are present.',
    missingKnowledge.length ? 'Run npm run knowledge:build and commit generated files.' : undefined,
  );

  const pkg = readPackageJson();
  const requiredScripts = ['lint', 'test:evals', 'knowledge:check', 'smoke:cli-copy'];
  const missingScripts = requiredScripts.filter((script) => !pkg.scripts?.[script]);
  add(
    'scripts',
    'Validation scripts',
    missingScripts.length ? 'warn' : 'pass',
    missingScripts.length ? `Missing scripts: ${missingScripts.join(', ')}` : 'Core validation scripts are present.',
    missingScripts.length ? 'Add missing package scripts or update doctor expectations.' : undefined,
  );

  const agentDocs = ['AGENTS.md', 'CLAUDE.md', '.cursorrules', '.windsurfrules'].filter(exists);
  const generated = agentDocs.filter((file) => fs.readFileSync(path.join(RENDS_ROOT, file), 'utf8').includes(RENDS_MARKER_START));
  add(
    'agent-docs',
    'Agent docs',
    agentDocs.length ? (generated.length ? 'pass' : 'info') : 'warn',
    generated.length
      ? `Generated RenDS block present in ${generated.join(', ')}.`
      : agentDocs.length
        ? `Agent docs present (${agentDocs.join(', ')}), but no generated RenDS block yet.`
        : 'No agent docs found.',
    generated.length ? undefined : 'Run npx ren10 agent-docs --agent all to install generated context blocks.',
  );

  const summary = { pass: 0, warn: 0, fail: 0, info: 0 };
  for (const check of checks) summary[check.status] += 1;
  const report = { checks, summary };
  if (hasFlag('--json')) {
    jsonOut('doctor', report);
  } else {
    console.log(`\n${c.bold}ren10 doctor${c.reset}\n`);
    for (const check of checks) {
      const marker = check.status === 'pass' ? `${c.green}✓${c.reset}` : check.status === 'fail' ? `${c.red}✗${c.reset}` : check.status === 'warn' ? `${c.yellow}⚠${c.reset}` : `${c.dim}ℹ${c.reset}`;
      console.log(`${marker} ${check.label}`);
      console.log(`  ${check.message}`);
      if (check.fix) console.log(`  ${c.dim}fix: ${check.fix}${c.reset}`);
    }
    console.log(`\nSummary: ${summary.pass} passed, ${summary.warn} warnings, ${summary.fail} failures, ${summary.info} info\n`);
  }
  if (summary.fail > 0) process.exitCode = 1;
}

function injectGeneratedBlock(filePath, block, { createIfMissing = true } = {}) {
  let content = '';
  if (fs.existsSync(filePath)) {
    content = fs.readFileSync(filePath, 'utf8');
    const start = content.indexOf(RENDS_MARKER_START);
    const end = content.indexOf(RENDS_MARKER_END);
    if (start !== -1 && end !== -1 && end > start) {
      content = content.slice(0, start) + block + content.slice(end + RENDS_MARKER_END.length);
    } else {
      content = content.trimEnd() + '\n\n' + block + '\n';
    }
  } else {
    if (!createIfMissing) return false;
    content = `# ${path.basename(filePath)}\n\nProject-specific guidance for AI coding agents.\n\n${block}\n`;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  return true;
}

function removeGeneratedBlock(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf8');
  const start = content.indexOf(RENDS_MARKER_START);
  const end = content.indexOf(RENDS_MARKER_END);
  if (start === -1 || end === -1 || end < start) return false;
  const next = content.slice(0, start).trimEnd() + '\n\n' + content.slice(end + RENDS_MARKER_END.length).trimStart();
  fs.writeFileSync(filePath, next.trimEnd() + '\n');
  return true;
}

async function cmdAgentDocs() {
  const explicitPath = optionValue('--agent-docs-path');
  const agent = optionValue('--agent', explicitPath ? null : 'codex');
  const presets = {
    codex: ['AGENTS.md'],
    claude: ['CLAUDE.md'],
    cursor: ['.cursorrules'],
    windsurf: ['.windsurfrules'],
    all: ['AGENTS.md', 'CLAUDE.md', '.cursorrules', '.windsurfrules'],
  };
  let targets;
  if (explicitPath) {
    targets = [safeAgentDocsPath(explicitPath)];
  } else if (presets[agent]) {
    targets = presets[agent];
  } else {
    if (hasFlag('--json')) jsonError(`Unknown agent "${agent}".`, 'ERR_UNKNOWN_AGENT');
    error(`Unknown agent "${agent}". Use codex, claude, cursor, windsurf, or all.`);
  }

  if (hasFlag('--remove')) {
    const removed = [];
    for (const target of targets) {
      if (removeGeneratedBlock(path.join(RENDS_ROOT, target))) removed.push(target);
    }
    if (hasFlag('--json')) {
      jsonOut('agent-docs.remove', { removed });
      return;
    }
    success(removed.length ? `Removed generated RenDS block from ${removed.join(', ')}` : 'No generated RenDS blocks found.');
    return;
  }

  const block = generatedAgentBlock();
  const written = [];
  for (const target of targets) {
    injectGeneratedBlock(path.join(RENDS_ROOT, safeAgentDocsPath(target)), block);
    written.push(target);
  }
  if (hasFlag('--json')) {
    jsonOut('agent-docs.write', { written, markerStart: RENDS_MARKER_START, markerEnd: RENDS_MARKER_END });
    return;
  }
  success(`Wrote generated RenDS agent block to ${written.join(', ')}`);
}

/**
 * Command: ren10 knowledge [path|query|check]
 * Inspect the packaged RenDS knowledge graph.
 */
async function cmdKnowledge() {
  const subcommand = args[1] || 'path';
  const knowledgeDir = path.join(RENDS_ROOT, 'knowledge');
  const sqlitePath = path.join(knowledgeDir, 'ren10-graph.sqlite');
  const jsonPath = path.join(knowledgeDir, 'ren10-graph.json');

  if (subcommand === 'path' || subcommand === 'paths') {
    const data = {
      sqlitePath,
      jsonPath,
      commands: [
        'npx ren10 knowledge query "ren-toast status"',
        'npx ren10 knowledge query "ren-toast status" --json',
        'npx ren10 knowledge check',
      ],
    };
    if (hasFlag('--json')) {
      jsonOut('knowledge.path', data);
      return;
    }
    console.log(`\n${c.bold}RenDS Knowledge Graph${c.reset}\n`);
    console.log(`  SQLite: ${c.cyan}${sqlitePath}${c.reset}`);
    console.log(`  JSON:   ${c.cyan}${jsonPath}${c.reset}`);
    console.log(`\n${c.dim}Query with:${c.reset}`);
    console.log(`  ${c.cyan}npx ren10 knowledge query "ren-toast status"${c.reset}`);
    console.log(`  ${c.cyan}npx ren10 knowledge query "ren-toast status" --json${c.reset}`);
    console.log(`\n${c.dim}Validate packaged graph:${c.reset}`);
    console.log(`  ${c.cyan}npx ren10 knowledge check${c.reset}\n`);
    return;
  }

  if (subcommand === 'check') {
    if (!fs.existsSync(jsonPath)) error(`Knowledge JSON not found: ${jsonPath}`);
    const graph = loadJsonGraph(jsonPath);
    const messages = [];
    const notes = [];
    if (graph.schemaVersion !== 1) messages.push(`Unexpected schemaVersion: ${graph.schemaVersion}`);
    if (graph.packageName !== 'ren10') messages.push(`Unexpected packageName: ${graph.packageName}`);
    if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
      messages.push('JSON graph must contain nodes[] and edges[].');
    }
    if (!fs.existsSync(sqlitePath)) {
      messages.push(`SQLite graph not found: ${sqlitePath}`);
    } else if (sqliteAvailable()) {
      const integrity = spawnSync('sqlite3', [sqlitePath, 'PRAGMA integrity_check;'], { encoding: 'utf8' });
      if (integrity.status !== 0 || integrity.stdout.trim() !== 'ok') {
        messages.push(`SQLite integrity check failed: ${(integrity.stderr || integrity.stdout).trim()}`);
      }
      try {
        const smoke = querySqliteGraph(sqlitePath, 'ren-toast status', 1);
        if (smoke.length === 0) messages.push('SQLite FTS smoke query returned no rows.');
      } catch (err) {
        messages.push(err.message);
      }
    } else {
      notes.push('sqlite3 CLI not found; SQLite file exists but integrity check was skipped.');
    }

    if (messages.length > 0) {
      if (hasFlag('--json')) jsonError(messages.join('\n'), 'ERR_KNOWLEDGE_CHECK_FAILED');
      error(messages.join('\n'));
    }
    if (hasFlag('--json')) {
      jsonOut('knowledge.check', {
        ok: true,
        nodes: graph.nodes?.length ?? 0,
        edges: graph.edges?.length ?? 0,
        notes,
      });
      return;
    }
    for (const note of notes) console.log(`${c.dim}${note}${c.reset}`);
    console.log(`RenDS knowledge graph OK: ${graph.nodes?.length ?? 0} nodes, ${graph.edges?.length ?? 0} edges.`);
    return;
  }

  if (subcommand !== 'query') {
    error(`Unknown knowledge command: ${subcommand}. Use "path", "query", or "check".`);
  }

  const queryArgs = stripCommandFlags(args.slice(2));
  const rawQuery = queryArgs.join(' ').trim();
  if (!rawQuery) {
    error('Usage: npx ren10 knowledge query "ren-toast status" [--json]');
  }

  const limit = parseLimit(12);
  const { rows, source } = runKnowledgeSearch(rawQuery, {
    limit,
    forceJsonSource: hasFlag('--source-json') || process.env.RENDS_KNOWLEDGE_FORCE_JSON === '1',
  });

  if (rows.length === 0) {
    if (hasFlag('--json')) {
      jsonOut('knowledge.query', { query: rawQuery, limit, source, results: [] });
      return;
    }
    console.log(`No matches for "${rawQuery}".`);
    return;
  }

  if (hasFlag('--json')) {
    jsonOut('knowledge.query', {
      query: rawQuery,
      limit,
      source,
      results: rows.map((row) => ({ ...row, command: commandForSearchRow(row) })),
    });
    return;
  }
  if (source !== 'SQLite') console.log(`${c.dim}Using ${source}.${c.reset}`);
  console.log(formatKnowledgeRows(rows, c));
}

/**
 * Command: ren10 remove <component> [...more]
 * Remove a previously-added component from rends/components/<name>/ and
 * drop its @import line from rends/components/index.css.
 *
 * Refuses to delete a directory that doesn't match the registry shape
 * (e.g. user-customized component with extra files) unless --force is
 * passed. This protects local overrides.
 */
async function cmdRemove() {
  const cwd = process.cwd();
  const rendsDir = path.join(cwd, 'rends');

  if (!fs.existsSync(rendsDir)) {
    error('rends/ directory not found. Run "npx ren10 init" first.');
  }

  const force = args.includes('--force') || args.includes('-f');
  const positional = args.slice(1).filter((a) => !a.startsWith('-'));

  if (positional.length === 0) {
    error('Please specify one or more component names. Example: npx ren10 remove dialog');
  }

  const componentsIndexPath = path.join(rendsDir, 'components', 'index.css');
  let indexContent = fs.existsSync(componentsIndexPath)
    ? fs.readFileSync(componentsIndexPath, 'utf8')
    : null;

  let removed = 0;
  let skipped = 0;

  for (const componentArg of positional) {
    const name = componentArg.toLowerCase();
    const meta = getComponent(name);
    if (!meta) {
      info(`Skipped "${name}" — unknown. Run "npx ren10 list" to see available components.`);
      skipped++;
      continue;
    }

    const componentDir = path.join(rendsDir, 'components', name);
    if (!fs.existsSync(componentDir)) {
      info(`Skipped "${name}" — not installed in rends/components/${name}.`);
      skipped++;
      continue;
    }

    // Detect local edits / extra files. Compare directory listing to the
    // registry's expected file set. Extra files (or files modified vs the
    // package source) indicate the user has customized this component —
    // refuse to delete without --force.
    if (!force) {
      const localFiles = fs.readdirSync(componentDir);
      const expected = new Set(meta.files);
      const extras = localFiles.filter((f) => !expected.has(f));

      const srcDir = path.join(RENDS_ROOT, 'components', meta.layer, meta.dir);
      const modified = meta.files.filter((f) => {
        const local = path.join(componentDir, f);
        const upstream = path.join(srcDir, f);
        if (!fs.existsSync(local) || !fs.existsSync(upstream)) return false;
        try {
          return fs.readFileSync(local, 'utf8') !== fs.readFileSync(upstream, 'utf8');
        } catch {
          return false;
        }
      });

      if (extras.length > 0 || modified.length > 0) {
        const reasons = [];
        if (extras.length)   reasons.push(`extra file(s): ${extras.join(', ')}`);
        if (modified.length) reasons.push(`modified file(s): ${modified.join(', ')}`);
        info(`Skipped "${name}" — local overrides detected (${reasons.join('; ')}). Re-run with --force to remove anyway.`);
        skipped++;
        continue;
      }
    }

    // Delete the directory recursively (fs.rmSync available since Node 14).
    fs.rmSync(componentDir, { recursive: true, force: true });
    success(`Removed rends/components/${name}/`);
    removed++;

    // Drop the @import line for this component, if present.
    if (indexContent !== null) {
      const importMatch = new RegExp(`^\\s*@import\\s+['"]\\./${name}/[^'"]+['"]\\s*;\\s*$`, 'm');
      if (importMatch.test(indexContent)) {
        indexContent = indexContent.replace(importMatch, '').replace(/\n{3,}/g, '\n\n');
      }
    }
  }

  if (indexContent !== null) {
    fs.writeFileSync(componentsIndexPath, indexContent);
  }

  console.log();
  if (removed > 0) success(`Removed ${removed} component${removed === 1 ? '' : 's'}`);
  if (skipped > 0) info(`Skipped ${skipped} component${skipped === 1 ? '' : 's'}`);
  console.log();
}

/**
 * Command: ren10 upgrade [name] [...]
 * Compare each locally-installed component against the package source.
 * For each differing file, prompt the user (overwrite / skip / show diff
 * / abort). Without args, walks every installed component.
 *
 * Flags:
 *   --force         Overwrite without prompting (CI mode).
 *   --dry-run       Print what would change without writing.
 *
 * Identical files are silently skipped. The pager handles output of
 * potentially large diffs by chunking through readline.
 */
async function cmdUpgrade() {
  const cwd = process.cwd();
  const rendsDir = path.join(cwd, 'rends');

  if (!fs.existsSync(rendsDir)) {
    error('rends/ directory not found. Run "npx ren10 init" first.');
  }

  const force  = args.includes('--force') || args.includes('-f');
  const dryRun = args.includes('--dry-run');
  const positional = args.slice(1).filter((a) => !a.startsWith('-'));

  // Determine which components to consider. Without positional names,
  // upgrade everything we find installed.
  let targets;
  if (positional.length > 0) {
    targets = positional.map((a) => a.toLowerCase());
  } else {
    const componentsDir = path.join(rendsDir, 'components');
    if (!fs.existsSync(componentsDir)) {
      error('rends/components/ not found.');
    }
    targets = fs
      .readdirSync(componentsDir)
      .filter((f) => fs.statSync(path.join(componentsDir, f)).isDirectory());
  }

  if (targets.length === 0) {
    info('No installed components to upgrade.');
    return;
  }

  let upgraded = 0, unchanged = 0, skipped = 0;
  const prompt = await loadPromptModule();

  for (const name of targets) {
    const meta = getComponent(name);
    if (!meta) {
      info(`Skipped "${name}" — unknown.`);
      skipped++;
      continue;
    }

    const localDir = path.join(rendsDir, 'components', name);
    if (!fs.existsSync(localDir)) {
      info(`Skipped "${name}" — not installed.`);
      skipped++;
      continue;
    }

    const srcDir = path.join(RENDS_ROOT, 'components', meta.layer, meta.dir);

    const changes = meta.files
      .map((f) => {
        const local    = path.join(localDir, f);
        const upstream = path.join(srcDir, f);
        if (!fs.existsSync(upstream)) return null;
        const localContent    = fs.existsSync(local) ? fs.readFileSync(local, 'utf8') : null;
        const upstreamContent = fs.readFileSync(upstream, 'utf8');
        if (localContent === upstreamContent) return null;
        return { file: f, local, upstream, localContent, upstreamContent };
      })
      .filter(Boolean);

    if (changes.length === 0) {
      unchanged++;
      continue;
    }

    console.log(`\n${c.bold}${name}${c.reset} ${c.dim}— ${changes.length} file(s) differ${c.reset}`);
    for (const ch of changes) {
      console.log(`  ${c.yellow}~${c.reset} ${ch.file}`);
    }

    let action = 'y';
    if (!force) {
      action = await prompt(
        `Overwrite ${changes.length} file(s) in ${name}? [y]es / [n]o / [d]iff / [a]bort: `
      );
      action = (action || '').toLowerCase().charAt(0) || 'n';

      if (action === 'd') {
        // Show a quick diff for each changed file (first 40 lines).
        for (const ch of changes) {
          console.log(`\n${c.dim}── ${ch.file} ──${c.reset}`);
          printDiff(ch.localContent, ch.upstreamContent);
        }
        action = await prompt(`Overwrite anyway? [y]es / [n]o: `);
        action = (action || '').toLowerCase().charAt(0) || 'n';
      }

      if (action === 'a') {
        info('Aborted by user.');
        prompt.close();
        return;
      }
    }

    if (action === 'y') {
      if (dryRun) {
        success(`(dry-run) would overwrite ${changes.length} file(s) in ${name}/`);
      } else {
        for (const ch of changes) {
          fs.writeFileSync(ch.local, ch.upstreamContent);
        }
        success(`Upgraded ${name} (${changes.length} file(s))`);
      }
      upgraded++;
    } else {
      info(`Skipped ${name}.`);
      skipped++;
    }
  }

  prompt.close();

  console.log();
  if (upgraded > 0)  success(`Upgraded ${upgraded} component${upgraded === 1 ? '' : 's'}`);
  if (unchanged > 0) info(`${unchanged} component${unchanged === 1 ? '' : 's'} already up to date`);
  if (skipped > 0)   info(`Skipped ${skipped} component${skipped === 1 ? '' : 's'}`);
  console.log();
}

/**
 * Print a minimal unified diff for two text blobs.
 * Caps at 40 lines per file to keep terminal output bounded.
 */
function printDiff(localContent, upstreamContent) {
  const localLines    = localContent.split('\n');
  const upstreamLines = upstreamContent.split('\n');
  const max = Math.max(localLines.length, upstreamLines.length);
  let shown = 0;
  for (let i = 0; i < max && shown < 40; i++) {
    const a = localLines[i];
    const b = upstreamLines[i];
    if (a === b) continue;
    if (a !== undefined) { console.log(`${c.red}- ${a}${c.reset}`); shown++; }
    if (b !== undefined) { console.log(`${c.green}+ ${b}${c.reset}`); shown++; }
  }
  if (max > 40) console.log(`${c.dim}…(diff truncated at 40 lines)${c.reset}`);
}

/**
 * Build a thin readline prompt wrapper that returns a function callable as
 * `await prompt(message)` and exposes `.close()` to release the stdin handle.
 */
async function loadPromptModule() {
  const readline = await import('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const fn = (q) => new Promise((resolve) => rl.question(q, (a) => resolve(a)));
  fn.close = () => rl.close();
  return fn;
}

/**
 * Main CLI router
 */
async function main() {
  try {
    if (command === '--json') {
      jsonOut('manifest', buildManifest());
      return;
    }
    switch (command) {
      case 'init':
        await cmdInit();
        break;
      case 'add':
        await cmdAdd();
        break;
      case 'remove':
      case 'rm':
        await cmdRemove();
        break;
      case 'upgrade':
      case 'update':
        await cmdUpgrade();
        break;
      case 'list':
        await cmdList();
        break;
      case 'component':
        await cmdComponent();
        break;
      case 'docs':
        await cmdDocs();
        break;
      case 'search':
        await cmdSearch();
        break;
      case 'build':
        await cmdBuild();
        break;
      case 'manifest':
        await cmdManifest();
        break;
      case 'doctor':
        await cmdDoctor();
        break;
      case 'agent-docs':
      case 'agents':
        await cmdAgentDocs();
        break;
      case 'scales':
        await cmdScales();
        break;
      case 'knowledge':
        await cmdKnowledge();
        break;
      case '--help':
      case '-h':
      case 'help':
        showHelp();
        break;
      case '--version':
      case '-v':
      case 'version':
        showVersion();
        break;
      default:
        if (!command) {
          if (hasFlag('--json')) jsonOut('manifest', buildManifest());
          else showHelp();
        } else {
          error(`Unknown command: ${command}`);
        }
    }
  } catch (err) {
    error(err.message);
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
${c.bold}RenDS CLI${c.reset} — Vanilla Design System

${c.bold}Usage:${c.reset}
  npx ren10 <command> [options]

${c.bold}Commands:${c.reset}
  init              Initialize a new RenDS project
  add <component>   Add one or more components to your project
  add --all         Add all components at once
  remove <name>     Delete a previously-added component (alias: rm)
  upgrade [name]    Refresh installed components from the package source
                    (alias: update; no arg = all installed components)
  list              List all available components
  component <name>  Print component contract summary, imports, usage, aiHints
  docs <topic>      Print design/token/layout/component/eval docs
  search <query>    Search components, docs, examples, selectors, and tokens
  build <idea>      Return a RenDS composition kit for a UI idea
  manifest          Emit the self-describing CLI manifest for agents
  doctor            Diagnose package health and agent-readiness
  agent-docs        Install/update generated RenDS context in agent docs
  scales            List available type scale ratios
  knowledge         Show packaged graph paths
  knowledge query   Query the packaged knowledge graph (SQLite, JSON fallback)
  knowledge check   Validate packaged knowledge graph files
  help, -h          Show this help message
  version, -v       Show version

${c.bold}Init Options:${c.reset}
  --scale <ratio>   Use a modular type scale (e.g., major-third, perfect-fourth)
  --base <px>       Base font size in px (default: 16)
  --fluid           Generate fluid clamp() values for responsive typography
  --density <v>     comfortable | compact | spacious
                    Tells you which data-density attr to add to <html>
  --shape <v>       rounded | sharp | pill
                    Tells you which data-shape attr to add to <html>

${c.bold}Remove / Upgrade Options:${c.reset}
  --force, -f       Bypass safety checks (override detection on remove,
                    skip prompts on upgrade)
  --dry-run         Show what upgrade would do without writing

${c.bold}Examples:${c.reset}
  npx ren10 init
  npx ren10 init --scale perfect-fourth
  npx ren10 init --scale minor-third --base 18 --fluid
  npx ren10 init --density compact --shape sharp
  npx ren10 add button
  npx ren10 add dialog
  npx ren10 add --all
  npx ren10 remove tooltip
  npx ren10 upgrade
  npx ren10 upgrade dialog --dry-run
  npx ren10 list
  npx ren10 manifest --json
  npx ren10 component button --dense
  npx ren10 docs layouts --dense
  npx ren10 search "dialog workflow" --json
  npx ren10 build "dashboard with sidebar"
  npx ren10 doctor
  npx ren10 agent-docs --agent codex
  npx ren10 scales
  npx ren10 knowledge
  npx ren10 knowledge query "ren-toast status"
  npx ren10 knowledge query "ren-toast status" --json
  npx ren10 knowledge check

${c.bold}Docs:${c.reset}
  https://github.com/Rensoconese/ren10
`);
}

/**
 * Show version
 */
function showVersion() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(RENDS_ROOT, 'package.json'), 'utf8')
    );
    console.log(`RenDS v${pkg.version}`);
  } catch {
    console.log('RenDS (version unknown)');
  }
}

// Run CLI
main();
