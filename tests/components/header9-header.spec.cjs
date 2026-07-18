// @ts-check
const path = require('node:path');
const { readFileSync } = require('node:fs');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-fullscreen-media-top-copy-band-dual-cta.html';
const ROOT = '[data-rh9-root]';

test.describe('Relume Header 9 translated to Ren10', () => {
  let server;

  test.beforeAll(async () => {
    server = await startStaticServer(ROOT_DIR);
  });

  test.afterAll(async () => {
    await server?.close();
  });

  async function gotoBlock(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header9`);
    expect(response?.ok(), 'Header9 block must load').toBe(true);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns the exact media-first and copy-band anatomy', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);

    await expect(root).toHaveCount(1);
    await expect(root.locator(':scope > .rh9-media')).toHaveCount(1);
    await expect(root.locator('.rh9-media img')).toHaveCount(1);
    await expect(root.locator(':scope > .rh9-band')).toHaveCount(1);
    await expect(root.locator('h1.rh9-heading')).toHaveCount(1);
    await expect(root.locator('p.rh9-description')).toHaveCount(1);
    await expect(root.locator('.rh9-actions a[href]')).toHaveCount(2);
    await expect(root.locator('nav, form, label, input, .scrim, [class*="overlay"], video, iframe, dialog, .dx-brand, [class*="logo"]')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh9-heading');
  });

  test('keeps media, heading, copy, and CTA source order without duplicate trees', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    const order = await page.locator(ROOT).evaluate((root) => {
      const media = root.querySelector('.rh9-media');
      const heading = root.querySelector('.rh9-heading');
      const description = root.querySelector('.rh9-description');
      const actions = root.querySelector('.rh9-actions');
      const position = (node) => [...root.querySelectorAll('*')].indexOf(node);
      return [media, heading, description, actions].map(position);
    });
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(new Set(order).size).toBe(4);
  });

  test('uses exactly two distinct real CTA destinations', async ({ page }) => {
    await gotoBlock(page);
    const actions = page.locator(`${ROOT} .rh9-actions a`);
    await expect(actions.nth(0)).toHaveAttribute('href', '../../docs/index.html');
    await expect(actions.nth(1)).toHaveAttribute('href', 'index.html');
    await expect(actions.nth(0)).toHaveClass(/\bren-btn\b/);
    await expect(actions.nth(1)).toHaveClass(/\bren-btn-outline\b/);

    const hrefs = await actions.evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(new Set(hrefs).size).toBe(2);
    for (const href of hrefs) {
      const response = await page.request.get(new URL(href, page.url()).href);
      expect(response.ok(), `${href} must resolve`).toBe(true);
    }
  });

  test('keeps both CTA destinations usable without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    expect((await page.goto(`${server.origin}${BLOCK}?ren10_test=header9-no-js`, {
      waitUntil: 'domcontentloaded',
    }))?.ok()).toBe(true);
    const actions = page.locator(`${ROOT} .rh9-actions a`);
    await expect(actions).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      const href = await actions.nth(index).getAttribute('href');
      expect((await page.request.get(new URL(href, page.url()).href)).ok()).toBe(true);
    }
    await context.close();
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`keeps a controlled canvas and lets top media consume remaining height at ${width}px`, async ({ page }) => {
      const height = width === 320 ? 720 : width < 768 ? 844 : 900;
      await gotoBlock(page, width, height);
      const geometry = await page.locator(ROOT).evaluate((root) => {
        const media = root.querySelector('.rh9-media');
        const image = media.querySelector('img');
        const band = root.querySelector('.rh9-band');
        const rootRect = root.getBoundingClientRect();
        const mediaRect = media.getBoundingClientRect();
        const bandRect = band.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();
        return {
          viewportHeight: innerHeight,
          rootHeight: rootRect.height,
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rootOverflow: root.scrollWidth - root.clientWidth,
          mediaHeight: mediaRect.height,
          mediaFirst: mediaRect.top <= bandRect.top,
          adjacent: Math.abs(mediaRect.bottom - bandRect.top),
          bandBottom: Math.abs(bandRect.bottom - rootRect.bottom),
          imageCovers: Math.abs(imageRect.width - mediaRect.width) <= 1 && Math.abs(imageRect.height - mediaRect.height) <= 1,
          objectFit: getComputedStyle(image).objectFit,
        };
      });
      expect(geometry.rootHeight).toBeGreaterThanOrEqual(500);
      expect(geometry.rootHeight).toBeLessThanOrEqual(904);
      expect(geometry.pageOverflow).toBeLessThanOrEqual(1);
      expect(geometry.rootOverflow).toBeLessThanOrEqual(1);
      expect(geometry.mediaHeight).toBeGreaterThan(120);
      expect(geometry.mediaFirst).toBe(true);
      expect(geometry.adjacent).toBeLessThanOrEqual(1);
      expect(geometry.bandBottom).toBeLessThanOrEqual(1.01);
      expect(geometry.imageCovers).toBe(true);
      expect(geometry.objectFit).toBe('cover');
    });
  }

  test('stacks copy on mobile and forms two top-aligned columns from 768px', async ({ page }) => {
    await gotoBlock(page, 767, 900);
    const mobile = await page.locator('.rh9-band-layout').evaluate((layout) => {
      const heading = layout.querySelector('.rh9-heading').getBoundingClientRect();
      const body = layout.querySelector('.rh9-body').getBoundingClientRect();
      return { bodyTop: body.top, headingBottom: heading.bottom, leftDelta: Math.abs(body.left - heading.left) };
    });
    expect(mobile.bodyTop).toBeGreaterThan(mobile.headingBottom);
    expect(mobile.leftDelta).toBeLessThanOrEqual(1);

    await gotoBlock(page, 768, 1024);
    const desktop = await page.locator('.rh9-band-layout').evaluate((layout) => {
      const heading = layout.querySelector('.rh9-heading').getBoundingClientRect();
      const body = layout.querySelector('.rh9-body').getBoundingClientRect();
      return { topDelta: Math.abs(body.top - heading.top), bodyLeft: body.left, headingRight: heading.right, widths: [heading.width, body.width] };
    });
    expect(desktop.topDelta).toBeLessThanOrEqual(1);
    expect(desktop.bodyLeft).toBeGreaterThan(desktop.headingRight);
    expect(Math.abs(desktop.widths[0] - desktop.widths[1])).toBeLessThanOrEqual(2);
  });

  test('keeps both CTA touch targets and keyboard focus visible', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    const actions = page.locator(`${ROOT} .rh9-actions a`);
    for (let index = 0; index < 2; index += 1) {
      const action = actions.nth(index);
      const box = await action.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
      await action.focus();
      await expect(action).toBeFocused();
      const chrome = await action.evaluate((element) => {
        const style = getComputedStyle(element);
        return { outline: style.outlineStyle, shadow: style.boxShadow, border: style.borderColor };
      });
      expect(chrome.outline !== 'none' || chrome.shadow !== 'none').toBe(true);
      expect(chrome.border).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('supports light/dark themes and reduced motion without altered anatomy', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      const state = await page.locator(ROOT).evaluate((root) => {
        const band = root.querySelector('.rh9-band');
        const actions = [...root.querySelectorAll('.rh9-actions a')];
        return {
          bandBackground: getComputedStyle(band).backgroundColor,
          textColor: getComputedStyle(root.querySelector('.rh9-heading')).color,
          durations: actions.map((action) => getComputedStyle(action).transitionDuration),
          count: actions.length,
        };
      });
      expect(state.bandBackground).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.textColor).not.toBe(state.bandBackground);
      expect(state.count).toBe(2);
      for (const durations of state.durations) {
        expect(durations.split(',').every((value) => ['0s', '0ms'].includes(value.trim()))).toBe(true);
      }
    }
  });

  test('uses documented Ren10 primitives and excludes copied source leakage', async () => {
    const source = readFileSync(path.join(ROOT_DIR, 'templates/blocks/hero-fullscreen-media-top-copy-band-dual-cta.html'), 'utf8');
    expect(source).toContain('--cover-height: 100svh');
    expect(source).toContain('ren-cover');
    expect(source).toContain('ren-frame');
    expect(source).toContain('ren-center');
    expect(source).toContain('ren-grid');
    expect(source).toContain('ren-stack');
    expect(source).toContain('ren-cluster');
    expect(source).not.toMatch(/(?:React|className|Tailwind|@relume|cloudfront|placeholder-image|dangerouslySetInnerHTML)/i);
    expect(source).not.toMatch(/--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/);
    expect(source).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  test('passes axe WCAG 2.1 AA', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    await injectAxe(page);
    await checkA11y(page, ROOT, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
  });
});
