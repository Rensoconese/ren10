#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { visualImage } from './run-linux-visual.mjs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const errors = [];
if (!pkg.engines?.node || !/^>=20/.test(pkg.engines.node)) errors.push('Node >=20 engine is required');
if (!existsSync('scripts/check-package-budgets.mjs')) errors.push('Package budget checker is required');
if (!existsSync('tests/visual')) errors.push('Visual test suite is required');

// The visual baselines are pixel-exact for exactly one rendering environment.
// CI pins that environment as a container image; run-linux-visual.mjs derives
// the same tag from the installed Playwright version so a local run renders
// identically. If a @playwright/test bump moves one and not the other, the
// gate starts failing on font rendering instead of on real regressions.
const WORKFLOW = '.github/workflows/ci.yml';
if (!existsSync(WORKFLOW)) {
  errors.push(`${WORKFLOW} is required to pin the visual rendering environment`);
} else {
  const expected = visualImage();
  const workflow = readFileSync(WORKFLOW, 'utf8');
  if (!workflow.includes(expected)) {
    const found = workflow.match(/mcr\.microsoft\.com\/playwright:[^\s'"]+/)?.[0] ?? '(none)';
    errors.push(
      `Visual container drift: ${WORKFLOW} pins ${found} but @playwright/test resolves ${expected}. ` +
        'Update the workflow image and recapture baselines with ' +
        '`npm run test:visual:linux -- --update-snapshots`.'
    );
  }
}

if (errors.length) { errors.forEach((error) => console.error(error)); process.exit(1); }
console.log('Performance contract OK: budgets, visual suite, Node engine, pinned visual image');
