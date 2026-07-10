// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const PKG_ROOT = path.resolve(__dirname, '../..');

async function startStaticServer() {
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://127.0.0.1').pathname);
    if (pathname === '/__task17.html') {
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
      if (error) {
        res.writeHead(404).end('Not found');
        return;
      }
      res.writeHead(200, {
        'content-type': path.extname(filePath) === '.js'
          ? 'application/javascript; charset=utf-8'
          : 'text/plain; charset=utf-8',
      });
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

test.describe('Task 17 interaction escapes', () => {
  let staticServer;

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(`${staticServer.origin}/__task17.html`);
  });

  test('registry context menu supports keyboard, Escape focus return, and reconnect exactly once', async ({ page }) => {
    await page.evaluate(async () => {
      const [{ REGISTRY }] = await Promise.all([
        import('/cli/registry.js'),
        import('/components/composites/ren-context-menu/ren-context-menu.js'),
        import('/components/composites/ren-menu/ren-menu.js'),
      ]);
      document.body.innerHTML = REGISTRY['context-menu'].usage;
      await customElements.whenDefined('ren-context-menu');
      window.__contextOpenCount = 0;
      const menu = document.querySelector('ren-context-menu');
      menu.addEventListener('ren-context-menu-open', () => window.__contextOpenCount += 1);
      const parent = menu.parentElement;
      menu.remove();
      parent.appendChild(menu);
    });

    const trigger = page.locator('[data-context]').first();
    await trigger.focus();
    await page.keyboard.press('Shift+F10');
    await expect(page.locator('ren-context-menu')).toHaveAttribute('data-state', 'open');
    await page.keyboard.press('Escape');
    await expect.poll(() => page.evaluate(() => document.activeElement?.hasAttribute('data-context'))).toBe(true);
    await trigger.focus();
    await page.keyboard.press('ContextMenu');
    await expect.poll(() => page.evaluate(() => window.__contextOpenCount)).toBe(2);
  });

  test('dialog reconciles native form close once with returnValue and focus restoration', async ({ page }) => {
    await page.evaluate(async () => {
      document.body.innerHTML = `
        <button id="dialog-trigger">Open</button>
        <main id="dialog-background">Background</main>
        <ren-dialog id="native-dialog">
          <dialog>
            <h2 class="ren-dialog-title">Confirm</h2>
            <form method="dialog"><button id="dialog-save" value="saved">Save</button></form>
          </dialog>
        </ren-dialog>`;
      await import('/components/composites/ren-dialog/ren-dialog.js');
      await customElements.whenDefined('ren-dialog');
      window.__dialogCloses = [];
      const host = document.querySelector('#native-dialog');
      host.addEventListener('ren-close', (event) => window.__dialogCloses.push(event.detail.returnValue));
      document.querySelector('#dialog-trigger').addEventListener('click', () => host.show());
    });

    await page.locator('#dialog-trigger').click();
    await expect(page.locator('#native-dialog')).toHaveAttribute('open', '');
    await expect(page.locator('#dialog-background')).toHaveJSProperty('inert', true);
    await page.locator('#dialog-save').click();

    await expect(page.locator('#native-dialog')).not.toHaveAttribute('open', '');
    await expect(page.locator('#dialog-background')).toHaveJSProperty('inert', false);
    await expect.poll(() => page.evaluate(() => window.__dialogCloses)).toEqual(['saved']);
    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('dialog-trigger');
  });

  test('sheet reconciles native Escape close once and restores focus', async ({ page }) => {
    await page.evaluate(async () => {
      document.body.innerHTML = `
        <button id="sheet-trigger">Open</button>
        <ren-sheet id="native-sheet">
          <h2 class="ren-sheet-title">Filters</h2>
          <button id="sheet-inside">Inside</button>
        </ren-sheet>`;
      await import('/components/composites/ren-sheet/ren-sheet.js');
      await customElements.whenDefined('ren-sheet');
      window.__sheetCloseCount = 0;
      const host = document.querySelector('#native-sheet');
      host.addEventListener('ren-close', () => window.__sheetCloseCount += 1);
      document.querySelector('#sheet-trigger').addEventListener('click', () => host.show());
    });

    await page.locator('#sheet-trigger').click();
    await expect(page.locator('#native-sheet')).toHaveAttribute('open', '');
    await page.keyboard.press('Escape');
    await expect(page.locator('#native-sheet')).not.toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => window.__sheetCloseCount)).toBe(1);
    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('sheet-trigger');
  });

  test('number field stepper buttons never submit their containing form', async ({ page }) => {
    await page.evaluate(async () => {
      document.body.innerHTML = '<form id="quantity-form"><ren-number-field value="1"></ren-number-field></form>';
      document.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault();
        window.__numberSubmits = (window.__numberSubmits || 0) + 1;
      });
      await import('/components/composites/ren-number-field/ren-number-field.js');
      await customElements.whenDefined('ren-number-field');
    });

    await page.locator('.ren-number-field-increment').click();
    await expect(page.locator('.ren-number-field-increment')).toHaveAttribute('type', 'button');
    await expect(page.locator('.ren-number-field-decrement')).toHaveAttribute('type', 'button');
    await expect.poll(() => page.evaluate(() => window.__numberSubmits || 0)).toBe(0);
  });

  test('tooltip composes aria-describedby and removes only its owned token', async ({ page }) => {
    await page.evaluate(async () => {
      document.body.innerHTML = '<button id="tip-trigger" aria-describedby="help">Info<ren-tooltip id="owned-tip">Details</ren-tooltip></button>';
      await import('/components/composites/ren-tooltip/ren-tooltip.js');
      await customElements.whenDefined('ren-tooltip');
    });

    await expect(page.locator('#tip-trigger')).toHaveAttribute('aria-describedby', 'help owned-tip');
    await page.evaluate(() => document.querySelector('#owned-tip').remove());
    await expect(page.locator('#tip-trigger')).toHaveAttribute('aria-describedby', 'help');
  });

  test('dual slider preserves its tuple API and event detail', async ({ page }) => {
    await page.evaluate(async () => {
      document.body.innerHTML = `
        <ren-slider id="price" type="range">
          <div class="ren-slider-range">
            <div class="ren-slider-track-input"></div>
            <input aria-label="Minimum" type="range" min="0" max="100" value="20">
            <input aria-label="Maximum" type="range" min="0" max="100" value="80">
          </div>
        </ren-slider>`;
      await import('/components/composites/ren-slider/ren-slider.js');
      await customElements.whenDefined('ren-slider');
      window.__sliderInput = null;
      document.querySelector('#price').addEventListener('ren-slider-input', (event) => {
        window.__sliderInput = event.detail.value;
      });
      document.querySelector('#price').value = [25, 75];
      const upper = document.querySelectorAll('#price input')[1];
      upper.value = '70';
      upper.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await expect.poll(() => page.evaluate(() => document.querySelector('#price').value)).toEqual([25, 70]);
    await expect.poll(() => page.evaluate(() => window.__sliderInput)).toEqual([25, 70]);
  });

  test('keyboard navigation includes aria-disabled=false and skips only true', async ({ page }) => {
    const result = await page.evaluate(async () => {
      document.body.innerHTML = `
        <div id="nav">
          <button role="menuitem">First</button>
          <button role="menuitem" aria-disabled="false">Enabled</button>
          <button role="menuitem" aria-disabled="true">Disabled</button>
        </div>`;
      const { createKeyboardNav } = await import('/utils/keyboard-nav.js');
      const nav = createKeyboardNav(document.querySelector('#nav'), { selector: '[role="menuitem"]' });
      nav.attach();
      return nav.getItems().map((item) => item.textContent.trim());
    });

    expect(result).toEqual(['First', 'Enabled']);
  });
});
