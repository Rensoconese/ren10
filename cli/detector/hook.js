import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { buildDesignManifest, detectTargets } from './index.js';
import { defaultConfig, loadConfig } from './config.js';

const UI_EXTENSIONS = new Set(['.html', '.htm', '.astro', '.css', '.js', '.mjs']);
const GENERATED_SEGMENTS = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', 'generated']);

async function processHookEvent(event, options = {}) {
  const cwd = path.resolve(options.cwd ?? process.cwd());
  const packageRoot = path.resolve(options.packageRoot ?? path.join(import.meta.dirname, '..', '..'));
  const config = options.config ? mergeRuntimeConfig(options.config) : await loadConfig(cwd);
  if (config.hook.enabled === false) return skipped('disabled');

  const targets = await extractTargetFiles(event, cwd);
  if (targets.length === 0) return skipped('no-ui-target');
  const eligible = [];
  for (const file of targets) {
    const relative = portable(path.relative(cwd, file));
    if (relative.split('/').some((segment) => GENERATED_SEGMENTS.has(segment))) continue;
    const metadata = await stat(file);
    if (metadata.size > config.hook.maxFileBytes) {
      return { ...skipped('max-file-bytes'), file: relative, bytes: metadata.size, maxFileBytes: config.hook.maxFileBytes };
    }
    eligible.push(file);
  }
  if (eligible.length === 0) return skipped('generated-target');

  const manifest = await buildDesignManifest(packageRoot);
  const statePath = path.join(cwd, '.ren10', 'cache', 'hook-state.json');
  const state = await loadState(statePath);
  const findings = [];
  let newFindings = 0;
  let resolvedFindings = 0;

  for (const file of eligible) {
    const relative = portable(path.relative(cwd, file));
    const report = await detectTargets([file], {
      cwd,
      manifest,
      profile: config.detector.profile ?? 'generic',
      config,
    });
    findings.push(...report.findings);
    const previous = new Set(state.files[relative]?.current ?? []);
    const current = new Set(report.findings.map(findingKey));
    newFindings += [...current].filter((key) => !previous.has(key)).length;
    resolvedFindings += [...previous].filter((key) => !current.has(key)).length;
    state.files[relative] = { current: [...current].sort(), updatedAt: new Date().toISOString() };
  }
  await writeState(statePath, state);

  const pendingFindings = findings.length;
  const status = pendingFindings === 0 ? 'clean' : newFindings > 0 ? 'findings' : 'pending';
  return {
    status,
    files: eligible.map((file) => portable(path.relative(cwd, file))),
    findings,
    newFindings,
    resolvedFindings,
    pendingFindings,
    message: hookMessage(status, { newFindings, resolvedFindings, pendingFindings }),
  };
}

async function installCodexHook(cwd = process.cwd(), options = {}) {
  const directory = path.join(cwd, '.codex');
  const file = path.join(directory, 'hooks.json');
  let manifest = options.existing;
  if (!manifest) {
    try {
      manifest = JSON.parse(await readFile(file, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw new Error(`Invalid Codex hooks manifest: ${error.message}`);
      manifest = { hooks: {} };
    }
  }
  manifest = structuredClone(manifest);
  manifest.hooks ??= {};
  manifest.hooks.PostToolUse ??= [];
  const command = 'npx ren10 hook-run';
  const alreadyInstalled = manifest.hooks.PostToolUse.some((entry) =>
    (entry.hooks ?? []).some((hook) => hook.command === command));
  if (!alreadyInstalled) {
    manifest.hooks.PostToolUse.push({
      matcher: 'Edit|Write|apply_patch',
      hooks: [{ type: 'command', command, timeout: 8, statusMessage: 'Checking Ren10 UI quality' }],
    });
  }
  await mkdir(directory, { recursive: true });
  await writeFile(file, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return { path: file, installed: !alreadyInstalled, command };
}

async function extractTargetFiles(event, cwd) {
  const candidates = new Set();
  visit(event, (value, key) => {
    if (typeof value !== 'string') return;
    if (/(?:file|path)/i.test(key) && UI_EXTENSIONS.has(path.extname(value).toLowerCase())) candidates.add(value);
    if (/(?:patch|diff)/i.test(key)) {
      for (const match of value.matchAll(/(?:\+\+\+|---|Update File:|Add File:)\s+(?:[ab]\/)?([^\n]+)/g)) {
        const candidate = match[1].trim();
        if (UI_EXTENSIONS.has(path.extname(candidate).toLowerCase())) candidates.add(candidate);
      }
    }
  });
  const files = [];
  for (const candidate of candidates) {
    const absolute = path.resolve(cwd, candidate);
    try {
      await access(absolute);
      files.push(absolute);
    } catch {
      // Deleted or virtual targets do not need a post-edit scan.
    }
  }
  return [...new Set(files)].sort();
}

function visit(value, callback, key = '') {
  callback(value, key);
  if (Array.isArray(value)) value.forEach((item, index) => visit(item, callback, String(index)));
  else if (value && typeof value === 'object') {
    for (const [childKey, child] of Object.entries(value)) visit(child, callback, childKey);
  }
}

async function loadState(file) {
  try {
    const state = JSON.parse(await readFile(file, 'utf8'));
    return { schemaVersion: 1, files: state.files ?? {} };
  } catch (error) {
    if (error.code === 'ENOENT') return { schemaVersion: 1, files: {} };
    throw new Error(`Invalid hook state: ${error.message}`);
  }
}

async function writeState(file, state) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

function findingKey(finding) {
  return [finding.rule, finding.file, finding.value ?? ''].join('\0');
}

function hookMessage(status, counts) {
  if (status === 'findings') return `Ren10 detector found ${counts.newFindings} new issue(s); ${counts.pendingFindings} pending.`;
  if (status === 'pending') return `Ren10 detector still has ${counts.pendingFindings} pending issue(s).`;
  return counts.resolvedFindings > 0
    ? `Ren10 detector is clean; ${counts.resolvedFindings} issue(s) resolved.`
    : 'Ren10 detector is clean.';
}

function skipped(reason) {
  return { status: 'skipped', reason, findings: [], newFindings: 0, resolvedFindings: 0, pendingFindings: 0 };
}

function mergeRuntimeConfig(input) {
  const base = defaultConfig();
  return {
    ...base,
    ...input,
    detector: { ...base.detector, ...(input.detector ?? {}) },
    hook: { ...base.hook, ...(input.hook ?? {}) },
  };
}

function portable(value) {
  return value.split(path.sep).join('/');
}

export { installCodexHook, processHookEvent };
