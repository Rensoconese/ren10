// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const http = require('http');
const path = require('path');

const PKG_ROOT = path.resolve(__dirname, '../..');
const STORAGE_KEY = 'ren-sidebar-collapsed';
const FIXTURE = '/tests/components/fixtures/sidebar-storage.html';
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const DESKTOP_VIEWPORT = { width: 1280, height: 1024 };

async function startStaticServer() {
  const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
  };

  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://127.0.0.1').pathname);

    // Blank origin document, used to seed localStorage before the fixture loads.
    if (pathname === '/') {
      res.writeHead(200, { 'content-type': contentTypes['.html'] });
      res.end('<!doctype html><html lang="en"><head><title>seed</title></head><body></body></html>');
      return;
    }

    const filePath = path.normalize(path.join(PKG_ROOT, pathname));

    if (!filePath.startsWith(PKG_ROOT + path.sep)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'content-type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
      res.end(data);
    });
  });

  await new Promise((resolveListen) => server.listen(0, '127.0.0.1', resolveListen));
  const { port } = server.address();
  return {
    origin: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolveClose) => server.close(resolveClose)),
  };
}

/** Seeds the persisted collapse preference on the server origin before the fixture loads. */
async function seedCollapsePreference(page, origin, value) {
  await page.goto(`${origin}/`);
  await page.evaluate(([key, stored]) => localStorage.setItem(key, stored), [STORAGE_KEY, value]);
}

function readCollapsePreference(page) {
  return page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);
}

test.describe('ren-sidebar collapse preference persistence', () => {
  let staticServer;

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test.describe('mobile viewport', () => {
    test.use({ viewport: MOBILE_VIEWPORT });

    test('loading on mobile keeps the stored desktop collapse preference', async ({ page }) => {
      await seedCollapsePreference(page, staticServer.origin, 'true');

      await page.goto(`${staticServer.origin}${FIXTURE}`);
      await page.evaluate(() => customElements.whenDefined('ren-sidebar'));

      // Mobile renders the overlay expanded — the layout constraint is visual only.
      await expect(page.locator('ren-sidebar')).not.toHaveAttribute('data-collapsed', '');
      expect(await page.evaluate(() => document.querySelector('ren-sidebar').isCollapsed)).toBe(false);

      // ...and it must not overwrite the persisted desktop preference.
      expect(await readCollapsePreference(page)).toBe('true');
    });

    test('the preference survives a mobile visit and reapplies back on desktop', async ({ page }) => {
      await seedCollapsePreference(page, staticServer.origin, 'true');

      await page.goto(`${staticServer.origin}${FIXTURE}`);
      await page.evaluate(() => customElements.whenDefined('ren-sidebar'));
      await expect(page.locator('ren-sidebar')).not.toHaveAttribute('data-collapsed', '');

      await page.setViewportSize(DESKTOP_VIEWPORT);

      await expect(page.locator('ren-sidebar')).toHaveAttribute('data-collapsed', '');
      expect(await readCollapsePreference(page)).toBe('true');
    });

    test('toggleMenu() is a public prototype method that drives the mobile overlay', async ({ page }) => {
      await page.goto(`${staticServer.origin}${FIXTURE}`);
      await page.evaluate(() => customElements.whenDefined('ren-sidebar'));

      const onPrototype = await page.evaluate(() => {
        const sidebar = document.querySelector('ren-sidebar');
        return typeof Object.getPrototypeOf(sidebar).toggleMenu === 'function'
          && !Object.prototype.hasOwnProperty.call(sidebar, 'toggleMenu');
      });
      expect(onPrototype).toBe(true);

      await page.evaluate(() => document.querySelector('ren-sidebar').toggleMenu());
      await expect(page.locator('ren-sidebar')).toHaveAttribute('data-open', '');
      expect(await page.evaluate(() => document.querySelector('ren-sidebar').isMobileOpen)).toBe(true);

      await page.evaluate(() => document.querySelector('ren-sidebar').toggleMenu());
      await expect(page.locator('ren-sidebar')).not.toHaveAttribute('data-open', '');
    });
  });

  test.describe('desktop viewport', () => {
    test.use({ viewport: DESKTOP_VIEWPORT });

    test('resizing from desktop into mobile does not clear the preference', async ({ page }) => {
      await seedCollapsePreference(page, staticServer.origin, 'true');

      await page.goto(`${staticServer.origin}${FIXTURE}`);
      await page.evaluate(() => customElements.whenDefined('ren-sidebar'));
      await expect(page.locator('ren-sidebar')).toHaveAttribute('data-collapsed', '');

      await page.setViewportSize(MOBILE_VIEWPORT);
      await expect(page.locator('ren-sidebar')).not.toHaveAttribute('data-collapsed', '');

      expect(await readCollapsePreference(page)).toBe('true');

      await page.setViewportSize(DESKTOP_VIEWPORT);
      await expect(page.locator('ren-sidebar')).toHaveAttribute('data-collapsed', '');
    });

    test('a user-initiated toggle is still persisted', async ({ page }) => {
      await seedCollapsePreference(page, staticServer.origin, 'false');

      await page.goto(`${staticServer.origin}${FIXTURE}`);
      await page.evaluate(() => customElements.whenDefined('ren-sidebar'));
      await expect(page.locator('ren-sidebar')).not.toHaveAttribute('data-collapsed', '');

      await page.locator('.ren-sidebar-toggle').click();
      await expect(page.locator('ren-sidebar')).toHaveAttribute('data-collapsed', '');
      expect(await readCollapsePreference(page)).toBe('true');

      await page.locator('.ren-sidebar-toggle').click();
      await expect(page.locator('ren-sidebar')).not.toHaveAttribute('data-collapsed', '');
      expect(await readCollapsePreference(page)).toBe('false');
    });
  });
});
