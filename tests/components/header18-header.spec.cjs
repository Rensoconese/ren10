// @ts-check
const path = require('node:path');
const fs = require('node:fs');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-top-split-email-video-lightbox.html';
const ROOT = '[data-rh18-root]';

test.describe('Relume Header 18 translated to Ren10', () => {
  let server;
  test.beforeAll(async () => { server = await startStaticServer(PKG_ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header18`);
    expect(response?.status(), 'Header18 block must exist').toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns the exact source-derived anatomy without extras', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);
    await expect(root.locator('h1.rh18-title')).toHaveCount(1);
    await expect(root.locator('p.rh18-lede')).toHaveCount(1);
    await expect(root.locator('form.rh18-form')).toHaveCount(1);
    await expect(root.locator('.rh18-form label')).toHaveCount(1);
    await expect(root.locator('input[type="email"]')).toHaveCount(1);
    await expect(root.locator('button[type="submit"]')).toHaveCount(1);
    await expect(root.locator('.rh18-legal')).toHaveCount(1);
    await expect(root.locator('a.rh18-terms[href]')).toHaveCount(1);
    await expect(root.locator('.rh18-media-trigger')).toHaveCount(1);
    await expect(root.locator('.rh18-media-trigger img')).toHaveCount(1);
    await expect(root.locator('.rh18-scrim')).toHaveCount(1);
    await expect(root.locator('.rh18-play')).toHaveCount(1);
    await expect(root.locator('ren-dialog#rh18-video')).toHaveCount(1);
    await expect(root.locator('#rh18-video dialog')).toHaveCount(1);
    await expect(root.locator('#rh18-video .ren-spinner')).toHaveCount(1);
    await expect(root.locator('#rh18-video iframe')).toHaveCount(1);
    await expect(root.locator('nav, [class*="logo"], [class*="brand"], video')).toHaveCount(0);
    await expect(root.locator('form')).toHaveCount(1);
    await expect(root.locator('iframe')).toHaveCount(1);
  });

  test('uses one owned image with truthful intrinsic landscape metadata', async ({ page }) => {
    await gotoBlock(page);
    const image = page.locator(`${ROOT} .rh18-media-trigger img`);
    await expect(image).toHaveAttribute('src', /^\.\.\/\.\.\//);
    await expect(image).toHaveAttribute('width', '1280');
    await expect(image).toHaveAttribute('height', '900');
    const metadata = await image.evaluate((node) => ({
      complete: node.complete,
      naturalWidth: node.naturalWidth,
      naturalHeight: node.naturalHeight,
      declaredWidth: Number(node.getAttribute('width')),
      declaredHeight: Number(node.getAttribute('height')),
    }));
    expect(metadata.complete).toBe(true);
    expect(metadata.naturalWidth).toBe(metadata.declaredWidth);
    expect(metadata.naturalHeight).toBe(metadata.declaredHeight);
    expect(metadata.naturalWidth).toBeGreaterThan(metadata.naturalHeight);
  });

  for (const width of [320, 390, 640, 767, 768, 1280]) {
    test(`keeps a content-height aligned composition without overflow at ${width}px`, async ({ page }) => {
      await gotoBlock(page, width, width < 768 ? 844 : 900);
      const geometry = await page.locator(ROOT).evaluate((root) => {
        const copy = root.querySelector('.rh18-copy-layout').getBoundingClientRect();
        const trigger = root.querySelector('.rh18-media-trigger').getBoundingClientRect();
        const bounds = root.getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          contentHeight: bounds.height,
          minimumHeight: getComputedStyle(root).minHeight,
          triggerBelowCopy: trigger.top > copy.bottom,
          triggerWidthDelta: Math.abs(trigger.width - root.querySelector('.rh18-container').getBoundingClientRect().width),
          ratio: trigger.width / trigger.height,
        };
      });
      expect(geometry.overflow).toBeLessThanOrEqual(1);
      expect(geometry.contentHeight).toBeGreaterThan(0);
      expect(geometry.minimumHeight).not.toMatch(/100(?:s|d|l)?vh/);
      expect(geometry.triggerBelowCopy).toBe(true);
      expect(geometry.triggerWidthDelta).toBeLessThanOrEqual(1);
      expect(geometry.ratio).toBeGreaterThan(1.7);
      expect(geometry.ratio).toBeLessThan(1.85);
    });
  }

  test('stacks copy at 767px and forms equal top-aligned columns at 768px', async ({ page }) => {
    await gotoBlock(page, 767, 900);
    const narrow = await page.locator('.rh18-copy-layout').evaluate((layout) => {
      const [heading, support] = [...layout.children].map((element) => element.getBoundingClientRect());
      return { follows: support.top >= heading.bottom, left: Math.abs(heading.left - support.left) };
    });
    expect(narrow.follows).toBe(true);
    expect(narrow.left).toBeLessThanOrEqual(1);

    await gotoBlock(page, 768, 1024);
    const wide = await page.locator('.rh18-copy-layout').evaluate((layout) => {
      const [heading, support] = [...layout.children].map((element) => element.getBoundingClientRect());
      return { top: Math.abs(heading.top - support.top), widths: Math.abs(heading.width - support.width), split: support.left > heading.right };
    });
    expect(wide.top).toBeLessThanOrEqual(1);
    expect(wide.widths).toBeLessThanOrEqual(2);
    expect(wide.split).toBe(true);
  });

  test('stacks the form narrowly and aligns input with max-content submit from 640px', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    const stacked = await page.locator('.rh18-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect();
      const submit = row.querySelector('button').getBoundingClientRect();
      return submit.top >= field.bottom;
    });
    expect(stacked).toBe(true);

    await gotoBlock(page, 640, 900);
    const inline = await page.locator('.rh18-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect();
      const submit = row.querySelector('button').getBoundingClientRect();
      return { bottoms: Math.abs(field.bottom - submit.bottom), follows: submit.left > field.right, submitWidth: submit.width, rowWidth: row.getBoundingClientRect().width };
    });
    expect(inline.bottoms).toBeLessThanOrEqual(1);
    expect(inline.follows).toBe(true);
    expect(inline.submitWidth).toBeLessThan(inline.rowWidth / 2);
  });

  test('validates email, exposes a polite status, and resolves terms', async ({ page }) => {
    await gotoBlock(page);
    const input = page.locator(`${ROOT} .rh18-email`);
    const error = page.locator(`${ROOT} [data-error]`);
    const status = page.locator(`${ROOT} .rh18-status`);
    await page.locator(`${ROOT} .rh18-submit`).click();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(error).toBeVisible();
    await input.fill('team@example.com');
    await expect(error).toBeHidden();
    const before = page.url();
    await page.locator(`${ROOT} .rh18-submit`).click();
    await expect(status).toHaveText('Thanks — your email is ready for the Ren10 preview.');
    expect(page.url()).toBe(before);
    const href = await page.locator(`${ROOT} .rh18-terms`).getAttribute('href');
    expect(href).not.toBe('#');
    expect((await page.request.get(new URL(href, page.url()).href)).ok()).toBe(true);
  });

  test('preserves image, copy, native form, terms, and video alternative without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    expect((await page.goto(`${server.origin}${BLOCK}`))?.ok()).toBe(true);
    await expect(page.locator(`${ROOT} h1, ${ROOT} .rh18-lede, ${ROOT} form, ${ROOT} .rh18-media-trigger img, ${ROOT} .rh18-legal`)).toHaveCount(5);
    await expect(page.locator(`${ROOT} .rh18-video-fallback`)).toBeVisible();
    const fallback = await page.locator(`${ROOT} .rh18-video-fallback`).getAttribute('href');
    expect((await page.request.get(new URL(fallback, page.url()).href)).ok()).toBe(true);
    await page.locator(`${ROOT} input`).fill('team@example.com');
    const navigation = page.waitForNavigation();
    await page.locator(`${ROOT} .rh18-submit`).click();
    expect((await navigation)?.ok()).toBe(true);
    expect(page.url()).toMatch(/getting-started\.html\?email=team%40example\.com/);
    await context.close();
  });

  test('loads exactly one playable iframe and restores focus after Escape', async ({ page }) => {
    await gotoBlock(page);
    const trigger = page.locator(`${ROOT} .rh18-media-trigger`);
    await page.evaluate(() => {
      const frame = document.querySelector('[data-rh18-root] #rh18-video iframe');
      const nativeSrcdoc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'srcdoc');
      let pending = '';
      Object.defineProperty(frame, 'srcdoc', { configurable: true, get: () => '', set: (value) => { pending = value; } });
      window.__releaseRh18 = () => { delete frame.srcdoc; nativeSrcdoc.set.call(frame, pending); };
    });
    await trigger.focus();
    await trigger.click();
    const dialog = page.locator('#rh18-video dialog');
    const stage = page.locator('#rh18-video .rh18-video-stage');
    const loader = page.locator('#rh18-video .rh18-loader');
    const iframe = page.locator('#rh18-video iframe');
    await expect(dialog).toHaveAttribute('open', '');
    await expect(stage).toHaveAttribute('aria-busy', 'true');
    await expect(loader).toBeVisible();
    await expect(iframe).toBeHidden();
    await page.evaluate(() => window.__releaseRh18());
    await expect(iframe).toBeVisible();
    await expect(loader).toBeHidden();
    await expect(stage).toHaveAttribute('aria-busy', 'false');
    await expect.poll(() => iframe.evaluate((frame) => {
      const video = frame.contentDocument?.querySelector('video');
      const source = video?.querySelector('source');
      return { videos: frame.contentDocument?.querySelectorAll('video').length, controls: video?.controls, source: source?.getAttribute('src') || '', playable: video?.canPlayType(source?.getAttribute('type') || '') || '' };
    })).toMatchObject({ videos: 1, controls: true, source: expect.stringMatching(/^data:video\/webm;base64,/), playable: expect.stringMatching(/maybe|probably/) });
    await page.keyboard.press('Escape');
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
    await expect(iframe).not.toHaveAttribute('srcdoc');
  });

  test('traps focus and dismisses by close and backdrop with focus restoration', async ({ page }) => {
    await gotoBlock(page);
    const trigger = page.locator(`${ROOT} .rh18-media-trigger`);
    const dialog = page.locator('#rh18-video dialog');
    await trigger.click();
    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.querySelector('#rh18-video dialog').contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => document.querySelector('#rh18-video dialog').contains(document.activeElement))).toBe(true);
    await page.locator('#rh18-video [data-dialog-close]').click();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.mouse.click(2, 2);
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
  });

  test('keeps targets touch-safe, focus visible, themes, and reduced motion coherent', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page, 390, 844);
    const targets = page.locator(`${ROOT} input, ${ROOT} .rh18-submit, ${ROOT} .rh18-terms, ${ROOT} .rh18-media-trigger`);
    await page.locator('.bb-back').focus();
    for (let index = 0; index < await targets.count(); index += 1) {
      const target = targets.nth(index);
      const box = await target.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      await page.keyboard.press('Tab');
      await expect(target).toBeFocused();
      expect(await target.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
    }
    await page.locator(`${ROOT} .rh18-media-trigger`).click();
    const duration = await page.locator('#rh18-video dialog').evaluate((element) => getComputedStyle(element).transitionDuration);
    expect(duration.split(',').every((value) => ['0s', '0ms'].includes(value.trim()))).toBe(true);
    const spinnerAnimation = await page.locator('#rh18-video .ren-spinner').evaluate((element) => getComputedStyle(element).animationName);
    expect(spinnerAnimation).toBe('ren-spin-gentle');
  });

  test('passes axe WCAG 2.1 AA while closed and open', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    await injectAxe(page);
    const options = { detailedReport: true, detailedReportOptions: { html: true }, axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } };
    await checkA11y(page, ROOT, options);
    await page.locator(`${ROOT} .rh18-media-trigger`).click();
    await checkA11y(page, '#rh18-video dialog', options);
  });

  test('uses module-scoped root queries and contains no policy leakage', async () => {
    const source = fs.readFileSync(path.join(PKG_ROOT, 'templates/blocks/hero-top-split-email-video-lightbox.html'), 'utf8');
    for (const token of ['ren-center', 'ren-stack', 'ren-switcher', 'ren-frame', 'ren-btn', 'ren-field', 'ren-dialog', 'ren-spinner']) expect(source).toContain(token);
    expect(source).toMatch(/<script type="module">[\s\S]*document\.querySelector\('\[data-rh18-root\]'\)/);
    expect(source.match(/document\.querySelector/g)).toHaveLength(1);
    expect(source).not.toMatch(/<script>(?![\s\S]*type="module")/);
    expect(source).not.toMatch(/React|className|Tailwind|@relume|cloudfront|youtube|placeholder-(?:image|video)|attachShadow|CanvasRenderingContext/i);
    expect(source).not.toMatch(/--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-|#[0-9a-f]{3,8}\b/i);
    expect(source.match(/<link rel="stylesheet"/g)).toHaveLength(2);
    expect(source).toContain('../../site/shell.css');
  });
});
