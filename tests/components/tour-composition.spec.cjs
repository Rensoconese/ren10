// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');

/**
 * F06/F07/F08 regression coverage for examples/tour-composition.html.
 *
 * Checks composition geometry (no clipping, no horizontal scroll) and
 * keyboard behavior at the two reference widths, 390px and 1280px.
 */

const ROOT = path.resolve(__dirname, '../..');
const PAGE = '/examples/tour-composition.html';

let server;

test.beforeAll(async () => {
  server = await startStaticServer(ROOT);
});

test.afterAll(async () => {
  await server?.close();
});

async function openPage(page, width, height) {
  await page.setViewportSize({ width, height });
  const response = await page.goto(`${server.origin}${PAGE}`);
  expect(response?.status(), `load ${PAGE}`).toBe(200);
  await page.waitForLoadState('networkidle');
}

for (const viewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 900 },
]) {
  test(`tour composition keeps geometry at ${viewport.name}`, async ({ page }) => {
    await openPage(page, viewport.width, viewport.height);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, 'horizontal document overflow').toBeLessThanOrEqual(1);

    const ctas = await page.locator('[data-tour-cta]').evaluateAll((controls) => controls.map((control) => {
      const box = control.getBoundingClientRect();
      const styles = getComputedStyle(control);
      const icon = control.querySelector('svg');
      const iconBox = icon?.getBoundingClientRect();
      const label = control.querySelector('span');
      return {
        text: control.textContent.replace(/\s+/g, ' ').trim(),
        box: { left: box.left, right: box.right, top: box.top, bottom: box.bottom },
        overflow: {
          x: control.scrollWidth - control.clientWidth,
          y: control.scrollHeight - control.clientHeight,
        },
        whiteSpace: styles.whiteSpace,
        overflowStyle: styles.overflow,
        minHeight: Number.parseFloat(styles.minHeight),
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        labelInside: label
          ? label.scrollWidth <= label.clientWidth + 1 && label.scrollHeight <= label.clientHeight + 1
          : false,
        iconInside: iconBox
          ? iconBox.left >= box.left - 0.5 && iconBox.right <= box.right + 0.5
            && iconBox.top >= box.top - 0.5 && iconBox.bottom <= box.bottom + 0.5
          : false,
        iconCount: control.querySelectorAll('svg').length,
      };
    }));

    expect(ctas.length).toBeGreaterThanOrEqual(3);
    expect(new Set(ctas.map((cta) => `${cta.fontSize}/${cta.fontWeight}/${cta.minHeight}`)).size,
      'paired actions share size and typographic role').toBe(1);
    for (const cta of ctas) {
      expect(cta.text.length, 'label text present').toBeGreaterThan(20);
      expect(cta.iconCount, 'one icon inside the control').toBe(1);
      expect(cta.iconInside, 'icon inside control box').toBe(true);
      expect(cta.overflow.x, `no inline clip: ${cta.text}`).toBeLessThanOrEqual(1);
      expect(cta.overflow.y, `no block clip: ${cta.text}`).toBeLessThanOrEqual(1);
      expect(cta.labelInside, `label not clipped: ${cta.text}`).toBe(true);
      expect(cta.whiteSpace, 'labels may wrap').toBe('normal');
      expect(cta.overflowStyle, 'no hidden overflow').not.toBe('hidden');
      expect(cta.minHeight, 'touch target preserved').toBeGreaterThanOrEqual(44);
      expect(cta.box.left, 'control inside viewport').toBeGreaterThanOrEqual(0);
      expect(cta.box.right, 'control inside viewport').toBeLessThanOrEqual(viewport.width + 1);
    }

    // Bilingual content is complete, not truncated.
    const text = ctas.map((cta) => cta.text).join('\n');
    expect(text).toContain('View full tour details, departure times and meeting point');
    expect(text).toContain('Ver los detalles completos del tour, horarios de salida y punto de encuentro');
    expect(text).toContain('Send booking enquiry');

    // Cards must not have nested interactive controls (link inside link).
    const nested = await page.locator('a a, a button, button a').count();
    expect(nested).toBe(0);

    const rhythm = await page.locator('.tour-payment').evaluate((group) => {
      const [heading, description, action] = group.children;
      return {
        display: getComputedStyle(group).display,
        expected: parseFloat(getComputedStyle(group).rowGap),
        headingGap: description.getBoundingClientRect().top - heading.getBoundingClientRect().bottom,
        actionGap: action.getBoundingClientRect().top - description.getBoundingClientRect().bottom,
      };
    });
    expect(rhythm.display).toBe('flex');
    expect(rhythm.expected).toBe(8);
    expect(rhythm.headingGap).toBeCloseTo(rhythm.expected, 1);
    expect(rhythm.actionGap).toBeCloseTo(rhythm.expected, 1);

    const consentOffsets = await page.locator('[data-consent]').evaluateAll((labels) => labels.map((label) => {
      const box = label.querySelector('.ren-checkbox-control').getBoundingClientRect();
      const text = label.lastElementChild.getBoundingClientRect();
      return Math.abs((box.top + box.bottom - text.top - text.bottom) / 2);
    }));
    for (const offset of consentOffsets) expect(offset).toBeLessThanOrEqual(1);
  });

  test(`native disclosure toggles by keyboard at ${viewport.name}`, async ({ page }) => {
    await openPage(page, viewport.width, viewport.height);

    const details = page.locator('[data-tour-includes]').first();
    await expect(details).toHaveJSProperty('open', false);

    const summary = details.locator('summary');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(details).toHaveJSProperty('open', true);
    await expect(summary).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(details).toHaveJSProperty('open', false);
  });

  test(`form validates and reports by keyboard at ${viewport.name}`, async ({ page }) => {
    await openPage(page, viewport.width, viewport.height);

    const summary = page.locator('.ren-form-error-summary');
    const result = page.locator('[data-booking-result]');
    const submit = page.locator('#booking button[type="submit"]');

    await expect(result).toBeHidden();

    // Submit with empty required fields: the error summary appears.
    await submit.focus();
    await page.keyboard.press('Enter');
    await expect(summary).toBeVisible();
    await expect(summary).toHaveAttribute('data-has-errors', '');
    await expect(result).toBeHidden();

    // Every control keeps an accessible label.
    const unlabeled = await page.locator('#booking form').evaluate((form) => {
      const controls = Array.from(form.querySelectorAll('input, textarea, select'));
      return controls.filter((control) => {
        if (control.type === 'hidden') return false;
        if (control.getAttribute('aria-label') || control.getAttribute('aria-labelledby')) return false;
        return !form.querySelector(`label[for="${control.id}"]`) && !control.closest('label');
      }).length;
    });
    expect(unlabeled, 'form controls without labels').toBe(0);

    // Fill the required fields, consent, and submit by keyboard.
    await page.fill('input[name="fullName"]', 'Ada Lovelace');
    await page.fill('input[name="email"]', 'ada@example.com');

    // Valid text fields are insufficient while required consent is unchecked.
    await submit.focus();
    await page.keyboard.press('Enter');
    await expect(result).toBeHidden();

    // Toggle consent with the keyboard (the native input is visually hidden).
    const consent = page.locator('input[name="contactConsent"]');
    await consent.focus();
    await page.keyboard.press('Space');
    await expect(consent).toBeChecked();

    await submit.focus();
    await page.keyboard.press('Enter');

    await expect(result).toBeVisible();
    await expect(result).toContainText('Demo only');
    await expect(result).toContainText('no payment processed');
    await expect(summary).toBeHidden();
  });
}

test('mobile navigation opens and closes by keyboard without horizontal scroll', async ({ page }) => {
  await openPage(page, 390, 844);

  const toggle = page.locator('.ren-nav-toggle');
  const links = page.locator('.ren-nav-links');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(links).toBeHidden();

  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(links).toBeVisible();

  const openOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(openOverflow, 'horizontal overflow while menu is open').toBeLessThanOrEqual(1);

  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(links).toBeHidden();
});

test('desktop navigation shows links and hides the mobile toggle', async ({ page }) => {
  await openPage(page, 1280, 900);

  await expect(page.locator('.ren-nav-links')).toBeVisible();
  await expect(page.locator('.ren-nav-toggle')).toBeHidden();
});
