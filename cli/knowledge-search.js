import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { familyForBlockName } from './blocks.js';

const sqlLiteral = (value) => `'${String(value).replaceAll("'", "''")}'`;

/**
 * Words that carry no signal for finding a RenDS part. Without this list a
 * request such as "landing page for a dental clinic with pricing" matched on
 * "page", "a" and "for" and returned ren-pagination, ren-breadcrumb, ren-link.
 * The list covers function words plus generic UI-request words ("page",
 * "website", "component", "build") that appear in nearly every document.
 */
export const STOPWORDS = new Set([
  'a', 'about', 'all', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'but', 'by', 'can', 'do', 'for', 'from',
  'has', 'have', 'how', 'i', 'in', 'into', 'is', 'it', 'its', 'me', 'my', 'of', 'on', 'or', 'our', 'so',
  'some', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'this', 'those', 'to', 'up', 'us', 'we',
  'what', 'when', 'where', 'which', 'who', 'will', 'with', 'within', 'without', 'you', 'your',
  // Generic request words: present in almost every contract and page.
  'add', 'build', 'building', 'clean', 'component', 'components', 'create', 'design', 'get', 'good',
  'just', 'like', 'make', 'modern', 'need', 'needs', 'new', 'nice', 'page', 'pages', 'please', 'really',
  'screen', 'section', 'sections', 'show', 'simple', 'site', 'ui', 'use', 'using', 'ux', 'very', 'view',
  'want', 'wants', 'web', 'webpage', 'website',
]);

/**
 * Query words mapped to the term RenDS actually uses in names and paths:
 * component directories (`ren-nav`), block families (`pricing-*`), examples.
 */
export const QUERY_SYNONYMS = {
  navbar: 'nav', navigation: 'nav', navigations: 'nav', topbar: 'nav', megamenu: 'nav', 'mega-menu': 'nav',
  price: 'pricing', prices: 'pricing', plan: 'pricing', plans: 'pricing', tiers: 'pricing', 'pricing-table': 'pricing',
  testimonials: 'testimonial', review: 'testimonial', reviews: 'testimonial',
  faqs: 'faq', questions: 'faq',
  features: 'feature',
  footers: 'footer',
  heroes: 'hero', landing: 'hero', homepage: 'hero',
  'call-to-action': 'cta', ctas: 'cta',
  contacts: 'contact', enquiry: 'contact', inquiry: 'contact',
  dashboards: 'dashboard', admin: 'dashboard',
  forms: 'form',
  tables: 'table', datatable: 'table', 'data-table': 'table',
  modal: 'dialog', modals: 'dialog', dialogs: 'dialog',
  blogs: 'blog', posts: 'blog',
  articles: 'article',
  buttons: 'button', cards: 'card', tab: 'tabs', toasts: 'toast', notification: 'toast',
  notifications: 'toast', dropdown: 'menu', dropdowns: 'menu', sidebars: 'sidebar', drawer: 'sheet',
  drawers: 'sheet', fields: 'field', inputs: 'field', input: 'field', tooltips: 'tooltip', badges: 'badge',
  avatars: 'avatar', tags: 'tag', icons: 'icon', breadcrumbs: 'breadcrumb', datepicker: 'date-picker',
  autocomplete: 'combobox', accordions: 'accordion', menus: 'menu',
};

const tokenPattern = /^[^a-z0-9.\-_]+|[^a-z0-9\-_]+$/g;

