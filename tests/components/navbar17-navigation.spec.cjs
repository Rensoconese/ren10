// @ts-check
/**
 * Isolated Navbar 17 suite — Fullscreen Logo-Left Menu Social
 * (nav-logo-left-fullscreen-menu-social).
 *
 * Does not edit the shared blocks-navigation suite.
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
  inspectNativeChrome,
} = require('../utils/block-quality.cjs');

const PKG_ROOT = path.resolve(__dirname, '../..');
const BLOCK_PATH = '/templates/blocks/nav-logo-left-fullscreen-menu-social.html';
const ROOT = '[data-rn17-root]';
const TOGGLE = `${ROOT} .ren-nav-toggle`;
const LINKS = '#rn17-primary-links';
const MENU = '.rn17-menu';

/** @type {{ version: number, path: string, root: string, states: Array<object> }} */
const RN17_RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar17/render-matrix.json'),
    'utf8'
  )
);

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar17Block(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response, 'HTTP response for navbar17 block').toBeTruthy();
  expect(
    response.status(),
    'navbar17 block must not 404 — implement templates/blocks/nav-logo-left-fullscreen-menu-social.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-rn17-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function openMenu(page) {
  const toggle = page.locator(TOGGLE);
  await expect(toggle).toBeVisible();
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
    await toggle.click();
  }
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator(MENU)).toBeVisible();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} theme
 */
async function setTheme(page, theme) {
  await page.evaluate((value) => {
    document.documentElement.setAttribute('data-theme', value);
  }, theme);
}

