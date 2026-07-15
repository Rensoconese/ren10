// @ts-check
/**
 * Isolated Navbar 22 suite — sticky logo / centered bar dropdown /
 * fullscreen contact overlay (nav-sticky-logo-center-dropdown-fullscreen-contact).
 *
 * Phase A RED: production HTML is intentionally absent until failures are recorded.
 * Does not edit shared blocks-navigation.spec.cjs.
 */
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { injectAxe, checkA11y } = require('axe-playwright');
const {
  expectAligned,
  expectNoOverflow,
  expectSingleVisibleAffordance,
  inspectNativeChrome,
} = require('../utils/block-quality.cjs');
const { startStaticServer } = require('../utils/static-server.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK_PATH = '/templates/blocks/nav-sticky-logo-center-dropdown-fullscreen-contact.html';
const ROOT = '[data-rn22-root]';

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RN22_RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar22/render-matrix.json'),
    'utf8'
  )
);

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar22Block(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response, 'HTTP response for navbar22 block').toBeTruthy();
  expect(
    response.status(),
    'navbar22 block must not 404 — implement templates/blocks/nav-sticky-logo-center-dropdown-fullscreen-contact.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-rn22-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

test.describe('Navbar Sticky Logo Center Dropdown Fullscreen Contact (navbar22)', () => {
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

  test('block page loads with ren-nav shell and navbar22 root', async ({ page }) => {
    await gotoNavbar22Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Sticky Logo.?Center Dropdown Fullscreen Contact|Navbar 22|nav-sticky-logo-center-dropdown-fullscreen-contact/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator(`${ROOT} ren-nav`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav.ren-nav`)).toHaveCount(1);
    await expect(page.locator('#rn22-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('one primary landmark and bar tree; overlay is dialog not nested nav', async ({ page }) => {
    await gotoNavbar22Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} nav.ren-nav`)).toHaveCount(1);
    await expect(page.locator('#rn22-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rn22-overlay`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rn22-overlay`)).toHaveAttribute('role', 'dialog');
    await expect(page.locator(`${ROOT} .rn22-overlay nav`)).toHaveCount(0);
    await expect(page.locator('nav nav')).toHaveCount(0);
  });

  test('anatomy: brand, four bar entries, three destinations, eight large links, form, details, socials, toggle, chevron', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar22Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-brand`)).toHaveCount(1);

    await expect(page.locator('#rn22-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rn22-primary-links > li > a.ren-nav-link');
    const dropdownSummaries = page.locator('#rn22-primary-links > li > .rn22-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(dropdownSummaries).toHaveCount(1);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute('aria-controls', 'rn22-overlay');

    await page.locator('.rn22-disclosure > summary').click();
    await expect(page.locator('.rn22-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rn22-panel')).toBeVisible();
    await expect(page.locator('a.rn22-destination')).toHaveCount(3);
    await expect(
      page.locator('.rn22-destination-icon, .rn22-dest-desc, .rn22-group, .rn22-group-label')
    ).toHaveCount(0);
    await expect(
      page.locator('a.rn22-destination .ren-icon, a.rn22-destination img, a.rn22-destination .ren-stack-xs')
    ).toHaveCount(0);

    await expect(page.locator('a.rn22-menu-link')).toHaveCount(8);
    await expect(page.locator(`${ROOT} form.rn22-contact-form`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} form.rn22-contact-form input[type="text"], ${ROOT} form.rn22-contact-form input:not([type]), ${ROOT} form.rn22-contact-form input[name="name"]`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} form.rn22-contact-form input[type="email"]`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} form.rn22-contact-form textarea`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} form.rn22-contact-form input[type="checkbox"]`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} form.rn22-contact-form button[type="submit"], ${ROOT} form.rn22-contact-form .ren-btn[type="submit"]`)).toHaveCount(1);

    await expect(page.locator(`${ROOT} .rn22-contact-phone`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rn22-contact-email`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rn22-contact-address`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} a.rn22-social`)).toHaveCount(5);

    await expect(
      page.locator('.rmcg-card, .rmf-feature, .rmi-panel, .ren-card, .ren-menu, .ren-popover, ren-collapsible, .ren-collapsible, ren-sheet')
    ).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rn22-disclosure summary .rn22-chevron'],
      'navbar22 dropdown chevron'
    );
    await expect(page.locator('.rn22-chevron')).toHaveCount(1);
  });

  test('title-only destinations are whole anchors without icons, groups, or descriptions', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar22Block(page, staticServer.origin);
    await page.locator('.rn22-disclosure > summary').click();

    const links = page.locator('a.rn22-destination');
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
  });

  test('desktop geometry: logo start, centered bar tree, end toggle; sticky shell', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar22Block(page, staticServer.origin);

    const geometry = await page.evaluate(() => {
      const root = document.querySelector('[data-rn22-root]');
      const brand = root?.querySelector('.ren-nav-brand');
      const links = root?.querySelector('#rn22-primary-links');
      const toggle = root?.querySelector('.ren-nav-toggle');
      const nav = root?.querySelector('.ren-nav');
      if (!brand || !links || !toggle || !nav) return null;
      const brandRect = brand.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const navRect = nav.getBoundingClientRect();
      const navStyle = getComputedStyle(nav);
      return {
        brandLeft: brandRect.left,
        linksCenter: linksRect.left + linksRect.width / 2,
        toggleRight: toggleRect.right,
        navCenter: navRect.left + navRect.width / 2,
        navWidth: navRect.width,
        brandBeforeLinks: brandRect.right <= linksRect.left + 8,
        linksBeforeToggle: linksRect.right <= toggleRect.left + 8,
        sticky: navStyle.position === 'sticky' || nav.classList.contains('ren-nav-sticky'),
        toggleVisible: toggleRect.width > 0 && getComputedStyle(toggle).display !== 'none',
        linksVisible: linksRect.width > 0 && getComputedStyle(links).display !== 'none',
      };
    });

    expect(geometry).toBeTruthy();
    expect(geometry.toggleVisible, 'toggle visible on desktop').toBe(true);
    expect(geometry.linksVisible, 'bar links visible on desktop').toBe(true);
    expect(geometry.brandBeforeLinks, 'logo before centered menu').toBe(true);
    expect(geometry.linksBeforeToggle, 'menu before toggle').toBe(true);
    expect(Math.abs(geometry.linksCenter - geometry.navCenter) <= geometry.navWidth * 0.12, 'menu roughly centered').toBe(true);
    expect(geometry.sticky, 'sticky shell').toBe(true);
  });

  test('tablet/mobile closed: logo + toggle only; bar tree not an under-bar mobile list', async ({ page }) => {
    // Ren10 desktop shell starts at 48rem (768px). 834 is desktop-class geometry
    // (centered bar visible + always-visible toggle). Sub-48rem widths hide the bar tree.
    for (const viewport of [
      { width: 834, height: 1112, label: 'tablet-desktop-shell', expectBarLinks: true },
      { width: 767, height: 1024, label: 'tablet-compact', expectBarLinks: false },
      { width: 390, height: 844, label: 'mobile', expectBarLinks: false },
    ]) {
      await page.setViewportSize(viewport);
      await gotoNavbar22Block(page, staticServer.origin);

      const closed = await page.evaluate((label) => {
        const root = document.querySelector('[data-rn22-root]');
        const brand = root?.querySelector('.ren-nav-brand');
        const links = root?.querySelector('#rn22-primary-links');
        const toggle = root?.querySelector('.ren-nav-toggle');
        const overlay = root?.querySelector('.rn22-overlay');
        if (!brand || !links || !toggle || !overlay) return { label, missing: true };
        const brandRect = brand.getBoundingClientRect();
        const linksStyle = getComputedStyle(links);
        const linksRect = links.getBoundingClientRect();
        const toggleRect = toggle.getBoundingClientRect();
        const overlayStyle = getComputedStyle(overlay);
        const overlayHidden =
          overlay.hasAttribute('hidden')
          || overlay.getAttribute('aria-hidden') === 'true'
          || overlayStyle.visibility === 'hidden'
          || overlayStyle.display === 'none'
          || !root.hasAttribute('data-menu-open');
        return {
          label,
          missing: false,
          toggleVisible: toggleRect.width > 0 && getComputedStyle(toggle).display !== 'none',
          brandVisible: brandRect.width > 0,
          linksHidden:
            linksStyle.display === 'none'
            || linksStyle.visibility === 'hidden'
            || linksRect.height === 0,
          linksNotUnderBarPanel:
            linksStyle.position !== 'absolute'
            || linksStyle.display === 'none'
            || linksRect.height === 0,
          sameTopRow: Math.abs(brandRect.top - toggleRect.top) <= 16,
          overlayClosed: overlayHidden,
          toggleExpanded: toggle.getAttribute('aria-expanded'),
        };
      }, viewport.label);

      expect(closed.missing, viewport.label).toBe(false);
      expect(closed.toggleVisible, `${viewport.label} toggle`).toBe(true);
      expect(closed.brandVisible, `${viewport.label} brand`).toBe(true);
      if (viewport.expectBarLinks) {
        expect(closed.linksHidden, `${viewport.label} bar tree visible on desktop shell`).toBe(false);
      } else {
        expect(closed.linksHidden, `${viewport.label} bar tree hidden when closed`).toBe(true);
      }
      expect(closed.linksNotUnderBarPanel, `${viewport.label} no under-bar mobile tree`).toBe(true);
      expect(closed.sameTopRow, `${viewport.label} logo+toggle top row`).toBe(true);
      expect(closed.overlayClosed, `${viewport.label} overlay closed`).toBe(true);
      expect(closed.toggleExpanded).toBe('false');
    }
  });

  test('toggle opens fullscreen overlay with eight large links and contact form', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar22Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const overlay = page.locator(`${ROOT} .rn22-overlay`);

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(overlay).toBeVisible();
    await expect(page.locator('a.rn22-menu-link').first()).toBeVisible();
    await expect(page.locator('a.rn22-menu-link')).toHaveCount(8);
    await expect(page.locator(`${ROOT} form.rn22-contact-form`)).toBeVisible();

    const fullscreen = await page.evaluate(() => {
      const overlayEl = document.querySelector('[data-rn22-root] .rn22-overlay');
      if (!overlayEl) return null;
      const rect = overlayEl.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        vw: window.innerWidth,
        vh: window.innerHeight,
      };
    });
    expect(fullscreen).toBeTruthy();
    expect(fullscreen.width, 'overlay width').toBeGreaterThanOrEqual(fullscreen.vw * 0.9);
    expect(fullscreen.height, 'overlay height').toBeGreaterThanOrEqual(fullscreen.vh * 0.85);

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('summary opens by click, keyboard, and desktop pointer hover; click pins; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar22Block(page, staticServer.origin);

    const disclosure = page.locator('.rn22-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rn22-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rn22-destination').first()).toBeVisible();

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
    await expect(page.locator('a.rn22-destination').first()).toBeVisible();

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
    await gotoNavbar22Block(page, staticServer.origin);

    const disclosure = page.locator('.rn22-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.locator(`${ROOT} .ren-nav-brand`).click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rn22-destination').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('Escape closes overlay and returns focus to toggle', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar22Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(`${ROOT} .rn22-overlay`)).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('ren-nav-toggle'))).toBe(true);
  });

  test('mobile toggle opens overlay; bar tree stays hidden; large links visible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1100 });
    await gotoNavbar22Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('a.rn22-menu-link').first()).toBeVisible();
    await expect(page.locator('a.rn22-menu-link')).toHaveCount(8);
    await expect(page.locator(`${ROOT} form.rn22-contact-form`)).toBeVisible();

    const barHidden = await page.evaluate(() => {
      const links = document.querySelector('#rn22-primary-links');
      if (!links) return false;
      const style = getComputedStyle(links);
      const rect = links.getBoundingClientRect();
      return style.display === 'none' || style.visibility === 'hidden' || rect.height === 0;
    });
    expect(barHidden, 'bar tree remains hidden under mobile overlay mode').toBe(true);
  });

  test('JS-disabled: inert toggle hidden; large links and form usable', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 1100 } });
    const page = await context.newPage();
    const response = await page.goto(`${staticServer.origin}${BLOCK_PATH}`);
    expect(response?.status()).toBe(200);

    await expect(page.locator(ROOT)).toHaveCount(1);
    await expect(page.locator('a.rn22-menu-link')).toHaveCount(8);
    await expect(page.locator('a.rn22-menu-link').first()).toBeVisible();
    await expect(page.locator(`${ROOT} form.rn22-contact-form`)).toBeVisible();
    await expect(page.locator(`${ROOT} form.rn22-contact-form input[type="email"]`)).toBeVisible();
    await expect(page.locator(`${ROOT} a.rn22-social`)).toHaveCount(5);

    const toggleHidden = await page.evaluate(() => {
      const toggle = document.querySelector('[data-rn22-root] .ren-nav-toggle');
      if (!toggle) return true;
      const style = getComputedStyle(toggle);
      return style.display === 'none' || style.visibility === 'hidden';
    });
    expect(toggleHidden, 'inert toggle hidden without JS').toBe(true);

    await context.close();
  });

  test('desktop chrome: single chevron, neutral details, aligned top-level peers', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar22Block(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rn22-disclosure summary .rn22-chevron'],
      'navbar22 desktop chevron'
    );

    const peerLinks = page.locator('#rn22-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rn22-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rn22-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rn22-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rn22-disclosure > summary');
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

    await expect(page.locator('.rn22-disclosure summary .rn22-chevron')).toHaveCount(1);
    await expect(page.locator('.rn22-chevron')).toHaveCount(1);
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar22Block(page, staticServer.origin);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rn22-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, a.rn22-destination, a.rn22-menu-link, a.rn22-social'
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
    await gotoNavbar22Block(page, staticServer.origin);
    await page.locator('.rn22-disclosure > summary').click();
    await page.locator(`${ROOT} .ren-nav-toggle`).click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rn22-panel', '.rn22-chevron', 'a.rn22-destination', '.rn22-overlay', 'a.rn22-menu-link'];
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
    for (const state of RN22_RENDER_MATRIX.states) {
      if (!state.javaScript) continue;

      if (state.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }

      await page.setViewportSize(state.viewport);
      await gotoNavbar22Block(page, staticServer.origin);

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

  test('no horizontal overflow on closed and open overlay states', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar22Block(page, staticServer.origin);
    await expectNoOverflow(page, 'html');
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expectNoOverflow(page, 'html');
    await expectNoOverflow(page, ROOT);
  });

  test('navbar22 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar22Block(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator(`${ROOT} .rn22-overlay`)).toBeVisible();
    await expect(page.locator('a.rn22-menu-link').first()).toBeVisible();
    await expect(page.locator(`${ROOT} form.rn22-contact-form button[type="submit"]`)).toBeVisible();
    // Ensure form paint/layout settles so axe contrast samples solid surfaces.
    await page.locator(`${ROOT} form.rn22-contact-form button[type="submit"]`).scrollIntoViewIfNeeded();
    await page.locator('a.rn22-menu-link').first().scrollIntoViewIfNeeded();
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
    await gotoNavbar22Block(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rn22-root] .ren-nav');
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
