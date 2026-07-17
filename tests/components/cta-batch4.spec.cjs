// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 19, file: 'cta-left-actions.html', kind: 'actions', media: 'none', layout: 'stacked' },
  { number: 20, file: 'cta-left-email-capture.html', kind: 'form', media: 'none', layout: 'stacked' },
  { number: 21, file: 'cta-split-copy-actions-landscape.html', kind: 'actions', media: 'inline', layout: 'split' },
  { number: 22, file: 'cta-split-copy-email-landscape.html', kind: 'form', media: 'inline', layout: 'split' },
  { number: 23, file: 'cta-stacked-actions-landscape.html', kind: 'actions', media: 'inline', layout: 'stacked' },
  { number: 24, file: 'cta-stacked-email-landscape.html', kind: 'form', media: 'inline', layout: 'stacked' },
];

let server;

test.describe('CTA 19–24 translated to Ren10', () => {
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
      await expect(root.locator(`h2.cta${block.number}-title`)).toHaveCount(1);
      await expect(root.locator(`p.cta${block.number}-description`)).toHaveCount(1);
      if (block.kind === 'actions') {
        await expect(root.locator(`.cta${block.number}-actions > a.ren-btn[href]`)).toHaveCount(2);
        await expect(root.locator('form, input, button')).toHaveCount(0);
      } else {
        await expect(root.locator(`form.cta${block.number}-form`)).toHaveCount(1);
        await expect(root.locator('ren-field > label')).toHaveCount(1);
        await expect(root.locator('input[type="email"][required]')).toHaveCount(1);
        await expect(root.locator('button[type="submit"].ren-btn')).toHaveCount(1);
        await expect(root.locator(`.cta${block.number}-legal a[href]`)).toHaveCount(1);
      }
      if (block.media === 'inline') {
        await expect(root.locator(`figure.cta${block.number}-media img[src^="media/"][alt]:not([alt=""])[width][height]`)).toHaveCount(1);
      } else {
        await expect(root.locator('img, picture, video')).toHaveCount(0);
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

  test('split and action groups use CSS Grid with policy-safe source', async ({ page }) => {
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
      if (block.kind === 'form') expect(source).toMatch(/<span data-error hidden>/);
      await openBlock(page, block);
      if (block.layout === 'split') {
        expect(await page.locator(`.cta${block.number}-layout`).evaluate((node) => getComputedStyle(node).display)).toBe('grid');
      }
      if (block.kind === 'actions') {
        expect(await page.locator(`.cta${block.number}-actions`).evaluate((node) => getComputedStyle(node).display)).toBe('grid');
      }
    }
  });

  test('catalog exposes CTA 1–30 in order', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="ctas-title"] .bb-card');
    await expect(cards).toHaveCount(30);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(Array.from({ length: 30 }, (_, i) => `CTA ${i + 1}`));
  });
});
