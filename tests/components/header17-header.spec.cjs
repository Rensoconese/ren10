// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-split-copy-dual-cta-landscape-lightbox.html';
const SOURCE = path.join(PKG_ROOT, BLOCK);
const ROOT = '[data-rh17-root]';

test.describe('Relume Header 17 translated to Ren10', () => {
  let server;
  test.beforeAll(async () => { server = await startStaticServer(PKG_ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header17`);
    expect(response?.status(), 'Header17 block must exist').toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns the exact copy, action, trigger, and dialog anatomy without extras', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);
    await expect(root).toHaveCount(1);
    await expect(root.locator('.rh17-container, .rh17-copy-layout, h1.rh17-title, p.rh17-description, .rh17-actions, .rh17-media, button.rh17-media-trigger, ren-dialog#rh17-video')).toHaveCount(8);
    await expect(root.locator('.rh17-actions > a.ren-btn[href]')).toHaveCount(2);
    await expect(root.locator('.rh17-media-trigger .rh17-poster img')).toHaveCount(1);
    await expect(root.locator('.rh17-media-trigger > .rh17-scrim')).toHaveCount(1);
    await expect(root.locator('.rh17-media-trigger > .rh17-play')).toHaveCount(1);
    await expect(root.locator('#rh17-video dialog, #rh17-video .rh17-loader, #rh17-video iframe')).toHaveCount(3);
    await expect(root.locator('form, nav, header, [class*="logo"], [class*="brand"], video, .rh17-actions > :nth-child(n+3), .rh17-media-trigger ~ .rh17-media-trigger')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh17-title');
  });

  test('uses one owned meaningful intrinsic landscape cover image', async ({ page }) => {
    await gotoBlock(page);
    const image = page.locator(`${ROOT} .rh17-poster img`);
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
      objectFit: getComputedStyle(node).objectFit,
      radius: getComputedStyle(node.closest('.rh17-media-trigger')).borderRadius,
    }));
    expect(state.complete).toBe(true);
    expect(state.naturalWidth).toBeGreaterThan(0);
    expect(state.naturalWidth).toBe(state.declaredWidth);
    expect(state.naturalHeight).toBe(state.declaredHeight);
    expect(state.naturalWidth).toBeGreaterThan(state.naturalHeight);
    expect(state.objectFit).toBe('cover');
    expect(state.radius).not.toBe('0px');
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`remains content-height, aligned, and overflow-free at ${width}px`, async ({ page }) => {
      await gotoBlock(page, width, width === 320 ? 720 : 900);
      const state = await page.locator(ROOT).evaluate((root) => {
        const container = root.querySelector('.rh17-container').getBoundingClientRect();
        const copy = root.querySelector('.rh17-copy-layout').getBoundingClientRect();
        const media = root.querySelector('.rh17-media').getBoundingClientRect();
        return {
          minHeight: getComputedStyle(root).minHeight,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          mediaAfter: media.top >= copy.bottom - 1,
          mediaContained: media.width <= copy.width + 1,
          mediaCentered: Math.abs(
            (media.left + media.right) / 2 - (copy.left + copy.right) / 2
          ),
          inside: container.left >= 0 && container.right <= innerWidth + 1,
          triggerDelta: Math.abs(root.querySelector('.rh17-media-trigger').getBoundingClientRect().width - media.width),
        };
      });
      expect(state.minHeight).toBe('0px');
      expect(state.overflow).toBeLessThanOrEqual(1);
      expect(state.mediaAfter).toBe(true);
      expect(state.mediaContained).toBe(true);
      expect(state.mediaCentered).toBeLessThanOrEqual(1);
      expect(state.inside).toBe(true);
      expect(state.triggerDelta).toBeLessThanOrEqual(1);
    });
  }

  test('stacks through 767px and forms equal top-aligned columns at 768px', async ({ page }) => {
    await gotoBlock(page, 767, 900);
    const narrow = await page.locator('.rh17-copy-layout').evaluate((layout) => {
      const [heading, support] = [...layout.children].map((node) => node.getBoundingClientRect());
      return support.top >= heading.bottom;
    });
    expect(narrow).toBe(true);
    await gotoBlock(page, 768, 900);
    const wide = await page.locator('.rh17-copy-layout').evaluate((layout) => {
      const [heading, support] = [...layout.children].map((node) => node.getBoundingClientRect());
      return { top: Math.abs(heading.top - support.top), widths: Math.abs(heading.width - support.width), split: support.left > heading.right };
    });
    expect(wide.top).toBeLessThanOrEqual(2);
    expect(wide.widths).toBeLessThanOrEqual(2);
    expect(wide.split).toBe(true);
  });

  test('keeps exactly two real distinct CTA destinations and wrapping touch targets', async ({ page }) => {
    await gotoBlock(page, 320, 720);
    const links = page.locator(`${ROOT} .rh17-actions > a`);
    const hrefs = await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')));
    expect(new Set(hrefs).size).toBe(2);
    for (const href of hrefs) {
      expect(href).not.toBe('#');
      expect((await page.request.get(new URL(href, page.url()).href)).ok()).toBe(true);
    }
    const sizes = await links.evaluateAll((nodes) => nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }));
    expect(sizes.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
  });

  test('sizes one 16:9 video stage to 738px medium and 940px large', async ({ page }) => {
    for (const [viewport, expectedWidth] of [[900, 738], [1280, 940]]) {
      await gotoBlock(page, viewport, 900);
      await page.locator(`${ROOT} .rh17-media-trigger`).click();
      const geometry = await page.locator('#rh17-video dialog').evaluate((dialog) => {
        const dialogRect = dialog.getBoundingClientRect();
        const stageRect = dialog.querySelector('.rh17-video-stage').getBoundingClientRect();
        return { width: dialogRect.width, ratio: stageRect.width / stageRect.height };
      });
      expect(geometry.width).toBeGreaterThanOrEqual(expectedWidth - 3);
      expect(geometry.width).toBeLessThanOrEqual(expectedWidth + 3);
      expect(geometry.ratio).toBeGreaterThanOrEqual(1.76);
      expect(geometry.ratio).toBeLessThanOrEqual(1.79);
      await page.keyboard.press('Escape');
    }
  });

  test('loads exactly one playable iframe video and restores focus after Escape', async ({ page }) => {
    await gotoBlock(page);
    const trigger = page.locator(`${ROOT} .rh17-media-trigger`);
    await page.evaluate(() => {
      const root = document.querySelector('[data-rh17-root]');
      const frame = root.querySelector('#rh17-video iframe');
      const descriptor = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'srcdoc');
      let pending = '';
      Object.defineProperty(frame, 'srcdoc', { configurable: true, get: () => '', set: (value) => { pending = value; } });
      window.__releaseRh17 = () => { delete frame.srcdoc; descriptor.set.call(frame, pending); };
    });
    await trigger.focus();
    await trigger.click();
    await expect(page.locator('#rh17-video dialog')).toHaveAttribute('open', '');
    await expect(page.locator('#rh17-video .rh17-loader')).toBeVisible();
    await expect(page.locator('#rh17-video iframe')).toBeHidden();
    await page.evaluate(() => window.__releaseRh17());
    const iframe = page.locator('#rh17-video iframe');
    await expect(iframe).toBeVisible();
    await expect(page.locator('#rh17-video .rh17-loader')).toBeHidden();
    await expect.poll(() => iframe.evaluate((frame) => {
      const videos = frame.contentDocument?.querySelectorAll('video') || [];
      const source = videos[0]?.querySelector('source');
      return { count: videos.length, controls: videos[0]?.controls, source: source?.src || '', playable: videos[0]?.canPlayType('video/webm') || '' };
    })).toMatchObject({ count: 1, controls: true, source: expect.stringMatching(/^data:video\/webm;base64,/), playable: expect.stringMatching(/maybe|probably/) });
    await page.keyboard.press('Escape');
    await expect(page.locator('#rh17-video dialog')).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
    await expect(iframe).not.toHaveAttribute('srcdoc');
  });

  test('closes by explicit affordance and backdrop while trapping focus', async ({ page }) => {
    await gotoBlock(page);
    const trigger = page.locator(`${ROOT} .rh17-media-trigger`);
    const dialog = page.locator('#rh17-video dialog');
    await trigger.click();
    for (let step = 0; step < 5; step += 1) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.querySelector('#rh17-video dialog').contains(document.activeElement))).toBe(true);
    }
    await page.locator('#rh17-video [data-dialog-close]').click();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.mouse.click(2, 2);
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
  });

  test('keeps trigger and actions touch-safe with visible focus in light and dark', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    const targets = page.locator(`${ROOT} .rh17-media-trigger, ${ROOT} .rh17-actions a`);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      for (let index = 0; index < await targets.count(); index += 1) {
        const target = targets.nth(index);
        const box = await target.boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
        await target.focus();
        expect(await target.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
      }
    }
  });

  test('removes optional dialog and loader motion for reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);
    await page.locator(`${ROOT} .rh17-media-trigger`).click();
    const durations = await page.locator('#rh17-video dialog').evaluate((node) => getComputedStyle(node).transitionDuration.split(',').map((value) => value.trim()));
    expect(durations.every((value) => ['0s', '0ms'].includes(value))).toBe(true);
    expect(await page.locator('#rh17-video .rh17-loader').evaluate((node) => getComputedStyle(node).animationName)).toBe('none');
  });

  test('keeps complete fallback content and media destination without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    expect((await page.goto(`${server.origin}${BLOCK}`))?.ok()).toBe(true);
    await expect(page.locator(`${ROOT} h1, ${ROOT} .rh17-description, ${ROOT} .rh17-actions a, ${ROOT} .rh17-poster img`)).toHaveCount(5);
    await expect(page.locator(`${ROOT} .rh17-video-fallback`)).toBeVisible();
    const href = await page.locator(`${ROOT} .rh17-video-fallback`).getAttribute('href');
    expect((await page.request.get(new URL(href, page.url()).href)).ok()).toBe(true);
    await expect(page.locator('#rh17-video dialog')).not.toHaveAttribute('open', '');
    await context.close();
  });

  test('uses a root-scoped inline module and documented Ren10 primitives', async () => {
    const source = fs.readFileSync(SOURCE, 'utf8');
    for (const token of ['ren-center', 'ren-stack', 'ren-grid', 'ren-cluster', 'ren-frame', 'ren-btn', 'ren-dialog', 'ren-spinner']) expect(source).toContain(token);
    expect(source).toMatch(/<script type="module">\s*const root = document\.querySelector\('\[data-rh17-root\]'\);/);
    expect((source.match(/document\.querySelector/g) || []).length).toBe(1);
    expect(source).not.toMatch(/React|className|Tailwind|@relume|cloudfront|youtube|attachShadow/i);
    expect(source).not.toMatch(/--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-|#[0-9a-f]{3,8}\b/i);
  });

  test('passes axe WCAG 2.1 AA closed and open', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    await injectAxe(page);
    const options = { detailedReport: true, detailedReportOptions: { html: true }, axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } };
    await checkA11y(page, ROOT, options);
    await page.locator(`${ROOT} .rh17-media-trigger`).click();
    await checkA11y(page, '#rh17-video dialog', options);
  });
});
