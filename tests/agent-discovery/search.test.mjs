import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { familyForBlockName } from '../../cli/blocks.js';
import {
  analyzeQuery,
  loadJsonGraph,
  queryJsonGraph,
  querySqliteGraph,
  sqliteAvailable,
} from '../../cli/knowledge-search.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const cli = path.join(root, 'cli', 'index.js');
const jsonPath = path.join(root, 'knowledge', 'ren10-graph.json');
const sqlitePath = path.join(root, 'knowledge', 'ren10-graph.sqlite');
const hasSqlite = sqliteAvailable();
const graph = loadJsonGraph(jsonPath);

const backends = [
  ['JSON fallback', (query, limit) => queryJsonGraph(graph, query, limit)],
  ...(hasSqlite ? [['SQLite', (query, limit) => querySqliteGraph(sqlitePath, query, limit)]] : []),
];

const label = (row) => `${row.type}:${row.name}`;
/** What a row answers: a block family, or the row itself. */
const concept = (row) => (row.type === 'block' ? `block:${familyForBlockName(row.name)?.key}` : label(row));

function runCli(args, env = {}) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
    maxBuffer: 1024 * 1024 * 20,
  });
  assert.equal(result.status, 0, `ren10 ${args.join(' ')} failed:\n${result.stdout}${result.stderr}`);
  return JSON.parse(result.stdout);
}

test('query analysis drops stopwords and generic words and maps synonyms', () => {
  const analysis = analyzeQuery('landing page for a dental clinic with pricing and contact');
  assert.deepEqual(analysis.terms, ['hero', 'dental', 'clinic', 'pricing', 'contact']);
  assert.ok(analysis.matchTerms.includes('landing'), 'original spelling of a synonym is still matched');
  for (const generic of ['page', 'for', 'a', 'with', 'and']) {
    assert.ok(!analysis.terms.includes(generic), `"${generic}" must not drive ranking`);
  }
  assert.deepEqual(analyzeQuery('Navbar').terms, ['nav']);
  assert.deepEqual(analyzeQuery('pricing plans').terms, ['pricing']);
  assert.deepEqual(analyzeQuery('a').terms, ['a'], 'an all-stopword query keeps its words instead of matching nothing');
  assert.deepEqual(analyzeQuery('ren-toast, status!').terms, ['ren-toast', 'status']);
});

const expectations = [
  {
    query: 'navbar',
    check(rows) {
      assert.equal(label(rows[0]), 'component:ren-nav');
      assert.ok(rows.slice(0, 8).filter((row) => row.type === 'block' && row.name.startsWith('nav-')).length >= 3,
        'navbar blocks appear next to the ren-nav pattern');
    },
  },
  {
    query: 'pricing',
    check(rows) {
      for (const row of rows.slice(0, 6)) assert.match(label(row), /^block:pricing-/);
    },
  },
  {
    query: 'landing page for a dental clinic with pricing and contact',
    check(rows) {
      const top = rows.slice(0, 10).map(concept);
      for (const family of ['hero', 'pricing', 'contact']) {
        assert.ok(top.includes(`block:${family}`), `${family} blocks in the top 10: ${top.join(', ')}`);
      }
      for (const noise of ['ren-pagination', 'ren-breadcrumb', 'ren-link']) {
        assert.ok(!rows.some((row) => row.name === noise), `${noise} must not match on "page", "a" or "for"`);
      }
    },
  },
  {
    query: 'dialog workflow',
    check(rows) {
      const top = rows.slice(0, 2).map(label).sort();
      assert.deepEqual(top, ['component:ren-dialog', 'example:dialog-workflow.html']);
    },
  },
  {
    query: 'ren-toast status',
    check(rows) {
      assert.equal(label(rows[0]), 'component:ren-toast');
    },
  },
  {
    query: 'dashboard',
    check(rows) {
      const top = rows.slice(0, 3).map(label);
      assert.ok(top.includes('block:application-shell-sidebar-dashboard'), top.join(', '));
      assert.ok(top.includes('example:dashboard-shell.html'), top.join(', '));
      assert.ok(rows.slice(0, 8).filter((row) => row.name.startsWith('application-shell-')).length >= 3);
    },
  },
  {
    query: 'contact form',
    check(rows) {
      const top = rows.slice(0, 6);
      assert.ok(top.some((row) => label(row) === 'component:ren-form'), top.map(label).join(', '));
      assert.ok(top.filter((row) => row.name.startsWith('contact-')).length >= 2, top.map(label).join(', '));
    },
  },
  {
    query: 'form',
    check(rows) {
      assert.equal(label(rows[0]), 'component:ren-form');
    },
  },
  {
    query: 'data table',
    check(rows) {
      const top = rows.slice(0, 3).map(label);
      assert.ok(top.includes('component:ren-table'), top.join(', '));
      assert.ok(top.includes('example:data-table.html'), top.join(', '));
    },
  },
  {
    query: 'footer',
    check(rows) {
      for (const row of rows.slice(0, 5)) assert.match(label(row), /^block:footer-/);
    },
  },
  {
    query: 'hero',
    check(rows) {
      for (const row of rows.slice(0, 5)) assert.match(label(row), /^block:hero-/);
    },
  },
];

