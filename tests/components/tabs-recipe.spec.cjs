const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');
let server;
test.beforeAll(async () => { server = await startStaticServer(path.resolve(__dirname, '../..')); });
test.afterAll(async () => { await server.close(); });

test('published tabs recipe supports hash, Back and keyboard with the real API', async ({ page }) => {
  await page.goto(`${server.origin}/docs/recipes.html`);
  const recipe = await page.locator('#tabbed-settings pre code').innerText();
  await page.setContent(`<link rel="stylesheet" href="${server.origin}/index.css">${recipe}`);
  const account = page.getByRole('tab', { name: 'Account' });
  const billing = page.getByRole('tab', { name: 'Billing' });
  await expect(account).toHaveAttribute('aria-selected', 'true');
  await billing.click();
  await expect(billing).toHaveAttribute('aria-selected', 'true');
  await expect(page).toHaveURL(/#settings-billing$/);
  await page.goBack();
  await expect(account).toHaveAttribute('aria-selected', 'true');
  await account.focus();
  await page.keyboard.press('ArrowRight');
  await expect(billing).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(billing).toHaveAttribute('aria-selected', 'true');
});
