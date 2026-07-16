const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCKS_ROOT = path.join(PKG_ROOT, 'templates/blocks');
const NAVBAR_FILES = fs.readdirSync(BLOCKS_ROOT)
  .filter((name) => name.startsWith('nav-') && name.endsWith('.html'))
  .sort();

test.describe('Shared Ren10 demo brand across navigation blocks', () => {
  let server;

  test.beforeAll(async () => {
    server = await startStaticServer(PKG_ROOT);
  });

  test.afterAll(async () => {
    await server?.close();
  });

  for (const file of NAVBAR_FILES) {
    test(`${file} uses one centered R + Ren10 identity`, async ({ page }) => {
      for (const viewport of [
        { width: 1280, height: 900 },
        { width: 390, height: 844 },
      ]) {
        await page.setViewportSize(viewport);
        await page.goto(`${server.origin}/templates/blocks/${file}`);

        const brand = page.locator('[class$="-preview"] .ren10-demo-brand, [data-rb-root] .ren10-demo-brand');
        await expect(brand).toHaveCount(1);

        const state = await brand.evaluate((element) => {
          const mark = element.querySelector('.ren10-demo-brand-mark');
          const label = element.querySelector('.ren10-demo-brand-label');
          if (!mark || !label) return null;
          const markStyle = getComputedStyle(mark);
          const markRect = mark.getBoundingClientRect();
          return {
            accessibleName: element.getAttribute('aria-label') || element.textContent.trim(),
            mark: mark.textContent.trim(),
            label: label.textContent.trim(),
            display: markStyle.display,
            alignItems: markStyle.alignItems,
            justifyItems: markStyle.justifyItems,
            width: Math.round(markRect.width),
            height: Math.round(markRect.height),
            visible: markRect.width > 0 && markRect.height > 0 && markStyle.visibility !== 'hidden',
          };
        });

        expect(state, `${file} at ${viewport.width}px`).toBeTruthy();
        expect(state.mark).toBe('R');
        expect(state.label).toBe('Ren10');
        expect(state.accessibleName).toContain('Ren10');
        expect(state.display).toBe('grid');
        expect(state.alignItems).toBe('center');
        expect(state.justifyItems).toBe('center');
        expect(state.width).toBe(32);
        expect(state.height).toBe(32);
        expect(state.visible).toBe(true);
      }
    });
  }
});
