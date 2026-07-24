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

  test('centered statement groups heading and attribution with deliberate rhythm', async ({ page }) => {
    await open(page, 0, 390, 844);
    const gaps = await page.locator('.testimonial1-content').evaluate((content) => ({
      content: parseFloat(getComputedStyle(content).gap),
      heading: parseFloat(getComputedStyle(content.querySelector('.testimonial1-heading')).gap),
      attribution: parseFloat(getComputedStyle(content.querySelector('.testimonial1-attribution')).gap),
    }));
    expect(gaps.content).toBeGreaterThan(gaps.heading);
    expect(gaps.content).toBeGreaterThan(gaps.attribution);
  });

  test('contrast testimonials retain stable contrast in dark theme', async ({ page }) => {
    for (const [index, surfaceSelector, textSelector] of [
      [3, '.testimonial4-block', '.testimonial4-quote'],
      [8, '.testimonial9-block', '.testimonial9-quote'],
      [11, '.testimonial12-card:first-child', '.testimonial12-quote'],
    ]) {
      await open(page, index);
      await page.locator('html').evaluate((html) => { html.dataset.theme = 'dark'; });
      const colors = await page.locator(surfaceSelector).evaluate((surface, selector) => ({
        background: getComputedStyle(surface).backgroundColor,
        foreground: getComputedStyle(document.querySelector(selector)).color,
      }), textSelector);
      expect(colors.background).toBe('rgb(0, 0, 0)');
      expect(colors.foreground).toBe('rgb(255, 255, 255)');
    }
  });

  test('accent perspective keeps its kicker visible and journey owns one quote rule', async ({ page }) => {
    await open(page, 7);
    const accentColors = await page.locator('.testimonial8-card:nth-child(2)').evaluate((card) => ({
      kicker: getComputedStyle(card.querySelector('.dx-kicker')).color,
      quote: getComputedStyle(card.querySelector('.testimonial8-quote')).color,
    }));
    expect(accentColors.kicker).toBe(accentColors.quote);

    await open(page, 9);
    const borders = await page.locator('.testimonial10-story').evaluate((story) => ({
      story: parseFloat(getComputedStyle(story).borderInlineStartWidth),
      quote: parseFloat(getComputedStyle(story.querySelector('blockquote')).borderInlineStartWidth),
    }));
    expect(borders.story).toBe(0);
    expect(borders.quote).toBeGreaterThan(0);
  });

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
