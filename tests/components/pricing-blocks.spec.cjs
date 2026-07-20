// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  'pricing-three-tier-cards.html',
  'pricing-comparison-table.html',
  'pricing-featured-plan-split.html',
  'pricing-usage-calculator.html',
  'pricing-billing-period-toggle.html',
  'pricing-enterprise-split.html',
  'pricing-compact-plan-rows.html',
  'pricing-outcome-packages.html',
  'pricing-modular-add-ons.html',
  'pricing-startup-program.html',
  'pricing-single-plan-checklist.html',
  'pricing-contrast-platform.html',
];
const CHAIN = ['application-shell-team-directory.html', ...BLOCKS, 'index.html#pricing-blocks'];
let server;

test.describe('Pricing 1–12 Ren10 blocks', () => {
  test.beforeAll(async () => {
    server = await startStaticServer(ROOT_DIR);
  });
  test.afterAll(async () => server?.close());

  async function open(page, index, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}/templates/blocks/${BLOCKS[index]}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`.pricing${index + 1}-block`)).toBeVisible();
  }

  for (const [index, file] of BLOCKS.entries()) {
    test(`Pricing ${index + 1} anatomy and navigation`, async ({ page }) => {
      await open(page, index);
      const root = page.locator(`.pricing${index + 1}-block`);
      await expect(page.locator('.bb-detail-header h1')).toHaveCount(1);
      await expect(page.locator('.bb-detail-header .bb-detail-description')).toHaveCount(1);
      await expect(root.locator('h2')).toHaveCount(1);
      await expect(root.locator('a[href], button, input, select, table')).not.toHaveCount(0);
      await expect(page.locator('a[rel="prev"]')).toHaveAttribute('href', CHAIN[index]);
      await expect(page.locator('a[rel="next"]')).toHaveAttribute('href', CHAIN[index + 2]);
      expect(fs.existsSync(path.join(ROOT_DIR, 'templates/blocks', file))).toBe(true);
    });

    test(`Pricing ${index + 1} mobile Grid and a11y`, async ({ page }) => {
      await open(page, index, 390, 844);
      const root = page.locator(`.pricing${index + 1}-block`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      expect(
        await root.locator('.ren-grid').evaluateAll((nodes) =>
          nodes.every((node) => getComputedStyle(node).display === 'grid'),
        ),
      ).toBe(true);
      await injectAxe(page);
      await checkA11y(page, `.pricing${index + 1}-block`);
    });
  }

  test('pricing controls and comparison preserve native semantics', async ({ page }) => {
    await open(page, 1);
    await expect(page.locator('.pricing2-table th[scope="col"]')).toHaveCount(4);
    await open(page, 3);
    await expect(page.getByLabel('Active seats')).toHaveAttribute('type', 'number');
    await expect(page.getByRole('button', { name: 'Review estimate' })).toHaveAttribute('type', 'submit');
    await open(page, 4);
    const radios = page.locator('input[type="radio"][name="billing"]');
    await expect(radios).toHaveCount(2);
    await expect(radios.first()).toBeChecked();
  });

  test('pricing source policy and catalog order', async ({ page }) => {
    for (const file of ['pricing-batch1.css', 'pricing-batch2.css', ...BLOCKS]) {
      expect(fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', file), 'utf8')).not.toMatch(
        /display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i,
      );
    }
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="pricing-blocks"] .bb-card');
    await expect(cards).toHaveCount(12);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(
      Array.from({ length: 12 }, (_, index) => `Pricing ${index + 1}`),
    );
  });
});
