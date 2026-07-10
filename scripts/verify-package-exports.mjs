import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const checks = [
  ['ren10', 'index.css'],
  ['ren10/components/index.css', 'components/index.css'],
  ['ren10/components/primitives/ren-button/ren-button.css', 'components/primitives/ren-button/ren-button.css'],
  ['ren10/components/composites/ren-dialog/ren-dialog.js', 'components/composites/ren-dialog/ren-dialog.js'],
  ['ren10/base/index.css', 'base/index.css'],
  ['ren10/knowledge/ren10-graph.sqlite', 'knowledge/ren10-graph.sqlite'],
  ['ren10/knowledge/ren10-graph.json', 'knowledge/ren10-graph.json'],
  ['ren10/knowledge/okf/index.md', 'knowledge/okf/index.md'],
  ['ren10/knowledge/okf/components/primitives/ren-button.md', 'knowledge/okf/components/primitives/ren-button.md'],
  ['ren10/tokens/index.css', 'tokens/index.css'],
  ['ren10/themes/appearance.css', 'themes/appearance.css'],
  ['ren10/themes/theme-generator.js', 'themes/theme-generator.js'],
  ['ren10/utils', 'utils/index.js'],
];

let failed = false;

for (const [specifier, expectedRelativePath] of checks) {
  const expected = expectedRelativePath.split('/').join(path.sep);
  let actual;

  try {
    actual = fileURLToPath(import.meta.resolve(specifier));
  } catch (error) {
    failed = true;
    console.error(`✗ ${specifier} did not resolve: ${error.message}`);
    continue;
  }

  const actualRelativePath = path.relative(root, actual);
  if (actualRelativePath !== expected) {
    failed = true;
    console.error(`✗ ${specifier} resolved to ${actualRelativePath}, expected ${expected}`);
    continue;
  }

  if (!fs.existsSync(actual)) {
    failed = true;
    console.error(`✗ ${specifier} resolved to missing file ${actualRelativePath}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`RenDS package exports: OK (${checks.length} subpaths)`);
