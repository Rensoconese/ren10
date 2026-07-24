// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 1, file: 'feature-split-copy-image.html', layout: 'split', image: true },
  { number: 2, file: 'feature-split-image-copy.html', layout: 'split', image: true },
  { number: 3, file: 'feature-centered-icon-grid.html', layout: 'three', image: false },
  { number: 4, file: 'feature-split-heading-grid.html', layout: 'two', image: false },
  { number: 5, file: 'feature-media-top-columns.html', layout: 'three', image: true },
  { number: 6, file: 'feature-staggered-media-grid.html', layout: 'bento', image: true },
];

const CHAIN = [
  ['cta-split-photo-email.html', 'feature-split-image-copy.html'],
  ['feature-split-copy-image.html', 'feature-centered-icon-grid.html'],
  ['feature-split-image-copy.html', 'feature-split-heading-grid.html'],
  ['feature-centered-icon-grid.html', 'feature-media-top-columns.html'],
  ['feature-split-heading-grid.html', 'feature-staggered-media-grid.html'],
  ['feature-media-top-columns.html', 'feature-split-image-metrics.html'],
];

let server;

test.describe('Feature 1–6 Ren10 blocks', () => {
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
      await expect(page.locator('.bb-block-pagination a[rel="prev"]')).toHaveAttribute('href', CHAIN[block.number - 1][0]);
      await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', CHAIN[block.number - 1][1]);
      if (block.image) {
        const image = root.locator('img[src^="media/"][width][height][alt]');
        await expect(image).toHaveCount(1);
        expect(await image.getAttribute('alt')).not.toHaveLength(0);
      } else {
        await expect(root.locator('img, video')).toHaveCount(0);
      }
    });

    test(`Feature ${block.number} stays fluid, grid-based, and axe clean`, async ({ page }) => {
      await openBlock(page, block, 390, 844);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      expect(await page.locator(`[data-feature${block.number}-root] .ren-grid`).evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).display === 'grid'))).toBe(true);
      await injectAxe(page);
      await checkA11y(page, `[data-feature${block.number}-root]`, { detailedReport: true, detailedReportOptions: { html: true } });
    });
  }

  test('split variants move from two columns to one without changing reading order', async ({ page }) => {
    for (const block of BLOCKS.filter(({ layout }) => layout === 'split')) {
      await openBlock(page, block, 1280, 900);
      expect(await page.locator(`.feature${block.number}-layout`).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(2);
      await openBlock(page, block, 390, 844);
      expect(await page.locator(`.feature${block.number}-layout`).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(1);
    }
  });

  test('all feature source stays vanilla, tokenized, and flex-free', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks/feature-batch1.css'), 'utf8');
    expect(css).not.toMatch(/display\s*:\s*flex|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
    }
  });

  test('catalog keeps Feature 1–6 first and continues from CTA 60', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="features-title"] .bb-card');
    expect(await cards.count()).toBeGreaterThanOrEqual(6);
    expect(await cards.locator('.bb-card-eyebrow').evaluateAll((nodes) => nodes.slice(0, 6).map((node) => node.textContent))).toEqual(BLOCKS.map(({ number }) => `Feature ${number}`));
    await page.goto(`${server.origin}/templates/blocks/cta-split-photo-email.html`);
    await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveAttribute('href', BLOCKS[0].file);
  });
});
