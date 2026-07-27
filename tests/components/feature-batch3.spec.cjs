// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 13, file: 'feature-horizontal-capability-rail.html', items: '.feature13-item', count: 4, images: 0 },
  { number: 14, file: 'feature-photo-quote.html', items: '.feature14-metric', count: 2, images: 1 },
  { number: 15, file: 'feature-layered-media-cards.html', items: '.feature15-card', count: 2, images: 2 },
  { number: 16, file: 'feature-comparison-grid.html', items: '.feature16-panel', count: 2, images: 0 },
  { number: 17, file: 'feature-six-tile-grid.html', items: '.feature17-item', count: 6, images: 0 },
  { number: 18, file: 'feature-photo-overlay-panel.html', items: '.feature18-panel', count: 1, images: 1 },
];

const CHAIN = [
  ['feature-gallery-metrics.html', 'feature-photo-quote.html'],
  ['feature-horizontal-capability-rail.html', 'feature-layered-media-cards.html'],
  ['feature-photo-quote.html', 'feature-comparison-grid.html'],
  ['feature-layered-media-cards.html', 'feature-six-tile-grid.html'],
  ['feature-comparison-grid.html', 'feature-photo-overlay-panel.html'],
  ['feature-six-tile-grid.html', 'feature-alternating-story-rows.html'],
];

let server;

test.describe('Feature 13–18 Ren10 blocks', () => {
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
      await expect(page.locator('.bb-block-pagination a[rel="prev"]')).toHaveAttribute('href', CHAIN[block.number - 13][0]);
      await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', CHAIN[block.number - 13][1]);
    });

    test(`Feature ${block.number} stays fluid, grid-based, and axe clean`, async ({ page }) => {
      await openBlock(page, block, 390, 844);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      expect(await page.locator(`[data-feature${block.number}-root] .ren-grid`).evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).display === 'grid'))).toBe(true);
      await injectAxe(page);
      await checkA11y(page, `[data-feature${block.number}-root]`, { detailedReport: true, detailedReportOptions: { html: true } });
    });
  }

  test('desktop compositions preserve their intended column counts', async ({ page }) => {
    const expectations = [
      [BLOCKS[0], '.feature13-grid', 4],
      [BLOCKS[1], '.feature14-layout', 2],
      [BLOCKS[2], '.feature15-grid', 2],
      [BLOCKS[3], '.feature16-grid', 2],
      [BLOCKS[4], '.feature17-grid', 3],
      [BLOCKS[5], '.feature18-scene', 1],
    ];
    for (const [block, selector, columns] of expectations) {
      await openBlock(page, block);
      expect(await page.locator(selector).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(columns);
    }
  });

  test('photo overlay layers stay aligned without absolute positioning', async ({ page }) => {
    await openBlock(page, BLOCKS[5]);
    const areas = await page.locator('.feature18-scene > *').evaluateAll((nodes) => nodes.map((node) => {
      const style = getComputedStyle(node);
      return `${style.gridColumnStart}/${style.gridColumnEnd}/${style.gridRowStart}/${style.gridRowEnd}`;
    }));
    expect(new Set(areas).size).toBe(1);
  });

  test('all feature source stays vanilla, tokenized, and flex-free', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks/feature-batch3.css'), 'utf8');
    expect(css).not.toMatch(/display\s*:\s*flex|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    }
  });

  test('catalog preserves Feature 1–18 in order and continues from Feature 12', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="features-title"] .bb-card');
    expect(await cards.count()).toBeGreaterThanOrEqual(18);
    expect(await cards.locator('.bb-card-eyebrow').evaluateAll((nodes) => nodes.slice(0, 18).map((node) => node.textContent?.trim()))).toEqual(Array.from({ length: 18 }, (_, index) => `Feature ${index + 1}`));
    await page.goto(`${server.origin}/templates/blocks/feature-gallery-metrics.html`);
    await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', BLOCKS[0].file);
  });
});
