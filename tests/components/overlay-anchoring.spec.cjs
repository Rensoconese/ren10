// @ts-check
/**
 * Multi-instance overlay regression tests.
 *
 * Two classes of bug are covered here, both of which only surface when more
 * than one instance of the same overlay exists on a page — the reason a
 * single-instance docs page never caught them:
 *
 *   1. Anchor collision. `anchor-name` is document-wide. When every trigger
 *      declares the same name, the spec resolves it to the *last* matching
 *      element in tree order, so overlay #1 renders against trigger #N.
 *      Each pairing needs a per-instance name (utils/anchor.js).
 *
 *   2. Escape fan-out. A per-instance `keydown` listener on `document` means
 *      one Escape dismisses every open layer at once. Dismissal must go
 *      through the shared layer stack (utils/dismissable.js) so only the
 *      topmost layer closes.
 */
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const FIXTURE = '/tests/components/fixtures/overlay-multi-instance.html';

/** Overlays must sit nearer their own trigger than any other trigger. */
const MAX_ANCHOR_DRIFT = 160;

let server;

test.beforeAll(async () => {
  server = await startStaticServer(ROOT);
});

test.afterAll(async () => {
  await server?.close();
});

/** @param {import('@playwright/test').Page} page */
async function topOf(page, id) {
  return page.evaluate(
    (elementId) => Math.round(document.getElementById(elementId).getBoundingClientRect().top),
    id
  );
}

/**
 * Assert an overlay settles next to its own trigger and far from the other one.
 *
 * Anchor resolution lands a frame after the overlay becomes visible, so the
 * distance is polled rather than sampled once — a single read can catch the
 * overlay still at its pre-anchored position.
 *
 * @param {import('@playwright/test').Page} page
 */
async function expectAnchoredToOwnTrigger(page, overlayId, ownTriggerId, otherTriggerId) {
  const distanceTo = async (triggerId) =>
    Math.abs((await topOf(page, overlayId)) - (await topOf(page, triggerId)));

  await expect
    .poll(() => distanceTo(ownTriggerId), {
      message: `${overlayId} should settle next to ${ownTriggerId}`,
    })
    .toBeLessThan(MAX_ANCHOR_DRIFT);

  expect(
    await distanceTo(otherTriggerId),
    `${overlayId} must not anchor to ${otherTriggerId}`
  ).toBeGreaterThan(MAX_ANCHOR_DRIFT);
}

test.beforeEach(async ({ page }) => {
  const response = await page.goto(`${server.origin}${FIXTURE}`);
  expect(response?.status()).toBe(200);
  await page.waitForFunction(() => customElements.get('ren-popover') !== undefined);
});

test('each popover anchors to its own trigger', async ({ page }) => {
  await page.evaluate(() => document.getElementById('popover-1').open());
  await expect(page.locator('#popover-1')).toBeVisible();

  await expectAnchoredToOwnTrigger(page, 'popover-1', 'popover-trigger-1', 'popover-trigger-2');
});

test('sibling overlays get distinct anchor names', async ({ page }) => {
  const names = await page.evaluate(() => ({
    popover: [
      document.getElementById('popover-trigger-1').style.anchorName,
      document.getElementById('popover-trigger-2').style.anchorName,
    ],
    tooltip: [
      document.getElementById('tooltip-trigger-1').style.anchorName,
      document.getElementById('tooltip-trigger-2').style.anchorName,
    ],
    hoverCard: [
      document.getElementById('hover-card-trigger-1').style.anchorName,
      document.getElementById('hover-card-trigger-2').style.anchorName,
    ],
  }));

  for (const [family, pair] of Object.entries(names)) {
    expect(pair[0], `${family} first anchor should be set`).toBeTruthy();
    expect(pair[1], `${family} second anchor should be set`).toBeTruthy();
    expect(pair[0], `${family} anchors must not collide`).not.toBe(pair[1]);
  }
});

test('each tooltip renders against its own trigger', async ({ page }) => {
  await page.hover('#tooltip-trigger-1');
  await expect(page.locator('#tooltip-1')).toBeVisible();

  await expectAnchoredToOwnTrigger(page, 'tooltip-1', 'tooltip-trigger-1', 'tooltip-trigger-2');
});

test('each hover card renders against its own trigger', async ({ page }) => {
  await page.hover('#hover-card-trigger-1');
  await expect(page.locator('#hover-card-1')).toBeVisible();

  await expectAnchoredToOwnTrigger(
    page,
    'hover-card-1',
    'hover-card-trigger-1',
    'hover-card-trigger-2'
  );
});

/**
 * These three keep their anchored surface in the top layer via the Popover API,
 * so the collision only reproduces once the surface is actually open — a closed
 * fixture measures the pre-anchored position and looks healthy.
 */
