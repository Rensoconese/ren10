// @ts-check
/**
 * Anchored overlays in an engine without CSS anchor positioning.
 *
 * Safari before 26, and Chromium and Firefox releases from before they
 * shipped it, do not know `position-area`. Popover and tooltip placed
 * themselves by script there, measured before they were shown (so with no
 * size: the tooltip sat on its trigger), and as `position: absolute` in the
 * top layer, where viewport coordinates land a scroll's length away on a page
 * that has scrolled. The date picker, the date range picker, the colour picker
 * and the hover card had no script at all: `inset: auto` left them at the top
 * left corner of the viewport.
 *
 * No engine in CI lacks anchor positioning, so this one is made to: every
 * stylesheet is served with the anchor properties renamed into custom
 * properties the engine ignores and its `@supports not (anchor…)` blocks
 * turned on, and `CSS.supports` answers no for them, which is what the
 * components ask before taking their script path.
 */
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');
const { ROOT, mountRegistry } = require('../utils/mount-registry.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

const OVERLAYS = [
  { key: 'date-picker', trigger: '.ren-date-picker-trigger', surface: '.ren-date-picker-dropdown', open: 'click' },
  { key: 'date-range-picker', trigger: '.ren-date-range-trigger', surface: '.ren-date-range-dropdown', open: 'click' },
  { key: 'color-picker', trigger: '.ren-color-picker-trigger', surface: '.ren-color-picker-dropdown', open: 'click' },
  { key: 'popover', trigger: '#account-trigger', surface: 'ren-popover', open: 'click' },
  { key: 'tooltip', trigger: '.ren-tooltip-trigger', surface: 'ren-tooltip', open: 'focus' },
  { key: 'hover-card', trigger: '#profile-trigger', surface: '.ren-hover-card[popover]', open: 'focus' },
];

/** The largest gap any of these leaves between trigger and surface, with slack. */
const MAX_GAP = 16;

/** Turn CSS anchor positioning off for everything this page loads. */
async function withoutAnchorPositioning(page) {
  await page.addInitScript(() => {
    const native = CSS.supports.bind(CSS);
    CSS.supports = (...args) => (/anchor|position-area|position-try/.test(args.join(' ')) ? false : native(...args));
  });
  await page.route('**/*.css', async (route) => {
    const response = await route.fetch();
    const css = (await response.text())
      .replace(/@supports not \(\(anchor-name/g, '@supports ((anchor-name')
      .replace(/(^|[;{\s])(position-area|position-try-fallbacks|position-try|position-anchor|anchor-name)(\s*:)/g, '$1--without-$2$3');
    await route.fulfill({ response, body: css });
  });
}

function measure(page, overlay) {
  return page.evaluate(([triggerSelector, surfaceSelector, maxGap]) => {
    const trigger = document.querySelector(triggerSelector).getBoundingClientRect();
    const surface = document.querySelector(surfaceSelector).getBoundingClientRect();
    const side = surface.bottom <= trigger.top + 1 ? 'above' : surface.top >= trigger.bottom - 1 ? 'below' : 'over the trigger';
    const gap = Math.round(side === 'above' ? trigger.top - surface.bottom : surface.top - trigger.bottom);
    return {
      side,
      nextToItsTrigger: gap >= 0 && gap <= maxGap,
      // Centred on the trigger, give or take the clamp to the viewport.
      alongItsTrigger: surface.left < trigger.right && surface.right > trigger.left,
      onScreen: surface.top >= -1 && surface.left >= -1 && surface.right <= window.innerWidth + 1,
    };
  }, [overlay.trigger, overlay.surface, MAX_GAP]);
}

for (const overlay of OVERLAYS) {
  test(`ren-${overlay.key} opens next to its trigger on a scrolled page without anchor positioning`, { tag: [`@ren-${overlay.key}`, '@runtime'] }, async ({ page }) => {
    await withoutAnchorPositioning(page);
    const errors = await mountRegistry(page, server.origin, overlay.key, (usage) => `<div style="padding-block: 2400px; padding-inline: 60px; inline-size: 420px">${usage}</div>`);
    expect(await page.evaluate(() => CSS.supports('position-area', 'bottom span-all')), 'the engine has no anchor positioning').toBe(false);

    await page.evaluate((selector) => {
      const rect = document.querySelector(selector).getBoundingClientRect();
      window.scrollTo(0, window.scrollY + rect.top - window.innerHeight / 3);
    }, overlay.trigger);
    expect(await page.evaluate(() => window.scrollY), 'the page has scrolled').toBeGreaterThan(1000);

    const trigger = page.locator(overlay.trigger);
    if (overlay.open === 'click') await trigger.click();
    else await trigger.focus();
    await expect(page.locator(overlay.surface)).toBeVisible();

    await expect.poll(() => measure(page, overlay), { message: `${overlay.key} opens next to its trigger, not in a corner of the viewport` })
      .toMatchObject({ nextToItsTrigger: true, alongItsTrigger: true, onScreen: true });
    const opened = await measure(page, overlay);

    // The page moves under an open overlay: the script places it again.
    await page.evaluate(() => window.scrollBy(0, 60));
    await expect.poll(() => measure(page, overlay), { message: `${overlay.key} follows its trigger when the page scrolls` }).toEqual(opened);
    expect(errors).toEqual([]);
  });
}
