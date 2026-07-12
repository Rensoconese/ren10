#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { isAbsolute, posix as pathPosix, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { startStaticServer } = require('../tests/utils/static-server.cjs');

const USAGE = `Usage:
  capture-block-matrix <matrix.json> --module <id> --output <dir> [--repo-root <dir>]`;

const ALLOWED_ACTION_TYPES = new Set(['click', 'press', 'focus']);
const ALLOWED_THEMES = new Set(['light', 'dark']);

/**
 * True when `value` is a single safe path segment (no traversal / separators).
 * @param {unknown} value
 * @returns {boolean}
 */
export function isSafePathSegment(value) {
  if (typeof value !== 'string' || value === '') return false;
  if (value === '.' || value === '..') return false;
  if (value.includes('/') || value.includes('\\') || value.includes('\0')) return false;
  if (isAbsolute(value)) return false;
  // Windows drive / UNC forms even when not absolute on POSIX hosts.
  if (/^[a-zA-Z]:/.test(value) || value.startsWith('\\\\')) return false;
  // Reject encoded or whitespace-smuggled separators.
  if (/[\u0000-\u001f\u007f]/.test(value)) return false;
  if (value !== value.trim()) return false;
  return true;
}

/**
 * Resolve `candidate` under `root` and assert the result stays inside root.
 * @param {string} root
 * @param {string} candidate
 * @param {string} label
 * @returns {string} resolved absolute path
 */
export function resolveContainedPath(root, candidate, label = 'path') {
  const resolvedRoot = resolve(root);
  const resolved = resolve(resolvedRoot, candidate);
  const rootWithSep = resolvedRoot.endsWith(sep) ? resolvedRoot : `${resolvedRoot}${sep}`;
  if (resolved !== resolvedRoot && !resolved.startsWith(rootWithSep)) {
    throw new Error(`Unsafe ${label}: resolves outside output root`);
  }
  return resolved;
}

/**
 * Run cleanup callbacks after an operation. Preserve a primary error when
 * present; otherwise surface cleanup failure(s). Aggregate multiple cleanup
 * failures on `error.cleanupErrors`.
 * @param {unknown} primaryError
 * @param {Array<() => unknown | Promise<unknown>>} cleanupFns
 * @returns {Promise<void>}
 */
export async function settleWithCleanup(primaryError, cleanupFns = []) {
  /** @type {Error[]} */
  const cleanupErrors = [];
  for (const cleanup of cleanupFns) {
    try {
      await cleanup();
    } catch (error) {
      cleanupErrors.push(error instanceof Error ? error : new Error(String(error)));
    }
  }

  if (primaryError) {
    if (cleanupErrors.length && primaryError && typeof primaryError === 'object') {
      // Attach without replacing the primary failure.
      primaryError.cleanupErrors = cleanupErrors;
    }
    throw primaryError;
  }

  if (cleanupErrors.length === 0) return;
  if (cleanupErrors.length === 1) {
    const only = cleanupErrors[0];
    if (!/cleanup/i.test(only.message)) {
      only.message = `Cleanup failed: ${only.message}`;
    }
    throw only;
  }

  const aggregate = new AggregateError(
    cleanupErrors,
    `Cleanup failed with ${cleanupErrors.length} errors`,
  );
  aggregate.cleanupErrors = cleanupErrors;
  throw aggregate;
}

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

  if (!Array.isArray(matrix.states)) {
    errors.push('Render matrix states must be a non-empty array');
    return errors.sort();
  }
  if (matrix.states.length === 0) {
    errors.push('Render matrix states must be a non-empty array');
    return errors.sort();
  }

  const ids = new Set();
  for (const state of matrix.states) {
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      errors.push('Render matrix state must be an object');
      continue;
    }

    const stateId = typeof state.id === 'string' && state.id.trim() !== ''
      ? state.id
      : '<missing-id>';

    if (typeof state.id !== 'string' || state.id.trim() === '') {
      errors.push(`State ${stateId} requires a non-empty id`);
    } else if (!isSafePathSegment(state.id)) {
      errors.push(`State ${state.id} has unsafe path segment id`);
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

/** Default bound for post-action animation settle (ms). */
const DEFAULT_SETTLE_TIMEOUT_MS = 2000;

/**
 * Count finite, still-active document animations/transitions.
 * Infinite iterations (spinners) are ignored so settle never hangs on them.
 * Canceled / finished / idle animations are ignored.
 * Runs via page.evaluate (browser automation; works with javaScriptEnabled:false).
 * @returns {{ pending: number, infinite: number, unsupported: boolean }}
 */
function countPendingAnimationsInPage() {
  if (typeof document.getAnimations !== 'function') {
    return { pending: 0, infinite: 0, unsupported: true };
  }
  const animations = document.getAnimations({ subtree: true });
  let pending = 0;
  let infinite = 0;
  for (const anim of animations) {
    const state = anim.playState;
    // finished / idle are already settled; canceled ends as idle with null time.
    if (state === 'finished' || state === 'idle') continue;
    let iterations = 1;
    try {
      iterations = anim.effect?.getTiming?.()?.iterations ?? 1;
    } catch {
      iterations = 1;
    }
    if (iterations === Infinity || (typeof iterations === 'number' && iterations > 1e6)) {
      infinite += 1;
      continue;
    }
    if (state === 'running' || state === 'pending') pending += 1;
  }
  return { pending, infinite, unsupported: false };
}

/**
 * Read a root element's geometry for stability checks.
 * @param {string} selector
 * @returns {{ x: number, y: number, w: number, h: number } | null}
 */
function readRootBoxInPage(selector) {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
}

/**
 * @param {{ x: number, y: number, w: number, h: number } | null} a
 * @param {{ x: number, y: number, w: number, h: number } | null} b
 */
function sameBox(a, b) {
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}

/**
 * Yield to the event loop without an arbitrary long sleep.
 * One frame budget (~16ms) is enough between animation polls.
 * @param {number} [ms]
 */
function yieldBriefly(ms = 16) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Wait for finite CSS animations/transitions to finish, then at least two
 * animation frames or a stable root geometry. Infinite animations are ignored.
 * Canceled animations do not throw. Bounded by timeoutMs.
 *
 * Uses page.evaluate only (allowed under javaScriptEnabled:false). When
 * requestAnimationFrame is unavailable (JS disabled), falls back to two
 * consecutive stable root measurements.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ timeoutMs?: number, rootSelector?: string }} [options]
 * @returns {Promise<void>}
 */
