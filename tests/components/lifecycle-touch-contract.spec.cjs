// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const PKG_ROOT = path.resolve(__dirname, '../..');

const ENTRYPOINTS = [
  'components/primitives/ren-button/ren-button.js',
  'components/primitives/ren-field/ren-field.js',
  'components/primitives/ren-radio/ren-radio.js',
  'components/composites/ren-accordion/ren-accordion.js',
  'components/composites/ren-calendar/ren-calendar.js',
  'components/composites/ren-carousel/ren-carousel.js',
  'components/composites/ren-color-picker/ren-color-picker.js',
  'components/composites/ren-combobox/ren-combobox.js',
  'components/composites/ren-context-menu/ren-context-menu.js',
  'components/composites/ren-date-picker/ren-date-picker.js',
  'components/composites/ren-date-range-picker/ren-date-range-picker.js',
  'components/composites/ren-dialog/ren-dialog.js',
  'components/composites/ren-dropzone/ren-dropzone.js',
  'components/composites/ren-hover-card/ren-hover-card.js',
  'components/composites/ren-menu/ren-menu.js',
  'components/composites/ren-number-field/ren-number-field.js',
  'components/composites/ren-otp/ren-otp.js',
  'components/composites/ren-popover/ren-popover.js',
  'components/composites/ren-select/ren-select.js',
  'components/composites/ren-sheet/ren-sheet.js',
  'components/composites/ren-slider/ren-slider.js',
  'components/composites/ren-tabs/ren-tabs.js',
  'components/composites/ren-toast/ren-toast.js',
  'components/composites/ren-toggle-group/ren-toggle-group.js',
  'components/composites/ren-toolbar/ren-toolbar.js',
  'components/composites/ren-tooltip/ren-tooltip.js',
  'components/patterns/ren-command/ren-command.js',
  'components/patterns/ren-form/ren-form.js',
  'components/patterns/ren-menubar/ren-menubar.js',
  'components/patterns/ren-nav/ren-nav.js',
  'components/patterns/ren-sidebar/ren-sidebar.js',
  'components/patterns/ren-table/ren-table.js',
];

const RUNTIME_PROFILES = [
  { registration: 'ren-button', profile: 'registration', na: 'No Task 16 lifecycle mutation.' },
  { registration: 'ren-field', profile: 'registration', na: 'No Task 16 lifecycle mutation.' },
  { registration: 'ren-radio-group', profile: 'registration', na: 'No Task 16 lifecycle mutation.' },
  { registration: 'ren-accordion', profile: 'registration', na: 'No Task 16 lifecycle mutation.' },
  { registration: 'ren-calendar', profile: 'touch' },
  { registration: 'ren-carousel', profile: 'observer-and-autoplay' },
  { registration: 'ren-color-picker', profile: 'reconnect-dom' },
  { registration: 'ren-combobox', profile: 'registration', na: 'No Task 16 lifecycle mutation.' },
  { registration: 'ren-context-menu', profile: 'registration', na: 'Covered by the interaction escape suite.' },
  { registration: 'ren-date-picker', profile: 'registration', na: 'Covered by the date picker interaction suite.' },
  { registration: 'ren-date-range-picker', profile: 'registration', na: 'Covered by the date range interaction suite.' },
  { registration: 'ren-dialog', profile: 'registration', na: 'Covered by the dialog interaction suite.' },
  { initializer: 'initDropZone', profile: 'initializer-listener' },
  { registration: 'ren-hover-card', profile: 'registration', na: 'No Task 16 lifecycle mutation.' },
  { registration: 'ren-menu', profile: 'registration', na: 'Covered by the interaction escape suite.' },
  { registration: 'ren-number-field', profile: 'registration', na: 'Covered by the interaction escape suite.' },
  { registration: 'ren-otp', profile: 'registration', na: 'No Task 16 lifecycle mutation.' },
  { registration: 'ren-popover', profile: 'registration', na: 'No Task 16 lifecycle mutation.' },
  { registration: 'ren-select', profile: 'registration', na: 'Covered by the select interaction suite.' },
  { registration: 'ren-sheet', profile: 'registration', na: 'Covered by the interaction escape suite.' },
  { registration: 'ren-slider', profile: 'registration', na: 'Covered by the interaction escape suite.' },
  { registration: 'ren-tabs', profile: 'registration', na: 'No Task 16 lifecycle mutation.' },
  { registration: 'ren-toast-viewport', profile: 'reconnect-listener-and-timer' },
  { registration: 'ren-toggle-group', profile: 'touch' },
  { initializer: 'initToolbar', profile: 'initializer-listener' },
  { registration: 'ren-tooltip', profile: 'registration', na: 'Covered by the interaction escape suite.' },
  { registration: 'ren-command', profile: 'registration', na: 'No Task 16 lifecycle mutation.' },
  { registration: 'ren-form', profile: 'registration', na: 'Covered by the form interaction suite.' },
  { registration: 'ren-menubar', profile: 'registration', na: 'No Task 16 lifecycle mutation.' },
  { registration: 'ren-nav', profile: 'reconnect-listener' },
  { registration: 'ren-sidebar', profile: 'touch' },
  { registration: 'ren-table', profile: 'registration', na: 'No Task 16 lifecycle mutation.' },
];

