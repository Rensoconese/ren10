import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import yaml from 'js-yaml';
import {
  findPublicVersionSurfaces,
  isStableSemverAtLeast,
  validateWorkflowPolicy,
} from './release-policy.mjs';
import { collectLifecycleErrors } from './check-release.mjs';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const pkg = JSON.parse(read('package.json'));
const errors = [];
const requirePolicy = (condition, message) => { if (!condition) errors.push(message); };

for (const [script, expected] of [
  ['check-agent-skill.mjs', ['v0 adapter', 'starter approval']],
  ['check-release.mjs', ['v0 adapter', 'starter approval']],
]) {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', script)], {
    cwd: root,
    encoding: 'utf8',
  });
  requirePolicy(result.status === 0, `${script} must pass:\n${result.stdout}${result.stderr}`);
  for (const artifact of expected) {
    requirePolicy(
      result.stdout.toLowerCase().includes(artifact),
      `${script} must report successful ${artifact} validation`,
    );
  }
}

const driftRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ren10-lifecycle-drift-'));
try {
  fs.cpSync(path.join(root, 'skills', 'rends'), path.join(driftRoot, 'skills', 'rends'), { recursive: true });
  fs.cpSync(path.join(root, 'examples', 'reference-app'), path.join(driftRoot, 'examples', 'reference-app'), { recursive: true });
  const driftPackage = { ...pkg, version: '99.99.99' };
  fs.writeFileSync(path.join(driftRoot, 'package.json'), JSON.stringify(driftPackage));
  const lifecycleErrors = await collectLifecycleErrors(driftRoot);
  requirePolicy(
    lifecycleErrors.some((error) => error.startsWith('v0 adapter:') && /version/i.test(error)),
    'release lifecycle gate must reject v0 adapter version drift',
  );
  requirePolicy(
    lifecycleErrors.some((error) => error.startsWith('starter approval:') && /version/i.test(error)),
    'release lifecycle gate must reject starter approval version drift',
  );
} finally {
  fs.rmSync(driftRoot, { recursive: true, force: true });
}

const lockPath = path.join(root, 'package-lock.json');
requirePolicy(fs.existsSync(lockPath), 'package-lock.json is required');
const lock = fs.existsSync(lockPath) ? JSON.parse(fs.readFileSync(lockPath, 'utf8')) : {};

requirePolicy(pkg.scripts.test === 'npm run test:portable', 'npm test must use the portable suite');
requirePolicy(typeof pkg.scripts['test:portable'] === 'string', 'portable suite script is missing');
const portableCommands = (pkg.scripts['test:portable'] || '').split('&&').map((command) => command.trim());
requirePolicy(!portableCommands.some((command) => /^npm run test:visual(?::|\s|$)/.test(command)), 'portable suite must exclude visual snapshots');
requirePolicy(portableCommands.includes('npm run test:release-policy'), 'portable suite must run release policy tests');
requirePolicy(Boolean(pkg.scripts['test:visual:linux']), 'Linux visual gate needs a dedicated script');
requirePolicy(pkg.scripts['audit:runtime'] === 'npm audit --omit=dev --audit-level=moderate', 'runtime moderate audit script missing');
requirePolicy(pkg.scripts['audit:full'] === 'npm audit --audit-level=moderate', 'full moderate audit script missing');

const publicVersions = findPublicVersionSurfaces(root, pkg.version);
requirePolicy(publicVersions.surfaces.filter((surface) => surface.kind === 'html').length >= 65, 'public HTML version surface inventory is incomplete');
for (const error of publicVersions.errors) {
  requirePolicy(false, error);
}
requirePolicy(lock.version === pkg.version, 'package-lock.json version must match package.json');
requirePolicy(lock.packages?.['']?.version === pkg.version, 'package-lock root package version must match package.json');

