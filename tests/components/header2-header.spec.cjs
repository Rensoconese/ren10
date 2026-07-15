// @ts-check
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-split-email-form-media-right.html';

test.describe('Relume Header 2 translated to Ren10', () => {
  let server;

  test.beforeAll(async () => {
    server = await startStaticServer(ROOT);
  });

  test.afterAll(async () => {
    await server?.close();
  });

  async function gotoBlock(page) {
    await page.goto(`${server.origin}${BLOCK}?ren10_test=header2`);
    await expect(page.locator('[data-rh2-root]')).toBeVisible();
  }

  test('preserves the exact split-header anatomy and semantic ownership', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator('[data-rh2-root]');

    await expect(root.locator('.rh2-heading')).toHaveCount(1);
    await expect(root.locator('.rh2-description')).toHaveCount(1);
    await expect(root.locator('form')).toHaveCount(1);
    await expect(root.locator('ren-field')).toHaveCount(1);
    await expect(root.locator('input[type="email"]')).toHaveCount(1);
    await expect(root.locator('button[type="submit"].rh2-cta')).toHaveCount(1);
    await expect(root.locator('.rh2-terms')).toHaveCount(1);
    await expect(root.locator('.rh2-terms-link[href]')).toHaveCount(1);
    await expect(root.locator('figure.rh2-media img')).toHaveCount(1);
    await expect(root.locator('.ren-nav-toggle, nav, [data-drawer], .rh2-secondary-cta')).toHaveCount(0);

    await expect(root).toHaveAttribute('aria-labelledby', 'rh2-heading');
    await expect(root.locator('label')).toHaveText(/email/i);
    await expect(root.locator('input[type="email"]')).toHaveAttribute('required', '');
    await expect(root.locator('img')).toHaveAttribute('alt', /workspace/i);
  });

  test('validates the email and handles a valid native-form submission in place', async ({ page }) => {
    await gotoBlock(page);
    const input = page.locator('[data-rh2-root] input[type="email"]');
    const submit = page.locator('[data-rh2-root] button[type="submit"]');

    await submit.click();
    await expect(page.locator('[data-rh2-root] .ren-form-error-summary')).toBeFocused();
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    await input.fill('reader@example.com');
    await submit.click();
    await expect(page).toHaveURL(/hero-split-email-form-media-right\.html/);
    await expect(page.locator('[data-rh2-status]')).toContainText(/check your inbox/i);
    await expect(input).toHaveValue('');
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`keeps deliberate geometry and no overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width >= 768 ? 1024 : 900 });
      await gotoBlock(page);

      const geometry = await page.evaluate(() => {
        const root = document.querySelector('[data-rh2-root]');
        const layout = root?.querySelector('.rh2-layout');
        const copy = root?.querySelector('.rh2-copy');
        const media = root?.querySelector('.rh2-media');
        const field = root?.querySelector('ren-field');
        const button = root?.querySelector('.rh2-cta');
        if (!root || !layout || !copy || !media || !field || !button) return null;
        const rootRect = root.getBoundingClientRect();
        const copyRect = copy.getBoundingClientRect();
        const mediaRect = media.getBoundingClientRect();
        const fieldRect = field.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        return {
          overflow: root.scrollWidth - root.clientWidth,
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rootWithinViewport: rootRect.left >= -1 && rootRect.right <= innerWidth + 1,
          sideBySide: mediaRect.left >= copyRect.right - 2,
          stacked: mediaRect.top >= copyRect.bottom - 2,
          formRow: buttonRect.left >= fieldRect.right - 2,
          formStack: buttonRect.top >= fieldRect.bottom - 2,
          copyWidth: copyRect.width,
          mediaWidth: mediaRect.width,
        };
      });

      expect(geometry).toBeTruthy();
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.pageOverflow).toBeLessThanOrEqual(1);
      expect(geometry.rootWithinViewport).toBe(true);
      if (width >= 768) {
        expect(geometry.sideBySide).toBe(true);
        expect(Math.abs(geometry.copyWidth - geometry.mediaWidth)).toBeLessThanOrEqual(8);
        expect(geometry.formRow).toBe(true);
      } else {
        expect(geometry.stacked).toBe(true);
        expect(geometry.formStack).toBe(true);
      }
    });
  }

  test('provides visible focus and 44px field and CTA targets', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoBlock(page);

    const controls = page.locator('[data-rh2-root] input[type="email"], [data-rh2-root] .rh2-cta');
    await expect(controls).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      const box = await controls.nth(index).boundingBox();
      expect(box).toBeTruthy();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    const input = page.locator('[data-rh2-root] input[type="email"]');
    await input.focus();
    await expect(input).toBeFocused();
    const focusChrome = await input.evaluate((element) => {
      const style = getComputedStyle(element);
      return { outline: style.outlineStyle, shadow: style.boxShadow };
    });
    expect(focusChrome.outline !== 'none' || focusChrome.shadow !== 'none').toBe(true);
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-rh2-root] .rh2-cta')).toBeFocused();
  });

  test('uses Ren10 theme tokens and collapses local motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      const resolved = await page.locator('[data-rh2-root]').evaluate((root) => {
        const rootStyle = getComputedStyle(root);
        const buttonStyle = getComputedStyle(root.querySelector('.rh2-cta'));
        return {
          background: rootStyle.backgroundColor,
          color: rootStyle.color,
          transitionDuration: buttonStyle.transitionDuration,
        };
      });
      expect(resolved.background).not.toBe('rgba(0, 0, 0, 0)');
      expect(resolved.color).not.toBe('rgba(0, 0, 0, 0)');
      expect(resolved.transitionDuration.split(',').every((value) => ['0s', '0ms'].includes(value.trim()))).toBe(true);
    }
  });

  test('passes axe WCAG 2.1 AA', async ({ page }) => {
    await gotoBlock(page);
    await injectAxe(page);
    await checkA11y(page, '[data-rh2-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
  });

  test('keeps the form, terms link, and media usable without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(`${server.origin}${BLOCK}?ren10_test=header2-no-js`);

    await expect(page.locator('[data-rh2-root] input[type="email"]')).toBeVisible();
    await expect(page.locator('[data-rh2-root] button[type="submit"]')).toBeVisible();
    await expect(page.locator('[data-rh2-root] .rh2-terms-link')).toBeVisible();
    await expect(page.locator('[data-rh2-root] .rh2-media img')).toBeVisible();
    await context.close();
  });
});
