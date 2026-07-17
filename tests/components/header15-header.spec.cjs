// @ts-check
const path = require('node:path');
const { test, expect, request } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-split-copy-dual-cta-landscape-image.html';

test.describe('Relume Header 15 translated to Ren10', () => {
  let server;

  test.beforeAll(async () => { server = await startStaticServer(ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page) {
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header15`);
    expect(response?.status(), 'Header15 block must resolve').toBe(200);
    await expect(page.locator('[data-rh15-root]')).toBeVisible();
  }

  test('owns the exact content hero, split copy, two actions, and image anatomy', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator('[data-rh15-root]');
    await expect(root).toHaveCount(1);
    await expect(root.locator('.rh15-container')).toHaveCount(1);
    await expect(root.locator('.rh15-copy-layout')).toHaveCount(1);
    await expect(root.locator('h1.rh15-heading')).toHaveCount(1);
    await expect(root.locator('p.rh15-description')).toHaveCount(1);
    await expect(root.locator('.rh15-actions')).toHaveCount(1);
    await expect(root.locator('.rh15-actions > a.ren-btn[href]')).toHaveCount(2);
    await expect(root.locator('figure.rh15-media')).toHaveCount(1);
    await expect(root.locator('.rh15-media > img')).toHaveCount(1);
    await expect(root.locator('nav, header, form, video, dialog, [class*="overlay"], [class*="scrim"], [class*="brand"], [class*="logo"]')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh15-heading');
  });

  test('uses one owned meaningful landscape cover image', async ({ page }) => {
    await gotoBlock(page);
    const image = page.locator('.rh15-media > img');
    await expect(image).toHaveAttribute('src', /^media\/hero-[a-z0-9-]+\.(?:png|webp)$/);
    await expect(image).toHaveAttribute('alt', /\S+/);
    await expect(image).toHaveAttribute('width', /^\d+$/);
    await expect(image).toHaveAttribute('height', /^\d+$/);
    const state = await image.evaluate((node) => {
      const imageRect = node.getBoundingClientRect();
      const frameRect = node.parentElement.getBoundingClientRect();
      return {
        complete: node.complete,
        naturalWidth: node.naturalWidth,
        objectFit: getComputedStyle(node).objectFit,
        covers: imageRect.width >= frameRect.width - 1 && imageRect.height >= frameRect.height - 1,
        radius: getComputedStyle(node.parentElement).borderRadius,
      };
    });
    expect(state.complete).toBe(true);
    expect(state.naturalWidth).toBeGreaterThan(0);
    expect(state.objectFit).toBe('cover');
    expect(state.covers).toBe(true);
    expect(state.radius).not.toBe('0px');
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`remains content-height, aligned, and overflow-free at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width >= 768 ? 900 : 844 });
      await gotoBlock(page);
      const state = await page.locator('[data-rh15-root]').evaluate((root) => {
        const rootRect = root.getBoundingClientRect();
        const containerRect = root.querySelector('.rh15-container').getBoundingClientRect();
        const copyRect = root.querySelector('.rh15-copy-layout').getBoundingClientRect();
        const mediaRect = root.querySelector('.rh15-media').getBoundingClientRect();
        return {
          computedMinHeight: getComputedStyle(root).minHeight,
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rootOverflow: root.scrollWidth - root.clientWidth,
          containerInside: containerRect.left >= rootRect.left && containerRect.right <= rootRect.right + 1,
          sourceOrder: mediaRect.top >= copyRect.bottom - 1,
          mediaContained: mediaRect.width <= copyRect.width + 1,
          mediaCentered: Math.abs(
            (mediaRect.left + mediaRect.right) / 2 - (copyRect.left + copyRect.right) / 2
          ) <= 1,
          mediaVisible: mediaRect.height > 120,
        };
      });
      expect(state.computedMinHeight).toBe('0px');
      expect(state.pageOverflow).toBeLessThanOrEqual(1);
      expect(state.rootOverflow).toBeLessThanOrEqual(1);
      expect(state.containerInside).toBe(true);
      expect(state.sourceOrder).toBe(true);
      expect(state.mediaContained).toBe(true);
      expect(state.mediaCentered).toBe(true);
      expect(state.mediaVisible).toBe(true);
    });
  }

  test('stacks copy before 768px and splits heading left from support at medium', async ({ page }) => {
    await page.setViewportSize({ width: 767, height: 900 });
    await gotoBlock(page);
    const narrow = await page.locator('.rh15-copy-layout').evaluate((layout) => {
      const heading = layout.querySelector('.rh15-heading').getBoundingClientRect();
      const support = layout.querySelector('.rh15-support').getBoundingClientRect();
      return support.top >= heading.bottom - 1;
    });
    expect(narrow).toBe(true);

    await page.setViewportSize({ width: 768, height: 900 });
    const wide = await page.locator('.rh15-copy-layout').evaluate((layout) => {
      const heading = layout.querySelector('.rh15-heading').getBoundingClientRect();
      const support = layout.querySelector('.rh15-support').getBoundingClientRect();
      return support.left > heading.left && Math.abs(support.top - heading.top) <= 2;
    });
    expect(wide).toBe(true);
  });

  test('keeps exactly two distinct wrapping CTA destinations', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await gotoBlock(page);
    const links = page.locator('.rh15-actions > a');
    const hrefs = await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
    expect(new Set(hrefs).size).toBe(2);
    const geometry = await page.locator('.rh15-actions').evaluate((group) => {
      const rect = group.getBoundingClientRect();
      return [...group.children].map((child) => {
        const box = child.getBoundingClientRect();
        return { inside: box.left >= rect.left - 1 && box.right <= rect.right + 1, width: box.width, height: box.height };
      });
    });
    expect(geometry.every(({ inside, width, height }) => inside && width >= 44 && height >= 44)).toBe(true);
  });

  test('keeps theme-safe surfaces, visible focus, and 44px targets', async ({ page }) => {
    await gotoBlock(page);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      const state = await page.locator('[data-rh15-root]').evaluate((root) => {
        const links = [...root.querySelectorAll('.rh15-actions a')];
        const boxes = links.map((link) => {
          const rect = link.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        });
        links[0].focus();
        return {
          boxes,
          background: getComputedStyle(root).backgroundColor,
          headingColor: getComputedStyle(root.querySelector('.rh15-heading')).color,
          focusStyle: getComputedStyle(links[0]).outlineStyle,
          focusOffset: Number.parseFloat(getComputedStyle(links[0]).outlineOffset),
        };
      });
      expect(state.boxes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
      expect(state.background).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.headingColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.focusStyle).not.toBe('none');
      expect(state.focusOffset).toBeGreaterThanOrEqual(2);
    }
  });

  test('collapses Ren10 CTA transitions under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);
    const durations = await page.locator('.rh15-actions a').first().evaluate((link) => getComputedStyle(link).transitionDuration.split(',').map((value) => value.trim()));
    expect(durations.every((value) => ['0s', '0ms'].includes(value))).toBe(true);
  });

  test('passes axe WCAG 2.1 AA', async ({ page }) => {
    await gotoBlock(page);
    await injectAxe(page);
    await checkA11y(page, '[data-rh15-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
  });

  test('keeps the image and both destinations complete without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${server.origin}${BLOCK}?ren10_test=header15-no-js`);
    await expect(page.locator('[data-rh15-root]')).toBeVisible();
    await expect(page.locator('.rh15-media img')).toBeVisible();
    await expect(page.locator('.rh15-actions a')).toHaveCount(2);

    const api = await request.newContext();
    for (const destination of ['/docs/index.html', '/templates/blocks/index.html']) {
      const response = await api.get(`${server.origin}${destination}`);
      expect(response.status()).toBe(200);
      expect((await response.body()).length).toBeGreaterThan(0);
    }
    await api.dispose();
    await context.close();
  });
});
