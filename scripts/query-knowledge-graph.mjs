#!/usr/bin/env node
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  formatKnowledgeRows,
  loadJsonGraph,
  queryJsonGraph,
  querySqliteGraph,
  sqliteAvailable,
} from '../cli/knowledge-search.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sqlitePath = path.join(root, 'knowledge', 'ren10-graph.sqlite');
const jsonPath = path.join(root, 'knowledge', 'ren10-graph.json');
const rawArgs = process.argv.slice(2);
const forceJson = rawArgs.includes('--json') || process.env.RENDS_KNOWLEDGE_FORCE_JSON === '1';
const rawQuery = rawArgs.filter((arg) => arg !== '--json').join(' ').trim();

if (!rawQuery) {
  console.error('Usage: npm run knowledge:query -- "ren-toast status" [--json]');
  process.exit(1);
}

if (!existsSync(sqlitePath) && !existsSync(jsonPath)) {
  console.error('Knowledge graph not found. Run `npm run knowledge:build` first.');
  process.exit(1);
}

let rows;
if (!forceJson && existsSync(sqlitePath) && sqliteAvailable()) {
  rows = querySqliteGraph(sqlitePath, rawQuery);
} else {
  if (!existsSync(jsonPath)) {
    console.error(`JSON graph not found: ${jsonPath}`);
    process.exit(1);
  }
  rows = queryJsonGraph(loadJsonGraph(jsonPath), rawQuery);
}

if (rows.length === 0) {
  console.log(`No matches for "${rawQuery}".`);
  process.exit(0);
}

console.log(formatKnowledgeRows(rows));
