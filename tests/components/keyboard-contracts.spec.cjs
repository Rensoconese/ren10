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
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');
const { REGISTRY } = require('../../cli/registry.js');

const ROOT = path.resolve(__dirname, '../..');
const FIXTURE = '/tests/components/fixtures/runtime-smoke.html';

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

function assetsFor(key, seen = new Set()) {
  const entry = REGISTRY[key];
  const files = [];
  for (const dep of entry.components ?? []) {
    if (seen.has(dep) || !REGISTRY[dep]) continue;
    seen.add(dep);
    files.push(...assetsFor(dep, seen));
  }
  for (const file of entry.files ?? []) files.push(`/components/${entry.layer}/${entry.dir}/${file}`);
  return files;
}

/** Mount registry usage (optionally edited) with its CSS, then import its JS. */
async function mount(page, key, edit = (usage) => usage) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(`${server.origin}${FIXTURE}`);
  const assets = assetsFor(key);
  // Inline <script> in a usage snippet would not run through innerHTML anyway.
  const markup = edit(REGISTRY[key].usage).replace(/<script[\s\S]*?<\/script>/g, '');
  await page.evaluate(([sheets, html]) => {
    for (const href of sheets) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
    document.getElementById('host').innerHTML = html;
  }, [assets.filter((a) => a.endsWith('.css')), markup]);
  await page.evaluate((sources) => Promise.all(sources.map((src) => import(src))), assets.filter((a) => a.endsWith('.js')));
  const tag = markup.match(/<(ren-[a-z-]+)/)?.[1];
  if (tag) {
    await page.waitForFunction((name) => customElements.get(name) !== undefined, tag);
  }
  return errors;
}

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
});