test.describe('Navbar Logo Left Fullscreen Menu Social (navbar17)', () => {
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

  test('block page loads with ren-nav shell and navbar17 root', async ({ page }) => {
    await gotoNavbar17Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Fullscreen Menu Social|Logo.?Left Fullscreen|Navbar 17|nav-logo-left-fullscreen-menu-social/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator(`${ROOT} ren-nav`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav.ren-nav`)).toHaveCount(1);
    await expect(page.locator(LINKS)).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav nav`)).toHaveCount(0);
  });

  test('exactly one primary links tree serves desktop tablet and mobile', async ({ page }) => {
    await gotoNavbar17Block(page, staticServer.origin);
    await expect(page.locator(LINKS)).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);

    for (const size of [
      { width: 1280, height: 900 },
      { width: 834, height: 1112 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(size);
      const toggle = page.locator(TOGGLE);
      await expect(toggle).toBeVisible();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator(LINKS)).toBeVisible();
      await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    }
  });

  test('anatomy: one brand, eight links, one top action, one contact, five socials, one toggle, zero chevrons', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar17Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-brand`)).toHaveCount(1);
    await expect(page.locator(`${LINKS} > li`)).toHaveCount(8);
    await expect(page.locator(`${LINKS} > li > a.ren-nav-link`)).toHaveCount(8);
    await expect(page.locator(`${ROOT} .rn17-disclosure, ${ROOT} details, ${ROOT} [popover]`)).toHaveCount(0);

    await expect(page.locator(`${ROOT} .ren-nav-actions a.ren-btn`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-actions a.ren-btn-primary`)).toHaveCount(1);
    await expect(page.locator(TOGGLE)).toHaveCount(1);

    await openMenu(page);
    await expect(page.locator(`${ROOT} .rn17-contact`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rn17-social a`)).toHaveCount(5);
    await expect(page.locator(`${ROOT} .rn17-chevron, ${ROOT} .rn17-disclosure .rn17-chevron`)).toHaveCount(0);
    await expect(
      page.locator(`${ROOT} .rmcg-card, ${ROOT} .rmf-feature, ${ROOT} .ren-card, ${ROOT} .ren-menu, ${ROOT} .ren-popover, ${ROOT} ren-collapsible, ${ROOT} ren-sheet`)
    ).toHaveCount(0);

    await expectSingleVisibleAffordance(page, [TOGGLE], 'navbar17 menu toggle');
    await expect(page.locator(`${TOGGLE} span`)).toHaveCount(3);
  });

  test('primary destinations are whole anchors without icons groups or descriptions', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar17Block(page, staticServer.origin);
    await openMenu(page);

    const links = page.locator(`${LINKS} > li > a.ren-nav-link`);
    await expect(links).toHaveCount(8);

    for (let i = 0; i < 8; i += 1) {
      const link = links.nth(i);
      const tagName = await link.evaluate((el) => el.tagName);
      expect(tagName, `destination ${i} tag`).toBe('A');
      await expect(link).toHaveAttribute('href', /.+/);
      const text = (await link.innerText()).trim();
      expect(text.length, `destination ${i} title text`).toBeGreaterThan(0);
      await expect(link.locator('a[href], button, [role="button"], .ren-icon, img, p, small')).toHaveCount(0);
    }
  });

  test('toggle opens and closes; Escape restores focus to toggle', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar17Block(page, staticServer.origin);

    const toggle = page.locator(TOGGLE);
    await expect(toggle).toHaveAttribute('aria-label', /.+/);
    await expect(toggle).toHaveAttribute('aria-controls', 'rn17-primary-links');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(MENU)).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator(MENU)).toBeVisible();
    await expect(page.locator(`${LINKS} > li > a.ren-nav-link`).first()).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(MENU)).toBeHidden();
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('ren-nav-toggle'))).toBe(true);

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('outside click and destination activation close the overlay', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar17Block(page, staticServer.origin);

    const toggle = page.locator(TOGGLE);
    await openMenu(page);

    await page.locator(`${ROOT} .rn17-hero`).click({ position: { x: 20, y: 20 } });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator(MENU)).toBeHidden();

    await openMenu(page);
    await page.locator(`${LINKS} > li > a.ren-nav-link`).first().click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await openMenu(page);
    await page.locator(`${ROOT} .rn17-contact`).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await openMenu(page);
    await page.locator(`${ROOT} .rn17-social a`).first().click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('desktop geometry: logo left, action+toggle right, open overlay under bar', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar17Block(page, staticServer.origin);

    await expect(page.locator(TOGGLE)).toBeVisible();
    await expect(page.locator(`${ROOT} .ren-nav-actions a.ren-btn`)).toBeVisible();

    const geometry = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn17-root] .ren-nav-brand');
      const action = document.querySelector('[data-rn17-root] .ren-nav-actions');
      const toggle = document.querySelector('[data-rn17-root] .ren-nav-toggle');
      const nav = document.querySelector('[data-rn17-root] .ren-nav');
      if (!brand || !action || !toggle || !nav) return null;
      const b = brand.getBoundingClientRect();
      const a = action.getBoundingClientRect();
      const t = toggle.getBoundingClientRect();
      const n = nav.getBoundingClientRect();
      return {
        brandLeft: b.left,
        actionLeft: a.left,
        toggleLeft: t.left,
        brandCenterY: b.top + b.height / 2,
        actionCenterY: a.top + a.height / 2,
        toggleCenterY: t.top + t.height / 2,
        navBottom: n.bottom,
        navWidth: n.width,
        viewportWidth: window.innerWidth,
      };
    });
    expect(geometry).toBeTruthy();
    expect(geometry.brandLeft).toBeLessThan(geometry.actionLeft);
    expect(geometry.actionLeft).toBeLessThanOrEqual(geometry.toggleLeft + 1);
    expect(Math.abs(geometry.brandCenterY - geometry.toggleCenterY)).toBeLessThan(12);
    expect(geometry.navWidth).toBeGreaterThan(geometry.viewportWidth * 0.9);

    await openMenu(page);
    const openGeom = await page.evaluate(() => {
      const nav = document.querySelector('[data-rn17-root] .ren-nav');
      const menu = document.querySelector('[data-rn17-root] .rn17-menu');
      const first = document.querySelector('#rn17-primary-links > li > a.ren-nav-link');
      if (!nav || !menu || !first) return null;
      const n = nav.getBoundingClientRect();
      const m = menu.getBoundingClientRect();
      const f = first.getBoundingClientRect();
      const style = getComputedStyle(first);
      return {
        menuTop: m.top,
        navBottom: n.bottom,
        menuHeight: m.height,
        firstTextAlign: style.textAlign,
        firstJustify: style.justifyContent,
        firstRight: f.right,
        menuRight: m.right,
      };
    });
    expect(openGeom).toBeTruthy();
    expect(Math.abs(openGeom.menuTop - openGeom.navBottom)).toBeLessThan(4);
    expect(openGeom.menuHeight).toBeGreaterThan(400);
    expect(openGeom.menuRight - openGeom.firstRight).toBeLessThan(48);
  });

  test('tablet and mobile: bar chrome remains logo + action + toggle; open panel stacks footer', async ({ page }) => {
    for (const size of [
      { width: 834, height: 1112 },
      { width: 390, height: 844 },
    ]) {
      await page.setViewportSize(size);
      await gotoNavbar17Block(page, staticServer.origin);

      await expect(page.locator(`${ROOT} .ren-nav-brand`)).toBeVisible();
      await expect(page.locator(`${ROOT} .ren-nav-actions a.ren-btn`)).toBeVisible();
      await expect(page.locator(TOGGLE)).toBeVisible();
      await expect(page.locator(MENU)).toBeHidden();

      await openMenu(page);
      await expect(page.locator(`${LINKS} > li > a.ren-nav-link`)).toHaveCount(8);
      await expect(page.locator(`${ROOT} .rn17-contact`)).toBeVisible();
      await expect(page.locator(`${ROOT} .rn17-social a`)).toHaveCount(5);

      const footerOrder = await page.evaluate(() => {
        const contact = document.querySelector('[data-rn17-root] .rn17-contact');
        const social = document.querySelector('[data-rn17-root] .rn17-social');
        const firstLink = document.querySelector('#rn17-primary-links > li > a.ren-nav-link');
        if (!contact || !social || !firstLink) return null;
        const c = contact.getBoundingClientRect();
        const s = social.getBoundingClientRect();
        const l = firstLink.getBoundingClientRect();
        return {
          contactTop: c.top,
          socialTop: s.top,
          linkBottom: l.bottom,
          contactLeft: c.left,
          socialLeft: s.left,
        };
      });
      expect(footerOrder).toBeTruthy();
      expect(footerOrder.contactTop).toBeGreaterThan(footerOrder.linkBottom - 1);
      expect(footerOrder.socialTop).toBeGreaterThan(footerOrder.linkBottom - 1);
      expect(footerOrder.contactLeft).toBeLessThan(footerOrder.socialLeft);
    }
  });

  test('JS-disabled path exposes the tree footer and top action without toggle chrome', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      await page.setViewportSize({ width: 390, height: 1100 });
      const response = await page.goto(`${staticServer.origin}${BLOCK_PATH}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator(ROOT)).toHaveCount(1);
      await expect(page.locator(TOGGLE)).toBeHidden();
      await expect(page.locator(LINKS)).toBeVisible();
      await expect(page.locator(`${LINKS} > li > a.ren-nav-link`)).toHaveCount(8);
      await expect(page.locator(`${ROOT} .rn17-contact`)).toBeVisible();
      await expect(page.locator(`${ROOT} .rn17-social a`)).toHaveCount(5);
      await expect(page.locator(`${ROOT} .ren-nav-actions a.ren-btn`)).toBeVisible();
    } finally {
      await context.close();
    }
  });

  test('touch targets focus rings light dark tokens and reduced motion', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar17Block(page, staticServer.origin);
    await openMenu(page);

    const targets = [
      `${ROOT} .ren-nav-brand`,
      TOGGLE,
      `${ROOT} .ren-nav-actions a.ren-btn`,
      `${LINKS} > li > a.ren-nav-link`,
      `${ROOT} .rn17-contact`,
      `${ROOT} .rn17-social a`,
    ];
    for (const selector of targets) {
      const box = await page.locator(selector).first().boundingBox();
      expect(box, selector).toBeTruthy();
      expect(box.height, `${selector} height`).toBeGreaterThanOrEqual(44);
      expect(box.width, `${selector} width`).toBeGreaterThanOrEqual(44);
    }

    await page.locator(TOGGLE).focus();
    const focusVisible = await page.locator(TOGGLE).evaluate((el) => {
      const style = getComputedStyle(el);
      return style.outlineStyle !== 'none' && style.outlineWidth !== '0px';
    });
    expect(focusVisible).toBe(true);

    for (const theme of ['light', 'dark']) {
      await setTheme(page, theme);
      await openMenu(page);
      const colors = await page.evaluate(() => {
        const nav = document.querySelector('[data-rn17-root] .ren-nav');
        const menu = document.querySelector('[data-rn17-root] .rn17-menu');
        if (!nav || !menu) return null;
        return {
          navBg: getComputedStyle(nav).backgroundColor,
          menuBg: getComputedStyle(menu).backgroundColor,
          text: getComputedStyle(nav).color,
        };
      });
      expect(colors?.navBg).toBeTruthy();
      expect(colors?.menuBg).toBeTruthy();
      expect(colors?.text).not.toBe('rgba(0, 0, 0, 0)');
    }

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await openMenu(page);
    const motion = await page.evaluate(() => {
      const menu = document.querySelector('[data-rn17-root] .rn17-menu');
      const toggleSpan = document.querySelector('[data-rn17-root] .ren-nav-toggle span');
      if (!menu || !toggleSpan) return null;
      return {
        menuTransition: getComputedStyle(menu).transitionDuration,
        spanTransition: getComputedStyle(toggleSpan).transitionDuration,
      };
    });
    expect(motion).toBeTruthy();
    expect(motion.menuTransition === '0s' || motion.menuTransition.includes('0s')).toBe(true);
  });

  test('no horizontal overflow and no duplicate close affordances', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar17Block(page, staticServer.origin);
    await expectNoOverflow(page, 'html');
    await expectNoOverflow(page, ROOT);
    await openMenu(page);
    await expectNoOverflow(page, 'html');
    await expectNoOverflow(page, ROOT);
    await expect(page.locator(`${ROOT} .ren-sheet-close, ${ROOT} [data-sheet-close], ${ROOT} .rn17-close`)).toHaveCount(0);
    await expectSingleVisibleAffordance(page, [TOGGLE], 'navbar17 single close/toggle');
  });

  test('peer alignment of bar cluster and end-aligned open links', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar17Block(page, staticServer.origin);
    await expectAligned(
      page,
      [`${ROOT} .ren-nav-brand`, `${ROOT} .ren-nav-actions`, TOGGLE],
      'centerY',
      14
    );
    await openMenu(page);
    const firstTwo = await page.evaluate(() => {
      const links = [...document.querySelectorAll('#rn17-primary-links > li > a.ren-nav-link')].slice(0, 2);
      return links.map((el) => {
        const r = el.getBoundingClientRect();
        return { right: r.right, centerY: r.top + r.height / 2 };
      });
    });
    expect(firstTwo.length).toBe(2);
    expect(Math.abs(firstTwo[0].right - firstTwo[1].right)).toBeLessThan(2);
  });

  test('native chrome inspection and axe WCAG 2.1 AA on open overlay', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar17Block(page, staticServer.origin);
    await openMenu(page);

    const menuChrome = await inspectNativeChrome(page, MENU);
    expect(menuChrome).toBeTruthy();
    const linkChrome = await inspectNativeChrome(page, `${LINKS} > li > a.ren-nav-link`);
    expect(linkChrome).toBeTruthy();

    await injectAxe(page);
    await checkA11y(page, ROOT, {
      detailedReport: true,
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });

  test('render matrix contract is present with expected states', async () => {
    expect(RN17_RENDER_MATRIX.version).toBe(1);
    expect(RN17_RENDER_MATRIX.path).toBe(BLOCK_PATH);
    expect(RN17_RENDER_MATRIX.root).toBe(ROOT);
    expect(RN17_RENDER_MATRIX.states.length).toBeGreaterThanOrEqual(8);
    const ids = RN17_RENDER_MATRIX.states.map((state) => state.id);
    for (const required of [
      'desktop-light-closed',
      'desktop-light-open',
      'mobile-light-open',
      'mobile-js-disabled-open',
      'desktop-reduced-motion-open',
    ]) {
      expect(ids, required).toContain(required);
    }
  });
});
