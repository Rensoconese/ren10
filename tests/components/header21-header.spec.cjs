// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-split-video-lightbox-left-copy-dual-cta.html';
const SOURCE = path.join(PKG_ROOT, BLOCK);
const ROOT = '[data-rh21-root]';

test.describe('Relume Header 21 translated to Ren10', () => {
  let server;
  test.beforeAll(async () => { server = await startStaticServer(PKG_ROOT); });
  test.afterAll(async () => { await server?.close(); });

  async function gotoBlock(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header21`);
    expect(response?.status(), 'Header21 block must exist').toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns the exact copy, action, media, and dialog anatomy without extras', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);
    await expect(root).toHaveCount(1);
    await expect(root.locator('.rh21-container, .rh21-split, .rh21-copy, h1.rh21-title, p.rh21-description, .rh21-actions, .rh21-media, button.rh21-media-trigger, ren-dialog#rh21-video')).toHaveCount(9);
    await expect(root.locator('.rh21-actions > a.ren-btn[href]')).toHaveCount(2);
    await expect(root.locator('.rh21-media-trigger > img.rh21-poster')).toHaveCount(1);
    await expect(root.locator('.rh21-media-trigger > .rh21-scrim')).toHaveCount(1);
    await expect(root.locator('.rh21-media-trigger > .rh21-play')).toHaveCount(1);
    await expect(root.locator('#rh21-video dialog, #rh21-video .rh21-loader, #rh21-video iframe')).toHaveCount(3);
    await expect(root.locator('form, nav, header, [class*="logo"], [class*="brand"], video, .rh21-actions > :nth-child(n+3), .rh21-media-trigger ~ .rh21-media-trigger')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh21-title');
  });

  test('uses one owned image with truthful intrinsic landscape metadata', async ({ page }) => {
    await gotoBlock(page);
    const image = page.locator(`${ROOT} .rh21-poster`);
    await expect(image).toHaveAttribute('src', /^media\/hero-[a-z0-9-]+\.(?:png|webp)$/);
    await expect(image).toHaveAttribute('alt', /\S+/);
    await expect(image).toHaveAttribute('width', /^\d+$/);
    await expect(image).toHaveAttribute('height', /^\d+$/);
    const metadata = await image.evaluate((node) => ({
      complete: node.complete,
      naturalWidth: node.naturalWidth,
      naturalHeight: node.naturalHeight,
      declaredWidth: Number(node.getAttribute('width')),
      declaredHeight: Number(node.getAttribute('height')),
      objectFit: getComputedStyle(node).objectFit,
    }));
    expect(metadata.complete).toBe(true);
    expect(metadata.naturalWidth).toBe(metadata.declaredWidth);
    expect(metadata.naturalHeight).toBe(metadata.declaredHeight);
    expect(metadata.naturalWidth).toBeGreaterThan(metadata.naturalHeight);
    expect(metadata.objectFit).toBe('cover');
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`remains content-height and overflow-free at ${width}px`, async ({ page }) => {
      await gotoBlock(page, width, width === 320 ? 720 : 900);
      const state = await page.locator(ROOT).evaluate((root) => {
        const container = root.querySelector('.rh21-container').getBoundingClientRect();
        const split = root.querySelector('.rh21-split').getBoundingClientRect();
        const trigger = root.querySelector('.rh21-media-trigger').getBoundingClientRect();
        return {
          minHeight: getComputedStyle(root).minHeight,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          inside: container.left >= 0 && container.right <= innerWidth + 1,
          triggerInside: trigger.left >= split.left - 1 && trigger.right <= split.right + 1,
          ratio: trigger.width / trigger.height,
        };
      });
      expect(state.minHeight).toBe('0px');
      expect(state.overflow).toBeLessThanOrEqual(1);
      expect(state.inside).toBe(true);
      expect(state.triggerInside).toBe(true);
      expect(state.ratio).toBeGreaterThanOrEqual(1.76);
      expect(state.ratio).toBeLessThanOrEqual(1.79);
    });
  }

  test('keeps mobile copy before media and desktop media left of top-aligned copy', async ({ page }) => {
    await gotoBlock(page, 767, 900);
    const mobile = await page.locator('.rh21-split').evaluate((layout) => {
      const copy = layout.querySelector('.rh21-copy').getBoundingClientRect();
      const media = layout.querySelector('.rh21-media').getBoundingClientRect();
      return { mediaAfterCopy: media.top >= copy.bottom, left: Math.abs(media.left - copy.left) };
    });
    expect(mobile.mediaAfterCopy).toBe(true);
    expect(mobile.left).toBeLessThanOrEqual(1);
    await gotoBlock(page, 768, 900);
    const desktop = await page.locator('.rh21-split').evaluate((layout) => {
      const copy = layout.querySelector('.rh21-copy').getBoundingClientRect();
      const media = layout.querySelector('.rh21-media').getBoundingClientRect();
      return { mediaLeft: media.right < copy.left, top: Math.abs(media.top - copy.top), widths: Math.abs(media.width - copy.width) };
    });
    expect(desktop.mediaLeft).toBe(true);
    expect(desktop.top).toBeLessThanOrEqual(2);
    expect(desktop.widths).toBeLessThanOrEqual(2);
  });

  test('keeps exactly two real distinct CTA destinations and touch targets', async ({ page }) => {
    await gotoBlock(page, 320, 720);
    const links = page.locator(`${ROOT} .rh21-actions > a`);
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

  test('sizes one 16:9 dialog stage safely at medium and large widths', async ({ page }) => {
    for (const viewport of [900, 1280]) {
      await gotoBlock(page, viewport, 900);
      await page.locator(`${ROOT} .rh21-media-trigger`).click();
      const geometry = await page.locator('#rh21-video dialog').evaluate((dialog) => {
        const dialogRect = dialog.getBoundingClientRect();
        const stageRect = dialog.querySelector('.rh21-video-stage').getBoundingClientRect();
        return { width: dialogRect.width, viewport: innerWidth, ratio: stageRect.width / stageRect.height };
      });
      expect(geometry.width).toBeLessThanOrEqual(geometry.viewport - 30);
      expect(geometry.ratio).toBeGreaterThanOrEqual(1.76);
      expect(geometry.ratio).toBeLessThanOrEqual(1.79);
      await page.keyboard.press('Escape');
    }
  });

  test('loads one playable iframe video and restores focus after Escape', async ({ page }) => {
    await gotoBlock(page);
    const trigger = page.locator(`${ROOT} .rh21-media-trigger`);
    await page.evaluate(() => {
      const root = document.querySelector('[data-rh21-root]');
      const frame = root.querySelector('#rh21-video iframe');
      const descriptor = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'srcdoc');
      let pending = '';
      Object.defineProperty(frame, 'srcdoc', { configurable: true, get: () => '', set: (value) => { pending = value; } });
      window.__releaseRh21 = () => { delete frame.srcdoc; descriptor.set.call(frame, pending); };
    });
    await trigger.focus();
    await trigger.click();
    const dialog = page.locator('#rh21-video dialog');
    const loader = page.locator('#rh21-video .rh21-loader');
    const iframe = page.locator('#rh21-video iframe');
    await expect(dialog).toHaveAttribute('open', '');
    await expect(loader).toBeVisible();
    await expect(iframe).toBeHidden();
    await page.evaluate(() => window.__releaseRh21());
    await expect(iframe).toBeVisible();
    await expect(loader).toBeHidden();
    await expect.poll(() => iframe.evaluate((frame) => {
      const videos = frame.contentDocument?.querySelectorAll('video') || [];
      const source = videos[0]?.querySelector('source');
      return { count: videos.length, controls: videos[0]?.controls, source: source?.src || '', playable: videos[0]?.canPlayType('video/webm') || '' };
    })).toMatchObject({ count: 1, controls: true, source: expect.stringMatching(/^data:video\/webm;base64,/), playable: expect.stringMatching(/maybe|probably/) });
    await page.keyboard.press('Escape');
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
    await expect(iframe).not.toHaveAttribute('srcdoc');
  });

  test('traps focus and dismisses by close and backdrop with restoration', async ({ page }) => {
    await gotoBlock(page);
    const trigger = page.locator(`${ROOT} .rh21-media-trigger`);
    const dialog = page.locator('#rh21-video dialog');
    await trigger.click();
    for (let step = 0; step < 5; step += 1) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.querySelector('#rh21-video dialog').contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => document.querySelector('#rh21-video dialog').contains(document.activeElement))).toBe(true);
    await page.locator('#rh21-video [data-dialog-close]').click();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.mouse.click(2, 2);
    await expect(dialog).not.toHaveAttribute('open', '');
    await expect(trigger).toBeFocused();
  });

  test('keeps trigger, actions, and close touch-safe with visible focus in both themes', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    const baseTargets = page.locator(`${ROOT} .rh21-media-trigger, ${ROOT} .rh21-actions a`);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
      for (let index = 0; index < await baseTargets.count(); index += 1) {
        const target = baseTargets.nth(index);
        const box = await target.boundingBox();
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
        await target.focus();
        expect(await target.evaluate((node) => getComputedStyle(node).outlineStyle)).not.toBe('none');
      }
    }
    await page.locator(`${ROOT} .rh21-media-trigger`).click();
    const close = page.locator('#rh21-video [data-dialog-close]');
    const closeBox = await close.boundingBox();
    expect(closeBox.width).toBeGreaterThanOrEqual(44);
    expect(closeBox.height).toBeGreaterThanOrEqual(44);
  });

  test('retains interaction while reducing optional dialog and loader motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);
    await page.locator(`${ROOT} .rh21-media-trigger`).click();
    const durations = await page.locator('#rh21-video dialog').evaluate((node) => getComputedStyle(node).transitionDuration.split(',').map((value) => value.trim()));
    expect(durations.every((value) => ['0s', '0ms'].includes(value))).toBe(true);
    expect(await page.locator('#rh21-video .ren-spinner').evaluate((node) => getComputedStyle(node).animationName)).toBe('ren-spin-gentle');
    await expect(page.locator('#rh21-video dialog')).toHaveAttribute('open', '');
  });

  test('keeps complete copy, actions, poster, and media alternative without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    expect((await page.goto(`${server.origin}${BLOCK}`))?.ok()).toBe(true);
    await expect(page.locator(`${ROOT} h1, ${ROOT} .rh21-description, ${ROOT} .rh21-actions a, ${ROOT} .rh21-poster`)).toHaveCount(5);
    await expect(page.locator(`${ROOT} .rh21-video-fallback`)).toBeVisible();
    const href = await page.locator(`${ROOT} .rh21-video-fallback`).getAttribute('href');
    expect((await page.request.get(new URL(href, page.url()).href)).ok()).toBe(true);
    await expect(page.locator('#rh21-video dialog')).not.toHaveAttribute('open', '');
    await context.close();
  });

  test('keeps iframe permissions, title, and singular media surface explicit', async ({ page }) => {
    await gotoBlock(page);
    const iframe = page.locator(`${ROOT} #rh21-video iframe`);
    await expect(iframe).toHaveAttribute('title', /Ren10/i);
    await expect(iframe).toHaveAttribute('allow', /autoplay/);
    await expect(iframe).toHaveAttribute('allow', /encrypted-media/);
    await expect(iframe).toHaveAttribute('allow', /picture-in-picture/);
    await expect(iframe).toHaveAttribute('allowfullscreen', '');
    await expect(page.locator(`${ROOT} iframe`)).toHaveCount(1);
  });

  test('isolates behavior from unrelated composition siblings', async ({ page }) => {
    await gotoBlock(page);
    await page.evaluate(() => {
      const decoy = document.createElement('section');
      decoy.innerHTML = '<button class="rh21-media-trigger" type="button">Unrelated trigger</button><iframe class="rh21-decoy"></iframe>';
      document.body.prepend(decoy);
    });
    await page.locator(`${ROOT} .rh21-media-trigger`).click();
    await expect(page.locator(`${ROOT} #rh21-video dialog`)).toHaveAttribute('open', '');
    await expect(page.locator('.rh21-decoy')).not.toHaveAttribute('srcdoc');
    await expect(page.getByRole('button', { name: 'Unrelated trigger' })).toBeVisible();
  });

  test('uses a root-scoped module and documented Ren10 primitives without policy leakage', async () => {
    const source = fs.readFileSync(SOURCE, 'utf8');
    for (const token of ['ren-center', 'ren-stack', 'ren-grid', 'ren-cluster', 'ren-frame', 'ren-cover', 'ren-btn', 'ren-dialog', 'ren-spinner']) expect(source).toContain(token);
    expect(source).toMatch(/<script type="module">\s*const root = document\.querySelector\('\[data-rh21-root\]'\);/);
    expect((source.match(/document\.querySelector/g) || []).length).toBe(1);
    expect(source).not.toMatch(/React|className|Tailwind|@relume|cloudfront|youtube|attachShadow/i);
    expect(source).not.toMatch(/--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-|#[0-9a-f]{3,8}\b/i);
    expect(source).not.toMatch(/display:\s*(?:flex|grid)/i);
  });

  test('passes axe WCAG 2.1 AA closed and open', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    await injectAxe(page);
    const options = { detailedReport: true, detailedReportOptions: { html: true }, axeOptions: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } };
    await checkA11y(page, ROOT, options);
    await page.locator(`${ROOT} .rh21-media-trigger`).click();
    await checkA11y(page, '#rh21-video dialog', options);
  });
});
