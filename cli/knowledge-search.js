import { spawnSync } from 'child_process';
import fs from 'fs';

const sqlLiteral = (value) => `'${String(value).replaceAll("'", "''")}'`;

export const tokenizeQuery = (input) =>
  input
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

export const toFtsQuery = (input) =>
  tokenizeQuery(input)
    .map((term) => `"${term.replaceAll('"', '""')}"`)
    .join(' OR ');

export const sqliteAvailable = () => {
  const result = spawnSync('sqlite3', ['-version'], { encoding: 'utf8' });
  return result.status === 0;
};

export const loadJsonGraph = (jsonPath) => JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

export const querySqliteGraph = (sqlitePath, rawQuery, limit = 12) => {
  const sql = `
SELECT
  n.type,
  n.name,
  n.path,
  snippet(node_fts, 4, '[', ']', ' ... ', 14) AS snippet
FROM node_fts
JOIN nodes n ON n.id = node_fts.id
WHERE node_fts MATCH ${sqlLiteral(toFtsQuery(rawQuery))}
ORDER BY bm25(node_fts)
LIMIT ${Number(limit) || 12};
`;
  const result = spawnSync('sqlite3', ['-json', sqlitePath, sql], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'sqlite3 query failed').trim());
  }

  return JSON.parse(result.stdout || '[]');
};

const countOccurrences = (haystack, needle) => {
  if (!needle) return 0;
  let count = 0;
  let index = 0;
  while ((index = haystack.indexOf(needle, index)) !== -1) {
    count++;
    index += needle.length;
  }
  return count;
};

const makeSnippet = (node, terms) => {
  const body = String(node.body ?? node.name ?? node.path ?? '');
  const lower = body.toLowerCase();
  const index = terms
    .map((term) => lower.indexOf(term))
    .filter((value) => value >= 0)
    .sort((a, b) => a - b)[0];

  if (index === undefined) return String(node.path ?? node.name ?? '').slice(0, 180);
  const start = Math.max(0, index - 80);
  const end = Math.min(body.length, index + 180);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < body.length ? '...' : '';
  return `${prefix}${body.slice(start, end)}${suffix}`.replace(/\s+/g, ' ').trim();
};

const scoreNode = (node, rawQuery, terms) => {
  const full = rawQuery.toLowerCase();
  const name = String(node.name ?? '').toLowerCase();
  const nodePath = String(node.path ?? '').toLowerCase();
  const type = String(node.type ?? '').toLowerCase();
  const body = String(node.body ?? '').toLowerCase();

  let score = 0;
  if (name === full) score += 160;
  if (name.includes(full)) score += 90;
  if (nodePath.includes(full)) score += 45;

  for (const term of terms) {
    if (name === term) score += 80;
    if (name.includes(term)) score += 35;
    if (nodePath.includes(term)) score += 18;
    if (type.includes(term)) score += 8;
    score += Math.min(countOccurrences(body, term), 12);
  }

  return score;
};

export const queryJsonGraph = (graph, rawQuery, limit = 12) => {
  const terms = tokenizeQuery(rawQuery);
  return graph.nodes
    .map((node) => ({ node, score: scoreNode(node, rawQuery, terms) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return String(a.node.id).localeCompare(String(b.node.id));
    })
    .slice(0, limit)
    .map(({ node }) => ({
      type: node.type,
      name: node.name,
      path: node.path,
      snippet: makeSnippet(node, terms),
    }));
};

export const formatKnowledgeRows = (rows, colors = null) =>
  rows
    .map((row) => {
      const type = String(row.type ?? '').padEnd(12);
      const name = String(row.name ?? '');
      const line = colors ? `${colors.cyan}${type}${colors.reset} ${colors.bold}${name}${colors.reset}` : `${type} ${name}`;
      return [
        line,
        row.path ? `  ${row.path}` : null,
        row.snippet ? `  ${String(row.snippet).replace(/\s+/g, ' ').trim()}` : null,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');
