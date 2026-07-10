---
type: "RenDS Component"
title: ren-date-picker
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-date-picker
sourcePath: components/composites/ren-date-picker
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - composite
  - ren10
  - rends
---

# ren-date-picker

Source path: `components/composites/ren-date-picker`

## Relationships

- `exposes_selector` -> [.ren-calendar](../../selectors/ren-calendar.md)
- `exposes_selector` -> [.ren-date-picker](../../selectors/ren-date-picker.md)
- `exposes_selector` -> [.ren-date-picker-dropdown](../../selectors/ren-date-picker-dropdown.md)
- `exposes_selector` -> [.ren-date-picker-preset](../../selectors/ren-date-picker-preset.md)
- `exposes_selector` -> [.ren-date-picker-presets](../../selectors/ren-date-picker-presets.md)
- `exposes_selector` -> [.ren-date-picker-trigger](../../selectors/ren-date-picker-trigger.md)
- `exposes_selector` -> [.ren-date-picker-value](../../selectors/ren-date-picker-value.md)
- `has_contract` -> [ren-date-picker component.md](../../foundation/contract-composite-ren-date-picker.md)
- `has_css` -> [ren-date-picker.css](../../css/ren-date-picker-css.md)
- `has_docs_page` -> [ren-date-picker docs](../../docs/ren-date-picker-docs.md)
- `has_js` -> [ren-date-picker.js](../../javascript/ren-date-picker-js.md)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-border-strong](../../tokens/color-border-strong.md)
- `uses_token` -> [--color-danger](../../tokens/color-danger.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-fill-active](../../tokens/color-fill-active.md)
- `uses_token` -> [--color-fill-hover](../../tokens/color-fill-hover.md)
- `uses_token` -> [--color-success](../../tokens/color-success.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--color-surface-raised](../../tokens/color-surface-raised.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--label-size](../../tokens/label-size.md)
- `uses_token` -> [--label-weight](../../tokens/label-weight.md)
- `uses_token` -> [--radius-lg](../../tokens/radius-lg.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--shadow-lg](../../tokens/shadow-lg.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-1-5](../../tokens/space-1-5.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--touch-min](../../tokens/touch-min.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-calendar",
    ".ren-date-picker",
    ".ren-date-picker-dropdown",
    ".ren-date-picker-preset",
    ".ren-date-picker-presets",
    ".ren-date-picker-trigger",
    ".ren-date-picker-value"
  ],
  "tokens": [
    "--body-size",
    "--color-accent",
    "--color-border",
    "--color-border-strong",
    "--color-danger",
    "--color-fill",
    "--color-fill-active",
    "--color-fill-hover",
    "--color-success",
    "--color-surface",
    "--color-surface-raised",
    "--color-text",
    "--color-text-muted",
    "--duration-enter",
    "--ease-enter",
    "--label-size",
    "--label-weight",
    "--radius-lg",
    "--radius-md",
    "--shadow-lg",
    "--space-1",
    "--space-1-5",
    "--space-2",
    "--space-3",
    "--touch-min",
    "--transition-tactile"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-date-picker Component Contract

Date input composite using a calendar popover.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-date-picker` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-date-picker` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Date Picker composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "User needs to pick a single date (or a single contiguous range) from a calendar popover."
    - "Trigger should be a button-like control that opens a positioned popover (CSS anchor positioning with position-area) with an embedded <ren-calendar>."
    - "The form needs an ISO-string value submitted via a hidden input under a given name."
    - "Preset shortcuts (Today, Tomorrow, This Week) should appear alongside the calendar grid."
    - "Mobile must adapt to a bottom sheet automatically; desktop floats below the trigger."
  avoidWhen:
    - "You need two independent start/end inputs with apply/cancel — use ren-date-range-picker."
    - "You only need a raw native <input type=\"date\"> with no popover styling — fall back to base/primitive-zero."
    - "You need a non-date generic dropdown — use ren-menu, ren-select, or ren-popover."
    - "You need a multi-month calendar surface without an input trigger — render <ren-calendar> directly."

canonicalImports:
  css:
    - "rends/components/composites/ren-date-picker/ren-date-picker.css"
  js:
    - "rends/components/composites/ren-date-picker/ren-date-picker.js"
  notes:
    - "Also requires ren-calendar to be registered (the component instantiates <ren-calendar> inside its dropdown)."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Use <ren-date-picker> as the host element so the upgrade lifecycle wires up the trigger, dropdown, and hidden input."
  - "Trigger must be a real <button class=\"ren-date-picker-trigger\"> with type=\"button\", aria-haspopup=\"dialog\", and aria-expanded; the component sets these if it renders the trigger itself."
  - "The dropdown surface is a <div class=\"ren-date-picker-dropdown\" popover=\"manual\"> — keep the popover attribute so showPopover()/hidePopover() work."
  - "Inside the dropdown render a <ren-calendar> child; the host syncs its mode/locale/min/max attributes onto it."
  - "If you need form submission, set name=\"…\" on <ren-date-picker> so the auto-injected <input type=\"hidden\"> carries the ISO value."
  - "Use placement=\"bottom\" by default; the host and .ren-date-picker-dropdown mirror the preferred side to data-side."

forbiddenPatterns:
  - "Styling a <div> or <span> as the trigger instead of a real <button> — keyboard activation and aria-expanded depend on the button."
  - "Replacing the inner <ren-calendar> with raw markup — the host wires ren-date-select events directly to the calendar element."
  - "Hardcoding popover positioning offsets via inline styles — rely on anchor-name: --ren-date-picker-anchor, position-anchor, and position-area in the stylesheet."
  - "Toggling the dropdown by setting display: none — use open()/close()/toggle() on the host so aria-expanded and popover state stay in sync."
  - "Wrapping a native <input type=\"date\"> in .ren-date-picker — the component expects to own its trigger and popover."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-calendar-bg, --ren-calendar-border, --ren-calendar-day-size, --ren-calendar-radius, --ren-calendar-range-bg, --ren-calendar-selected-bg, --ren-calendar-selected-color, --ren-calendar-today-bg, --ren-calendar-width."
    - "Semantic surface tokens used by the trigger / dropdown: --color-surface, --color-surface-raised, --color-border, --color-border-strong, --color-text, --color-text-muted, --color-fill, --color-fill-hover, --color-fill-active, --color-accent, --color-danger, --color-success."
    - "Layout/motion tokens: --space-*, --radius-md, --radius-lg, --shadow-lg, --duration-enter, --ease-enter, --transition-tactile, --touch-min, --body-size, --label-size."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / rgb() colors for trigger or dropdown chrome; theme via --color-* and the --ren-calendar-* token API."
    - "Custom transition/animation durations; reuse --duration-enter and --ease-enter so reduced-motion overrides apply."

accessibility:
  required:
    - "Trigger is a real <button type=\"button\"> with aria-haspopup=\"dialog\" and aria-expanded that flips true/false as the dropdown opens and closes."
    - "Trigger min-height is var(--touch-min) so the tap target meets 44px; do not reduce it for touch contexts."
    - ":focus-visible on the trigger and presets must show the --color-accent outline; do not remove it without restoring an equivalent ring."
    - "Escape closes the dropdown; Enter/Space on the trigger opens it; opening focuses the first non-disabled .ren-calendar-day."
    - "Error/success states (.ren-date-picker-error, .ren-date-picker-success) must be paired with a text message — do not rely on border color alone."
    - "Closing returns focus to the trigger; do not break this contract when overriding open()/close()."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-date-picker/ren-date-picker.css">
<script type="module" src="rends/components/composites/ren-date-picker/ren-date-picker.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-date-picker">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-calendar`
- `.ren-date-picker`
- `.ren-date-picker-dropdown`
- `.ren-date-picker-empty`
- `.ren-date-picker-error`
- `.ren-date-picker-preset`
- `.ren-date-picker-presets`
- `.ren-date-picker-range`
- `.ren-date-picker-success`
- `.ren-date-picker-trigger`
- `.ren-date-picker-value`

## States And Attributes

- `[data-side]`
- `placement`
- `:active`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-calendar-bg`
- `--ren-calendar-border`
- `--ren-calendar-day-size`
- `--ren-calendar-radius`
- `--ren-calendar-range-bg`
- `--ren-calendar-selected-bg`
- `--ren-calendar-selected-color`
- `--ren-calendar-today-bg`
- `--ren-calendar-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-date-picker/ren-date-picker.css`
- `components/composites/ren-date-picker/ren-date-picker.js`
- `docs/components/ren-date-picker.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ═══ REN DATE PICKER WEB COMPONENT ═══
   A composable date picker that wraps the calendar component
   with an input field and popover dropdown.
   Uses Popover API for positioning with CSS anchor positioning.
   ══════════════════════════════════════════════════════════════════ */

/* ═══ BASE WRAPPER ═══ */
.ren-date-picker {
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  position: relative;
}

/* ═══ TRIGGER INPUT ═══ */
.ren-date-picker-trigger {
  anchor-name: --ren-date-picker-anchor;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--body-size);
  font-family: inherit;
  cursor: pointer;
  transition: var(--transition-tactile);
  min-height: var(--touch-min);

  &:hover:not([disabled]) {
    border-color: var(--color-border-strong);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-color: var(--color-accent);
  }

  &[disabled] {
    background: var(--color-fill);
    color: var(--color-text-muted);
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* ═══ PLACEHOLDER TEXT ═══ */
  &::placeholder {
    color: var(--color-text-muted);
  }

  /* ═══ CALENDAR ICON (::after) ═══ */
  &::after {
    content: '📅';
    font-size: 1.25em;
    flex-shrink: 0;
    pointer-events: none;
  }
}

/* ═══ TRIGGER TEXT CONTENT ═══ */
.ren-date-picker-value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ═══ EMPTY STATE ═══ */
.ren-date-picker-trigger.ren-date-picker-empty {
  color: var(--color-text-muted);

  .ren-date-picker-value {
    display: none;
  }

  &::before {
    content: attr(data-placeholder);
    color: var(--color-text-muted);
  }
}

/* ═══ DROPDOWN CONTAINER (POPOVER) ═══ */
.ren-date-picker-dropdown {
  position-anchor: --ren-date-picker-anchor;
  position: absolute;
  position-area: bottom span-all;
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
  inset: auto;
  margin: 0;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  max-width: 400px;

  /* ═══ POPOVER API ═══ */
  &[popover] {
    padding: 0;
    margin: 0;
  }

  &:popover-open {
    background: var(--color-surface-raised);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    animation: ren-date-picker-popup-in var(--duration-enter) var(--ease-enter) both;
  }
}

.ren-date-picker-dropdown[data-side="bottom"],
.ren-date-picker-dropdown:not([data-side]) {
  position-area: bottom span-all;
  margin-block-start: var(--space-2);
  margin-block-end: 0;
  margin-inline: 0;
}

.ren-date-picker-dropdown[data-side="top"] {
  position-area: top span-all;
  margin-block-start: 0;
  margin-block-end: var(--space-2);
  margin-inline: 0;
}

.ren-date-picker-dropdown[data-side="right"] {
  position-area: right span-all;
  margin-block: 0;
  margin-inline-start: var(--space-2);
  margin-inline-end: 0;
}

.ren-date-picker-dropdown[data-side="left"] {
  position-area: left span-all;
  margin-block: 0;
  margin-inline-start: 0;
  margin-inline-end: var(--space-2);
}

/* ═══ FALLBACK POSITIONING (no complete anchor support) ═══ */
@supports not ((anchor-name: --ren-anchor) and
  (position-anchor: --ren-anchor) and
  (position-area: bottom span-all)) {
  .ren-date-picker-dropdown {
    position: fixed;
    top: auto;
    left: auto;
  }
}

/* ═══ ANIMATION: POPUP IN ═══ */
@starting-style {
  .ren-date-picker-dropdown:popover-open {
    opacity: 0;
    translate: 0 -8px;
  }
}

@keyframes ren-date-picker-popup-in {
  from {
    opacity: 0;
    translate: 0 -8px;
  }

  to {
    opacity: 1;
    translate: 0 0;
  }
}

/* ═══ CALENDAR INSIDE DROPDOWN ═══ */
.ren-date-picker-dropdown .ren-calendar {
  border: none;
  box-shadow: none;
  background: var(--color-surface-raised);
  padding: var(--space-3);
}

/* ═══ PRESETS SECTION ═══ */
.ren-date-picker-presets {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-3);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.ren-date-picker-preset {
  padding: var(--space-1-5) var(--space-3);
  background: var(--color-fill);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: var(--label-size);
  font-weight: var(--label-weight);
  cursor: pointer;
  transition: var(--transition-tactile);

  &:hover {
    background: var(--color-fill-hover);
    border-color: var(--color-border-strong);
  }

  &:active {
    background: var(--color-fill-active);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  &[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* ═══ RANGE MODE: SHOW START AND END ═══ */
.ren-date-picker.ren-date-picker-range .ren-date-picker-value::after {
  content: ' → ';
  margin: 0 var(--space-1);
}

/* ═══ DISABLED STATE ═══ */
.ren-date-picker[disabled] {
  opacity: 0.6;
  pointer-events: none;

  .ren-date-picker-trigger {
    cursor: not-allowed;
  }
}

/* ═══ REDUCED MOTION SUPPORT ═══ */
@media (prefers-reduced-motion: reduce) {
  .ren-date-picker-dropdown:popover-open {
    animation: none;
    opacity: 1;
    translate: 0 0;
  }

  .ren-date-picker-dropdown {
    transition: none;
  }
}

/* ═══ DARK MODE SUPPORT ═══ */
@media (prefers-color-scheme: dark) {
  .ren-date-picker-trigger,
  .ren-date-picker-dropdown {
    /* ═══ USES CSS VARIABLES - AUTO ADAPTS ═══ */
  }
}

/* ═══ MOBILE RESPONSIVENESS ═══ */
@media (max-width: 480px) {
  .ren-date-picker-dropdown {
    position: fixed !important;
    inset: auto 0 0 0 !important;
    max-width: none;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    max-height: 80vh;
    overflow-y: auto;

    &:popover-open {
      animation: ren-date-picker-mobile-in var(--duration-enter) var(--ease-enter) both;
    }
  }

  @starting-style {
    .ren-date-picker-dropdown:popover-open {
      translate: 0 100%;
      opacity: 0;
    }
  }

  @keyframes ren-date-picker-mobile-in {
    from {
      translate: 0 100%;
      opacity: 0;
    }

    to {
      translate: 0 0;
      opacity: 1;
    }
  }
}

/* ═══ ERROR STATE ═══ */
.ren-date-picker.ren-date-picker-error {
  .ren-date-picker-trigger {
    border-color: var(--color-danger);

    &:focus-visible {
      outline-color: var(--color-danger);
      border-color: var(--color-danger);
    }
  }
}

/* ═══ SUCCESS STATE ═══ */
.ren-date-picker.ren-date-picker-success {
  .ren-date-picker-trigger {
    border-color: var(--color-success);

    &:focus-visible {
      outline-color: var(--color-success);
      border-color: var(--color-success);
    }
  }
}

/* ═══ FORM INTEGRATION ═══ */
.ren-date-picker {
  /* ═══ ALLOW FORM STYLING ═══ */

  input[type='hidden'] {
    display: none;
  }
}


/* ═══ REN DATE PICKER WEB COMPONENT ═══
   A composable date picker that combines an input field with a calendar dropdown.

   Features:
   - Integrates RenCalendar component internally
   - Single and range date selection modes
   - Preset shortcuts (Today, Tomorrow, Next Week, etc.)
   - Popover API for dropdown positioning
   - Locale-aware date formatting
   - Focus management with blur/focus trapping
   - Form integration with hidden input

   Usage:
   <ren-date-picker placeholder="Select date" format="long" mode="single"></ren-date-picker>
  ══════════════════════════════════════════════════════════════════ */

const DATE_PICKER_SIDES = new Set(['top', 'right', 'bottom', 'left']);

function normalizeDatePickerSide(value) {
  const side = String(value || 'bottom').toLowerCase().split('-')[0];

  return DATE_PICKER_SIDES.has(side) ? side : 'bottom';
}

export class RenDatePicker extends HTMLElement {
  static observedAttributes = ['placement'];

  constructor() {
    super();

    /* ═══ STATE ═══ */
    this.calendar = null;
    this.dropdown = null;
    this.trigger = null;
    this.isOpen = false;
    this.selectedValue = null;
    this.selectedRange = null;

    /* ═══ CONFIGURATION ═══ */
    this.format = 'short'; // short, medium, long
    this.locale = 'en-US';
    this.mode = 'single'; // single, range
    this.placeholder = 'Select date';

    /* ═══ BIND METHODS ═══ */
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleTriggerKeyDown = this.handleTriggerKeyDown.bind(this);
    this.handleCalendarSelect = this.handleCalendarSelect.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
  }

  connectedCallback() {
    /* ═══ READ ATTRIBUTES ═══ */
    this.mode = this.getAttribute('mode') || 'single';
    this.format = this.getAttribute('format') || 'short';
    this.locale = this.getAttribute('locale') || 'en-US';
    this.placeholder = this.getAttribute('placeholder') || 'Select date';

    const minAttr = this.getAttribute('min');
    const maxAttr = this.getAttribute('max');

    /* ═══ RENDER COMPONENT ═══ */
    this.render();

    /* ═══ SET UP TRIGGER (must come after render) ═══ */
    this.trigger = this.querySelector('.ren-date-picker-trigger');
    if (this.trigger) {
      this.trigger.addEventListener('click', this.handleTriggerClick);
      this.trigger.addEventListener('keydown', this.handleTriggerKeyDown);
    }

    /* ═══ SET UP DROPDOWN (must come after render, before calendar) ═══ */
    this.dropdown = this.querySelector('[popover]');
    if (!this.dropdown) {
      this.dropdown = document.createElement('div');
      this.dropdown.className = 'ren-date-picker-dropdown';
      this.dropdown.setAttribute('popover', 'manual');
      this.appendChild(this.dropdown);
    }

    /* ═══ SET UP CALENDAR (must come after dropdown) ═══ */
    this.calendar = this.querySelector('ren-calendar');
    if (!this.calendar) {
      this.calendar = document.createElement('ren-calendar');
      this.calendar.setAttribute('mode', this.mode);
      if (this.locale) this.calendar.setAttribute('locale', this.locale);
      if (minAttr) this.calendar.setAttribute('min', minAttr);
      if (maxAttr) this.calendar.setAttribute('max', maxAttr);
      this.dropdown.appendChild(this.calendar);
    }

    this.syncPlacement();

    /* ═══ LISTEN TO CALENDAR EVENTS ═══ */
    this.calendar.addEventListener('ren-date-select', this.handleCalendarSelect);

    /* ═══ LISTEN TO DOCUMENT CLICKS ═══ */
    document.addEventListener('click', this.handleDocumentClick);

    /* ═══ SET INITIAL VALUE ═══ */
    const valueAttr = this.getAttribute('value');
    if (valueAttr) {
      this.setValue(valueAttr);
    }

    /* ═══ ADD TO FORM IF PARENT IS FORM ═══ */
    this.addHiddenInput();
  }

  disconnectedCallback() {
    if (this.trigger) {
      this.trigger.removeEventListener('click', this.handleTriggerClick);
      this.trigger.removeEventListener('keydown', this.handleTriggerKeyDown);
    }

    if (this.calendar) {
      this.calendar.removeEventListener('ren-date-select', this.handleCalendarSelect);
    }

    document.removeEventListener('click', this.handleDocumentClick);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'placement' && oldValue !== newValue) {
      this.syncPlacement();
    }
  }

  /* ═══ RENDER COMPONENT STRUCTURE ═══ */
  render() {
    this.classList.add('ren-date-picker');

    if (this.mode === 'range') {
      this.classList.add('ren-date-picker-range');
    }

    if (this.innerHTML.trim() === '') {
      /* ═══ CREATE TRIGGER ═══ */
      const trigger = document.createElement('button');
      trigger.className = 'ren-date-picker-trigger ren-date-picker-empty';
      trigger.setAttribute('type', 'button');
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('data-placeholder', this.placeholder);

      const valueSpan = document.createElement('span');
      valueSpan.className = 'ren-date-picker-value';
      trigger.appendChild(valueSpan);

      this.appendChild(trigger);

      /* ═══ CREATE DROPDOWN ═══ */
      const dropdown = document.createElement('div');
      dropdown.className = 'ren-date-picker-dropdown';
      dropdown.setAttribute('popover', 'manual');

      this.appendChild(dropdown);
    }
  }

  /* ═══ MIRROR PLACEMENT TO PUBLIC DATA ATTRIBUTES ═══ */
  syncPlacement() {
    const side = normalizeDatePickerSide(this.getAttribute('placement'));

    this.setAttribute('data-side', side);
    if (this.dropdown) {
      this.dropdown.setAttribute('data-side', side);
    }
  }

  /* ═══ ADD HIDDEN INPUT FOR FORM SUBMISSION ═══ */
  addHiddenInput() {
    let hidden = this.querySelector('input[type="hidden"]');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = this.getAttribute('name') || 'date-picker';
      this.appendChild(hidden);
    }
    this.hiddenInput = hidden;
  }

  /* ═══ HANDLE TRIGGER CLICK ═══ */
  handleTriggerClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.hasAttribute('disabled')) return;

    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /* ═══ HANDLE TRIGGER KEYBOARD ═══ */
  handleTriggerKeyDown(event) {
    if (this.hasAttribute('disabled')) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.open();
    }

    if (event.key === 'Escape') {
      this.close();
    }
  }

  /* ═══ HANDLE CALENDAR DATE SELECT ═══ */
  handleCalendarSelect(event) {
    const detail = event.detail;

    if (this.mode === 'single') {
      this.selectedValue = detail.date;
      this.updateTrigger(this.formatDate(detail.date));
      this.dispatchChangeEvent();
      this.close();
    } else if (this.mode === 'range') {
      this.selectedRange = detail.range;
      if (detail.range && detail.range.start && detail.range.end) {
        const formattedRange = `${this.formatDate(detail.range.start)} → ${this.formatDate(detail.range.end)}`;
        this.updateTrigger(formattedRange);
        this.dispatchChangeEvent();
        this.close();
      } else {
        const start = detail.range?.start ? this.formatDate(detail.range.start) : '';
        this.updateTrigger(start);
      }
    }
  }

  /* ═══ HANDLE DOCUMENT CLICK (CLOSE DROPDOWN ON OUTSIDE CLICK) ═══ */
  handleDocumentClick(event) {
    if (!this.contains(event.target) && this.isOpen) {
      this.close();
    }
  }

  /* ═══ OPEN DROPDOWN ═══ */
  open() {
    if (this.isOpen || this.hasAttribute('disabled')) return;

    if (!this.dropdown) return;

    /* ═══ SET UP POPOVER AND POSITIONING ═══ */
    this.syncPlacement();

    try {
      this.dropdown.showPopover();
    } catch (e) {
      /* ═══ FALLBACK FOR UNSUPPORTED BROWSERS ═══ */
      this.dropdown.style.display = 'block';
    }

    this.isOpen = true;

    if (this.trigger) {
      this.trigger.setAttribute('aria-expanded', 'true');
    }

    /* ═══ FOCUS CALENDAR ═══ */
    setTimeout(() => {
      if (this.calendar) {
        const firstDay = this.calendar.querySelector('.ren-calendar-day:not([disabled])');
        if (firstDay) {
          firstDay.focus();
        }
      }
    }, 100);

    this.dispatchEvent(
      new CustomEvent('ren-date-picker-open', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ CLOSE DROPDOWN ═══ */
  close() {
    if (!this.isOpen) return;

    if (!this.dropdown) return;

    try {
      this.dropdown.hidePopover();
    } catch (e) {
      /* ═══ FALLBACK FOR UNSUPPORTED BROWSERS ═══ */
      this.dropdown.style.display = 'none';
    }

    this.isOpen = false;

    if (this.trigger) {
      this.trigger.setAttribute('aria-expanded', 'false');
      this.trigger.focus();
    }

    this.dispatchEvent(
      new CustomEvent('ren-date-picker-close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ UPDATE TRIGGER TEXT ═══ */
  updateTrigger(formattedValue) {
    if (!this.trigger) return;

    const valueSpan = this.trigger.querySelector('.ren-date-picker-value');
    if (valueSpan) {
      valueSpan.textContent = formattedValue;
    }

    this.trigger.classList.remove('ren-date-picker-empty');

    /* ═══ UPDATE HIDDEN INPUT ═══ */
    if (this.hiddenInput) {
      this.hiddenInput.value = formattedValue;
    }
  }

  /* ═══ FORMAT DATE FOR DISPLAY ═══ */
  formatDate(date) {
    if (!date) return '';

    const formatter = new Intl.DateTimeFormat(this.locale, {
      year: 'numeric',
      month: this.format === 'short' ? '2-digit' : this.format === 'long' ? 'long' : 'short',
      day: '2-digit',
    });

    return formatter.format(date);
  }

  /* ═══ DISPATCH CHANGE EVENT ═══ */
  dispatchChangeEvent() {
    let value = null;
    let formattedValue = '';

    if (this.mode === 'single') {
      value = this.selectedValue ? this.dateToString(this.selectedValue) : null;
      formattedValue = this.selectedValue ? this.formatDate(this.selectedValue) : '';
    } else if (this.mode === 'range') {
      if (this.selectedRange && this.selectedRange.start && this.selectedRange.end) {
        value = {
          start: this.dateToString(this.selectedRange.start),
          end: this.dateToString(this.selectedRange.end),
        };
        formattedValue = `${this.formatDate(this.selectedRange.start)} → ${this.formatDate(this.selectedRange.end)}`;
      }
    }

    this.dispatchEvent(
      new CustomEvent('ren-change', {
        detail: {
          value,
          formattedValue,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ CONVERT DATE TO ISO STRING ═══ */
  dateToString(date) {
    return date.toISOString().split('T')[0];
  }

  /* ═══ PUBLIC METHODS ═══ */

  /* ═══ GET VALUE ═══ */
  getValue() {
    if (this.mode === 'single') {
      return this.selectedValue ? this.dateToString(this.selectedValue) : null;
    } else if (this.mode === 'range') {
      return this.selectedRange
        ? {
            start: this.dateToString(this.selectedRange.start),
            end: this.dateToString(this.selectedRange.end),
          }
        : null;
    }
  }

  /* ═══ SET VALUE ═══ */
  setValue(value) {
    if (this.mode === 'single' && typeof value === 'string') {
      this.selectedValue = new Date(value);
      this.calendar.setValue(value);
      this.updateTrigger(this.formatDate(this.selectedValue));
    } else if (this.mode === 'range' && value && typeof value === 'object') {
      this.selectedRange = {
        start: new Date(value.start),
        end: new Date(value.end),
      };
      this.calendar.setRange(value.start, value.end);
      const formatted = `${this.formatDate(this.selectedRange.start)} → ${this.formatDate(this.selectedRange.end)}`;
      this.updateTrigger(formatted);
    }
  }

  /* ═══ TOGGLE DROPDOWN ═══ */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /* ═══ GETTERS AND SETTERS ═══ */
  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
      if (this.trigger) this.trigger.disabled = true;
    } else {
      this.removeAttribute('disabled');
      if (this.trigger) this.trigger.disabled = false;
    }
  }

  get isOpened() {
    return this.isOpen;
  }

  set isOpened(val) {
    if (val) {
      this.open();
    } else {
      this.close();
    }
  }
}

/* ═══ REGISTER COMPONENT ═══ */
if (!customElements.get('ren-date-picker')) {
  customElements.define('ren-date-picker', RenDatePicker);
}
