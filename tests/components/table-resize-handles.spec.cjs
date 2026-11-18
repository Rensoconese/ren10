// @ts-check
/**
 * Each column's resize handle is on that column's own edge.
 *
 * The handle is absolutely positioned at the end of its header cell, and only
 * sortable cells were positioned. The handle of any other column was placed
 * against the nearest positioned ancestor instead: the sticky header row in
 * Chromium and Firefox, so it sat at the far edge of the table on top of the
 * last column's handle, and the table wrapper in WebKit, where it also ran
 * down over every row. Dragging at a column's edge did nothing, and dragging
 * at the edge of the table resized a column somewhere in the middle.
 */
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');
const { ROOT, mountRegistry } = require('../utils/mount-registry.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

const TOLERANCE = 2;

/** The registry table with a third column, so one plain column is in the middle. */
function threeColumns(usage, dir) {
  return usage
    .replace('<ren-table>', `<ren-table dir="${dir}">`)
    .replace('<th class="ren-th">Email</th>', '<th class="ren-th">Email</th>\n<th class="ren-th ren-th-sortable" data-column="role">Role</th>')
    .replace(/<\/td><\/tr>/g, '</td><td class="ren-td">Admin</td></tr>');
}

for (const dir of ['ltr', 'rtl']) {
  test(`ren-table puts every resize handle on its own column edge (${dir})`, { tag: ['@ren-table', '@runtime'] }, async ({ page }) => {
    const errors = await mountRegistry(page, server.origin, 'table', (usage) => threeColumns(usage, dir));
    await expect(page.locator('.ren-th-resize')).toHaveCount(3);

    const columns = await page.evaluate(() => [...document.querySelectorAll('th')].map((cell) => {
      const own = cell.getBoundingClientRect();
      const handle = cell.querySelector('.ren-th-resize').getBoundingClientRect();
      return {
        name: cell.textContent.trim(),
        cell: { left: own.left, right: own.right, top: own.top, height: own.height },
        handle: { left: handle.left, right: handle.right, top: handle.top, height: handle.height },
      };
    }));

    expect(columns.map((column) => column.name)).toEqual(['Name', 'Email', 'Role']);
    for (const { name, cell, handle } of columns) {
      const [edge, at] = dir === 'rtl' ? ['left', handle.left - cell.left] : ['right', cell.right - handle.right];
      expect(Math.abs(at), `the ${name} handle is on the ${edge} edge of the ${name} column`).toBeLessThanOrEqual(TOLERANCE);
      expect(Math.abs(handle.top - cell.top), `the ${name} handle starts with its header cell`).toBeLessThanOrEqual(TOLERANCE);
      expect(handle.height, `the ${name} handle is as tall as its header cell, not the table`).toBeLessThanOrEqual(cell.height + TOLERANCE);
    }

    // No handle hangs over the rows: the end of every body cell is the cell.
    const covered = await page.evaluate((direction) => [...document.querySelectorAll('tbody td')].filter((cell) => {
      const rect = cell.getBoundingClientRect();
      const x = direction === 'rtl' ? rect.left + 2 : rect.right - 2;
      return !cell.contains(document.elementFromPoint(x, rect.top + rect.height / 2));
    }).map((cell) => cell.textContent), dir);
    expect(covered, 'body cells with something else over their end edge').toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('ren-table resizes the column whose edge is dragged', { tag: ['@ren-table', '@runtime'] }, async ({ page }) => {
  const errors = await mountRegistry(page, server.origin, 'table', (usage) => threeColumns(usage, 'ltr'));
  await expect(page.locator('.ren-th-resize')).toHaveCount(3);

  const email = page.locator('th', { hasText: 'Email' });
  const before = await email.boundingBox();
  const start = await email.evaluate((cell) => cell.offsetWidth);
  // Press on the edge between Email and Role, and pull it 60px towards Name.
  const edge = { x: before.x + before.width - 2, y: before.y + before.height / 2 };
  await page.mouse.move(edge.x, edge.y);
  await page.mouse.down();
  await page.mouse.move(edge.x - 30, edge.y, { steps: 3 });
  await page.mouse.move(edge.x - 60, edge.y, { steps: 3 });
  await page.mouse.up();

  const width = await email.evaluate((cell) => cell.style.width);
  expect(width, 'the Email column took the width it was dragged to').toBe(`${start - 60}px`);
  expect(errors).toEqual([]);
});
