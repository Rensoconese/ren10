#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APPROVAL_PATH = 'examples/reference-app/starter-validation.json';
const ARTIFACT_PATH = 'examples/reference-app';
const REQUIRED_FILES = ['index.html', 'app.js', 'README.md', 'visual-references.json'];
const REQUIRED_SCENARIOS = [
  'shell-sidebar',
  'settings-form',
  'data-table',
  'dialog-keyboard-focus',
  'status-empty-feedback',
];
const REQUIRED_THEMES = ['light', 'dark'];
const VISUAL_MANIFEST_PATH = 'examples/reference-app/visual-references.json';
const REVIEW_COMMAND = 'node scripts/capture-starter-visuals.mjs && npx playwright test --config tests/agent-starter/playwright.config.cjs';
const SUITE_COMMAND = 'npx playwright test --config tests/agent-starter/playwright.config.cjs';
const SUITE_PATH = 'tests/agent-starter/reference-app.spec.js';
const REQUIRED_VISUALS = [
  { id: 'light', file: 'screenshots/light.png', theme: 'light', dialogOpen: false },
  { id: 'dark', file: 'screenshots/dark.png', theme: 'dark', dialogOpen: false },
  { id: 'dialog-open', file: 'screenshots/dialog-open.png', theme: 'light', dialogOpen: true },
];

async function listArtifactFiles(directory, relative = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === 'starter-validation.json') continue;
    const relativePath = path.posix.join(relative, entry.name);
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listArtifactFiles(absolutePath, relativePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }
  return files;
}

export async function hashStarterArtifact(root, artifactPath = ARTIFACT_PATH) {
  const artifactDirectory = path.resolve(root, artifactPath);
  const rootDirectory = path.resolve(root);
  const relativeArtifact = path.relative(rootDirectory, artifactDirectory);
  if (relativeArtifact.startsWith('..') || path.isAbsolute(relativeArtifact)) {
    throw new Error('Artifact path must stay inside the package root.');
  }

  const files = await listArtifactFiles(artifactDirectory);
  const hash = createHash('sha256');
  for (const relativePath of files) {
    hash.update(relativePath.replaceAll(path.sep, '/'));
    hash.update('\0');
    hash.update(await readFile(path.join(artifactDirectory, relativePath)));
    hash.update('\0');
  }
  return `sha256:${hash.digest('hex')}`;
}

