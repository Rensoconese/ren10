// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');
const { expectNoOverflow } = require('../utils/block-quality.cjs');
const { readFileSync } = require('node:fs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-text-left-video-lightbox.html';
const ROOT = '[data-rh3-root]';

/** @param {import('@playwright/test').Page} page @param {string} origin @param {number} width */
async function gotoBlock(page, origin, width = 1280) {
  await page.setViewportSize({ width, height: width < 800 ? 900 : 820 });
  const response = await page.goto(`${origin}${BLOCK}`);
  expect(response?.ok(), 'Header3 block must load').toBe(true);
  await expect(page.locator(ROOT)).toBeVisible();
}

/** @param {import('@playwright/test').Page} page */
async function openVideo(page) {
  const trigger = page.locator('.rh3-media-trigger');
  await trigger.click();
  await expect(page.locator('#rh3-video')).toHaveAttribute('open', '');
  await expect(page.locator('#rh3-video dialog')).toBeVisible();
}

test.describe('Header 3 — split copy and video lightbox', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  test.beforeAll(async () => {
    staticServer = await startStaticServer(PKG_ROOT);
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('preserves the exact source anatomy without invented navigation', async ({ page }) => {
    await gotoBlock(page, staticServer.origin);

    await expect(page.locator(`${ROOT} header.rh3-hero[aria-labelledby="rh3-heading"]`)).toHaveCount(1);
    await expect(page.locator('#rh3-heading')).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh3-lede`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh3-actions .ren-btn`)).toHaveCount(2);
    await expect(page.locator(`${ROOT} .rh3-media-trigger`)).toHaveCount(1);
    await expect(page.locator('#rh3-video')).toHaveCount(1);
    await expect(page.locator('#rh3-video iframe[title]')).toHaveCount(1);
    await expect(page.locator('#rh3-video [role="status"]')).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav, ${ROOT} details, ${ROOT} summary, ${ROOT} .ren-nav`)).toHaveCount(0);
  });

  test('opens a modal, exposes busy loading, and resolves the iframe surface', async ({ page }) => {
    await gotoBlock(page, staticServer.origin);
    const trigger = page.locator('.rh3-media-trigger');
    await expect(trigger).toHaveAttribute('aria-label', /play|watch|video/i);
    await expect(trigger).toHaveAttribute('href', /.+/);

    await openVideo(page);
    await expect(page.locator('#rh3-video dialog')).toHaveAttribute('aria-busy', /true|false/);
    await expect(page.locator('#rh3-video iframe')).toHaveAttribute('srcdoc', /Ren10/i);
    await expect(page.locator('#rh3-video dialog')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('#rh3-video .rh3-video-loading')).toBeHidden();
    await expect(page.locator('#rh3-video iframe')).toBeVisible();
    const embeddedMedia = page.frameLocator('#rh3-video iframe');
    await expect(embeddedMedia.locator('video[controls]')).toHaveCount(1);
    await expect(embeddedMedia.locator('video source')).toHaveCount(2);
  });

  test('uses real verified Ren10 destinations for both CTAs', async ({ page }) => {
    await gotoBlock(page, staticServer.origin);
    const hrefs = await page.locator(`${ROOT} .rh3-actions .ren-btn`).evaluateAll((links) =>
      links.map((link) => link.getAttribute('href'))
    );
    expect(hrefs).toEqual([
      '../../docs/getting-started.html',
      '../../docs/components.html',
    ]);

    for (const href of hrefs) {
      const destination = new URL(href, page.url());
      const response = await page.request.get(destination.href);
      expect(response.ok(), `${destination.pathname} must be a real destination`).toBe(true);
    }
  });

  test('Escape and close control dismiss and restore focus to the sole opener', async ({ page }) => {
    await gotoBlock(page, staticServer.origin);
    const trigger = page.locator('.rh3-media-trigger');

    await openVideo(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('#rh3-video')).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();

    await openVideo(page);
    const close = page.locator('#rh3-video [data-dialog-close]');
    await expect(close).toHaveCount(1);
    await expect(close).toHaveAttribute('aria-label', /close/i);
    await close.click();
    await expect(page.locator('#rh3-video')).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
  });

  test('backdrop dismisses and stops the embedded surface', async ({ page }) => {
    await gotoBlock(page, staticServer.origin);
    await openVideo(page);
    await page.mouse.click(4, 4);
    await expect(page.locator('#rh3-video')).not.toHaveAttribute('open', '');
    await expect(page.locator('#rh3-video iframe')).not.toHaveAttribute('srcdoc', /Ren10/i);
  });

  test('stacks when narrow and becomes two equal columns on large screens', async ({ page }) => {
    await gotoBlock(page, staticServer.origin, 390);
    const narrow = await page.locator('.rh3-layout').evaluate((layout) => {
      const copy = layout.querySelector('.rh3-copy').getBoundingClientRect();
      const media = layout.querySelector('.rh3-media').getBoundingClientRect();
      return { copyBottom: copy.bottom, mediaTop: media.top };
    });
    expect(narrow.mediaTop).toBeGreaterThanOrEqual(narrow.copyBottom - 1);

    await gotoBlock(page, staticServer.origin, 1280);
    const wide = await page.locator('.rh3-layout').evaluate((layout) => {
      const copy = layout.querySelector('.rh3-copy').getBoundingClientRect();
      const media = layout.querySelector('.rh3-media').getBoundingClientRect();
      return {
        copyTop: copy.top,
        mediaTop: media.top,
        copyWidth: copy.width,
        mediaWidth: media.width,
      };
    });
    expect(Math.abs(wide.copyTop - wide.mediaTop)).toBeLessThanOrEqual(80);
    expect(Math.abs(wide.copyWidth - wide.mediaWidth)).toBeLessThanOrEqual(2);
  });

  test('has no horizontal overflow at required responsive seams', async ({ page }) => {
    for (const width of [320, 390, 767, 768, 1280]) {
      await gotoBlock(page, staticServer.origin, width);
      await expectNoOverflow(page, 'html');
      await expectNoOverflow(page, ROOT);
    }
  });

  test('all visible interactive targets remain at least 44px', async ({ page }) => {
    await gotoBlock(page, staticServer.origin, 320);
    for (const selector of ['.rh3-actions .ren-btn', '.rh3-media-trigger']) {
      const boxes = await page.locator(selector).evaluateAll((nodes) => nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      }));
      for (const box of boxes) {
        expect(box.width, selector).toBeGreaterThanOrEqual(44);
        expect(box.height, selector).toBeGreaterThanOrEqual(44);
      }
    }
    await openVideo(page);
    const closeBox = await page.locator('#rh3-video [data-dialog-close]').boundingBox();
    expect(closeBox?.width).toBeGreaterThanOrEqual(44);
    expect(closeBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('remains usable without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const response = await page.goto(`${staticServer.origin}${BLOCK}`);
    expect(response?.ok()).toBe(true);
    await expect(page.locator('#rh3-heading')).toBeVisible();
    await expect(page.locator(`${ROOT} .rh3-lede`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rh3-actions .ren-btn`)).toHaveCount(2);
    await expect(page.locator('.rh3-media-trigger[href]')).toBeVisible();
    await expect(page.locator('.rh3-media-trigger')).not.toHaveAttribute('aria-disabled', 'true');
    await page.locator('.rh3-media-trigger').click();
    await expect(page).toHaveURL(/#rh3-video-fallback$/);
    const fallbackVideo = page.locator('video#rh3-video-fallback[controls]');
    await expect(fallbackVideo).toBeVisible();
    await expect(fallbackVideo.locator('source')).toHaveCount(2);
    await context.close();
  });

  test('routes threshold, typography, and touch sizing through Ren10 tokens', async () => {
    const source = readFileSync(path.join(PKG_ROOT, 'templates/blocks/hero-text-left-video-lightbox.html'), 'utf8');
    expect(source).toContain('--switcher-threshold: var(--width-3xl)');
    expect(source).toContain('line-height: var(--leading-tight)');
    expect(source).toContain('line-height: var(--leading-relaxed)');
    expect(source).toContain('min-height: var(--touch-min)');
    expect(source).not.toMatch(/(?:width|height|min-width|min-height|flex):[^;]*44px/);
    expect(source).not.toMatch(/--switcher-threshold:\s*48rem/);
    expect(source).not.toMatch(/line-height:\s*(?:1\.08|1\.65)/);
  });

  test('passes axe in closed/open light and dark reduced-motion states', async ({ page }) => {
    for (const theme of ['light', 'dark']) {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await gotoBlock(page, staticServer.origin, 390);
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      await injectAxe(page);
      await checkA11y(page, ROOT, { detailedReport: true, detailedReportOptions: { html: true } });
      await openVideo(page);
      await checkA11y(page, '#rh3-video dialog', { detailedReport: true, detailedReportOptions: { html: true } });
      await page.keyboard.press('Escape');
    }
  });
});
