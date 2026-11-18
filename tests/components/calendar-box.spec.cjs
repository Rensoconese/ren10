// @ts-check
/**
 * A calendar is a box of its own, wherever it is put.
 *
 * `.ren-calendar` is on the `<ren-calendar>` host, and a custom element is
 * `display: inline` until a rule says otherwise. Nothing said otherwise, so
 * the calendar only looked right as a flex or grid item (which is how the
 * docs demo and the date range picker hold it). In a plain block it ran the
 * full width of its parent with its border broken into two stubs, and inside
 * the date picker its header and days touched the edges of the dropdown.
 *
 * These tests put it in a block parent and in the date picker, and check that
 * the host's box is the card: its own width, with the header and the grid
 * inside its padding. The last ones cover the date picker's sheet on a narrow
 * viewport, which is the same dropdown stretched across the bottom edge.
 */
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');
const { ROOT, FIXTURE, mountRegistry } = require('../utils/mount-registry.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

const TOLERANCE = 1;

/** The boxes of a calendar, its header and its grid, and of what holds it. */
function calendarBoxes(page, holder) {
  return page.evaluate((selector) => {
    const box = (node) => {
      const rect = node.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
    };
    const calendar = document.querySelector('ren-calendar');
    const holding = document.querySelector(selector);
    return {
      holder: box(holding),
      overflow: { block: holding.scrollHeight - holding.clientHeight, inline: holding.scrollWidth - holding.clientWidth },
      calendar: box(calendar),
      header: box(calendar.querySelector('.ren-calendar-header')),
      grid: box(calendar.querySelector('.ren-calendar-grid')),
    };
  }, holder);
}

/** The header and the grid sit inside `outer`, clear of its edges. */
function expectPadded(outer, { header, grid }, name) {
  expect(header.left - outer.left, `the header is clear of the ${name}'s left edge`).toBeGreaterThanOrEqual(8);
  expect(outer.right - header.right, `the header is clear of the ${name}'s right edge`).toBeGreaterThanOrEqual(8);
  expect(header.top - outer.top, `the header is clear of the ${name}'s top edge`).toBeGreaterThanOrEqual(8);
  expect(grid.left - outer.left, `the days are clear of the ${name}'s left edge`).toBeGreaterThanOrEqual(8);
  expect(outer.right - grid.right, `the days are clear of the ${name}'s right edge`).toBeGreaterThanOrEqual(8);
  expect(outer.bottom - grid.bottom, `the days are clear of the ${name}'s bottom edge`).toBeGreaterThanOrEqual(8);
}

async function openDatePicker(page) {
  const trigger = page.locator('.ren-date-picker-trigger');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const dropdown = page.locator('.ren-date-picker-dropdown');
  await dropdown.evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)));
  return dropdown;
}

