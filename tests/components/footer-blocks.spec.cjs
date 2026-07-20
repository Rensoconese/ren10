// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  'footer-compact-brand-links.html',
  'footer-multi-column-directory.html',
  'footer-newsletter-directory.html',
  'footer-contrast-statement.html',
  'footer-split-contact.html',
  'footer-product-sitemap.html',
  'footer-editorial-wordmark.html',
  'footer-social-proof.html',
  'footer-cta-band.html',
  'footer-legal-directory.html',
  'footer-minimal-centered.html',
  'footer-product-ecosystem.html',
];
const CHAIN = ['testimonial-asymmetric-wall.html', ...BLOCKS, 'index.html#application-shell-blocks'];
let server;

test.describe('Footer 1–12 Ren10 blocks', () => {
  test.beforeAll(async () => {
    server = await startStaticServer(ROOT_DIR);
  });
  test.afterAll(async () => server?.close());

  async function open(page, index, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}/templates/blocks/${BLOCKS[index]}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`.footer${index + 1}-block`)).toBeVisible();
  }

  for (const [index, file] of BLOCKS.entries()) {
    test(`Footer ${index + 1} anatomy and navigation`, async ({ page }) => {
      await open(page, index);
      const root = page.locator(`.footer${index + 1}-block`);
      await expect(page.locator('.bb-detail-header h1')).toHaveCount(1);
      await expect(page.locator('.bb-detail-header .bb-detail-description')).toHaveCount(1);
      await expect(root).toHaveCount(1);
      await expect(root.locator('h2')).toHaveCount(1);
      await expect(root.locator('a[href]')).not.toHaveCount(0);
      await expect(page.locator('a[rel="prev"]')).toHaveAttribute('href', CHAIN[index]);
      await expect(page.locator('a[rel="next"]')).toHaveAttribute('href', CHAIN[index + 2]);
      expect(fs.existsSync(path.join(ROOT_DIR, 'templates/blocks', file))).toBe(true);
    });

    test(`Footer ${index + 1} mobile Grid and a11y`, async ({ page }) => {
      await open(page, index, 390, 844);
      const root = page.locator(`.footer${index + 1}-block`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      expect(
        await root.locator('.ren-grid').evaluateAll((nodes) =>
          nodes.every((node) => getComputedStyle(node).display === 'grid'),
        ),
      ).toBe(true);
      await injectAxe(page);
      await checkA11y(page, `.footer${index + 1}-block`);
    });
  }

  test('newsletter form has a labeled native field and submit button', async ({ page }) => {
    await open(page, 2);
    await expect(page.getByLabel('Work email')).toHaveAttribute('type', 'email');
    await expect(page.getByRole('button', { name: 'Subscribe' })).toHaveAttribute('type', 'submit');
  });

  test('legal disclosure uses native details behavior', async ({ page }) => {
    await open(page, 9);
    const details = page.locator('.footer10-disclosure');
    await expect(details).not.toHaveAttribute('open', '');
    await details.locator('summary').click();
    await expect(details).toHaveAttribute('open', '');
  });

  test('footer source policy and catalog order', async ({ page }) => {
    for (const file of ['footer-batch1.css', 'footer-batch2.css', ...BLOCKS]) {
      expect(fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', file), 'utf8')).not.toMatch(
        /display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i,
      );
    }
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="footer-blocks"] .bb-card');
    await expect(cards).toHaveCount(12);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(
      Array.from({ length: 12 }, (_, index) => `Footer ${index + 1}`),
    );
  });
});
