import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { REGISTRY } from '../cli/registry.js';
import { validateRegistryAiHints } from './lib/ai-hints.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(packageRoot, 'packages', 'astro', 'components');
const catalogPath = path.join(packageRoot, 'packages', 'astro', 'catalog.json');
const checkOnly = process.argv.includes('--check');
const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

const validation = validateRegistryAiHints(packageRoot, REGISTRY);
if (validation.errors.length > 0) {
  fail(`Cannot generate Astro components:\n${validation.errors.map((error) => `- ${error}`).join('\n')}`);
}

const hintsByKey = new Map(validation.records.map((record) => [record.key, record.aiHints]));
const expected = new Map();
const exports = [];
const catalog = [];

for (const [key, meta] of Object.entries(REGISTRY)) {
  const componentName = exportName(meta.name);
  const filename = `${componentName}.astro`;
  const hints = hintsByKey.get(key);
  const root = rootElement(meta.usage, key);
  const cssImports = hints.canonicalImports.css.map(packageImport);
  const clientModules = (hints.canonicalImports.js ?? []).map(clientModule);

  expected.set(filename, renderComponent({ componentName, key, meta, root, cssImports, clientModules }));
  exports.push(`export { default as ${componentName} } from './${filename}';`);
  catalog.push({
    key,
    name: meta.name,
    exportName: componentName,
    import: `@ren10/astro/components/${componentName}`,
    rootTag: root.tag,
    defaultClasses: root.classes ? root.classes.split(/\s+/) : [],
    layer: meta.layer,
    contract: `ren10/components/${meta.layer}/${meta.dir}/${meta.layer === 'patterns' ? 'pattern.md' : 'component.md'}`,
    css: cssImports,
    js: clientModules.map((module) => module.specifier),
  });
}

expected.set('index.js', `${exports.join('\n')}\n`);
const catalogSource = `${JSON.stringify({ schemaVersion: 1, components: catalog }, null, 2)}\n`;

if (checkOnly) {
  checkGeneratedFiles(expected);
  if (!fs.existsSync(catalogPath) || fs.readFileSync(catalogPath, 'utf8') !== catalogSource) fail('Astro catalog is missing or out of date');
  console.log(`Astro component catalog OK (${expected.size - 1} components)`);
} else {
  fs.mkdirSync(outputDir, { recursive: true });
  removeStaleFiles(expected);
  for (const [filename, source] of expected) fs.writeFileSync(path.join(outputDir, filename), source);
  fs.writeFileSync(catalogPath, catalogSource);
  console.log(`Generated ${expected.size - 1} Astro components in ${portable(path.relative(packageRoot, outputDir))}`);
}

function rootElement(usage, key) {
  const opening = usage.match(/<([a-z][\w-]*)([^>]*)>/i);
  if (!opening) fail(`${key}: registry usage has no root element`);
  const classMatch = opening[2].match(/\bclass=["']([^"']+)["']/i);
  return { tag: opening[1], classes: classMatch?.[1] ?? '' };
}

function renderComponent({ componentName, key, meta, root, cssImports, clientModules }) {
  const imports = cssImports.map((specifier) => `import '${specifier}';`).join('\n');
  const classExpression = root.classes
    ? `class:list={['${escapeSingle(root.classes)}', className]}`
    : 'class:list={className}';
  const host = VOID_ELEMENTS.has(root.tag)
    ? `<${root.tag} ${classExpression} {...rest} />`
    : `<${root.tag} ${classExpression} {...rest}><slot /></${root.tag}>`;
  const clientScript = clientModules.length === 0
    ? ''
    : `\n\n<script>\n${clientModules.map((module) => renderClientModule(module, root.tag)).join('\n')}\n</script>`;

  return `---\n${imports}\n\n/**\n * ${componentName} — generated from RenDS ${meta.layer}/${meta.dir}.\n * Contract: ren10/components/${meta.layer}/${meta.dir}/${meta.layer === 'patterns' ? 'pattern.md' : 'component.md'}\n * Registry key: ${key}\n */\nexport interface Props {\n  class?: string;\n  [attribute: string]: unknown;\n}\n\nconst { class: className, ...rest } = Astro.props;\n---\n\n${host}${clientScript}\n`;
}

function clientModule(specifier) {
  const localPath = String(specifier).replace(/^(?:rends|ren10)\//, '');
  const source = fs.readFileSync(path.join(packageRoot, localPath), 'utf8');
  const initializer = source.includes('customElements.define')
    ? null
    : source.match(/export function (init(?!All)[A-Z]\w*)\s*\(/)?.[1] ?? null;
  return { specifier: packageImport(specifier), initializer };
}

function renderClientModule(module, rootTag) {
  if (!module.initializer) return `  import '${module.specifier}';`;
  return `  import { ${module.initializer} } from '${module.specifier}';\n  document.querySelectorAll('${rootTag}').forEach((element) => ${module.initializer}(element));`;
}

function checkGeneratedFiles(files) {
  if (!fs.existsSync(outputDir)) fail('Astro components have not been generated; run npm run astro:generate');
  const errors = [];
  for (const [filename, expectedSource] of files) {
    const target = path.join(outputDir, filename);
    if (!fs.existsSync(target)) errors.push(`missing ${filename}`);
    else if (fs.readFileSync(target, 'utf8') !== expectedSource) errors.push(`outdated ${filename}`);
  }
  for (const filename of generatedFiles()) {
    if (!files.has(filename)) errors.push(`stale ${filename}`);
  }
  if (errors.length > 0) fail(`Astro component catalog is out of date:\n${errors.map((error) => `- ${error}`).join('\n')}`);
}

function removeStaleFiles(files) {
  if (!fs.existsSync(outputDir)) return;
  for (const filename of generatedFiles()) {
    if (!files.has(filename)) fs.rmSync(path.join(outputDir, filename));
  }
}

function generatedFiles() {
  return fs.readdirSync(outputDir).filter((filename) => filename === 'index.js' || filename.endsWith('.astro'));
}

function exportName(name) {
  return name.split(/[\s-]+/).map((part) => part === part.toUpperCase() ? part : `${part[0].toUpperCase()}${part.slice(1)}`).join('');
}

function packageImport(specifier) {
  return String(specifier).replace(/^rends\//, 'ren10/');
}

function escapeSingle(value) {
  return value.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
}

function portable(value) {
  return value.split(path.sep).join('/');
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
