// @ts-check
/**
 * Navbar 29 — Overlay Collections Mega Menu
 * (nav-mega-menu-overlay-collections).
 *
 * Isolated suite for the parallel navbar29 worker. Does not edit the shared
 * blocks-navigation suite.
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
const BLOCK_PATH = '/templates/blocks/nav-mega-menu-overlay-collections.html';
const ROOT = '[data-rmoc-root]';
const LINKS_ID = '#rmoc-primary-links';
const DISCLOSURE = '.rmoc-disclosure';
const SUMMARY = '.rmoc-disclosure > summary';
const PANEL = '.rmoc-panel';
const CHEVRON = '.rmoc-disclosure summary .rmoc-chevron';
const MEGA_LINK = '.rmoc-mega-link';
const CARD = 'a.rmoc-card';

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RMOC_RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar29/render-matrix.json'),
    'utf8'
  )
);

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar29Block(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response, 'HTTP response for navbar29 overlay collections block').toBeTruthy();
  expect(
    response.status(),
    'navbar29 block must not 404 — implement templates/blocks/nav-mega-menu-overlay-collections.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-rmoc-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

test.describe('Navbar Mega Menu Overlay Collections (navbar29)', () => {
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

  test('block page loads with ren-nav shell and overlay-collections root', async ({ page }) => {
    await gotoNavbar29Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Overlay Collections|Navbar Mega Menu Overlay|nav-mega-menu-overlay-collections/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator(LINKS_ID)).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('exactly one primary links tree and landmark serve desktop and mobile', async ({ page }) => {
    await gotoNavbar29Block(page, staticServer.origin);
    await expect(page.locator(LINKS_ID)).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator(LINKS_ID)).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(LINKS_ID)).toBeVisible();
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
  });

  test('anatomy: four top entries, five category links, four overlay cards, two actions, one chevron', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar29Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-brand`)).toHaveCount(1);
    await expect(page.locator(`${LINKS_ID} > li`)).toHaveCount(4);

    const topLevelLinks = page.locator(`${LINKS_ID} > li > a.ren-nav-link`);
    const megaSummaries = page.locator(`${LINKS_ID} > li > ${DISCLOSURE} > summary`);
    await expect(topLevelLinks).toHaveCount(3);
    await expect(megaSummaries).toHaveCount(1);

    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`)
    ).toHaveCount(2);
    await expect(page.locator(`${ROOT} .ren-nav-actions .ren-btn-secondary`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-actions .ren-btn-primary`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveCount(1);

    await page.locator(SUMMARY).click();
    await expect(page.locator(DISCLOSURE)).toHaveAttribute('open', '');
    await expect(page.locator(PANEL)).toBeVisible();

    await expect(page.locator('.rmoc-layout.ren-with-sidebar')).toHaveCount(1);
    await expect(page.locator('.rmoc-link-col')).toHaveCount(1);
    await expect(page.locator('.rmoc-group-heading')).toHaveCount(1);
    await expect(page.locator(MEGA_LINK)).toHaveCount(5);
    await expect(page.locator('.rmoc-card-grid')).toHaveCount(1);
    await expect(page.locator(`${CARD}.ren-card.ren-card-interactive`)).toHaveCount(4);
    await expect(page.locator('.rmoc-card-media')).toHaveCount(4);
    await expect(page.locator('.rmoc-card-title')).toHaveCount(4);
    await expect(page.locator('.rmoc-card-desc')).toHaveCount(4);
    await expect(page.locator('.rmoc-card-cta')).toHaveCount(4);

    // Not navbar10 six-card editorial chrome or social/footer mega rails.
    await expect(page.locator('.rmcg-card, .rml-rail, .rmi-footer, .rmnf-footer-band, .rmf-feature')).toHaveCount(0);
    await expect(page.locator('.rmoc-social, .rmoc-footer, .rmoc-footer-link')).toHaveCount(0);

    await expectSingleVisibleAffordance(page, [CHEVRON], 'navbar29 mega chevron');
    await expect(page.locator('.rmoc-chevron')).toHaveCount(1);
  });

  test('four overlay collection cards are single anchors without nested interactive descendants', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar29Block(page, staticServer.origin);
    await page.locator(SUMMARY).click();

    const cards = page.locator(`${CARD}.ren-card.ren-card-interactive`);
    await expect(cards).toHaveCount(4);

    for (let i = 0; i < 4; i += 1) {
      const card = cards.nth(i);
      const tagName = await card.evaluate((el) => el.tagName);
      expect(tagName, `card ${i} tag`).toBe('A');
      await expect(card).toHaveAttribute('href', /.+/);
      await expect(card.locator('a[href], button, [role="button"]')).toHaveCount(0);
      await expect(card.locator('.rmoc-card-media')).toHaveCount(1);
      await expect(card.locator('.rmoc-card-title')).toHaveCount(1);
      await expect(card.locator('.rmoc-card-desc')).toHaveCount(1);
      await expect(card.locator('.rmoc-card-cta')).toHaveCount(1);
    }
  });

  test('summary opens by click, keyboard, and desktop pointer hover; click pins; Escape restores focus', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar29Block(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    const summary = page.locator(SUMMARY);
    const panel = page.locator(PANEL);

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator(CARD).first()).toBeVisible();

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
    await expect(page.locator(CARD).first()).toBeVisible();

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

  test('Escape from a focused menu destination restores focus to the summary', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar29Block(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    const summary = page.locator(SUMMARY);
    const firstCategory = page.locator(MEGA_LINK).first();
    const firstCard = page.locator(CARD).first();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await firstCategory.focus();
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('rmoc-mega-link'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await firstCard.focus();
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('rmoc-card'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');
  });

  test('outside click and every mega destination class closes the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar29Block(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    const summary = page.locator(SUMMARY);

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-brand`).click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(MEGA_LINK).first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(CARD).first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    // Destination classes present for this module: category links + collection cards.
    // Social/footer destination classes are intentionally absent.
    await expect(page.locator('.rmoc-social, .rmoc-footer, .rmoc-footer-link, a.rmoc-social, a.rmoc-footer-link')).toHaveCount(0);
  });

  test('mobile toggle exposes the same tree and closes mega on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar29Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const disclosure = page.locator(DISCLOSURE);
    const summary = page.locator(SUMMARY);

    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', 'rmoc-primary-links');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(LINKS_ID)).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator(CARD).first()).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile destinations close nested mega + shell via public toggle and leave stable visible focus', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await gotoNavbar29Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const disclosure = page.locator(DISCLOSURE);
    const summary = page.locator(SUMMARY);
    const brand = page.locator(`${ROOT} .ren-nav-brand`);

    /**
     * @param {string} openPath
     * @param {import('@playwright/test').Locator} activator
     * @param {'brand'|'toggle'} focusKind
     */
    async function assertDestinationClosesShell(openPath, activator, focusKind) {
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      if (openPath === 'nested') {
        await summary.click();
        await expect(disclosure).toHaveAttribute('open', '');
      }

      await activator.click();
      await expect(disclosure).not.toHaveAttribute('open', '');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator(`${ROOT} ren-nav`)).not.toHaveAttribute('data-open', '');

      await expect
        .poll(async () => page.evaluate(() => {
          const active = document.activeElement;
          if (!(active instanceof HTMLElement)) return null;
          const style = getComputedStyle(active);
          const rect = active.getBoundingClientRect();
          return {
            tag: active.tagName,
            isBrand: active.classList.contains('ren-nav-brand'),
            isToggle: active.classList.contains('ren-nav-toggle'),
            visible:
              style.display !== 'none'
              && style.visibility !== 'hidden'
              && Number(style.opacity || '1') > 0
              && rect.width > 0
              && rect.height > 0,
          };
        }))
        .toMatchObject(
          focusKind === 'brand'
            ? { isBrand: true, visible: true }
            : { isToggle: true, visible: true }
        );
    }

    // Category mega-link with nested open.
    await assertDestinationClosesShell('nested', page.locator(MEGA_LINK).first(), 'toggle');

    // Collection card with nested open.
    await assertDestinationClosesShell('nested', page.locator(CARD).first(), 'toggle');

    // Secondary + primary actions (shell open; nested optional).
    await assertDestinationClosesShell(
      'shell',
      page.locator(`${ROOT} .ren-nav-actions .ren-btn-secondary`).first(),
      'toggle'
    );
    await assertDestinationClosesShell(
      'shell',
      page.locator(`${ROOT} .ren-nav-actions .ren-btn-primary`).first(),
      'toggle'
    );

    // Brand stays visible — focus may remain on brand.
    await assertDestinationClosesShell('nested', brand, 'brand');

    // Peer top-level link.
    await assertDestinationClosesShell(
      'nested',
      page.locator(`${LINKS_ID} > li > a.ren-nav-link`).first(),
      'toggle'
    );
  });

  test('does not publish window.initNavMegaMenuOverlayCollections global', async ({ page }) => {
    await gotoNavbar29Block(page, staticServer.origin);
    const hasGlobal = await page.evaluate(() => Object.hasOwn(window, 'initNavMegaMenuOverlayCollections')
      || typeof window.initNavMegaMenuOverlayCollections !== 'undefined');
    expect(hasGlobal, 'block must not assign window.initNavMegaMenuOverlayCollections').toBe(false);
  });

  test('breakpoint crossing closes an open mega and resets interaction policy', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar29Block(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    await page.locator(SUMMARY).click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator(SUMMARY).click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    const summary = page.locator(SUMMARY);
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-brand`).hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('same-breakpoint resize keeps a pinned open mega stable', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar29Block(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    const summary = page.locator(SUMMARY);

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    // Ensure pinned (second hover open is not required; click-open is pinned).
    await page.setViewportSize({ width: 1100, height: 900 });
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator(PANEL)).toBeVisible();
    await expect(page.locator(MEGA_LINK)).toHaveCount(5);
    await expect(page.locator(CARD)).toHaveCount(4);

    await page.setViewportSize({ width: 1400, height: 900 });
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator(PANEL)).toBeVisible();
  });

  test('JS-disabled mobile keeps the nav tree, both actions, and native disclosure usable', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar29Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator(LINKS_ID)).toBeVisible();
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`)
    ).toHaveCount(2);
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`).nth(0)
    ).toBeVisible();
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`).nth(1)
    ).toBeVisible();

    await page.locator(SUMMARY).click();
    await expect(page.locator(DISCLOSURE)).toHaveAttribute('open', '');
    await expect(page.locator(MEGA_LINK)).toHaveCount(5);
    await expect(page.locator(CARD)).toHaveCount(4);
    await expect(page.locator('.rmoc-group-heading')).toBeVisible();

    await context.close();
  });

  test('viewport geometry: full-width desktop mega under bar, mobile in-flow, no horizontal overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar29Block(page, staticServer.origin);
    await page.locator(SUMMARY).click();
    await expect(page.locator(PANEL)).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rmoc-root] .ren-nav');
      const panel = document.querySelector('.rmoc-panel');
      if (!nav || !panel) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        navWidth: Math.round(navRect.width),
        panelTop: panelRect.top,
        panelWidth: Math.round(panelRect.width),
        panelPosition: getComputedStyle(panel).position,
        fullWidthShare: navRect.width > 0 ? panelRect.width / navRect.width : 0,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    expect(desktop.fullWidthShare, 'desktop mega spans most of the bar width').toBeGreaterThanOrEqual(0.9);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar29Block(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator(SUMMARY).click();
    await expect(page.locator(PANEL)).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rmoc-panel');
      if (!panel) return null;
      return { position: getComputedStyle(panel).position };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    await expectNoOverflow(page, 'html');
  });

  test('tablet mid-width and wide desktop: narrow category column and responsive overlay grid', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoNavbar29Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeHidden();

    await page.locator(SUMMARY).click();
    await expect(page.locator(DISCLOSURE)).toHaveAttribute('open', '');
    await expect(page.locator(PANEL)).toBeVisible();
    await expect(page.locator(MEGA_LINK)).toHaveCount(5);
    await expect(page.locator(CARD)).toHaveCount(4);

    const tablet = await page.evaluate(() => {
      const linkCol = document.querySelector('.rmoc-link-col');
      const cardGrid = document.querySelector('.rmoc-card-grid');
      const cards = Array.from(document.querySelectorAll('a.rmoc-card'));
      if (!linkCol || !cardGrid || cards.length < 2) return null;

      const linkR = linkCol.getBoundingClientRect();
      const gridR = cardGrid.getBoundingClientRect();
      const c0 = cards[0].getBoundingClientRect();
      const c1 = cards[1].getBoundingClientRect();
      const multiUp = Math.abs(c0.top - c1.top) < 48 && c1.left >= c0.right - 4;

      return {
        narrowLeft: linkR.width < gridR.width * 0.85,
        multiUp,
        cardCount: cards.length,
      };
    });

    expect(tablet, 'tablet composition metrics').toBeTruthy();
    expect(tablet.narrowLeft || tablet.multiUp, 'tablet preserves category/collection relationship').toBe(true);
    expect(tablet.cardCount).toBe(4);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator(PANEL)).toBeVisible();
    const wide = await page.evaluate(() => {
      const linkCol = document.querySelector('.rmoc-link-col');
      const cardGrid = document.querySelector('.rmoc-card-grid');
      const cards = Array.from(document.querySelectorAll('a.rmoc-card'));
      if (!linkCol || !cardGrid || cards.length < 4) return null;

      const linkR = linkCol.getBoundingClientRect();
      const gridR = cardGrid.getBoundingClientRect();
      const rects = cards.map((el) => el.getBoundingClientRect());
      const fourUp =
        Math.abs(rects[0].top - rects[1].top) < 48
        && Math.abs(rects[1].top - rects[2].top) < 48
        && Math.abs(rects[2].top - rects[3].top) < 48
        && rects[1].left >= rects[0].right - 4
        && rects[2].left >= rects[1].right - 4
        && rects[3].left >= rects[2].right - 4;

      return {
        linkNarrow: linkR.width <= 16 * 16 && linkR.width < gridR.width * 0.5,
        fourUp,
        linkColWidth: Math.round(linkR.width),
        cardGridWidth: Math.round(gridR.width),
      };
    });

    expect(wide).toBeTruthy();
    expect(wide.linkNarrow, `link ${wide.linkColWidth} vs cards ${wide.cardGridWidth}`).toBe(true);
    expect(wide.fourUp, 'wide desktop keeps a four-column overlay collection grid').toBe(true);
  });

  test('narrow 320 and 340 widths keep usable mobile chrome without overflow', async ({ page }) => {
    for (const width of [320, 340]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoNavbar29Block(page, staticServer.origin);

      const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
      await expect(toggle).toBeVisible();
      await toggle.click();
      await page.locator(SUMMARY).click();
      await expect(page.locator(DISCLOSURE)).toHaveAttribute('open', '');
      await expect(page.locator(MEGA_LINK)).toHaveCount(5);
      await expect(page.locator(CARD)).toHaveCount(4);
      await expectNoOverflow(page, 'html');

      const stacked = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('a.rmoc-card'));
        if (cards.length < 2) return false;
        const c0 = cards[0].getBoundingClientRect();
        const c1 = cards[1].getBoundingClientRect();
        return c1.top >= c0.bottom - 8;
      });
      expect(stacked, `${width}px cards stack`).toBe(true);
    }
  });

  test('breakpoint seams 767/768/769 switch mobile chrome vs desktop shell cleanly', async ({ page }) => {
    // ren-nav uses max-width: 48rem for mobile chrome, so 767 and 768 keep the
    // toggle; desktop shell (toggle hidden) starts at 769px with a 16px root.
    await page.setViewportSize({ width: 767, height: 1000 });
    await gotoNavbar29Block(page, staticServer.origin);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeVisible();
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator(LINKS_ID)).toBeVisible();
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 768, height: 1000 });
    await gotoNavbar29Block(page, staticServer.origin);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeVisible();
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator(LINKS_ID)).toBeVisible();
    await page.locator(SUMMARY).click();
    await expect(page.locator(PANEL)).toBeVisible();
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 769, height: 1000 });
    await gotoNavbar29Block(page, staticServer.origin);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator(LINKS_ID)).toBeVisible();
    await page.locator(SUMMARY).click();
    await expect(page.locator(DISCLOSURE)).toHaveAttribute('open', '');
    await expect(page.locator(PANEL)).toBeVisible();
    await expectNoOverflow(page, 'html');
  });

  test('desktop chrome: single chevron, neutral details, aligned trigger', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar29Block(page, staticServer.origin);

    await expectSingleVisibleAffordance(page, [CHEVRON], 'navbar29 desktop chevron');

    const peerLinks = page.locator(`${LINKS_ID} > li > a.ren-nav-link`);
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
      afterContent === 'none'
      || afterContent === ''
      || summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);
  });

  test('mobile rows: full width peers, one-column cards, logo+toggle top row, stacked actions', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar29Block(page, staticServer.origin);

    const closed = await page.evaluate(() => {
      const brand = document.querySelector('[data-rmoc-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rmoc-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rmoc-root] .ren-nav-toggle');
      const links = document.querySelector('#rmoc-primary-links');
      if (!brand || !actions || !toggle || !links) return null;
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const actionsStyle = getComputedStyle(actions);
      const linksStyle = getComputedStyle(links);
      const actionVisible =
        actionsRect.width > 0
        && actionsRect.height > 0
        && actionsStyle.display !== 'none'
        && actionsStyle.visibility !== 'hidden'
        && Number(actionsStyle.opacity || '1') > 0;
      return {
        brandTop: brandRect.top,
        toggleTop: toggleRect.top,
        actionVisible,
        linksBelowTopRow:
          linksRect.top >= Math.max(brandRect.bottom, toggleRect.bottom) - 4
          || linksStyle.display === 'none'
          || linksStyle.visibility === 'hidden',
      };
    });
    expect(closed).toBeTruthy();
    expect(closed.actionVisible, 'closed mobile must not show actions in permanent top row').toBe(false);
    expect(Math.abs(closed.brandTop - closed.toggleTop), 'brand and toggle share top row').toBeLessThanOrEqual(12);
    expect(closed.linksBelowTopRow, 'tree not inlined into closed top row').toBe(true);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator(SUMMARY).click();
    await expect(page.locator(PANEL)).toBeVisible();

    const firstPeer = page.locator(`${LINKS_ID} > li > a.ren-nav-link`).first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, LINKS_ID, 0.92, 1.05);
    await expectWidthRatio(page, SUMMARY, LINKS_ID, 0.92, 1.05);
    await expectSingleVisibleAffordance(page, [CHEVRON], 'mobile navbar29 chevron');
    await expectNoOverflow(page, 'html');

    const mobileLayout = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('a.rmoc-card'));
      const linkCol = document.querySelector('.rmoc-link-col');
      const cardGrid = document.querySelector('.rmoc-card-grid');
      const actions = document.querySelector('[data-rmoc-root] .ren-nav-actions');
      const links = document.querySelector('#rmoc-primary-links');
      if (cards.length < 2 || !linkCol || !cardGrid || !actions || !links) return null;
      const c0 = cards[0].getBoundingClientRect();
      const c1 = cards[1].getBoundingClientRect();
      const linkR = linkCol.getBoundingClientRect();
      const gridR = cardGrid.getBoundingClientRect();
      const actionsR = actions.getBoundingClientRect();
      const linksR = links.getBoundingClientRect();
      return {
        stackedCards: c1.top >= c0.bottom - 8,
        linkAboveCards: gridR.top >= linkR.bottom - 16,
        actionsBelowLinks: actionsR.top >= linksR.bottom - 4,
        cardCount: cards.length,
      };
    });
    expect(mobileLayout).toBeTruthy();
    expect(mobileLayout.stackedCards, 'mobile cards stack in one column').toBe(true);
    expect(mobileLayout.linkAboveCards, 'category column precedes cards').toBe(true);
    expect(mobileLayout.actionsBelowLinks, 'actions stack below open tree').toBe(true);
    expect(mobileLayout.cardCount).toBe(4);
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await gotoNavbar29Block(page, staticServer.origin);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator(SUMMARY).click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rmoc-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, .rmoc-mega-link, a.rmoc-card'
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
    await gotoNavbar29Block(page, staticServer.origin);
    await page.locator(SUMMARY).click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rmoc-panel', '.rmoc-chevron', 'a.rmoc-card', '.rmoc-card-media'];
      return selectors.map((selector) => {
        const el = document.querySelector(selector);
        if (!el) return { selector, missing: true };
        const style = window.getComputedStyle(el);
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

  test('overlay collections mega preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoNavbar29Block(page, staticServer.origin);
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
    await gotoNavbar29Block(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rmoc-root] .ren-nav');
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

  test('render-matrix marker counts hold across packet viewport states', async ({ page }) => {
    expect(RMOC_RENDER_MATRIX.states.length, 'packet render matrix must have 15 states').toBe(15);

    for (const state of RMOC_RENDER_MATRIX.states) {
      if (!state.javaScript) continue;

      if (state.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }

      await page.setViewportSize(state.viewport);
      await gotoNavbar29Block(page, staticServer.origin);

      await page.evaluate((theme) => {
        document.documentElement.setAttribute('data-theme', theme);
      }, state.theme);

      for (const action of state.actions) {
        if (action.type === 'click') {
          const loc = page.locator(action.selector);
          await loc.waitFor({ state: 'visible' });
          await loc.click();
          // Stabilize shell before nested summary (seam-768 race).
          if (String(action.selector).includes('ren-nav-toggle')) {
            await page.locator('.ren-nav-toggle[aria-expanded="true"]').waitFor();
            await page.locator('#rmoc-primary-links').waitFor({ state: 'visible' });
            await page.locator(SUMMARY).waitFor({ state: 'visible' });
          }
          if (String(action.selector).includes('summary')) {
            await page.locator('.rmoc-disclosure[open]').waitFor({ state: 'attached' });
          }
        } else if (action.type === 'focus') {
          await page.locator(action.selector).waitFor({ state: 'visible' });
          await page.locator(action.selector).focus();
        } else if (action.type === 'hover') {
          await page.locator(action.selector).hover();
          await page.locator('.rmoc-disclosure[open]').waitFor({ state: 'attached' });
          // Keep pointer parked so leave does not collapse hover-open.
          await page.locator(action.selector).hover({ force: true });
        }
      }

      for (const [selector, count] of Object.entries(state.expectedMarkers)) {
        await expect(
          page.locator(selector),
          `${state.id} expects ${count}× ${selector}`
        ).toHaveCount(count);
      }

      const expectedState = state.expectedState;
      if (expectedState && typeof expectedState === 'object') {
        if (expectedState.detailsOpen === true) {
          await expect(
            page.locator('.rmoc-disclosure'),
            `${state.id} details must be open`
          ).toHaveAttribute('open', '');
        } else if (expectedState.detailsOpen === false) {
          await expect(
            page.locator('.rmoc-disclosure'),
            `${state.id} details must stay closed`
          ).not.toHaveAttribute('open', '');
        }

        if (expectedState.aria && expectedState.aria['.ren-nav-toggle']) {
          await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute(
            'aria-expanded',
            expectedState.aria['.ren-nav-toggle']['aria-expanded']
          );
        }

        if (Array.isArray(expectedState.visible)) {
          for (const selector of expectedState.visible) {
            const target = page.locator(selector).first();
            await expect(target, `${state.id} expects visible ${selector}`).toBeVisible();
            if (expectedState.detailsOpen === true) {
              // Wait through enter opacity transition — not a mid-animation snapshot.
              await expect
                .poll(async () => target.evaluate((el) => {
                  const style = getComputedStyle(el);
                  const rect = el.getBoundingClientRect();
                  const opacity = Number.parseFloat(String(style.opacity || '1'));
                  return {
                    opacity: Number.isFinite(opacity) ? opacity : 1,
                    display: style.display,
                    visibility: style.visibility,
                    width: rect.width,
                    height: rect.height,
                  };
                }), { timeout: 4000, message: `${state.id} ${selector} paint settle` })
                .toEqual(expect.objectContaining({
                  opacity: expect.any(Number),
                  display: expect.not.stringMatching(/^none$/),
                  visibility: expect.not.stringMatching(/^hidden$/),
                }));
              await expect
                .poll(async () => target.evaluate((el) => {
                  const opacity = Number.parseFloat(String(getComputedStyle(el).opacity || '1'));
                  return Number.isFinite(opacity) ? opacity : 1;
                }), { timeout: 4000, message: `${state.id} ${selector} opacity≈1` })
                .toBeGreaterThanOrEqual(0.99);
              const paint = await target.evaluate((el) => {
                const style = getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return {
                  opacity: Number.parseFloat(String(style.opacity || '1')),
                  display: style.display,
                  visibility: style.visibility,
                  width: rect.width,
                  height: rect.height,
                };
              });
              expect(paint.opacity, `${state.id} ${selector} opacity`).toBeGreaterThanOrEqual(0.99);
              expect(paint.display, `${state.id} ${selector} display`).not.toBe('none');
              expect(paint.visibility, `${state.id} ${selector} visibility`).not.toBe('hidden');
              expect(paint.width, `${state.id} ${selector} width`).toBeGreaterThanOrEqual(1);
              expect(paint.height, `${state.id} ${selector} height`).toBeGreaterThanOrEqual(1);
            }
          }
        }
      }
    }
  });
});
