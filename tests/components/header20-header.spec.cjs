// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-email-copy-image-left.html';
const SOURCE = path.join(PKG_ROOT, BLOCK);
const ROOT = '[data-rh20-root]';

test.describe('Relume Header 20 translated to Ren10', () => {
  let server;
  test.beforeAll(async () => { server = await startStaticServer(PKG_ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header20`);
    expect(response?.status(), 'Header20 block must exist').toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns the exact copy, single form, and single image anatomy without extras', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);
    await expect(root.locator('.rh20-container, .rh20-layout, .rh20-copy, h1.rh20-title, p.rh20-description, form.rh20-form, figure.rh20-media')).toHaveCount(7);
    await expect(root.locator('form')).toHaveCount(1);
    await expect(root.locator('ren-field, label, input[type="email"], button[type="submit"], .rh20-legal, .rh20-terms-link, .rh20-status, figure img')).toHaveCount(8);
    await expect(root.locator('form label')).toBeVisible();
    await expect(root.locator('form [data-error]')).toHaveCount(1);
    await expect(root.locator('form [data-error]')).toBeHidden();
    await expect(root.locator('a:not(.rh20-terms-link), dialog, video, [class*="overlay"], [class*="scrim"], nav, header, [class*="brand"], [class*="logo"]')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh20-title');
  });

  test('uses one owned meaningful intrinsic rounded cover image', async ({ page }) => {
    await gotoBlock(page);
    const image = page.locator(`${ROOT} .rh20-media img`);
    await expect(image).toHaveAttribute('src', /^media\/hero-[a-z0-9-]+\.png$/);
    await expect(image).toHaveAttribute('alt', /\S+/);
    await expect(image).toHaveAttribute('width', /^\d+$/);
    await expect(image).toHaveAttribute('height', /^\d+$/);
    const state = await image.evaluate((node) => ({ complete: node.complete, naturalWidth: node.naturalWidth, objectFit: getComputedStyle(node).objectFit, radius: getComputedStyle(node.parentElement).borderRadius }));
    expect(state.complete).toBe(true);
    expect(state.naturalWidth).toBeGreaterThan(0);
    expect(state.objectFit).toBe('cover');
    expect(state.radius).not.toBe('0px');
  });

  for (const width of [320, 390, 640, 1023, 1024, 1280]) {
    test(`preserves layout order, centering, and no overflow at ${width}px`, async ({ page }) => {
      await gotoBlock(page, width, width <= 390 ? 844 : 1000);
      const geometry = await page.locator(ROOT).evaluate((root) => {
        const copy = root.querySelector('.rh20-copy').getBoundingClientRect();
        const media = root.querySelector('.rh20-media').getBoundingClientRect();
        const layout = root.querySelector('.rh20-layout').getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rootOverflow: root.scrollWidth - root.clientWidth,
          copyFirst: copy.top <= media.top && media.top >= copy.bottom - 1,
          mediaLeft: media.left < copy.left && copy.left >= media.right - 1,
          centered: Math.abs((copy.top + copy.bottom) / 2 - (media.top + media.bottom) / 2),
          equal: Math.abs(copy.width - media.width),
          inside: layout.left >= 0 && layout.right <= innerWidth + 1,
        };
      });
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.rootOverflow).toBeLessThanOrEqual(1);
      expect(geometry.inside).toBe(true);
      if (width >= 1024) {
        expect(geometry.mediaLeft).toBe(true);
        expect(geometry.centered).toBeLessThanOrEqual(2);
        expect(geometry.equal).toBeLessThanOrEqual(2);
      } else {
        expect(geometry.copyFirst).toBe(true);
      }
    });
  }

  test('stacks the form at 639px and forms a field-submit row at 640px', async ({ page }) => {
    await gotoBlock(page, 639, 900);
    const stacked = await page.locator('.rh20-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect();
      const button = row.querySelector('button').getBoundingClientRect();
      return button.top >= field.bottom;
    });
    expect(stacked).toBe(true);
    await gotoBlock(page, 640, 900);
    const inline = await page.locator('.rh20-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect();
      const button = row.querySelector('button').getBoundingClientRect();
      return { after: button.left >= field.right - 1, bottom: Math.abs(button.bottom - field.bottom), grows: field.width > button.width };
    });
    expect(inline.after).toBe(true);
    expect(inline.bottom).toBeLessThanOrEqual(1);
    expect(inline.grows).toBe(true);
  });

  test('shows wired invalid state, clears it on input, and announces valid success', async ({ page }) => {
    await gotoBlock(page);
    const input = page.locator(`${ROOT} .rh20-email`);
    const field = page.locator(`${ROOT} ren-field`);
    const error = page.locator(`${ROOT} [data-error]`);
    const status = page.locator(`${ROOT} .rh20-status`);
    await expect(page.locator(`${ROOT} form`)).toHaveJSProperty('noValidate', true);
    await page.locator(`${ROOT} .rh20-submit`).click();
    await expect(field).toHaveAttribute('data-invalid', '');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(error).toBeVisible();
    await expect(input).toBeFocused();
    await input.fill('team@example.com');
    await expect(field).not.toHaveAttribute('data-invalid', '');
    await expect(error).toBeHidden();
    const before = page.url();
    await page.locator(`${ROOT} .rh20-submit`).click();
    await expect(status).toHaveText('Thanks — check your inbox for the next step.');
    await expect(status).toBeVisible();
    expect(page.url()).toBe(before);
    await expect(input).toHaveValue('');
  });

  test('has a real native action and resolvable terms destination', async ({ page }) => {
    await gotoBlock(page);
    await expect(page.locator(`${ROOT} form`)).toHaveAttribute('action', '../../docs/getting-started.html');
    await expect(page.locator(`${ROOT} form`)).toHaveAttribute('method', 'get');
    const terms = page.locator(`${ROOT} .rh20-terms-link`);
    await expect(terms).toHaveAttribute('href', '../../LICENSE');
    expect((await page.request.get(new URL(await terms.getAttribute('href'), page.url()).href)).ok()).toBe(true);
  });

  test('keeps input, submit, and terms touch-safe with visible focus', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    const targets = page.locator(`${ROOT} .rh20-email, ${ROOT} .rh20-submit, ${ROOT} .rh20-terms-link`);
    for (let index = 0; index < await targets.count(); index += 1) {
      const target = targets.nth(index);
      const box = await target.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      await target.focus();
      const style = await target.evaluate((node) => ({ outline: getComputedStyle(node).outlineStyle, shadow: getComputedStyle(node).boxShadow }));
      expect(style.outline !== 'none' || style.shadow !== 'none').toBe(true);
    }
  });

  test('keeps themes coherent and collapses transitions under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      const state = await page.locator(ROOT).evaluate((root) => ({ background: getComputedStyle(root).backgroundColor, color: getComputedStyle(root).color, duration: getComputedStyle(root.querySelector('.rh20-submit')).transitionDuration }));
      expect(state.background).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.color).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.duration.split(',').every((value) => ['0s', '0ms'].includes(value.trim()))).toBe(true);
    }
  });

  test('keeps native form, terms, and image usable without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    expect((await page.goto(`${server.origin}${BLOCK}`))?.ok()).toBe(true);
    await expect(page.locator(`${ROOT} label, ${ROOT} input, ${ROOT} button, ${ROOT} .rh20-terms-link, ${ROOT} img`)).toHaveCount(5);
    await page.locator(`${ROOT} input`).fill('team@example.com');
    const navigation = page.waitForNavigation();
    await page.locator(`${ROOT} .rh20-submit`).click();
    expect((await navigation)?.ok()).toBe(true);
    expect(page.url()).toMatch(/getting-started\.html\?email=team%40example\.com/);
    await context.close();
  });

  test('uses one root-scoped inline module and documented Ren10 primitives', async () => {
    const source = fs.readFileSync(SOURCE, 'utf8');
    for (const token of ['ren-center', 'ren-grid', 'ren-stack', 'ren-switcher', 'ren-frame', 'ren-field', 'ren-btn']) expect(source).toContain(token);
    expect(source).toMatch(/<script type="module">\s*const root = document\.querySelector\('\[data-rh20-root\]'\);/);
    expect((source.match(/document\.querySelector/g) || []).length).toBe(1);
    expect(source).not.toMatch(/React|className|Tailwind|@relume|cloudfront|attachShadow/i);
    expect(source).not.toMatch(/--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-|#[0-9a-f]{3,8}\b/i);
  });

  test('passes axe WCAG 2.1 AA in pristine, invalid, and success states', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    await injectAxe(page);
    const options = { detailedReport: true, detailedReportOptions: { html: true }, axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } };
    await checkA11y(page, ROOT, options);
    await page.locator(`${ROOT} .rh20-submit`).click();
    await checkA11y(page, ROOT, options);
    await page.locator(`${ROOT} .rh20-email`).fill('team@example.com');
    await page.locator(`${ROOT} .rh20-submit`).click();
    await checkA11y(page, ROOT, options);
  });
});
