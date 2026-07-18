// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');
const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 61, file: 'feature-editorial-side-notes.html', items: '.feature61-note', count: 3, images: 1 },
  { number: 62, file: 'feature-metric-timeline.html', items: '.feature62-step', count: 4, images: 0 },
  { number: 63, file: 'feature-contrast-story-triptych.html', items: '.feature63-card', count: 3, images: 1 },
  { number: 64, file: 'feature-photo-quote-ledger.html', items: '.feature64-item', count: 3, images: 1 },
  { number: 65, file: 'feature-capability-comparison-matrix.html', items: '.feature65-row', count: 3, images: 0 },
  { number: 66, file: 'feature-panorama-proof-footer.html', items: '.feature66-card', count: 4, images: 1 },
];
const CHAIN = [
  ['feature-dual-photo-manifesto.html', 'feature-metric-timeline.html'],
  ['feature-editorial-side-notes.html', 'feature-contrast-story-triptych.html'],
  ['feature-metric-timeline.html', 'feature-photo-quote-ledger.html'],
  ['feature-contrast-story-triptych.html', 'feature-capability-comparison-matrix.html'],
  ['feature-photo-quote-ledger.html', 'feature-panorama-proof-footer.html'],
  ['feature-capability-comparison-matrix.html', 'feature-modular-spec-sheet.html'],
];
let server;
test.describe('Feature 61–66 Ren10 blocks', () => {
  test.beforeAll(async () => { server = await startStaticServer(ROOT_DIR); });
  test.afterAll(async () => { await server?.close(); });
  async function openBlock(page, block, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    expect((await page.goto(`${server.origin}/templates/blocks/${block.file}`))?.status()).toBe(200);
    await expect(page.locator(`[data-feature${block.number}-root]`)).toBeVisible();
  }
  for (const block of BLOCKS) {
    test(`Feature ${block.number} preserves its documented anatomy`, async ({ page }) => {
      await openBlock(page, block);
      const root = page.locator(`[data-feature${block.number}-root]`);
      await expect(page.locator('.bb-detail-header h1.bb-detail-title')).toHaveCount(1);
      await expect(page.locator('.bb-detail-header p.bb-detail-description')).toHaveCount(1);
      await expect(root.locator(`h2.feature${block.number}-title`)).toHaveCount(1);
      await expect(root.locator(`p.feature${block.number}-description`)).toHaveCount(1);
      await expect(root.locator(block.items)).toHaveCount(block.count);
      await expect(root.locator('img[src^="media/"][width][height][alt]')).toHaveCount(block.images);
      await expect(page.locator('.bb-block-pagination a[rel="prev"]')).toHaveAttribute('href', CHAIN[block.number - 61][0]);
      await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', CHAIN[block.number - 61][1]);
    });
    test(`Feature ${block.number} stays fluid, grid-based, and axe clean`, async ({ page }) => {
      await openBlock(page, block, 390, 844);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      expect(await page.locator(`[data-feature${block.number}-root] .ren-grid:not([hidden])`).evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).display === 'grid'))).toBe(true);
      await injectAxe(page);
      await checkA11y(page, `[data-feature${block.number}-root]`, { detailedReport: true, detailedReportOptions: { html: true } });
    });
  }
  test('desktop compositions preserve their intended column counts', async ({ page }) => {
    const expectations = [[BLOCKS[0], '.feature61-layout', 12], [BLOCKS[1], '.feature62-timeline', 4], [BLOCKS[2], '.feature63-grid', 3], [BLOCKS[3], '.feature64-layout', 2], [BLOCKS[4], '.feature65-row:first-child', 3], [BLOCKS[5], '.feature66-proof', 4]];
    for (const [block, selector, columns] of expectations) {
      await openBlock(page, block);
      expect(await page.locator(selector).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(columns);
    }
  });
  test('comparison matrix preserves row source order on mobile', async ({ page }) => {
    await openBlock(page, BLOCKS[4], 390, 844);
    for (const row of await page.locator('.feature65-row').all()) expect(await row.locator(':scope > *').evaluateAll((nodes) => nodes.map((node) => node.tagName))).toEqual(['H3', 'DIV', 'DIV']);
  });
  test('all feature source stays vanilla, tokenized, and flex-free', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks/feature-batch11.css'), 'utf8');
    expect(css).not.toMatch(/display\s*:\s*flex|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    for (const block of BLOCKS) expect(fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8')).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
  });
  test('catalog preserves Feature 1–66 in order and continues from Feature 60', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="features-title"] .bb-card');
    expect(await cards.count()).toBeGreaterThanOrEqual(66);
    await expect(cards.locator('.bb-card-eyebrow').evaluateAll((nodes) => nodes.slice(0, 66).map((node) => node.textContent?.trim()))).resolves.toEqual(Array.from({ length: 66 }, (_, index) => `Feature ${index + 1}`));
    await page.goto(`${server.origin}/templates/blocks/feature-dual-photo-manifesto.html`);
    await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', BLOCKS[0].file);
  });
});
