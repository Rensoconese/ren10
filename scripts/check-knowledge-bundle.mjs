#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkOkfBundle, okfDefaultOutDir } from '../cli/knowledge-okf.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundleDir = okfDefaultOutDir(root);
const graphPath = path.join(root, 'knowledge', 'ren10-graph.json');

const rel = (absPath) => path.relative(root, absPath).split(path.sep).join('/');

const fail = (messages) => {
  for (const message of messages) console.error(message);
  process.exit(1);
};

const listFiles = (dir) => {
  if (!existsSync(dir)) return [];
  const files = [];
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) {
        visit(abs);
      } else if (entry.isFile()) {
        files.push(abs);
      }
    }
  };
  visit(dir);
  return files.sort();
};

const compareDirs = (actualDir, expectedDir, messages) => {
  const actual = listFiles(actualDir).map((file) => path.relative(actualDir, file).split(path.sep).join('/'));
  const expected = listFiles(expectedDir).map((file) => path.relative(expectedDir, file).split(path.sep).join('/'));
  const all = new Set([...actual, ...expected]);
  for (const relPath of [...all].sort()) {
    const actualPath = path.join(actualDir, relPath);
    const expectedPath = path.join(expectedDir, relPath);
    if (!existsSync(actualPath)) {
      messages.push(`Missing generated OKF file: knowledge/okf/${relPath}`);
      continue;
    }
    if (!existsSync(expectedPath)) {
      messages.push(`Stale generated OKF file: knowledge/okf/${relPath}`);
      continue;
    }
    if (!readFileSync(actualPath).equals(readFileSync(expectedPath))) {
      messages.push(`knowledge/okf/${relPath} is stale. Run npm run knowledge:build.`);
    }
  }
};

const checkPacklist = (messages) => {
  const pack = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: root,
    env: {
      ...process.env,
      npm_config_cache: path.join(os.tmpdir(), 'rends-npm-cache'),
      NPM_CONFIG_CACHE: path.join(os.tmpdir(), 'rends-npm-cache'),
    },
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 20,
  });
  if (pack.status !== 0) {
    messages.push((pack.stderr || pack.stdout || 'npm pack --dry-run --json failed').trim());
    return;
  }
  const packages = JSON.parse(pack.stdout || '[]');
  const files = new Set((packages[0]?.files ?? []).map((file) => file.path));
  for (const required of [
    'knowledge/okf/index.md',
    'knowledge/okf/components/composites/ren-toast.md',
    'knowledge/okf/components/primitives/ren-button.md',
  ]) {
    if (!files.has(required)) messages.push(`npm pack is missing ${required}.`);
  }
};

const main = () => {
  const messages = [];
  const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'rends-okf-check-'));
  const tempOut = path.join(tempRoot, 'okf');

  try {
    if (!existsSync(bundleDir)) messages.push(`Missing packaged OKF bundle: ${rel(bundleDir)}`);
    if (!existsSync(path.join(bundleDir, 'index.md'))) messages.push('Missing packaged OKF index: knowledge/okf/index.md');

    const build = spawnSync(process.execPath, ['scripts/build-knowledge-bundle.mjs'], {
      cwd: root,
      env: { ...process.env, RENDS_OKF_OUT_DIR: path.relative(root, tempOut) },
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 20,
    });
    if (build.status !== 0) {
      messages.push((build.stderr || build.stdout || 'OKF bundle build failed').trim());
      fail(messages);
    }

    compareDirs(bundleDir, tempOut, messages);

    if (existsSync(bundleDir)) {
      const result = checkOkfBundle({ root, graphPath, bundleDir });
      if (!result.ok) messages.push(...result.messages);
      if (result.concepts < 50) messages.push(`Expected a populated OKF bundle, found ${result.concepts} concepts.`);
    }

    if (existsSync(bundleDir)) checkPacklist(messages);

    if (messages.length > 0) fail(messages);
    const stat = statSync(bundleDir);
    if (!stat.isDirectory()) messages.push('knowledge/okf is not a directory.');
    if (messages.length > 0) fail(messages);
    console.log('RenDS OKF bundle check: OK (fresh markdown bundle, graph parity, npm packlist).');
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
};

main();
