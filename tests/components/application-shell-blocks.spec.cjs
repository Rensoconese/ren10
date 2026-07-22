// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  'application-shell-sidebar-dashboard.html',
  'application-shell-topbar-workspace.html',
  'application-shell-compact-rail-analytics.html',
  'application-shell-split-pane-inbox.html',
  'application-shell-command-center.html',
  'application-shell-content-studio.html',
  'application-shell-project-board.html',
  'application-shell-settings.html',
  'application-shell-data-explorer.html',
  'application-shell-calendar-planner.html',
  'application-shell-service-operations.html',
  'application-shell-team-directory.html',
];
const CHAIN = ['footer-product-ecosystem.html', ...BLOCKS, 'contact-split-form-details.html'];
let server;

test.describe('Application shell 1–12 Ren10 blocks', () => {
  test.beforeAll(async () => {
    server = await startStaticServer(ROOT_DIR);
  });
  test.afterAll(async () => server?.close());

  async function open(page, index, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}/templates/blocks/${BLOCKS[index]}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(`.app${index + 1}-block`)).toBeVisible();
  }

  for (const [index, file] of BLOCKS.entries()) {
    test(`Application shell ${index + 1} anatomy and navigation`, async ({ page }) => {
      await open(page, index);
      const root = page.locator(`.app${index + 1}-block`);
      await expect(page.locator('.bb-detail-header h1')).toHaveCount(1);
      await expect(page.locator('.bb-detail-header .bb-detail-description')).toHaveCount(1);
      await expect(root.locator('h2')).toHaveCount(1);
      await expect(root.locator('button, a[href], input')).not.toHaveCount(0);
      await expect(page.locator('a[rel="prev"]')).toHaveAttribute('href', CHAIN[index]);
      await expect(page.locator('a[rel="next"]')).toHaveAttribute('href', CHAIN[index + 2]);
      expect(fs.existsSync(path.join(ROOT_DIR, 'templates/blocks', file))).toBe(true);
    });

    test(`Application shell ${index + 1} mobile Grid and a11y`, async ({ page }) => {
      await open(page, index, 390, 844);
      const root = page.locator(`.app${index + 1}-block`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      expect(
        await root.locator('.ren-grid').evaluateAll((nodes) =>
          nodes.every((node) => getComputedStyle(node).display === 'grid'),
        ),
      ).toBe(true);
      await injectAxe(page);
      await checkA11y(page, `.app${index + 1}-block`);
    });
  }

  test('settings fields and data table preserve native semantics', async ({ page }) => {
    await open(page, 7);
    await expect(page.getByLabel('Display name')).toHaveValue('Maya Chen');
    await expect(page.getByRole('button', { name: 'Save changes' })).toHaveAttribute('type', 'submit');
    await open(page, 8);
    await expect(page.locator('.app9-table')).toHaveCount(1);
    await expect(page.locator('.app9-table th[scope="col"]')).toHaveCount(4);
  });

  test('application shell source policy and catalog order', async ({ page }) => {
    for (const file of ['application-shell-batch1.css', 'application-shell-batch2.css', ...BLOCKS]) {
      expect(fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', file), 'utf8')).not.toMatch(
        /display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i,
      );
    }
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="application-shell-blocks"] .bb-card');
    await expect(cards).toHaveCount(12);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(
      Array.from({ length: 12 }, (_, index) => `Application shell ${index + 1}`),
    );
  });
});
