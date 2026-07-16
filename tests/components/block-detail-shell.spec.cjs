// @ts-check
const { test, expect } = require('@playwright/test');
const { readdirSync } = require('node:fs');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const pages = readdirSync(path.join(ROOT, 'templates/blocks'))
  .filter((file) => /^(hero|nav)-.*\.html$/.test(file))
  .sort();

let server;

test.beforeAll(async () => {
  server = await startStaticServer(ROOT);
});

test.afterAll(async () => {
  await server?.close();
});

for (const file of pages) {
  for (const viewport of [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'desktop', width: 1280, height: 1024 },
  ]) {
    test(`${file} uses shared detail rhythm and valid block navigation at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const response = await page.goto(`${server.origin}/templates/blocks/${file}`);
    expect(response?.status()).toBe(200);

    const state = await page.evaluate(() => {
      const main = document.querySelector('main.bb-detail-page');
      const header = main?.querySelector(':scope > .bb-detail-header');
      const preview = main?.querySelector(':scope > .bb-detail-preview');
      const pagination = main?.querySelector('.bb-block-pagination');
      const headerRect = header?.getBoundingClientRect();
      const previewRect = preview?.getBoundingClientRect();
      return {
        display: main ? getComputedStyle(main).display : null,
        gap: headerRect && previewRect
          ? Math.round(previewRect.top - headerRect.bottom)
          : null,
        links: pagination?.querySelectorAll('a[href]').length ?? 0,
        labels: Array.from(pagination?.querySelectorAll('a[href]') ?? [])
          .map((link) => link.textContent.trim()),
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });

    expect(state.display).toBe('grid');
    if (state.gap !== null) expect(state.gap).toBe(32);
    expect(state.links).toBe(2);
    expect(state.labels.every((label) => !/Previous block|Next block/.test(label))).toBe(true);
    expect(state.overflow).toBeLessThanOrEqual(0);
    });
  }
}
