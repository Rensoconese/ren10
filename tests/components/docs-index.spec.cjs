// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
let server;

test.beforeAll(async () => {
  server = await startStaticServer(ROOT);
});

test.afterAll(async () => {
  await server?.close();
});

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 },
]) {
  test(`documentation card groups preserve grid gaps at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const response = await page.goto(`${server.origin}/docs/index.html`);
    expect(response?.status()).toBe(200);

    const groups = await page.locator('.docs-group > .ren-grid').evaluateAll((grids) => grids.map((grid) => {
      const children = Array.from(grid.children);
      const first = children[0]?.getBoundingClientRect();
      const second = children[1]?.getBoundingClientRect();
      const styles = getComputedStyle(grid);
      return {
        display: styles.display,
        columnGap: Number.parseFloat(styles.columnGap),
        rowGap: Number.parseFloat(styles.rowGap),
        separation: first && second
          ? Math.max(second.left - first.right, second.top - first.bottom)
          : 0,
      };
    }));

    expect(groups).toHaveLength(4);
    for (const group of groups) {
      expect(group.display).toBe('grid');
      expect(group.columnGap).toBeGreaterThanOrEqual(16);
      expect(group.rowGap).toBeGreaterThanOrEqual(16);
      expect(group.separation).toBeGreaterThanOrEqual(15.99);
    }
  });
}
