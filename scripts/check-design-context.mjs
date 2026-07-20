#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { buildDesignManifest } from '../cli/detector/index.js';

async function writeDesignContext(packageRoot) {
  const manifest = await buildDesignManifest(packageRoot);
  const file = path.join(packageRoot, '.ren10', 'design.json');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return { ok: true, file, manifest };
}

async function validateDesignContext(packageRoot) {
  const file = path.join(packageRoot, '.ren10', 'design.json');
  let actual;
  try {
    actual = JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return { ok: false, reason: 'missing', file };
    return { ok: false, reason: 'invalid', file, error: error.message };
  }
  const expected = await buildDesignManifest(packageRoot);
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  return { ok, reason: ok ? 'current' : 'stale', file, actual, expected };
}

async function main() {
  const packageRoot = path.resolve(import.meta.dirname, '..');
  const write = process.argv.includes('--write');
  const result = write
    ? await writeDesignContext(packageRoot)
    : await validateDesignContext(packageRoot);
  if (write) {
    console.log(`Ren10 design context: wrote ${path.relative(packageRoot, result.file)}`);
    return;
  }
  if (!result.ok) {
    console.error(`Ren10 design context: ${result.reason}. Run npm run design:build.`);
    process.exit(1);
  }
  console.log('Ren10 design context: OK');
}

const isDirectRun = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) await main();

export { validateDesignContext, writeDesignContext };