export async function settleDocument(page, options = {}) {
  if (!page || typeof page.evaluate !== 'function') {
    throw new Error('settleDocument requires a Playwright page');
  }

  const timeoutMs = Number.isFinite(options.timeoutMs) && options.timeoutMs > 0
    ? options.timeoutMs
    : DEFAULT_SETTLE_TIMEOUT_MS;
  const rootSelector = typeof options.rootSelector === 'string' && options.rootSelector.trim() !== ''
    ? options.rootSelector
    : 'html';
  const deadline = Date.now() + timeoutMs;

  // Give the browser one task to register enter animations after the action.
  // Prefer rAF when available; otherwise a single brief yield.
  try {
    const remaining = Math.max(0, deadline - Date.now());
    await Promise.race([
      page.evaluate(() => new Promise((resolve) => {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(() => resolve());
        } else {
          resolve();
        }
      })),
      yieldBriefly(Math.min(50, remaining || 50)),
    ]);
  } catch {
    await yieldBriefly(16);
  }

  // Phase 1: wait until no finite animations/transitions are running.
  while (Date.now() < deadline) {
    let status;
    try {
      status = await page.evaluate(countPendingAnimationsInPage);
    } catch {
      // evaluate can fail on closed pages; surface by breaking to frame settle.
      break;
    }
    if (!status || status.pending === 0) break;
    await yieldBriefly(16);
  }

  // Phase 2: two animation frames, or stable root when rAF is unavailable (JS off).
  const frameBudget = Math.max(0, deadline - Date.now());
  let framesDone = false;
  if (frameBudget > 0) {
    try {
      await Promise.race([
        page.evaluate(() => new Promise((resolve, reject) => {
          if (typeof requestAnimationFrame !== 'function') {
            reject(new Error('raf-unavailable'));
            return;
          }
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve(true));
          });
        })),
        yieldBriefly(Math.min(frameBudget, 500)).then(() => {
          throw new Error('raf-timeout');
        }),
      ]);
      framesDone = true;
    } catch {
      framesDone = false;
    }
  }

  if (!framesDone) {
    // Stable-root fallback: two consecutive identical geometries.
    let previous = null;
    while (Date.now() < deadline) {
      let box;
      try {
        box = await page.evaluate(readRootBoxInPage, rootSelector);
      } catch {
        break;
      }
      if (sameBox(previous, box)) break;
      previous = box;
      await yieldBriefly(16);
    }
  }
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
  if (!isSafePathSegment(moduleId)) {
    throw new Error(`Unsafe moduleId path segment: ${moduleId}`);
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

  const resolvedOutputRoot = resolve(outputRoot);
  const moduleRoot = resolveContainedPath(resolvedOutputRoot, moduleId, 'moduleId');

  // Validate every state output path before any I/O or browser launch.
  for (const state of matrix.states) {
    resolveContainedPath(moduleRoot, `${state.id}.png`, `state id "${state.id}"`);
    resolveContainedPath(moduleRoot, `${state.id}.json`, `state id "${state.id}"`);
  }

  const server = await startStaticServer(repoRoot);
  /** @type {import('@playwright/test').Browser | undefined} */
  let browser;
  /** @type {unknown} */
  let primaryError;
  /** @type {number | undefined} */
  let capturedCount;
  try {
    browser = await chromium.launch();
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim();
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
        // Deterministic post-action settle: finite animations/transitions, then
        // two frames or stable root — before markers and screenshot.
        await settleDocument(page, { rootSelector: matrix.root });
        const markerCounts = await collectMarkerCounts(page, state.expectedMarkers);

        const pngPath = resolveContainedPath(moduleRoot, `${state.id}.png`, `state id "${state.id}"`);
        const jsonPath = resolveContainedPath(moduleRoot, `${state.id}.json`, `state id "${state.id}"`);
        await page.screenshot({ path: pngPath, fullPage: true });
        await writeFile(jsonPath, `${JSON.stringify({
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

    capturedCount = matrix.states.length;
  } catch (error) {
    primaryError = error;
  } finally {
    try {
      await settleWithCleanup(primaryError, [
        async () => {
          if (browser) await browser.close();
        },
        async () => {
          await server.close();
        },
      ]);
    } catch (error) {
      // Prefer primary (possibly with cleanupErrors attached); otherwise surface cleanup.
      primaryError = error;
    }
  }

  if (primaryError) throw primaryError;
  return capturedCount;
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
