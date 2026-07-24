// @ts-check
const path = require('node:path');
const { test, expect } = require('@playwright/test');

const TOKENS_URL = `file://${path.resolve(__dirname, '../../docs/tokens.html')}`;

test.describe('Spacing token documentation', () => {
  test('explains the scale with visual usage examples', async ({ page }) => {
    await page.goto(TOKENS_URL);

    const guide = page.locator('#spacing .dx-space-guide');
    await expect(guide).toBeVisible();
    await expect(guide.locator('.dx-space-use')).toHaveCount(4);
    await expect(guide).toContainText('The suffix is a scale step');
  });

  test('lists only fractional tokens that actually exist', async ({ page }) => {
    await page.goto(TOKENS_URL);

    const spacing = page.locator('#spacing');
    await expect(spacing).toContainText('--space-0-25');
    await expect(spacing).toContainText('--space-0-5');
    await expect(spacing).toContainText('--space-1-5');
    await expect(spacing).not.toContainText('--space-2-5');
  });
});
