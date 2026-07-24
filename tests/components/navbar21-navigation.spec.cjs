// @ts-check
/**
 * Isolated Navbar 21 suite — logo-left / center bar links / always-visible
 * fullscreen featured menu (source-neutral slug:
 * nav-logo-center-links-fullscreen-featured).
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
const BLOCK_PATH = '/templates/blocks/nav-logo-center-links-fullscreen-featured.html';
const ROOT = '[data-rn21-root]';

/** @type {{ version: number, path: string, root: string, states: Array<{ id: string, viewport: { width: number, height: number }, theme: string, javaScript: boolean, reducedMotion: boolean, actions: Array<{ type: string, selector: string }>, expectedMarkers: Record<string, number> }> }} */
const RN21_RENDER_MATRIX = JSON.parse(
  fs.readFileSync(
    path.join(PKG_ROOT, 'docs/workflows/relume-to-ren10/modules/navbar21/render-matrix.json'),
    'utf8'
  )
);

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoNavbar21Block(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response, 'HTTP response for navbar21 block').toBeTruthy();
  expect(
    response.status(),
    'navbar21 block must not 404 — implement templates/blocks/nav-logo-center-links-fullscreen-featured.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-rn21-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

test.describe('Navbar Logo Center Links Fullscreen Featured (navbar21)', () => {
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

  test('block page loads with ren-nav shell and navbar21 root', async ({ page }) => {
    await gotoNavbar21Block(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Logo.?Center.?Links.?Fullscreen.?Featured|Navbar 21|nav-logo-center-links-fullscreen-featured/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rn21-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav nav`)).toHaveCount(0);
  });

  test('exactly one bar links tree and one fullscreen panel landmark scope', async ({ page }) => {
    await gotoNavbar21Block(page, staticServer.origin);
    await expect(page.locator('#rn21-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator('#rn21-fullscreen-panel')).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rn21-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn21-fullscreen-panel')).toBeVisible();
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
  });

  test('anatomy: brand, four bar entries, three destinations, eight panel links, featured rail, socials, toggle, chevrons', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar21Block(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-brand`)).toHaveCount(1);

    await expect(page.locator('#rn21-primary-links > li')).toHaveCount(4);
    await expect(page.locator('#rn21-primary-links > li > a.ren-nav-link')).toHaveCount(3);
    await expect(page.locator('#rn21-primary-links > li > .rn21-disclosure > summary')).toHaveCount(1);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute('aria-label', /.+/);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute(
      'aria-controls',
      'rn21-fullscreen-panel'
    );

    await page.locator('.rn21-disclosure > summary').click();
    await expect(page.locator('.rn21-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('a.rn21-destination')).toHaveCount(3);
    await expect(
      page.locator('.rn21-destination-icon, .rn21-dest-desc, .rn21-group, .rn21-group-label')
    ).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rn21-disclosure summary .rn21-chevron'],
      'navbar21 dropdown chevron'
    );
    await expect(page.locator('.rn21-chevron')).toHaveCount(1);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator('#rn21-fullscreen-panel')).toBeVisible();
    await expect(page.locator('a.rn21-menu-link')).toHaveCount(8);
    await expect(page.locator('.rn21-featured-heading')).toHaveCount(1);
    await expect(page.locator('a.rn21-article')).toHaveCount(2);
    await expect(page.locator('a.rn21-view-all')).toHaveCount(1);
    await expect(page.locator('.rn21-view-all-chevron')).toHaveCount(1);
    await expect(page.locator('a.rn21-contact')).toHaveCount(1);
    await expect(page.locator('a.rn21-social')).toHaveCount(5);

    await expect(
      page.locator('.rmcg-card, .rmf-feature, .rmi-panel, .ren-menu, .ren-popover, ren-collapsible')
    ).toHaveCount(0);
  });

  test('title-only bar destinations are whole anchors without nested interactives', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar21Block(page, staticServer.origin);
    await page.locator('.rn21-disclosure > summary').click();

    const links = page.locator('a.rn21-destination');
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

  test('bar disclosure opens by click, keyboard, and desktop pointer hover; click pins; Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar21Block(page, staticServer.origin);

    const disclosure = page.locator('.rn21-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rn21-dropdown-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rn21-destination').first()).toBeVisible();

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
    await expect(page.locator('a.rn21-destination').first()).toBeVisible();

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

  test('outside click and destination activation close the bar disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar21Block(page, staticServer.origin);

    const disclosure = page.locator('.rn21-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.locator(`${ROOT} .ren-nav-brand`).click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rn21-destination').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('fullscreen toggle opens panel, Escape restores focus, and closes on destination', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar21Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const panel = page.locator('#rn21-fullscreen-panel');

    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
    // Non-modal overlay: close control lives in the bar, not a dialog tree.
    await expect(panel).not.toHaveAttribute('role', 'dialog');
    await expect(panel).not.toHaveAttribute('aria-modal', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    await expect(page.locator('a.rn21-menu-link')).toHaveCount(8);

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('ren-nav-toggle'))).toBe(true);

    await toggle.click();
    await expect(panel).toBeVisible();
    await page.locator('a.rn21-menu-link').first().click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('ren-nav-toggle'))).toBe(true);
  });

  test('same-document destination close restores focus off hidden anchors for each panel class', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar21Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const panel = page.locator('#rn21-fullscreen-panel');

    /** @type {Array<{ name: string, selector: string }>} */
    const cases = [
      { name: 'menu-link', selector: 'a.rn21-menu-link' },
      { name: 'article', selector: 'a.rn21-article' },
      { name: 'view-all', selector: 'a.rn21-view-all' },
      { name: 'social', selector: 'a.rn21-social' },
      { name: 'contact', selector: 'a.rn21-contact' },
    ];

    for (const { name, selector } of cases) {
      await toggle.click();
      await expect(panel, `${name}: panel open`).toBeVisible();

      const dest = page.locator(selector).first();
      await expect(dest, `${name}: destination present`).toHaveCount(1);
      await dest.click();

      await expect(panel, `${name}: panel closed`).toBeHidden();
      await expect(toggle, `${name}: aria-expanded false`).toHaveAttribute('aria-expanded', 'false');

      await expect.poll(
        () => page.evaluate(() => {
          const active = document.activeElement;
          if (!(active instanceof HTMLElement)) return false;
          if (!active.classList.contains('ren-nav-toggle')) return false;
          if (active.closest('#rn21-fullscreen-panel')) return false;
          if (active.getClientRects().length === 0) return false;
          return true;
        }),
        { message: `${name}: focus must restore to toggle, not a hidden anchor` }
      ).toBe(true);

      // Active element is not the activated destination (now hidden with the panel).
      const activeIsDestination = await page.evaluate((sel) => {
        const active = document.activeElement;
        return Boolean(active && active.matches?.(sel));
      }, selector);
      expect(activeIsDestination, `${name}: active element must not remain the destination`).toBe(false);
    }
  });

  test('toggle remains visible on desktop and mobile; mobile hides bar links until panel opens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar21Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeVisible();
    await expect(page.locator('#rn21-primary-links')).toBeVisible();

    const desktopGeom = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn21-root] .ren-nav-brand');
      const links = document.querySelector('#rn21-primary-links');
      const t = document.querySelector('[data-rn21-root] .ren-nav-toggle');
      if (!brand || !links || !t) return null;
      const brandRect = brand.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const toggleRect = t.getBoundingClientRect();
      const barCenter = (brandRect.left + toggleRect.right) / 2;
      const linksCenter = linksRect.left + linksRect.width / 2;
      return {
        brandLeftOfLinks: brandRect.right <= linksRect.left + 8,
        toggleRightOfLinks: toggleRect.left >= linksRect.right - 8,
        linksCentered: Math.abs(linksCenter - barCenter) <= 48,
        toggleVisible: toggleRect.width > 0 && toggleRect.height > 0,
      };
    });
    expect(desktopGeom).toBeTruthy();
    expect(desktopGeom.brandLeftOfLinks, 'logo left of center links').toBe(true);
    expect(desktopGeom.toggleRightOfLinks, 'toggle right of center links').toBe(true);
    expect(desktopGeom.linksCentered, 'bar links approximately centered').toBe(true);
    expect(desktopGeom.toggleVisible, 'desktop toggle visible').toBe(true);

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(toggle).toBeVisible();

    const mobileClosed = await page.evaluate(() => {
      const brand = document.querySelector('[data-rn21-root] .ren-nav-brand');
      const links = document.querySelector('#rn21-primary-links');
      const t = document.querySelector('[data-rn21-root] .ren-nav-toggle');
      const panel = document.querySelector('#rn21-fullscreen-panel');
      if (!brand || !links || !t || !panel) return null;
      const brandRect = brand.getBoundingClientRect();
      const toggleRect = t.getBoundingClientRect();
      const linksStyle = getComputedStyle(links);
      const panelStyle = getComputedStyle(panel);
      return {
        brandTop: brandRect.top,
        toggleTop: toggleRect.top,
        linksHidden:
          linksStyle.display === 'none'
          || linksStyle.visibility === 'hidden'
          || links.getBoundingClientRect().height === 0,
        panelHidden:
          panel.hasAttribute('hidden')
          || panelStyle.display === 'none'
          || panelStyle.visibility === 'hidden',
      };
    });
    expect(mobileClosed).toBeTruthy();
    expect(Math.abs(mobileClosed.brandTop - mobileClosed.toggleTop)).toBeLessThanOrEqual(12);
    expect(mobileClosed.linksHidden, 'mobile closed hides bar link list').toBe(true);
    expect(mobileClosed.panelHidden, 'mobile closed hides fullscreen panel').toBe(true);

    await toggle.click();
    await expect(page.locator('#rn21-fullscreen-panel')).toBeVisible();
    await expect(page.locator('a.rn21-menu-link')).toHaveCount(8);
  });

  test('breakpoint crossing closes open disclosure and fullscreen panel', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar21Block(page, staticServer.origin);

    const disclosure = page.locator('.rn21-disclosure');
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);

    await page.locator('.rn21-disclosure > summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(disclosure).not.toHaveAttribute('open', '');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rn21-fullscreen-panel')).toBeVisible();

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#rn21-fullscreen-panel')).toBeHidden();
  });

  test('fullscreen open contains focus: exterior is inert; Tab cannot reach hero/chrome', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar21Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const panel = page.locator('#rn21-fullscreen-panel');

    await toggle.click();
    await expect(panel).toBeVisible();
    // Non-modal expandable overlay (close control is the bar toggle).
    await expect(panel).not.toHaveAttribute('role', 'dialog');
    await expect(panel).not.toHaveAttribute('aria-modal', 'true');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(toggle).toHaveAttribute('aria-controls', 'rn21-fullscreen-panel');

    // Exterior nodes must be inert while open.
    await expect(page.locator('header.dx-nav')).toHaveAttribute('inert', '');
    await expect(page.locator('header.rn21-page-header')).toHaveAttribute('inert', '');
    await expect(page.locator(`${ROOT} .rn21-hero`)).toHaveAttribute('inert', '');
    await expect(page.locator(`${ROOT} .ren-nav-brand`)).toHaveAttribute('inert', '');
    await expect(page.locator('#rn21-primary-links')).toHaveAttribute('inert', '');

    // Focus lands on a panel destination.
    await expect.poll(() => page.evaluate(() => (
      document.activeElement?.classList.contains('rn21-menu-link')
      || document.activeElement?.classList.contains('ren-nav-toggle')
    ))).toBe(true);

    // Walk Tab many times — active element must stay in toggle + panel shell.
    for (let i = 0; i < 24; i += 1) {
      await page.keyboard.press('Tab');
      const location = await page.evaluate(() => {
        const el = document.activeElement;
        if (!(el instanceof Element)) return { ok: false, reason: 'no-active' };
        const inPanel = Boolean(el.closest('#rn21-fullscreen-panel'));
        const isToggle = el.classList.contains('ren-nav-toggle');
        const inHero = Boolean(el.closest('.rn21-hero'));
        const inChrome = Boolean(el.closest('header.dx-nav, header.rn21-page-header'));
        const inBrand = Boolean(el.closest('.ren-nav-brand'));
        const inBarLinks = Boolean(el.closest('#rn21-primary-links'));
        return {
          ok: (inPanel || isToggle) && !inHero && !inChrome && !inBrand && !inBarLinks,
          tag: el.tagName,
          className: el.className?.toString?.().slice(0, 40) || '',
        };
      });
      expect(location.ok, `Tab step ${i}: ${location.tag}.${location.className}`).toBe(true);
    }

    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();

    // Inert restored on close.
    await expect(page.locator('header.dx-nav')).not.toHaveAttribute('inert', '');
    await expect(page.locator(`${ROOT} .rn21-hero`)).not.toHaveAttribute('inert', '');
    await expect(page.locator('#rn21-primary-links')).not.toHaveAttribute('inert', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('ren-nav-toggle'))).toBe(true);
  });

  test('shell seam is exact at 767/768/769 (CSS + JS band)', async ({ page }) => {
    await gotoNavbar21Block(page, staticServer.origin);

    async function bandAt(width) {
      await page.setViewportSize({ width, height: 900 });
      // Allow layout + matchMedia to settle.
      await page.waitForTimeout(30);
      return page.evaluate(() => {
        const links = document.querySelector('#rn21-primary-links');
        const style = links ? getComputedStyle(links) : null;
        const linksVisible = Boolean(
          links
          && style
          && style.display !== 'none'
          && style.visibility !== 'hidden'
          && links.getBoundingClientRect().width > 0
          && links.getBoundingClientRect().height > 0
        );
        return {
          desktopMq: window.matchMedia('(min-width: 768px)').matches,
          linksVisible,
        };
      });
    }

    const at767 = await bandAt(767);
    expect(at767.desktopMq, '767 is below desktop MQ').toBe(false);
    expect(at767.linksVisible, '767 hides bar links').toBe(false);

    const at768 = await bandAt(768);
    expect(at768.desktopMq, '768 matches desktop MQ').toBe(true);
    expect(at768.linksVisible, '768 shows bar links').toBe(true);

    const at769 = await bandAt(769);
    expect(at769.desktopMq, '769 matches desktop MQ').toBe(true);
    expect(at769.linksVisible, '769 shows bar links').toBe(true);
  });

  test('same-band resize keeps fullscreen open; only 768 crossing closes', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 });
    await gotoNavbar21Block(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const panel = page.locator('#rn21-fullscreen-panel');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();

    // Stay on desktop band.
    await page.setViewportSize({ width: 1100, height: 900 });
    await page.waitForTimeout(40);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();

    // Cross down through 768 → close.
    await page.setViewportSize({ width: 700, height: 900 });
    await page.waitForTimeout(40);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();

    // Re-open on mobile band; same-band resize stays open.
    await toggle.click();
    await expect(panel).toBeVisible();
    await page.setViewportSize({ width: 500, height: 900 });
    await page.waitForTimeout(40);
    await expect(panel).toBeVisible();

    // Cross up through 768 → close.
    await page.setViewportSize({ width: 820, height: 900 });
    await page.waitForTimeout(40);
    await expect(panel).toBeHidden();
  });

  test('document has no horizontal overflow at 320 and 340 including standalone chrome', async ({ page }) => {
    for (const width of [320, 340]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoNavbar21Block(page, staticServer.origin);

      const closed = await page.evaluate(() => ({
        html: {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        },
        body: {
          scrollWidth: document.body.scrollWidth,
          clientWidth: document.body.clientWidth,
        },
      }));
      expect(
        closed.html.scrollWidth,
        `${width} closed html overflow`
      ).toBeLessThanOrEqual(closed.html.clientWidth + 1);
      expect(
        closed.body.scrollWidth,
        `${width} closed body overflow`
      ).toBeLessThanOrEqual(closed.body.clientWidth + 1);

      await page.locator(`${ROOT} .ren-nav-toggle`).click();
      await expect(page.locator('#rn21-fullscreen-panel')).toBeVisible();

      const opened = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(
        opened.scrollWidth,
        `${width} open html overflow`
      ).toBeLessThanOrEqual(opened.clientWidth + 1);

      await expectNoOverflow(page, 'html');
      await expectNoOverflow(page, ROOT);
    }
  });

  test('desktop chrome: single dropdown chevron, neutral details, aligned top-level peers', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoNavbar21Block(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rn21-disclosure summary .rn21-chevron'],
      'navbar21 desktop chevron'
    );

    const peerLinks = page.locator('#rn21-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rn21-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rn21-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rn21-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rn21-disclosure > summary');
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
  });

  test('fullscreen open: no horizontal overflow; single toggle close icon', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1100 });
    await gotoNavbar21Block(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator('#rn21-fullscreen-panel')).toBeVisible();

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-sheet-close, ${ROOT} [data-sheet-close]`)).toHaveCount(0);
    await expectNoOverflow(page, 'html');
    await expectNoOverflow(page, ROOT);
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 1100 },
    });
    const page = await context.newPage();
    await gotoNavbar21Block(page, staticServer.origin);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator('#rn21-fullscreen-panel')).toBeVisible();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rn21-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, a.rn21-destination, a.rn21-menu-link, a.rn21-article, a.rn21-view-all, a.rn21-contact, a.rn21-social'
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
    await gotoNavbar21Block(page, staticServer.origin);
    await page.locator('.rn21-disclosure > summary').click();
    await page.locator(`${ROOT} .ren-nav-toggle`).click();

    const motion = await page.evaluate(() => {
      const selectors = [
        '.rn21-dropdown-panel',
        '.rn21-chevron',
        'a.rn21-destination',
        '#rn21-fullscreen-panel',
        '.rn21-menu-link',
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

  test('JavaScript disabled exposes bar destinations and panel content without inert toggle', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 1100 });

    const response = await page.goto(`${staticServer.origin}${BLOCK_PATH}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator(ROOT)).toHaveCount(1);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const toggleVisible = await toggle.evaluate((el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none'
        && style.visibility !== 'hidden'
        && rect.width > 0
        && rect.height > 0;
    }).catch(() => false);
    expect(toggleVisible, 'JS-disabled must hide inert toggle').toBe(false);

    await expect(page.locator('a.rn21-menu-link')).toHaveCount(8);
    await expect(page.locator('a.rn21-article')).toHaveCount(2);
    await expect(page.locator('a.rn21-social')).toHaveCount(5);
    await expect(page.locator('a.rn21-contact')).toHaveCount(1);

    // Bar destinations remain in the DOM for progressive enhancement.
    await expect(page.locator('a.rn21-destination')).toHaveCount(3);
    await expect(page.locator('#rn21-primary-links > li')).toHaveCount(4);

    await context.close();
  });

  test('render-matrix marker counts hold across packet viewport states', async ({ page }) => {
    for (const state of RN21_RENDER_MATRIX.states) {
      if (!state.javaScript) continue;

      if (state.reducedMotion) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.emulateMedia({ reducedMotion: 'no-preference' });
      }

      await page.setViewportSize(state.viewport);
      await gotoNavbar21Block(page, staticServer.origin);

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

  test('navbar21 preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoNavbar21Block(page, staticServer.origin);
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
    await gotoNavbar21Block(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);

      const surfaces = await page.evaluate(() => {
        const root = document.querySelector('[data-rn21-root]');
        const nav = document.querySelector('[data-rn21-root] .ren-nav');
        const panel = document.querySelector('#rn21-fullscreen-panel');
        if (!root || !nav || !panel) return null;
        const navBg = getComputedStyle(nav).backgroundColor;
        const panelBg = getComputedStyle(panel).backgroundColor;
        const text = getComputedStyle(nav).color;
        const isTransparent = (value) => value === 'rgba(0, 0, 0, 0)' || value === 'transparent';
        return {
          navBg,
          panelBg,
          text,
          navSolid: !isTransparent(navBg),
          panelSolid: !isTransparent(panelBg),
        };
      });

      expect(surfaces, theme).toBeTruthy();
      expect(surfaces.navSolid, `${theme} nav surface`).toBe(true);
      expect(surfaces.panelSolid, `${theme} panel surface`).toBe(true);
      expect(surfaces.text, `${theme} text color`).toBeTruthy();
    }
  });
});
