#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const knowledgeDir = path.join(root, 'knowledge');
const readmePath = path.join(knowledgeDir, 'README.md');
const jsonPath = path.join(knowledgeDir, 'ren10-graph.json');
const sqlitePath = path.join(knowledgeDir, 'ren10-graph.sqlite');

const rel = (absPath) => path.relative(root, absPath).split(path.sep).join('/');

const fail = (messages) => {
  for (const message of messages) console.error(message);
  process.exit(1);
};

const readBytes = (absPath) => readFileSync(absPath);
const readJson = (absPath) => JSON.parse(readFileSync(absPath, 'utf8'));

const compareFiles = (actual, expected, messages) => {
  if (!existsSync(actual)) {
    messages.push(`Missing generated file: ${rel(actual)}`);
    return;
  }
  if (!existsSync(expected)) {
    messages.push(`Temporary generated file missing: ${expected}`);
    return;
  }
  if (!readBytes(actual).equals(readBytes(expected))) {
    messages.push(`${rel(actual)} is stale. Run npm run knowledge:build.`);
  }
};

const runSqliteJson = (dbPath, sql) => {
  const result = spawnSync('sqlite3', ['-json', dbPath, sql], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'sqlite3 query failed').trim());
  }
  return JSON.parse(result.stdout || '[]');
};

const sqliteAvailable = () => {
  const sqliteCheck = spawnSync('sqlite3', ['-version'], { encoding: 'utf8' });
  return sqliteCheck.status === 0;
};

const checkGraphShape = (graph, messages) => {
  if (graph.schemaVersion !== 1) messages.push(`Unexpected schemaVersion: ${graph.schemaVersion}`);
  if (graph.packageName !== 'ren10') messages.push(`Unexpected packageName: ${graph.packageName}`);
  if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    messages.push('Graph JSON must contain nodes[] and edges[].');
    return;
  }

  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
  const edgeKey = (source, type) => `${source}\u001f${type}`;
  const edgesBySourceType = new Map();
  for (const edge of graph.edges) {
    if (!nodesById.has(edge.source)) messages.push(`Edge source missing: ${edge.source}`);
    if (!nodesById.has(edge.target)) messages.push(`Edge target missing: ${edge.target}`);
    const key = edgeKey(edge.source, edge.type);
    const list = edgesBySourceType.get(key) ?? [];
    list.push(edge);
    edgesBySourceType.set(key, list);
  }

  const components = graph.nodes.filter((node) => node.type === 'component');
  const expectedCounts = { primitive: 19, composite: 26, pattern: 8 };
  for (const [kind, expected] of Object.entries(expectedCounts)) {
    const count = components.filter((node) => node.data?.kind === kind).length;
    if (count !== expected) messages.push(`Expected ${expected} ${kind} components, found ${count}.`);
  }
  if (components.length !== 53) messages.push(`Expected 53 component nodes, found ${components.length}.`);

  for (const component of components) {
    const componentName = component.name;
    const requiredEdges = ['has_contract', 'has_css', 'has_docs_page'];
    for (const type of requiredEdges) {
      const edges = edgesBySourceType.get(edgeKey(component.id, type)) ?? [];
      if (edges.length === 0) messages.push(`${componentName} missing ${type} edge.`);
    }

    const selectors = component.data?.selectors ?? [];
    const selectorEdges = edgesBySourceType.get(edgeKey(component.id, 'exposes_selector')) ?? [];
    if (selectorEdges.length !== selectors.length) {
      messages.push(
        `${componentName} selector index drift: ${selectors.length} selectors, ${selectorEdges.length} exposes_selector edges.`,
      );
    }

    const tokens = component.data?.tokens ?? [];
    const tokenEdges = edgesBySourceType.get(edgeKey(component.id, 'uses_token')) ?? [];
    if (tokenEdges.length !== tokens.length) {
      messages.push(`${componentName} token index drift: ${tokens.length} tokens, ${tokenEdges.length} uses_token edges.`);
    }

    const contract = (edgesBySourceType.get(edgeKey(component.id, 'has_contract')) ?? [])
      .map((edge) => nodesById.get(edge.target))
      .find(Boolean);
    if (contract && !contract.body.includes(componentName)) {
      messages.push(`${componentName} contract does not mention the component name.`);
    }

    const docs = (edgesBySourceType.get(edgeKey(component.id, 'has_docs_page')) ?? [])
      .map((edge) => nodesById.get(edge.target))
      .find(Boolean);
    if (docs && !docs.body.includes(componentName)) {
      messages.push(`${componentName} docs page does not mention the component name.`);
    }
  }
};

