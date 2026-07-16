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
      const paginationRect = pagination?.getBoundingClientRect();
      const paginationLinks = Array.from(pagination?.querySelectorAll('a[href]') ?? []);
      return {
        display: main ? getComputedStyle(main).display : null,
        headerPreviewGap: headerRect && previewRect
          ? Math.round(previewRect.top - headerRect.bottom)
          : null,
        previewPaginationGap: previewRect && paginationRect
          ? Math.round(paginationRect.top - previewRect.bottom)
          : null,
        nestedPreviewFrames: preview?.querySelectorAll('.bb-detail-preview').length ?? 0,
        links: paginationLinks.length,
        labels: paginationLinks.map((link) => link.textContent.trim()),
        rels: paginationLinks.map((link) => link.getAttribute('rel')),
        destinations: paginationLinks.map((link) => link.href),
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });

    expect(state.display).toBe('grid');
    expect(state.headerPreviewGap).toBe(32);
    expect(state.previewPaginationGap).toBe(32);
    expect(state.nestedPreviewFrames).toBe(0);
    expect(state.links).toBe(2);
    expect(state.rels).toEqual(['prev', 'next']);
    expect(state.labels.every((label) => !/Previous block|Next block/.test(label))).toBe(true);
    const destinationStatuses = await page.evaluate(async (urls) => Promise.all(
      urls.map(async (url) => (await fetch(url)).status)
    ), state.destinations);
    expect(destinationStatuses).toEqual([200, 200]);
    expect(state.overflow).toBeLessThanOrEqual(0);
    });
  }
}
