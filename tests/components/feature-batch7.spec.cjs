// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 37, file: 'feature-editorial-chapter-index.html', items: '.feature37-chapter', count: 3, images: 0 },
  { number: 38, file: 'feature-media-story-mosaic.html', items: '.feature38-card', count: 4, images: 2 },
  { number: 39, file: 'feature-outcome-comparison.html', items: '.feature39-row', count: 4, images: 0 },
  { number: 40, file: 'feature-centered-delivery-steps.html', items: '.feature40-step', count: 4, images: 0 },
  { number: 41, file: 'feature-quote-proof-split.html', items: '.feature41-metric', count: 3, images: 1 },
  { number: 42, file: 'feature-centered-media-matrix.html', items: '.feature42-item', count: 4, images: 1 },
];

const CHAIN = [
  ['feature-adoption-sequence.html', 'feature-media-story-mosaic.html'],
  ['feature-editorial-chapter-index.html', 'feature-outcome-comparison.html'],
  ['feature-media-story-mosaic.html', 'feature-centered-delivery-steps.html'],
  ['feature-outcome-comparison.html', 'feature-quote-proof-split.html'],
  ['feature-centered-delivery-steps.html', 'feature-centered-media-matrix.html'],
  ['feature-quote-proof-split.html', 'index.html'],
];

let server;

test.describe('Feature 37–42 Ren10 blocks', () => {
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
      await expect(page.locator('.bb-block-pagination a[rel="prev"]')).toHaveAttribute('href', CHAIN[block.number - 37][0]);
      await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', CHAIN[block.number - 37][1]);
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
    const expectations = [
      [BLOCKS[0], '.feature37-layout', 2],
      [BLOCKS[1], '.feature38-grid', 12],
      [BLOCKS[2], '.feature39-row:first-child', 3],
      [BLOCKS[3], '.feature40-grid', 4],
      [BLOCKS[4], '.feature41-layout', 2],
      [BLOCKS[5], '.feature42-grid', 3],
    ];
    for (const [block, selector, columns] of expectations) {
      await openBlock(page, block);
      expect(await page.locator(selector).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(columns);
    }
  });

  test('mosaic spans alternate while preserving semantic source order', async ({ page }) => {
    await openBlock(page, BLOCKS[1]);
    const cards = page.locator('.feature38-card');
    const desktopWidths = await cards.evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().width)));
    expect(desktopWidths[0]).toBeGreaterThan(desktopWidths[1]);
    expect(desktopWidths[1]).toBe(desktopWidths[2]);
    expect(desktopWidths[0]).toBe(desktopWidths[3]);
    await openBlock(page, BLOCKS[1], 390, 844);
    expect(await cards.evaluateAll((nodes) => {
      const widths = nodes.map((node) => Math.round(node.getBoundingClientRect().width));
      return widths.every((width) => width === widths[0]);
    })).toBe(true);
  });

  test('all feature source stays vanilla, tokenized, and flex-free', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks/feature-batch7.css'), 'utf8');
    expect(css).not.toMatch(/display\s*:\s*flex|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    }
  });

  test('catalog exposes Feature 1–42 in order and continues from Feature 36', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="features-title"] .bb-card');
    await expect(cards).toHaveCount(42);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(Array.from({ length: 42 }, (_, index) => `Feature ${index + 1}`));
    await page.goto(`${server.origin}/templates/blocks/feature-adoption-sequence.html`);
    await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', BLOCKS[0].file);
  });
});
