// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-fullscreen-bg-centered-copy-dual-cta.html';
const ROOT = '[data-rh30-root]';
let server;

test.describe('Header30 fullscreen background and centered dual CTA', () => {
  test.beforeAll(async () => { server = await startStaticServer(ROOT_DIR); });
  test.afterAll(async () => { await server?.close(); });

  async function open(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    expect((await page.goto(`${server.origin}${BLOCK}`))?.status()).toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns one background, one scrim, centered copy, and exactly two destinations', async ({ page }) => {
    await open(page);
    const root = page.locator(ROOT);
    for (const [selector, count] of [
      ['.rh30-background', 1], ['.rh30-background img', 1], ['.rh30-scrim', 1],
      ['h1.rh30-title', 1], ['p.rh30-description', 1], ['.rh30-actions a', 2],
    ]) await expect(root.locator(selector)).toHaveCount(count);
    await expect(root.locator('form, input, button, dialog, video, iframe, nav, header')).toHaveCount(0);
    const hrefs = await root.locator('.rh30-actions a').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
    expect(new Set(hrefs).size).toBe(2);
    expect(hrefs.every((href) => href && href !== '#')).toBe(true);
    const textColors = await root.locator('.rh30-title, .rh30-description').evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).color));
    expect(new Set(textColors).size).toBe(1);
  });

  for (const width of [320, 390, 768, 1280]) {
    test(`keeps centered cover composition and controlled spacing at ${width}px`, async ({ page }) => {
      await open(page, width, 900);
      const state = await page.locator(ROOT).evaluate((root) => {
        const copy = root.querySelector('.rh30-copy').getBoundingClientRect();
        const image = root.querySelector('.rh30-background img');
        const box = root.getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          horizontal: Math.abs((copy.left + copy.right) / 2 - innerWidth / 2),
          vertical: Math.abs((copy.top + copy.bottom) / 2 - (box.top + box.bottom) / 2),
          height: box.height,
          fit: getComputedStyle(image).objectFit,
        };
      });
      expect(state.overflow).toBeLessThanOrEqual(1);
      expect(state.horizontal).toBeLessThanOrEqual(2);
      expect(state.vertical).toBeLessThanOrEqual(2);
      expect(state.height).toBeGreaterThanOrEqual(500);
      expect(state.height).toBeLessThanOrEqual(710);
      expect(state.fit).toBe('cover');
    });
  }

  test('uses Ren10 cover and CSS Grid actions without flexbox layout', async () => {
    const source = fs.readFileSync(path.join(ROOT_DIR, BLOCK), 'utf8');
    expect(source).toContain('ren-cover');
    expect(source).toContain('rh30-actions ren-grid');
    expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
    expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
  });

  test('keeps both actions touch-safe, focus-visible, and axe clean', async ({ page }) => {
    await open(page, 390, 844);
    for (const action of await page.locator(`${ROOT} .rh30-actions a`).all()) {
      const box = await action.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      await action.focus();
      expect(await action.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
    }
    await injectAxe(page);
    await checkA11y(page, ROOT);
  });
});
