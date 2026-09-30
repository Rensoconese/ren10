const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(path.resolve(__dirname, '../..')); });
test.afterAll(async () => { await server?.close(); });

async function render(page, { theme = '', attributes = '', content = '', extra = '' } = {}) {
  await page.goto(`${server.origin}/foundation.css`);
  await page.setContent(`<!doctype html><html ${attributes}><head>
    <link rel="stylesheet" href="${server.origin}/index.css">
    <style>${theme}\n${extra}</style>
    </head><body>${content}</body></html>`, { waitUntil: 'load' });
}

test('reference choices reach body, card, heading and button computed styles', async ({ page }) => {
  const { generateThemeFromReference } = await import(pathToFileURL(path.resolve(__dirname, '../../themes/reference-theme.js')).href);
  const theme = generateThemeFromReference({
    schemaVersion: 1,
    name: 'contract-reference',
    source: { kind: 'description', label: 'Token mapping regression' },
    mode: 'light',
    colors: { accent: '#0063d1', background: '#f0f0f0', surface: '#ffffff' },
    typography: { fontSans: 'Arial, sans-serif', fontDisplay: 'Georgia, serif' },
    motion: 'quiet',
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await render(page, {
    theme: theme.css,
    attributes: `data-theme="${theme.name}"`,
    content: '<h1>Reference heading</h1><article class="ren-card">Raised surface</article><button class="ren-btn">Action</button>',
  });
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(240, 240, 240)');
  await expect(page.locator('.ren-card')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(page.locator('h1')).toHaveCSS('font-family', 'Georgia, serif');
  await expect.poll(() => page.locator('.ren-btn').evaluate((element) =>
    getComputedStyle(element).transitionDuration.split(',')[0].trim())).toBe('0.12s');
});

test('ordinary rem spacing and radius values scale with root font size', async ({ page }) => {
  const rems = { '--space-1': 0.25, '--space-2': 0.5, '--space-4': 1, '--radius-sm': 0.25, '--radius-md': 0.5, '--radius-lg': 0.75 };
  await render(page, {
    extra: ':root { font-size: 20px; }',
    content: Object.keys(rems).map((name, index) =>
      `<div id="length-${index}" style="width: var(${name}); height: 1px"></div>`).join(''),
  });
  for (const [index, rem] of Object.values(rems).entries()) {
    await expect(page.locator(`#length-${index}`)).toHaveCSS('width', `${rem * 20}px`);
  }
  await page.addStyleTag({ content: ':root { font-size: 24px; }' });
  for (const [index, rem] of Object.values(rems).entries()) {
    await expect(page.locator(`#length-${index}`)).toHaveCSS('width', `${rem * 24}px`);
  }
});

test('reference motion durations collapse when the reduced-motion preference changes', async ({ page }) => {
  const { generateThemeFromReference } = await import(pathToFileURL(path.resolve(__dirname, '../../themes/reference-theme.js')).href);
  const theme = generateThemeFromReference({
    schemaVersion: 1,
    name: 'motion-reference',
    source: { kind: 'description', label: 'Reduced-motion regression' },
    mode: 'light',
    colors: { accent: '#0063d1' },
    motion: 'expressive',
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await render(page, {
    theme: theme.css,
    attributes: `data-theme="${theme.name}"`,
    content: '<details><summary>Motion marker</summary><p>Details content</p></details><div id="fast"></div><div id="slow"></div>',
    extra: '#fast { transition-duration: var(--duration-fast); } #slow { transition-duration: var(--duration-slow); }',
  });
  const markerDuration = () => page.locator('summary').evaluate((element) => getComputedStyle(element, '::after').transitionDuration);
  await expect.poll(markerDuration).toBe('0.28s');
  await expect(page.locator('#fast')).toHaveCSS('transition-duration', '0.16s');
  await expect(page.locator('#slow')).toHaveCSS('transition-duration', '0.48s');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(markerDuration).toBe('0s');
  await expect(page.locator('#fast')).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('#slow')).toHaveCSS('transition-duration', '0s');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(markerDuration).toBe('0.28s');
});

test('root semantic themes and scoped component overrides honor the documented alias boundary', async ({ page }) => {
  await render(page, {
    theme: ':root { --color-accent: rgb(0, 50, 100); }',
    content: `<button id="root-action" class="ren-btn">Root theme</button>
      <section style="--color-accent: rgb(200, 0, 0)">
        <button id="semantic-action" class="ren-btn">Inherited alias</button>
      </section>
      <section style="--ren-btn-bg: rgb(0, 100, 0)">
        <button id="component-action" class="ren-btn">Scoped component</button>
      </section>`,
    extra: '.ren-btn { transition: none; }',
  });
  await expect(page.locator('#root-action')).toHaveCSS('background-color', 'rgb(0, 50, 100)');
  await expect(page.locator('#semantic-action')).toHaveCSS('background-color', 'rgb(0, 50, 100)');
  await expect(page.locator('#component-action')).toHaveCSS('background-color', 'rgb(0, 100, 0)');
});
