// @ts-check
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');
const { expectNoOverflow } = require('../utils/block-quality.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK_PATH = '/templates/blocks/hero-split-copy-dual-cta-media.html';
const ROOT = '[data-rh1-root]';

async function gotoHeader1(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response?.status(), 'Header1 block must exist').toBe(200);
  await expect(page.locator(ROOT)).toHaveCount(1);
}

test.describe('Header1 — split copy, dual CTA, media', () => {
  let staticServer;

  test.beforeAll(async () => {
    staticServer = await startStaticServer(PKG_ROOT);
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('preserves the complete source-derived anatomy', async ({ page }) => {
    await gotoHeader1(page, staticServer.origin);

    await expect(page.locator(`${ROOT} h1`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh1-description`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh1-actions > .ren-btn`)).toHaveCount(2);
    await expect(page.locator(`${ROOT} .rh1-actions > .ren-btn:not(.ren-btn-secondary)`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh1-actions > .ren-btn-secondary`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh1-media img`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh1-media img`)).toHaveAttribute('alt', /workspace/i);
  });

  test('stacks on mobile and becomes an equal split at large widths', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHeader1(page, staticServer.origin);

    const mobile = await page.locator(`${ROOT} .rh1-layout`).evaluate((layout) => {
      const [copy, media] = Array.from(layout.children);
      const copyRect = copy.getBoundingClientRect();
      const mediaRect = media.getBoundingClientRect();
      return { copyBottom: copyRect.bottom, mediaTop: mediaRect.top };
    });
    expect(mobile.mediaTop).toBeGreaterThanOrEqual(mobile.copyBottom);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 1280, height: 900 });
    const desktop = await page.locator(`${ROOT} .rh1-layout`).evaluate((layout) => {
      const [copy, media] = Array.from(layout.children);
      const copyRect = copy.getBoundingClientRect();
      const mediaRect = media.getBoundingClientRect();
      return {
        widthRatio: copyRect.width / mediaRect.width,
        centerDelta: Math.abs(
          copyRect.top + copyRect.height / 2 - (mediaRect.top + mediaRect.height / 2)
        ),
      };
    });
    expect(desktop.widthRatio).toBeGreaterThanOrEqual(0.95);
    expect(desktop.widthRatio).toBeLessThanOrEqual(1.05);
    expect(desktop.centerDelta).toBeLessThanOrEqual(2);
    await expectNoOverflow(page, 'html');
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoHeader1(page, staticServer.origin);
      await expectNoOverflow(page, 'html');
    });
  }

  test('CTA targets remain at least 44px tall and visibly focusable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHeader1(page, staticServer.origin);

    const heights = await page.locator(`${ROOT} .rh1-actions > .ren-btn`).evaluateAll((links) =>
      links.map((link) => link.getBoundingClientRect().height)
    );
    expect(heights.every((height) => height >= 44), JSON.stringify(heights)).toBe(true);

    const first = page.locator(`${ROOT} .rh1-actions > .ren-btn`).first();
    await first.focus();
    const outline = await first.evaluate((link) => getComputedStyle(link).outlineStyle);
    expect(outline).not.toBe('none');
  });

  test('uses theme tokens in light and dark modes', async ({ page }) => {
    await gotoHeader1(page, staticServer.origin);

    const paints = [];
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      paints.push(await page.locator(ROOT).evaluate((root) => ({
        color: getComputedStyle(root).color,
        background: getComputedStyle(root).backgroundColor,
      })));
    }
    expect(paints[0].color).not.toBe(paints[1].color);
    expect(paints[0].background).not.toBe(paints[1].background);
  });

  test('remains complete with JavaScript disabled', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await gotoHeader1(page, staticServer.origin);
    await expect(page.locator(`${ROOT} h1`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rh1-actions > .ren-btn`)).toHaveCount(2);
    await expect(page.locator(`${ROOT} .rh1-media img`)).toBeVisible();
    await context.close();
  });

  test('has no block-local motion under reduced-motion preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoHeader1(page, staticServer.origin);
    const motion = await page.locator(`${ROOT} .ren-btn`).first().evaluate((link) => {
      const style = getComputedStyle(link);
      return { transitionDuration: style.transitionDuration, animationName: style.animationName };
    });
    expect(motion.transitionDuration.split(',').every((value) => ['0s', '0ms'].includes(value.trim()))).toBe(true);
    expect(motion.animationName).toBe('none');
  });

  test('passes WCAG 2.1 AA axe checks', async ({ page }) => {
    await gotoHeader1(page, staticServer.origin);
    await injectAxe(page);
    await checkA11y(page, ROOT, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
  });
});
