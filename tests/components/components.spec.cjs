// @ts-check
/**
 * Per-component smoke tests.
 *
 * Drives from the CLI registry (single source of truth for "what components exist")
 * and validates that every registered component has a matching demo section in
 * docs/components.html, renders visibly, and passes axe scoped to that section.
 *
 * This catches three classes of regression that page-level specs miss:
 *   1. New component added to registry but forgotten in components.html
 *   2. A component section broken in a way the full-page a11y scan masks
 *      (e.g. a contained violation that axe reports but the violator happens
 *      to be in a minority on the page)
 *   3. Drift between CLI metadata and docs (naming, IDs, presence)
 *
 * If this spec fails for a component, the fix is usually one of:
 *   - Add a `<section id="..." class="demo-section">` to components.html
 *   - Update SECTION_MAP below if the demo lives under a different anchor
 *   - Fix the actual a11y issue in the component CSS/markup
 */
const { test, expect } = require('@playwright/test');
const path = require('path');
const { injectAxe, checkA11y } = require('axe-playwright');

const COMPONENTS_HTML = 'file://' + path.resolve(__dirname, '../../docs/components.html');

/**
 * Registry key → section ID in components.html.
 *
 * Most entries are 1:1 after trivial pluralisation (`button` → `buttons`).
 * A few need explicit mapping because the demo section was named by use-case
 * rather than component (`form` → `form-validation`, `select` → `custom-select`).
 *
 * Known gap: date-range-picker has no demo section yet — tracked as a follow-up.
 */
const SECTION_MAP = {
  // Primitives
  button:       'buttons',
  field:        'form-fields',
  checkbox:     'checkbox',
  badge:        'badges',
  radio:        'radio',
  progress:     'progress',
  icon:         'icons',
  avatar:       'avatars',
  banner:       'banners',
  breadcrumb:   'breadcrumbs',
  card:         'cards',
  kbd:          'kbd',
  link:         'links',
  pagination:   'pagination',
  separator:    'separators',
  skeleton:     'skeletons',
  spinner:      'spinners',
  tag:          'tags',

  // Composites
  dialog:              'dialog',
  popover:             'popover',
  tooltip:             'tooltip',
  tabs:                'tabs',
  accordion:           'accordion',
  menu:                'menu',
  select:              'custom-select',
  toast:               'toast',
  slider:              'slider',
  'toggle-group':      'toggle-group',
  combobox:            'combobox',
  sheet:               'sheet',
  'hover-card':        'hover-card',
  'scroll-area':       'scroll-area',
  'number-field':      'number-field',
  otp:                 'input-otp',
  calendar:            'calendar',
  'date-picker':       'date-picker',
  carousel:            'carousel',
  'alert-dialog':      'alert-dialog',
  collapsible:         'collapsible',
  'color-picker':      'color-picker',
  'context-menu':      'context-menu',
  dropzone:            'dropzone',
  toolbar:             'toolbar',
  'date-range-picker': 'date-range-picker',

  // Patterns
  nav:            'nav',
  sidebar:        'sidebar',
  command:        'command',
  table:          'data-table',
  form:           'form-validation',
  menubar:        'menubar',
  ai:             'ai-patterns',
  'empty-state':  'empty-state',
};

const SKIPPED = new Set([]);

test.describe('Every registered component has a working demo section', () => {
  test.beforeAll(async () => {
    // Sanity check: every non-skipped key in REGISTRY must appear in SECTION_MAP.
    // We load the registry lazily here (ES module) to avoid turning the whole
    // spec into ESM.
    const { REGISTRY } = await import('../../cli/registry.js');
    const registryKeys = Object.keys(REGISTRY);
    const unmapped = registryKeys.filter(
      (k) => !SECTION_MAP[k] && !SKIPPED.has(k)
    );
    if (unmapped.length > 0) {
      throw new Error(
        `Registry entries missing from SECTION_MAP (add them or to SKIPPED): ${unmapped.join(', ')}`
      );
    }
  });

  for (const [key, sectionId] of Object.entries(SECTION_MAP)) {
    test(`${key} → #${sectionId} renders and passes axe`, async ({ page }) => {
      await page.goto(COMPONENTS_HTML);

      const section = page.locator(`#${sectionId}`);
      await expect(section).toBeVisible();

      // Assert the section contains demo content beyond its heading + description.
      // Each demo-section starts with <h2> + <p.demo-description>; anything else
      // (a div, a ren-* component, an input, an img, etc.) counts as real demo.
      const demoDescendants = await section
        .locator('> *:not(h2):not(p.demo-description)')
        .count();
      expect(demoDescendants, `${key} section should contain rendered demo content`).toBeGreaterThan(0);

      // Scoped axe scan: WCAG 2.1 AA on the section subtree only.
      await injectAxe(page);
      await checkA11y(page, `#${sectionId}`, {
        detailedReport: false,
        axeOptions: {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
        },
      });
    });
  }

  for (const key of SKIPPED) {
    test.skip(`${key} (demo section pending)`, () => {});
  }
});
