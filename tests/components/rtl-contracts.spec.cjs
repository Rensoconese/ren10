// @ts-check
/**
 * RTL contracts: behaviour that changes, or must pointedly not change, under
 * `dir="rtl"`. rtl-smoke.spec.cjs proves every component renders mirrored; this
 * spec drives the ones where direction reaches into behaviour.
 *
 * The rules, applied the same way to every component:
 *
 *   Arrow keys   Left/Right are visual keys. In a horizontal widget the arrow
 *                pointing at the inline-end side moves to the next item (or
 *                opens a submenu): ArrowRight under LTR, ArrowLeft under RTL.
 *                Up/Down, Home/End and PageUp/PageDown keep their meaning, and
 *                Home is still the first item in DOM order. This is what Radix
 *                (RovingFocusGroup, Menu, Slider) and React Aria (calendar,
 *                slider) do, and what a native range input does in Chromium.
 *   Sides        `top|bottom|left|right` are physical and never flip, on an
 *                anchored overlay or a sheet. Words that follow the direction
 *                say so: `start|end` alignment, `inline-start|inline-end` sides.
 *                (Floating UI: only the alignment half of a placement mirrors.)
 *   Flow         Whatever follows the reading order follows the direction: fill
 *                and sweep of a progress bar or slider, the "on" side of a
 *                switch, slide order, range caps, leading and trailing icons.
 *   LTR islands  A code is read left to right in every script. OTP slots keep
 *                their order and their physical arrow keys.
 *
 * Assertions are visible outcomes (which element has focus, where a box is
 * relative to another), never raw scroll offsets or timers.
 *
 * Tests carry `@<component> @rtl`, which `npm run coverage:check` counts.
 */
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');
const { REGISTRY, ROOT } = require('../utils/mount-registry.cjs');
const { TOLERANCE, mountDirected, settledBoxes, mirrorProblems } = require('../utils/rtl.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

/** Room around the host, so nothing is clamped to a viewport edge by accident. */
const INSET = 240;

/** Mount registry usage (optionally edited) under a direction. RTL unless told otherwise. */
const mount = (page, key, { dir = 'rtl', edit, inset = INSET, motion = false } = {}) =>
  mountDirected(page, server.origin, key, dir, { edit, inset, motion });

const focusedText = (page) => page.evaluate(() => document.activeElement?.textContent?.trim() ?? null);

/** @param {import('@playwright/test').Locator} locator */
const rectOf = async (locator) => {
  const box = await locator.boundingBox();
  if (!box) throw new Error('element has no box');
  return { left: box.x, right: box.x + box.width, top: box.y, bottom: box.y + box.height, width: box.width, center: box.x + box.width / 2 };
};

const focusedRect = (page) => page.evaluate(() => {
  const rect = document.activeElement.getBoundingClientRect();
  return { left: rect.left, right: rect.right, center: rect.left + rect.width / 2 };
});

/**
 * Which way a CSS-drawn chevron or tick points. These glyphs are two borders of
 * a rotated box: the corner between them is the tip. Reading the borders and
 * the transform gives the direction the user sees, whichever properties drew it.
 * @param {import('@playwright/test').Locator} locator
 * @param {'::before'|'::after'} pseudo
 * @returns {Promise<'left'|'right'|'up'|'down'|'none'>}
 */
const tipOf = (locator, pseudo) => locator.evaluate((element, which) => {
  const style = getComputedStyle(element, which);
  const drawn = (side) => (parseFloat(style[`border${side}Width`]) > 0 ? 1 : 0);
  const x = drawn('Right') - drawn('Left');
  const y = drawn('Bottom') - drawn('Top');
  const matrix = style.transform === 'none' ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(style.transform);
  const dx = matrix.a * x + matrix.c * y;
  const dy = matrix.b * x + matrix.d * y;
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return 'none';
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}, pseudo);

/**
 * Which way an element's linear-gradient runs. Engines may serialise the same
 * computed value as a keyword (`to left`) or as an angle (`270deg`).
 * Runs in the page.
 * @param {Element} element
 * @returns {'left'|'right'|null}
 */
const gradientDirection = (element) => {
  const image = getComputedStyle(element).backgroundImage;
  if (/linear-gradient\(\s*(to left|270deg|-90deg)/.test(image)) return 'left';
  if (/linear-gradient\(\s*(to right|90deg)/.test(image)) return 'right';
  return null;
};

/** Mount an edited usage in both directions and report boxes that did not mirror. */
async function mirrorOf(page, key, edit, prepare = async () => {}) {
  const read = async (dir) => {
    const errors = await mount(page, key, { dir, edit });
    await prepare(page);
    return { errors, boxes: await settledBoxes(page) };
  };
  const ltr = await read('ltr');
  const rtl = await read('rtl');
  expect(rtl.errors).toEqual([]);
  return mirrorProblems(ltr.boxes, rtl.boxes);
}

test.describe('rtl contracts: arrow keys follow the visual direction', () => {
  test('ren-tabs: ArrowLeft moves to the next tab, which is the one on the left', { tag: ['@ren-tabs', '@rtl'] }, async ({ page }) => {
    // Three tabs: with two and wrapping, "next" and "previous" are the same tab.
    // The tabs sit in a tablist, as component.md requires; the registry usage
    // omits it, and without one <ren-tabs> warns and wires nothing.
    const errors = await mount(page, 'tabs', {
      edit: () => `<ren-tabs aria-label="Account settings">
  <div class="ren-tab-list" role="tablist">
    <button class="ren-tab" role="tab">Tab 1</button>
    <button class="ren-tab" role="tab">Tab 2</button>
    <button class="ren-tab" role="tab">Tab 3</button>
  </div>
  <div class="ren-tab-panel" role="tabpanel">Content 1</div>
  <div class="ren-tab-panel" role="tabpanel">Content 2</div>
  <div class="ren-tab-panel" role="tabpanel">Content 3</div>
</ren-tabs>`,
    });
    await expect(page.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: 'Tab 1' }).focus();
    const first = await focusedRect(page);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => focusedText(page)).toBe('Tab 2');
    expect((await focusedRect(page)).center, 'the next tab is to the left').toBeLessThan(first.center);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => focusedText(page)).toBe('Tab 3');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => focusedText(page), 'ArrowRight goes back').toBe('Tab 2');
    await page.keyboard.press('Home');
    await expect.poll(() => focusedText(page), 'Home is still the first tab').toBe('Tab 1');
    await page.keyboard.press('End');
    await expect.poll(() => focusedText(page)).toBe('Tab 3');
    expect(errors).toEqual([]);
  });

  test('ren-radio: in a horizontal group ArrowLeft moves to the next radio', { tag: ['@ren-radio', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'radio', {
      edit: (usage) => usage
        .replace(/<ren-radio-group\b/, '<ren-radio-group orientation="horizontal"')
        .replace('</ren-radio-group>', '  <label class="ren-radio">\n    <input type="radio" name="option" value="c">\n    <span class="ren-radio-control"></span>\n    <span>Option C</span>\n  </label>\n</ren-radio-group>'),
    });
    const focusedValue = () => page.evaluate(() => document.activeElement?.getAttribute('value') ?? document.activeElement?.querySelector?.('input')?.value ?? null);
    await page.locator('ren-radio-group input[value="a"]').focus();
    const first = await focusedRect(page);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(focusedValue).toBe('b');
    expect((await focusedRect(page)).center, 'the next radio is to the left').toBeLessThan(first.center);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(focusedValue).toBe('c');
    await page.keyboard.press('ArrowRight');
    await expect.poll(focusedValue, 'ArrowRight goes back').toBe('b');
    expect(errors).toEqual([]);
  });

  test('ren-toggle-group: ArrowLeft is next and ArrowRight previous; Up/Down are unchanged', { tag: ['@ren-toggle-group', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'toggle-group');
    await page.getByRole('button', { name: 'Left' }).focus();
    const first = await focusedRect(page);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => focusedText(page)).toBe('Center');
    expect((await focusedRect(page)).center, 'the next item is to the left').toBeLessThan(first.center);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => focusedText(page)).toBe('Left');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => focusedText(page), 'ArrowRight wraps backward to the last item').toBe('Right');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => focusedText(page), 'ArrowDown is still "next"').toBe('Left');
    await page.keyboard.press('ArrowUp');
    await expect.poll(() => focusedText(page), 'ArrowUp is still "previous"').toBe('Right');
    await page.keyboard.press('Home');
    await expect.poll(() => focusedText(page)).toBe('Left');
    expect(errors).toEqual([]);
  });

  test('ren-toolbar: ArrowLeft roves forward past the separator, ArrowRight back', { tag: ['@ren-toolbar', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'toolbar');
    await page.evaluate(() => import('/components/composites/ren-toolbar/ren-toolbar.js').then((m) => m.initAllToolbars()));
    await page.getByRole('button', { name: 'Bold' }).focus();
    const first = await focusedRect(page);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => focusedText(page)).toBe('Italic');
    expect((await focusedRect(page)).center, 'the next item is to the left').toBeLessThan(first.center);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => focusedText(page)).toBe('Underline');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => focusedText(page)).toBe('Italic');
    await page.keyboard.press('Home');
    await expect.poll(() => focusedText(page)).toBe('Bold');
    expect(errors).toEqual([]);
  });

  test('ren-toolbar: a vertical toolbar ignores direction', { tag: ['@ren-toolbar', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'toolbar', { edit: (usage) => usage.replace('class="ren-toolbar"', 'class="ren-toolbar ren-toolbar-vertical"') });
    await page.evaluate(() => import('/components/composites/ren-toolbar/ren-toolbar.js').then((m) => m.initAllToolbars()));
    await page.getByRole('button', { name: 'Bold' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => focusedText(page)).toBe('Italic');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => focusedText(page), 'horizontal arrows do nothing').toBe('Italic');
    await page.keyboard.press('ArrowUp');
    await expect.poll(() => focusedText(page)).toBe('Bold');
    expect(errors).toEqual([]);
  });

  test('ren-menubar: ArrowLeft opens the next menu; a submenu opens to the left, with ArrowLeft, and closes with ArrowRight', { tag: ['@ren-menubar', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'menubar', {
      edit: (usage) => usage
        .replace(
          '<button type="button" class="ren-menubar-item" role="menuitem">Open</button>',
          '<button type="button" class="ren-menubar-item" role="menuitem">Open</button>\n' +
          '      <div class="ren-menubar-item ren-menubar-submenu" role="menuitem" tabindex="-1">Recent\n' +
          '        <div class="ren-menubar-menu" role="menu" hidden>\n' +
          '          <button type="button" class="ren-menubar-item" role="menuitem">Report</button>\n' +
          '        </div>\n' +
          '      </div>'
        )
        .replace(
          '  </div>\n</ren-menubar>',
          '    <button type="button" class="ren-menubar-trigger" aria-haspopup="menu" aria-expanded="false">View</button>\n' +
          '    <div class="ren-menubar-menu" role="menu" hidden>\n' +
          '      <button type="button" class="ren-menubar-item" role="menuitem">Zoom</button>\n' +
          '    </div>\n' +
          '  </div>\n</ren-menubar>'
        ),
    });
    const trigger = (name) => page.locator('.ren-menubar-trigger', { hasText: name });
    const expanded = () => page.evaluate(() => [...document.querySelectorAll('.ren-menubar-trigger')].filter((t) => t.getAttribute('aria-expanded') === 'true').map((t) => t.textContent.trim()));

    expect((await rectOf(trigger('Edit'))).center, 'the menubar itself runs right to left').toBeLessThan((await rectOf(trigger('File'))).center);

    // A closed bar only moves focus (APG Menubar): ArrowLeft is "next" here too.
    await trigger('File').focus();
    await page.keyboard.press('ArrowLeft');
    await expect(trigger('Edit'), 'ArrowLeft moves to the next trigger, on the left').toBeFocused();
    expect(await expanded(), 'nothing opens on a closed bar').toEqual([]);
    await page.keyboard.press('ArrowRight');
    await expect(trigger('File'), 'ArrowRight moves back').toBeFocused();

    // With a menu open, the same keys open the neighbouring menu.
    await page.keyboard.press('ArrowDown');
    await expect.poll(expanded).toEqual(['File']);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(expanded, 'ArrowLeft moves to the next menu, on the left').toEqual(['Edit']);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(expanded).toEqual(['View']);
    await page.keyboard.press('ArrowRight');
    await expect.poll(expanded, 'ArrowRight moves back').toEqual(['Edit']);
    await page.keyboard.press('ArrowRight');
    await expect.poll(expanded).toEqual(['File']);

    // Into the File menu, down to the submenu parent.
    await expect.poll(() => focusedText(page)).toBe('New');
    await page.keyboard.press('End');
    const parent = page.locator('.ren-menubar-submenu');
    await expect(parent).toBeFocused();
    const submenu = parent.locator('.ren-menubar-menu');
    await page.keyboard.press('ArrowRight');
    await expect(submenu, 'ArrowRight points away from the submenu: it does not open it').toBeHidden();
    await expect.poll(expanded, 'it moves to the previous menu instead, wrapping to the last').toEqual(['View']);

    await page.keyboard.press('ArrowLeft');
    await expect.poll(expanded).toEqual(['File']);
    await page.keyboard.press('End');
    await expect(parent).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(submenu, 'ArrowLeft opens the submenu').toBeVisible();
    await expect.poll(() => focusedText(page)).toBe('Report');
    expect((await rectOf(submenu)).right, 'the submenu opens on the inline-end side: to the left of its parent item')
      .toBeLessThanOrEqual((await rectOf(parent)).left + TOLERANCE);

    await page.keyboard.press('ArrowRight');
    await expect(submenu, 'ArrowRight closes the submenu').toBeHidden();
    await expect(parent, 'and returns focus to its parent item').toBeFocused();
    await expect.poll(expanded, 'without leaving the menu').toEqual(['File']);
    expect(errors).toEqual([]);
  });

  test('ren-carousel: ArrowLeft shows the next slide; "previous" sits on the right', { tag: ['@ren-carousel', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'carousel');
    const current = () => page.evaluate(() => [...document.querySelectorAll('ren-carousel .ren-carousel-slide')].findIndex((s) => s.getAttribute('aria-current') === 'true'));
    // The slide that fills the viewport, measured rather than read from a scroll offset.
    const shown = () => page.evaluate(() => {
      const view = document.querySelector('ren-carousel .ren-carousel-viewport').getBoundingClientRect();
      return [...document.querySelectorAll('ren-carousel .ren-carousel-slide')].findIndex((slide) => {
        const rect = slide.getBoundingClientRect();
        const overlap = Math.min(rect.right, view.right) - Math.max(rect.left, view.left);
        return overlap > view.width * 0.9;
      });
    });
    await expect.poll(shown, 'the first slide is the one in view').toBe(0);

    const previous = await rectOf(page.locator('ren-carousel .ren-carousel-prev'));
    const next = await rectOf(page.locator('ren-carousel .ren-carousel-next'));
    const view = await rectOf(page.locator('ren-carousel .ren-carousel-viewport'));
    expect(previous.center, '"previous" is on the inline-start side: the right').toBeGreaterThan(view.center);
    expect(next.center, '"next" is on the inline-end side: the left').toBeLessThan(view.center);

    await page.locator('ren-carousel .ren-carousel-next').focus();
    await page.keyboard.press('ArrowLeft');
    await expect.poll(current, 'ArrowLeft is "next"').toBe(1);
    await expect.poll(shown, 'and the second slide scrolls into view').toBe(1);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(current).toBe(2);
    await expect.poll(shown).toBe(2);
    await page.keyboard.press('ArrowRight');
    await expect.poll(current, 'ArrowRight is "previous"').toBe(1);
    await expect.poll(shown).toBe(1);

    await page.locator('ren-carousel .ren-carousel-prev').click();
    await expect.poll(current, 'the previous button still goes back').toBe(0);
    await expect.poll(shown).toBe(0);
    expect(errors).toEqual([]);
  });

  test('ren-calendar: the week runs right to left and ArrowLeft moves to the next day', { tag: ['@ren-calendar', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'calendar');
    const focusedDate = () => page.evaluate(() => document.activeElement?.dataset?.date ?? null);
    const tabbable = page.locator('ren-calendar .ren-calendar-day[tabindex="0"]');
    await tabbable.focus();
    await expect.poll(focusedDate).toBe('2026-03-15');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(focusedDate).toBe('2026-03-16');
    const monday = await focusedRect(page);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(focusedDate).toBe('2026-03-17');
    // The 16th and 17th share a row whether the week starts on Sunday or Monday.
    expect((await focusedRect(page)).center, 'the next day is to the left').toBeLessThan(monday.center);
    await page.keyboard.press('ArrowRight');
    await expect.poll(focusedDate, 'ArrowRight moves to the previous day').toBe('2026-03-16');
    await page.keyboard.press('ArrowDown');
    await expect.poll(focusedDate, 'ArrowDown is still a week later').toBe('2026-03-23');
    await page.keyboard.press('ArrowUp');
    await expect.poll(focusedDate).toBe('2026-03-16');

    const previous = page.locator('ren-calendar .ren-calendar-prev');
    const next = page.locator('ren-calendar .ren-calendar-next');
    expect((await rectOf(previous)).center, '"previous month" is the button on the right').toBeGreaterThan((await rectOf(next)).center);
    await next.click();
    await expect(page.locator('ren-calendar .ren-calendar-title'), 'the button on the left goes forward').toContainText(/April|abril/i);
    expect(errors).toEqual([]);
  });

  test('ren-date-picker: the calendar it opens follows the same arrow rule', { tag: ['@ren-date-picker', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'date-picker', { edit: (usage) => usage.replace('<ren-calendar>', '<ren-calendar value="2026-03-17">') });
    await page.locator('ren-date-picker').evaluate((host) => host.open());
    const focusedDate = () => page.evaluate(() => document.activeElement?.dataset?.date ?? null);
    // The picker moves focus into its calendar by itself, a moment after it
    // opens. Wait for that instead of racing it with a focus() of our own.
    await expect.poll(focusedDate, 'opening moves focus to a day').not.toBeNull();
    const start = await focusedDate();
    const next = new Date(Date.parse(`${start}T00:00:00Z`) + 864e5).toISOString().slice(0, 10);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(focusedDate, 'ArrowLeft is the next day').toBe(next);
    await page.keyboard.press('ArrowRight');
    await expect.poll(focusedDate, 'ArrowRight is the previous day').toBe(start);
    expect(errors).toEqual([]);
  });

  test('ren-date-picker: the arrow between a range\'s two dates points from start to end', { tag: ['@ren-date-picker', '@rtl'] }, async ({ page }) => {
    const arrow = async (dir) => {
      await mount(page, 'date-picker', { dir });
      return page.evaluate(() => {
        const host = document.querySelector('ren-date-picker');
        host.classList.add('ren-date-picker', 'ren-date-picker-range');
        const value = document.createElement('span');
        value.className = 'ren-date-picker-value';
        host.appendChild(value);
        return getComputedStyle(value, '::after').content;
      });
    };
    expect(await arrow('ltr')).toContain('→');
    expect(await arrow('rtl'), 'the end date is on the left under RTL').toContain('←');
  });

  test('ren-table: ArrowLeft moves to the next column, and dragging a resize handle left widens its column', { tag: ['@ren-table', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'table', { edit: (usage) => usage.replace('<th class="ren-th">Email</th>', '<th class="ren-th ren-th-sortable" data-column="email">Email</th>') });
    const name = page.locator('ren-table th', { hasText: 'Name' });
    const email = page.locator('ren-table th', { hasText: 'Email' });
    expect((await rectOf(email)).center, 'columns run right to left').toBeLessThan((await rectOf(name)).center);
    await name.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(email, 'ArrowLeft moves to the column on the left').toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(name).toBeFocused();

    const handle = await rectOf(name.locator('.ren-th-resize'));
    const before = (await rectOf(name)).width;
    expect(handle.center, 'the handle is on the inline-end edge: the left').toBeLessThan((await rectOf(name)).center);
    await page.mouse.move(handle.center, handle.top + 4);
    await page.mouse.down();
    await page.mouse.move(handle.center - 60, handle.top + 4, { steps: 4 });
    await page.mouse.up();
    await expect.poll(async () => (await rectOf(name)).width, 'pulling the edge outward widens the column').toBeGreaterThan(before + 20);
    expect(errors).toEqual([]);
  });

  test('ren-otp: slots stay left to right, and the arrows stay physical', { tag: ['@ren-otp', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'otp');
    const slots = page.locator('ren-otp input');
    await expect(slots).toHaveCount(6);
    const focusedSlot = () => page.evaluate(() => [...document.querySelectorAll('ren-otp input')].indexOf(document.activeElement));
    const centers = await slots.evaluateAll((inputs) => inputs.map((input) => input.getBoundingClientRect().left));
    expect(centers, 'slot 1 is the leftmost under RTL too').toEqual([...centers].sort((a, b) => a - b));

    await slots.first().focus();
    await page.keyboard.type('12');
    await expect.poll(focusedSlot, 'typing advances to the right').toBe(2);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(focusedSlot, 'ArrowLeft moves to the slot on the left').toBe(1);
    await page.keyboard.press('ArrowRight');
    await expect.poll(focusedSlot).toBe(2);

    const group = await rectOf(page.locator('ren-otp'));
    const last = await rectOf(slots.last());
    expect(Math.abs(group.right - last.right), 'the group still sits at the inline-start (right) edge of an RTL page').toBeLessThanOrEqual(TOLERANCE);
    expect(errors).toEqual([]);
  });
});

