// @ts-check
/**
 * Shared Playwright harness for the navbar block specs
 * (tests/components/navbar*-navigation.spec.cjs and blocks-navigation.spec.cjs).
 *
 * Those specs repeat two steps that return while the page is still reacting:
 * resizing across the breakpoint, and focusing a destination below the fold.
 * The next step then raced that reaction. The helpers here wait for it.
 *
 * Import `test` and `expect` from this file instead of `@playwright/test`.
 *
 * The navbar specs set no action, navigation or test timeouts of their own;
 * they inherit the suite's. A 3 s action budget, kept from the red phase to
 * fail fast on missing selectors, also failed every action that a CI runner
 * stalled for longer than that.
 */
const base = require('@playwright/test');

/**
 * Wait until the page has reacted to a viewport change.
 *
 * `page.setViewportSize()` resolves once the browser has accepted the size.
 * The page reacts later: `resize` and media-query `change` listeners run in
 * the next rendering update. ren-nav closes its mobile shell from `resize` and
 * the block controllers reset their hover state from `change`, so a step
 * issued in between acts on state that belongs to the previous breakpoint.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ width: number, height: number }} size
 */
async function settleViewport(page, size) {
  // No timeout of its own: like every other step it is bounded by the test.
  await page.waitForFunction(
    ([width, height]) => window.innerWidth === width && window.innerHeight === height,
    [size.width, size.height]
  );
  // Both kinds of listener are dispatched before animation frame callbacks, so
  // the second callback runs after a complete rendering update at the new size.
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(undefined)));
      })
  );
}

/**
 * Focus a destination that may sit below the fold without leaving the
 * document scrolling.
 *
 * base/reset.css sets `html:focus-within { scroll-behavior: smooth }`, so a
 * bare `locator.focus()` on an off-screen element starts an animated scroll
 * that keeps running after the call returns. A pointer action issued meanwhile
 * aims at a moving target, and Playwright validates the hit target on the
 * first pointer event only: the press can land on the element and the release
 * beside it, so no click reaches the page. Scrolling the element into view
 * without animation first leaves `focus()` nothing to scroll.
 *
 * @param {import('@playwright/test').Locator} locator
 */
async function focusInView(locator) {
  await locator.evaluate((element) => {
    element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
  });
  await locator.focus();
}

// `page.setViewportSize()` on the test's own page settles before it returns.
// Pages a spec opens itself (touch or no-JS contexts) are left untouched.
const test = base.test.extend({
  page: async ({ page, javaScriptEnabled }, use) => {
    // With scripting off there are no listeners to wait for, and animation
    // frame callbacks never run.
    if (javaScriptEnabled !== false) {
      const setViewportSize = page.setViewportSize.bind(page);
      page.setViewportSize = async (size) => {
        await setViewportSize(size);
        await settleViewport(page, size);
      };
    }
    await use(page);
  },
});

module.exports = { test, expect: base.expect, focusInView, settleViewport };
