#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageOutDir = path.join(root, 'knowledge');
const outDir = process.env.RENDS_KNOWLEDGE_OUT_DIR
  ? path.resolve(root, process.env.RENDS_KNOWLEDGE_OUT_DIR)
  : packageOutDir;
const jsonPath = path.join(outDir, 'ren10-graph.json');
const sqlitePath = path.join(outDir, 'ren10-graph.sqlite');
const packageJsonPath = path.join(packageOutDir, 'ren10-graph.json');
const packageSqlitePath = path.join(packageOutDir, 'ren10-graph.sqlite');

const componentGroups = [
  { kind: 'primitive', dir: 'components/primitives', contract: 'component.md' },
  { kind: 'composite', dir: 'components/composites', contract: 'component.md' },
  { kind: 'pattern', dir: 'components/patterns', contract: 'pattern.md' },
];

const foundationFiles = [
  ['foundation:design-contract', 'design-contract', 'RenDS design contract', 'ren-design.md'],
  ['foundation:tokens-contract', 'tokens-contract', 'Token contract', 'tokens/tokens.md'],
  ['foundation:layouts-contract', 'layouts-contract', 'Layout primitives contract', 'base/layouts.md'],
  ['foundation:primitive-zero', 'primitive-zero', 'Native HTML contract', 'base/primitive-zero.md'],
  ['foundation:component-router', 'component-router', 'Component router', 'components/components.md'],
  ['tooling:knowledge-graph', 'tooling-doc', 'Knowledge graph tooling', 'docs/knowledge-graph.md'],
  ['tooling:knowledge-readme', 'tooling-doc', 'Packaged knowledge graph readme', 'knowledge/README.md'],
];

const nodes = new Map();
const edges = new Map();

const toPosix = (value) => value.split(path.sep).join('/');
const relativePath = (absPath) => toPosix(path.relative(root, absPath));

const readTextIfExists = async (relPath) => {
  const absPath = path.join(root, relPath);
  if (!existsSync(absPath)) return null;
  return readFile(absPath, 'utf8');
};

const addNode = (node) => {
  const previous = nodes.get(node.id);
  nodes.set(node.id, {
    data: {},
    body: '',
    path: null,
    ...previous,
    ...node,
    data: { ...(previous?.data ?? {}), ...(node.data ?? {}) },
  });
};

const addEdge = (edge) => {
  const detail = edge.detail ?? '';
  const id = `${edge.source}\u001f${edge.type}\u001f${edge.target}\u001f${detail}`;
  edges.set(id, {
    detail,
    data: {},
    ...edge,
  });
};

const extractSelectors = (css) => {
  const selectors = new Set();
  for (const match of css.matchAll(/(?<![\w-])\.ren-[a-z0-9_-]+/g)) {
    selectors.add(match[0]);
  }
  return [...selectors].sort();
};