test.describe('rtl contracts: sides are physical, alignment is logical', () => {
  test('ren-menu: bottom-start lines up the right edges, bottom-end the left edges', { tag: ['@ren-menu', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'menu');
    const trigger = page.locator('[data-menu-trigger]');
    const menu = page.locator('ren-menu');
    // Measured in the same task as open(): aligning from the far edge needs the
    // menu's width, and a menu placed before it is shown has none, so it used
    // to sit a full width off until the next frame corrected it.
    const offAtOpen = await page.locator('ren-menu').evaluate((host) => {
      host.open();
      return Math.abs(host.getBoundingClientRect().right - document.querySelector('[data-menu-trigger]').getBoundingClientRect().right);
    });
    expect(offAtOpen, 'in place as soon as it is open').toBeLessThanOrEqual(TOLERANCE);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toBeVisible();
    const anchor = await rectOf(trigger);
    let panel = await rectOf(menu);
    expect(panel.width, 'the menu is wider than its trigger, or alignment proves nothing').toBeGreaterThan(anchor.width + 20);
    expect(Math.abs(panel.right - anchor.right), 'start = the inline-start edge = right edges together').toBeLessThanOrEqual(TOLERANCE);
    expect(panel.top, 'bottom is still below').toBeGreaterThanOrEqual(anchor.bottom);

    await mount(page, 'menu', { edit: (usage) => usage.replace('placement="bottom-start"', 'placement="bottom-end"') });
    await page.locator('ren-menu').evaluate((host) => host.open());
    await expect(menu).toBeVisible();
    panel = await rectOf(menu);
    expect(Math.abs(panel.left - (await rectOf(trigger)).left), 'end = left edges together').toBeLessThanOrEqual(TOLERANCE);
    expect(errors).toEqual([]);
  });

  test('ren-menu: a menu at the inline-end edge of the viewport stays on screen', { tag: ['@ren-menu', '@rtl'] }, async ({ page }) => {
    // Push the trigger against the left (inline-end) edge, where a start-aligned
    // menu has no room to extend leftward and has to be clamped.
    const errors = await mount(page, 'menu', { inset: 0, edit: (usage) => `<div style="display:flex;justify-content:flex-end">${usage.split('\n')[0]}</div>${usage.split('\n').slice(1).join('\n')}` });
    const trigger = page.locator('[data-menu-trigger]');
    expect((await rectOf(trigger)).left, 'the trigger is at the left edge').toBeLessThan(20);
    await page.locator('ren-menu').evaluate((host) => host.open());
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = await rectOf(page.locator('ren-menu'));
    expect(panel.left).toBeGreaterThanOrEqual(0);
    expect(panel.right).toBeLessThanOrEqual(await page.evaluate(() => document.documentElement.clientWidth));
    expect(errors).toEqual([]);
  });

  test('ren-select: the list opens under its trigger, not against the viewport edge', { tag: ['@ren-select', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'select', { edit: (usage) => usage.replace('<ren-select ', '<ren-select style="display:block;inline-size:240px" ') });
    await page.mouse.move(1, 1000);
    const trigger = page.locator('ren-select [data-select-trigger]');
    await page.locator('ren-select').evaluate((host) => host.open());
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const anchor = await rectOf(trigger);
    const viewport = await page.evaluate(() => document.documentElement.clientWidth);
    expect(anchor.right, 'the trigger is at the inline-start side, away from the viewport edge').toBeLessThan(viewport - INSET + TOLERANCE);
    const list = page.locator('ren-select [data-select-content]');
    // Centres, not edges: the open list rests at scale(0.98), so each edge is
    // a couple of pixels inside the trigger's in either direction.
    await expect.poll(async () => Math.abs((await rectOf(list)).center - anchor.center), 'the list is centred on its trigger').toBeLessThanOrEqual(TOLERANCE);
    expect((await rectOf(list)).width / anchor.width, 'and as wide as it').toBeGreaterThan(0.95);
    expect((await rectOf(list)).width / anchor.width).toBeLessThan(1.02);
    expect(errors).toEqual([]);
  });

  test('ren-popover: placement="right" stays on the right, placement="left" on the left', { tag: ['@ren-popover', '@rtl'] }, async ({ page }) => {
    for (const side of ['right', 'left']) {
      // Wide inset: with no room on the asked side the overlay rightly flips.
      const errors = await mount(page, 'popover', { inset: 440, edit: (usage) => usage.replace('placement="bottom"', `placement="${side}"`) });
      await page.locator('ren-popover').evaluate((host) => host.open());
      const popover = page.locator('ren-popover');
      await expect(popover).toBeVisible();
      const anchor = await rectOf(page.locator('#account-trigger'));
      // Polled: without CSS anchor positioning the overlay is placed by script, a frame later.
      if (side === 'right') await expect.poll(async () => (await rectOf(popover)).left, 'right is the physical right').toBeGreaterThanOrEqual(anchor.right - TOLERANCE);
      else await expect.poll(async () => (await rectOf(popover)).right, 'left is the physical left').toBeLessThanOrEqual(anchor.left + TOLERANCE);
      expect(errors).toEqual([]);
    }
  });

  test('ren-tooltip: placement="left" stays on the left, placement="right" on the right', { tag: ['@ren-tooltip', '@rtl'] }, async ({ page }) => {
    for (const side of ['left', 'right']) {
      const errors = await mount(page, 'tooltip', { inset: 440, edit: (usage) => usage.replace('placement="top"', `placement="${side}"`) });
      await page.locator('ren-tooltip').evaluate((host) => host.show());
      const tooltip = page.locator('ren-tooltip');
      await expect(tooltip).toBeVisible();
      const anchor = await rectOf(page.locator('.ren-tooltip-trigger'));
      if (side === 'left') await expect.poll(async () => (await rectOf(tooltip)).right, 'left is the physical left').toBeLessThanOrEqual(anchor.left + TOLERANCE);
      else await expect.poll(async () => (await rectOf(tooltip)).left, 'right is the physical right').toBeGreaterThanOrEqual(anchor.right - TOLERANCE);
      expect(errors).toEqual([]);
    }
  });

  test('side placements keep their gap between the overlay and its trigger', { tag: ['@ren-popover', '@ren-tooltip', '@ren-date-picker', '@ren-date-range-picker', '@ren-color-picker', '@rtl'] }, async ({ page }) => {
    // Room beside the trigger for the widest of these, the date range dropdown
    // with its two calendars: an overlay that does not fit on the asked side is
    // moved to another one, and then there is no gap to compare.
    await page.setViewportSize({ width: 1700, height: 1024 });
    // [registry key, usage placed on `side`, how to open, trigger, overlay]
    const overlays = [
      ['popover', (usage, side) => usage.replace('placement="bottom"', `placement="${side}"`), (host) => host.open(), '#account-trigger', 'ren-popover'],
      ['tooltip', (usage, side) => usage.replace('placement="top"', `placement="${side}"`), (host) => host.show(), '.ren-tooltip-trigger', 'ren-tooltip'],
      ['date-picker', (usage, side) => `<ren-date-picker placement="${side}"></ren-date-picker>`, (host) => host.open(), '.ren-date-picker-trigger', '.ren-date-picker-dropdown'],
      ['date-range-picker', (usage, side) => `<ren-date-range-picker placement="${side}"></ren-date-range-picker>`, (host) => host.open(), '.ren-date-range-trigger', '.ren-date-range-dropdown'],
      ['color-picker', (usage, side) => usage.replace('placement="bottom"', `placement="${side}"`), (host) => host.querySelector('.ren-color-picker-trigger').click(), '.ren-color-picker-trigger', '.ren-color-picker-dropdown'],
    ];
    for (const [key, place, open, triggerSelector, overlaySelector] of overlays) {
      for (const side of ['right', 'left']) {
        // Distance from the trigger to the overlay on the asked side; negative when it is on the other one.
        const gap = async (dir) => {
          // A narrow host in a wide viewport: room for the overlay on either side.
          const errors = await mount(page, key, { dir, inset: 700, edit: (usage) => place(usage, side) });
          await page.locator(`ren-${key}`).evaluate(open);
          const overlay = page.locator(overlaySelector);
          await expect(overlay).toBeVisible();
          const read = async () => {
            const anchor = await rectOf(page.locator(triggerSelector));
            const panel = await rectOf(overlay);
            return side === 'right' ? panel.left - anchor.right : anchor.left - panel.right;
          };
          await expect.poll(read, `${key} placement="${side}" under ${dir} is on the ${side}`).toBeGreaterThan(-TOLERANCE);
          expect(errors).toEqual([]);
          return read();
        };
        const ltr = await gap('ltr');
        expect(ltr, `${key} placement="${side}" leaves a gap under LTR`).toBeGreaterThan(2);
        expect(Math.abs((await gap('rtl')) - ltr), `${key} placement="${side}" keeps the same gap under RTL`).toBeLessThanOrEqual(TOLERANCE);
      }
    }
  });

  test('ren-sheet: left and right are physical; inline-start and inline-end follow the direction', { tag: ['@ren-sheet', '@rtl'] }, async ({ page }) => {
    // [direction, side attribute, edge the panel must be attached to]
    const cases = [
      ['rtl', 'right', 'right'],
      ['rtl', 'left', 'left'],
      ['rtl', 'inline-end', 'left'],
      ['rtl', 'inline-start', 'right'],
      ['ltr', 'right', 'right'],
      ['ltr', 'left', 'left'],
      ['ltr', 'inline-end', 'right'],
      ['ltr', 'inline-start', 'left'],
    ];
    for (const [dir, side, edge] of cases) {
      const errors = await mount(page, 'sheet', { dir, edit: (usage) => usage.replace('side="right"', `side="${side}"`) });
      await page.locator('ren-sheet').evaluate((host) => host.show());
      const dialog = page.locator('ren-sheet dialog');
      await expect(dialog).toHaveJSProperty('open', true);
      await expect(dialog, `${side} under ${dir} resolves to ${edge}`).toHaveAttribute('data-side', edge);
      const viewport = await page.evaluate(() => document.documentElement.clientWidth);
      expect((await rectOf(dialog)).width, 'a side sheet does not span the viewport').toBeLessThan(viewport * 0.6);
      // Polled: the sheet slides in, and is only against its edge once it has arrived.
      if (edge === 'right') await expect.poll(async () => Math.abs((await rectOf(dialog)).right - viewport), `${side} under ${dir} is attached to the right edge`).toBeLessThanOrEqual(TOLERANCE);
      else await expect.poll(async () => Math.abs((await rectOf(dialog)).left), `${side} under ${dir} is attached to the left edge`).toBeLessThanOrEqual(TOLERANCE);
      expect(errors).toEqual([]);
    }
  });

  test('ren-context-menu: opens toward the inline-end side of the pointer', { tag: ['@ren-context-menu', '@rtl'] }, async ({ page }) => {
    for (const dir of ['rtl', 'ltr']) {
      const errors = await mount(page, 'context-menu', { dir });
      await page.evaluate(() => import('/components/composites/ren-context-menu/ren-context-menu.js').then((m) => m.initAllContextMenus?.()));
      const target = await rectOf(page.locator('.ren-context-menu-trigger'));
      const x = Math.round(target.center);
      const y = Math.round(target.top + 8);
      await page.mouse.click(x, y, { button: 'right' });
      const menu = page.locator('ren-context-menu');
      await expect(menu).toBeVisible();
      const panel = await rectOf(menu);
      if (dir === 'rtl') expect(Math.abs(panel.right - x), 'under RTL the menu hangs to the left of the pointer').toBeLessThanOrEqual(TOLERANCE + 1);
      else expect(Math.abs(panel.left - x), 'under LTR it hangs to the right').toBeLessThanOrEqual(TOLERANCE + 1);
      const origin = await menu.evaluate((element) => parseFloat(getComputedStyle(element).transformOrigin) / element.offsetWidth);
      expect(origin, 'it grows out of the corner at the pointer').toBeCloseTo(dir === 'rtl' ? 1 : 0, 1);
      expect(errors).toEqual([]);
    }
  });
});

