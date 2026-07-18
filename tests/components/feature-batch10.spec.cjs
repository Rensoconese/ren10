// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');
const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 55, file: 'feature-media-annotation-board.html', items: '.feature55-note', count: 4, images: 1 },
  { number: 56, file: 'feature-alternating-story-pairs.html', items: '.feature56-row', count: 3, images: 3 },
  { number: 57, file: 'feature-signal-comparison-grid.html', items: '.feature57-card', count: 6, images: 0 },
  { number: 58, file: 'feature-quote-metric-mosaic.html', items: '.feature58-metric', count: 4, images: 0 },
  { number: 59, file: 'feature-capability-sequence-band.html', items: '.feature59-step', count: 5, images: 0 },
  { number: 60, file: 'feature-dual-photo-manifesto.html', items: '.feature60-media', count: 2, images: 2 },
];
const CHAIN = [
  ['feature-asymmetric-media-statement.html', 'feature-alternating-story-pairs.html'],
  ['feature-media-annotation-board.html', 'feature-signal-comparison-grid.html'],
  ['feature-alternating-story-pairs.html', 'feature-quote-metric-mosaic.html'],
  ['feature-signal-comparison-grid.html', 'feature-capability-sequence-band.html'],
  ['feature-quote-metric-mosaic.html', 'feature-dual-photo-manifesto.html'],
  ['feature-capability-sequence-band.html', 'feature-editorial-side-notes.html'],
];
let server;
test.describe('Feature 55–60 Ren10 blocks', () => {
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
      await expect(page.locator('.bb-block-pagination a[rel="prev"]')).toHaveAttribute('href', CHAIN[block.number - 55][0]);
      await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', CHAIN[block.number - 55][1]);
    });
    test(`Feature ${block.number} stays fluid, grid-based, and axe clean`, async ({ page }) => {
      await openBlock(page, block, 390, 844);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      expect(await rootGrid(page, block)).toBe(true);
      await injectAxe(page);
      await checkA11y(page, `[data-feature${block.number}-root]`, { detailedReport: true, detailedReportOptions: { html: true } });
    });
  }
  async function rootGrid(page, block) {
    return page.locator(`[data-feature${block.number}-root] .ren-grid:not([hidden])`).evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).display === 'grid'));
  }
  test('desktop compositions preserve their intended column counts', async ({ page }) => {
    const expectations = [[BLOCKS[0], '.feature55-layout', 2], [BLOCKS[1], '.feature56-row:first-child', 2], [BLOCKS[2], '.feature57-grid', 3], [BLOCKS[3], '.feature58-grid', 2], [BLOCKS[4], '.feature59-sequence', 5], [BLOCKS[5], '.feature60-grid', 12]];
    for (const [block, selector, columns] of expectations) {
      await openBlock(page, block);
      expect(await page.locator(selector).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(columns);
    }
  });
  test('alternating stories preserve mobile source order', async ({ page }) => {
    await openBlock(page, BLOCKS[1], 390, 844);
    for (const row of await page.locator('.feature56-row').all()) expect(await row.locator(':scope > *').evaluateAll((nodes) => nodes.map((node) => node.tagName))).toEqual(['DIV', 'FIGURE']);
  });
  test('all feature source stays vanilla, tokenized, and flex-free', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks/feature-batch10.css'), 'utf8');
    expect(css).not.toMatch(/display\s*:\s*flex|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    }
  });
  test('catalog preserves Feature 1–60 in order and continues from Feature 54', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="features-title"] .bb-card');
    expect(await cards.count()).toBeGreaterThanOrEqual(60);
    await expect(cards.locator('.bb-card-eyebrow').evaluateAll((nodes) => nodes.slice(0, 60).map((node) => node.textContent?.trim()))).resolves.toEqual(Array.from({ length: 60 }, (_, index) => `Feature ${index + 1}`));
    await page.goto(`${server.origin}/templates/blocks/feature-asymmetric-media-statement.html`);
    await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', BLOCKS[0].file);
  });
});
