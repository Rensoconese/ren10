const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');

// Behaviour contract of the <ren-nav> pattern, exercised against the source
// CSS/JS (not dist bundles) so the tests track the component files:
// - Escape closes the mobile menu and returns focus to the toggle when focus
//   was inside the panel; link activation does not steal focus.
// - JS follows the CSS breakpoint: the menu stays open at exactly 48rem (768px)
//   where the CSS still shows the mobile layout, and follows page overrides.
// - The open mobile panel starts at the bar's bottom edge whatever the bar's
//   height, sticky or not.
const ROOT = path.resolve(__dirname, '../..');

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server.close(); });

const ACTIONS = `<div class="ren-nav-actions">
    <a class="ren-btn ren-btn-ghost" href="#sign-in">Sign in</a>
    <a class="ren-btn ren-btn-primary" href="#start">Get started</a>
  </div>`;

const navMarkup = ({ navClass = '', actions = false } = {}) => `<ren-nav><nav class="ren-nav ${navClass}" aria-label="Primary">
  <a class="ren-nav-brand" href="#home">RenDS</a>
  <ul id="primary-links" class="ren-nav-links">
    <li><a class="ren-nav-link" href="#docs" aria-current="page">Docs</a></li>
    <li><a class="ren-nav-link" href="#components">Components</a></li>
    <li><a class="ren-nav-link" href="#themes">Themes</a></li>
  </ul>
  ${actions ? ACTIONS : ''}
  <button class="ren-nav-toggle" type="button" aria-expanded="false" aria-controls="primary-links" aria-label="Toggle menu"><span></span><span></span><span></span></button>
</nav></ren-nav>`;

async function mountNav(page, { width = 390, before = '', navClass = '', actions = false, after = '' } = {}) {
  await page.setViewportSize({ width, height: 844 });
  // The panel slides in with a transform; measure its settled position.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Serve the fixture as a real navigation: custom elements parsed through
  // page.setContent() are not upgraded by the module's define() call.
  const url = `${server.origin}/__ren-nav-fixture.html`;
  await page.route(url, (route) => route.fulfill({
    contentType: 'text/html',
    body: `<!doctype html><html lang="en"><head><title>ren-nav fixture</title>
    <style>html { scrollbar-width: none; }</style>
    <link rel="stylesheet" href="/foundation.css">
    <link rel="stylesheet" href="/components/primitives/ren-button/ren-button.css">
    <link rel="stylesheet" href="/components/patterns/ren-nav/ren-nav.css">
    <script type="module" src="/components/patterns/ren-nav/ren-nav.js"></script>
    </head><body>${before}${navMarkup({ navClass, actions })}<main><h1>Page</h1><p id="docs">Content</p>${after}</main></body></html>`,
  }));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('ren-nav')?.isOpen === false);
  return { toggle: page.locator('.ren-nav-toggle'), panel: page.locator('#primary-links') };
}

const activeElementName = (page) => page.evaluate(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return 'body';
  return el.classList.contains('ren-nav-toggle') ? 'toggle' : `${el.tagName.toLowerCase()}${el.getAttribute('href') || ''}`;
});

test.describe('ren-nav focus management', () => {
  test('Escape closes the open menu and returns focus from the panel to the toggle', async ({ page }) => {
    const { toggle, panel } = await mountNav(page);
    await toggle.click();
    await expect(panel).toBeVisible();
    await panel.locator('a[href="#components"]').focus();

    await page.keyboard.press('Escape');

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();
    await expect.poll(() => activeElementName(page)).toBe('toggle');
  });

  test('Escape with focus on the toggle keeps focus there', async ({ page }) => {
    const { toggle } = await mountNav(page);
    await toggle.click();
    await toggle.focus();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => activeElementName(page)).toBe('toggle');
  });

  test('link activation closes the menu without pulling focus back to the toggle', async ({ page }) => {
    const { toggle, panel } = await mountNav(page);
    await toggle.click();
    await panel.locator('a[href="#components"]').click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    // Navigation owns focus after a link; the component must not redirect it.
    await expect.poll(() => activeElementName(page)).not.toBe('toggle');
  });
});

