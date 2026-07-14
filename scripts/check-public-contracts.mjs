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
    .filter((line) => /- "(?:<|Always\b|Place one\b|(?:The )?[Rr]oot\b)/i.test(line))
    .map((line) => {
      const positive = line.split(/(?:;|—|\bnever\b|\bdo not\b)/i)[0];
      const tags = [...positive.matchAll(/<([a-z][a-z0-9-]*)\b/gi)]
        .map((match) => match[1].toLowerCase());
      return tags.length > 0 ? [tags[0]] : [];
    })
    .filter((tags) => tags.length > 0);
}

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

function validateHtmlStructure(name, markup) {
  const errors = [];
  const stack = [];
  const ids = new Set([...markup.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]));
  const tags = markup.matchAll(/<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi);
  for (const match of tags) {
    const source = match[0];
    const tag = match[1].toLowerCase();
    if (source.startsWith('</')) {
      const current = stack.pop();
      if (current !== tag) errors.push(`${name}: invalid HTML nesting, expected </${current || 'none'}> before </${tag}>`);
      continue;
    }
    if (!source.endsWith('/>') && !VOID_TAGS.has(tag)) stack.push(tag);
  }
  if (stack.length > 0) errors.push(`${name}: unclosed HTML tag <${stack.at(-1)}>`);

  for (const match of markup.matchAll(/\b(?:aria-controls|aria-labelledby|aria-describedby|for)=["']([^"']+)["']/gi)) {
    for (const reference of match[1].trim().split(/\s+/)) {
      if (reference && !ids.has(reference)) errors.push(`${name}: ARIA/label reference #${reference} does not exist`);
    }
  }
  return errors;
}