const POPOVER_OVERLAYS = [
  {
    label: 'date picker',
    surface: '.ren-date-picker-dropdown',
    trigger: '.ren-date-picker-trigger',
    hosts: ['date-picker-1', 'date-picker-2'],
    openWith: 'api',
  },
  {
    label: 'date range picker',
    surface: '.ren-date-range-dropdown',
    trigger: '.ren-date-range-trigger',
    hosts: ['date-range-1', 'date-range-2'],
    openWith: 'api',
  },
  {
    label: 'color picker',
    surface: '.ren-color-picker-dropdown',
    trigger: '.ren-color-picker-trigger',
    hosts: ['color-picker-1', 'color-picker-2'],
    openWith: 'click',
  },
];

for (const overlay of POPOVER_OVERLAYS) {
  /**
   * The exact assertion: each instance's surface must point at the anchor name
   * its *own* trigger declares, and the two instances must not share a name.
   *
   * This is what actually fails under the bug — the shared name lived in the
   * stylesheet, so with the bug present both triggers report an empty inline
   * `anchor-name` and there is no per-instance pairing to find.
   */
  test(`each ${overlay.label} pairs its surface with its own trigger anchor`, async ({ page }) => {
    const pairs = await page.evaluate(
      ([hostIds, surfaceSel, triggerSel]) =>
        hostIds.map((id) => {
          const host = document.getElementById(id);
          return {
            anchorName: host.querySelector(triggerSel).style.anchorName,
            positionAnchor: host.querySelector(surfaceSel).style.positionAnchor,
          };
        }),
      [overlay.hosts, overlay.surface, overlay.trigger]
    );

    for (const [index, pair] of pairs.entries()) {
      expect(pair.anchorName, `instance ${index + 1} must declare an inline anchor name`).toBeTruthy();
      expect(
        pair.positionAnchor,
        `instance ${index + 1} surface must point at its own trigger`
      ).toBe(pair.anchorName);
    }

    expect(pairs[0].anchorName, 'sibling instances must not share an anchor name').not.toBe(
      pairs[1].anchorName
    );
  });

  test(`each ${overlay.label} renders its open surface beside its own trigger`, async ({ page }) => {
    const [firstHost, secondHost] = overlay.hosts;

    await page.evaluate(
      ([hostId, method, triggerSel]) => {
        const host = document.getElementById(hostId);
        if (method === 'api') host.open();
        else host.querySelector(triggerSel).click();
      },
      [firstHost, overlay.openWith, overlay.trigger]
    );

    await expect(page.locator(`#${firstHost} ${overlay.surface}`)).toBeVisible();

    /**
     * Gap between the nearest horizontal edges of the surface and a trigger.
     *
     * Edge distance rather than top-to-top: these surfaces are tall (the color
     * picker is ~590px, the range panel ~910px) and `position-try-fallbacks`
     * legitimately flips them above the trigger when there is no room below.
     * A top-to-top measurement reads that healthy flip as a huge drift; the
     * edge gap stays at the token offset either way.
     */
    const gapToTrigger = async (hostId) =>
      page.evaluate(
        ([surfaceHost, sel, triggerHost, trigSel]) => {
          const surface = document
            .getElementById(surfaceHost)
            .querySelector(sel)
            .getBoundingClientRect();
          const trigger = document
            .getElementById(triggerHost)
            .querySelector(trigSel)
            .getBoundingClientRect();
          return Math.round(
            Math.min(
              Math.abs(surface.top - trigger.bottom),
              Math.abs(trigger.top - surface.bottom)
            )
          );
        },
        [firstHost, overlay.surface, hostId, overlay.trigger]
      );

    /**
     * Only adjacency to its own trigger is asserted. "Far from the sibling"
     * is not a sound geometric check here: these surfaces are taller than the
     * spacing between instances, so a correctly anchored dropdown still ends
     * up within ~116px of the next trigger. Discrimination is the identity
     * test's job above — under the bug this gap blows out to ~395px anyway.
     */
    await expect
      .poll(() => gapToTrigger(firstHost), {
        message: `${overlay.label} surface should sit flush against its own trigger`,
      })
      .toBeLessThan(MAX_ANCHOR_DRIFT);
  });
}

test('Escape dismisses one layer at a time, innermost first', async ({ page }) => {
  const isOpen = () =>
    page.evaluate(() => [
      document.getElementById('popover-1').isOpen(),
      document.getElementById('popover-2').isOpen(),
    ]);

  await page.evaluate(() => {
    document.getElementById('popover-1').open();
    document.getElementById('popover-2').open();
  });
  expect(await isOpen()).toEqual([true, true]);

  await page.keyboard.press('Escape');
  await expect
    .poll(async () => (await isOpen()).filter(Boolean).length)
    .toBe(1);
  // The most recently opened layer is the one that closes.
  expect(await isOpen()).toEqual([true, false]);

  await page.keyboard.press('Escape');
  await expect
    .poll(async () => (await isOpen()).filter(Boolean).length)
    .toBe(0);
});

test('disconnecting an overlay restores the trigger styles it injected', async ({ page }) => {
  const before = await page.evaluate(
    () => document.getElementById('popover-trigger-1').style.anchorName
  );
  expect(before).toBeTruthy();

  await page.evaluate(() => document.getElementById('popover-1').remove());

  const after = await page.evaluate(
    () => document.getElementById('popover-trigger-1').style.anchorName
  );
  expect(after).toBe('');
});
