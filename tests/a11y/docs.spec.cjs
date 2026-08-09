// WCAG 2.1 AA coverage for every page under docs/.
// One describe block per page → each gets "no AA violations" and "contrast passes".
// Added in F7.10 after --color-text-faint was found misused as readable text across docs/.
//
// The page list is read from disk rather than hardcoded. It used to be a
// literal array of the nine top-level pages, so the 53 files under
// docs/components/ — one per component, the pages a consumer actually reads
// before using something — were never scanned at all, despite the comment
// above claiming otherwise. A new docs page now joins this suite by existing.
//
// Pages are served over HTTP, not opened with file://. Chromium blocks
// `<script type="module">` on file:// as a cross-origin request, so every
// component script failed to load and the scan ran against static markup with
// no component in it: customElements.get(...) was false and <ren-calendar> had
// zero children. The suite was green because it was looking at nothing.
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y, getViolations } = require('axe-playwright');
const fs = require('fs');
const path = require('path');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const DOCS_ROOT = path.join(ROOT, 'docs');

let server;

test.beforeAll(async () => {
  server = await startStaticServer(ROOT);
});

test.afterAll(async () => {
  await server?.close();
});

const listPages = (dir) =>
  fs
    .readdirSync(path.join(DOCS_ROOT, dir), { withFileTypes: true })
    // Underscore-prefixed files are partials included by other pages, not
    // navigable documents: they have no <html lang> or <title> by design.
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html') && !entry.name.startsWith('_'))
    .map((entry) => (dir ? `${dir}/${entry.name}` : entry.name))
    .sort();

const DOCS = [...listPages(''), ...listPages('components')];

for (const page of DOCS) {
  test.describe(`docs/${page} — WCAG 2.1 AA`, () => {
    test.beforeEach(async ({ page: pw }) => {
      await pw.goto(`${server.origin}/docs/${page}`, { waitUntil: 'networkidle' });
      // Give custom elements a beat to upgrade before axe reads the tree.
      await pw
        .waitForFunction(() => !document.querySelector('ren-calendar, ren-tabs, ren-select') ||
          customElements.get('ren-calendar') !== undefined ||
          customElements.get('ren-tabs') !== undefined ||
          customElements.get('ren-select') !== undefined, null, { timeout: 3000 })
        .catch(() => {});
      await injectAxe(pw);
    });

    test('no AA violations', async ({ page: pw }) => {
      const violations = await getViolations(pw, null, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      });
      if (violations.length) {
        console.log(`[${page}]`, JSON.stringify(violations, null, 2));
      }
      expect(violations).toEqual([]);
    });

    test('contrast passes', async ({ page: pw }) => {
      await checkA11y(pw, null, {
        axeOptions: { runOnly: { type: 'rule', values: ['color-contrast'] } },
      });
    });
  });
}
