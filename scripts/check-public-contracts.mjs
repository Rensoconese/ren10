#!/usr/bin/env node
/** Static public-surface contract gate. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REGISTRY } from '../cli/registry.js';
import { PUBLIC_EVENTS } from './public-events.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function canonicalMarkup(contract) {
  return contract.match(/## Canonical Markup[\s\S]*?```html\s*([\s\S]*?)```/m)?.[1]?.trim() || '';
}

function requiredMarkupSection(contract) {
  return contract.match(/requiredMarkup:\s*([\s\S]*?)(?:\n\nforbiddenPatterns:|\n```)/m)?.[1] || '';
}

function requiredTagGroups(contract) {
  return requiredMarkupSection(contract)
    .split('\n')
    .filter((line) => /(?:- "Always (?:render|use|wrap)|- "(?:The )?[Rr]oot(?: element)? (?:must be|is))/i.test(line))
    .map((line) => [...line.matchAll(/<([a-z][a-z0-9-]*)\b/gi)].map((match) => match[1].toLowerCase()))
    .filter((tags) => tags.length > 0);
}

export function validateContractMarkup(name, contract) {
  const errors = [];
  const markup = canonicalMarkup(contract);
  if (!markup) return [`${name}: missing Canonical Markup html block`];
  if (/(?:\.\.\.|…)/.test(markup)) errors.push(`${name}: placeholder Canonical Markup`);

  for (const tags of requiredTagGroups(contract)) {
    if (!tags.some((tag) => new RegExp(`<${tag}\\b`, 'i').test(markup))) {
      errors.push(`${name}: required markup must include one of ${tags.map((tag) => `<${tag}>`).join(', ')}`);
    }
  }
  return errors;
}

export function compareEventMetadata(expected, documented) {
  const errors = [];
  for (const event of expected) {
    const actual = documented.find((candidate) =>
      candidate.component === event.component && candidate.event === event.event
    );
    if (!actual) {
      errors.push(`${event.component} ${event.event}: undocumented event metadata`);
      continue;
    }
    for (const flag of ['bubbles', 'composed', 'cancelable']) {
      if (Boolean(actual[flag]) !== Boolean(event[flag])) {
        errors.push(`${event.component} ${event.event}: ${flag} metadata mismatch`);
      }
    }
    const expectedDetail = [...event.detail].sort();
    const actualDetail = [...actual.detail].sort();
    if (JSON.stringify(actualDetail) !== JSON.stringify(expectedDetail)) {
      errors.push(`${event.component} ${event.event}: detail metadata mismatch`);
    }
  }
  return errors;
}

function balancedSlice(source, start, open, close) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }
    if (character === open) depth += 1;
    if (character === close) {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return '';
}

function topLevelObjectKeys(objectSource) {
  const keys = [];
  let depth = 0;
  let quote = null;
  let escaped = false;
  let tokenStart = 1;
  for (let index = 0; index < objectSource.length; index += 1) {
    const character = objectSource[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === '`') {
      quote = character;
      continue;
    }
    if (character === '{' || character === '(' || character === '[') depth += 1;
    if (character === '}' || character === ')' || character === ']') depth -= 1;
    if (depth === 1 && character === ',') {
      const token = objectSource.slice(tokenStart, index).trim();
      const key = token.match(/^([A-Za-z_$][\w$]*)\s*(?::|$)/)?.[1];
      if (key) keys.push(key);
      tokenStart = index + 1;
    }
    if (depth === 0 && character === '}') {
      const token = objectSource.slice(tokenStart, index).trim();
      const key = token.match(/^([A-Za-z_$][\w$]*)\s*(?::|$)/)?.[1];
      if (key) keys.push(key);
    }
  }
  return keys;
}

function runtimeEventMetadata(source, event) {
  const marker = `CustomEvent('${event.event}'`;
  const markerIndex = source.indexOf(marker);
  const doubleQuoteIndex = source.indexOf(`CustomEvent("${event.event}"`);
  const eventIndex = markerIndex === -1 ? doubleQuoteIndex : markerIndex;
  if (eventIndex === -1) return null;
  const callStart = source.indexOf('(', eventIndex);
  const snippet = balancedSlice(source, callStart, '(', ')');
  const detailIndex = snippet.indexOf('detail:');
  const detailStart = detailIndex === -1 ? -1 : snippet.indexOf('{', detailIndex);
  const detail = detailStart === -1
    ? []
    : topLevelObjectKeys(balancedSlice(snippet, detailStart, '{', '}'));
  return {
    component: event.component,
    event: event.event,
    bubbles: /\bbubbles:\s*true\b/.test(snippet),
    composed: /\bcomposed:\s*true\b/.test(snippet),
    cancelable: /\bcancelable:\s*true\b/.test(snippet),
    detail,
  };
}

function docsEventMetadata(html, manifest) {
  const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((match) => match[1]);
  return manifest.map((event) => {
    const row = rows.find((candidate) =>
      candidate.includes(`ren-${event.component.slice(4)}.html`) &&
      candidate.includes(`<code>${event.event}</code>`)
    );
    if (!row) return { component: event.component, event: event.event, detail: [] };
    const yesCount = (row.match(/dx-flag-yes/g) || []).length;
    const detailCell = row.match(/<td><code>\{([^}]*)\}<\/code><\/td>\s*$/)?.[1] || '';
    const detail = detailCell.split(',').map((key) => key.trim().split(/[:(]/)[0]).filter(Boolean);
    return {
      component: event.component,
      event: event.event,
      bubbles: yesCount >= 1,
      composed: yesCount >= 2,
      cancelable: event.cancelable,
      detail,
    };
  });
}

const fixtureIndex = process.argv.indexOf('--contract-fixture');
if (fixtureIndex !== -1) {
  const fixture = fs.readFileSync(path.resolve(process.argv[fixtureIndex + 1]), 'utf8');
  const fixtureErrors = validateContractMarkup('fixture', fixture);
  if (fixtureErrors.length) {
    console.error(fixtureErrors.map((error) => `✗ ${error}`).join('\n'));
    process.exit(1);
  }
  console.log('Public contract fixture: OK');
  process.exit(0);
}

const eventsFixtureIndex = process.argv.indexOf('--events-fixture');
if (eventsFixtureIndex !== -1) {
  const fixture = JSON.parse(fs.readFileSync(path.resolve(process.argv[eventsFixtureIndex + 1]), 'utf8'));
  const fixtureErrors = compareEventMetadata(fixture.expected, fixture.documented);
  if (fixtureErrors.length) {
    console.error(fixtureErrors.map((error) => `✗ ${error}`).join('\n'));
    process.exit(1);
  }
  console.log('Public event fixture: OK');
  process.exit(0);
}

const errors = [];
const tags = new Set(Object.keys(REGISTRY).map((name) => `ren-${name}`));
for (const [name, meta] of Object.entries(REGISTRY)) {
  const dir = path.join(root, 'components', meta.layer, meta.dir);
  const contract = path.join(dir, meta.layer === 'patterns' ? 'pattern.md' : 'component.md');
  if (!fs.existsSync(contract)) errors.push(`${name}: missing contract`);
  else {
    const source = fs.readFileSync(contract, 'utf8');
    if (!source.includes('## aiHints')) errors.push(`${name}: missing aiHints`);
    errors.push(...validateContractMarkup(name, source));
  }
  for (const file of meta.files) if (!fs.existsSync(path.join(dir, file))) errors.push(`${name}: missing ${file}`);
  if (/TODO|your-component|<ren-(?:component|example)\b/i.test(meta.usage)) errors.push(`${name}: placeholder usage`);
  for (const tag of meta.usage.matchAll(/<((?:ren)-[a-z0-9-]+)/gi)) if (!tags.has(tag[1])) errors.push(`${name}: unknown tag ${tag[1]}`);
}

const runtimeEvents = new Set();
for (const layer of ['primitives', 'composites', 'patterns']) {
  const base = path.join(root, 'components', layer);
  for (const dir of fs.readdirSync(base)) {
    const js = path.join(base, dir, `${dir}.js`);
    if (!fs.existsSync(js)) continue;
    const source = fs.readFileSync(js, 'utf8');
    for (const match of source.matchAll(/CustomEvent\(['"](ren-[a-z0-9-]+)/gi)) runtimeEvents.add(match[1]);
  }
}
const contractDocs = fs.readdirSync(path.join(root, 'components'), { recursive: true })
  .filter((file) => /(?:component|pattern)\.md$/.test(file))
  .map((file) => fs.readFileSync(path.join(root, 'components', file), 'utf8')).join('\n');
const eventsHtml = fs.readFileSync(path.join(root, 'docs/foundations/events.html'), 'utf8');
const docs = contractDocs + eventsHtml;
for (const event of runtimeEvents) {
  const documented = docs.includes(event) || (event.endsWith('-close') && docs.includes(`${event.slice(0, -6)}-open`));
  if (!documented) errors.push(`event undocumented: ${event}`);
}

const runtimeEventManifest = PUBLIC_EVENTS.map((event) => {
  const runtime = fs.readFileSync(path.join(root, event.source), 'utf8');
  return runtimeEventMetadata(runtime, event);
}).filter(Boolean);
for (const event of PUBLIC_EVENTS) {
  if (!runtimeEventManifest.some((runtime) => runtime.event === event.event && runtime.component === event.component)) {
    errors.push(`${event.component} ${event.event}: missing runtime emission`);
  }
}
errors.push(...compareEventMetadata(PUBLIC_EVENTS, runtimeEventManifest));
errors.push(...compareEventMetadata(PUBLIC_EVENTS, docsEventMetadata(eventsHtml, PUBLIC_EVENTS)));

if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join('\n'));
  process.exit(1);
}
console.log(`Public contracts: OK (${Object.keys(REGISTRY).length} components, ${runtimeEvents.size} events)`);
