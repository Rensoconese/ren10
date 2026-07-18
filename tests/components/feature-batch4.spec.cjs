// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 19, file: 'feature-alternating-story-rows.html', items: '.feature19-row', count: 3, images: 3 },
  { number: 20, file: 'feature-indexed-detail-grid.html', items: '.feature20-card', count: 3, images: 0 },
  { number: 21, file: 'feature-image-stat-stack.html', items: '.feature21-metric', count: 3, images: 1 },
  { number: 22, file: 'feature-contrast-metrics-band.html', items: '.feature22-metric', count: 4, images: 0 },
  { number: 23, file: 'feature-editorial-triptych.html', items: '.feature23-card', count: 3, images: 2 },
  { number: 24, file: 'feature-photo-disclosure-list.html', items: '.feature24-disclosures details', count: 3, images: 1 },
];

const CHAIN = [
  ['feature-photo-overlay-panel.html', 'feature-indexed-detail-grid.html'],
  ['feature-alternating-story-rows.html', 'feature-image-stat-stack.html'],
  ['feature-indexed-detail-grid.html', 'feature-contrast-metrics-band.html'],
  ['feature-image-stat-stack.html', 'feature-editorial-triptych.html'],
  ['feature-contrast-metrics-band.html', 'feature-photo-disclosure-list.html'],
  ['feature-editorial-triptych.html', 'index.html'],
];

let server;

test.describe('Feature 19–24 Ren10 blocks', () => {
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
      await expect(page.locator('.bb-block-pagination a[rel="prev"]')).toHaveAttribute('href', CHAIN[block.number - 19][0]);
      await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', CHAIN[block.number - 19][1]);
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
      [BLOCKS[0], '.feature19-row:first-child', 2],
      [BLOCKS[1], '.feature20-layout', 2],
      [BLOCKS[2], '.feature21-layout', 2],
      [BLOCKS[3], '.feature22-metrics', 4],
      [BLOCKS[4], '.feature23-grid', 3],
      [BLOCKS[5], '.feature24-layout', 2],
    ];
    for (const [block, selector, columns] of expectations) {
      await openBlock(page, block);
      expect(await page.locator(selector).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(columns);
    }
  });

  test('alternating rows reverse visually while preserving source order', async ({ page }) => {
    await openBlock(page, BLOCKS[0]);
    const second = page.locator('.feature19-row').nth(1);
    expect(await second.locator('.feature19-media').evaluate((node) => getComputedStyle(node).gridColumnStart)).toBe('2');
    expect(await second.locator('.feature19-copy').evaluate((node) => getComputedStyle(node).gridColumnStart)).toBe('1');
  });

  test('native disclosure list works without custom JavaScript', async ({ page }) => {
    await openBlock(page, BLOCKS[5]);
    const details = page.locator('.feature24-disclosures details');
    await expect(details.first()).toHaveAttribute('open', '');
    await details.nth(1).locator('summary').click();
    await expect(details.nth(1)).toHaveAttribute('open', '');
    await expect(details.nth(1).locator('p')).toBeVisible();
  });

  test('all feature source stays vanilla, tokenized, and flex-free', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks/feature-batch4.css'), 'utf8');
    expect(css).not.toMatch(/display\s*:\s*flex|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    }
  });

  test('catalog exposes Feature 1–24 in order and continues from Feature 18', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="features-title"] .bb-card');
    await expect(cards).toHaveCount(24);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(Array.from({ length: 24 }, (_, index) => `Feature ${index + 1}`));
    await page.goto(`${server.origin}/templates/blocks/feature-photo-overlay-panel.html`);
    await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', BLOCKS[0].file);
  });
});
