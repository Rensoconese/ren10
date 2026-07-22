// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  ['article-header-editorial-centered.html', 0],
  ['article-header-split-cover.html', 1],
  ['article-header-panorama.html', 1],
  ['article-header-author-feature.html', 1],
  ['article-header-contrast-type.html', 0],
  ['article-header-category-index.html', 0],
  ['article-header-photo-overlay.html', 1],
  ['article-header-sidebar-summary.html', 0],
  ['article-header-numbered-series.html', 0],
  ['article-header-magazine-mosaic.html', 3],
  ['article-header-research-brief.html', 0],
  ['article-header-minimal-reading.html', 0],
];
const CHAIN = ['pricing-contrast-platform.html', ...BLOCKS.map(([file]) => file), 'index.html#article-header-blocks'];
let server;

test.describe('Article header 1–12 Ren10 blocks', () => {
  test.beforeAll(async () => {
    server = await startStaticServer(ROOT_DIR);
  });
  test.afterAll(async () => server?.close());

  async function open(page, index, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}/templates/blocks/${BLOCKS[index][0]}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`.article${index + 1}-block`)).toBeVisible();
  }

  for (const [index, [file, imageCount]] of BLOCKS.entries()) {
    test(`Article header ${index + 1} anatomy and navigation`, async ({ page }) => {
      await open(page, index);
      const root = page.locator(`.article${index + 1}-block`);
      await expect(page.locator('.bb-detail-header h1')).toHaveCount(1);
      await expect(page.locator('.bb-detail-header .bb-detail-description')).toHaveCount(1);
      await expect(root.locator('h2')).toHaveCount(1);
      await expect(root.locator('header')).toHaveCount(1);
      await expect(root.locator('img[src^="media/"][width][height][alt]')).toHaveCount(imageCount);
      await expect(page.locator('a[rel="prev"]')).toHaveAttribute('href', CHAIN[index]);
      await expect(page.locator('a[rel="next"]')).toHaveAttribute('href', CHAIN[index + 2]);
      expect(fs.existsSync(path.join(ROOT_DIR, 'templates/blocks', file))).toBe(true);
    });

    test(`Article header ${index + 1} mobile Grid and a11y`, async ({ page }) => {
      await open(page, index, 390, 844);
      const root = page.locator(`.article${index + 1}-block`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      expect(
        await root.locator('.ren-grid').evaluateAll((nodes) =>
          nodes.every((node) => getComputedStyle(node).display === 'grid'),
        ),
      ).toBe(true);
      await injectAxe(page);
      await checkA11y(page, `.article${index + 1}-block`);
    });
  }

  test('article header source policy', () => {
    for (const file of ['article-header-batch1.css', 'article-header-batch2.css', ...BLOCKS.map(([name]) => name)]) {
      expect(fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', file), 'utf8')).not.toMatch(
        /display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i,
      );
    }
  });

  test('catalog lists every article header in order', async ({ page }) => {
    const response = await page.goto(`${server.origin}/templates/blocks/index.html#article-header-blocks`);
    expect(response?.status()).toBe(200);
    const section = page.locator('#article-header-blocks').locator('..').locator('..');
    await expect(section.locator('.bb-card')).toHaveCount(BLOCKS.length);
    expect(await section.locator('.bb-card').evaluateAll((links) => links.map((link) => link.getAttribute('href')))).toEqual(
      BLOCKS.map(([file]) => file),
    );
  });

  test('editorial rhythm keeps the kicker close to the title and opens before provenance', async ({ page }) => {
    for (const [index] of BLOCKS.entries()) {
      await open(page, index);
      const rhythm = await page.locator(`.article${index + 1}-block`).evaluate((root) => {
        const kicker = root.querySelector('.article-kicker');
        const title = root.querySelector('.article-title, .article12-title');
        const deck = root.querySelector('.article-deck');
        if (!kicker || !title || !deck) return null;
        const kickerBox = kicker.getBoundingClientRect();
        const titleBox = title.getBoundingClientRect();
        const deckBox = deck.getBoundingClientRect();
        const next = deck.nextElementSibling;
        const nextBox = next?.getBoundingClientRect();
        return {
          kickerToTitle: titleBox.top - kickerBox.bottom,
          titleToDeck: deckBox.top - titleBox.bottom,
          deckToNext: nextBox ? nextBox.top - deckBox.bottom : null,
        };
      });

      expect(rhythm).not.toBeNull();
      expect(rhythm.kickerToTitle).toBeLessThan(rhythm.titleToDeck);
      expect(rhythm.kickerToTitle).toBeLessThanOrEqual(12);
      if (rhythm.deckToNext !== null) expect(rhythm.deckToNext).toBeGreaterThan(rhythm.titleToDeck);
    }
  });

  test('numbered series keeps the issue number on one horizontal line', async ({ page }) => {
    for (const width of [768, 1280]) {
      await open(page, 8, width, 900);
      const glyphTops = await page.locator('.article9-number').evaluate((number) => {
        const text = number.firstChild;
        return [0, 1].map((offset) => {
          const range = document.createRange();
          range.setStart(text, offset);
          range.setEnd(text, offset + 1);
          return range.getBoundingClientRect().top;
        });
      });
      expect(Math.abs(glyphTops[0] - glyphTops[1])).toBeLessThanOrEqual(1);
    }
  });

  test('fixed dark editorial surfaces keep readable light text in both themes', async ({ page }) => {
    await open(page, 4);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      const colors = await page.locator('.article5-block').evaluate((root) => {
        const channels = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number);
        const index = root.querySelector('.article5-index');
        const row = index.querySelector('li');
        return {
          background: channels(getComputedStyle(root).backgroundColor),
          foreground: channels(getComputedStyle(root.querySelector('.article-title')).color),
          indexForeground: channels(getComputedStyle(index).color),
          indexBorder: channels(getComputedStyle(index).borderTopColor),
          rowBorder: channels(getComputedStyle(row).borderBottomColor),
        };
      });
      const brightness = (channels) => channels.reduce((sum, channel) => sum + channel, 0) / channels.length;
      expect(brightness(colors.background)).toBeLessThan(64);
      expect(brightness(colors.foreground)).toBeGreaterThan(191);
      expect(brightness(colors.indexForeground)).toBeGreaterThan(191);
      expect(brightness(colors.indexBorder)).toBeGreaterThan(191);
      expect(brightness(colors.rowBorder)).toBeGreaterThan(191);
    }

    await open(page, 6);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      const foreground = await page.locator('.article7-copy .article-title').evaluate((title) =>
        getComputedStyle(title).color.match(/[\d.]+/g).slice(0, 3).map(Number),
      );
      expect(foreground.reduce((sum, channel) => sum + channel, 0) / foreground.length).toBeGreaterThan(191);
    }
  });
});
