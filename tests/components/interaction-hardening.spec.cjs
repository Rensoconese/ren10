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

test.describe('Interaction hardening regressions', () => {
  let staticServer;

  test.beforeAll(async () => {
    staticServer = await startStaticServer();
  });

  test.afterAll(async () => {
    await staticServer?.close();
  });

  test('ren-form error summary renders validator messages as text', async ({ page }) => {
    await page.goto(`${staticServer.origin}/tests/components/fixtures/form-unsafe-summary.html`);
    await page.evaluate(() => customElements.whenDefined('ren-form'));

    await page.locator('button[type="submit"]').click();

    const summary = page.locator('#summary');
    await expect(summary).toBeVisible();
    await expect(summary.locator('img')).toHaveCount(0);
    await expect(summary).toContainText('<img src=x alt="bad" onerror="window.__renInjected = true">');
    await expect.poll(() => page.evaluate(() => window.__renInjected === true)).toBe(false);
  });

  test('ren-form does not duplicate submit handling after reconnect', async ({ page }) => {
    await page.goto(`${staticServer.origin}/tests/components/fixtures/form-unsafe-summary.html`);
    await page.evaluate(() => customElements.whenDefined('ren-form'));

    await page.evaluate(() => {
      window.__renInvalidCount = 0;
      const form = document.querySelector('ren-form');
      const parent = form.parentElement;
      form.addEventListener('ren-invalid', () => {
        window.__renInvalidCount += 1;
      });
      form.remove();
      parent.appendChild(form);
    });

    await page.locator('button[type="submit"]').click();

    await expect.poll(() => page.evaluate(() => window.__renInvalidCount)).toBe(1);
  });

  test('ren-popover syncs trigger state and restores focus', async ({ page }) => {
    await page.goto(`${staticServer.origin}/tests/components/fixtures/popover-focus.html`);
    await page.evaluate(() => customElements.whenDefined('ren-popover'));

    await page.locator('#trigger').click();

    await expect(page.locator('#trigger')).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(page.locator('#trigger')).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('inside');

    await page.keyboard.press('Escape');

    await expect(page.locator('#trigger')).toHaveAttribute('aria-expanded', 'false');
    await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('trigger');
  });

  test('anchored overlays mirror placement to data-side', async ({ page }) => {
    await page.goto(`${staticServer.origin}/tests/components/fixtures/anchor-placement.html`);
    await page.evaluate(() => Promise.all([
      customElements.whenDefined('ren-popover'),
      customElements.whenDefined('ren-tooltip'),
      customElements.whenDefined('ren-menu'),
      customElements.whenDefined('ren-select'),
      customElements.whenDefined('ren-combobox'),
      customElements.whenDefined('ren-color-picker'),
      customElements.whenDefined('ren-date-picker'),
      customElements.whenDefined('ren-date-range-picker'),
    ]));

    await expect(page.locator('#popover')).toHaveAttribute('data-side', 'right');
    await expect(page.locator('#tooltip')).toHaveAttribute('data-side', 'bottom');
    await expect(page.locator('#menu')).toHaveAttribute('data-side', 'top');
    await expect(page.locator('#select')).toHaveAttribute('data-side', 'left');
    await expect(page.locator('#combobox')).toHaveAttribute('data-side', 'top');
    await expect(page.locator('#color')).toHaveAttribute('data-side', 'right');
    await expect(page.locator('#date')).toHaveAttribute('data-side', 'top');
    await expect(page.locator('#range')).toHaveAttribute('data-side', 'left');

    await expect(page.locator('#select .ren-select-content')).toHaveAttribute('data-side', 'left');
    await expect(page.locator('#combobox .ren-combobox-list')).toHaveAttribute('data-side', 'top');
    await expect(page.locator('#color .ren-color-picker-dropdown')).toHaveAttribute('data-side', 'right');
    await expect(page.locator('#date .ren-date-picker-dropdown')).toHaveAttribute('data-side', 'top');
    await expect(page.locator('#range .ren-date-range-dropdown')).toHaveAttribute('data-side', 'left');

    await page.evaluate(() => {
      document.querySelector('#popover')?.setAttribute('placement', 'left');
      document.querySelector('#tooltip')?.setAttribute('placement', 'top');
      document.querySelector('#menu')?.setAttribute('placement', 'bottom-end');
      document.querySelector('#select')?.setAttribute('placement', 'right');
      document.querySelector('#combobox')?.setAttribute('placement', 'bottom');
      document.querySelector('#color')?.setAttribute('placement', 'bottom');
      document.querySelector('#date')?.setAttribute('placement', 'right');
      document.querySelector('#range')?.setAttribute('placement', 'bottom');
    });

    await expect(page.locator('#popover')).toHaveAttribute('data-side', 'left');
    await expect(page.locator('#tooltip')).toHaveAttribute('data-side', 'top');
    await expect(page.locator('#menu')).toHaveAttribute('data-side', 'bottom');
    await expect(page.locator('#menu')).toHaveAttribute('data-align', 'end');
    await expect(page.locator('#select')).toHaveAttribute('data-side', 'right');
    await expect(page.locator('#combobox')).toHaveAttribute('data-side', 'bottom');
    await expect(page.locator('#color')).toHaveAttribute('data-side', 'bottom');
    await expect(page.locator('#date')).toHaveAttribute('data-side', 'right');
    await expect(page.locator('#range')).toHaveAttribute('data-side', 'bottom');

    await page.evaluate(() => {
      document.querySelector('#popover')?.setAttribute('placement', 'diagonal');
      document.querySelector('#tooltip')?.setAttribute('placement', 'diagonal');
      document.querySelector('#menu')?.setAttribute('placement', 'diagonal');
      document.querySelector('#select')?.setAttribute('placement', 'diagonal');
      document.querySelector('#combobox')?.setAttribute('placement', 'diagonal');
      document.querySelector('#color')?.setAttribute('placement', 'diagonal');
      document.querySelector('#date')?.setAttribute('placement', 'diagonal');
      document.querySelector('#range')?.setAttribute('placement', 'diagonal');
    });

    await expect(page.locator('#popover')).toHaveAttribute('data-side', 'bottom');
    await expect(page.locator('#tooltip')).toHaveAttribute('data-side', 'top');
    await expect(page.locator('#menu')).toHaveAttribute('data-side', 'bottom');
    await expect(page.locator('#menu')).toHaveAttribute('data-align', 'start');
    await expect(page.locator('#select')).toHaveAttribute('data-side', 'bottom');
    await expect(page.locator('#combobox')).toHaveAttribute('data-side', 'bottom');
    await expect(page.locator('#color')).toHaveAttribute('data-side', 'bottom');
    await expect(page.locator('#date')).toHaveAttribute('data-side', 'bottom');
    await expect(page.locator('#range')).toHaveAttribute('data-side', 'bottom');
  });

  test('ren-calendar keeps exactly one enabled gridcell tabbable after month navigation', async ({ page }) => {
    await page.goto(`${staticServer.origin}/tests/components/fixtures/calendar-roving.html`);
    await page.evaluate(() => customElements.whenDefined('ren-calendar'));

    await page.locator('.ren-calendar-next').click();

    await expect.poll(() => page.locator('.ren-calendar-day:not([disabled])[tabindex="0"]').count()).toBe(1);
  });

  test('ren-carousel does not autoplay when prefers-reduced-motion is active', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${staticServer.origin}/tests/components/fixtures/carousel-reduced-motion.html`);
    await page.evaluate(() => customElements.whenDefined('ren-carousel'));

    await expect(page.locator('#carousel')).not.toHaveAttribute('data-autoplay', '');
    await expect(page.locator('.ren-carousel-counter-current')).toHaveText('1');
    await page.waitForTimeout(180);
    await expect(page.locator('.ren-carousel-counter-current')).toHaveText('1');
  });

  test('ren-sidebar keeps working when localStorage is unavailable', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          throw new DOMException('Blocked', 'SecurityError');
        },
      });
    });

    await page.goto(`${staticServer.origin}/tests/components/fixtures/sidebar-storage.html`);
    await page.evaluate(() => customElements.whenDefined('ren-sidebar'));

    await page.locator('.ren-sidebar-toggle').click();

    await expect(page.locator('ren-sidebar')).toHaveAttribute('data-collapsed', '');
    expect(pageErrors).toEqual([]);
  });

  test('global lifecycle listeners are removed when components disconnect', async ({ page }) => {
    await page.goto(`${staticServer.origin}/tests/components/fixtures/lifecycle-cleanup.html`);

    await expect.poll(() => page.evaluate(() => typeof window.mountAuditComponents)).toBe('function');
    await page.evaluate(() => window.mountAuditComponents());
    await expect.poll(() => page.evaluate(() => window.__renListenerAudit.total())).toBeGreaterThan(0);

    await page.evaluate(() => window.removeAuditComponents());

    await expect.poll(() => page.evaluate(() => window.__renListenerAudit.active())).toEqual([]);
  });

  test('ren-color-picker exposes the standard disconnectedCallback lifecycle hook', async ({ page }) => {
    await page.goto(`${staticServer.origin}/tests/components/fixtures/lifecycle-cleanup.html`);

    await expect.poll(() => page.evaluate(() => {
      const ColorPicker = customElements.get('ren-color-picker');
      return typeof ColorPicker?.prototype.disconnectedCallback;
    })).toBe('function');
  });

  test('ren-color-picker trigger opens the popover without native toggle races', async ({ page }) => {
    await page.goto(`${staticServer.origin}/tests/components/fixtures/lifecycle-cleanup.html`);
    await expect.poll(() => page.evaluate(() => typeof customElements.get('ren-color-picker'))).toBe('function');

    await page.evaluate(() => {
      document.querySelector('#fixture-root').innerHTML = '<ren-color-picker value="#007aff"></ren-color-picker>';
    });

    await page.locator('.ren-color-picker-trigger').click();

    await expect.poll(() => page.evaluate(() => {
      return document.querySelector('.ren-color-picker-dropdown')?.matches(':popover-open') || false;
    })).toBe(true);

    await page.locator('.ren-color-picker-trigger').click();

    await expect.poll(() => page.evaluate(() => {
      return document.querySelector('.ren-color-picker-dropdown')?.matches(':popover-open') || false;
    })).toBe(false);
  });

  test('ren-command keeps focus in the search input after global shortcut opens', async ({ page }) => {
    await page.goto(`${staticServer.origin}/tests/components/fixtures/lifecycle-cleanup.html`);
    await expect.poll(() => page.evaluate(() => typeof window.mountAuditComponents)).toBe('function');

    await page.evaluate(() => window.mountAuditComponents());
    await page.keyboard.press('Control+K');

    await expect.poll(() => page.evaluate(() => {
      return document.activeElement?.classList.contains('ren-command-input') || false;
    })).toBe(true);
  });
});