test.describe('rtl contracts: what follows the reading order follows the direction', () => {
  test('ren-progress: the bar fills from the right, and the indeterminate sweep runs right to left', { tag: ['@ren-progress', '@rtl'] }, async ({ page }) => {
    // The registry's indeterminate example has no bar to animate; give it one.
    const withBar = (usage) => usage.replace('aria-label="Loading"></div>', 'aria-label="Loading"><div class="ren-progress-bar"></div></div>');
    const errors = await mount(page, 'progress', { edit: withBar });
    const track = await rectOf(page.locator('.ren-progress').first());
    const bar = await rectOf(page.locator('.ren-progress-bar').first());
    expect(Math.abs(bar.right - track.right), 'the fill starts at the right edge').toBeLessThanOrEqual(TOLERANCE);
    expect(bar.width / track.width, 'and covers its 65%').toBeCloseTo(0.65, 1);

    // Step the sweep by hand instead of waiting on it.
    await mount(page, 'progress', { edit: withBar, motion: true });
    const sweep = await page.locator('.ren-progress-indeterminate .ren-progress-bar').evaluate((element) => {
      const animation = element.getAnimations().find((candidate) => String(candidate.animationName ?? '').startsWith('ren-progress-slide'));
      if (!animation) return null;
      animation.pause();
      const duration = Number(animation.effect.getComputedTiming().duration);
      const at = (fraction) => {
        animation.currentTime = duration * fraction;
        const rect = element.getBoundingClientRect();
        return rect.left + rect.width / 2;
      };
      return [at(0.05), at(0.2), at(0.35)];
    });
    expect(sweep, 'the indeterminate bar animates').not.toBeNull();
    expect(sweep[1], 'the sweep moves toward the left').toBeLessThan(sweep[0]);
    expect(sweep[2]).toBeLessThan(sweep[1]);
    expect(errors).toEqual([]);
  });

  test('ren-switch: "off" rests on the right and "on" travels to the left', { tag: ['@ren-switch', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'switch');
    // The thumb is a pseudo-element: read where it is from its used offsets and transform.
    const thumbCenter = () => page.locator('.ren-switch-track').evaluate((track) => {
      const style = getComputedStyle(track, '::after');
      const width = parseFloat(style.width);
      const shift = style.transform === 'none' ? 0 : new DOMMatrixReadOnly(style.transform).m41;
      const left = parseFloat(style.left);
      const right = parseFloat(style.right);
      const offset = Number.isFinite(left) ? left : track.clientWidth - right - width;
      return (offset + shift + width / 2) / track.clientWidth;
    });
    await expect.poll(thumbCenter, 'off: the thumb is in the right half').toBeGreaterThan(0.6);
    await page.locator('.ren-switch-track').click();
    await expect(page.locator('.ren-switch input')).toBeChecked();
    await expect.poll(thumbCenter, 'on: the thumb is in the left half').toBeLessThan(0.4);
    expect(errors).toEqual([]);
  });

  test('ren-slider: the fill starts on the side the thumb starts from', { tag: ['@ren-slider', '@rtl'] }, async ({ page }) => {
    const fillDirection = () => page.locator('ren-slider input[type="range"]').evaluate(gradientDirection);
    const errors = await mount(page, 'slider');
    expect(await fillDirection(), 'under RTL the minimum is on the right, so the fill grows leftward').toBe('left');
    await mount(page, 'slider', { dir: 'ltr' });
    expect(await fillDirection()).toBe('right');
    expect(errors).toEqual([]);
  });

  test('ren-slider: dragging a range thumb reads the pointer from the right edge', { tag: ['@ren-slider', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'slider', {
      edit: () => `<ren-slider class="ren-slider">
  <div class="ren-slider-range">
    <div class="ren-slider-track-input"></div>
    <input type="range" min="0" max="100" value="20" aria-label="Minimum">
    <input type="range" min="0" max="100" value="80" aria-label="Maximum">
  </div>
</ren-slider>`,
    });
    const value = () => page.locator('ren-slider').evaluate((host) => host.value);
    const rail = await rectOf(page.locator('.ren-slider-range'));
    const dragCoincidentThumbs = async (fractionFromLeft) => {
      await page.locator('ren-slider').evaluate((host) => { host.value = [50, 50]; });
      const y = rail.top + (rail.bottom - rail.top) / 2;
      await page.mouse.move(rail.left + rail.width * 0.5, y);
      await page.mouse.down();
      await page.mouse.move(rail.left + rail.width * fractionFromLeft, y, { steps: 4 });
      await page.mouse.up();
      return value();
    };
    // 30% from the left is 70% of the way from the minimum, which is on the right.
    expect(await dragCoincidentThumbs(0.3), 'dragging left raises the upper thumb').toEqual([50, 70]);
    expect(await dragCoincidentThumbs(0.7), 'dragging right lowers the lower thumb').toEqual([30, 50]);
    expect(await page.locator('.ren-slider-track-input').evaluate(gradientDirection), 'the range fill is painted from the right as well').toBe('left');
    expect(errors).toEqual([]);
  });

  test('ren-sidebar: the mobile drawer hides off the right edge and opens against it', { tag: ['@ren-sidebar', '@rtl'] }, async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    const errors = await mount(page, 'sidebar', { inset: 0 });
    await page.evaluate(() => { localStorage.clear(); window.dispatchEvent(new Event('resize')); });
    const sidebar = page.locator('ren-sidebar');
    await expect.poll(async () => (await rectOf(sidebar)).left, 'closed: entirely past the right edge, not parked on screen').toBeGreaterThanOrEqual(480 - TOLERANCE);
    await sidebar.evaluate((host) => host.openMobileMenu());
    await expect(sidebar).toHaveAttribute('data-open', '');
    await expect.poll(async () => Math.abs((await rectOf(sidebar)).right - 480), 'open: against the right edge').toBeLessThanOrEqual(TOLERANCE);
    expect(errors).toEqual([]);
  });

  test('ren-calendar: range caps reach toward the rest of the range', { tag: ['@ren-calendar', '@rtl'] }, async ({ page }) => {
    const capSide = (dir) => async () => {
      await mount(page, 'calendar', { dir });
      return page.evaluate(() => {
        const grid = document.querySelector('ren-calendar .ren-calendar-day').parentElement;
        const cap = (className, pseudo) => {
          const cell = document.createElement('button');
          cell.className = `ren-calendar-day ${className}`;
          grid.appendChild(cell);
          const style = getComputedStyle(cell, pseudo);
          // The cap is half a cell wide and overhangs one edge by 4px.
          return parseFloat(style.left) < 0 ? 'left' : parseFloat(style.right) < 0 ? 'right' : 'none';
        };
        return { start: cap('ren-calendar-day-range-start', '::after'), end: cap('ren-calendar-day-range-end', '::before') };
      });
    };
    expect(await capSide('ltr')(), 'LTR: the range lies to the right of its start').toEqual({ start: 'right', end: 'left' });
    expect(await capSide('rtl')(), 'RTL: the range lies to the left of its start').toEqual({ start: 'left', end: 'right' });
  });

  test('ren-toast: the corner is physical, the toast inside mirrors, and the countdown drains toward inline-start', { tag: ['@ren-toast', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'toast', { inset: 0 });
    await page.evaluate(() => import('/components/composites/ren-toast/ren-toast.js').then(({ toast }) => {
      toast({ title: 'Message sent', description: 'Delivered to 3 people', duration: 600000 });
    }));
    const toast = page.locator('ren-toast-viewport .ren-toast');
    await expect(toast).toHaveCount(1);
    const card = await rectOf(toast);
    const middle = await page.evaluate(() => document.documentElement.clientWidth / 2);
    expect(card.center, 'data-position="bottom-right" is the physical right').toBeGreaterThan(middle);
    expect((await rectOf(toast.locator('.ren-toast-close'))).center, 'the close button is on the inline-end side: the left').toBeLessThan(card.center);

    // Freeze the countdown at 40% instead of timing it.
    const bar = toast.locator('.ren-toast-progress');
    await bar.evaluate((element) => { element.style.transition = 'none'; element.style.width = '40%'; });
    const progress = await rectOf(bar);
    expect(progress.width / card.width).toBeLessThan(0.6);
    expect(card.right - progress.right, 'what is left of the countdown hugs the right edge').toBeLessThan(card.width * 0.05);
    expect(errors).toEqual([]);
  });

  test('ren-number-field: the stepper buttons swap sides and keep their rounded corners outside', { tag: ['@ren-number-field', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'number-field');
    const decrement = page.locator('.ren-number-field-decrement');
    const increment = page.locator('.ren-number-field-increment');
    expect((await rectOf(decrement)).center, 'decrement is on the inline-start side: the right').toBeGreaterThan((await rectOf(increment)).center);
    const corners = (locator) => locator.evaluate((button) => {
      const style = getComputedStyle(button);
      const rounded = (corner) => parseFloat(style[`border${corner}Radius`]) > 0;
      return { left: rounded('TopLeft') && rounded('BottomLeft'), right: rounded('TopRight') && rounded('BottomRight') };
    });
    expect(await corners(decrement), 'the button on the right is rounded on the right').toEqual({ left: false, right: true });
    expect(await corners(increment), 'the button on the left is rounded on the left').toEqual({ left: true, right: false });
    expect(errors).toEqual([]);
  });

  test('ren-field: leading and trailing input icons swap sides with the direction', { tag: ['@ren-field', '@rtl'] }, async ({ page }) => {
    const problems = await mirrorOf(page, 'field', (usage) => usage.replace(
      '<input id="username" type="text">',
      '<div class="ren-input-wrapper"><span class="ren-input-icon">@</span><input id="username" class="ren-input" type="text"><span class="ren-input-icon-end">✓</span></div>'
    ));
    expect(problems).toEqual([]);
    const wrapper = await rectOf(page.locator('.ren-input-wrapper'));
    expect((await rectOf(page.locator('.ren-input-icon'))).center, 'the leading icon is on the right under RTL').toBeGreaterThan(wrapper.center);
    expect((await rectOf(page.locator('.ren-input-icon-end'))).center, 'the trailing icon is on the left').toBeLessThan(wrapper.center);
  });

  test('ren-field: a select keeps its chevron in the inline-end padding', { tag: ['@ren-field', '@rtl'] }, async ({ page }) => {
    const withSelect = (usage) => usage.replace('<input id="username" type="text">', '<select id="username" class="ren-input"><option>One</option></select>');
    // The background chevron is the fallback for engines without
    // `appearance: base-select`; where that exists the image is off and the
    // native picker icon is placed logically. The position is declared either
    // way, and engines serialise `right 12px` as written or as
    // calc(100% - 12px): both name the right edge.
    const chevronSide = async (dir) => {
      await mount(page, 'field', { dir, edit: withSelect });
      return page.locator('select.ren-input').evaluate((select) => {
        const style = getComputedStyle(select);
        return /right|100%/.test(style.backgroundPositionX || style.backgroundPosition) ? 'right' : 'left';
      });
    };
    expect(await chevronSide('ltr')).toBe('right');
    expect(await chevronSide('rtl'), 'the inline-end padding reserved for it is on the left').toBe('left');
  });

  test('ren-avatar: the status dot sits on the inline-end corner', { tag: ['@ren-avatar', '@rtl'] }, async ({ page }) => {
    const problems = await mirrorOf(page, 'avatar', (usage) => `${usage}\n<span class="ren-avatar-wrapper"><span class="ren-avatar">JD</span><span class="ren-avatar-status"></span></span>`);
    expect(problems).toEqual([]);
    const wrapper = await rectOf(page.locator('.ren-avatar-wrapper'));
    expect((await rectOf(page.locator('.ren-avatar-status'))).center, 'bottom-left under RTL').toBeLessThan(wrapper.center);
  });

  test('ren-link: the skip link appears at the inline-start corner, and the external arrow points at inline-end', { tag: ['@ren-link', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'link', { edit: (usage) => `<a class="ren-link-skip" href="#host">Skip to content</a>\n${usage}` });
    const skip = page.locator('.ren-link-skip');
    await skip.focus();
    await expect.poll(async () => (await rectOf(skip)).top, 'focus brings it on screen').toBeGreaterThanOrEqual(0);
    const box = await rectOf(skip);
    expect(box.center, 'at the right, where an RTL page starts').toBeGreaterThan(await page.evaluate(() => document.documentElement.clientWidth / 2));

    const arrow = () => page.locator('.ren-link-external').evaluate((link) => getComputedStyle(link, '::after').content);
    expect(await arrow(), 'up and to the left: out of an RTL page').toContain('↖');
    await mount(page, 'link', { dir: 'ltr' });
    expect(await arrow()).toContain('↗');
    expect(errors).toEqual([]);
  });
});

