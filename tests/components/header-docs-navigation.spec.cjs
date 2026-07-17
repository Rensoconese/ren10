const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const PKG_ROOT = path.resolve(__dirname, '../..');
const headers = [
  ['hero-split-copy-dual-cta-media.html', '[data-rh1-root]', '[data-rh1-root]'],
  ['hero-split-email-form-media-right.html', '[data-rh2-root]', '[data-rh2-root]'],
  ['hero-text-left-video-lightbox.html', '[data-rh3-root]', '[data-rh3-root]'],
  ['hero-split-email-video-lightbox.html', '[data-rh4-root]', '[data-rh4-root]'],
  ['hero-fullscreen-bg-left-copy-dual-cta.html', '[data-rh5-root]', '#rh5-preview-frame'],
];

let server;
let origin;

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://127.0.0.1').pathname);
    const filePath = path.normalize(path.join(PKG_ROOT, pathname));
    if (!filePath.startsWith(`${PKG_ROOT}${path.sep}`)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404).end('Not found');
        return;
      }
      res.writeHead(200).end(data);
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

test.afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

for (const [file, rootSelector, previewSelector] of headers) {
  test(`${file} exposes consistent explanatory page chrome`, async ({ page }) => {
    await page.goto(`${origin}/templates/blocks/${file}`);

    await expect(page.locator('body > .dx-nav')).toHaveCount(1);
    await expect(page.locator('.dx-nav .dx-brand')).toContainText('Ren10');

    const header = page.locator('.bb-detail-header');
    await expect(header).toHaveCount(1);
    await expect(header.locator('.dx-kicker')).toHaveText(/^Header \d+ · Hero block$/);
    await expect(header.locator('.bb-detail-title')).not.toBeEmpty();
    await expect(header.locator('.bb-detail-description')).not.toBeEmpty();

    const crumbs = header.locator('.ren-breadcrumb li');
    await expect(crumbs).toHaveCount(3);
    await expect(crumbs.nth(0).locator('a')).toHaveAttribute('href', '../index.html');
    await expect(crumbs.nth(1).locator('a')).toHaveAttribute('href', 'index.html');
    await expect(crumbs.nth(2)).toHaveAttribute('aria-current', 'page');
  });

  test(`${file} uses the shared contained preview without carousel controls`, async ({ page }) => {
    await page.goto(`${origin}/templates/blocks/${file}`);
    await expect(page.locator('.bb-detail-nav')).toHaveCount(0);

    const preview = page.locator(previewSelector);
    await expect(preview).toHaveClass(/bb-detail-preview/);
    await expect(page.locator(rootSelector)).toHaveCount(1);
    await expect(preview.locator('xpath=ancestor::main[contains(@class, "dx-shell")]')).toHaveCount(1);

    const chrome = await preview.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        borderWidth: style.borderTopWidth,
        borderRadius: style.borderTopLeftRadius,
        boxShadow: style.boxShadow,
        overflow: style.overflow,
      };
    });
    expect(chrome.borderWidth).toBe('1px');
    expect(chrome.borderRadius).not.toBe('0px');
    expect(chrome.boxShadow).not.toBe('none');
    expect(['clip', 'hidden']).toContain(chrome.overflow);
  });
}
