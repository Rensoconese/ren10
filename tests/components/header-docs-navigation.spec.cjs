const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const PKG_ROOT = path.resolve(__dirname, '../..');
const headers = [
  'hero-split-copy-dual-cta-media.html',
  'hero-split-email-form-media-right.html',
  'hero-text-left-video-lightbox.html',
  'hero-split-email-video-lightbox.html',
  'hero-fullscreen-bg-left-copy-dual-cta.html',
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

for (const file of headers) {
  test(`${file} exposes consistent explanatory page chrome`, async ({ page }) => {
    await page.goto(`${origin}/templates/blocks/${file}`);

    await expect(page.locator('body > .dx-nav')).toHaveCount(1);
    await expect(page.locator('.dx-nav .dx-brand')).toContainText('Ren10');

    const header = page.locator('.bb-detail-header');
    await expect(header).toHaveCount(1);
    await expect(header.locator('.dx-kicker')).toHaveText('Header block');
    await expect(header.locator('.bb-detail-title')).not.toBeEmpty();
    await expect(header.locator('.bb-detail-description')).not.toBeEmpty();

    const crumbs = header.locator('.ren-breadcrumb li');
    await expect(crumbs).toHaveCount(3);
    await expect(crumbs.nth(0).locator('a')).toHaveAttribute('href', '../index.html');
    await expect(crumbs.nth(1).locator('a')).toHaveAttribute('href', 'index.html');
    await expect(crumbs.nth(2)).toHaveAttribute('aria-current', 'page');
  });

  test(`${file} can move between headers or return to the catalog`, async ({ page }) => {
    await page.goto(`${origin}/templates/blocks/${file}`);
    const links = page.locator('.bb-detail-nav a');
    await expect(links).toHaveCount(3);
    await expect(links.nth(0)).toContainText('Previous');
    await expect(links.nth(1)).toHaveText('All blocks');
    await expect(links.nth(1)).toHaveAttribute('href', 'index.html');
    await expect(links.nth(2)).toContainText('Next');

    for (const href of await links.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')))) {
      const response = await page.request.get(`${origin}/templates/blocks/${href}`);
      expect(response.ok(), `${href} should resolve`).toBe(true);
    }
  });
}
