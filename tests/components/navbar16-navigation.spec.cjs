// @ts-check
/**
 * Navbar 16 — Logo-Left Action Overlay Menu (nav-logo-left-action-overlay-menu).
 * Isolated Playwright suite. Phase A RED: implementation file is intentionally
 * absent; these tests must fail for missing anatomy / page, not suite wiring.
 *
 * Defining anatomy: full-width bar with permanent action + always-visible toggle;
 * six primary title-only links only inside a full-viewport overlay; overlay footer
 * with one contact + five socials; zero dropdowns/chevrons.
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
} = require('../utils/block-quality.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK_PATH = '/templates/blocks/nav-logo-left-action-overlay-menu.html';
const ROOT = '[data-rn16-root]';

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RN16_RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar16/render-matrix.json'),
    'utf8'
  )
);

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar16Block(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response, 'HTTP response for logo-left action overlay menu block').toBeTruthy();
  expect(
    response.status(),
    'navbar16 block must not 404 — implement templates/blocks/nav-logo-left-action-overlay-menu.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-rn16-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

test.describe('Navbar Logo Left Action Overlay Menu (navbar16)', () => {
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

  test('block page loads with ren-nav shell and navbar16 root', async ({ page }) => {
    await gotoNavbar16Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Logo.?Left Action Overlay|Navbar 16|nav-logo-left-action-overlay-menu/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rn16-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('exactly one primary links tree serves desktop tablet and mobile', async ({ page }) => {
    await gotoNavbar16Block(page, staticServer.origin);
    await expect(page.locator('#rn16-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);

    for (const viewport of [
      { width: 1280, height: 900 },
      { width: 834, height: 1112 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#rn16-primary-links')).toBeVisible();
      await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('anatomy: one brand, six primary links, one permanent action, one contact, five socials, one toggle, zero chevrons', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar16Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-brand`)).toHaveCount(1);
    await expect(page.locator('#rn16-primary-links > li')).toHaveCount(6);
    await expect(page.locator('#rn16-primary-links > li > a.ren-nav-link')).toHaveCount(6);
    await expect(page.locator(`${ROOT} details, ${ROOT} summary, ${ROOT} .rn16-chevron, ${ROOT} .rn16-disclosure`)).toHaveCount(0);

    await expect(page.locator(`${ROOT} .ren-nav-actions a.ren-btn`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-actions .ren-btn-primary`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rn16-contact`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} a.rn16-social-link`)).toHaveCount(5);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator(`${ROOT} .rn16-panel`)).toBeVisible();
    await expect(page.locator('#rn16-primary-links > li > a.ren-nav-link')).toHaveCount(6);
    await expect(page.locator(`${ROOT} a.rn16-social-link`)).toHaveCount(5);
    await expect(page.locator(`${ROOT} .rn16-contact`)).toHaveCount(1);

    await expect(
      page.locator(`${ROOT} .rmcg-card, ${ROOT} .rmf-feature, ${ROOT} .ren-card, ${ROOT} .ren-menu, ${ROOT} .ren-popover, ${ROOT} ren-collapsible, ${ROOT} .ren-collapsible`)
    ).toHaveCount(0);

    await expect(page.locator(`${ROOT} .rn16-chevron, ${ROOT} .ren-nav-links .rn16-chevron`)).toHaveCount(0);
    await expectSingleVisibleAffordance(
      page,
      [`${ROOT} .ren-nav-toggle`],
      'navbar16 menu toggle / close affordance'
    );
  });

  test('primary destinations are whole title-only anchors without icons groups or descriptions', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar16Block(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();

    const links = page.locator('#rn16-primary-links > li > a.ren-nav-link');
    await expect(links).toHaveCount(6);

    for (let i = 0; i < 6; i += 1) {
      const link = links.nth(i);
      const tagName = await link.evaluate((el) => el.tagName);
      expect(tagName, `primary ${i} tag`).toBe('A');
      await expect(link).toHaveAttribute('href', /.+/);
      const text = (await link.innerText()).trim();
      expect(text.length, `primary ${i} title text`).toBeGreaterThan(0);
      await expect(link.locator('a[href], button, [role="button"], .ren-icon, img, p, small')).toHaveCount(0);
    }

    await expect(page.locator(`${ROOT} .rn16-group, ${ROOT} .rn16-dest-desc, ${ROOT} .rn16-destination-icon`)).toHaveCount(0);
  });

  test('toggle opens and closes at every width; Escape and outside click close the overlay', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar16Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const panel = page.locator(`${ROOT} .rn16-panel`);

    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', 'rn16-panel');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await expect(page.locator('#rn16-primary-links > li > a.ren-nav-link').first()).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();

    await toggle.click();
    await expect(panel).toBeVisible();
    // Click a non-navigating surface outside ren-nav and above the overlay
    // (page heading). The open panel covers the hero under the bar.
    await page.locator('.rn16-page-header h1').click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();

    await toggle.click();
    await expect(panel).toBeVisible();
    await page.locator('#rn16-primary-links > li > a.ren-nav-link').first().click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('overlay state is owned via public ARIA/DOM only (no private ren-nav fields)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar16Block(page, staticServer.origin);

    const probe = await page.evaluate(() => {
      const root = document.querySelector('[data-rn16-root]');
      const host = root?.querySelector('ren-nav');
      const toggle = root?.querySelector('.ren-nav-toggle');
      const panel = root?.querySelector('#rn16-panel');
      if (!host || !toggle || !panel) return { missing: true };

      const scripts = Array.from(document.querySelectorAll('script[type="module"]'));
      const controllerSource = scripts
        .map((node) => node.textContent || '')
        .find((text) => text.includes('initNavLogoLeftActionOverlayMenu') || text.includes('RN16_CONTROLLER'))
        || scripts.map((node) => node.textContent || '').join('\n');

      const touchesPrivate =
        controllerSource.includes('._isOpen')
        || controllerSource.includes("['_isOpen']")
        || controllerSource.includes('["_isOpen"]')
        || controllerSource.includes('._closeMenu')
        || controllerSource.includes("['_closeMenu']")
        || controllerSource.includes('["_closeMenu"]')
        || /_isOpen\s*=/.test(controllerSource)
        || /_closeMenu\s*\(/.test(controllerSource);

      toggle.click();
      const openPublic = {
        ariaExpanded: toggle.getAttribute('aria-expanded'),
        hostDataOpen: host.hasAttribute('data-open'),
        panelDataOpen: panel.hasAttribute('data-open'),
        panelAriaHidden: panel.getAttribute('aria-hidden'),
      };

      // Public state remains consistent after a same-band resize (no private reassert).
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
    expect(
      probe.touchesPrivate,
      'controller must not access private ren-nav _isOpen / _closeMenu'
    ).toBe(false);

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

  test('Escape from a focused overlay destination restores focus to the toggle', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar16Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const panel = page.locator(`${ROOT} .rn16-panel`);
    const destination = page.locator('#rn16-primary-links > li > a.ren-nav-link').first();

    await toggle.click();
    await expect(panel).toBeVisible();
    await destination.focus();
    await expect(destination).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
    await expect(toggle).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.activeElement?.className || document.activeElement?.tagName))
      .toMatch(/ren-nav-toggle/i);
  });

  test('contact and each social destination class close the overlay', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar16Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const panel = page.locator(`${ROOT} .rn16-panel`);

    // Contact destination closes.
    await toggle.click();
    await expect(panel).toBeVisible();
    await page.locator(`${ROOT} .rn16-contact`).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();

    // Each of the five social destinations closes.
    const socialCount = await page.locator(`${ROOT} a.rn16-social-link`).count();
    expect(socialCount).toBe(5);
    for (let i = 0; i < socialCount; i += 1) {
      await toggle.click();
      await expect(panel).toBeVisible();
      await page.locator(`${ROOT} a.rn16-social-link`).nth(i).click();
      await expect(
        toggle,
        `social destination ${i} must close the overlay`
      ).toHaveAttribute('aria-expanded', 'false');
      await expect(panel, `social destination ${i} leaves panel hidden`).toBeHidden();
    }

    // Primary class already closes via ren-nav; reassert for class completeness.
    await toggle.click();
    await expect(panel).toBeVisible();
    await page.locator('#rn16-primary-links > li > a.ren-nav-link').nth(1).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
  });

  test('narrow 320 and 340 viewports keep a full 44px toggle with no root/html overflow', async ({ page }) => {
    for (const width of [320, 340]) {
      await page.setViewportSize({ width, height: 640 });
      await gotoNavbar16Block(page, staticServer.origin);

      const metrics = await page.evaluate(() => {
        const root = document.querySelector('[data-rn16-root]');
        const toggle = document.querySelector('[data-rn16-root] .ren-nav-toggle');
        const brand = document.querySelector('[data-rn16-root] .ren-nav-brand');
        const action = document.querySelector('[data-rn16-root] .ren-nav-actions a.ren-btn-primary');
        const nav = document.querySelector('[data-rn16-root] .ren-nav');
        if (!root || !toggle || !brand || !action || !nav) return null;

        const toggleRect = toggle.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        const brandRect = brand.getBoundingClientRect();
        const actionRect = action.getBoundingClientRect();
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
          toggleFullyInRoot:
            toggleRect.left >= rootRect.left - 0.5
            && toggleRect.right <= rootRect.right + 0.5
            && toggleRect.top >= rootRect.top - 0.5
            && toggleRect.bottom <= Math.max(rootRect.bottom, navRect.bottom) + 0.5,
          toggleFullyInNav:
            toggleRect.left >= navRect.left - 0.5
            && toggleRect.right <= navRect.right + 0.5,
          brandVisible: brandRect.width > 0 && brandRect.height > 0,
          actionVisible: actionRect.width > 0 && actionRect.height > 0,
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
      expect(metrics.toggleFullyInRoot, `${width}px toggle fully inside preview root`).toBe(true);
      expect(metrics.brandVisible, `${width}px brand remains present`).toBe(true);
      expect(metrics.actionVisible, `${width}px permanent action remains present`).toBe(true);
      expect(metrics.htmlOverflowX, `${width}px html overflow-x`).toBeLessThanOrEqual(1);
      expect(metrics.bodyOverflowX, `${width}px body overflow-x`).toBeLessThanOrEqual(1);
      expect(metrics.rootOverflowX, `${width}px root overflow-x`).toBeLessThanOrEqual(1);
      await expectNoOverflow(page, 'html');
    }
  });

  test('permanent top action stays visible while overlay opens; socials and contact live in the panel footer', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar16Block(page, staticServer.origin);

    const action = page.locator(`${ROOT} .ren-nav-actions a.ren-btn-primary`);
    await expect(action).toBeVisible();

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(action).toBeVisible();
    await expect(page.locator(`${ROOT} .rn16-contact`)).toBeVisible();
    await expect(page.locator(`${ROOT} a.rn16-social-link`)).toHaveCount(5);

    for (let i = 0; i < 5; i += 1) {
      const social = page.locator(`${ROOT} a.rn16-social-link`).nth(i);
      await expect(social).toHaveAttribute('href', /.+/);
      const name = await social.getAttribute('aria-label');
      const text = (await social.innerText()).trim();
      expect(
        (name && name.length > 0) || text.length > 0,
        `social ${i} must have an accessible name`
      ).toBeTruthy();
    }
  });

  test('viewport geometry: closed bar chrome, open overlay under bar, no permanent desktop link row, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar16Block(page, staticServer.origin);

    const closed = await page.evaluate(() => {
      const nav = document.querySelector('[data-rn16-root] .ren-nav');
      const brand = document.querySelector('[data-rn16-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rn16-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rn16-root] .ren-nav-toggle');
      const panel = document.querySelector('[data-rn16-root] .rn16-panel');
      const links = document.querySelector('#rn16-primary-links');
      if (!nav || !brand || !actions || !toggle || !panel || !links) return null;
      const navRect = nav.getBoundingClientRect();
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const panelStyle = getComputedStyle(panel);
      const linksStyle = getComputedStyle(links);
      const panelHidden =
        panelStyle.display === 'none'
        || panelStyle.visibility === 'hidden'
        || panel.getBoundingClientRect().height === 0;
      const linksHidden =
        linksStyle.display === 'none'
        || linksStyle.visibility === 'hidden'
        || links.getBoundingClientRect().height === 0;
      return {
        brandLeft: brandRect.left,
        navLeft: navRect.left,
        actionsRight: actionsRect.right,
        toggleRight: toggleRect.right,
        navRight: navRect.right,
        sameRow:
          Math.abs(brandRect.top - actionsRect.top) <= 12
          && Math.abs(actionsRect.top - toggleRect.top) <= 12
          && brandRect.right <= actionsRect.left + 1
          && actionsRect.right <= toggleRect.left + 8,
        panelHidden,
        linksHidden,
        toggleVisible: toggleRect.width > 0 && toggleRect.height > 0,
      };
    });
    expect(closed).toBeTruthy();
    expect(closed.sameRow, 'desktop closed: logo | permanent action | toggle share one row').toBe(true);
    expect(closed.panelHidden, 'closed desktop must hide overlay panel').toBe(true);
    expect(closed.linksHidden, 'closed desktop must not show permanent horizontal primary links').toBe(true);
    expect(closed.toggleVisible, 'toggle remains visible on desktop').toBe(true);
    expect(closed.brandLeft - closed.navLeft, 'logo at bar start').toBeLessThanOrEqual(40);
    expect(closed.navRight - closed.toggleRight, 'toggle hugs bar end').toBeLessThanOrEqual(40);
    await expectNoOverflow(page, 'html');

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator(`${ROOT} .rn16-panel`)).toBeVisible();

    const open = await page.evaluate(() => {
      const nav = document.querySelector('[data-rn16-root] .ren-nav');
      const panel = document.querySelector('[data-rn16-root] .rn16-panel');
      const links = document.querySelector('#rn16-primary-links');
      const contact = document.querySelector('[data-rn16-root] .rn16-contact');
      const socials = document.querySelector('[data-rn16-root] .rn16-social');
      if (!nav || !panel || !links || !contact || !socials) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const contactRect = contact.getBoundingClientRect();
      const socialsRect = socials.getBoundingClientRect();
      return {
        panelTop: panelRect.top,
        navBottom: navRect.bottom,
        panelPosition: getComputedStyle(panel).position,
        panelWidth: Math.round(panelRect.width),
        navWidth: Math.round(navRect.width),
        linksCenterX: linksRect.left + linksRect.width / 2,
        panelCenterX: panelRect.left + panelRect.width / 2,
        contactTop: contactRect.top,
        socialsTop: socialsRect.top,
        linksBottom: linksRect.bottom,
        footerBelowLinks: Math.min(contactRect.top, socialsRect.top) >= linksRect.bottom - 8,
      };
    });
    expect(open).toBeTruthy();
    expect(['absolute', 'fixed']).toContain(open.panelPosition);
    expect(open.panelTop).toBeGreaterThanOrEqual(open.navBottom - 2);
    expect(Math.abs(open.panelWidth - open.navWidth), 'overlay spans bar width').toBeLessThanOrEqual(8);
    expect(
      Math.abs(open.linksCenterX - open.panelCenterX),
      'primary stack is centered in the overlay'
    ).toBeLessThanOrEqual(48);
    expect(open.footerBelowLinks, 'footer band sits under the primary stack').toBe(true);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar16Block(page, staticServer.origin);
    const mobileClosed = await page.evaluate(() => {
      const panel = document.querySelector('[data-rn16-root] .rn16-panel');
      const actions = document.querySelector('[data-rn16-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rn16-root] .ren-nav-toggle');
      if (!panel || !actions || !toggle) return null;
      const panelStyle = getComputedStyle(panel);
      const actionsRect = actions.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      return {
        panelHidden:
          panelStyle.display === 'none'
          || panelStyle.visibility === 'hidden'
          || panel.getBoundingClientRect().height === 0,
        actionVisible: actionsRect.width > 0 && actionsRect.height > 0,
        toggleVisible: toggleRect.width > 0 && toggleRect.height > 0,
        sameRow: Math.abs(actionsRect.top - toggleRect.top) <= 12,
      };
    });
    expect(mobileClosed).toBeTruthy();
    expect(mobileClosed.panelHidden).toBe(true);
    expect(mobileClosed.actionVisible, 'permanent action stays in mobile top row').toBe(true);
    expect(mobileClosed.toggleVisible).toBe(true);
    expect(mobileClosed.sameRow).toBe(true);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator(`${ROOT} .rn16-panel`)).toBeVisible();
    await expectNoOverflow(page, 'html');
  });

  test('tablet uses the same toggle-driven overlay model (no permanent link row)', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoNavbar16Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeVisible();
    await expect(page.locator(`${ROOT} .ren-nav-actions a.ren-btn-primary`)).toBeVisible();

    const closed = await page.evaluate(() => {
      const panel = document.querySelector('[data-rn16-root] .rn16-panel');
      if (!panel) return null;
      const style = getComputedStyle(panel);
      return (
        style.display === 'none'
        || style.visibility === 'hidden'
        || panel.getBoundingClientRect().height === 0
      );
    });
    expect(closed, 'tablet closed hides overlay').toBe(true);

    await toggle.click();
    await expect(page.locator('#rn16-primary-links > li > a.ren-nav-link')).toHaveCount(6);
    await expect(page.locator(`${ROOT} a.rn16-social-link`)).toHaveCount(5);
    await expect(page.locator(`${ROOT} .rn16-contact`)).toBeVisible();
  });

  test('JS-disabled keeps permanent action tree contact and socials usable without toggle', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar16Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator('#rn16-primary-links')).toBeVisible();
    await expect(page.locator('#rn16-primary-links > li > a.ren-nav-link')).toHaveCount(6);
    await expect(page.locator(`${ROOT} .ren-nav-actions a.ren-btn-primary`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rn16-contact`)).toBeVisible();
    await expect(page.locator(`${ROOT} a.rn16-social-link`)).toHaveCount(5);

    for (let i = 0; i < 6; i += 1) {
      await expect(page.locator('#rn16-primary-links > li > a.ren-nav-link').nth(i)).toBeVisible();
    }

    await context.close();
  });

  test('JS-disabled panel is visible and must not carry static aria-hidden=true', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar16Block(page, staticServer.origin);

    const panel = page.locator(`${ROOT} #rn16-panel`);
    await expect(panel).toBeVisible();
    await expect(panel).not.toHaveAttribute('aria-hidden', 'true');
    // Visible PE destinations stay in the accessibility tree (no authored hide).
    const ariaHidden = await panel.getAttribute('aria-hidden');
    expect(ariaHidden === null || ariaHidden === 'false', 'panel must not be aria-hidden when JS is off').toBe(true);
    await expect(page.locator('#rn16-primary-links > li > a.ren-nav-link').first()).toBeVisible();
    await expect(page.locator(`${ROOT} .rn16-contact`)).toBeVisible();

    await context.close();
  });

  test('desktop chrome: single toggle, aligned permanent action and toggle, no chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar16Block(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      [`${ROOT} .ren-nav-toggle`],
      'navbar16 desktop toggle'
    );
    await expect(page.locator(`${ROOT} .rn16-chevron`)).toHaveCount(0);

    await expectAligned(
      page,
      [
        `${ROOT} .ren-nav-actions a.ren-btn-primary`,
        `${ROOT} .ren-nav-toggle`,
      ],
      'centerY',
      4
    );
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar16Block(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rn16-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, .ren-nav-toggle, a.rn16-social-link, a.rn16-contact, a.ren-nav-link'
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
    await gotoNavbar16Block(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rn16-panel', '.rn16-primary-link', 'a.rn16-social-link', '.rn16-contact'];
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
    for (const state of RN16_RENDER_MATRIX.states) {
      if (!state.javaScript) continue;

      if (state.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }

      await page.setViewportSize(state.viewport);
      await gotoNavbar16Block(page, staticServer.origin);

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

  test('navbar16 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoNavbar16Block(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
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
    await gotoNavbar16Block(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rn16-root] .ren-nav');
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