const jsYaml = lock.packages?.['node_modules/js-yaml']?.version;
requirePolicy(isStableSemverAtLeast(jsYaml, '4.1.2'), `js-yaml must be >=4.1.2, found ${jsYaml}`);
for (const prerelease of ['4.1.2-alpha.1', '4.1.2-beta.1', '4.1.2-rc.1']) {
  requirePolicy(!isStableSemverAtLeast(prerelease, '4.1.2'), `js-yaml prerelease ${prerelease} must not satisfy 4.1.2`);
}
requirePolicy(isStableSemverAtLeast('4.1.2', '4.1.2'), 'exact minimum semver must pass');
requirePolicy(isStableSemverAtLeast('4.2.0', '4.1.2'), 'newer stable semver must pass');
requirePolicy(!isStableSemverAtLeast('4.1.1', '4.1.2'), 'older semver must fail');
requirePolicy(!isStableSemverAtLeast('not-semver', '4.1.2'), 'malformed semver must fail');

const budgetPath = path.join(root, 'scripts', 'package-budgets.json');
requirePolicy(fs.existsSync(budgetPath), 'versioned package budget targets are missing');
if (fs.existsSync(budgetPath)) {
  const budget = JSON.parse(fs.readFileSync(budgetPath, 'utf8'));
  for (const metric of ['unpackedBytes', 'tarballBytes', 'sourceRequestCount', 'requestCount', 'cliRssBytes']) {
    requirePolicy(Number.isFinite(budget.metrics?.[metric]?.baseline), `${metric} baseline missing`);
    requirePolicy(Number.isFinite(budget.metrics?.[metric]?.allowedDelta), `${metric} allowedDelta missing`);
  }
  for (const metric of ['unpackedBytes', 'tarballBytes', 'sourceRequestCount', 'requestCount']) {
    requirePolicy(budget.metrics?.[metric]?.allowedDelta === 0, `${metric} budget must enforce zero growth`);
    requirePolicy(budget.metrics?.[metric]?.target === budget.metrics?.[metric]?.baseline, `${metric} target must equal its clean baseline`);
  }
}

const requiredPackageCommands = [
  'npm run smoke:installed',
  'npm run check:budgets',
  'npm run test:budgets',
  'npm run audit:runtime',
  'npm run audit:full',
  'npm run check:release',
  'npm run check:supply-chain',
  'npm run test:release-policy',
];
const workflows = Object.fromEntries(
  ['ci.yml', 'release.yml', 'audit.yml'].map((file) => [file, yaml.load(read(`.github/workflows/${file}`))])
);
for (const error of validateWorkflowPolicy(workflows, requiredPackageCommands)) requirePolicy(false, error);
const conditionalFixture = structuredClone(workflows);
conditionalFixture['ci.yml'].jobs.package.steps
  .find((step) => step.run === 'npm run check:budgets').if = 'false';
requirePolicy(
  validateWorkflowPolicy(conditionalFixture, requiredPackageCommands)
    .some((error) => error.includes('check:budgets') && error.includes('unconditionally')),
  'workflow policy must reject a conditionally skipped blocking gate'
);

const missingLockRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ren10-missing-lock-'));
try {
  fs.writeFileSync(path.join(missingLockRoot, 'package.json'), JSON.stringify({
    name: 'ren10',
    version: pkg.version,
    publishConfig: { provenance: true },
    repository: { url: 'https://github.com/Rensoconese/ren10' },
    scripts: {
      'audit:runtime': 'npm audit --omit=dev --audit-level=moderate',
      'audit:full': 'npm audit --audit-level=moderate',
    },
  }));
  const missingLock = spawnSync(process.execPath, [path.join(root, 'scripts', 'check-supply-chain.mjs')], {
    cwd: missingLockRoot,
    encoding: 'utf8',
  });
  requirePolicy(missingLock.status === 1, 'missing lockfile fixture must fail');
  requirePolicy(missingLock.stderr.includes('package-lock.json is required'), 'missing lockfile diagnostic must be reachable');
  requirePolicy(!missingLock.stderr.includes('ENOENT'), 'missing lockfile must not throw ENOENT');
} finally {
  fs.rmSync(missingLockRoot, { recursive: true, force: true });
}
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
