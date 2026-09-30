const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(path.resolve(__dirname, '../..')); });
test.afterAll(async () => { await server?.close(); });

async function mount(page, component, markup) {
  await page.goto(`${server.origin}/tests/components/fixtures/runtime-smoke.html`);
  await page.locator('#host').evaluate((host, html) => { host.innerHTML = html; }, markup);
  await page.evaluate((name) => import(`/components/composites/${name}/${name}.js`), component);
}

function tabsMarkup(activation, disabled) {
  return `<ren-tabs activation="${activation}">
    <div role="tablist" class="ren-tab-list">
      <button type="button" role="tab" class="ren-tab" id="tab-a">A</button>
      <button type="button" role="tab" class="ren-tab" id="tab-b" ${disabled}>B</button>
      <button type="button" role="tab" class="ren-tab" id="tab-c">C</button>
    </div>
    <div role="tabpanel" class="ren-tab-panel" id="panel-a">Panel A</div>
    <div role="tabpanel" class="ren-tab-panel" id="panel-b">Panel B</div>
    <div role="tabpanel" class="ren-tab-panel" id="panel-c">Panel C</div>
  </ren-tabs>`;
}
const comboMarkup = `<ren-combobox name="choice">
  <div class="ren-combobox-item" data-value="blocked-first" aria-disabled="true">Blocked first</div>
  <div class="ren-combobox-item" data-value="a" aria-disabled="false">A</div>
  <div class="ren-combobox-item" data-value="blocked-middle" aria-disabled="true">Blocked middle</div>
  <div class="ren-combobox-item" data-value="c">C</div>
  <div class="ren-combobox-item" data-value="blocked-last" aria-disabled="true">Blocked last</div>
</ren-combobox>`;
const numberMarkup = '<ren-number-field aria-label="Quantity" min="0" max="10" value="2"></ren-number-field>';

for (const activation of ['manual', 'automatic']) {
  for (const disabled of ['disabled', 'aria-disabled="true"']) {
    test(`tabs ${activation} select the matching panel after skipping ${disabled}`, async ({ page }) => {
      await mount(page, 'ren-tabs', tabsMarkup(activation, disabled));
      await page.locator('#tab-a').focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#tab-c')).toBeFocused();
      if (activation === 'manual') {
        await expect(page.locator('#tab-a')).toHaveAttribute('aria-selected', 'true');
        await page.keyboard.press('Enter');
      }
      await expect(page.locator('#tab-c')).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#panel-c')).toBeVisible();
      await expect(page.locator('#panel-b')).toBeHidden();
      await expect(page.locator('ren-tabs')).toHaveJSProperty('selectedIndex', 2);
    });
  }
}
for (const disabled of ['disabled', 'aria-disabled="true"']) {
  test(`tabs fall back when the requested initial tab is ${disabled}`, async ({ page }) => {
    const markup = tabsMarkup('manual', disabled).replace('<ren-tabs ', '<ren-tabs default-value="tab-b" ');
    await mount(page, 'ren-tabs', markup);
    await expect(page.locator('ren-tabs')).toHaveJSProperty('selectedIndex', 0);
    await expect(page.locator('#panel-a')).toBeVisible();
    await expect(page.locator('#panel-b')).toBeHidden();
    await expect(page.locator('#panel-c')).toBeHidden();
  });
  test(`tabs with all tabs ${disabled} keep every panel hidden`, async ({ page }) => {
    const markup = tabsMarkup('manual', '').replaceAll('type="button"', `type="button" ${disabled}`);
    await mount(page, 'ren-tabs', markup);
    await expect(page.locator('ren-tabs')).toHaveJSProperty('selectedIndex', -1);
    for (const id of ['a', 'b', 'c']) {
      await expect(page.locator(`#tab-${id}`)).toHaveAttribute('aria-selected', 'false');
      await expect(page.locator(`#tab-${id}`)).toHaveAttribute('data-state', 'inactive');
      await expect(page.locator(`#panel-${id}`)).toBeHidden();
    }
  });
}
test('tabs reject disabled clicks and public selection', async ({ page }) => {
  await mount(page, 'ren-tabs', tabsMarkup('manual', 'aria-disabled="true"'));
  await page.locator('#tab-b').dispatchEvent('click');
  await page.locator('ren-tabs').evaluate((tabs) => { tabs.selectTabByIndex(1); tabs.selectTabById('tab-b'); });
  await expect(page.locator('#tab-a')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#panel-a')).toBeVisible();
});

test('combobox keyboard skips disabled options and selects the active enabled option', async ({ page }) => {
  await mount(page, 'ren-combobox', comboMarkup);
  const input = page.getByRole('combobox');
  const a = page.locator('.ren-combobox-item[data-value="a"]');
  const c = page.locator('.ren-combobox-item[data-value="c"]');
  await input.focus();
  await page.keyboard.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', await a.getAttribute('id'));
  await page.keyboard.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', await c.getAttribute('id'));
  await page.keyboard.press('ArrowUp');
  await expect(input).toHaveAttribute('aria-activedescendant', await a.getAttribute('id'));
  await page.keyboard.press('End');
  await expect(input).toHaveAttribute('aria-activedescendant', await c.getAttribute('id'));
  await page.keyboard.press('Home');
  await expect(input).toHaveAttribute('aria-activedescendant', await a.getAttribute('id'));
  await page.keyboard.press('Enter');
  await expect(page.locator('input[type="hidden"]')).toHaveValue('a');
  await expect(a).toHaveAttribute('aria-selected', 'true');
});
test('combobox clicks accept aria-disabled=false and reject true', async ({ page }) => {
  await mount(page, 'ren-combobox', comboMarkup);
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Blocked first', exact: true }).dispatchEvent('click');
  await expect(page.locator('input[type="hidden"]')).toHaveValue('');
  await page.getByRole('option', { name: 'A', exact: true }).click();
  await expect(page.locator('input[type="hidden"]')).toHaveValue('a');
});
test('combobox cannot activate an all-disabled list', async ({ page }) => {
  await mount(page, 'ren-combobox', '<ren-combobox><div class="ren-combobox-item" data-value="blocked" aria-disabled="true">Blocked</div></ren-combobox>');
  await page.getByRole('combobox').focus();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page.locator('input[type="hidden"]')).toHaveValue('');
  await expect(page.getByRole('combobox')).not.toHaveAttribute('aria-activedescendant');
});