/** Split on whitespace and strip surrounding punctuation (keeps `.ren-x`, `--token`). */
export const tokenizeQuery = (input) =>
  String(input ?? '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(tokenPattern, ''))
    .filter(Boolean);

/**
 * Turn a raw query into the terms used for retrieval and ranking.
 *
 * - `terms`: canonical, signal-bearing words (stopwords dropped, synonyms
 *   applied). Ranking uses these.
 * - `matchTerms`: `terms` plus the original spelling of any synonym, so a
 *   block titled "Navbar Drawer" still matches "navbar" textually.
 *
 * When every word is a stopword ("a", "page"), the raw tokens are kept so the
 * query still returns something rather than nothing.
 */
export const analyzeQuery = (input) => {
  const tokens = tokenizeQuery(input);
  const terms = [];
  const matchTerms = [];
  const push = (list, value) => { if (value && !list.includes(value)) list.push(value); };
  for (const token of tokens) {
    if (STOPWORDS.has(token)) continue;
    const canonical = QUERY_SYNONYMS[token] ?? token;
    push(terms, canonical);
    push(matchTerms, canonical);
    push(matchTerms, token);
  }
  if (terms.length === 0) {
    for (const token of tokens) {
      push(terms, token);
      push(matchTerms, token);
    }
  }
  return { raw: String(input ?? ''), tokens, terms, matchTerms };
};

export const toFtsQuery = (input) =>
  analyzeQuery(input)
    .matchTerms.map((term) => `"${term.replaceAll('"', '""')}"`)
    .join(' OR ');

export const sqliteAvailable = () => {
  const result = spawnSync('sqlite3', ['-version'], { encoding: 'utf8' });
  return result.status === 0;
};

/**
 * Load the JSON graph and rehydrate node bodies from the package.
 *
 * The published graph omits `body`: every node carries a `path` (or, for a
 * node whose path is a directory, `data.bodyPath`) into this same package, so
 * the text ships once as the file itself rather than twice. Ranking and
 * snippets still need it, so it is read back here — lazily per node, and only
 * when the JSON fallback runs at all (the SQLite path never calls this).
 *
 * Nodes are hydrated with a getter so a query that only matches on name or
 * path never touches the filesystem, and an unreadable file degrades to an
 * empty body instead of failing the whole search.
 */
export const loadJsonGraph = (jsonPath) => {
  const graph = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const packageRoot = path.resolve(path.dirname(jsonPath), '..');

  for (const node of graph.nodes) {
    const bodyPath = node.data?.bodyPath ?? node.path;
    if (node.body !== undefined || !bodyPath) continue;
    let cached;
    Object.defineProperty(node, 'body', {
      configurable: true,
      enumerable: true,
      get() {
        if (cached === undefined) {
          try {
            cached = fs.readFileSync(path.join(packageRoot, bodyPath), 'utf8');
          } catch {
            cached = '';
          }
        }
        return cached;
      },
    });
  }

  return graph;
};

/**
 * Both search backends share one ranking model:
 *
 * 1. Retrieval. Each backend finds the nodes whose text mentions any
 *    `matchTerms` word and orders them by its own text relevance — FTS5 bm25
 *    for SQLite, whole-word occurrence counts for the JSON fallback. The best
 *    CANDIDATE_POOL rows survive.
 * 2. Re-ranking. Every candidate gets the same structural score from fields
 *    that are identical in both backends (name, path, type, block family).
 *    Structure decides, so a query for "pricing" lands on the pricing blocks
 *    on either path, and the backend's text order only breaks ties.
 */
export const CANDIDATE_POOL = 200;

const TYPE_WEIGHT = {
  component: 24,
  block: 20,
  example: 30,
  'design-contract': 8,
  'tokens-contract': 8,
  'layouts-contract': 8,
  'primitive-zero': 8,
  'component-router': 8,
  contract: 6,
  'tooling-doc': 4,
  docs_page: 2,
  css: -8,
  javascript: -8,
  selector: -6,
  token: -6,
};

const FILE_TYPES = new Set(['css', 'javascript', 'contract', 'docs_page']);
const FRAGMENT_TYPES = new Set(['selector', 'token']);

const nameParts = (value) => value.split(/[^a-z0-9]+/).filter((part) => part && part !== 'ren');

/**
 * Score a candidate from the fields both backends share. Returns the score and
 * the first query term the row answered, used to diversify results.
 */
export const structuralMatch = (row, analysis) => {
  const name = String(row.name ?? '').toLowerCase().replace(/\.(html|md|css|js)$/, '');
  const nodePath = String(row.path ?? '').toLowerCase();
  const parts = nameParts(name);
  const pathParts = nameParts(nodePath);
  const full = analysis.tokens.join(' ');
  const family = row.type === 'block' ? familyForBlockName(name) : null;
  // ren-nav.css, ren-nav.js and the ren-nav contract restate the component;
  // only the component row itself earns the exact-name bonus.
  const canonical = !FILE_TYPES.has(row.type);

  let score = 0;
  let concept = null;
  let matched = 0;
  if (canonical && full && (name === full || name === `ren-${full}`)) score += 120;
  for (const term of analysis.terms) {
    let hit = false;
    if (canonical && (name === term || name === `ren-${term}` || name === `.${term}`)) { score += 100; hit = true; }
    // Selector and token rows are fragments: they answer a query that names
    // them (or a selector/token prefix such as ".ren-btn"), not one that
    // merely shares a word (".ren-avatar-status" for "status").
    else if (FRAGMENT_TYPES.has(row.type)) {
      if (/^(?:\.|--|ren-)/.test(term) && (name.startsWith(term) || name.startsWith(`.${term}`))) { score += 45; hit = true; }
    }
    else if (term.includes('-') ? name.includes(term) : parts.includes(term)) { score += 45; hit = true; }
    else if (term.length >= 3 && name.includes(term)) { score += 12; hit = true; }
    if (term.includes('-') ? nodePath.includes(term) : pathParts.includes(term)) { score += 8; hit = true; }
    // "dashboard" finds application-shell blocks, "plans" finds pricing, etc.
    // A block of that family outranks one whose name merely contains the word
    // (footer-* before feature-panorama-proof-footer).
    if (family && (family.key === term || family.aliases.includes(term))) {
      score += hit ? 15 : 40;
      hit = true;
    }
    if (hit) {
      matched += 1;
      concept ??= term;
    }
  }
  // Rows that answer several of the requested concepts beat single hits.
  if (matched > 1) score += 20 * (matched - 1);
  if (matched > 0) score += TYPE_WEIGHT[row.type] ?? 0;
  return { score, concept };
};

export const structuralScore = (row, analysis) => structuralMatch(row, analysis).score;

const DIVERSITY_PENALTY = 10;

/**
 * Re-rank candidates (already ordered by backend text relevance) and keep the
 * top `limit`.
 *
 * Structure decides and text only breaks ties: rows are ordered by structural
 * score, then by the order their concept appears in the query, then by the
 * backend's own text order. Because the first two keys come from fields both
 * backends share, SQLite and the JSON fallback return the same kinds of rows
 * in the same order; only rows that are structurally identical (two pricing
 * blocks) can swap places between them.
 *
 * A request that names several concepts ("hero, pricing and contact") should
 * not return twelve hero blocks: each further row answering the same concept
 * pays a growing penalty, which interleaves concepts without hiding any.
 */
export const rankCandidates = (candidates, analysis, limit) => {
  const conceptOrder = (concept) => (concept ? analysis.terms.indexOf(concept) : analysis.terms.length);
  const scored = candidates.map((row, index) => ({ row, index, ...structuralMatch(row, analysis) }));
  const byScore = (a, b) => (b.score - a.score)
    || (conceptOrder(a.concept) - conceptOrder(b.concept))
    || (a.index - b.index);
  scored.sort(byScore);

  if (new Set(scored.map((item) => item.concept).filter(Boolean)).size > 1) {
    const seen = new Map();
    for (const item of scored) {
      if (!item.concept) continue;
      const count = seen.get(item.concept) ?? 0;
      item.score -= DIVERSITY_PENALTY * count;
      seen.set(item.concept, count + 1);
    }
    scored.sort(byScore);
  }

  return scored
    .slice(0, limit)
    .map(({ row }) => ({ type: row.type, name: row.name, path: row.path, snippet: row.snippet }));
};

export const querySqliteGraph = (sqlitePath, rawQuery, limit = 12) => {
  const analysis = analyzeQuery(rawQuery);
  if (analysis.matchTerms.length === 0) return [];
  // Column weights: id and type are UNINDEXED; name and path count far more
  // than a mention deep inside a body.
  const sql = `
SELECT
  n.type,
  n.name,
  n.path,
  snippet(node_fts, 4, '[', ']', ' ... ', 14) AS snippet
FROM node_fts
JOIN nodes n ON n.id = node_fts.id
WHERE node_fts MATCH ${sqlLiteral(toFtsQuery(rawQuery))}
ORDER BY bm25(node_fts, 0, 0, 10.0, 4.0, 1.0), n.id
LIMIT ${CANDIDATE_POOL};
`;
  const result = spawnSync('sqlite3', ['-json', sqlitePath, sql], {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });

  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'sqlite3 query failed').trim());
  }

  return rankCandidates(JSON.parse(result.stdout || '[]'), analysis, Number(limit) || 12);
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Whole-word matcher, mirroring how the FTS5 unicode61 tokenizer splits text. */
const wordPattern = (term) => {
  const words = term.split(/[^a-z0-9]+/).filter(Boolean);
  if (words.length === 0) return null;
  return new RegExp(`(?<![a-z0-9])${words.map(escapeRegExp).join('[^a-z0-9]+')}(?![a-z0-9])`, 'g');
};

