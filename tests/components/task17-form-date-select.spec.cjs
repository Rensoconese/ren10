// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const http = require('http');
const path = require('path');

const PKG_ROOT = path.resolve(__dirname, '../..');

async function startStaticServer() {
  const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
  };

  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://127.0.0.1').pathname);
    if (pathname === '/') {
      res.writeHead(200, { 'content-type': contentTypes['.html'] });
      res.end('<!doctype html><html><body></body></html>');
      return;
    }

    const filePath = path.normalize(path.join(PKG_ROOT, pathname));
    if (!filePath.startsWith(PKG_ROOT + path.sep)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'content-type': contentTypes[path.extname(filePath)] || 'application/octet-stream' });
      res.end(data);
    });
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return {
    origin: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

test.describe('Task 17 form, local-date, and select escapes', () => {
  let staticServer;

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('ren10/utils publicly exports the local-date API', async () => {
    const utils = await import('ren10/utils');
    expect(typeof utils.parseLocalDate).toBe('function');
    expect(typeof utils.formatLocalDate).toBe('function');
    expect(typeof utils.clampLocalDate).toBe('function');
  });

  test('ren-form exposes and restores a real async submitting state', async ({ page }) => {
    await page.goto(staticServer.origin);
    await page.evaluate(async () => {
      await import('/components/patterns/ren-form/ren-form.js');
      document.body.innerHTML = `
        <ren-form id="host">
          <form class="ren-form" novalidate>
            <button id="submit" type="submit">Save</button>
            <button id="already-disabled" type="submit" disabled>Unavailable</button>
          </form>
        </ren-form>`;
      await customElements.whenDefined('ren-form');

      window.__submitCount = 0;
      window.__renSubmitCancelable = false;
      window.__submission = new Promise((resolve) => {
        window.__resolveSubmission = resolve;
      });
      document.querySelector('#host').addEventListener('ren-submit', (event) => {
        window.__submitCount += 1;
        window.__renSubmitCancelable = event.cancelable;
        event.preventDefault();
        event.detail.waitUntil(window.__submission);
      });
    });

    await page.locator('#submit').click();
    await expect.poll(() => page.evaluate(() => window.__submitCount)).toBe(1);
    await expect(page.locator('#host')).toHaveAttribute('data-submitting', '');
    await expect(page.locator('#host > form')).toHaveAttribute('data-submitting', '');
    await expect(page.locator('#submit')).toBeDisabled();
    await expect.poll(() => page.evaluate(() => window.__renSubmitCancelable)).toBe(true);

    await page.evaluate(() => document.querySelector('#host > form').requestSubmit());
    await expect.poll(() => page.evaluate(() => window.__submitCount)).toBe(1);

    await page.evaluate(() => window.__resolveSubmission());
    await expect(page.locator('#host')).not.toHaveAttribute('data-submitting', '');
    await expect(page.locator('#host > form')).not.toHaveAttribute('data-submitting', '');
    await expect(page.locator('#submit')).toBeEnabled();
    await expect(page.locator('#already-disabled')).toBeDisabled();
  });

  test('local-date public utilities and calendar keyboard focus preserve the civil date', async ({ browser }) => {
    const context = await browser.newContext({ timezoneId: 'America/Argentina/Buenos_Aires' });
    const page = await context.newPage();
    await page.goto(staticServer.origin);

    const result = await page.evaluate(async () => {
      const utils = await import('/utils/index.js');
      await import('/components/composites/ren-calendar/ren-calendar.js');
      const calendar = document.createElement('ren-calendar');
      calendar.setAttribute('value', '2026-03-31');
      document.body.appendChild(calendar);
      await customElements.whenDefined('ren-calendar');

      const index = Array.from(calendar.querySelectorAll('.ren-calendar-day'))
        .findIndex((button) => button.dataset.date === '2026-03-31');
      calendar.focusDateAtIndex(index);

      const parsed = utils.parseLocalDate('2026-03-31');
      const clamped = utils.clampLocalDate(parsed, '2026-04-01', '2026-04-30');
      return {
        parsed: utils.formatLocalDate(parsed),
        clamped: utils.formatLocalDate(clamped),
        focused: utils.formatLocalDate(calendar.focusedDate),
        utilityTypes: [utils.parseLocalDate, utils.formatLocalDate, utils.clampLocalDate]
          .map((value) => typeof value),
      };
    });

    expect(result).toEqual({
      parsed: '2026-03-31',
      clamped: '2026-04-01',
      focused: '2026-03-31',
      utilityTypes: ['function', 'function', 'function'],
    });
    await context.close();
  });

  test('ren-select multiple accumulates, submits, renders, and removes array values', async ({ page }) => {
    await page.goto(staticServer.origin);
    await page.evaluate(async () => {
      await import('/components/composites/ren-select/ren-select.js');
      document.body.innerHTML = `
        <form id="form">
          <ren-select id="select" name="skills" multiple placeholder="Choose skills">
            <button type="button" class="ren-select-trigger" data-select-trigger>Choose skills</button>
            <div class="ren-select-content" data-select-content>
              <div class="ren-select-item" data-select-item data-value="a">Alpha</div>
              <div class="ren-select-item" data-select-item data-value="b" aria-disabled="false">Beta</div>
              <div class="ren-select-item" data-select-item data-value="blocked" aria-disabled="true">Blocked</div>
            </div>
          </ren-select>
        </form>`;
      await customElements.whenDefined('ren-select');
    });

    await page.evaluate(() => {
      document.querySelector('[data-value="a"]').click();
      document.querySelector('[data-value="b"]').click();
    });

    await expect.poll(() => page.evaluate(() => document.querySelector('#select').value)).toEqual(['a', 'b']);
    await expect(page.locator('.ren-select-chip')).toHaveCount(2);
    await expect.poll(() => page.evaluate(() => new FormData(document.querySelector('#form')).getAll('skills')))
      .toEqual(['a', 'b']);
    await expect(page.locator('[data-select-item][data-value="b"]')).toHaveAttribute('aria-disabled', 'false');

    await page.evaluate(() => document.querySelector('.ren-select-chip-remove[data-value="a"]').click());

    await expect.poll(() => page.evaluate(() => document.querySelector('#select').value)).toEqual(['b']);
    await expect(page.locator('.ren-select-chip')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => new FormData(document.querySelector('#form')).getAll('skills')))
      .toEqual(['b']);
  });
});
