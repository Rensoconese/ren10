// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(path.resolve(__dirname, '../..')); });
test.afterAll(async () => { await server?.close(); });

for (const locale of ['en-US', 'es-AR']) {
  test(`date picker FormData stays ISO through initial, API, and calendar values (${locale})`, async ({ page }) => {
    await page.goto(`${server.origin}/docs/components/ren-date-picker.html`);
    await page.evaluate(({ locale }) => {
      document.body.innerHTML = `<form id="dates"><ren-date-picker name="day" value="2026-09-30" locale="${locale}"></ren-date-picker></form>`;
    }, { locale });
    const value = () => page.locator('#dates').evaluate((form) => new FormData(form).get('day'));
    expect(await value()).toBe('2026-09-30');
    await page.locator('ren-date-picker').evaluate((picker) => picker.setValue('2026-10-01'));
    expect(await value()).toBe('2026-10-01');
    await page.locator('ren-date-picker').evaluate((picker) => picker.calendar.dispatchEvent(new CustomEvent('ren-date-select', {
      detail: { date: new Date(2026, 10, 2) }, bubbles: true,
    })));
    expect(await value()).toBe('2026-11-02');
    const label = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(2026, 10, 2));
    await expect(page.locator('.ren-date-picker-value')).toHaveText(label);
  });
}

test('form persistence round-trips radios and zero, one, and multiple checkboxes', async ({ page }) => {
  await page.goto(`${server.origin}/docs/components/ren-date-picker.html`);
  await page.evaluate(async () => {
    await import('/components/patterns/ren-form/ren-form.js');
    window.formMarkup = `<ren-form data-persist="ren10-audit-form"><form class="ren-form">
      <input type="radio" name="plan" value="a"><input type="radio" name="plan" value="b" checked>
      <input type="checkbox" name="extras" value="a" checked><input type="checkbox" name="extras" value="b">
    </form></ren-form>`;
    localStorage.removeItem('ren10-audit-form');
    document.body.innerHTML = window.formMarkup;
  });
  await expect(page.locator('[name="plan"][value="b"]')).toBeChecked();
  for (const extras of [[], ['b'], ['a', 'b']]) {
    const result = await page.evaluate((extras) => {
      const host = document.querySelector('ren-form');
      host.querySelector('[name="plan"][value="a"]').checked = true;
      host.querySelectorAll('[name="extras"]').forEach((input) => { input.checked = extras.includes(input.value); });
      host._persist();
      document.body.innerHTML = window.formMarkup;
      return [...new FormData(document.querySelector('form')).entries()];
    }, extras);
    expect(result).toEqual([['plan', 'a'], ...extras.map((value) => ['extras', value])]);
  }
});

test('date range serializes a complete ISO interval and clears incomplete selection', async ({ page }) => {
  await page.goto(`${server.origin}/docs/components/ren-date-picker.html`);
  await page.evaluate(() => {
    document.body.innerHTML = '<form><ren-date-picker name="trip" mode="range" locale="es-AR"></ren-date-picker></form>';
    document.querySelector('ren-date-picker').setValue({ start: '2026-09-30', end: '2026-10-02' });
  });
  expect(await page.locator('form').evaluate((form) => new FormData(form).get('trip'))).toBe('2026-09-30/2026-10-02');
  await page.locator('ren-date-picker').evaluate((picker) => picker.calendar.dispatchEvent(new CustomEvent('ren-date-select', {
    detail: { range: { start: new Date(2026, 9, 3), end: null } }, bubbles: true,
  })));
  expect(await page.locator('form').evaluate((form) => new FormData(form).get('trip'))).toBe('');
});

for (const component of ['ren-date-picker', 'ren-date-range-picker']) {
  test(`${component} Escape from a calendar day closes and restores trigger focus`, async ({ page }) => {
    await page.goto(`${server.origin}/docs/components/${component}.html`);
    await page.evaluate((component) => {
      document.body.innerHTML = `<${component} name="dates" start="2026-09-30" end="2026-10-02"></${component}>`;
      document.querySelector(component).open();
    }, component);
    const day = page.locator(`${component} .ren-calendar-day:not([disabled])`).first();
    await day.focus();
    if (component === 'ren-date-range-picker') {
      await page.locator(component).evaluate((picker) => {
        picker.draftStart = new Date(2026, 10, 1);
        picker.draftEnd = new Date(2026, 10, 2);
      });
    }
    await day.press('Escape');
    const trigger = page.locator(`${component} > button`).first();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(await page.locator(component).evaluate((picker) => picker.isOpen)).toBe(false);
    if (component === 'ren-date-range-picker') {
      expect(await page.locator(component).evaluate((picker) => [picker.dateToString(picker.draftStart), picker.dateToString(picker.draftEnd)])).toEqual(['2026-09-30', '2026-10-02']);
    }
  });
}
