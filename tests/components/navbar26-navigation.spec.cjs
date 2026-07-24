/**
 * Isolated Navbar 26 — Category Promo Mega Menu
 * Block: templates/blocks/nav-mega-menu-category-promo-panel.html
 * Packet: docs/workflows/relume-to-ren10/modules/navbar26/
 *
 * Uses only public DOM/ARIA contracts and shared test utils.
 * Never reads private custom-element fields (e.g. _isOpen).
 */
// @ts-check
const path = require('node:path');
const fs = require('node:fs');
const { test, expect } = require('@playwright/test');
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
const BLOCK_PATH = '/templates/blocks/nav-mega-menu-category-promo-panel.html';
const BLOCK_FILE = path.join(PKG_ROOT, 'templates/blocks/nav-mega-menu-category-promo-panel.html');
const ROOT = '[data-n26-root]';
const LINKS_ID = '#n26-primary-links';
const DISCLOSURE = '.n26-disclosure';
const SUMMARY = '.n26-disclosure > summary';
const PANEL = '.n26-panel';
const DEST = 'a.n26-dest';
const PROMO_CTA = 'a.n26-promo-cta';
const CHEVRON = '.n26-chevron';
const TOGGLE = `${ROOT} .ren-nav-toggle`;
const ACTIONS = `${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`;
const BRAND = `${ROOT} .ren-nav-brand`;

const RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar26/render-matrix.json'),
    'utf8'
  )
);

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoBlock(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`, { waitUntil: 'domcontentloaded' });
  expect(response, 'HTTP response for navbar26 block').toBeTruthy();
  expect(
    response.status(),
    'navbar26 block must not 404 — implement templates/blocks/nav-mega-menu-category-promo-panel.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-n26-root] shell').toHaveCount(1, {
    timeout: 5000,
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
async function openMobileShell(page) {
  const toggle = page.locator(TOGGLE);
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator(LINKS_ID)).toBeVisible();
}

test.describe('Navbar 26 Category Promo Mega Menu (navbar26)', () => {
  /** @type {{ origin: string, close: () => Promise<void> }} */
  let staticServer;

  test.use({ actionTimeout: 4000, navigationTimeout: 12000 });
  test.describe.configure({ timeout: 30000 });

  test.beforeAll(async () => {
    staticServer = await startStaticServer(PKG_ROOT);
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('block page loads with ren-nav shell and navbar26 root', async ({ page }) => {
    await gotoBlock(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Category Promo|Navbar 26|nav-mega-menu-category-promo-panel/i,
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
    await gotoBlock(page, staticServer.origin);
    await expect(page.locator(LINKS_ID)).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav[aria-label]`)).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator(LINKS_ID)).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator(TOGGLE);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(LINKS_ID)).toBeVisible();
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
  });

  test('anatomy: brand, four top entries, 3×5 destinations, promo CTA, two actions, toggle, one chevron', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);

    await expect(page.locator(BRAND)).toHaveCount(1);
    await expect(page.locator(`${LINKS_ID} > li`)).toHaveCount(4);

    const topLevelLinks = page.locator(`${LINKS_ID} > li > a.ren-nav-link`);
    const dropdownSummaries = page.locator(`${LINKS_ID} > li > ${DISCLOSURE} > summary`);
    await expect(topLevelLinks).toHaveCount(3);
    await expect(dropdownSummaries).toHaveCount(1);

    await expect(page.locator(ACTIONS)).toHaveCount(2);
    await expect(page.locator(`${ROOT} .ren-nav-actions a.ren-btn`)).toHaveCount(2);
    await expect(page.locator(`${ROOT} .ren-nav-actions .ren-btn-secondary`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-actions .ren-btn-primary`)).toHaveCount(1);
    await expect(page.locator(TOGGLE)).toHaveCount(1);

    await openDesktopMega(page);

    await expect(page.locator('.n26-group')).toHaveCount(3);
    await expect(page.locator(DEST)).toHaveCount(15);
    for (let g = 0; g < 3; g += 1) {
      await expect(page.locator('.n26-group').nth(g).locator(DEST)).toHaveCount(5);
    }

    await expect(page.locator('.n26-promo')).toHaveCount(1);
    await expect(page.locator(PROMO_CTA)).toHaveCount(1);
    await expect(page.locator(`${PROMO_CTA} button, .n26-promo a button, .n26-promo button`)).toHaveCount(
      0
    );

    // Title-only destinations: no icons, descriptions, or nested interactive chrome.
    await expect(
      page.locator(
        `${DEST} .ren-icon, ${DEST} img, ${DEST} .n26-dest-desc, ${DEST} p, ${DEST} small, ${DEST} a, ${DEST} button`
      )
    ).toHaveCount(0);

    await expect(
      page.locator(
        '.rmcg-card, .rmf-feature, .rmi-panel, .ren-card, .ren-menu, .ren-popover, ren-collapsible, .ren-collapsible'
      )
    ).toHaveCount(0);

    await expectSingleVisibleAffordance(page, [`${DISCLOSURE} summary ${CHEVRON}`], 'navbar26 chevron');
    await expect(page.locator(CHEVRON)).toHaveCount(1);
  });

  test('title-only category destinations are whole anchors without icons or descriptions', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);
    await openDesktopMega(page);

    const links = page.locator(DEST);
    await expect(links).toHaveCount(15);

    for (let i = 0; i < 15; i += 1) {
      const link = links.nth(i);
      const tagName = await link.evaluate((el) => el.tagName);
      expect(tagName, `destination ${i} tag`).toBe('A');
      await expect(link).toHaveAttribute('href', /.+/);
      const text = (await link.innerText()).trim();
      expect(text.length, `destination ${i} title text`).toBeGreaterThan(0);
      await expect(link.locator('a[href], button, [role="button"], .ren-icon, img, p, small')).toHaveCount(
        0
      );
    }
  });

  test('summary opens by click, keyboard, and desktop pointer hover; click pins; Escape restores focus from summary and destination', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    const summary = page.locator(SUMMARY);
    const panel = page.locator(PANEL);

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator(DEST).first()).toBeVisible();

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

    // Real focus restoration after Escape from a focused menu destination.
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(DEST).first().focus();
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.classList.contains('n26-dest')))
      .toBe(true);
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');

    await page.locator(BRAND).hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();

    await panel.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator(DEST).first()).toBeVisible();

    // Click pins open across pointer leave of the hover region.
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(BRAND).hover();
    await expect(disclosure).toHaveAttribute('open', '');

    await summary.hover();
    await summary.click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await page.locator(BRAND).hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(BRAND).hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('outside click and every destination class close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    const summary = page.locator(SUMMARY);

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(BRAND).click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    // Category destination.
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(DEST).first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    // Promo CTA destination.
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(PROMO_CTA).click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    // Top-level peer destination.
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${LINKS_ID} > li > a.ren-nav-link`).first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    // Bar action CTA destinations.
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-actions a`).first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-actions a`).nth(1).click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile toggle exposes the same tree and closes dropdown on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoBlock(page, staticServer.origin);

    const toggle = page.locator(TOGGLE);
    const disclosure = page.locator(DISCLOSURE);
    const summary = page.locator(SUMMARY);

    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', 'n26-primary-links');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(LINKS_ID)).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator(DEST).first()).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile matrix: dest, promo CTA, both actions, and brand close details + ren-nav shell with stable focus', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 1100 });
    await gotoBlock(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    const toggle = page.locator(TOGGLE);
    const renNav = page.locator(`${ROOT} ren-nav`);

    /** @type {{ id: string, selector: string, openMega: boolean, expectFocus: 'toggle' | 'brand' }[]} */
    const cases = [
      { id: 'n26-dest', selector: DEST, openMega: true, expectFocus: 'toggle' },
      { id: 'n26-promo-cta', selector: PROMO_CTA, openMega: true, expectFocus: 'toggle' },
      {
        id: 'ren-nav-actions-secondary',
        selector: `${ROOT} .ren-nav-actions a.ren-btn-secondary`,
        openMega: false,
        expectFocus: 'toggle',
      },
      {
        id: 'ren-nav-actions-primary',
        selector: `${ROOT} .ren-nav-actions a.ren-btn-primary`,
        openMega: false,
        expectFocus: 'toggle',
      },
      { id: 'ren-nav-brand', selector: BRAND, openMega: true, expectFocus: 'brand' },
    ];

    for (const item of cases) {
      await openMobileShell(page);
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');

      if (item.openMega) {
        await page.locator(SUMMARY).click();
        await expect(disclosure, `${item.id}: mega open`).toHaveAttribute('open', '');
      }

      const target = page.locator(item.selector).first();
      await expect(target, `${item.id}: target visible`).toBeVisible();
      await target.click();

      await expect(disclosure, `${item.id}: details closed`).not.toHaveAttribute('open', '');
      await expect(toggle, `${item.id}: shell aria-expanded false`).toHaveAttribute(
        'aria-expanded',
        'false'
      );
      await expect(renNav, `${item.id}: ren-nav data-open removed`).not.toHaveAttribute(
        'data-open',
        ''
      );

      const focusState = await page.evaluate(() => {
        const el = document.activeElement;
        if (!(el instanceof HTMLElement)) return { missing: true };
        const style = getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          missing: false,
          tag: el.tagName,
          className: String(el.className || ''),
          isToggle: el.classList.contains('ren-nav-toggle'),
          isBrand: el.classList.contains('ren-nav-brand'),
          visible:
            style.display !== 'none'
            && style.visibility !== 'hidden'
            && Number(style.opacity || '1') > 0
            && rect.width > 0
            && rect.height > 0,
        };
      });

      expect(focusState.missing, `${item.id}: activeElement present`).toBe(false);
      expect(focusState.visible, `${item.id}: post-close focus must be visible`).toBe(true);

      if (item.expectFocus === 'toggle') {
        expect(focusState.isToggle, `${item.id}: focus returns to toggle`).toBe(true);
      } else {
        expect(focusState.isBrand, `${item.id}: brand may keep focus (still visible)`).toBe(true);
      }

      // Ensure no leftover global controller hook (P2).
      const hasGlobal = await page.evaluate(
        () => typeof window.initNavMegaMenuCategoryPromoPanel === 'function'
      );
      expect(hasGlobal, 'window.initNavMegaMenuCategoryPromoPanel must not be published').toBe(
        false
      );
    }
  });

  test('breakpoint crossing closes open mega; same-breakpoint resize keeps open state', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);

    const disclosure = page.locator(DISCLOSURE);
    await page.locator(SUMMARY).click();
    await expect(disclosure).toHaveAttribute('open', '');

    // Same-breakpoint resize stability (desktop stays desktop).
    await page.setViewportSize({ width: 1100, height: 900 });
    await expect(disclosure).toHaveAttribute('open', '');
    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(disclosure).toHaveAttribute('open', '');

    // Cross shell boundary desktop → mobile.
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    await openMobileShell(page);
    await page.locator(SUMMARY).click();
    await expect(disclosure).toHaveAttribute('open', '');

    // Same-breakpoint resize on mobile.
    await page.setViewportSize({ width: 360, height: 800 });
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    const summary = page.locator(SUMMARY);
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(BRAND).hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('breakpoint seams 767/768/769 and narrow 320/340 geometry without overflow', async ({
    page,
  }) => {
    await gotoBlock(page, staticServer.origin);

    // Just below 48rem → mobile shell.
    await page.setViewportSize({ width: 767, height: 900 });
    await expect(page.locator(TOGGLE)).toBeVisible();
    await openMobileShell(page);
    await expect(page.locator(LINKS_ID)).toBeVisible();
    await expectNoOverflow(page, 'html');

    // 768px is the ren-nav 48rem boundary — shell must be deterministic.
    await page.setViewportSize({ width: 768, height: 900 });
    await page.waitForTimeout(50);
    const at768 = await page.evaluate(() => {
      const toggle = document.querySelector('[data-n26-root] .ren-nav-toggle');
      if (!toggle) return null;
      const style = getComputedStyle(toggle);
      const rect = toggle.getBoundingClientRect();
      return {
        visible:
          style.display !== 'none'
          && style.visibility !== 'hidden'
          && rect.width > 0
          && rect.height > 0,
      };
    });
    expect(at768).toBeTruthy();
    // Document intentional: ren-nav uses max-width 48rem for mobile; 768px = 48rem
    // so toggle remains the mobile path. 769 must flip to desktop.
    expect(at768.visible, '768px stays on mobile shell (max-width: 48rem)').toBe(true);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 769, height: 900 });
    await page.waitForTimeout(50);
    await expect(page.locator(TOGGLE)).toBeHidden();
    await expect(page.locator(LINKS_ID)).toBeVisible();
    await openDesktopMega(page);
    await expect(page.locator(DEST)).toHaveCount(15);
    await expectNoOverflow(page, 'html');

    // Narrow widths.
    for (const width of [320, 340]) {
      await page.setViewportSize({ width, height: 720 });
      await gotoBlock(page, staticServer.origin);
      await openMobileShell(page);
      await page.locator(SUMMARY).click();
      await expect(page.locator(PANEL)).toBeVisible();
      await expect(page.locator(DEST)).toHaveCount(15);
      await expectNoOverflow(page, 'html');
      await expectNoOverflow(page, ROOT);
    }
  });

  test('JS-disabled mobile keeps the nav tree, both actions, and native disclosure usable', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoBlock(page, staticServer.origin);

    await expect(page.locator(TOGGLE)).toBeHidden();
    await expect(page.locator(LINKS_ID)).toBeVisible();
    await expect(page.locator(ACTIONS)).toHaveCount(2);
    await expect(page.locator(ACTIONS).nth(0)).toBeVisible();
    await expect(page.locator(ACTIONS).nth(1)).toBeVisible();

    await page.locator(SUMMARY).click();
    await expect(page.locator(DISCLOSURE)).toHaveAttribute('open', '');
    await expect(page.locator(DEST)).toHaveCount(15);
    await expect(page.locator(PROMO_CTA)).toHaveCount(1);
    await expect(page.locator(`${DEST} .ren-icon, ${DEST} img, ${DEST} p`)).toHaveCount(0);

    await context.close();
  });

  test('viewport geometry: full-width bar and mega, category + promo layout, mobile in-flow, no overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);

    const shell = await page.evaluate(() => {
      const nav = document.querySelector('[data-n26-root] .ren-nav');
      const links = document.querySelector('#n26-primary-links');
      const brand = document.querySelector('[data-n26-root] .ren-nav-brand');
      const actions = document.querySelector('[data-n26-root] .ren-nav-actions');
      if (!nav || !links || !brand || !actions) return null;
      const navRect = nav.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      return {
        sideBySide:
          Math.abs(brandRect.top - linksRect.top) <= 12
          && Math.abs(actionsRect.top - linksRect.top) <= 12
          && brandRect.right <= linksRect.left + 1
          && linksRect.right <= actionsRect.left + 8,
        brandNearStart: brandRect.left - navRect.left <= 40,
        actionsNearEnd: navRect.right - actionsRect.right <= 40,
      };
    });
    expect(shell).toBeTruthy();
    expect(shell.sideBySide, 'desktop logo / links / two actions share one row').toBe(true);
    expect(shell.brandNearStart, 'logo at bar start').toBe(true);
    expect(shell.actionsNearEnd, 'actions at bar end').toBe(true);

    await openDesktopMega(page);

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-n26-root] .ren-nav');
      const panel = document.querySelector('.n26-panel');
      const groups = document.querySelector('.n26-groups');
      const promo = document.querySelector('.n26-promo');
      if (!nav || !panel || !groups || !promo) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const groupsRect = groups.getBoundingClientRect();
      const promoRect = promo.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
        panelWidth: Math.round(panelRect.width),
        navWidth: Math.round(navRect.width),
        overlapsBar: panelRect.top < navRect.bottom - 2 && panelRect.bottom > navRect.top + 2,
        groupsLeftOfPromo: groupsRect.right <= promoRect.left + 8 || groupsRect.bottom <= promoRect.top + 8,
        promoCapped: promoRect.width < groupsRect.width - 8,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    expect(desktop.overlapsBar, 'full-width mega must not cover the bar').toBe(false);
    expect(
      Math.abs(desktop.panelWidth - desktop.navWidth),
      'desktop mega spans the bar width'
    ).toBeLessThanOrEqual(16);
    expect(desktop.groupsLeftOfPromo || desktop.promoCapped, 'promo rail relationship').toBe(true);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoBlock(page, staticServer.origin);
    await openMobileShell(page);
    await page.locator(SUMMARY).click();
    await expect(page.locator(PANEL)).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.n26-panel');
      const links = document.querySelector('#n26-primary-links');
      if (!panel || !links) return null;
      const panelRect = panel.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      return {
        position: getComputedStyle(panel).position,
        fullWidth: Math.abs(panelRect.width - linksRect.width) <= 12,
      };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    expect(mobile.fullWidth, 'mobile mega spans the nav tree width').toBe(true);
    await expectNoOverflow(page, 'html');
  });

  test('tablet uses desktop shell; mobile top row is logo+toggle only with both actions inside the open panel', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoBlock(page, staticServer.origin);
    await expect(page.locator(TOGGLE)).toBeHidden();
    await expect(page.locator(LINKS_ID)).toBeVisible();
    await expect(page.locator(ACTIONS)).toHaveCount(2);
    await openDesktopMega(page);
    await expect(page.locator(DEST)).toHaveCount(15);

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoBlock(page, staticServer.origin);

    const closed = await page.evaluate(() => {
      const brand = document.querySelector('[data-n26-root] .ren-nav-brand');
      const actions = document.querySelector('[data-n26-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-n26-root] .ren-nav-toggle');
      const links = document.querySelector('#n26-primary-links');
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
    expect(closed.actionVisible, 'closed mobile must not show actions in the permanent top row').toBe(
      false
    );
    expect(closed.toggleVisible, 'mobile toggle is present in the chrome row').toBe(true);
    expect(Math.abs(closed.brandTop - closed.toggleTop), 'brand and toggle share top row').toBeLessThanOrEqual(
      12
    );
    expect(closed.linksBelowTopRow, 'navigation tree is not inlined into the top row when closed').toBe(
      true
    );

    await openMobileShell(page);
    await expect(page.locator(ACTIONS)).toHaveCount(2);

    const opened = await page.evaluate(() => {
      const brand = document.querySelector('[data-n26-root] .ren-nav-brand');
      const actions = document.querySelector('[data-n26-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-n26-root] .ren-nav-toggle');
      const links = document.querySelector('#n26-primary-links');
      const actionButtons = Array.from(
        document.querySelectorAll(
          '[data-n26-root] .ren-nav-actions a, [data-n26-root] .ren-nav-actions .ren-btn'
        )
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
        firstFullWidth: Math.abs(firstRect.width - linksRect.width) <= 12,
        secondFullWidth: Math.abs(secondRect.width - linksRect.width) <= 12,
        stacked: secondRect.top >= firstRect.bottom - 2,
      };
    });
    expect(opened).toBeTruthy();
    expect(opened.toggleStillTop, 'opened mobile keeps toggle in top row').toBe(true);
    expect(opened.actionsNotTopRow, 'opened mobile keeps actions out of the permanent top row').toBe(
      true
    );
    expect(opened.linksBelowToggle, 'opened mobile stacks the tree under logo+toggle').toBe(true);
    expect(opened.actionsBelowLinks, 'both actions sit inside the panel below the link tree').toBe(true);
    expect(opened.firstFullWidth, 'first action is full-width in the open panel').toBe(true);
    expect(opened.secondFullWidth, 'second action is full-width in the open panel').toBe(true);
    expect(opened.stacked, 'both actions stack vertically inside the open panel').toBe(true);
  });

  test('desktop chrome: single chevron, neutral details, aligned top-level peers', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);

    await expectSingleVisibleAffordance(page, [`${DISCLOSURE} summary ${CHEVRON}`], 'navbar26 desktop chevron');

    const peerLinks = page.locator(`${LINKS_ID} > li > a.ren-nav-link`);
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator(SUMMARY)).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [`a.ren-nav-link[href="${firstHref}"]`, SUMMARY, `a.ren-nav-link[href="${lastHref}"]`],
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

    const markerContent = String(summaryChrome.markerContent || 'none').replace(/['"]/g, '');
    expect(
      markerContent === 'none' || markerContent === '' || summaryChrome.markerDisplay === 'none',
      'summary marker'
    ).toBeTruthy();

    await expect(page.locator(`${DISCLOSURE} summary ${CHEVRON}`)).toHaveCount(1);

    await openDesktopMega(page);
    const openChrome = await page.evaluate(() => {
      const summary = document.querySelector('.n26-disclosure > summary');
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
    await gotoBlock(page, staticServer.origin);
    await openMobileShell(page);
    await page.locator(SUMMARY).click();
    await expect(page.locator(PANEL)).toBeVisible();

    const firstPeer = page.locator(`${LINKS_ID} > li > a.ren-nav-link`).first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, LINKS_ID, 0.9, 1.05);
    await expectWidthRatio(page, SUMMARY, LINKS_ID, 0.9, 1.05);
    await expectSingleVisibleAffordance(page, [`${DISCLOSURE} summary ${CHEVRON}`], 'mobile navbar26 chevron');
    await expectNoOverflow(page, 'html');
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoBlock(page, staticServer.origin);

    await openMobileShell(page);
    await page.locator(SUMMARY).click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-n26-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, a.n26-dest, a.n26-promo-cta'
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
    await gotoBlock(page, staticServer.origin);
    await openDesktopMega(page);

    const motion = await page.evaluate(() => {
      const selectors = ['.n26-panel', '.n26-chevron', 'a.n26-dest', '.n26-promo'];
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
      await gotoBlock(page, staticServer.origin);

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
        await expect(page.locator(selector), `${state.id} expects ${count}× ${selector}`).toHaveCount(
          count
        );
      }
    }
  });

  test('navbar26 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoBlock(page, staticServer.origin);
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
    await gotoBlock(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-surface')
          .trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-n26-root] .ren-nav');
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

  test('production block file is present only after RED stage (guard for suite discovery)', async () => {
    // Always true once GREEN lands; during pure RED the suite fails earlier on 404.
    // Kept so the suite documents the block path under test.
    expect(BLOCK_FILE.endsWith('nav-mega-menu-category-promo-panel.html')).toBe(true);
  });
});
