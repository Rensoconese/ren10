// @ts-check
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');
const { expectNoOverflow } = require('../utils/block-quality.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK_PATH = '/templates/blocks/hero-split-email-video-lightbox.html';
const ROOT = '[data-rh4-root]';

async function gotoHeader4(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response?.status(), 'Header4 block must exist').toBe(200);
  await expect(page.locator(ROOT)).toHaveCount(1);
}

test.describe('Header4 — email form and video lightbox', () => {
  let staticServer;

  test.beforeAll(async () => {
    staticServer = await startStaticServer(PKG_ROOT);
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('preserves the exact source-derived anatomy', async ({ page }) => {
    await gotoHeader4(page, staticServer.origin);
    await expect(page.locator(`${ROOT} h1.rh4-title`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh4-lede`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} form.rh4-form`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} input[type="email"]`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} button[type="submit"].rh4-cta`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh4-terms a.ren-link`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh4-media-trigger`)).toHaveCount(1);
    await expect(page.locator('ren-dialog#rh4-video')).toHaveCount(1);
    await expect(page.locator('#rh4-video .ren-spinner')).toHaveCount(1);
    await expect(page.locator('#rh4-video iframe')).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-btn`)).toHaveCount(1);
  });

  test('stacks at mobile and becomes an equal vertically centered split on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHeader4(page, staticServer.origin);
    const mobile = await page.locator(`${ROOT} .rh4-layout`).evaluate((layout) => {
      const [copy, media] = Array.from(layout.children);
      const a = copy.getBoundingClientRect();
      const b = media.getBoundingClientRect();
      return { copyBottom: a.bottom, mediaTop: b.top };
    });
    expect(mobile.mediaTop).toBeGreaterThanOrEqual(mobile.copyBottom);

    await page.setViewportSize({ width: 1280, height: 900 });
    const desktop = await page.locator(`${ROOT} .rh4-layout`).evaluate((layout) => {
      const [copy, media] = Array.from(layout.children);
      const a = copy.getBoundingClientRect();
      const b = media.getBoundingClientRect();
      return {
        ratio: a.width / b.width,
        centerDelta: Math.abs(a.top + a.height / 2 - (b.top + b.height / 2)),
      };
    });
    expect(desktop.ratio).toBeGreaterThanOrEqual(0.95);
    expect(desktop.ratio).toBeLessThanOrEqual(1.05);
    expect(desktop.centerDelta).toBeLessThanOrEqual(2);
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`does not overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoHeader4(page, staticServer.origin);
      await expectNoOverflow(page, 'html');
    });
  }

  test('submits the one-field demo form without navigation', async ({ page }) => {
    await gotoHeader4(page, staticServer.origin);
    await page.locator(`${ROOT} input[type="email"]`).fill('team@example.com');
    const before = page.url();
    await page.locator(`${ROOT} .rh4-cta`).click();
    await expect(page.locator(`${ROOT} .rh4-form`)).toHaveAttribute('data-demo-submitted', 'true');
    expect(page.url()).toBe(before);
  });

  test('opens busy, reveals the video on load, and Escape restores trigger focus', async ({ page }) => {
    await gotoHeader4(page, staticServer.origin);
    const trigger = page.locator(`${ROOT} .rh4-media-trigger`);
    await trigger.focus();
    await trigger.click();

    const dialog = page.locator('#rh4-video dialog');
    await expect(dialog).toHaveAttribute('open', '');
    await expect(page.locator('#rh4-video .rh4-video-stage')).toHaveAttribute('aria-busy', /true|false/);
    await expect(page.locator('#rh4-video iframe')).toBeVisible();
    await expect(page.locator('#rh4-video .rh4-video-stage')).toHaveAttribute('aria-busy', 'false');

    await page.keyboard.press('Escape');
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
    await expect(page.locator('#rh4-video iframe')).not.toHaveAttribute('src');
  });

  test('backdrop and close affordance dismiss the lightbox', async ({ page }) => {
    await gotoHeader4(page, staticServer.origin);
    const trigger = page.locator(`${ROOT} .rh4-media-trigger`);
    const dialog = page.locator('#rh4-video dialog');

    await trigger.click();
    await expect(dialog).toHaveAttribute('open', '');
    await page.mouse.click(2, 2);
    await expect(dialog).not.toHaveAttribute('open', '');

    await trigger.click();
    await page.locator('#rh4-video [data-dialog-close]').click();
    await expect(dialog).not.toHaveAttribute('open', '');
  });

  test('interactive targets are at least 44px and focus-visible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoHeader4(page, staticServer.origin);
    const targets = page.locator(`${ROOT} input, ${ROOT} button, ${ROOT} a`);
    const sizes = await targets.evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { width: rect.width, height: rect.height, text: element.textContent?.trim() };
    }));
    expect(sizes.every(({ width, height }) => width >= 44 && height >= 44), JSON.stringify(sizes)).toBe(true);

    const trigger = page.locator(`${ROOT} .rh4-media-trigger`);
    await trigger.focus();
    expect(await trigger.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
  });

  test('light/dark, reduced motion, and JavaScript-disabled states remain coherent', async ({ page, browser }) => {
    await gotoHeader4(page, staticServer.origin);
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

    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const noJs = await context.newPage();
    await gotoHeader4(noJs, staticServer.origin);
    await expect(noJs.locator(`${ROOT} h1`)).toBeVisible();
    await expect(noJs.locator(`${ROOT} input[type="email"]`)).toBeVisible();
    await expect(noJs.locator(`${ROOT} .rh4-media-trigger`)).toBeVisible();
    await context.close();
  });

  test('reduced motion removes block and dialog transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoHeader4(page, staticServer.origin);
    await page.locator(`${ROOT} .rh4-media-trigger`).click();
    const durations = await page.locator('#rh4-video dialog').evaluate((element) => getComputedStyle(element).transitionDuration);
    expect(durations.split(',').every((value) => ['0s', '0ms'].includes(value.trim()))).toBe(true);
  });

  test('closed and open states pass WCAG 2.1 AA axe checks', async ({ page }) => {
    await gotoHeader4(page, staticServer.origin);
    await injectAxe(page);
    await checkA11y(page, ROOT, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });

    await page.locator(`${ROOT} .rh4-media-trigger`).click();
    await checkA11y(page, '#rh4-video dialog', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
  });
});
