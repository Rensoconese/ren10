// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { file: 'contact-split-form-details.html', controls: 5, cards: 0 },
  { file: 'contact-centered-form.html', controls: 4, cards: 0 },
  { file: 'contact-details-cards.html', controls: 0, cards: 3 },
  { file: 'contact-photo-form.html', controls: 4, cards: 0, images: 1 },
  { file: 'contact-office-directory.html', controls: 0, cards: 3, addresses: 3 },
  { file: 'contact-support-routes.html', controls: 0, cards: 3 },
  { file: 'contact-contrast-form.html', controls: 4, cards: 0 },
  { file: 'contact-office-photo-details.html', controls: 0, cards: 1, images: 1, addresses: 1 },
  { file: 'contact-sales-support-split.html', controls: 0, cards: 2 },
  { file: 'contact-minimal-direct.html', controls: 0, cards: 0 },
  { file: 'contact-regional-directory.html', controls: 0, cards: 4, addresses: 4 },
  { file: 'contact-hub-form-routes.html', controls: 4, cards: 2 },
];
const CHAIN = [
  'application-shell-team-directory.html',
  ...BLOCKS.map(({ file }) => file),
  'pricing-three-tier-cards.html',
];
let server;

test.describe('Contact 1–12 Ren10 blocks', () => {
  test.beforeAll(async () => {
    server = await startStaticServer(ROOT_DIR);
  });
  test.afterAll(async () => server?.close());

  async function open(page, index, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}/templates/blocks/${BLOCKS[index].file}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`.contact${index + 1}-block`)).toBeVisible();
  }

  for (const [index, block] of BLOCKS.entries()) {
    test(`Contact ${index + 1} preserves its anatomy and block navigation`, async ({ page }) => {
      await open(page, index);
      const root = page.locator(`.contact${index + 1}-block`);

      await expect(page.locator('.bb-detail-header h1')).toHaveCount(1);
      await expect(page.locator('.bb-detail-header .bb-detail-description')).toHaveCount(1);
      await expect(root.locator('h2')).toHaveCount(1);
      await expect(root.locator('input, textarea, select')).toHaveCount(block.controls);
      await expect(root.locator('[data-contact-card]')).toHaveCount(block.cards);
      await expect(root.locator('img[src^="media/"][width][height][alt]')).toHaveCount(block.images || 0);
      await expect(root.locator('address')).toHaveCount(block.addresses || 0);
      await expect(root.locator('a[href^="mailto:"], a[href^="tel:"]')).not.toHaveCount(0);
      await expect(page.locator('a[rel="prev"]')).toHaveAttribute('href', CHAIN[index]);
      await expect(page.locator('a[rel="next"]')).toHaveAttribute('href', CHAIN[index + 2]);
      expect(fs.existsSync(path.join(ROOT_DIR, 'templates/blocks', block.file))).toBe(true);
    });

    test(`Contact ${index + 1} remains fluid, Grid-based, and axe clean`, async ({ page }) => {
      await open(page, index, 390, 844);
      const root = page.locator(`.contact${index + 1}-block`);

      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      expect(
        await root.locator('.ren-grid').evaluateAll((nodes) =>
          nodes.every((node) => getComputedStyle(node).display === 'grid'),
        ),
      ).toBe(true);
      await injectAxe(page);
      await checkA11y(page, `.contact${index + 1}-block`);
    });
  }

  test('contact forms use Ren10 form and field contracts with visible labels', async ({ page }) => {
    for (const index of [0, 1, 3, 6, 11]) {
      await open(page, index);
      const root = page.locator(`.contact${index + 1}-block`);
      const form = root.locator('ren-form > form.ren-form');
      await expect(form).toHaveCount(1);
      await expect(form.locator('.ren-form-error-summary[role="alert"][tabindex="-1"]')).toHaveCount(1);
      await expect(form.locator('ren-field')).toHaveCount(BLOCKS[index].controls);
      await expect(form.locator('ren-field > label')).toHaveCount(BLOCKS[index].controls);
      await expect(form.locator('button[type="submit"]')).toHaveCount(1);
    }
  });

  test('split compositions become true multi-column Grids on desktop', async ({ page }) => {
    for (const index of [0, 3, 6, 7, 8, 11]) {
      await open(page, index);
      const columns = await page.locator(`.contact${index + 1}-layout`).evaluate((node) =>
        getComputedStyle(node).gridTemplateColumns.split(' ').filter(Boolean).length,
      );
      expect(columns).toBeGreaterThan(1);
    }
  });

  test('direct details stack cleanly and photo media uses the Ren10 frame primitive', async ({ page }) => {
    await open(page, 0, 390, 844);
    await expect(page.locator('.contact-direct-item.ren-stack')).toHaveCount(3);

    await open(page, 3, 390, 844);
    const frame = page.locator('.contact4-media.ren-frame.ren-frame-photo');
    await expect(frame).toHaveCount(1);
    const ratio = await frame.evaluate((node) => node.getBoundingClientRect().width / node.getBoundingClientRect().height);
    expect(ratio).toBeGreaterThan(1.2);
    expect(ratio).toBeLessThan(1.5);
  });

  test('contact family obeys source policy and catalog order', async ({ page }) => {
    for (const file of ['contact-batch1.css', 'contact-batch2.css', ...BLOCKS.map(({ file }) => file)]) {
      expect(fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', file), 'utf8')).not.toMatch(
        /display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i,
      );
    }

    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="contact-blocks"] .bb-card');
    await expect(cards).toHaveCount(12);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(
      Array.from({ length: 12 }, (_, index) => `Contact ${index + 1}`),
    );

    await page.goto(`${server.origin}/templates/blocks/application-shell-team-directory.html`);
    await expect(page.locator('a[rel="next"]')).toHaveAttribute('href', 'contact-split-form-details.html');
  });
});
