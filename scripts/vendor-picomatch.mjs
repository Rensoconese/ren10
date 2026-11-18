#!/usr/bin/env node
// Build the private picomatch security derivatives in vendor/ from the official
// tarballs. See vendor/README.md for the reason, the reproduction steps and when
// to retire them.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

export const PICOMATCH_DERIVATIVES = {
  '4.0.7': 'qcJu88Q2IWqJsDD529JKMdwGm/dvInW4HvQnRwiH9JtihJvzGOscDtHE3x1pBKeUOTysQ8kVmLnJ2kJu7yhcGA==',
};
export const PICOMATCH_REVISION = 1;
export const PICOMATCH_CODE_FILES = ['index.js', 'posix.js', 'lib/constants.js', 'lib/parse.js', 'lib/picomatch.js', 'lib/scan.js', 'lib/utils.js'];

// Added before analyzeRepeatedExtglob. Scans an extglob body the way
// parseRepeatedExtglob does (escapes, quotes, brackets) for a `*` wildcard,
// as opposed to the `*(` of a nested extglob.
const scanner = `// Ren10 security derivative (GHSA-fc5q-39xc-vjpf): a \`*\` wildcard anywhere in
// the body of a repeated extglob nests an unbounded quantifier inside the
// repetition, e.g. \`+(*)\` -> \`(?:[^/]*?)+\`, which backtracks exponentially.
// Upstream only catches it when a branch is nothing but wildcards and there is
// more than one branch.
const hasUnboundedWildcard = body => {
  let bracket = 0;
  let quote = false;
  let escaped = false;

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];

    if (escaped === true) {
      escaped = false;
      continue;
    }

    if (ch === '\\\\') {
      escaped = true;
      continue;
    }

    if (ch === '"') {
      quote = !quote;
      continue;
    }

    if (quote === true) {
      continue;
    }

    if (ch === '[') {
      bracket++;
      continue;
    }

    if (ch === ']' && bracket > 0) {
      bracket--;
      continue;
    }

    // \`*(\` opens a nested extglob, whose repetition upstream already bounds
    // (maxExtglobRecursion); only a bare \`*\` is the wildcard.
    if (bracket === 0 && ch === '*' && body[i + 1] !== '(') {
      return true;
    }
  }

  return false;
};

const analyzeRepeatedExtglob = (body, options) => {`;

function sha512(file) {
  return createHash('sha512').update(fs.readFileSync(file)).digest('base64');
}

export function buildPicomatchDerivative(input, version, vendor) {
  const integrity = PICOMATCH_DERIVATIVES[version];
  assert.ok(integrity, `No reviewed picomatch derivative for ${version}`);
  assert.equal(sha512(input), integrity, `Upstream picomatch ${version} integrity changed`);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'ren10-picomatch-'));
  try {
    execFileSync('tar', ['-xzf', path.resolve(input), '-C', temporary]);
    const directory = path.join(temporary, 'package');
    const target = path.join(directory, 'lib/parse.js');
    let source = fs.readFileSync(target, 'utf8');
    const patch = (before, after) => {
      assert.equal(source.split(before).length - 1, 1, `picomatch ${version} lib/parse.js: unexpected patch context`);
      source = source.replace(before, after);
    };
    patch('const analyzeRepeatedExtglob = (body, options) => {', scanner);
    // Only the last return of analyzeRepeatedExtglob: every earlier rule that
    // marks a body risky, or rewrites it to a safe character class, still wins.
    patch('\n  return { risky: false };\n};\n', '\n  if (hasUnboundedWildcard(body)) {\n    return { risky: true };\n  }\n\n  return { risky: false };\n};\n');
    fs.writeFileSync(target, source);

    const manifestPath = path.join(directory, 'package.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.name, 'picomatch');
    assert.equal(manifest.version, version);
    const derivative = `${version}-ren10.${PICOMATCH_REVISION}`;
    manifest.name = '@ren10/picomatch';
    manifest.version = derivative;
    manifest.private = true;
    manifest.description += ' Private Ren10 security derivative; not an upstream release.';
    delete manifest.scripts;
    delete manifest.devDependencies;
    manifest.ren10Patch = {
      revision: PICOMATCH_REVISION,
      upstreamName: 'picomatch',
      upstreamVersion: version,
      upstream: `https://registry.npmjs.org/picomatch/-/picomatch-${version}.tgz`,
      upstreamIntegrity: `sha512-${integrity}`,
      advisory: 'GHSA-fc5q-39xc-vjpf',
      change: 'Treat a repeated extglob (`+(...)`, `*(...)`) whose body contains a bare `*` wildcard (not the `*(` of a nested extglob) as risky, as upstream already does for some multi-branch bodies: it compiles to its escaped literal instead of a nested unbounded quantifier',
    };
    manifest.ren10Patch.codeHashes = Object.fromEntries(PICOMATCH_CODE_FILES.map((file) => [file,
      createHash('sha256').update(fs.readFileSync(path.join(directory, file))).digest('hex')]));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

    fs.mkdirSync(vendor, { recursive: true });
    execFileSync('npm', ['pack', '--ignore-scripts', '--cache', path.join(temporary, 'npm-cache'), '--pack-destination', vendor], { cwd: directory, stdio: 'pipe' });
    const output = path.join(vendor, `picomatch-${derivative}.tgz`);
    fs.renameSync(path.join(vendor, `ren10-picomatch-${derivative}.tgz`), output);
    return output;
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const inputs = process.argv.slice(2);
  assert.ok(inputs.length > 0, 'Usage: node scripts/vendor-picomatch.mjs /path/to/picomatch-4.0.7.tgz');
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  for (const input of inputs) {
    const version = path.basename(input).match(/^picomatch-(\d+\.\d+\.\d+)\.tgz$/)?.[1];
    assert.ok(version, `Expected an official picomatch-<version>.tgz, got ${input}`);
    console.log(`Private patched picomatch written: ${buildPicomatchDerivative(input, version, path.join(root, 'vendor'))}`);
  }
}
