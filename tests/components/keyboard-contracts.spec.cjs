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
const { startStaticServer } = require('../utils/static-server.cjs');
const { ROOT, mountRegistry } = require('../utils/mount-registry.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

/** Mount registry usage (optionally edited) with its CSS, then import its JS. */
const mount = (page, key, edit) => mountRegistry(page, server.origin, key, edit);

const focusedText = (page) => page.evaluate(() => document.activeElement?.textContent?.trim() ?? null);

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
    // focusOnHover: a resting pointer over the list would move the active option.
    await page.mouse.move(1, 1000);
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

  test('ren-color-picker opens from the keyboard, moves hue with arrows and closes on Escape', { tag: ['@ren-color-picker', '@keyboard'] }, async ({ page }) => {
    const errors = await mount(page, 'color-picker');
    const picker = page.locator('ren-color-picker');
    const trigger = page.locator('ren-color-picker .ren-color-picker-trigger');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const hue = page.locator('ren-color-picker .ren-color-picker-hue');
    await hue.focus();
    const before = await picker.evaluate((el) => el.getValue());
    await page.keyboard.press('Shift+ArrowRight');
    await expect.poll(() => picker.evaluate((el) => el.getValue()), 'hue arrows change the colour').not.toBe(before);
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger, 'Escape returns focus to the trigger').toBeFocused();
    await page.keyboard.press(' ');
    await expect(trigger, 'Space opens it too').toHaveAttribute('aria-expanded', 'true');
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