const checkSqliteAgainstGraph = (graph, dbPath, messages) => {
  const integrity = spawnSync('sqlite3', [dbPath, 'PRAGMA integrity_check;'], { encoding: 'utf8' });
  if (integrity.status !== 0 || integrity.stdout.trim() !== 'ok') {
    messages.push(`SQLite integrity check failed: ${(integrity.stderr || integrity.stdout).trim()}`);
    return;
  }

  const counts = runSqliteJson(
    dbPath,
    "SELECT (SELECT count(*) FROM nodes) AS nodes, (SELECT count(*) FROM edges) AS edges, (SELECT count(*) FROM node_fts) AS fts;",
  )[0];
  if (counts.nodes !== graph.nodes.length) {
    messages.push(`SQLite node count ${counts.nodes} does not match JSON node count ${graph.nodes.length}.`);
  }
  if (counts.edges !== graph.edges.length) {
    messages.push(`SQLite edge count ${counts.edges} does not match JSON edge count ${graph.edges.length}.`);
  }
  if (counts.fts !== graph.nodes.length) {
    messages.push(`SQLite FTS row count ${counts.fts} does not match JSON node count ${graph.nodes.length}.`);
  }

  const sqliteNodeIds = runSqliteJson(dbPath, 'SELECT id FROM nodes ORDER BY id;').map((row) => row.id);
  const jsonNodeIds = graph.nodes.map((node) => node.id).sort();
  if (JSON.stringify(sqliteNodeIds) !== JSON.stringify(jsonNodeIds)) {
    messages.push('SQLite node IDs do not match JSON node IDs.');
  }

  const sqliteEdges = runSqliteJson(
    dbPath,
    'SELECT source, target, type, detail FROM edges ORDER BY source, type, target, detail;',
  );
  const jsonEdges = graph.edges
    .map((edge) => ({
      source: edge.source,
      target: edge.target,
      type: edge.type,
      detail: edge.detail ?? '',
    }))
    .sort((a, b) =>
      `${a.source}\u001f${a.type}\u001f${a.target}\u001f${a.detail}`.localeCompare(
        `${b.source}\u001f${b.type}\u001f${b.target}\u001f${b.detail}`,
      ),
    );
  if (JSON.stringify(sqliteEdges) !== JSON.stringify(jsonEdges)) {
    messages.push('SQLite edges do not match JSON edges.');
  }

  const smoke = runSqliteJson(
    dbPath,
    `SELECT n.id FROM node_fts JOIN nodes n ON n.id = node_fts.id WHERE node_fts MATCH '"ren-toast" OR "status"' LIMIT 1;`,
  );
  if (smoke.length === 0) messages.push('SQLite FTS smoke query returned no rows.');
};

const checkPacklist = (messages) => {
  const pack = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: root,
    env: {
      ...process.env,
      npm_config_cache: path.join(os.tmpdir(), 'rends-npm-cache'),
      NPM_CONFIG_CACHE: path.join(os.tmpdir(), 'rends-npm-cache'),
    },
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
  });
  if (pack.status !== 0) {
    messages.push((pack.stderr || pack.stdout || 'npm pack --dry-run --json failed').trim());
    return;
  }

  const packages = JSON.parse(pack.stdout || '[]');
  const files = new Set((packages[0]?.files ?? []).map((file) => file.path));
  for (const required of ['knowledge/README.md', 'knowledge/ren10-graph.json', 'knowledge/ren10-graph.sqlite']) {
    if (!files.has(required)) messages.push(`npm pack is missing ${required}.`);
  }
};

const main = () => {
  const messages = [];
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'rends-knowledge-check-'));

  try {
    for (const required of [readmePath, jsonPath, sqlitePath]) {
      if (!existsSync(required)) messages.push(`Missing packaged file: ${rel(required)}`);
    }

    const build = spawnSync(process.execPath, ['scripts/build-knowledge-graph.mjs'], {
      cwd: root,
      env: { ...process.env, RENDS_KNOWLEDGE_OUT_DIR: tempDir },
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 20,
    });
    if (build.status !== 0) {
      messages.push((build.stderr || build.stdout || 'knowledge build failed').trim());
      fail(messages);
    }

    compareFiles(jsonPath, path.join(tempDir, 'ren10-graph.json'), messages);

    if (existsSync(jsonPath)) {
      const graph = readJson(jsonPath);
      checkGraphShape(graph, messages);

      if (!sqliteAvailable()) {
        messages.push('sqlite3 CLI is required to verify packaged SQLite integrity.');
      } else {
        if (!existsSync(path.join(tempDir, 'ren10-graph.sqlite'))) {
          messages.push('Temporary SQLite graph was not generated.');
        }
        if (existsSync(sqlitePath)) checkSqliteAgainstGraph(graph, sqlitePath, messages);
      }
    }

    checkPacklist(messages);

    if (messages.length > 0) fail(messages);
    console.log('RenDS knowledge graph check: OK (fresh JSON, SQLite integrity, graph shape, npm packlist).');
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
};

main();