test.describe('ren-nav breakpoint', () => {
  test('menu stays open at exactly 768px, where the CSS still shows the mobile layout', async ({ page }) => {
    const { toggle, panel } = await mountNav(page, { width: 700 });
    await toggle.click();
    await expect(panel).toBeVisible();

    await page.setViewportSize({ width: 768, height: 844 });
    await expect(toggle).toBeVisible();
    await page.waitForTimeout(100);
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();

    await page.setViewportSize({ width: 769, height: 844 });
    await expect(toggle).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('menu follows a page-level breakpoint override that hides the toggle at 768px', async ({ page }) => {
    const { toggle, panel } = await mountNav(page, {
      width: 700,
      before: '<style>@media (min-width: 48rem) { .ren-nav-toggle { display: none; } .ren-nav-links { display: flex; position: static; } }</style>',
    });
    await toggle.click();
    await expect(panel).toBeVisible();

    await page.setViewportSize({ width: 768, height: 844 });
    await expect(toggle).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('ren-nav mobile panel offset', () => {
  const geometry = (page) => page.evaluate(() => {
    const nav = document.querySelector('.ren-nav').getBoundingClientRect();
    const panel = document.querySelector('.ren-nav-links').getBoundingClientRect();
    return { barBottom: Math.round(nav.bottom), panelTop: Math.round(panel.top), barHeight: Math.round(nav.height) };
  });

  const cases = {
    'a static bar below other content': { before: '<div style="block-size: 200px">Banner</div>' },
    'a static bar inside a positioned wrapper': { before: '<div style="position: relative; padding-block-start: 120px">Wrapper</div>' },
    'a sticky bar': { navClass: 'ren-nav-sticky' },
    'a bar taller than 3.5rem': { before: '<style>.ren-nav { --ren-nav-height: 5rem; }</style>' },
  };

  for (const [name, options] of Object.entries(cases)) {
    test(`open panel starts at the bottom edge of ${name}`, async ({ page }) => {
      const { toggle, panel } = await mountNav(page, options);
      await toggle.click();
      await expect(panel).toBeVisible();
      const { barBottom, panelTop, barHeight } = await geometry(page);
      expect(barHeight).toBeGreaterThan(0);
      expect(panelTop).toBe(barBottom);
    });
  }

  test('closed bar stays unpositioned so page-level containing blocks are unchanged', async ({ page }) => {
    await mountNav(page);
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('.ren-nav')).position)).toBe('static');
  });
});

test.describe('ren-nav link colour bridge', () => {
  // A distinctive link colour makes any leak of the bridge onto other anchors visible.
  const options = {
    width: 1280,
    actions: true,
    before: '<style>.ren-nav { --ren-nav-link-color: rgb(1, 2, 3); }</style>',
    after: '<p><a id="ref-ghost" class="ren-btn ren-btn-ghost" href="#ref">Reference</a> <a id="ref-primary" class="ren-btn ren-btn-primary" href="#ref">Reference</a></p>',
  };
  const colour = (page, selector) => page.evaluate((sel) => getComputedStyle(document.querySelector(sel)).color, selector);

  test('nav links still take --ren-nav-link-color', async ({ page }) => {
    await mountNav(page, options);
    expect(await colour(page, '.ren-nav-link[href="#components"]')).toBe('rgb(1, 2, 3)');
  });

  test('buttons in .ren-nav-actions keep their own colour', async ({ page }) => {
    await mountNav(page, options);
    expect(await colour(page, '.ren-nav-actions .ren-btn-ghost')).toBe(await colour(page, '#ref-ghost'));
    expect(await colour(page, '.ren-nav-actions .ren-btn-primary')).toBe(await colour(page, '#ref-primary'));
  });

  test('the brand keeps its own colour', async ({ page }) => {
    await mountNav(page, { ...options, after: `${options.after}<span id="ref-text" style="color: var(--color-text)">Text</span>` });
    expect(await colour(page, '.ren-nav-brand')).toBe(await colour(page, '#ref-text'));
  });
});

test.describe('ren-nav list items', () => {
  const liMargins = (page) => page.evaluate(() => [...document.querySelectorAll('.ren-nav-links > li')]
    .map((li) => { const cs = getComputedStyle(li); return `${cs.marginBlockStart} ${cs.marginBlockEnd}`; }));

  test('list items do not inherit block margins on desktop', async ({ page }) => {
    await mountNav(page, { width: 1280 });
    for (const margin of await liMargins(page)) expect(margin).toBe('0px 0px');
  });

  test('open mobile panel: no inherited li margins and links stay at least 24px tall', async ({ page }) => {
    const { toggle, panel } = await mountNav(page);
    await toggle.click();
    await expect(panel).toBeVisible();
    for (const margin of await liMargins(page)) expect(margin).toBe('0px 0px');
    const heights = await panel.locator('.ren-nav-link').evaluateAll((links) => links.map((a) => a.getBoundingClientRect().height));
    for (const height of heights) expect(height).toBeGreaterThanOrEqual(24);
  });

  test('open mobile panel: consecutive core links do not overlap', async ({ page }) => {
    const { toggle, panel } = await mountNav(page);
    await toggle.click();
    await expect(panel).toBeVisible();
    // Inline links paint their padding outside the li line box; the boxes must
    // take part in layout so neighbours neither overlap nor share tap area.
    const boxes = await panel.locator('.ren-nav-link').evaluateAll((links) => links
      .map((a) => { const r = a.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; }));
    expect(boxes.length).toBeGreaterThan(1);
    for (let i = 1; i < boxes.length; i += 1) {
      expect(boxes[i].top - boxes[i - 1].bottom, `gap between link ${i} and ${i + 1}`).toBeGreaterThanOrEqual(0);
    }
  });
});
