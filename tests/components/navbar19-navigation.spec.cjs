// @ts-check
/**
 * Isolated Navbar 19 suite — Logo-Left Center-Links Site-Panel block.
 * Does not edit shared blocks-navigation.spec.cjs.
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
const BLOCK_PATH = '/templates/blocks/nav-logo-left-center-links-site-panel.html';
const ROOT = '[data-rn19-root]';

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RN19_RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar19/render-matrix.json'),
    'utf8'
  )
);

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar19Block(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response, 'HTTP response for logo-left center-links site-panel block').toBeTruthy();
  expect(
    response.status(),
    'navbar19 block must not 404 — implement templates/blocks/nav-logo-left-center-links-site-panel.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-rn19-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

test.describe('Navbar Logo Left Center Links Site Panel (navbar19)', () => {
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

  test('block page loads with ren-nav shell and navbar19 root', async ({ page }) => {
    await gotoNavbar19Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Logo.?Left Center.?Links Site.?Panel|Navbar 19|nav-logo-left-center-links-site-panel/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rn19-bar-links')).toHaveCount(1);
    await expect(page.locator('#rn19-site-panel')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('exactly one landmark serves bar and site panel content', async ({ page }) => {
    await gotoNavbar19Block(page, staticServer.origin);
    await expect(page.locator(`${ROOT} nav.ren-nav`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);
    await expect(page.getByRole('navigation', { name: 'Example site' })).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rn19-bar-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn19-site-panel')).toBeVisible();
    await expect(page.locator(`${ROOT} nav.ren-nav`)).toHaveCount(1);
  });

  test('anatomy: brand, four bar entries, three destinations, panel catalog, toggle, one chevron', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar19Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-brand`)).toHaveCount(1);

    await expect(page.locator('#rn19-bar-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rn19-bar-links > li > a.ren-nav-link');
    const dropdownSummaries = page.locator('#rn19-bar-links > li > .rn19-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(dropdownSummaries).toHaveCount(1);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-actions`)).toHaveCount(0);

    await page.locator('.rn19-disclosure > summary').click();
    await expect(page.locator('.rn19-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rn19-dropdown')).toBeVisible();
    await expect(page.locator('a.rn19-destination')).toHaveCount(3);
    await expect(
      page.locator('.rn19-destination-icon, .rn19-dest-desc, .rn19-group, .rn19-group-label')
    ).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rn19-disclosure summary .rn19-chevron'],
      'navbar19 dropdown chevron'
    );
    await expect(page.locator('.rn19-chevron')).toHaveCount(1);

    // Site panel catalog counts (present in DOM even when closed).
    await expect(page.locator('a.rn19-primary-link')).toHaveCount(8);
    await expect(page.locator('.rn19-column')).toHaveCount(4);
    await expect(page.locator('a.rn19-column-link')).toHaveCount(20);
    await expect(page.locator('.rn19-contact a[href^="tel:"]')).toHaveCount(1);
    await expect(page.locator('.rn19-contact a[href^="mailto:"]')).toHaveCount(1);
    await expect(page.locator('.rn19-contact .rn19-location')).toHaveCount(1);
    await expect(page.locator('a.rn19-social')).toHaveCount(5);

    await expect(
      page.locator(
        '.rmcg-card, .rmf-feature, .rmi-panel, .ren-card, .ren-menu, .ren-popover, ren-collapsible, .ren-collapsible'
      )
    ).toHaveCount(0);
  });

  test('title-only destinations are whole anchors without icons or descriptions', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar19Block(page, staticServer.origin);
    await page.locator('.rn19-disclosure > summary').click();

    const links = page.locator('a.rn19-destination');
    await expect(links).toHaveCount(3);

    for (let i = 0; i < 3; i += 1) {
      const link = links.nth(i);
      const tagName = await link.evaluate((el) => el.tagName);
      expect(tagName, `destination ${i} tag`).toBe('A');
      await expect(link).toHaveAttribute('href', /.+/);
      const text = (await link.innerText()).trim();
      expect(text.length, `destination ${i} title text`).toBeGreaterThan(0);
      await expect(
        link.locator('a[href], button, [role="button"], .ren-icon, img, p, small')
      ).toHaveCount(0);
    }
  });

  test('summary opens by click, keyboard, and desktop pointer hover; click pins; Escape restores focus', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar19Block(page, staticServer.origin);

    const disclosure = page.locator('.rn19-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rn19-dropdown');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rn19-destination').first()).toBeVisible();

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
    await expect(page.locator('a.rn19-destination').first()).toBeVisible();

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
    await gotoNavbar19Block(page, staticServer.origin);

    const disclosure = page.locator('.rn19-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.locator(`${ROOT} .ren-nav-brand`).click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rn19-destination').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('site panel toggle works on desktop and mobile; Escape restores focus to toggle', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar19Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const panel = page.locator('#rn19-site-panel');

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', 'rn19-site-panel');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rn19-primary-link').first()).toBeVisible();

    // Desktop bar row hides while site panel is open.
    const barHidden = await page.evaluate(() => {
      const links = document.querySelector('#rn19-bar-links');
      if (!links) return false;
      const style = getComputedStyle(links);
      return style.display === 'none' || style.visibility === 'hidden' || links.getClientRects().length === 0;
    });
    expect(barHidden, 'desktop bar row hidden while site panel open').toBe(true);

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList?.contains('ren-nav-toggle'))).toBe(
      true
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rn19-primary-link')).toHaveCount(8);
    await expect(page.locator('a.rn19-column-link')).toHaveCount(20);
    await expect(page.locator('a.rn19-social')).toHaveCount(5);
  });

  test('panel outside click and destination activation close the site panel', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar19Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.locator(`${ROOT} .rn19-hero`).click({ position: { x: 20, y: 20 } });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.locator('a.rn19-primary-link').first().click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('opening site panel closes an open disclosure and breakpoint reset closes both', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar19Block(page, staticServer.origin);

    const disclosure = page.locator('.rn19-disclosure');
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);

    await page.locator('.rn19-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(disclosure).not.toHaveAttribute('open', '');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('same-band desktop resize preserves open site panel; only band cross closes', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar19Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const panel = page.locator('#rn19-site-panel');
    const renNav = page.locator(`${ROOT} ren-nav`);

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(renNav).toHaveAttribute('data-open', '');
    await expect(panel).toBeVisible();

    // Same desktop band (still ≥ 48rem / 768px): open state must survive.
    await page.setViewportSize({ width: 1279, height: 900 });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(renNav).toHaveAttribute('data-open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rn19-primary-link').first()).toBeVisible();

    await page.setViewportSize({ width: 1024, height: 800 });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(renNav).toHaveAttribute('data-open', '');
    await expect(panel).toBeVisible();

    // Cross below 48rem: must close.
    await page.setViewportSize({ width: 767, height: 900 });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(renNav).not.toHaveAttribute('data-open', '');
  });

  test('site panel state is owned via public ARIA/DOM only (no private ren-nav fields)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar19Block(page, staticServer.origin);

    const probe = await page.evaluate(() => {
      const root = document.querySelector('[data-rn19-root]');
      const host = root?.querySelector('ren-nav');
      const toggle = root?.querySelector('.ren-nav-toggle');
      const panel = root?.querySelector('#rn19-site-panel');
      if (!host || !toggle || !panel) return { missing: true };

      const controllerSource = String(
        document.querySelector('script[type="module"]:last-of-type')?.textContent || ''
      );
      const touchesPrivate =
        controllerSource.includes('._isOpen')
        || controllerSource.includes("['_isOpen']")
        || controllerSource.includes('["_isOpen"]')
        || /_isOpen\s*=/.test(controllerSource);

      toggle.click();
      const openPublic = {
        ariaExpanded: toggle.getAttribute('aria-expanded'),
        hostDataOpen: host.hasAttribute('data-open'),
        panelDataOpen: panel.hasAttribute('data-open'),
        panelAriaHidden: panel.getAttribute('aria-hidden'),
      };

      // Public state remains consistent after a same-band resize.
      window.dispatchEvent(new Event('resize'));
      const afterResize = {
        ariaExpanded: toggle.getAttribute('aria-expanded'),
        hostDataOpen: host.hasAttribute('data-open'),
        panelDataOpen: panel.hasAttribute('data-open'),
      };

      toggle.click();
      const closedPublic = {
        ariaExpanded: toggle.getAttribute('aria-expanded'),
        hostDataOpen: host.hasAttribute('data-open'),
        panelDataOpen: panel.hasAttribute('data-open'),
        panelAriaHidden: panel.getAttribute('aria-hidden'),
      };

      return { touchesPrivate, openPublic, afterResize, closedPublic };
    });

    expect(probe.missing, 'missing host/toggle/panel').toBeFalsy();
    expect(probe.touchesPrivate, 'controller must not access ren-nav _isOpen').toBe(false);

    expect(probe.openPublic.ariaExpanded).toBe('true');
    expect(probe.openPublic.hostDataOpen).toBe(true);
    expect(probe.openPublic.panelDataOpen).toBe(true);
    expect(probe.openPublic.panelAriaHidden).toBe('false');

    expect(probe.afterResize.ariaExpanded).toBe('true');
    expect(probe.afterResize.hostDataOpen).toBe(true);
    expect(probe.afterResize.panelDataOpen).toBe(true);

    expect(probe.closedPublic.ariaExpanded).toBe('false');
    expect(probe.closedPublic.hostDataOpen).toBe(false);
    expect(probe.closedPublic.panelDataOpen).toBe(false);
    expect(probe.closedPublic.panelAriaHidden).toBe('true');
  });

  test('desktop geometry: logo start, centered bar cluster, toggle end', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar19Block(page, staticServer.origin);

    const geometry = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn19-root] .ren-nav-brand');
      const links = document.querySelector('#rn19-bar-links');
      const toggle = document.querySelector('[data-rn19-root] .ren-nav-toggle');
      const nav = document.querySelector('[data-rn19-root] .ren-nav');
      if (!brand || !links || !toggle || !nav) return null;
      const brandRect = brand.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      const navCenter = navRect.left + navRect.width / 2;
      const linksCenter = linksRect.left + linksRect.width / 2;
      return {
        brandLeftOfLinks: brandRect.right <= linksRect.left + 8,
        linksLeftOfToggle: linksRect.right <= toggleRect.left + 8,
        toggleVisible: toggleRect.width > 0 && toggleRect.height > 0,
        centered: Math.abs(linksCenter - navCenter) <= navRect.width * 0.12,
        sameRow: Math.abs(brandRect.top - toggleRect.top) <= 16,
      };
    });

    expect(geometry).toBeTruthy();
    expect(geometry.brandLeftOfLinks, 'logo before bar links').toBe(true);
    expect(geometry.linksLeftOfToggle, 'bar links before toggle').toBe(true);
    expect(geometry.toggleVisible, 'toggle visible on desktop').toBe(true);
    expect(geometry.centered, 'bar links roughly centered').toBe(true);
    expect(geometry.sameRow, 'logo and toggle share top row').toBe(true);
  });

  test('mobile closed row is logo + toggle only; open stacks site panel below', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar19Block(page, staticServer.origin);

    const closed = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn19-root] .ren-nav-brand');
      const toggle = document.querySelector('[data-rn19-root] .ren-nav-toggle');
      const links = document.querySelector('#rn19-bar-links');
      const panel = document.querySelector('#rn19-site-panel');
      if (!brand || !toggle || !links || !panel) return null;
      const brandRect = brand.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const linksStyle = getComputedStyle(links);
      const panelStyle = getComputedStyle(panel);
      const linksHidden =
        linksStyle.display === 'none'
        || linksStyle.visibility === 'hidden'
        || links.getClientRects().length === 0;
      const panelHidden =
        panelStyle.display === 'none'
        || panel.hasAttribute('hidden')
        || panel.getClientRects().length === 0;
      return {
        sameRow: Math.abs(brandRect.top - toggleRect.top) <= 12,
        linksHidden,
        panelHidden,
      };
    });
    expect(closed).toBeTruthy();
    expect(closed.sameRow, 'closed mobile keeps brand and toggle on one row').toBe(true);
    expect(closed.linksHidden, 'closed mobile hides bar links').toBe(true);
    expect(closed.panelHidden, 'closed mobile hides site panel').toBe(true);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();

    const opened = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn19-root] .ren-nav-brand');
      const toggle = document.querySelector('[data-rn19-root] .ren-nav-toggle');
      const panel = document.querySelector('#rn19-site-panel');
      if (!brand || !toggle || !panel) return null;
      const brandRect = brand.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        toggleStillTop: Math.abs(brandRect.top - toggleRect.top) <= 12,
        panelBelow: panelRect.top >= Math.max(brandRect.bottom, toggleRect.bottom) - 4,
        panelVisible: panelRect.height > 0 && panelRect.width > 0,
      };
    });
    expect(opened).toBeTruthy();
    expect(opened.toggleStillTop, 'open mobile keeps toggle in top row').toBe(true);
    expect(opened.panelBelow, 'site panel stacks under logo+toggle').toBe(true);
    expect(opened.panelVisible, 'site panel visible when open').toBe(true);
  });

  test('desktop chrome: single chevron, neutral details, aligned top-level peers', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar19Block(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rn19-disclosure summary .rn19-chevron'],
      'navbar19 desktop chevron'
    );

    const peerLinks = page.locator('#rn19-bar-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rn19-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rn19-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rn19-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rn19-disclosure > summary');
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none' || afterContent === '' || summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);

    const markerContent = String(summaryChrome.markerContent || 'none').replace(/['"]/g, '');
    expect(
      markerContent === 'none' || markerContent === '' || summaryChrome.markerDisplay === 'none',
      'summary marker'
    ).toBeTruthy();

    await page.locator('.rn19-disclosure > summary').click();
    await expect(page.locator('.rn19-disclosure')).toHaveAttribute('open', '');
    const openChrome = await page.evaluate(() => {
      const summary = document.querySelector('.rn19-disclosure > summary');
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

  test('mobile open catalog: primary links full-width peers, one chevron owner, no overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 1100 });
    await gotoNavbar19Block(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();

    const firstPrimary = page.locator('a.rn19-primary-link').first();
    await expect(firstPrimary).toBeVisible();
    await expectWidthRatio(page, 'a.rn19-primary-link', '#rn19-site-panel', 0.35, 1.05);

    // Bar disclosure (and its chevron) stays desktop-only chrome; mobile catalog
    // uses the site panel. Still exactly one authored chevron in the tree.
    await expect(page.locator('.rn19-chevron')).toHaveCount(1);
    await expect(page.locator('.rn19-disclosure summary .rn19-chevron')).toHaveCount(1);
    await expectNoOverflow(page, 'html');
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar19Block(page, staticServer.origin);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rn19-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, a.rn19-destination, a.rn19-primary-link, a.rn19-column-link, a.rn19-social'
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
    await gotoNavbar19Block(page, staticServer.origin);
    await page.locator('.rn19-disclosure > summary').click();
    await page.locator(`${ROOT} .ren-nav-toggle`).click();

    const motion = await page.evaluate(() => {
      const selectors = [
        '.rn19-dropdown',
        '.rn19-chevron',
        'a.rn19-destination',
        '#rn19-site-panel',
        'a.rn19-primary-link',
      ];
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

  test('JS-disabled exposes site catalog and native disclosure', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1100 } });
    const page = await context.newPage();
    const response = await page.goto(`${staticServer.origin}${BLOCK_PATH}`);
    expect(response?.status()).toBe(200);

    await expect(page.locator(ROOT)).toHaveCount(1);
    await expect(page.locator('a.rn19-primary-link')).toHaveCount(8);
    await expect(page.locator('a.rn19-column-link')).toHaveCount(20);
    await expect(page.locator('a.rn19-social')).toHaveCount(5);

    // Inert toggle should not be the only path to content.
    const toggleVisible = await page.locator(`${ROOT} .ren-nav-toggle`).isVisible().catch(() => false);
    expect(toggleVisible, 'JS-disabled should hide inert toggle or keep catalog visible regardless').toBe(
      false
    );

    // Desktop bar disclosure remains native-usable when JS is off (load wide).
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.locator('.rn19-disclosure > summary').click();
    await expect(page.locator('.rn19-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('a.rn19-destination').first()).toBeVisible();

    await context.close();
  });

  test('render-matrix marker counts hold across packet viewport states', async ({ page }) => {
    for (const state of RN19_RENDER_MATRIX.states) {
      if (!state.javaScript) continue;

      if (state.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }

      await page.setViewportSize(state.viewport);
      await gotoNavbar19Block(page, staticServer.origin);

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

  test('navbar19 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoNavbar19Block(page, staticServer.origin);
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
    await gotoNavbar19Block(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-surface')
          .trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rn19-root] .ren-nav');
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
