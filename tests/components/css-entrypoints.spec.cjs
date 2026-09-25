const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');
let server;
test.beforeAll(async () => { server = await startStaticServer(path.resolve(__dirname, '../..')); });
test.afterAll(async () => { await server.close(); });

const selected = [
  'components/primitives/ren-card/ren-card.css',
  'components/primitives/ren-button/ren-button.css',
  'components/composites/ren-combobox/ren-combobox.css',
];
const modes = {
  source: ['index.css'],
  selective: ['foundation.css', ...selected],
  'selective-first': [...selected, 'foundation.css'],
  bundle: ['dist/ren10.css'],
  minified: ['dist/ren10.min.css'],
  split: ['dist/ren10-foundation.css', 'dist/ren10-components.css'],
  'split-minified': ['dist/ren10-foundation.min.css', 'dist/ren10-components.min.css'],
};

async function measure(page, mode, overrides) {
  await page.goto(`${server.origin}/foundation.css`);
  await page.setContent(`<!doctype html><html><head>
    <style>:root { --ren-card-radius: var(--radius-sm); }
    ${overrides ? '.consumer-media { padding-top: 0; padding-bottom: 0; } .consumer-button { min-height: 60px; }' : ''}</style>
    ${modes[mode].map((file) => `<link rel="stylesheet" href="${server.origin}/${file}">`).join('')}
    </head><body><main class="ren-stack">
    <article class="ren-card"><div class="ren-card-cover consumer-media">Cover</div><div class="ren-card-body"><h3>Tour</h3><p>Details</p></div></article>
    <div><button type="button" class="ren-btn ren-btn-primary consumer-button">View tour</button></div>
    <div class="ren-combobox"><input class="ren-combobox-input" aria-label="Destination"><div class="ren-combobox-list" role="listbox"><div class="ren-combobox-item" role="option" aria-selected="true">Patagonia</div></div></div>
    </main></body></html>`, { waitUntil: 'load' });
  return page.evaluate(() => {
    const style = (sel) => getComputedStyle(document.querySelector(sel));
    const card = style('.ren-card'), media = style('.consumer-media'), button = style('.consumer-button');
    const list = style('.ren-combobox-list'), item = style('.ren-combobox-item');
    return {
      cardRadius: card.borderRadius, cardBorder: card.borderTopWidth,
      mediaTop: media.paddingTop, mediaBottom: media.paddingBottom,
      buttonDisplay: button.display, buttonMinHeight: button.minHeight,
      buttonColor: button.backgroundColor, bodyColor: style('body').color,
      listPosition: list.position, listBorder: list.borderTopWidth,
      itemDisplay: item.display, itemBackground: item.backgroundColor,
    };
  });
}

for (const width of [390, 1280]) {
  for (const overrides of [false, true]) {
    test(`CSS entrypoint parity at ${width}, consumer overrides ${overrides}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const expected = await measure(page, 'source', overrides);
      expect(expected.cardBorder).toBe('1px');
      expect(expected.buttonDisplay).toBe('inline-flex');
      expect(expected.listPosition).toBe('absolute');
      expect(expected.listBorder).toBe('1px');
      expect(expected.itemDisplay).toBe('flex');
      if (overrides) {
        expect(expected.mediaTop).toBe('0px');
        expect(expected.buttonMinHeight).toBe('60px');
      }
      for (const mode of Object.keys(modes).slice(1)) {
        expect(await measure(page, mode, overrides), mode).toEqual(expected);
      }
    });
  }
}
