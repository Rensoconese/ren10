// @ts-check
/**
 * Keyboard contracts, one component at a time.
 *
 * Each test mounts the component's registry usage (what `ren10 add` copies)
 * and drives it with the keys its component.md promises. Tests carry
 * `@<component> @keyboard`, which `npm run coverage:check` counts; a test here
 * is what removes a `keyboard` entry from tests/coverage/exemptions.json.
 */
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');
const { ROOT, mountRegistry } = require('../utils/mount-registry.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

/** Mount registry usage (optionally edited) with its CSS, then import its JS. */
const mount = (page, key, edit) => mountRegistry(page, server.origin, key, edit);

const focusedText = (page) => page.evaluate(() => document.activeElement?.textContent?.trim() ?? null);

// ── Resting-pointer helpers ──
// A list that opens or scrolls under a pointer that is not moving must leave
// the active item to the keyboard. These drive the three things a browser can
// do in that situation.

const centreOf = async (locator) => {
  const box = await locator.boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

/** Park the pointer and return the coordinates the browser reported for that move. */
async function parkPointer(page, { x, y }) {
  await page.evaluate(() => {
    window.__rest = null;
    document.addEventListener('pointermove', (event) => {
      window.__rest = { x: event.clientX, y: event.clientY, screenX: event.screenX, screenY: event.screenY };
    }, { capture: true, once: true });
  });
  await page.mouse.move(x, y);
  await expect.poll(() => page.evaluate(() => window.__rest), 'the browser reports the parked position').not.toBeNull();
  return page.evaluate(() => window.__rest);
}

/**
 * Let the browser re-target hover onto whatever now sits under the resting
 * pointer; the boundary events of that re-targeting are what used to move the
 * active item. Not an assertion: an engine that never re-targets cannot show
 * the defect either, so the wait just ends after a second.
 */
const letHoverSettle = (page, { x, y }) => page.evaluate(([px, py]) => new Promise((resolve) => {
  const deadline = performance.now() + 1000;
  const check = () => {
    if (document.elementFromPoint(px, py)?.matches(':hover') || performance.now() > deadline) resolve();
    else requestAnimationFrame(check);
  };
  check();
}), [x, y]);

/**
 * What some engines add after a scroll: a move event on the element under the
 * pointer that repeats the resting coordinates. Sent twice, because a guard
 * that only skips the first event would still follow the second.
 */
const repeatRestingMove = (page, rest) => page.evaluate((at) => {
  const target = document.elementFromPoint(at.x, at.y);
  for (let i = 0; i < 2; i += 1) {
    target.dispatchEvent(new PointerEvent('pointermove', {
      bubbles: true, pointerType: 'mouse', clientX: at.x, clientY: at.y, screenX: at.screenX, screenY: at.screenY,
    }));
  }
}, rest);

/** Really move the pointer: two moves, so the second differs from the first. */
async function movePointerOnto(page, { x, y }) {
  await page.mouse.move(x - 3, y - 3);
  await page.mouse.move(x, y);
}

/** Resize a mounted page and make sure it hears about it. */
async function resizeViewport(page, size) {
  await page.setViewportSize(size);
  await page.evaluate(() => window.dispatchEvent(new Event('resize')));
}

test.describe('keyboard contracts', () => {
  test('ren-dialog closes on Escape, and not when no-escape is set', { tag: ['@ren-dialog', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'dialog');
    const dialog = page.locator('ren-dialog dialog');
    await page.locator('ren-dialog').evaluate((host) => host.open());
    await expect(dialog).toHaveJSProperty('open', true);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveJSProperty('open', false);

    await mount(page, 'dialog', (usage) => usage.replace('<ren-dialog>', '<ren-dialog no-escape>'));
    await page.locator('ren-dialog').evaluate((host) => host.open());
    await expect(dialog).toHaveJSProperty('open', true);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    await expect(dialog).toHaveJSProperty('open', true);
    expect(errors).toEqual([]);
  });

  test('ren-menu opens with ArrowDown, moves with Arrow/Home/End and closes on Escape', { tag: ['@ren-menu', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'menu', (usage) => usage.replace(
      'data-value="duplicate">Duplicate</button>',
      'data-value="duplicate">Duplicate</button>\n  <button class="ren-menu-item" role="menuitem" type="button" data-value="archive">Archive</button>'
    ));
    const trigger = page.locator('[data-menu-trigger]');
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(() => focusedText(page)).toBe('Edit');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => focusedText(page)).toBe('Duplicate');
    await page.keyboard.press('End');
    await expect.poll(() => focusedText(page)).toBe('Archive');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => focusedText(page), 'navigation loops').toBe('Edit');
    await page.keyboard.press('End');
    await page.keyboard.press('Home');
    await expect.poll(() => focusedText(page)).toBe('Edit');
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('ren-toggle-group moves focus with wrapping arrows and Home/End', { tag: ['@ren-toggle-group', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'toggle-group');
    await page.getByRole('button', { name: 'Left' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => focusedText(page)).toBe('Center');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => focusedText(page)).toBe('Right');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => focusedText(page), 'wraps forward').toBe('Left');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(() => focusedText(page), 'wraps backward').toBe('Right');
    await page.keyboard.press('Home');
    await expect.poll(() => focusedText(page)).toBe('Left');
    await page.keyboard.press('End');
    await expect.poll(() => focusedText(page)).toBe('Right');
    expect(errors).toEqual([]);
  });

  test('ren-toolbar roves with arrows past separators and disabled items, Home/End jump', { tag: ['@ren-toolbar', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'toolbar', (usage) => usage.replace(
      '<button class="ren-toolbar-item" tabindex="-1">Underline</button>',
      '<button class="ren-toolbar-item" tabindex="-1">Underline</button>\n  <button class="ren-toolbar-item" tabindex="-1" disabled>Strike</button>'
    ));
    await page.evaluate(() => import('/components/composites/ren-toolbar/ren-toolbar.js').then((m) => m.initAllToolbars()));
    await page.getByRole('button', { name: 'Bold' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => focusedText(page)).toBe('Italic');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => focusedText(page), 'skips the separator').toBe('Underline');
    await page.keyboard.press('Home');
    await expect.poll(() => focusedText(page)).toBe('Bold');
    await page.keyboard.press('End');
    await expect.poll(() => focusedText(page), 'End skips the disabled item').toBe('Underline');
    expect(errors).toEqual([]);
  });

  test('ren-otp advances on input, steps back on Backspace and jumps with Home/End', { tag: ['@ren-otp', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'otp');
    const slots = page.locator('ren-otp input');
    await expect(slots).toHaveCount(6);
    const focusedSlot = () => page.evaluate(() => [...document.querySelectorAll('ren-otp input')].indexOf(document.activeElement));
    await slots.first().focus();
    await page.keyboard.type('12');
    await expect.poll(focusedSlot, 'typing advances').toBe(2);
    await page.keyboard.press('Backspace');
    await expect.poll(focusedSlot, 'Backspace on an empty slot steps back').toBe(1);
    await page.keyboard.press('End');
    await expect.poll(focusedSlot).toBe(5);
    await page.keyboard.press('Home');
    await expect.poll(focusedSlot).toBe(0);
    await page.keyboard.press('ArrowRight');
    await expect.poll(focusedSlot).toBe(1);
    expect(errors).toEqual([]);
  });

  test('ren-select opens from the keyboard, selects with Enter and returns focus on Escape', { tag: ['@ren-select', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'select');
    const trigger = page.locator('ren-select [data-select-trigger]');
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(() => focusedText(page)).toBe('Option A');
    await page.keyboard.press('End');
    await expect.poll(() => focusedText(page)).toBe('Option B');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.locator('ren-select').evaluate((el) => el.value)).toBe('b');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // The control must still be there after it closed (it used to vanish).
    await expect(trigger).toBeVisible();
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(() => focusedText(page), 'reopening starts on the selected option').toBe('Option B');
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
    expect(errors).toEqual([]);
  });

  test('ren-select leaves the active option to the keyboard when the list opens or scrolls under a resting pointer', { tag: ['@ren-select', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'select', (usage) => usage.replace(
      /<div data-select-item data-value="a"[\s\S]*Option B<\/div>/,
      Array.from({ length: 30 }, (_, i) => `<div data-select-item data-value="v${i}" role="option">Option ${i}</div>`).join('\n')
    ));
    const trigger = page.locator('ren-select [data-select-trigger]');
    const option = (n) => page.getByRole('option', { name: `Option ${n}`, exact: true });
    const highlighted = page.locator('ren-select [data-highlighted]');

    // Learn where the list opens, close it, and park the pointer over its fourth option.
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(option(3)).toBeVisible();
    const spot = await centreOf(option(3));
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    const rest = await parkPointer(page, spot);

    await page.keyboard.press('ArrowDown');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await letHoverSettle(page, rest);
    await expect(option(0), 'opening under the pointer keeps the first option active').toBeFocused();
    await expect(highlighted).toHaveText('Option 0');

    // Walk past the fold: now the list scrolls under the pointer.
    for (let n = 1; n <= 12; n += 1) {
      await page.keyboard.press('ArrowDown');
      await expect(option(n), `ArrowDown ${n} moves to option ${n}`).toBeFocused();
    }
    expect(await page.locator('ren-select [data-select-content]').evaluate((list) => list.scrollTop), 'the list scrolled').toBeGreaterThan(0);
    await letHoverSettle(page, rest);
    await repeatRestingMove(page, rest);
    await expect(highlighted, 'scrolling under the pointer keeps the keyboard option active').toHaveText('Option 12');
    await page.keyboard.press('ArrowDown');
    await expect(option(13), 'the next key continues from the keyboard position').toBeFocused();
    await expect(highlighted).toHaveText('Option 13');

    // A pointer that really moves takes over again.
    await movePointerOnto(page, rest);
    const underPointer = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y).closest('[role="option"]').textContent.trim(), rest);
    expect(underPointer).not.toBe('Option 13');
    await expect(highlighted, 'real pointer movement highlights the option under it').toHaveText(underPointer);

    // ...and the next key hands the list back to the keyboard.
    const afterPointer = `Option ${Number(underPointer.replace('Option ', '')) + 1}`;
    await page.keyboard.press('ArrowDown');
    await expect(highlighted).toHaveText(afterPointer);
    await repeatRestingMove(page, rest);
    await expect(highlighted, 'the pointer rests again after a key press').toHaveText(afterPointer);
    expect(errors).toEqual([]);
  });

  test('ren-menu keeps keyboard focus when its items scroll under a resting pointer', { tag: ['@ren-menu', '@keyboard'] }, async ({ page }) => {
    // Short viewport: the menu is taller than the page and scrolls.
    await page.setViewportSize({ width: 800, height: 320 });
    const errors = await mount(page, 'menu', (usage) => usage.replace(
      /<button class="ren-menu-item"[\s\S]*Duplicate<\/button>/,
      Array.from({ length: 16 }, (_, i) => `<button class="ren-menu-item" role="menuitem" type="button" data-value="i${i}">Item ${i}</button>`).join('\n')
    ));
    const trigger = page.locator('[data-menu-trigger]');
    const item = (n) => page.getByRole('menuitem', { name: `Item ${n}`, exact: true });

    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(item(0)).toBeFocused();
    const spot = await centreOf(item(2));
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    const rest = await parkPointer(page, spot);

    await page.keyboard.press('ArrowDown');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await letHoverSettle(page, rest);
    await expect(item(0), 'opening under the pointer focuses the first item').toBeFocused();
    for (let n = 1; n <= 10; n += 1) {
      await page.keyboard.press('ArrowDown');
      await expect(item(n), `ArrowDown ${n} moves to item ${n}`).toBeFocused();
    }
    expect(await page.locator('ren-menu').evaluate((menu) => menu.scrollTop), 'the menu scrolled').toBeGreaterThan(0);
    await letHoverSettle(page, rest);
    await repeatRestingMove(page, rest);
    await expect(item(10), 'scrolling under the pointer keeps keyboard focus').toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(item(11)).toBeFocused();

    await movePointerOnto(page, rest);
    const underPointer = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y).closest('[role="menuitem"]').textContent.trim(), rest);
    expect(underPointer).not.toBe('Item 11');
    await expect.poll(() => focusedText(page), 'real pointer movement focuses the item under it').toBe(underPointer);

    // ...and the next key hands the menu back to the keyboard.
    const afterPointer = `Item ${Number(underPointer.replace('Item ', '')) + 1}`;
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => focusedText(page)).toBe(afterPointer);
    await repeatRestingMove(page, rest);
    await expect.poll(() => focusedText(page), 'the pointer rests again after a key press').toBe(afterPointer);
    expect(errors).toEqual([]);
  });

  test('ren-combobox leaves the highlighted option to the keyboard when the list opens or scrolls under a resting pointer', { tag: ['@ren-combobox', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'combobox', (usage) => usage.replace(
      /<div class="ren-combobox-item"[\s\S]*Brazil<\/div>/,
      Array.from({ length: 30 }, (_, i) => `<div class="ren-combobox-item" role="option" data-value="c${i}">Country ${i}</div>`).join('\n')
    ));
    const input = page.getByRole('combobox');
    const option = (n) => page.getByRole('option', { name: `Country ${n}`, exact: true });
    const active = () => input.evaluate((el) => document.getElementById(el.getAttribute('aria-activedescendant') ?? '')?.textContent.trim() ?? null);

    await input.focus();
    await page.keyboard.press('ArrowDown');
    await expect(option(3)).toBeVisible();
    const spot = await centreOf(option(3));
    await page.keyboard.press('Escape');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    const rest = await parkPointer(page, spot);

    await page.keyboard.press('ArrowDown');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
    await letHoverSettle(page, rest);
    await expect.poll(active, 'opening under the pointer highlights the first option').toBe('Country 0');
    for (let n = 1; n <= 12; n += 1) {
      await page.keyboard.press('ArrowDown');
      await expect.poll(active, `ArrowDown ${n} moves to option ${n}`).toBe(`Country ${n}`);
    }
    expect(await page.locator('ren-combobox .ren-combobox-list').evaluate((list) => list.scrollTop), 'the list scrolled').toBeGreaterThan(0);
    await letHoverSettle(page, rest);
    await repeatRestingMove(page, rest);
    await expect.poll(active, 'scrolling under the pointer keeps the keyboard option').toBe('Country 12');
    await page.keyboard.press('ArrowDown');
    await expect.poll(active).toBe('Country 13');
    await expect(page.locator('ren-combobox [data-highlighted]')).toHaveText('Country 13');

    await movePointerOnto(page, rest);
    const underPointer = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y).closest('[role="option"]').textContent.trim(), rest);
    expect(underPointer).not.toBe('Country 13');
    await expect.poll(active, 'real pointer movement highlights the option under it').toBe(underPointer);

    const afterPointer = `Country ${Number(underPointer.replace('Country ', '')) + 1}`;
    await page.keyboard.press('ArrowDown');
    await expect.poll(active).toBe(afterPointer);
    await repeatRestingMove(page, rest);
    await expect.poll(active, 'the pointer rests again after a key press').toBe(afterPointer);
    expect(errors).toEqual([]);
  });

  test('ren-command leaves the highlighted item to the keyboard when the palette opens under a resting pointer', { tag: ['@ren-command', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'command', (usage) => usage.replace(
      '<li><button type="button" class="ren-command-item" data-value="copy">Copy</button></li>',
      '<li><button type="button" class="ren-command-item" data-value="copy">Copy</button></li>\n      <li><button type="button" class="ren-command-item" data-value="paste">Paste</button></li>\n      <li><button type="button" class="ren-command-item" data-value="cut">Cut</button></li>'
    ));
    const dialog = page.locator('ren-command dialog');
    const highlighted = page.locator('ren-command .ren-command-item[data-highlighted]');

    await page.keyboard.press('Control+K');
    await expect(dialog).toHaveJSProperty('open', true);
    const spot = await centreOf(page.locator('.ren-command-item', { hasText: 'Paste' }));
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveJSProperty('open', false);
    const rest = await parkPointer(page, spot);

    await page.keyboard.press('Control+K');
    await expect(dialog).toHaveJSProperty('open', true);
    await letHoverSettle(page, rest);
    await repeatRestingMove(page, rest);
    await expect(highlighted, 'opening under the pointer highlights the first item').toHaveText('Save');

    await movePointerOnto(page, rest);
    await expect(highlighted, 'real pointer movement highlights the item under it').toHaveText('Paste');

    // The next key continues from there and hands the list back to the keyboard.
    await page.keyboard.press('ArrowDown');
    await expect(highlighted).toHaveText('Cut');
    await repeatRestingMove(page, rest);
    await expect(highlighted, 'the pointer rests again after a key press').toHaveText('Cut');
    expect(errors).toEqual([]);
  });

  test('ren-menubar keeps keyboard focus when a menu opens under a resting pointer', { tag: ['@ren-menubar', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'menubar', (usage) => usage.replace(
      '<button type="button" class="ren-menubar-item" role="menuitem">Open</button>',
      '<button type="button" class="ren-menubar-item" role="menuitem">Open</button>\n      <button type="button" class="ren-menubar-item" role="menuitem">Save</button>'
    ));
    const file = page.getByRole('menuitem', { name: 'File', exact: true });
    const item = (name) => page.getByRole('menuitem', { name, exact: true });

    await file.focus();
    await page.keyboard.press('ArrowDown');
    await expect(item('New')).toBeFocused();
    const spot = await centreOf(item('Save'));
    await page.keyboard.press('Escape');
    await expect(file).toBeFocused();
    const rest = await parkPointer(page, spot);

    await page.keyboard.press('ArrowDown');
    await expect(file).toHaveAttribute('aria-expanded', 'true');
    await letHoverSettle(page, rest);
    await repeatRestingMove(page, rest);
    await expect(item('New'), 'opening under the pointer focuses the first item').toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(item('Open'), 'ArrowDown moves on from the first item').toBeFocused();
    await repeatRestingMove(page, rest);
    await expect(item('Open'), 'the pointer still rests').toBeFocused();

    await movePointerOnto(page, rest);
    await expect(item('Save'), 'real pointer movement focuses the item under it').toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(item('Open')).toBeFocused();
    await repeatRestingMove(page, rest);
    await expect(item('Open'), 'the pointer rests again after a key press').toBeFocused();
    expect(errors).toEqual([]);
  });

  test('ren-accordion toggles sections with Enter and Space, one open at a time', { tag: ['@ren-accordion', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'accordion');
    const sections = page.locator('ren-accordion details');
    const summaries = page.locator('ren-accordion summary');
    await summaries.first().focus();
    await page.keyboard.press('Enter');
    await expect(sections.first()).toHaveJSProperty('open', true);
    await page.keyboard.press(' ');
    await expect(sections.first()).toHaveJSProperty('open', false);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await expect(summaries.nth(1)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(sections.nth(1)).toHaveJSProperty('open', true);
    await expect(sections.first(), 'native exclusivity is in use').toHaveAttribute('name', /^ren-accordion-/);
    await expect(sections.first(), 'single mode closes the other section').toHaveJSProperty('open', false);
    expect(errors).toEqual([]);
  });

  test('ren-calendar roves days with arrows, Home/End and PageUp/PageDown, and selects with Enter', { tag: ['@ren-calendar', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'calendar');
    const focusedDate = () => page.evaluate(() => document.activeElement?.dataset?.date ?? null);
    const tabbable = page.locator('ren-calendar .ren-calendar-day[tabindex="0"]');
    await expect(tabbable).toHaveCount(1);
    await tabbable.focus();
    await expect.poll(focusedDate).toBe('2026-03-15');
    await page.keyboard.press('ArrowRight');
    await expect.poll(focusedDate).toBe('2026-03-16');
    await page.keyboard.press('ArrowDown');
    await expect.poll(focusedDate).toBe('2026-03-23');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(focusedDate).toBe('2026-03-15');
    await expect(page.locator('ren-calendar .ren-calendar-day[tabindex="0"]'), 'one tab stop in the grid').toHaveCount(1);

    await page.keyboard.press('Home');
    const weekStart = await focusedDate();
    await page.keyboard.press('End');
    const weekEnd = await focusedDate();
    expect((Date.parse(weekEnd) - Date.parse(weekStart)) / 864e5, 'Home/End span one week').toBe(6);

    await page.keyboard.press('Enter');
    await expect(page.locator('ren-calendar .ren-calendar-day[aria-selected="true"]')).toHaveAttribute('data-date', weekEnd);
    await expect.poll(focusedDate, 'selecting keeps focus on the day').toBe(weekEnd);

    await page.keyboard.press('PageDown');
    await expect(page.locator('ren-calendar .ren-calendar-title')).toContainText(/April|abril/i);
    await expect.poll(focusedDate, 'PageDown keeps focus on the same day of the next month').toBe(weekEnd.replace('-03-', '-04-'));
    await page.keyboard.press('PageUp');
    await expect.poll(focusedDate, 'PageUp comes back').toBe(weekEnd);

    // The month buttons re-render the calendar too; focus must survive that.
    const next = page.locator('ren-calendar .ren-calendar-next');
    await next.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('ren-calendar .ren-calendar-title')).toContainText(/April|abril/i);
    await expect(page.locator('ren-calendar .ren-calendar-next'), 'the next-month button keeps focus').toBeFocused();
    expect(errors).toEqual([]);
  });

  test('ren-carousel moves with Left/Right arrows, its buttons and its dots', { tag: ['@ren-carousel', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'carousel');
    const current = () => page.evaluate(() => [...document.querySelectorAll('ren-carousel .ren-carousel-slide')].findIndex((s) => s.getAttribute('aria-current') === 'true'));
    await expect.poll(current).toBe(0);
    const next = page.locator('ren-carousel .ren-carousel-next');
    await next.focus();
    await page.keyboard.press('Enter');
    await expect.poll(current, 'the next button works from the keyboard').toBe(1);
    await page.keyboard.press('ArrowRight');
    await expect.poll(current).toBe(2);
    await expect(page.locator('ren-carousel .ren-carousel-prev'), 'reaching the end moves focus off the disabled next arrow').toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect.poll(current).toBe(1);
    await page.waitForTimeout(600);
    expect(await current(), 'aria-current still matches the destination once scrolling settles').toBe(1);
    const shown = await page.evaluate(() => {
      const viewport = document.querySelector('ren-carousel .ren-carousel-viewport');
      const slides = [...viewport.querySelectorAll('.ren-carousel-slide')];
      return slides.findIndex((s) => Math.abs(s.offsetLeft - viewport.scrollLeft - slides[0].offsetLeft) < 2);
    });
    expect(shown, 'the slide on screen is the current one').toBe(1);
    const dots = page.locator('ren-carousel .ren-carousel-dot');
    await dots.first().focus();
    await page.keyboard.press(' ');
    await expect.poll(current, 'a dot activates with Space').toBe(0);
    expect(errors).toEqual([]);
  });

  test('ren-color-picker opens from the keyboard, drives saturation, hue and alpha with the keys and closes on Escape', { tag: ['@ren-color-picker', '@keyboard'] }, async ({ page }) => {
    // Pure red plus the alpha slider: every axis starts at a known end.
    const errors = await mount(page, 'color-picker', (usage) => usage.replace('value="#5b6cff"', 'value="#ff0000" alpha'));
    const picker = page.locator('ren-color-picker');
    const trigger = page.locator('ren-color-picker .ren-color-picker-trigger');
    const hex = () => picker.evaluate((el) => el.getValue().hex);
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // The saturation area, the hue slider and the alpha slider are the next three tab stops.
    const area = page.locator('ren-color-picker .ren-color-picker-saturation');
    await page.keyboard.press('Tab');
    await expect(area, 'the saturation area is a tab stop').toBeFocused();
    await expect(area).toHaveAttribute('aria-valuetext', 'Saturation 100%, brightness 100%');
    await page.keyboard.press('ArrowLeft');
    await expect(area, 'Left lowers saturation').toHaveAttribute('aria-valuetext', 'Saturation 99%, brightness 100%');
    await page.keyboard.press('ArrowDown');
    await expect(area, 'Down lowers brightness').toHaveAttribute('aria-valuetext', 'Saturation 99%, brightness 99%');
    await expect.poll(hex, 'the area changes the colour').not.toBe('#ff0000');
    await page.keyboard.press('Shift+ArrowLeft');
    await page.keyboard.press('PageDown');
    await expect(area, 'Shift+Arrow and PageDown take a larger step').toHaveAttribute('aria-valuetext', 'Saturation 89%, brightness 89%');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    await expect(area, 'Right and Up go back').toHaveAttribute('aria-valuetext', 'Saturation 90%, brightness 90%');
    await page.keyboard.press('PageUp');
    await page.keyboard.press('PageUp');
    await expect(area, 'brightness stops at its end').toHaveAttribute('aria-valuetext', 'Saturation 90%, brightness 100%');
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowLeft');
    await expect(area, 'Home jumps to no saturation and stops there').toHaveAttribute('aria-valuetext', 'Saturation 0%, brightness 100%');
    await page.keyboard.press('End');
    await expect(area, 'End jumps to full saturation').toHaveAttribute('aria-valuetext', 'Saturation 100%, brightness 100%');
    await expect.poll(hex, 'the hue survived the trip through grey').toBe('#ff0000');

    const hue = page.locator('ren-color-picker .ren-color-picker-hue');
    await page.keyboard.press('Tab');
    await expect(hue, 'the hue slider is the next tab stop').toBeFocused();
    await expect(hue).toHaveAttribute('aria-valuenow', '0');
    await page.keyboard.press('Shift+ArrowRight');
    await expect(hue).toHaveAttribute('aria-valuenow', '10');
    await expect.poll(hex, 'hue arrows change the colour').not.toBe('#ff0000');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    await expect(hue).toHaveAttribute('aria-valuenow', '12');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('PageUp');
    await expect(hue).toHaveAttribute('aria-valuenow', '20');
    await page.keyboard.press('PageDown');
    await expect(hue).toHaveAttribute('aria-valuenow', '10');
    await page.keyboard.press('End');
    await expect(hue).toHaveAttribute('aria-valuenow', '360');
    await page.keyboard.press('Home');
    await expect(hue).toHaveAttribute('aria-valuenow', '0');
    await page.keyboard.press('ArrowLeft');
    await expect(hue, 'hue is a circle: a step below 0 wraps').toHaveAttribute('aria-valuenow', '359');

    const alpha = page.locator('ren-color-picker .ren-color-picker-alpha');
    await page.keyboard.press('Tab');
    await expect(alpha, 'the alpha slider is the next tab stop').toBeFocused();
    await expect(alpha).toHaveAttribute('aria-valuenow', '100');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowDown');
    await expect(alpha).toHaveAttribute('aria-valuenow', '98');
    await page.keyboard.press('Shift+ArrowLeft');
    await page.keyboard.press('PageDown');
    await expect(alpha).toHaveAttribute('aria-valuenow', '78');
    await expect.poll(() => picker.evaluate((el) => el.getValue().alpha), 'the value carries the opacity').toBe(0.78);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('PageUp');
    await expect(alpha).toHaveAttribute('aria-valuenow', '90');
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowLeft');
    await expect(alpha, 'opacity stops at 0').toHaveAttribute('aria-valuenow', '0');
    await page.keyboard.press('End');
    await expect(alpha).toHaveAttribute('aria-valuenow', '100');

    await page.keyboard.press('Tab');
    await expect(page.locator('ren-color-picker .ren-color-picker-hex-input'), 'the sliders do not trap focus').toBeFocused();

    // Switching format rebuilds the dropdown; focus stays on the toggle.
    const format = page.locator('ren-color-picker .ren-color-picker-format-toggle');
    await format.focus();
    await page.keyboard.press('Enter');
    await expect(format).toHaveText('RGB');
    await expect(format, 'the format toggle keeps focus after it is used').toBeFocused();

    await hue.focus();
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger, 'Escape returns focus to the trigger').toBeFocused();
    await page.keyboard.press(' ');
    await expect(trigger, 'Space opens it too').toHaveAttribute('aria-expanded', 'true');
    expect(errors).toEqual([]);
  });

  test('ren-color-picker controls expose their name, role and value, and a key press is a committed change', { tag: ['@ren-color-picker', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'color-picker', (usage) => usage.replace('value="#5b6cff"', 'value="#ff0000" alpha swatches="#ff0000,#00ff00"'));
    await page.evaluate(() => {
      window.__events = [];
      const picker = document.querySelector('ren-color-picker');
      for (const type of ['ren-input', 'ren-change']) picker.addEventListener(type, (event) => window.__events.push(`${type} ${event.detail.hex}`));
    });
    const picker = page.locator('ren-color-picker');
    const hex = () => picker.evaluate((el) => el.getValue().hex);
    const trigger = page.locator('ren-color-picker .ren-color-picker-trigger');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Found by role and name, the way assistive technology finds them.
    const area = page.getByRole('slider', { name: 'Color saturation and brightness' });
    const hue = page.getByRole('slider', { name: 'Color hue' });
    const alpha = page.getByRole('slider', { name: 'Color opacity' });
    for (const [slider, min, max, now, text] of [
      [area, '0', '100', '100', 'Saturation 100%, brightness 100%'],
      [hue, '0', '360', '0', '0°'],
      [alpha, '0', '100', '100', '100%'],
    ]) {
      await expect(slider).toHaveAttribute('aria-valuemin', min);
      await expect(slider).toHaveAttribute('aria-valuemax', max);
      await expect(slider, 'the value is there as soon as the dropdown opens').toHaveAttribute('aria-valuenow', now);
      await expect(slider).toHaveAttribute('aria-valuetext', text);
    }
    await expect(area, 'ARIA has no 2D slider role, so the area says what it is').toHaveAttribute('aria-roledescription', '2D slider');
    const thumb = page.locator('.ren-color-picker-alpha-handle');
    await expect(thumb, 'the alpha thumb starts at the value, not at 0').toHaveAttribute('style', /left:\s*100%/);
    // Both boxes are read in one frame, so the open animation cannot skew them.
    const overhang = await alpha.evaluate((track) => {
      const thumbBox = track.querySelector('.ren-color-picker-alpha-handle').getBoundingClientRect();
      return thumbBox.right - track.getBoundingClientRect().right;
    });
    expect(overhang, 'and stays inside the track, where it is not clipped').toBeLessThanOrEqual(0.5);

    // One key press is one committed change, like a native range input.
    await hue.focus();
    await page.keyboard.press('PageUp');
    await expect(hue).toHaveAttribute('aria-valuetext', '10°');
    const changed = await hex();
    expect(changed).not.toBe('#ff0000');
    expect(await page.evaluate(() => window.__events)).toEqual([`ren-input ${changed}`, `ren-change ${changed}`]);

    // Every control that shows the colour follows it, the trigger's name included.
    await expect(page.getByRole('button', { name: `Color picker, current color ${changed}` })).toHaveCount(1);
    await expect(page.locator('ren-color-picker .ren-color-picker-hex-input')).toHaveValue(changed);
    await page.keyboard.press('Home');
    await expect(page.getByRole('button', { name: 'Color picker, current color #ff0000' })).toHaveCount(1);

    // The preset that equals the value is marked current, and only that one.
    const presets = page.getByRole('group', { name: 'Preset color swatches' }).getByRole('button');
    await expect(presets.first()).toHaveAttribute('aria-current', 'true');
    await presets.nth(1).focus();
    await page.keyboard.press('Enter');
    await expect.poll(hex).toBe('#00ff00');
    await expect(presets.nth(1)).toHaveAttribute('aria-current', 'true');
    await expect(presets.first()).not.toHaveAttribute('aria-current');

    // No ARIA or naming violation anywhere in the open picker, checked while
    // every state it can carry is present (slider values, a current preset).
    await injectAxe(page);
    await checkA11y(page, 'ren-color-picker', {
      detailedReport: true,
      axeOptions: { runOnly: { type: 'rule', values: [
        'aria-allowed-attr', 'aria-prohibited-attr', 'aria-required-attr', 'aria-valid-attr', 'aria-valid-attr-value',
        'aria-roles', 'aria-allowed-role', 'aria-input-field-name', 'button-name', 'label',
      ] } },
    });

    // A press on a track moves the value, keeps every field in step and
    // focuses the slider, so the arrows can fine-tune from there.
    const track = await alpha.boundingBox();
    await page.mouse.click(track.x + track.width / 2, track.y + track.height / 2);
    await expect(alpha, 'a press focuses the slider').toBeFocused();
    const pressed = Number(await alpha.getAttribute('aria-valuenow'));
    expect(pressed).toBeGreaterThan(40);
    expect(pressed).toBeLessThan(60);
    await expect(page.locator('ren-color-picker .ren-color-picker-hex-input'), 'the hex field follows a pointer change').toHaveValue(await hex());
    await page.keyboard.press('ArrowLeft');
    await expect(alpha).toHaveAttribute('aria-valuenow', String(pressed - 1));
    expect(errors).toEqual([]);
  });

  test('ren-dropzone opens the file picker from the keyboard', { tag: ['@ren-dropzone', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'dropzone');
    await page.evaluate(() => import('/components/composites/ren-dropzone/ren-dropzone.js').then((m) => m.initDropZone(document.querySelector('.ren-dropzone'))));
    const input = page.locator('.ren-dropzone-input');
    await input.focus();
    await expect(input).toBeFocused();
    for (const key of ['Enter', ' ']) {
      const chooser = page.waitForEvent('filechooser', { timeout: 3000 });
      await page.keyboard.press(key);
      expect((await chooser).isMultiple(), `${key === ' ' ? 'Space' : key} opens the native picker`).toBe(true);
    }
    expect(errors).toEqual([]);
  });

  test('ren-form submits with Enter; an invalid submit focuses the error summary, whose link leads back to the field', { tag: ['@ren-form', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'form');
    await page.evaluate(() => {
      window.__submits = 0;
      document.querySelector('ren-form').addEventListener('ren-submit', (e) => { e.preventDefault(); window.__submits += 1; });
    });
    const email = page.locator('ren-form input[type="email"]');
    const summary = page.locator('ren-form .ren-form-error-summary');
    await email.focus();
    await page.keyboard.press('Enter');
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    await expect(summary, 'an invalid submit moves focus to the error summary').toBeFocused();
    expect(await page.evaluate(() => window.__submits)).toBe(0);
    await page.keyboard.press('Tab');
    await expect(summary.locator('a').first()).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(email, 'the summary link returns focus to the field').toBeFocused();
    await page.keyboard.type('ren@example.com');
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => window.__submits)).toBe(1);
    expect(errors).toEqual([]);
  });

  test('ren-hover-card opens on focus, closes on Escape and on blur', { tag: ['@ren-hover-card', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'hover-card');
    const card = page.locator('ren-hover-card .ren-hover-card');
    const isOpen = () => card.evaluate((el) => el.matches(':popover-open'));
    const trigger = page.locator('#profile-trigger');
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await expect.poll(isOpen, 'focus opens it').toBe(true);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect.poll(isOpen, 'Escape dismisses it (WCAG 1.4.13)').toBe(false);
    await expect(trigger, 'focus stays on the trigger').toBeFocused();
    await trigger.blur();
    await trigger.focus();
    await expect.poll(isOpen).toBe(true);
    // Keep the next focus target inside the page: Shift+Tab off the first
    // tab stop leaves the document, and Firefox fires no focusout for that.
    await page.evaluate(() => document.getElementById('profile-trigger').insertAdjacentHTML('beforebegin', '<button type="button" id="before-trigger">Before</button>'));
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('#before-trigger')).toBeFocused();
    await expect.poll(isOpen, 'moving focus away closes it').toBe(false);
    expect(errors).toEqual([]);
  });

  test('ren-sidebar collapses from its toggle and closes the mobile overlay on Escape', { tag: ['@ren-sidebar', '@keyboard'] }, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = await mount(page, 'sidebar');
    await page.evaluate(() => localStorage.clear());
    const sidebar = page.locator('ren-sidebar');
    const toggle = page.locator('ren-sidebar .ren-sidebar-toggle');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(sidebar).toHaveAttribute('data-collapsed', '');
    await page.keyboard.press(' ');
    await expect(sidebar).not.toHaveAttribute('data-collapsed', '');

    await page.setViewportSize({ width: 480, height: 800 });
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));
    await sidebar.evaluate((el) => el.openMobileMenu());
    await expect(sidebar).toHaveAttribute('data-open', '');
    await page.keyboard.press('Escape');
    await expect(sidebar).not.toHaveAttribute('data-open', '');
    expect(errors).toEqual([]);
  });

  test('ren-sidebar toggle reports aria-expanded, including the collapsed state restored from storage', { tag: ['@ren-sidebar', '@keyboard'] }, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = await mount(page, 'sidebar');
    const sidebar = page.locator('ren-sidebar');
    const toggle = page.locator('ren-sidebar .ren-sidebar-toggle');
    await expect(toggle, 'expanded on first visit').toHaveAttribute('aria-expanded', 'true');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(sidebar).toHaveAttribute('data-collapsed', '');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press(' ');
    await expect(sidebar).not.toHaveAttribute('data-collapsed', '');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    // A collapsed preference from an earlier visit is announced on load, before any click.
    await mountRegistry(page, server.origin, 'sidebar', undefined, {
      beforeMount: (fixture) => fixture.evaluate(() => localStorage.setItem('ren-sidebar-collapsed', 'true')),
    });
    await expect(sidebar).toHaveAttribute('data-collapsed', '');
    await expect(toggle, 'restored collapsed state').toHaveAttribute('aria-expanded', 'false');

    // The mobile overlay always renders expanded, whatever is stored.
    await resizeViewport(page, { width: 480, height: 800 });
    await expect(sidebar).not.toHaveAttribute('data-collapsed', '');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await resizeViewport(page, { width: 1280, height: 800 });
    await expect(sidebar).toHaveAttribute('data-collapsed', '');
    await expect(toggle, 'back on desktop the preference applies again').toHaveAttribute('aria-expanded', 'false');
    expect(errors).toEqual([]);
  });

  test('ren-sidebar returns focus to the opener however the mobile overlay closes', { tag: ['@ren-sidebar', '@keyboard'] }, async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    const errors = await mount(page, 'sidebar', (usage) => usage
      .replace('<ren-sidebar ', '<ren-sidebar id="primary-nav" ')
      .replace('</nav>', '  <button class="ren-sidebar-item" type="button">Sign out</button>\n  </nav>\n  <button type="button" id="close-nav">Close navigation</button>')
      .replace('</ren-sidebar>', '</ren-sidebar>\n<div class="ren-sidebar-overlay"></div>\n<button type="button" id="open-nav">Menu</button>\n<button type="button" id="elsewhere">Elsewhere</button>'));
    await page.evaluate(() => {
      const sidebar = document.querySelector('ren-sidebar');
      document.getElementById('open-nav').addEventListener('click', () => sidebar.toggleMenu());
      document.getElementById('close-nav').addEventListener('click', () => sidebar.closeMobileMenu());
    });
    const sidebar = page.locator('ren-sidebar');
    const opener = page.locator('#open-nav');
    const link = page.locator('ren-sidebar a.ren-sidebar-item').first();
    const openFromKeyboard = async () => {
      await opener.focus();
      await page.keyboard.press('Enter');
      await expect(sidebar).toHaveAttribute('data-open', '');
    };
    const expectClosedWithFocusOnOpener = async (path) => {
      await expect(sidebar).not.toHaveAttribute('data-open', '');
      await expect(opener, `${path} returns focus to the opener`).toBeFocused();
    };

    await openFromKeyboard();
    await link.focus();
    await page.keyboard.press('Escape');
    await expectClosedWithFocusOnOpener('Escape');

    // Escape is the user dismissing the overlay, so it works from anywhere.
    await openFromKeyboard();
    await page.evaluate(() => document.activeElement.blur());
    await page.keyboard.press('Escape');
    await expectClosedWithFocusOnOpener('Escape with focus on the page');

    await openFromKeyboard();
    await link.focus();
    // Click the backdrop beside the drawer.
    await page.locator('.ren-sidebar-overlay').click({ position: { x: 440, y: 400 } });
    await expectClosedWithFocusOnOpener('the backdrop');

    await openFromKeyboard();
    await page.locator('#close-nav').focus();
    await page.keyboard.press('Enter');
    await expectClosedWithFocusOnOpener('a close control inside the drawer');

    await openFromKeyboard();
    await page.getByRole('button', { name: 'Sign out' }).focus();
    await page.keyboard.press('Enter');
    await expectClosedWithFocusOnOpener('activating an item');

    await openFromKeyboard();
    await link.focus();
    await sidebar.evaluate((el) => el.closeMobileMenu());
    await expectClosedWithFocusOnOpener('closeMobileMenu() with focus inside');

    // A close from code must not pull focus away from an unrelated control.
    await openFromKeyboard();
    await page.locator('#elsewhere').focus();
    await sidebar.evaluate((el) => el.closeMobileMenu());
    await expect(sidebar).not.toHaveAttribute('data-open', '');
    await expect(page.locator('#elsewhere'), 'focus outside the drawer is left alone').toBeFocused();

    // Nothing focused at open time (Safari does not focus a clicked button):
    // the control that declares aria-controls is the opener.
    await opener.evaluate((button) => button.setAttribute('aria-controls', 'primary-nav'));
    await page.evaluate(() => document.activeElement.blur());
    await sidebar.evaluate((el) => el.openMobileMenu());
    await expect(sidebar).toHaveAttribute('data-open', '');
    await link.focus();
    await page.keyboard.press('Escape');
    await expectClosedWithFocusOnOpener('Escape, with the opener known only through aria-controls,');

    // Growing to desktop drops the overlay but keeps the sidebar on screen,
    // so focus inside it stays where the user put it.
    await openFromKeyboard();
    await link.focus();
    await resizeViewport(page, { width: 1280, height: 800 });
    await expect(sidebar).not.toHaveAttribute('data-open', '');
    await expect(link, 'focus stays in the sidebar when it becomes a desktop sidebar').toBeFocused();
    expect(errors).toEqual([]);
  });

  test('ren-table sorts a header with Enter and Space, one step per key press', { tag: ['@ren-table', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'table');
    const header = page.locator('ren-table th.ren-th-sortable');
    const firstName = () => page.locator('ren-table tbody tr:first-child td:first-child').textContent();
    await header.focus();
    await expect(header).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(header, 'Enter sorts ascending once').toHaveAttribute('aria-sort', 'ascending');
    await expect.poll(firstName).toBe('Ana');
    await page.keyboard.press('Enter');
    await expect(header).toHaveAttribute('aria-sort', 'descending');
    await expect.poll(firstName).toBe('John');
    await page.keyboard.press(' ');
    await expect(header, 'Space advances one step too: back to unsorted').toHaveAttribute('aria-sort', 'none');
    await expect.poll(firstName, 'unsorted restores source order').toBe('John');
    expect(errors).toEqual([]);
  });

  test('ren-toast is reached with F6, closes with its button or Escape, and never steals focus', { tag: ['@ren-toast', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'toast');
    await page.evaluate(() => import('/components/composites/ren-toast/ren-toast.js').then(({ toast }) => {
      toast({ title: 'First', duration: 0 });
      toast({ title: 'Second', duration: 0 });
    }));
    const toasts = page.locator('ren-toast-viewport .ren-toast');
    await expect(toasts).toHaveCount(2);
    expect(await page.evaluate(() => document.activeElement === document.body), 'showing a toast does not move focus').toBe(true);
    await page.keyboard.press('F6');
    await expect.poll(() => page.evaluate(() => !!document.activeElement?.closest('.ren-toast'))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(toasts).toHaveCount(1);
    await page.keyboard.press('F6');
    await page.keyboard.press('Tab');
    await expect(page.locator('ren-toast-viewport .ren-toast-close')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(toasts).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('ren-tooltip opens on focus, closes on Escape and on blur', { tag: ['@ren-tooltip', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'tooltip');
    const tip = page.locator('ren-tooltip');
    const isOpen = () => tip.evaluate((el) => el.matches(':popover-open'));
    const trigger = page.locator('.ren-tooltip-trigger');
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-describedby', /ren-tooltip-/);
    await expect.poll(isOpen, 'focus opens it').toBe(true);
    await page.keyboard.press('Escape');
    await expect.poll(isOpen, 'Escape dismisses it (WCAG 1.4.13)').toBe(false);
    await expect(trigger, 'focus stays on the trigger').toBeFocused();
    await trigger.blur();
    await trigger.focus();
    await expect.poll(isOpen).toBe(true);
    await trigger.blur();
    await expect.poll(isOpen, 'blur closes it').toBe(false);
    expect(errors).toEqual([]);
  });
});
