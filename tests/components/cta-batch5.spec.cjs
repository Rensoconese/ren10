// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 25, file: 'cta-centered-actions.html', kind: 'actions', media: 'none' },
  { number: 26, file: 'cta-centered-email-capture.html', kind: 'form', media: 'none' },
  { number: 27, file: 'cta-background-photo-centered-actions.html', kind: 'actions', media: 'background' },
  { number: 28, file: 'cta-background-photo-centered-email.html', kind: 'form', media: 'background' },
  { number: 29, file: 'cta-contrast-centered-actions.html', kind: 'actions', media: 'none' },
  { number: 30, file: 'cta-contrast-centered-email.html', kind: 'form', media: 'none' },
];

let server;

test.describe('CTA 25–30 translated to Ren10', () => {
  test.beforeAll(async () => { server = await startStaticServer(ROOT_DIR); });
  test.afterAll(async () => { await server?.close(); });

  async function openBlock(page, block, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    expect((await page.goto(`${server.origin}/templates/blocks/${block.file}`))?.status()).toBe(200);
    await expect(page.locator(`[data-cta${block.number}-root]`)).toBeVisible();
  }

  for (const block of BLOCKS) {
    test(`CTA ${block.number} preserves its official centered anatomy`, async ({ page }) => {
      await openBlock(page, block);
      const root = page.locator(`[data-cta${block.number}-root]`);
      await expect(root.locator(`h2.cta${block.number}-title`)).toHaveCount(1);
      await expect(root.locator(`p.cta${block.number}-description`)).toHaveCount(1);
      await expect(root.locator(`.cta${block.number}-content`)).toHaveCSS('text-align', 'center');

      if (block.kind === 'actions') {
        await expect(root.locator(`.cta${block.number}-actions > a.ren-btn[href]`)).toHaveCount(2);
        await expect(root.locator('form, input, button')).toHaveCount(0);
      } else {
        await expect(root.locator(`form.cta${block.number}-form`)).toHaveCount(1);
        await expect(root.locator('ren-field > label')).toHaveCount(1);
        await expect(root.locator('input[type="email"][name="email"][required]')).toHaveCount(1);
        await expect(root.locator('button[type="submit"].ren-btn')).toHaveCount(1);
        await expect(root.locator(`.cta${block.number}-legal a[href]`)).toHaveCount(1);
      }

      if (block.media === 'background') {
        await expect(root.locator(`.cta${block.number}-background img[src^="media/"][alt=""][width][height]`)).toHaveCount(1);
        await expect(root.locator(`.cta${block.number}-scrim`)).toHaveCount(1);
      } else {
        await expect(root.locator('img, picture, figure, video')).toHaveCount(0);
      }
    });

    test(`CTA ${block.number} is documented, paginated, responsive, and axe clean`, async ({ page }) => {
      await openBlock(page, block, 390, 844);
      await expect(page.locator('.bb-detail-header h1.bb-detail-title')).toHaveCount(1);
      await expect(page.locator('.bb-detail-header p.bb-detail-description')).toHaveCount(1);
      await expect(page.locator('.bb-block-pagination a[rel="prev"]')).toHaveCount(1);
      await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      for (const target of await page.locator(`[data-cta${block.number}-root] a.ren-btn, [data-cta${block.number}-root] button, [data-cta${block.number}-root] input`).all()) {
        expect((await target.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      }
      await injectAxe(page);
      await checkA11y(page, `[data-cta${block.number}-root]`, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });
  }

  test('all layouts use CSS Grid and policy-safe source', async ({ page }) => {
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
      if (block.kind === 'form') expect(source).toMatch(/<span data-error hidden>/);
      await openBlock(page, block);
      const selector = block.kind === 'form' ? `.cta${block.number}-form-row` : `.cta${block.number}-actions`;
      expect(await page.locator(selector).evaluate((node) => getComputedStyle(node).display)).toBe('grid');
    }
  });

  test('background and contrast variants retain their owned foreground in both themes', async ({ page }) => {
    for (const theme of ['light', 'dark']) {
      for (const block of BLOCKS.slice(2)) {
        await openBlock(page, block);
        await page.evaluate((nextTheme) => { document.documentElement.dataset.theme = nextTheme; }, theme);
        const colors = await page.locator(`[data-cta${block.number}-root]`).evaluate((root, number) => ({
          title: getComputedStyle(root.querySelector(`.cta${number}-title`)).color,
          description: getComputedStyle(root.querySelector(`.cta${number}-description`)).color,
        }), block.number);
        expect(colors.title).toBe(colors.description);
      }
    }
  });

  test('catalog exposes CTA 1–54 in order', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="ctas-title"] .bb-card');
    await expect(cards).toHaveCount(54);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(Array.from({ length: 54 }, (_, i) => `CTA ${i + 1}`));
  });
});
