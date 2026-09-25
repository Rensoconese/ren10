const { test, expect } = require('@playwright/test');
const path = require('node:path');

const fixture = `file://${path.resolve(__dirname, 'fixtures/card-media-slots.html')}`;
const viewports = [
  { width: 390, height: 844 },
  { width: 1280, height: 1024 },
];

async function metrics(locator) {
  return locator.evaluate((el) => {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const parent = el.parentElement.getBoundingClientRect();
    const parentStyle = getComputedStyle(el.parentElement);
    const num = (value) => parseFloat(value);
    return {
      paddingTop: num(style.paddingTop),
      paddingBottom: num(style.paddingBottom),
      paddingLeft: num(style.paddingLeft),
      paddingRight: num(style.paddingRight),
      marginTop: num(style.marginTop),
      marginBottom: num(style.marginBottom),
      topGap: rect.top - parent.top - num(parentStyle.borderTopWidth),
      bottomGap: parent.bottom - num(parentStyle.borderBottomWidth) - rect.bottom,
      leftGap: rect.left - parent.left - num(parentStyle.borderLeftWidth),
      rightGap: parent.right - num(parentStyle.borderRightWidth) - rect.right,
    };
  });
}

async function token(page, name) {
  return page.evaluate((property) => {
    const probe = document.createElement('div');
    probe.style.width = `var(${property})`;
    document.body.append(probe);
    const pixels = parseFloat(getComputedStyle(probe).width);
    probe.remove();
    return pixels;
  }, name);
}

test.describe('card media slots', () => {
  for (const viewport of viewports) {
    test(`cover, footer, and card padding at ${viewport.width}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(fixture);

      const cardPadding = await token(page, '--ren-card-padding');
      const space2 = await token(page, '--space-2');
      const space3 = await token(page, '--space-3');
      expect(cardPadding).toBeGreaterThan(0);

      for (const id of ['cover-first-image', 'cover-last-image', 'cover-first-wrapper', 'cover-last-wrapper']) {
        const cover = page.locator(`#${id} > .ren-card-cover`);
        const box = await metrics(cover);
        expect(box.paddingTop, id).toBe(0);
        expect(box.paddingBottom, id).toBe(0);
        expect(box.marginTop, id).toBe(0);
        expect(box.marginBottom, id).toBe(0);
        expect(box.leftGap, id).toBeCloseTo(0, 0);
        expect(box.rightGap, id).toBeCloseTo(0, 0);
      }

      for (const id of ['cover-first-image', 'cover-first-wrapper']) {
        const box = await metrics(page.locator(`#${id} > .ren-card-cover`));
        expect(box.topGap, id).toBeCloseTo(0, 0);
      }

      for (const id of ['cover-last-image', 'cover-last-wrapper']) {
        const box = await metrics(page.locator(`#${id} > .ren-card-cover`));
        expect(box.bottomGap, id).toBeCloseTo(0, 0);
      }

      for (const id of ['cover-first-wrapper', 'cover-last-wrapper']) {
        const image = await metrics(page.locator(`#${id} > .ren-card-cover > img`));
        expect(image.topGap, id).toBeCloseTo(0, 0);
        expect(image.bottomGap, id).toBeCloseTo(0, 0);
        expect(image.leftGap, id).toBeCloseTo(0, 0);
        expect(image.rightGap, id).toBeCloseTo(0, 0);
      }

      const footer = await metrics(page.locator('#footer-border > .ren-card-footer-border'));
      expect(footer.paddingTop).toBeCloseTo(space3, 0);
      expect(footer.paddingBottom).toBeCloseTo(space3, 0);
      expect(footer.paddingTop + footer.paddingBottom).toBeLessThan(cardPadding * 2);
      expect(footer.marginTop).toBe(0);

      const footerAfterHeader = await metrics(page.locator('#footer-border-after-header > .ren-card-footer-border'));
      expect(footerAfterHeader.paddingTop).toBeCloseTo(space2, 0);
      expect(footerAfterHeader.paddingBottom).toBeCloseTo(space3, 0);
      expect(footerAfterHeader.marginTop).toBe(0);

      const simple = await metrics(page.locator('#simple'));
      const simpleChild = await metrics(page.locator('#simple > p'));
      expect(simple.paddingTop).toBeCloseTo(cardPadding, 0);
      expect(simple.paddingBottom).toBeCloseTo(cardPadding, 0);
      expect(simpleChild.paddingTop).toBe(0);
      expect(simpleChild.paddingBottom).toBe(0);
      expect(simpleChild.topGap).toBeCloseTo(cardPadding, 0);
      expect(simpleChild.bottomGap).toBeCloseTo(cardPadding, 0);

      const loose = await metrics(page.locator('#loose > p'));
      expect(loose.paddingTop).toBeCloseTo(cardPadding, 0);
      expect(loose.paddingBottom).toBeCloseTo(cardPadding, 0);

      const header = await metrics(page.locator('#structured > .ren-card-header'));
      const body = await metrics(page.locator('#structured > .ren-card-body'));
      const actions = await metrics(page.locator('#structured > .ren-card-footer'));
      expect(header.paddingTop).toBeCloseTo(cardPadding, 0);
      expect(header.paddingBottom).toBe(0);
      expect(body.paddingTop).toBeCloseTo(space3, 0);
      expect(body.paddingBottom).toBeCloseTo(cardPadding, 0);
      expect(actions.paddingTop).toBe(0);
      expect(actions.paddingBottom).toBeCloseTo(cardPadding, 0);
    });
  }
});
