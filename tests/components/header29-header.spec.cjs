// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-centered-email-capture-landscape-lightbox.html';
const ROOT = '[data-rh29-root]';
let server;

test.describe('Header29 centered email and landscape lightbox', () => {
  test.beforeAll(async () => { server = await startStaticServer(ROOT_DIR); });
  test.afterAll(async () => { await server?.close(); });

  async function open(page, width = 1280, height = 1000) {
    await page.setViewportSize({ width, height });
    expect((await page.goto(`${server.origin}${BLOCK}`))?.status()).toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns one centered email capture followed by one landscape lightbox', async ({ page }) => {
    await open(page);
    const root = page.locator(ROOT);
    for (const selector of [
      'h1.rh29-title', 'p.rh29-description', 'form.rh29-form',
      'ren-field', 'input[type="email"]', 'button[type="submit"]',
      'p.rh29-legal', 'p.rh29-status', 'button.rh29-media-trigger',
      'img.rh29-poster', '.rh29-play', 'ren-dialog#rh29-video',
      '#rh29-video dialog', '#rh29-video .ren-spinner', '#rh29-video iframe',
    ]) await expect(root.locator(selector), selector).toHaveCount(1);
    await expect(root.locator('header, nav, [class*="logo"], [class*="brand"]')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh29-title');
  });

  for (const width of [320, 390, 639, 640, 1280]) {
    test(`keeps a clean centered rhythm without overflow at ${width}px`, async ({ page }) => {
      await open(page, width, 900);
      const state = await page.locator(ROOT).evaluate((root) => {
        const copy = root.querySelector('.rh29-copy').getBoundingClientRect();
        const media = root.querySelector('.rh29-media').getBoundingClientRect();
        const field = root.querySelector('ren-field').getBoundingClientRect();
        const submit = root.querySelector('.rh29-submit').getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          centered: Math.abs((copy.left + copy.right) / 2 - innerWidth / 2),
          mediaBelow: media.top >= copy.bottom,
          landscape: media.width / media.height,
          row: submit.left >= field.right - 1 && Math.abs(field.bottom - submit.bottom) < 2,
        };
      });
      expect(state.overflow).toBeLessThanOrEqual(1);
      expect(state.centered).toBeLessThanOrEqual(2);
      expect(state.mediaBelow).toBe(true);
      expect(state.landscape).toBeGreaterThan(1.7);
      expect(state.row).toBe(width >= 640);
    });
  }

  test('validates email, announces success, and opens and closes the lightbox', async ({ page }) => {
    await open(page, 390, 900);
    await page.locator(`${ROOT} .rh29-submit`).click();
    await expect(page.locator(`${ROOT} ren-field`)).toHaveAttribute('data-invalid', '');
    await page.locator(`${ROOT} input`).fill('team@example.com');
    await page.locator(`${ROOT} .rh29-submit`).click();
    await expect(page.locator(`${ROOT} .rh29-status`)).toContainText('check your inbox');

    const trigger = page.locator(`${ROOT} .rh29-media-trigger`);
    await trigger.focus();
    await trigger.click();
    await expect(page.locator('#rh29-video dialog')).toHaveAttribute('open', '');
    await expect(page.locator('#rh29-video iframe')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#rh29-video dialog')).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
  });

  test('uses CSS Grid for the form row and no framework or flex layout', async () => {
    const source = fs.readFileSync(path.join(ROOT_DIR, BLOCK), 'utf8');
    expect(source).toContain('rh29-form-row ren-grid');
    expect(source).toMatch(/grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto/);
    expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
    expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
  });

  test('passes axe closed and open', async ({ page }) => {
    await open(page, 390, 900);
    await injectAxe(page);
    await checkA11y(page, ROOT);
    await page.locator(`${ROOT} .rh29-media-trigger`).click();
    await checkA11y(page, '#rh29-video dialog');
  });
});
