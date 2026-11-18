// @ts-check
/**
 * Anchored overlays choose their side by the room on screen, on a page that
 * has scrolled.
 *
 * The six overlays placed with `position-area` were `position: absolute`. In
 * the top layer an absolute box is laid out against the initial containing
 * block, which is the first screenful of the document, so once the page had
 * scrolled `position-try-fallbacks` measured room that was not on screen.
 * Chromium and Firefox never flipped: an overlay with no room under its
 * trigger opened below the fold (and the date picker, which moves focus into
 * its calendar, dragged the page down with it). WebKit always flipped: every
 * overlay opened above its trigger, whatever `placement` said. None of it
 * showed on a page short enough not to scroll, which is what every other test
 * mounts.
 *
 * `ren-select` and `ren-menu` are placed by script against the viewport, so
 * they are here for the same two cases. The select failed its own way: it
 * focused an option before placing the list, which still hung under the
 * trigger, and near the bottom of the viewport the browser scrolled the page
 * to that option. The list then had room below and never flipped.
 *
 * Each overlay is mounted far down a tall page, the page is scrolled so the
 * trigger is where the case needs it, and the open surface is measured
 * against the trigger and the viewport.
 */
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');
const { ROOT, mountRegistry } = require('../utils/mount-registry.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

/**
 * Where each overlay opens when it has the room (`side`), and how it is opened.
 * `anchored` ones are placed by CSS anchor positioning and flip only if the
 * engine does; the other two are placed by script.
 * The two hover overlays are opened by focus, which they answer the same way:
 * a browser re-sends the pointer's last position after a scroll, and a hover
 * made right after one can be undone by it.
 */
const OVERLAYS = [
  { key: 'date-range-picker', anchored: true, trigger: '.ren-date-range-trigger', surface: '.ren-date-range-dropdown', side: 'below', open: 'click' },
  { key: 'date-picker', anchored: true, trigger: '.ren-date-picker-trigger', surface: '.ren-date-picker-dropdown', side: 'below', open: 'click' },
  { key: 'color-picker', anchored: true, trigger: '.ren-color-picker-trigger', surface: '.ren-color-picker-dropdown', side: 'below', open: 'click' },
  { key: 'popover', anchored: true, trigger: '#account-trigger', surface: 'ren-popover', side: 'below', open: 'click' },
  { key: 'tooltip', anchored: true, trigger: '.ren-tooltip-trigger', surface: 'ren-tooltip', side: 'above', open: 'focus' },
  { key: 'hover-card', anchored: true, trigger: '#profile-trigger', surface: '.ren-hover-card[popover]', side: 'below', open: 'focus' },
  { key: 'select', trigger: '[data-select-trigger]', surface: '[data-select-content]', side: 'below', open: 'click' },
  { key: 'menu', trigger: '#actions-trigger', surface: 'ren-menu', side: 'below', open: 'click' },
];

const OTHER = { above: 'below', below: 'above' };
/** The largest gap any of these leaves between trigger and surface, with slack. */
const MAX_GAP = 16;

/** Mount the registry usage two and a half thousand pixels down a tall page. */
function mountDownThePage(page, key) {
  return mountRegistry(page, server.origin, key, (usage) => `<div style="padding-block: 2400px; padding-inline: 60px; inline-size: 420px">${usage}</div>`);
}

/**
 * Scroll so the trigger has room on its overlay's own side (`room`) or is
 * pressed against the edge of the viewport on that side (`tight`).
 */
async function placeTrigger(page, overlay, where) {
  await page.evaluate(([selector, side, place]) => {
    const rect = document.querySelector(selector).getBoundingClientRect();
    const top = side === 'below'
      ? (place === 'room' ? 100 : window.innerHeight - rect.height - 8)
      : (place === 'room' ? window.innerHeight / 2 : 6);
    window.scrollTo(0, window.scrollY + rect.top - top);
  }, [overlay.trigger, overlay.side, where]);
}

async function open(page, overlay) {
  const trigger = page.locator(overlay.trigger);
  if (overlay.open === 'click') await trigger.click();
  else await trigger.focus();
  const surface = page.locator(overlay.surface);
  await expect(surface).toBeVisible();
  await surface.evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished.catch(() => {}))));
}

