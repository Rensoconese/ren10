#!/usr/bin/env node
/**
 * Drift gate for ren-essentials.md, the compact entry contract agents read
 * first. The file is hand-written so it stays readable, and this check keeps it
 * honest: every token, class, CLI command, docs topic and path it names must
 * exist in the package, and every count and component list must match the
 * source tree. `npm run design:check` runs it.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const ESSENTIALS_PATH = 'ren-essentials.md';
export const ESSENTIALS_MAX_BYTES = 10 * 1024;
export const ESSENTIALS_MIN_BYTES = 4 * 1024;
const LAYERS = { Primitive: 'primitives', Composite: 'composites', Pattern: 'patterns' };
const REQUIRED_HEADINGS = [
  '## Hard rules',
  '## Load on demand',
  '## Tokens',
  '## Layout primitives',
  '## Component, composite, pattern, block, or example?',
];

const walkCss = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walkCss(abs, out);
    else if (entry.name.endsWith('.css')) out.push(abs);
  }
  return out;
};

const componentDirs = (root, layer) => {
  const dir = path.join(root, 'components', layer);
  return existsSync(dir)
    ? readdirSync(dir).filter((name) => name.startsWith('ren-') && statSync(path.join(dir, name)).isDirectory()).sort()
    : [];
};

/** Prose outside fenced code blocks; fences hold sample markup, not claims. */
const proseOf = (markdown) => markdown.replace(/```[\s\S]*?```/g, '');
const inlineCode = (prose) => [...prose.matchAll(/`([^`\n]+)`/g)].map((match) => match[1]);

/**
 * Validate the entry contract against the package at `root`. Pass `text` to
 * check a candidate revision without writing it (used by the tests).
 */
export function validateEssentials(root, { text: candidate } = {}) {
  const errors = [];
  const file = path.join(root, ESSENTIALS_PATH);
  if (candidate === undefined && !existsSync(file)) return { ok: false, errors: [`${ESSENTIALS_PATH} is missing`] };
  const text = candidate ?? readFileSync(file, 'utf8');
  const bytes = Buffer.byteLength(text);
  if (bytes > ESSENTIALS_MAX_BYTES) errors.push(`${ESSENTIALS_PATH} is ${bytes} bytes; keep it under ${ESSENTIALS_MAX_BYTES}. Move detail to the contract it belongs to.`);
  if (bytes < ESSENTIALS_MIN_BYTES) errors.push(`${ESSENTIALS_PATH} is ${bytes} bytes; it must still carry the rules, tokens, layouts and routing.`);
  for (const heading of REQUIRED_HEADINGS) {
    if (!text.includes(`\n${heading}\n`)) errors.push(`${ESSENTIALS_PATH} is missing the "${heading}" section`);
  }

  const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  const version = /^# RenDS essentials · v(\d+\.\d+\.\d+)$/m.exec(text)?.[1];
  if (version !== pkg.version) errors.push(`${ESSENTIALS_PATH} names v${version ?? '?'}; package.json is ${pkg.version}`);

  const prose = proseOf(text);
  const code = inlineCode(prose);

  // Tokens: every custom property named must be defined somewhere shipped.
  const css = [
    ...walkCss(path.join(root, 'tokens')),
    ...walkCss(path.join(root, 'base')),
    ...walkCss(path.join(root, 'components')),
    path.join(root, 'themes', 'appearance.css'),
  ].filter(existsSync).map((abs) => readFileSync(abs, 'utf8')).join('\n');
  const tokens = new Set();
  for (const snippet of code) {
    if (snippet.includes('npx ren10')) continue;
    for (const match of snippet.matchAll(/(?<![\w-])(--[a-z][a-z0-9-]*[a-z0-9])(?![\w*-])/g)) tokens.add(match[1]);
  }
  for (const token of tokens) {
    if (!new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*:`).test(css)) {
      errors.push(`${ESSENTIALS_PATH} names ${token}, which no shipped stylesheet defines`);
    }
  }

  // Classes and custom elements: `ren-stack`, `<ren-sheet>`.
  const allComponents = new Set(Object.values(LAYERS).flatMap((layer) => componentDirs(root, layer)));
  const classes = new Set();
  for (const snippet of code) {
    if (snippet.includes('npx ren10') || snippet.includes('/') || /\.(?:md|css|js|json|html)$/.test(snippet)) continue;
    for (const match of snippet.matchAll(/(?<![\w<-])(?:<)?(ren-[a-z0-9-]*[a-z0-9])(?![\w*<-])/g)) {
      if (!match[0].startsWith('--')) classes.add(match[1]);
    }
  }
  for (const className of classes) {
    const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!allComponents.has(className) && !new RegExp(`\\.${escaped}(?![\\w-])`).test(css)) {
      errors.push(`${ESSENTIALS_PATH} names ${className}, which is neither a component nor a shipped selector`);
    }
  }

  // Paths named in inline code must ship.
  for (const snippet of code) {
    if (/[\s<>*…|"]|^[@.-]|^npx /.test(snippet)) continue;
    if (!/\/|\.(?:md|css|js|json|html)$/.test(snippet)) continue;
    // Colocated contract names are a convention, not a single file.
    if (['component.md', 'pattern.md'].includes(snippet)) continue;
    if (!existsSync(path.join(root, snippet))) errors.push(`${ESSENTIALS_PATH} points at ${snippet}, which does not exist`);
  }

  // CLI commands and docs topics must be real.
  const manifestRun = spawnSync(process.execPath, [path.join(root, 'cli', 'index.js'), 'manifest', '--json'], {
    cwd: root,
    encoding: 'utf8',
  });
  if (manifestRun.status !== 0) {
    errors.push(`ren10 manifest --json failed: ${manifestRun.stderr || manifestRun.stdout}`);
  } else {
    const manifest = JSON.parse(manifestRun.stdout).data;
    const commands = new Set(manifest.commands.map((command) => command.name));
    const topics = new Set(Object.entries(manifest.docs).flatMap(([key, doc]) => [key, ...(doc.aliases ?? [])]));
    for (const match of text.matchAll(/npx ren10 ([a-z][a-z-]*)(?: ([a-z<][a-z0-9<>-]*))?/g)) {
      if (!commands.has(match[1])) errors.push(`${ESSENTIALS_PATH} uses unknown command "npx ren10 ${match[1]}"`);
      if (match[1] === 'docs' && match[2] && !match[2].startsWith('<') && !topics.has(match[2])) {
        errors.push(`${ESSENTIALS_PATH} uses unknown docs topic "${match[2]}"`);
      }
    }
  }

  // Counts and component lists must match the tree.
  const counts = Object.fromEntries(Object.entries(LAYERS).map(([, layer]) => [layer, componentDirs(root, layer).length]));
  const total = counts.primitives + counts.composites + counts.patterns;
  const expectedSummary = `${total} components (${counts.primitives} primitives, ${counts.composites} composites, ${counts.patterns} patterns)`;
  if (!prose.replace(/\s+/g, ' ').includes(expectedSummary)) errors.push(`${ESSENTIALS_PATH} must state "${expectedSummary}"`);
  for (const [label, layer] of Object.entries(LAYERS)) {
    const match = new RegExp(`\\*\\*${label}\\*\\* \\([^)]*\\):\\s*([a-z0-9,\\s-]+)\\.`).exec(prose);
    const listed = match ? match[1].split(',').map((name) => name.trim()).filter(Boolean).sort() : [];
    const actual = componentDirs(root, layer).map((dir) => dir.replace(/^ren-/, ''));
    if (JSON.stringify(listed) !== JSON.stringify(actual)) {
      errors.push(`${ESSENTIALS_PATH} ${label} list drifted. Expected: ${actual.join(', ')}`);
    }
  }

  const catalogPath = path.join(root, 'templates', 'blocks', 'catalog.json');
  if (existsSync(catalogPath)) {
    const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
    if (!prose.includes(`${catalog.count} ready-made page-section blocks`)) {
      errors.push(`${ESSENTIALS_PATH} must state "${catalog.count} ready-made page-section blocks"`);
    }
    const families = Object.entries(catalog.families).map(([key, family]) => `${key} (${family.count})`).join(', ');
    if (!prose.replace(/\s+/g, ' ').includes(`Families: ${families}.`)) {
      errors.push(`${ESSENTIALS_PATH} block families drifted. Expected: "Families: ${families}."`);
    }
  }

  return { ok: errors.length === 0, errors, bytes };
}

const isDirectRun = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  const root = path.resolve(import.meta.dirname, '..');
  const result = validateEssentials(root);
  if (!result.ok) {
    for (const message of result.errors) console.error(message);
    process.exit(1);
  }
  console.log(`Ren10 essentials: OK (${result.bytes} bytes).`);
}
