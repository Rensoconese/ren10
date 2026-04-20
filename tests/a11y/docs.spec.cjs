// WCAG 2.1 AA coverage for every page under docs/.
// One describe block per page → each gets "no AA violations" and "contrast passes".
// Added in F7.10 after --color-text-faint was found misused as readable text across docs/.
const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y, getViolations } = require('axe-playwright');
const path = require('path');

const DOCS = [
  'index.html',
  'getting-started.html',
  'tokens.html',
  'layouts.html',
  'theming.html',
  'components.html',
  'accessibility.html',
  'primitive-zero.html',
  'cli.html',
];

for (const page of DOCS) {
  const url = `file://${path.resolve(__dirname, '../../docs', page)}`;

  test.describe(`docs/${page} — WCAG 2.1 AA`, () => {
    test.beforeEach(async ({ page: pw }) => {
      await pw.goto(url, { waitUntil: 'networkidle' });
      await injectAxe(pw);
    });

    test('no AA violations', async ({ page: pw }) => {
      const violations = await getViolations(pw, null, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      });
      if (violations.length) {
        // eslint-disable-next-line no-console
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
