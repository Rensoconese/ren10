#!/usr/bin/env node
/**
 * Generate the package-level discovery files that editors and agents read
 * without running the CLI:
 *
 *   llms.txt               llmstxt.org index of the Markdown docs shipped in
 *                          the tarball, so an agent reads the docs of the
 *                          installed version instead of a website.
 *   custom-elements.json   Custom Elements Manifest (schema 2.1.0): tags,
 *                          attributes, events, public methods/properties and
 *                          component CSS custom properties.
 *   html-custom-data.json  VS Code HTML custom data, so `<ren-*>` tags and
 *                          their attributes autocomplete in editors.
 *
 *   node scripts/build-discovery-files.mjs          write the files
 *   node scripts/build-discovery-files.mjs --check  fail when one is stale
 *
 * Everything is derived, never hand-edited: element facts come from the
 * component JavaScript itself (parsed, not executed), descriptions from
 * cli/registry.js, and block counts from templates/blocks/catalog.json.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { REGISTRY } from '../cli/registry.js';
import { BLOCK_CATALOG_PATH, BLOCK_FAMILIES } from '../cli/blocks.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const REPO_URL = 'https://github.com/Rensoconese/ren10/blob/main';

const LIFECYCLE = new Set([
  'constructor',
  'connectedCallback',
  'disconnectedCallback',
  'adoptedCallback',
  'attributeChangedCallback',
  'connectedMoveCallback',
  'formAssociatedCallback',
  'formResetCallback',
  'formDisabledCallback',
  'formStateRestoreCallback',
]);
// Global attributes a host may read for its own wiring; they are not part of
// the component API and editors already know them.
const GLOBAL_ATTRIBUTE = /^(aria-.*|role|id|class|style|tabindex|hidden|lang|dir|title)$/;

const contractFile = (meta) => (meta.layer === 'patterns' ? 'pattern.md' : 'component.md');
const componentDir = (meta) => `components/${meta.layer}/${meta.dir}`;
const byName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
const uniqueSorted = (values) => [...new Set(values)].sort();

/** Depth-first walk over every ESTree node below `node`. */
function walk(node, visit, parents = []) {
  if (!node || typeof node.type !== 'string') return;
  visit(node, parents);
  const next = [...parents, node];
  for (const key of Object.keys(node)) {
    if (key === 'type' || key === 'start' || key === 'end') continue;
    const value = node[key];
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit, next));
    else if (value && typeof value.type === 'string') walk(value, visit, next);
  }
}

const stringValue = (node) => (node?.type === 'Literal' && typeof node.value === 'string' ? node.value : null);
const keyName = (node) => (node.key?.type === 'Identifier' ? node.key.name : stringValue(node.key));
const stringArray = (node) => (node?.type === 'ArrayExpression' ? node.elements.map(stringValue).filter(Boolean) : []);

/** Facts about one class body: attributes it reads, events it fires, public API. */
function analyzeClass(classNode) {
  const attributes = [];
  const events = [];
  const methods = [];
  const fields = new Map();

  for (const member of classNode.body.body) {
    if (member.key?.type === 'PrivateIdentifier') continue;
    const name = keyName(member);
    if (!name) continue;
    if (member.static) {
      if (name !== 'observedAttributes') continue;
      if (member.type === 'PropertyDefinition') attributes.push(...stringArray(member.value));
      if (member.type === 'MethodDefinition' && member.kind === 'get') {
        walk(member.value.body, (node) => {
          if (node.type === 'ReturnStatement') attributes.push(...stringArray(node.argument));
        });
      }
      continue;
    }
    if (name.startsWith('_') || LIFECYCLE.has(name)) continue;
    if (member.type === 'MethodDefinition' && member.kind === 'method') methods.push(name);
    if (member.type === 'MethodDefinition' && (member.kind === 'get' || member.kind === 'set')) {
      const field = fields.get(name) ?? { get: false, set: false };
      field[member.kind] = true;
      fields.set(name, field);
    }
  }

  walk(classNode.body, (node) => {
    if (
      node.type === 'CallExpression'
      && node.callee.type === 'MemberExpression'
      && node.callee.object.type === 'ThisExpression'
      && ['getAttribute', 'hasAttribute'].includes(node.callee.property.name)
    ) {
      const attribute = stringValue(node.arguments[0]);
      if (attribute) attributes.push(attribute);
    }
    if (node.type === 'NewExpression' && node.callee.name === 'CustomEvent') {
      const event = stringValue(node.arguments[0]);
      if (event) events.push(event);
    }
  });

  return {
    attributes: uniqueSorted(attributes).filter((name) => !GLOBAL_ATTRIBUTE.test(name)),
    events: uniqueSorted(events),
    methods: uniqueSorted(methods),
    fields: [...fields.entries()]
      .map(([name, access]) => ({ name, readonly: !access.set }))
      .sort(byName),
  };
}

