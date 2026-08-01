import fs from 'node:fs';
import path from 'node:path';

import yaml from 'js-yaml';

const AI_HINTS_SCHEMA_VERSION = 1;
const TOP_LEVEL_KEYS = [
  'selectionCriteria',
  'canonicalImports',
  'requiredMarkup',
  'forbiddenPatterns',
  'tokenPolicy',
  'accessibility',
];

function contractPath(packageRoot, meta) {
  const filename = meta.layer === 'patterns' ? 'pattern.md' : 'component.md';
  return path.join(packageRoot, 'components', meta.layer, meta.dir, filename);
}

function parseAiHints(markdown, label = 'contract') {
  const section = markdown.match(/^## aiHints\s*$[\s\S]*?```yaml\s*([\s\S]*?)```/m);
  if (!section) throw new Error(`${label}: missing fenced YAML under ## aiHints`);
  const value = yaml.load(section[1]);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label}: aiHints must be an object`);
  }
  return value;
}

function validateAiHints(value, label = 'aiHints') {
  const errors = [];
  objectShape(value, TOP_LEVEL_KEYS, TOP_LEVEL_KEYS, label, errors);
  objectShape(value.selectionCriteria, ['useWhen', 'avoidWhen'], ['useWhen', 'avoidWhen'], `${label}.selectionCriteria`, errors);
  objectShape(value.canonicalImports, ['css', 'js', 'notes'], ['css', 'notes'], `${label}.canonicalImports`, errors);
  objectShape(value.tokenPolicy, ['allowed', 'forbidden'], ['allowed', 'forbidden'], `${label}.tokenPolicy`, errors);
  objectShape(value.accessibility, ['required'], ['required'], `${label}.accessibility`, errors);

  for (const key of [
    'selectionCriteria.useWhen',
    'selectionCriteria.avoidWhen',
    'canonicalImports.css',
    'canonicalImports.notes',
    'requiredMarkup',
    'forbiddenPatterns',
    'tokenPolicy.allowed',
    'tokenPolicy.forbidden',
    'accessibility.required',
  ]) {
    stringArray(readPath(value, key), `${label}.${key}`, errors);
  }
  if (value.canonicalImports?.js !== undefined) {
    stringArray(value.canonicalImports.js, `${label}.canonicalImports.js`, errors);
  }
  return errors;
}

function validateRegistryAiHints(packageRoot, registry) {
  const errors = [];
  const records = [];

  for (const [key, meta] of Object.entries(registry)) {
    const file = contractPath(packageRoot, meta);
    const relative = portable(path.relative(packageRoot, file));
    if (!fs.existsSync(file)) {
      errors.push(`${relative}: contract is missing`);
      continue;
    }

    let aiHints;
    try {
      aiHints = parseAiHints(fs.readFileSync(file, 'utf8'), relative);
    } catch (error) {
      errors.push(error.message);
      continue;
    }
    errors.push(...validateAiHints(aiHints, relative));

    const imports = [
      ...(aiHints.canonicalImports?.css ?? []),
      ...(aiHints.canonicalImports?.js ?? []),
    ];
    const allowedFiles = new Set(meta.files);
    for (const dependency of meta.styles ?? []) {
      for (const dependencyFile of registry[dependency]?.files ?? []) allowedFiles.add(dependencyFile);
    }
    for (const specifier of imports) {
      const normalized = normalizeImport(specifier);
      const absolute = path.join(packageRoot, normalized);
      if (!fs.existsSync(absolute)) errors.push(`${relative}: canonical import does not exist: ${specifier}`);
      const basename = path.basename(normalized);
      if (!allowedFiles.has(basename)) errors.push(`${relative}: canonical import is not declared in registry files or style dependencies: ${specifier}`);
    }

    const expectedCss = meta.files.filter((fileName) => fileName.endsWith('.css'));
    const actualCss = (aiHints.canonicalImports?.css ?? []).map((specifier) => path.basename(normalizeImport(specifier)));
    for (const filename of expectedCss) {
      if (!actualCss.includes(filename)) errors.push(`${relative}: canonicalImports.css is missing ${filename}`);
    }

    const jsFiles = meta.files.filter((fileName) => fileName.endsWith('.js'));
    const entryJs = jsFiles.find((fileName) => fileName === `${meta.dir}.js`) ?? jsFiles[0];
    const actualJs = (aiHints.canonicalImports?.js ?? []).map((specifier) => path.basename(normalizeImport(specifier)));
    if (entryJs && !actualJs.includes(entryJs)) errors.push(`${relative}: canonicalImports.js is missing entrypoint ${entryJs}`);
    if (!entryJs && actualJs.length > 0) errors.push(`${relative}: canonicalImports.js is present but registry declares no JavaScript`);

    records.push({ key, contractPath: relative, aiHints });
  }

  return { schemaVersion: AI_HINTS_SCHEMA_VERSION, records, errors };
}

function objectShape(value, allowed, required, label, errors) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    errors.push(`${label}: expected object`);
    return;
  }
  for (const key of required) {
    if (!(key in value)) errors.push(`${label}: missing required key ${key}`);
  }
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) errors.push(`${label}: unknown key ${key}`);
  }
}

function stringArray(value, label, errors) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${label}: expected a non-empty array`);
    return;
  }
  const seen = new Set();
  for (const item of value) {
    if (typeof item !== 'string' || item.trim() === '') errors.push(`${label}: every item must be a non-empty string`);
    else if (seen.has(item)) errors.push(`${label}: duplicate item ${JSON.stringify(item)}`);
    else seen.add(item);
  }
}

function readPath(value, dotted) {
  return dotted.split('.').reduce((current, key) => current?.[key], value);
}

function normalizeImport(specifier) {
  return String(specifier).replace(/^(?:rends|ren10)\//, '');
}

function portable(value) {
  return value.split(path.sep).join('/');
}

export {
  AI_HINTS_SCHEMA_VERSION,
  parseAiHints,
  validateAiHints,
  validateRegistryAiHints,
};
