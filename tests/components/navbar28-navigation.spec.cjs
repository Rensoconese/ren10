// @ts-check
/**
 * Isolated Navbar 28 — Category + Collections Mega Menu
 * (nav-mega-menu-category-collections).
 *
 * Uses only public DOM/ARIA contracts. Does not access private custom-element
 * properties. Relies on tests/utils/static-server.cjs and block-quality.cjs.
 */
const { test, expect } = require('@playwright/test');
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
const BLOCK = '/templates/blocks/nav-mega-menu-category-collections.html';
const ROOT = '[data-rmcc-root]';

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoBlock(page, origin) {
  const response = await page.goto(`${origin}${BLOCK}`);
  expect(response, 'HTTP response for category-collections mega block').toBeTruthy();
  expect(
    response.status(),
    'block must not 404 — implement templates/blocks/nav-mega-menu-category-collections.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-rmcc-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

test.describe('Navbar 28 — Category Collections Mega Menu (navbar28)', () => {
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

  test('block page loads with ren-nav shell and category-collections root', async ({ page }) => {
    await gotoBlock(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Navbar Mega Menu Category Collections|Category Collections/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rmcc-primary-links')).toHaveCount(1);
    await expect(page.locator('ul.ren-nav-links')).toHaveCount(1);
  });

  test('exactly one primary links tree and landmark serve desktop and mobile', async ({ page }) => {
    await gotoBlock(page, staticServer.origin);
    await expect(page.locator('#rmcc-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav.ren-nav`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('#rmcc-primary-links')).toBeVisible();

    await page.setViewportSize({ width: 390, height: 844 });
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmcc-primary-links')).toBeVisible();
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
  });

  test('anatomy: four top-level entries, five category links, three collections, one chevron', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);

    await expect(page.locator('#rmcc-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rmcc-primary-links > li > a.ren-nav-link');
    const megaSummaries = page.locator('#rmcc-primary-links > li > .rmcc-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(megaSummaries).toHaveCount(1);

    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`)
    ).toHaveCount(2);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveCount(1);
    await expect(page.locator(`${ROOT} .ren-nav-actions`)).toHaveCount(1);

    await page.locator('.rmcc-disclosure > summary').click();
    await expect(page.locator('.rmcc-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmcc-panel')).toBeVisible();

    await expect(page.locator('.rmcc-layout.ren-with-sidebar')).toHaveCount(1);
    await expect(page.locator('.rmcc-link-col')).toHaveCount(1);
    await expect(page.locator('.rmcc-group-heading')).toHaveCount(1);
    await expect(page.locator('.rmcc-mega-link')).toHaveCount(5);
    await expect(page.locator('.rmcc-collection-grid.ren-grid-3')).toHaveCount(1);
    await expect(page.locator('a.rmcc-collection')).toHaveCount(3);
    await expect(page.locator('.rmcc-collection-title')).toHaveCount(3);
    await expect(page.locator('.rmcc-collection-desc')).toHaveCount(3);
    await expect(page.locator('.rmcc-collection-cta')).toHaveCount(3);
    await expect(
      page.locator('.rmnf-footer-band, .rml-rail, .rmi-footer, .rmf-feature, .rbm-feature, .rmcg-card')
    ).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rmcc-disclosure summary .rmcc-chevron'],
      'category-collections mega-menu chevron'
    );
  });

  test('three collection cards are single anchors without nested interactive descendants', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);
    await page.locator('.rmcc-disclosure > summary').click();

    const cards = page.locator('a.rmcc-collection');
    await expect(cards).toHaveCount(3);

    for (let i = 0; i < 3; i += 1) {
      const card = cards.nth(i);
      const tagName = await card.evaluate((el) => el.tagName);
      expect(tagName, `collection ${i} tag`).toBe('A');
      await expect(card).toHaveAttribute('href', /.+/);
      await expect(card.locator('a[href], button, [role="button"], input, select, textarea')).toHaveCount(
        0
      );
    }
  });

  test('summary opens by click, keyboard, and desktop hover; Escape restores focus from summary', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmcc-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rmcc-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('.rmcc-collection').first()).toBeVisible();

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
    await expect(page.locator('.rmcc-collection').first()).toBeVisible();

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
    await gotoBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmcc-disclosure');
    const summary = disclosure.locator('summary');
    const dest = page.locator('.rmcc-mega-link').first();
    const collection = page.locator('a.rmcc-collection').first();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await dest.focus();
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('rmcc-mega-link'))).toBe(
      true
    );
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await collection.focus();
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.classList.contains('rmcc-collection')))
      .toBe(true);
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');
  });

  test('outside click and every destination class close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmcc-disclosure');
    const summary = disclosure.locator('summary');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-brand`).click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('.rmcc-mega-link').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('a.rmcc-collection').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`).first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    // Peer link close keeps peer focus stable on desktop (control stays visible).
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    const peer = page.locator('#rmcc-primary-links > li > a.ren-nav-link').first();
    await peer.click();
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => {
      const active = document.activeElement;
      return active?.classList.contains('ren-nav-link') && !active?.closest('.rmcc-disclosure');
    })).toBe(true);
  });

  test('mobile: mega links, collections, and both actions close details+shell with toggle focus', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 1100 });
    await gotoBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmcc-disclosure');
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const renNav = page.locator(`${ROOT} ren-nav`);

    /** @type {{ id: string, selector: string, openMega: boolean }[]} */
    const cases = [
      { id: 'mega-link', selector: 'a.rmcc-mega-link', openMega: true },
      { id: 'collection', selector: 'a.rmcc-collection', openMega: true },
      {
        id: 'action-secondary',
        selector: `${ROOT} .ren-nav-actions a.ren-btn-secondary`,
        openMega: false,
      },
      {
        id: 'action-primary',
        selector: `${ROOT} .ren-nav-actions a.ren-btn-primary`,
        openMega: false,
      },
    ];

    for (const item of cases) {
      await toggle.click();
      await expect(toggle, `${item.id}: shell open`).toHaveAttribute('aria-expanded', 'true');

      if (item.openMega) {
        await page.locator('.rmcc-disclosure > summary').click();
        await expect(disclosure, `${item.id}: mega open`).toHaveAttribute('open', '');
      }

      const target = page.locator(item.selector).first();
      await expect(target, `${item.id}: destination visible`).toBeVisible();
      await target.click();

      await expect(disclosure, `${item.id}: details closed`).not.toHaveAttribute('open', '');
      await expect(toggle, `${item.id}: shell closed via public aria-expanded`).toHaveAttribute(
        'aria-expanded',
        'false'
      );
      await expect(renNav, `${item.id}: no data-open`).not.toHaveAttribute('data-open', '');
      await expect
        .poll(
          () =>
            page.evaluate(() => {
              const active = document.activeElement;
              const btn = document.querySelector('[data-rmcc-root] .ren-nav-toggle');
              if (!(active instanceof HTMLElement) || !(btn instanceof HTMLElement)) return false;
              if (active !== btn) return false;
              const style = getComputedStyle(btn);
              const rect = btn.getBoundingClientRect();
              return (
                style.display !== 'none'
                && style.visibility !== 'hidden'
                && rect.width > 0
                && rect.height > 0
              );
            }),
          { message: `${item.id}: focus restored to visible toggle` }
        )
        .toBe(true);
    }

    // Peer link: closes shell; focus may land on peer or toggle once tree hides.
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const peer = page.locator('#rmcc-primary-links > li > a.ren-nav-link').first();
    await peer.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect
      .poll(() =>
        page.evaluate(() => {
          const active = document.activeElement;
          const btn = document.querySelector('[data-rmcc-root] .ren-nav-toggle');
          if (!(active instanceof HTMLElement)) return false;
          if (active === btn) {
            const style = getComputedStyle(btn);
            const rect = btn.getBoundingClientRect();
            return (
              style.display !== 'none'
              && style.visibility !== 'hidden'
              && rect.width > 0
              && rect.height > 0
            );
          }
          // Peer may keep focus only while still a visible tab stop.
          const style = getComputedStyle(active);
          const rect = active.getBoundingClientRect();
          return (
            style.display !== 'none'
            && style.visibility !== 'hidden'
            && rect.width > 0
            && rect.height > 0
          );
        })
      )
      .toBe(true);
  });

  test('mobile toggle exposes the same tree and closes mega on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoBlock(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const disclosure = page.locator('.rmcc-disclosure');
    const summary = disclosure.locator('summary');

    await expect(toggle).toHaveAttribute('aria-controls', 'rmcc-primary-links');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmcc-primary-links')).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rmcc-collection').first()).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('JS-disabled mobile keeps the nav tree and mega content usable', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await gotoBlock(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator('#rmcc-primary-links')).toBeVisible();
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`).first()
    ).toBeVisible();

    await page.locator('.rmcc-disclosure > summary').click();
    await expect(page.locator('.rmcc-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmcc-mega-link')).toHaveCount(5);
    await expect(page.locator('a.rmcc-collection')).toHaveCount(3);
    await expect(page.locator('.rmcc-group-heading')).toBeVisible();

    await context.close();
  });

  test('viewport geometry: desktop panel under bar, mobile in-flow, no horizontal overflow', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);
    await page.locator('.rmcc-disclosure > summary').click();
    await expect(page.locator('.rmcc-panel')).toBeVisible();

    const desktop = await page.evaluate(() => {
      const nav = document.querySelector('[data-rmcc-root] .ren-nav');
      const panel = document.querySelector('.rmcc-panel');
      if (!nav || !panel) return null;
      const navRect = nav.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      return {
        navBottom: navRect.bottom,
        panelTop: panelRect.top,
        panelPosition: getComputedStyle(panel).position,
        panelWidth: panelRect.width,
        viewportWidth: window.innerWidth,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    expect(desktop.panelWidth).toBeGreaterThanOrEqual(desktop.viewportWidth * 0.9);
    await expectNoOverflow(page, 'html');
    await expectNoOverflow(page, ':root');

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoBlock(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rmcc-disclosure > summary').click();
    await expect(page.locator('.rmcc-panel')).toBeVisible();

    const mobile = await page.evaluate(() => {
      const panel = document.querySelector('.rmcc-panel');
      if (!panel) return null;
      return { position: getComputedStyle(panel).position };
    });
    expect(mobile).toBeTruthy();
    expect(['static', 'relative']).toContain(mobile.position);
    await expectNoOverflow(page, 'html');
  });

  test('tablet and desktop: narrow category column beside three collections', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoBlock(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeHidden();

    await page.locator('.rmcc-disclosure > summary').click();
    await expect(page.locator('.rmcc-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmcc-mega-link')).toHaveCount(5);
    await expect(page.locator('a.rmcc-collection')).toHaveCount(3);

    const tablet = await page.evaluate(() => {
      const linkCol = document.querySelector('.rmcc-link-col');
      const collectionGrid = document.querySelector('.rmcc-collection-grid');
      const cards = Array.from(document.querySelectorAll('a.rmcc-collection'));
      if (!linkCol || !collectionGrid || cards.length < 3) return null;
      const linkR = linkCol.getBoundingClientRect();
      const gridR = collectionGrid.getBoundingClientRect();
      return {
        linkColWidth: Math.round(linkR.width),
        collectionWidth: Math.round(gridR.width),
        narrowLeft: linkR.width < gridR.width * 0.85,
      };
    });
    expect(tablet, 'tablet composition metrics').toBeTruthy();
    expect(tablet.narrowLeft, 'category column narrower than collections').toBe(true);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.rmcc-panel')).toBeVisible();
    const wide = await page.evaluate(() => {
      const linkCol = document.querySelector('.rmcc-link-col');
      const collectionGrid = document.querySelector('.rmcc-collection-grid');
      const cards = Array.from(document.querySelectorAll('a.rmcc-collection'));
      if (!linkCol || !collectionGrid || cards.length < 3) return null;
      const linkR = linkCol.getBoundingClientRect();
      const gridR = collectionGrid.getBoundingClientRect();
      const rects = cards.map((el) => el.getBoundingClientRect());
      const threeUp =
        Math.abs(rects[0].top - rects[1].top) < 48 &&
        Math.abs(rects[1].top - rects[2].top) < 48 &&
        rects[1].left >= rects[0].right - 4 &&
        rects[2].left >= rects[1].right - 4;
      return {
        linkNarrow: linkR.width <= 16 * 16 && linkR.width < gridR.width * 0.5,
        threeUp,
        linkColWidth: Math.round(linkR.width),
        collectionWidth: Math.round(gridR.width),
      };
    });
    expect(wide).toBeTruthy();
    expect(wide.linkNarrow, `link ${wide.linkColWidth} vs collections ${wide.collectionWidth}`).toBe(
      true
    );
    expect(wide.threeUp, 'wide desktop keeps a three-column collection grid').toBe(true);
  });

  test('breakpoint seams 767/768/769 and same-breakpoint resize stay stable', async ({ page }) => {
    await gotoBlock(page, staticServer.origin);

    /**
     * @param {import('@playwright/test').Page} page
     * @param {string} rootSelector
     */
    async function toggleGeometry(page, rootSelector) {
      return page.evaluate((rootSel) => {
        const toggle = document.querySelector(`${rootSel} .ren-nav-toggle`);
        if (!toggle) return null;
        const style = getComputedStyle(toggle);
        const rect = toggle.getBoundingClientRect();
        return {
          display: style.display,
          visibility: style.visibility,
          width: rect.width,
          height: rect.height,
          visible:
            style.display !== 'none'
            && style.visibility !== 'hidden'
            && rect.width > 0
            && rect.height > 0,
          hiddenByDisplay: style.display === 'none',
        };
      }, rootSelector);
    }

    // Just below 48rem → mobile shell.
    await page.setViewportSize({ width: 767, height: 900 });
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    let geom = await toggleGeometry(page, ROOT);
    expect(geom, '767 geometry').toBeTruthy();
    expect(geom.visible, '767 keeps mobile toggle visible').toBe(true);
    expect(geom.hiddenByDisplay, '767 toggle not display:none').toBe(false);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmcc-primary-links')).toBeVisible();
    await page.locator('.rmcc-disclosure > summary').click();
    await expect(page.locator('.rmcc-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('a.rmcc-collection')).toHaveCount(3);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator('.rmcc-disclosure')).not.toHaveAttribute('open', '');
    await expectNoOverflow(page, 'html');

    // 768px = 48rem ren-nav / block mobile band — still mobile path.
    await page.setViewportSize({ width: 768, height: 900 });
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await page.waitForTimeout(50);
    geom = await toggleGeometry(page, ROOT);
    expect(geom, '768 geometry').toBeTruthy();
    expect(geom.visible, '768 stays on mobile shell (max-width: 48rem)').toBe(true);
    expect(geom.hiddenByDisplay).toBe(false);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeVisible();
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmcc-primary-links')).toBeVisible();
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveAttribute('aria-expanded', 'false');
    await expectNoOverflow(page, 'html');

    // 769 must flip to desktop: toggle display:none / hidden, links visible.
    await page.setViewportSize({ width: 769, height: 900 });
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await page.waitForTimeout(50);
    geom = await toggleGeometry(page, ROOT);
    expect(geom, '769 geometry').toBeTruthy();
    expect(geom.visible, '769 desktop hides mobile toggle').toBe(false);
    expect(geom.hiddenByDisplay || geom.width === 0, '769 toggle display:none or zero box').toBe(
      true
    );
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator('#rmcc-primary-links')).toBeVisible();
    await page.locator('.rmcc-disclosure > summary').click();
    await expect(page.locator('.rmcc-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmcc-panel')).toBeVisible();
    const panelPosition = await page.evaluate(
      () => getComputedStyle(document.querySelector('.rmcc-panel')).position
    );
    expect(panelPosition).toBe('absolute');
    await page.keyboard.press('Escape');
    await expect(page.locator('.rmcc-disclosure')).not.toHaveAttribute('open', '');
    await expectNoOverflow(page, 'html');

    // Same-breakpoint resize stability at each seam width.
    for (const width of [767, 768, 769]) {
      await page.setViewportSize({ width, height: 901 });
      await page.evaluate(() => window.dispatchEvent(new Event('resize')));
      await expect(page.locator(`${ROOT} ren-nav`)).toHaveCount(1);
      await expect(page.locator('#rmcc-primary-links')).toHaveCount(1);
      await expectNoOverflow(page, 'html');
      const again = await toggleGeometry(page, ROOT);
      if (width <= 768) {
        expect(again.visible, `${width} same-bp still mobile`).toBe(true);
      } else {
        expect(again.visible, `${width} same-bp still desktop`).toBe(false);
      }
    }
  });

  test('narrow 320px and 340px widths keep usable chrome without overflow', async ({ page }) => {
    for (const width of [320, 340]) {
      await page.setViewportSize({ width, height: 720 });
      await gotoBlock(page, staticServer.origin);
      const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#rmcc-primary-links')).toBeVisible();
      await page.locator('.rmcc-disclosure > summary').click();
      await expect(page.locator('.rmcc-mega-link')).toHaveCount(5);
      await expect(page.locator('a.rmcc-collection')).toHaveCount(3);
      await expectNoOverflow(page, 'html');
      await expectNoOverflow(page, ':root');
    }
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    await gotoBlock(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rmcc-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rmcc-root]');
      if (!root) return [{ reason: 'missing root' }];
      const selectors = [
        '.ren-nav-toggle',
        '.ren-nav-brand',
        '#rmcc-primary-links > li > a.ren-nav-link',
        '.rmcc-disclosure > summary',
        '.rmcc-mega-link',
        'a.rmcc-collection',
        '.ren-nav-actions a',
        '.ren-nav-actions .ren-btn',
      ];
      /** @type {{selector: string, width: number, height: number}[]} */
      const bad = [];
      for (const selector of selectors) {
        for (const el of root.querySelectorAll(selector)) {
          const style = getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') continue;
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          if (rect.width < 44 || rect.height < 44) {
            bad.push({
              selector,
              width: Math.round(rect.width * 10) / 10,
              height: Math.round(rect.height * 10) / 10,
            });
          }
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
    await page.locator('.rmcc-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rmcc-panel', '.rmcc-chevron', '.rmcc-mega-link', 'a.rmcc-collection'];
      return selectors.map((selector) => {
        const el = document.querySelector(selector);
        if (!el) return { selector, missing: true };
        const style = getComputedStyle(el);
        return {
          selector,
          missing: false,
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
      const animName = String(item.animationName || '');
      expect(animName === 'none' || animName === '', item.selector).toBeTruthy();
    }
  });

  test('mobile chrome: single centered close icon and one action separator', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoBlock(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const chrome = await page.evaluate((rootSelector) => {
      const root = document.querySelector(rootSelector);
      const button = root?.querySelector('.ren-nav-toggle');
      const firstBar = button?.querySelector('span:nth-child(1)');
      const thirdBar = button?.querySelector('span:nth-child(3)');
      const links = root?.querySelector('.ren-nav-links');
      const actions = root?.querySelector('.ren-nav-actions');
      if (!button || !firstBar || !thirdBar || !links || !actions) return null;

      const buttonRect = button.getBoundingClientRect();
      const firstRect = firstBar.getBoundingClientRect();
      const thirdRect = thirdBar.getBoundingClientRect();
      const linksRect = links.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const linksStyle = getComputedStyle(links);
      const actionsStyle = getComputedStyle(actions);

      const barCenterX = (firstRect.left + firstRect.right + thirdRect.left + thirdRect.right) / 4;
      const barCenterY = (firstRect.top + firstRect.bottom + thirdRect.top + thirdRect.bottom) / 4;
      const buttonCenterX = buttonRect.left + buttonRect.width / 2;
      const buttonCenterY = buttonRect.top + buttonRect.height / 2;

      let separatorCount = 0;
      if (parseFloat(linksStyle.borderBottomWidth) > 0) separatorCount += 1;
      if (parseFloat(actionsStyle.borderTopWidth) > 0) separatorCount += 1;

      return {
        barCenterDeltaX: Math.abs(barCenterX - buttonCenterX),
        barCenterDeltaY: Math.abs(barCenterY - buttonCenterY),
        iconButtonDeltaX: Math.abs(barCenterX - buttonCenterX),
        iconButtonDeltaY: Math.abs(barCenterY - buttonCenterY),
        linksActionsGap: Math.abs(actionsRect.top - linksRect.bottom),
        separatorCount,
        spanCount: button.querySelectorAll('span').length,
      };
    }, ROOT);

    expect(chrome, 'mobile chrome metrics').toBeTruthy();
    expect(chrome.barCenterDeltaX, JSON.stringify(chrome)).toBeLessThanOrEqual(1);
    expect(chrome.barCenterDeltaY, JSON.stringify(chrome)).toBeLessThanOrEqual(1);
    expect(chrome.iconButtonDeltaX).toBeLessThanOrEqual(1);
    expect(chrome.iconButtonDeltaY).toBeLessThanOrEqual(1);
    expect(chrome.linksActionsGap).toBeLessThanOrEqual(1);
    expect(chrome.separatorCount).toBe(1);
    expect(chrome.spanCount).toBe(3);

    await expectSingleVisibleAffordance(
      page,
      ['.rmcc-disclosure summary .rmcc-chevron'],
      'single chevron with mobile open'
    );
  });

  test('desktop chrome: single chevron, neutral details, aligned trigger', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);

    await expectSingleVisibleAffordance(
      page,
      ['.rmcc-disclosure summary .rmcc-chevron'],
      'category-collections mega-menu chevron'
    );

    const peerLinks = page.locator('#rmcc-primary-links > li > a.ren-nav-link');
    await expect(peerLinks.first()).toBeVisible();
    await expect(page.locator('.rmcc-disclosure > summary')).toBeVisible();

    const firstHref = await peerLinks.nth(0).getAttribute('href');
    const lastHref = await peerLinks.nth(2).getAttribute('href');
    expect(firstHref).toBeTruthy();
    expect(lastHref).toBeTruthy();
    await expectAligned(
      page,
      [
        `a.ren-nav-link[href="${firstHref}"]`,
        '.rmcc-disclosure > summary',
        `a.ren-nav-link[href="${lastHref}"]`,
      ],
      'centerY',
      2
    );

    const detailsChrome = await inspectNativeChrome(page, '.rmcc-disclosure');
    expect(detailsChrome.borderTopWidth === '0px', 'details outer border').toBeTruthy();
    expect(detailsChrome.marginTop).toBe('0px');
    expect(detailsChrome.paddingTop).toBe('0px');

    const summaryChrome = await inspectNativeChrome(page, '.rmcc-disclosure > summary');
    const afterContent = String(summaryChrome.afterContent || 'none').replace(/['"]/g, '');
    const afterNeutralized =
      afterContent === 'none' || afterContent === '' || afterContent === 'normal';
    expect(afterNeutralized, `summary::after ${afterContent}`).toBeTruthy();
  });

  test('light and dark surfaces resolve through RenDS tokens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.locator('html').evaluate((el, value) => {
        el.setAttribute('data-theme', value);
      }, theme);
      await page.locator('.rmcc-disclosure > summary').click();
      const colors = await page.evaluate(() => {
        const root = document.documentElement;
        const nav = document.querySelector('[data-rmcc-root] .ren-nav');
        const panel = document.querySelector('.rmcc-panel');
        const cs = getComputedStyle(root);
        return {
          surface: cs.getPropertyValue('--color-surface').trim(),
          text: cs.getPropertyValue('--color-text').trim(),
          navBg: nav ? getComputedStyle(nav).backgroundColor : '',
          panelBg: panel ? getComputedStyle(panel).backgroundColor : '',
        };
      });
      expect(colors.surface, theme).toBeTruthy();
      expect(colors.text, theme).toBeTruthy();
      expect(colors.navBg, theme).not.toBe('');
      expect(colors.panelBg, theme).not.toBe('');
      await page.keyboard.press('Escape');
    }
  });

  test('block preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoBlock(page, staticServer.origin);
    await page.locator('.rmcc-disclosure > summary').click();
    await injectAxe(page);
    await checkA11y(page, ROOT, {
      detailedReport: true,
      axeOptions: {
        runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
      },
    });
  });
});
