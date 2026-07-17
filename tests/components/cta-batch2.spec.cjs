// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 7, file: 'cta-split-copy-email-capture.html', kind: 'form', media: 'none' },
  { number: 8, file: 'cta-background-image-split-actions.html', kind: 'actions', media: 'background' },
  { number: 9, file: 'cta-background-image-email-aside.html', kind: 'form-only', media: 'background' },
  { number: 10, file: 'cta-contrast-split-actions.html', kind: 'actions', media: 'none' },
  { number: 11, file: 'cta-contrast-email-aside.html', kind: 'form-only', media: 'none' },
  { number: 12, file: 'cta-split-heading-copy-actions.html', kind: 'actions', media: 'none' },
];

let server;

test.describe('CTA 7–12 translated to Ren10', () => {
  test.beforeAll(async () => { server = await startStaticServer(ROOT_DIR); });
  test.afterAll(async () => { await server?.close(); });

  async function openBlock(page, block, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    expect((await page.goto(`${server.origin}/templates/blocks/${block.file}`))?.status()).toBe(200);
    await expect(page.locator(`[data-cta${block.number}-root]`)).toBeVisible();
  }

  for (const block of BLOCKS) {
    test(`CTA ${block.number} owns its source anatomy`, async ({ page }) => {
      await openBlock(page, block);
      const root = page.locator(`[data-cta${block.number}-root]`);
      await expect(root.locator(`h2.cta${block.number}-title`)).toHaveCount(block.kind === 'form-only' ? 0 : 1);
      await expect(root.locator(`p.cta${block.number}-description`)).toHaveCount(block.kind === 'form-only' ? 0 : 1);
      if (block.kind === 'actions') {
        await expect(root.locator(`.cta${block.number}-actions > a.ren-btn[href]`)).toHaveCount(2);
        await expect(root.locator('form, input, button')).toHaveCount(0);
      } else {
        await expect(root.locator(`form.cta${block.number}-form`)).toHaveCount(1);
        await expect(root.locator('ren-field > label')).toHaveCount(1);
        await expect(root.locator('input[type="email"][required]')).toHaveCount(1);
        await expect(root.locator('button[type="submit"].ren-btn')).toHaveCount(1);
      }
      if (block.media === 'background') {
        await expect(root.locator(`.cta${block.number}-background img[src^="media/"][alt=""]`)).toHaveCount(1);
        await expect(root.locator(`.cta${block.number}-scrim`)).toHaveCount(1);
      } else {
        await expect(root.locator('img, picture, video')).toHaveCount(0);
      }
    });

    test(`CTA ${block.number} is documented, paginated, responsive, and accessible`, async ({ page }) => {
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

  test('all six use responsive CSS Grid and policy-safe source', async ({ page }) => {
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
      if (block.kind !== 'form-only') expect(source).toContain(`cta${block.number}-layout ren-grid`);
      if (block.kind.includes('form')) expect(source).toMatch(/<span data-error hidden>/);
      await openBlock(page, block, 1280, 900);
      if (block.kind !== 'form-only') {
        expect(await page.locator(`.cta${block.number}-layout`).evaluate((node) => getComputedStyle(node).display)).toBe('grid');
      }
    }
  });

  for (const block of BLOCKS.filter(({ number }) => number === 9 || number === 11)) {
    test(`CTA ${block.number} keeps the email label legible in both themes`, async ({ page }) => {
      await openBlock(page, block);
      for (const theme of ['light', 'dark']) {
        await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
        const colors = await page.locator(`[data-cta${block.number}-root]`).evaluate((root, number) => {
          const label = root.querySelector(`.cta${number}-form label`);
          const legal = root.querySelector(`.cta${number}-legal`);
          return {
            label: getComputedStyle(label).color,
            legal: getComputedStyle(legal).color,
          };
        }, block.number);
        expect(colors.label).toBe(colors.legal);
      }
    });
  }

  test('catalog keeps CTA 1–12 at the start of the ordered CTA family', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="ctas-title"] .bb-card');
    await expect(cards).toHaveCount(54);
    expect(await cards.locator('.bb-card-eyebrow').evaluateAll((nodes) => nodes.slice(0, 12).map((node) => node.textContent))).toEqual(Array.from({ length: 12 }, (_, i) => `CTA ${i + 1}`));
  });
});
