import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { PUBLIC_EVENTS } from './public-events.mjs';

const result = spawnSync(process.execPath, ['scripts/check-public-contracts.mjs'], { encoding: 'utf8' });
assert.equal(result.status, 0, result.stderr || result.stdout);
assert.match(result.stdout, /Public contracts: OK/);
assert.equal(PUBLIC_EVENTS.length, 51, 'manifest must include all 51 component-event runtime pairs');
assert.equal(new Set(PUBLIC_EVENTS.map((event) => event.event)).size, 38, 'manifest must expose all 38 runtime event names');
assert.equal(new Set(PUBLIC_EVENTS.map((event) => event.component)).size, 26, 'manifest must expose all 26 event components');

const { runtimeEventMetadata } = await import('./check-public-contracts.mjs');
const tableSourcePath = 'components/patterns/ren-table/ren-table.js';
const tableSource = fs.readFileSync(tableSourcePath, 'utf8');
const runtimeManifest = runtimeEventMetadata(tableSource, 'ren-table')
  .map((event) => ({ ...event, source: tableSourcePath }));
const runtimeByPair = new Map();
for (const event of runtimeManifest) {
  const pair = `${event.component}:${event.event}`;
  const emissions = runtimeByPair.get(pair) || [];
  emissions.push(event);
  runtimeByPair.set(pair, emissions);
}
assert.equal(runtimeByPair.size, 3, 'runtime scanner must resolve all table helper event names');
for (const expected of [
  { event: 'ren-sort', detail: ['column', 'direction'] },
  { event: 'ren-select', detail: ['selected'] },
  { event: 'ren-filter', detail: ['value'] },
]) {
  const pair = `ren-table:${expected.event}`;
  const emissions = runtimeByPair.get(pair) || [];
  assert.ok(emissions.length > 0, `${pair} must be discovered through _dispatchEvent`);
  for (const emission of emissions) {
    assert.equal(emission.bubbles, true, `${pair} bubbles`);
    assert.equal(emission.composed, true, `${pair} composed`);
    assert.equal(emission.cancelable, false, `${pair} cancelable`);
    assert.deepEqual([...emission.detail].sort(), [...expected.detail].sort(), `${pair} detail`);
    assert.equal(emission.source, 'components/patterns/ren-table/ren-table.js', `${pair} source`);
  }
}

const invalidMarkup = spawnSync(process.execPath, [
  'scripts/check-public-contracts.mjs',
  '--contract-fixture',
  'scripts/fixtures/public-contracts/invalid-kbd.md',
], { encoding: 'utf8' });
assert.equal(invalidMarkup.status, 1, 'semantic Canonical Markup fixture must fail');
assert.match(invalidMarkup.stderr, /required markup.*<kbd>/i);

const validMarkup = spawnSync(process.execPath, [
  'scripts/check-public-contracts.mjs',
  '--contract-fixture',
  'scripts/fixtures/public-contracts/valid-kbd.md',
], { encoding: 'utf8' });
assert.equal(validMarkup.status, 0, validMarkup.stderr || validMarkup.stdout);

const invalidEvents = spawnSync(process.execPath, [
  'scripts/check-public-contracts.mjs',
  '--events-fixture',
  'scripts/fixtures/public-contracts/invalid-events.json',
], { encoding: 'utf8' });
assert.equal(invalidEvents.status, 1, 'event metadata mismatch fixture must fail');
assert.match(invalidEvents.stderr, /ren-submit.*detail/i);

const extraEvents = spawnSync(process.execPath, [
  'scripts/check-public-contracts.mjs',
  '--events-fixture',
  'scripts/fixtures/public-contracts/extra-events.json',
], { encoding: 'utf8' });
assert.equal(extraEvents.status, 1, 'undocumented/extra event metadata must fail bidirectionally');
assert.match(extraEvents.stderr, /unexpected event metadata/i);

for (const fixture of ['invalid-general-required.md', 'invalid-html-aria.md']) {
  const invalid = spawnSync(process.execPath, [
    'scripts/check-public-contracts.mjs',
    '--contract-fixture',
    `scripts/fixtures/public-contracts/${fixture}`,
  ], { encoding: 'utf8' });
  assert.equal(invalid.status, 1, `${fixture} must fail semantic validation`);
}

