// @ts-check
const path = require('node:path');
const { test, expect, request } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-cover-image-email-split-band.html';

test.describe('Relume Header 10 translated to Ren10', () => {
  let server;

  test.beforeAll(async () => { server = await startStaticServer(ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page) {
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header10`);
    expect(response?.status(), 'Header10 block must resolve').toBe(200);
    await expect(page.locator('[data-rh10-root]')).toBeVisible();
  }

  test('owns the exact vertical hero, image, band, copy, form, and action anatomy', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator('[data-rh10-root]');
    await expect(root).toHaveCount(1);
    await expect(root.locator('.rh10-media > img')).toHaveCount(1);
    await expect(root.locator('.rh10-band')).toHaveCount(1);
    await expect(root.locator('h1.rh10-heading')).toHaveCount(1);
    await expect(root.locator('p.rh10-description')).toHaveCount(1);
    await expect(root.locator('form.rh10-form')).toHaveCount(1);
    await expect(root.locator('label')).toHaveCount(1);
    await expect(root.locator('input.rh10-email[type="email"]')).toHaveCount(1);
    await expect(root.locator('button.rh10-submit[type="submit"]')).toHaveCount(1);
    await expect(root.locator('.rh10-terms a[href]')).toHaveCount(1);
    await expect(root.locator('form button')).toHaveCount(1);
    await expect(root.locator('nav, header, video, [class*="scrim"], [class*="brand"], [class*="logo"]')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh10-heading');
  });

  test('uses an owned image with meaningful alternative text and cover geometry', async ({ page }) => {
    await gotoBlock(page);
    const image = page.locator('.rh10-media > img');
    await expect(image).toHaveAttribute('src', /^media\/hero-[a-z0-9-]+\.(?:png|webp)$/);
    await expect(image).toHaveAttribute('alt', /\S+/);
    const state = await image.evaluate((node) => ({
      complete: node.complete,
      naturalWidth: node.naturalWidth,
      objectFit: getComputedStyle(node).objectFit,
      position: getComputedStyle(node).position,
    }));
    expect(state.complete).toBe(true);
    expect(state.naturalWidth).toBeGreaterThan(0);
    expect(state.objectFit).toBe('cover');
    expect(state.position).toBe('absolute');
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`keeps a controlled contiguous media canvas without overflow at ${width}px`, async ({ page }) => {
      const height = width >= 768 ? 900 : 844;
      await page.setViewportSize({ width, height });
      await gotoBlock(page);
      const state = await page.locator('[data-rh10-root]').evaluate((root) => {
        const rootRect = root.getBoundingClientRect();
        const mediaRect = root.querySelector('.rh10-media').getBoundingClientRect();
        const bandRect = root.querySelector('.rh10-band').getBoundingClientRect();
        const imageRect = root.querySelector('.rh10-media img').getBoundingClientRect();
        return {
          rootHeight: rootRect.height,
          rootContentHeight: root.clientHeight,
          viewportHeight: innerHeight,
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rootOverflow: root.scrollWidth - root.clientWidth,
          mediaHeight: mediaRect.height,
          contiguous: Math.abs(mediaRect.bottom - bandRect.top) <= 1,
          fillsRemainder: Math.abs(mediaRect.height + bandRect.height - root.clientHeight) <= 1,
          imageCovers: imageRect.width >= mediaRect.width - 1 && imageRect.height >= mediaRect.height - 1,
        };
      });
      expect(state.rootHeight).toBeGreaterThanOrEqual(500);
      expect(state.rootHeight).toBeLessThanOrEqual(900);
      expect(state.pageOverflow).toBeLessThanOrEqual(1);
      expect(state.rootOverflow).toBeLessThanOrEqual(1);
      expect(state.mediaHeight).toBeGreaterThanOrEqual(120);
      expect(state.contiguous).toBe(true);
      expect(state.fillsRemainder).toBe(true);
      expect(state.imageCovers).toBe(true);
    });
  }

  test('stacks the band narrowly and splits heading left from content right when wide', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoBlock(page);
    const narrow = await page.locator('.rh10-band-layout').evaluate((layout) => {
      const heading = layout.querySelector('.rh10-heading').getBoundingClientRect();
      const content = layout.querySelector('.rh10-support').getBoundingClientRect();
      return { stacked: content.top >= heading.bottom - 1 };
    });
    expect(narrow.stacked).toBe(true);

    await page.setViewportSize({ width: 1280, height: 900 });
    const wide = await page.locator('.rh10-band-layout').evaluate((layout) => {
      const heading = layout.querySelector('.rh10-heading').getBoundingClientRect();
      const content = layout.querySelector('.rh10-support').getBoundingClientRect();
      return { split: content.left > heading.left && Math.abs(content.top - heading.top) <= 2 };
    });
    expect(wide.split).toBe(true);
  });

  test('stacks the field and submit narrowly, then bottom-aligns them in one row', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoBlock(page);
    const narrow = await page.locator('.rh10-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect();
      const button = row.querySelector('.rh10-submit').getBoundingClientRect();
      return { stacked: button.top >= field.bottom - 1 };
    });
    expect(narrow.stacked).toBe(true);

    await page.setViewportSize({ width: 768, height: 900 });
    const wide = await page.locator('.rh10-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect();
      const button = row.querySelector('.rh10-submit').getBoundingClientRect();
      return { sameRow: button.top < field.bottom && Math.abs(button.bottom - field.bottom) <= 2 };
    });
    expect(wide.sameRow).toBe(true);
  });

  test('keeps readable theme surfaces, visible focus, and 44px targets', async ({ page }) => {
    await gotoBlock(page);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      const state = await page.locator('[data-rh10-root]').evaluate((root) => {
        const targets = [...root.querySelectorAll('input, button, a')];
        const boxes = targets.map((target) => {
          const rect = target.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        });
        const band = root.querySelector('.rh10-band');
        const heading = root.querySelector('.rh10-heading');
        const link = root.querySelector('.rh10-terms a');
        link.focus();
        return {
          boxes,
          bandBg: getComputedStyle(band).backgroundColor,
          headingColor: getComputedStyle(heading).color,
          focusStyle: getComputedStyle(link).outlineStyle,
          focusOffset: Number.parseFloat(getComputedStyle(link).outlineOffset),
        };
      });
      expect(state.boxes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
      expect(state.bandBg).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.headingColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.focusStyle).not.toBe('none');
      expect(state.focusOffset).toBeGreaterThanOrEqual(2);
    }
  });

  test('collapses Ren10 control transitions under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);
    const durations = await page.locator('.rh10-submit').evaluate((button) => getComputedStyle(button).transitionDuration.split(',').map((value) => value.trim()));
    expect(durations.every((value) => ['0s', '0ms'].includes(value))).toBe(true);
  });

  test('submits a valid address as an enhanced inline confirmation', async ({ page }) => {
    await gotoBlock(page);
    await page.locator('.rh10-email').fill('reader@example.com');
    await page.locator('.rh10-submit').click();
    await expect(page.locator('.rh10-form-status')).toBeVisible();
    await expect(page.locator('.rh10-form-status')).toContainText(/Thanks/i);
    expect(new URL(page.url()).pathname).toBe(BLOCK);
  });

  test('passes axe WCAG 2.1 AA', async ({ page }) => {
    await gotoBlock(page);
    await injectAxe(page);
    await checkA11y(page, '[data-rh10-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
  });

  test('keeps image, native form, and owned destinations without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${server.origin}${BLOCK}?ren10_test=header10-no-js`);
    await expect(page.locator('[data-rh10-root]')).toBeVisible();
    await expect(page.locator('.rh10-media img')).toBeVisible();
    await expect(page.locator('.rh10-form')).toHaveAttribute('action', '../../docs/getting-started.html');
    await expect(page.locator('.rh10-terms a')).toHaveAttribute('href', '../../LICENSE');

    const api = await request.newContext();
    for (const destination of ['/docs/getting-started.html?email=reader%40example.com', '/LICENSE']) {
      const response = await api.get(`${server.origin}${destination}`);
      expect(response.status()).toBe(200);
      expect((await response.body()).length).toBeGreaterThan(0);
    }
    await api.dispose();
    await context.close();
  });
});