export function validateContractMarkup(name, contract, expectedHost = null) {
  const errors = [];
  const markup = canonicalMarkup(contract);
  if (!markup) return [`${name}: missing Canonical Markup html block`];
  if (/(?:\.\.\.|…)/.test(markup)) errors.push(`${name}: placeholder Canonical Markup`);
  errors.push(...validateHtmlStructure(name, markup));
  if (expectedHost && !new RegExp(`<${expectedHost}\\b`, 'i').test(markup)) {
    errors.push(`${name}: Canonical Markup must include <${expectedHost}> custom-element host`);
  }

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
  for (const event of documented) {
    if (!expected.some((candidate) =>
      candidate.component === event.component && candidate.event === event.event
    )) {
      errors.push(`${event.component} ${event.event}: unexpected event metadata`);
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

function topLevelArguments(callSource) {
  const argumentsSource = callSource.slice(1, -1);
  const args = [];
  let depth = 0;
  let quote = null;
  let escaped = false;
  let tokenStart = 0;
  for (let index = 0; index < argumentsSource.length; index += 1) {
    const character = argumentsSource[index];
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
    if (depth === 0 && character === ',') {
      args.push(argumentsSource.slice(tokenStart, index).trim());
      tokenStart = index + 1;
    }
  }
  args.push(argumentsSource.slice(tokenStart).trim());
  return args;
}

function eventMetadataFromSnippet(source, eventIndex, component, event, snippet) {
  const detailIndex = snippet.indexOf('detail:');
  const detailStart = detailIndex === -1 ? -1 : snippet.indexOf('{', detailIndex);
  let detail = detailStart === -1
    ? []
    : topLevelObjectKeys(balancedSlice(snippet, detailStart, '{', '}'));
  if (detailStart === -1) {
    const identifier = detailIndex !== -1
      ? snippet.slice(detailIndex + 7).match(/^\s*([A-Za-z_$][\w$]*)/)?.[1]
      : (/\bdetail\s*[,}]/.test(snippet) ? 'detail' : null);
    if (identifier) {
      const prefix = source.slice(Math.max(0, eventIndex - 2500), eventIndex);
      const keys = new Set();
      const assignmentPattern = new RegExp(`\\b${identifier}\\s*=\\s*\\{`, 'g');
      for (const assignment of prefix.matchAll(assignmentPattern)) {
        const objectStart = prefix.indexOf('{', assignment.index);
        for (const key of topLevelObjectKeys(balancedSlice(prefix, objectStart, '{', '}'))) keys.add(key);
      }
      const propertyPattern = new RegExp(`\\b${identifier}\\.([A-Za-z_$][\\w$]*)\\s*=`, 'g');
      for (const property of prefix.matchAll(propertyPattern)) keys.add(property[1]);
      detail = [...keys];
    }
  }
  return {
    component,
    event,
    bubbles: /\bbubbles:\s*true\b/.test(snippet),
    composed: /\bcomposed:\s*true\b/.test(snippet),
    cancelable: /\bcancelable:\s*true\b/.test(snippet),
    detail,
  };
}

export function runtimeEventMetadata(source, component) {
  const events = [];
  for (const match of source.matchAll(/CustomEvent\(\s*['"](ren-[a-z0-9-]+)['"]/gi)) {
    const callStart = source.indexOf('(', match.index);
    const snippet = balancedSlice(source, callStart, '(', ')');
    events.push(eventMetadataFromSnippet(source, match.index, component, match[1], snippet));
  }

  const helperPattern = /(?:^|\n)\s*(?:async\s+)?([A-Za-z_$][\w$]*)\s*\(\s*([A-Za-z_$][\w$]*)\s*,\s*([A-Za-z_$][\w$]*)[^)]*\)\s*\{/g;
  for (const helper of source.matchAll(helperPattern)) {
    const [definition, helperName, eventParameter] = helper;
    const bodyStart = helper.index + definition.lastIndexOf('{');
    const body = balancedSlice(source, bodyStart, '{', '}');
    const dispatchPattern = new RegExp(`CustomEvent\\(\\s*${eventParameter}\\b`);
    const dispatch = dispatchPattern.exec(body);
    if (!dispatch) continue;
    const dispatchStart = body.indexOf('(', dispatch.index);
    const dispatchSnippet = balancedSlice(body, dispatchStart, '(', ')');
    const flags = {
      bubbles: /\bbubbles:\s*true\b/.test(dispatchSnippet),
      composed: /\bcomposed:\s*true\b/.test(dispatchSnippet),
      cancelable: /\bcancelable:\s*true\b/.test(dispatchSnippet),
    };
    const callPattern = new RegExp(`(?:this\\.)?${helperName}\\(\\s*['"](ren-[a-z0-9-]+)['"]`, 'gi');
    for (const call of source.matchAll(callPattern)) {
      const callStart = source.indexOf('(', call.index);
      const callSnippet = balancedSlice(source, callStart, '(', ')');
      const detailSource = topLevelArguments(callSnippet)[1] || '';
      const detail = detailSource.startsWith('{') ? topLevelObjectKeys(detailSource) : [];
      events.push({ component, event: call[1], ...flags, detail });
    }
  }
  return events;
}

function docsEventMetadata(html, manifest) {
  const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((match) => match[1]);
  return manifest.map((event) => {
    const row = rows.find((candidate) =>
      candidate.includes(`ren-${event.component.slice(4)}.html`) &&
      candidate.includes(`<code>${event.event}</code>`)
    );
    if (!row) return { component: event.component, event: event.event, detail: [] };
    const cells = [...row.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((match) => match[1]);
    const detailCell = cells[5]?.match(/<code>\{([^}]*)\}<\/code>/)?.[1] || '';
    const detail = detailCell.split(',').map((key) => key.trim().split(/[:(]/)[0]).filter(Boolean);
    return {
      component: event.component,
      event: event.event,
      bubbles: cells[2]?.includes('dx-flag-yes') || false,
      composed: cells[3]?.includes('dx-flag-yes') || false,
      cancelable: cells[4]?.includes('dx-flag-yes') || false,
      detail,
    };
  });
}

if (process.argv.includes('--print-runtime-events')) {
  const printed = [];
  for (const layer of ['primitives', 'composites', 'patterns']) {
    const base = path.join(root, 'components', layer);
    for (const dir of fs.readdirSync(base)) {
      const sourcePath = path.join(base, dir, `${dir}.js`);
      if (!fs.existsSync(sourcePath)) continue;
      const source = fs.readFileSync(sourcePath, 'utf8');
      for (const event of runtimeEventMetadata(source, dir)) {
        printed.push({ ...event, source: path.relative(root, sourcePath) });
      }
    }
  }
  console.log(JSON.stringify(printed, null, 2));
  process.exit(0);
}

const fixtureIndex = process.argv.indexOf('--contract-fixture');
if (fixtureIndex !== -1) {
  const fixture = fs.readFileSync(path.resolve(process.argv[fixtureIndex + 1]), 'utf8');
  const hostIndex = process.argv.indexOf('--expected-host');
  const fixtureErrors = validateContractMarkup(
    hostIndex === -1 ? 'fixture' : process.argv[hostIndex + 1],
    fixture,
    hostIndex === -1 ? null : process.argv[hostIndex + 1]
  );
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
    const jsFile = path.join(dir, `${meta.dir}.js`);
    const expectedHost = meta.layer !== 'primitives' && fs.existsSync(jsFile) && new RegExp(`customElements\\.define\\(['\"]ren-${name}['\"]`).test(fs.readFileSync(jsFile, 'utf8'))
      ? `ren-${name}`
      : null;
    errors.push(...validateContractMarkup(name, source, expectedHost));
  }
  for (const file of meta.files) if (!fs.existsSync(path.join(dir, file))) errors.push(`${name}: missing ${file}`);
  if (/TODO|your-component|<ren-(?:component|example)\b/i.test(meta.usage)) errors.push(`${name}: placeholder usage`);
  for (const tag of meta.usage.matchAll(/<((?:ren)-[a-z0-9-]+)/gi)) if (!tags.has(tag[1])) errors.push(`${name}: unknown tag ${tag[1]}`);
}

const runtimeEvents = new Set();
const runtimeEventManifest = [];
for (const layer of ['primitives', 'composites', 'patterns']) {
  const base = path.join(root, 'components', layer);
  for (const dir of fs.readdirSync(base)) {
    const js = path.join(base, dir, `${dir}.js`);
    if (!fs.existsSync(js)) continue;
    const source = fs.readFileSync(js, 'utf8');
    for (const event of runtimeEventMetadata(source, dir)) {
      event.source = path.relative(root, js);
      runtimeEvents.add(event.event);
      const existing = runtimeEventManifest.find((candidate) =>
        candidate.component === event.component && candidate.event === event.event
      );
      if (existing) {
        const mismatches = compareEventMetadata([existing], [event]);
        if (mismatches.length) errors.push(`${dir} ${event.event}: inconsistent runtime emissions`);
      } else runtimeEventManifest.push(event);
    }
  }
}
const eventsHtml = fs.readFileSync(path.join(root, 'docs/foundations/events.html'), 'utf8');

const manifestKeys = new Set();
for (const event of PUBLIC_EVENTS) {
  const key = `${event.component}:${event.event}`;
  if (manifestKeys.has(key)) errors.push(`${key}: duplicate public event manifest entry`);
  manifestKeys.add(key);
  const runtime = runtimeEventManifest.find((candidate) =>
    candidate.event === event.event && candidate.component === event.component
  );
  if (!runtime) {
    errors.push(`${event.component} ${event.event}: missing runtime emission`);
  } else if (runtime.source !== event.source) {
    errors.push(`${event.component} ${event.event}: source metadata mismatch`);
  }
}
errors.push(...compareEventMetadata(PUBLIC_EVENTS, runtimeEventManifest));
errors.push(...compareEventMetadata(PUBLIC_EVENTS, docsEventMetadata(eventsHtml, PUBLIC_EVENTS)));

if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join('\n'));
  process.exit(1);
}
console.log(`Public contracts: OK (${Object.keys(REGISTRY).length} components, ${runtimeEvents.size} events)`);