/** Where the open surface is: which side of its trigger, how far, and whether it is on screen. */
function measure(page, overlay) {
  return page.evaluate(([triggerSelector, surfaceSelector]) => {
    const trigger = document.querySelector(triggerSelector).getBoundingClientRect();
    const surface = document.querySelector(surfaceSelector).getBoundingClientRect();
    const side = surface.bottom <= trigger.top + 1 ? 'above' : surface.top >= trigger.bottom - 1 ? 'below' : 'over the trigger';
    return {
      side,
      gap: Math.round(side === 'above' ? trigger.top - surface.bottom : surface.top - trigger.bottom),
      onScreen: surface.top >= -1 && surface.bottom <= window.innerHeight + 1,
      scrollY: Math.round(window.scrollY),
    };
  }, [overlay.trigger, overlay.surface]);
}

/**
 * Whether this engine flips a bare anchored box at the spot the trigger is in:
 * `position: fixed`, on the overlay's own anchor and side, given `flip-block`.
 *
 * WebKit 26.4 does not at the bottom edge of a page that has scrolled. It
 * keeps the box below the fold, where WebKit 26.6, Chromium and Firefox put it
 * above (the same engine does flip at the top edge, and flips an absolute box,
 * which is wrong for the other reasons in the header). An anchored overlay has
 * nothing but the engine's flip, so where a bare box stays put there is no
 * component behaviour to assert.
 */
async function engineFlipsHere(page, overlay) {
  const anchor = await page.locator(overlay.surface).evaluate((el) => el.style.positionAnchor || getComputedStyle(el).positionAnchor);
  // No anchor would leave the probe unplaced and read as "does not flip".
  expect(anchor, `${overlay.key} ties its surface to an anchor`).toMatch(/^--/);
  return page.evaluate(async ([triggerSelector, name, side]) => {
    const probe = document.createElement('div');
    probe.setAttribute('popover', 'manual');
    probe.style.cssText = `position:fixed;inset:auto;margin:0;padding:0;border:0;inline-size:80px;block-size:120px;position-anchor:${name};position-area:${side === 'below' ? 'bottom' : 'top'} span-all;position-try-fallbacks:flip-block`;
    document.body.appendChild(probe);
    probe.showPopover();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const box = probe.getBoundingClientRect();
    const trigger = document.querySelector(triggerSelector).getBoundingClientRect();
    probe.remove();
    return side === 'below' ? box.bottom <= trigger.top + 1 : box.top >= trigger.bottom - 1;
  }, [overlay.trigger, anchor, overlay.side]);
}

/**
 * What a failed placement needs to be read from a CI log, where the engine is
 * not at hand: the viewport as the page sees it, the box the engine lays
 * `position: fixed` against, the trigger, the surface and its placement
 * styles, and where the same engine puts a bare anchored box at this spot,
 * fixed and absolute, when it is given the same flip.
 */
