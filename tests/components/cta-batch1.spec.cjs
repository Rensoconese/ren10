// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  {
    number: 1,
    file: 'cta-split-image-dual-action.html',
    kind: 'actions',
    media: 'inline',
  },
  {
    number: 2,
    file: 'cta-split-image-email-capture.html',
    kind: 'form',
    media: 'inline',
  },
  {
    number: 3,
    file: 'cta-background-image-dual-action.html',
    kind: 'actions',
    media: 'background',
  },
  {
    number: 4,
    file: 'cta-background-image-email-capture.html',
    kind: 'form',
    media: 'background',
  },
  {
    number: 5,
    file: 'cta-contrast-dual-action.html',
    kind: 'actions',
    media: 'none',
  },
  {
    number: 6,
    file: 'cta-contrast-email-capture.html',
    kind: 'form',
    media: 'none',
  },
];

let server;

test.describe('CTA 1–6 translated to Ren10', () => {
  test.beforeAll(async () => { server = await startStaticServer(ROOT_DIR); });
  test.afterAll(async () => { await server?.close(); });

  async function openBlock(page, block, width = 1280, height = 900) {
    await page.setViewportSize({ width, height });
    const response = await page.goto(`${server.origin}/templates/blocks/${block.file}`);
    expect(response?.status(), `${block.file} must exist`).toBe(200);
    await expect(page.locator(`[data-cta${block.number}-root]`)).toBeVisible();
  }

  for (const block of BLOCKS) {
    test(`CTA ${block.number} owns its exact source-derived anatomy`, async ({ page }) => {
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
        await expect(root.locator('input[type="email"][name="email"][required]')).toHaveCount(1);
        await expect(root.locator('button[type="submit"].ren-btn')).toHaveCount(1);
        await expect(root.locator(`.cta${block.number}-legal a[href]`)).toHaveCount(1);
      }

      if (block.media === 'inline') {
        await expect(root.locator(`figure.cta${block.number}-media img[src^="media/"][alt][width][height]`)).toHaveCount(1);
        await expect(root.locator(`.cta${block.number}-scrim`)).toHaveCount(0);
      } else if (block.media === 'background') {
        await expect(root.locator(`.cta${block.number}-background img[src^="media/"][alt=""][width][height]`)).toHaveCount(1);
        await expect(root.locator(`.cta${block.number}-scrim`)).toHaveCount(1);
      } else {
        await expect(root.locator('img, picture, figure, video')).toHaveCount(0);
      }

      await expect(root.locator('nav, header, dialog, iframe, [class*="logo"]')).toHaveCount(0);
      await expect(root).toHaveAttribute('aria-labelledby', `cta${block.number}-title`);
    });

    test(`CTA ${block.number} has consistent documentation and block pagination`, async ({ page }) => {
      await openBlock(page, block);
      const main = page.locator('main.bb-detail-page');
      await expect(main.locator(':scope > .bb-detail-header h1.bb-detail-title')).toHaveCount(1);
      await expect(main.locator(':scope > .bb-detail-header p.bb-detail-description')).toHaveCount(1);
      await expect(main.locator('.bb-block-pagination a[rel="prev"]')).toHaveCount(1);
      await expect(main.locator('.bb-block-pagination a[rel="next"]')).toHaveCount(1);
    });

    test(`CTA ${block.number} is overflow-free, touch-safe, and axe clean`, async ({ page }) => {
      await openBlock(page, block, 390, 844);
      const root = page.locator(`[data-cta${block.number}-root]`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      for (const target of await root.locator('a.ren-btn, button.ren-btn, input').all()) {
        const box = await target.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
      await injectAxe(page);
      await checkA11y(page, `[data-cta${block.number}-root]`, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    });
  }

  test('CTA 1 and 2 use one-column mobile and two-column CSS Grid from 768px', async ({ page }) => {
    for (const block of BLOCKS.slice(0, 2)) {
      await openBlock(page, block, 390, 844);
      const narrow = await page.locator(`.cta${block.number}-layout`).evaluate((node) => ({
        display: getComputedStyle(node).display,
        columns: getComputedStyle(node).gridTemplateColumns.split(' ').length,
      }));
      expect(narrow).toEqual({ display: 'grid', columns: 1 });

      await openBlock(page, block, 1280, 900);
      const wide = await page.locator(`.cta${block.number}-layout`).evaluate((node) => ({
        display: getComputedStyle(node).display,
        columns: getComputedStyle(node).gridTemplateColumns.split(' ').length,
      }));
      expect(wide).toEqual({ display: 'grid', columns: 2 });
    }
  });

  test('image overlays and contrast bands preserve their foreground in both themes', async ({ page }) => {
    for (const theme of ['light', 'dark']) {
      for (const block of BLOCKS.slice(2)) {
        await openBlock(page, block);
        await page.evaluate((nextTheme) => {
          document.documentElement.dataset.theme = nextTheme;
        }, theme);

        const colors = await page.locator(`[data-cta${block.number}-root]`).evaluate((root, number) => {
          const styles = getComputedStyle(root);
          const title = getComputedStyle(root.querySelector(`.cta${number}-title`));
          const description = getComputedStyle(root.querySelector(`.cta${number}-description`));
          return {
            background: styles.backgroundColor,
            title: title.color,
            description: description.color,
          };
        }, block.number);

        expect(colors.title, `CTA ${block.number} ${theme} title must use its owned foreground`).toBe(colors.description);
        if (block.media === 'none') {
          expect(colors.background, `CTA ${block.number} ${theme} must remain a contrast band`).not.toBe(colors.title);
        }
      }
    }
  });

  test('all CTA layouts are vanilla, tokenized, and free of flexbox skeletons', async () => {
    for (const block of BLOCKS) {
      const source = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks', block.file), 'utf8');
      expect(source).not.toMatch(/display\s*:\s*flex|React|Vue|Svelte|Tailwind|attachShadow/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
      if (block.kind === 'form') {
        expect(source).toMatch(/<span data-error hidden>/);
      }
      expect(source).toContain('bb-detail-header');
      expect(source).toContain('bb-block-pagination');
    }
  });

  test('block catalog keeps CTA 1–6 at the start of the ordered CTA family', async ({ page }) => {
    expect((await page.goto(`${server.origin}/templates/blocks/index.html`))?.status()).toBe(200);
    const section = page.locator('section[aria-labelledby="ctas-title"]');
    await expect(section).toHaveCount(1);
    await expect(section.locator('.bb-card')).toHaveCount(30);
    expect(await section.locator('.bb-card-eyebrow').evaluateAll((nodes) => nodes.slice(0, 6).map((node) => node.textContent))).toEqual(BLOCKS.map((block) => `CTA ${block.number}`));
    expect(await section.locator('.bb-card').evaluateAll((cards) => (
      cards.every((card) => /^cta-/.test(card.getAttribute('href') || ''))
    ))).toBe(true);
  });
});
