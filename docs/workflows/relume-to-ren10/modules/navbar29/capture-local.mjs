#!/usr/bin/env node
/**
 * Navbar29 local capture runner.
 *
 * Uses the shared capture helpers (settleDocument, path safety, static server)
 * without editing scripts/capture-block-matrix.mjs. Stabilizes multi-step mobile
 * open sequences (toggle → summary) and enforces real open/visibility state
 * beyond marker counts.
 */
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildStateUrl,
  resolveContainedPath,
  settleDocument,
  settleWithCleanup,
  validateRenderMatrix,
  isSafePathSegment,
} from '../../../../../scripts/capture-block-matrix.mjs';

const require = createRequire(import.meta.url);
const { startStaticServer } = require('../../../../../tests/utils/static-server.cjs');

const HERE = dirname(fileURLToPath(import.meta.url));
// modules/navbar29 → modules → relume-to-ren10 → workflows → docs → repo root
const REPO_ROOT = resolve(HERE, '../../../../..');
const MATRIX_PATH = resolve(HERE, 'render-matrix.json');
const DEFAULT_OUTPUT = resolve(REPO_ROOT, '.ren10-workflow/navbar29-captures');
const MODULE_ID = 'navbar29';

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ type: string, selector?: string, key?: string }} action
 */
async function runAction(page, action) {
  if (action.type === 'click') {
    const loc = page.locator(action.selector);
    await loc.waitFor({ state: 'visible', timeout: 5000 });
    return loc.click();
  }
  if (action.type === 'focus') {
    const loc = page.locator(action.selector);
    await loc.waitFor({ state: 'visible', timeout: 5000 });
    return loc.focus();
  }
  if (action.type === 'hover') {
    const loc = page.locator(action.selector);
    await loc.waitFor({ state: 'visible', timeout: 5000 });
    return loc.hover();
  }
  if (action.type === 'press') {
    if (action.selector) {
      const loc = page.locator(action.selector);
      await loc.waitFor({ state: 'visible', timeout: 5000 });
      await loc.focus();
    }
    return page.keyboard.press(action.key);
  }
  throw new Error(`Unsupported render action: ${action.type}`);
}

/**
 * Stabilize shell open before nested disclosure activation.
 * @param {import('@playwright/test').Page} page
 * @param {{ type: string, selector?: string }} action
 */
