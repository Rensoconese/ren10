// @ts-check
const path = require('node:path');
const { readFileSync } = require('node:fs');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-fullscreen-bg-left-email-capture.html';
const ROOT = '[data-rh6-root]';

test.describe('Relume Header 6 translated to Ren10', () => {
  let server;

  test.beforeAll(async () => {
    server = await startStaticServer(ROOT_DIR);
  });

  test.afterAll(async () => {
    await server?.close();
  });

  async function gotoBlock(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header6`);
    expect(response?.ok(), 'Header6 block must load').toBe(true);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns exact hero, email capture, legal, cover, and scrim anatomy', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);

    await expect(root).toHaveCount(1);
    await expect(root.locator('h1.rh6-heading')).toHaveCount(1);
    await expect(root.locator('p.rh6-description')).toHaveCount(1);
    await expect(root.locator('form.rh6-form')).toHaveCount(1);
    await expect(root.locator('label[for="rh6-email"]')).toHaveCount(1);
    await expect(root.locator('input#rh6-email[type="email"][name="email"][required]')).toHaveCount(1);
    await expect(root.locator('.rh6-form-row button[type="submit"]')).toHaveCount(1);
    await expect(root.locator('p.rh6-terms')).toHaveCount(1);
    await expect(root.locator('.rh6-terms a[href]')).toHaveCount(1);
    await expect(root.locator('.rh6-background > img[alt=""]')).toHaveCount(1);
    await expect(root.locator('.rh6-scrim')).toHaveCount(1);
    await expect(root.locator('nav, .dx-brand, video, iframe, dialog, details, summary')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh6-heading');
    await expect(root.locator('.rh6-background')).toHaveAttribute('aria-hidden', 'true');
  });

  test('uses real form and terms destinations', async ({ page }) => {
    await gotoBlock(page);
    const form = page.locator(`${ROOT} form`);
    const terms = page.locator(`${ROOT} .rh6-terms a`);

    await expect(form).toHaveAttribute('action', '../../docs/getting-started.html');
    await expect(form).toHaveAttribute('method', 'get');
    await expect(terms).toHaveAttribute('href', '../../LICENSE');

    for (const href of [await form.getAttribute('action'), await terms.getAttribute('href')]) {
      const response = await page.request.get(new URL(href, page.url()).href);
      expect(response.ok(), `${href} must resolve`).toBe(true);
    }
  });

  test('blocks invalid email and enhances valid submission with status and reset', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    const input = page.locator('#rh6-email');
    const submit = page.locator('.rh6-form-row button[type="submit"]');
    const status = page.locator('[data-rh6-status]');
    const originalUrl = page.url();

    await input.fill('not-an-email');
    await submit.click();
    expect(await input.evaluate((element) => element.validity.valid)).toBe(false);
    await expect(status).toBeEmpty();
    expect(page.url()).toBe(originalUrl);

    await input.fill('person@example.com');
    await submit.click();
    await expect(status).toContainText(/thanks|inbox|email/i);
    await expect(input).toHaveValue('');
    expect(page.url()).toBe(originalUrl);
  });

  test('submits to the real fallback destination without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header6-no-js`);
    expect(response?.ok()).toBe(true);

    const input = page.locator('#rh6-email');
    await expect(page.locator(`${ROOT} label[for="rh6-email"]`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rh6-terms a`)).toBeVisible();
    await input.fill('fallback@example.com');
    await Promise.all([
      page.waitForURL(/\/docs\/getting-started\.html\?email=fallback%40example\.com$/),
      page.locator(`${ROOT} button[type="submit"]`).click(),
    ]);
    expect((await page.request.get(page.url())).ok()).toBe(true);
    await context.close();
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`covers viewport and keeps constrained centered copy at ${width}px`, async ({ page }) => {
      const height = width === 320 ? 720 : width < 768 ? 844 : 900;
      await gotoBlock(page, width, height);
      const geometry = await page.locator(ROOT).evaluate((root) => {
        const copy = root.querySelector('.rh6-copy');
        const background = root.querySelector('.rh6-background');
        const image = background?.querySelector('img');
        const rootRect = root.getBoundingClientRect();
        const copyRect = copy.getBoundingClientRect();
        const backgroundRect = background.getBoundingClientRect();
        return {
          rootHeight: rootRect.height,
          viewportHeight: innerHeight,
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rootOverflow: root.scrollWidth - root.clientWidth,
          copyLeft: copyRect.left - rootRect.left,
          copyWidth: copyRect.width,
          centerDelta: Math.abs(
            (copyRect.top + copyRect.height / 2) - (rootRect.top + rootRect.height / 2)
          ),
          backgroundCovers:
            Math.abs(backgroundRect.left - rootRect.left) <= 1
            && Math.abs(backgroundRect.top - rootRect.top) <= 1
            && Math.abs(backgroundRect.width - rootRect.width) <= 1
            && Math.abs(backgroundRect.height - rootRect.height) <= 1,
          objectFit: getComputedStyle(image).objectFit,
        };
      });

      expect(geometry.rootHeight).toBeGreaterThanOrEqual(geometry.viewportHeight - 1);
      expect(geometry.pageOverflow).toBeLessThanOrEqual(1);
      expect(geometry.rootOverflow).toBeLessThanOrEqual(1);
      expect(geometry.copyLeft).toBeGreaterThanOrEqual(16);
      expect(geometry.copyWidth).toBeLessThanOrEqual(448);
      expect(geometry.centerDelta).toBeLessThanOrEqual(40);
      expect(geometry.backgroundCovers).toBe(true);
      expect(geometry.objectFit).toBe('cover');
    });
  }

  test('stacks field and submit narrow then aligns them in one row from small', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    const narrow = await page.locator('.rh6-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect();
      const button = row.querySelector('button').getBoundingClientRect();
      return { fieldBottom: field.bottom, buttonTop: button.top, widths: [field.width, button.width] };
    });
    expect(narrow.buttonTop).toBeGreaterThanOrEqual(narrow.fieldBottom - 1);
    expect(Math.abs(narrow.widths[0] - narrow.widths[1])).toBeLessThanOrEqual(1);

    await gotoBlock(page, 767, 900);
    const wide = await page.locator('.rh6-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect();
      const button = row.querySelector('button').getBoundingClientRect();
      return {
        topDelta: Math.abs(field.bottom - button.bottom),
        fieldRight: field.right,
        buttonLeft: button.left,
        fieldWidth: field.width,
        buttonWidth: button.width,
      };
    });
    expect(wide.topDelta).toBeLessThanOrEqual(1);
    expect(wide.buttonLeft).toBeGreaterThan(wide.fieldRight);
    expect(wide.fieldWidth).toBeGreaterThan(wide.buttonWidth);
  });

  test('keeps input and submit touch targets and keyboard focus visible', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    const controls = page.locator('#rh6-email, .rh6-form-row button[type="submit"]');
    for (let index = 0; index < 2; index += 1) {
      const box = await controls.nth(index).boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
      await controls.nth(index).focus();
      await expect(controls.nth(index)).toBeFocused();
      const chrome = await controls.nth(index).evaluate((element) => {
        const style = getComputedStyle(element);
        return { outline: style.outlineStyle, shadow: style.boxShadow, border: style.borderColor };
      });
      expect(chrome.outline !== 'none' || chrome.shadow !== 'none').toBe(true);
      expect(chrome.border).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('guarantees overlay text contrast and reduced motion in light and dark', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      const result = await page.locator(ROOT).evaluate((root) => {
        const heading = root.querySelector('.rh6-heading');
        const scrim = root.querySelector('.rh6-scrim');
        const input = root.querySelector('#rh6-email');
        const button = root.querySelector('button[type="submit"]');

        const rgb = (cssColor, layers = 1) => {
          const canvas = document.createElement('canvas');
          canvas.width = 1;
          canvas.height = 1;
          const context = canvas.getContext('2d', { willReadFrequently: true });
          context.fillStyle = 'rgb(255, 255, 255)';
          context.fillRect(0, 0, 1, 1);
          for (let index = 0; index < layers; index += 1) {
            context.fillStyle = cssColor;
            context.fillRect(0, 0, 1, 1);
          }
          return [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)];
        };
        const opaqueRgb = (cssColor) => rgb(cssColor, 1);
        const luminance = (channels) => {
          const values = channels.map((channel) => {
            const value = channel / 255;
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
        };
        const contrast = (first, second) => {
          const lighter = Math.max(luminance(first), luminance(second));
          const darker = Math.min(luminance(first), luminance(second));
          return (lighter + 0.05) / (darker + 0.05);
        };

        const scrimStyle = getComputedStyle(scrim);
        const layers = scrimStyle.backgroundImage === 'none' ? 1 : 2;
        const worstCaseSurface = rgb(scrimStyle.backgroundColor, layers);
        const headingColor = opaqueRgb(getComputedStyle(heading).color);
        return {
          layers,
          contrast: contrast(headingColor, worstCaseSurface),
          inputTransitions: getComputedStyle(input).transitionDuration,
          buttonTransitions: getComputedStyle(button).transitionDuration,
        };
      });
      expect(result.layers).toBe(2);
      expect(result.contrast).toBeGreaterThanOrEqual(4.5);
      for (const durations of [result.inputTransitions, result.buttonTransitions]) {
        expect(durations.split(',').every((value) => ['0s', '0ms'].includes(value.trim()))).toBe(true);
      }
    }
  });

  test('uses documented Ren10 tokens and no framework or copied source leakage', async () => {
    const source = readFileSync(path.join(ROOT_DIR, 'templates/blocks/hero-fullscreen-bg-left-email-capture.html'), 'utf8');
    expect(source).toContain('--cover-height: 100dvh');
    expect(source).toContain('--ren-field-height: var(--touch-min)');
    expect(source).toContain('--ren-btn-ring-color: var(--color-text-inverted)');
    expect(source).not.toMatch(/(?:React|className|Tailwind|@relume|cloudfront|dangerouslySetInnerHTML)/i);
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
