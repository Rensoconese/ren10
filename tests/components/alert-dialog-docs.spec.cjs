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

test('live alert dialog opens modally and requires an explicit choice', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  const response = await page.goto(`${server.origin}/docs/components/ren-alert-dialog.html`);
  expect(response?.status()).toBe(200);

  const trigger = page.getByRole('button', { name: 'Delete account' }).first();
  const dialog = page.getByRole('dialog', { name: 'Delete this account?' });
  await trigger.click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('open', '');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', { name: 'Keep account' }).click();
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(errors).toEqual([]);
});
