#!/usr/bin/env node
/**
 * Per-component test coverage matrix.
 *
 * Every component in cli/registry.js owes a set of test categories:
 *
 *   a11y       every component: its docs page passes axe (tests/a11y/docs.spec.cjs)
 *   runtime    every component that ships JS: it mounts, activates and survives
 *              an empty element (tests/components/runtime-smoke.spec.cjs)
 *   lifecycle  every JS component with a custom element: lifecycle methods are
 *              idempotent and it survives disconnect/reconnect
 *   keyboard   every JS composite and pattern: a test drives it with keys
 *   pattern    every component in the APG pattern map
 *              (tests/utils/apg/pattern-map.cjs): it follows the WAI-ARIA
 *              Authoring Practices pattern it implements
 *   rtl        every component, CSS-only ones included: under dir="rtl" it stays
 *              on screen and mirrors its LTR layout (tests/components/rtl-smoke.spec.cjs)
 *
 * A test proves a cell by carrying two Playwright tags: the component
 * (`@ren-dialog`) and the category (`@keyboard`). Tests are read with
 * `playwright test --list`, which loads the specs without starting a browser,
 * so the matrix reflects the tests that actually exist, not a hand-kept table.
 *
 * A required cell with no test must be listed in tests/coverage/exemptions.json
 * with a reason. The file is a debt list and only shrinks:
 *   - an exemption whose cell is now covered fails the check (delete it);
 *   - with --base <git-ref>, an exemption that the base did not have fails.
 *
 * Usage:
 *   node scripts/check-test-coverage.mjs                 check, print a summary
 *   node scripts/check-test-coverage.mjs --matrix        also print the matrix
 *   node scripts/check-test-coverage.mjs --base <ref>    also forbid new exemptions
 *   node scripts/check-test-coverage.mjs --json          machine-readable result
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const CATEGORIES = ['a11y', 'runtime', 'lifecycle', 'keyboard', 'pattern', 'rtl'];
export const EXEMPTIONS_PATH = 'tests/coverage/exemptions.json';
export const PATTERN_MAP_PATH = 'tests/utils/apg/pattern-map.cjs';
const SUITES = ['tests/components/playwright.config.cjs', 'tests/a11y/playwright.config.cjs'];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Registry entries → what each component owes. Mirrors runtime-smoke's filters.
 * `patternMap` is the APG pattern map, keyed like the registry: exactly the
 * components it lists owe a `pattern` test.
 */
export function requiredCells(registry, { patternMap = {} } = {}) {
  const patternDirs = new Set(Object.keys(patternMap).map((key) => registry[key]?.dir));
  return Object.values(registry).map((entry) => {
    const hasJs = (entry.files ?? []).some((file) => file.endsWith('.js'));
    const usage = entry.usage ?? '';
    const mountsElement = /<ren-[a-z-]+/.test(usage);
    const required = ['a11y'];
    if (hasJs) required.push('runtime');
    if (hasJs && mountsElement) required.push('lifecycle');
    if (hasJs && (entry.layer === 'composites' || entry.layer === 'patterns')) required.push('keyboard');
    if (patternDirs.has(entry.dir)) required.push('pattern');
    // Direction reaches CSS as much as JS: a physical `left` is an RTL defect
    // in a component that ships no script at all.
    required.push('rtl');
    return { component: entry.dir, layer: entry.layer, required };
  });
}

/** Pattern map keys that name no registry component: the map and the registry drifted. */
export function patternMapProblems(registry, patternMap = {}) {
  return Object.keys(patternMap)
    .filter((key) => !registry[key])
    .map((key) => `${PATTERN_MAP_PATH}: "${key}" is not a registry component`);
}

/** Playwright JSON list output → Map<component, Map<category, test titles[]>>. */
export function coveredCells(reports) {
  const covered = new Map();
  const stray = [];
  const walk = (suite, file) => {
    for (const child of suite.suites ?? []) walk(child, child.file ?? file);
    for (const spec of suite.specs ?? []) {
      const tags = new Set(spec.tags.map((tag) => tag.replace(/^@/, '')));
      const categories = CATEGORIES.filter((category) => tags.has(category));
      const components = [...tags].filter((tag) => tag.startsWith('ren-'));
      if (!categories.length && !components.length) continue;
      // A test declared with test.fixme / test.skip never runs: it proves nothing.
      if (spec.tests?.length && spec.tests.every((run) => run.annotations?.some((note) => note.type === 'fixme' || note.type === 'skip'))) continue;
      if (!categories.length || !components.length) {
        stray.push(`${spec.file ?? file}:${spec.line} "${spec.title}" needs both a @ren-* tag and a category tag`);
        continue;
      }
      for (const component of components) {
        if (!covered.has(component)) covered.set(component, new Map());
        for (const category of categories) {
          const titles = covered.get(component).get(category) ?? [];
          titles.push(`${spec.file ?? file}:${spec.line} ${spec.title}`);
          covered.get(component).set(category, titles);
        }
      }
    }
  };
  for (const report of reports) for (const suite of report.suites ?? []) walk(suite, suite.file);
  return { covered, stray };
}

