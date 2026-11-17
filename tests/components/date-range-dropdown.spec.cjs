// @ts-check
/**
 * The date range dropdown is as wide as what it holds.
 *
 * Its inner wrapper is an inline-size container (the compact layout is a
 * container query), and a size container contributes no intrinsic width. The
 * popup around it shrinks to fit, so with nothing giving the wrapper a width
 * the dropdown was two borders wide, the query saw a zero-width container and
 * stacked the calendars, and everything overflowed a 2px box.
 *
 * These tests look at the open dropdown: its box contains the presets, both
 * calendars and the footer, the calendars sit side by side when there is room
 * and stacked when there is not, and no calendar is narrower than its days.
 */
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');
const { ROOT, mountRegistry } = require('../utils/mount-registry.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

const TOLERANCE = 1;

/** Open the dropdown and return its box with the boxes of what it holds. */
async function openDropdown(page) {
  const trigger = page.locator('.ren-date-range-trigger');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const dropdown = page.locator('.ren-date-range-dropdown');
  await dropdown.evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)));
  return dropdown.evaluate((el) => {
    const box = (node) => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    };
    const calendars = [...el.querySelectorAll('ren-calendar')];
    return {
      dropdown: box(el),
      parts: {
        presets: box(el.querySelector('.ren-date-range-presets')),
        'first calendar': box(calendars[0]),
        'second calendar': box(calendars[1]),
        footer: box(el.querySelector('.ren-date-range-footer')),
      },
      // A calendar squeezed below its seven days scrolls or spills sideways.
      spill: calendars.map((calendar) => calendar.scrollWidth - calendar.clientWidth),
    };
  });
}

function expectContained({ dropdown, parts }) {
  for (const [name, part] of Object.entries(parts)) {
    expect(part.width, `the ${name} has a width`).toBeGreaterThan(0);
    expect(part.left, `the ${name} starts inside the dropdown`).toBeGreaterThanOrEqual(dropdown.left - TOLERANCE);
    expect(part.right, `the ${name} ends inside the dropdown`).toBeLessThanOrEqual(dropdown.right + TOLERANCE);
  }
}

test.describe('date range dropdown', () => {
  test('holds two calendars side by side on a wide viewport', { tag: ['@ren-date-range-picker', '@runtime'] }, async ({ page }) => {
    const errors = await mountRegistry(page, server.origin, 'date-range-picker');
    const layout = await openDropdown(page);
    const viewport = page.viewportSize();

    expectContained(layout);
    const [first, second] = [layout.parts['first calendar'], layout.parts['second calendar']];
    expect(Math.abs(first.top - second.top), 'the calendars share a row').toBeLessThanOrEqual(TOLERANCE);
    expect(second.left, 'one after the other').toBeGreaterThanOrEqual(first.right - TOLERANCE);
    expect(layout.spill, 'no calendar is narrower than its days').toEqual([0, 0]);
    expect(layout.dropdown.right, 'the dropdown fits the viewport').toBeLessThanOrEqual(viewport.width);
    expect(layout.dropdown.left).toBeGreaterThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test('stacks the calendars in a full-width sheet on a narrow viewport', { tag: ['@ren-date-range-picker', '@runtime'] }, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const errors = await mountRegistry(page, server.origin, 'date-range-picker');
    const layout = await openDropdown(page);

    expectContained(layout);
    expect(Math.round(layout.dropdown.left), 'the sheet starts at the left edge').toBe(0);
    expect(Math.round(layout.dropdown.width), 'and spans the viewport').toBe(390);
    const [first, second] = [layout.parts['first calendar'], layout.parts['second calendar']];
    expect(second.top, 'the second calendar is under the first').toBeGreaterThanOrEqual(first.bottom - TOLERANCE);
    expect(layout.spill, 'no calendar is narrower than its days').toEqual([0, 0]);
    expect(errors).toEqual([]);
  });

  test('gives touch-sized calendars the room they need', { tag: ['@ren-date-range-picker', '@runtime'] }, async ({ browser }, testInfo) => {
    // Coarse pointers get larger day targets, so each calendar is wider.
    const context = await browser.newContext({ ...testInfo.project.use, viewport: { width: 1280, height: 1024 }, hasTouch: true });
    const page = await context.newPage();
    try {
      const errors = await mountRegistry(page, server.origin, 'date-range-picker');
      test.skip(!(await page.evaluate(() => matchMedia('(any-pointer: coarse)').matches)), 'this engine does not report a coarse pointer under touch emulation');
      const layout = await openDropdown(page);

      expectContained(layout);
      const [first, second] = [layout.parts['first calendar'], layout.parts['second calendar']];
      expect(Math.abs(first.top - second.top), 'the calendars share a row').toBeLessThanOrEqual(TOLERANCE);
      expect(layout.spill, 'no calendar is narrower than its days').toEqual([0, 0]);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  });
});
