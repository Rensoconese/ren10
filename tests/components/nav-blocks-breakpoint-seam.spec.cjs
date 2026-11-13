// @ts-check
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');

/**
 * Navigation blocks must take their mobile/desktop decision from the same
 * breakpoint their CSS renders. ren-nav's CSS shows the toggle through
 * `max-width: 48rem` (768px inclusive at a 16px root), so at exactly 768px
 * a block whose toggle is rendered is in its mobile layout and its script
 * must behave as mobile: no desktop hover-open, no desktop resize reset.
 * One px either side is the control: 767 is mobile, 769 is desktop.
 */
const ROOT = path.resolve(__dirname, '../..');

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server.close(); });

// Blocks whose disclosure opens on desktop pointer hover.
const HOVER_BLOCKS = [
  'nav-floating-logo-left-menu-right-actions',
  'nav-logo-left-menu-center-dropdown',
  'nav-logo-left-menu-right-dropdown',
  'nav-logo-left-menu-right-grouped',
  'nav-mega-menu-card-grid',
  'nav-mega-menu-categories-products',
  'nav-mega-menu-footer',
  'nav-mega-menu-icons',
  'nav-mega-menu-link-rail',
];

async function gotoBlock(page, slug, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
  await page.goto(`${server.origin}/templates/blocks/${slug}.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => customElements.get('ren-nav') !== undefined);
}

const settle = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

const toggleRendered = (page) => page.evaluate(() => {
  const toggle = document.querySelector('.ren-nav-toggle');
  return Boolean(toggle) && getComputedStyle(toggle).display !== 'none';
});

for (const slug of HOVER_BLOCKS) {
  test.describe(`${slug} breakpoint seam`, () => {
    for (const width of [767, 768, 769]) {
      test(`script agrees with the rendered layout at ${width}px`, async ({ page }) => {
        await gotoBlock(page, slug, width);
        const mobile = await toggleRendered(page);
        expect(mobile, `toggle rendered at ${width}px`).toBe(width <= 768);

        const disclosure = page.locator('.ren-nav-links details').first();
        const summary = disclosure.locator('> summary');
        if (mobile) {
          await page.locator('.ren-nav-toggle').first().click();
          await expect(page.locator('.ren-nav-toggle').first()).toHaveAttribute('aria-expanded', 'true');
        }
        await expect(summary).toBeVisible();

        // Desktop pointer hover opens the disclosure; the mobile layout leaves
        // it to the native details toggle.
        await summary.hover();
        await page.waitForTimeout(250);
        expect(await disclosure.evaluate((el) => el.open), `hover-open at ${width}px`).toBe(!mobile);
      });
    }
  });
}

test.describe('nav-logo-left-center-links-site-panel breakpoint seam', () => {
  // The toggle opens the site panel at every width, so the layout signal here
  // is ren-nav's bar: hidden through 48rem, shown above it. The block's own
  // mobile shell (stacked site panel) must switch at the same point.
  for (const width of [767, 768, 769]) {
    test(`block shell matches ren-nav at ${width}px`, async ({ page }) => {
      await gotoBlock(page, 'nav-logo-left-center-links-site-panel', width);
      const state = await page.evaluate(() => {
        const links = document.querySelector('.ren-nav-links');
        // The desktop site panel lays out as a two-column grid; the mobile
        // one stacks.
        const panelGrid = document.querySelector('.rn19-panel-grid');
        return {
          barShown: getComputedStyle(links).display !== 'none',
          blockMobileShell: getComputedStyle(panelGrid).display !== 'grid',
        };
      });
      expect(state.barShown, `bar links at ${width}px`).toBe(width > 768);
      expect(state.blockMobileShell, `block mobile shell at ${width}px`).toBe(!state.barShown);
    });
  }
});

test.describe('nav-mega-menu breakpoint seam', () => {
  test('crossing 767 to 768 keeps the mobile disclosure open (both mobile in CSS)', async ({ page }) => {
    await gotoBlock(page, 'nav-mega-menu', 767);
    const toggle = page.locator('.ren-nav-toggle').first();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const disclosure = page.locator('.ren-nav-links details').first();
    await disclosure.locator('> summary').click();
    await expect(disclosure).toHaveAttribute('open', '');

    await page.setViewportSize({ width: 768, height: 900 });
    await settle(page);
    expect(await toggleRendered(page), 'toggle rendered at 768px').toBe(true);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(disclosure).toHaveAttribute('open', '');

    // Control: crossing into the desktop layout still resets the disclosure.
    await page.setViewportSize({ width: 769, height: 900 });
    await settle(page);
    expect(await toggleRendered(page), 'toggle rendered at 769px').toBe(false);
    await expect(disclosure).not.toHaveAttribute('open', '');
  });
});
