import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const errors = [];
const requirePolicy = (condition, message) => { if (!condition) errors.push(message); };

requirePolicy(pkg.scripts.test === 'npm run test:portable', 'npm test must use the portable suite');
requirePolicy(!String(pkg.scripts['test:portable']).includes('test:visual'), 'portable suite must exclude visual snapshots');
requirePolicy(Boolean(pkg.scripts['test:visual:linux']), 'Linux visual gate needs a dedicated script');
requirePolicy(pkg.scripts['audit:runtime'] === 'npm audit --omit=dev --audit-level=moderate', 'runtime moderate audit script missing');
requirePolicy(pkg.scripts['audit:full'] === 'npm audit --audit-level=moderate', 'full moderate audit script missing');

const publicVersionFiles = ['AGENTS.md', 'CLAUDE.md', '.cursorrules', '.windsurfrules', 'ren-design.md', 'docs/cli.html'];
for (const file of publicVersionFiles) {
  requirePolicy(!read(file).includes('0.9.2'), `${file} still exposes 0.9.2`);
  requirePolicy(read(file).includes(pkg.version), `${file} does not expose package version ${pkg.version}`);
}

const jsYaml = lock.packages?.['node_modules/js-yaml']?.version;
requirePolicy(jsYaml && jsYaml.localeCompare('4.1.2', undefined, { numeric: true }) >= 0, `js-yaml must be >=4.1.2, found ${jsYaml}`);

const budgetPath = path.join(root, 'scripts', 'package-budgets.json');
requirePolicy(fs.existsSync(budgetPath), 'versioned package budget targets are missing');
if (fs.existsSync(budgetPath)) {
  const budget = JSON.parse(fs.readFileSync(budgetPath, 'utf8'));
  for (const metric of ['unpackedBytes', 'tarballBytes', 'requestCount', 'cliRssBytes']) {
    requirePolicy(Number.isFinite(budget.metrics?.[metric]?.baseline), `${metric} baseline missing`);
    requirePolicy(Number.isFinite(budget.metrics?.[metric]?.allowedDelta), `${metric} allowedDelta missing`);
  }
  requirePolicy(budget.metrics?.unpackedBytes?.allowedDelta <= 0, 'unpacked budget must not allow regression over baseline');
  requirePolicy(budget.metrics?.requestCount?.target < budget.metrics?.requestCount?.baseline, 'request-count target must improve baseline');
}

const budgetChecker = read('scripts/check-package-budgets.mjs');
requirePolicy(budgetChecker.includes('requestCount'), 'budget checker does not measure request count');
requirePolicy(budgetChecker.includes('cliRssBytes'), 'budget checker does not measure CLI RSS');

const requiredPackageCommands = [
  'npm run smoke:installed',
  'npm run check:budgets',
  'npm run audit:runtime',
  'npm run audit:full',
  'npm run check:release',
  'npm run check:supply-chain',
];
for (const workflow of ['.github/workflows/ci.yml', '.github/workflows/release.yml', '.github/workflows/audit.yml']) {
  const source = read(workflow);
  for (const command of requiredPackageCommands) {
    requirePolicy(source.includes(command), `${workflow} missing ${command}`);
  }
}
requirePolicy(read('.github/workflows/ci.yml').includes('npm run test:visual:linux'), 'CI must call the Linux visual script');
requirePolicy(read('.github/workflows/release.yml').includes('npm run test:visual:linux'), 'release must call the Linux visual script');
for (const file of ['CONTRIBUTING.md', 'SHIPPING.md']) {
  requirePolicy(read(file).includes('npm run test:visual:linux'), `${file} must document the Linux visual gate`);
  requirePolicy(read(file).includes('test:portable'), `${file} must document the portable local suite`);
}

if (errors.length > 0) {
  throw new assert.AssertionError({
    message: `P2 release policy failures:\n- ${errors.join('\n- ')}`,
    actual: errors.length,
    expected: 0,
  });
}

console.log('P2 release policy fixture: OK');
