// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 13, file: 'cta-split-heading-email-form.html', kind: 'form', media: 'none', layout: 'split' },
  { number: 14, file: 'cta-background-image-heading-actions.html', kind: 'actions', media: 'background', layout: 'split' },
  { number: 15, file: 'cta-background-image-heading-email.html', kind: 'form', media: 'background', layout: 'split' },
  { number: 16, file: 'cta-contrast-heading-actions.html', kind: 'actions', media: 'none', layout: 'split' },
  { number: 17, file: 'cta-contrast-heading-email.html', kind: 'form', media: 'none', layout: 'split' },
  { number: 18, file: 'cta-editorial-stacked-actions.html', kind: 'actions', media: 'none', layout: 'stacked' },
];

let server;

test.describe('CTA 13–18 translated to Ren10', () => {
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
      if (block.media === 'background') {
        await expect(root.locator(`.cta${block.number}-background img[src^="media/"][alt=""][width][height]`)).toHaveCount(1);
        await expect(root.locator(`.cta${block.number}-scrim`)).toHaveCount(1);
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

  test('the five split variants use responsive CSS Grid and policy-safe source', async ({ page }) => {
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
      if (block.kind === 'form') expect(source).toMatch(/<span data-error hidden>/);
      await openBlock(page, block);
      if (block.layout === 'split') {
        expect(await page.locator(`.cta${block.number}-layout`).evaluate((node) => getComputedStyle(node).display)).toBe('grid');
      }
    }
  });

  test('CTA 13 aligns its heading with the top of the form column', async ({ page }) => {
    await openBlock(page, BLOCKS[0]);
    const alignment = await page.locator('[data-cta13-root]').evaluate((root) => {
      const title = root.querySelector('.cta13-title').getBoundingClientRect();
      const content = root.querySelector('.cta13-content').getBoundingClientRect();
      return {
        titleTop: title.top,
        contentTop: content.top,
      };
    });

    expect(Math.abs(alignment.titleTop - alignment.contentTop)).toBeLessThanOrEqual(1);
  });

  test('owned foregrounds remain legible in light and dark themes', async ({ page }) => {
    for (const block of BLOCKS.slice(1, 5)) {
      await openBlock(page, block);
      for (const theme of ['light', 'dark']) {
        await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
        const colors = await page.locator(`[data-cta${block.number}-root]`).evaluate((root, number) => ({
          background: getComputedStyle(root).backgroundColor,
          title: getComputedStyle(root.querySelector(`.cta${number}-title`)).color,
          description: getComputedStyle(root.querySelector(`.cta${number}-description`)).color,
          label: root.querySelector('label') ? getComputedStyle(root.querySelector('label')).color : null,
        }), block.number);
        expect(colors.title).toBe(colors.description);
        if (colors.label) expect(colors.label).toBe(colors.description);
        if (block.media === 'none') expect(colors.background).not.toBe(colors.title);
      }
    }
  });

  test('catalog keeps CTA 1–18 at the start of the ordered CTA family', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="ctas-title"] .bb-card');
    await expect(cards).toHaveCount(60);
    expect(await cards.locator('.bb-card-eyebrow').evaluateAll((nodes) => nodes.slice(0, 18).map((node) => node.textContent))).toEqual(Array.from({ length: 18 }, (_, i) => `CTA ${i + 1}`));
  });
});
