/** Small browser helpers shared by component tests (no framework coupling). */
export const waitForUpgrade = async (page, selector) => page.waitForFunction(
  (sel) => customElements.get(sel.replace(/^</, '').replace(/>$/, '')) || document.querySelector(sel), selector,
);
export const focusAndPress = async (page, selector, key = 'Enter') => {
  await page.locator(selector).focus();
  await page.keyboard.press(key);
};
export const reconnect = async (page, selector) => page.evaluate((sel) => {
  const node = document.querySelector(sel); if (!node?.parentNode) return false;
  const parent = node.parentNode; node.remove(); parent.append(node); return true;
}, selector);
export const expectAccessibleName = async (page, selector) => page.locator(selector).evaluate((el) => {
  const name = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.textContent?.trim();
  if (!name) throw new Error(`Missing accessible name: ${selector}`); return name;
});
