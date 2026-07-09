// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const FIXTURE_URL =
  'file://' + path.resolve(__dirname, 'fixtures/component-token-overrides.html');

test.describe('Primitive Appearance API contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE_URL);
  });

  test('root overrides affect representative primitive computed styles', async ({ page }) => {
    await expect.poll(() => page.locator('#root-button').evaluate((element) =>
      getComputedStyle(element).borderRadius)).toBe('17px');
    await expect.poll(() => page.locator('#root-card').evaluate((element) =>
      getComputedStyle(element).backgroundColor)).toBe('rgb(1, 2, 3)');
    await expect.poll(() => page.locator('#root-field').evaluate((element) =>
      getComputedStyle(element).borderTopColor)).toBe('rgb(12, 34, 56)');
    await expect.poll(() => page.locator('#root-badge').evaluate((element) =>
      getComputedStyle(element).borderRadius)).toBe('7px');
    await expect.poll(() => page.locator('#root-switch').evaluate((element) =>
      getComputedStyle(element).width)).toBe('60px');
  });

  test('closer scope overrides win over root overrides', async ({ page }) => {
    await expect.poll(() => page.locator('#scoped-button').evaluate((element) =>
      getComputedStyle(element).borderRadius)).toBe('23px');
    await expect.poll(() => page.locator('#scoped-card').evaluate((element) =>
      getComputedStyle(element).backgroundColor)).toBe('rgb(4, 5, 6)');
    await expect.poll(() => page.locator('#scoped-field').evaluate((element) =>
      getComputedStyle(element).borderTopColor)).toBe('rgb(65, 43, 21)');
    await expect.poll(() => page.locator('#scoped-badge').evaluate((element) =>
      getComputedStyle(element).borderRadius)).toBe('11px');
    await expect.poll(() => page.locator('#scoped-switch').evaluate((element) =>
      getComputedStyle(element).width)).toBe('70px');
  });

  test('theme component overrides survive a later component-token import', async ({ page }) => {
    await expect.poll(() => page.locator('#root-card').evaluate((element) =>
      getComputedStyle(element).borderRadius)).toBe('18px');
    await expect.poll(() => page.locator('#root-button').evaluate((element) =>
      getComputedStyle(element).fontWeight)).toBe('600');
  });
});