const extractTokens = (css) => {
  const tokens = new Set();
  for (const match of css.matchAll(/var\(\s*(--[a-z0-9_-]+)/gi)) {
    tokens.add(match[1]);
  }
  return [...tokens].sort();
};

const listComponentNames = async (group) => {
  const absDir = path.join(root, group.dir);
  const entries = await readdir(absDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
};

const listFiles = async (relDir, predicate) => {
  const absDir = path.join(root, relDir);
  if (!existsSync(absDir)) return [];
  const entries = await readdir(absDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && predicate(entry.name))
    .map((entry) => `${relDir}/${entry.name}`)
    .sort();
};

const sqlLiteral = (value) => {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replaceAll("'", "''")}'`;
};

const buildSql = (graph) => {
  const statements = [
    'PRAGMA foreign_keys = OFF;',
    'DROP TABLE IF EXISTS node_fts;',
    'DROP TABLE IF EXISTS edges;',
    'DROP TABLE IF EXISTS nodes;',
    `CREATE TABLE nodes (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      path TEXT,
      body TEXT,
      data TEXT NOT NULL
    );`,
    `CREATE TABLE edges (
      source TEXT NOT NULL,
      target TEXT NOT NULL,
      type TEXT NOT NULL,
      detail TEXT NOT NULL DEFAULT '',
      data TEXT NOT NULL,
      PRIMARY KEY (source, target, type, detail)
    );`,
    'CREATE INDEX edges_source_idx ON edges(source);',
    'CREATE INDEX edges_target_idx ON edges(target);',
    'CREATE INDEX edges_type_idx ON edges(type);',
    'CREATE VIRTUAL TABLE node_fts USING fts5(id UNINDEXED, type UNINDEXED, name, path, body);',
    'BEGIN;',
  ];

  for (const node of graph.nodes) {
    statements.push(
      `INSERT INTO nodes (id, type, name, path, body, data) VALUES (${[
        node.id,
        node.type,
        node.name,
        node.path,
        node.body,
        JSON.stringify(node.data ?? {}),
      ]
        .map(sqlLiteral)
        .join(', ')});`,
    );
    statements.push(
      `INSERT INTO node_fts (id, type, name, path, body) VALUES (${[
        node.id,
        node.type,
        node.name,
        node.path,
        node.body,
      ]
        .map(sqlLiteral)
        .join(', ')});`,
    );
  }

  for (const edge of graph.edges) {
    statements.push(
      `INSERT INTO edges (source, target, type, detail, data) VALUES (${[
        edge.source,
        edge.target,
        edge.type,
        edge.detail ?? '',
        JSON.stringify(edge.data ?? {}),
      ]
        .map(sqlLiteral)
        .join(', ')});`,
    );
  }

  statements.push('COMMIT;');
  return statements.join('\n');
};

const writeSqlite = async (graph) => {
  const sqliteCheck = spawnSync('sqlite3', ['-version'], { encoding: 'utf8' });
  if (sqliteCheck.status !== 0) {
    return { ok: false, reason: 'sqlite3 CLI not found; JSON graph was still written.' };
  }

  await rm(sqlitePath, { force: true });
  const result = spawnSync('sqlite3', [sqlitePath], {
    input: buildSql(graph),
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
  });

  if (result.status !== 0) {
    return {
      ok: false,
      reason: `sqlite3 failed: ${(result.stderr || result.stdout || 'unknown error').trim()}`,
    };
  }

  return { ok: true, reason: sqlitePath };
};

const main = async () => {
  await mkdir(outDir, { recursive: true });

  for (const [id, type, name, relPath] of foundationFiles) {
    const body = await readTextIfExists(relPath);
    if (!body) continue;
    addNode({ id, type, name, path: relPath, body });
  }

  const exampleFiles = await listFiles('examples', (name) => name.endsWith('.html'));
  const examples = await Promise.all(
    exampleFiles.map(async (relPath) => ({
      relPath,
      body: await readTextIfExists(relPath),
    })),
  );

  for (const example of examples) {
    addNode({
      id: `example:${example.relPath}`,
      type: 'example',
      name: path.basename(example.relPath),
      path: example.relPath,
      body: example.body,
    });
  }

  for (const group of componentGroups) {
    for (const name of await listComponentNames(group)) {
      const dir = `${group.dir}/${name}`;
      const componentId = `component:${group.kind}:${name}`;
      const contractPath = `${dir}/${group.contract}`;
      const cssPath = `${dir}/${name}.css`;
      const jsPath = `${dir}/${name}.js`;
      const docsPath = `docs/components/${name}.html`;

      const contract = await readTextIfExists(contractPath);
      const css = await readTextIfExists(cssPath);
      const js = await readTextIfExists(jsPath);
      const docs = await readTextIfExists(docsPath);
      const selectors = css ? extractSelectors(css) : [];
      const tokens = css ? extractTokens(css) : [];

      addNode({
        id: componentId,
        type: 'component',
        name,
        path: dir,
        body: [contract, css, js].filter(Boolean).join('\n\n'),
        data: {
          kind: group.kind,
          selectors,
          tokens,
          hasScript: Boolean(js),
          hasDocsPage: Boolean(docs),
        },
      });

      if (contract) {
        const contractId = `contract:${group.kind}:${name}`;
        addNode({
          id: contractId,
          type: 'contract',
          name: `${name} ${group.contract}`,
          path: contractPath,
          body: contract,
          data: { kind: group.kind },
        });
        addEdge({ source: componentId, target: contractId, type: 'has_contract' });
      }

      if (css) {
        const cssId = `file:${cssPath}`;
        addNode({ id: cssId, type: 'css', name: path.basename(cssPath), path: cssPath, body: css });
        addEdge({ source: componentId, target: cssId, type: 'has_css' });
      }

      if (js) {
        const jsId = `file:${jsPath}`;
        addNode({ id: jsId, type: 'javascript', name: path.basename(jsPath), path: jsPath, body: js });
        addEdge({ source: componentId, target: jsId, type: 'has_js' });
      }

      if (docs) {
        const docsId = `docs:${docsPath}`;
        addNode({ id: docsId, type: 'docs_page', name: `${name} docs`, path: docsPath, body: docs });
        addEdge({ source: componentId, target: docsId, type: 'has_docs_page' });
      }

      for (const selector of selectors) {
        const selectorId = `selector:${selector}`;
        addNode({ id: selectorId, type: 'selector', name: selector, path: cssPath, body: selector });
        addEdge({ source: componentId, target: selectorId, type: 'exposes_selector' });
      }

      for (const token of tokens) {
        const tokenId = `token:${token}`;
        addNode({ id: tokenId, type: 'token', name: token, path: cssPath, body: token });
        addEdge({ source: componentId, target: tokenId, type: 'uses_token' });
      }

      for (const example of examples) {
        if (!example.body) continue;
        const mentionsName = example.body.includes(name);
        const mentionsSelector = selectors.some((selector) => example.body.includes(selector.slice(1)));
        if (mentionsName || mentionsSelector) {
          addEdge({
            source: componentId,
            target: `example:${example.relPath}`,
            type: 'used_by_example',
            detail: mentionsName ? name : 'selector',
          });
        }
      }
    }
  }

  const graph = {
    schemaVersion: 1,
    packageName: 'ren10',
    generator: relativePath(fileURLToPath(import.meta.url)),
    outputs: {
      json: relativePath(packageJsonPath),
      sqlite: relativePath(packageSqlitePath),
    },
    nodes: [...nodes.values()].sort((a, b) => a.id.localeCompare(b.id)),
    edges: [...edges.values()].sort((a, b) =>
      `${a.source}\u001f${a.type}\u001f${a.target}\u001f${a.detail}`.localeCompare(
        `${b.source}\u001f${b.type}\u001f${b.target}\u001f${b.detail}`,
      ),
    ),
  };

  await writeFile(jsonPath, `${JSON.stringify(graph, null, 2)}\n`);
  const sqlite = await writeSqlite(graph);

  console.log(`RenDS knowledge graph: ${graph.nodes.length} nodes, ${graph.edges.length} edges`);
  console.log(`JSON: ${relativePath(jsonPath)}`);
  console.log(sqlite.ok ? `SQLite: ${relativePath(sqlitePath)}` : `SQLite skipped: ${sqlite.reason}`);
};

await main();
