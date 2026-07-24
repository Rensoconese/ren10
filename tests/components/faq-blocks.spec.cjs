// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  ['faq-centered-accordion.html', 4],
  ['faq-split-heading-accordion.html', 4],
  ['faq-two-column-groups.html', 6],
  ['faq-category-cards.html', 4],
  ['faq-contrast-split.html', 4],
  ['faq-support-aside.html', 4],
  ['faq-indexed-editorial-list.html', 5],
  ['faq-proof-split.html', 4],
  ['faq-accent-panel.html', 4],
  ['faq-support-band.html', 3],
  ['faq-multiple-open.html', 4],
  ['faq-category-directory.html', 6],
];
const CHAIN = [
  'feature-system-operating-matrix.html',
  ...BLOCKS.map(([file]) => file),
  'testimonial-centered-statement.html',
];
let server;

test.describe('FAQ 1–12 Ren10 blocks', () => {
  test.beforeAll(async () => {
    server = await startStaticServer(ROOT_DIR);
  });
  test.afterAll(async () => server?.close());

  async function open(page, index, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}/templates/blocks/${BLOCKS[index][0]}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`.faq${index + 1}-block`)).toBeVisible();
  }

  for (const [index, [file, detailCount]] of BLOCKS.entries()) {
    test(`FAQ ${index + 1} anatomy and navigation`, async ({ page }) => {
      await open(page, index);
      const root = page.locator(`.faq${index + 1}-block`);
      await expect(page.locator('.bb-detail-header h1')).toHaveCount(1);
      await expect(page.locator('.bb-detail-header .bb-detail-description')).toHaveCount(1);
      await expect(root.locator('h2')).toHaveCount(1);
      await expect(root.locator('details')).toHaveCount(detailCount);
      await expect(root.locator('details > summary.ren-accordion-trigger')).toHaveCount(detailCount);
      await expect(page.locator('a[rel="prev"]')).toHaveAttribute('href', CHAIN[index]);
      await expect(page.locator('a[rel="next"]')).toHaveAttribute('href', CHAIN[index + 2]);
      expect(fs.existsSync(path.join(ROOT_DIR, 'templates/blocks', file))).toBe(true);
    });

    test(`FAQ ${index + 1} mobile Grid, disclosure and a11y`, async ({ page }) => {
      await open(page, index, 390, 844);
      const root = page.locator(`.faq${index + 1}-block`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      expect(
        await root.locator('.ren-grid').evaluateAll((nodes) =>
          nodes.every((node) => getComputedStyle(node).display === 'grid'),
        ),
      ).toBe(true);
      const first = root.locator('details').first();
      const wasOpen = await first.evaluate((node) => node.hasAttribute('open'));
      await first.locator('summary').click();
      expect(await first.evaluate((node) => node.hasAttribute('open'))).toBe(!wasOpen);
      await injectAxe(page);
      await checkA11y(page, `.faq${index + 1}-block`);
    });
  }

  test('multiple-open FAQ preserves simultaneous disclosures', async ({ page }) => {
    await open(page, 10);
    const details = page.locator('.faq11-block details');
    await expect(details.nth(0)).toHaveAttribute('open', '');
    await expect(details.nth(1)).toHaveAttribute('open', '');
    await details.nth(2).locator('summary').click();
    await expect(details.nth(0)).toHaveAttribute('open', '');
    await expect(details.nth(1)).toHaveAttribute('open', '');
    await expect(details.nth(2)).toHaveAttribute('open', '');
  });

  test('contained FAQ triggers preserve readable inline padding', async ({ page }) => {
    for (const index of [1, 3, 4, 6, 11]) {
      await open(page, index, 390, 844);
      const padding = await page.locator(`.faq${index + 1}-block .ren-accordion-trigger`).evaluateAll(
        (triggers) => triggers.map((trigger) => parseFloat(getComputedStyle(trigger).paddingInlineStart)),
      );
      expect(padding.every((value) => value >= 12)).toBe(true);
    }
  });

  test('FAQ source policy and catalog order', async ({ page }) => {
    for (const file of ['faq-batch1.css', 'faq-batch2.css', ...BLOCKS.map(([name]) => name)]) {
      expect(fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', file), 'utf8')).not.toMatch(
        /display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i,
      );
    }
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="faq-blocks"] .bb-card');
    await expect(cards).toHaveCount(12);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(
      Array.from({ length: 12 }, (_, index) => `FAQ ${index + 1}`),
    );
  });
});
