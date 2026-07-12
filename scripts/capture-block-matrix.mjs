#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, posix as pathPosix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { startStaticServer } = require('../tests/utils/static-server.cjs');

const USAGE = `Usage:
  capture-block-matrix <matrix.json> --module <id> --output <dir> [--repo-root <dir>]`;

const ALLOWED_ACTION_TYPES = new Set(['click', 'press', 'focus']);
const ALLOWED_THEMES = new Set(['light', 'dark']);

/**
 * @param {string} origin
 * @param {string} pagePath
 * @param {string} cacheKey
 */
export function buildStateUrl(origin, pagePath, cacheKey) {
  const url = new URL(pagePath, origin);
  url.searchParams.set('ren10_capture', cacheKey);
  return url.href;
}

/**
 * @param {unknown} selector
 * @returns {boolean}
 */
function isMalformedSelector(selector) {
  if (typeof selector !== 'string') return true;
  if (selector.trim() === '') return true;
  if (/[\0\r\n]/.test(selector)) return true;
  return false;
}

/**
 * @param {string} pagePath
 * @returns {boolean}
 */
function isUnsafePagePath(pagePath) {
  if (typeof pagePath !== 'string') return true;
  if (!pagePath.startsWith('/')) return true;
  if (pagePath.startsWith('//')) return true;
  if (pagePath.includes('\\') || pagePath.includes('\0')) return true;
  if (pagePath.includes('?') || pagePath.includes('#') || pagePath.includes('://')) return true;

  const segments = pagePath.split('/');
  if (segments.some((segment) => segment === '..' || segment === '.')) return true;

  const normalized = pathPosix.normalize(pagePath);
  if (!normalized.startsWith('/') || normalized.startsWith('//')) return true;
  if (normalized.split('/').some((segment) => segment === '..')) return true;
  return false;
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
function isPositiveDimension(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

/**
 * @param {unknown} matrix
 * @returns {string[]}
 */
export function validateRenderMatrix(matrix) {
  const errors = [];
  if (!matrix || typeof matrix !== 'object' || Array.isArray(matrix)) {
    return ['Render matrix must be an object'].sort();
  }

  if (matrix.version !== 1) errors.push('Render matrix version must equal 1');

  if (typeof matrix.path !== 'string' || !matrix.path.startsWith('/')) {
    errors.push('Render matrix path must start with /');
  } else if (isUnsafePagePath(matrix.path)) {
    errors.push(`Render matrix has unsafe page path: ${matrix.path}`);
  }

  if (!matrix.root || (typeof matrix.root === 'string' && matrix.root.trim() === '')) {
    errors.push('Render matrix root selector is required');
  } else if (isMalformedSelector(matrix.root)) {
    errors.push('Render matrix root selector is malformed');
  }

  if (matrix.states !== undefined && !Array.isArray(matrix.states)) {
    errors.push('Render matrix states must be an array');
    return errors.sort();
  }

  const ids = new Set();
  for (const state of matrix.states ?? []) {
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      errors.push('Render matrix state must be an object');
      continue;
    }

    const stateId = typeof state.id === 'string' && state.id.trim() !== ''
      ? state.id
      : '<missing-id>';

    if (typeof state.id !== 'string' || state.id.trim() === '') {
      errors.push(`State ${stateId} requires a non-empty id`);
    } else if (ids.has(state.id)) {
      errors.push(`Duplicate render state id: ${state.id}`);
    } else {
      ids.add(state.id);
    }

    if (!isPositiveDimension(state.viewport?.width) || !isPositiveDimension(state.viewport?.height)) {
      errors.push(`State ${stateId} requires viewport width and height`);
    }

    if (!ALLOWED_THEMES.has(state.theme)) {
      errors.push(`State ${stateId} has invalid theme`);
    }

    if (!Array.isArray(state.actions)) {
      errors.push(`State ${stateId} actions must be an array`);
    } else {
      for (const [index, action] of state.actions.entries()) {
        if (!action || typeof action !== 'object' || Array.isArray(action)) {
          errors.push(`State ${stateId} action[${index}] must be an object`);
          continue;
        }
        if (!ALLOWED_ACTION_TYPES.has(action.type)) {
          errors.push(`State ${stateId} action[${index}] has unsupported action type: ${action.type}`);
          continue;
        }
        if (action.type === 'click' || action.type === 'focus') {
          if (action.selector === undefined || action.selector === null) {
            errors.push(`State ${stateId} action[${index}] (${action.type}) requires a selector`);
          } else if (isMalformedSelector(action.selector)) {
            errors.push(`State ${stateId} action[${index}] has malformed selector`);
          }
        }
        if (action.type === 'press') {
          if (typeof action.key !== 'string' || action.key.trim() === '') {
            errors.push(`State ${stateId} action[${index}] (press) requires a key`);
          } else if (/[\0\r\n]/.test(action.key)) {
            errors.push(`State ${stateId} action[${index}] has malformed key`);
          }
          if (action.selector !== undefined && action.selector !== null && isMalformedSelector(action.selector)) {
            errors.push(`State ${stateId} action[${index}] has malformed selector`);
          }
        }
      }
    }

    if (state.expectedMarkers !== undefined) {
      if (!state.expectedMarkers || typeof state.expectedMarkers !== 'object' || Array.isArray(state.expectedMarkers)) {
        errors.push(`State ${stateId} expectedMarkers must be an object`);
      } else {
        for (const [selector, expected] of Object.entries(state.expectedMarkers)) {
          if (isMalformedSelector(selector)) {
            errors.push(`State ${stateId} expectedMarkers has malformed selector`);
          }
          if (typeof expected !== 'number' || !Number.isInteger(expected) || expected < 0) {
            errors.push(`State ${stateId} expectedMarkers values must be non-negative integers`);
          }
        }
      }
    }
  }

  return errors.sort();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ type: string, selector?: string, key?: string }} action
 */
