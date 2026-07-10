// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const PKG_ROOT = path.resolve(__dirname, '../..');

async function startStaticServer() {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://127.0.0.1').pathname);
    if (pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      res.end('<!doctype html><html><body></body></html>');
      return;
    }
    const filePath = path.normalize(path.join(PKG_ROOT, pathname));
    if (!filePath.startsWith(PKG_ROOT + path.sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    fs.readFile(filePath, (error, data) => {
      if (error) return res.writeHead(404).end('Not found');
      res.writeHead(200, { 'content-type': 'application/javascript; charset=utf-8' });
      res.end(data);
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return { origin: `http://127.0.0.1:${port}`, close: () => new Promise((resolve) => server.close(resolve)) };
}

test.describe('Public contract runtime examples', () => {
  let staticServer;
  test.beforeAll(async () => { staticServer = await startStaticServer(); });
  test.afterAll(async () => { await staticServer?.close(); });

  test('ren-table canonical markup initializes without diagnostics and wires ARIA', async ({ page }) => {
    const contract = fs.readFileSync(path.join(
      PKG_ROOT,
      'components/patterns/ren-table/pattern.md'
    ), 'utf8');
    const markup = contract.match(/## Canonical Markup[\s\S]*?```html\s*([\s\S]*?)```/m)?.[1]?.trim();
    expect(markup).toBeTruthy();

    const diagnostics = [];
    page.on('console', (message) => {
      if (message.type() === 'warning' || message.type() === 'error') diagnostics.push(message.text());
    });
    page.on('pageerror', (error) => diagnostics.push(error.message));

    await page.goto(staticServer.origin);
    await page.setContent(`<!doctype html><html><body>${markup}</body></html>`);
    await page.evaluate(async () => {
      await import('/components/patterns/ren-table/ren-table.js');
      await customElements.whenDefined('ren-table');
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await expect(page.locator('ren-table table')).toHaveAttribute('role', 'table');
    await expect(page.locator('ren-table .ren-th-sortable')).toHaveAttribute('tabindex', '0');
    await expect(page.locator('ren-table .ren-th-sortable')).toHaveAttribute('aria-sort', 'none');
    expect(diagnostics).toEqual([]);
  });
});