function describePlacement(page, overlay) {
  return page.evaluate(async ([triggerSelector, surfaceSelector, side]) => {
    const edges = (el) => {
      const rect = el.getBoundingClientRect();
      return `top ${Math.round(rect.top)} bottom ${Math.round(rect.bottom)} left ${Math.round(rect.left)} right ${Math.round(rect.right)}`;
    };
    const surface = document.querySelector(surfaceSelector);
    const style = getComputedStyle(surface);
    const add = (cssText, popover) => {
      const el = document.createElement('div');
      if (popover) el.setAttribute('popover', 'manual');
      el.style.cssText = cssText;
      document.body.appendChild(el);
      if (popover) el.showPopover();
      return el;
    };
    const fixed = add('position:fixed;inset:0;visibility:hidden;pointer-events:none', false);
    const fixedArea = edges(fixed);
    fixed.remove();

    const anchor = surface.style.positionAnchor || style.positionAnchor;
    const bare = {};
    for (const position of ['fixed', 'absolute']) {
      const el = add(`position:${position};inset:auto;margin:0;padding:0;border:0;inline-size:80px;block-size:120px;position-anchor:${anchor};position-area:${side === 'below' ? 'bottom' : 'top'} span-all;position-try-fallbacks:flip-block`, true);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      bare[position] = edges(el);
      el.remove();
    }
    return {
      engine: navigator.userAgent,
      viewport: `innerHeight ${window.innerHeight} clientHeight ${document.documentElement.clientHeight} visual ${Math.round(window.visualViewport?.height ?? -1)} at ${Math.round(window.visualViewport?.offsetTop ?? -1)} scrollY ${Math.round(window.scrollY)}`,
      fixedArea,
      trigger: edges(document.querySelector(triggerSelector)),
      surface: edges(surface),
      surfaceStyle: `position ${style.position}; position-area ${style.positionArea}; position-try-fallbacks ${style.positionTryFallbacks}; position-anchor ${anchor}; margin ${style.margin}`,
      bareBoxWithFlipBlock: bare,
    };
  }, [overlay.trigger, overlay.surface, overlay.side]);
}

/** The surface has settled on `side`, on screen and next to its trigger. */
async function expectBeside(page, overlay, side, scrollY) {
  // Anchor resolution can land a frame after the surface is visible.
  try {
    await expect.poll(async () => {
      const at = await measure(page, overlay);
      return { side: at.side, nextToItsTrigger: at.gap >= 0 && at.gap <= MAX_GAP };
    }, { message: `${overlay.key} opens ${side} its trigger` }).toEqual({ side, nextToItsTrigger: true });
  } catch (error) {
    error.message += `\n\nPlacement: ${JSON.stringify(await describePlacement(page, overlay), null, 2)}`;
    throw error;
  }
  const at = await measure(page, overlay);
  expect(at.onScreen, `${overlay.key} is inside the viewport`).toBe(true);
  expect(at.scrollY, `opening ${overlay.key} does not scroll the page`).toBe(scrollY);
  return at;
}

for (const overlay of OVERLAYS) {
  const tags = { tag: [`@ren-${overlay.key}`, '@runtime'] };

  test(`ren-${overlay.key} opens ${overlay.side} its trigger on a scrolled page when there is room`, tags, async ({ page }) => {
    const errors = await mountDownThePage(page, overlay.key);
    await placeTrigger(page, overlay, 'room');
    const scrollY = await page.evaluate(() => Math.round(window.scrollY));
    expect(scrollY, 'the page has scrolled').toBeGreaterThan(1000);

    await open(page, overlay);
    const opened = await expectBeside(page, overlay, overlay.side, scrollY);

    // The page moves under an open overlay: it goes with its trigger.
    await page.evaluate(() => window.scrollBy(0, 60));
    await expect.poll(() => measure(page, overlay), { message: `${overlay.key} follows its trigger when the page scrolls` })
      .toEqual({ ...opened, scrollY: scrollY + 60 });
    expect(errors).toEqual([]);
  });

  test(`ren-${overlay.key} flips ${OTHER[overlay.side]} its trigger on a scrolled page when there is no room ${overlay.side}`, tags, async ({ page }) => {
    const errors = await mountDownThePage(page, overlay.key);
    await placeTrigger(page, overlay, 'tight');
    const scrollY = await page.evaluate(() => Math.round(window.scrollY));
    expect(scrollY, 'the page has scrolled').toBeGreaterThan(1000);
    if (overlay.anchored) {
      test.skip(!(await engineFlipsHere(page, overlay)), 'this engine keeps a bare fixed anchored box on its own side at this edge of a scrolled page (WebKit 26.4; 26.6 flips it), so the overlay has no flip to rely on');
    }

    await open(page, overlay);
    await expectBeside(page, overlay, OTHER[overlay.side], scrollY);
    expect(errors).toEqual([]);
  });
}
