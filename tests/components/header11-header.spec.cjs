// @ts-check
const path = require('node:path');
const fs = require('node:fs');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCK = '/templates/blocks/hero-fullscreen-video-top-copy-band-dual-cta.html';
const ROOT = '[data-rh11-root]';

test.describe('Relume Header 11 translated to Ren10', () => {
  let server;

  test.beforeAll(async () => {
    server = await startStaticServer(ROOT_DIR);
  });

  test.afterAll(async () => {
    await server?.close();
  });

  async function gotoBlock(page, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}${BLOCK}?ren10_test=header11`);
    expect(response?.status(), 'Header11 block must exist').toBe(200);
    await expect(page.locator(ROOT)).toBeVisible();
  }

  test('owns the exact video-first and copy-band anatomy', async ({ page }) => {
    await gotoBlock(page);
    const root = page.locator(ROOT);
    const video = root.locator('video.rh11-video');

    await expect(root.locator(':scope > .rh11-media')).toHaveCount(1);
    await expect(video).toHaveCount(1);
    await expect(video).toHaveAttribute('autoplay', '');
    await expect(video).toHaveAttribute('loop', '');
    await expect(video).toHaveAttribute('muted', '');
    await expect(video).toHaveAttribute('playsinline', '');
    await expect(video).toHaveJSProperty('muted', true);
    await expect(root.locator('.rh11-scrim')).toHaveCount(1);
    await expect(root.locator('.rh11-motion')).toHaveCount(1);
    await expect(root.locator(':scope > .rh11-band')).toHaveCount(1);
    await expect(root.locator('h1.rh11-heading')).toHaveCount(1);
    await expect(root.locator('p.rh11-description')).toHaveCount(1);
    await expect(root.locator('.rh11-actions a[href]')).toHaveCount(2);
    await expect(root.locator('nav, form, img, iframe, dialog, [class*="brand"], [class*="logo"]')).toHaveCount(0);
    await expect(root).toHaveAttribute('aria-labelledby', 'rh11-heading');
  });

  test('keeps media, heading, copy, and CTA source order without duplicate trees', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    const order = await page.locator(ROOT).evaluate((root) => {
      const nodes = ['.rh11-media', '.rh11-heading', '.rh11-description', '.rh11-actions']
        .map((selector) => root.querySelector(selector));
      const descendants = [...root.querySelectorAll('*')];
      return nodes.map((node) => descendants.indexOf(node));
    });
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(new Set(order).size).toBe(4);
  });

  test('uses a deterministic playable permitted video source', async ({ page }) => {
    await gotoBlock(page);
    const media = await expect.poll(() => page.locator(`${ROOT} video`).evaluate((video) => {
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
    void media;
    expect(await page.locator(`${ROOT} video`).evaluate((video) => Number.isFinite(video.duration) && video.duration > 0)).toBe(true);
  });

  test('uses exactly two distinct real CTA destinations', async ({ page }) => {
    await gotoBlock(page);
    const actions = page.locator(`${ROOT} .rh11-actions a`);
    await expect(actions.nth(0)).toHaveAttribute('href', '../../docs/index.html');
    await expect(actions.nth(1)).toHaveAttribute('href', 'index.html');
    await expect(actions.nth(0)).toHaveClass(/\bren-btn\b/);
    await expect(actions.nth(1)).toHaveClass(/\bren-btn-outline\b/);
    const hrefs = await actions.evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(new Set(hrefs).size).toBe(2);
    for (const href of hrefs) {
      expect((await page.request.get(new URL(href, page.url()).href)).ok()).toBe(true);
    }
  });

  test('retains native video controls and destinations without JavaScript', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    expect((await page.goto(`${server.origin}${BLOCK}?ren10_test=header11-no-js`))?.ok()).toBe(true);
    await expect(page.locator(`${ROOT} video[controls]`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rh11-motion`)).toBeHidden();
    await expect(page.locator(`${ROOT} .rh11-scrim`)).toBeHidden();
    const actions = page.locator(`${ROOT} .rh11-actions a`);
    await expect(actions).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      const href = await actions.nth(index).getAttribute('href');
      expect((await page.request.get(new URL(href, page.url()).href)).ok()).toBe(true);
    }
    await context.close();
  });

  for (const width of [320, 390, 767, 768, 1280]) {
    test(`keeps a controlled canvas and lets top video consume remaining height at ${width}px`, async ({ page }) => {
      const height = width === 320 ? 720 : width < 768 ? 844 : 900;
      await gotoBlock(page, width, height);
      const geometry = await page.locator(ROOT).evaluate((root) => {
        const media = root.querySelector('.rh11-media');
        const video = root.querySelector('.rh11-video');
        const scrim = root.querySelector('.rh11-scrim');
        const band = root.querySelector('.rh11-band');
        const rootRect = root.getBoundingClientRect();
        const mediaRect = media.getBoundingClientRect();
        const videoRect = video.getBoundingClientRect();
        const scrimRect = scrim.getBoundingClientRect();
        const bandRect = band.getBoundingClientRect();
        return {
          viewportHeight: innerHeight,
          rootHeight: rootRect.height,
          pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          rootOverflow: root.scrollWidth - root.clientWidth,
          mediaHeight: mediaRect.height,
          adjacent: Math.abs(mediaRect.bottom - bandRect.top),
          bandBottom: Math.abs(bandRect.bottom - rootRect.bottom),
          videoCovers: Math.abs(videoRect.width - mediaRect.width) <= 1 && Math.abs(videoRect.height - mediaRect.height) <= 1,
          scrimCovers: Math.abs(scrimRect.width - mediaRect.width) <= 1 && Math.abs(scrimRect.height - mediaRect.height) <= 1,
          objectFit: getComputedStyle(video).objectFit,
        };
      });
      expect(geometry.rootHeight).toBeGreaterThanOrEqual(500);
      expect(geometry.rootHeight).toBeLessThanOrEqual(900);
      expect(geometry.pageOverflow).toBeLessThanOrEqual(1);
      expect(geometry.rootOverflow).toBeLessThanOrEqual(1);
      expect(geometry.mediaHeight).toBeGreaterThan(100);
      expect(geometry.adjacent).toBeLessThanOrEqual(1);
      expect(geometry.bandBottom).toBeLessThanOrEqual(1);
      expect(geometry.videoCovers).toBe(true);
      expect(geometry.scrimCovers).toBe(true);
      expect(geometry.objectFit).toBe('cover');
    });
  }

  test('stacks the band at 767px and forms two top-aligned columns at 768px', async ({ page }) => {
    await gotoBlock(page, 767, 900);
    const mobile = await page.locator('.rh11-band-layout').evaluate((layout) => {
      const heading = layout.querySelector('.rh11-heading').getBoundingClientRect();
      const body = layout.querySelector('.rh11-body').getBoundingClientRect();
      return { bodyTop: body.top, headingBottom: heading.bottom, leftDelta: Math.abs(body.left - heading.left) };
    });
    expect(mobile.bodyTop).toBeGreaterThan(mobile.headingBottom);
    expect(mobile.leftDelta).toBeLessThanOrEqual(1);

    await gotoBlock(page, 768, 1024);
    const desktop = await page.locator('.rh11-band-layout').evaluate((layout) => {
      const heading = layout.querySelector('.rh11-heading').getBoundingClientRect();
      const body = layout.querySelector('.rh11-body').getBoundingClientRect();
      return { topDelta: Math.abs(body.top - heading.top), bodyLeft: body.left, headingRight: heading.right, widthDelta: Math.abs(body.width - heading.width) };
    });
    expect(desktop.topDelta).toBeLessThanOrEqual(1);
    expect(desktop.bodyLeft).toBeGreaterThan(desktop.headingRight);
    expect(desktop.widthDelta).toBeLessThanOrEqual(2);
  });

  test('autoplays when allowed and exposes a working pause/play control', async ({ page }) => {
    await gotoBlock(page);
    const video = page.locator(`${ROOT} video`);
    const motion = page.locator(`${ROOT} .rh11-motion`);
    await expect(motion).toBeVisible();
    await expect(video).not.toHaveAttribute('controls', '');
    await expect.poll(() => video.evaluate((element) => element.paused)).toBe(false);
    await motion.click();
    await expect.poll(() => video.evaluate((element) => element.paused)).toBe(true);
    await expect(motion).toHaveAttribute('aria-label', 'Play background video');
    await motion.click();
    await expect.poll(() => video.evaluate((element) => element.paused)).toBe(false);
    await expect(motion).toHaveAttribute('aria-label', 'Pause background video');
  });

  test('starts paused for reduced motion and permits explicit play', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoBlock(page);
    const video = page.locator(`${ROOT} video`);
    const motion = page.locator(`${ROOT} .rh11-motion`);
    await expect.poll(() => video.evaluate((element) => element.paused)).toBe(true);
    await expect(motion).toHaveAttribute('aria-label', 'Play background video');
    await motion.click();
    await expect.poll(() => video.evaluate((element) => element.paused)).toBe(false);
    expect(await motion.evaluate((element) => getComputedStyle(element).transitionDuration))
      .toMatch(/^(0s|0ms)(, (0s|0ms))*$/);
  });

  test('keeps all controls touch-safe and keyboard focus visible', async ({ page }) => {
    await gotoBlock(page, 390, 844);
    const controls = page.locator(`${ROOT} .rh11-actions a, ${ROOT} .rh11-motion`);
    await expect(controls).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      const control = controls.nth(index);
      const box = await control.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
      await control.focus();
      await expect(control).toBeFocused();
      expect(await control.evaluate((element) => getComputedStyle(element).outlineStyle)).not.toBe('none');
    }
  });

  test('uses documented Ren10 primitives and excludes copied source leakage', async () => {
    const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks/hero-fullscreen-video-top-copy-band-dual-cta.html'), 'utf8');
    expect(source).toContain('--cover-height: 100svh');
    for (const primitive of ['ren-cover', 'ren-center', 'ren-grid', 'ren-stack', 'ren-cluster', 'ren-btn']) {
      expect(source).toContain(primitive);
    }
    expect(source).not.toMatch(/(?:React|className|Tailwind|@relume|cloudfront|placeholder-video|dangerouslySetInnerHTML)/i);
    expect(source).not.toMatch(/--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/);
    expect(source).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(source).not.toMatch(/\bCanvas(?:Text)?\b/);
    expect(source).not.toMatch(/--ren-btn-duration\s*:\s*(?:0ms|0s)/);
    expect(source).not.toMatch(/animation\s*:\s*none/);
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
