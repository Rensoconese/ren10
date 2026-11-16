import assert from 'node:assert/strict';
import test from 'node:test';
import { coveredCells, evaluate, requiredCells } from '../../scripts/check-test-coverage.mjs';

const registry = {
  badge: { dir: 'ren-badge', layer: 'primitives', files: ['ren-badge.css'], usage: '<span class="ren-badge">New</span>' },
  menu: { dir: 'ren-menu', layer: 'composites', files: ['ren-menu.css', 'ren-menu.js'], usage: '<ren-menu></ren-menu>' },
  toolbar: { dir: 'ren-toolbar', layer: 'composites', files: ['ren-toolbar.js'], usage: '<div role="toolbar"></div>' },
};

const spec = (title, tags, line = 1) => ({ title, tags, file: 'x.spec.cjs', line });
const report = (...specs) => ({ suites: [{ file: 'x.spec.cjs', specs }] });

const fullCoverage = report(
  spec('badge docs', ['@ren-badge', '@a11y']),
  spec('menu docs', ['@ren-menu', '@a11y']),
  spec('menu mounts', ['@ren-menu', '@runtime']),
  spec('menu reconnect', ['@ren-menu', '@lifecycle']),
  spec('menu keys', ['@ren-menu', '@keyboard']),
  spec('toolbar docs', ['@ren-toolbar', '@a11y']),
  spec('toolbar mounts', ['@ren-toolbar', '@runtime']),
  spec('toolbar keys', ['@ren-toolbar', '@keyboard']),
  spec('menu leaks', ['@ren-menu', '@leaks']),
  spec('toolbar leaks', ['@ren-toolbar', '@leaks']),
);

const run = (reports, exemptions = {}, baseExemptions = null) => {
  const { covered, stray } = coveredCells(reports);
  return evaluate({ cells: requiredCells(registry), covered, stray, exemptions, baseExemptions });
};

test('what a component owes follows its layer, its JS and its usage', () => {
  const owed = Object.fromEntries(requiredCells(registry).map((cell) => [cell.component, cell.required]));
  assert.deepEqual(owed['ren-badge'], ['a11y']);
  assert.deepEqual(owed['ren-menu'], ['a11y', 'runtime', 'lifecycle', 'keyboard', 'leaks']);
  // No ren-* element in its usage: nothing to disconnect, so no lifecycle cell.
  assert.deepEqual(owed['ren-toolbar'], ['a11y', 'runtime', 'keyboard', 'leaks']);
});

test('full coverage passes', () => {
  const result = run([fullCoverage]);
  assert.deepEqual(result.problems, []);
  assert.equal(result.totals.keyboard.covered, 2);
});

test('a missing cell fails unless it is exempted with a reason', () => {
  const withoutKeys = report(...fullCoverage.suites[0].specs.filter((s) => s.title !== 'menu keys'));
  assert.match(run([withoutKeys]).problems.join('\n'), /ren-menu has no @keyboard test/);
  assert.deepEqual(run([withoutKeys], { keyboard: { 'ren-menu': 'not yet' } }).problems, []);
  assert.match(run([withoutKeys], { keyboard: { 'ren-menu': ' ' } }).problems.join('\n'), /needs a reason/);
});

test('an exemption for a covered cell must be deleted', () => {
  const result = run([fullCoverage], { keyboard: { 'ren-menu': 'old debt' } });
  assert.match(result.problems.join('\n'), /keyboard\.ren-menu is covered now, remove the exemption/);
});

test('exemptions only shrink against the base', () => {
  const withoutKeys = report(...fullCoverage.suites[0].specs.filter((s) => s.title !== 'toolbar keys'));
  const exemptions = { keyboard: { 'ren-toolbar': 'new debt' } };
  assert.match(run([withoutKeys], exemptions, { keyboard: {} }).problems.join('\n'), /is a new exemption/);
  assert.deepEqual(run([withoutKeys], exemptions, exemptions).problems, []);
});

test('half-tagged tests, unknown components and needless exemptions are reported', () => {
  const problems = run(
    [fullCoverage, report(spec('typo', ['@ren-menuu', '@keyboard']), spec('half', ['@ren-menu']))],
    { keyboard: { 'ren-badge': 'not interactive' }, visual: {} },
  ).problems.join('\n');
  assert.match(problems, /@ren-menuu is not a registry component/);
  assert.match(problems, /"half" needs both a @ren-\* tag and a category tag/);
  assert.match(problems, /keyboard\.ren-badge is not required/);
  assert.match(problems, /unknown category "visual"/);
});

test('describe-level tags count for every test inside', () => {
  // Playwright's JSON list reports inherited tags on each spec.
  const nested = { suites: [{ file: 'y.spec.cjs', suites: [{ title: 'menu', specs: [spec('opens', ['@ren-menu', '@keyboard'])] }] }] };
  const { covered } = coveredCells([nested]);
  assert.ok(covered.get('ren-menu').has('keyboard'));
});

test('leaks is owed by everything that ships JS, with or without a custom element', () => {
  const owed = Object.fromEntries(requiredCells(registry).map((cell) => [cell.component, cell.required]));
  assert.ok(!owed['ren-badge'].includes('leaks'), 'CSS only: nothing to leak');
  assert.ok(owed['ren-menu'].includes('leaks'));
  // Initialised by a function: it still adds listeners, so it still owes a teardown test.
  assert.ok(owed['ren-toolbar'].includes('leaks'));
  assert.equal(run([fullCoverage]).totals.leaks.required, 2);
});

test('a chromium-only retention test does not cover the leaks cell', () => {
  // leaks.spec.cjs tags only the cross-browser accounting test `@ren-* @leaks`.
  // The heap check is skipped on firefox and webkit and carries neither tag,
  // so it is ignored here: not a stray, and not coverage.
  const withoutLeaks = fullCoverage.suites[0].specs.filter((s) => !s.tags.includes('@leaks'));
  const result = run([report(...withoutLeaks, spec('menu instances are collected', ['@retention']))]);
  const problems = result.problems.join('\n');
  assert.match(problems, /ren-menu has no @leaks test/);
  assert.match(problems, /ren-toolbar has no @leaks test/);
  assert.doesNotMatch(problems, /needs both/);
  assert.equal(result.totals.leaks.missing, 2);
});
