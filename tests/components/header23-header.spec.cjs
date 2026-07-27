// @ts-check
const path = require('node:path');
const fs = require('node:fs');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-centered-copy-dual-cta.html';
const ROOT = '[data-rh23-root]';

test.describe('Relume Header 23 translated to Ren10', () => {
  let server;
  test.beforeAll(async () => { server = await startStaticServer(PKG_ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header23`);
    expect(response?.status(), 'Header23 block must exist').toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns exactly one centered copy hero with two CTA anchors and no extras', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);
    await expect(root.locator('section.rh23-hero')).toHaveCount(1);
    await expect(root.locator('.rh23-content.ren-center.ren-stack')).toHaveCount(1);
    await expect(root.locator('h1.rh23-heading')).toHaveCount(1);
    await expect(root.locator('p.rh23-description')).toHaveCount(1);
    await expect(root.locator('.rh23-actions.ren-cluster')).toHaveCount(1);
    await expect(root.locator('.rh23-actions > a.ren-btn[href]')).toHaveCount(2);
    await expect(root.locator('form, input, textarea, select, img, picture, figure, video, iframe, dialog, nav, header, svg, [class*="logo"], [class*="brand"], [class*="overlay"], [class*="scrim"]')).toHaveCount(0);
    await expect(root.locator('a')).toHaveCount(2);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh23-heading');
  });

  test('keeps original Ren10 copy and CTA hierarchy', async ({ page }) => {
    await gotoBlock(page);
    await expect(page.locator(`${ROOT} h1`)).toHaveText('Build calmer interfaces without losing momentum');
    await expect(page.locator(`${ROOT} .rh23-description`)).toHaveText('Give every team a shared, accessible foundation for turning product decisions into clear and consistent experiences.');
    await expect(page.locator(`${ROOT} .rh23-actions a`)).toHaveText(['Start with Ren10', 'Explore components']);
  });

  for (const width of [320, 390, 639, 640, 767, 768, 1023, 1024, 1280]) {
    test(`stays centered, content-height, and overflow-free at ${width}px`, async ({ page }) => {
      await gotoBlock(page, width, width <= 390 ? 720 : 800);
      const geometry = await page.locator(ROOT).evaluate((root) => {
        const section = root.querySelector('.rh23-hero');
        const content = root.querySelector('.rh23-content');
        const sectionBox = section.getBoundingClientRect();
        const contentBox = content.getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          centerDelta: Math.abs((contentBox.left + contentBox.width / 2) - innerWidth / 2),
          contentWidth: contentBox.width,
          sectionBottomGap: Math.abs(sectionBox.bottom - contentBox.bottom),
          minHeight: getComputedStyle(section).minHeight,
          textAlign: getComputedStyle(content).textAlign,
        };
      });
      expect(geometry.overflow).toBeLessThanOrEqual(0);
      expect(geometry.centerDelta).toBeLessThan(2);
      expect(geometry.contentWidth).toBeLessThanOrEqual(width);
      expect(geometry.sectionBottomGap).toBeLessThan(130);
      expect(geometry.minHeight).not.toMatch(/vh|svh|dvh/);
      expect(geometry.textAlign).toBe('center');
    });
  }

  test('wraps both intrinsic CTAs safely on narrow mobile', async ({ page }) => {
    await gotoBlock(page, 320, 720);
    const actions = page.locator(`${ROOT} .rh23-actions`);
    const style = await actions.evaluate((node) => ({ wrap: getComputedStyle(node).flexWrap, justify: getComputedStyle(node).justifyContent }));
    expect(style.wrap).toBe('wrap');
    expect(style.justify).toBe('center');
    const boxes = await actions.locator('a').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
    expect(boxes[1].y).toBeGreaterThanOrEqual(boxes[0].y);
    for (const box of boxes) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('uses two distinct real resolvable destinations', async ({ page, request }) => {
    await gotoBlock(page);
    const hrefs = await page.locator(`${ROOT} .rh23-actions a`).evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
    expect(new Set(hrefs).size).toBe(2);
    for (const href of hrefs) {
      expect(href).not.toMatch(/^#|javascript:/);
      const response = await request.get(new URL(href, `${server.origin}${BLOCK}`).href);
      expect(response.ok()).toBe(true);
    }
  });

  test('keeps logical keyboard order, visible focus, and 44px targets', async ({ page }) => {
    await gotoBlock(page, 390, 720);
    const links = page.locator(`${ROOT} .rh23-actions a`);
    await page.locator('.bb-detail-header .ren-breadcrumb a[href="index.html"]').focus();
    for (let index = 0; index < 2; index += 1) {
      await page.keyboard.press('Tab');
      await expect(links.nth(index)).toBeFocused();
      const state = await links.nth(index).evaluate((node) => {
        const box = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return { width: box.width, height: box.height, outline: style.outlineStyle, shadow: style.boxShadow };
      });
      expect(state.width).toBeGreaterThanOrEqual(44);
      expect(state.height).toBeGreaterThanOrEqual(44);
      expect(state.outline !== 'none' || state.shadow !== 'none').toBe(true);
    }
  });

  test('keeps theme surfaces coherent and transitions collapsed for reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);
    const state = await page.locator(`${ROOT} .rh23-actions a:first-child`).evaluate((node) => {
      const style = getComputedStyle(node);
      const section = getComputedStyle(node.closest('.rh23-hero'));
      return { duration: style.transitionDuration, color: section.color, background: section.backgroundColor };
    });
    expect(state.duration.split(',').every((value) => ['0s', '0ms'].includes(value.trim()))).toBe(true);
    expect(state.color).not.toBe(state.background);
  });

  test('preserves the complete block and both destinations without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 720 } });
    const page = await context.newPage();
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=nojs`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`${ROOT} h1`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rh23-actions a[href]`)).toHaveCount(2);
    await context.close();
  });

  test('passes axe WCAG 2.1 AA', async ({ page }) => {
    await gotoBlock(page, 390, 720);
    await injectAxe(page);
    await checkA11y(page, ROOT, { detailedReport: true, detailedReportOptions: { html: true } });
  });

  test('uses documented Ren10 primitives without scripts or policy leakage', async ({ page }) => {
    await gotoBlock(page);
    const source = fs.readFileSync(path.join(PKG_ROOT, BLOCK), 'utf8');
    await expect(page.locator('script')).toHaveCount(0);
    expect(source).not.toMatch(/React|Vue|Svelte|Tailwind|attachShadow|display\s*:\s*(?:flex|grid)|#[0-9a-f]{3,8}|rgba?\(|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    expect(source).toMatch(/ren-center/);
    expect(source).toMatch(/ren-stack/);
    expect(source).toMatch(/ren-cluster/);
  });
});