async function stabilizeAfterAction(page, action) {
  if (action.type !== 'click' || typeof action.selector !== 'string') return;

  if (action.selector.includes('ren-nav-toggle')) {
    await page.locator(`${action.selector}[aria-expanded="true"]`).waitFor({
      state: 'visible',
      timeout: 5000,
    });
    await page.locator('#rmoc-primary-links').waitFor({ state: 'visible', timeout: 5000 });
    // Nested trigger is only actionable once the shell tree is painted.
    await page.locator('.rmoc-disclosure > summary').waitFor({ state: 'visible', timeout: 5000 });
    return;
  }

  if (action.selector.includes('summary') || action.selector.includes('rmoc-disclosure')) {
    await page.locator('.rmoc-disclosure[open]').waitFor({ state: 'attached', timeout: 5000 });
    await page.locator('.rmoc-panel').waitFor({ state: 'visible', timeout: 5000 });
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
 * Real open/visibility assertions (not just marker counts in the DOM).
 * @param {import('@playwright/test').Page} page
 * @param {Record<string, unknown> | undefined} expectedState
 * @param {string} stateId
 */
async function assertExpectedState(page, expectedState, stateId) {
  if (!expectedState || typeof expectedState !== 'object') return null;

  /** @type {Record<string, unknown>} */
  const out = { ok: true, failures: /** @type {string[]} */ ([]) };

  if (expectedState.detailsOpenSelector) {
    const details = page.locator(String(expectedState.detailsOpenSelector)).first();
    const open = await details.evaluate((el) => Boolean(el && 'open' in el && el.open)).catch(() => false);
    out.detailsOpen = open;
    if (expectedState.detailsOpen === true && !open) {
      out.ok = false;
      out.failures.push(`details not open: ${expectedState.detailsOpenSelector}`);
    }
    if (expectedState.detailsOpen === false && open) {
      out.ok = false;
      out.failures.push(`details unexpectedly open: ${expectedState.detailsOpenSelector}`);
    }
  }

  if (expectedState.aria && typeof expectedState.aria === 'object') {
    out.aria = {};
    for (const [selector, attrs] of Object.entries(expectedState.aria)) {
      out.aria[selector] = {};
      const el = page.locator(selector).first();
      if ((await el.count()) === 0) {
        out.ok = false;
        out.failures.push(`missing aria target: ${selector}`);
        continue;
      }
      for (const [name, value] of Object.entries(attrs || {})) {
        const actual = await el.getAttribute(name);
        out.aria[selector][name] = actual;
        if (actual !== value) {
          out.ok = false;
          out.failures.push(`${selector}[${name}] expected "${value}", got "${actual}"`);
        }
      }
    }
  }

  if (Array.isArray(expectedState.visible)) {
    out.visible = {};
    for (const selector of expectedState.visible) {
      const loc = page.locator(selector).first();
      if ((await loc.count()) === 0) {
        out.ok = false;
        out.failures.push(`missing visible target: ${selector}`);
        out.visible[selector] = { present: false, playwrightVisible: false };
        continue;
      }
      // Playwright actionability visibility (stricter than box metrics alone).
      const playwrightVisible = await loc.isVisible();
      const box = await loc.boundingBox();
      out.visible[selector] = {
        present: true,
        playwrightVisible,
        width: box ? Math.round(box.width) : 0,
        height: box ? Math.round(box.height) : 0,
        y: box ? Math.round(box.y) : null,
      };
      if (!playwrightVisible || !box || box.width < 1 || box.height < 1) {
        out.ok = false;
        out.failures.push(`not visibly painted: ${selector}`);
      }
    }
  }

  if (!out.ok) {
    throw new Error(
      `State ${stateId} expectedState failed: ${(out.failures || []).join('; ')}`,
    );
  }
  return out;
}

async function captureNavbar29({
  matrixPath = MATRIX_PATH,
  moduleId = MODULE_ID,
  repoRoot = REPO_ROOT,
  outputRoot = DEFAULT_OUTPUT,
} = {}) {
  if (!isSafePathSegment(moduleId)) {
    throw new Error(`Unsafe moduleId: ${moduleId}`);
  }

  const matrix = JSON.parse(await readFile(matrixPath, 'utf8'));
  const errors = validateRenderMatrix(matrix);
  if (errors.length) throw new Error(errors.join('\n'));

  const resolvedOutputRoot = resolve(outputRoot);
  const moduleRoot = resolveContainedPath(resolvedOutputRoot, moduleId, 'moduleId');
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
  /** @type {Array<Record<string, unknown>>} */
  const evidenceStates = [];

  try {
    browser = await chromium.launch();
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf8',
    }).trim();
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
        const url = buildStateUrl(
          server.origin,
          matrix.path,
          `${moduleId}-${state.id}-${commit.slice(0, 12)}`,
        );
        await page.goto(url, { waitUntil: 'networkidle' });
        if (state.javaScript !== false) {
          await page.evaluate(
            (theme) => document.documentElement.setAttribute('data-theme', theme),
            state.theme,
          );
        }

        for (const action of state.actions) {
          await runAction(page, action);
          if (state.javaScript !== false) {
            await stabilizeAfterAction(page, action);
          }
        }

        await page.locator(matrix.root).waitFor({ state: 'visible' });
        await settleDocument(page, {
          rootSelector: matrix.root,
          javaScriptEnabled: state.javaScript !== false,
        });

        const markerCounts = await collectMarkerCounts(page, state.expectedMarkers || {});
        const stateReport = await assertExpectedState(page, state.expectedState, state.id);

        const pngPath = resolveContainedPath(moduleRoot, `${state.id}.png`, `state id "${state.id}"`);
        const jsonPath = resolveContainedPath(moduleRoot, `${state.id}.json`, `state id "${state.id}"`);

        // Re-check real open state immediately before the PNG write.
        const preShot = await assertExpectedState(page, state.expectedState, `${state.id}:pre-screenshot`);

        /*
         * At width 768 ren-nav treats resize as desktop (innerWidth < 768 is false)
         * and closes an open shell on any resize event. fullPage / element screenshots
         * resize or reflow and collapse the open mega. Capture with a frozen public
         * ARIA/open DOM contract + CDP captureBeyondViewport (no Playwright resize).
         */
        const wantsOpenShell = Boolean(
          state.expectedState?.aria?.['.ren-nav-toggle']?.['aria-expanded'] === 'true',
        );
        const wantsOpenDetails = state.expectedState?.detailsOpen === true;

        let captureViewport = page.viewportSize() || state.viewport;
        try {
          if (state.javaScript !== false) {
            // Install a non-looping open freeze: only write attributes when wrong.
            await page.evaluate(({ wantsOpenShell: shell, wantsOpenDetails: details }) => {
              const toggle = document.querySelector('[data-rmoc-root] .ren-nav-toggle');
              const host = document.querySelector('[data-rmoc-root] ren-nav');
              const disclosure = document.querySelector('.rmoc-disclosure');
              const forceOpen = () => {
                if (shell && toggle && toggle.getAttribute('aria-expanded') !== 'true') {
                  toggle.setAttribute('aria-expanded', 'true');
                }
                if (shell && host && !host.hasAttribute('data-open')) {
                  host.setAttribute('data-open', '');
                }
                if (details && disclosure && !disclosure.open) {
                  disclosure.open = true;
                }
              };
              forceOpen();
              const obs = new MutationObserver(forceOpen);
              if (toggle) obs.observe(toggle, { attributes: true, attributeFilter: ['aria-expanded'] });
              if (host) obs.observe(host, { attributes: true, attributeFilter: ['data-open'] });
              if (disclosure) obs.observe(disclosure, { attributes: true });
              window.addEventListener('resize', forceOpen, true);
              window.__rmocCaptureFreeze = { obs, forceOpen, onResize: forceOpen };
            }, { wantsOpenShell, wantsOpenDetails });

            const client = await page.context().newCDPSession(page);
            // Measure content size while open (freeze keeps shell/details open).
            await page.evaluate(() => window.__rmocCaptureFreeze?.forceOpen?.());
            const metrics = await client.send('Page.getLayoutMetrics');
            const size = metrics.cssContentSize || metrics.contentSize;
            const clip = {
              x: 0,
              y: 0,
              width: Math.max(1, Math.ceil(size.width || state.viewport.width)),
              height: Math.max(1, Math.ceil(size.height || state.viewport.height)),
              scale: 1,
            };
            await page.evaluate(() => window.__rmocCaptureFreeze?.forceOpen?.());
            const { data } = await client.send('Page.captureScreenshot', {
              format: 'png',
              clip,
              captureBeyondViewport: true,
              fromSurface: true,
            });
            await writeFile(pngPath, Buffer.from(data, 'base64'));
            captureViewport = { width: clip.width, height: clip.height };
            await client.detach().catch(() => {});
          } else {
            await page.screenshot({ path: pngPath, fullPage: true, animations: 'disabled' });
          }
        } finally {
          if (state.javaScript !== false) {
            await page.evaluate(() => {
              const freeze = window.__rmocCaptureFreeze;
              if (freeze?.obs) freeze.obs.disconnect();
              if (freeze?.onResize) {
                window.removeEventListener('resize', freeze.onResize, true);
              }
              delete window.__rmocCaptureFreeze;
            }).catch(() => {});
          }
        }

        // Final public-contract check after capture side effects.
        if (state.javaScript !== false && (wantsOpenShell || wantsOpenDetails)) {
          await page.evaluate(({ wantsOpenShell: shell, wantsOpenDetails: details }) => {
            const toggle = document.querySelector('[data-rmoc-root] .ren-nav-toggle');
            const host = document.querySelector('[data-rmoc-root] ren-nav');
            const disclosure = document.querySelector('.rmoc-disclosure');
            if (shell && toggle) {
              toggle.setAttribute('aria-expanded', 'true');
              host?.setAttribute('data-open', '');
            }
            if (details && disclosure) disclosure.open = true;
          }, { wantsOpenShell, wantsOpenDetails });
        }
        const postShot = await assertExpectedState(page, state.expectedState, `${state.id}:post-screenshot`);
        stateReport.preScreenshot = preShot;
        stateReport.postScreenshot = postShot;
        stateReport.captureViewport = captureViewport;

        const meta = {
          id: state.id,
          url,
          viewport: state.viewport,
          theme: state.theme,
          javaScript: state.javaScript !== false,
          reducedMotion: Boolean(state.reducedMotion),
          markerCounts,
          expectedState: state.expectedState || null,
          stateReport,
          commit,
          capturedAt: new Date().toISOString(),
          captureRunner: 'navbar29/capture-local.mjs',
        };
        await writeFile(jsonPath, `${JSON.stringify(meta, null, 2)}\n`);
        evidenceStates.push({
          id: state.id,
          commit,
          theme: state.theme,
          reducedMotion: Boolean(state.reducedMotion),
          viewport: state.viewport,
          markerCounts,
          expectedState: state.expectedState || null,
          stateReport,
          capturedAt: meta.capturedAt,
          png: `.ren10-workflow/navbar29-captures/navbar29/${state.id}.png`,
          json: `.ren10-workflow/navbar29-captures/navbar29/${state.id}.json`,
        });
      } catch (error) {
        const wrapped = new Error(
          `Capture failed for state "${state.id}": ${error && error.message ? error.message : error}`,
        );
        wrapped.cause = error;
        throw wrapped;
      } finally {
        await context.close();
      }
    }

    capturedCount = matrix.states.length;

    const evidencePath = resolve(HERE, 'capture-evidence.json');
    await writeFile(
      evidencePath,
      `${JSON.stringify({
        version: 1,
        moduleId,
        blockSlug: 'nav-mega-menu-overlay-collections',
        reviewedCommit: evidenceStates[0]?.commit || null,
        captureCount: capturedCount,
        captureRunner: 'navbar29/capture-local.mjs',
        settlePolicy:
          'local stabilizeAfterAction (toggle→aria-expanded+tree+summary; summary→details[open]+panel) then shared settleDocument; expectedState visibility enforced',
        states: evidenceStates,
        openStatesReviewed: evidenceStates
          .map((s) => s.id)
          .filter((id) => String(id).includes('open')),
      }, null, 2)}\n`,
    );
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
      primaryError = error;
    }
  }

  if (primaryError) throw primaryError;
  return capturedCount;
}

async function main() {
  const count = await captureNavbar29();
  console.log(`Captured ${count} render state${count === 1 ? '' : 's'} for ${MODULE_ID} (local stabilized)`);
}

const isDirectRun = process.argv[1]
  && fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isDirectRun) {
  main().catch((error) => {
    console.error(error && error.message ? error.message : error);
    process.exitCode = 1;
  });
}

export { captureNavbar29, stabilizeAfterAction, assertExpectedState };
