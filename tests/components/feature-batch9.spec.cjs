// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 49, file: 'feature-photographic-story-rail.html', items: '.feature49-card', count: 3, images: 3 },
  { number: 50, file: 'feature-capability-checkerboard.html', items: '.feature50-card', count: 4, images: 0 },
  { number: 51, file: 'feature-image-metric-aside.html', items: '.feature51-metric', count: 3, images: 1 },
  { number: 52, file: 'feature-indexed-story-stack.html', items: '.feature52-row', count: 3, images: 0 },
  { number: 53, file: 'feature-centered-proof-grid.html', items: '.feature53-card', count: 6, images: 0 },
  { number: 54, file: 'feature-asymmetric-media-statement.html', items: '.feature54-card', count: 2, images: 1 },
];

const CHAIN = [
  ['feature-image-process-ribbon.html', 'feature-capability-checkerboard.html'],
  ['feature-photographic-story-rail.html', 'feature-image-metric-aside.html'],
  ['feature-capability-checkerboard.html', 'feature-indexed-story-stack.html'],
  ['feature-image-metric-aside.html', 'feature-centered-proof-grid.html'],
  ['feature-indexed-story-stack.html', 'feature-asymmetric-media-statement.html'],
  ['feature-centered-proof-grid.html', 'index.html'],
];

let server;

test.describe('Feature 49–54 Ren10 blocks', () => {
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
      await expect(page.locator('.bb-block-pagination a[rel="prev"]')).toHaveAttribute('href', CHAIN[block.number - 49][0]);
      await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', CHAIN[block.number - 49][1]);
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
      [BLOCKS[0], '.feature49-grid', 3],
      [BLOCKS[1], '.feature50-grid', 2],
      [BLOCKS[2], '.feature51-layout', 2],
      [BLOCKS[3], '.feature52-row:first-child', 3],
      [BLOCKS[4], '.feature53-grid', 3],
      [BLOCKS[5], '.feature54-grid', 12],
    ];
    for (const [block, selector, columns] of expectations) {
      await openBlock(page, block);
      expect(await page.locator(selector).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(columns);
    }
  });

  test('asymmetric media remains dominant without changing mobile source order', async ({ page }) => {
    await openBlock(page, BLOCKS[5]);
    const mediaWidth = await page.locator('.feature54-media').evaluate((node) => node.getBoundingClientRect().width);
    const statementWidth = await page.locator('.feature54-statement').evaluate((node) => node.getBoundingClientRect().width);
    expect(mediaWidth).toBeGreaterThan(statementWidth);
    await openBlock(page, BLOCKS[5], 390, 844);
    expect(await page.locator('.feature54-grid > *').evaluateAll((nodes) => nodes.map((node) => node.tagName))).toEqual(['FIGURE', 'ARTICLE', 'DIV']);
  });

  test('all feature source stays vanilla, tokenized, and flex-free', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks/feature-batch9.css'), 'utf8');
    expect(css).not.toMatch(/display\s*:\s*flex|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    }
  });

  test('catalog exposes Feature 1–54 in order and continues from Feature 48', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="features-title"] .bb-card');
    await expect(cards).toHaveCount(54);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(Array.from({ length: 54 }, (_, index) => `Feature ${index + 1}`));
    await page.goto(`${server.origin}/templates/blocks/feature-image-process-ribbon.html`);
    await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', BLOCKS[0].file);
  });
});
