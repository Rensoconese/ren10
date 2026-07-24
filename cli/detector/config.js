import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

function defaultConfig() {
  return {
    schemaVersion: 1,
    detector: {
      profile: 'generic',
      ignoreRules: [],
      ignoreFiles: [],
      ignoreValues: [],
    },
    browser: {
      viewport: { width: 1440, height: 1000 },
    },
    hook: {
      enabled: true,
      quiet: false,
      maxFileBytes: 131072,
    },
  };
}

async function loadConfig(cwd = process.cwd()) {
  const file = path.join(cwd, '.ren10', 'config.json');
  try {
    const parsed = JSON.parse(await readFile(file, 'utf8'));
    return mergeConfig(defaultConfig(), parsed);
  } catch (error) {
    if (error.code === 'ENOENT') return defaultConfig();
    throw new Error(`Invalid Ren10 detector config at ${file}: ${error.message}`);
  }
}

async function writeConfig(cwd, config) {
  const directory = path.join(cwd, '.ren10');
  const file = path.join(directory, 'config.json');
  await mkdir(directory, { recursive: true });
  await writeFile(file, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  return file;
}

function addIgnoreRule(config, rule, reason, now = new Date()) {
  requireText(rule, 'rule');
  requireText(reason, 'reason');
  const next = structuredClone(config);
  const entry = { rule: normalize(rule), reason: reason.trim(), createdAt: now.toISOString() };
  next.detector.ignoreRules = dedupeBy(next.detector.ignoreRules, entry, (item) => typeof item === 'string' ? item : item.rule);
  return next;
}

function addIgnoreFile(config, pattern, reason, now = new Date()) {
  requireText(pattern, 'file pattern');
  requireText(reason, 'reason');
  const next = structuredClone(config);
  const entry = { pattern: portable(pattern.trim()), reason: reason.trim(), createdAt: now.toISOString() };
  next.detector.ignoreFiles = dedupeBy(next.detector.ignoreFiles, entry, (item) => typeof item === 'string' ? item : item.pattern);
  return next;
}

function addIgnoreValue(config, { rule, value, files = [], reason, now = new Date() }) {
  requireText(rule, 'rule');
  requireText(value, 'value');
  requireText(reason, 'reason');
  const normalizedFiles = [...new Set(files.map((file) => portable(String(file).trim())).filter(Boolean))].sort();
  if (String(value).trim() === '*' && normalizedFiles.length === 0) {
    throw new Error('A wildcard ignore value requires at least one file scope. Use ignore-rule for a project-wide exception.');
  }
  const next = structuredClone(config);
  const entry = {
    rule: normalize(rule),
    value: normalize(value),
    files: normalizedFiles,
    reason: reason.trim(),
    createdAt: now.toISOString(),
  };
  const key = (item) => `${item.rule}\0${normalize(item.value)}\0${[...(item.files ?? [])].sort().join('\0')}`;
  next.detector.ignoreValues = dedupeBy(next.detector.ignoreValues, entry, key);
  return next;
}

function mergeConfig(base, input) {
  return {
    ...base,
    ...input,
    detector: { ...base.detector, ...(input.detector ?? {}) },
    browser: { ...base.browser, ...(input.browser ?? {}), viewport: { ...base.browser.viewport, ...(input.browser?.viewport ?? {}) } },
    hook: { ...base.hook, ...(input.hook ?? {}) },
  };
}

function dedupeBy(items, entry, keyFn) {
  const key = keyFn(entry);
  return [...items.filter((item) => keyFn(item) !== key), entry];
}

function requireText(value, label) {
  if (!String(value ?? '').trim()) throw new Error(`${label} is required.`);
}

function normalize(value) {
  return String(value).trim().toLowerCase();
}

function portable(value) {
  return value.split(path.sep).join('/');
}

export {
  addIgnoreFile,
  addIgnoreRule,
  addIgnoreValue,
  defaultConfig,
  loadConfig,
  writeConfig,
};
