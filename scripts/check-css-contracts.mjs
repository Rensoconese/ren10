#!/usr/bin/env node
/**
 * Validate the RenDS CSS custom-property contract.
 *
 * The check intentionally has three independent failure classes:
 *   - custom properties referenced without a declaration, runtime assignment,
 *     inline fallback, or explicit instance-property exemption;
 *   - central Appearance API tokens with no `var(--token)` consumer outside
 *     `tokens/component/tokens.css`;
 *   - public `--ren-*` tokens named by colocated contracts but absent from CSS.
 */

import { readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { walkCssFiles } from './lint-tokens.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');

export const INTENTIONAL_INSTANCE_PROPERTIES = new Set([
  '--scroll-max',
  '--value',
]);

const CUSTOM_PROPERTY_DECLARATION = /(--[\w-]+)\s*:/g;
const CONTRACT_TOKEN = /--ren-[a-z0-9][\w-]*/gi;

function toPosix(path) {
  return path.split(/[\\/]/).join('/');
}

function lineAt(source, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) {
    if (source.charCodeAt(i) === 10) line += 1;
  }
  return line;
}

function maskCommentsAndStrings(source) {
  let result = '';
  let mode = 'code';

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];

    if (mode === 'comment') {
      if (char === '*' && next === '/') {
        result += '  ';
        i += 1;
        mode = 'code';
      } else {
        result += char === '\n' ? '\n' : ' ';
      }
      continue;
    }

    if (mode === 'single' || mode === 'double') {
      const quote = mode === 'single' ? "'" : '"';
      if (char === '\\' && next !== undefined) {
        result += '  ';
        i += 1;
      } else if (char === quote) {
        result += ' ';
        mode = 'code';
      } else {
        result += char === '\n' ? '\n' : ' ';
      }
      continue;
    }

    if (char === '/' && next === '*') {
      result += '  ';
      i += 1;
      mode = 'comment';
    } else if (char === "'") {
      result += ' ';
      mode = 'single';
    } else if (char === '"') {
      result += ' ';
      mode = 'double';
    } else {
      result += char;
    }
  }

  return result;
}

function skipQuoted(source, start, quote) {
  for (let i = start + 1; i < source.length; i += 1) {
    if (source[i] === '\\' && source[i + 1] !== undefined) {
      i += 1;
    } else if (source[i] === quote) {
      return i + 1;
    }
  }
  return source.length;
}

function scanRuntimeAssignments(source) {
  const assignments = [];
  const method = '.style.setProperty';

  for (let i = 0; i < source.length; ) {
    const char = source[i];
    const next = source[i + 1];

    if (char === '/' && next === '/') {
      const lineEnd = source.indexOf('\n', i + 2);
      i = lineEnd === -1 ? source.length : lineEnd;
      continue;
    }

    if (char === '/' && next === '*') {
      const commentEnd = source.indexOf('*/', i + 2);
      i = commentEnd === -1 ? source.length : commentEnd + 2;
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      i = skipQuoted(source, i, char);
      continue;
    }

    if (!source.startsWith(method, i)) {
      i += 1;
      continue;
    }

    let cursor = i + method.length;
    while (/\s/.test(source[cursor] ?? '')) cursor += 1;
    if (source[cursor] !== '(') {
      i += method.length;
      continue;
    }

    cursor += 1;
    while (/\s/.test(source[cursor] ?? '')) cursor += 1;
    const quote = source[cursor];
    if (quote !== "'" && quote !== '"') {
      i += method.length;
      continue;
    }

    const valueStart = cursor + 1;
    const valueEnd = skipQuoted(source, cursor, quote) - 1;
    const token = source.slice(valueStart, valueEnd);
    if (/^--[\w-]+$/.test(token)) assignments.push({ token, index: i });
    i = Math.max(valueEnd + 1, i + method.length);
  }

  return assignments;
}

function scanRuntimeReads(source) {
  const reads = [];
  const matcher = /getComputedStyle\s*\([^)]*\)\s*\.getPropertyValue\s*\(\s*(['"])(--[\w-]+)\1\s*\)/g;
  let match;
  while ((match = matcher.exec(source))) {
    reads.push({ token: match[2], index: match.index });
  }
  return reads;
}

function scanVarReferences(source) {
  const references = [];
  const matcher = /\bvar\(\s*(--[\w-]+)/g;
  let match;

  while ((match = matcher.exec(source))) {
    const openParen = source.indexOf('(', match.index);
    let depth = 1;
    let hasFallback = false;

    for (let i = matcher.lastIndex; i < source.length && depth > 0; i += 1) {
      if (source[i] === '(') depth += 1;
      if (source[i] === ')') depth -= 1;
      if (source[i] === ',' && depth === 1) hasFallback = true;
    }

    references.push({
      token: match[1],
      hasFallback,
      index: openParen,
    });
  }

  return references;
}

async function walkFiles(dir, predicate) {
  const out = [];
  let entries;

  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') return out;
    throw error;
  }

  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walkFiles(path, predicate)));
    } else if (entry.isFile() && predicate(entry.name)) {
      out.push(path);
    }
  }

  return out;
}

