const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const PKG_ROOT = path.resolve(__dirname, '../..');

const headers = [
  {
    file: 'hero-split-copy-dual-cta-media.html',
    title: '.rh1-copy h1',
    lede: '.rh1-description',
    control: '.rh1-actions',
    media: '.rh1-media img',
  },
  {
    file: 'hero-split-email-form-media-right.html',
    title: '.rh2-heading',
    lede: '.rh2-description',
    control: '.rh2-signup',
    media: '.rh2-media img',
  },
  {
    file: 'hero-text-left-video-lightbox.html',
    title: '.rh3-copy h2',
    lede: '.rh3-lede',
    control: '.rh3-actions',
    media: 'img.rh3-thumbnail',
  },
  {
    file: 'hero-split-email-video-lightbox.html',
    title: '.rh4-title',
    lede: '.rh4-lede',
    control: '.rh4-form-wrap',
    media: '.rh4-poster img',
  },
  {
    file: 'hero-fullscreen-bg-left-copy-dual-cta.html',
    title: '.rh5-heading',
    lede: '.rh5-description',
    control: '.rh5-actions',
    media: '.rh5-background img',
  },
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

for (const header of headers) {
  test(`${header.file} uses real local photographic media`, async ({ page }) => {
    await page.goto(`${origin}/templates/blocks/${header.file}`);
    const image = page.locator(header.media);
    await expect(image).toHaveCount(1);
    await expect(image).toHaveAttribute('src', /^media\/hero-[a-z0-9-]+\.png$/);
    const media = await image.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        complete: node.complete,
        naturalWidth: node.naturalWidth,
        naturalHeight: node.naturalHeight,
        objectFit: style.objectFit,
      };
    });
    expect(media.complete).toBe(true);
    expect(media.naturalWidth).toBeGreaterThanOrEqual(1280);
    expect(media.naturalHeight).toBeGreaterThanOrEqual(800);
    expect(media.objectFit).toBe('cover');

    if (header.file === 'hero-text-left-video-lightbox.html') {
      const triggerBackground = await page.locator('.rh3-media-trigger').evaluate((node) =>
        getComputedStyle(node).backgroundColor
      );
      expect(triggerBackground).toMatch(/(?:rgba\(0, 0, 0, 0\)|\/ 0\))/);
    }
  });

  test(`${header.file} has intentional copy rhythm`, async ({ page }) => {
    await page.goto(`${origin}/templates/blocks/${header.file}`);
    const rhythm = await page.evaluate(({ title, lede, control }) => {
      const titleBox = document.querySelector(title).getBoundingClientRect();
      const ledeBox = document.querySelector(lede).getBoundingClientRect();
      const controlBox = document.querySelector(control).getBoundingClientRect();
      return {
        titleToLede: Math.round(ledeBox.top - titleBox.bottom),
        ledeToControl: Math.round(controlBox.top - ledeBox.bottom),
      };
    }, header);
    expect(rhythm.titleToLede).toBe(16);
    expect(rhythm.ledeToControl).toBe(24);
  });
}
