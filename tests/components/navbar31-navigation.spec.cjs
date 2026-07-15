// @ts-check
/**
 * Navbar 31 — Logo CTA Right Sheet Contact (nav-logo-cta-right-sheet-contact).
 * Isolated Playwright suite. Phase A RED: implementation file is intentionally
 * absent; these tests must fail for missing anatomy / page, not suite wiring.
 *
 * Defining anatomy: full-width bar with permanent action + always-visible
 * toggle; five primary title-only links only inside a right-edge sheet;
 * contact cluster + five socials; zero dropdowns/chevrons.
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
const BLOCK_PATH = '/templates/blocks/nav-logo-cta-right-sheet-contact.html';
const ROOT = '[data-rn31-root]';

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RN31_RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar31/render-matrix.json'),
    'utf8'
  )
);

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar31Block(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response, 'HTTP response for logo-cta right sheet contact block').toBeTruthy();
  expect(
    response.status(),
    'navbar31 block must not 404 — implement templates/blocks/nav-logo-cta-right-sheet-contact.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-rn31-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function openSheet(page) {
  const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator(`${ROOT} ren-sheet`)).toHaveAttribute('open', '');
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function expectSheetClosed(page) {
  const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator(`${ROOT} ren-sheet`)).not.toHaveAttribute('open', '');
}

test.describe('Navbar Logo CTA Right Sheet Contact (navbar31)', () => {
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

  test('block page loads with ren-sheet shell and navbar31 root', async ({ page }) => {
    await gotoNavbar31Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Logo.?CTA Right Sheet|Navbar 31|nav-logo-cta-right-sheet-contact/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator(`${ROOT} ren-sheet`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} ren-sheet[side="right"], ${ROOT} ren-sheet[data-side="right"]`)).toHaveCount(1);
    await expect(page.locator('#rn31-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav[aria-label]`)).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('exactly one primary links tree serves desktop tablet and mobile', async ({ page }) => {
    await gotoNavbar31Block(page, staticServer.origin);
    await expect(page.locator('#rn31-primary-links')).toHaveCount(1);

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
      await expect(page.locator('#rn31-primary-links')).toBeVisible();
      await expect(page.locator('#rn31-primary-links')).toHaveCount(1);
      await page.locator(`${ROOT} .ren-sheet-close`).click();
      await expectSheetClosed(page);
    }
  });

  test('anatomy: one brand, five primary links, one permanent action, contact cluster, five socials, one toggle, zero chevrons', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar31Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-brand`)).toHaveCount(1);
    await expect(page.locator('#rn31-primary-links > li')).toHaveCount(5);
    await expect(page.locator('#rn31-primary-links > li > a.rn31-primary-link')).toHaveCount(5);
    await expect(page.locator(`${ROOT} details, ${ROOT} summary, ${ROOT} .rn31-chevron, ${ROOT} .rn31-disclosure`)).toHaveCount(0);

    await expect(page.locator(`${ROOT} .ren-nav-actions a.ren-btn`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-actions .ren-btn-primary`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rn31-contact`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rn31-contact-title`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} a.rn31-contact-phone`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} a.rn31-contact-email`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rn31-contact-address`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} a.rn31-social-link`)).toHaveCount(5);
    await expect(page.locator(`${ROOT} .ren-sheet-close`)).toHaveCount(1);

    await openSheet(page);
    await expect(page.locator('#rn31-primary-links > li > a.rn31-primary-link')).toHaveCount(5);
    await expect(page.locator(`${ROOT} a.rn31-social-link`)).toHaveCount(5);
    await expect(page.locator(`${ROOT} .rn31-contact`)).toHaveCount(1);

    await expect(
      page.locator(`${ROOT} .rmcg-card, ${ROOT} .rmf-feature, ${ROOT} .ren-card, ${ROOT} .ren-menu, ${ROOT} .ren-popover, ${ROOT} ren-collapsible, ${ROOT} .ren-collapsible`)
    ).toHaveCount(0);

    await expect(page.locator(`${ROOT} .rn31-chevron`)).toHaveCount(0);
    await page.locator(`${ROOT} .ren-sheet-close`).click();
    await expectSheetClosed(page);
    await expectSingleVisibleAffordance(
      page,
      [`${ROOT} .ren-nav-toggle`],
      'navbar31 menu toggle affordance when closed'
    );
  });

  test('primary destinations are whole title-only anchors without icons groups or descriptions', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar31Block(page, staticServer.origin);
    await openSheet(page);

    const links = page.locator('#rn31-primary-links > li > a.rn31-primary-link');
    await expect(links).toHaveCount(5);

    for (let i = 0; i < 5; i += 1) {
      const link = links.nth(i);
      const tagName = await link.evaluate((el) => el.tagName);
      expect(tagName, `primary ${i} tag`).toBe('A');
      await expect(link).toHaveAttribute('href', /.+/);
      const text = (await link.innerText()).trim();
      expect(text.length, `primary ${i} title text`).toBeGreaterThan(0);
      await expect(link.locator('a[href], button, [role="button"], .ren-icon, img, p, small')).toHaveCount(0);
    }

    await expect(page.locator(`${ROOT} .rn31-group, ${ROOT} .rn31-dest-desc, ${ROOT} .rn31-destination-icon`)).toHaveCount(0);
  });

  test('toggle opens and closes at every width; Escape and outside click close the sheet', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar31Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const sheet = page.locator(`${ROOT} ren-sheet`);

    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', 'rn31-sheet');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(sheet).not.toHaveAttribute('open', '');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(sheet).toHaveAttribute('open', '');
    await expect(page.locator('#rn31-primary-links > li > a.rn31-primary-link').first()).toBeVisible();

    await page.keyboard.press('Escape');
    await expectSheetClosed(page);

    await toggle.click();
    await expect(sheet).toHaveAttribute('open', '');
    // Backdrop / outside the dialog surface closes the sheet.
    await page.locator(`${ROOT} ren-sheet dialog.ren-sheet`).click({ position: { x: 2, y: 2 }, force: true });
    // If dialog click targets content, fall back to pressing Escape after reopening via backdrop click.
    const stillOpen = await sheet.evaluate((el) => el.hasAttribute('open'));
    if (stillOpen) {
      await page.mouse.click(20, 200);
    }
    await expectSheetClosed(page);

    await toggle.click();
    await expect(sheet).toHaveAttribute('open', '');
    await page.locator('#rn31-primary-links > li > a.rn31-primary-link').first().click();
    await expectSheetClosed(page);
  });

  test('sheet state is owned via public ARIA/DOM only (no private ren-sheet fields)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar31Block(page, staticServer.origin);

    const probe = await page.evaluate(async () => {
      const root = document.querySelector('[data-rn31-root]');
      const sheet = root?.querySelector('ren-sheet');
      const toggle = root?.querySelector('.ren-nav-toggle');
      if (!root || !sheet || !toggle) return { missing: true };

      const scripts = Array.from(document.querySelectorAll('script[type="module"]'));
      const controllerSource = scripts
        .map((node) => node.textContent || '')
        .find((text) => text.includes('initNavLogoCtaRightSheetContact') || text.includes('RN31_CONTROLLER'))
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
      await Promise.resolve();
      const openPublic = {
        ariaExpanded: toggle.getAttribute('aria-expanded'),
        sheetOpenAttr: sheet.hasAttribute('open'),
        sheetOpenGetter: typeof sheet.open === 'boolean' ? sheet.open : null,
      };

      window.dispatchEvent(new Event('resize'));
      await Promise.resolve();
      const afterResize = {
        ariaExpanded: toggle.getAttribute('aria-expanded'),
        sheetOpenAttr: sheet.hasAttribute('open'),
      };

      if (typeof sheet.close === 'function') sheet.close();
      // Allow public ren-close listeners + open-attribute observers to settle.
      await Promise.resolve();
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
      const closedPublic = {
        ariaExpanded: toggle.getAttribute('aria-expanded'),
        sheetOpenAttr: sheet.hasAttribute('open'),
      };

      return { touchesPrivate, openPublic, afterResize, closedPublic };
    });

    expect(probe.missing, 'missing root/sheet/toggle').toBeFalsy();
    expect(
      probe.touchesPrivate,
      'controller must not access private ren-sheet / ren-nav _isOpen / _closeMenu'
    ).toBe(false);

    expect(probe.openPublic.ariaExpanded).toBe('true');
    expect(probe.openPublic.sheetOpenAttr).toBe(true);
    expect(probe.openPublic.sheetOpenGetter).toBe(true);

    expect(probe.afterResize.ariaExpanded).toBe('true');
    expect(probe.afterResize.sheetOpenAttr).toBe(true);

    expect(probe.closedPublic.ariaExpanded).toBe('false');
    expect(probe.closedPublic.sheetOpenAttr).toBe(false);
  });

  test('Escape from a focused menu destination restores focus to the toggle', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar31Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const destination = page.locator('#rn31-primary-links > li > a.rn31-primary-link').first();

    await openSheet(page);
    await destination.focus();
    await expect(destination).toBeFocused();

    await page.keyboard.press('Escape');
    await expectSheetClosed(page);
    await expect(toggle).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.activeElement?.className || document.activeElement?.tagName))
      .toMatch(/ren-nav-toggle/i);
  });

  test('destination close for every destination class including CTA contact phone email and socials', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar31Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);

    // Primary destination closes.
    await openSheet(page);
    await page.locator('#rn31-primary-links > li > a.rn31-primary-link').nth(1).click();
    await expectSheetClosed(page);

    // Contact phone closes.
    await openSheet(page);
    await page.locator(`${ROOT} a.rn31-contact-phone`).click();
    await expectSheetClosed(page);

    // Contact email closes.
    await openSheet(page);
    await page.locator(`${ROOT} a.rn31-contact-email`).click();
    await expectSheetClosed(page);

    // Each of the five social destinations closes.
    const socialCount = await page.locator(`${ROOT} a.rn31-social-link`).count();
    expect(socialCount).toBe(5);
    for (let i = 0; i < socialCount; i += 1) {
      await openSheet(page);
      await page.locator(`${ROOT} a.rn31-social-link`).nth(i).click();
      await expect(
        toggle,
        `social destination ${i} must close the sheet`
      ).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator(`${ROOT} ren-sheet`), `social ${i}`).not.toHaveAttribute('open', '');
    }

    // Permanent bar CTA closes an open sheet (destination-class completeness).
    // Modal dialog inertness blocks pointer events to bar chrome — exercise the
    // public click handler via a dispatched event rather than a pointer path
    // through the backdrop.
    await openSheet(page);
    await page.evaluate(() => {
      const cta = document.querySelector('[data-rn31-root] .ren-nav-actions a.ren-btn-primary');
      if (!cta) throw new Error('missing permanent bar CTA');
      cta.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    });
    await expectSheetClosed(page);
  });

  test('narrow 320 and 340 viewports keep a full 44px toggle with no root/html overflow', async ({ page }) => {
    for (const width of [320, 340]) {
      await page.setViewportSize({ width, height: 640 });
      await gotoNavbar31Block(page, staticServer.origin);

      const metrics = await page.evaluate(() => {
        const root = document.querySelector('[data-rn31-root]');
        const toggle = document.querySelector('[data-rn31-root] .ren-nav-toggle');
        const brand = document.querySelector('[data-rn31-root] .ren-nav-brand');
        const action = document.querySelector('[data-rn31-root] .ren-nav-actions a.ren-btn-primary');
        const bar = document.querySelector('[data-rn31-root] .rn31-bar');
        if (!root || !toggle || !brand || !action || !bar) return null;

        const toggleRect = toggle.getBoundingClientRect();
        const rootRect = root.getBoundingClientRect();
        const barRect = bar.getBoundingClientRect();
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
            && toggleRect.bottom <= Math.max(rootRect.bottom, barRect.bottom) + 0.5,
          toggleFullyInBar:
            toggleRect.left >= barRect.left - 0.5
            && toggleRect.right <= barRect.right + 0.5,
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
      expect(metrics.toggleFullyInBar, `${width}px toggle fully inside bar`).toBe(true);
      expect(metrics.toggleFullyInRoot, `${width}px toggle fully inside preview root`).toBe(true);
      expect(metrics.brandVisible, `${width}px brand remains present`).toBe(true);
      expect(metrics.actionVisible, `${width}px permanent action remains present`).toBe(true);
      expect(metrics.htmlOverflowX, `${width}px html overflow-x`).toBeLessThanOrEqual(1);
      expect(metrics.bodyOverflowX, `${width}px body overflow-x`).toBeLessThanOrEqual(1);
      expect(metrics.rootOverflowX, `${width}px root overflow-x`).toBeLessThanOrEqual(1);
      await expectNoOverflow(page, 'html');
    }
  });

  test('permanent top action stays visible while sheet opens; contact and socials live in the sheet', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar31Block(page, staticServer.origin);

    const action = page.locator(`${ROOT} .ren-nav-actions a.ren-btn-primary`);
    await expect(action).toBeVisible();

    await openSheet(page);
    await expect(action).toBeVisible();
    await expect(page.locator(`${ROOT} .rn31-contact`)).toBeVisible();
    await expect(page.locator(`${ROOT} a.rn31-contact-phone`)).toHaveAttribute('href', /^tel:/);
    await expect(page.locator(`${ROOT} a.rn31-contact-email`)).toHaveAttribute('href', /^mailto:/);
    await expect(page.locator(`${ROOT} a.rn31-social-link`)).toHaveCount(5);

    for (let i = 0; i < 5; i += 1) {
      const social = page.locator(`${ROOT} a.rn31-social-link`).nth(i);
      await expect(social).toHaveAttribute('href', /.+/);
      const name = await social.getAttribute('aria-label');
      const text = (await social.innerText()).trim();
      expect(
        (name && name.length > 0) || text.length > 0,
        `social ${i} must have an accessible name`
      ).toBeTruthy();
    }
  });

  test('viewport geometry: closed bar chrome, open right-edge sheet, no permanent desktop link row, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar31Block(page, staticServer.origin);

    const closed = await page.evaluate(() => {
      const bar = document.querySelector('[data-rn31-root] .rn31-bar');
      const brand = document.querySelector('[data-rn31-root] .ren-nav-brand');
      const actions = document.querySelector('[data-rn31-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rn31-root] .ren-nav-toggle');
      const sheet = document.querySelector('[data-rn31-root] ren-sheet');
      const links = document.querySelector('#rn31-primary-links');
      if (!bar || !brand || !actions || !toggle || !sheet || !links) return null;
      const barRect = bar.getBoundingClientRect();
      const brandRect = brand.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const dialog = sheet.querySelector('dialog.ren-sheet');
      const linksStyle = getComputedStyle(links);
      const dialogOpen = dialog?.hasAttribute('open') || dialog?.open === true;
      const linksHidden =
        !dialogOpen
        || linksStyle.display === 'none'
        || linksStyle.visibility === 'hidden'
        || links.getBoundingClientRect().height === 0;
      return {
        brandLeft: brandRect.left,
        barLeft: barRect.left,
        actionsRight: actionsRect.right,
        toggleRight: toggleRect.right,
        barRight: barRect.right,
        sameRow:
          Math.abs(brandRect.top - actionsRect.top) <= 12
          && Math.abs(actionsRect.top - toggleRect.top) <= 12
          && brandRect.right <= actionsRect.left + 1
          && actionsRect.right <= toggleRect.left + 8,
        sheetClosed: !sheet.hasAttribute('open'),
        linksHidden,
        toggleVisible: toggleRect.width > 0 && toggleRect.height > 0,
      };
    });
    expect(closed).toBeTruthy();
    expect(closed.sameRow, 'desktop closed: logo | permanent action | toggle share one row').toBe(true);
    expect(closed.sheetClosed, 'closed desktop must not leave sheet open').toBe(true);
    expect(closed.linksHidden, 'closed desktop must not show permanent horizontal primary links').toBe(true);
    expect(closed.toggleVisible, 'toggle remains visible on desktop').toBe(true);
    expect(closed.brandLeft - closed.barLeft, 'logo at bar start').toBeLessThanOrEqual(40);
    expect(closed.barRight - closed.toggleRight, 'toggle hugs bar end').toBeLessThanOrEqual(40);
    await expectNoOverflow(page, 'html');

    await openSheet(page);

    const open = await page.evaluate(() => {
      const sheet = document.querySelector('[data-rn31-root] ren-sheet');
      const dialog = sheet?.querySelector('dialog.ren-sheet');
      const links = document.querySelector('#rn31-primary-links');
      const contact = document.querySelector('[data-rn31-root] .rn31-contact');
      const socials = document.querySelector('[data-rn31-root] .rn31-social');
      if (!sheet || !dialog || !links || !contact || !socials) return null;
      const dialogRect = dialog.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const contactRect = contact.getBoundingClientRect();
      const socialsRect = socials.getBoundingClientRect();
      const vw = window.innerWidth;
      return {
        dialogRight: dialogRect.right,
        viewportWidth: vw,
        dialogWidth: Math.round(dialogRect.width),
        edgeAnchored: Math.abs(dialogRect.right - vw) <= 4 || dialogRect.right >= vw - 4,
        notFullWidth: dialogRect.width < vw * 0.95,
        contactTop: contactRect.top,
        socialsTop: socialsRect.top,
        linksBottom: linksRect.bottom,
        footerBelowLinks: Math.min(contactRect.top, socialsRect.top) >= linksRect.bottom - 8,
        side: dialog.getAttribute('data-side') || sheet.getAttribute('side') || sheet.getAttribute('data-side'),
      };
    });
    expect(open).toBeTruthy();
    expect(open.side, 'sheet data-side/side is right').toBe('right');
    expect(open.edgeAnchored, 'sheet dialog hugs the right viewport edge').toBe(true);
    expect(open.notFullWidth, 'right sheet is partial width, not full under-bar overlay').toBe(true);
    expect(open.footerBelowLinks, 'contact/social stack sits under the primary stack').toBe(true);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar31Block(page, staticServer.origin);
    const mobileClosed = await page.evaluate(() => {
      const sheet = document.querySelector('[data-rn31-root] ren-sheet');
      const actions = document.querySelector('[data-rn31-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rn31-root] .ren-nav-toggle');
      if (!sheet || !actions || !toggle) return null;
      const actionsRect = actions.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      return {
        sheetClosed: !sheet.hasAttribute('open'),
        actionVisible: actionsRect.width > 0 && actionsRect.height > 0,
        toggleVisible: toggleRect.width > 0 && toggleRect.height > 0,
        sameRow: Math.abs(actionsRect.top - toggleRect.top) <= 12,
      };
    });
    expect(mobileClosed).toBeTruthy();
    expect(mobileClosed.sheetClosed).toBe(true);
    expect(mobileClosed.actionVisible, 'permanent action stays in mobile top row').toBe(true);
    expect(mobileClosed.toggleVisible).toBe(true);
    expect(mobileClosed.sameRow).toBe(true);

    await openSheet(page);
    await expectNoOverflow(page, 'html');
  });

  test('tablet uses the same toggle-driven right sheet model (no permanent link row)', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoNavbar31Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeVisible();
    await expect(page.locator(`${ROOT} .ren-nav-actions a.ren-btn-primary`)).toBeVisible();
    await expect(page.locator(`${ROOT} ren-sheet`)).not.toHaveAttribute('open', '');

    await openSheet(page);
    await expect(page.locator('#rn31-primary-links > li > a.rn31-primary-link')).toHaveCount(5);
    await expect(page.locator(`${ROOT} a.rn31-social-link`)).toHaveCount(5);
    await expect(page.locator(`${ROOT} .rn31-contact`)).toBeVisible();
  });

  test('breakpoint seams 767 768 769 keep one tree and toggle-driven sheet', async ({ page }) => {
    for (const width of [767, 768, 769]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoNavbar31Block(page, staticServer.origin);

      await expect(page.locator('#rn31-primary-links')).toHaveCount(1);
      await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeVisible();
      await expect(page.locator(`${ROOT} .ren-nav-actions a.ren-btn-primary`)).toBeVisible();
      await expectSheetClosed(page);

      await openSheet(page);
      await expect(page.locator('#rn31-primary-links > li > a.rn31-primary-link')).toHaveCount(5);
      await expect(page.locator(`${ROOT} a.rn31-social-link`)).toHaveCount(5);

      // Same-breakpoint resize stability: stay open after a no-band resize.
      await page.setViewportSize({ width, height: 901 });
      await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator(`${ROOT} ren-sheet`)).toHaveAttribute('open', '');
    }
  });

  test('JS-disabled keeps permanent action tree contact and socials usable without toggle', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar31Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator('#rn31-primary-links')).toBeVisible();
    await expect(page.locator('#rn31-primary-links > li > a.rn31-primary-link')).toHaveCount(5);
    await expect(page.locator(`${ROOT} .ren-nav-actions a.ren-btn-primary`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rn31-contact`)).toBeVisible();
    await expect(page.locator(`${ROOT} a.rn31-social-link`)).toHaveCount(5);

    for (let i = 0; i < 5; i += 1) {
      await expect(page.locator('#rn31-primary-links > li > a.rn31-primary-link').nth(i)).toBeVisible();
    }

    await context.close();
  });

  test('JS-disabled sheet content is visible and must not carry static aria-hidden=true', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar31Block(page, staticServer.origin);

    const sheet = page.locator(`${ROOT} ren-sheet`);
    await expect(sheet).toBeVisible();
    await expect(sheet).not.toHaveAttribute('aria-hidden', 'true');
    const ariaHidden = await sheet.getAttribute('aria-hidden');
    expect(ariaHidden === null || ariaHidden === 'false', 'sheet must not be aria-hidden when JS is off').toBe(true);
    await expect(page.locator('#rn31-primary-links > li > a.rn31-primary-link').first()).toBeVisible();
    await expect(page.locator(`${ROOT} .rn31-contact`)).toBeVisible();

    await context.close();
  });

  test('desktop chrome: single toggle when closed, aligned permanent action and toggle, no chevron, single close when open', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar31Block(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      [`${ROOT} .ren-nav-toggle`],
      'navbar31 desktop toggle'
    );
    await expect(page.locator(`${ROOT} .rn31-chevron`)).toHaveCount(0);

    await expectAligned(
      page,
      [
        `${ROOT} .ren-nav-actions a.ren-btn-primary`,
        `${ROOT} .ren-nav-toggle`,
      ],
      'centerY',
      4
    );

    await openSheet(page);
    await expect(page.locator(`${ROOT} .ren-sheet-close`)).toHaveCount(1);
    await expectSingleVisibleAffordance(
      page,
      [`${ROOT} .ren-sheet-close`],
      'navbar31 single sheet close icon'
    );
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar31Block(page, staticServer.origin);
    await openSheet(page);

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rn31-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, .ren-nav-toggle, a.rn31-social-link, a.rn31-contact-phone, a.rn31-contact-email, a.rn31-primary-link, .ren-sheet-close'
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
    await gotoNavbar31Block(page, staticServer.origin);
    await openSheet(page);

    const motion = await page.evaluate(() => {
      const selectors = ['.rn31-primary-link', 'a.rn31-social-link', '.rn31-contact-phone', '.rn31-bar'];
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
    for (const state of RN31_RENDER_MATRIX.states) {
      if (!state.javaScript) continue;

      if (state.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }

      await page.setViewportSize(state.viewport);
      await gotoNavbar31Block(page, staticServer.origin);

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

  test('navbar31 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoNavbar31Block(page, staticServer.origin);
    await openSheet(page);
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
    await gotoNavbar31Block(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const bar = document.querySelector('[data-rn31-root] .rn31-bar');
        return {
          surface,
          text,
          barBg: bar ? getComputedStyle(bar).backgroundColor : '',
        };
      });

      expect(colors.surface, theme).toBeTruthy();
      expect(colors.text, theme).toBeTruthy();
      expect(colors.barBg, theme).not.toBe('');
      expect(colors.barBg, theme).not.toMatch(/rgba\(0,\s*0,\s*0,\s*0\)/);
    }
  });
  test('hamburger and close state use the canonical centered Ren10 geometry', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar31Block(page, staticServer.origin);
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const closed = await toggle.locator('span').evaluateAll((spans) => spans.map((span) => {
      const rect = span.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    }));
    expect(closed).toHaveLength(3);
    expect(closed.every(({ width, height }) => width === 24 && height === 2)).toBe(true);

    await openSheet(page);
    await expect.poll(async () => Number(await toggle.locator('span').nth(1).evaluate((span) => (
      getComputedStyle(span).opacity
    )))).toBe(0);
    const open = await toggle.locator('span').evaluateAll((spans) => spans.map((span) => {
      const style = getComputedStyle(span);
      const rect = span.getBoundingClientRect();
      return { opacity: Number(style.opacity), centerY: rect.y + rect.height / 2 };
    }));
    expect(open[1].opacity).toBe(0);
    expect(Math.abs(open[0].centerY - open[2].centerY)).toBeLessThan(0.5);
  });
});
