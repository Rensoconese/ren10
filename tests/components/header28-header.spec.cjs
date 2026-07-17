// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-centered-copy-dual-cta-landscape-lightbox.html';
const SOURCE = path.join(PKG_ROOT, BLOCK);
const ROOT = '[data-rh28-root]';

test.describe('Relume Header28 translated to Ren10', () => {
  let server;
  test.beforeAll(async () => { server = await startStaticServer(PKG_ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header28`);
    expect(response?.status(), 'Header28 block must exist').toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns exact centered copy dual CTA and singular lightbox anatomy with zero forms', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);
    for (const [selector, count] of [['h1.rh28-title', 1], ['p.rh28-description', 1], ['.rh28-actions a', 2], ['button.rh28-media-trigger', 1], ['img.rh28-poster', 1], ['.rh28-scrim', 1], ['.rh28-play', 1], ['ren-dialog#rh28-video', 1], ['#rh28-video dialog', 1], ['#rh28-video .ren-spinner', 1], ['#rh28-video iframe', 1]]) await expect(root.locator(selector)).toHaveCount(count);
    await expect(root.locator('form, input, textarea, select, nav, header, [class*="logo"], [class*="brand"], video')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh28-title');
    await expect(root.locator('.rh28-media-trigger')).toHaveAttribute('aria-label', /Play/i);
  });

  test('keeps exactly two real distinct CTA destinations and a truthful owned poster', async ({ page }) => {
    await gotoBlock(page);
    const actions = page.locator(`${ROOT} .rh28-actions a`);
    const hrefs = await actions.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
    expect(new Set(hrefs).size).toBe(2);
    expect(hrefs.every((href) => href && href !== '#')).toBe(true);
    const image = page.locator(`${ROOT} .rh28-poster`);
    await expect(image).toHaveAttribute('src', /^media\/hero-[a-z0-9-]+\.(?:png|webp)$/);
    await expect(image).toHaveAttribute('alt', /\S+/);
    await expect(image).toHaveAttribute('width', /^\d+$/);
    await expect(image).toHaveAttribute('height', /^\d+$/);
    const state = await image.evaluate((node) => ({
      complete: node.complete,
      naturalWidth: node.naturalWidth,
      naturalHeight: node.naturalHeight,
      declaredWidth: Number(node.getAttribute('width')),
      declaredHeight: Number(node.getAttribute('height')),
    }));
    expect(state.complete).toBe(true);
    expect(state.naturalWidth).toBe(state.declaredWidth);
    expect(state.naturalHeight).toBe(state.declaredHeight);
    expect(state.naturalWidth).toBeGreaterThan(state.naturalHeight);
  });

  for (const width of [320, 390, 768, 1280]) {
    test(`keeps centered copy above landscape media without overflow at ${width}px`, async ({ page }) => {
      await gotoBlock(page, width, width < 768 ? 900 : 1000);
      const state = await page.locator(ROOT).evaluate((root) => {
        const copy = root.querySelector('.rh28-copy').getBoundingClientRect();
        const media = root.querySelector('.rh28-media').getBoundingClientRect();
        const actions = root.querySelector('.rh28-actions').getBoundingClientRect();
        return {
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rootOverflow: root.scrollWidth - root.clientWidth,
          mediaBelow: media.top >= copy.bottom - 1,
          copyCenter: Math.abs((copy.left + copy.right) / 2 - innerWidth / 2),
          actionCenter: Math.abs((actions.left + actions.right) / 2 - innerWidth / 2),
          ratio: media.width / media.height,
          titleSize: Number.parseFloat(getComputedStyle(root.querySelector('.rh28-title')).fontSize),
        };
      });
      expect(state.pageOverflow).toBeLessThanOrEqual(1);
      expect(state.rootOverflow).toBeLessThanOrEqual(1);
      expect(state.mediaBelow).toBe(true);
      expect(state.copyCenter).toBeLessThanOrEqual(2);
      expect(state.actionCenter).toBeLessThanOrEqual(2);
      expect(state.titleSize).toBeGreaterThanOrEqual(24);
      expect(state.ratio).toBeGreaterThan(1.7);
      expect(state.ratio).toBeLessThan(1.85);
    });
  }

  test('exposes named busy loading then one playable video and restores focus on Escape', async ({ page }) => {
    await gotoBlock(page);
    const trigger = page.locator(`${ROOT} .rh28-media-trigger`);
    const dialog = page.locator('#rh28-video dialog');
    const stage = page.locator('#rh28-video .rh28-video-stage');
    const loader = page.locator('#rh28-video .rh28-loader');
    const frame = page.locator('#rh28-video iframe');
    await expect(dialog).toHaveAttribute('aria-label', 'Ren10 product overview');
    await page.evaluate(() => {
      const iframe = document.querySelector('[data-rh28-root] #rh28-video iframe');
      const nativeSrcdoc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'srcdoc');
      let pending = '';
      window.__rh28Pending = '';
      Object.defineProperty(iframe, 'srcdoc', { configurable: true, get: () => pending, set: (value) => { pending = value; window.__rh28Pending = value; } });
      window.__releaseRh28 = () => { delete iframe.srcdoc; nativeSrcdoc.set.call(iframe, pending); };
    });
    await trigger.focus();
    await trigger.click();
    await expect(dialog).toHaveAttribute('open', '');
    await expect(stage).toHaveAttribute('aria-busy', 'true');
    await expect(loader).toBeVisible();
    await expect(frame).toBeHidden();
    await expect.poll(() => page.evaluate(() => window.__rh28Pending)).toMatch(/Ren10 product overview preview/);
    await page.evaluate(() => window.__releaseRh28());
    await expect(loader).toBeHidden();
    await expect(frame).toBeVisible();
    await expect(stage).toHaveAttribute('aria-busy', 'false');
    await page.keyboard.press('Escape');
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(frame).not.toHaveAttribute('srcdoc');
    await expect(trigger).toBeFocused();
  });

  test('dismisses by close and backdrop while trapping focus', async ({ page }) => {
    await gotoBlock(page);
    const trigger = page.locator(`${ROOT} .rh28-media-trigger`);
    const dialog = page.locator('#rh28-video dialog');
    await trigger.click();
    for (let step = 0; step < 5; step += 1) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.querySelector('#rh28-video dialog').contains(document.activeElement))).toBe(true);
    }
    await page.locator('#rh28-video [data-dialog-close]').click();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.mouse.click(2, 2);
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
  });

  test('repeated open and close always clears one iframe without duplicate video', async ({ page }) => {
    await gotoBlock(page);
    const trigger = page.locator(`${ROOT} .rh28-media-trigger`);
    const frame = page.locator('#rh28-video iframe');
    for (let cycle = 0; cycle < 3; cycle += 1) {
      await trigger.click();
      await expect(frame).toHaveAttribute('srcdoc', /Ren10 product overview preview/);
      await expect(page.locator('#rh28-video iframe')).toHaveCount(1);
      await page.keyboard.press('Escape');
      await expect(frame).not.toHaveAttribute('srcdoc');
      await expect(trigger).toBeFocused();
    }
  });

  test('keeps copy, CTA, poster, and real media fallback usable without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    expect((await page.goto(`${server.origin}${BLOCK}`))?.ok()).toBe(true);
    await expect(page.locator(`${ROOT} h1, ${ROOT} .rh28-description, ${ROOT} .rh28-actions a, ${ROOT} .rh28-poster`)).toHaveCount(5);
    await expect(page.locator(`${ROOT} .rh28-video-fallback`)).toBeVisible();
    const href = await page.locator(`${ROOT} .rh28-video-fallback`).getAttribute('href');
    expect((await page.request.get(new URL(href, page.url()).href)).ok()).toBe(true);
    await context.close();
  });

  test('keeps themes, focus, touch targets, and reduced motion coherent', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page, 390, 900);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      const targets = page.locator(`${ROOT} .rh28-actions a, ${ROOT} .rh28-media-trigger`);
      for (let index = 0; index < await targets.count(); index += 1) {
        const target = targets.nth(index);
        const box = await target.boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
        await target.focus();
        expect(await target.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
      }
    }
    await page.locator(`${ROOT} .rh28-media-trigger`).click();
    const duration = await page.locator('#rh28-video dialog').evaluate((node) => getComputedStyle(node).transitionDuration);
    expect(duration.split(',').every((value) => ['0s', '0ms'].includes(value.trim()))).toBe(true);
  });

  test('uses one root-scoped module and documented Ren10 primitives', async () => {
    const source = fs.readFileSync(SOURCE, 'utf8');
    for (const token of ['ren-center', 'ren-stack', 'ren-cluster', 'ren-frame', 'ren-btn', 'ren-dialog', 'ren-spinner']) expect(source).toContain(token);
    expect(source).toMatch(/<script type="module">\s*const root = document\.querySelector\('\[data-rh28-root\]'\);/);
    expect((source.match(/document\.querySelector/g) || []).length).toBe(1);
    expect(source).not.toMatch(/React|className|Tailwind|@relume|cloudfront|youtube|attachShadow|<form|<input/i);
    expect(source).not.toMatch(/--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-|#[0-9a-f]{3,8}\b/i);
  });

  test('passes axe WCAG 2.1 AA closed and open', async ({ page }) => {
    await gotoBlock(page, 390, 900);
    await injectAxe(page);
    const options = { detailedReport: true, detailedReportOptions: { html: true }, axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } };
    await checkA11y(page, ROOT, options);
    await page.locator(`${ROOT} .rh28-media-trigger`).click();
    await checkA11y(page, '#rh28-video dialog', options);
  });
});
