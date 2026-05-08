#!/usr/bin/env node
/**
 * Bundle a doc page with all its CSS inlined.
 *
 * Reads a doc HTML file, resolves every <link rel="stylesheet"> and every
 * recursive @import inside those CSS files, concatenates everything into a
 * single <style> block, and writes a self-contained bundle alongside the
 * original (named *.bundled.html).
 *
 * Usage:
 *   node scripts/bundle-doc-page.mjs docs/components/ren-button.html
 *   node scripts/bundle-doc-page.mjs docs/components/ren-card.html
 *
 * Or to bundle every page in docs/components/:
 *   for f in docs/components/*.html; do node scripts/bundle-doc-page.mjs "$f"; done
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, basename, extname } from 'node:path';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node scripts/bundle-doc-page.mjs <html-file>');
  process.exit(1);
}
if (!existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

// ─── CSS bundler ──────────────────────────────────────────────────────

const seenCss = new Set();

/**
 * Read a CSS file and recursively inline its @import statements.
 * Returns the concatenated CSS string.
 */
function bundleCss(cssPath) {
  const absPath = resolve(cssPath);
  if (seenCss.has(absPath)) return ''; // dedupe
  seenCss.add(absPath);

  if (!existsSync(absPath)) {
    console.warn(`  [warn] css not found: ${cssPath}`);
    return `/* missing: ${cssPath} */\n`;
  }

  let css = readFileSync(absPath, 'utf8');
  const baseDir = dirname(absPath);

  // Strip /* ... */ comments first so @import examples inside docblocks
  // don't get matched as real imports.
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');

  // Match @import statements:
  //   @import './foo.css';
  //   @import "foo.css";
  //   @import url('foo.css');
  //   @import './foo.css' layer(name);
  // Captures the import path (group 1 or 2).
  const importRegex = /@import\s+(?:url\(\s*['"]?([^'")\s]+)['"]?\s*\)|['"]([^'"]+)['"])\s*(?:layer\([^)]*\))?\s*;/g;

  css = css.replace(importRegex, (match, urlPath, quotedPath) => {
    const importPath = urlPath || quotedPath;
    const absoluteImport = resolve(baseDir, importPath);
    const inlined = bundleCss(absoluteImport);
    return `\n/* ─── inlined: ${importPath} (from ${basename(cssPath)}) ─── */\n${inlined}\n`;
  });

  return css;
}

// ─── Main ─────────────────────────────────────────────────────────────

const html = readFileSync(inputPath, 'utf8');
const htmlDir = dirname(resolve(inputPath));

// Find all <link rel="stylesheet" href="..."> tags
const linkRegex = /<link\s+rel=["']stylesheet["']\s+href=["']([^"']+)["']\s*\/?>/g;
const matches = [...html.matchAll(linkRegex)];

console.log(`Bundling ${inputPath}`);
console.log(`  found ${matches.length} <link> tags`);

let bundledCss = '';
for (const [, href] of matches) {
  const cssPath = resolve(htmlDir, href);
  console.log(`  + ${href}`);
  bundledCss += `\n/* ════════ ${href} ════════ */\n`;
  bundledCss += bundleCss(cssPath);
}

// Replace ALL <link rel="stylesheet"> tags with a single <style> block.
// We replace the first one with the consolidated style, then strip the rest.
let bundledHtml = html;
let firstReplaced = false;
bundledHtml = bundledHtml.replace(linkRegex, (match) => {
  if (!firstReplaced) {
    firstReplaced = true;
    return `<style data-bundled="true">${bundledCss}</style>`;
  }
  return ''; // strip subsequent link tags
});

// Write output next to the original
const ext = extname(inputPath);
const outPath = inputPath.replace(ext, `.bundled${ext}`);
writeFileSync(outPath, bundledHtml, 'utf8');

const originalSize = (html.length / 1024).toFixed(1);
const bundledSize = (bundledHtml.length / 1024).toFixed(1);
console.log(`  → ${outPath}`);
console.log(`     ${originalSize} KB → ${bundledSize} KB (${seenCss.size} CSS files inlined)`);
