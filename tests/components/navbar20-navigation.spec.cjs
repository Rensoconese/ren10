// @ts-check
/**
 * Navbar 20 — Logo-Left Center Links Overlay Panel
 * (nav-logo-left-center-links-overlay-panel)
 *
 * Isolated suite: does not modify blocks-navigation.spec.cjs.
 * Phase A RED: implementation file may be absent; failures must be missing
 * anatomy / page, not broken suite wiring.
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
const BLOCK =
  '/templates/blocks/nav-logo-left-center-links-overlay-panel.html';
const ROOT = '[data-rn20-root]';

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar20Block(page, origin) {
  const response = await page.goto(`${origin}${BLOCK}`);
  expect(response, 'HTTP response for logo-left center-links overlay panel block').toBeTruthy();
  expect(
    response.status(),
    'navbar20 block must not 404 — implement templates/blocks/nav-logo-left-center-links-overlay-panel.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-rn20-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RN20_RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar20/render-matrix.json'),
    'utf8'
  )
);

test.describe('Navbar Logo Left Center Links Overlay Panel (navbar20)', () => {
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

  test('block page loads with ren-nav shell and navbar20 root', async ({ page }) => {
    await gotoNavbar20Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Logo.?Left Center Links Overlay|Navbar 20|nav-logo-left-center-links-overlay-panel/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator(`${ROOT} ren-nav`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav.ren-nav`)).toHaveCount(1);
    await expect(page.locator('#rn20-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav nav`)).toHaveCount(0);
  });

  test('exactly one primary links tree; overlay is a separate non-nav region', async ({ page }) => {
    await gotoNavbar20Block(page, staticServer.origin);
    await expect(page.locator('#rn20-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator('#rn20-overlay')).toHaveCount(1);
    await expect(page.locator('#rn20-overlay')).toHaveAttribute('role', /region|dialog/);
    await expect(page.locator('#rn20-overlay nav')).toHaveCount(0);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rn20-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#rn20-primary-links')).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn20-overlay')).toBeVisible();
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
  });

  test('anatomy: brand, four primary entries, three destinations, toggle, chevron, ten overlay links, newsletter, contact, five socials', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar20Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-brand`)).toHaveCount(1);

    await expect(page.locator('#rn20-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rn20-primary-links > li > a.ren-nav-link');
    const dropdownSummaries = page.locator('#rn20-primary-links > li > .rn20-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(dropdownSummaries).toHaveCount(1);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeVisible();
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute('aria-controls', 'rn20-overlay');
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute('aria-label', /.+/);

    await page.locator('.rn20-disclosure > summary').click();
    await expect(page.locator('.rn20-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rn20-panel')).toBeVisible();
    await expect(page.locator('a.rn20-destination')).toHaveCount(3);
    await expect(
      page.locator('.rn20-destination-icon, .rn20-dest-desc, .rn20-group, .rn20-group-label')
    ).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rn20-disclosure summary .rn20-chevron'],
      'navbar20 dropdown chevron'
    );
    await expect(page.locator('.rn20-chevron')).toHaveCount(1);

    // Overlay content is always authored; open to inspect.
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator('#rn20-overlay')).toBeVisible();
    await expect(page.locator('a.rn20-menu-link')).toHaveCount(10);
    await expect(page.locator(`${ROOT} form.rn20-newsletter`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} form.rn20-newsletter input[type="email"]`)).toHaveCount(1);
    await expect(
      page.locator(`${ROOT} form.rn20-newsletter button[type="submit"], ${ROOT} form.rn20-newsletter .ren-btn`)
    ).toHaveCount(1);
    await expect(page.locator(`${ROOT} form.rn20-newsletter .ren-btn-secondary, ${ROOT} form.rn20-newsletter button.ren-btn`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rn20-terms a[href]`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .rn20-contact a[href]`)).toHaveCount(2);
    await expect(page.locator(`${ROOT} .rn20-address`)).toHaveCount(1);
    await expect(page.locator('a.rn20-social')).toHaveCount(5);

    await expect(
      page.locator('.rmcg-card, .rmf-feature, .rmi-panel, .ren-card, .ren-menu, .ren-popover, ren-collapsible, .ren-collapsible')
    ).toHaveCount(0);
  });

  test('title-only destinations are whole anchors without icons, groups, or descriptions', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar20Block(page, staticServer.origin);
    await page.locator('.rn20-disclosure > summary').click();

    const links = page.locator('a.rn20-destination');
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

    await expect(page.locator('.rn20-group, .rn20-group-label, .rn20-dest-desc, .rn20-destination-icon')).toHaveCount(0);
  });

  test('summary opens by click, keyboard, and desktop pointer hover; click pins; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar20Block(page, staticServer.origin);

    const disclosure = page.locator('.rn20-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rn20-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rn20-destination').first()).toBeVisible();

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
    await expect(page.locator('a.rn20-destination').first()).toBeVisible();

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
    await gotoNavbar20Block(page, staticServer.origin);

    const disclosure = page.locator('.rn20-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.locator(`${ROOT} .ren-nav-brand`).click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rn20-destination').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('overlay toggle opens full panel, hides desktop primary row, Escape restores focus to toggle', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar20Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const overlay = page.locator('#rn20-overlay');
    const primary = page.locator('#rn20-primary-links');

    await expect(toggle).toBeVisible();
    await expect(primary).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(overlay).toBeVisible();
    await expect(page.locator('a.rn20-menu-link').first()).toBeVisible();
    await expect(primary).toBeHidden();
    await expect(page.locator('a.rn20-menu-link')).toHaveCount(10);
    // Closed-by-default after enhancement uses aria-hidden only when closed.
    await expect(overlay).not.toHaveAttribute('aria-hidden', 'true');

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(overlay).toBeHidden();
    await expect(overlay).toHaveAttribute('aria-hidden', 'true');
    await expect(primary).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('ren-nav-toggle'))).toBe(true);

    await toggle.click();
    await expect(overlay).toBeVisible();
    await toggle.click();
    await expect(overlay).toBeHidden();
  });

  test('Escape from a real overlay link restores focus to the toggle', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar20Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await toggle.click();
    await expect(page.locator('#rn20-overlay')).toBeVisible();

    const menuLink = page.locator('a.rn20-menu-link').first();
    await menuLink.focus();
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('rn20-menu-link'))).toBe(true);

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#rn20-overlay')).toBeHidden();
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('ren-nav-toggle'))).toBe(true);
  });

  test('menu links, privacy, phone/email, and social close the overlay and restore toggle focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1100 });
    await gotoNavbar20Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const overlay = page.locator('#rn20-overlay');

    async function reopen() {
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(overlay).toBeVisible();
      await expect(page.locator('a.rn20-menu-link').first()).toBeVisible();
    }

    async function expectClosedWithToggleFocus(label) {
      await expect(toggle, label).toHaveAttribute('aria-expanded', 'false');
      await expect(overlay, label).toBeHidden();
      await expect
        .poll(
          () => page.evaluate(() => document.activeElement?.classList.contains('ren-nav-toggle')),
          { message: `${label}: focus must return to toggle, not a hidden anchor` }
        )
        .toBe(true);
    }

    // Five activation classes: menu-link, privacy (terms), phone, email, social.
    await reopen();
    await page.locator('a.rn20-menu-link').first().click();
    await expectClosedWithToggleFocus('rn20-menu-link');

    await reopen();
    await page.locator(`${ROOT} .rn20-terms a[href]`).click();
    await expectClosedWithToggleFocus('rn20-terms privacy');

    await reopen();
    const phone = page.locator(`${ROOT} .rn20-contact a[href]`).first();
    await phone.evaluate((link) => link.addEventListener('click', (event) => event.preventDefault(), { once: true }));
    await phone.click();
    await expectClosedWithToggleFocus('rn20-contact phone');

    await reopen();
    const email = page.locator(`${ROOT} .rn20-contact a[href]`).nth(1);
    await email.evaluate((link) => link.addEventListener('click', (event) => event.preventDefault(), { once: true }));
    await email.click();
    await expectClosedWithToggleFocus('rn20-contact email');

    await reopen();
    await page.locator('a.rn20-social').first().click();
    await expectClosedWithToggleFocus('rn20-social');
  });

  test('same-band desktop resizes and 769→768 preserve open; only real band crossing closes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar20Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const overlay = page.locator('#rn20-overlay');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(overlay).toBeVisible();

    // Same-band width change (still ≥48rem / 768px desktop).
    await page.setViewportSize({ width: 1024, height: 900 });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(overlay).toBeVisible();
    await expect(page.locator('a.rn20-menu-link').first()).toBeVisible();

    // Same-band height-only change.
    await page.setViewportSize({ width: 1024, height: 700 });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(overlay).toBeVisible();

    // 769→768: both desktop at 48rem; must stay open.
    await page.setViewportSize({ width: 769, height: 800 });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.setViewportSize({ width: 768, height: 800 });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(overlay).toBeVisible();

    // Real crossing into mobile band closes.
    await page.setViewportSize({ width: 767, height: 800 });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(overlay).toBeHidden();
  });

  test('primary links display/rect policy is coherent at 767 mobile and 768/769 desktop', async ({ page }) => {
    await gotoNavbar20Block(page, staticServer.origin);

    /**
     * @param {number} width
     */
    async function measurePrimary(width) {
      await page.setViewportSize({ width, height: 900 });
      // Closed overlay so desktop primary row is eligible to show.
      const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
      if ((await toggle.getAttribute('aria-expanded')) === 'true') {
        await toggle.click();
      }

      return page.evaluate((viewportWidth) => {
        const links = document.querySelector('#rn20-primary-links');
        const first = links?.querySelector(':scope > li > a.ren-nav-link, :scope > li > .rn20-disclosure > summary');
        if (!links) return null;
        const style = getComputedStyle(links);
        const rect = links.getBoundingClientRect();
        const firstRect = first instanceof Element ? first.getBoundingClientRect() : null;
        const desktopMq = window.matchMedia('(min-width: 48rem)').matches;
        return {
          viewportWidth,
          desktopMq,
          display: style.display,
          visibility: style.visibility,
          position: style.position,
          width: rect.width,
          height: rect.height,
          firstWidth: firstRect?.width ?? 0,
          firstHeight: firstRect?.height ?? 0,
        };
      }, width);
    }

    const at767 = await measurePrimary(767);
    const at768 = await measurePrimary(768);
    const at769 = await measurePrimary(769);

    expect(at767, '767 metrics').toBeTruthy();
    expect(at768, '768 metrics').toBeTruthy();
    expect(at769, '769 metrics').toBeTruthy();

    // JS + CSS band: only below 48rem is mobile.
    expect(at767.desktopMq, '767 is mobile MQ').toBe(false);
    expect(at768.desktopMq, '768 is desktop MQ').toBe(true);
    expect(at769.desktopMq, '769 is desktop MQ').toBe(true);

    // 767: primary tree must not paint as a desktop row.
    expect(at767.display, '767 display').toBe('none');
    expect(at767.width, '767 width').toBe(0);
    expect(at767.height, '767 height').toBe(0);

    // 768/769: inclusive desktop — real flex row with positive geometry
    // (overrides ren-nav max-width:48rem mobile collapse at exact 48rem).
    for (const sample of [at768, at769]) {
      expect(sample.display, `${sample.viewportWidth} display`).not.toBe('none');
      expect(['flex', 'inline-flex']).toContain(sample.display);
      expect(sample.position, `${sample.viewportWidth} position`).toBe('static');
      expect(sample.width, `${sample.viewportWidth} width`).toBeGreaterThan(40);
      expect(sample.height, `${sample.viewportWidth} height`).toBeGreaterThan(20);
      expect(sample.firstWidth, `${sample.viewportWidth} first peer width`).toBeGreaterThan(20);
      expect(sample.firstHeight, `${sample.viewportWidth} first peer height`).toBeGreaterThan(20);
    }
  });

  test('mobile closed is logo+toggle only; open reveals overlay stack; primary row stays absent', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoNavbar20Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#rn20-primary-links')).toBeHidden();
    await expect(page.locator('#rn20-overlay')).toBeHidden();

    const closed = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn20-root] .ren-nav-brand');
      const toggleEl = document.querySelector('[data-rn20-root] .ren-nav-toggle');
      if (!brand || !toggleEl) return null;
      const brandRect = brand.getBoundingClientRect();
      const toggleRect = toggleEl.getBoundingClientRect();
      return {
        brandTop: brandRect.top,
        toggleTop: toggleRect.top,
        toggleVisible: toggleRect.width > 0 && toggleRect.height > 0,
      };
    });
    expect(closed).toBeTruthy();
    expect(closed.toggleVisible).toBe(true);
    expect(Math.abs(closed.brandTop - closed.toggleTop)).toBeLessThanOrEqual(12);

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn20-overlay')).toBeVisible();
    await expect(page.locator('#rn20-primary-links')).toBeHidden();
    await expect(page.locator('a.rn20-menu-link')).toHaveCount(10);
    await expect(page.locator('a.rn20-social')).toHaveCount(5);
  });

  test('breakpoint crossing closes overlay and disclosure; desktop hover policy restores', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar20Block(page, staticServer.origin);

    const disclosure = page.locator('.rn20-disclosure');
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);

    await page.locator('.rn20-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn20-overlay')).toBeVisible();
    await expect(page.locator('a.rn20-menu-link').first()).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');

    const summary = page.locator('.rn20-disclosure > summary');
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-brand`).hover();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('JS-disabled exposes overlay destinations without static aria-hidden; accessible snapshot', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar20Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator('a.rn20-menu-link')).toHaveCount(10);
    await expect(page.locator('a.rn20-menu-link').first()).toBeVisible();
    await expect(page.locator(`${ROOT} form.rn20-newsletter`)).toBeVisible();
    await expect(page.locator(`${ROOT} .rn20-contact`)).toBeVisible();
    await expect(page.locator('a.rn20-social')).toHaveCount(5);

    // P0: no static aria-hidden=true on the progressive overlay.
    await expect(page.locator('#rn20-overlay')).not.toHaveAttribute('aria-hidden', 'true');
    const hidden = await page.locator('#rn20-overlay').getAttribute('aria-hidden');
    expect(hidden === null || hidden === 'false').toBeTruthy();

    const snapshot = await page.locator(ROOT).ariaSnapshot();
    expect(snapshot, 'JS-off overlay links must appear in accessible snapshot').toMatch(/Home|Product|Solutions/i);
    expect(snapshot, 'JS-off newsletter heading must appear in accessible snapshot').toMatch(/Stay informed|Subscribe|Email/i);
    expect(snapshot, 'JS-off contact must appear in accessible snapshot').toMatch(/Get in touch|hello@|555/i);

    await context.close();
  });

  test('demo chrome has no horizontal document overflow at 320 and 340', async ({ page }) => {
    for (const width of [340, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoNavbar20Block(page, staticServer.origin);

      const overflow = await page.evaluate((viewportWidth) => {
        const doc = document.documentElement;
        const body = document.body;
        return {
          width: viewportWidth,
          docScrollWidth: doc.scrollWidth,
          docClientWidth: doc.clientWidth,
          bodyScrollWidth: body.scrollWidth,
          bodyClientWidth: body.clientWidth,
        };
      }, width);

      expect(
        overflow.docScrollWidth,
        `html scrollWidth at ${width}px`
      ).toBeLessThanOrEqual(overflow.docClientWidth + 1);
      expect(
        overflow.bodyScrollWidth,
        `body scrollWidth at ${width}px`
      ).toBeLessThanOrEqual(overflow.bodyClientWidth + 1);
    }
  });

  test('JS-disabled desktop keeps native disclosure usable', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    await gotoNavbar20Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator('#rn20-primary-links')).toBeVisible();
    await page.locator('.rn20-disclosure > summary').click();
    await expect(page.locator('.rn20-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('a.rn20-destination')).toHaveCount(3);

    await context.close();
  });

  test('viewport geometry: full-width bar, centered primary, toggle end, overlay under bar, no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar20Block(page, staticServer.origin);

    const shell = await page.evaluate(() => {
      const nav = document.querySelector('[data-rn20-root] .ren-nav');
      const links = document.querySelector('#rn20-primary-links');
      const brand = document.querySelector('[data-rn20-root] .ren-nav-brand');
      const toggle = document.querySelector('[data-rn20-root] .ren-nav-toggle');
      const preview = document.querySelector('[data-rn20-root]');
      if (!nav || !links || !brand || !toggle || !preview) return null;
      const navRect = nav.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const brandRect = brand.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      const previewRect = preview.getBoundingClientRect();
      return {
        navCenterX: navRect.left + navRect.width / 2,
        linksCenterX: linksRect.left + linksRect.width / 2,
        brandLeft: brandRect.left,
        brandRight: brandRect.right,
        linksLeft: linksRect.left,
        linksRight: linksRect.right,
        toggleLeft: toggleRect.left,
        toggleRight: toggleRect.right,
        navLeft: navRect.left,
        navRight: navRect.right,
        previewWidth: previewRect.width,
        navWidth: navRect.width,
        sideBySide:
          Math.abs(brandRect.top - linksRect.top) <= 12
          && Math.abs(toggleRect.top - linksRect.top) <= 12
          && brandRect.right <= linksRect.left + 1
          && linksRect.right <= toggleRect.left + 1,
        toggleVisible: toggleRect.width > 0 && toggleRect.height > 0,
      };
    });
    expect(shell).toBeTruthy();
    expect(shell.sideBySide, 'desktop logo / centered primary / toggle share one row').toBe(true);
    expect(shell.toggleVisible, 'toggle remains visible on desktop').toBe(true);
    expect(Math.abs(shell.linksCenterX - shell.navCenterX), 'primary row is geometrically centered').toBeLessThanOrEqual(40);
    expect(shell.brandLeft - shell.navLeft, 'logo at start').toBeLessThanOrEqual(40);
    expect(shell.navRight - shell.toggleRight, 'toggle at end').toBeLessThanOrEqual(40);
    expect(Math.abs(shell.navWidth - shell.previewWidth), 'full-width bar (not floating inset card)').toBeLessThanOrEqual(24);

    await page.locator('.rn20-disclosure > summary').click();
    await expect(page.locator('.rn20-panel')).toBeVisible();

    const desktopDropdown = await page.evaluate(() => {
      const nav = document.querySelector('[data-rn20-root] .ren-nav');
      const panel = document.querySelector('.rn20-panel');
      const summary = document.querySelector('.rn20-disclosure > summary');
      if (!nav || !panel || !summary) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const summaryRect = summary.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
        panelWidth: Math.round(panelRect.width),
        panelCenterX: panelRect.left + panelRect.width / 2,
        summaryCenterX: summaryRect.left + summaryRect.width / 2,
        overlapsBar: panelRect.top < navRect.bottom - 2 && panelRect.bottom > navRect.top + 2,
      };
    });
    expect(desktopDropdown).toBeTruthy();
    expect(desktopDropdown.panelPosition).toBe('absolute');
    expect(desktopDropdown.panelTop).toBeGreaterThanOrEqual(desktopDropdown.navBottom - 1);
    expect(desktopDropdown.overlapsBar, 'narrow dropdown must not cover the bar').toBe(false);
    expect(desktopDropdown.panelWidth).toBeGreaterThanOrEqual(120);
    expect(desktopDropdown.panelWidth).toBeLessThanOrEqual(280);
    expect(Math.abs(desktopDropdown.panelCenterX - desktopDropdown.summaryCenterX)).toBeLessThanOrEqual(24);
    await expectNoOverflow(page, 'html');

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator('#rn20-overlay')).toBeVisible();

    const overlayGeo = await page.evaluate(() => {
      const nav = document.querySelector('[data-rn20-root] .ren-nav');
      const overlay = document.querySelector('#rn20-overlay');
      if (!nav || !overlay) return null;
      const navRect = nav.getBoundingClientRect();
      const overlayRect = overlay.getBoundingClientRect();
      return {
        overlayTop: overlayRect.top,
        navBottom: navRect.bottom,
        underBar: overlayRect.top >= navRect.bottom - 2,
        fullWidth: Math.abs(overlayRect.width - navRect.width) <= 8,
      };
    });
    expect(overlayGeo).toBeTruthy();
    expect(overlayGeo.underBar, 'overlay sits under the bar').toBe(true);
    expect(overlayGeo.fullWidth, 'overlay spans bar width').toBe(true);
    await expectNoOverflow(page, 'html');
  });

  test('tablet keeps always-visible toggle; desktop shell for primary when closed', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoNavbar20Block(page, staticServer.origin);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeVisible();
    await expect(page.locator('#rn20-primary-links')).toBeVisible();
    await page.locator('.rn20-disclosure > summary').click();
    await expect(page.locator('a.rn20-destination')).toHaveCount(3);
  });

  test('desktop chrome: single chevron, neutral details, aligned top-level peers', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar20Block(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rn20-disclosure summary .rn20-chevron'],
      'navbar20 desktop chevron'
    );

    const peerLinks = page.locator('#rn20-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rn20-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rn20-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rn20-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rn20-disclosure > summary');
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

    await expect(page.locator('.rn20-disclosure summary .rn20-chevron')).toHaveCount(1);

    await page.locator('.rn20-disclosure > summary').click();
    await expect(page.locator('.rn20-disclosure')).toHaveAttribute('open', '');
    const openChrome = await page.evaluate(() => {
      const summary = document.querySelector('.rn20-disclosure > summary');
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

  test('single close icon in open toggle; no duplicate chevrons', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar20Block(page, staticServer.origin);

    await expect(page.locator('.rn20-chevron')).toHaveCount(1);
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expectSingleVisibleAffordance(
      page,
      [`${ROOT} .ren-nav-toggle`],
      'navbar20 single menu/close toggle'
    );
    await expect(page.locator('.rn20-chevron')).toHaveCount(1);
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar20Block(page, staticServer.origin);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rn20-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, a.rn20-destination, a.rn20-menu-link, a.rn20-social, input'
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
    await gotoNavbar20Block(page, staticServer.origin);
    await page.locator('.rn20-disclosure > summary').click();
    await page.locator(`${ROOT} .ren-nav-toggle`).click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rn20-panel', '.rn20-chevron', 'a.rn20-destination', '#rn20-overlay', '.ren-nav-toggle span'];
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
    for (const state of RN20_RENDER_MATRIX.states) {
      if (!state.javaScript) continue;

      if (state.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }

      await page.setViewportSize(state.viewport);
      await gotoNavbar20Block(page, staticServer.origin);

      await page.evaluate((theme) => {
        document.documentElement.setAttribute('data-theme', theme);
      }, state.theme);

      for (const action of state.actions) {
        if (action.type === 'click') {
          await page.locator(action.selector).click();
        } else if (action.type === 'hover') {
          // Enter from a neutral target so pointerenter on the disclosure fires.
          await page.locator(`${ROOT} .ren-nav-brand`).hover({ force: true });
          await page.locator(action.selector).hover({ force: true });
        }
      }

      for (const [selector, count] of Object.entries(state.expectedMarkers)) {
        await expect(
          page.locator(selector),
          `${state.id} expects ${count}× ${selector}`
        ).toHaveCount(count);
      }

      // Open overlay states must expose visible menu content (not only DOM counts).
      if (String(state.id).includes('overlay-open')) {
        await expect(
          page.locator('#rn20-overlay'),
          `${state.id} overlay visible`
        ).toBeVisible();
        await expect(
          page.locator('a.rn20-menu-link').first(),
          `${state.id} first menu link visible`
        ).toBeVisible();
        await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute('aria-expanded', 'true');
      }

      if (String(state.id).includes('dropdown-open')) {
        await expect(page.locator('.rn20-disclosure')).toHaveAttribute('open', '');
        await expect(page.locator('a.rn20-destination').first()).toBeVisible();
      }

      if (String(state.id).includes('hover-open')) {
        await expect
          .poll(async () => page.locator('.rn20-disclosure').evaluate((el) => el instanceof HTMLDetailsElement && el.open))
          .toBe(true);
        await expect(page.locator('a.rn20-destination').first()).toBeVisible();
      }
    }
  });

  test('navbar20 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoNavbar20Block(page, staticServer.origin);
    await injectAxe(page);
    await checkA11y(page, ROOT, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await checkA11y(page, ROOT, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });

  test('light and dark surfaces resolve through RenDS tokens', async ({ page }) => {
    await gotoNavbar20Block(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const colors = await page.evaluate(() => {
        const surface = getComputedStyle(document.documentElement).getPropertyValue('--color-surface').trim();
        const text = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();
        const nav = document.querySelector('[data-rn20-root] .ren-nav');
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
