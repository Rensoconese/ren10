import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

// GHSA-fc5q-39xc-vjpf: a repeated extglob whose body holds a `*` wildcard
// compiles to a nested unbounded quantifier and backtracks exponentially.
// vendor/picomatch-4.0.7-ren10.1.tgz is the private derivative that closes it;
// see vendor/README.md.
const require = createRequire(import.meta.url);
const installed = path.dirname(require.resolve('picomatch/package.json'));

/** Match `input` against `pattern` in a child process that is killed after `timeout` ms. */
function matchInChild(directory, pattern, input, timeout = 3000) {
  const child = `const pm = require(process.argv[1]); console.log(JSON.stringify(pm.isMatch(process.argv[3], process.argv[2])));`;
  const result = spawnSync(process.execPath, ['-e', child, directory, pattern, input], { encoding: 'utf8', timeout });
  return { timedOut: result.error?.code === 'ETIMEDOUT' || result.signal === 'SIGTERM', value: result.stdout.trim(), stderr: result.stderr };
}

test('picomatch is the reviewed private derivative, everywhere in the tree', () => {
  const manifest = require('picomatch/package.json');
  assert.equal(manifest.name, '@ren10/picomatch');
  assert.equal(manifest.version, '4.0.7-ren10.1');
  assert.equal(manifest.ren10Patch.advisory, 'GHSA-fc5q-39xc-vjpf');
  // The 2.x consumers (micromatch for stylelint and fast-glob, anymatch for
  // unstorage) and the 4.x ones (astro, vite, tinyglobby) all load this copy.
  for (const consumer of ['micromatch', 'anymatch', 'tinyglobby', 'vite', 'astro']) {
    let consumerRequire;
    try { consumerRequire = createRequire(require.resolve(`${consumer}/package.json`)); }
    catch { continue; }
    assert.equal(path.dirname(consumerRequire.resolve('picomatch/package.json')), installed, `${consumer} resolves its own picomatch`);
  }
});

for (const pattern of ['+(*)', '*(*)', '+(a*)', '*(*.js)', '+(*|a)', '@(+(*))']) {
  test(`${pattern} matches in linear time`, () => {
    const result = matchInChild(installed, pattern, `${'a'.repeat(40)}/`);
    assert.equal(result.timedOut, false, `${pattern} backtracks: ${result.stderr}`);
    assert.match(result.value, /^(true|false)$/);
  });
}

test('ordinary globs keep upstream behaviour', () => {
  const picomatch = require('picomatch');
  const cases = [
    ['**/*.css', 'components/a/b.css', true],
    ['src/**/*.{js,cjs,mjs}', 'src/a/b.cjs', true],
    ['!(*.min).js', 'a.min.js', false],
    ['!(*.min).js', 'a.js', true],
    ['+(foo|bar)', 'foobar', true],
    ['@(x|y)/*', 'x/1', true],
    ['[^a]*.js', 'a.js', false],
    ['**/.*', 'x/.hidden', true],
    ['*(a)', 'aaa', true],
    ['*.+(js|css)', 'a.css', true],
  ];
  for (const [glob, input, expected] of cases) assert.equal(picomatch.isMatch(input, glob), expected, `${glob} on ${input}`);
});

test('the price of the fix: a repeated extglob around a wildcard matches only its literal text', () => {
  // Upstream already does this for the risky bodies it recognises; the
  // derivative extends it to every bare `*` inside `+(…)` / `*(…)`. Nothing in
  // this repository's tooling configuration uses such a glob.
  const picomatch = require('picomatch');
  for (const [glob, input] of [['+(a*)', 'abc'], ['+(*.js)', 'a.js'], ['src/+(*).js', 'src/a.js']]) {
    assert.equal(picomatch.isMatch(input, glob), false, `${glob} on ${input}`);
    assert.equal(picomatch.isMatch(glob, glob), true, `${glob} on its own text`);
  }
});

test('micromatch, on the 2.x API, still works through the derivative', () => {
  const micromatch = require('micromatch');
  assert.deepEqual(micromatch(['a.js', 'b.css', 'src/c.js', 'node_modules/d.js'], ['**/*.js', '!node_modules/**']), ['a.js', 'src/c.js']);
  assert.equal(micromatch.isMatch('a/b/c.md', 'a/**/*.md'), true);
  assert.deepEqual(micromatch.scan('src/**/*.js').base, 'src');
});
