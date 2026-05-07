// @ts-check
/**
 * Component catalog smoke tests.
 *
 * Drives from the CLI registry (single source of truth for "what components exist")
 * and validates that every registered component has a matching catalog card in
 * docs/components.html plus an individual documentation page.
 *
 * This catches three classes of regression that page-level specs miss:
 *   1. New component added to registry but forgotten in the catalog
 *   2. Catalog link points to a missing docs page
 *   3. Drift between CLI metadata and docs aliases
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { injectAxe, checkA11y } = require('axe-playwright');

const COMPONENTS_HTML = 'file://' + path.resolve(__dirname, '../../docs/components.html');
const DOCS_DIR = path.resolve(__dirname, '../../docs/components');

/**
 * Registry key → individual docs page.
 *
 * Most docs use the component directory name from cli/registry.js.
 * These aliases are intentional public docs names that differ from registry dir.
 */
const DOC_PAGE_ALIASES = {
  icon: 'ren-icons.html',
  otp: 'ren-input-otp.html',
  table: 'ren-data-table.html',
  form: 'ren-form-validation.html',
  ai: 'ren-ai-patterns.html',
};

let components = [];

function cssString(value) {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(value);
  return value.replace(/["\\]/g, '\\$&');
}

test.beforeAll(async () => {
  const { REGISTRY } = await import('../../cli/registry.js');
  components = Object.entries(REGISTRY).map(([key, meta]) => {
    const docFile = DOC_PAGE_ALIASES[key] || `${meta.dir}.html`;
    return {
      key,
      name: meta.name,
      layer: meta.layer,
      docFile,
      href: `components/${docFile}`,
      docPath: path.join(DOCS_DIR, docFile),
    };
  });
});

test.describe('Component catalog contract', () => {
  test('catalog page passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await page.goto(COMPONENTS_HTML);
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: false,
      axeOptions: {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      },
    });
  });

  test('every registry component has a catalog card and docs page', async ({ page }) => {
    await page.goto(COMPONENTS_HTML);

    for (const component of components) {
      const href = cssString(component.href);
      const card = page.locator(`article:has(a[href="${href}"])`);

      await expect(card, `${component.key} should have one catalog card linking to ${component.href}`).toHaveCount(1);
      await expect(card.first(), `${component.key} catalog card should be visible`).toBeVisible();
      await expect(
        card.first().locator('.comp-card-purpose, .comp-featured-purpose').first(),
        `${component.key} catalog card should explain the component purpose`
      ).toBeVisible();

      expect(
        fs.existsSync(component.docPath),
        `${component.key} docs page should exist at ${path.relative(path.resolve(__dirname, '../..'), component.docPath)}`
      ).toBe(true);
    }
  });

  for (const layer of ['primitives', 'composites', 'patterns']) {
    test(`${layer} registry components are represented in the matching catalog layer`, async ({ page }) => {
      await page.goto(COMPONENTS_HTML);
      const layerComponents = components.filter((component) => component.layer === layer);

      for (const component of layerComponents) {
        const href = cssString(component.href);
        const layerSection = page.locator(`#${layer}`);
        await expect(
          layerSection.locator(`article:has(a[href="${href}"])`),
          `${component.key} should be listed under #${layer}`
        ).toHaveCount(1);
      }
    });
  }

  test('every registry component docs page loads', async ({ page }) => {
    test.setTimeout(60000);

    for (const component of components) {
      expect(
        fs.existsSync(component.docPath),
        `${component.key} docs page should exist before browser navigation`
      ).toBe(true);

      await page.goto(`file://${component.docPath}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();
      await expect(
        page.locator('h1').first(),
        `${component.key} docs page should have a visible h1`
      ).toBeVisible();
    }
  });
});
