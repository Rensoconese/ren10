const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');

// .ren-table-wrapper is the table's horizontal scroll container. It must also
// be the containing block for absolutely positioned descendants: otherwise a
// visually hidden label in a far-right cell (e.g. <span class="ren-sr-only">)
// is positioned against the viewport, escapes the wrapper's clipping and makes
// the whole page scroll horizontally.
//
// Note: the sticky thead.ren-table-header already contains header-cell
// content, so the canonical header alone does not reproduce the bug. Cover the
// two shapes that do: an sr-only label in the last body cell of the canonical
// markup, and an "Actions" header label under a plain <thead> (the shape used by
// examples/data-table.html).
let server;
test.beforeAll(async () => { server = await startStaticServer(path.resolve(__dirname, '../..')); });
test.afterAll(async () => { await server.close(); });

const columns = ['Name', 'Email', 'Role', 'Team', 'Location', 'Status', 'Last active'];

function tableMarkup({ theadClass, headerLabel, bodyLabel }) {
  const lastHeader = headerLabel ? '<span class="ren-sr-only">Actions</span>' : 'Actions';
  const lastCell = `${bodyLabel ? '<span class="ren-sr-only">Actions for row</span>' : ''}<a href="#edit">Edit</a>`;
  const rows = [1, 2, 3].map((index) => `<tr class="ren-tr" data-row-id="${index}">${columns
    .map((column) => `<td class="ren-td">${column} value ${index}</td>`).join('')}<td class="ren-td">${lastCell}</td></tr>`).join('');
  return `<ren-table data-page-size="10"><div class="ren-table-wrapper"><table class="ren-table">
    <thead${theadClass ? ' class="ren-table-header"' : ''}><tr>${columns.map((column) => `<th class="ren-th" scope="col">${column}</th>`).join('')}<th class="ren-th" scope="col">${lastHeader}</th></tr></thead>
    <tbody class="ren-table-body">${rows}</tbody>
  </table></div></ren-table>`;
}

const cases = {
  'sr-only label in the last body cell (canonical markup)': { theadClass: true, bodyLabel: true },
  'sr-only "Actions" header under a plain <thead>': { theadClass: false, headerLabel: true },
};

for (const [name, options] of Object.entries(cases)) {
  test(`ren-table wrapper contains ${name} at 390px`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${server.origin}/foundation.css`);
    // Source CSS rather than dist bundles so the test tracks the component file.
    await page.setContent(`<!doctype html><html><head>
      <style>html { scrollbar-width: none; }</style>
      <link rel="stylesheet" href="${server.origin}/foundation.css">
      <link rel="stylesheet" href="${server.origin}/components/patterns/ren-table/ren-table.css">
      </head><body><main>${tableMarkup(options)}</main></body></html>`, { waitUntil: 'load' });

    const metrics = await page.evaluate(() => {
      const wrapper = document.querySelector('.ren-table-wrapper');
      const root = document.documentElement;
      return {
        viewport: root.clientWidth,
        pageScrollWidth: root.scrollWidth,
        wrapperClientWidth: wrapper.clientWidth,
        wrapperScrollWidth: wrapper.scrollWidth,
        wrapperPosition: getComputedStyle(wrapper).position,
        labelRight: Math.round(document.querySelector('.ren-table .ren-sr-only').getBoundingClientRect().right),
      };
    });

    expect(metrics.viewport).toBe(390);
    // Precondition: the table is wider than the viewport, so the wrapper scrolls.
    expect(metrics.wrapperScrollWidth, 'table must overflow its wrapper so the wrapper scrolls').toBeGreaterThan(metrics.wrapperClientWidth);
    expect(
      metrics.pageScrollWidth - metrics.viewport,
      `page overflows by ${metrics.pageScrollWidth - metrics.viewport}px: .ren-table-wrapper (position: ${metrics.wrapperPosition}) does not contain .ren-sr-only (right=${metrics.labelRight}px)`,
    ).toBe(0);
  });
}
