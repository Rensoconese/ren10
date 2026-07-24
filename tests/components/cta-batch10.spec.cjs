// @ts-check
const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT_DIR = path.resolve(__dirname, '../..');
const BLOCKS = [
  { number: 55, file: 'cta-video-background-centered-actions.html', kind: 'actions', media: 'video', layout: 'centered' },
  { number: 56, file: 'cta-video-background-centered-email.html', kind: 'form', media: 'video', layout: 'centered' },
  { number: 57, file: 'cta-centered-focus-actions.html', kind: 'actions', media: 'none', layout: 'centered' },
  { number: 58, file: 'cta-centered-focus-email.html', kind: 'form', media: 'none', layout: 'centered' },
  { number: 59, file: 'cta-split-photo-actions.html', kind: 'actions', media: 'image', layout: 'split' },
  { number: 60, file: 'cta-split-photo-email.html', kind: 'form', media: 'image', layout: 'split' },
];

let server;

test.describe('CTA 55–60 translated to Ren10', () => {
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
        await expect(root.locator('form, input')).toHaveCount(0);
      } else {
        await expect(root.locator(`form.cta${block.number}-form`)).toHaveCount(1);
        await expect(root.locator('ren-field > label')).toHaveCount(1);
        await expect(root.locator('input.ren-input[type="email"][name="email"][required]')).toHaveCount(1);
        await expect(root.locator('button[type="submit"].ren-btn')).toHaveCount(1);
        await expect(root.locator(`.cta${block.number}-legal a[href]`)).toHaveCount(1);
      }
      if (block.media === 'video') {
        await expect(root.locator(`video.cta${block.number}-video[muted][loop][playsinline][poster^="media/"] source[type="video/webm"]`)).toHaveCount(1);
        await expect(root.locator(`button.cta${block.number}-motion[type="button"][aria-label]`)).toHaveCount(1);
      } else if (block.media === 'image') {
        await expect(root.locator(`.cta${block.number}-media img[src^="media/"][width][height]`)).toHaveCount(1);
      } else await expect(root.locator('img, video')).toHaveCount(0);
    });

    test(`CTA ${block.number} is documented, paginated, responsive, and axe clean`, async ({ page }) => {
      await openBlock(page, block, 390, 844);
      await expect(page.locator('.bb-detail-header h1.bb-detail-title')).toHaveCount(1);
      await expect(page.locator('.bb-detail-header p.bb-detail-description')).toHaveCount(1);
      await expect(page.locator('.bb-block-pagination a[rel="prev"]')).toHaveCount(1);
      await expect(page.locator('.bb-block-pagination a[rel="next"]')).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
      for (const target of await page.locator(`[data-cta${block.number}-root] a, [data-cta${block.number}-root] button, [data-cta${block.number}-root] input`).all()) {
        expect((await target.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      }
      await injectAxe(page);
      await checkA11y(page, `[data-cta${block.number}-root]`, { detailedReport: true, detailedReportOptions: { html: true } });
    });
  }

  test('split photo variants collapse from two columns to one', async ({ page }) => {
    for (const block of BLOCKS.filter(({ layout }) => layout === 'split')) {
      await openBlock(page, block, 390, 844);
      expect(await page.locator(`.cta${block.number}-layout`).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(1);
      await openBlock(page, block, 1280, 900);
      expect(await page.locator(`.cta${block.number}-layout`).evaluate((node) => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(2);
    }
  });

  test('video variants expose keyboard-operable motion controls', async ({ page }) => {
    for (const block of BLOCKS.filter(({ media }) => media === 'video')) {
      await openBlock(page, block);
      const control = page.locator(`.cta${block.number}-motion`);
      const before = await control.getAttribute('aria-label');
      await control.focus();
      await page.keyboard.press('Enter');
      await expect(control).not.toHaveAttribute('aria-label', before || '');
    }
  });

  test('all compositions use CSS Grid and policy-safe source', async ({ page }) => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'templates/blocks/cta-batch10.css'), 'utf8');
    expect(css).not.toMatch(/display\s*:\s*flex|#[0-9a-f]{3,8}\b|--(?:blue|gray|red|green|orange|yellow|teal|purple|pink)-/i);
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

  test('catalog exposes CTA 1–60 in order', async ({ page }) => {
    await page.goto(`${server.origin}/templates/blocks/index.html`);
    const cards = page.locator('section[aria-labelledby="ctas-title"] .bb-card');
    await expect(cards).toHaveCount(60);
    await expect(cards.locator('.bb-card-eyebrow')).toHaveText(Array.from({ length: 60 }, (_, i) => `CTA ${i + 1}`));
  });
});
