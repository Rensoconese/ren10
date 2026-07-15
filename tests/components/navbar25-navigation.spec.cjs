// @ts-check
/**
 * Navbar 25 — Mega Menu Categories Promo (nav-mega-menu-categories-promo).
 *
 * Isolated suite (does not edit shared blocks-navigation.spec.cjs).
 * Phase A RED: implementation file is intentionally absent until tests fail
 * for missing anatomy / page.
 *
 * Defining anatomy: full-width bar; four top entries (3 plain + 1 mega);
 * two category groups × five title-only destinations; promo (title, description,
 * CTA, square media); two header actions; one toggle; one chevron.
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
const BLOCK_PATH = '/templates/blocks/nav-mega-menu-categories-promo.html';
const ROOT = '[data-rn25-root]';

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RN25_RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar25/render-matrix.json'),
    'utf8'
  )
);

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar25Block(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response, 'HTTP response for categories-promo mega block').toBeTruthy();
  expect(
    response.status(),
    'navbar25 block must not 404 — implement templates/blocks/nav-mega-menu-categories-promo.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-rn25-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

test.describe('Navbar Mega Menu Categories Promo (navbar25)', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  test.use({ actionTimeout: 3000, navigationTimeout: 10000 });
  test.describe.configure({ timeout: 20000 });

  test.beforeAll(async () => {
    staticServer = await startStaticServer(PKG_ROOT);
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('block page loads with ren-nav shell and navbar25 root', async ({ page }) => {
    await gotoNavbar25Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Categories Promo|Navbar 25|nav-mega-menu-categories-promo|Mega Menu Categories/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rn25-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('exactly one primary links tree serves desktop and mobile', async ({ page }) => {
    await gotoNavbar25Block(page, staticServer.origin);
    await expect(page.locator('#rn25-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rn25-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn25-primary-links')).toBeVisible();
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
  });

  test('anatomy: four top entries, two groups of five, promo, two actions, one toggle, one chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar25Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-brand`)).toHaveCount(1);
    await expect(page.locator('#rn25-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rn25-primary-links > li > a.ren-nav-link');
    const megaSummaries = page.locator('#rn25-primary-links > li > .rn25-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(megaSummaries).toHaveCount(1);

    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`)
    ).toHaveCount(2);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveCount(1);

    await page.locator('.rn25-disclosure > summary').click();
    await expect(page.locator('.rn25-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rn25-panel')).toBeVisible();

    await expect(page.locator('.rn25-layout.ren-with-sidebar')).toHaveCount(1);
    await expect(page.locator('.rn25-group')).toHaveCount(2);
    await expect(page.locator('.rn25-group-title')).toHaveCount(2);
    await expect(page.locator('a.rn25-destination')).toHaveCount(10);
    await expect(page.locator('.rn25-group').nth(0).locator('a.rn25-destination')).toHaveCount(5);
    await expect(page.locator('.rn25-group').nth(1).locator('a.rn25-destination')).toHaveCount(5);

    await expect(page.locator('.rn25-promo')).toHaveCount(1);
    await expect(page.locator('.rn25-promo-title')).toHaveCount(1);
    await expect(page.locator('.rn25-promo-desc')).toHaveCount(1);
    await expect(page.locator('a.rn25-promo-cta')).toHaveCount(1);
    await expect(page.locator('.rn25-promo-media.ren-frame')).toHaveCount(1);

    await expect(
      page.locator(
        `${ROOT} .rmcg-card, ${ROOT} .rmf-feature, ${ROOT} .rmi-footer, ${ROOT} .rn16-social-link, ${ROOT} .rn23-product, ${ROOT} .ren-menu, ${ROOT} .ren-popover`
      )
    ).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rn25-disclosure summary .rn25-chevron'],
      'navbar25 categories-promo mega chevron'
    );
    await expect(page.locator('.rn25-chevron')).toHaveCount(1);
  });

  test('category destinations are whole title-only anchors without icons or descriptions', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar25Block(page, staticServer.origin);
    await page.locator('.rn25-disclosure > summary').click();

    const links = page.locator('a.rn25-destination');
    await expect(links).toHaveCount(10);

    for (let i = 0; i < 10; i += 1) {
      const link = links.nth(i);
      const tagName = await link.evaluate((el) => el.tagName);
      expect(tagName, `destination ${i} tag`).toBe('A');
      await expect(link).toHaveAttribute('href', /.+/);
      const text = (await link.innerText()).trim();
      expect(text.length, `destination ${i} title text`).toBeGreaterThan(0);
      await expect(link.locator('a[href], button, [role="button"], .ren-icon, img, p, small')).toHaveCount(0);
    }

    await expect(page.locator('.rn25-dest-desc, .rn25-destination-icon')).toHaveCount(0);
  });

  test('promo CTA is a real control and media has no nested interactive descendants', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar25Block(page, staticServer.origin);
    await page.locator('.rn25-disclosure > summary').click();

    const cta = page.locator('a.rn25-promo-cta');
    await expect(cta).toHaveCount(1);
    await expect(cta).toHaveAttribute('href', /.+/);
    await expect(cta.locator('a[href], button, [role="button"]')).toHaveCount(0);

    const media = page.locator('.rn25-promo-media');
    await expect(media).toHaveCount(1);
    await expect(media.locator('a[href], button, [role="button"]')).toHaveCount(0);
  });

  test('summary opens by click, keyboard, and desktop pointer hover; click pins; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar25Block(page, staticServer.origin);

    const disclosure = page.locator('.rn25-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rn25-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rn25-destination').first()).toBeVisible();

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
    await expect(page.locator('a.rn25-destination').first()).toBeVisible();

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
    await gotoNavbar25Block(page, staticServer.origin);

    const disclosure = page.locator('.rn25-disclosure');
    const summary = disclosure.locator('summary');
    const category = page.locator('a.rn25-destination').first();
    const promoCta = page.locator('a.rn25-promo-cta');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await category.focus();
    await expect(category).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect(summary).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await promoCta.focus();
    await expect(promoCta).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect(summary).toBeFocused();
  });

  test('outside click and every destination class close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar25Block(page, staticServer.origin);

    const disclosure = page.locator('.rn25-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-brand`).click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    // Promo CTA destination class.
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rn25-promo-cta').click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    // Category destination class (sample several indices across both groups).
    for (const index of [0, 4, 5, 9]) {
      await summary.click();
      await expect(disclosure).toHaveAttribute('open', '');
      await page.locator('a.rn25-destination').nth(index).click();
      await expect(disclosure, `category ${index} must close mega`).not.toHaveAttribute('open', '');
    }

    // Header action destinations close the open mega.
    for (let i = 0; i < 2; i += 1) {
      await summary.click();
      await expect(disclosure).toHaveAttribute('open', '');
      await page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`).nth(i).click();
      await expect(disclosure, `header action ${i} must close mega`).not.toHaveAttribute('open', '');
    }
  });

  test('mobile toggle exposes the same tree and closes mega on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar25Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const disclosure = page.locator('.rn25-disclosure');
    const summary = disclosure.locator('summary');

    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', 'rn25-primary-links');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn25-primary-links')).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rn25-destination').first()).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('breakpoint crossing closes an open dropdown and resets interaction policy', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar25Block(page, staticServer.origin);

    const disclosure = page.locator('.rn25-disclosure');
    await page.locator('.rn25-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rn25-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    const summary = page.locator('.rn25-disclosure > summary');
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-brand`).hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('same-breakpoint resize keeps an open mega stable within the desktop band', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar25Block(page, staticServer.origin);

    const disclosure = page.locator('.rn25-disclosure');
    await page.locator('.rn25-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rn25-panel')).toBeVisible();

    await page.setViewportSize({ width: 1024, height: 900 });
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rn25-destination')).toHaveCount(10);
    await expect(page.locator('a.rn25-promo-cta')).toBeVisible();

    await page.setViewportSize({ width: 900, height: 900 });
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rn25-panel')).toBeVisible();
  });

  test('48rem seam: 767/768 mobile shell and 769 desktop shell agree with ren-nav', async ({ page }) => {
    /**
     * ren-nav base CSS uses max-width: 48rem for mobile. Block desktop CSS/JS
     * starts at 48.01rem so 768 stays activation-only mobile.
     */
    await gotoNavbar25Block(page, staticServer.origin);

    /**
     * @param {import('@playwright/test').Page} p
     * @param {number} width
     */
    async function shellAt(p, width) {
      await p.setViewportSize({ width, height: 900 });
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      return p.evaluate((w) => {
        const toggle = document.querySelector('[data-rn25-root] .ren-nav-toggle');
        const links = document.querySelector('#rn25-primary-links');
        if (!toggle || !links) return null;
        const toggleStyle = getComputedStyle(toggle);
        const linksStyle = getComputedStyle(links);
        const toggleRect = toggle.getBoundingClientRect();
        const linksRect = links.getBoundingClientRect();
        return {
          width: w,
          renNavMobileMq: window.matchMedia('(max-width: 48rem)').matches,
          desktopMq: window.matchMedia('(min-width: 48.01rem)').matches,
          toggleDisplay: toggleStyle.display,
          linksDisplay: linksStyle.display,
          toggleVisible:
            toggleStyle.display !== 'none'
            && toggleStyle.visibility !== 'hidden'
            && toggleRect.width > 0
            && toggleRect.height > 0,
          linksVisible:
            linksStyle.display !== 'none'
            && linksStyle.visibility !== 'hidden'
            && linksRect.width > 0
            && linksRect.height > 0,
        };
      }, width);
    }

    const at767 = await shellAt(page, 767);
    expect(at767).toBeTruthy();
    expect(at767.width).toBe(767);
    expect(at767.renNavMobileMq, '767 is ren-nav mobile band').toBe(true);
    expect(at767.desktopMq, '767 is not block desktop').toBe(false);
    expect(at767.toggleVisible, '767 toggle visible').toBe(true);
    expect(at767.linksVisible, '767 links hidden until toggle').toBe(false);

    const at768 = await shellAt(page, 768);
    expect(at768).toBeTruthy();
    expect(at768.width).toBe(768);
    expect(at768.renNavMobileMq, '768 is ren-nav mobile (max-width: 48rem)').toBe(true);
    expect(at768.desktopMq, '768 must not match block desktop MQ').toBe(false);
    expect(at768.toggleVisible, '768 toggle remains flex/visible').toBe(true);
    expect(at768.linksVisible, '768 links remain hidden until open').toBe(false);
    expect(at768.toggleDisplay).toBe('flex');
    expect(at768.linksDisplay).toBe('none');

    const disclosure = page.locator('.rn25-disclosure');
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await page.locator('.rn25-disclosure > summary').hover({ force: true });
    await page.waitForTimeout(100);
    await expect(disclosure).not.toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-toggle`).click();

    const at769 = await shellAt(page, 769);
    expect(at769).toBeTruthy();
    expect(at769.width).toBe(769);
    expect(at769.renNavMobileMq, '769 leaves ren-nav mobile band').toBe(false);
    expect(at769.desktopMq, '769 is block desktop').toBe(true);
    expect(at769.toggleVisible, '769 toggle hidden').toBe(false);
    expect(at769.linksVisible, '769 links visible in horizontal shell').toBe(true);
  });

  test('narrow 320 and 340 viewports keep a full 44px toggle with no root/html overflow', async ({ page }) => {
    for (const width of [320, 340]) {
      await page.setViewportSize({ width, height: 640 });
      await gotoNavbar25Block(page, staticServer.origin);

      const metrics = await page.evaluate(() => {
        const root = document.querySelector('[data-rn25-root]');
        const toggle = document.querySelector('[data-rn25-root] .ren-nav-toggle');
        const brand = document.querySelector('[data-rn25-root] .ren-nav-brand');
        const nav = document.querySelector('[data-rn25-root] .ren-nav');
        if (!root || !toggle || !brand || !nav) return null;

        const toggleRect = toggle.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        const style = getComputedStyle(toggle);
        const html = document.documentElement;
        const body = document.body;

        return {
          toggleWidth: toggleRect.width,
          toggleHeight: toggleRect.height,
          toggleVisible:
            style.display !== 'none'
            && style.visibility !== 'hidden'
            && toggleRect.width > 0
            && toggleRect.height > 0,
          toggleFullyInNav:
            toggleRect.left >= navRect.left - 0.5
            && toggleRect.right <= navRect.right + 0.5,
          brandVisible: brand.getBoundingClientRect().width > 0,
          htmlOverflowX: html.scrollWidth - html.clientWidth,
          bodyOverflowX: body.scrollWidth - body.clientWidth,
          rootOverflowX: root.scrollWidth - root.clientWidth,
        };
      });

      expect(metrics, `metrics at ${width}px`).toBeTruthy();
      expect(metrics.toggleVisible, `${width}px toggle visible`).toBe(true);
      expect(metrics.toggleWidth, `${width}px toggle width ≥ 44`).toBeGreaterThanOrEqual(44);
      expect(metrics.toggleHeight, `${width}px toggle height ≥ 44`).toBeGreaterThanOrEqual(44);
      expect(metrics.toggleFullyInNav, `${width}px toggle fully inside nav bar`).toBe(true);
      expect(metrics.brandVisible, `${width}px brand remains present`).toBe(true);
      expect(metrics.htmlOverflowX, `${width}px html overflow-x`).toBeLessThanOrEqual(1);
      expect(metrics.bodyOverflowX, `${width}px body overflow-x`).toBeLessThanOrEqual(1);
      expect(metrics.rootOverflowX, `${width}px root overflow-x`).toBeLessThanOrEqual(1);
      await expectNoOverflow(page, 'html');

      await page.locator(`${ROOT} .ren-nav-toggle`).click();
      await page.locator('.rn25-disclosure > summary').click();
      await expect(page.locator('a.rn25-destination')).toHaveCount(10);
      await expectNoOverflow(page, 'html');
    }
  });

  test('JS-disabled mobile keeps the nav tree, both actions, and native disclosure usable', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar25Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator('#rn25-primary-links')).toBeVisible();
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`)
    ).toHaveCount(2);
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`).nth(0)
    ).toBeVisible();
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`).nth(1)
    ).toBeVisible();

    await page.locator('.rn25-disclosure > summary').click();
    await expect(page.locator('.rn25-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('a.rn25-destination')).toHaveCount(10);
    await expect(page.locator('a.rn25-promo-cta')).toBeVisible();
    await expect(page.locator('.rn25-promo-title')).toBeVisible();

    await context.close();
  });

  test('viewport geometry: desktop full-band panel under bar, mobile in-flow, no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar25Block(page, staticServer.origin);
    await page.locator('.rn25-disclosure > summary').click();
    await expect(page.locator('.rn25-panel')).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rn25-root] .ren-nav');
      const panel = document.querySelector('.rn25-panel');
      const categories = document.querySelector('.rn25-categories');
      const promo = document.querySelector('.rn25-promo');
      if (!nav || !panel || !categories || !promo) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const catRect = categories.getBoundingClientRect();
      const promoRect = promo.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
        panelWidth: Math.round(panelRect.width),
        navWidth: Math.round(navRect.width),
        categoriesWidth: Math.round(catRect.width),
        promoWidth: Math.round(promoRect.width),
        categoriesNarrower: catRect.width < promoRect.width * 0.95,
        sideBySide:
          Math.abs(catRect.top - promoRect.top) < 80
          && catRect.right <= promoRect.left + 12,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    expect(
      Math.abs(desktop.panelWidth - desktop.navWidth),
      'desktop mega spans the bar band'
    ).toBeLessThanOrEqual(24);
    expect(desktop.categoriesNarrower, 'category region not wider than promo').toBe(true);
    expect(desktop.sideBySide, 'desktop categories beside promo').toBe(true);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar25Block(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rn25-disclosure > summary').click();
    await expect(page.locator('.rn25-panel')).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rn25-panel');
      if (!panel) return null;
      return { position: getComputedStyle(panel).position };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    await expectNoOverflow(page, 'html');
  });

  test('tablet uses desktop shell; mobile top row is logo+toggle only with both actions inside the open panel', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoNavbar25Block(page, staticServer.origin);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator('#rn25-primary-links')).toBeVisible();
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`)
    ).toHaveCount(2);
    await page.locator('.rn25-disclosure > summary').click();
    await expect(page.locator('a.rn25-destination')).toHaveCount(10);
    await expect(page.locator('a.rn25-promo-cta')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar25Block(page, staticServer.origin);

    const closed = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn25-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rn25-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rn25-root] .ren-nav-toggle');
      const links = document.querySelector('#rn25-primary-links');
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
        toggleVisible: toggleRect.width > 0 && toggleRect.height > 0,
        linksBelowTopRow:
          linksRect.top >= Math.max(brandRect.bottom, toggleRect.bottom) - 4
          || linksStyle.display === 'none'
          || linksStyle.visibility === 'hidden',
      };
    });
    expect(closed).toBeTruthy();
    expect(closed.actionVisible, 'closed mobile must not show actions in the permanent top row').toBe(false);
    expect(closed.toggleVisible, 'mobile toggle is present in the chrome row').toBe(true);
    expect(Math.abs(closed.brandTop - closed.toggleTop), 'brand and toggle share top row').toBeLessThanOrEqual(12);
    expect(closed.linksBelowTopRow, 'navigation tree is not inlined into the top row when closed').toBe(true);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator('#rn25-primary-links')).toBeVisible();
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`)
    ).toHaveCount(2);

    const opened = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn25-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rn25-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rn25-root] .ren-nav-toggle');
      const links = document.querySelector('#rn25-primary-links');
      const actionButtons = Array.from(
        document.querySelectorAll('[data-rn25-root] .ren-nav-actions a, [data-rn25-root] .ren-nav-actions .ren-btn')
      );
      if (!brand || !actions || !toggle || !links || actionButtons.length < 2) return null;
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const firstRect = actionButtons[0].getBoundingClientRect();
      const secondRect = actionButtons[1].getBoundingClientRect();
      return {
        toggleStillTop: Math.abs(brandRect.top - toggleRect.top) <= 12,
        actionsNotTopRow: Math.abs(brandRect.top - actionsRect.top) > 12,
        linksBelowToggle: linksRect.top >= Math.max(brandRect.bottom, toggleRect.bottom) - 4,
        actionsBelowLinks: actionsRect.top >= linksRect.bottom - 4,
        firstFullWidth: Math.abs(firstRect.width - linksRect.width) <= 8,
        secondFullWidth: Math.abs(secondRect.width - linksRect.width) <= 8,
        stacked: secondRect.top >= firstRect.bottom - 2,
      };
    });
    expect(opened).toBeTruthy();
    expect(opened.toggleStillTop, 'opened mobile keeps toggle in top row').toBe(true);
    expect(opened.actionsNotTopRow, 'opened mobile keeps actions out of the permanent top row').toBe(true);
    expect(opened.linksBelowToggle, 'opened mobile stacks the tree under logo+toggle').toBe(true);
    expect(opened.actionsBelowLinks, 'both actions sit inside the panel below the link tree').toBe(true);
    expect(opened.firstFullWidth, 'first action is full-width in the open panel').toBe(true);
    expect(opened.secondFullWidth, 'second action is full-width in the open panel').toBe(true);
    expect(opened.stacked, 'both actions stack vertically inside the open panel').toBe(true);
  });

  test('promo media uses approximately square frames with cover crop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar25Block(page, staticServer.origin);
    await page.locator('.rn25-disclosure > summary').click();
    await expect(page.locator('.rn25-panel')).toBeVisible();

    const mediaAudit = await page.evaluate(() => {
      const frame = document.querySelector('.rn25-promo-media');
      if (!frame) return null;
      const rect = frame.getBoundingClientRect();
      const style = getComputedStyle(frame);
      const ratio = rect.height > 0 ? rect.width / rect.height : 0;
      const img = frame.querySelector('img');
      const imgStyle = img ? getComputedStyle(img) : null;
      return {
        ratio: Number(ratio.toFixed(2)),
        aspectRatio: style.aspectRatio,
        objectFit: imgStyle?.objectFit || '',
        hasRenFrame: frame.classList.contains('ren-frame'),
      };
    });

    expect(mediaAudit).toBeTruthy();
    expect(mediaAudit.hasRenFrame, 'promo media ren-frame').toBe(true);
    expect(mediaAudit.ratio, `square-ish box ratio ${mediaAudit.ratio}`).toBeGreaterThanOrEqual(0.85);
    expect(mediaAudit.ratio, `square-ish box ratio ${mediaAudit.ratio}`).toBeLessThanOrEqual(1.15);
    const aspect = String(mediaAudit.aspectRatio || '');
    expect(
      aspect.includes('1') || aspect.includes('square') || aspect === 'auto',
      `promo aspect-ratio ${aspect}`
    ).toBe(true);
    expect(mediaAudit.objectFit, 'promo object-fit').toBe('cover');
  });

  test('desktop chrome: single chevron, neutral details, aligned top-level peers', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar25Block(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rn25-disclosure summary .rn25-chevron'],
      'navbar25 desktop chevron'
    );

    const peerLinks = page.locator('#rn25-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rn25-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rn25-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rn25-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rn25-disclosure > summary');
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none'
      || afterContent === ''
      || summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);

    const markerContent = String(summaryChrome.markerContent || 'none').replace(/['"]/g, '');
    expect(
      markerContent === 'none' || markerContent === '' || summaryChrome.markerDisplay === 'none',
      'summary marker'
    ).toBeTruthy();

    await expect(page.locator('.rn25-disclosure summary .rn25-chevron')).toHaveCount(1);

    await page.locator('.rn25-disclosure > summary').click();
    await expect(page.locator('.rn25-disclosure')).toHaveAttribute('open', '');
    const openChrome = await page.evaluate(() => {
      const summary = document.querySelector('.rn25-disclosure > summary');
      if (!summary) return null;
      const ss = getComputedStyle(summary);
      return {
        marginBottom: ss.marginBottom,
        borderBottomWidth: ss.borderBottomWidth,
        borderBottomStyle: ss.borderBottomStyle,
      };
    });
    expect(openChrome).toBeTruthy();
    expect(openChrome.marginBottom).toBe('0px');
    expect(
      openChrome.borderBottomStyle === 'none' || openChrome.borderBottomWidth === '0px',
      'open summary divider'
    ).toBeTruthy();
  });

  test('mobile rows: full-width peers, one chevron, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar25Block(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rn25-disclosure > summary').click();
    await expect(page.locator('.rn25-panel')).toBeVisible();

    const firstPeer = page.locator('#rn25-primary-links > li > a.ren-nav-link').first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, '#rn25-primary-links', 0.92, 1.05);
    await expectWidthRatio(page, '.rn25-disclosure > summary', '#rn25-primary-links', 0.92, 1.05);
    await expectSingleVisibleAffordance(
      page,
      ['.rn25-disclosure summary .rn25-chevron'],
      'mobile navbar25 chevron'
    );
    await expectNoOverflow(page, 'html');
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1400 },
    });
    const page = await context.newPage();
    await gotoNavbar25Block(page, staticServer.origin);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rn25-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rn25-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, a.rn25-destination, a.rn25-promo-cta'
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
    await gotoNavbar25Block(page, staticServer.origin);
    await page.locator('.rn25-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rn25-panel', '.rn25-chevron', 'a.rn25-destination', 'a.rn25-promo-cta'];
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
    for (const state of RN25_RENDER_MATRIX.states) {
      if (!state.javaScript) continue;

      if (state.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }

      await page.setViewportSize(state.viewport);
      await gotoNavbar25Block(page, staticServer.origin);

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

  test('navbar25 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoNavbar25Block(page, staticServer.origin);
    await page.locator('.rn25-disclosure > summary').click();
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
    await gotoNavbar25Block(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rn25-root] .ren-nav');
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
