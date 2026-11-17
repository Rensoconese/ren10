// @ts-check
/**
 * `<input type="hidden">` stays hidden under the base stylesheet.
 *
 * The classless rule for text fields sets `display: block`, and its selector
 * excluded the control types that are not text fields without excluding
 * `hidden`. Chromium protects a hidden input from author `display`; WebKit
 * does not, so there the input became a box that takes focus: a Tab stop with
 * no size, one for every hidden field on the page. ren-select puts one inside
 * itself, which is how it showed up: Tab from the open list landed on it.
 *
 * Checked through the outcome each engine can show: the input is not
 * displayed, script cannot focus it, and Tab goes past it.
 */
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');
const { ROOT, FIXTURE, mountRegistry } = require('../utils/mount-registry.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

test('a hidden input in a plain form is not displayed and takes no focus', async ({ page }) => {
  await page.goto(`${server.origin}${FIXTURE}`);
  await page.evaluate(() => {
    document.getElementById('host').innerHTML = `
      <form>
        <input type="text" id="name" aria-label="Name">
        <input type="hidden" id="token" name="token" value="abc">
        <button type="submit" id="send">Send</button>
      </form>`;
  });
  const token = page.locator('#token');

  expect(await token.evaluate((el) => getComputedStyle(el).display), 'the base stylesheet leaves it undisplayed').toBe('none');
  expect(await token.evaluate((el) => { el.focus(); return document.activeElement === el; }), 'script cannot focus it').toBe(false);

  await page.locator('#name').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#send'), 'Tab goes from the field to the button, past the hidden input').toBeFocused();
});

test('ren-select keeps its form input out of the Tab order', { tag: ['@ren-select', '@keyboard'] }, async ({ page }) => {
  const errors = await mountRegistry(page, server.origin, 'select', (usage) => `${usage}\n<button type="button" id="after-select">After</button>`);
  const carrier = page.locator('ren-select input[type="hidden"]');
  await expect(carrier, 'the select carries its value in a hidden input').toHaveCount(1);
  expect(await carrier.evaluate((el) => getComputedStyle(el).display)).toBe('none');

  await page.locator('ren-select [data-select-trigger]').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#after-select'), 'Tab leaves the closed select for the next control').toBeFocused();
  expect(errors).toEqual([]);
});
