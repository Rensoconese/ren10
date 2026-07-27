// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-centered-copy-dual-cta-landscape-image.html';
const SOURCE = path.join(PKG_ROOT, BLOCK);
const ROOT = '[data-rh26-root]';

test.describe('Relume Header 26 translated to Ren10', () => {
  let server;
  test.beforeAll(async () => { server = await startStaticServer(PKG_ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page, width = 1280, height = 1000) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header26`);
    expect(response?.status(), 'Header26 block must exist').toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns the exact centered dual-CTA landscape-image anatomy', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);
    await expect(root).toHaveClass(/rh26-hero/);
    await expect(root.locator('.rh26-container.ren-center.ren-stack, .rh26-content.ren-center.ren-stack, h1.rh26-heading, p.rh26-description, .rh26-actions.ren-cluster, .rh26-media.ren-frame.ren-frame-video, img.rh26-image')).toHaveCount(7);
    await expect(root.locator('.rh26-actions > a.ren-btn[href]')).toHaveCount(2);
    await expect(root.locator('img')).toHaveCount(1);
    await expect(root.locator('form, input, textarea, select, button, picture, figure, video, iframe, dialog, ren-dialog, nav, header, svg, [class*="legal"], [class*="logo"], [class*="overlay"], [class*="scrim"]')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh26-heading');
  });

  test('preserves copy-actions-image order at every viewport', async ({ page }) => {
    for (const width of [320, 390, 768, 1280]) {
      await gotoBlock(page, width, width < 640 ? 800 : 1000);
      const order = await page.locator(ROOT).evaluate((root) => {
        const copy = root.querySelector('.rh26-content');
        const actions = root.querySelector('.rh26-actions');
        const media = root.querySelector('.rh26-media');
        return {
          actionsInsideCopy: copy.contains(actions),
          copyBeforeMedia: Boolean(copy.compareDocumentPosition(media) & Node.DOCUMENT_POSITION_FOLLOWING),
          mediaBelowCopy: media.getBoundingClientRect().top >= copy.getBoundingClientRect().bottom,
        };
      });
      expect(order).toEqual({ actionsInsideCopy: true, copyBeforeMedia: true, mediaBelowCopy: true });
    }
  });

  for (const width of [320, 390, 640, 768, 1024, 1280, 1440]) {
    test(`stays centered, content-height, media-contained, and overflow-free at ${width}px`, async ({ page }) => {
      await gotoBlock(page, width, width < 640 ? 800 : 1000);
      const state = await page.locator(ROOT).evaluate((root) => {
        const container = root.querySelector('.rh26-container').getBoundingClientRect();
        const media = root.querySelector('.rh26-media').getBoundingClientRect();
        return {
          minHeight: getComputedStyle(root).minHeight,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          centerDelta: Math.abs(container.left + container.width / 2 - innerWidth / 2),
          mediaContained: media.width <= container.width + 1,
          mediaCenterDelta: Math.abs(
            media.left + media.width / 2 - (container.left + container.width / 2)
          ),
          inside: container.left >= 0 && container.right <= innerWidth + 1,
        };
      });
      expect(state.minHeight).toBe('0px');
      expect(state.overflow).toBeLessThanOrEqual(1);
      expect(state.centerDelta).toBeLessThanOrEqual(2);
      expect(state.mediaContained).toBe(true);
      expect(state.mediaCenterDelta).toBeLessThanOrEqual(2);
      expect(state.inside).toBe(true);
    });
  }

  test('wraps two distinct touch-safe CTA anchors at 320px', async ({ page }) => {
    await gotoBlock(page, 320, 800);
    const actions = page.locator(`${ROOT} .rh26-actions`);
    expect(await actions.evaluate((node) => getComputedStyle(node).flexWrap)).toBe('wrap');
    const links = actions.locator('a');
    const boxes = await links.evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
    expect(boxes).toHaveLength(2);
    expect(boxes[1].y).toBeGreaterThanOrEqual(boxes[0].y);
    for (const box of boxes) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.right).toBeLessThanOrEqual(320);
    }
    await expect(links).toHaveText(['Start building', 'Explore components']);
  });

  test('uses two distinct resolvable local CTA destinations', async ({ page, request }) => {
    await gotoBlock(page);
    const hrefs = await page.locator(`${ROOT} .rh26-actions a`).evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
    expect(new Set(hrefs).size).toBe(2);
    for (const href of hrefs) {
      expect(href).not.toMatch(/^#|javascript:|https?:/);
      expect((await request.get(new URL(href, `${server.origin}${BLOCK}`).href)).ok()).toBe(true);
    }
  });

  test('owns a truthful intrinsic 16:9 image asset', async ({ page }) => {
    await gotoBlock(page);
    const image = page.locator(`${ROOT} .rh26-image`);
    await expect(image).toHaveAttribute('src', /^media\/hero-[a-z0-9-]+\.(?:png|webp)$/);
    await expect(image).toHaveAttribute('width', /^\d+$/);
    await expect(image).toHaveAttribute('height', /^\d+$/);
    await expect(image).toHaveAttribute('alt', /\S+/);
    const state = await image.evaluate((node) => ({
      complete: node.complete,
      naturalWidth: node.naturalWidth,
      naturalHeight: node.naturalHeight,
      ratio: node.parentElement.getBoundingClientRect().width / node.parentElement.getBoundingClientRect().height,
      objectFit: getComputedStyle(node).objectFit,
    }));
    expect(state.complete).toBe(true);
    expect(state.naturalWidth).toBe(Number(await image.getAttribute('width')));
    expect(state.naturalHeight).toBe(Number(await image.getAttribute('height')));
    expect(state.ratio).toBeCloseTo(16 / 9, 2);
    expect(state.objectFit).toBe('cover');
  });

  test('keeps keyboard order and visible focus in light and dark', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    const links = page.locator(`${ROOT} .rh26-actions a`);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      await page.locator('.bb-detail-header .ren-breadcrumb a[href="index.html"]').focus();
      for (let index = 0; index < 2; index += 1) {
        await page.keyboard.press('Tab');
        await expect(links.nth(index)).toBeFocused();
        expect(await links.nth(index).evaluate((node) => {
          const style = getComputedStyle(node);
          return style.outlineStyle !== 'none' || style.boxShadow !== 'none';
        })).toBe(true);
      }
    }
  });

  test('keeps both destinations and image available without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    expect((await page.goto(`${server.origin}${BLOCK}?ren10_test=nojs`))?.status()).toBe(200);
    await expect(page.locator(`${ROOT} .rh26-actions a[href]`)).toHaveCount(2);
    await expect(page.locator(`${ROOT} img[alt]`)).toBeVisible();
    await context.close();
  });

  test('collapses CTA motion under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);
    const durations = await page.locator(`${ROOT} .rh26-actions a`).evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).transitionDuration));
    expect(durations.every((duration) => duration.split(',').every((value) => ['0s', '0ms'].includes(value.trim())))).toBe(true);
  });

  test('passes axe WCAG 2.1 AA in light and dark', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    await injectAxe(page);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      await checkA11y(page, ROOT, { detailedReport: true, detailedReportOptions: { html: true } });
    }
  });

  test('uses documented Ren10 primitives without scripts or policy leakage', async ({ page }) => {
    await gotoBlock(page);
    const source = fs.readFileSync(SOURCE, 'utf8');
    await expect(page.locator('script')).toHaveCount(0);
    for (const primitive of ['ren-center', 'ren-stack', 'ren-cluster', 'ren-frame', 'ren-btn']) expect(source).toContain(primitive);
    expect(source).not.toMatch(/React|Vue|Svelte|Tailwind|@relume|attachShadow|display\s*:\s*(?:flex|grid)|#[0-9a-f]{3,8}|rgba?\(|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
  });
});