function addLocation(map, token, location) {
  const locations = map.get(token) ?? [];
  locations.push(location);
  map.set(token, locations);
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

export async function analyzeCssContracts({
  packageRoot,
  cssFiles,
  jsFiles,
  contractFiles,
  appearanceTokenFile,
  allowedInstanceProperties = INTENTIONAL_INSTANCE_PROPERTIES,
}) {
  const declarations = new Map();
  const references = new Map();
  const runtimeAssignments = new Map();
  const appearanceDeclarations = new Set();
  const appearanceConsumers = new Set();
  const cssTokens = new Set();
  const contractTokens = new Map();
  const normalizedAppearanceFile = resolve(appearanceTokenFile);

  for (const file of cssFiles) {
    const source = await readFile(file, 'utf8');
    const masked = maskCommentsAndStrings(source);
    const rel = toPosix(relative(packageRoot, file));
    const isAppearanceFile = resolve(file) === normalizedAppearanceFile;
    let match;

    CUSTOM_PROPERTY_DECLARATION.lastIndex = 0;
    while ((match = CUSTOM_PROPERTY_DECLARATION.exec(masked))) {
      addLocation(declarations, match[1], { path: rel, line: lineAt(masked, match.index) });
      if (isAppearanceFile && match[1].startsWith('--ren-')) {
        appearanceDeclarations.add(match[1]);
      }
    }

    for (const reference of scanVarReferences(masked)) {
      addLocation(references, reference.token, {
        path: rel,
        line: lineAt(masked, reference.index),
        hasFallback: reference.hasFallback,
      });
      if (!isAppearanceFile) appearanceConsumers.add(reference.token);
    }

    CONTRACT_TOKEN.lastIndex = 0;
    while ((match = CONTRACT_TOKEN.exec(masked))) {
      if (!match[0].endsWith('-')) cssTokens.add(match[0]);
    }
  }

  for (const file of jsFiles) {
    const source = await readFile(file, 'utf8');
    const rel = toPosix(relative(packageRoot, file));

    for (const assignment of scanRuntimeAssignments(source)) {
      addLocation(runtimeAssignments, assignment.token, {
        path: rel,
        line: lineAt(source, assignment.index),
      });
    }
    for (const read of scanRuntimeReads(source)) {
      appearanceConsumers.add(read.token);
    }
  }

  for (const file of contractFiles) {
    const source = await readFile(file, 'utf8');
    const rel = toPosix(relative(packageRoot, file));
    let match;

    CONTRACT_TOKEN.lastIndex = 0;
    while ((match = CONTRACT_TOKEN.exec(source))) {
      const token = match[0];
      if (token.endsWith('-')) continue;
      addLocation(contractTokens, token, {
        path: rel,
        line: lineAt(source, match.index),
      });
    }
  }

  const unresolved = sorted(
    [...references.entries()]
      .filter(([token, locations]) => {
        const hasRequiredReference = locations.some((location) => !location.hasFallback);
        return (
          hasRequiredReference &&
          !declarations.has(token) &&
          !runtimeAssignments.has(token) &&
          !allowedInstanceProperties.has(token)
        );
      })
      .map(([token]) => token),
  );
  const unconsumed = sorted(
    [...appearanceDeclarations].filter((token) => !appearanceConsumers.has(token)),
  );
  const contractAbsent = sorted(
    [...contractTokens.keys()].filter((token) => !cssTokens.has(token)),
  );

  const errors = [
    ...unresolved.map((token) => ({ kind: 'unresolved', token })),
    ...unconsumed.map((token) => ({ kind: 'unconsumed', token })),
    ...contractAbsent.map((token) => ({ kind: 'contract-absent', token })),
  ];

  return {
    unresolved,
    unconsumed,
    contractAbsent,
    errors,
    locations: {
      declarations,
      references,
      runtimeAssignments,
      contractTokens,
    },
  };
}

export async function analyzeRepository(packageRoot = PKG_ROOT) {
  const roots = ['tokens', 'base', 'components'].map((dir) => join(packageRoot, dir));
  const cssFiles = [];

  for (const root of roots) {
    try {
      cssFiles.push(...(await walkCssFiles(root)));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  const jsFiles = [];
  for (const dir of ['components', 'base', 'utils']) {
    jsFiles.push(
      ...(await walkFiles(join(packageRoot, dir), (name) => /\.(?:js|mjs)$/.test(name))),
    );
  }

  const contractFiles = await walkFiles(
    join(packageRoot, 'components'),
    (name) => name === 'component.md' || name === 'pattern.md',
  );

  return analyzeCssContracts({
    packageRoot,
    cssFiles,
    jsFiles,
    contractFiles,
    appearanceTokenFile: join(packageRoot, 'tokens/component/tokens.css'),
  });
}

function printGroup(title, tokens, locations) {
  if (tokens.length === 0) return;
  console.error(`\n${title} (${tokens.length})`);
  for (const token of tokens) {
    console.error(`  ${token}`);
    for (const location of locations.get(token) ?? []) {
      console.error(`    ${location.path}:${location.line}`);
    }
  }
}

async function main() {
  const result = await analyzeRepository();

  if (result.errors.length === 0) {
    console.log('RenDS CSS contracts: OK');
    return;
  }

  printGroup('Unresolved custom properties', result.unresolved, result.locations.references);
  printGroup(
    'Unconsumed Appearance API tokens',
    result.unconsumed,
    result.locations.declarations,
  );
  printGroup(
    'Contract tokens absent from CSS',
    result.contractAbsent,
    result.locations.contractTokens,
  );
  console.error(`\nRenDS CSS contracts: ${result.errors.length} violation(s).`);
  process.exitCode = 1;
}

const isDirectRun =
  process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectRun) {
  await main();
}