test.describe('calendar box', () => {
  test('a calendar in a block parent is a card of its own width', { tag: ['@ren-calendar', '@runtime'] }, async ({ page }) => {
    const errors = await mountRegistry(page, server.origin, 'calendar', (usage) => `<div id="block-parent" style="inline-size: 800px">${usage}</div>`);
    await expect(page.locator('.ren-calendar-day').first()).toBeVisible();
    const boxes = await calendarBoxes(page, '#block-parent');

    expect(boxes.calendar.width, 'the calendar keeps its own width, not its parent\'s').toBeLessThanOrEqual(400);
    expect(boxes.calendar.width).toBeGreaterThanOrEqual(240);
    expectPadded(boxes.calendar, boxes, 'calendar');
    expect(boxes.grid.width, 'the days fit the calendar').toBeLessThanOrEqual(boxes.calendar.width);
    expect(errors).toEqual([]);
  });

  test('the date picker dropdown holds its calendar with room round it', { tag: ['@ren-date-picker', '@runtime'] }, async ({ page }) => {
    const errors = await mountRegistry(page, server.origin, 'date-picker');
    await openDatePicker(page);
    const boxes = await calendarBoxes(page, '.ren-date-picker-dropdown');

    expectPadded(boxes.holder, boxes, 'dropdown');
    expect(boxes.overflow, 'nothing spills out of the dropdown').toEqual({ block: 0, inline: 0 });
    expect(errors).toEqual([]);
  });

  test('setValue() shows the month the value is in', { tag: ['@ren-calendar', '@runtime'] }, async ({ page }) => {
    const errors = await mountRegistry(page, server.origin, 'calendar');
    const calendar = page.locator('ren-calendar');
    await expect(calendar.locator('[aria-selected="true"]')).toHaveAttribute('data-date', '2026-03-15');

    await calendar.evaluate((el) => el.setValue('1990-04-12'));
    // The selected day is on screen, and it is the calendar's tab stop.
    const selected = calendar.locator('[aria-selected="true"]');
    await expect(selected).toHaveAttribute('data-date', '1990-04-12');
    await expect(selected).toHaveAttribute('tabindex', '0');
    await expect(calendar.locator('.ren-calendar-header')).toContainText('1990');
    expect(errors).toEqual([]);
  });

  test('a date picker with a value opens on that date', { tag: ['@ren-date-picker', '@runtime'] }, async ({ page }) => {
    const errors = await mountRegistry(page, server.origin, 'date-picker', (usage) => usage.replace('<ren-date-picker', '<ren-date-picker value="1990-04-12"'));
    const dropdown = await openDatePicker(page);

    const selected = dropdown.locator('[aria-selected="true"]');
    await expect(selected, 'the month of the value is the one shown').toHaveAttribute('data-date', '1990-04-12');
    await expect(selected, 'and focus is on the selected day').toBeFocused();
    expect(errors).toEqual([]);
  });

  test('a date picker keeps its value when its script loads before the calendar\'s', { tag: ['@ren-date-picker', '@runtime'] }, async ({ page }) => {
    // Nothing orders the two modules. The picker creates its calendar, and
    // with the calendar not defined yet that element has no methods.
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${server.origin}${FIXTURE}`);
    await page.evaluate(async () => {
      for (const href of ['/components/composites/ren-calendar/ren-calendar.css', '/components/composites/ren-date-picker/ren-date-picker.css']) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
      document.getElementById('host').innerHTML = '<form><ren-date-picker name="born" value="1990-04-12"></ren-date-picker></form>';
      await import('/components/composites/ren-date-picker/ren-date-picker.js');
    });
    const trigger = page.locator('.ren-date-picker-trigger');
    await expect(trigger, 'the trigger shows the value before the calendar exists').toHaveText('04/12/1990');
    expect(await page.evaluate(() => new FormData(document.querySelector('form')).get('born')), 'and the form has it').toBe('1990-04-12');

    await page.evaluate(() => import('/components/composites/ren-calendar/ren-calendar.js'));
    const dropdown = await openDatePicker(page);
    await expect(dropdown.locator('[aria-selected="true"]'), 'the calendar learns the value once it is defined').toHaveAttribute('data-date', '1990-04-12');
    expect(errors).toEqual([]);
  });

  test('a date picker with no value opens on today', { tag: ['@ren-date-picker', '@runtime'] }, async ({ page }) => {
    const errors = await mountRegistry(page, server.origin, 'date-picker');
    const dropdown = await openDatePicker(page);

    await expect(dropdown.locator('.ren-calendar-day[data-today]'), 'focus is on today').toBeFocused();
    expect(errors).toEqual([]);
  });

  for (const placement of ['bottom', 'top', 'left', 'right']) {
    test(`the date picker opens as a full-width sheet on a narrow viewport (placement ${placement})`, { tag: ['@ren-date-picker', '@runtime'] }, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const errors = await mountRegistry(page, server.origin, 'date-picker', (usage) => usage.replace('placement="bottom"', `placement="${placement}"`));
      await expect(page.locator('ren-date-picker')).toHaveAttribute('data-side', placement);
      const dropdown = await openDatePicker(page);
      const boxes = await calendarBoxes(page, '.ren-date-picker-dropdown');

      expect(Math.round(boxes.holder.left), 'the sheet starts at the left edge').toBe(0);
      expect(Math.round(boxes.holder.width), 'and spans the viewport').toBe(390);
      expect(Math.abs(boxes.holder.bottom - 844), 'resting on the bottom edge').toBeLessThanOrEqual(TOLERANCE);
      expect(boxes.calendar.width, 'the calendar takes the sheet\'s width').toBeGreaterThanOrEqual(boxes.holder.width - 2 - TOLERANCE);
      expectPadded(boxes.holder, boxes, 'sheet');
      expect(boxes.overflow.inline, 'nothing spills sideways').toBe(0);

      // A day is where a finger lands on it.
      const reached = await dropdown.evaluate((el) => {
        const day = el.querySelector('.ren-calendar-day:not([disabled])');
        const rect = day.getBoundingClientRect();
        return day.contains(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2));
      });
      expect(reached, 'the first day is on screen at its own centre').toBe(true);
      expect(errors).toEqual([]);
    });
  }
});
