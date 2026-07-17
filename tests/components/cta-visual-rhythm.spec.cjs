// @ts-check
const { test, expect } = require('@playwright/test');
const { readdirSync } = require('node:fs');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const CTA_FILES = readdirSync(path.join(ROOT, 'templates/blocks'))
  .filter((file) => /^cta-.*\.html$/.test(file))
  .sort();

let server;

test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

for (const viewport of [
  { name: 'mobile', width: 390, height: 844, minimumInline: 24 },
  { name: 'desktop', width: 1280, height: 900, minimumInline: 40 },
]) {
  test(`all CTA previews keep shared breathing room at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const file of CTA_FILES) {
      expect((await page.goto(`${server.origin}/templates/blocks/${file}`))?.status(), file).toBe(200);
      const state = await page.locator('main.bb-detail-page > section.bb-detail-preview').evaluate((root) => {
        const styles = getComputedStyle(root);
        return {
          paddingBlockStart: Number.parseFloat(styles.paddingBlockStart),
          paddingBlockEnd: Number.parseFloat(styles.paddingBlockEnd),
          paddingInlineStart: Number.parseFloat(styles.paddingInlineStart),
          paddingInlineEnd: Number.parseFloat(styles.paddingInlineEnd),
          overflow: document.documentElement.scrollWidth - innerWidth,
        };
      });

      expect(state.paddingBlockStart, `${file} block start`).toBeGreaterThanOrEqual(40);
      expect(state.paddingBlockEnd, `${file} block end`).toBeGreaterThanOrEqual(40);
      expect(state.paddingInlineStart, `${file} inline start`).toBeGreaterThanOrEqual(viewport.minimumInline);
      expect(state.paddingInlineEnd, `${file} inline end`).toBeGreaterThanOrEqual(viewport.minimumInline);
      expect(state.overflow, `${file} overflow`).toBeLessThanOrEqual(1);
    }
  });
}

test('all outlined CTA actions use a neutral opaque surface instead of a blue line', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  for (const file of CTA_FILES) {
    expect((await page.goto(`${server.origin}/templates/blocks/${file}`))?.status(), file).toBe(200);
    const states = await page.locator('main.bb-detail-page > section.bb-detail-preview .ren-btn-outline').evaluateAll((buttons) => (
      buttons.map((button) => {
        const styles = getComputedStyle(button);
        const rootStyles = getComputedStyle(document.documentElement);
        return {
          background: styles.backgroundColor,
          border: styles.borderTopColor,
          accent: rootStyles.getPropertyValue('--color-accent').trim(),
        };
      })
    ));

    for (const state of states) {
      expect(state.background, `${file} opaque outline surface`).not.toBe('rgba(0, 0, 0, 0)');
      expect(state.background, `${file} opaque outline surface`).not.toBe('transparent');
      expect(state.border, `${file} neutral outline border`).not.toBe(state.accent);
    }
  }
});

test('media-backed CTA canvases stay landscape and controlled', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  for (const file of CTA_FILES) {
    expect((await page.goto(`${server.origin}/templates/blocks/${file}`))?.status(), file).toBe(200);
    const root = page.locator('main.bb-detail-page > section.bb-detail-preview');
    const hasBackground = await root.locator(':scope > [class$="-background"]').count();
    if (!hasBackground) continue;

    const box = await root.boundingBox();
    expect(box?.height, `${file} background height`).toBeGreaterThanOrEqual(350);
    expect(box?.height, `${file} background height`).toBeLessThanOrEqual(500);
    expect((box?.width || 0) / (box?.height || 1), `${file} landscape ratio`).toBeGreaterThan(2);
  }
});
