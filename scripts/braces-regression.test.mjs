import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const require = createRequire(import.meta.url);
const braces = require('braces');
const installed = path.dirname(require.resolve('braces/package.json'));
const child = String.raw`
const path = require('node:path');
const directory = process.argv[1], scenario = process.argv[2], api = process.argv[3];
const braces = require(directory);
const options = { maxLength: NaN, maxDepth: Infinity, rangeLimit: false };
const depth = 4000;
try {
  let input;
  if (scenario === 'braces') input = '{'.repeat(depth) + 'x' + '}'.repeat(depth);
  if (scenario === 'parens') input = '('.repeat(depth) + 'x' + ')'.repeat(depth);
  if (scenario === 'mixed') input = '{('.repeat(2000) + 'x' + ')}'.repeat(2000);
  if (scenario === 'unmatched') input = '{('.repeat(2000) + 'x';
  if (scenario === 'range-comma') input = '{' + '('.repeat(2000) + '1..3,x' + ')'.repeat(2000) + '}';
  if (scenario === 'ast' || scenario === 'ast-cycle') {
    input = { type: 'root', nodes: [] }; let node = input;
    for (let i = 0; i < depth; i++) { const next = { type: 'paren', depth: 0, nodes: [], parent: node }; node.nodes.push(next); node = next; }
    node.nodes.push(scenario === 'ast-cycle' ? input : { type: 'text', value: 'x' });
  }
  if (scenario === 'cycle') { input = { type: 'root', nodes: [] }; input.nodes.push(input); }
  if (scenario === 'parent-cycle') {
    input = { type: 'paren', nodes: [] }; const parent = { type: 'paren', nodes: [], parent: input }; input.parent = parent;
  }
  if (scenario === 'array' || scenario === 'array-cycle') {
    let array = scenario === 'array-cycle' ? [] : ['x'];
    if (scenario === 'array-cycle') array.push(array);
    else for (let i = 0; i < depth; i++) array = [array];
    if (api === 'flatten') input = array;
    else input = { type: 'root', nodes: [{ type: 'text', value: array }] };
  }
  if (scenario.startsWith('coerce-')) {
    let nested = ['x']; for (let i = 0; i < depth; i++) nested = [nested];
    const field = scenario.slice(7);
    input = { type: 'brace', open: true, close: true, commas: 1, ranges: 0, nodes: [] };
    if (field === 'value') { input.type = 'open'; input.isOpen = true; input.invalid = true; input.value = nested; options.escapeInvalid = true; }
    else if (field === 'length') input.length = nested;
    else if (['commas','ranges'].includes(field)) input[field] = nested;
    else { input = braces.parse('{1..3}'); options[field] = nested; options.toRegex = true; }
  }
  if (scenario === 'range-args') input = { type: 'brace', open: true, close: true, commas: 0, ranges: 1, nodes: Array(200000).fill({ type: 'text', value: '1' }) };
  let fn = braces[api];
  if (api === 'main') fn = braces;
  if (api.startsWith('lib-')) fn = require(path.join(directory, 'lib', api.slice(4)));
  if (api === 'flatten') fn = require(path.join(directory, 'lib/utils')).flatten;
  if (api.startsWith('lib-') && typeof input === 'string' && api !== 'lib-parse') input = braces.parse(input, options);
  fn(input, options);
  console.log(JSON.stringify({ accepted: true }));
} catch (error) {
  console.log(JSON.stringify({ name: error.name, code: error.code, message: error.message }));
}
`;
function run(scenario, api, directory = installed) {
  const result = spawnSync(process.execPath, ['--max-old-space-size=64', '-e', child, directory, scenario, api], { encoding: 'utf8', timeout: 3000 });
  assert.equal(result.error, undefined, `${scenario}/${api}: ${result.error?.message}`);
  assert.equal(result.status, 0, `${scenario}/${api}: ${result.stderr}`);
  return JSON.parse(result.stdout.trim());
}
for (const scenario of ['braces', 'parens', 'mixed', 'unmatched', 'range-comma']) {
  for (const api of ['main', 'create', 'parse', 'compile', 'expand', 'stringify', 'lib-parse']) {
    test(`${scenario}/${api}: rejects nesting before stack exhaustion`, () => {
      const result = run(scenario, api);
      assert.equal(result.name, 'RangeError');
      assert.equal(result.code, 'BRACES_NESTING_LIMIT');
      assert.match(result.message, /safety limit \(128\)/);
      assert.doesNotMatch(result.message, /Maximum call stack/i);
    });
  }
}
for (const scenario of ['ast', 'ast-cycle', 'cycle']) {
  for (const api of ['compile', 'expand', 'stringify', 'lib-compile', 'lib-expand', 'lib-stringify']) {
    test(`${scenario}/${api}: protects direct ASTs without trusting depth metadata`, () => {
      assert.equal(run(scenario, api).code, 'BRACES_NESTING_LIMIT');
    });
  }
}
for (const api of ['expand', 'lib-expand']) {
  test(`parent-cycle/${api}: terminates bounded parent traversal`, () => {
    assert.equal(run('parent-cycle', api).code, 'BRACES_NESTING_LIMIT');
  });
}
for (const scenario of ['array', 'array-cycle']) {
  for (const api of ['expand', 'lib-expand', 'flatten']) {
    test(`${scenario}/${api}: bounds nested expansion queues and helper arrays`, () => {
      assert.equal(run(scenario, api).code, api === 'flatten' ? 'BRACES_NESTING_LIMIT' : 'BRACES_INVALID_ARGUMENT');
    });
  }
}
for (const field of ['value', 'commas', 'ranges']) {
  for (const api of ['compile', 'expand', 'stringify', 'lib-compile', 'lib-expand', 'lib-stringify']) {
    test(`coerce-${field}/${api}: rejects containers before native coercion`, () => {
      const result = run(`coerce-${field}`, api);
      assert.equal(result.name, 'TypeError'); assert.equal(result.code, 'BRACES_INVALID_ARGUMENT');
    });
  }
}
for (const field of ['step', 'rangeLimit', 'relaxZeros', 'shorthand', 'capture', 'wrap']) {
  for (const api of ['compile', 'expand', 'lib-compile', 'lib-expand']) {
    test(`coerce-${field}/${api}: rejects invalid option containers`, () => {
      assert.equal(run(`coerce-${field}`, api).code, 'BRACES_INVALID_ARGUMENT');
    });
  }
}
for (const api of ['create', 'main']) {
  test(`coerce-length/${api}: checks before the create fast path`, () => {
    assert.equal(run('coerce-length', api).code, 'BRACES_INVALID_ARGUMENT');
  });
}
for (const api of ['compile', 'expand', 'lib-compile', 'lib-expand']) {
  test(`range-args/${api}: rejects malformed ranges before an argument spread`, () => {
    assert.equal(run('range-args', api).code, 'BRACES_INVALID_ARGUMENT');
  });
}
test('ordinary patterns preserve compilation, expansion, escaping and options', () => {
  assert.deepEqual(braces('components/{primitives,composites}/**/*.css'), ['components/(primitives|composites)/**/*.css']);
  assert.deepEqual(braces.expand('x{a,{b,c}}y'), ['xay', 'xby', 'xcy']);
  assert.deepEqual(braces.expand('{01..03}'), ['01', '02', '03']);
  assert.deepEqual(braces.expand('{a,,a}', { nodupes: true, noempty: true }), ['a']);
  assert.deepEqual(braces.expand('${a,b}'), ['${a,b}']);
  assert.equal(braces.stringify('x{abc}y', { escapeInvalid: true }), 'x{abc}y');
  assert.equal(braces.compile('x{abc}y', { escapeInvalid: true }), 'x\\{abc\\}y');
  assert.deepEqual(braces.expand('{1..3,x}'), ['1..3', 'x']);
  assert.deepEqual(braces.expand('a\\{b,c\\}', { keepEscaping: true }), ['a\\{b,c\\}']);
  assert.throws(() => braces.parse(12), TypeError);
  assert.throws(() => braces.parse('x'.repeat(10001)), SyntaxError);
  assert.throws(() => braces.expand('{1..1001}'), /range limit/);
  assert.equal(braces.expand('{1..1001}', { rangeLimit: false }).length, 1001);
  assert.deepEqual(braces.expand('{1..5}', { step: '2' }), ['1', '3', '5']);
  assert.deepEqual(braces.expand('{1..3}', { transform: value => `v${value}` }), ['v1', 'v2', 'v3']);
  assert.throws(() => braces.parse('x'.repeat(10001), { maxLength: NaN }), SyntaxError);
  const ordinaryDepth = 64;
  const pattern = '('.repeat(ordinaryDepth) + 'x' + ')'.repeat(ordinaryDepth);
  assert.equal(braces.compile(pattern), pattern);
  assert.equal(braces.stringify(pattern), pattern);
  assert.deepEqual(braces.expand(pattern), [pattern]);
});
test('shared AST references remain legitimate and guards reset after an error', () => {
  const leaf = { type: 'text', value: 'x' };
  const ast = { type: 'root', nodes: [leaf, leaf] };
  assert.equal(braces.compile(ast), 'xx');
  assert.equal(braces.stringify(ast), 'xx');
  assert.deepEqual(braces.expand(ast), ['xx']);
  assert.throws(() => braces.compile('{'.repeat(200) + 'x' + '}'.repeat(200)), { code: 'BRACES_NESTING_LIMIT' });
  assert.equal(braces.compile('{a,b}'), '(a|b)');
});
test('fast-glob positive and ignore paths use the protected artifact', () => {
  const fastGlob = require('fast-glob');
  const normal = fastGlob.sync('components/{primitives,composites}/**/*.css', { cwd: path.resolve(installed, '../..') });
  assert.ok(normal.length > 40);
  const hostile = '{'.repeat(4000) + 'x' + '}'.repeat(4000);
  assert.throws(() => fastGlob.sync(hostile), { code: 'BRACES_NESTING_LIMIT' });
  assert.throws(() => fastGlob.sync('components/**/*.css', { ignore: [hostile] }), { code: 'BRACES_NESTING_LIMIT' });
});
