// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const FIXTURE_URL =
  'file://' + path.resolve(__dirname, 'fixtures/component-token-overrides.html');
const CASCADE_FIXTURE_URL =
  'file://' + path.resolve(__dirname, 'fixtures/cascade-contract.html');
const PROGRESSIVE_FIXTURE_URL =
  'file://' + path.resolve(__dirname, 'fixtures/theme-progressive-contract.html');
const ACCORDION_BLOCK_URL =
  'file://' + path.resolve(__dirname, '../../templates/blocks/faq-centered-accordion.html');

test.describe('Primitive Appearance API contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE_URL);
  });

  test('root overrides affect representative primitive computed styles', async ({ page }) => {
    await expect.poll(() => page.locator('#root-button').evaluate((element) =>
      getComputedStyle(element).borderRadius)).toBe('17px');
    await expect.poll(() => page.locator('#root-card').evaluate((element) =>
      getComputedStyle(element).backgroundColor)).toBe('rgb(1, 2, 3)');
    await expect.poll(() => page.locator('#root-field').evaluate((element) =>
      getComputedStyle(element).borderTopColor)).toBe('rgb(12, 34, 56)');
    await expect.poll(() => page.locator('#root-badge').evaluate((element) =>
      getComputedStyle(element).borderRadius)).toBe('7px');
    await expect.poll(() => page.locator('#root-switch').evaluate((element) =>
      getComputedStyle(element).width)).toBe('60px');
  });

  test('closer scope overrides win over root overrides', async ({ page }) => {
    await expect.poll(() => page.locator('#scoped-button').evaluate((element) =>
      getComputedStyle(element).borderRadius)).toBe('23px');
    await expect.poll(() => page.locator('#scoped-card').evaluate((element) =>
      getComputedStyle(element).backgroundColor)).toBe('rgb(4, 5, 6)');
    await expect.poll(() => page.locator('#scoped-field').evaluate((element) =>
      getComputedStyle(element).borderTopColor)).toBe('rgb(65, 43, 21)');
    await expect.poll(() => page.locator('#scoped-badge').evaluate((element) =>
      getComputedStyle(element).borderRadius)).toBe('11px');
    await expect.poll(() => page.locator('#scoped-switch').evaluate((element) =>
      getComputedStyle(element).width)).toBe('70px');
  });

  test('theme component overrides survive a later component-token import', async ({ page }) => {
    await expect.poll(() => page.locator('#root-card').evaluate((element) =>
      getComputedStyle(element).borderRadius)).toBe('18px');
    await expect.poll(() => page.locator('#root-button').evaluate((element) =>
      getComputedStyle(element).fontWeight)).toBe('600');
  });

  test('representative composite and pattern tokens control geometry, color, and motion surfaces', async ({ page }) => {
    await expect.poll(() => page.locator('#scoped-dialog').evaluate((element) => getComputedStyle(element).width)).toBe('321px');
    await expect.poll(() => page.locator('#scoped-dialog').evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(7, 8, 9)');
    await expect.poll(() => page.locator('#scoped-tooltip').evaluate((element) => getComputedStyle(element).transitionDuration)).not.toBe('');
    await expect.poll(() => page.locator('#scoped-popover').evaluate((element) => getComputedStyle(element).width)).toBe('333px');
    await expect.poll(() => page.locator('#scoped-tabs').evaluate((element) => getComputedStyle(element).height)).toBe('42px');
    await expect.poll(() => page.locator('#scoped-calendar').evaluate((element) => getComputedStyle(element).width)).toBe('351px');
    await expect.poll(() => page.locator('#scoped-menu').evaluate((element) => getComputedStyle(element).minWidth)).toBe('361px');
    await expect.poll(() => page.locator('#scoped-sidebar').evaluate((element) => getComputedStyle(element).width)).toBe('271px');
    await expect.poll(() => page.locator('#scoped-table tr').evaluate((element) => getComputedStyle(element).height)).toBe('49px');
    await expect.poll(() => page.locator('#scoped-nav').evaluate((element) => getComputedStyle(element).height)).toBe('61px');
    await expect.poll(() => page.locator('#scoped-command').evaluate((element) => getComputedStyle(element).width)).toBe('371px');
  });

  test('toast duration honors an individual toast scoped token', async ({ page }) => {
    const source = fs.readFileSync(path.resolve(__dirname, '../../components/composites/ren-toast/ren-toast.js'), 'utf8');
    expect(source).toContain('getComputedStyle(toast)');
    expect(source).not.toContain('getComputedStyle(viewport)');
  });
});

