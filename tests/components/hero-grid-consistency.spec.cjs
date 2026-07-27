// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const layouts = [
  ['hero-fullscreen-media-top-copy-band-dual-cta.html', '.rh9-band-layout'],
  ['hero-cover-image-email-split-band.html', '.rh10-band-layout'],
  ['hero-fullscreen-video-top-copy-band-dual-cta.html', '.rh11-band-layout'],
  ['hero-video-email-split-band.html', '.rh12-band-layout'],
  ['hero-lightbox-top-copy-band-dual-cta.html', '.rh13-band-layout'],
  ['hero-lightbox-top-email-split-band.html', '.rh14-band-layout'],
  ['hero-split-copy-dual-cta-landscape-image.html', '.rh15-copy-layout'],
  ['hero-split-email-form-landscape-image.html', '.rh16-copy-layout'],
  ['hero-split-copy-dual-cta-landscape-lightbox.html', '.rh17-copy-layout'],
  ['hero-top-split-email-video-lightbox.html', '.rh18-copy-layout'],
  ['hero-split-image-left-copy-dual-cta.html', '.rh19-layout'],
  ['hero-split-video-lightbox-left-copy-dual-cta.html', '.rh21-split'],
];

let server;

test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

test('every two-column hero composition uses responsive CSS Grid rather than flexbox', async ({ page }) => {
  for (const [file, selector] of layouts) {
    await page.setViewportSize({ width: 390, height: 1000 });
    expect((await page.goto(`${server.origin}/templates/blocks/${file}`))?.status()).toBe(200);

    for (const [width, expectedColumns] of [[390, 1], [640, 1], [767, 1], [768, 2], [1280, 2]]) {
      await page.setViewportSize({ width, height: 1000 });

      const state = await page.locator(selector).evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          display: style.display,
          columns: style.gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length,
          className: node.className,
          overflow: document.documentElement.scrollWidth - innerWidth,
        };
      });

      expect(state.className, `${file} must use the Ren10 grid primitive`).toContain('ren-grid');
      expect(state.className, `${file} must not use the flexbox switcher`).not.toContain('ren-switcher');
      expect(state.display, `${file} at ${width}px`).toBe('grid');
      expect(state.columns, `${file} at ${width}px`).toBe(expectedColumns);
      expect(state.overflow, `${file} at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});
