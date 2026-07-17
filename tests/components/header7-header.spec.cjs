// @ts-check
const path = require('node:path');
const fs = require('node:fs');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-fullscreen-bg-video-left-copy-dual-cta.html';
const SELECTOR = '[data-rh7-root]';

test.describe('Relume Header 7 translated to Ren10', () => {
  let server;

  test.beforeAll(async () => {
    server = await startStaticServer(ROOT);
  });

  test.afterAll(async () => {
    await server?.close();
  });

  async function gotoBlock(page) {
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header7`);
    expect(response?.status(), 'Header7 block must exist').toBe(200);
    await expect(page.locator(SELECTOR)).toBeVisible();
  }

  test('owns the exact source-derived video hero anatomy', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(SELECTOR);
    const video = root.locator('video.rh7-video');

    await expect(root).toHaveCount(1);
    await expect(root.locator('h1.rh7-heading')).toHaveCount(1);
    await expect(root.locator('p.rh7-description')).toHaveCount(1);
    await expect(root.locator('.rh7-actions > .ren-btn')).toHaveCount(2);
    await expect(root.locator('.rh7-primary')).toHaveCount(1);
    await expect(root.locator('.rh7-secondary')).toHaveCount(1);
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute('autoplay', '');
    await expect(video).toHaveAttribute('loop', '');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveJSProperty('muted', true);
    await expect(video.locator('source[type="video/webm"]')).toHaveCount(1);
    await expect(root.locator('.rh7-scrim')).toHaveCount(1);
    await expect(root.locator('.rh7-motion')).toHaveCount(1);
    await expect(root.locator('nav, form, img, [class*="brand"], [class*="logo"]')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh7-heading');
  });

  test('uses a deterministic playable permitted video source', async ({ page }) => {
    await gotoBlock(page);
    const state = await expect.poll(() => page.locator(`${SELECTOR} video`).evaluate((video) => {
      const source = video.querySelector('source');
      return {
        source: source?.getAttribute('src') || '',
        type: source?.getAttribute('type') || '',
        playable: video.canPlayType(source?.getAttribute('type') || ''),
        duration: video.duration,
      };
    })).toMatchObject({
      source: expect.stringMatching(/^data:video\/webm;base64,/),
      type: 'video/webm',
      playable: expect.stringMatching(/maybe|probably/),
      duration: expect.any(Number),
    });
    void state;
    expect(await page.locator(`${SELECTOR} video`).evaluate((video) => Number.isFinite(video.duration) && video.duration > 0)).toBe(true);
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`keeps a controlled cover-video canvas with centered left copy at ${width}px`, async ({ page }) => {
      const height = width >= 768 ? 900 : 844;
      await page.setViewportSize({ width, height });
      await gotoBlock(page);
      const geometry = await page.locator(SELECTOR).evaluate((root) => {
        const copy = root.querySelector('.rh7-copy');
        const background = root.querySelector('.rh7-background');
        const video = root.querySelector('.rh7-video');
        const rootRect = root.getBoundingClientRect();
        const copyRect = copy.getBoundingClientRect();
        const backgroundRect = background.getBoundingClientRect();
        return {
          rootHeight: rootRect.height,
          viewportHeight: innerHeight,
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rootOverflow: root.scrollWidth - root.clientWidth,
          backgroundCovers:
            Math.abs(backgroundRect.left - rootRect.left) <= 1
            && Math.abs(backgroundRect.top - rootRect.top) <= 1
            && Math.abs(backgroundRect.width - rootRect.width) <= 2
            && Math.abs(backgroundRect.height - rootRect.height) <= 2,
          objectFit: getComputedStyle(video).objectFit,
          copyLeft: copyRect.left - rootRect.left,
          copyWidth: copyRect.width,
          verticalDelta: Math.abs(
            (copyRect.top + copyRect.height / 2) - (rootRect.top + rootRect.height / 2)
          ),
        };
      });

      expect(geometry.rootHeight).toBeGreaterThanOrEqual(500);
      expect(geometry.rootHeight).toBeLessThanOrEqual(710);
      expect(geometry.pageOverflow).toBeLessThanOrEqual(1);
      expect(geometry.rootOverflow).toBeLessThanOrEqual(1);
      expect(geometry.backgroundCovers).toBe(true);
      expect(geometry.objectFit).toBe('cover');
      expect(geometry.copyLeft).toBeGreaterThanOrEqual(16);
      expect(geometry.copyWidth).toBeLessThanOrEqual(448);
      expect(geometry.verticalDelta).toBeLessThanOrEqual(40);
    });
  }

  test('resolves both CTA destinations and keeps all controls focus-visible and 44px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoBlock(page);
    const ctas = page.locator(`${SELECTOR} .rh7-actions > .ren-btn`);
    for (let index = 0; index < 2; index += 1) {
      const href = await ctas.nth(index).getAttribute('href');
      const response = await page.request.get(new URL(href, page.url()).href);
      expect(response.ok()).toBe(true);
    }

    const controls = page.locator(`${SELECTOR} .rh7-actions > .ren-btn, ${SELECTOR} .rh7-motion`);
    for (let index = 0; index < await controls.count(); index += 1) {
      const control = controls.nth(index);
      const box = await control.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      await control.focus();
      await expect(control).toBeFocused();
      expect(await control.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
    }
  });

  test('autoplays when allowed and exposes a working pause control', async ({ page }) => {
    await gotoBlock(page);
    const video = page.locator(`${SELECTOR} video`);
    const motion = page.locator(`${SELECTOR} .rh7-motion`);
    await expect(motion).toBeVisible();
    await expect.poll(() => video.evaluate((element) => element.paused)).toBe(false);
    await motion.click();
    await expect.poll(() => video.evaluate((element) => element.paused)).toBe(true);
    await expect(motion).toHaveAttribute('aria-label', 'Play background video');
    await motion.click();
    await expect.poll(() => video.evaluate((element) => element.paused)).toBe(false);
    await expect(motion).toHaveAttribute('aria-label', 'Pause background video');
  });

  test('starts paused for reduced motion and allows an explicit play override', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);
    const video = page.locator(`${SELECTOR} video`);
    const motion = page.locator(`${SELECTOR} .rh7-motion`);
    await expect.poll(() => video.evaluate((element) => element.paused)).toBe(true);
    await expect(motion).toHaveAttribute('aria-label', 'Play background video');
    await motion.click();
    await expect.poll(() => video.evaluate((element) => element.paused)).toBe(false);
    expect(await motion.evaluate((element) => getComputedStyle(element).transitionDuration))
      .toMatch(/^(0s|0ms)(, (0s|0ms))*$/);
  });

  test('keeps overlay contrast and theme-independent foreground semantics', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      const state = await page.locator(SELECTOR).evaluate((root) => {
        const heading = root.querySelector('.rh7-heading');
        const scrim = root.querySelector('.rh7-scrim');
        const primary = root.querySelector('.rh7-primary');
        const readRgb = (cssColor) => {
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          context.fillStyle = cssColor;
          context.fillRect(0, 0, 1, 1);
          return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
        };
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
        const scrimStyle = getComputedStyle(scrim);
        const worstCaseSurface = compositeOverWhite([
          scrimStyle.backgroundColor,
          scrimStyle.backgroundColor,
        ]);
        primary.focus();
        return {
          heading: getComputedStyle(heading).color,
          scrim: scrimStyle.backgroundColor,
          primary: getComputedStyle(primary).backgroundColor,
          primaryContrast: contrast(
            readRgb(getComputedStyle(primary).color),
            readRgb(getComputedStyle(primary).backgroundColor)
          ),
          textContrast: contrast(readRgb(getComputedStyle(heading).color), worstCaseSurface),
          focusContrast: contrast(readRgb(getComputedStyle(primary).outlineColor), worstCaseSurface),
        };
      });
      expect(state.heading).toBe('rgb(255, 255, 255)');
      expect(state.scrim).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.primary).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.primaryContrast).toBeGreaterThanOrEqual(4.5);
      expect(state.textContrast).toBeGreaterThanOrEqual(4.5);
      expect(state.focusContrast).toBeGreaterThanOrEqual(3);
    }
  });

  test('keeps the primary CTA on documented semantic and component tokens', async () => {
    const source = fs.readFileSync(
      path.join(ROOT, 'templates/blocks/hero-fullscreen-bg-video-left-copy-dual-cta.html'),
      'utf8'
    );
    expect(source).not.toMatch(/\bCanvas(?:Text)?\b/);
    expect(source).not.toMatch(/--ren-btn-duration\s*:\s*(?:0ms|0s)/);
    expect(source).not.toMatch(/animation\s*:\s*none/);
    expect(source).not.toMatch(/transition-duration\s*:\s*(?:0ms|0s)/);
    expect(source).toContain('--ren-btn-bg: var(--color-accent)');
    expect(source).toContain('--ren-btn-bg-hover: var(--color-accent-hover)');
    expect(source).toContain('--ren-btn-bg-active: var(--color-accent-active)');
    expect(source).toContain('--ren-btn-color: var(--color-on-accent)');
  });

  test('keeps both CTA final states differentiated and AA in light and dark', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      const states = {};

      for (const name of ['primary', 'secondary']) {
        const control = page.locator(`${SELECTOR} .rh7-${name}`);
        const readState = () => control.evaluate((element) => {
          const root = element.closest('[data-rh7-root]');
          const scrim = root.querySelector('.rh7-scrim');
          const style = getComputedStyle(element);
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          const paint = (colors) => {
            context.clearRect(0, 0, 1, 1);
            context.fillStyle = 'rgb(255, 255, 255)';
            context.fillRect(0, 0, 1, 1);
            for (const color of colors) {
              context.fillStyle = color;
              context.fillRect(0, 0, 1, 1);
            }
            return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
          };
          const luminance = (channels) => channels
            .map((channel) => {
              const value = channel / 255;
              return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
            })
            .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
          const scrimColor = getComputedStyle(scrim).backgroundColor;
          const surface = style.backgroundColor === 'rgba(0, 0, 0, 0)'
            ? paint([scrimColor, scrimColor])
            : paint([style.backgroundColor]);
          const foreground = paint([style.color]);
          const lighter = Math.max(luminance(surface), luminance(foreground));
          const darker = Math.min(luminance(surface), luminance(foreground));
          return {
            background: style.backgroundColor,
            color: style.color,
            contrast: (lighter + 0.05) / (darker + 0.05),
            duration: style.transitionDuration,
          };
        });

        await page.mouse.move(0, 0);
        states[name] = { rest: await readState() };
        await control.hover();
        states[name].hover = await readState();
        const box = await control.boundingBox();
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        states[name].active = await readState();
        await page.mouse.move(0, 0);
        await page.mouse.up();

        const backgrounds = Object.values(states[name]).map((state) => state.background);
        expect(new Set(backgrounds).size, `${theme} ${name} must expose three backgrounds`).toBe(3);
        for (const [stateName, state] of Object.entries(states[name])) {
          expect(state.contrast, `${theme} ${name} ${stateName} contrast`).toBeGreaterThanOrEqual(4.5);
          expect(state.duration).toMatch(/^(0s|0ms)(, (0s|0ms))*$/);
        }
      }

      expect(states.primary.rest.background).not.toBe(states.secondary.rest.background);
    }
  });

  test('passes axe WCAG 2.1 AA in light and dark modes', async ({ page }) => {
    await gotoBlock(page);
    await injectAxe(page);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      await checkA11y(page, SELECTOR, {
        detailedReport: true,
        detailedReportOptions: { html: true },
        axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      });
    }
  });

  test('keeps copy, destinations, video, and native pause controls usable without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header7-no-js`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`${SELECTOR} h1`)).toBeVisible();
    await expect(page.locator(`${SELECTOR} .rh7-actions > .ren-btn`)).toHaveCount(2);
    await expect(page.locator(`${SELECTOR} video`)).toBeVisible();
    await expect(page.locator(`${SELECTOR} video`)).toHaveJSProperty('controls', true);
    await expect(page.locator(`${SELECTOR} .rh7-motion`)).toBeHidden();
    await context.close();
  });
});