async function startStaticServer() {
  const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'application/javascript' };
  const server = http.createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://127.0.0.1').pathname);
    if (pathname === '/') {
      res.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><html><body></body></html>');
      return;
    }
    const filePath = path.normalize(path.join(PKG_ROOT, pathname));
    if (!filePath.startsWith(PKG_ROOT + path.sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    fs.readFile(filePath, (error, data) => {
      if (error) return res.writeHead(404).end('Not found');
      res.writeHead(200, { 'content-type': `${types[path.extname(filePath)] || 'text/plain'}; charset=utf-8` });
      res.end(data);
    });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  return { origin: `http://127.0.0.1:${port}`, close: () => new Promise((resolve) => server.close(resolve)) };
}

test.describe('Task 16 lifecycle, touch, reactivity, and ARIA matrix', () => {
  let staticServer;
  test.beforeAll(async () => { staticServer = await startStaticServer(); });
  test.afterAll(async () => { await staticServer?.close(); });

  test('all 32 entrypoints load and expose their declared runtime registration profile', async ({ page }) => {
    expect(ENTRYPOINTS).toHaveLength(32);
    expect(RUNTIME_PROFILES).toHaveLength(32);
    expect(new Set(ENTRYPOINTS).size).toBe(32);
    expect(RUNTIME_PROFILES.filter(({ registration }) => registration)).toHaveLength(30);
    expect(RUNTIME_PROFILES.filter(({ initializer }) => initializer)).toHaveLength(2);
    expect(RUNTIME_PROFILES.filter(({ profile, na }) => profile === 'registration' && !na)).toEqual([]);
    await page.goto(staticServer.origin);
    const loaded = await page.evaluate(async ({ entrypoints, profiles }) => {
      const results = [];
      for (let index = 0; index < entrypoints.length; index += 1) {
        const entrypoint = entrypoints[index];
        const profile = profiles[index];
        const exports = await import(`/${entrypoint}`);
        results.push({
          entrypoint,
          profile: profile.profile,
          registered: profile.registration
            ? typeof customElements.get(profile.registration) === 'function'
            : typeof exports[profile.initializer] === 'function',
        });
      }
      return results;
    }, { entrypoints: ENTRYPOINTS, profiles: RUNTIME_PROFILES });
    expect(loaded.map(({ entrypoint }) => entrypoint)).toEqual(ENTRYPOINTS);
    expect(loaded.filter(({ registered }) => !registered)).toEqual([]);
  });

  test('dropzone repeated initialization emits one files event', async ({ page }) => {
    await page.goto(staticServer.origin);
    const count = await page.evaluate(async () => {
      document.body.innerHTML = '<div class="ren-dropzone"><input class="ren-dropzone-input" type="file"></div>';
      const { initDropZone } = await import('/components/composites/ren-dropzone/ren-dropzone.js');
      const dropzone = document.querySelector('.ren-dropzone');
      initDropZone(dropzone);
      dropzone.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer: new DataTransfer() }));
      initDropZone(dropzone);
      const staleDragState = dropzone.hasAttribute('data-dragover');
      let events = 0;
      dropzone.addEventListener('ren-files-added', () => events += 1);
      const transfer = new DataTransfer();
      transfer.items.add(new File(['content'], 'task16.txt', { type: 'text/plain' }));
      dropzone.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: transfer }));
      return { events, staleDragState };
    });
    expect(count).toEqual({ events: 1, staleDragState: false });
  });

  test('toast viewport handles one hover action after reconnect', async ({ page }) => {
    await page.goto(staticServer.origin);
    const invocations = await page.evaluate(async () => {
      await import('/components/composites/ren-toast/ren-toast.js');
      const viewport = document.createElement('ren-toast-viewport');
      let hoverCalls = 0;
      const nativeAdd = viewport.addEventListener.bind(viewport);
      viewport.addEventListener = (type, listener, options) => nativeAdd(type, (event) => {
        if (type === 'mouseenter') hoverCalls += 1;
        return listener.call(viewport, event);
      }, options);
      document.body.appendChild(viewport);
      viewport.remove();
      document.body.appendChild(viewport);
      viewport.dispatchEvent(new MouseEvent('mouseenter'));
      return hoverCalls;
    });
    expect(invocations).toBe(1);
  });

  test('toast paused by hover resumes its remaining timer after reconnect', async ({ page }) => {
    await page.goto(staticServer.origin);
    await page.evaluate(async () => {
      const { toast } = await import('/components/composites/ren-toast/ren-toast.js');
      const viewport = document.createElement('ren-toast-viewport');
      document.body.appendChild(viewport);
      toast.show({ title: 'Reconnect timer', duration: 100 });
      viewport.dispatchEvent(new MouseEvent('mouseenter'));
      await new Promise((resolve) => setTimeout(resolve, 20));
      viewport.remove();
      document.body.appendChild(viewport);
    });
    await expect(page.locator('.ren-toast')).toHaveAttribute('data-closing', '', { timeout: 1000 });
  });

  test('color picker reconnect owns one stable generated popover', async ({ page }) => {
    await page.goto(staticServer.origin);
    const popovers = await page.evaluate(async () => {
      await import('/components/composites/ren-color-picker/ren-color-picker.js');
      const picker = document.createElement('ren-color-picker');
      document.body.appendChild(picker);
      for (let reconnect = 0; reconnect < 3; reconnect += 1) {
        picker.remove();
        document.body.appendChild(picker);
      }
      return picker.querySelectorAll(':scope > .ren-color-picker-dropdown').length;
    });
    expect(popovers).toBe(1);
  });

  test('touch-capable variants expose every known target at 44 by 44 or larger', async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, viewport: { width: 900, height: 844 } });
    const page = await context.newPage();
    await page.goto(staticServer.origin);
    await page.setContent(`<!doctype html><html><head>
      <link rel="stylesheet" href="${staticServer.origin}/index.css">
      <link rel="stylesheet" href="${staticServer.origin}/components/composites/ren-toggle-group/ren-toggle-group.css">
      <link rel="stylesheet" href="${staticServer.origin}/components/patterns/ren-sidebar/ren-sidebar.css">
      <link rel="stylesheet" href="${staticServer.origin}/components/composites/ren-toast/ren-toast.css">
      <link rel="stylesheet" href="${staticServer.origin}/components/composites/ren-calendar/ren-calendar.css">
    </head><body>
      <ren-toggle-group class="ren-toggle-group-sm"><button class="ren-toggle-group-item">A</button></ren-toggle-group>
      <button class="ren-sidebar-toggle" aria-label="Toggle sidebar">S</button>
      <button class="ren-toast-close" aria-label="Close">X</button>
      <div style="width:300px"><ren-calendar class="ren-calendar-sm"></ren-calendar></div>
    </body></html>`);
    await page.evaluate(async () => Promise.all([
      import('/components/composites/ren-toggle-group/ren-toggle-group.js'),
      import('/components/composites/ren-calendar/ren-calendar.js'),
    ]));
    const targets = page.locator('.ren-toggle-group-item, .ren-sidebar-toggle, .ren-toast-close, .ren-calendar-prev, .ren-calendar-next, .ren-calendar-day:not(:disabled)');
    await expect.poll(() => targets.count()).toBeGreaterThan(10);
    const measurements = await targets.evaluateAll((elements) => elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return { className: element.className, width: rect.width, height: rect.height };
    }));
    expect(measurements.filter(({ width, height }) => width <= 0 || height <= 0)).toEqual([]);
    const undersized = measurements.filter(({ width, height }) => width < 44 || height < 44);
    expect(undersized).toEqual([]);
    await context.close();
  });

  test('compact variants remain visually compact with a fine pointer', async ({ page }) => {
    await page.goto(staticServer.origin);
    await page.setContent(`<!doctype html><html><head>
      <link rel="stylesheet" href="${staticServer.origin}/index.css">
      <link rel="stylesheet" href="${staticServer.origin}/components/composites/ren-toggle-group/ren-toggle-group.css">
    </head><body><div class="ren-toggle-group ren-toggle-group-sm"><button class="ren-toggle-group-item">A</button></div></body></html>`);
    const box = await page.locator('.ren-toggle-group-item').boundingBox();
    expect(box.height).toBeLessThan(44);
  });

  test('nav and toolbar actions execute once after reconnect or repeated init', async ({ page }) => {
    await page.goto(staticServer.origin);
    const result = await page.evaluate(async () => {
      document.body.innerHTML = `
        <ren-nav id="nav"><button class="ren-nav-toggle" aria-expanded="false">Menu</button><div class="ren-nav-links"></div></ren-nav>
        <div id="toolbar" role="toolbar"><button class="ren-toolbar-item" tabindex="0">A</button><button class="ren-toolbar-item" tabindex="-1">B</button><button class="ren-toolbar-item" tabindex="-1">C</button></div>`;
      const toolbarModule = await import('/components/composites/ren-toolbar/ren-toolbar.js');
      await import('/components/patterns/ren-nav/ren-nav.js');
      const nav = document.querySelector('#nav');
      nav.remove();
      document.body.prepend(nav);
      nav.querySelector('.ren-nav-toggle').click();

      const toolbar = document.querySelector('#toolbar');
      toolbarModule.initToolbar(toolbar);
      toolbarModule.initToolbar(toolbar);
      toolbar.firstElementChild.focus();
      toolbar.firstElementChild.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      return { navOpen: nav.hasAttribute('data-open'), toolbarFocus: document.activeElement.textContent };
    });
    expect(result).toEqual({ navOpen: true, toolbarFocus: 'B' });
  });

  test('carousel reacts to slides and keeps valid controls/live behavior', async ({ page }) => {
    await page.goto(staticServer.origin);
    await page.evaluate(async () => {
      document.body.innerHTML = `<ren-carousel autoplay="10000"><div class="ren-carousel-viewport"><div class="ren-carousel-slide">A</div><div class="ren-carousel-slide">B</div></div></ren-carousel>`;
      await import('/components/composites/ren-carousel/ren-carousel.js');
    });
    const carousel = page.locator('ren-carousel');
    await expect(carousel.locator('.ren-carousel-dot')).toHaveCount(2);
    await expect(carousel.locator('.ren-carousel-counter')).toHaveAttribute('aria-live', 'off');
    const relationships = await carousel.evaluate((host) => [...host.querySelectorAll('.ren-carousel-dot')].map((dot, index) => ({
      controls: dot.getAttribute('aria-controls'),
      slideId: host.querySelectorAll('.ren-carousel-slide')[index].id,
      role: dot.getAttribute('role'),
    })));
    expect(relationships.every(({ controls, slideId, role }) => controls && controls === slideId && role !== 'tab')).toBe(true);

    await carousel.evaluate((host) => host.pause());
    await expect(carousel.locator('.ren-carousel-counter')).toHaveAttribute('aria-live', 'polite');
    await carousel.evaluate((host) => {
      const slide = document.createElement('div');
      slide.className = 'ren-carousel-slide';
      slide.textContent = 'C';
      host.querySelector('.ren-carousel-viewport').appendChild(slide);
    });
    await expect(carousel.locator('.ren-carousel-dot')).toHaveCount(3);
    await expect(carousel.locator('.ren-carousel-slide').nth(2)).toHaveAttribute('aria-label', 'Slide 3 of 3');
    const refreshedRelationships = await carousel.evaluate(async (host) => {
      const slide = document.createElement('div');
      slide.className = 'ren-carousel-slide';
      slide.textContent = 'Prepended';
      host.querySelector('.ren-carousel-viewport').prepend(slide);
      await new Promise((resolve) => setTimeout(resolve, 0));
      const ids = [...host.querySelectorAll('.ren-carousel-slide')].map((item) => item.id);
      return {
        ids,
        controls: [...host.querySelectorAll('.ren-carousel-dot')].map((dot) => dot.getAttribute('aria-controls')),
      };
    });
    expect(new Set(refreshedRelationships.ids).size).toBe(refreshedRelationships.ids.length);
    expect(refreshedRelationships.controls).toEqual(refreshedRelationships.ids);
  });
});
