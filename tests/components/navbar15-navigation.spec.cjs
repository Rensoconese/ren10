// @ts-check
/**
 * Navbar 15 — Floating Bottom Logo-Left Menu Actions
 * (nav-floating-bottom-logo-left-menu-actions).
 *
 * Isolated suite (does not edit shared blocks-navigation.spec.cjs).
 * Phase A RED: implementation file is intentionally absent until tests fail
 * for missing anatomy / page.
 *
 * Defining differences from Navbar 14:
 * - Desktop shell docks near the bottom with upward dropdown
 * - One permanent action in chrome (not two panel-owned actions)
 * - Mobile top row keeps brand + action + toggle
 * - Desktop brand presents an up-icon instead of the logo mark treatment
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
const BLOCK_PATH = '/templates/blocks/nav-floating-bottom-logo-left-menu-actions.html';
const ROOT = '[data-rn15-root]';

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar15Block(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response, 'HTTP response for floating bottom logo-left menu actions block').toBeTruthy();
  expect(
    response.status(),
    'navbar15 block must not 404 — implement templates/blocks/nav-floating-bottom-logo-left-menu-actions.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-rn15-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RN15_RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar15/render-matrix.json'),
    'utf8'
  )
);

test.describe('Navbar Floating Bottom Logo Left Menu Actions (navbar15)', () => {
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

  test('block page loads with ren-nav shell and navbar15 root', async ({ page }) => {
    await gotoNavbar15Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Floating Bottom|Navbar 15|nav-floating-bottom-logo-left-menu-actions/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rn15-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('exactly one primary links tree serves desktop and mobile', async ({ page }) => {
    await gotoNavbar15Block(page, staticServer.origin);
    await expect(page.locator('#rn15-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rn15-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn15-primary-links')).toBeVisible();
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
  });

  test('anatomy: one brand, four top entries, three title-only destinations, one action, one toggle, one chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar15Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-brand`)).toHaveCount(1);

    await expect(page.locator('#rn15-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rn15-primary-links > li > a.ren-nav-link');
    const dropdownSummaries = page.locator('#rn15-primary-links > li > .rn15-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(dropdownSummaries).toHaveCount(1);

    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`)
    ).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-actions a.ren-btn-primary`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveCount(1);

    await page.locator('.rn15-disclosure > summary').click();
    await expect(page.locator('.rn15-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rn15-panel')).toBeVisible();

    await expect(page.locator('a.rn15-destination')).toHaveCount(3);
    await expect(page.locator('.rn15-destination-icon, .rn15-dest-desc, .rn15-group, .rn15-group-label')).toHaveCount(0);
    await expect(page.locator('a.rn15-destination .ren-icon, a.rn15-destination img, a.rn15-destination .ren-stack-xs')).toHaveCount(0);

    await expect(
      page.locator('.rmcg-card, .rmf-feature, .rmi-panel, .ren-card, .ren-menu, .ren-popover, ren-collapsible, .ren-collapsible')
    ).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rn15-disclosure summary .rn15-chevron'],
      'navbar15 dropdown chevron'
    );
    await expect(page.locator('.rn15-chevron')).toHaveCount(1);
  });

  test('title-only destinations are whole anchors without icons, groups, or descriptions', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar15Block(page, staticServer.origin);
    await page.locator('.rn15-disclosure > summary').click();

    const links = page.locator('a.rn15-destination');
    await expect(links).toHaveCount(3);

    for (let i = 0; i < 3; i += 1) {
      const link = links.nth(i);
      const tagName = await link.evaluate((el) => el.tagName);
      expect(tagName, `destination ${i} tag`).toBe('A');
      await expect(link).toHaveAttribute('href', /.+/);
      const text = (await link.innerText()).trim();
      expect(text.length, `destination ${i} title text`).toBeGreaterThan(0);
      await expect(link.locator('a[href], button, [role="button"], .ren-icon, img, p, small')).toHaveCount(0);
    }

    await expect(page.locator('.rn15-group, .rn15-group-label, .rn15-dest-desc, .rn15-destination-icon')).toHaveCount(0);
  });

  test('summary opens by click, keyboard, and desktop pointer hover; click pins; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar15Block(page, staticServer.origin);

    const disclosure = page.locator('.rn15-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rn15-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rn15-destination').first()).toBeVisible();

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
    await expect(page.locator('a.rn15-destination').first()).toBeVisible();

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

  test('outside click and destination activation close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar15Block(page, staticServer.origin);

    const disclosure = page.locator('.rn15-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.locator(`${ROOT} .ren-nav-brand`).click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rn15-destination').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile toggle exposes the same tree and closes dropdown on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar15Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const disclosure = page.locator('.rn15-disclosure');
    const summary = disclosure.locator('summary');

    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', 'rn15-primary-links');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn15-primary-links')).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rn15-destination').first()).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile hierarchical Escape: disclosure first, then shell with focus restored to toggle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar15Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const disclosure = page.locator('.rn15-disclosure');
    const summary = disclosure.locator('summary');
    const product = page.locator('#rn15-primary-links > li > a.ren-nav-link').first();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn15-primary-links')).toBeVisible();

    // Layer 1: open disclosure, Escape closes only the disclosure and returns
    // focus to summary while the mobile shell stays open.
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rn15-destination').first().focus();
    await expect.poll(() => page.evaluate(() => document.activeElement?.className || '')).toMatch(/rn15-destination/);
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');
    await expect(page.locator('#rn15-primary-links')).toBeVisible();

    // Layer 2: focus a top-level link (Product); Escape closes the shell and
    // restores focus to the toggle — not a now-hidden anchor.
    await product.focus();
    await expect.poll(() => page.evaluate(() => {
      const el = document.activeElement;
      return el ? { tag: el.tagName, href: el.getAttribute('href'), text: (el.textContent || '').trim() } : null;
    })).toMatchObject({ tag: 'A', href: '#product' });

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');

    await expect.poll(() => page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      return {
        isToggle: el.classList.contains('ren-nav-toggle'),
        ariaExpanded: el.getAttribute('aria-expanded'),
        tag: el.tagName,
      };
    })).toEqual({ isToggle: true, ariaExpanded: 'false', tag: 'BUTTON' });

    // Hidden tree must not retain document focus after shell close.
    const focusAfter = await page.evaluate(() => {
      const active = document.activeElement;
      const links = document.querySelector('#rn15-primary-links');
      const style = links ? getComputedStyle(links) : null;
      return {
        activeInTree: !!(active && links && links.contains(active)),
        linksDisplay: style?.display || null,
      };
    });
    expect(focusAfter.activeInTree, 'focus must not remain inside the closed/hidden tree').toBe(false);
    expect(focusAfter.linksDisplay).toBe('none');
  });

  test('breakpoint crossing closes an open dropdown and resets interaction policy', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar15Block(page, staticServer.origin);

    const disclosure = page.locator('.rn15-disclosure');
    await page.locator('.rn15-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rn15-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    const summary = page.locator('.rn15-disclosure > summary');
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-brand`).hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('48rem seam: 767/768 mobile shell and 769 desktop shell agree with ren-nav', async ({ page }) => {
    /**
     * ren-nav base CSS uses max-width: 48rem for mobile (toggle flex, links
     * hidden until open). Block CSS/JS must not claim desktop at 768px via
     * min-width: 48rem — that leaves a visible toggle and a hidden tree while
     * the local controller enables desktop hover. Desktop starts at 48.01rem.
     */
    await gotoNavbar15Block(page, staticServer.origin);

    /**
     * @param {import('@playwright/test').Page} page
     * @param {number} width
     */
    async function shellAt(page, width) {
      await page.setViewportSize({ width, height: 900 });
      // Force layout + matchMedia to settle after resize.
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      return page.evaluate(() => {
        const toggle = document.querySelector('[data-rn15-root] .ren-nav-toggle');
        const links = document.querySelector('#rn15-primary-links');
        const nav = document.querySelector('[data-rn15-root] .ren-nav');
        if (!toggle || !links || !nav) return null;
        const toggleStyle = getComputedStyle(toggle);
        const linksStyle = getComputedStyle(links);
        const toggleRect = toggle.getBoundingClientRect();
        const linksRect = links.getBoundingClientRect();
        const toggleVisible =
          toggleStyle.display !== 'none'
          && toggleStyle.visibility !== 'hidden'
          && toggleRect.width > 0
          && toggleRect.height > 0;
        const linksVisible =
          linksStyle.display !== 'none'
          && linksStyle.visibility !== 'hidden'
          && linksRect.width > 0
          && linksRect.height > 0;
        return {
          width: window.innerWidth,
          toggleDisplay: toggleStyle.display,
          linksDisplay: linksStyle.display,
          toggleVisible,
          linksVisible,
          desktopMq: window.matchMedia('(min-width: 48.01rem)').matches,
          renNavMobileMq: window.matchMedia('(max-width: 48rem)').matches,
        };
      });
    }

    // 767px: mobile shell — toggle operable, tree hidden until open.
    const at767 = await shellAt(page, 767);
    expect(at767).toBeTruthy();
    expect(at767.width).toBe(767);
    expect(at767.renNavMobileMq, '767 is ren-nav mobile band').toBe(true);
    expect(at767.desktopMq, '767 is not block desktop').toBe(false);
    expect(at767.toggleVisible, '767 toggle visible').toBe(true);
    expect(at767.linksVisible, '767 links hidden until toggle').toBe(false);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn15-primary-links')).toBeVisible();
    await expect(page.locator('#rn15-primary-links > li > a.ren-nav-link').first()).toBeVisible();
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute('aria-expanded', 'false');

    // 768px seam: must stay mobile with ren-nav (not half-desktop local CSS/JS).
    const at768 = await shellAt(page, 768);
    expect(at768).toBeTruthy();
    expect(at768.width).toBe(768);
    expect(at768.renNavMobileMq, '768 is ren-nav mobile (max-width: 48rem)').toBe(true);
    expect(at768.desktopMq, '768 must not match block desktop MQ').toBe(false);
    expect(at768.toggleVisible, '768 toggle remains flex/visible').toBe(true);
    expect(at768.linksVisible, '768 links remain hidden until open').toBe(false);
    expect(at768.toggleDisplay).toBe('flex');
    expect(at768.linksDisplay).toBe('none');

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn15-primary-links')).toBeVisible();
    await expect(page.locator('#rn15-primary-links > li > a.ren-nav-link').first()).toBeVisible();
    // Desktop hover must not govern at the seam (activation-only mobile).
    const disclosure = page.locator('.rn15-disclosure');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await page.locator('.rn15-disclosure > summary').hover({ force: true });
    await page.waitForTimeout(100);
    await expect(disclosure).not.toHaveAttribute('open', '');
    await page.locator('.rn15-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rn15-destination').first()).toBeVisible();
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');

    // 769px: desktop shell — toggle hidden, tree visible, hover operable.
    const at769 = await shellAt(page, 769);
    expect(at769).toBeTruthy();
    expect(at769.width).toBe(769);
    expect(at769.renNavMobileMq, '769 leaves ren-nav mobile band').toBe(false);
    expect(at769.desktopMq, '769 is block desktop').toBe(true);
    expect(at769.toggleVisible, '769 toggle hidden').toBe(false);
    expect(at769.linksVisible, '769 links visible in horizontal shell').toBe(true);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator('#rn15-primary-links')).toBeVisible();
    await page.locator('.rn15-disclosure > summary').hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rn15-destination').first()).toBeVisible();
  });

  test('JS-disabled mobile keeps the nav tree, permanent action, and native disclosure usable', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar15Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator('#rn15-primary-links')).toBeVisible();
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`)
    ).toHaveCount(1);
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`).first()
    ).toBeVisible();

    await page.locator('.rn15-disclosure > summary').click();
    await expect(page.locator('.rn15-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('a.rn15-destination')).toHaveCount(3);
    await expect(page.locator('.rn15-destination-icon, .rn15-dest-desc, .rn15-group')).toHaveCount(0);

    await context.close();
  });

  test('viewport geometry: bottom-docked desktop shell, upward absolute panel, mobile in-flow, no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar15Block(page, staticServer.origin);

    const shell = await page.evaluate(() => {
      const preview = document.querySelector('[data-rn15-root]');
      const nav = document.querySelector('[data-rn15-root] .ren-nav');
      const links = document.querySelector('#rn15-primary-links');
      const brand = document.querySelector('[data-rn15-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rn15-root] .ren-nav-actions');
      if (!preview || !nav || !links || !brand || !actions) return null;
      const previewRect = preview.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        previewBottom: previewRect.bottom,
        distanceFromPreviewBottom: previewRect.bottom - navRect.bottom,
        brandLeft: brandRect.left,
        brandRight: brandRect.right,
        linksLeft: linksRect.left,
        linksRight: linksRect.right,
        actionsLeft: actionsRect.left,
        actionsRight: actionsRect.right,
        navLeft: navRect.left,
        navRight: navRect.right,
        sideBySide:
          Math.abs(brandRect.top - linksRect.top) <= 12
          && Math.abs(actionsRect.top - linksRect.top) <= 12
          && brandRect.right <= linksRect.left + 1
          && linksRect.right <= actionsRect.left + 1,
      };
    });
    expect(shell).toBeTruthy();
    expect(shell.sideBySide, 'desktop brand / menu / one action share one row').toBe(true);
    expect(
      shell.distanceFromPreviewBottom,
      'desktop shell docks near the bottom of the preview'
    ).toBeLessThanOrEqual(48);
    expect(
      shell.navRight - shell.actionsRight,
      'action hugs the floating shell end'
    ).toBeLessThanOrEqual(32);
    expect(
      shell.brandLeft - shell.navLeft,
      'brand stays at the floating shell start'
    ).toBeLessThanOrEqual(32);

    await page.locator('.rn15-disclosure > summary').click();
    await expect(page.locator('.rn15-panel')).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rn15-root] .ren-nav');
      const panel = document.querySelector('.rn15-panel');
      const summary = document.querySelector('.rn15-disclosure > summary');
      if (!nav || !panel || !summary) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const summaryRect = summary.getBoundingClientRect();
      return {
        navTop: navRect.top,
        panelBottom: panelRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
        panelWidth: Math.round(panelRect.width),
        panelCenterX: panelRect.left + panelRect.width / 2,
        summaryCenterX: summaryRect.left + summaryRect.width / 2,
        opensAbove: panelRect.bottom <= navRect.top + 2,
        overlapsBar: panelRect.top < navRect.bottom - 2 && panelRect.bottom > navRect.top + 2,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.opensAbove, 'desktop dropdown must open upward above the bottom-docked bar').toBe(true);
    expect(desktop.overlapsBar, 'upward dropdown must not cover the bar').toBe(false);
    expect(desktop.panelWidth, 'narrow title-only desktop panel').toBeGreaterThanOrEqual(120);
    expect(desktop.panelWidth, 'narrow title-only desktop panel').toBeLessThanOrEqual(280);
    expect(
      Math.abs(desktop.panelCenterX - desktop.summaryCenterX),
      'panel centered above its trigger'
    ).toBeLessThanOrEqual(24);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar15Block(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rn15-disclosure > summary').click();
    await expect(page.locator('.rn15-panel')).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rn15-panel');
      const links = document.querySelector('#rn15-primary-links');
      const preview = document.querySelector('[data-rn15-root]');
      const nav = document.querySelector('[data-rn15-root] .ren-nav');
      if (!panel || !links || !preview || !nav) return null;
      const panelRect = panel.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const previewRect = preview.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      return {
        position: getComputedStyle(panel).position,
        fullWidth: Math.abs(panelRect.width - linksRect.width) <= 8,
        nearPreviewTop: navRect.top - previewRect.top <= 48,
      };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    expect(mobile.fullWidth, 'mobile dropdown panel spans the nav tree width').toBe(true);
    expect(mobile.nearPreviewTop, 'mobile shell docks near the top of the preview').toBe(true);
    await expectNoOverflow(page, 'html');
  });

  test('tablet uses desktop shell; mobile top row is brand+action+toggle with links below when open', async ({ page }) => {
    // 834px is ≥48rem: desktop shell (no hamburger), horizontal menu, one action.
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoNavbar15Block(page, staticServer.origin);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator('#rn15-primary-links')).toBeVisible();
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`)
    ).toHaveCount(1);
    await page.locator('.rn15-disclosure > summary').click();
    await expect(page.locator('a.rn15-destination')).toHaveCount(3);
    await expect(page.locator('.rn15-dest-desc, .rn15-destination-icon, .rn15-group')).toHaveCount(0);

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar15Block(page, staticServer.origin);

    const closed = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn15-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rn15-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rn15-root] .ren-nav-toggle');
      const links = document.querySelector('#rn15-primary-links');
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
        actionsTop: actionsRect.top,
        actionVisible,
        toggleVisible: toggleRect.width > 0 && toggleRect.height > 0,
        linksBelowTopRow:
          linksRect.top >= Math.max(brandRect.bottom, toggleRect.bottom, actionsRect.bottom) - 4
          || linksStyle.display === 'none'
          || linksStyle.visibility === 'hidden',
      };
    });
    expect(closed).toBeTruthy();
    expect(closed.actionVisible, 'closed mobile keeps the permanent action in chrome').toBe(true);
    expect(closed.toggleVisible, 'mobile toggle is present in the chrome row').toBe(true);
    expect(Math.abs(closed.brandTop - closed.toggleTop), 'brand and toggle share top row').toBeLessThanOrEqual(12);
    expect(Math.abs(closed.brandTop - closed.actionsTop), 'brand and action share top row').toBeLessThanOrEqual(12);
    expect(closed.linksBelowTopRow, 'navigation tree is not inlined into the top row when closed').toBe(true);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator('#rn15-primary-links')).toBeVisible();
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`)
    ).toHaveCount(1);

    const opened = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn15-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rn15-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rn15-root] .ren-nav-toggle');
      const links = document.querySelector('#rn15-primary-links');
      if (!brand || !actions || !toggle || !links) return null;
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      return {
        toggleStillTop: Math.abs(brandRect.top - toggleRect.top) <= 12,
        actionStillTop: Math.abs(brandRect.top - actionsRect.top) <= 12,
        linksBelowChrome: linksRect.top >= Math.max(brandRect.bottom, toggleRect.bottom, actionsRect.bottom) - 4,
      };
    });
    expect(opened).toBeTruthy();
    expect(opened.toggleStillTop, 'opened mobile keeps toggle in top row').toBe(true);
    expect(opened.actionStillTop, 'opened mobile keeps permanent action in top row').toBe(true);
    expect(opened.linksBelowChrome, 'opened mobile stacks the tree under brand+action+toggle').toBe(true);
  });

  test('desktop and mobile use the shared Ren10 brand treatment', async ({ page }) => {
    for (const viewport of [
      { width: 1280, height: 900 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await gotoNavbar15Block(page, staticServer.origin);

      const brand = await page.evaluate(() => {
        const mark = document.querySelector('[data-rn15-root] .rn15-brand-mark');
        const label = document.querySelector('[data-rn15-root] .rn15-brand-label');
        if (!mark || !label) return null;
        const markStyle = getComputedStyle(mark);
        const labelStyle = getComputedStyle(label);
        const markRect = mark.getBoundingClientRect();
        const labelRect = label.getBoundingClientRect();
        return {
          markVisible: markRect.width > 0 && markRect.height > 0 && markStyle.visibility !== 'hidden',
          labelVisible: labelRect.width > 0 && labelRect.height > 0 && labelStyle.visibility !== 'hidden',
          markText: mark.textContent.trim(),
          labelText: label.textContent.trim(),
        };
      });
      expect(brand).toBeTruthy();
      expect(brand.markVisible, `${viewport.width}px brand shows logo mark`).toBe(true);
      expect(brand.labelVisible, `${viewport.width}px brand shows label`).toBe(true);
      expect(brand.markText).toBe('R');
      expect(brand.labelText).toBe('Ren10');
    }
  });

  test('desktop chrome: single chevron, neutral details, aligned top-level peers', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar15Block(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rn15-disclosure summary .rn15-chevron'],
      'navbar15 desktop chevron'
    );

    const peerLinks = page.locator('#rn15-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rn15-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rn15-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rn15-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rn15-disclosure > summary');
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

    await expect(page.locator('.rn15-disclosure summary .rn15-chevron')).toHaveCount(1);

    await page.locator('.rn15-disclosure > summary').click();
    await expect(page.locator('.rn15-disclosure')).toHaveAttribute('open', '');
    const openChrome = await page.evaluate(() => {
      const summary = document.querySelector('.rn15-disclosure > summary');
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
    await gotoNavbar15Block(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rn15-disclosure > summary').click();
    await expect(page.locator('.rn15-panel')).toBeVisible();

    const firstPeer = page.locator('#rn15-primary-links > li > a.ren-nav-link').first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, '#rn15-primary-links', 0.92, 1.05);
    await expectWidthRatio(page, '.rn15-disclosure > summary', '#rn15-primary-links', 0.92, 1.05);
    await expectSingleVisibleAffordance(
      page,
      ['.rn15-disclosure summary .rn15-chevron'],
      'mobile navbar15 chevron'
    );
    await expectNoOverflow(page, 'html');
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar15Block(page, staticServer.origin);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rn15-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rn15-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, a.rn15-destination'
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
    await gotoNavbar15Block(page, staticServer.origin);
    await page.locator('.rn15-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rn15-panel', '.rn15-chevron', 'a.rn15-destination'];
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
    for (const state of RN15_RENDER_MATRIX.states) {
      if (!state.javaScript) continue;

      if (state.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }

      await page.setViewportSize(state.viewport);
      await gotoNavbar15Block(page, staticServer.origin);

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

  test('navbar15 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoNavbar15Block(page, staticServer.origin);
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
    await gotoNavbar15Block(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rn15-root] .ren-nav');
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
