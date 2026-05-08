#!/usr/bin/env node
/**
 * RenDS token-policy lint
 *
 * Catches the two violations Stylelint's regex matcher misses:
 *
 *   1. Primitive palette tokens used inside `color-mix()`, `linear-gradient()`,
 *      or any other function call — Stylelint inspects property values, not
 *      arbitrary nested function arguments, so `background:
 *      linear-gradient(var(--blue-500), ...)` slips through the
 *      `declaration-property-value-disallowed-list` rule.
 *
 *   2. Saturated `rgba()` / `rgb()` / `hsl()` colors in component CSS.
 *      Pure black/white alphas (`rgba(0,0,0,X)`, `rgba(255,255,255,X)`)
 *      and `transparent` are allowed because they are idiomatic shadow /
 *      overlay primitives — replacing them would require a larger shadow
 *      token surface than RenDS currently exposes.
 *
 * Files in `EXEMPT_FILES` are skipped. The list mirrors the overrides in
 * `stylelint.config.mjs` and each entry has a short reason.
 *
 * Run via:
 *   node scripts/lint-tokens.mjs
 *   npm run lint:tokens
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');

// Files exempt from token-policy enforcement. Same list as
// `overrides` in stylelint.config.mjs — keep them in sync.
//
// TODO (0.9.x hardening): these are full-file exemptions. A stricter
// pass should replace each entry with line-level allowlists — either
// stylelint inline disable comments inside the CSS or a per-line
// allow comment understood by this script. That guarantees future
// additions to these files DO get linted.
const EXEMPT_FILES = new Set([
  // Hue gradient: literal RGB color wheel.
  'components/composites/ren-color-picker/ren-color-picker.css',

  // AI accent: primitive purple inside color-mix() shimmer.
  'components/patterns/ren-ai/ren-ai.css',

  // Offline status: --gray-400 with no semantic equivalent.
  'components/primitives/ren-avatar/ren-avatar.css',

  // Danger button hover/active: primitive --red-500/--red-600 step.
  'components/primitives/ren-button/ren-button.css',

  // Switch checked-hover: primitive --green-500 toggle tint.
  'components/primitives/ren-checkbox/ren-checkbox.css',

  // Autofill / select-option @supports fallbacks: native UA painting.
  'components/primitives/ren-field/ren-field.css',

  // Validation focus glow rgba(255,59,48,…) / rgba(52,199,89,…)
  // preserved for light-mode visual parity (color-mix would darken).
  'components/composites/ren-number-field/ren-number-field.css',
  'components/composites/ren-otp/ren-otp.css',
]);

const PRIMITIVE_TOKEN = /var\(\s*--(?:blue|gray|grey|red|green|orange|yellow|teal|purple|pink)-\d+\s*[,)]/;

// Match rgb/rgba/hsl/hsla calls that aren't pure black, white, or transparent.
// We treat `0,0,0,X`, `0 0 0 / X`, `255,255,255,X`, `255 255 255 / X` as OK.
const RGB_CALL = /\b(rgba?|hsla?)\(\s*([^)]+)\)/gi;
const HEX_COLOR = /(?<![\w-])#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/g;

const isGrayscaleAlpha = (inner) => {
  // Normalise commas / whitespace / slashes
  const tokens = inner
    .replace(/\//g, ' ')
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (tokens.length < 3) return false;
  const [r, g, b] = tokens;
  const isWhite = r === '255' && g === '255' && b === '255';
  const isBlack = r === '0' && g === '0' && b === '0';
  return isWhite || isBlack;
};

async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      out.push(...(await walk(path)));
    } else if (entry.isFile() && entry.name.endsWith('.css')) {
      out.push(path);
    }
  }
  return out;
}

function stripCommentsAndStrings(line) {
  // Remove /* ... */ inline comments and quoted strings to avoid false hits
  // on doc snippets and example HTML content.
  return line
    .replace(/\/\*[^]*?\*\//g, '')
    .replace(/"[^"\n]*"/g, '""')
    .replace(/'[^'\n]*'/g, "''");
}

async function checkFile(absPath) {
  const rel = relative(PKG_ROOT, absPath).split(/[\\/]/).join('/');
  if (EXEMPT_FILES.has(rel)) return [];
  const src = await readFile(absPath, 'utf8');
  const violations = [];
  const lines = src.split(/\r?\n/);
  // Detect block-level /* ... */ comments by tracking state.
  let inBlockComment = false;
  for (let i = 0; i < lines.length; i++) {
    let raw = lines[i];
    let line = raw;
    if (inBlockComment) {
      const end = line.indexOf('*/');
      if (end === -1) continue;
      line = line.slice(end + 2);
      inBlockComment = false;
    }
    const blockOpen = line.indexOf('/*');
    if (blockOpen !== -1 && line.indexOf('*/', blockOpen) === -1) {
      line = line.slice(0, blockOpen);
      inBlockComment = true;
    }
    line = stripCommentsAndStrings(line);

    // Skip pure comment lines or directives
    if (!line.trim()) continue;

    if (PRIMITIVE_TOKEN.test(line)) {
      violations.push({
        path: rel,
        line: i + 1,
        kind: 'primitive-token',
        snippet: raw.trim(),
      });
    }

    let m;
    HEX_COLOR.lastIndex = 0;
    while ((m = HEX_COLOR.exec(line))) {
      violations.push({
        path: rel,
        line: i + 1,
        kind: 'hex-color',
        match: m[0],
        snippet: raw.trim(),
      });
    }

    RGB_CALL.lastIndex = 0;
    while ((m = RGB_CALL.exec(line))) {
      const inner = m[2];
      if (!isGrayscaleAlpha(inner)) {
        violations.push({
          path: rel,
          line: i + 1,
          kind: 'colored-rgba',
          match: m[0],
          snippet: raw.trim(),
        });
      }
    }
  }
  return violations;
}

async function main() {
  const componentsDir = join(PKG_ROOT, 'components');
  let componentFiles;
  try {
    componentFiles = await walk(componentsDir);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('No components/ directory; skipping token lint.');
      return;
    }
    throw err;
  }
  const allViolations = [];
  for (const file of componentFiles) {
    allViolations.push(...(await checkFile(file)));
  }
  if (allViolations.length === 0) {
    console.log(
      `RenDS token lint: OK (${componentFiles.length} component CSS files, ${EXEMPT_FILES.size} documented exemptions).`,
    );
    return;
  }
  for (const v of allViolations) {
    const detail =
      v.kind === 'primitive-token'
        ? 'primitive palette token (use a semantic --color-* or component --ren-* token)'
        : v.kind === 'hex-color'
        ? `hardcoded hex color ${v.match} (use a token)`
        : `non-grayscale ${v.match} (use a token; only rgba(0,0,0,X) / rgba(255,255,255,X) are allowed)`;
    console.error(`${v.path}:${v.line}  ${detail}`);
    console.error(`    ${v.snippet}`);
  }
  console.error(`\nRenDS token lint: ${allViolations.length} violation(s).`);
  process.exit(1);
}

await main();