for (const key of ['Enter', 'Space']) {
  test(`number field native buttons respond to ${key} once`, async ({ page }) => {
    await mount(page, 'ren-number-field', numberMarkup);
    const input = page.getByRole('spinbutton');
    await page.getByRole('button', { name: 'Increase' }).focus();
    await page.keyboard.press(key);
    await expect(input).toHaveValue('3');
    await page.getByRole('button', { name: 'Decrease' }).focus();
    await page.keyboard.press(key);
    await expect(input).toHaveValue('2');
  });
}
test('number field supports programmatic activation and does not double count pointer clicks', async ({ page }) => {
  await mount(page, 'ren-number-field', numberMarkup);
  const increase = page.getByRole('button', { name: 'Increase' });
  const input = page.getByRole('spinbutton');
  await increase.evaluate((button) => button.click());
  await expect(input).toHaveValue('3');
  await increase.click();
  await expect(input).toHaveValue('4');
  await page.getByRole('button', { name: 'Decrease' }).click();
  await expect(input).toHaveValue('3');
});
test('number field long press stops on release with no extra click increment', async ({ page }) => {
  await page.clock.install();
  await mount(page, 'ren-number-field', numberMarkup);
  const button = page.getByRole('button', { name: 'Increase' });
  const box = await button.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.clock.runFor(700);
  const held = await page.getByRole('spinbutton').inputValue();
  expect(Number(held)).toBeGreaterThan(3);
  await page.mouse.up();
  await expect(page.getByRole('spinbutton')).toHaveValue(held);
  await page.clock.runFor(500);
  await expect(page.getByRole('spinbutton')).toHaveValue(held);
});
test('number field disabled controls ignore programmatic activation', async ({ page }) => {
  await mount(page, 'ren-number-field', numberMarkup.replace('aria-label', 'disabled aria-label'));
  await page.getByRole('button', { name: 'Increase' }).evaluate((button) => button.click());
  await expect(page.getByRole('spinbutton')).toHaveValue('2');
});

test.describe('number field touch activation', () => {
  test.use({ hasTouch: true });
  test('one tap increments exactly once', async ({ page }) => {
    await mount(page, 'ren-number-field', numberMarkup);
    await page.getByRole('button', { name: 'Increase' }).tap();
    await expect(page.getByRole('spinbutton')).toHaveValue('3');
  });
});
