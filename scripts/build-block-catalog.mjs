#!/usr/bin/env node
/**
 * Generate templates/blocks/catalog.json from the shipped block pages.
 *
 *   node scripts/build-block-catalog.mjs          write the catalog
 *   node scripts/build-block-catalog.mjs --check  fail when it is stale
 *
 * The catalog is derived, never hand-edited: titles, summaries, families,
 * stylesheets, scripts and RenDS components all come from the block files.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BLOCK_CATALOG_PATH, buildBlockCatalog, serializeBlockCatalog } from '../cli/blocks.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = path.join(root, BLOCK_CATALOG_PATH);
const checkOnly = process.argv.includes('--check');

const catalog = buildBlockCatalog(root);
const expected = serializeBlockCatalog(catalog);

const problems = [];
for (const block of catalog.blocks) {
  if (!block.summary) problems.push(`${block.path}: missing description (.bb-detail-description, .lede, or meta description).`);
  for (const asset of [...block.styles, ...block.scripts, ...block.media]) {
    if (!existsSync(path.join(root, asset))) problems.push(`${block.path}: references missing ${asset}.`);
  }
}
if (problems.length > 0) {
  for (const problem of problems) console.error(problem);
  process.exit(1);
}

if (checkOnly) {
  const actual = existsSync(catalogPath) ? readFileSync(catalogPath, 'utf8') : null;
  if (actual !== expected) {
    console.error(`${BLOCK_CATALOG_PATH} is ${actual === null ? 'missing' : 'stale'}. Run npm run blocks:build.`);
    process.exit(1);
  }
  console.log(`Ren10 block catalog: OK (${catalog.count} blocks).`);
} else {
  writeFileSync(catalogPath, expected);
  console.log(`Ren10 block catalog: wrote ${BLOCK_CATALOG_PATH} (${catalog.count} blocks).`);
}
