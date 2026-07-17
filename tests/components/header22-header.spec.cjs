// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-split-video-lightbox-left-email-form.html';
const SOURCE = path.join(PKG_ROOT, BLOCK);
const ROOT = '[data-rh22-root]';

test.describe('Relume Header22 translated to Ren10', () => {
  let server;
  test.beforeAll(async () => { server = await startStaticServer(PKG_ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header22`);
    expect(response?.status(), 'Header22 block must exist').toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns the exact split form and lightbox anatomy without extras', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);
    for (const [selector, count] of [
      ['h1.rh22-title', 1], ['p.rh22-description', 1], ['form.rh22-form', 1],
      ['ren-field', 1], ['label', 1], ['input[type="email"]', 1], ['button[type="submit"]', 1],
      ['.rh22-legal', 1], ['a.rh22-terms[href]', 1], ['.rh22-poster', 1],
      ['button.rh22-media-trigger', 1], ['ren-dialog#rh22-video', 1], ['#rh22-video dialog', 1],
      ['#rh22-video .ren-spinner', 1], ['#rh22-video iframe', 1],
    ]) await expect(root.locator(selector)).toHaveCount(count);
    await expect(root.locator('nav, header, [class*="logo"], [class*="brand"], video, form + form, iframe + iframe')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh22-title');
  });

  test('uses one truthful owned intrinsic landscape poster', async ({ page }) => {
    await gotoBlock(page);
    const image = page.locator(`${ROOT} .rh22-poster`);
    await expect(image).toHaveAttribute('src', /^media\/hero-[a-z0-9-]+\.png$/);
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

  for (const width of [320, 390, 640, 1023, 1024, 1280]) {
    test(`preserves ordering, centering, and no overflow at ${width}px`, async ({ page }) => {
      await gotoBlock(page, width, width < 1024 ? 1100 : 900);
      const state = await page.locator(ROOT).evaluate((root) => {
        const copy = root.querySelector('.rh22-copy').getBoundingClientRect();
        const media = root.querySelector('.rh22-media').getBoundingClientRect();
        return {
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rootOverflow: root.scrollWidth - root.clientWidth,
          copyFirst: copy.top <= media.top && media.top >= copy.bottom - 1,
          mediaLeft: media.left < copy.left && copy.left >= media.right - 1,
          centered: Math.abs((copy.top + copy.bottom) / 2 - (media.top + media.bottom) / 2),
          equal: Math.abs(copy.width - media.width),
        };
      });
      expect(state.pageOverflow).toBeLessThanOrEqual(1);
      expect(state.rootOverflow).toBeLessThanOrEqual(1);
      if (width >= 1024) {
        expect(state.mediaLeft).toBe(true);
        expect(state.centered).toBeLessThanOrEqual(2);
        expect(state.equal).toBeLessThanOrEqual(2);
      } else expect(state.copyFirst).toBe(true);
    });
  }

  test('stacks the form at 639px and forms a growing-field row at 640px', async ({ page }) => {
    await gotoBlock(page, 639, 1000);
    expect(await page.locator('.rh22-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect();
      const button = row.querySelector('button').getBoundingClientRect();
      return button.top >= field.bottom;
    })).toBe(true);
    await gotoBlock(page, 640, 1000);
    const inline = await page.locator('.rh22-form-row').evaluate((row) => {
      const field = row.querySelector('ren-field').getBoundingClientRect();
      const button = row.querySelector('button').getBoundingClientRect();
      return { after: button.left >= field.right - 1, bottoms: Math.abs(button.bottom - field.bottom), grows: field.width > button.width };
    });
    expect(inline.after).toBe(true);
    expect(inline.bottoms).toBeLessThanOrEqual(1);
    expect(inline.grows).toBe(true);
  });

  test('keeps pristine feedback hidden and enhanced validation singular', async ({ page }) => {
    await gotoBlock(page);
    const field = page.locator(`${ROOT} ren-field`);
    const input = page.locator(`${ROOT} .rh22-email`);
    const error = page.locator(`${ROOT} [data-error]`);
    const status = page.locator(`${ROOT} .rh22-status`);
    await expect(error).toBeHidden();
    await expect(status).toBeHidden();
    await expect(page.locator(`${ROOT} form`)).toHaveJSProperty('noValidate', true);
    await page.locator(`${ROOT} .rh22-submit`).click();
    await expect(field).toHaveAttribute('data-invalid', '');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(error).toBeVisible();
    await expect(input).toBeFocused();
    await input.fill('team@example.com');
    await expect(error).toBeHidden();
    await page.locator(`${ROOT} .rh22-submit`).click();
    await expect(status).toHaveText('Thanks — check your inbox for the next step.');
    await expect(status).toBeVisible();
  });

  test('keeps native submission, terms, and media alternative usable without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    expect((await page.goto(`${server.origin}${BLOCK}`))?.ok()).toBe(true);
    await expect(page.locator(`${ROOT} label, ${ROOT} input, ${ROOT} .rh22-submit, ${ROOT} .rh22-terms, ${ROOT} .rh22-video-fallback`)).toHaveCount(5);
    expect((await page.request.get(new URL(await page.locator('.rh22-terms').getAttribute('href'), page.url()).href)).ok()).toBe(true);
    expect((await page.request.get(new URL(await page.locator('.rh22-video-fallback').getAttribute('href'), page.url()).href)).ok()).toBe(true);
    await page.locator(`${ROOT} input`).fill('team@example.com');
    const navigation = page.waitForNavigation();
    await page.locator(`${ROOT} .rh22-submit`).click();
    expect((await navigation)?.ok()).toBe(true);
    expect(page.url()).toMatch(/getting-started\.html\?email=team%40example\.com/);
    await context.close();
  });

  test('opens one loading video, clears it on Escape, and restores focus', async ({ page }) => {
    await gotoBlock(page);
    const trigger = page.locator(`${ROOT} .rh22-media-trigger`);
    const dialog = page.locator('#rh22-video dialog');
    const loader = page.locator('#rh22-video .rh22-loader');
    const frame = page.locator('#rh22-video iframe');
    await page.evaluate(() => {
      const iframe = document.querySelector('[data-rh22-root] #rh22-video iframe');
      const nativeSrcdoc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'srcdoc');
      let pending = '';
      window.__rh22Pending = '';
      Object.defineProperty(iframe, 'srcdoc', { configurable: true, get: () => pending, set: (value) => { pending = value; window.__rh22Pending = value; } });
      window.__releaseRh22 = () => { delete iframe.srcdoc; nativeSrcdoc.set.call(iframe, pending); };
    });
    await trigger.focus();
    await trigger.click();
    await expect(dialog).toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => window.__rh22Pending)).toMatch(/Ren10 overview preview/);
    await expect(loader).toBeVisible();
    await expect(frame).toBeHidden();
    await page.evaluate(() => window.__releaseRh22());
    await expect(loader).toBeHidden();
    await expect(frame).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(frame).not.toHaveAttribute('srcdoc');
    await expect(trigger).toBeFocused();
  });

  test('dismisses by close and backdrop while keeping dialog focus trapped', async ({ page }) => {
    await gotoBlock(page);
    const trigger = page.locator(`${ROOT} .rh22-media-trigger`);
    const dialog = page.locator('#rh22-video dialog');
    await trigger.click();
    for (let step = 0; step < 5; step += 1) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.querySelector('#rh22-video dialog').contains(document.activeElement))).toBe(true);
    }
    await page.locator('#rh22-video [data-dialog-close]').click();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.mouse.click(2, 2);
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
  });

  test('keeps targets, themes, focus, and reduced motion coherent', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page, 390, 900);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      for (const selector of ['.rh22-email', '.rh22-submit', '.rh22-terms', '.rh22-media-trigger']) {
        const target = page.locator(`${ROOT} ${selector}`);
        const box = await target.boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
        await target.focus();
        expect(await target.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
      }
    }
    await page.locator(`${ROOT} .rh22-media-trigger`).click();
    const duration = await page.locator('#rh22-video dialog').evaluate((node) => getComputedStyle(node).transitionDuration);
    expect(duration.split(',').every((value) => ['0s', '0ms'].includes(value.trim()))).toBe(true);
  });

  test('uses one root-scoped module and documented Ren10 primitives', async () => {
    const source = fs.readFileSync(SOURCE, 'utf8');
    for (const token of ['ren-center', 'ren-grid', 'ren-stack', 'ren-switcher', 'ren-frame', 'ren-field', 'ren-btn', 'ren-dialog', 'ren-spinner']) expect(source).toContain(token);
    expect(source).toMatch(/<script type="module">\s*const root = document\.querySelector\('\[data-rh22-root\]'\);/);
    expect((source.match(/document\.querySelector/g) || []).length).toBe(1);
    expect(source).not.toMatch(/React|className|Tailwind|@relume|cloudfront|youtube|attachShadow/i);
    expect(source).not.toMatch(/--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-|#[0-9a-f]{3,8}\b/i);
  });

  test('passes axe WCAG 2.1 AA in pristine, invalid, success, and dialog states', async ({ page }) => {
    await gotoBlock(page, 390, 900);
    await injectAxe(page);
    const options = { detailedReport: true, detailedReportOptions: { html: true }, axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } };
    await checkA11y(page, ROOT, options);
    await page.locator(`${ROOT} .rh22-submit`).click();
    await checkA11y(page, ROOT, options);
    await page.locator(`${ROOT} .rh22-email`).fill('team@example.com');
    await page.locator(`${ROOT} .rh22-submit`).click();
    await checkA11y(page, ROOT, options);
    await page.locator(`${ROOT} .rh22-media-trigger`).click();
    await checkA11y(page, '#rh22-video dialog', options);
  });
});