const countMatches = (haystack, pattern) => (pattern ? (haystack.match(pattern) ?? []).length : 0);

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

/** Text relevance for the JSON fallback: weighted like the bm25 columns above. */
const textScore = (node, patterns) => {
  const name = String(node.name ?? '').toLowerCase();
  const nodePath = String(node.path ?? '').toLowerCase();
  let score = 0;
  let body = null;
  for (const pattern of patterns) {
    score += 10 * countMatches(name, pattern);
    score += 4 * countMatches(nodePath, pattern);
    body ??= String(node.body ?? '').toLowerCase();
    score += Math.min(countMatches(body, pattern), 12);
  }
  return score;
};

export const queryJsonGraph = (graph, rawQuery, limit = 12) => {
  const analysis = analyzeQuery(rawQuery);
  const patterns = analysis.matchTerms.map(wordPattern).filter(Boolean);
  if (patterns.length === 0) return [];
  const candidates = graph.nodes
    .map((node) => ({ node, score: textScore(node, patterns) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => (b.score - a.score) || String(a.node.id).localeCompare(String(b.node.id)))
    .slice(0, CANDIDATE_POOL)
    .map(({ node }) => ({
      type: node.type,
      name: node.name,
      path: node.path,
      get snippet() { return makeSnippet(node, analysis.matchTerms); },
    }));
  return rankCandidates(candidates, analysis, limit);
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
