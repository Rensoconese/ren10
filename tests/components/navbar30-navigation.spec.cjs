// @ts-check
/**
 * Isolated Navbar 30 — Mega Menu Categories + Products
 * (nav-mega-menu-categories-products).
 *
 * Phase A RED: production HTML is intentionally absent; these tests must fail
 * for missing anatomy / 404, not for broken suite wiring.
 */
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { injectAxe, checkA11y } = require('axe-playwright');
const {
  expectAligned,
  expectNoOverflow,
  expectSingleVisibleAffordance,
  expectWidthRatio,
  inspectNativeChrome,
} = require('../utils/block-quality.cjs');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK_PATH = '/templates/blocks/nav-mega-menu-categories-products.html';
const ROOT = '[data-rmcp-root]';
const LINKS = '#rmcp-primary-links';
const DISCLOSURE = '.rmcp-disclosure';
const SUMMARY = '.rmcp-disclosure > summary';
const PANEL = '.rmcp-panel';
const MEGA_LINK = 'a.rmcp-mega-link';
const PRODUCT_CARD = 'a.rmcp-card';
const CHEVRON = '.rmcp-disclosure summary .rmcp-chevron';
const TOGGLE = `${ROOT} .ren-nav-toggle`;
const ACTIONS = `${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`;

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar30/render-matrix.json'),
    'utf8'
  )
);

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar30Block(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response, 'HTTP response for navbar30 categories-products block').toBeTruthy();
  expect(
    response.status(),
    'navbar30 block must not 404 — implement templates/blocks/nav-mega-menu-categories-products.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-rmcp-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function openDesktopMega(page) {
  await page.locator(SUMMARY).click();
  await expect(page.locator(DISCLOSURE)).toHaveAttribute('open', '');
  await expect(page.locator(PANEL)).toBeVisible();
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function openMobileNested(page) {
  await page.locator(TOGGLE).click();
  await expect(page.locator(TOGGLE)).toHaveAttribute('aria-expanded', 'true');
  await page.locator(SUMMARY).click();
  await expect(page.locator(DISCLOSURE)).toHaveAttribute('open', '');
}

test.describe('Navbar Mega Menu Categories Products (navbar30)', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  test.use({ actionTimeout: 3000, navigationTimeout: 10000 });
  test.describe.configure({ timeout: 25000 });

  test.beforeAll(async () => {
    staticServer = await startStaticServer(PKG_ROOT);
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('block page loads with ren-nav shell and categories-products root', async ({ page }) => {
    await gotoNavbar30Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Categories.?Products|Mega Menu Categories|nav-mega-menu-categories-products|Navbar 30/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator(LINKS)).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('exactly one primary links tree serves desktop and mobile', async ({ page }) => {
    await gotoNavbar30Block(page, staticServer.origin);
    await expect(page.locator(LINKS)).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator(LINKS)).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator(TOGGLE);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(LINKS)).toBeVisible();
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
  });

  test('anatomy: four top entries, 3×5 category links, two product cards, two actions, one chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar30Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-brand`)).toHaveCount(1);
    await expect(page.locator(`${LINKS} > li`)).toHaveCount(4);

    const topLevelLinks = page.locator(`${LINKS} > li > a.ren-nav-link`);
    const megaSummaries = page.locator(`${LINKS} > li > ${DISCLOSURE} > summary`);
    await expect(topLevelLinks).toHaveCount(3);
    await expect(megaSummaries).toHaveCount(1);

    await expect(page.locator(ACTIONS)).toHaveCount(2);
    await expect(page.locator(`${ROOT} .ren-nav-actions .ren-btn-secondary`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-actions .ren-btn-primary`)).toHaveCount(1);
    await expect(page.locator(TOGGLE)).toHaveCount(1);

    await openDesktopMega(page);

    await expect(page.locator('.rmcp-group-heading')).toHaveCount(3);
    await expect(page.locator(MEGA_LINK)).toHaveCount(15);
    await expect(page.locator(PRODUCT_CARD)).toHaveCount(2);
    await expect(page.locator('.rmcp-card-media')).toHaveCount(2);
    await expect(page.locator('.rmcp-card-title')).toHaveCount(2);
    await expect(page.locator('.rmcp-card-desc, .rmcp-card-cta')).toHaveCount(0);
    await expect(
      page.locator('.rmcg-card, .rmf-feature, .rmi-footer, .rml-rail, .rmnf-footer-band')
    ).toHaveCount(0);

    await expectSingleVisibleAffordance(page, [CHEVRON], 'navbar30 mega-menu chevron');
    await expect(page.locator('.rmcp-chevron')).toHaveCount(1);
  });

  test('product cards are single anchors with media and title only', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar30Block(page, staticServer.origin);
    await openDesktopMega(page);

    const cards = page.locator(PRODUCT_CARD);
    await expect(cards).toHaveCount(2);

    for (let i = 0; i < 2; i += 1) {
      const card = cards.nth(i);
      const tagName = await card.evaluate((el) => el.tagName);
      expect(tagName, `card ${i} tag`).toBe('A');
      await expect(card).toHaveAttribute('href', /.+/);
      await expect(card.locator('a[href], button, [role="button"]')).toHaveCount(0);
      await expect(card.locator('.rmcp-card-media.ren-frame')).toHaveCount(1);
      await expect(card.locator('.rmcp-card-title')).toHaveCount(1);
      await expect(card.locator('.rmcp-card-desc, .rmcp-card-cta, p')).toHaveCount(0);
    }
  });

  test('summary opens by click, keyboard, and desktop pointer hover; click pins; Escape restores focus from destinations', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar30Block(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    const summary = page.locator(SUMMARY);
    const panel = page.locator(PANEL);

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator(MEGA_LINK).first()).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');

    // Focus a category destination, then Escape — focus must return to summary.
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(MEGA_LINK).first().focus();
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('rmcp-mega-link'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');

    // Focus a product card destination, then Escape.
    await summary.click();
    await page.locator(PRODUCT_CARD).first().focus();
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('rmcp-card'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');

    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(disclosure).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.focus();
    await page.keyboard.press(' ');
    await expect(disclosure).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator(`${ROOT} .ren-nav-brand`).hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();

    await panel.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator(MEGA_LINK).first()).toBeVisible();
    await page.locator(MEGA_LINK).first().hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(PRODUCT_CARD).first().hover();
    await expect(disclosure).toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-brand`).hover();
    await expect(disclosure).toHaveAttribute('open', '');

    await summary.hover();
    await summary.click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-brand`).hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-brand`).hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('outside click closes the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar30Block(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    const summary = page.locator(SUMMARY);

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-brand`).click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('desktop destination classes: mega-link and card close details and restore summary focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar30Block(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    const summary = page.locator(SUMMARY);

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(MEGA_LINK).first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(PRODUCT_CARD).first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');
  });

  test('desktop action CTA closes the open mega disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar30Block(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    await openDesktopMega(page);
    await page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`).first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile destination class mega-link closes nested mega and shell; focuses visible toggle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1200 });
    await gotoNavbar30Block(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    const toggle = page.locator(TOGGLE);

    await openMobileNested(page);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.locator(MEGA_LINK).first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(`${ROOT} ren-nav`)).not.toHaveAttribute('data-open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('ren-nav-toggle'))).toBe(true);
  });

  test('mobile destination class product card closes nested mega and shell; focuses visible toggle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1200 });
    await gotoNavbar30Block(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    const toggle = page.locator(TOGGLE);

    await openMobileNested(page);
    await page.locator(PRODUCT_CARD).first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('ren-nav-toggle'))).toBe(true);
  });

  test('mobile destination class ren-nav-actions closes nested mega and shell; focuses visible toggle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1200 });
    await gotoNavbar30Block(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    const toggle = page.locator(TOGGLE);

    await openMobileNested(page);
    await expect(page.locator(ACTIONS).first()).toBeVisible();
    await page.locator(ACTIONS).first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('ren-nav-toggle'))).toBe(true);
  });

  test('mobile destination class top peer closes nested mega and shell; focuses visible toggle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1200 });
    await gotoNavbar30Block(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    const toggle = page.locator(TOGGLE);

    await openMobileNested(page);
    const peer = page.locator(`${LINKS} > li > a.ren-nav-link`).first();
    await expect(peer).toBeVisible();
    await peer.click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('ren-nav-toggle'))).toBe(true);
  });

  test('block does not export a window global init helper', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar30Block(page, staticServer.origin);
    const hasGlobal = await page.evaluate(() => typeof window.initNavMegaMenuCategoriesProducts);
    expect(hasGlobal).toBe('undefined');
  });

  test('mobile toggle exposes the same tree and closes mega on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar30Block(page, staticServer.origin);

    const toggle = page.locator(TOGGLE);
    const disclosure = page.locator(DISCLOSURE);

    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', 'rmcp-primary-links');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(LINKS)).toBeVisible();

    await page.locator(SUMMARY).click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator(MEGA_LINK).first()).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('breakpoint crossing closes open mega; same-breakpoint resize keeps open state stable', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar30Block(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    await openDesktopMega(page);

    // Same-breakpoint resize (still desktop) must not thrash open state.
    await page.setViewportSize({ width: 1100, height: 900 });
    await expect(disclosure).toHaveAttribute('open', '');
    await page.setViewportSize({ width: 1280, height: 1000 });
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    await openMobileNested(page);
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    const summary = page.locator(SUMMARY);
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-brand`).hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('JS-disabled mobile keeps the nav tree, both actions, and native disclosure usable', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1200 },
    });
    const page = await context.newPage();
    await gotoNavbar30Block(page, staticServer.origin);

    await expect(page.locator(TOGGLE)).toBeHidden();
    await expect(page.locator(LINKS)).toBeVisible();
    await expect(page.locator(ACTIONS)).toHaveCount(2);
    await expect(page.locator(ACTIONS).nth(0)).toBeVisible();
    await expect(page.locator(ACTIONS).nth(1)).toBeVisible();

    await page.locator(SUMMARY).click();
    await expect(page.locator(DISCLOSURE)).toHaveAttribute('open', '');
    await expect(page.locator(MEGA_LINK)).toHaveCount(15);
    await expect(page.locator(PRODUCT_CARD)).toHaveCount(2);
    await expect(page.locator('.rmcp-group-heading')).toHaveCount(3);

    await context.close();
  });

  test('viewport geometry: full-width desktop panel under bar, mobile in-flow, no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar30Block(page, staticServer.origin);
    await openDesktopMega(page);

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rmcp-root] .ren-nav');
      const panel = document.querySelector('.rmcp-panel');
      if (!nav || !panel) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
        panelWidth: Math.round(panelRect.width),
        navWidth: Math.round(navRect.width),
        overlapsBar: panelRect.top < navRect.bottom - 2 && panelRect.bottom > navRect.top + 2,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    expect(desktop.overlapsBar, 'mega panel must sit under the bar').toBe(false);
    expect(desktop.panelWidth, 'desktop mega is full-width under the bar').toBeGreaterThanOrEqual(
      desktop.navWidth - 8
    );
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar30Block(page, staticServer.origin);
    await openMobileNested(page);

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rmcp-panel');
      if (!panel) return null;
      return { position: getComputedStyle(panel).position };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    await expectNoOverflow(page, 'html');
  });

  test('tablet mid-width and wide desktop: three category groups and two product cards readable', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1200 });
    await gotoNavbar30Block(page, staticServer.origin);

    await expect(page.locator(TOGGLE)).toBeHidden();
    await openDesktopMega(page);
    await expect(page.locator(MEGA_LINK)).toHaveCount(15);
    await expect(page.locator(PRODUCT_CARD)).toHaveCount(2);
    await expect(page.locator('.rmcp-group-heading')).toHaveCount(3);

    const tablet = await page.evaluate(() => {
      const groups = Array.from(document.querySelectorAll('.rmcp-group'));
      const cards = Array.from(document.querySelectorAll('a.rmcp-card'));
      if (groups.length < 3 || cards.length < 2) return null;
      const g0 = groups[0].getBoundingClientRect();
      const g1 = groups[1].getBoundingClientRect();
      const c0 = cards[0].getBoundingClientRect();
      const c1 = cards[1].getBoundingClientRect();
      return {
        multiColGroups: Math.abs(g0.top - g1.top) < 48 && g1.left >= g0.right - 8,
        twoUpCards: Math.abs(c0.top - c1.top) < 48 && c1.left >= c0.right - 8,
        groupReadable: Math.round(g0.width),
        cardReadable: Math.round(c0.width),
      };
    });
    expect(tablet).toBeTruthy();
    expect(tablet.groupReadable, `group width ${tablet.groupReadable}`).toBeGreaterThanOrEqual(100);
    expect(tablet.cardReadable, `card width ${tablet.cardReadable}`).toBeGreaterThanOrEqual(120);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator(PANEL)).toBeVisible();
    const wide = await page.evaluate(() => {
      const categories = document.querySelector('.rmcp-categories');
      const products = document.querySelector('.rmcp-products');
      const groups = Array.from(document.querySelectorAll('.rmcp-group'));
      const cards = Array.from(document.querySelectorAll('a.rmcp-card'));
      if (!categories || !products || groups.length < 3 || cards.length < 2) return null;
      const catR = categories.getBoundingClientRect();
      const prodR = products.getBoundingClientRect();
      const g0 = groups[0].getBoundingClientRect();
      const g2 = groups[2].getBoundingClientRect();
      const c0 = cards[0].getBoundingClientRect();
      const c1 = cards[1].getBoundingClientRect();
      return {
        sideBySide: Math.abs(catR.top - prodR.top) < 80 && prodR.left >= catR.right - 24,
        threeGroupBand: Math.abs(g0.top - g2.top) < 48 && g2.left > g0.left + 40,
        twoCardBand: Math.abs(c0.top - c1.top) < 48 && c1.left >= c0.right - 8,
      };
    });
    expect(wide).toBeTruthy();
    expect(wide.sideBySide, 'categories and products sit as peers on wide desktop').toBe(true);
    expect(wide.threeGroupBand, 'three category columns on wide desktop').toBe(true);
    expect(wide.twoCardBand, 'two product cards side by side on wide desktop').toBe(true);
  });

  test('narrow 320/340 widths and 767/768/769 breakpoint seams have no overflow and correct shell', async ({ page }) => {
    for (const width of [320, 340]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoNavbar30Block(page, staticServer.origin);
      await openMobileNested(page);
      await expect(page.locator(MEGA_LINK)).toHaveCount(15);
      await expect(page.locator(PRODUCT_CARD)).toHaveCount(2);
      await expectNoOverflow(page, 'html');
      await expectNoOverflow(page, ROOT);
      await expect(page.locator(TOGGLE)).toBeVisible();
    }

    // ren-nav shell uses max-width: 48rem (≤768px mobile; ≥769px desktop).
    for (const width of [767, 768]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoNavbar30Block(page, staticServer.origin);
      await expect(page.locator(TOGGLE)).toBeVisible();
      await openMobileNested(page);
      await expect(page.locator(MEGA_LINK)).toHaveCount(15);
      await expectNoOverflow(page, 'html');
    }

    await page.setViewportSize({ width: 769, height: 900 });
    await gotoNavbar30Block(page, staticServer.origin);
    await expect(page.locator(TOGGLE)).toBeHidden();
    await openDesktopMega(page);
    await expect(page.locator(MEGA_LINK)).toHaveCount(15);
    await expectNoOverflow(page, 'html');
  });

  test('product media uses approximately 3:2 frames with cover crop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar30Block(page, staticServer.origin);
    await openDesktopMega(page);

    const mediaAudit = await page.evaluate(() => {
      const frames = Array.from(document.querySelectorAll('.rmcp-card-media'));
      return frames.map((frame, index) => {
        const rect = frame.getBoundingClientRect();
        const style = getComputedStyle(frame);
        const ratio = rect.height > 0 ? rect.width / rect.height : 0;
        const img = frame.querySelector('img');
        const imgStyle = img ? getComputedStyle(img) : null;
        return {
          index,
          ratio: Number(ratio.toFixed(2)),
          aspectRatio: style.aspectRatio,
          objectFit: imgStyle?.objectFit || '',
          hasRenFrame: frame.classList.contains('ren-frame'),
        };
      });
    });

    expect(mediaAudit.length, 'two product media frames').toBe(2);
    for (const item of mediaAudit) {
      expect(item.hasRenFrame, `frame ${item.index} ren-frame`).toBe(true);
      expect(item.ratio, `frame ${item.index} box ratio ${item.ratio}`).toBeGreaterThanOrEqual(1.3);
      expect(item.ratio, `frame ${item.index} box ratio ${item.ratio}`).toBeLessThanOrEqual(1.7);
      const aspect = String(item.aspectRatio || '');
      expect(aspect.includes('3') && aspect.includes('2'), `frame ${item.index} aspect-ratio ${aspect}`).toBe(true);
      expect(item.objectFit, `frame ${item.index} object-fit`).toBe('cover');
    }
  });

  test('desktop chrome: single chevron, neutral details, aligned top-level peers', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar30Block(page, staticServer.origin);

    await expectSingleVisibleAffordance(page, [CHEVRON], 'navbar30 desktop chevron');

    const peerLinks = page.locator(`${LINKS} > li > a.ren-nav-link`);
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator(SUMMARY)).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        SUMMARY,
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, DISCLOSURE);
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, SUMMARY);
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none' || afterContent === '' || summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);
  });

  test('mobile rows: full-width peers, stacked products, one chevron, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1200 });
    await gotoNavbar30Block(page, staticServer.origin);
    await openMobileNested(page);
    await expect(page.locator(PANEL)).toBeVisible();

    const firstPeer = page.locator(`${LINKS} > li > a.ren-nav-link`).first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, LINKS, 0.92, 1.05);
    await expectWidthRatio(page, SUMMARY, LINKS, 0.92, 1.05);
    await expectSingleVisibleAffordance(page, [CHEVRON], 'mobile navbar30 chevron');
    await expectNoOverflow(page, 'html');

    const mobileLayout = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('a.rmcp-card'));
      if (cards.length < 2) return null;
      const c0 = cards[0].getBoundingClientRect();
      const c1 = cards[1].getBoundingClientRect();
      return {
        stackedCards: c1.top >= c0.bottom - 8,
        cardCount: cards.length,
      };
    });
    expect(mobileLayout).toBeTruthy();
    expect(mobileLayout.stackedCards, 'mobile product cards stack').toBe(true);
    expect(mobileLayout.cardCount).toBe(2);
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1200 },
    });
    const page = await context.newPage();
    await gotoNavbar30Block(page, staticServer.origin);
    await openMobileNested(page);

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rmcp-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, a.rmcp-mega-link, a.rmcp-card'
      );
      const bad = [];
      for (const el of candidates) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.width < 44 || rect.height < 44) {
          bad.push({
            name: el.className || el.tagName,
            text: (el.textContent || '').trim().slice(0, 40),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        }
      }
      return bad;
    });

    expect(undersized, JSON.stringify(undersized, null, 2)).toEqual([]);
    await context.close();
  });

  test('reduced-motion disables block-local transitions and animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar30Block(page, staticServer.origin);
    await openDesktopMega(page);

    const motion = await page.evaluate(() => {
      const selectors = ['.rmcp-panel', '.rmcp-chevron', 'a.rmcp-card', 'a.rmcp-mega-link'];
      return selectors.map((selector) => {
        const el = document.querySelector(selector);
        if (!el) return { selector, missing: true };
        const style = getComputedStyle(el);
        return {
          selector,
          transitionDuration: style.transitionDuration,
          animationName: style.animationName,
          animationDuration: style.animationDuration,
        };
      });
    });

    for (const item of motion) {
      expect(item.missing, item.selector).toBeFalsy();
      const durations = String(item.transitionDuration || '')
        .split(',')
        .map((part) => part.trim());
      for (const duration of durations) {
        expect(duration === '0s' || duration === '0ms' || duration === '', item.selector).toBeTruthy();
      }
      const animName = String(item.animationName || 'none');
      expect(animName === 'none' || animName === '', item.selector).toBeTruthy();
    }
  });

  test('render-matrix marker counts hold across packet viewport states', async ({ page }) => {
    for (const state of RENDER_MATRIX.states) {
      if (!state.javaScript) continue;

      if (state.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }

      await page.setViewportSize(state.viewport);
      await gotoNavbar30Block(page, staticServer.origin);

      await page.evaluate((theme) => {
        document.documentElement.setAttribute('data-theme', theme);
      }, state.theme);

      for (const action of state.actions) {
        if (action.type === 'click') {
          await page.locator(action.selector).click();
        } else if (action.type === 'hover') {
          await page.locator(action.selector).hover();
        }
      }

      for (const [selector, count] of Object.entries(state.expectedMarkers)) {
        await expect(
          page.locator(selector),
          `${state.id} expects ${count}× ${selector}`
        ).toHaveCount(count);
      }
    }
  });

  test('navbar30 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoNavbar30Block(page, staticServer.origin);
    await injectAxe(page);
    await checkA11y(page, ROOT, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });

  test('light and dark surfaces resolve through RenDS tokens', async ({ page }) => {
    await gotoNavbar30Block(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rmcp-root] .ren-nav');
        return {
          surface,
          text,
          navBg: nav ? getComputedStyle(nav).backgroundColor : '',
        };
      });

      expect(colors.surface, theme).toBeTruthy();
      expect(colors.text, theme).toBeTruthy();
      expect(colors.navBg, theme).not.toBe('');
      expect(colors.navBg, theme).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
    }
  });
});
