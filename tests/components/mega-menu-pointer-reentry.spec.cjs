// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');

for (const [block, root, prefix] of [
  ['nav-mega-menu-card-grid', '[data-rmcg-root]', '.rmcg'],
  ['nav-mega-menu-topics-collection-cards', '[data-rmcc-root]', '.rmcc'],
  ['nav-mega-menu-overlay-collections', '[data-rmoc-root]', '.rmoc'],
]) {
  test.describe(block, () => {
    let staticServer;
    test.beforeAll(async () => { staticServer = await startStaticServer(path.resolve(__dirname, '../..')); });
    test.afterAll(async () => { await staticServer?.close(); });
    test('quick pointer re-entry after Escape keeps the hover menu open', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 1200 });
      await page.goto(`${staticServer.origin}/templates/blocks/${block}.html`);
      const summary = page.locator(`${prefix}-disclosure > summary`);
      const disclosure = page.locator(`${prefix}-disclosure`);
      const brand = page.locator(`${root} .ren-nav-brand`);
      await summary.hover();
      await expect(disclosure).toHaveAttribute('open', '');
      await page.keyboard.press('Escape');
      await expect(disclosure).not.toHaveAttribute('open', '');
      const summaryBox = await summary.boundingBox();
      const brandBox = await brand.boundingBox();
      expect(summaryBox).toBeTruthy();
      expect(brandBox).toBeTruthy();

      // Hold scheduled frames so leaving and re-entering happen before the
      // deferred leave callback. Real pointer input still drives the controller.
      await page.clock.install({ time: new Date('2026-09-30T12:00:00Z') });
      await page.clock.pauseAt(new Date('2026-09-30T12:00:01Z'));
      await page.mouse.move(brandBox.x + brandBox.width / 2, brandBox.y + brandBox.height / 2);
      await page.mouse.move(summaryBox.x + summaryBox.width / 2, summaryBox.y + summaryBox.height / 2);
      await page.clock.runFor(32);
      await expect(disclosure).toHaveAttribute('open', '');
      await expect(page.locator(`${prefix}-panel`)).toBeVisible();
    });
  });
}