test.describe('rtl contracts: what is not directional does not mirror', () => {
  test('ren-menu: the tick of a checked item is the same tick', { tag: ['@ren-menu', '@rtl'] }, async ({ page }) => {
    const checked = (usage) => usage.replace(
      '<button class="ren-menu-item" role="menuitem" type="button" data-value="edit">Edit</button>',
      '<button class="ren-menu-item ren-menu-checkbox-item" role="menuitemcheckbox" aria-checked="true" type="button" data-value="wrap">Word wrap</button>'
    );
    // The tick is two borders of a rotated box; which two is the whole glyph.
    const strokes = async (dir) => {
      await mount(page, 'menu', { dir, edit: checked });
      await page.locator('ren-menu').evaluate((host) => host.open());
      return page.locator('.ren-menu-checkbox-item').evaluate((item) => {
        const style = getComputedStyle(item, '::after');
        return { left: style.borderLeftWidth, right: style.borderRightWidth, bottom: style.borderBottomWidth, transform: style.transform };
      });
    };
    const ltr = await strokes('ltr');
    expect(ltr.left, 'the tick is drawn at all').toBe('2px');
    expect(await strokes('rtl'), 'a mirrored tick is a different, wrong glyph').toEqual(ltr);
    expect(await tipOf(page.locator('.ren-menu-checkbox-item'), '::after'), 'the corner of a tick points down').toBe('down');
  });

  test('ren-collapsible, ren-accordion: disclosure chevrons point down and up, in either direction', { tag: ['@ren-collapsible', '@ren-accordion', '@rtl'] }, async ({ page }) => {
    const errors = await mount(page, 'collapsible');
    const summary = page.locator('.ren-collapsible > summary');
    await expect.poll(() => tipOf(summary, '::after')).toBe('down');
    await summary.click();
    await expect(page.locator('.ren-collapsible')).toHaveJSProperty('open', true);
    await expect.poll(() => tipOf(summary, '::after')).toBe('up');

    await mount(page, 'accordion');
    const marker = () => page.locator('ren-accordion summary').first().evaluate((element) => {
      const transform = getComputedStyle(element, '::after').transform;
      return transform === 'none' ? 1 : Math.round(new DOMMatrixReadOnly(transform).d);
    });
    await expect.poll(marker, 'closed: the marker as drawn').toBe(1);
    await page.locator('ren-accordion summary').first().click();
    await expect.poll(marker, 'open: turned upside down, not sideways').toBe(-1);
    expect(errors).toEqual([]);
  });

  test('ren-color-picker: the spectrum and its handles keep their side', { tag: ['@ren-color-picker', '@rtl'] }, async ({ page }) => {
    // Where each handle sits inside its own track, as a fraction from the left.
    const handles = async (dir) => {
      const errors = await mount(page, 'color-picker', { dir });
      await page.locator('.ren-color-picker-trigger').click();
      await expect(page.locator('.ren-color-picker-saturation')).toBeVisible();
      const fractions = await page.evaluate(() => {
        const fraction = (trackSelector, handleSelector) => {
          const track = document.querySelector(trackSelector).getBoundingClientRect();
          const handle = document.querySelector(handleSelector).getBoundingClientRect();
          return Math.round(((handle.left + handle.width / 2 - track.left) / track.width) * 100);
        };
        return {
          saturation: fraction('.ren-color-picker-saturation', '.ren-color-picker-saturation-handle'),
          hue: fraction('.ren-color-picker-hue', '.ren-color-picker-hue-handle'),
          direction: getComputedStyle(document.querySelector('.ren-color-picker-saturation')).direction,
        };
      });
      expect(errors).toEqual([]);
      return fractions;
    };
    const ltr = await handles('ltr');
    const rtl = await handles('rtl');
    expect(rtl.direction, 'the spectrum is an LTR island').toBe('ltr');
    // Within two points: the panel may still be easing in when it is measured,
    // and a mirrored handle would be some thirty points away.
    expect(Math.abs(rtl.saturation - ltr.saturation), 'same colour, same place on the same gradient').toBeLessThanOrEqual(2);
    expect(Math.abs(rtl.hue - ltr.hue), 'the hue handle too').toBeLessThanOrEqual(2);
    // #5b6cff is a saturated colour: its handle is well right of the middle.
    expect(rtl.saturation).toBeGreaterThan(55);
  });

  test('ren-ai: a closed tool call points its marker at inline-end; open, it points down', { tag: ['@ren-ai', '@rtl'] }, async ({ page }) => {
    const withToolCall = (usage) => usage.replace(
      '  </div>\n  <form class="ren-ai-prompt">',
      '    <details class="ren-ai-tool-call"><summary class="ren-ai-tool-call-header"><span class="ren-ai-tool-call-name">search</span></summary><pre class="ren-ai-tool-call-args">{}</pre></details>\n  </div>\n  <form class="ren-ai-prompt">'
    );
    // Where the marker's x axis points after its transform: 1 as drawn, -1 flipped, 0 turned a quarter.
    const markerAxis = () => page.locator('.ren-ai-tool-call-header').evaluate((header) => {
      const transform = getComputedStyle(header, '::before').transform;
      return transform === 'none' ? 1 : Math.round(new DOMMatrixReadOnly(transform).a);
    });
    await mount(page, 'ai', { dir: 'ltr', edit: withToolCall });
    expect(await markerAxis(), 'LTR: the triangle points right, as drawn').toBe(1);
    const errors = await mount(page, 'ai', { edit: withToolCall });
    await expect(page.locator('.ren-ai-tool-call-header')).toBeVisible();
    expect(await markerAxis(), 'RTL: flipped, so it points left').toBe(-1);
    await page.locator('.ren-ai-tool-call-header').click();
    await expect(page.locator('.ren-ai-tool-call')).toHaveJSProperty('open', true);
    await expect.poll(markerAxis, 'open: a quarter turn, pointing down, not a flipped one').toBe(0);
    expect(errors).toEqual([]);
  });
});