const invalidHost = spawnSync(process.execPath, [
  'scripts/check-public-contracts.mjs',
  '--contract-fixture',
  'scripts/fixtures/public-contracts/invalid-host.md',
  '--expected-host',
  'ren-color-picker',
], { encoding: 'utf8' });
assert.equal(invalidHost.status, 1, 'JS-bearing canonical markup must include its custom-element host');
assert.match(invalidHost.stderr, /ren-color-picker.*host/i);

const contracts = fs.readdirSync('components', { recursive: true })
  .filter((file) => /(?:component|pattern)\.md$/.test(file))
  .map((file) => fs.readFileSync(path.join('components', file), 'utf8'));
const placeholders = contracts.filter((contract) =>
  /## Canonical Markup\s+```html\s*<div class="ren-[^"]+">(?:\.\.\.|…)<\/div>\s*```/m.test(contract)
);
assert.equal(placeholders.length, 0, 'Canonical Markup must contain semantic runnable markup');

const runtimePairs = [];
const runtimeSources = new Map();
for (const layer of ['primitives', 'composites', 'patterns']) {
  const base = path.join('components', layer);
  for (const dir of fs.readdirSync(base)) {
    const sourcePath = path.join(base, dir, `${dir}.js`);
    if (!fs.existsSync(sourcePath)) continue;
    const source = fs.readFileSync(sourcePath, 'utf8');
    for (const event of runtimeEventMetadata(source, dir)) {
      const pair = `${dir}:${event.event}`;
      runtimePairs.push(pair);
      runtimeSources.set(pair, sourcePath);
    }
  }
}
const manifestPairs = PUBLIC_EVENTS.map((event) => `${event.component}:${event.event}`);
assert.deepEqual(
  [...new Set(manifestPairs)].sort(),
  [...new Set(runtimePairs)].sort(),
  'PUBLIC_EVENTS must cover every component-event runtime pair'
);
for (const event of PUBLIC_EVENTS) {
  const pair = `${event.component}:${event.event}`;
  assert.equal(event.source, runtimeSources.get(pair), `${pair} must identify its exact runtime source`);
}

const eventsHtml = fs.readFileSync('docs/foundations/events.html', 'utf8');
const eventNameCount = new Set(PUBLIC_EVENTS.map((event) => event.event)).size;
const componentCount = new Set(PUBLIC_EVENTS.map((event) => event.component)).size;
assert.match(eventsHtml, new RegExp(`${eventNameCount} event names across ${PUBLIC_EVENTS.length} component-event contracts`));
assert.match(eventsHtml, new RegExp(`${componentCount} components`));
const catalogBody = eventsHtml.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] || '';
assert.equal((catalogBody.match(/<tr>/g) || []).length, PUBLIC_EVENTS.length, 'catalog row count must match PUBLIC_EVENTS');
for (const event of PUBLIC_EVENTS) {
  const exactRows = [...eventsHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].filter((match) =>
    match[1].includes(`ren-${event.component.slice(4)}.html`) &&
    match[1].includes(`<code>${event.event}</code>`)
  );
  assert.equal(exactRows.length, 1, `${event.component}:${event.event} needs one dedicated docs row`);
}

const tableDocs = fs.readFileSync('docs/components/ren-table.html', 'utf8');
for (const event of ['ren-sort', 'ren-select', 'ren-filter']) {
  assert.match(tableDocs, new RegExp(`<code[^>]*>${event}</code>`), `table docs must name ${event}`);
}
for (const stale of ['ren-sort-change', 'ren-row-select', 'ren-page-change', 'ren-filter-change']) {
  assert.doesNotMatch(tableDocs, new RegExp(`<code[^>]*>${stale}</code>`), `table docs must remove stale ${stale}`);
}

const tableContract = fs.readFileSync('components/patterns/ren-table/pattern.md', 'utf8');
const tableCanonical = tableContract.match(/## Canonical Markup[\s\S]*?```html\s*([\s\S]*?)```/m)?.[1] || '';
assert.match(tableCanonical, /<tbody class="ren-table-body">/, 'table canonical markup must initialize the runtime tbody hook');
for (const event of ['ren-sort', 'ren-select', 'ren-filter']) {
  assert.match(tableContract, new RegExp(`\\b${event}\\b`), `table contract must name ${event}`);
}

console.log('Public contract checker: OK');
