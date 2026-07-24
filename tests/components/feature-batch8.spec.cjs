// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 43, file: 'feature-metric-chapters.html', items: '.feature43-chapter', count: 3, images: 0 },
  { number: 44, file: 'feature-twin-media-briefs.html', items: '.feature44-card', count: 2, images: 2 },
  { number: 45, file: 'feature-capability-ledger.html', items: '.feature45-row', count: 6, images: 0 },
  { number: 46, file: 'feature-contrast-media-bento.html', items: '.feature46-card', count: 2, images: 1 },
  { number: 47, file: 'feature-quote-evidence-band.html', items: '.feature47-card', count: 3, images: 0 },
  { number: 48, file: 'feature-image-process-ribbon.html', items: '.feature48-step', count: 4, images: 1 },
];

const CHAIN = [
  ['feature-centered-media-matrix.html', 'feature-twin-media-briefs.html'],
  ['feature-metric-chapters.html', 'feature-capability-ledger.html'],
  ['feature-twin-media-briefs.html', 'feature-contrast-media-bento.html'],
  ['feature-capability-ledger.html', 'feature-quote-evidence-band.html'],
  ['feature-contrast-media-bento.html', 'feature-image-process-ribbon.html'],
  ['feature-quote-evidence-band.html', 'feature-photographic-story-rail.html'],
];

let server;

test.describe('Feature 43–48 Ren10 blocks', () => {
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
      await expect(page.locator('.bb-block-pagination a[rel="prev"]')).toHaveAttribute('href', CHAIN[block.number - 43][0]);
      await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', CHAIN[block.number - 43][1]);
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
      [BLOCKS[0], '.feature43-layout', 2],
      [BLOCKS[1], '.feature44-grid', 2],
      [BLOCKS[2], '.feature45-layout', 2],
      [BLOCKS[3], '.feature46-grid', 12],
      [BLOCKS[4], '.feature47-grid', 3],
      [BLOCKS[5], '.feature48-ribbon', 4],
    ];
    for (const [block, selector, columns] of expectations) {
      await openBlock(page, block);
      expect(await page.locator(selector).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(columns);
    }
  });

  test('contrast bento uses a tall media span without changing mobile source order', async ({ page }) => {
    await openBlock(page, BLOCKS[3]);
    const media = page.locator('.feature46-media');
    const cards = page.locator('.feature46-card');
    expect(Math.round(await media.evaluate((node) => node.getBoundingClientRect().height))).toBeGreaterThan(Math.round(await cards.first().evaluate((node) => node.getBoundingClientRect().height)));
    await openBlock(page, BLOCKS[3], 390, 844);
    expect(await page.locator('.feature46-grid > *').evaluateAll((nodes) => nodes.map((node) => node.tagName))).toEqual(['FIGURE', 'ARTICLE', 'ARTICLE']);
  });

  test('all feature source stays vanilla, tokenized, and flex-free', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks/feature-batch8.css'), 'utf8');
    expect(css).not.toMatch(/display\s*:\s*flex|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    }
  });

  test('catalog preserves Feature 1–48 in order and continues from Feature 42', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="features-title"] .bb-card');
    expect(await cards.count()).toBeGreaterThanOrEqual(48);
    await expect(cards.locator('.bb-card-eyebrow').evaluateAll((nodes) => nodes.slice(0, 48).map((node) => node.textContent?.trim()))).resolves.toEqual(Array.from({ length: 48 }, (_, index) => `Feature ${index + 1}`));
    await page.goto(`${server.origin}/templates/blocks/feature-centered-media-matrix.html`);
    await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', BLOCKS[0].file);
  });
});
