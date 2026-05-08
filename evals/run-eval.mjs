#!/usr/bin/env node
/**
 * Lightweight grader for RenDS agent output.
 *
 * Usage:
 *   node evals/run-eval.mjs <eval-id> <candidate.html>
 *   node evals/run-eval.mjs --all evals/reference/   # grade all reference files
 *
 * Each entry in evals/prompts.json declares:
 *   - expectedComponents:    substrings that must appear (e.g. "ren-card").
 *   - expectedAttributes:    substrings that must appear (e.g. "aria-current=\"page\"").
 *   - forbiddenPatterns:     regex strings that must NOT match.
 *
 * The grader prints pass/fail and exits non-zero on any failure.
 *
 * This is intentionally regex-only: it is meant as a pre-flight gate,
 * not a full DOM/a11y validator. Pair with `npm run lint` and a real
 * a11y test.
 */

import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROMPTS_PATH = join(__dirname, 'prompts.json');
const REGRESSION_PATH = join(__dirname, 'regression-checks.mjs');

function fail(msg) {
  console.error(`error: ${msg}`);
  process.exit(2);
}

function check(haystack, needle) {
  return haystack.includes(needle);
}

async function loadPrompts() {
  const raw = await readFile(PROMPTS_PATH, 'utf8');
  return JSON.parse(raw);
}

async function gradeOne(entry, candidatePath, label) {
  const candidateAbs = resolve(candidatePath);
  let content;
  try {
    content = await readFile(candidateAbs, 'utf8');
  } catch (err) {
    fail(`cannot read candidate file ${candidateAbs}: ${err.message}`);
  }

  const failures = [];
  for (const expected of entry.expectedComponents ?? []) {
    if (!check(content, expected)) failures.push(`missing component / class: ${expected}`);
  }
  for (const attr of entry.expectedAttributes ?? []) {
    if (!check(content, attr)) failures.push(`missing attribute: ${attr}`);
  }
  for (const forbidden of entry.forbiddenPatterns ?? []) {
    const re = new RegExp(forbidden, 'i');
    const m = content.match(re);
    if (m) failures.push(`forbidden pattern hit: ${forbidden} → ${m[0]}`);
  }

  const status = failures.length === 0 ? 'PASS' : 'FAIL';
  console.log(`[${status}] ${entry.id}  (${label})`);
  for (const f of failures) console.log(`  - ${f}`);
  return failures.length === 0;
}

function runRegressionChecks() {
  return new Promise((resolveCheck) => {
    const child = spawn(process.execPath, [REGRESSION_PATH], { stdio: 'inherit' });
    child.on('exit', (code) => resolveCheck(code === 0));
  });
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) fail('usage: run-eval.mjs <eval-id> <candidate.html>  |  --all');

  const prompts = await loadPrompts();
  const byId = new Map(prompts.evals.map((e) => [e.id, e]));

  if (args[0] === '--all') {
    let allPassed = true;
    for (const entry of prompts.evals) {
      const ref = entry.referenceFile;
      if (!ref) {
        console.log(`[SKIP] ${entry.id}  (no referenceFile)`);
        continue;
      }
      const refAbs = resolve(__dirname, '..', ref);
      const passed = await gradeOne(entry, refAbs, ref);
      if (!passed) allPassed = false;
    }
    // Source-level regression checks (JS wiring that HTML evals cannot reach).
    const regressionPassed = await runRegressionChecks();
    if (!regressionPassed) allPassed = false;
    process.exit(allPassed ? 0 : 1);
  }

  const [id, candidate] = args;
  const entry = byId.get(id);
  if (!entry) fail(`unknown eval id: ${id}. Known: ${[...byId.keys()].join(', ')}`);
  if (!candidate) fail('missing candidate file path');

  const passed = await gradeOne(entry, candidate, candidate);
  process.exit(passed ? 0 : 1);
}

await main();