/** Parse one component module and return its custom element definitions. */
function analyzeModule(file) {
  const source = readFileSync(path.join(root, file), 'utf8');
  const ast = acorn.parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
  const classes = new Map();
  const moduleEvents = [];
  const definitions = [];

  walk(ast, (node, parents) => {
    if ((node.type === 'ClassDeclaration' || node.type === 'ClassExpression') && node.id) {
      classes.set(node.id.name, { node, superclass: node.superClass?.name ?? null, facts: analyzeClass(node) });
    }
    if (node.type === 'NewExpression' && node.callee.name === 'CustomEvent' && !parents.some((p) => p.type === 'ClassBody')) {
      const event = stringValue(node.arguments[0]);
      if (event) moduleEvents.push(event);
    }
    if (
      node.type === 'CallExpression'
      && node.callee.type === 'MemberExpression'
      && node.callee.object.name === 'customElements'
      && node.callee.property.name === 'define'
    ) {
      const tagName = stringValue(node.arguments[0]);
      const className = node.arguments[1]?.type === 'Identifier' ? node.arguments[1].name : null;
      if (tagName && className) definitions.push({ tagName, className });
    }
  });

  // A subclass in the same module inherits its parent's attributes, events and API.
  const resolve = (className, seen = new Set()) => {
    const entry = classes.get(className);
    if (!entry || seen.has(className)) return null;
    seen.add(className);
    const parent = entry.superclass ? resolve(entry.superclass, seen) : null;
    if (!parent) return { ...entry.facts };
    return {
      attributes: uniqueSorted([...parent.attributes, ...entry.facts.attributes]),
      events: uniqueSorted([...parent.events, ...entry.facts.events]),
      methods: uniqueSorted([...parent.methods, ...entry.facts.methods]),
      fields: [...new Map([...parent.fields, ...entry.facts.fields].map((field) => [field.name, field])).values()].sort(byName),
    };
  };

  // Events fired by module-level helpers belong to the module's element(s).
  return definitions.map(({ tagName, className }) => {
    const facts = resolve(className);
    if (!facts) throw new Error(`${file}: customElements.define('${tagName}') names unknown class ${className}`);
    return {
      tagName,
      className,
      superclass: classes.get(className).superclass,
      ...facts,
      events: uniqueSorted([...facts.events, ...moduleEvents]),
    };
  });
}

/**
 * Public API comes from the contract: the JavaScript says what exists, the
 * contract says what is supported. A member is published only when the
 * contract names it (`name`, `name(` or `.name`), so internal helpers that do
 * not use a `_`/`#` prefix stay out of the manifest.
 */
