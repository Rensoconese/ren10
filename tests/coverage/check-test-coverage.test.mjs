import assert from 'node:assert/strict';
import test from 'node:test';
import { coveredCells, evaluate, patternMapProblems, requiredCells } from '../../scripts/check-test-coverage.mjs';

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
  spec('badge rtl', ['@ren-badge', '@rtl']),
  spec('menu rtl', ['@ren-menu', '@rtl']),
  spec('toolbar rtl', ['@ren-toolbar', '@rtl']),
  spec('menu leaks', ['@ren-menu', '@leaks']),
  spec('toolbar leaks', ['@ren-toolbar', '@leaks']),
);

const run = (reports, exemptions = {}, baseExemptions = null) => {
  const { covered, stray } = coveredCells(reports);
  return evaluate({ cells: requiredCells(registry), covered, stray, exemptions, baseExemptions });
};

test('what a component owes follows its layer, its JS and its usage', () => {
  const owed = Object.fromEntries(requiredCells(registry).map((cell) => [cell.component, cell.required]));
  assert.deepEqual(owed['ren-badge'], ['a11y', 'rtl']);
  assert.deepEqual(owed['ren-menu'], ['a11y', 'runtime', 'lifecycle', 'keyboard', 'rtl', 'leaks']);
  // No ren-* element in its usage: nothing to disconnect, so no lifecycle cell.
  assert.deepEqual(owed['ren-toolbar'], ['a11y', 'runtime', 'keyboard', 'rtl', 'leaks']);
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

/* ── pattern: APG conformance, owed by the components in the pattern map ── */

const patternMap = { menu: { implements: [{ pattern: 'menu-button' }] } };
const runWithPatterns = (reports, exemptions = {}, baseExemptions = null) => {
  const { covered, stray } = coveredCells(reports);
  stray.push(...patternMapProblems(registry, patternMap));
  return evaluate({ cells: requiredCells(registry, { patternMap }), covered, stray, exemptions, baseExemptions });
};

test('only the components in the pattern map owe a pattern test', () => {
  const owed = Object.fromEntries(requiredCells(registry, { patternMap }).map((cell) => [cell.component, cell.required]));
  assert.deepEqual(owed['ren-menu'], ['a11y', 'runtime', 'lifecycle', 'keyboard', 'pattern', 'rtl', 'leaks']);
  assert.deepEqual(owed['ren-badge'], ['a11y', 'rtl']);
  assert.deepEqual(owed['ren-toolbar'], ['a11y', 'runtime', 'keyboard', 'rtl', 'leaks']);
  // Without a map nobody owes it, so the other categories are judged alone.
  assert.ok(requiredCells(registry).every((cell) => !cell.required.includes('pattern')));
});

test('a mapped component needs a @pattern test', () => {
  assert.match(runWithPatterns([fullCoverage]).problems.join('\n'), /ren-menu has no @pattern test/);
  const withPattern = report(...fullCoverage.suites[0].specs, spec('menu follows the APG Menu Button pattern', ['@ren-menu', '@pattern']));
  const result = runWithPatterns([withPattern]);
  assert.deepEqual(result.problems, []);
  assert.deepEqual(result.totals.pattern, { required: 1, covered: 1, exempt: 0, missing: 0 });
  assert.equal(result.rows.find((row) => row.component === 'ren-badge').status.pattern, 'n/a');
});

test('the pattern category arrives covered: a new exemption for it is refused', () => {
  const exemptions = { pattern: { 'ren-menu': 'later' } };
  assert.match(runWithPatterns([fullCoverage], exemptions, { keyboard: {} }).problems.join('\n'), /pattern\.ren-menu is a new exemption/);
  // And a component outside the map cannot be exempted from what it does not owe.
  assert.match(runWithPatterns([fullCoverage], { pattern: { 'ren-badge': 'no pattern' } }).problems.join('\n'), /pattern\.ren-badge is not required/);
});

test('a pattern map entry that is not in the registry is reported', () => {
  assert.deepEqual(patternMapProblems(registry, patternMap), []);
  assert.match(patternMapProblems(registry, { ...patternMap, menuu: {} }).join('\n'), /"menuu" is not a registry component/);
});

test('a test declared fixme or skip covers nothing', () => {
  const declared = (type) => ({ ...spec('menu follows the APG Menu pattern', ['@ren-menu', '@pattern']), tests: [{ annotations: [{ type }] }, { annotations: [{ type }] }] });
  for (const type of ['fixme', 'skip']) {
    const waiting = report(...fullCoverage.suites[0].specs, declared(type));
    assert.match(runWithPatterns([waiting]).problems.join('\n'), /ren-menu has no @pattern test/, type);
  }
  // A test that runs in at least one project still counts.
  const partly = { ...declared('fixme'), tests: [{ annotations: [{ type: 'fixme' }] }, { annotations: [] }] };
  assert.deepEqual(runWithPatterns([report(...fullCoverage.suites[0].specs, partly)]).problems, []);
});

test('every component owes rtl, with or without JS', () => {
  for (const cell of requiredCells(registry)) {
    assert.ok(cell.required.includes('rtl'), `${cell.component} owes rtl`);
  }
  // A CSS-only primitive owes nothing else that needs a browser to mount it.
  assert.ok(!requiredCells(registry).find((cell) => cell.component === 'ren-badge').required.includes('runtime'));
});

test('a component without an rtl test fails, CSS-only or not', () => {
  const withoutRtl = (title) => report(...fullCoverage.suites[0].specs.filter((s) => s.title !== title));
  assert.match(run([withoutRtl('badge rtl')]).problems.join('\n'), /ren-badge has no @rtl test/);
  const result = run([withoutRtl('menu rtl')]);
  assert.match(result.problems.join('\n'), /ren-menu has no @rtl test/);
  assert.deepEqual(result.totals.rtl, { required: 3, covered: 2, exempt: 0, missing: 1 });
  assert.equal(result.rows.find((row) => row.component === 'ren-menu').status.rtl, 'missing');
});

test('one test may prove rtl for several components, and another category at once', () => {
  const shared = report(
    ...fullCoverage.suites[0].specs.filter((s) => !s.tags.includes('@rtl')),
    spec('disclosure chevrons', ['@ren-badge', '@ren-menu', '@rtl']),
    spec('toolbar arrows under rtl', ['@ren-toolbar', '@rtl', '@keyboard']),
  );
  const result = run([shared]);
  assert.deepEqual(result.problems, []);
  assert.equal(result.totals.rtl.covered, 3);
});

test('rtl exemptions follow the same shrink-only rules', () => {
  const withoutRtl = report(...fullCoverage.suites[0].specs.filter((s) => s.title !== 'toolbar rtl'));
  const exemptions = { rtl: { 'ren-toolbar': 'new debt' } };
  // The base has no rtl key at all, as every base did before the category existed.
  assert.match(run([withoutRtl], exemptions, { keyboard: {} }).problems.join('\n'), /rtl\.ren-toolbar is a new exemption/);
  assert.match(run([fullCoverage], exemptions).problems.join('\n'), /rtl\.ren-toolbar is covered now, remove the exemption/);
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
