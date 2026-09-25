// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const FIXTURE = '/tests/components/fixtures/stack-rhythm.html';

let server;

test.beforeAll(async () => {
  server = await startStaticServer(ROOT);
});

test.afterAll(async () => {
  await server?.close();
});

/**
 * Measure the real vertical gap between two children of a stack plus the
 * computed block margins of each child.
 * @param {import('@playwright/test').Page} page
 * @param {string} stack
 * @param {string} first
 * @param {string} second
 */
async function measure(page, stack, first, second) {
  return page.evaluate(({ stack, first, second }) => {
    const stackEl = document.querySelector(stack);
    const firstEl = document.querySelector(first);
    const secondEl = document.querySelector(second);
    const firstBox = firstEl.getBoundingClientRect();
    const secondBox = secondEl.getBoundingClientRect();
    const firstStyle = getComputedStyle(firstEl);
    const secondStyle = getComputedStyle(secondEl);
    return {
      rowGap: Number.parseFloat(getComputedStyle(stackEl).rowGap),
      rectGap: Math.round(secondBox.top - firstBox.bottom),
      firstMarginBlockEnd: Number.parseFloat(firstStyle.marginBlockEnd),
      secondMarginBlockStart: Number.parseFloat(secondStyle.marginBlockStart),
    };
  }, { stack, first, second });
}

test('ren-stack owns the heading-to-paragraph gap', async ({ page }) => {
  await page.goto(`${server.origin}${FIXTURE}`);
  const state = await measure(page, '#heading-stack', '#heading', '#heading-body');
  expect(state.rectGap).toBe(24);
  expect(state.firstMarginBlockEnd).toBe(0);
  expect(state.secondMarginBlockStart).toBe(0);
});

test('a nested plain stack uses its own default, not the parent gap', async ({ page }) => {
  await page.goto(`${server.origin}${FIXTURE}`);
  const outer = await measure(page, '#nested-outer', '#nested-outer', '#nested-inner');
  expect(outer.rowGap).toBe(32);
  const inner = await measure(page, '#nested-inner', '#nested-a', '#nested-b');
  expect(inner.rowGap).toBe(12);
  expect(inner.rectGap).toBe(12);
});

test('nested variants keep their fixed scale steps', async ({ page }) => {
  await page.goto(`${server.origin}${FIXTURE}`);
  const outer = await measure(page, '#variant-outer', '#variant-outer', '#variant-inner');
  expect(outer.rowGap).toBe(24);
  const inner = await measure(page, '#variant-inner', '#variant-a', '#variant-b');
  expect(inner.rowGap).toBe(8);
  expect(inner.rectGap).toBe(8);
});

test('nested prose keeps the classless rhythm', async ({ page }) => {
  await page.goto(`${server.origin}${FIXTURE}`);
  const prose = await page.locator('#nested-middle').evaluate((node) => ({
    marginBlockStart: Number.parseFloat(getComputedStyle(node).marginBlockStart),
    marginBlockEnd: Number.parseFloat(getComputedStyle(node).marginBlockEnd),
  }));
  expect(prose.marginBlockStart).toBe(12);
  expect(prose.marginBlockEnd).toBe(12);
});

test('the default stack tracks all three densities', async ({ page }) => {
  await page.goto(`${server.origin}${FIXTURE}`);
  const expected = { compact: 8, comfortable: 12, spacious: 16 };

  for (const density of ['compact', 'comfortable', 'spacious']) {
    await page.evaluate((value) => {
      document.documentElement.dataset.density = value;
    }, density);

    const stack = await measure(page, '#default-stack', '#default-heading', '#default-body');
    expect(stack.rowGap, `${density} row gap`).toBe(expected[density]);
    expect(stack.rectGap, `${density} measured gap`).toBe(expected[density]);

    // Fixed size modifiers must not move with density.
    const variant = await measure(page, '#heading-stack', '#heading', '#heading-body');
    expect(variant.rowGap, `${density} -lg row gap`).toBe(24);
  }
});

test('explicit local overrides win over the stack default', async ({ page }) => {
  await page.goto(`${server.origin}${FIXTURE}`);
  const state = await measure(page, '#explicit-class', '#explicit-a', '#explicit-b');
  expect(state.rowGap).toBe(32);
  expect(state.rectGap).toBe(32);
});

test('semantic themes and intentional consumer margins remain effective', async ({ page }) => {
  await page.goto(`${server.origin}${FIXTURE}`);
  await page.addStyleTag({ content: ':root { --space-stack: var(--space-5); } #default-body { margin-block-start: var(--space-2); } #default-stack { min-height: 300px; } #default-heading { margin-inline: auto; }' });
  const state = await measure(page, '#default-stack', '#default-heading', '#default-body');
  expect(state.rowGap).toBe(20);
  expect(state.rectGap).toBe(28);
  await page.addStyleTag({ content: '#default-body { margin-block-start: auto; }' });
  const auto = await measure(page, '#default-stack', '#default-heading', '#default-body');
  expect(auto.rectGap).toBeGreaterThan(100);
});
