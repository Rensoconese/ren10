// @ts-check
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-fullscreen-bg-left-copy-dual-cta.html';

test.describe('Relume Header 5 translated to Ren10', () => {
  let server;

  test.beforeAll(async () => {
    server = await startStaticServer(ROOT);
  });

  test.afterAll(async () => {
    await server?.close();
  });

  async function gotoBlock(page) {
    await page.goto(`${server.origin}${BLOCK}?ren10_test=header5`);
    await expect(page.locator('[data-rh5-root]')).toBeVisible();
  }

  test('owns exactly one fullscreen hero, copy stack, background, scrim, and two CTAs', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator('[data-rh5-root]');

    await expect(root).toHaveCount(1);
    await expect(root.locator('h1.rh5-heading')).toHaveCount(1);
    await expect(root.locator('p.rh5-description')).toHaveCount(1);
    await expect(root.locator('.rh5-actions > .ren-btn')).toHaveCount(2);
    await expect(root.locator('.rh5-primary')).toHaveCount(1);
    await expect(root.locator('.rh5-secondary')).toHaveCount(1);
    await expect(root.locator('.rh5-background > img')).toHaveCount(1);
    await expect(root.locator('.rh5-scrim')).toHaveCount(1);
    await expect(root.locator('nav, form, .ren-nav-toggle, .dx-brand')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh5-heading');
    await expect(root.locator('.rh5-background')).toHaveAttribute('aria-hidden', 'true');
    await expect(root.locator('.rh5-background img')).toHaveAttribute('alt', '');
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`keeps a controlled centered cover canvas at ${width}px`, async ({ page }) => {
      const height = width >= 768 ? 900 : 844;
      await page.setViewportSize({ width, height });
      await gotoBlock(page);

      const geometry = await page.evaluate(() => {
        const root = document.querySelector('[data-rh5-root]');
        const copy = root?.querySelector('.rh5-copy');
        const background = root?.querySelector('.rh5-background');
        const image = background?.querySelector('img');
        if (!root || !copy || !background || !image) return null;
        const rootRect = root.getBoundingClientRect();
        const copyRect = copy.getBoundingClientRect();
        const backgroundRect = background.getBoundingClientRect();
        const imageStyle = getComputedStyle(image);
        return {
          rootHeight: rootRect.height,
          viewportHeight: innerHeight,
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rootOverflow: root.scrollWidth - root.clientWidth,
          backgroundCovers:
            Math.abs(backgroundRect.left - rootRect.left) <= 1
            && Math.abs(backgroundRect.top - rootRect.top) <= 1
            && Math.abs(backgroundRect.width - rootRect.width) <= 1
            && Math.abs(backgroundRect.height - rootRect.height) <= 1,
          objectFit: imageStyle.objectFit,
          copyLeft: copyRect.left - rootRect.left,
          copyWidth: copyRect.width,
          verticalDelta: Math.abs(
            (copyRect.top + copyRect.height / 2) - (rootRect.top + rootRect.height / 2)
          ),
        };
      });

      expect(geometry).toBeTruthy();
      expect(geometry.rootHeight).toBeGreaterThanOrEqual(500);
      expect(geometry.rootHeight).toBeLessThanOrEqual(710);
      expect(geometry.pageOverflow).toBeLessThanOrEqual(1);
      expect(geometry.rootOverflow).toBeLessThanOrEqual(1);
      expect(geometry.backgroundCovers).toBe(true);
      expect(geometry.objectFit).toBe('cover');
      expect(geometry.copyLeft).toBeGreaterThanOrEqual(16);
      expect(geometry.copyWidth).toBeLessThanOrEqual(480);
      expect(geometry.verticalDelta).toBeLessThanOrEqual(40);
    });
  }

  test('keeps both CTAs keyboard-visible and at least 44px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoBlock(page);
    const actions = page.locator('[data-rh5-root] .rh5-actions > .ren-btn');

    for (let index = 0; index < 2; index += 1) {
      const box = await actions.nth(index).boundingBox();
      expect(box).toBeTruthy();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    for (let index = 0; index < 2; index += 1) {
      await actions.nth(index).focus();
      await expect(actions.nth(index)).toBeFocused();
      const focusChrome = await actions.nth(index).evaluate((element) => {
        const style = getComputedStyle(element);
        const heading = element.closest('[data-rh5-root]')?.querySelector('.rh5-heading');
        return {
          outlineStyle: style.outlineStyle,
          outlineColor: style.outlineColor,
          outlineOffset: Number.parseFloat(style.outlineOffset),
          invertedText: heading ? getComputedStyle(heading).color : '',
        };
      });
      expect(focusChrome.outlineStyle).not.toBe('none');
      expect(focusChrome.outlineColor).toBe(focusChrome.invertedText);
      expect(focusChrome.outlineOffset).toBeGreaterThanOrEqual(2);
    }
  });

  test('keeps readable overlay contrast in light and dark modes with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      const state = await page.locator('[data-rh5-root]').evaluate((root) => {
        const heading = root.querySelector('.rh5-heading');
        const primary = root.querySelector('.rh5-primary');
        const scrim = root.querySelector('.rh5-scrim');

        const compositeOverWhite = (cssColors) => {
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          context.fillStyle = 'rgb(255, 255, 255)';
          context.fillRect(0, 0, 1, 1);
          for (const cssColor of cssColors) {
            context.fillStyle = cssColor;
            context.fillRect(0, 0, 1, 1);
          }
          return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
        };

        const rgb = (cssColor) => {
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          context.fillStyle = cssColor;
          context.fillRect(0, 0, 1, 1);
          return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
        };

        const luminance = (channels) => {
          const [red, green, blue] = channels.map((channel) => {
            const value = channel / 255;
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        };

        const contrast = (first, second) => {
          const lighter = Math.max(luminance(first), luminance(second));
          const darker = Math.min(luminance(first), luminance(second));
          return (lighter + 0.05) / (darker + 0.05);
        };

        const headingColor = getComputedStyle(heading).color;
        const scrimStyle = getComputedStyle(scrim);
        const scrimLayers = scrimStyle.backgroundImage === 'none' ? 1 : 2;
        const worstCaseSurface = compositeOverWhite(
          Array.from({ length: scrimLayers }, () => scrimStyle.backgroundColor)
        );
        const invertedText = rgb(headingColor);
        primary.focus();
        const focusRing = rgb(getComputedStyle(primary).outlineColor);
        return {
          headingColor,
          primaryBackground: getComputedStyle(primary).backgroundColor,
          transitionDuration: getComputedStyle(primary).transitionDuration,
          scrimLayers,
          textContrast: contrast(invertedText, worstCaseSurface),
          focusContrast: contrast(focusRing, worstCaseSurface),
        };
      });
      expect(state.headingColor).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.primaryBackground).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.scrimLayers).toBe(2);
      expect(state.textContrast).toBeGreaterThanOrEqual(4.5);
      expect(state.focusContrast).toBeGreaterThanOrEqual(3);
      expect(state.transitionDuration.split(',').every((value) => ['0s', '0ms'].includes(value.trim()))).toBe(true);
    }
  });

  test('passes axe WCAG 2.1 AA in the hero', async ({ page }) => {
    await gotoBlock(page);
    await injectAxe(page);
    await checkA11y(page, '[data-rh5-root]', {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
    });
  });

  test('remains complete without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto(`${server.origin}${BLOCK}?ren10_test=header5-no-js`);
    await expect(page.locator('[data-rh5-root] h1')).toBeVisible();
    await expect(page.locator('[data-rh5-root] .rh5-actions > .ren-btn')).toHaveCount(2);
    await expect(page.locator('[data-rh5-root] .rh5-background img')).toBeVisible();
    await context.close();
  });
});
