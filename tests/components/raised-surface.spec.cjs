const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');
let server;
test.beforeAll(async () => { server = await startStaticServer(path.resolve(__dirname, '../..')); });
test.afterAll(async () => { await server?.close(); });
async function render(page, { entry = 'index.css', attrs = '', content = '', extra = '', appearance = true } = {}) {
  await page.goto(`${server.origin}/foundation.css`);
  await page.setContent(`<html ${attrs}><head><link rel="stylesheet" href="${server.origin}/${entry}">
    ${appearance ? `<link rel="stylesheet" href="${server.origin}/themes/appearance.css">` : ''}
    <style>.probe { background-color: var(--color-surface-raised); transition: none; } ${extra}</style>
    </head><body>${content}</body></html>`, { waitUntil: 'load' });
}
for (const entry of ['index.css', 'dist/ren10.min.css']) {
  test(`${entry}: named raised surface follows explicit and automatic modes`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await render(page, { entry, attrs: 'data-theme="amber-editorial"', content: '<div class="probe" id="card"></div>' });
    await expect(page.locator('#card')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('#card')).toHaveCSS('background-color', 'rgb(24, 23, 22)');
    for (const [mode, color] of [['light','rgb(255, 255, 255)'], ['dark','rgb(24, 23, 22)'], ['auto','rgb(24, 23, 22)']]) {
      await page.evaluate(mode => { document.documentElement.dataset.mode = mode; }, mode);
      await expect(page.locator('#card')).toHaveCSS('background-color', color);
    }
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(page.locator('#card')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });
  test(`${entry}: native color-scheme overrides remain independent of mode attributes`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await render(page, { entry, attrs: 'data-theme="amber-editorial"', content: '<div id="native" class="probe"></div>' });
    await page.evaluate(() => { document.documentElement.style.colorScheme = 'dark'; });
    await expect(page.locator('#native')).toHaveCSS('background-color', 'rgb(24, 23, 22)');
    await page.evaluate(() => { document.documentElement.style.colorScheme = 'light'; });
    await expect(page.locator('#native')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });
  test(`${entry}: nearest nested mode retains its named palette`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await render(page, { entry, attrs: 'data-theme="amber-editorial" data-mode="dark"', content: `
      <div id="root-card" class="probe"></div>
      <section data-mode="light"><div id="light-card" class="probe"></div>
        <section data-theme="ocean"><div id="ocean-light" class="probe"></div>
          <section data-mode="dark"><div id="ocean-dark" class="probe"></div>
            <section data-mode="auto"><div id="auto-card" class="probe"></div></section>
          </section>
        </section>
      </section>` });
    for (const [id,color] of [['root-card','rgb(24, 23, 22)'],['light-card','rgb(255, 255, 255)'],['ocean-light','rgb(255, 255, 255)'],['ocean-dark','rgb(17, 24, 39)'],['auto-card','rgb(255, 255, 255)']]) {
      await expect(page.locator(`#${id}`)).toHaveCSS('background-color', color);
    }
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('#auto-card')).toHaveCSS('background-color', 'rgb(17, 24, 39)');
    await expect(page.locator('#light-card')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });
  test(`${entry}: legacy modes, AAA, consumer and component overrides`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await render(page, { entry, attrs: 'data-theme="amber-editorial" data-mode="dark"', content: `
      <section data-theme="light"><div id="legacy-light" class="probe"></div></section>
      <section data-theme="dark" data-mode="light"><div id="explicit-wins" class="probe"></div></section>
      <section data-contrast="aaa"><div id="aaa" class="probe"></div></section>
      <section data-theme="ocean" class="consumer"><div id="stylesheet" class="probe"></div></section>
      <section data-mode="light" style="--color-surface-raised: rgb(30, 40, 50)"><div id="inline" class="probe"></div></section>
      <article class="ren-card" id="component" style="--ren-card-bg: rgb(60, 70, 80)"></article>`,
      extra: ':where(.consumer) { --color-surface-raised: rgb(10, 20, 30); }' });
    for (const [id,color] of [['legacy-light','rgb(255, 255, 255)'],['explicit-wins','rgb(255, 255, 255)'],['aaa','rgb(0, 0, 0)'],['stylesheet','rgb(10, 20, 30)'],['inline','rgb(30, 40, 50)'],['component','rgb(60, 70, 80)']]) {
      await expect(page.locator(`#${id}`)).toHaveCSS('background-color', color);
    }
  });
}
test('generated themes preserve raised surfaces on nested explicit modes', async ({ page }) => {
  const { generateTheme } = await import(pathToFileURL(path.resolve(__dirname, '../../themes/theme-generator.js')).href);
  const theme = generateTheme('#F59E0B', { name: 'raised-contract', warmth: 1 });
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await render(page, { attrs: `data-theme="${theme.name}" data-mode="dark"`, extra: theme.css,
    content: '<div class="probe" id="generated-dark"></div><section data-mode="light"><div class="probe" id="generated-light"></div></section>' });
  const normalized = await page.evaluate(({ light, dark }) => {
    const el = document.createElement('div'); document.body.append(el);
    el.style.color = light; const l = getComputedStyle(el).color;
    el.style.color = dark; const d = getComputedStyle(el).color; el.remove(); return { l, d };
  }, { light: theme.light['--color-surface-raised'], dark: theme.dark['--color-surface-raised'] });
  await expect(page.locator('#generated-dark')).toHaveCSS('background-color', normalized.d);
  await expect(page.locator('#generated-light')).toHaveCSS('background-color', normalized.l);
});
test('raised surface retains typed initial fallback, inheritance and interpolation', async ({ page }) => {
  await page.goto(`${server.origin}/foundation.css`);
  await page.setContent(`<html><head><link rel="stylesheet" href="${server.origin}/tokens/registered-properties.css">
    <style>.probe { background: var(--color-surface-raised); }</style></head><body>
    <div class="probe" id="initial"></div><div class="probe" id="invalid" style="--color-surface-raised: 12px"></div>
    <section style="--color-surface-raised: rgb(20, 30, 40)"><div class="probe" id="inherited"></div></section>
    <div class="probe" id="animated"></div></body></html>`, { waitUntil: 'load' });
  await expect(page.locator('#initial')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('#invalid')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('#inherited')).toHaveCSS('background-color', 'rgb(20, 30, 40)');
  const halfway = await page.locator('#animated').evaluate(async el => {
    const animation = el.animate([{ '--color-surface-raised': 'rgb(0, 0, 0)' }, { '--color-surface-raised': 'rgb(200, 100, 50)' }], { duration: 1000, fill: 'both' });
    animation.pause(); await animation.ready; animation.currentTime = 500;
    return getComputedStyle(el).backgroundColor;
  });
  expect(halfway).toBe('rgb(100, 50, 25)');
});

test('mode changes interpolate the registered raised-surface token', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
  await render(page, { attrs: 'data-theme="amber-editorial" data-mode="light"',
    extra: ':root { transition: --color-surface-raised 1000ms linear; }',
    content: '<div class="probe" id="mode-animation"></div>' });
  const result = await page.evaluate(async () => {
    const root = document.documentElement;
    getComputedStyle(root).getPropertyValue('--color-surface-raised');
    root.dataset.mode = 'dark';
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const transition = root.getAnimations().find(animation => animation.transitionProperty === '--color-surface-raised');
    if (!transition) return { transition: false };
    transition.pause(); await transition.ready; transition.currentTime = 500;
    return { transition: true, color: getComputedStyle(root).getPropertyValue('--color-surface-raised') };
  });
  expect(result.transition).toBe(true);
  expect(result.color).not.toBe('rgb(255, 255, 255)');
  expect(result.color).not.toBe('rgb(24, 23, 22)');
  const channels = result.color.match(/\d+(?:\.\d+)?/g).map(Number);
  expect(channels).toHaveLength(3);
  expect(channels.every(channel => channel > 24 && channel < 255)).toBe(true);
});
