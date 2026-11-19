// @ts-check
/**
 * Which registry component implements which APG pattern.
 *
 * Keys are cli/registry.js keys. A component listed here owes a `pattern`
 * cell in the coverage matrix (scripts/check-test-coverage.mjs), and
 * tests/components/apg-patterns.spec.cjs generates one test per entry of its
 * `implements` list. Components with no APG pattern are simply absent; the
 * list at the bottom says why for the ones that look like candidates.
 *
 * An implementation names:
 *
 *   pattern     key of tests/utils/apg/patterns.cjs (which holds the APG URL)
 *   label       what sets this check apart when a component runs a pattern twice
 *   edit        rewrite of the registry usage before mounting, when the
 *               pattern needs more than the usage shows (a third tab, a
 *               second thumb)
 *   viewport    viewport the pattern applies to (a mobile-only toggle)
 *   setup       runs once after mount (init functions, opening a popup)
 *   parts       where the pattern's parts live in this component's markup;
 *               parts left out are found by role
 *   actions     what only the component knows how to do or report
 *   claims      optional keys and behaviours the component's contract promises;
 *               APG-optional checks run only for these
 *   deviations  rules or keys the component handles differently, each with
 *               the reason and an `instead` assertion of what it does. A
 *               recorded rule must still fail: once the component meets it
 *               the check asks for the record to be deleted. `live: true`
 *               repeats `instead` after every key, for a state that has to
 *               keep following the real one.
 *                 kind: 'native'      a native HTML element carries the semantics
 *                 kind: 'deliberate'  a documented, defensible design choice
 *                 kind: 'defect'      a real APG gap that is not fixed yet
 *   fixme       reason the whole check waits on another change
 *
 * `note` on a component says when the mapping itself is debatable.
 */

