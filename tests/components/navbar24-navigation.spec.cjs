// @ts-check
/**
 * Navbar 24 — Product-Rail Mega Menu (nav-mega-menu-product-rail).
 * Isolated suite for the parallel Relume→Ren10 worker. Uses shared
 * tests/utils/static-server.cjs and tests/utils/block-quality.cjs without editing them.
 */
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');
const {
  expectAligned,
  expectNoOverflow,
  expectSingleVisibleAffordance,
  expectWidthRatio,
  inspectNativeChrome,
} = require('../utils/block-quality.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK_PATH = '/templates/blocks/nav-mega-menu-product-rail.html';
const ROOT = '[data-rmpr-root]';

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar24/render-matrix.json'),
    'utf8'
  )
);

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoProductRailBlock(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response, 'HTTP response for product-rail mega block').toBeTruthy();
  expect(
    response.status(),
    'navbar24 block must not 404 — implement templates/blocks/nav-mega-menu-product-rail.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-rmpr-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

test.describe('Navbar Mega Menu Product Rail (navbar24)', () => {
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

  test('block page loads with ren-nav shell and product-rail root', async ({ page }) => {
    await gotoProductRailBlock(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Product.?Rail Mega Menu|Navbar Mega Menu Product Rail|nav-mega-menu-product-rail/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rmpr-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('exactly one primary links tree serves desktop and mobile', async ({ page }) => {
    await gotoProductRailBlock(page, staticServer.origin);
    await expect(page.locator('#rmpr-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rmpr-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmpr-primary-links')).toBeVisible();
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
  });

  test('anatomy: four top entries, eight sublinks, one product, one intro CTA, two actions, one chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoProductRailBlock(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-brand`)).toHaveCount(1);
    await expect(page.locator('#rmpr-primary-links > li')).toHaveCount(4);

    const topLevelLinks = page.locator('#rmpr-primary-links > li > a.ren-nav-link');
    const megaSummaries = page.locator('#rmpr-primary-links > li > .rmpr-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(megaSummaries).toHaveCount(1);

    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`)
    ).toHaveCount(2);
    await expect(page.locator(`${ROOT} .ren-nav-actions .ren-btn-secondary`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-actions .ren-btn-primary`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveCount(1);

    await page.locator('.rmpr-disclosure > summary').click();
    await expect(page.locator('.rmpr-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmpr-panel')).toBeVisible();

    await expect(page.locator('.rmpr-intro')).toHaveCount(1);
    await expect(page.locator('.rmpr-intro-title')).toHaveCount(1);
    await expect(page.locator('.rmpr-intro-desc')).toHaveCount(1);
    await expect(page.locator('a.rmpr-intro-cta')).toHaveCount(1);
    await expect(page.locator('a.rmpr-sublink')).toHaveCount(8);
    await expect(page.locator('a.rmpr-product')).toHaveCount(1);
    await expect(page.locator('.rmpr-product-media')).toHaveCount(1);
    await expect(page.locator('.rmpr-product-name')).toHaveCount(1);
    await expect(page.locator('.rmpr-product-variant')).toHaveCount(1);
    await expect(page.locator('.rmpr-product-price')).toHaveCount(1);
    await expect(page.locator('.rmpr-product-badge')).toHaveCount(1);

    await expect(
      page.locator('.rmcg-card, .rmf-feature, .rmi-footer, .rml-rail, .rmnf-footer-band')
    ).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rmpr-disclosure summary .rmpr-chevron'],
      'product-rail mega-menu chevron'
    );
    await expect(page.locator('.rmpr-chevron')).toHaveCount(1);
  });

  test('product card is a single anchor without nested interactive descendants', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoProductRailBlock(page, staticServer.origin);
    await page.locator('.rmpr-disclosure > summary').click();

    const product = page.locator('a.rmpr-product');
    await expect(product).toHaveCount(1);
    const tagName = await product.evaluate((el) => el.tagName);
    expect(tagName).toBe('A');
    await expect(product).toHaveAttribute('href', /.+/);
    await expect(product.locator('a[href], button, [role="button"], summary')).toHaveCount(0);
  });

  test('summary opens by click, keyboard, and desktop pointer hover; Escape restores focus from destination', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoProductRailBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmpr-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rmpr-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rmpr-sublink').first()).toBeVisible();

    // Escape while focus is on a mega destination restores focus to summary.
    await page.locator('a.rmpr-sublink').first().focus();
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('rmpr-sublink'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');

    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rmpr-product').focus();
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');

    await summary.focus();
    await page.keyboard.press(' ');
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rmpr-intro-cta').focus();
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');

    // Hover open, corridor into panel, pin, close.
    await page.locator(`${ROOT} .ren-nav-brand`).hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();

    await panel.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rmpr-product')).toBeVisible();

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

  test('outside click and every destination class closes the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoProductRailBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmpr-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-brand`).click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rmpr-sublink').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rmpr-product').click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rmpr-intro-cta').click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile: sublink, product, and intro CTA close details and ren-nav shell; focus not left hidden', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1200 });
    await gotoProductRailBlock(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const disclosure = page.locator('.rmpr-disclosure');
    const renNav = page.locator(`${ROOT} ren-nav`);

    const destinations = [
      { name: 'sublink', selector: 'a.rmpr-sublink' },
      { name: 'product', selector: 'a.rmpr-product' },
      { name: 'intro CTA', selector: 'a.rmpr-intro-cta' },
    ];

    for (const dest of destinations) {
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await disclosure.locator('summary').click();
      await expect(disclosure).toHaveAttribute('open', '');

      const target = page.locator(dest.selector).first();
      await expect(target).toBeVisible();
      await target.focus();
      await target.click();

      await expect(disclosure, `${dest.name} closes details`).not.toHaveAttribute('open', '');
      await expect(toggle, `${dest.name} collapses ren-nav shell`).toHaveAttribute('aria-expanded', 'false');
      await expect(renNav).not.toHaveAttribute('data-open', '');

      // Hash/SPA: focus must not remain on a control inside the closed (hidden) tree.
      const focusState = await page.evaluate(() => {
        const active = document.activeElement;
        const links = document.querySelector('#rmpr-primary-links');
        const toggleEl = document.querySelector('[data-rmpr-root] .ren-nav-toggle');
        if (!active || !links || !toggleEl) return { ok: false, reason: 'missing' };
        const linksStyle = getComputedStyle(links);
        const linksHidden =
          linksStyle.display === 'none' || linksStyle.visibility === 'hidden';
        const inHiddenTree = linksHidden && links.contains(active);
        return {
          ok: !inHiddenTree,
          tag: active.tagName,
          cls: (active.className || '').toString().slice(0, 60),
          linksDisplay: linksStyle.display,
          activeIsToggle: active === toggleEl,
        };
      });
      expect(focusState.ok, `${dest.name} left focus in hidden tree: ${JSON.stringify(focusState)}`).toBe(
        true
      );
    }
  });

  test('block does not expose window.initNavMegaMenuProductRail global', async ({ page }) => {
    await gotoProductRailBlock(page, staticServer.origin);
    const hasGlobal = await page.evaluate(() => typeof window.initNavMegaMenuProductRail);
    expect(hasGlobal).toBe('undefined');
  });

  test('mobile toggle exposes the same tree and closes mega on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoProductRailBlock(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const disclosure = page.locator('.rmpr-disclosure');
    const summary = disclosure.locator('summary');

    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', 'rmpr-primary-links');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmpr-primary-links')).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rmpr-sublink').first()).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('breakpoint crossing closes open mega; same-breakpoint resize keeps state', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoProductRailBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmpr-disclosure');
    await page.locator('.rmpr-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    // Same-breakpoint resize: stay open.
    await page.setViewportSize({ width: 1100, height: 900 });
    await expect(disclosure).toHaveAttribute('open', '');
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(disclosure).toHaveAttribute('open', '');

    // Cross to mobile: close.
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rmpr-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    // Same mobile breakpoint resize: stay open.
    await page.setViewportSize({ width: 360, height: 844 });
    await expect(disclosure).toHaveAttribute('open', '');

    // Back to desktop: close and restore hover policy.
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    const summary = page.locator('.rmpr-disclosure > summary');
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-brand`).hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('breakpoint seams 767/768/769: real display/rect for toggle and links', async ({ page }) => {
    await gotoProductRailBlock(page, staticServer.origin);

    for (const width of [767, 768, 769]) {
      await page.setViewportSize({ width, height: 900 });
      // Force layout after resize so computed styles and rects are current.
      await page.evaluate(() => document.body.offsetHeight);

      const shell = await page.evaluate((w) => {
        const toggle = document.querySelector('[data-rmpr-root] .ren-nav-toggle');
        const links = document.querySelector('#rmpr-primary-links');
        const firstLink = document.querySelector('#rmpr-primary-links > li > a.ren-nav-link');
        if (!toggle || !links || !firstLink) return null;

        const toggleStyle = getComputedStyle(toggle);
        const linksStyle = getComputedStyle(links);
        const toggleRect = toggle.getBoundingClientRect();
        const linksRect = links.getBoundingClientRect();
        const firstLinkRect = firstLink.getBoundingClientRect();

        const toggleDisplay = toggleStyle.display;
        const linksDisplay = linksStyle.display;
        const toggleVisible =
          toggleDisplay !== 'none'
          && toggleStyle.visibility !== 'hidden'
          && toggleRect.width > 0
          && toggleRect.height > 0;
        const linksVisible =
          linksDisplay !== 'none'
          && linksStyle.visibility !== 'hidden'
          && linksRect.width > 0
          && linksRect.height > 0
          && firstLinkRect.width > 0
          && firstLinkRect.height > 0;

        const desktop = w >= 768;
        return {
          width: w,
          desktop,
          toggleDisplay,
          linksDisplay,
          toggleVisible,
          linksVisible,
          toggleW: Math.round(toggleRect.width),
          toggleH: Math.round(toggleRect.height),
          linksW: Math.round(linksRect.width),
          linksH: Math.round(linksRect.height),
          firstLinkW: Math.round(firstLinkRect.width),
          firstLinkH: Math.round(firstLinkRect.height),
          expectsToggle: !desktop,
          expectsLinks: desktop,
        };
      }, width);

      expect(shell, `shell metrics at ${width}`).toBeTruthy();
      expect(shell.toggleVisible, `toggle visible at ${width} (display=${shell.toggleDisplay})`).toBe(
        shell.expectsToggle
      );
      if (shell.desktop) {
        expect(shell.toggleDisplay, `toggle display none at ${width}`).toBe('none');
        expect(shell.linksVisible, `links visible at ${width} (display=${shell.linksDisplay})`).toBe(true);
        expect(shell.linksDisplay, `links display flex-ish at ${width}`).not.toBe('none');
        expect(shell.firstLinkW, `peer link hit width at ${width}`).toBeGreaterThanOrEqual(24);
        expect(shell.firstLinkH, `peer link hit height at ${width}`).toBeGreaterThanOrEqual(24);
      } else {
        expect(shell.toggleVisible, `toggle shown at ${width}`).toBe(true);
        expect(shell.toggleDisplay, `toggle display at ${width}`).not.toBe('none');
        expect(shell.toggleW, `toggle width at ${width}`).toBeGreaterThanOrEqual(44);
        expect(shell.toggleH, `toggle height at ${width}`).toBeGreaterThanOrEqual(44);
        // Closed mobile: links may be display:none until the shell opens.
        expect(shell.linksDisplay === 'none' || !shell.linksVisible, `closed mobile links at ${width}`).toBe(
          true
        );
      }
      await expectNoOverflow(page, 'html');
    }

    // JS coherence: matchMedia(min-width:48rem) matches desktop shell at 768/769.
    for (const width of [767, 768, 769]) {
      await page.setViewportSize({ width, height: 900 });
      const mq = await page.evaluate(() => window.matchMedia('(min-width: 48rem)').matches);
      expect(mq, `DESKTOP_MQ at ${width}`).toBe(width >= 768);
    }
  });

  test('JS-disabled mobile keeps the nav tree, actions, and mega destinations usable', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1200 },
    });
    const page = await context.newPage();
    await gotoProductRailBlock(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator('#rmpr-primary-links')).toBeVisible();
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`)
    ).toHaveCount(2);
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`).nth(0)
    ).toBeVisible();
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`).nth(1)
    ).toBeVisible();

    await page.locator('.rmpr-disclosure > summary').click();
    await expect(page.locator('.rmpr-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('a.rmpr-sublink')).toHaveCount(8);
    await expect(page.locator('a.rmpr-product')).toHaveCount(1);
    await expect(page.locator('a.rmpr-intro-cta')).toHaveCount(1);

    await context.close();
  });

  test('viewport geometry: desktop full-width panel under bar, mobile in-flow, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoProductRailBlock(page, staticServer.origin);
    await page.locator('.rmpr-disclosure > summary').click();
    await expect(page.locator('.rmpr-panel')).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rmpr-root] .ren-nav');
      const panel = document.querySelector('.rmpr-panel');
      const main = document.querySelector('.rmpr-main');
      const rail = document.querySelector('.rmpr-rail');
      if (!nav || !panel || !main || !rail) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const mainRect = main.getBoundingClientRect();
      const railRect = rail.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
        panelWidth: Math.round(panelRect.width),
        navWidth: Math.round(navRect.width),
        twoTrack:
          Math.abs(mainRect.top - railRect.top) < 80
          && railRect.left >= mainRect.right - 8
          && mainRect.width > railRect.width * 0.9,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    expect(desktop.panelWidth).toBeGreaterThanOrEqual(desktop.navWidth - 4);
    expect(desktop.twoTrack, 'desktop intro+sublinks track beside product rail').toBe(true);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoProductRailBlock(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rmpr-disclosure > summary').click();
    await expect(page.locator('.rmpr-panel')).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rmpr-panel');
      if (!panel) return null;
      return { position: getComputedStyle(panel).position };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    await expectNoOverflow(page, 'html');
  });

  test('narrow 320px and 340px: stacked mega usable without overflow', async ({ page }) => {
    for (const width of [320, 340]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoProductRailBlock(page, staticServer.origin);
      await page.locator(`${ROOT} .ren-nav-toggle`).click();
      await page.locator('.rmpr-disclosure > summary').click();
      await expect(page.locator('.rmpr-panel')).toBeVisible();
      await expect(page.locator('a.rmpr-sublink')).toHaveCount(8);
      await expect(page.locator('a.rmpr-product')).toBeVisible();
      await expectNoOverflow(page, 'html');
    }
  });

  test('tablet mid-width: two-column sublinks and readable product rail', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1200 });
    await gotoProductRailBlock(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await page.locator('.rmpr-disclosure > summary').click();
    await expect(page.locator('a.rmpr-sublink')).toHaveCount(8);
    await expect(page.locator('a.rmpr-product')).toHaveCount(1);

    const tablet = await page.evaluate(() => {
      const sublinks = Array.from(document.querySelectorAll('a.rmpr-sublink'));
      const product = document.querySelector('a.rmpr-product');
      if (sublinks.length < 2 || !product) return null;
      const s0 = sublinks[0].getBoundingClientRect();
      const s1 = sublinks[1].getBoundingClientRect();
      const twoUp = Math.abs(s0.top - s1.top) < 48 && s1.left >= s0.right - 4;
      const productR = product.getBoundingClientRect();
      return {
        twoUp,
        sublinkWidth: Math.round(s0.width),
        productWidth: Math.round(productR.width),
      };
    });
    expect(tablet).toBeTruthy();
    expect(tablet.twoUp, 'tablet sublinks form two columns when space allows').toBe(true);
    expect(tablet.sublinkWidth).toBeGreaterThanOrEqual(100);
    expect(tablet.productWidth).toBeGreaterThanOrEqual(120);
    await expectNoOverflow(page, 'html');
  });

  test('product media uses a portrait frame near 10:12', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoProductRailBlock(page, staticServer.origin);
    await page.locator('.rmpr-disclosure > summary').click();

    const ratio = await page.evaluate(() => {
      const media = document.querySelector('.rmpr-product-media');
      if (!media) return null;
      const r = media.getBoundingClientRect();
      if (r.height === 0) return null;
      return Number((r.width / r.height).toFixed(2));
    });
    expect(ratio).toBeTruthy();
    // 10/12 ≈ 0.833; allow a modest band for token/padding variance.
    expect(ratio).toBeGreaterThanOrEqual(0.7);
    expect(ratio).toBeLessThanOrEqual(1.05);
  });

  test('mobile top row is logo+toggle only; actions stack full-width when open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoProductRailBlock(page, staticServer.origin);

    const closed = await page.evaluate(() => {
      const brand = document.querySelector('[data-rmpr-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rmpr-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rmpr-root] .ren-nav-toggle');
      if (!brand || !actions || !toggle) return null;
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const actionsStyle = getComputedStyle(actions);
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
        toggleVisible: toggleRect.width > 0 && toggleRect.height > 0,
      };
    });
    expect(closed).toBeTruthy();
    expect(closed.actionVisible, 'closed mobile must not show actions in the permanent top row').toBe(false);
    expect(closed.toggleVisible).toBe(true);
    expect(Math.abs(closed.brandTop - closed.toggleTop)).toBeLessThanOrEqual(12);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    const opened = await page.evaluate(() => {
      const brand = document.querySelector('[data-rmpr-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rmpr-root] .ren-nav-actions');
      const links = document.querySelector('#rmpr-primary-links');
      const actionButtons = Array.from(
        document.querySelectorAll('[data-rmpr-root] .ren-nav-actions a, [data-rmpr-root] .ren-nav-actions .ren-btn')
      );
      if (!brand || !actions || !links || actionButtons.length < 2) return null;
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const firstRect = actionButtons[0].getBoundingClientRect();
      const secondRect = actionButtons[1].getBoundingClientRect();
      return {
        actionsNotTopRow: Math.abs(brandRect.top - actionsRect.top) > 12,
        actionsBelowLinks: actionsRect.top >= linksRect.bottom - 4,
        firstFullWidth: Math.abs(firstRect.width - linksRect.width) <= 8,
        secondFullWidth: Math.abs(secondRect.width - linksRect.width) <= 8,
        stacked: secondRect.top >= firstRect.bottom - 2,
      };
    });
    expect(opened).toBeTruthy();
    expect(opened.actionsNotTopRow).toBe(true);
    expect(opened.actionsBelowLinks).toBe(true);
    expect(opened.firstFullWidth).toBe(true);
    expect(opened.secondFullWidth).toBe(true);
    expect(opened.stacked).toBe(true);
  });

  test('desktop chrome: single chevron, neutral details, aligned top-level peers', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoProductRailBlock(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rmpr-disclosure summary .rmpr-chevron'],
      'product-rail desktop chevron'
    );

    const peerLinks = page.locator('#rmpr-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rmpr-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rmpr-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rmpr-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rmpr-disclosure > summary');
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none'
      || afterContent === ''
      || summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);
  });

  test('mobile rows: full-width peers, one chevron, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoProductRailBlock(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rmpr-disclosure > summary').click();
    await expect(page.locator('.rmpr-panel')).toBeVisible();

    const firstPeer = page.locator('#rmpr-primary-links > li > a.ren-nav-link').first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, '#rmpr-primary-links', 0.92, 1.05);
    await expectWidthRatio(page, '.rmpr-disclosure > summary', '#rmpr-primary-links', 0.92, 1.05);
    await expectSingleVisibleAffordance(
      page,
      ['.rmpr-disclosure summary .rmpr-chevron'],
      'mobile product-rail chevron'
    );
    await expectNoOverflow(page, 'html');
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1200 },
    });
    const page = await context.newPage();
    await gotoProductRailBlock(page, staticServer.origin);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rmpr-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rmpr-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, a.rmpr-sublink, a.rmpr-product, a.rmpr-intro-cta'
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
    await gotoProductRailBlock(page, staticServer.origin);
    await page.locator('.rmpr-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rmpr-panel', '.rmpr-chevron', 'a.rmpr-sublink', 'a.rmpr-product'];
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
      await gotoProductRailBlock(page, staticServer.origin);

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

  test('navbar24 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoProductRailBlock(page, staticServer.origin);
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
    await gotoProductRailBlock(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rmpr-root] .ren-nav');
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
