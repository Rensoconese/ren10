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
    await injectAxe(page);
    const violations = await getViolations(page, null, {
      preload: false,
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    // Log concise node summaries so the failing controls can be corrected.
    expect(violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))).toEqual([]);
  });
}
