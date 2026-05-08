#!/usr/bin/env node
/**
 * RenDS regression checks (source-level).
 *
 * Some agent-facing promises are made in component contracts but live in
 * JS — an HTML grader cannot catch when those promises silently regress.
 * This module asserts that the wiring is *present in the source*.
 *
 * Each check is intentionally narrow: it grep-asserts a single pattern
 * that, if missing, would break a documented contract.
 *
 * Add a new entry whenever a contract claim depends on JS code that an
 * HTML eval cannot exercise.
 */

import { readFile } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = resolve(__dirname, '..');

/**
 * @typedef {Object} RegressionCheck
 * @property {string} id        Short identifier used in output.
 * @property {string} file      Path relative to PKG_ROOT.
 * @property {RegExp} pattern   Source-level pattern that must match.
 * @property {string} reason    Human-readable claim that depends on this pattern.
 */

/** @type {RegressionCheck[]} */
const CHECKS = [
  {
    id: 'ren-dialog/data-dialog-close-returnvalue',
    file: 'components/composites/ren-dialog/ren-dialog.js',
    // The close-button handler must read the attribute value and pass it to
    // close(), or `<button data-dialog-close="delete">` cannot propagate
    // `delete` as ren-close.detail.returnValue.
    pattern: /getAttribute\(\s*['"]data-dialog-close['"]\s*\)[\s\S]{0,80}this\.close\(/,
    reason: '<button data-dialog-close="value"> must propagate `value` to ren-close.detail.returnValue.',
  },
  {
    id: 'ren-form/error-summary-tabindex',
    file: 'components/patterns/ren-form/ren-form.js',
    // The component must add tabindex="-1" to the error summary if missing,
    // otherwise .focus() is a no-op on a plain <div>.
    pattern: /_errorSummary[\s\S]{0,200}setAttribute\(\s*['"]tabindex['"]\s*,\s*['"]-1['"]\s*\)/,
    reason: '.ren-form-error-summary must be focusable; component sets tabindex="-1" if missing.',
  },
];

let failed = 0;
for (const check of CHECKS) {
  const abs = join(PKG_ROOT, check.file);
  let src;
  try {
    src = await readFile(abs, 'utf8');
  } catch (err) {
    console.error(`[FAIL] ${check.id}  cannot read ${check.file}: ${err.message}`);
    failed++;
    continue;
  }
  if (check.pattern.test(src)) {
    console.log(`[PASS] ${check.id}`);
  } else {
    console.error(`[FAIL] ${check.id}`);
    console.error(`       file:    ${check.file}`);
    console.error(`       pattern: ${check.pattern}`);
    console.error(`       reason:  ${check.reason}`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} regression check(s) failed.`);
  process.exit(1);
}
console.log('\nAll regression checks passed.');
