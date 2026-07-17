// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 31, file: 'cta-centered-actions-landscape.html', kind: 'actions', support: 'media' },
  { number: 32, file: 'cta-centered-email-landscape.html', kind: 'form', support: 'media' },
  { number: 33, file: 'cta-centered-actions-logo-rail.html', kind: 'actions', support: 'logos' },
  { number: 34, file: 'cta-centered-email-logo-rail.html', kind: 'form', support: 'logos' },
  { number: 35, file: 'cta-dual-cards-left.html', kind: 'cards', support: 'left' },
  { number: 36, file: 'cta-dual-cards-centered.html', kind: 'cards', support: 'center' },
];

let server;

test.describe('CTA 31–36 translated to Ren10', () => {
  test.beforeAll(async () => { server = await startStaticServer(ROOT_DIR); });
  test.afterAll(async () => { await server?.close(); });

  async function openBlock(page, block, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    expect((await page.goto(`${server.origin}/templates/blocks/${block.file}`))?.status()).toBe(200);
    await expect(page.locator(`[data-cta${block.number}-root]`)).toBeVisible();
  }

  for (const block of BLOCKS) {
    test(`CTA ${block.number} preserves its official anatomy`, async ({ page }) => {
      await openBlock(page, block);
      const root = page.locator(`[data-cta${block.number}-root]`);

      if (block.kind === 'cards') {
        const cards = root.locator(`.cta${block.number}-items > article`);
        await expect(cards).toHaveCount(2);
        await expect(cards.locator(`.cta${block.number}-icon[aria-hidden="true"]`)).toHaveCount(2);
        await expect(cards.locator('h2')).toHaveCount(2);
        await expect(cards.locator(`.cta${block.number}-actions > a.ren-btn[href]`)).toHaveCount(4);
        await expect(root.locator('form, input, button, img')).toHaveCount(0);
      } else {
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

        if (block.support === 'media') {
          await expect(root.locator(`figure.cta${block.number}-media img[src^="media/"][alt][width][height]`)).toHaveCount(1);
        } else {
          await expect(root.locator(`ul.cta${block.number}-logos > li`)).toHaveCount(6);
          await expect(root.locator('img, picture, figure, video')).toHaveCount(0);
        }
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
      const selector = block.kind === 'cards'
        ? `.cta${block.number}-items`
        : block.kind === 'form' ? `.cta${block.number}-form-row` : `.cta${block.number}-actions`;
      expect(await page.locator(selector).evaluate((node) => getComputedStyle(node).display)).toBe('grid');
    }
  });

  test('dual-card variants switch from one to two columns without overflow', async ({ page }) => {
    for (const block of BLOCKS.slice(4)) {
      await openBlock(page, block, 390, 844);
      expect(await page.locator(`.cta${block.number}-items`).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      await openBlock(page, block, 1280, 900);
      expect(await page.locator(`.cta${block.number}-items`).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(2);
    }
  });

  test('catalog exposes CTA 1–60 in order', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="ctas-title"] .bb-card');
    await expect(cards).toHaveCount(60);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(Array.from({ length: 60 }, (_, i) => `CTA ${i + 1}`));
  });
});