/**
 * The matrix is satisfied by the generated smoke alone, and the smoke cannot
 * see a key handler. A component whose script handles Left/Right owes a
 * contract above; this is what notices the next one that does not have it.
 */
test('every component whose script handles ArrowLeft or ArrowRight has an RTL contract in this file', () => {
  const contracts = new Set(fs.readFileSync(__filename, 'utf8').match(/@ren-[a-z-]+/g));
  const handlesHorizontalArrows = (entry) => (entry.files ?? [])
    .filter((file) => file.endsWith('.js'))
    .some((file) => {
      const source = fs.readFileSync(path.join(ROOT, 'components', entry.layer, entry.dir, file), 'utf8');
      // Its own handler, or the shared roving-focus helper in a horizontal orientation.
      return /Arrow(Left|Right)/.test(source) || (/createKeyboardNav/.test(source) && /horizontal/.test(source));
    });
  const owing = Object.values(REGISTRY).filter(handlesHorizontalArrows).map((entry) => entry.dir);
  expect(owing.length, 'the detection still finds the components it was written for').toBeGreaterThan(8);
  expect(owing.filter((dir) => !contracts.has(`@${dir}`)), 'handle Left/Right without an RTL contract').toEqual([]);
});

/**
 * Base styles ship with every component and belong to none, so these carry no
 * coverage tags: the matrix counts registry components.
 */