function contractFacts(contractPath) {
  const text = readFileSync(path.join(root, contractPath), 'utf8');
  const section = text.match(/^## Public Token API\n([\s\S]*?)(?=^## )/m)?.[1] ?? '';
  const mentions = (name) => new RegExp(`(\`${name}\\b|\\.${name}\\b|\\b${name}\\()`).test(text);
  return {
    tokens: uniqueSorted([...section.matchAll(/`(--ren-[a-z0-9-]+)`/g)].map((match) => match[1])),
    mentions,
  };
}

function collectElements() {
  const elements = [];
  for (const meta of Object.values(REGISTRY)) {
    const dir = componentDir(meta);
    for (const file of meta.files.filter((name) => name.endsWith('.js'))) {
      const modulePath = `${dir}/${file}`;
      for (const element of analyzeModule(modulePath)) {
        const owner = REGISTRY[element.tagName.replace(/^ren-/, '')] ?? meta;
        const contract = `${componentDir(owner)}/${contractFile(owner)}`;
        const { tokens, mentions } = contractFacts(contract);
        elements.push({
          ...element,
          methods: element.methods.filter(mentions),
          fields: element.fields.filter((field) => mentions(field.name)),
          modulePath,
          description: owner.description,
          contract,
          cssProperties: tokens,
        });
      }
    }
  }
  const seen = new Set();
  return elements
    .filter((element) => (seen.has(element.tagName) ? false : seen.add(element.tagName)))
    .sort((a, b) => (a.tagName < b.tagName ? -1 : 1));
}

function buildCustomElementsManifest(elements) {
  const modules = new Map();
  for (const element of elements) {
    if (!modules.has(element.modulePath)) {
      modules.set(element.modulePath, { kind: 'javascript-module', path: element.modulePath, declarations: [], exports: [] });
    }
    const module = modules.get(element.modulePath);
    module.declarations.push({
      kind: 'class',
      name: element.className,
      description: `${element.description}. Contract: ${element.contract}`,
      customElement: true,
      tagName: element.tagName,
      ...(element.superclass && element.superclass !== 'HTMLElement'
        ? { superclass: { name: element.superclass, module: element.modulePath } }
        : {}),
      attributes: element.attributes.map((name) => ({ name })),
      events: element.events.map((name) => ({ name, type: { text: 'CustomEvent' } })),
      members: [
        ...element.fields.map((field) => ({ kind: 'field', name: field.name, ...(field.readonly ? { readonly: true } : {}) })),
        ...element.methods.map((name) => ({ kind: 'method', name })),
      ],
      cssProperties: element.cssProperties.map((name) => ({ name })),
    });
    module.exports.push({
      kind: 'custom-element-definition',
      name: element.tagName,
      declaration: { name: element.className, module: element.modulePath },
    });
  }
  return {
    schemaVersion: '2.1.0',
    readme: 'README.md',
    modules: [...modules.values()].sort((a, b) => (a.path < b.path ? -1 : 1)),
  };
}

function buildHtmlCustomData(elements) {
  return {
    $schema: 'https://raw.githubusercontent.com/microsoft/vscode-html-languageservice/main/docs/customData.schema.json',
    version: 1.1,
    tags: elements.map((element) => ({
      name: element.tagName,
      description: `${element.description}.${element.events.length ? `\n\nEvents: ${element.events.join(', ')}.` : ''}`,
      attributes: element.attributes.map((name) => ({ name })),
      references: [{ name: 'ren10 contract', url: `${REPO_URL}/${element.contract}` }],
    })),
  };
}

function buildLlmsTxt() {
  const catalog = JSON.parse(readFileSync(path.join(root, BLOCK_CATALOG_PATH), 'utf8'));
  const components = Object.values(REGISTRY);
  const layers = ['primitives', 'composites', 'patterns'];
  const lines = [
    '# ren10',
    '',
    `> ${pkg.description}`,
    '',
    'RenDS (`ren10` on npm) is a vanilla HTML/CSS/JS design system: Light DOM `ren-*` custom elements, semantic design tokens, layout primitives and copyable page-section blocks. No React, Vue, Tailwind or shadcn/ui. Every link below is a file inside the installed package (`node_modules/ren10/`), so it always matches the installed version. Read `ren-essentials.md` first and load the rest only when the task needs it.',
    '',
    '## Start here',
    '',
    '- [ren-essentials.md](ren-essentials.md): compact entry contract (~8 KB) — hard rules, tokens, layouts and routing. Same text as `npx ren10 docs design --dense`.',
    '- [AGENTS.md](AGENTS.md): agent routing, validation commands and golden examples.',
    '- [ren-design.md](ren-design.md): canonical design contract with exact token values and rationale (~97 KB; load for exact values only).',
    '',
    '## Foundations',
    '',
    '- [tokens/tokens.md](tokens/tokens.md): token decisions — use semantic/component tokens (`--color-*`, `--space-*`, `--ren-*`), never primitive palette tokens.',
    '- [base/layouts.md](base/layouts.md): layout primitives (`ren-stack`, `ren-grid`, `ren-center`, ...) to use before any custom flex/grid CSS.',
    '- [base/primitive-zero.md](base/primitive-zero.md): classless styling of native HTML elements.',
    '- [components/components.md](components/components.md): how to pick a component.',
    '- [docs/agent-safety.md](docs/agent-safety.md): `data-agent-confirm`, `data-agent-secret` and `data-agent-hidden` — what an agent must not do on its own.',
    '',
  ];
  for (const layer of layers) {
    const inLayer = components.filter((meta) => meta.layer === layer).sort((a, b) => (a.dir < b.dir ? -1 : 1));
    lines.push(`## Components: ${layer} (${inLayer.length})`, '');
    for (const meta of inLayer) {
      lines.push(`- [${meta.dir}](${componentDir(meta)}/${contractFile(meta)}): ${meta.description}.`);
    }
    lines.push('');
  }
  lines.push(
    `## Blocks (${catalog.count})`,
    '',
    'Copyable page sections. List them with `npx ren10 blocks --list` and print one with `npx ren10 blocks <name>`; check here before hand-building a nav, hero, pricing table or footer.',
    '',
    `- [${BLOCK_CATALOG_PATH}](${BLOCK_CATALOG_PATH}): catalog with title, summary, family, stylesheets, scripts and components per block.`,
  );
  for (const family of BLOCK_FAMILIES) {
    const count = catalog.families?.[family.key]?.count ?? 0;
    if (count) lines.push(`- ${catalog.families[family.key].label ?? family.key}: ${count} blocks (\`npx ren10 blocks --list --family ${family.key}\`).`);
  }
  lines.push(
    '',
    '## Machine-readable',
    '',
    '- [custom-elements.json](custom-elements.json): Custom Elements Manifest — tags, attributes, events, methods and CSS custom properties.',
    '- [html-custom-data.json](html-custom-data.json): VS Code HTML custom data for `ren-*` tag and attribute autocomplete.',
    '- [knowledge/ren10-graph.json](knowledge/ren10-graph.json): searchable knowledge graph (`npx ren10 search "<query>"`).',
    '- `npx ren10 manifest --json`: self-describing CLI surface.',
    '',
    '## Optional',
    '',
    '- [MIGRATION.md](MIGRATION.md): upgrade notes between versions.',
    '- [CHANGELOG.md](CHANGELOG.md): release history.',
    '',
  );
  return lines.join('\n');
}

const elements = collectElements();
const outputs = [
  ['llms.txt', buildLlmsTxt()],
  ['custom-elements.json', `${JSON.stringify(buildCustomElementsManifest(elements), null, 2)}\n`],
  ['html-custom-data.json', `${JSON.stringify(buildHtmlCustomData(elements), null, 2)}\n`],
];

// Every Markdown link in llms.txt must point at a file that ships.
const problems = [];
for (const match of outputs[0][1].matchAll(/\]\(([^)]+)\)/g)) {
  const generated = outputs.some(([name]) => name === match[1]);
  if (!generated && !existsSync(path.join(root, match[1]))) problems.push(`llms.txt links to missing ${match[1]}`);
}
for (const file of outputs.map(([name]) => name)) {
  if (!pkg.files.includes(file)) problems.push(`package.json "files" must include ${file}`);
}
if (pkg.customElements !== 'custom-elements.json') problems.push('package.json "customElements" must be "custom-elements.json"');
if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  process.exit(1);
}

let stale = false;
for (const [file, expected] of outputs) {
  const target = path.join(root, file);
  if (checkOnly) {
    const actual = existsSync(target) ? readFileSync(target, 'utf8') : null;
    if (actual !== expected) {
      console.error(`${file} is ${actual === null ? 'missing' : 'stale'}. Run npm run discovery:build.`);
      stale = true;
    }
  } else {
    writeFileSync(target, expected);
  }
}
if (stale) process.exit(1);
console.log(`Ren10 discovery files: ${checkOnly ? 'OK' : 'wrote'} llms.txt, custom-elements.json, html-custom-data.json (${elements.length} custom elements).`);
