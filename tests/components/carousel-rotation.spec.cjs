// @ts-check
/**
 * The rotation control of an autoplay carousel, for the paths the APG
 * Carousel check (apg-patterns.spec.cjs) does not drive: the pointer, reduced
 * motion and a reconnect.
 *
 * An autoplay carousel had no way to stop rotation for good: it paused only
 * while hovered or focused and started again as soon as the pointer or focus
 * left (WCAG 2.2.2, APG Carousel).
 */
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');
const { ROOT, mountRegistry } = require('../utils/mount-registry.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

// A long interval: the checks read the rotating state, they never wait for a tick.
const autoplay = (usage) => usage.replace('<ren-carousel ', '<ren-carousel autoplay="60000" ');
const rotating = (page) => page.locator('ren-carousel').evaluate((el) => el.rotating);
/** Move the pointer below the carousel, off it. */
async function leave(page) {
  const box = await page.locator('ren-carousel').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height + 40);
}

test('ren-carousel: clicking the rotation control stops rotation for good, and clicking again starts it', { tag: ['@ren-carousel', '@runtime'] }, async ({ page }) => {
  const errors = await mountRegistry(page, server.origin, 'carousel', autoplay);
  const control = page.locator('ren-carousel > .ren-carousel-rotation');
  await expect(control).toHaveAccessibleName('Stop slide rotation');
  expect(await rotating(page)).toBe(true);

  // Over the carousel, rotation only pauses.
  await page.locator('ren-carousel .ren-carousel-viewport').hover();
  await expect.poll(() => rotating(page), 'hovering pauses').toBe(false);
  await leave(page);
  await expect.poll(() => rotating(page), 'and leaving resumes').toBe(true);

  // The click focuses the control as well: that must not count as the
  // keyboard stop and undo the click.
  await control.click();
  await expect(control).toHaveAccessibleName('Start slide rotation');
  await leave(page);
  expect(await rotating(page), 'stopped with the control, it stays stopped once the pointer leaves').toBe(false);

  await control.click();
  await expect(control).toHaveAccessibleName('Stop slide rotation');
  await leave(page);
  await expect.poll(() => rotating(page), 'started with the control, it rotates once the pointer leaves').toBe(true);
  expect(errors).toEqual([]);
});

test('ren-carousel: a stop survives a reconnect, and the API does what the control does', { tag: ['@ren-carousel', '@lifecycle'] }, async ({ page }) => {
  const errors = await mountRegistry(page, server.origin, 'carousel', autoplay);
  const control = page.locator('ren-carousel > .ren-carousel-rotation');
  await page.locator('ren-carousel').evaluate((el) => el.pause());
  await expect(control).toHaveAccessibleName('Start slide rotation');
  await page.locator('ren-carousel').evaluate((el) => { const parent = el.parentNode; el.remove(); parent.append(el); });
  await expect(page.locator('ren-carousel > .ren-carousel-rotation'), 'one control after a reconnect').toHaveCount(1);
  expect(await rotating(page), 'still stopped after a reconnect').toBe(false);
  await page.locator('ren-carousel').evaluate((el) => el.resume());
  await expect(control).toHaveAccessibleName('Stop slide rotation');
  expect(await rotating(page)).toBe(true);
  expect(errors).toEqual([]);
});

test('ren-carousel: under reduced motion it starts stopped, and the control can still start it', { tag: ['@ren-carousel', '@runtime'] }, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = await mountRegistry(page, server.origin, 'carousel', autoplay);
  const control = page.locator('ren-carousel > .ren-carousel-rotation');
  await expect(control).toHaveAccessibleName('Start slide rotation');
  expect(await rotating(page)).toBe(false);
  await control.focus();
  await page.keyboard.press('Enter');
  await expect(control).toHaveAccessibleName('Stop slide rotation');
  expect(await rotating(page), 'an explicit start is honoured').toBe(true);
  expect(errors).toEqual([]);
});

test('ren-carousel without autoplay has no rotation control', { tag: ['@ren-carousel', '@runtime'] }, async ({ page }) => {
  const errors = await mountRegistry(page, server.origin, 'carousel');
  await expect(page.locator('ren-carousel .ren-carousel-rotation')).toHaveCount(0);
  await page.locator('ren-carousel').evaluate((el) => el.setAttribute('autoplay', '60000'));
  await expect(page.locator('ren-carousel > .ren-carousel-rotation'), 'setting autoplay later adds it').toHaveCount(1);
  await page.locator('ren-carousel').evaluate((el) => el.removeAttribute('autoplay'));
  await expect(page.locator('ren-carousel .ren-carousel-rotation'), 'and removing autoplay takes it away').toHaveCount(0);
  expect(errors).toEqual([]);
});
