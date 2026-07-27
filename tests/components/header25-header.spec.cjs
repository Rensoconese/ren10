// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-centered-search.html';
const SOURCE = path.join(PKG_ROOT, BLOCK);
const ROOT = '[data-rh25-root]';

test.describe('Relume Header 25 translated to Ren10', () => {
  let server;
  test.beforeAll(async () => { server = await startStaticServer(PKG_ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page, width = 1280, height = 800) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header25`);
    expect(response?.status(), 'Header25 block must exist').toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns the exact centered search anatomy without legal, media, or extra actions', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);
    await expect(root.locator('.rh25-container, h1.rh25-title, p.rh25-description, form.rh25-form, .rh25-form-row, ren-field, input[type="search"], .rh25-search-icon, button[type="submit"], .rh25-status')).toHaveCount(10);
    await expect(root.locator('h1, .rh25-description, form, input[type="search"], .rh25-search-icon, button[type="submit"]')).toHaveCount(6);
    await expect(root.locator('a, nav, header, [class*="legal"], img, picture, video, iframe, dialog, ren-dialog, form ~ form, button:not([type="submit"])')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh25-title');
  });

  for (const width of [320, 390, 640, 768, 1280]) {
    test(`stays centered, content-height, and overflow-free at ${width}px`, async ({ page }) => {
      await gotoBlock(page, width, width < 640 ? 720 : 800);
      const state = await page.locator(ROOT).evaluate((root) => {
        const container = root.querySelector('.rh25-container').getBoundingClientRect();
        return {
          minHeight: getComputedStyle(root).minHeight,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          centered: Math.abs(container.left - (innerWidth - container.right)),
          inside: container.left >= 0 && container.right <= innerWidth + 1,
        };
      });
      expect(state.minHeight).toBe('0px');
      expect(state.overflow).toBeLessThanOrEqual(1);
      expect(state.centered).toBeLessThanOrEqual(2);
      expect(state.inside).toBe(true);
    });
  }

  test('stacks narrowly and forms a flexible-input max-content-submit row from 640px', async ({ page }) => {
    await gotoBlock(page, 390, 720);
    const narrow = await page.locator('.rh25-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect();
      const submit = row.querySelector('button').getBoundingClientRect();
      return { stacked: submit.top >= field.bottom, widths: Math.abs(field.width - submit.width) };
    });
    expect(narrow.stacked).toBe(true);
    expect(narrow.widths).toBeLessThanOrEqual(1);
    await gotoBlock(page, 640, 800);
    const wide = await page.locator('.rh25-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect();
      const submit = row.querySelector('button').getBoundingClientRect();
      return { inline: submit.left > field.right, bottoms: Math.abs(field.bottom - submit.bottom), submitWidth: submit.width, rowWidth: row.getBoundingClientRect().width };
    });
    expect(wide.inline).toBe(true);
    expect(wide.bottoms).toBeLessThanOrEqual(1);
    expect(wide.submitWidth).toBeLessThan(wide.rowWidth / 2);
  });

  test('uses one visible label and one decorative leading icon without duplicate naming', async ({ page }) => {
    await gotoBlock(page);
    const input = page.locator(`${ROOT} input[type="search"]`);
    await expect(page.locator(`${ROOT} label`)).toBeVisible();
    await expect(input).toHaveAccessibleName(/^Search Ren10 resources(?: \*)?$/);
    await expect(page.locator(`${ROOT} .rh25-search-icon`)).toHaveAttribute('aria-hidden', 'true');
    const icon = page.locator(`${ROOT} .rh25-search-icon svg`);
    await expect(icon).toHaveCount(1);
    const iconBox = await icon.boundingBox();
    expect(iconBox.width).toBeGreaterThanOrEqual(16);
    expect(iconBox.height).toBeGreaterThanOrEqual(16);
    expect(await icon.evaluate((node) => getComputedStyle(node.closest('.rh25-search-icon')).color)).not.toBe('rgba(0, 0, 0, 0)');
    expect(await input.getAttribute('aria-label')).toBeNull();
  });

  test('uses native validation, a resolvable GET target, and one polite enhanced status', async ({ page }) => {
    await gotoBlock(page);
    const input = page.locator(`${ROOT} .rh25-search`);
    const submit = page.locator(`${ROOT} .rh25-submit`);
    const error = page.locator(`${ROOT} [data-error]`);
    const status = page.locator(`${ROOT} .rh25-status`);
    const form = page.locator(`${ROOT} form`);
    await expect(form).toHaveAttribute('method', 'get');
    const action = await form.getAttribute('action');
    expect((await page.request.get(new URL(action, page.url()).href)).ok()).toBe(true);
    await submit.click();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(error).toBeVisible();
    await input.fill('dialog accessibility');
    await expect(error).toBeHidden();
    const before = page.url();
    await submit.click();
    await expect(status).toHaveText('Searching Ren10 resources for “dialog accessibility”.');
    await expect(status).toHaveAttribute('role', 'status');
    expect(page.url()).toBe(before);
    await expect(page.locator(`${ROOT} a, ${ROOT} button`)).toHaveCount(1);
  });

  test('preserves required native GET navigation without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    expect((await page.goto(`${server.origin}${BLOCK}`))?.ok()).toBe(true);
    const input = page.locator(`${ROOT} .rh25-search`);
    await expect(input).toHaveAttribute('required', '');
    await input.fill('design tokens');
    const navigation = page.waitForNavigation();
    await page.locator(`${ROOT} .rh25-submit`).click();
    expect((await navigation)?.ok()).toBe(true);
    expect(page.url()).toMatch(/docs\/index\.html\?q=design\+tokens/);
    await context.close();
  });

  test('keeps input and submit touch-safe with visible focus in light and dark', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    const targets = page.locator(`${ROOT} .rh25-search, ${ROOT} .rh25-submit`);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      for (let index = 0; index < await targets.count(); index += 1) {
        const target = targets.nth(index);
        const box = await target.boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
        await target.focus();
        expect(await target.evaluate((node) => {
          const own = getComputedStyle(node);
          const wrapper = node.closest('.ren-input-wrapper');
          const wrapped = wrapper ? getComputedStyle(wrapper) : null;
          return own.outlineStyle !== 'none' || own.boxShadow !== 'none' || wrapped?.boxShadow !== 'none';
        })).toBe(true);
      }
    }
  });

  test('remains stable under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page, 390, 844);
    const duration = await page.locator(`${ROOT} .rh25-search`).evaluate((node) => getComputedStyle(node).transitionDuration.split(',').map((value) => value.trim()));
    expect(duration.every((value) => ['0s', '0ms'].includes(value))).toBe(true);
  });

  test('isolates enhanced submission from unrelated forms', async ({ page }) => {
    await gotoBlock(page);
    await page.evaluate(() => {
      const decoy = document.createElement('form');
      decoy.className = 'rh25-form';
      decoy.innerHTML = '<input name="q" value="untouched"><button type="submit">Other search</button>';
      document.body.prepend(decoy);
    });
    await page.locator(`${ROOT} .rh25-search`).fill('components');
    await page.locator(`${ROOT} .rh25-submit`).click();
    await expect(page.locator(`${ROOT} .rh25-status`)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Other search' })).toBeVisible();
  });

  test('uses a root-scoped module and documented Ren10 APIs without policy leakage', async () => {
    const source = fs.readFileSync(SOURCE, 'utf8');
    for (const token of ['ren-center', 'ren-stack', 'ren-switcher', 'ren-field', 'ren-input-wrapper', 'ren-input-icon', 'ren-btn']) expect(source).toContain(token);
    expect(source).toMatch(/<script type="module">\s*const root = document\.querySelector\('\[data-rh25-root\]'\);/);
    expect((source.match(/document\.querySelector/g) || []).length).toBe(1);
    expect(source).not.toMatch(/React|className|Tailwind|@relume|attachShadow/i);
    expect(source).not.toMatch(/--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-|#[0-9a-f]{3,8}\b/i);
    expect(source).not.toMatch(/display:\s*(?:flex|grid)/i);
  });

  test('passes axe WCAG 2.1 AA before and after validation feedback', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    await injectAxe(page);
    const options = { detailedReport: true, detailedReportOptions: { html: true }, axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } };
    await checkA11y(page, ROOT, options);
    await page.locator(`${ROOT} .rh25-submit`).click();
    await checkA11y(page, ROOT, options);
  });
});
