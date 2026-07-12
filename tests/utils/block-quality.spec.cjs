const path = require('node:path');
const { test, expect } = require('@playwright/test');
const {
  expectAligned,
  expectNoOverflow,
  expectSingleVisibleAffordance,
  expectWidthRatio,
  inspectNativeChrome,
} = require('./block-quality.cjs');

const fixturePath = path.resolve(__dirname, '../components/fixtures/block-quality.html');

test.beforeEach(async ({ page }) => {
  await page.goto(`file://${fixturePath}`);
});

test('single-affordance helper reports duplicates', async ({ page }) => {
  await expectSingleVisibleAffordance(page, ['#good-affordance'], 'good chevron');
  await expect(
    expectSingleVisibleAffordance(page, ['#duplicate-a', '#duplicate-b'], 'menu chevron'),
  ).rejects.toThrow(/menu chevron: expected 1 visible affordance, received 2/);
});

test('single-affordance helper reports zero visible matches', async ({ page }) => {
  await expect(
    expectSingleVisibleAffordance(page, ['#hidden-affordance'], 'hidden chevron'),
  ).rejects.toThrow(/hidden chevron: expected 1 visible affordance, received 0/);

  await expect(
    expectSingleVisibleAffordance(page, ['#does-not-exist'], 'missing chevron'),
  ).rejects.toThrow(/missing chevron: expected 1 visible affordance, received 0/);
});

test('single-affordance helper validates arguments', async ({ page }) => {
  await expect(
    expectSingleVisibleAffordance(null, ['#good-affordance'], 'x'),
  ).rejects.toThrow(/page must be a Playwright Page/);

  await expect(
    expectSingleVisibleAffordance(page, '#good-affordance', 'x'),
  ).rejects.toThrow(/selectors must be a non-empty array/);

  await expect(
    expectSingleVisibleAffordance(page, [], 'x'),
  ).rejects.toThrow(/selectors must be a non-empty array/);

  await expect(
    expectSingleVisibleAffordance(page, ['#good-affordance'], ''),
  ).rejects.toThrow(/label must be a non-empty string/);
});

test('alignment helper includes the measured delta', async ({ page }) => {
  await expect(expectAligned(page, ['#peer-a', '#peer-b'], 'centerY', 1)).rejects.toThrow(/delta 8/);
});

test('alignment helper accepts aligned peers within tolerance', async ({ page }) => {
  await expectAligned(page, ['#peer-aligned-a', '#peer-aligned-b'], 'centerY', 1);
  await expectAligned(page, ['#peer-aligned-a', '#peer-aligned-b'], 'top', 1);
});

test('alignment helper validates axis and element count', async ({ page }) => {
  await expect(
    expectAligned(page, ['#peer-aligned-a', '#peer-aligned-b'], 'diagonal', 1),
  ).rejects.toThrow(/Unsupported alignment axis: diagonal/);

  await expect(
    expectAligned(page, ['#peer-aligned-a'], 'centerY', 1),
  ).rejects.toThrow(/Alignment requires at least 2 visible elements; received 1/);

  await expect(
    expectAligned(page, ['#does-not-exist', '#also-missing'], 'left', 1),
  ).rejects.toThrow(/Alignment requires at least 2 visible elements; received 0/);

  await expect(
    expectAligned(page, null, 'centerY', 1),
  ).rejects.toThrow(/selectors must be a non-empty array/);
});

test('width ratio helper accepts in-range measurements', async ({ page }) => {
  await expectWidthRatio(page, '#narrow', '#container', 0.15, 0.25);
  await expectWidthRatio(page, '#full', '#full-container', 0.95, 1.05);
});

test('width ratio helper reports measured ratio outside range', async ({ page }) => {
  await expect(
    expectWidthRatio(page, '#narrow', '#container', 0.5, 0.8),
  ).rejects.toThrow(/Width ratio 0\.200 outside 0\.5\.\.0\.8 for #narrow/);
});

test('width ratio helper reports missing elements', async ({ page }) => {
  await expect(
    expectWidthRatio(page, '#missing-subject', '#container', 0, 1),
  ).rejects.toThrow(/Width ratio elements missing: #missing-subject \/ #container/);

  await expect(
    expectWidthRatio(page, '#narrow', '#missing-container', 0, 1),
  ).rejects.toThrow(/Width ratio elements missing: #narrow \/ #missing-container/);
});

test('width ratio helper validates arguments', async ({ page }) => {
  await expect(
    expectWidthRatio(page, '', '#container', 0, 1),
  ).rejects.toThrow(/subject must be a non-empty string/);

  await expect(
    expectWidthRatio(page, '#narrow', '', 0, 1),
  ).rejects.toThrow(/container must be a non-empty string/);

  await expect(
    expectWidthRatio(page, '#narrow', '#container', 0.8, 0.2),
  ).rejects.toThrow(/minimum must be <= maximum/);
});

test('overflow helper passes for non-overflowing roots', async ({ page }) => {
  await expectNoOverflow(page, '#container');
  await expectNoOverflow(page, '#full-container');
});

test('overflow helper reports measured scroll and client widths', async ({ page }) => {
  await expect(expectNoOverflow(page, '#overflow-root')).rejects.toThrow(
    /Horizontal overflow: scrollWidth \d+, clientWidth \d+/,
  );

  await expect(expectNoOverflow(page, '#overflow-root')).rejects.toThrow(
    /scrollWidth 400, clientWidth 300/,
  );
});

test('overflow helper validates arguments and missing roots', async ({ page }) => {
  await expect(expectNoOverflow(page, '')).rejects.toThrow(/rootSelector must be a non-empty string/);
  await expect(expectNoOverflow(page, '#missing-root')).rejects.toThrow(
    /Overflow root missing: #missing-root/,
  );
});

test('native chrome inspection exposes border padding margin and pseudo content', async ({ page }) => {
  const chrome = await inspectNativeChrome(page, '#native');
  expect(chrome.borderTopWidth).toBe('1px');
  expect(chrome.paddingTop).toBe('12px');
  expect(chrome.marginTop).toBe('8px');
  expect(chrome).toHaveProperty('afterContent');
  expect(chrome).toHaveProperty('afterDisplay');
  expect(chrome).toHaveProperty('markerContent');
  expect(chrome).toHaveProperty('markerDisplay');
});

test('native chrome inspection reports missing elements', async ({ page }) => {
  await expect(inspectNativeChrome(page, '#missing-native')).rejects.toThrow(
    /Native chrome element missing: #missing-native/,
  );

  await expect(inspectNativeChrome(page, '')).rejects.toThrow(
    /selector must be a non-empty string/,
  );
});
