#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const budgetFile = path.join(root, 'scripts', 'package-budgets.json');

export function evaluateBudgetMetrics(metrics, policy) {
  const failures = [];
  for (const [name, rule] of Object.entries(policy.metrics || {})) {
    const actual = metrics[name];
    if (!Number.isFinite(actual)) {
      failures.push(`${name}: measurement missing`);
      continue;
    }
    const limit = rule.baseline + rule.allowedDelta;
    if (actual > limit) {
      failures.push(`${name}: ${actual} exceeds baseline ${rule.baseline} + delta ${rule.allowedDelta} = ${limit}`);
    }
    if (Number.isFinite(rule.target) && actual > rule.target) {
      failures.push(`${name}: ${actual} exceeds target ${rule.target}`);
    }
  }
  return failures;
}

function bytes(relativePath) {
  const file = path.join(root, relativePath);
  return existsSync(file) ? statSync(file).size : NaN;
}

function measurePack() {
  const result = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) throw new Error(`npm pack failed: ${result.stderr}`);
  return JSON.parse(result.stdout)[0];
}

export function measureRequestCount() {
  const css = readFileSync(path.join(root, 'dist', 'ren10.min.css'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  const imports = css.match(/@import\s/g) || [];
  return 1 + imports.length;
}

function measureSourceRequestCount(entry = 'index.css', visited = new Set()) {
  const file = path.resolve(root, entry);
  if (visited.has(file)) return visited.size;
  visited.add(file);
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const match of css.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)) {
    if (!match[1].startsWith('http')) {
      measureSourceRequestCount(path.relative(root, path.resolve(path.dirname(file), match[1])), visited);
    }
  }
  return visited.size;
}

function measureCliRssOnce() {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', 'measure-cli-rss.mjs')], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  if (result.status !== 0) throw new Error(`CLI RSS measurement failed: ${result.stderr}`);
  const match = result.stderr.match(/REN10_MAX_RSS_BYTES=(\d+)/);
  if (!match) throw new Error('CLI RSS measurement did not report max RSS bytes');
  return Number(match[1]);
}

export function measureCliRssBytes() {
  const samples = [measureCliRssOnce(), measureCliRssOnce(), measureCliRssOnce()]
    .sort((a, b) => a - b);
  return samples[1];
}

export function collectBudgetMetrics() {
  const pack = measurePack();
  return {
    unpackedBytes: pack.unpackedSize,
    tarballBytes: pack.size,
    fullCssBytes: bytes('dist/ren10.css'),
    minCssBytes: bytes('dist/ren10.min.css'),
    knowledgeJsonBytes: bytes('knowledge/ren10-graph.json'),
    knowledgeSqliteBytes: bytes('knowledge/ren10-graph.sqlite'),
    sourceRequestCount: measureSourceRequestCount(),
    requestCount: measureRequestCount(),
    cliRssBytes: measureCliRssBytes(),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const policy = JSON.parse(readFileSync(budgetFile, 'utf8'));
  const metrics = collectBudgetMetrics();
  const failures = evaluateBudgetMetrics(metrics, policy);
  if (failures.length > 0) {
    console.error(failures.join('\n'));
    process.exit(1);
  }
  console.log(`Package budgets: OK ${JSON.stringify(metrics)}`);
}