/** Compare what is owed, what is tested and what is excused. Pure: no I/O. */
export function evaluate({ cells, covered, stray = [], exemptions, baseExemptions = null }) {
  const problems = [...stray];
  const known = new Map(cells.map((cell) => [cell.component, cell]));

  for (const component of covered.keys()) {
    if (!known.has(component)) problems.push(`@${component} is not a registry component (typo?)`);
  }

  for (const [category, entries] of Object.entries(exemptions)) {
    if (!CATEGORIES.includes(category)) {
      problems.push(`${EXEMPTIONS_PATH}: unknown category "${category}"`);
      continue;
    }
    for (const [component, reason] of Object.entries(entries)) {
      const cell = known.get(component);
      if (!cell) problems.push(`${EXEMPTIONS_PATH}: ${category}.${component} is not a registry component`);
      else if (!cell.required.includes(category)) problems.push(`${EXEMPTIONS_PATH}: ${category}.${component} is not required, remove it`);
      else if (covered.get(component)?.has(category)) problems.push(`${EXEMPTIONS_PATH}: ${category}.${component} is covered now, remove the exemption`);
      if (typeof reason !== 'string' || !reason.trim()) problems.push(`${EXEMPTIONS_PATH}: ${category}.${component} needs a reason`);
      if (baseExemptions && !Object.hasOwn(baseExemptions[category] ?? {}, component)) {
        problems.push(`${EXEMPTIONS_PATH}: ${category}.${component} is a new exemption; the list only shrinks, add the test instead`);
      }
    }
  }

  const rows = cells.map((cell) => {
    const status = {};
    for (const category of CATEGORIES) {
      if (!cell.required.includes(category)) status[category] = 'n/a';
      else if (covered.get(cell.component)?.has(category)) status[category] = 'covered';
      else if (Object.hasOwn(exemptions[category] ?? {}, cell.component)) status[category] = 'exempt';
      else {
        status[category] = 'missing';
        problems.push(`${cell.component} has no @${category} test; add one tagged @${cell.component} @${category} (or, for existing debt only, an exemption)`);
      }
    }
    return { component: cell.component, layer: cell.layer, status };
  });

  const totals = Object.fromEntries(CATEGORIES.map((category) => {
    const count = (state) => rows.filter((row) => row.status[category] === state).length;
    return [category, { required: rows.length - count('n/a'), covered: count('covered'), exempt: count('exempt'), missing: count('missing') }];
  }));
  return { ok: problems.length === 0, problems, rows, totals };
}

function listTests(config) {
  const require = createRequire(import.meta.url);
  const cli = path.join(path.dirname(require.resolve('@playwright/test/package.json')), 'cli.js');
  const result = spawnSync(process.execPath, [cli, 'test', '--config', config, '--list', '--reporter=json'], {
    cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024,
  });
  const report = JSON.parse(result.stdout || '{}');
  if (result.status !== 0 || report.errors?.length) {
    const reason = report.errors?.map((error) => error.message).join('\n') || result.stderr;
    throw new Error(`playwright --list failed for ${config}:\n${reason}`);
  }
  return report;
}

function readBaseExemptions(ref) {
  try {
    return JSON.parse(execFileSync('git', ['show', `${ref}:${EXEMPTIONS_PATH}`], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }));
  } catch {
    return null; // the base predates the file: nothing to compare against
  }
}

const MARK = { covered: 'yes', exempt: 'debt', missing: 'MISSING', 'n/a': '–' };

async function main(argv) {
  const flag = (name) => argv.includes(name);
  const baseIndex = argv.indexOf('--base');
  const base = baseIndex === -1 ? null : argv[baseIndex + 1];

  const { REGISTRY } = await import(pathToFileURL(path.join(root, 'cli/registry.js')).href);
  const { PATTERN_MAP: patternMap } = createRequire(import.meta.url)(path.join(root, PATTERN_MAP_PATH));
  const { covered, stray } = coveredCells(SUITES.map(listTests));
  stray.push(...patternMapProblems(REGISTRY, patternMap));
  const exemptions = JSON.parse(readFileSync(path.join(root, EXEMPTIONS_PATH), 'utf8'));
  const baseExemptions = base ? readBaseExemptions(base) : null;
  const result = evaluate({ cells: requiredCells(REGISTRY, { patternMap }), covered, stray, exemptions, baseExemptions });

  if (flag('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    if (flag('--matrix')) {
      console.log(`| component | ${CATEGORIES.join(' | ')} |`);
      console.log(`|---|${CATEGORIES.map(() => '---').join('|')}|`);
      for (const row of result.rows) console.log(`| ${row.component} | ${CATEGORIES.map((c) => MARK[row.status[c]]).join(' | ')} |`);
      console.log('');
    }
    for (const [category, t] of Object.entries(result.totals)) {
      console.log(`${category.padEnd(10)} ${t.covered}/${t.required} covered, ${t.exempt} exempt, ${t.missing} missing`);
    }
    if (base && !baseExemptions) console.log(`(no ${EXEMPTIONS_PATH} at ${base}: new-exemption check skipped)`);
    for (const problem of result.problems) console.error(`  ✗ ${problem}`);
    console.log(result.ok ? 'Test coverage matrix: OK' : `Test coverage matrix: ${result.problems.length} problem(s)`);
  }
  process.exitCode = result.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
