// @ts-check
/**
 * Where a sheet sits and what it shows, for the two sides that attach to a
 * block edge. rtl-contracts.spec.cjs covers `left`, `right` and the two
 * direction-relative sides.
 *
 * A modal <dialog> comes with `inset: 0` from the browser, so a rule that sets
 * one edge and forgets to release the opposite one leaves the box
 * over-constrained, and the browser then keeps the start edge whatever the
 * rule said. These tests look at the outcome: which viewport edge the open
 * sheet touches, how much of the viewport it spans, and whether its content is
 * what a pointer would hit.
 */
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');
const { ROOT, mountRegistry } = require('../utils/mount-registry.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

/** Registry usage on the given side, with enough body text to tell a squeezed body from a whole one. */
const sheetOn = (side) => (usage) => usage
  .replace('side="right"', `side="${side}"`)
  .replace(
    '<div class="ren-sheet-body">Filter controls</div>',
    '<div class="ren-sheet-body"><p>First line</p><p>Second line</p><p id="last-line">Last line</p></div>'
  );

/** The open sheet's box once it has stopped sliding. */
async function settledSheet(page) {
  const dialog = page.locator('ren-sheet dialog');
  await expect(dialog).toHaveJSProperty('open', true);
  await dialog.evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)));
  return dialog.evaluate((el) => {
    const box = el.getBoundingClientRect();
    return { top: box.top, bottom: box.bottom, left: box.left, right: box.right, width: box.width, height: box.height };
  });
}

for (const side of ['bottom', 'top']) {
  test(`ren-sheet side="${side}" sits on the ${side} edge and spans the viewport`, { tag: ['@ren-sheet', '@runtime'] }, async ({ page }) => {
    const errors = await mountRegistry(page, server.origin, 'sheet', sheetOn(side));
    await page.locator('ren-sheet').evaluate((host) => host.show());
    const box = await settledSheet(page);
    const viewport = page.viewportSize();

    if (side === 'bottom') {
      expect(Math.round(box.bottom), 'the sheet touches the bottom edge').toBe(viewport.height);
      expect(box.top, 'and leaves the top of the page uncovered').toBeGreaterThan(0);
    } else {
      expect(Math.round(box.top), 'the sheet touches the top edge').toBe(0);
      expect(box.bottom, 'and leaves the bottom of the page uncovered').toBeLessThan(viewport.height);
    }
    // The default size is `md`; a size is the width of a side sheet and must
    // not narrow one that runs along a block edge.
    expect(Math.round(box.left), 'the sheet starts at the left edge').toBe(0);
    expect(Math.round(box.width), 'and spans the viewport').toBe(viewport.width);
    expect(errors).toEqual([]);
  });

  test(`ren-sheet side="${side}" shows its whole body between header and footer`, { tag: ['@ren-sheet', '@runtime'] }, async ({ page }) => {
    const errors = await mountRegistry(page, server.origin, 'sheet', sheetOn(side));
    await page.locator('ren-sheet').evaluate((host) => host.show());
    await settledSheet(page);

    // A body squeezed to its padding still reports a box for every line, and
    // the footer is then painted over the last one.
    const hit = await page.locator('#last-line').evaluate((line) => {
      const box = line.getBoundingClientRect();
      const at = document.elementFromPoint(box.left + 8, box.top + box.height / 2);
      return at === line ? 'the last line' : (at?.className || at?.localName || 'nothing');
    });
    expect(hit, 'a pointer on the last line of the body hits that line').toBe('the last line');

    const [body, footer] = await Promise.all(['.ren-sheet-body', '.ren-sheet-footer'].map((selector) => (
      page.locator(selector).evaluate((el) => { const box = el.getBoundingClientRect(); return { top: box.top, bottom: box.bottom }; })
    )));
    const lastLine = await page.locator('#last-line').evaluate((el) => el.getBoundingClientRect().bottom);
    expect(lastLine, 'the body is tall enough for its content').toBeLessThanOrEqual(body.bottom);
    expect(body.bottom, 'the footer starts where the body ends').toBeLessThanOrEqual(footer.top + 0.5);
    expect(errors).toEqual([]);
  });
}
