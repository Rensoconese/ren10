// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { file: 'blog-featured-story-grid.html', images: 1, stories: 4 },
  { file: 'blog-category-card-grid.html', images: 3, stories: 6 },
  { file: 'blog-editorial-feed.html', images: 0, stories: 5 },
  { file: 'blog-featured-split-rail.html', images: 1, stories: 4 },
  { file: 'blog-article-toc-layout.html', images: 1, stories: 0 },
  { file: 'blog-archive-index.html', images: 0, stories: 7 },
];
const CHAIN = [
  'article-header-minimal-reading.html',
  ...BLOCKS.map(({ file }) => file),
  'index.html#blog-content-blocks',
];
let server;

test.describe('Blog content 1–6 Ren10 blocks', () => {
  test.beforeAll(async () => {
    server = await startStaticServer(ROOT_DIR);
  });
  test.afterAll(async () => server?.close());

  async function open(page, index, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}/templates/blocks/${BLOCKS[index].file}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`.blog${index + 1}-block`)).toBeVisible();
  }

  for (const [index, block] of BLOCKS.entries()) {
    test(`Blog content ${index + 1} preserves its anatomy and navigation`, async ({ page }) => {
      await open(page, index);
      const root = page.locator(`.blog${index + 1}-block`);

      await expect(page.locator('.bb-detail-header h1')).toHaveCount(1);
      await expect(page.locator('.bb-detail-header .bb-detail-description')).toHaveCount(1);
      await expect(root.locator('h2')).toHaveCount(1);
      await expect(root.locator('img[src^="media/"][width][height][alt]')).toHaveCount(block.images);
      await expect(root.locator('.blog-story-link, .blog-card, .blog-feed-item, .blog4-rail-item, .blog6-entry')).toHaveCount(block.stories);
      await expect(page.locator('a[rel="prev"]')).toHaveAttribute('href', CHAIN[index]);
      await expect(page.locator('a[rel="next"]')).toHaveAttribute('href', CHAIN[index + 2]);
    });

    test(`Blog content ${index + 1} remains fluid, Grid-based, and axe clean`, async ({ page }) => {
      await open(page, index, 390, 844);
      const root = page.locator(`.blog${index + 1}-block`);

      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      expect(
        await root.locator('.ren-grid').evaluateAll((nodes) =>
          nodes.every((node) => getComputedStyle(node).display === 'grid'),
        ),
      ).toBe(true);
      await injectAxe(page);
      await checkA11y(page, `.blog${index + 1}-block`);
    });
  }

  test('desktop compositions resolve into intentional multi-column Grids', async ({ page }) => {
    const selectors = ['.blog1-feature', '.blog2-grid', '.blog3-layout', '.blog4-layout', '.blog5-layout', '.blog6-heading'];
    for (const [index, selector] of selectors.entries()) {
      await open(page, index);
      const columns = await page.locator(selector).evaluate((node) =>
        getComputedStyle(node).gridTemplateColumns.split(' ').filter(Boolean).length,
      );
      expect(columns).toBeGreaterThan(1);
    }
  });

  test('featured hierarchy and indexed rail retain deliberate visual relationships', async ({ page }) => {
    await open(page, 0);
    const featuredSize = await page.locator('.blog1-feature .blog-story-title').evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
    const latestSize = await page.locator('.blog1-latest h3').first().evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
    expect(featuredSize).toBeGreaterThan(latestSize);

    await open(page, 3);
    const offsets = await page.locator('.blog4-rail-item').evaluateAll((rows) => rows.map((row) => {
      const index = row.querySelector('.blog-index').getBoundingClientRect();
      const title = row.querySelector('h3').getBoundingClientRect();
      return Math.abs(index.top - title.top);
    }));
    expect(offsets.every((offset) => offset <= 4)).toBe(true);
  });

  test('long-form block uses semantic article, contents navigation, and linked headings', async ({ page }) => {
    await open(page, 4);
    await expect(page.locator('article.blog5-block')).toHaveCount(1);
    await expect(page.locator('.blog5-toc[aria-label="On this page"]')).toHaveCount(1);
    await expect(page.locator('.blog5-toc a')).toHaveCount(3);
    await expect(page.locator('.blog5-prose h3[id]')).toHaveCount(3);
    await expect(page.locator('.blog5-prose blockquote')).toHaveCount(1);
  });

  test('blog family obeys source policy and catalog order', async ({ page }) => {
    for (const file of ['blog-content-batch1.css', ...BLOCKS.map(({ file }) => file)]) {
      expect(fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', file), 'utf8')).not.toMatch(
        /display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i,
      );
    }

    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="blog-content-blocks"] .bb-card');
    await expect(cards).toHaveCount(6);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(
      Array.from({ length: 6 }, (_, index) => `Blog content ${index + 1}`),
    );

    await page.goto(`${server.origin}/templates/blocks/article-header-minimal-reading.html`);
    await expect(page.locator('a[rel="next"]')).toHaveAttribute('href', 'blog-featured-story-grid.html');
  });
});
