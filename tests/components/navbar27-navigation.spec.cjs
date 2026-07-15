// @ts-check
/**
 * Navbar 27 — Category + Collections Mega Menu
 * (nav-mega-menu-category-collections)
 *
 * Isolated packet suite. Phase A RED: production HTML is intentionally absent
 * until genuine failing evidence is recorded.
 */
const { test, expect } = require('@playwright/test');
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
const BLOCK_PATH = '/templates/blocks/nav-mega-menu-category-collections.html';
const ROOT = '[data-rmcc-root]';

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} origin
 */
async function gotoCategoryCollectionsBlock(page, origin) {
  const response = await page.goto(`${origin}${BLOCK_PATH}`);
  expect(response, 'HTTP response for category-collections mega block').toBeTruthy();
  expect(
    response.status(),
    'block must not 404 — implement templates/blocks/nav-mega-menu-category-collections.html'
  ).toBe(200);
  await expect(page.locator(ROOT), 'missing [data-rmcc-root] shell').toHaveCount(1, {
    timeout: 2000,
  });
}

test.describe('Navbar Mega Menu Category Collections (navbar27)', () => {
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
    await gotoCategoryCollectionsBlock(page, staticServer.origin);

    await expect(
      page.getByRole('heading', {
        name: /Navbar Mega Menu Category Collections|Category.?Collections Mega Menu/i,
        level: 1,
      })
    ).toBeVisible();
    await expect(page.locator('ren-nav')).toHaveCount(1);
    await expect(page.locator('nav.ren-nav')).toHaveCount(1);
    await expect(page.locator('#rmcc-primary-links')).toHaveCount(1);
    await expect(page.locator('ul.ren-nav-links')).toHaveCount(1);
  });

  test('exactly one primary links tree and one landmark serve desktop and mobile', async ({
    page,
  }) => {
    await gotoCategoryCollectionsBlock(page, staticServer.origin);
    await expect(page.locator('#rmcc-primary-links')).toHaveCount(1);
    await expect(page.locator(`${ROOT} ul.ren-nav-links`)).toHaveCount(1);
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
    await expect(page.locator(`${ROOT} nav`)).toHaveCount(1);
  });

  test('anatomy: four top entries, ten category links, two collections, one chevron', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoCategoryCollectionsBlock(page, staticServer.origin);

    await expect(page.locator('#rmcc-primary-links > li')).toHaveCount(4);
    const topLevelLinks = page.locator('#rmcc-primary-links > li > a.ren-nav-link');
    const megaSummaries = page.locator('#rmcc-primary-links > li > .rmcc-disclosure > summary');
    await expect(topLevelLinks).toHaveCount(3);
    await expect(megaSummaries).toHaveCount(1);

    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`)
    ).toHaveCount(2);
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveCount(1);

    await page.locator('.rmcc-disclosure > summary').click();
    await expect(page.locator('.rmcc-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmcc-panel')).toBeVisible();

    await expect(page.locator('.rmcc-group-heading')).toHaveCount(2);
    await expect(page.locator('.rmcc-category-col')).toHaveCount(2);
    await expect(page.locator('.rmcc-mega-link')).toHaveCount(10);
    await expect(page.locator('a.rmcc-collection')).toHaveCount(2);
    await expect(page.locator('.rmcc-collection-media')).toHaveCount(2);
    await expect(page.locator('.rmcc-collection-title')).toHaveCount(2);
    await expect(page.locator('.rmcc-collection-desc')).toHaveCount(2);
    await expect(page.locator('.rmcc-collection-cta')).toHaveCount(2);

    // Distinct from other mega families.
    await expect(
      page.locator('.rmcg-card, .rmf-feature, .rmi-dest, .rml-rail, .rn14-destination')
    ).toHaveCount(0);

    await expectSingleVisibleAffordance(
      page,
      ['.rmcc-disclosure summary .rmcc-chevron'],
      'category-collections mega-menu chevron'
    );
  });

  test('collection cards are single anchors without nested interactive descendants', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoCategoryCollectionsBlock(page, staticServer.origin);
    await page.locator('.rmcc-disclosure > summary').click();

    const cards = page.locator('a.rmcc-collection');
    await expect(cards).toHaveCount(2);

    for (let i = 0; i < 2; i += 1) {
      const card = cards.nth(i);
      const tagName = await card.evaluate((el) => el.tagName);
      expect(tagName, `collection ${i} tag`).toBe('A');
      await expect(card).toHaveAttribute('href', /.+/);
      await expect(card.locator('a[href], button, [role="button"]')).toHaveCount(0);
    }
  });

  test('summary opens by click, keyboard, and desktop hover; Escape restores focus from summary and destination', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoCategoryCollectionsBlock(page, staticServer.origin);

    const disclosure = page.locator('.rmcc-disclosure');
    const summary = disclosure.locator('summary');
    const panel = page.locator('.rmcc-panel');

    await expect(disclosure).not.toHaveAttribute('open', '');
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();
    await expect(page.locator('.rmcc-mega-link').first()).toBeVisible();

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

    // Escape from a focused mega destination must restore focus to summary.
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    const dest = page.locator('.rmcc-mega-link').first();
    await dest.focus();
    await expect.poll(() =>
      page.evaluate(() => document.activeElement?.classList.contains('rmcc-mega-link'))
    ).toBe(true);
    await page.keyboard.press('Escape');
    await expect(disclosure).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe('SUMMARY');

    // Hover open + corridor hold + leave close (unpinned).
    await page.locator(`${ROOT} .ren-nav-brand`).hover();
    await summary.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(panel).toBeVisible();

    await panel.hover();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('a.rmcc-collection').first()).toBeVisible();

    // Pin on first pointer click after hover; second click closes.
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

  test('outside click and every destination class close the disclosure', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoCategoryCollectionsBlock(page, staticServer.origin);

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

    // CTA / global action destinations also dismiss an open mega.
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`).first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');

    // Top-level peer destination closes too.
    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await page.locator('#rmcc-primary-links > li > a.ren-nav-link').first().click();
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('mobile toggle exposes the same tree and closes mega on menu close', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoCategoryCollectionsBlock(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    const disclosure = page.locator('.rmcc-disclosure');
    const summary = disclosure.locator('summary');
    const actions = page.locator(`${ROOT} .ren-nav-actions`);

    await expect(toggle).toHaveAttribute('aria-controls', 'rmcc-primary-links');
    // Closed mobile: actions not visible in the permanent top row.
    await expect(actions).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#rmcc-primary-links')).toBeVisible();
    await expect(actions).toBeVisible();

    await summary.click();
    await expect(disclosure).toHaveAttribute('open', '');
    await expect(page.locator('.rmcc-mega-link').first()).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).not.toHaveAttribute('open', '');
  });

  test('JS-disabled mobile keeps the nav tree, actions, and mega content usable', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await gotoCategoryCollectionsBlock(page, staticServer.origin);

    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toBeHidden();
    await expect(page.locator('#rmcc-primary-links')).toBeVisible();
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`).first()
    ).toBeVisible();

    await page.locator('.rmcc-disclosure > summary').click();
    await expect(page.locator('.rmcc-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmcc-mega-link')).toHaveCount(10);
    await expect(page.locator('a.rmcc-collection')).toHaveCount(2);
    await expect(page.locator('.rmcc-group-heading')).toHaveCount(2);

    await context.close();
  });

  test('viewport geometry: desktop full-bleed under bar, mobile in-flow, no overflow at 320/340', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoCategoryCollectionsBlock(page, staticServer.origin);
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
        navWidth: navRect.width,
      };
    });
    expect(desktop).toBeTruthy();
    expect(desktop.panelPosition).toBe('absolute');
    expect(desktop.panelTop).toBeGreaterThanOrEqual(desktop.navBottom - 1);
    expect(desktop.panelWidth).toBeGreaterThanOrEqual(desktop.navWidth - 2);
    await expectNoOverflow(page, 'html');
    await expectNoOverflow(page, ROOT);

    await page.setViewportSize({ width: 390, height: 844 });
    await gotoCategoryCollectionsBlock(page, staticServer.origin);
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

    for (const width of [320, 340]) {
      await page.setViewportSize({ width, height: 720 });
      await gotoCategoryCollectionsBlock(page, staticServer.origin);
      await page.locator(`${ROOT} .ren-nav-toggle`).click();
      await page.locator('.rmcc-disclosure > summary').click();
      await expect(page.locator('.rmcc-panel')).toBeVisible();
      await expect(page.locator('.rmcc-mega-link')).toHaveCount(10);
      await expect(page.locator('a.rmcc-collection')).toHaveCount(2);
      await expectNoOverflow(page, 'html');
      await expectNoOverflow(page, ROOT);
    }
  });

  test('breakpoint seams 767/768/769 and same-breakpoint resize stability', async ({ page }) => {
    await gotoCategoryCollectionsBlock(page, staticServer.origin);

    // Just below Ren10 48rem (768px): mobile shell.
    await page.setViewportSize({ width: 767, height: 900 });
    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.locator('.rmcc-disclosure > summary').click();
    await expect(page.locator('.rmcc-disclosure')).toHaveAttribute('open', '');

    // Crossing to desktop must close mega and hide toggle.
    await page.setViewportSize({ width: 768, height: 900 });
    await expect(toggle).toBeHidden();
    await expect(page.locator('.rmcc-disclosure')).not.toHaveAttribute('open', '');
    await expect(page.locator('#rmcc-primary-links')).toBeVisible();
    await expect(
      page.locator(`${ROOT} .ren-nav-actions a, ${ROOT} .ren-nav-actions .ren-btn`).first()
    ).toBeVisible();

    await page.locator('.rmcc-disclosure > summary').click();
    await expect(page.locator('.rmcc-disclosure')).toHaveAttribute('open', '');

    // Same-breakpoint resize must keep open state stable.
    await page.setViewportSize({ width: 769, height: 900 });
    await expect(page.locator('.rmcc-disclosure')).toHaveAttribute('open', '');
    await expect(page.locator('.rmcc-panel')).toBeVisible();
    await expect(page.locator('.rmcc-mega-link')).toHaveCount(10);
    await expectNoOverflow(page, 'html');

    // Crossing back to mobile closes mega.
    await page.setViewportSize({ width: 767, height: 900 });
    await expect(page.locator('.rmcc-disclosure')).not.toHaveAttribute('open', '');
    await expect(toggle).toBeVisible();
  });

  test('tablet and wide desktop: category region narrower than collections', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await gotoCategoryCollectionsBlock(page, staticServer.origin);

    const toggle = page.locator(`${ROOT} .ren-nav-toggle`);
    await expect(toggle).toBeHidden();

    await page.locator('.rmcc-disclosure > summary').click();
    await expect(page.locator('.rmcc-panel')).toBeVisible();
    await expect(page.locator('.rmcc-mega-link')).toHaveCount(10);
    await expect(page.locator('a.rmcc-collection')).toHaveCount(2);

    const tablet = await page.evaluate(() => {
      const cats = document.querySelector('.rmcc-categories');
      const cols = document.querySelector('.rmcc-collections');
      if (!cats || !cols) return null;
      const cR = cats.getBoundingClientRect();
      const oR = cols.getBoundingClientRect();
      return {
        catsWidth: Math.round(cR.width),
        colsWidth: Math.round(oR.width),
        catsNarrower: cR.width < oR.width * 0.95 || cR.width <= 26 * 16 + 8,
        sideBySide: Math.abs(cR.top - oR.top) < 64 && oR.left >= cR.right - 24,
      };
    });
    expect(tablet, 'tablet composition metrics').toBeTruthy();
    expect(
      tablet.catsNarrower || tablet.sideBySide,
      `categories ${tablet.catsWidth} vs collections ${tablet.colsWidth}`
    ).toBe(true);
    await expectNoOverflow(page, 'html');

    await page.setViewportSize({ width: 1280, height: 900 });
    await expect(page.locator('.rmcc-panel')).toBeVisible();
    const wide = await page.evaluate(() => {
      const cats = document.querySelector('.rmcc-categories');
      const cols = document.querySelector('.rmcc-collections');
      const groups = document.querySelectorAll('.rmcc-category-col');
      const cards = document.querySelectorAll('a.rmcc-collection');
      if (!cats || !cols || groups.length < 2 || cards.length < 2) return null;
      const cR = cats.getBoundingClientRect();
      const oR = cols.getBoundingClientRect();
      const g0 = groups[0].getBoundingClientRect();
      const g1 = groups[1].getBoundingClientRect();
      const card0 = cards[0].getBoundingClientRect();
      const card1 = cards[1].getBoundingClientRect();
      return {
        catsWidth: Math.round(cR.width),
        colsWidth: Math.round(oR.width),
        catsNarrower: cR.width < oR.width,
        twoCategoryCols: Math.abs(g0.top - g1.top) < 48 && g1.left >= g0.right - 4,
        twoCollectionCols: Math.abs(card0.top - card1.top) < 48 && card1.left >= card0.right - 4,
      };
    });
    expect(wide).toBeTruthy();
    expect(wide.catsNarrower, `cats ${wide.catsWidth} vs cols ${wide.colsWidth}`).toBe(true);
    expect(wide.twoCategoryCols, 'two category columns on wide desktop').toBe(true);
    expect(wide.twoCollectionCols, 'two collection cards side by side').toBe(true);
  });

  test('desktop chrome: single chevron, neutral details, aligned trigger', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoCategoryCollectionsBlock(page, staticServer.origin);

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
      afterContent === 'none' || afterContent === '' || summaryChrome.afterDisplay === 'none';
    expect(afterNeutralized, 'classless summary::after must be neutralized').toBe(true);
  });

  test('mobile rows: full width peers, stacked collections, single close icon affordance', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoCategoryCollectionsBlock(page, staticServer.origin);
    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rmcc-disclosure > summary').click();
    await expect(page.locator('.rmcc-panel')).toBeVisible();

    const firstPeer = page.locator('#rmcc-primary-links > li > a.ren-nav-link').first();
    await expect(firstPeer).toBeVisible();
    const peerHref = await firstPeer.getAttribute('href');
    expect(peerHref).toBeTruthy();

    await expectWidthRatio(page, `a.ren-nav-link[href="${peerHref}"]`, '#rmcc-primary-links', 0.92, 1.05);
    await expectWidthRatio(page, '.rmcc-disclosure > summary', '#rmcc-primary-links', 0.92, 1.05);
    await expectSingleVisibleAffordance(
      page,
      ['.rmcc-disclosure summary .rmcc-chevron'],
      'mobile category-collections mega-menu chevron'
    );
    // Toggle shows the close morph (three spans, one visible control).
    await expect(page.locator(`${ROOT} .ren-nav-toggle`)).toHaveCount(1);
    await expectNoOverflow(page, 'html');

    const mobileLayout = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('a.rmcc-collection'));
      const cats = document.querySelector('.rmcc-categories');
      const cols = document.querySelector('.rmcc-collections');
      if (cards.length < 2 || !cats || !cols) return null;
      const c0 = cards[0].getBoundingClientRect();
      const c1 = cards[1].getBoundingClientRect();
      const catsR = cats.getBoundingClientRect();
      const colsR = cols.getBoundingClientRect();
      const stackedCards = c1.top >= c0.bottom - 8;
      const catsAbove = colsR.top >= catsR.bottom - 16;
      return { stackedCards, catsAbove, cardCount: cards.length };
    });
    expect(mobileLayout).toBeTruthy();
    expect(mobileLayout.stackedCards, 'mobile collections stack by default').toBe(true);
    expect(mobileLayout.catsAbove, 'categories precede collections in flow').toBe(true);
    expect(mobileLayout.cardCount).toBe(2);
  });

  test('visible interactive targets meet 44×44 in a touch context', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await gotoCategoryCollectionsBlock(page, staticServer.origin);

    await page.locator(`${ROOT} .ren-nav-toggle`).click();
    await page.locator('.rmcc-disclosure > summary').click();

    const undersized = await page.evaluate(() => {
      const root = document.querySelector('[data-rmcc-root]');
      if (!root) return [{ name: 'missing-root', width: 0, height: 0 }];

      const candidates = root.querySelectorAll(
        'a[href], button, summary, .ren-nav-toggle, .rmcc-mega-link, a.rmcc-collection'
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
    await gotoCategoryCollectionsBlock(page, staticServer.origin);
    await page.locator('.rmcc-disclosure > summary').click();

    const motion = await page.evaluate(() => {
      const selectors = ['.rmcc-panel', '.rmcc-chevron', 'a.rmcc-collection', '.rmcc-collection-media'];
      return selectors.map((selector) => {
        const el = document.querySelector(selector);
        if (!el) return { selector, missing: true };
        const style = window.getComputedStyle(el);
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

  test('category-collections mega menu preview passes WCAG 2.1 AA axe scan', async ({ page }) => {
    await gotoCategoryCollectionsBlock(page, staticServer.origin);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.locator('.rmcc-disclosure > summary').click();
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
    await gotoCategoryCollectionsBlock(page, staticServer.origin);

    for (const theme of ['light', 'dark']) {
      await page.evaluate((nextTheme) => {
        document.documentElement.setAttribute('data-theme', nextTheme);
      }, theme);
      await page.locator('.rmcc-disclosure > summary').click();
      await expect(page.locator('.rmcc-panel')).toBeVisible();

      const colors = await page.evaluate(() => {
        const nav = document.querySelector('[data-rmcc-root] .ren-nav');
        const panel = document.querySelector('.rmcc-panel');
        const link = document.querySelector('.rmcc-mega-link');
        if (!nav || !panel || !link) return null;
        const navBg = getComputedStyle(nav).backgroundColor;
        const panelBg = getComputedStyle(panel).backgroundColor;
        const linkColor = getComputedStyle(link).color;
        const isTransparent = (value) =>
          !value || value === 'transparent' || value === 'rgba(0, 0, 0, 0)';
        return {
          navBg,
          panelBg,
          linkColor,
          navSolid: !isTransparent(navBg),
          panelSolid: !isTransparent(panelBg),
          linkSolid: !isTransparent(linkColor),
        };
      });
      expect(colors, theme).toBeTruthy();
      expect(colors.navSolid, `${theme} nav bg`).toBe(true);
      expect(colors.panelSolid, `${theme} panel bg`).toBe(true);
      expect(colors.linkSolid, `${theme} link color`).toBe(true);

      await page.keyboard.press('Escape');
    }
  });
});
