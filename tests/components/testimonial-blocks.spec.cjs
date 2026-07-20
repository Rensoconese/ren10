// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  ['testimonial-centered-statement.html', 1, 0],
  ['testimonial-split-photo-story.html', 1, 1],
  ['testimonial-three-card-grid.html', 3, 0],
  ['testimonial-contrast-metrics.html', 1, 0],
  ['testimonial-editorial-photo-case.html', 1, 1],
  ['testimonial-editorial-mosaic.html', 1, 0],
  ['testimonial-logo-rail-statement.html', 1, 0],
  ['testimonial-dual-perspectives.html', 2, 0],
  ['testimonial-photo-overlay.html', 1, 1],
  ['testimonial-customer-journey.html', 1, 0],
  ['testimonial-proof-aside.html', 1, 0],
  ['testimonial-asymmetric-wall.html', 1, 0],
];
const CHAIN = ['faq-category-directory.html', ...BLOCKS.map(([file]) => file), 'index.html#testimonial-blocks'];
let server;

test.describe('Testimonial 1–12 Ren10 blocks', () => {
  test.beforeAll(async () => {
    server = await startStaticServer(ROOT_DIR);
  });
  test.afterAll(async () => server?.close());

  async function open(page, index, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}/templates/blocks/${BLOCKS[index][0]}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`.testimonial${index + 1}-block`)).toBeVisible();
  }

  for (const [index, [file, quoteCount, imageCount]] of BLOCKS.entries()) {
    test(`Testimonial ${index + 1} anatomy and navigation`, async ({ page }) => {
      await open(page, index);
      const root = page.locator(`.testimonial${index + 1}-block`);
      await expect(page.locator('.bb-detail-header h1')).toHaveCount(1);
      await expect(page.locator('.bb-detail-header .bb-detail-description')).toHaveCount(1);
      await expect(root.locator('h2')).toHaveCount(1);
      await expect(root.locator('blockquote')).toHaveCount(quoteCount);
      await expect(root.locator('img[src^="media/"][width][height][alt]')).toHaveCount(imageCount);
      await expect(page.locator('a[rel="prev"]')).toHaveAttribute('href', CHAIN[index]);
      await expect(page.locator('a[rel="next"]')).toHaveAttribute('href', CHAIN[index + 2]);
      expect(fs.existsSync(path.join(ROOT_DIR, 'templates/blocks', file))).toBe(true);
    });

    test(`Testimonial ${index + 1} mobile Grid and a11y`, async ({ page }) => {
      await open(page, index, 390, 844);
      const root = page.locator(`.testimonial${index + 1}-block`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      expect(
        await root.locator('.ren-grid').evaluateAll((nodes) =>
          nodes.every((node) => getComputedStyle(node).display === 'grid'),
        ),
      ).toBe(true);
      await injectAxe(page);
      await checkA11y(page, `.testimonial${index + 1}-block`);
    });
  }

  test('testimonial source policy and catalog order', async ({ page }) => {
    for (const file of [
      'testimonial-batch1.css',
      'testimonial-batch2.css',
      ...BLOCKS.map(([name]) => name),
    ]) {
      expect(fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', file), 'utf8')).not.toMatch(
        /display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i,
      );
    }
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="testimonial-blocks"] .bb-card');
    await expect(cards).toHaveCount(12);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(
      Array.from({ length: 12 }, (_, index) => `Testimonial ${index + 1}`),
    );
  });
});
