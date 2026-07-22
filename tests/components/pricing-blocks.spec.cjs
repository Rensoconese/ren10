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
const CHAIN = ['contact-hub-form-routes.html', ...BLOCKS, 'index.html#pricing-blocks'];
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

  test('contrast platform keeps checks readable and actions grouped', async ({ page }) => {
    await open(page, 11);
    const metrics = await page.locator('.pricing12-block').evaluate((root) => {
      const parseRgb = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number);
      const luminance = (channels) => channels
        .map((channel) => channel / 255)
        .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
        .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
      const check = root.querySelector('.pricingx-features li');
      const checkColor = parseRgb(getComputedStyle(check, '::before').color);
      const background = parseRgb(getComputedStyle(root).backgroundColor);
      const [primary, secondary] = root.querySelectorAll('.pricing12-summary .ren-btn');
      const primaryBox = primary.getBoundingClientRect();
      const secondaryBox = secondary.getBoundingClientRect();
      const light = Math.max(luminance(checkColor), luminance(background));
      const dark = Math.min(luminance(checkColor), luminance(background));
      return {
        checkContrast: (light + 0.05) / (dark + 0.05),
        actionGap: secondaryBox.top - primaryBox.bottom,
      };
    });

    expect.soft(metrics.checkContrast).toBeGreaterThanOrEqual(4.5);
    expect.soft(metrics.actionGap).toBeLessThanOrEqual(12);
  });

  test('single plan uses progressive spacing instead of a uniform stack', async ({ page }) => {
    await open(page, 10);
    const gaps = await page.evaluate(() => {
      const gap = (first, second) => second.getBoundingClientRect().top - first.getBoundingClientRect().bottom;
      const detail = document.querySelector('.bb-detail-header');
      const copy = document.querySelector('.pricing11-copy');
      const plan = document.querySelector('.pricing11-plan');
      return {
        detailKickerTitle: gap(detail.querySelector('.dx-kicker'), detail.querySelector('.bb-detail-title')),
        detailTitleDescription: gap(detail.querySelector('.bb-detail-title'), detail.querySelector('.bb-detail-description')),
        copyLabelTitle: gap(copy.querySelector('.pricingx-label'), copy.querySelector('h2')),
        copyTitleDescription: gap(copy.querySelector('h2'), copy.querySelector('p:last-child')),
        planLabelPrice: gap(plan.querySelector('.pricingx-label'), plan.querySelector('.pricing11-price')),
        priceFeatures: gap(plan.querySelector('.pricing11-price'), plan.querySelector('.pricingx-features')),
        featuresAction: gap(plan.querySelector('.pricingx-features'), plan.querySelector('.ren-btn')),
        actionNote: gap(plan.querySelector('.ren-btn'), plan.querySelector('.pricingx-note')),
      };
    });

    expect.soft(gaps.detailKickerTitle).toBeLessThan(gaps.detailTitleDescription);
    expect.soft(gaps.detailKickerTitle).toBeLessThanOrEqual(12);
    expect.soft(gaps.copyLabelTitle).toBeLessThan(gaps.copyTitleDescription);
    expect.soft(gaps.copyLabelTitle).toBeLessThanOrEqual(12);
    expect.soft(gaps.planLabelPrice).toBeLessThanOrEqual(12);
    expect.soft(gaps.priceFeatures).toBeGreaterThanOrEqual(20);
    expect.soft(gaps.featuresAction).toBeGreaterThanOrEqual(20);
    expect.soft(gaps.actionNote).toBeLessThanOrEqual(12);
  });

  test('add-on cards share subgrid rows and keep labels close to selects', async ({ page }) => {
    await open(page, 8);
    const cards = page.locator('.pricing9-card');
    await expect(cards).toHaveCount(4);
    await expect(cards.locator('.pricing9-field')).toHaveCount(4);
    await expect(cards.locator('.ren-btn')).toHaveCount(4);

    const layout = await cards.evaluateAll((nodes) => ({
      supportsSubgrid: CSS.supports('grid-template-rows', 'subgrid'),
      usesSubgrid: nodes.every((node) => getComputedStyle(node).gridTemplateRows.startsWith('subgrid')),
      pairs: [[nodes[0], nodes[1]], [nodes[2], nodes[3]]].map((pair) =>
        ['h3', '.pricing9-description', '.pricing9-price', '.pricing9-field', '.ren-btn'].map((selector) =>
          pair.map((card) => card.querySelector(selector).getBoundingClientRect().top),
        ),
      ),
      labelGaps: nodes.map((card) => {
        const label = card.querySelector('.pricing9-field label').getBoundingClientRect();
        const select = card.querySelector('.pricing9-field select').getBoundingClientRect();
        return select.top - label.bottom;
      }),
    }));

    expect(layout.supportsSubgrid).toBe(true);
    expect(layout.usesSubgrid).toBe(true);
    for (const pair of layout.pairs) {
      for (const [first, second] of pair) expect(Math.abs(first - second)).toBeLessThanOrEqual(1);
    }
    for (const gap of layout.labelGaps) expect(gap).toBeLessThanOrEqual(8);
  });

  test('outcome cards share subgrid rows with progressive spacing', async ({ page }) => {
    await open(page, 7);
    const cards = page.locator('.pricing8-card');
    await expect(cards).toHaveCount(3);
    const layout = await cards.evaluateAll((nodes) => {
      const selectors = ['.pricingx-label', 'h3', '.pricing8-measure', '.pricing8-description', '.ren-btn'];
      const gap = (card, first, second) => {
        const firstBox = card.querySelector(first).getBoundingClientRect();
        const secondBox = card.querySelector(second).getBoundingClientRect();
        return secondBox.top - firstBox.bottom;
      };
      return {
        usesSubgrid: nodes.every((node) => getComputedStyle(node).gridTemplateRows.startsWith('subgrid')),
        rows: selectors.map((selector) => nodes.map((card) => card.querySelector(selector).getBoundingClientRect().top)),
        gaps: nodes.map((card) => ({
          labelTitle: gap(card, '.pricingx-label', 'h3'),
          titleMeasure: gap(card, 'h3', '.pricing8-measure'),
          measureDescription: gap(card, '.pricing8-measure', '.pricing8-description'),
          descriptionAction: gap(card, '.pricing8-description', '.ren-btn'),
        })),
      };
    });

    expect(layout.usesSubgrid).toBe(true);
    for (const row of layout.rows) {
      expect(Math.max(...row) - Math.min(...row)).toBeLessThanOrEqual(1);
    }
    for (const gaps of layout.gaps) {
      expect(gaps.labelTitle).toBeLessThanOrEqual(12);
      expect(gaps.descriptionAction).toBeGreaterThanOrEqual(20);
      expect(gaps.labelTitle).toBeLessThan(gaps.titleMeasure);
    }
  });

  test('enterprise checks remain readable and both columns use progressive spacing', async ({ page }) => {
    await open(page, 5);
    const metrics = await page.locator('.pricing6-block').evaluate((root) => {
      const parseRgb = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number);
      const luminance = (channels) => channels
        .map((channel) => channel / 255)
        .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
        .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
      const contrast = (foreground, background) => {
        const light = Math.max(luminance(foreground), luminance(background));
        const dark = Math.min(luminance(foreground), luminance(background));
        return (light + 0.05) / (dark + 0.05);
      };
      const gap = (first, second) => second.getBoundingClientRect().top - first.getBoundingClientRect().bottom;
      const copy = root.querySelector('.pricing6-copy');
      const card = root.querySelector('.pricing-card');
      const check = copy.querySelector('.pricing-features li');
      return {
        checkContrast: contrast(
          parseRgb(getComputedStyle(check, '::before').color),
          parseRgb(getComputedStyle(root).backgroundColor),
        ),
        copy: {
          labelTitle: gap(copy.querySelector('.pricing-label'), copy.querySelector('h2')),
          titleDescription: gap(copy.querySelector('h2'), copy.querySelector(':scope > p:not(.pricing-label)')),
          descriptionFeatures: gap(copy.querySelector(':scope > p:not(.pricing-label)'), copy.querySelector('.pricing-features')),
        },
        card: {
          labelTitle: gap(card.querySelector('.pricing-label'), card.querySelector('h3')),
          titlePrice: gap(card.querySelector('h3'), card.querySelector('.pricing-price')),
          descriptionAction: gap(card.querySelector(':scope > p:not(.pricing-label, .pricing-price)'), card.querySelector('.ren-btn')),
        },
      };
    });

    expect.soft(metrics.checkContrast).toBeGreaterThanOrEqual(4.5);
    expect.soft(metrics.copy.labelTitle).toBeLessThan(metrics.copy.titleDescription);
    expect.soft(metrics.copy.labelTitle).toBeLessThanOrEqual(12);
    expect.soft(metrics.copy.descriptionFeatures).toBeGreaterThan(metrics.copy.titleDescription);
    expect.soft(metrics.card.labelTitle).toBeLessThan(metrics.card.titlePrice);
    expect.soft(metrics.card.labelTitle).toBeLessThanOrEqual(12);
    expect.soft(metrics.card.descriptionAction).toBeGreaterThanOrEqual(20);
  });

  test('compact plan rows share price and action columns through subgrid', async ({ page }) => {
    await open(page, 6);
    const layout = await page.locator('.pricing7-list').evaluate((list) => {
      const rows = [...list.querySelectorAll('.pricing7-row')];
      const starts = (selector) => rows.map((row) => row.querySelector(selector).getBoundingClientRect().left);
      return {
        usesSubgrid: rows.every((row) => getComputedStyle(row).gridTemplateColumns.startsWith('subgrid')),
        priceStarts: starts('.pricing7-price'),
        actionStarts: starts('.ren-btn'),
      };
    });

    expect(layout.usesSubgrid).toBe(true);
    expect(Math.max(...layout.priceStarts) - Math.min(...layout.priceStarts)).toBeLessThanOrEqual(1);
    expect(Math.max(...layout.actionStarts) - Math.min(...layout.actionStarts)).toBeLessThanOrEqual(1);
  });

  test('startup program aligns columns at the top and uses progressive spacing', async ({ page }) => {
    await open(page, 9);
    const metrics = await page.locator('.pricing10-layout').evaluate((layout) => {
      const copy = layout.querySelector('.pricing10-copy');
      const offer = layout.querySelector('.pricing10-offer');
      const gap = (first, second) => second.getBoundingClientRect().top - first.getBoundingClientRect().bottom;
      return {
        topDelta: Math.abs(copy.getBoundingClientRect().top - offer.getBoundingClientRect().top),
        copy: {
          labelTitle: gap(copy.querySelector('.pricingx-label'), copy.querySelector('h2')),
          titleDescription: gap(copy.querySelector('h2'), copy.querySelector(':scope > p:not(.pricingx-label)')),
          descriptionFeatures: gap(copy.querySelector(':scope > p:not(.pricingx-label)'), copy.querySelector('.pricingx-features')),
        },
        offer: {
          labelDiscount: gap(offer.querySelector('.pricingx-label'), offer.querySelector('.pricing10-discount')),
          discountTitle: gap(offer.querySelector('.pricing10-discount'), offer.querySelector('h3')),
          descriptionAction: gap(offer.querySelector(':scope > p:not(.pricingx-label, .pricing10-discount)'), offer.querySelector('.ren-btn')),
        },
      };
    });

    expect.soft(metrics.topDelta).toBeLessThanOrEqual(1);
    expect.soft(metrics.copy.labelTitle).toBeLessThanOrEqual(12);
    expect.soft(metrics.copy.labelTitle).toBeLessThan(metrics.copy.titleDescription);
    expect.soft(metrics.copy.descriptionFeatures).toBeGreaterThan(metrics.copy.titleDescription);
    expect.soft(metrics.offer.labelDiscount).toBeLessThanOrEqual(12);
    expect.soft(metrics.offer.discountTitle).toBeGreaterThan(metrics.offer.labelDiscount);
    expect.soft(metrics.offer.descriptionAction).toBeGreaterThanOrEqual(20);
  });

  for (const [name, index] of [['three-tier', 0], ['billing-period', 4]]) {
    test(`${name} plan cards align every content row with subgrid`, async ({ page }) => {
      await open(page, index);
      const layout = await page.locator(`.pricing${index + 1}-block .pricing-grid`).evaluate((grid) => {
        const cards = [...grid.querySelectorAll('.pricing-card')];
        const selectors = ['.pricing-label', 'h3', '.pricing-price', '.pricing-features', '.ren-btn'];
        return {
          usesSubgrid: cards.every((card) => getComputedStyle(card).gridTemplateRows.startsWith('subgrid')),
          rows: selectors.map((selector) => cards.map((card) => card.querySelector(selector).getBoundingClientRect().top)),
          gaps: cards.map((card) => {
            const gap = (first, second) => card.querySelector(second).getBoundingClientRect().top
              - card.querySelector(first).getBoundingClientRect().bottom;
            return {
              labelTitle: gap('.pricing-label', 'h3'),
              titlePrice: gap('h3', '.pricing-price'),
              priceFeatures: gap('.pricing-price', '.pricing-features'),
              featuresAction: gap('.pricing-features', '.ren-btn'),
            };
          }),
        };
      });

      expect(layout.usesSubgrid).toBe(true);
      for (const row of layout.rows) expect(Math.max(...row) - Math.min(...row)).toBeLessThanOrEqual(1);
      for (const gaps of layout.gaps) {
        expect.soft(gaps.labelTitle).toBeLessThanOrEqual(12);
        expect.soft(gaps.labelTitle).toBeLessThan(gaps.titlePrice);
        expect.soft(gaps.priceFeatures).toBeGreaterThanOrEqual(20);
        expect.soft(gaps.featuresAction).toBeGreaterThanOrEqual(20);
      }
    });
  }

  test('featured plan and calculator use deliberate progressive groups', async ({ page }) => {
    for (const index of [2, 3]) {
      await open(page, index);
      const metrics = await page.locator(`.pricing${index + 1}-copy`).evaluate((copy) => {
        const gap = (first, second) => second.getBoundingClientRect().top - first.getBoundingClientRect().bottom;
        return {
          labelTitle: gap(copy.querySelector('.pricing-label'), copy.querySelector('h2')),
          titleDescription: gap(copy.querySelector('h2'), copy.querySelector(':scope > p:not(.pricing-label)')),
          descriptionFeatures: gap(copy.querySelector(':scope > p:not(.pricing-label)'), copy.querySelector('.pricing-features')),
        };
      });
      expect.soft(metrics.labelTitle).toBeLessThanOrEqual(12);
      expect.soft(metrics.labelTitle).toBeLessThan(metrics.titleDescription);
      expect.soft(metrics.descriptionFeatures).toBeGreaterThan(metrics.titleDescription);
    }
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