export async function validateStarterApproval(root) {
  const checks = [];
  const errors = [];
  const packageRoot = path.resolve(root);
  let packageJson;
  let approval;
  let visualManifest;

  try {
    packageJson = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
    checks.push('package metadata is readable');
  } catch (error) {
    errors.push(`Unable to read package.json: ${error.message}`);
  }

  try {
    approval = JSON.parse(await readFile(path.join(packageRoot, APPROVAL_PATH), 'utf8'));
    checks.push('starter approval metadata is readable');
  } catch (error) {
    errors.push(`Unable to read ${APPROVAL_PATH}: ${error.message}`);
  }

  if (!packageJson || !approval) return { ok: false, checks, errors };

  if (approval.visualManifest === VISUAL_MANIFEST_PATH) {
    try {
      visualManifest = JSON.parse(await readFile(path.join(packageRoot, VISUAL_MANIFEST_PATH), 'utf8'));
      checks.push('visual reference manifest is readable');
    } catch (error) {
      errors.push(`Unable to read visual manifest ${VISUAL_MANIFEST_PATH}: ${error.message}`);
    }
  } else {
    errors.push(`Starter approval visualManifest must be ${JSON.stringify(VISUAL_MANIFEST_PATH)}.`);
  }

  if (approval.schemaVersion === 1) checks.push('starter approval schema version is supported');
  else errors.push('Starter approval schemaVersion must be 1.');

  if (approval.packageVersion === packageJson.version) {
    checks.push('starter approval package version matches package.json');
  } else {
    errors.push(
      `Starter approval package version ${JSON.stringify(approval.packageVersion)} does not match package.json version ${JSON.stringify(packageJson.version)}.`,
    );
  }

  if (approval.artifactPath === ARTIFACT_PATH) checks.push('starter artifact path is canonical');
  else errors.push(`Starter approval artifactPath must be ${JSON.stringify(ARTIFACT_PATH)}.`);

  for (const file of REQUIRED_FILES) {
    try {
      const fileStat = await stat(path.join(packageRoot, ARTIFACT_PATH, file));
      if (!fileStat.isFile()) throw new Error('not a file');
      checks.push(`starter artifact includes ${file}`);
    } catch {
      errors.push(`Starter artifact is missing required file ${file}.`);
    }
  }

  if (approval.artifactPath === ARTIFACT_PATH) {
    try {
      const expectedHash = await hashStarterArtifact(packageRoot, approval.artifactPath);
      if (approval.contentHash === expectedHash) checks.push('starter content hash matches artifact');
      else errors.push(`Starter approval content hash does not match artifact; expected ${expectedHash}.`);
    } catch (error) {
      errors.push(`Unable to hash starter artifact: ${error.message}`);
    }
  }

  const scenarios = Array.isArray(approval.scenarios) ? approval.scenarios : [];
  for (const scenario of REQUIRED_SCENARIOS) {
    if (scenarios.includes(scenario)) checks.push(`starter approval includes scenario ${scenario}`);
    else errors.push(`Starter approval is missing required scenario ${scenario}.`);
  }

  const themes = Array.isArray(approval.themes) ? approval.themes : [];
  for (const theme of REQUIRED_THEMES) {
    if (themes.includes(theme)) checks.push(`starter approval includes ${theme} theme`);
    else errors.push(`Starter approval is missing required ${theme} theme.`);
  }

  if (approval.accessibility?.standard === 'WCAG 2.1 AA' && approval.accessibility?.axeRequired === true) {
    checks.push('starter approval requires WCAG 2.1 AA and axe');
  } else {
    errors.push('Starter approval must require WCAG 2.1 AA and axe validation.');
  }

  const review = approval.review;
  if (review?.process === 'independent-review') checks.push('review process is identified');
  else errors.push('Starter approval review.process must identify independent-review.');
  if (typeof review?.reviewer === 'string' && review.reviewer.trim()) checks.push('review reviewer identity is present');
  else errors.push('Starter approval review.reviewer identity is required.');
  if (typeof review?.reviewedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt)
    && !Number.isNaN(Date.parse(`${review.reviewedAt}T00:00:00Z`))) {
    checks.push('review reviewedAt date is valid');
  } else {
    errors.push('Starter approval review.reviewedAt must be a valid ISO date.');
  }
  if (review?.command === REVIEW_COMMAND) checks.push('review command is reproducible');
  else errors.push(`Starter approval review.command must be ${JSON.stringify(REVIEW_COMMAND)}.`);
  if (review?.result === 'approved') checks.push('review result is approved');
  else errors.push('Starter approval review.result must be approved.');

  const suiteEvidence = approval.suiteEvidence;
  let suitePathExists = false;
  if (suiteEvidence?.suitePath === SUITE_PATH) {
    try {
      suitePathExists = (await stat(path.join(packageRoot, SUITE_PATH))).isFile();
    } catch {
      suitePathExists = false;
    }
  }
  if (suitePathExists) checks.push('declared suite evidence path exists');
  else errors.push(`Starter approval suite evidence must reference existing ${SUITE_PATH}.`);
  if (suiteEvidence?.command === SUITE_COMMAND) checks.push('declared suite evidence command is reproducible');
  else errors.push(`Starter approval suite evidence command must be ${JSON.stringify(SUITE_COMMAND)}.`);
  if (suiteEvidence?.result?.status === 'passed'
    && Number.isInteger(suiteEvidence.result.tests) && suiteEvidence.result.tests >= 11
    && suiteEvidence.result.failures === 0
    && suiteEvidence.result.axeViolations === 0) {
    checks.push('declared suite evidence records passing tests and axe');
  } else {
    errors.push('Starter approval suite evidence must record at least 11 passed tests, zero failures, and zero axe violations.');
  }

  if (visualManifest) {
    if (visualManifest.schemaVersion === 1) checks.push('visual manifest schema version is supported');
    else errors.push('Visual manifest schemaVersion must be 1.');
    if (visualManifest.packageVersion === packageJson.version) checks.push('visual manifest package version matches package.json');
    else errors.push('Visual manifest package version must match package.json.');
    const authority = visualManifest.apiAuthority;
    if (authority?.source === 'package-contracts-and-cli'
      && Array.isArray(authority.contracts) && authority.contracts.includes('ren-design.md')
      && authority.contracts.includes('components/components.md')
      && Array.isArray(authority.cli) && authority.cli.length > 0) {
      checks.push('visual manifest names package contracts and CLI as API authority');
    } else {
      errors.push('Visual manifest must name package contracts and CLI as API authority.');
    }
    if (visualManifest.figma?.role === 'optional-visual-only' && visualManifest.figma?.apiAuthority === false) {
      checks.push('visual manifest limits Figma to optional visual-only input');
    } else {
      errors.push('Visual manifest must declare Figma optional, visual-only, and without API authority.');
    }
    if (visualManifest.capture?.command === 'node scripts/capture-starter-visuals.mjs'
      && Number.isInteger(visualManifest.capture?.viewport?.width)
      && Number.isInteger(visualManifest.capture?.viewport?.height)) {
      checks.push('visual manifest declares reproducible capture command and viewport');
    } else {
      errors.push('Visual manifest must declare the capture command and integer viewport.');
    }

    const scenarios = Array.isArray(visualManifest.scenarios) ? visualManifest.scenarios : [];
    const artifactDirectory = path.join(packageRoot, ARTIFACT_PATH);
    for (const required of REQUIRED_VISUALS) {
      const scenario = scenarios.find((candidate) => candidate?.id === required.id);
      if (!scenario || scenario.file !== required.file || scenario.theme !== required.theme
        || scenario.dialogOpen !== required.dialogOpen) {
        errors.push(`Visual manifest scenario ${required.id} must declare ${required.file}, theme ${required.theme}, and dialogOpen=${required.dialogOpen}.`);
        continue;
      }
      const screenshotPath = path.resolve(artifactDirectory, scenario.file);
      const relativeScreenshot = path.relative(artifactDirectory, screenshotPath);
      if (relativeScreenshot.startsWith('..') || path.isAbsolute(relativeScreenshot)) {
        errors.push(`Visual screenshot path escapes artifact: ${scenario.file}.`);
        continue;
      }
      try {
        const screenshotStat = await stat(screenshotPath);
        if (!screenshotStat.isFile() || screenshotStat.size === 0) throw new Error('empty');
        checks.push(`visual screenshot ${scenario.file} is nonempty`);
      } catch {
        errors.push(`Visual screenshot ${scenario.file} must exist and be nonempty.`);
      }
    }
  }

  if (approval.status === 'approved') checks.push('starter approval is approved');
  else errors.push('Starter approval status must be approved.');

  return { ok: errors.length === 0, checks, errors };
}

async function main() {
  const root = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve('.');
  const result = await validateStarterApproval(root);
  if (result.ok) {
    console.log(`Starter approval valid (${result.checks.length} checks).`);
    return;
  }
  for (const error of result.errors) console.error(`- ${error}`);
  process.exitCode = 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) await main();