const NATIVE_DIALOG_TAB = {
  kind: 'native',
  reason: 'A native modal <dialog> makes the rest of the page inert instead of scripting a Tab loop: from the last control Tab reaches the browser\'s own UI and then the first control again. Focus can never land on the page behind it, which is what the APG loop is for.',
  instead: async (t) => {
    // Nothing outside the dialog can take focus while it is open...
    for (const outside of [t.before, t.after]) {
      await outside.evaluate((el) => el.focus());
      await t.expect.poll(() => outside.evaluate((el) => el === document.activeElement), 'the page behind a modal dialog is inert').toBe(false);
    }
    // ...and Tab from either end stays in the dialog or leaves the document.
    const dialog = t.part('dialog');
    const ends = await dialog.evaluateHandle((root) => {
      const stops = [...root.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')].filter((el) => el.tabIndex >= 0 && !el.matches(':disabled'));
      return [stops[0], stops.at(-1)];
    });
    for (const [index, key] of [[1, 'Tab'], [0, 'Shift+Tab']]) {
      await ends.evaluate((els, i) => els[i].focus(), index);
      await t.press(key);
      await t.expect.poll(() => dialog.evaluate((el) => el.contains(document.activeElement) || document.activeElement === document.body)).toBe(true);
    }
    await ends.evaluate((els) => els[0].focus());
  },
};

const NATIVE_DETAILS = 'A native <details>/<summary> pair is the disclosure: browsers expose the summary as an expandable button whose state is the open attribute, with no ARIA to keep in sync. APG prefers native semantics where they exist.';

const TOGGLE_GROUP_PARTS = { button: '.ren-toggle-group-item', toggle: '.ren-toggle-group-item' };

const TOGGLE_GROUP_ACTIONS = {
  // What the component reports as its value, as one boolean per item.
  pressed: (t) => t.page.locator('ren-toggle-group').evaluate((group) => {
    const value = [].concat(group.value ?? []);
    return [...group.querySelectorAll('.ren-toggle-group-item')].map((item) => value.includes(item.dataset.value));
  }),
};

const CAROUSEL_PARTS = {
  carousel: 'ren-carousel',
  slide: '.ren-carousel-slide',
  previous: '.ren-carousel-prev',
  next: '.ren-carousel-next',
  rotation: '.ren-carousel-rotation',
  control: '.ren-carousel-rotation, .ren-carousel-prev, .ren-carousel-next, .ren-carousel-dot',
  pickerGroup: '.ren-carousel-dots',
  picker: '.ren-carousel-dot',
};

const CAROUSEL_ACTIONS = {
  currentSlide: (t) => t.page.locator('.ren-carousel-slide').evaluateAll((slides) => slides.findIndex((slide) => slide.getAttribute('aria-current') === 'true')),
  rotates: (t) => t.page.locator('ren-carousel').evaluate((el) => el.hasAttribute('autoplay')),
  // data-autoplay is the public state attribute: present only while slides are advancing.
  isRotating: (t) => t.page.locator('ren-carousel').evaluate((el) => el.hasAttribute('data-autoplay')),
  hasRotationControl: (t) => t.page.locator('ren-carousel .ren-carousel-rotation').count().then((count) => count > 0),
};

// The slide picker follows the "grouped" carousel style in three documented ways of its own.
const CAROUSEL_PICKER_DEVIATIONS = [
  {
    rule: 'picker-group',
    kind: 'deliberate',
    reason: 'The slide picker is a named list (<ul aria-label>) of buttons rather than role="group": a list also announces how many slides there are and where each button sits among them, which a group does not.',
    instead: async (t) => {
      await t.expect(t.part('pickerGroup')).toHaveRole('list');
      await t.expect(t.part('pickerGroup')).toHaveAccessibleName(/\S/);
      await t.expect(t.part('pickerGroup').locator(':scope > li > button')).toHaveCount(await t.part('slide').count());
    },
  },
  {
    rule: 'picker-names',
    kind: 'deliberate',
    reason: 'Each picker button is named for what it does ("Go to slide 2") and points at its slide with aria-controls; repeating the slide\'s own name ("2 of 3") would not say that activating it changes the slide.',
    instead: async (t) => {
      const pickers = t.part('picker');
      for (let i = 0; i < (await pickers.count()); i += 1) {
        await t.expect(pickers.nth(i)).toHaveAccessibleName(new RegExp(`\\b${i + 1}\\b`));
        await t.expect(pickers.nth(i)).toHaveAttribute('aria-controls', await t.part('slide').nth(i).getAttribute('id'));
      }
    },
  },
  {
    rule: 'picker-current',
    kind: 'deliberate',
    reason: 'The picker for the displayed slide carries aria-current="true" instead of aria-disabled="true": "current" is the state it is in, and the button stays operable (activating it is a no-op) rather than announcing itself as unavailable.',
    live: true,
    instead: async (t) => {
      const pickers = t.part('picker');
      const marked = () => pickers.evaluateAll((els) => els.map((el) => el.getAttribute('aria-current') === 'true'));
      await t.expect.poll(async () => (await marked()).indexOf(true), 'the picker of the displayed slide is the current one').toBe(await t.act('currentSlide'));
      t.expect((await marked()).filter(Boolean)).toHaveLength(1);
    },
  },
];

const PATTERN_MAP = {
  /* ── Primitives ── */

  button: {
    implements: [{ pattern: 'button' }],
  },

  checkbox: {
    implements: [{ pattern: 'checkbox' }],
  },

  switch: {
    implements: [{ pattern: 'switch' }],
  },

  radio: {
    implements: [
      { pattern: 'radio' },
      {
        pattern: 'radio',
        label: 'with a radio checked in the markup',
        edit: (usage) => usage.replace('value="b"', 'value="b" checked'),
      },
    ],
  },

  breadcrumb: {
    implements: [{ pattern: 'breadcrumb' }],
  },

  link: {
    implements: [{ pattern: 'link' }],
  },

  pagination: {
    note: 'Debatable: APG has no pagination pattern. The component is a labelled navigation landmark with aria-current, the same structure as Breadcrumb, so it is held to the Landmarks pattern.',
    implements: [{ pattern: 'landmarks' }],
  },

  /* ── Composites ── */

  dialog: {
    implements: [{
      pattern: 'dialog',
      actions: { open: (t) => t.page.locator('ren-dialog').evaluate((el) => { el.open(); }) },
    }],
  },

  'alert-dialog': {
    note: 'The contract\'s canonical markup adds closedby="none" so Escape cannot dismiss a destructive confirmation. That documented choice is not part of the registry usage checked here; browsers without closedby support close on Escape either way.',
    implements: [{
      pattern: 'alertdialog',
      parts: { message: '.ren-alert-dialog-description' },
      actions: { open: (t) => t.page.locator('dialog.ren-alert-dialog').evaluate((el) => { el.showModal(); }) },
      deviations: [
        { rule: 'tab-wraps', ...NATIVE_DIALOG_TAB },
        { rule: 'shift-tab-wraps', ...NATIVE_DIALOG_TAB },
      ],
    }],
  },

  sheet: {
    implements: [{
      pattern: 'dialog',
      parts: { dialog: 'ren-sheet dialog' },
      actions: {
        open: async (t) => {
          const trigger = t.page.locator('[data-sheet-trigger]');
          await trigger.focus();
          await t.press('Enter');
          return trigger;
        },
      },
      deviations: [
        { rule: 'tab-wraps', ...NATIVE_DIALOG_TAB },
        { rule: 'shift-tab-wraps', ...NATIVE_DIALOG_TAB },
      ],
    }],
  },

  popover: {
    note: 'Debatable: APG has no non-modal dialog pattern. The trigger and its panel are a Disclosure (a button whose aria-expanded follows the panel); the panel\'s own role="dialog" aria-modal="false" is outside any APG pattern.',
    implements: [{
      pattern: 'disclosure',
      parts: { button: '#account-trigger', content: 'ren-popover' },
      claims: ['moves focus into the content'],
    }],
  },

  tooltip: {
    implements: [{
      pattern: 'tooltip',
      parts: { trigger: '.ren-tooltip-trigger', tooltip: 'ren-tooltip' },
    }],
  },

  'hover-card': {
    note: 'Debatable: a hover card is richer than a tooltip (header, body), but it is wired and behaves as one: role="tooltip", described-by from the trigger, shown on hover and focus, never focusable. APG sends anything interactive to a non-modal dialog, which is ren-popover.',
    implements: [{
      pattern: 'tooltip',
      parts: { trigger: '#profile-trigger', tooltip: '.ren-hover-card' },
    }],
  },

  tabs: {
    implements: [{
      pattern: 'tabs',
      // Three tabs, so first, middle and last are different tabs.
      edit: (usage) => usage
        .replace('<button class="ren-tab" role="tab">Security</button>', '<button class="ren-tab" role="tab">Security</button><button class="ren-tab" role="tab">Billing</button>')
        .replace('</ren-tabs>', '  <div class="ren-tab-panel" role="tabpanel">Billing settings</div>\n</ren-tabs>'),
      claims: ['Home/End'],
    }],
  },

  accordion: {
    implements: [{
      pattern: 'accordion',
      // The panel has to be an element for its visibility to be observable.
      edit: (usage) => usage.replaceAll('    Content\n', '    <p>Content</p>\n'),
      parts: { header: 'ren-accordion summary', panel: 'ren-accordion details > p' },
      claims: ['one panel at a time'],
      deviations: [
        {
          rule: 'header-heading',
          kind: 'native',
          reason: `${NATIVE_DETAILS} A <summary> cannot sit inside a heading; a heading may be placed inside the summary when the page outline needs one.`,
          instead: async (t) => {
            const sections = t.page.locator('ren-accordion > details');
            await t.expect(sections.locator(':scope > summary:first-child')).toHaveCount(await sections.count());
          },
        },
        {
          rule: 'header-controls',
          kind: 'native',
          reason: `${NATIVE_DETAILS} The summary controls the rest of its own <details>, so there is no ID relationship to declare.`,
          instead: async (t) => {
            const headers = t.part('header');
            for (let i = 0; i < (await headers.count()); i += 1) {
              const open = await headers.nth(i).evaluate((summary) => summary.parentElement.open);
              await t.expect(t.part('panel').nth(i)).toBeVisible({ visible: open });
            }
          },
        },
      ],
    }],
  },

  collapsible: {
    implements: [{
      pattern: 'disclosure',
      parts: { button: 'details.ren-collapsible > summary', content: 'details.ren-collapsible > p' },
    }],
  },

  menu: {
    implements: [
      {
        pattern: 'menu-button',
        parts: { button: '#actions-trigger', menu: 'ren-menu' },
        claims: ['ArrowDown opens'],
      },
      {
        pattern: 'menu',
        parts: { menu: 'ren-menu', invoker: '#actions-trigger' },
        actions: {
          open: async (t) => {
            await t.page.locator('#actions-trigger').focus();
            await t.press('Enter');
          },
        },
        claims: ['Home/End'],
      },
    ],
  },

  'context-menu': {
    implements: [{
      pattern: 'menu',
      parts: { menu: 'ren-context-menu', invoker: '.ren-context-menu-trigger' },
      actions: {
        open: async (t) => {
          await t.page.locator('.ren-context-menu-trigger').focus();
          await t.press('Shift+F10');
        },
      },
      claims: ['Home/End'],
    }],
  },

  select: {
    note: 'Debatable: ren-select is a select-only Combobox (the trigger has role="combobox") whose popup follows the Listbox pattern. Both are checked.',
    implements: [
      {
        pattern: 'combobox',
        // focusOnHover: a pointer resting where the list opens would move the active option.
        setup: (t) => t.page.mouse.move(1, 1000),
        parts: { combobox: 'ren-select [data-select-trigger]', popup: 'ren-select [data-select-content]' },
        deviations: [
          {
            rule: 'focus-stays-on-combobox',
            kind: 'deliberate',
            reason: 'The popup is a Listbox that takes real DOM focus (roving tabindex), as APG\'s Listbox pattern describes, instead of leaving focus on the trigger with aria-activedescendant. The trigger is a button with nothing to type into, so no editing is lost by moving focus, and each option is a focus target the browser scrolls into view. Escape and Enter bring focus back to the trigger.',
            instead: async (t) => {
              await t.expect(t.part('option').first()).toBeFocused();
              await t.expect(t.part('combobox')).not.toHaveAttribute('aria-activedescendant', /./);
            },
          },
          {
            rule: 'selection-follows-focus',
            kind: 'deliberate',
            reason: 'aria-selected marks the committed value, the one the trigger shows; moving through the options does not change the value until Enter. APG allows either model for a listbox ("Deciding When to Make Selection Automatically Follow Focus").',
            instead: async (t) => {
              await t.expect(t.part('option').nth(1)).toBeFocused();
              await t.expect(t.part('option').nth(1)).toHaveAttribute('aria-selected', 'false');
            },
          },
        ],
      },
      {
        pattern: 'listbox',
        setup: (t) => t.page.mouse.move(1, 1000),
        parts: { listbox: 'ren-select [data-select-content]' },
        actions: {
          focusListbox: async (t) => {
            await t.page.locator('ren-select [data-select-trigger]').focus();
            await t.press('ArrowDown');
          },
        },
        claims: ['part of a combobox', 'Home/End'],
      },
    ],
  },

  combobox: {
    implements: [{
      pattern: 'combobox',
      deviations: [{
        rule: 'selection-follows-focus',
        kind: 'deliberate',
        reason: 'aria-selected marks the committed value (the option the check mark is on); the option being browsed is conveyed by aria-activedescendant alone. Arrowing through suggestions therefore never changes the value until Enter.',
        instead: async (t) => {
          await t.expect(t.part('combobox')).toHaveAttribute('aria-activedescendant', await t.part('option').nth(1).getAttribute('id'));
          await t.expect(t.part('option').nth(1)).toHaveAttribute('aria-selected', 'false');
        },
      }],
    }],
  },

  slider: {
    implements: [
      { pattern: 'slider', claims: ['PageUp/PageDown'] },
      {
        pattern: 'slider-multithumb',
        // The documented dual-thumb markup (docs/components/ren-slider.html).
        edit: () => `<ren-slider class="ren-slider" show-value>
  <div class="ren-slider-range">
    <div class="ren-slider-track-input"></div>
    <input type="range" min="0" max="100" step="5" value="20" aria-label="Minimum price">
    <input type="range" min="0" max="100" step="5" value="80" aria-label="Maximum price">
  </div>
</ren-slider>`,
        deviations: [{
          rule: 'dependent-range',
          kind: 'native',
          reason: 'Both thumbs are native range inputs on one rail and must share one scale to line up; their min and max cannot follow the other thumb, and ARIA in HTML tells authors not to override them with aria-valuemin / aria-valuemax. The limit is enforced by clamping instead.',
          instead: async (t) => {
            const [lower, upper] = [t.part('slider').first(), t.part('slider').nth(1)];
            await lower.focus();
            await t.press('End');
            await t.expect.poll(() => lower.evaluate((el) => el.value)).toBe(await upper.evaluate((el) => el.value));
            await t.press('Home');
            await t.expect.poll(() => lower.evaluate((el) => el.value)).toBe('0');
          },
        }],
      },
    ],
  },

  'toggle-group': {
    note: 'Debatable: a role="group" of toggle buttons is the Button pattern (aria-pressed). Its arrow-key roving focus is borrowed from Toolbar and its single mode resembles a Radio Group, but it claims neither role, so only Button is checked.',
    implements: [
      { pattern: 'button', parts: TOGGLE_GROUP_PARTS, actions: TOGGLE_GROUP_ACTIONS },
      {
        pattern: 'button',
        label: 'type="multiple"',
        edit: (usage) => usage.replace('type="single"', 'type="multiple"'),
        parts: TOGGLE_GROUP_PARTS,
        actions: TOGGLE_GROUP_ACTIONS,
        // In multiple mode a pressed item can be released again.
        claims: ['toggles off'],
      },
    ],
  },

  'number-field': {
    implements: [{
      pattern: 'spinbutton',
      parts: { spinbutton: '.ren-number-field-input' },
    }],
  },

  calendar: {
    note: 'Debatable: a month of day buttons is a layout Grid ("a set of interactive elements, such as links, buttons, or checkboxes"), the structure APG\'s own Date Picker examples use. Its arrow keys run on into the next week and month, which the layout-grid keys allow.',
    implements: [{
      pattern: 'grid',
      parts: { grid: 'ren-calendar [role="grid"]', gridcell: 'ren-calendar .ren-calendar-day' },
      actions: {
        selectedCells: (t) => t.page.locator('ren-calendar').evaluate((calendar) => {
          const value = calendar.getValue?.() ?? calendar.value ?? calendar.getAttribute('value');
          const iso = value instanceof Date
            ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
            : String(value ?? '');
          return [...calendar.querySelectorAll('.ren-calendar-day')].flatMap((day, index) => (day.dataset.date === iso ? [index] : []));
        }),
      },
      claims: ['selection'],
    }],
  },

  'date-picker': {
    note: 'Debatable: APG\'s Date Picker Dialog example is a modal dialog. ren-date-picker opens a non-modal popover, for which APG has no pattern, so the trigger and its panel are held to Disclosure; the calendar inside is covered by ren-calendar (Grid).',
    implements: [{
      pattern: 'disclosure',
      parts: { button: '.ren-date-picker-trigger', content: '.ren-date-picker-dropdown' },
      claims: ['moves focus into the content'],
    }],
  },

  'date-range-picker': {
    note: 'Debatable, as for ren-date-picker: the trigger and its non-modal panel are a Disclosure. The preset list inside is a Listbox.',
    implements: [
      {
        pattern: 'disclosure',
        parts: { button: '.ren-date-range-trigger', content: '.ren-date-range-dropdown' },
        claims: ['moves focus into the content'],
      },
      {
        pattern: 'listbox',
        parts: { listbox: '.ren-date-range-presets', option: '.ren-date-range-preset' },
        actions: {
          focusListbox: async (t) => {
            await t.page.locator('.ren-date-range-trigger').focus();
            await t.press('Enter');
          },
        },
        claims: ['Home/End'],
      },
    ],
  },

  carousel: {
    implements: [
      { pattern: 'carousel', parts: CAROUSEL_PARTS, actions: CAROUSEL_ACTIONS, deviations: CAROUSEL_PICKER_DEVIATIONS },
      {
        pattern: 'carousel',
        label: 'with the fallback label',
        // No author label: the component names itself from utils/i18n.js.
        edit: (usage) => usage.replace(' aria-label="Featured articles"', ''),
        parts: CAROUSEL_PARTS,
        actions: CAROUSEL_ACTIONS,
        deviations: CAROUSEL_PICKER_DEVIATIONS,
      },
      {
        pattern: 'carousel',
        label: 'with autoplay',
        // A long interval: the checks read the rotating state, they never wait for a tick.
        edit: (usage) => usage.replace('<ren-carousel ', '<ren-carousel autoplay="60000" '),
        parts: CAROUSEL_PARTS,
        actions: CAROUSEL_ACTIONS,
        deviations: CAROUSEL_PICKER_DEVIATIONS,
      },
    ],
  },

  toolbar: {
    implements: [{
      pattern: 'toolbar',
      // The usage ships an inline module that calls this; innerHTML does not run it.
      setup: (t) => t.page.evaluate(() => import('/components/composites/ren-toolbar/ren-toolbar.js').then((m) => m.initAllToolbars())),
      parts: { control: '.ren-toolbar-item' },
      claims: ['Home/End', 'returns to the last control'],
    }],
  },

  'color-picker': {
    note: 'Debatable: the trigger and its panel are a Disclosure (non-modal popover, as for ren-popover). Inside, the hue and alpha tracks are Sliders. The saturation/brightness area is a two-dimensional slider (Up/Down drive a second axis, reported in aria-valuetext), which the one-dimensional APG Slider pattern does not describe; its keys and ARIA are held by tests/components/keyboard-contracts.spec.cjs.',
    implements: [
      {
        pattern: 'disclosure',
        parts: { button: '.ren-color-picker-trigger', content: '.ren-color-picker-dropdown' },
      },
      {
        pattern: 'slider',
        parts: { slider: '.ren-color-picker-hue, .ren-color-picker-alpha' },
        setup: async (t) => {
          await t.page.locator('.ren-color-picker-trigger').focus();
          await t.press('Enter');
          await t.expect(t.page.locator('.ren-color-picker-dropdown')).toBeVisible();
        },
      },
    ],
  },

  /* ── Patterns ── */

  nav: {
    implements: [
      { pattern: 'landmarks' },
      {
        pattern: 'disclosure',
        // The menu toggle only exists below the mobile breakpoint.
        viewport: { width: 480, height: 800 },
        parts: { button: '.ren-nav-toggle', content: '.ren-nav-links' },
      },
    ],
  },

  sidebar: {
    implements: [
      { pattern: 'landmarks' },
      {
        pattern: 'disclosure',
        parts: { button: '.ren-sidebar-toggle', content: '.ren-sidebar-item-text' },
      },
    ],
  },

  command: {
    note: 'Debatable: the palette is a modal Dialog. Its filter-as-you-type list is not exposed as a Combobox (the items are plain buttons, reachable with Tab and the arrow keys), so that pattern is not claimed.',
    implements: [{
      pattern: 'dialog',
      parts: { dialog: 'ren-command dialog' },
      actions: { open: (t) => t.page.locator('ren-command').evaluate((el) => { el.open(); }) },
      deviations: [
        { rule: 'tab-wraps', ...NATIVE_DIALOG_TAB },
        { rule: 'shift-tab-wraps', ...NATIVE_DIALOG_TAB },
      ],
    }],
  },

  table: {
    implements: [{
      pattern: 'table',
      parts: { table: 'ren-table table' },
      actions: {
        // Sort by the first sortable column; returns its index.
        sort: async (t) => {
          const header = t.page.locator('ren-table th.ren-th-sortable').first();
          await header.locator('button.ren-th-sort').focus();
          await t.press('Enter');
          return header.evaluate((th) => th.cellIndex);
        },
        // What the rows actually show, not what aria-sort says.
        rowOrder: (t, column) => t.page.locator('ren-table table').evaluate((table, index) => {
          const values = [...table.tBodies[0].rows].map((row) => row.cells[index].textContent.trim());
          const ascending = [...values].sort((a, b) => a.localeCompare(b));
          if (values.join('\n') === ascending.join('\n')) return 'ascending';
          if (values.join('\n') === ascending.reverse().join('\n')) return 'descending';
          return 'no';
        }, column),
      },
    }],
  },

  menubar: {
    implements: [{
      pattern: 'menubar',
      claims: ['Home/End'],
    }],
  },

  toast: {
    note: 'Debatable: only a toast with status "danger" is an Alert (role="alert"). Every other toast is role="status", for which APG has no pattern.',
    implements: [{
      pattern: 'alert',
      parts: { alert: 'ren-toast-viewport .ren-toast[role="alert"]' },
      actions: {
        show: (t) => t.page.evaluate(() => import('/components/composites/ren-toast/ren-toast.js').then(({ toast }) => { toast({ title: 'Upload failed', description: 'Try again', status: 'danger' }); })),
        dismissesItself: (t) => t.page.locator('ren-toast-viewport .ren-toast[role="alert"]').first().evaluate((el) => el.hasAttribute('data-duration')),
      },
      deviations: [{
        rule: 'alert-persists',
        kind: 'deliberate',
        reason: 'A toast is transient by design. A danger toast stays twice as long as the others (8 s), its timer pauses while it is hovered or holds focus, and duration: 0 keeps it until the user closes it.',
        instead: async (t) => {
          const alert = t.part('alert').first();
          await t.expect(alert).toHaveAttribute('data-duration', '8000');
          await t.page.evaluate(() => import('/components/composites/ren-toast/ren-toast.js').then(({ toast }) => { toast({ title: 'Stays', status: 'danger', duration: 0 }); }));
          const persistent = t.page.locator('ren-toast-viewport .ren-toast[role="alert"]', { hasText: 'Stays' });
          await t.expect(persistent).toBeVisible();
          await t.expect(persistent).not.toHaveAttribute('data-duration', /./);
          await t.expect(persistent.getByRole('button')).toHaveCount(1);
        },
      }],
    }],
  },
};

/**
 * Registry components that look like APG candidates and are not mapped:
 *
 *   progress      role="progressbar". APG's Meter pattern says a meter "should
 *                 not be used to indicate progress"; APG has no progressbar pattern.
 *   separator     a static <hr> / role="separator". APG's Window Splitter is a
 *                 focusable, movable separator.
 *   banner        role="status" by default; its danger variant is a static
 *                 role="alert" container with no behaviour to conform.
 *   form          not a pattern; its error summary is a role="alert" that takes
 *                 focus on an invalid submit (the GOV.UK error-summary design).
 *   scroll-area   role="region" there names a focusable scroll container, not a
 *                 page landmark.
 *   ai            a message thread; APG's Feed is for infinite scrolling
 *                 article lists, and there is no log pattern.
 *   field, otp, dropzone, tag, card, avatar, badge, icon, kbd, skeleton,
 *   spinner, empty-state: no APG pattern.
 *
 * APG patterns no registry component implements: Feed, Meter, Tree View,
 * Treegrid, Window Splitter.
 */

module.exports = { PATTERN_MAP };
