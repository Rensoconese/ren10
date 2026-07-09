#!/usr/bin/env node
/** Static public-surface contract gate. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REGISTRY } from '../cli/registry.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const tags = new Set(Object.keys(REGISTRY).map((name) => `ren-${name}`));
for (const [name, meta] of Object.entries(REGISTRY)) {
  const dir = path.join(root, 'components', meta.layer, meta.dir);
  const contract = path.join(dir, meta.layer === 'patterns' ? 'pattern.md' : 'component.md');
  if (!fs.existsSync(contract)) errors.push(`${name}: missing contract`);
  else if (!fs.readFileSync(contract, 'utf8').includes('## aiHints')) errors.push(`${name}: missing aiHints`);
  for (const file of meta.files) if (!fs.existsSync(path.join(dir, file))) errors.push(`${name}: missing ${file}`);
  // Registry usage must not contain the old placeholder marker or unknown custom elements.
  if (/TODO|your-component|<ren-(?:component|example)\b/i.test(meta.usage)) errors.push(`${name}: placeholder usage`);
  for (const tag of meta.usage.matchAll(/<((?:ren)-[a-z0-9-]+)/gi)) if (!tags.has(tag[1])) errors.push(`${name}: unknown tag ${tag[1]}`);
}

// Every custom event emitted by runtime code is documented in at least one contract.
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
const docs = fs.readdirSync(path.join(root, 'components'), { recursive: true })
  .filter((file) => /(?:component|pattern)\.md$/.test(file))
  .map((file) => fs.readFileSync(path.join(root, 'components', file), 'utf8')).join('\n')
  + fs.readFileSync(path.join(root, 'docs/foundations/events.html'), 'utf8');
for (const event of runtimeEvents) {
  const documented = docs.includes(event) || (event.endsWith('-close') && docs.includes(`${event.slice(0, -6)}-open`));
  if (!documented) errors.push(`event undocumented: ${event}`);
}

if (errors.length) { console.error(errors.map((e) => `✗ ${e}`).join('\n')); process.exit(1); }
console.log(`Public contracts: OK (${Object.keys(REGISTRY).length} components, ${runtimeEvents.size} events)`);
