#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const integrity = 'yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const input = process.argv[2];
assert.ok(input, 'Usage: node scripts/vendor-braces.mjs /path/to/official-braces-3.0.3.tgz');
assert.equal(createHash('sha512').update(fs.readFileSync(input)).digest('base64'), integrity, 'Upstream braces integrity changed');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'ren10-braces-'));
try {
  execFileSync('tar', ['-xzf', path.resolve(input), '-C', temporary]);
  const directory = path.join(temporary, 'package');
  const patch = (file, changes) => {
    const target = path.join(directory, file);
    let source = fs.readFileSync(target, 'utf8');
    for (const [before, after, expected = 1] of changes) {
      assert.equal(source.split(before).length - 1, expected, `${file}: unexpected patch context`);
      source = source.split(before).join(after);
    }
    fs.writeFileSync(target, source);
  };
  const helper = "const { assertDepth, assertNode, assertOptions, assertScalar, assertRangeArgs } = require('./safety');\n";
  for (const file of ['compile', 'stringify', 'expand', 'parse', 'utils']) {
    patch(`lib/${file}.js`, [["'use strict';\n", "'use strict';\n\n" + helper]]);
  }
  patch('lib/parse.js', [
    ['      stack.push(block);', '      assertDepth(stack.length + 1);\n      stack.push(block);', 2],
  ]);
  patch('lib/compile.js', [
    ['const walk = (node, parent = {}) => {', 'const walk = (node, parent = {}, depth = 0) => {\n    assertDepth(depth);\n    assertNode(node);'],
    ['walk(child, node)', 'walk(child, node, depth + 1)'],
  ]);
  patch('lib/stringify.js', [
    ['const stringify = (node, parent = {}) => {', 'const stringify = (node, parent = {}, depth = 0) => {\n    assertDepth(depth);\n    assertNode(node);'],
    ['stringify(child)', 'stringify(child, {}, depth + 1)'],
  ]);
  patch('lib/expand.js', [
    ["const append = (queue = '', stash = '', enclose = false) => {", "const append = (queue = '', stash = '', enclose = false, depth = 0) => {\n  assertDepth(depth);"],
    ['append(value, stash, enclose)', 'append(value, stash, enclose, depth + 1)'],
    ['append(item, ele, enclose)', 'append(item, ele, enclose, depth + 1)'],
    ['const walk = (node, parent = {}) => {', 'const walk = (node, parent = {}, depth = 0) => {\n    assertDepth(depth);\n    assertNode(node);'],
    ['walk(child, node)', 'walk(child, node, depth + 1)'],
    ['    while (p.type', '    let parentDepth = 0;\n    while (p.type'],
    ['      p = p.parent;', '      assertDepth(++parentDepth);\n      p = p.parent;'],
    ['    while (block.type', '    let blockDepth = 0;\n    while (block.type'],
    ['      block = block.parent;', '      assertDepth(++blockDepth);\n      block = block.parent;'],
  ]);
  patch('lib/utils.js', [
    ['const flat = arr => {', 'const flat = (arr, depth = 0) => {\n    assertDepth(depth);'],
    ['flat(ele)', 'flat(ele, depth + 1)'],
  ]);
  patch('index.js', [["const stringify = require('./lib/stringify');", "const { assertScalar } = require('./lib/safety');\nconst stringify = require('./lib/stringify');"],
    ['  if (input ===', "  assertScalar(input.length, 'input.length');\n  if (input ==="],
    ['        output.push(...result);', '        for (const value of result) output.push(value);']]);
  patch('lib/parse.js', [["const parse = (input, options = {}) => {", "const parse = (input, options = {}) => {\n  assertOptions(options);"],
    ["typeof opts.maxLength === 'number' ?", "typeof opts.maxLength === 'number' && !Number.isNaN(opts.maxLength) ?"]]);
  patch('lib/compile.js', [['const compile = (ast, options = {}) => {', 'const compile = (ast, options = {}) => {\n  assertOptions(options);'],
    ['      const args = utils.reduce(node.nodes);', '      const args = utils.reduce(node.nodes);\n      assertRangeArgs(args);']]);
  patch('lib/stringify.js', [['module.exports = (ast, options = {}) => {', 'module.exports = (ast, options = {}) => {\n  assertOptions(options);']]);
  patch('lib/expand.js', [['      const child = node.nodes[i];', '      const child = node.nodes[i];\n      assertNode(child);']]);
  patch('lib/expand.js', [['const expand = (ast, options = {}) => {', 'const expand = (ast, options = {}) => {\n  assertOptions(options);'],
    ['      const args = utils.reduce(node.nodes);', '      const args = utils.reduce(node.nodes);\n      assertRangeArgs(args);']]);
  patch('lib/utils.js', [
    ['exports.encloseBrace = node => {', 'exports.encloseBrace = node => {\n  assertNode(node);'],
    ['exports.isInvalidBrace = block => {', 'exports.isInvalidBrace = block => {\n  assertNode(block);'],
    ['  if (limit === false)', "  assertScalar(step, 'step');\n  assertScalar(limit, 'rangeLimit');\n  if (limit === false)"],
    ["  if (node.type === 'text') acc.push(node.value);", "  assertNode(node);\n  if (node.type === 'text') acc.push(node.value);"],
  ]);
  const safety = `'use strict';

// Fixed and non-disableable; do not trust an AST's own depth metadata.
const MAX_DEPTH = 128;
exports.MAX_DEPTH = MAX_DEPTH;
exports.assertDepth = depth => {
  if (depth > MAX_DEPTH) {
    const error = new RangeError('braces nesting exceeds safety limit (' + MAX_DEPTH + ')');
    error.code = 'BRACES_NESTING_LIMIT';
    throw error;
  }
};
exports.assertScalar = (value, field) => {
  if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
    const error = new TypeError('braces expects a scalar ' + field);
    error.code = 'BRACES_INVALID_ARGUMENT';
    throw error;
  }
};
exports.assertNode = node => {
  for (const field of ['value', 'commas', 'ranges']) exports.assertScalar(node[field], 'AST ' + field);
};
exports.assertOptions = options => {
  if (!options) return;
  for (const field of ['step', 'rangeLimit', 'relaxZeros', 'shorthand', 'capture', 'wrap']) {
    exports.assertScalar(options[field], 'option ' + field);
  }
};
exports.assertRangeArgs = args => {
  if (args.length > 3) {
    const error = new TypeError('braces range accepts at most three scalar arguments');
    error.code = 'BRACES_INVALID_ARGUMENT';
    throw error;
  }
};
`;
  fs.writeFileSync(path.join(directory, 'lib/safety.js'), safety);
  const manifestPath = path.join(directory, 'package.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.name, 'braces');
  assert.equal(manifest.version, '3.0.3');
  manifest.name = '@ren10/braces';
  manifest.version = '3.0.3-ren10.1';
  manifest.private = true;
  manifest.description += ' Private Ren10 security derivative; not an upstream release.';
  manifest.ren10Patch = {
    revision: 1,
    upstreamName: 'braces',
    upstreamVersion: '3.0.3',
    upstream: 'https://registry.npmjs.org/braces/-/braces-3.0.3.tgz',
    upstreamIntegrity: `sha512-${integrity}`,
    advisory: 'GHSA-vfj7-8cjw-p6xm',
    maxNesting: 128,
    change: 'Bound all nesting and parent traversal, reject container-to-scalar coercion and oversized range argument lists, avoid spread of expanded results',
  };
  const codeFiles = ['index.js', 'lib/compile.js', 'lib/constants.js', 'lib/expand.js', 'lib/parse.js', 'lib/stringify.js', 'lib/utils.js', 'lib/safety.js'];
  manifest.ren10Patch.codeHashes = Object.fromEntries(codeFiles.map(file => [file,
    createHash('sha256').update(fs.readFileSync(path.join(directory, file))).digest('hex')]));
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  const vendor = path.join(root, 'vendor');
  fs.mkdirSync(vendor, { recursive: true });
  execFileSync('npm', ['pack', '--ignore-scripts', '--cache', path.join(temporary, 'npm-cache'), '--pack-destination', vendor], { cwd: directory, stdio: 'pipe' });
  const output = path.join(vendor, 'braces-3.0.3-ren10.1.tgz');
  fs.renameSync(path.join(vendor, 'ren10-braces-3.0.3-ren10.1.tgz'), output);
  console.log(`Private patched braces written: ${output}`);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
