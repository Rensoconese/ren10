// @ts-check
/**
 * RTL smoke: every registry component, mounted under `dir="rtl"`.
 *
 * The suite proved accessibility, runtime, lifecycle and keyboard behaviour
 * per component, and never once set `dir="rtl"`. A physical `left`, a centring
 * transform paired with a logical inset, an overlay anchored to the wrong edge:
 * none of them throws, so nothing caught them.
 *
 * Each component is mounted from its registry usage in both directions and has
 * to satisfy three things under RTL:
 *
 *   1. it throws nothing;
 *   2. the document does not scroll sideways and no box leaves the viewport;
 *   3. its layout is the mirror image of its LTR layout, box by box.
 *
 * The third is what makes this more than "it renders": a box that keeps its
 * LTR side is reported by name. Components that open are checked again once
 * open, which is where anchored overlays live: through `open()` / `show()` when
 * the element has one, through the REVEAL step below otherwise.
 *
 * Tests carry `@<component> @rtl`, which `npm run coverage:check` counts
 * (tests/coverage/README.md). Behaviour that changes under RTL (arrow keys,
 * fill direction, scrolling) is in rtl-contracts.spec.cjs.
 */
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');
const { REGISTRY, ROOT } = require('../utils/mount-registry.cjs');
const { mountDirected, settledBoxes, overflowProblems, mirrorProblems } = require('../utils/rtl.cjs');

/** Room on both sides of the host, so an overlay on the wrong edge is not clamped back into place. */
const INSET = 240;

/**
 * Surfaces that keep a physical side under RTL, by design: they must not move,
 * and their content must mirror inside them. Every entry carries the rule that
 * makes it right; a component that is merely not mirrored is a defect, not an
 * entry.
 * @type {Record<string, { selector: string, why: string }[]>}
 */
const PHYSICAL = {
  sheet: [{ selector: 'dialog.ren-sheet', why: 'the usage asks for side="right", a physical edge; side="inline-end" is the one that follows the direction' }],
  toast: [{ selector: 'ren-toast-viewport', why: 'data-position="bottom-right" names a physical corner; the toasts inside it still mirror' }],
};

/**
 * How to bring a component on screen when it has no `open()` / `show()`: the
 * gesture its usage documents. Without this the smoke would measure a closed
 * dialog, an empty toast viewport or a collapsed menu, and prove nothing.
 * @type {Record<string, (page: import('@playwright/test').Page) => Promise<unknown>>}
 */
const REVEAL = {
  'alert-dialog': (page) => page.evaluate(() => document.querySelector('#host dialog').showModal()),
  // What the usage's own inline script does (the mount helper strips scripts),
  // with no auto-dismiss so the toasts are still there when they are measured.
  toast: async (page) => {
    await page.evaluate(() => import('/components/composites/ren-toast/ren-toast.js').then(({ toast }) => {
      toast({ title: 'Message sent successfully', duration: 0 });
      toast({ title: 'Upload failed', description: 'Try again', duration: 0 });
    }));
    await expect(page.locator('.ren-toast')).toHaveCount(2);
  },
  menubar: async (page) => {
    await page.locator('.ren-menubar-trigger').first().click();
    await expect(page.locator('.ren-menubar-trigger').first()).toHaveAttribute('aria-expanded', 'true');
  },
  'color-picker': async (page) => {
    await page.locator('.ren-color-picker-trigger').click();
    await expect(page.locator('.ren-color-picker-trigger')).toHaveAttribute('aria-expanded', 'true');
  },
  'context-menu': async (page) => {
    await page.locator('.ren-context-menu-trigger').click({ button: 'right' });
    await expect(page.locator('ren-context-menu')).toBeVisible();
  },
};

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

/** Open the component through its public method, when it has one. */
const openThroughApi = (page, tag) => page.evaluate((name) => {
  const element = name ? document.querySelector(name) : null;
  const method = element ? ['open', 'show'].find((candidate) => typeof element[candidate] === 'function') : null;
  if (method) element[method]();
  return method ?? null;
}, tag);

/** Mount under one direction and read the layout as mounted and, when it opens, once open. */
async function layoutUnder(page, key, dir) {
  const physical = (PHYSICAL[key] ?? []).map((surface) => surface.selector);
  const errors = await mountDirected(page, server.origin, key, dir, { inset: INSET });
  const mounted = await settledBoxes(page, physical);
  const tag = REGISTRY[key].usage.match(/<(ren-[a-z-]+)/)?.[1] ?? null;
  let how = null;
  if (REVEAL[key]) {
    await REVEAL[key](page);
    how = 'its documented gesture';
  } else {
    const method = await openThroughApi(page, tag);
    how = method ? `${method}()` : null;
  }
  const opened = how ? await settledBoxes(page, physical) : null;
  return { errors: [...errors], mounted, opened, how };
}

/** Boxes the component itself rendered: everything but the fixture's host. */
const rendered = (snapshot) => (snapshot ? snapshot.boxes.filter((box) => box.label !== '<main#host>').length : 0);

test('the registry exposes the components this suite drives', () => {
  expect(Object.keys(REGISTRY).length).toBeGreaterThan(40);
});

for (const [key, entry] of Object.entries(REGISTRY)) {
  test.describe(`rtl smoke: ${entry.dir}`, { tag: [`@${entry.dir}`, '@rtl'] }, () => {
    test('stays on screen and mirrors its LTR layout under dir="rtl"', async ({ page }) => {
      const ltr = await layoutUnder(page, key, 'ltr');
      const rtl = await layoutUnder(page, key, 'rtl');

      expect(rtl.errors, 'threw under dir="rtl"').toEqual([]);
      expect(rendered(rtl.mounted) + rendered(rtl.opened), 'the component must put a box on screen, or nothing below is proven').toBeGreaterThan(0);
      expect(overflowProblems(rtl.mounted), 'horizontal overflow under RTL').toEqual([]);
      expect(mirrorProblems(ltr.mounted, rtl.mounted), 'RTL layout is not the mirror of the LTR layout').toEqual([]);

      if (rtl.opened) {
        expect(rendered(rtl.opened), `${rtl.how} must leave something on screen`).toBeGreaterThan(0);
        expect(overflowProblems(rtl.opened), `horizontal overflow under RTL after ${rtl.how}`).toEqual([]);
        expect(mirrorProblems(ltr.opened, rtl.opened), `after ${rtl.how}, RTL layout is not the mirror of the LTR layout`).toEqual([]);
      }
    });
  });
}
