import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  ESSENTIALS_MAX_BYTES,
  ESSENTIALS_PATH,
  validateEssentials,
} from '../../scripts/check-essentials.mjs';
import { findPublicVersionSurfaces } from '../../scripts/release-policy.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const cli = path.join(root, 'cli', 'index.js');
const essentials = readFileSync(path.join(root, ESSENTIALS_PATH), 'utf8');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

const run = (args) => spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8' });

test('the committed entry contract passes its drift gate and stays compact', () => {
  const result = validateEssentials(root);
  assert.deepEqual(result.errors, []);
  assert.ok(result.bytes >= 6 * 1024 && result.bytes <= ESSENTIALS_MAX_BYTES, `${result.bytes} bytes`);
});

test('the drift gate rejects stale tokens, classes, commands, lists, counts and versions', () => {
  const cases = [
    ['--color-accent-hover', '--color-accent-hovered', /--color-accent-hovered/],
    ['`ren-center-narrow`', '`ren-center-thin`', /ren-center-thin/],
    ['npx ren10 docs layouts', 'npx ren10 docs layout-guide', /unknown docs topic "layout-guide"/],
    ['npx ren10 blocks --list', 'npx ren10 sections --list', /unknown command "npx ren10 sections"/],
    ['`tokens/tokens.md`', '`tokens/token-contract.md`', /tokens\/token-contract\.md/],
    ['select, sheet, slider', 'select, slider', /Composite list drifted/],
    ['pricing (12)', 'pricing (11)', /block families drifted/],
    ['335 ready-made', '300 ready-made', /335 ready-made page-section blocks/],
    ['53 components (19 primitives', '52 components (19 primitives', /must state "53 components/],
    [`· v${pkg.version}`, '· v0.0.1', /names v0\.0\.1/],
    ['## Hard rules', '## Rules', /"## Hard rules" section/],
  ];
  for (const [from, to, expected] of cases) {
    assert.ok(essentials.includes(from), `fixture text "${from}" is still in ${ESSENTIALS_PATH}`);
    const result = validateEssentials(root, { text: essentials.replace(from, to) });
    assert.equal(result.ok, false, `"${to}" should fail`);
    assert.ok(result.errors.some((message) => expected.test(message)), `${expected} in:\n${result.errors.join('\n')}`);
  }
  const bloated = validateEssentials(root, { text: `${essentials}\n${'x'.repeat(ESSENTIALS_MAX_BYTES)}` });
  assert.ok(bloated.errors.some((message) => /keep it under/.test(message)));
});

test('the release version gate covers the entry contract', () => {
  const { surfaces, errors } = findPublicVersionSurfaces(root, pkg.version);
  assert.deepEqual(errors, []);
  assert.ok(surfaces.some((surface) => surface.file === ESSENTIALS_PATH && surface.version === pkg.version));
});

test('docs design --dense returns the entry contract, not heading fragments', () => {
  const text = run(['docs', 'design', '--dense']);
  assert.equal(text.status, 0, text.stderr);
  assert.equal(text.stdout, `${essentials}\n`);

  const json = JSON.parse(run(['docs', 'design', '--dense', '--json']).stdout);
  assert.equal(json.type, 'docs.detail');
  assert.equal(json.data.path, 'ren-design.md');
  assert.equal(json.data.densePath, ESSENTIALS_PATH);
  assert.equal(json.data.dense, essentials);
  assert.equal(json.data.body, undefined);

  const full = JSON.parse(run(['docs', 'design', '--json']).stdout);
  assert.equal(full.data.body, readFileSync(path.join(root, 'ren-design.md'), 'utf8'), 'the full contract stays available');

  const alias = JSON.parse(run(['docs', 'essentials', '--dense', '--json']).stdout);
  assert.equal(alias.data.dense, essentials);
});

test('every agent entry point routes to the entry contract before ren-design.md', () => {
  for (const file of ['AGENTS.md', 'CLAUDE.md', '.cursorrules', '.windsurfrules', 'skills/rends/SKILL.md']) {
    const text = readFileSync(path.join(root, file), 'utf8');
    const first = text.indexOf('ren-essentials.md');
    assert.ok(first !== -1, `${file} routes to ren-essentials.md`);
    assert.ok(first < text.indexOf('ren-design.md') || !text.includes('ren-design.md'), `${file} names ren-essentials.md before ren-design.md`);
    assert.match(text, /npx ren10 blocks/, `${file} routes to the block library`);
  }
  const block = readFileSync(path.join(root, 'AGENTS.md'), 'utf8').match(/<!-- RENDS:START -->[\s\S]*?<!-- RENDS:END -->/)[0];
  for (const file of ['CLAUDE.md', '.cursorrules', '.windsurfrules']) {
    assert.ok(readFileSync(path.join(root, file), 'utf8').includes(block), `${file} carries the current generated agent block`);
  }
  assert.match(block, /READ FIRST: `ren-essentials\.md`/);
  assert.match(block, /npx ren10 blocks <name>/);
});
