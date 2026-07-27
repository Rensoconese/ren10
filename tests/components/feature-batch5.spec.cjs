// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 25, file: 'feature-tabbed-media-showcase.html', items: '.feature25-panel', count: 3, images: 3 },
  { number: 26, file: 'feature-timeline-media.html', items: '.feature26-step', count: 4, images: 1 },
  { number: 27, file: 'feature-capability-mosaic.html', items: '.feature27-item', count: 5, images: 0 },
  { number: 28, file: 'feature-split-contrast-checklist.html', items: '.feature28-item', count: 4, images: 0 },
  { number: 29, file: 'feature-architecture-layers.html', items: '.feature29-layer', count: 3, images: 0 },
  { number: 30, file: 'feature-gallery-quote-rail.html', items: '.feature30-card', count: 3, images: 2 },
];

const CHAIN = [
  ['feature-photo-disclosure-list.html', 'feature-timeline-media.html'],
  ['feature-tabbed-media-showcase.html', 'feature-capability-mosaic.html'],
  ['feature-timeline-media.html', 'feature-split-contrast-checklist.html'],
  ['feature-capability-mosaic.html', 'feature-architecture-layers.html'],
  ['feature-split-contrast-checklist.html', 'feature-gallery-quote-rail.html'],
  ['feature-architecture-layers.html', 'feature-panorama-capability-deck.html'],
];

let server;

test.describe('Feature 25–30 Ren10 blocks', () => {
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
      await expect(page.locator('.bb-block-pagination a[rel="prev"]')).toHaveAttribute('href', CHAIN[block.number - 25][0]);
      await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', CHAIN[block.number - 25][1]);
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
      [BLOCKS[0], '.feature25-panel:not([hidden])', 2],
      [BLOCKS[1], '.feature26-layout', 2],
      [BLOCKS[2], '.feature27-grid', 3],
      [BLOCKS[3], '.feature28-layout', 2],
      [BLOCKS[4], '.feature29-layer:first-child', 3],
      [BLOCKS[5], '.feature30-grid', 3],
    ];
    for (const [block, selector, columns] of expectations) {
      await openBlock(page, block);
      expect(await page.locator(selector).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(columns);
    }
  });

  test('tabbed showcase changes panels and maintains ARIA state', async ({ page }) => {
    await openBlock(page, BLOCKS[0]);
    const tabs = page.locator('.feature25-tabs .ren-tab');
    const panels = page.locator('.feature25-panel');
    await expect(tabs).toHaveCount(3);
    await expect(panels).toHaveCount(3);
    await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(panels.first()).toBeHidden();
    await expect(panels.nth(1)).toBeVisible();
    await expect(panels.nth(1).locator('h3')).toHaveText('Compose clear hierarchy at every available width');
  });

  test('all feature source stays vanilla, tokenized, and flex-free', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks/feature-batch5.css'), 'utf8');
    expect(css).not.toMatch(/display\s*:\s*flex|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    }
  });

  test('catalog preserves Feature 1–30 in order and continues from Feature 24', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="features-title"] .bb-card');
    expect(await cards.count()).toBeGreaterThanOrEqual(30);
    expect(await cards.locator('.bb-card-eyebrow').evaluateAll((nodes) => nodes.slice(0, 30).map((node) => node.textContent?.trim()))).toEqual(Array.from({ length: 30 }, (_, index) => `Feature ${index + 1}`));
    await page.goto(`${server.origin}/templates/blocks/feature-photo-disclosure-list.html`);
    await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', BLOCKS[0].file);
  });
});