for (const [backend, search] of backends) {
  for (const { query, check } of expectations) {
    test(`${backend}: "${query}" ranks the expected parts first`, () => {
      const rows = search(query, 12);
      assert.ok(rows.length > 0, 'query returned no rows');
      check(rows);
    });
  }
}

test('SQLite and JSON fallback agree on the top results', { skip: !hasSqlite && 'sqlite3 CLI not available' }, () => {
  for (const { query } of expectations) {
    const fromJson = queryJsonGraph(graph, query, 12);
    const fromSqlite = querySqliteGraph(sqlitePath, query, 12);
    // Rows with the same structural score keep their backend's own text order
    // (bm25 vs. occurrence counts), so parity is asserted per concept: the
    // same kind of answer first, and the same set of answers in the top three.
    assert.equal(concept(fromSqlite[0]), concept(fromJson[0]), `first result for "${query}"`);
    assert.deepEqual(
      [...new Set(fromSqlite.slice(0, 3).map(concept))].sort(),
      [...new Set(fromJson.slice(0, 3).map(concept))].sort(),
      `top-3 concepts for "${query}"`,
    );
  }
});

for (const [backend, env] of [['JSON fallback', { RENDS_KNOWLEDGE_FORCE_JSON: '1' }], ...(hasSqlite ? [['SQLite', {}]] : [])]) {
  test(`${backend}: build kit for a dental-clinic landing page routes to page-section blocks`, () => {
    const payload = runCli(['build', 'landing page for a dental clinic with pricing and contact', '--json'], env);
    assert.equal(payload.type, 'build.kit');
    const kit = payload.data;
    assert.equal(kit.recipe, 'landing');
    const families = kit.blocks.map((family) => family.family);
    for (const family of ['nav', 'hero', 'pricing', 'contact', 'footer']) {
      assert.ok(families.includes(family), `kit is missing ${family} blocks: ${families.join(', ')}`);
    }
    assert.deepEqual(families.indexOf('nav'), 0, 'blocks are listed in page order');
    assert.equal(families.at(-1), 'footer');
    for (const family of kit.blocks) {
      assert.ok(family.blocks.length > 0);
      for (const block of family.blocks) {
        assert.ok(block.name.startsWith(`${family.family}-`));
        assert.equal(block.command, `npx ren10 blocks ${block.name} --dense`);
      }
    }
    const componentNames = kit.components.map((row) => row.name);
    for (const noise of ['ren-pagination', 'ren-breadcrumb']) {
      assert.ok(!componentNames.includes(noise), `${noise} is not part of a landing page`);
    }
    assert.ok(componentNames.includes('ren-form') || componentNames.includes('ren-field'), componentNames.join(', '));
  });
}

test('build kit keeps component-only requests free of blocks', () => {
  const kit = runCli(['build', 'dialog workflow', '--json']).data;
  assert.deepEqual(kit.blocks, []);
  assert.equal(kit.components[0].name, 'ren-dialog');
});

test('build kit routes dashboards to application-shell blocks', () => {
  const kit = runCli(['build', 'admin dashboard with data table', '--json']).data;
  assert.equal(kit.recipe, 'application');
  assert.deepEqual(kit.blocks.map((family) => family.family), ['application-shell']);
  assert.ok(kit.components.some((row) => row.name === 'ren-table'));
});

test('search rows for blocks route to the blocks command', () => {
  const payload = runCli(['search', 'navbar', '--json', '--limit', '6']);
  const block = payload.data.results.find((row) => row.type === 'block');
  assert.ok(block, 'search "navbar" returns blocks');
  assert.equal(block.command, `npx ren10 blocks ${block.name} --dense`);
});