test.describe('rtl contracts: base styles', () => {
  test('a native <details> chevron points at inline-end when closed and down when open', async ({ page }) => {
    for (const [dir, closed] of [['ltr', 'right'], ['rtl', 'left']]) {
      const errors = await mount(page, 'card', { dir, edit: () => '<details id="plain"><summary>More</summary><p>Text</p></details>' });
      const summary = page.locator('#plain > summary');
      await expect.poll(() => tipOf(summary, '::after'), `closed under ${dir}`).toBe(closed);
      await summary.click();
      await expect(page.locator('#plain')).toHaveJSProperty('open', true);
      await expect.poll(() => tipOf(summary, '::after'), `open under ${dir}`).toBe('down');
      expect(errors).toEqual([]);
    }
  });

  test('a native <select> keeps its chevron in the inline-end padding', async ({ page }) => {
    const chevron = async (dir) => {
      await mount(page, 'card', { dir, edit: () => '<select id="plain"><option>One</option></select>' });
      return page.locator('#plain').evaluate((select) => {
        const style = getComputedStyle(select);
        return /right|100%/.test(style.backgroundPositionX || style.backgroundPosition) ? 'right' : 'left';
      });
    };
    expect(await chevron('ltr')).toBe('right');
    expect(await chevron('rtl')).toBe('left');
  });

  test('utils/positioning: start and end are the inline edges, sides stay physical', async ({ page }) => {
    // ren-select is the only caller that aligns to an edge, and its list is as
    // wide as its trigger, so the two alignments coincide there. Drive the
    // helper directly with an overlay narrower than its trigger.
    const place = async (dir, options) => {
      await mount(page, 'card', { dir, edit: () => '<button id="anchor" style="inline-size:300px">Anchor</button><div id="overlay" style="position:fixed;inline-size:120px;block-size:40px"></div>' });
      return page.evaluate(async (opts) => {
        const { computeOverlayPosition } = await import('/utils/positioning.js');
        const anchor = document.getElementById('anchor');
        const overlay = document.getElementById('overlay');
        // An open animation in flight: the painted box is smaller than the laid-out one.
        overlay.style.transform = 'scale(0.9)';
        const { x, side } = computeOverlayPosition(anchor, overlay, opts);
        const rect = anchor.getBoundingClientRect();
        return { fromLeft: Math.round(x - rect.left), fromRight: Math.round(rect.right - (x + 120)), side };
      }, options);
    };
    expect((await place('ltr', { side: 'bottom', align: 'start' })).fromLeft, 'LTR start: left edges together').toBe(0);
    expect((await place('ltr', { side: 'bottom', align: 'end' })).fromRight, 'LTR end: right edges together, measured unscaled').toBe(0);
    expect((await place('rtl', { side: 'bottom', align: 'start' })).fromRight, 'RTL start: right edges together').toBe(0);
    expect((await place('rtl', { side: 'bottom', align: 'end' })).fromLeft, 'RTL end: left edges together').toBe(0);
    expect((await place('rtl', { side: 'right', align: 'start' })).side, 'a physical side is returned as asked').toBe('right');
  });

  test('.ren-skip-link appears at the inline-start corner', async ({ page }) => {
    await mount(page, 'card', { edit: () => '<a class="ren-skip-link" href="#host">Skip to content</a>' });
    const skip = page.locator('.ren-skip-link');
    await skip.focus();
    await expect.poll(async () => (await rectOf(skip)).top, 'focus brings it on screen').toBeGreaterThanOrEqual(0);
    expect((await rectOf(skip)).center, 'at the right, where an RTL page starts').toBeGreaterThan(await page.evaluate(() => document.documentElement.clientWidth / 2));
  });

  test('.ren-scroll-progress grows from the inline-start edge', async ({ page }) => {
    const origin = async (dir) => {
      await mount(page, 'card', { dir, edit: () => '<div class="ren-scroll-progress"></div>' });
      return page.locator('.ren-scroll-progress').evaluate((bar) => {
        if (getComputedStyle(bar).position !== 'fixed') return null; // no scroll-driven animations: the rule does not apply
        return parseFloat(getComputedStyle(bar).transformOrigin) / bar.offsetWidth;
      });
    };
    const ltr = await origin('ltr');
    test.skip(ltr === null, 'this engine has no animation-timeline: scroll(), so the bar is not styled');
    expect(ltr).toBeCloseTo(0, 1);
    expect(await origin('rtl'), 'reading starts on the right').toBeCloseTo(1, 1);
  });
});
