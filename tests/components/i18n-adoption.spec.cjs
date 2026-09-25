// @ts-check
/**
 * i18n adoption regression tests.
 *
 * `utils/i18n.js` shipped with a full English + Spanish catalogue, plural and
 * interpolation support — and zero consumers. Every component hardcoded its
 * UI strings in English, including the `aria-label`s a screen reader
 * announces, so a non-English consumer had no way to translate them.
 *
 * Two properties are locked in here:
 *
 *   1. Adopting `t()` must not change a single visible or accessible string
 *      in the default locale. The catalogue values were chosen to match the
 *      previous literals exactly.
 *
 *   2. Selecting a locale before the components upgrade must actually
 *      translate them — otherwise the adoption is cosmetic.
 */
const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { startStaticServer } = require('../utils/static-server.cjs');

const ROOT = path.resolve(__dirname, '../..');
const FIXTURE = '/tests/components/fixtures/i18n-locale.html';

/** Accessible names as they must read in each locale. */
const EXPECTED = {
  en: {
    decrease: 'Decrease',
    increase: 'Increase',
    carousel: 'Image carousel',
    previous: 'Previous slide',
    next: 'Next slide',
  },
  es: {
    decrease: 'Disminuir',
    increase: 'Aumentar',
    carousel: 'Carrusel de imágenes',
    previous: 'Diapositiva anterior',
    next: 'Siguiente diapositiva',
  },
};

let server;

test.beforeAll(async () => {
  server = await startStaticServer(ROOT);
});

test.afterAll(async () => {
  await server?.close();
});

/**
 * Read the accessible names the components rendered.
 * @param {import('@playwright/test').Page} page
 */
async function readLabels(page, locale) {
  const query = locale ? `?locale=${locale}` : '';
  const response = await page.goto(`${server.origin}${FIXTURE}${query}`);
  expect(response?.status()).toBe(200);
  await page.waitForFunction(() => document.body.dataset.ready === 'true');

  return page.evaluate(() => {
    const label = (selector) => document.querySelector(selector)?.getAttribute('aria-label') ?? null;
    return {
      decrease: label('#number-field [data-decrease], #number-field [aria-label="Decrease"], #number-field [aria-label="Disminuir"]'),
      increase: label('#number-field [data-increase], #number-field [aria-label="Increase"], #number-field [aria-label="Aumentar"]'),
      carousel: document.querySelector('#carousel')?.getAttribute('aria-label') ?? null,
      previous: label('#carousel .ren-carousel-prev'),
      next: label('#carousel .ren-carousel-next'),
    };
  });
}

test('default locale keeps every accessible name byte-identical to the pre-i18n strings', async ({
  page,
}) => {
  const labels = await readLabels(page, null);

  for (const [key, expected] of Object.entries(EXPECTED.en)) {
    expect(labels[key], `${key} must not change in the default locale`).toBe(expected);
  }
});

test('selecting a locale before upgrade translates the accessible names', async ({ page }) => {
  const labels = await readLabels(page, 'es');

  for (const [key, expected] of Object.entries(EXPECTED.es)) {
    expect(labels[key], `${key} should be translated`).toBe(expected);
  }
});

test('the catalogue covers both locales for every adopted key', async ({ page }) => {
  await page.goto(`${server.origin}${FIXTURE}`);

  const report = await page.evaluate(async () => {
    const i18n = await import('/utils/i18n.js');
    const keys = [
      'numberField.decrease',
      'numberField.increase',
      'carousel.label',
      'carousel.pagination',
      'carousel.goToSlide',
      'carousel.previous',
      'carousel.next',
      'colorPicker.saturation',
      'colorPicker.presets',
      'combobox.noResults',
      'combobox.loading',
      'combobox.resultsAvailable',
      'command.noResults',
      'command.resultsAvailable',
      'toast.promiseLoading',
      'toast.promiseSuccess',
      'toast.promiseError',
      'dialog.label',
      'toast.region',
      'toast.close',
      'dateRangePicker.label',
      'dateRangePicker.presets',
      'dateRangePicker.apply',
      'dateRangePicker.cancel',
      'dateRangePicker.selectStart',
    ];
    const out = {};
    for (const key of keys) {
      i18n.setLocale('en');
      const en = i18n.t(key);
      i18n.setLocale('es');
      const es = i18n.t(key);
      out[key] = { en, es };
    }
    return out;
  });

  for (const [key, { en, es }] of Object.entries(report)) {
    // t() returns the key itself when the lookup misses.
    expect(en, `${key} missing from the English catalogue`).not.toBe(key);
    expect(es, `${key} missing from the Spanish catalogue`).not.toBe(key);
    expect(es, `${key} is not actually translated`).not.toBe(en);
  }
});
