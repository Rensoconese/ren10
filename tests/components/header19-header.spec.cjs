// @ts-check
const path = require('node:path');
const fs = require('node:fs');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-split-image-left-copy-dual-cta.html';
const ROOT = '[data-rh19-root]';

test.describe('Relume Header 19 translated to Ren10', () => {
  let server;
  test.beforeAll(async () => { server = await startStaticServer(PKG_ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header19`);
    expect(response?.status(), 'Header19 block must exist').toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns the exact source-derived anatomy without extras', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);
    await expect(root.locator('section.rh19-hero')).toHaveCount(1);
    await expect(root.locator('.rh19-container')).toHaveCount(1);
    await expect(root.locator('h1.rh19-heading')).toHaveCount(1);
    await expect(root.locator('p.rh19-description')).toHaveCount(1);
    await expect(root.locator('.rh19-actions')).toHaveCount(1);
    await expect(root.locator('.rh19-actions a.ren-btn[href]')).toHaveCount(2);
    await expect(root.locator('.rh19-media img')).toHaveCount(1);
    await expect(root.locator('form, nav, [class*="logo"], [class*="brand"], video, iframe, dialog, [class*="overlay"], [class*="scrim"]')).toHaveCount(0);
    await expect(root.locator('a.ren-btn')).toHaveCount(2);
  });

  for (const width of [320, 390, 767, 1023, 1024, 1280]) {
    test(`remains content-height and overflow-free at ${width}px`, async ({ page }) => {
      await gotoBlock(page, width, width < 1024 ? 844 : 900);
      const geometry = await page.locator(ROOT).evaluate((root) => {
        const section = root.querySelector('.rh19-hero').getBoundingClientRect();
        const layout = root.querySelector('.rh19-layout').getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          sectionBottom: Math.round(section.bottom),
          layoutBottom: Math.round(layout.bottom),
          minHeight: getComputedStyle(root.querySelector('.rh19-hero')).minHeight,
        };
      });
      expect(geometry.overflow).toBeLessThanOrEqual(0);
      expect(Math.abs(geometry.sectionBottom - geometry.layoutBottom)).toBeLessThan(100);
      expect(geometry.minHeight).not.toMatch(/vh|svh|dvh/);
    });
  }

  test('keeps copy before image through 767px and image left from 768px', async ({ page }) => {
    await gotoBlock(page, 767, 900);
    let boxes = await page.locator(`${ROOT} .rh19-copy, ${ROOT} .rh19-media`).evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
    expect(boxes[1].y).toBeGreaterThan(boxes[0].bottom);
    expect(Math.abs(boxes[0].x - boxes[1].x)).toBeLessThan(2);
    await gotoBlock(page, 768, 900);
    boxes = await page.locator(`${ROOT} .rh19-copy, ${ROOT} .rh19-media`).evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
    expect(boxes[1].right).toBeLessThan(boxes[0].x);
    expect(Math.abs((boxes[0].y + boxes[0].height / 2) - (boxes[1].y + boxes[1].height / 2))).toBeLessThan(4);
    expect(Math.abs(boxes[0].width - boxes[1].width)).toBeLessThan(4);
  });

  test('keeps both CTAs wrapping, distinct, resolvable, and touch-safe', async ({ page, request }) => {
    await gotoBlock(page, 320, 720);
    const actions = page.locator(`${ROOT} .rh19-actions`);
    expect(await actions.evaluate((node) => getComputedStyle(node).flexWrap)).toBe('wrap');
    const links = actions.locator('a');
    const hrefs = await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
    expect(new Set(hrefs).size).toBe(2);
    for (let index = 0; index < 2; index += 1) {
      const link = links.nth(index); const box = await link.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
      expect((await request.get(new URL(hrefs[index], `${server.origin}${BLOCK}`).href)).ok()).toBe(true);
    }
  });

  test('owns one meaningful intrinsically sized rounded cover image', async ({ page }) => {
    await gotoBlock(page);
    const image = page.locator(`${ROOT} .rh19-media img`);
    await expect(image).toHaveAttribute('src', /^media\/hero-[a-z0-9-]+\.png$/);
    await expect(image).toHaveAttribute('alt', /\S+/);
    await expect(image).toHaveAttribute('width', /^\d+$/);
    await expect(image).toHaveAttribute('height', /^\d+$/);
    const visual = await image.evaluate((node) => ({ fit: getComputedStyle(node).objectFit, radius: getComputedStyle(node.parentElement).borderRadius }));
    expect(visual.fit).toBe('cover'); expect(visual.radius).not.toBe('0px');
  });

  test('preserves copy, destinations, and image without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${server.origin}${BLOCK}?ren10_test=nojs`);
    await expect(page.locator(`${ROOT} h1`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rh19-actions a[href]`)).toHaveCount(2);
    await expect(page.locator(`${ROOT} .rh19-media img`)).toBeVisible();
    await context.close();
  });

  test('shows keyboard focus and reduced-motion-safe states', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }); await gotoBlock(page, 390, 844);
    const links = page.locator(`${ROOT} .rh19-actions a`);
    await page.locator('.bb-detail-header .ren-breadcrumb a[href="index.html"]').focus();
    for (let index = 0; index < 2; index += 1) {
      const link = links.nth(index); await page.keyboard.press('Tab'); await expect(link).toBeFocused();
      expect(await link.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
      const duration = await link.evaluate((node) => getComputedStyle(node).transitionDuration);
      expect(duration.split(',').every((value) => ['0s', '0ms'].includes(value.trim()))).toBe(true);
    }
  });

  test('passes axe AA in light and dark', async ({ page }) => {
    await gotoBlock(page); await injectAxe(page); await checkA11y(page, ROOT, { detailedReport: true, detailedReportOptions: { html: true } });
  });

  test('requires no script and contains no Ren10 policy leakage', async ({ page }) => {
    await gotoBlock(page);
    const source = fs.readFileSync(path.join(PKG_ROOT, BLOCK), 'utf8');
    await expect(page.locator('script')).toHaveCount(0);
    expect(source).not.toMatch(/React|Tailwind|attachShadow|display\s*:\s*(flex|grid)|#[0-9a-f]{3,8}|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
  });
});
