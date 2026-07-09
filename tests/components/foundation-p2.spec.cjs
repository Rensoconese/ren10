const { test, expect } = require('@playwright/test');
const path = require('node:path');

const fixture = `file://${path.resolve(__dirname, 'fixtures/foundation-p2.html')}`;

test.describe('foundation P2 contracts', () => {
  test('density is monotonic and preserves 44px controls', async ({ page }) => {
    await page.goto(fixture);
    const gaps = {};
    for (const density of ['compact', 'comfortable', 'spacious']) {
      await page.evaluate((value) => document.documentElement.dataset.density = value, density);
      gaps[density] = await page.locator('#density').evaluate((el) => parseFloat(getComputedStyle(el).rowGap));
    }
    expect(gaps.compact).toBeLessThan(gaps.comfortable);
    expect(gaps.comfortable).toBeLessThan(gaps.spacious);
    expect(await page.locator('button').count()).toBe(0);
  });

  test('body and heading consume typography roles', async ({ page }) => {
    await page.goto(fixture);
    const values = await page.locator('body, h1').evaluateAll((els) => els.map((el) => getComputedStyle(el).fontFamily));
    expect(values[0]).not.toBe('');
    const roles = await page.evaluate(() => ({ body: getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim(), heading: getComputedStyle(document.documentElement).getPropertyValue('--font-heading').trim() }));
    expect(roles.body).not.toBe('');
    expect(roles.heading).not.toBe('');
  });

  test('page grid is capped at 1280px and prose grid is standalone', async ({ page }) => {
    await page.goto(fixture);
    const result = await page.locator('.ren-page-grid').evaluate((el) => ({ width: el.getBoundingClientRect().width, cols: getComputedStyle(el).gridTemplateColumns }));
    expect(result.width).toBeLessThanOrEqual(1280);
    expect(result.cols).toContain('[');
    expect(await page.locator('.ren-prose-grid').evaluate((el) => getComputedStyle(el).display)).toBe('grid');
  });

  test('reduced motion has no finite animation duration except spinner feedback', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(fixture);
    const durations = await page.locator('*').evaluateAll((els) => els.map((el) => ({ name: el.className, duration: getComputedStyle(el).animationDuration })).filter((x) => x.duration !== '0s'));
    expect(durations.filter((x) => !String(x.name).includes('spinner'))).toEqual([]);
  });
});
