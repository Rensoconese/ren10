const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { injectAxe, getViolations } = require('axe-playwright');
const { startStaticServer } = require('../utils/static-server.cjs');
const root = path.resolve(__dirname, '../..');
const pages = ['index.html', 'create/index.html', 'themes/preview.html', 'examples/reference-app/index.html'];
for (const dir of ['examples', 'templates']) {
  pages.push(...fs.readdirSync(path.join(root, dir)).filter(file => file.endsWith('.html')).map(file => `${dir}/${file}`));
}
let server;
test.beforeAll(async () => { server = await startStaticServer(root); });
test.afterAll(async () => { await server?.close(); });
for (const file of pages) {
  test(`${file} — public accessibility`, async ({ page }, testInfo) => {
    await page.route('https://fonts.googleapis.com/**', route => route.abort());
    await page.route('https://fonts.gstatic.com/**', route => route.abort());
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${server.origin}/${file}`, { waitUntil: 'load' });
    await page.evaluate(mode => { document.documentElement.dataset.mode = mode; }, testInfo.project.use.colorScheme);
    if (file === 'examples/reference-app/index.html') {
      // This consumer owns an inline scheme through its actual switch handler.
      await page.evaluate(mode => {
        const toggle = document.querySelector('#theme-switch');
        toggle.checked = mode === 'dark';
        toggle.dispatchEvent(new Event('change', { bubbles: true }));
      }, testInfo.project.use.colorScheme);
    }
    await expect(page.locator('html')).toHaveCSS('color-scheme', testInfo.project.use.colorScheme);
    if (file === 'create/index.html') {
      await expect(page.locator('#preview-grid .p-card').first()).toBeVisible();
      await page.evaluate(mode => { state.mode = mode; applyTheme(); }, testInfo.project.use.colorScheme);
    }
    // Scan the requested theme's finished paint, not an interpolated color pair
    // during the scheme change. Keep real final-state contrast violations visible.
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await Promise.all(document.getAnimations()
        .filter(animation => animation.constructor.name === 'CSSTransition')
        .map(animation => animation.finished.catch(() => {})));
    });
    await injectAxe(page);
    const violations = await getViolations(page, null, {
      preload: false,
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    // Log concise node summaries so the failing controls can be corrected.
    expect(violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))).toEqual([]);
  });
}

// Theme inheritance must survive repeated rebuilds, including cards whose
// descendants share a style cache in WebKit. Check both mode directions.
test('create/index.html — rebuilt cards inherit the selected theme', async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.goto(`${server.origin}/create/index.html`, { waitUntil: 'load' });
  await expect(page.locator('#preview-grid .p-card').first()).toBeVisible();
  for (const mode of ['dark', 'light', 'dark']) {
    const backgrounds = await page.evaluate(mode => {
      state.mode = mode;
      applyTheme();
      const actual = [...document.querySelectorAll('#preview-grid .p-card')]
        .map(card => getComputedStyle(card).backgroundColor);
      const probe = document.createElement('div');
      probe.style.backgroundColor = 'var(--surface-raised)';
      document.getElementById('preview-main').append(probe);
      const expected = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return actual.map(actual => ({ actual, expected }));
    }, mode);
    expect(backgrounds.length).toBeGreaterThan(0);
    expect(backgrounds.every(({ actual, expected }) => actual === expected)).toBe(true);
  }
});
