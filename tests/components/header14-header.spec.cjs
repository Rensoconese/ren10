// @ts-check
const path = require('node:path');
const fs = require('node:fs');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-lightbox-top-email-split-band.html';
const ROOT = '[data-rh14-root]';

test.describe('Relume Header 14 translated to Ren10', () => {
  let server;
  test.beforeAll(async () => { server = await startStaticServer(PKG_ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header14`);
    expect(response?.status(), 'Header14 block must exist').toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns the exact source-derived anatomy without extras', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);
    await expect(root.locator('.rh14-media-trigger')).toHaveCount(1);
    await expect(root.locator('.rh14-poster img')).toHaveCount(1);
    await expect(root.locator('.rh14-scrim')).toHaveCount(1);
    await expect(root.locator('.rh14-play')).toHaveCount(1);
    await expect(root.locator('ren-dialog#rh14-video')).toHaveCount(1);
    await expect(root.locator('#rh14-video dialog')).toHaveCount(1);
    await expect(root.locator('#rh14-video .ren-spinner')).toHaveCount(1);
    await expect(root.locator('#rh14-video iframe')).toHaveCount(1);
    await expect(root.locator('h1.rh14-title, p.rh14-lede, form.rh14-form, input[type="email"], button[type="submit"], .rh14-legal, .rh14-terms')).toHaveCount(7);
    await expect(root.locator('.rh14-form label')).toBeVisible();
    await expect(root.locator('a.rh14-terms[href]')).toHaveCount(1);
    await expect(root.locator('nav, [class*="logo"], [class*="brand"], video')).toHaveCount(0);
    await expect(root.locator('form')).toHaveCount(1);
    await expect(root.locator('iframe')).toHaveCount(1);
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`keeps a controlled media canvas without overflow at ${width}px`, async ({ page }) => {
      const height = width === 320 ? 720 : width < 768 ? 844 : 900;
      await gotoBlock(page, width, height);
      const g = await page.locator(ROOT).evaluate((root) => {
        const media = root.querySelector('.rh14-media').getBoundingClientRect();
        const trigger = root.querySelector('.rh14-media-trigger').getBoundingClientRect();
        const band = root.querySelector('.rh14-band').getBoundingClientRect();
        const bounds = root.getBoundingClientRect();
        return {
          rootHeight: bounds.height, viewport: innerHeight,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          adjacent: Math.abs(media.bottom - band.top),
          triggerDelta: Math.max(Math.abs(trigger.left - media.left), Math.abs(trigger.top - media.top), Math.abs(trigger.right - media.right), Math.abs(trigger.bottom - media.bottom)),
          objectFit: getComputedStyle(root.querySelector('.rh14-poster img')).objectFit,
        };
      });
      expect(g.rootHeight).toBeGreaterThanOrEqual(500);
      expect(g.rootHeight).toBeLessThanOrEqual(900);
      expect(g.overflow).toBeLessThanOrEqual(1);
      expect(g.adjacent).toBeLessThanOrEqual(1);
      expect(g.triggerDelta).toBeLessThanOrEqual(1);
      expect(g.objectFit).toBe('cover');
    });
  }

  test('stacks the band at 767px and forms equal top-aligned columns at 768px', async ({ page }) => {
    await gotoBlock(page, 767, 900);
    const mobile = await page.locator('.rh14-band-layout').evaluate((layout) => {
      const [a, b] = [...layout.children].map((x) => x.getBoundingClientRect());
      return { after: b.top >= a.bottom, left: Math.abs(a.left - b.left) };
    });
    expect(mobile.after).toBe(true); expect(mobile.left).toBeLessThanOrEqual(1);
    await gotoBlock(page, 768, 1024);
    const desktop = await page.locator('.rh14-band-layout').evaluate((layout) => {
      const [a, b] = [...layout.children].map((x) => x.getBoundingClientRect());
      return { top: Math.abs(a.top - b.top), widths: Math.abs(a.width - b.width), split: b.left > a.right };
    });
    expect(desktop.top).toBeLessThanOrEqual(1); expect(desktop.widths).toBeLessThanOrEqual(2); expect(desktop.split).toBe(true);
  });

  test('switches the form from one column to an input-submit row at 640px', async ({ page }) => {
    await gotoBlock(page, 390, 900);
    const stacked = await page.locator('.rh14-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect(); const submit = row.querySelector('button').getBoundingClientRect();
      return submit.top >= field.bottom;
    });
    expect(stacked).toBe(true);
    await gotoBlock(page, 640, 900);
    const inline = await page.locator('.rh14-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect(); const submit = row.querySelector('button').getBoundingClientRect();
      return { aligned: Math.abs(field.bottom - submit.bottom), after: submit.left > field.right };
    });
    expect(inline.aligned).toBeLessThanOrEqual(1); expect(inline.after).toBe(true);
  });

  test('validates email, exposes status, and resolves legal terms', async ({ page }) => {
    await gotoBlock(page);
    const input = page.locator(`${ROOT} input[type="email"]`); const error = page.locator(`${ROOT} [data-error]`); const status = page.locator(`${ROOT} .rh14-status`);
    await page.locator(`${ROOT} .rh14-submit`).click();
    await expect(input).toHaveAttribute('aria-invalid', 'true'); await expect(error).toBeVisible();
    await input.fill('team@example.com'); await expect(error).toBeHidden();
    const before = page.url(); await page.locator(`${ROOT} .rh14-submit`).click();
    await expect(status).toHaveText('Thanks — your email is ready for the Ren10 preview.'); expect(page.url()).toBe(before);
    const href = await page.locator(`${ROOT} .rh14-terms`).getAttribute('href');
    expect(href).not.toBe('#'); expect((await page.request.get(new URL(href, page.url()).href)).ok()).toBe(true);
  });

  test('preserves native form and video alternatives without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } }); const page = await context.newPage();
    expect((await page.goto(`${server.origin}${BLOCK}`, { waitUntil: 'domcontentloaded' }))?.ok()).toBe(true);
    await expect(page.locator(`${ROOT} .rh14-poster img, ${ROOT} h1, ${ROOT} form, ${ROOT} .rh14-legal`)).toHaveCount(4);
    await expect(page.locator(`${ROOT} .rh14-video-fallback`)).toBeVisible();
    const fallback = await page.locator(`${ROOT} .rh14-video-fallback`).getAttribute('href'); expect((await page.request.get(new URL(fallback, page.url()).href)).ok()).toBe(true);
    const input = page.locator(`${ROOT} input`);
    await input.fill('team@example.com');
    await Promise.all([
      page.waitForURL(/getting-started\.html\?email=team%40example\.com/, { waitUntil: 'domcontentloaded' }),
      input.press('Enter'),
    ]);
    expect(page.url()).toMatch(/getting-started\.html\?email=team%40example\.com/); await context.close();
  });

  test('loads one playable iframe and restores focus after Escape', async ({ page }) => {
    await gotoBlock(page); const trigger = page.locator(`${ROOT} .rh14-media-trigger`);
    await page.evaluate(() => { const f = document.querySelector('#rh14-video iframe'); const d = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'srcdoc'); let pending = ''; Object.defineProperty(f, 'srcdoc', { configurable: true, get: () => '', set: (v) => { pending = v; } }); window.__releaseRh14 = () => { delete f.srcdoc; d.set.call(f, pending); }; });
    await trigger.focus(); await page.evaluate(() => document.querySelector('.rh14-media-trigger').click());
    const dialog = page.locator('#rh14-video dialog'); const loader = page.locator('#rh14-video .rh14-loader'); const iframe = page.locator('#rh14-video iframe');
    await expect(dialog).toHaveAttribute('open', ''); await expect(loader).toBeVisible(); await expect(iframe).toBeHidden();
    await page.evaluate(() => window.__releaseRh14()); await expect(iframe).toBeVisible(); await expect(loader).toBeHidden();
    await expect.poll(() => iframe.evaluate((f) => ({ videos: f.contentDocument?.querySelectorAll('video').length, controls: f.contentDocument?.querySelector('video')?.controls, playable: f.contentDocument?.querySelector('video')?.canPlayType('video/webm') }))).toMatchObject({ videos: 1, controls: true, playable: expect.stringMatching(/maybe|probably/) });
    await page.keyboard.press('Escape'); await expect(dialog).not.toHaveAttribute('open', ''); await expect(trigger).toBeFocused(); await expect(iframe).not.toHaveAttribute('srcdoc');
  });

  test('dismisses by close and backdrop while trapping focus', async ({ page }) => {
    await gotoBlock(page); const trigger = page.locator(`${ROOT} .rh14-media-trigger`); const dialog = page.locator('#rh14-video dialog');
    await trigger.click();
    for (let step = 0; step < 6; step += 1) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.querySelector('#rh14-video dialog').contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => document.querySelector('#rh14-video dialog').contains(document.activeElement))).toBe(true);
    await page.locator('#rh14-video [data-dialog-close]').click(); await expect(trigger).toBeFocused();
    await trigger.click(); await page.mouse.click(2, 2); await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
  });

  test('keeps targets touch-safe, focus visible, themes and reduced motion coherent', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }); await gotoBlock(page, 390, 844);
    const targets = page.locator(`${ROOT} .rh14-media-trigger, ${ROOT} input, ${ROOT} .rh14-submit, ${ROOT} .rh14-terms`);
    await page.locator('.bb-detail-header .ren-breadcrumb a[href="index.html"]').focus();
    for (let i = 0; i < await targets.count(); i += 1) {
      const target = targets.nth(i); const box = await target.boundingBox();
      expect(box.width).toBeGreaterThanOrEqual(44); expect(box.height).toBeGreaterThanOrEqual(44);
      await page.keyboard.press('Tab'); await expect(target).toBeFocused();
      expect(await target.evaluate((e) => getComputedStyle(e).outlineStyle)).not.toBe('none');
    }
    await page.locator(`${ROOT} .rh14-media-trigger`).click();
    const duration = await page.locator('#rh14-video dialog').evaluate((e) => getComputedStyle(e).transitionDuration); expect(duration.split(',').every((v) => ['0s', '0ms'].includes(v.trim()))).toBe(true);
    const spinnerAnimation = await page.locator('#rh14-video .ren-spinner').evaluate((e) => getComputedStyle(e).animationName); expect(spinnerAnimation).toBe('ren-spin-gentle');
  });

  test('passes axe AA closed and open', async ({ page }) => {
    await gotoBlock(page, 390, 844); await injectAxe(page);
    const opts = { detailedReport: true, detailedReportOptions: { html: true }, axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } };
    await checkA11y(page, ROOT, opts); await page.locator(`${ROOT} .rh14-media-trigger`).click(); await checkA11y(page, '#rh14-video dialog', opts);
  });

  test('contains no copied source or Ren10 policy leakage', async () => {
    const source = fs.readFileSync(path.join(PKG_ROOT, 'templates/blocks/hero-lightbox-top-email-split-band.html'), 'utf8');
    for (const token of ['ren-cover', 'ren-frame', 'ren-center', 'ren-switcher', 'ren-stack', 'ren-btn', 'ren-field', 'ren-dialog', 'ren-spinner']) expect(source).toContain(token);
    expect(source).not.toMatch(/React|className|Tailwind|@relume|cloudfront|youtube|placeholder-video|attachShadow|Canvas/i);
    expect(source).not.toMatch(/--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-|#[0-9a-f]{3,8}\b/i);
    expect(source).not.toMatch(/transition-duration\s*:\s*(?:0s|0ms)|animation\s*:\s*none/i);
  });
});