async function runAction(page, action) {
  if (action.type === 'click') return page.locator(action.selector).click();
  if (action.type === 'focus') return page.locator(action.selector).focus();
  if (action.type === 'press') {
    if (action.selector) await page.locator(action.selector).focus();
    return page.keyboard.press(action.key);
  }
  throw new Error(`Unsupported render action: ${action.type}`);
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {Record<string, number>} [expectedMarkers]
 */
async function collectMarkerCounts(page, expectedMarkers = {}) {
  const result = {};
  for (const [selector, expected] of Object.entries(expectedMarkers)) {
    const actual = await page.locator(selector).count();
    if (actual !== expected) {
      throw new Error(`Stale or incorrect DOM for ${selector}: expected ${expected}, received ${actual}`);
    }
    result[selector] = actual;
  }
  return result;
}

/**
 * @param {{
 *   matrixPath: string,
 *   moduleId: string,
 *   repoRoot: string,
 *   outputRoot: string,
 * }} options
 * @returns {Promise<number>} number of captured states
 */
export async function captureMatrix({ matrixPath, moduleId, repoRoot, outputRoot }) {
  if (typeof moduleId !== 'string' || moduleId.trim() === '') {
    throw new Error('moduleId is required');
  }
  if (typeof repoRoot !== 'string' || repoRoot.trim() === '') {
    throw new Error('repoRoot is required');
  }
  if (typeof outputRoot !== 'string' || outputRoot.trim() === '') {
    throw new Error('outputRoot is required');
  }

  const matrix = JSON.parse(await readFile(matrixPath, 'utf8'));
  const errors = validateRenderMatrix(matrix);
  if (errors.length) throw new Error(errors.join('\n'));

  const server = await startStaticServer(repoRoot);
  let browser;
  try {
    browser = await chromium.launch();
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim();
    const moduleRoot = join(outputRoot, moduleId);
    await mkdir(moduleRoot, { recursive: true });

    for (const state of matrix.states) {
      const context = await browser.newContext({
        viewport: state.viewport,
        colorScheme: state.theme,
        javaScriptEnabled: state.javaScript !== false,
        reducedMotion: state.reducedMotion ? 'reduce' : 'no-preference',
      });
      try {
        const page = await context.newPage();
        const url = buildStateUrl(server.origin, matrix.path, `${moduleId}-${state.id}-${commit.slice(0, 12)}`);
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.evaluate((theme) => document.documentElement.setAttribute('data-theme', theme), state.theme);
        for (const action of state.actions) await runAction(page, action);
        await page.locator(matrix.root).waitFor({ state: 'visible' });
        const markerCounts = await collectMarkerCounts(page, state.expectedMarkers);
        await page.screenshot({ path: join(moduleRoot, `${state.id}.png`), fullPage: true });
        await writeFile(join(moduleRoot, `${state.id}.json`), `${JSON.stringify({
          id: state.id,
          url,
          viewport: state.viewport,
          theme: state.theme,
          javaScript: state.javaScript !== false,
          reducedMotion: Boolean(state.reducedMotion),
          markerCounts,
          commit,
          capturedAt: new Date().toISOString(),
        }, null, 2)}\n`);
      } finally {
        await context.close();
      }
    }

    return matrix.states.length;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
    await server.close().catch(() => {});
  }
}

/**
 * @param {string[]} values
 */
function argsToObject(values) {
  const result = { _: [] };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith('--')) {
      result._.push(value);
      continue;
    }
    const key = value.slice(2);
    if (!key) throw new Error(`Invalid flag: ${value}\n${USAGE}`);
    const next = values[index + 1];
    if (next === undefined || next.startsWith('--')) {
      throw new Error(`Missing value for --${key}\n${USAGE}`);
    }
    result[key] = next;
    index += 1;
  }
  return result;
}

/**
 * @param {ReturnType<typeof argsToObject>} args
 */
function validateCliArgs(args) {
  const allowedFlags = new Set(['module', 'output', 'repo-root']);
  for (const key of Object.keys(args)) {
    if (key === '_') continue;
    if (!allowedFlags.has(key)) {
      throw new Error(`Unknown flag: --${key}\n${USAGE}`);
    }
  }

  if (args._.length !== 1) {
    throw new Error(`Exactly one matrix path positional argument is required\n${USAGE}`);
  }

  for (const flag of ['module', 'output']) {
    if (args[flag] === undefined) {
      throw new Error(`Missing required argument: --${flag}\n${USAGE}`);
    }
    if (typeof args[flag] === 'string' && args[flag].trim() === '') {
      throw new Error(`Argument --${flag} must be non-empty\n${USAGE}`);
    }
  }

  if (args['repo-root'] !== undefined && String(args['repo-root']).trim() === '') {
    throw new Error(`Argument --repo-root must be non-empty\n${USAGE}`);
  }
}

async function main() {
  const args = argsToObject(process.argv.slice(2));
  validateCliArgs(args);

  const matrixPath = resolve(args._[0]);
  const moduleId = args.module;
  const outputRoot = resolve(args.output);
  const repoRoot = resolve(args['repo-root'] ?? process.cwd());

  const count = await captureMatrix({
    matrixPath,
    moduleId,
    repoRoot,
    outputRoot,
  });

  console.log(`Captured ${count} render state${count === 1 ? '' : 's'} for ${moduleId}`);
}

const isDirectRun = process.argv[1]
  && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isDirectRun) {
  main().catch((error) => {
    console.error(error && error.message ? error.message : error);
    process.exitCode = 1;
  });
}
