const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { startStaticServer } = require('../utils/static-server.cjs');
const root = path.resolve(__dirname, '../..');
// The source entrypoint imports 85 files; slower engines need time to load
// them before the bounded computed-style assertions begin.
test.setTimeout(60_000);
let server, copied, temporary;
test.beforeAll(async () => {
  temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'ren10-audit-cli-'));
  for (const args of [['init'], ['add', 'button', 'card']]) {
    execFileSync(process.execPath, [path.join(root, 'cli/index.js'), ...args], { cwd: temporary });
  }
  server = await startStaticServer(root);
  copied = await startStaticServer(temporary);
});
test.afterAll(async () => {
  await server?.close(); await copied?.close();
  fs.rmSync(temporary, { recursive: true, force: true });
});
async function fixture(page, markup, origin = server.origin, entry = '/index.css') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(origin + entry);
  await page.setContent(`<!doctype html><html><head><link rel="stylesheet" href="${origin}${entry}"><link rel="stylesheet" href="${origin}/themes/appearance.css"></head><body>${markup}</body></html>`);
  // setContent waits for load, including the stylesheet import tree. Avoid
  // waiting for unrelated network-idle events in Firefox.
}
test('CLI tokens honor the same layered consumer override as the package', async ({ page }) => {
  for (const [origin, entry] of [[server.origin, '/index.css'], [copied.origin, '/rends/index.css']]) {
    await fixture(page, '<style>@layer utilities { :root { --color-accent: rgb(255, 0, 0); } }</style><button class="ren-btn">Action</button>', origin, entry);
    await expect(page.locator('button')).toHaveCSS('background-color', 'rgb(255, 0, 0)');
  }
});
test('AAA follows the effective mode independently of system and preset', async ({ page }) => {
  await fixture(page, '<p>Readable text</p>');
  for (const system of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: system, reducedMotion: 'reduce' });
    for (const mode of ['light', 'dark']) {
      await page.evaluate(mode => {
        Object.assign(document.documentElement.dataset, { theme: 'forest', mode, contrast: 'aaa' });
      }, mode);
      await expect(page.locator('body')).toHaveCSS('background-color', mode === 'dark' ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)');
      await expect(page.locator('p')).toHaveCSS('color', mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(17, 17, 17)');
    }
  }
});
test('named subtree themes recolor links and focus without resetting the mode', async ({ page }) => {
  await fixture(page, '<section data-theme="forest"><button class="ren-btn">Action</button><a class="ren-link" href="#">Read</a></section>');
  await page.evaluate(() => { document.documentElement.dataset.mode = 'dark'; });
  const colors = await page.locator('section').evaluate(el => {
    const style = getComputedStyle(el);
    return { focus: style.getPropertyValue('--color-focus-ring').trim(), accent: style.getPropertyValue('--color-accent').trim(), link: getComputedStyle(el.querySelector('a')).color, hover: style.getPropertyValue('--color-accent-hover').trim(), scheme: style.colorScheme };
  });
  expect(colors.focus).toBe(colors.accent);
  expect(colors.link).toBe(colors.hover);
  expect(colors.scheme).toBe('dark');
});
test('explicit mode overrides the legacy theme mode on the same scope', async ({ page }) => {
  await fixture(page, '<p>Mode</p>');
  for (const [theme, mode] of [['light', 'dark'], ['dark', 'light']]) {
    await page.evaluate(([theme, mode]) => Object.assign(document.documentElement.dataset, { theme, mode }), [theme, mode]);
    await expect(page.locator('html')).toHaveCSS('color-scheme', mode);
  }
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  await page.evaluate(() => Object.assign(document.documentElement.dataset, { theme: 'dark', mode: 'auto' }));
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'light dark');
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
});
test('loading button stops its spinner when reduced motion is requested', async ({ page }) => {
  await fixture(page, '<button class="ren-btn" data-loading aria-busy="true">Save</button>');
  expect(await page.locator('button').evaluate(el => getComputedStyle(el, '::after').animationName)).toBe('none');
});
test('density affects stacks and cards in a subtree, leaving its siblings alone', async ({ page }) => {
  await fixture(page, '<section id="scope"><div class="ren-stack"><p>A</p><p>B</p></div><article class="ren-card"><div class="ren-card-body">Card</div></article></section><div id="outside" class="ren-stack"><p>A</p><p>B</p></div>');
  for (const [density, gap, padding] of [['compact', '8px', '12px'], ['comfortable', '12px', '16px'], ['spacious', '16px', '32px']]) {
    await page.locator('#scope').evaluate((el, density) => { el.dataset.density = density; }, density);
    await expect(page.locator('#scope .ren-stack')).toHaveCSS('gap', gap);
    await expect(page.locator('.ren-card-body')).toHaveCSS('padding-top', padding);
    await expect(page.locator('#outside')).toHaveCSS('gap', '12px');
  }
});
test('button host ARIA updates the real control and restores the child label', async ({ page }) => {
  await fixture(page, '<ren-button icon aria-label="Close"><button aria-label="Original">✕</button></ren-button>');
  await page.evaluate(async () => { await import('/components/primitives/ren-button/ren-button.js'); });
  const button = page.locator('ren-button button');
  await expect(button).toHaveAccessibleName('Close');
  await page.locator('ren-button').evaluate(el => el.setAttribute('aria-label', 'Dismiss'));
  await expect(button).toHaveAccessibleName('Dismiss');
  await page.locator('ren-button').evaluate(el => el.removeAttribute('aria-label'));
  await expect(button).toHaveAccessibleName('Original');
});
test('carousel dots preserve their token API inside a 44px hit area', async ({ page }) => {
  await fixture(page, '<button class="ren-carousel-dot" aria-label="Slide 1" style="--ren-carousel-dot-size: var(--space-3)"></button>');
  await expect(page.locator('button')).toHaveCSS('width', '44px');
  await expect(page.locator('button')).toHaveCSS('height', '44px');
  const dot = await page.locator('button').evaluate(el => {
    const reference = document.createElement('span');
    reference.style.backgroundColor = 'var(--color-border-interactive)';
    el.append(reference);
    return { width: getComputedStyle(el, '::before').width, background: getComputedStyle(el, '::before').backgroundColor, expected: getComputedStyle(reference).backgroundColor };
  });
  expect(dot.width).toBe('12px');
  expect(dot.background).toBe(dot.expected);
});
test('alert-dialog honors the width token with the full component entrypoint', async ({ page }) => {
  await fixture(page, '<dialog open class="ren-alert-dialog" style="--ren-dialog-width: var(--width-sm)">Confirm</dialog>');
  const width = await page.locator('dialog').evaluate(el => {
    const reference = document.createElement('div');
    reference.style.width = 'var(--width-sm)';
    document.body.append(reference);
    return { actual: getComputedStyle(el).width, expected: getComputedStyle(reference).width };
  });
  expect(width.actual).toBe(width.expected);
});


test('form rhythm changes with scoped density without changing fixed stack modifiers', async ({ page }) => {
  await fixture(page, '<section id="scope"><form id="density-form" class="ren-form ren-stack"><label>Field <input></label><button>Save</button></form><form id="fixed-form" class="ren-form ren-stack ren-stack-lg"><label>Fixed <input></label><button>Save</button></form><div class="ren-stack ren-stack-lg"><p>A</p><p>B</p></div></section>');
  for (const [density, gap] of [['compact', '12px'], ['comfortable', '24px'], ['spacious', '32px']]) {
    await page.locator('#scope').evaluate((el, value) => { el.dataset.density = value; }, density);
    await expect(page.locator('#density-form')).toHaveCSS('gap', gap);
    await expect(page.locator('#fixed-form')).toHaveCSS('gap', '24px');
    await expect(page.locator('div.ren-stack-lg')).toHaveCSS('gap', '24px');
  }
  await page.locator('#density-form').evaluate(el => el.style.setProperty('--stack-gap', 'var(--space-10)'));
  await expect(page.locator('#density-form')).toHaveCSS('gap', '40px');
});
