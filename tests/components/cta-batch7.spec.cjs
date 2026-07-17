// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 37, file: 'cta-hover-link-stack-centered.html', kind: 'links', media: 'hover' },
  { number: 38, file: 'cta-numbered-hover-link-list.html', kind: 'links', media: 'hover' },
  { number: 39, file: 'cta-split-card-actions.html', kind: 'actions', media: 'split' },
  { number: 40, file: 'cta-split-card-email.html', kind: 'form', media: 'split' },
  { number: 41, file: 'cta-background-banner-actions.html', kind: 'actions', media: 'background' },
  { number: 42, file: 'cta-background-banner-email.html', kind: 'form', media: 'background' },
];

let server;

test.describe('CTA 37–42 translated to Ren10', () => {
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

      if (block.kind === 'links') {
        const items = root.locator(`.cta${block.number}-link-list > li`);
        await expect(items).toHaveCount(4);
        await expect(items.locator('a[href] h2')).toHaveCount(4);
        await expect(items.locator(`figure.cta${block.number}-media img[src^="media/"][alt=""][width][height]`)).toHaveCount(4);
        if (block.number === 38) await expect(items.locator('.cta38-number')).toHaveText(['01', '02', '03', '04']);
      } else {
        await expect(root.locator(`h2.cta${block.number}-title`)).toHaveCount(1);
        await expect(root.locator(`p.cta${block.number}-description`)).toHaveCount(1);

        if (block.kind === 'actions') {
          await expect(root.locator(`.cta${block.number}-actions > a.ren-btn[href]`)).toHaveCount(2);
          await expect(root.locator('form, input, button')).toHaveCount(0);
        } else {
          await expect(root.locator(`form.cta${block.number}-form`)).toHaveCount(1);
          await expect(root.locator('ren-field > label')).toHaveCount(1);
          await expect(root.locator('input.ren-input[type="email"][name="email"][required]')).toHaveCount(1);
          await expect(root.locator('button[type="submit"].ren-btn')).toHaveCount(1);
          await expect(root.locator(`.cta${block.number}-legal a[href]`)).toHaveCount(1);
        }

        if (block.media === 'split') {
          await expect(root.locator(`figure.cta${block.number}-media img[src^="media/"][alt][width][height]`)).toHaveCount(1);
        } else {
          await expect(root.locator(`.cta${block.number}-background img[src^="media/"][alt=""][width][height]`)).toHaveCount(1);
          await expect(root.locator(`.cta${block.number}-scrim`)).toHaveCount(1);
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
      for (const target of await rootTargets(page, block).all()) {
        expect((await target.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      }
      await injectAxe(page);
      await checkA11y(page, `[data-cta${block.number}-root]`, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });
  }

  function rootTargets(page, block) {
    return page.locator(`[data-cta${block.number}-root] a, [data-cta${block.number}-root] button, [data-cta${block.number}-root] input`);
  }

  test('hover-link variants reveal real media for pointer and keyboard focus', async ({ page }) => {
    for (const block of BLOCKS.slice(0, 2)) {
      await openBlock(page, block);
      const firstLink = page.locator(`.cta${block.number}-link-list a`).first();
      const firstMedia = page.locator(`.cta${block.number}-media`).first();
      await firstLink.hover();
      await expect(firstMedia).toHaveCSS('opacity', '0.74');
      if (block.number === 37) {
        const colors = await firstLink.evaluate((link) => ({
          link: getComputedStyle(link).color,
          heading: getComputedStyle(link.querySelector('h2')).color,
        }));
        expect(colors.heading).toBe(colors.link);
      }
      await page.mouse.move(0, 0);
      await firstLink.focus();
      await expect(firstMedia).toHaveCSS('opacity', '0.74');
    }
  });

  test('split cards use one-column mobile and two-column desktop CSS Grid', async ({ page }) => {
    for (const block of BLOCKS.slice(2, 4)) {
      await openBlock(page, block, 390, 844);
      expect(await page.locator(`.cta${block.number}-layout`).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(1);
      await openBlock(page, block, 1280, 900);
      expect(await page.locator(`.cta${block.number}-layout`).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(2);
    }
  });

  test('all layouts use CSS Grid and policy-safe source', async ({ page }) => {
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
      if (block.kind === 'form') expect(source).toMatch(/<span data-error hidden>/);
      await openBlock(page, block);
      const selector = block.kind === 'links'
        ? `.cta${block.number}-link-list`
        : block.kind === 'form' ? `.cta${block.number}-form-row` : `.cta${block.number}-actions`;
      expect(await page.locator(selector).evaluate((node) => getComputedStyle(node).display)).toBe('grid');
    }
  });

  test('catalog exposes CTA 1–60 in order', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="ctas-title"] .bb-card');
    await expect(cards).toHaveCount(60);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(Array.from({ length: 60 }, (_, i) => `CTA ${i + 1}`));
  });
});