test.describe('Theme progressive enhancement contract', () => {
  test('server-rendered custom-element content remains visible before upgrade', async ({ page }) => {
    await page.goto(PROGRESSIVE_FIXTURE_URL);
    for (const id of ['field', 'accordion', 'nav', 'form', 'tooltip']) {
      await expect.poll(() => page.locator(`#${id}`).evaluate((el) => ({
        opacity: Number.parseFloat(getComputedStyle(el).opacity),
        text: el.textContent.trim()
      }))).toMatchObject({ opacity: expect.any(Number) });
      const state = await page.locator(`#${id}`).evaluate((el) => ({ opacity: Number.parseFloat(getComputedStyle(el).opacity), text: el.textContent.trim() }));
      expect(state.opacity).toBeGreaterThan(0);
      expect(state.text.length).toBeGreaterThan(0);
    }
  });

  for (const colorScheme of ['light', 'dark']) {
    test(`AAA scope computes at least 7:1 in ${colorScheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(PROGRESSIVE_FIXTURE_URL);
      const ratio = await page.evaluate(() => {
        const rgb = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number).map((v) => v / 255);
        const lum = (value) => rgb(value).map((v) => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
        const text = getComputedStyle(document.querySelector('#aaa-text'));
        const accent = getComputedStyle(document.querySelector('#aaa-accent'));
        const contrast = (fg, bg) => { const a = lum(fg); const b = lum(bg); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
        return { text: contrast(text.color, text.backgroundColor), accent: contrast(accent.color, accent.backgroundColor) };
      });
      expect(ratio.text).toBeGreaterThanOrEqual(7);
      expect(ratio.accent).toBeGreaterThanOrEqual(7);
    });
  }
});

test.describe('Accordion disclosure visibility contract', () => {
  test('closed items keep their summaries visible after enhancement', async ({ page }) => {
    await page.goto(ACCORDION_BLOCK_URL);
    const summaries = page.locator('ren-accordion > details > summary');
    await expect(summaries).toHaveCount(4);

    for (const summary of await summaries.all()) {
      await expect(summary).toBeVisible();
    }

    await summaries.nth(1).click();
    await expect(page.locator('ren-accordion > details').nth(0)).not.toHaveAttribute('open', '');
    await expect(page.locator('ren-accordion > details').nth(1)).toHaveAttribute('open', '');
  });
});

test.describe('Cascade and semantic token contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CASCADE_FIXTURE_URL);
  });

  test('surfaces are opaque and tooltip exposes semantic public bridge', async ({ page }) => {
    for (const id of ['tooltip', 'nav', 'sidebar', 'command']) {
      await expect.poll(() => page.locator(`#${id}`).evaluate((el) => getComputedStyle(el).backgroundColor)).not.toMatch(/transparent|rgba\(0, 0, 0, 0\)/);
    }
    await expect.poll(() => page.locator('#tooltip').evaluate((el) => getComputedStyle(el).color)).not.toBe('');
  });

  test('unlayered application CSS overrides every RenDS layer without important', async ({ page }) => {
    await expect.poll(() => page.locator('#app-override').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(1, 2, 3)');
    await expect.poll(() => page.locator('#app-override').evaluate((el) => getComputedStyle(el).color)).toBe('rgb(4, 5, 6)');
  });

  test('utilities are top-level and visually hidden utility is effective', async ({ page }) => {
    const result = await page.locator('#visually-hidden').evaluate((el) => ({
      width: getComputedStyle(el).width,
      clipPath: getComputedStyle(el).clipPath
    }));
    expect(result.width).toBe('1px');
    expect(result.clipPath).toContain('50%');
    const source = fs.readFileSync(path.resolve(__dirname, '../../index.css'), 'utf8');
    expect(source).toContain('@layer reset, tokens, base, components, utilities;');
    expect(source).toContain("@import './components/index.css';");
  });
});
