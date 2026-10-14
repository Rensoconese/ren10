const path = require('node:path');
const fs = require('node:fs');
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(path.resolve(__dirname, '../..')); });
test.afterAll(async () => { await server?.close(); });

test('Theme Builder renders icons and exports a ZIP when external CDNs are unavailable', async ({ page }) => {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return /^https?:$/.test(url.protocol) && url.origin !== server.origin ? route.abort() : route.continue();
  });
  await page.goto(`${server.origin}/create/index.html`, { waitUntil: 'load' });
  await expect(page.locator('#preview-grid .p-card').first()).toBeVisible();
  await expect(page.locator('svg.lucide').first()).toBeVisible();
  await page.locator('#btn-export').click();
  const pending = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download .zip', exact: true }).click();
  const download = await pending;
  expect(download.suggestedFilename()).toBe('rends-theme.zip');
  const bytes = fs.readFileSync(await download.path());
  expect([...bytes.subarray(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04]);
  expect(bytes.length).toBeGreaterThan(1000);
});
