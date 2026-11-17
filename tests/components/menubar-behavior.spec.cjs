// @ts-check
/**
 * ren-menubar behavior tests.
 *
 * This component shipped in 0.13.0 unable to open a single menu: `openMenu`
 * and `closeAll` were each defined twice on the class, and the winning
 * `openMenu` called itself — every trigger click threw
 * "Maximum call stack size exceeded".
 *
 * Nothing caught it. The only spec that referenced ren-menubar asserted that
 * the module registers its custom element, and the docs page demos a
 * hand-written static menu instead of the real component. So these tests
 * drive the actual element and assert observable behavior.
 *
 * They also lock in the ARIA Menubar dismissal semantics the layer stack
 * provides: Escape closes one level at a time, innermost first.
 */
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const FIXTURE = '/tests/components/fixtures/menubar-behavior.html';

let server;

test.beforeAll(async () => {
  server = await startStaticServer(ROOT);
});

test.afterAll(async () => {
  await server?.close();
});

/** @type {string[]} */
let pageErrors;

test.beforeEach(async ({ page }) => {
  pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto(`${server.origin}${FIXTURE}`);
  expect(response?.status()).toBe(200);
  await page.waitForFunction(() => customElements.get('ren-menubar') !== undefined);
});

/** Whether a menu panel is currently expanded, read from its owner's ARIA. */
const expanded = (page, id) =>
  page.evaluate((elementId) => document.getElementById(elementId)?.getAttribute('aria-expanded'), id);

const focusedId = (page) => page.evaluate(() => document.activeElement?.id ?? null);

test('clicking a trigger opens its menu without throwing', async ({ page }) => {
  await page.click('#trigger-file');

  expect(await expanded(page, 'trigger-file')).toBe('true');
  // The recursion bug surfaced as a RangeError on the very first click.
  expect(pageErrors, 'opening a menu must not throw').toEqual([]);
});

test('Escape closes one level at a time, innermost first', { tag: ['@ren-menubar', '@keyboard'] }, async ({ page }) => {
  await page.click('#trigger-file');
  await page.hover('#item-recent');
  await expect
    .poll(() => expanded(page, 'item-recent'))
    .toBe('true');

  // First Escape: only the submenu closes, focus returns to its parent item.
  await page.keyboard.press('Escape');
  await expect.poll(() => expanded(page, 'item-recent')).toBe('false');
  expect(await expanded(page, 'trigger-file'), 'parent menu must stay open').toBe('true');
  expect(await focusedId(page)).toBe('item-recent');

  // Second Escape: the parent menu closes, focus returns to the trigger.
  await page.keyboard.press('Escape');
  await expect.poll(() => expanded(page, 'trigger-file')).toBe('false');
  expect(await focusedId(page)).toBe('trigger-file');

  expect(pageErrors).toEqual([]);
});

test('activating an item with the mouse fires its action and closes the menu', async ({ page }) => {
  const selected = [];
  await page.exposeFunction('recordSelect', (value) => selected.push(value));
  await page.evaluate(() =>
    document
      .querySelector('ren-menubar')
      // @ts-ignore - test bridge
      ?.addEventListener('ren-menubar-select', (event) => window.recordSelect(event.detail?.value ?? event.target?.id))
  );

  await page.click('#trigger-file');
  await page.click('#item-new');

  await expect.poll(() => expanded(page, 'trigger-file')).toBe('false');
  expect(selected.length, 'the item action must fire despite pointerdown dismissal').toBeGreaterThan(0);
  expect(pageErrors).toEqual([]);
});

test('an open submenu is on screen beside its parent, and its items take a click', { tag: ['@ren-menubar', '@runtime'] }, async ({ page }) => {
  const selected = [];
  await page.exposeFunction('recordSelect', (value) => selected.push(value));
  await page.evaluate(() =>
    document
      .querySelector('ren-menubar')
      // @ts-ignore - test bridge
      ?.addEventListener('ren-menubar-select', (event) => window.recordSelect(event.detail.item.id))
  );

  await page.click('#trigger-file');
  await page.hover('#item-recent');
  await expect.poll(() => expanded(page, 'item-recent')).toBe('true');

  // The submenu panel is a child of its item and sits beside the parent panel.
  // A parent that clips its overflow leaves it open, in the accessibility tree,
  // and nowhere on screen: every box still reports a position.
  const hit = (id) => page.evaluate((elementId) => {
    const box = document.getElementById(elementId).getBoundingClientRect();
    const at = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return at?.id || at?.className || at?.localName || 'nothing';
  }, id);
  await expect.poll(() => hit('item-doc-one'), 'a pointer on the first submenu item hits that item').toBe('item-doc-one');
  await expect.poll(() => hit('item-doc-two')).toBe('item-doc-two');

  const [parent, submenu] = await page.evaluate(() => ['#item-recent', '#item-doc-one'].map((selector) => {
    const box = document.querySelector(selector).closest('.ren-menubar-menu').getBoundingClientRect();
    return { left: box.left, right: box.right };
  }));
  expect(submenu.left, 'the submenu opens beside the parent panel, not over it').toBeGreaterThanOrEqual(parent.right);

  await page.mouse.click(...(await page.locator('#item-doc-two').evaluate((el) => {
    const box = el.getBoundingClientRect();
    return [box.left + box.width / 2, box.top + box.height / 2];
  })));
  await expect.poll(() => selected, 'a click where the submenu item is selects it').toEqual(['item-doc-two']);
  await expect.poll(() => expanded(page, 'trigger-file')).toBe('false');
  expect(pageErrors).toEqual([]);
});

test('a click outside collapses the whole tree at once', async ({ page }) => {
  await page.click('#trigger-file');
  await page.hover('#item-recent');
  await expect.poll(() => expanded(page, 'item-recent')).toBe('true');

  await page.click('#outside');

  // Click-outside is not per-layer: the entire menubar collapses.
  await expect.poll(() => expanded(page, 'trigger-file')).toBe('false');
  expect(await expanded(page, 'item-recent')).toBe('false');
  // Dismissal must not steal focus from whatever the user clicked.
  expect(await focusedId(page)).toBe('outside');
  expect(pageErrors).toEqual([]);
});

test('arrow keys move between items without leaking into a closed submenu', { tag: ['@ren-menubar', '@keyboard'] }, async ({ page }) => {
  await page.click('#trigger-file');
  await expect.poll(() => focusedId(page)).toBe('item-new');

  await page.keyboard.press('ArrowDown');
  expect(await focusedId(page)).toBe('item-recent');

  // The submenu is still closed, so its children are not in the walk order.
  await page.keyboard.press('ArrowDown');
  expect(await focusedId(page)).toBe('item-save');

  expect(pageErrors).toEqual([]);
});

test('disconnecting releases its dismissable layers', async ({ page }) => {
  await page.click('#trigger-file');
  await page.hover('#item-recent');
  await expect.poll(() => expanded(page, 'item-recent')).toBe('true');

  const remaining = await page.evaluate(async () => {
    document.querySelector('ren-menubar')?.remove();
    const { getActiveLayerCount } = await import('/utils/dismissable.js');
    return getActiveLayerCount();
  });

  expect(remaining, 'removing the menubar must not leave layers on the stack').toBe(0);
  expect(pageErrors).toEqual([]);
});
