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
  test(`ren-frame documentation shows separated truthful ratios at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    const response = await page.goto(`${server.origin}/docs/layouts.html#frame`);
    expect(response?.status()).toBe(200);

    const state = await page.locator('#frame .ren-grid').evaluate((grid) => {
      const frames = Array.from(grid.querySelectorAll('.ren-frame'));
      return {
        display: getComputedStyle(grid).display,
        gap: Number.parseFloat(getComputedStyle(grid).gap),
        ratios: frames.map((frame) => {
          const bounds = frame.getBoundingClientRect();
          return bounds.width / bounds.height;
        }),
        overflow: grid.scrollWidth - grid.clientWidth,
      };
    });

    expect(state.display).toBe('grid');
    expect(state.gap).toBeGreaterThanOrEqual(16);
    expect(state.ratios[0]).toBeCloseTo(1, 1);
    expect(state.ratios[1]).toBeCloseTo(16 / 9, 1);
    expect(state.ratios[2]).toBeCloseTo(4 / 3, 1);
    expect(state.overflow).toBeLessThanOrEqual(0);
  });
}
