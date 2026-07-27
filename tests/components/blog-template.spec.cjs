// @ts-check
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
let server;

test.describe('Blog template responsive layout', () => {
  test.beforeAll(async () => { server = await startStaticServer(ROOT); });
  test.afterAll(async () => { await server?.close(); });

  for (const width of [320, 390, 768, 960, 1024, 1440]) {
    test(`keeps articles, search, and aside inside the page at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      expect((await page.goto(`${server.origin}/templates/blog.html`))?.status()).toBe(200);

      const state = await page.evaluate(() => {
        const rect = (selector) => document.querySelector(selector).getBoundingClientRect();
        const container = rect('.bl-container');
        const articles = rect('.bl-articles');
        const aside = rect('.bl-aside');
        const search = rect('#bl-search');
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          articlesInside: articles.left >= container.left - 1 && articles.right <= container.right + 1,
          asideInside: aside.left >= container.left - 1 && aside.right <= container.right + 1,
          searchInside: search.left >= aside.left - 1 && search.right <= aside.right + 1,
          articlesWidth: Math.round(articles.width),
          asideWidth: Math.round(aside.width),
        };
      });

      expect(state.overflow).toBeLessThanOrEqual(1);
      expect(state.articlesInside).toBe(true);
      expect(state.asideInside).toBe(true);
      expect(state.searchInside).toBe(true);
      if (width <= 960) expect(Math.abs(state.articlesWidth - state.asideWidth)).toBeLessThanOrEqual(1);
      else expect(state.asideWidth).toBe(280);
    });
  }

  test('uses labeled search and newsletter controls and passes axe', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${server.origin}/templates/blog.html`);
    await expect(page.getByRole('searchbox', { name: 'Search posts' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await injectAxe(page);
    await checkA11y(page, 'main');
  });
});
