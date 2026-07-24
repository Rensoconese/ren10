// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 31, file: 'feature-panorama-capability-deck.html', items: '.feature31-card', count: 3, images: 1 },
  { number: 32, file: 'feature-split-statement-metrics.html', items: '.feature32-metric', count: 4, images: 0 },
  { number: 33, file: 'feature-image-disclosure-aside.html', items: '.feature33-disclosures details', count: 3, images: 1 },
  { number: 34, file: 'feature-product-pillars.html', items: '.feature34-pillar', count: 3, images: 0 },
  { number: 35, file: 'feature-media-evidence-grid.html', items: '.feature35-card', count: 4, images: 2 },
  { number: 36, file: 'feature-adoption-sequence.html', items: '.feature36-step', count: 4, images: 1 },
];

const CHAIN = [
  ['feature-gallery-quote-rail.html', 'feature-split-statement-metrics.html'],
  ['feature-panorama-capability-deck.html', 'feature-image-disclosure-aside.html'],
  ['feature-split-statement-metrics.html', 'feature-product-pillars.html'],
  ['feature-image-disclosure-aside.html', 'feature-media-evidence-grid.html'],
  ['feature-product-pillars.html', 'feature-adoption-sequence.html'],
  ['feature-media-evidence-grid.html', 'feature-editorial-chapter-index.html'],
];

let server;

test.describe('Feature 31–36 Ren10 blocks', () => {
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
      await expect(page.locator('.bb-block-pagination a[rel="prev"]')).toHaveAttribute('href', CHAIN[block.number - 31][0]);
      await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', CHAIN[block.number - 31][1]);
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
      [BLOCKS[0], '.feature31-deck', 3],
      [BLOCKS[1], '.feature32-layout', 2],
      [BLOCKS[2], '.feature33-layout', 2],
      [BLOCKS[3], '.feature34-grid', 3],
      [BLOCKS[4], '.feature35-grid', 2],
      [BLOCKS[5], '.feature36-layout', 2],
    ];
    for (const [block, selector, columns] of expectations) {
      await openBlock(page, block);
      expect(await page.locator(selector).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(columns);
    }
  });

  test('image aside disclosures work without custom JavaScript', async ({ page }) => {
    await openBlock(page, BLOCKS[2]);
    const disclosures = page.locator('.feature33-disclosures details');
    await expect(disclosures.first()).toHaveAttribute('open', '');
    await disclosures.nth(1).locator('summary').click();
    await expect(disclosures.nth(1)).toHaveAttribute('open', '');
    await disclosures.first().locator('summary').press('Enter');
    await expect(disclosures.first()).not.toHaveAttribute('open', '');
  });

  test('all feature source stays vanilla, tokenized, and flex-free', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks/feature-batch6.css'), 'utf8');
    expect(css).not.toMatch(/display\s*:\s*flex|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    }
  });

  test('catalog preserves Feature 1–36 in order and continues from Feature 30', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="features-title"] .bb-card');
    expect(await cards.count()).toBeGreaterThanOrEqual(36);
    expect(await cards.locator('.bb-card-eyebrow').evaluateAll((nodes) => nodes.slice(0, 36).map((node) => node.textContent?.trim()))).toEqual(Array.from({ length: 36 }, (_, index) => `Feature ${index + 1}`));
    await page.goto(`${server.origin}/templates/blocks/feature-gallery-quote-rail.html`);
    await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', BLOCKS[0].file);
  });
});
