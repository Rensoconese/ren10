---
type: "RenDS Component"
title: ren-slider
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-slider
sourcePath: components/composites/ren-slider
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

# ren-slider

Source path: `components/composites/ren-slider`

## Relationships

- `exposes_selector` -> [.ren-slider](../../selectors/ren-slider.md)
- `exposes_selector` -> [.ren-slider-danger](../../selectors/ren-slider-danger.md)
- `exposes_selector` -> [.ren-slider-label](../../selectors/ren-slider-label.md)
- `exposes_selector` -> [.ren-slider-lg](../../selectors/ren-slider-lg.md)
- `exposes_selector` -> [.ren-slider-mark](../../selectors/ren-slider-mark.md)
- `exposes_selector` -> [.ren-slider-mark-label](../../selectors/ren-slider-mark-label.md)
- `exposes_selector` -> [.ren-slider-mark-tick](../../selectors/ren-slider-mark-tick.md)
- `exposes_selector` -> [.ren-slider-marks](../../selectors/ren-slider-marks.md)
- `exposes_selector` -> [.ren-slider-range](../../selectors/ren-slider-range.md)
- `exposes_selector` -> [.ren-slider-sm](../../selectors/ren-slider-sm.md)
- `exposes_selector` -> [.ren-slider-success](../../selectors/ren-slider-success.md)
- `exposes_selector` -> [.ren-slider-track](../../selectors/ren-slider-track.md)
- `exposes_selector` -> [.ren-slider-track-input](../../selectors/ren-slider-track-input.md)
- `exposes_selector` -> [.ren-slider-value](../../selectors/ren-slider-value.md)
- `exposes_selector` -> [.ren-slider-vertical](../../selectors/ren-slider-vertical.md)
- `exposes_selector` -> [.ren-slider-warning](../../selectors/ren-slider-warning.md)
- `has_contract` -> [ren-slider component.md](../../foundation/contract-composite-ren-slider.md)
- `has_css` -> [ren-slider.css](../../css/ren-slider-css.md)
- `has_docs_page` -> [ren-slider docs](../../docs/ren-slider-docs.md)
- `has_js` -> [ren-slider.js](../../javascript/ren-slider-js.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-danger](../../tokens/color-danger.md)
- `uses_token` -> [--color-fill-active](../../tokens/color-fill-active.md)
- `uses_token` -> [--color-fill-subtle](../../tokens/color-fill-subtle.md)
- `uses_token` -> [--color-success](../../tokens/color-success.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--color-warning](../../tokens/color-warning.md)
- `uses_token` -> [--font-size-body-sm](../../tokens/font-size-body-sm.md)
- `uses_token` -> [--font-size-label](../../tokens/font-size-label.md)
- `uses_token` -> [--font-size-xs](../../tokens/font-size-xs.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--shadow-sm](../../tokens/shadow-sm.md)
- `uses_token` -> [--space-0-5](../../tokens/space-0-5.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)
- `uses_token` -> [--value](../../tokens/value.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-slider",
    ".ren-slider-danger",
    ".ren-slider-label",
    ".ren-slider-lg",
    ".ren-slider-mark",
    ".ren-slider-mark-label",
    ".ren-slider-mark-tick",
    ".ren-slider-marks",
    ".ren-slider-range",
    ".ren-slider-sm",
    ".ren-slider-success",
    ".ren-slider-track",
    ".ren-slider-track-input",
    ".ren-slider-value",
    ".ren-slider-vertical",
    ".ren-slider-warning"
  ],
  "tokens": [
    "--color-accent",
    "--color-danger",
    "--color-fill-active",
    "--color-fill-subtle",
    "--color-success",
    "--color-text",
    "--color-text-muted",
    "--color-warning",
    "--font-size-body-sm",
    "--font-size-label",
    "--font-size-xs",
    "--radius-full",
    "--shadow-sm",
    "--space-0-5",
    "--space-1",
    "--transition-tactile",
    "--value"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-slider Component Contract

Range input composite for numeric adjustment.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-slider` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-slider` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Slider composite behavior or visual role.
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
    - "User needs to pick a continuous numeric value within a known min/max range (volume, opacity, brightness, percentage)."
    - "You need a single-thumb slider or a dual-thumb range slider (.ren-slider-range) with two inputs."
    - "You need a visible value readout (.ren-slider-value via show-value attribute) and/or tick marks (.ren-slider-marks)."
    - "You need semantic color variants for status: .ren-slider-success / .ren-slider-warning / .ren-slider-danger."
    - "You need a size variant (.ren-slider-sm / .ren-slider-lg) or a vertical orientation (.ren-slider-vertical)."
    - "Native <input type=\"range\"> ARIA and keyboard support is sufficient (Arrow keys, Home/End, PageUp/PageDown)."
  avoidWhen:
    - "The choice is from a discrete enumerated list — use ren-select, ren-radio-group, or ren-toggle-group."
    - "The value is text, number-typed, or formatted (currency, date) — use ren-field with a typed input."
    - "The control toggles binary state — use ren-switch, ren-checkbox, or ren-toggle."
    - "You need rating stars — use ren-rating."

canonicalImports:
  css:
    - "rends/components/composites/ren-slider/ren-slider.css"
  js:
    - "rends/components/composites/ren-slider/ren-slider.js"
  notes:
    - "JS is required to compute the --value percentage CSS variable that paints the track fill; without it the gradient stays at 0%."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "<ren-slider> wraps a real <input type=\"range\"> with min / max / step / value set as attributes — never style a <div> as a slider."
  - "Pair the input with a real <label for=\"...\"> or set aria-label / aria-labelledby on the input for an accessible name."
  - "Use show-value attribute on <ren-slider> to opt into the .ren-slider-value readout; use label attribute to inject a .ren-slider-label."
  - "Dual-thumb range mode wraps two <input type=\"range\"> elements inside .ren-slider-range with a .ren-slider-track-input visual rail."
  - "Tick marks use .ren-slider-marks > .ren-slider-mark > (.ren-slider-mark-tick + .ren-slider-mark-label); preserve that structure."

forbiddenPatterns:
  - "Replacing <input type=\"range\"> with a <div> + JS drag — accessibility and form submission depend on the native input."
  - "Setting the track fill via inline background gradients; the JS updates --value and the CSS handles the gradient automatically."
  - "Hardcoding thumb colors (background: #fff / blue) on ::-webkit-slider-thumb or ::-moz-range-thumb — use --color-accent or the .ren-slider-success/warning/danger variants."
  - "Removing the focus-visible outline on ::-webkit-slider-thumb / ::-moz-range-thumb without restoring an equivalent visible focus indicator."
  - "Stripping aria-valuemin / aria-valuemax / aria-valuenow (native input provides these — do not block them via role overrides)."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-slider-duration, --ren-slider-easing, --ren-slider-fill-color, --ren-slider-thumb-bg, --ren-slider-thumb-border, --ren-slider-thumb-shadow, --ren-slider-thumb-size, --ren-slider-track-bg, --ren-slider-track-height, --ren-slider-track-radius."
    - "Semantic state tokens: --color-accent, --color-success, --color-warning, --color-danger, --color-fill-active, --color-fill-subtle, --color-text, --color-text-muted."
    - "Shape / motion tokens: --radius-full, --space-*, --shadow-sm, --transition-tactile, font-size tokens (--font-size-label, --font-size-body, --font-size-xs)."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgb / named color values in overrides — including the white thumb border (keep it as a token override if you need to change it)."
    - "Hardcoded transition durations on the thumb hover/active scale; route through --transition-tactile."

accessibility:
  required:
    - "Use a real <input type=\"range\"> so native ARIA (role=slider, aria-valuemin/max/now) and keyboard (Arrow, Home/End, PageUp/Down) work."
    - "Visible focus ring on the thumb via outline: 2px solid var(--color-accent) with outline-offset; never set outline: none without an equivalent."
    - "Provide an accessible name via <label for> or aria-label; the .ren-slider-label class alone does not associate the label."
    - "Color variants must not be the only signal of state — accompany .ren-slider-danger with text or an icon for non-color cues."
    - "Disabled state uses :disabled on the input plus cursor: not-allowed; opacity changes alone are not sufficient on their own for state."
    - "Touch / drag interactions must not block keyboard nudges — both must drive the same change/input events the component dispatches."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-slider/ren-slider.css">
<script type="module" src="rends/components/composites/ren-slider/ren-slider.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-slider">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-slider`
- `.ren-slider-danger`
- `.ren-slider-label`
- `.ren-slider-lg`
- `.ren-slider-mark`
- `.ren-slider-mark-label`
- `.ren-slider-mark-tick`
- `.ren-slider-marks`
- `.ren-slider-range`
- `.ren-slider-sm`
- `.ren-slider-success`
- `.ren-slider-track`
- `.ren-slider-track-input`
- `.ren-slider-value`
- `.ren-slider-vertical`
- `.ren-slider-warning`

## States And Attributes

- `:active`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-slider-duration`
- `--ren-slider-easing`
- `--ren-slider-fill-color`
- `--ren-slider-thumb-bg`
- `--ren-slider-thumb-border`
- `--ren-slider-thumb-shadow`
- `--ren-slider-thumb-size`
- `--ren-slider-track-bg`
- `--ren-slider-track-height`
- `--ren-slider-track-radius`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-slider/ren-slider.css`
- `components/composites/ren-slider/ren-slider.js`
- `docs/components/ren-slider.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ═══ REN SLIDER COMPONENT ═══ */

/* ═══ BASE WRAPPER ═══ */
.ren-slider {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

/* ═══ TRACK CONTAINER ═══ */
.ren-slider-track {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 20px;
  cursor: pointer;
}

/* ═══ RANGE INPUT STYLING ═══ */
.ren-slider-track input[type="range"] {
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-fill-active);
  outline: none;
  margin: 0;
  padding: 0;

  /* ═══ TRACK FILL WITH CSS VARIABLE ═══ */
  background: linear-gradient(
    to right,
    var(--color-accent) 0%,
    var(--color-accent) var(--value, 0%),
    var(--color-fill-active) var(--value, 0%),
    var(--color-fill-active) 100%
  );

  & ::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-accent);
    border: 2px solid white;
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: var(--transition-tactile);

    &:hover {
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  & ::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-accent);
    border: 2px solid white;
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: var(--transition-tactile);

    &:hover {
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  & ::-webkit-slider-thumb:focus-visible,
  & ::-moz-range-thumb:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;

    & ::-webkit-slider-thumb,
    & ::-moz-range-thumb {
      cursor: not-allowed;
    }
  }
}

/* ═══ LABEL ═══ */
.ren-slider-label {
  font-size: var(--font-size-label);
  font-weight: 500;
  color: var(--color-text);
}

/* ═══ VALUE DISPLAY ═══ */
.ren-slider-value {
  font-size: var(--font-size-body-sm);
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

/* ═══ TICK MARKS ═══ */
.ren-slider-marks {
  display: flex;
  justify-content: space-between;
  gap: 0;
  width: 100%;
  margin-top: var(--space-1);

  & .ren-slider-mark {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 0 0 auto;

    & .ren-slider-mark-tick {
      width: 2px;
      height: 6px;
      background: var(--color-fill-subtle);
      border-radius: 1px;
      margin-bottom: var(--space-0-5);
    }

    & .ren-slider-mark-label {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }
  }
}

/* ═══ SIZE VARIANTS ═══ */
.ren-slider-track {
  &.ren-slider-sm input[type="range"] {
    height: 4px;
    background: linear-gradient(
      to right,
      var(--color-accent) 0%,
      var(--color-accent) var(--value, 0%),
      var(--color-fill-active) var(--value, 0%),
      var(--color-fill-active) 100%
    );

    & ::-webkit-slider-thumb {
      width: 16px;
      height: 16px;
    }

    & ::-moz-range-thumb {
      width: 16px;
      height: 16px;
    }
  }

  &.ren-slider-lg input[type="range"] {
    height: 8px;
    background: linear-gradient(
      to right,
      var(--color-accent) 0%,
      var(--color-accent) var(--value, 0%),
      var(--color-fill-active) var(--value, 0%),
      var(--color-fill-active) 100%
    );

    & ::-webkit-slider-thumb {
      width: 24px;
      height: 24px;
    }

    & ::-moz-range-thumb {
      width: 24px;
      height: 24px;
    }
  }
}

/* ═══ COLOR VARIANTS ═══ */
.ren-slider-track {
  &.ren-slider-success input[type="range"] {
    background: linear-gradient(
      to right,
      var(--color-success) 0%,
      var(--color-success) var(--value, 0%),
      var(--color-fill-active) var(--value, 0%),
      var(--color-fill-active) 100%
    );

    & ::-webkit-slider-thumb {
      background: var(--color-success);
    }

    & ::-moz-range-thumb {
      background: var(--color-success);
    }
  }

  &.ren-slider-warning input[type="range"] {
    background: linear-gradient(
      to right,
      var(--color-warning) 0%,
      var(--color-warning) var(--value, 0%),
      var(--color-fill-active) var(--value, 0%),
      var(--color-fill-active) 100%
    );

    & ::-webkit-slider-thumb {
      background: var(--color-warning);
    }

    & ::-moz-range-thumb {
      background: var(--color-warning);
    }
  }

  &.ren-slider-danger input[type="range"] {
    background: linear-gradient(
      to right,
      var(--color-danger) 0%,
      var(--color-danger) var(--value, 0%),
      var(--color-fill-active) var(--value, 0%),
      var(--color-fill-active) 100%
    );

    & ::-webkit-slider-thumb {
      background: var(--color-danger);
    }

    & ::-moz-range-thumb {
      background: var(--color-danger);
    }
  }
}

/* ═══ VERTICAL ORIENTATION ═══ */
.ren-slider-track {
  &.ren-slider-vertical {
    width: auto;
    height: 200px;
    writing-mode: vertical-lr;

    & input[type="range"] {
      width: auto;
      height: 200px;
      writing-mode: vertical-lr;
      direction: rtl;
    }
  }
}

/* ═══ RANGE MODE (DUAL THUMBS) ═══ */
.ren-slider-range {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 20px;
  cursor: pointer;

  & .ren-slider-track-input {
    position: absolute;
    width: 100%;
    height: 6px;
    border-radius: var(--radius-full);
    background: var(--color-fill-active);
    pointer-events: none;
    margin: 0;
    padding: 0;
  }

  & input[type="range"] {
    position: relative;
    width: 100%;
    z-index: 5;
    margin: 0;
    padding: 0;
    appearance: none;
    -webkit-appearance: none;
    background: none;
    height: 20px;
    border-radius: var(--radius-full);
    outline: none;

    & ::-webkit-slider-thumb {
      appearance: none;
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--color-accent);
      border: 2px solid white;
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: var(--transition-tactile);
      z-index: 6;

      &:hover {
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }
    }

    & ::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--color-accent);
      border: 2px solid white;
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: var(--transition-tactile);
      z-index: 6;

      &:hover {
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

/* ═══ REDUCED MOTION ═══ */
@media (prefers-reduced-motion: reduce) {
  .ren-slider,
  .ren-slider * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}


/* ═══ REN SLIDER WEB COMPONENT ═══ */

export class RenSlider extends HTMLElement {
  constructor() {
    super();
    this.handleInput = this.handleInput.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  connectedCallback() {
    this.input = this.querySelector('input[type="range"]');

    if (!this.input) {
      console.warn('RenSlider: No input[type="range"] found');
      return;
    }

    /* ═══ SET UP TRACK CLASS ═══ */
    const trackContainer = this.input.parentElement || this.input;
    trackContainer.classList.add('ren-slider-track');

    /* ═══ INITIALIZE VALUE ═══ */
    this.updateValue();

    /* ═══ EVENT LISTENERS ═══ */
    this.input.addEventListener('input', this.handleInput);
    this.input.addEventListener('change', this.handleChange);

    /* ═══ HANDLE LABEL DISPLAY ═══ */
    const label = this.getAttribute('label');
    if (label && !this.querySelector('.ren-slider-label')) {
      const labelEl = document.createElement('div');
      labelEl.className = 'ren-slider-label';
      labelEl.textContent = label;
      this.insertBefore(labelEl, this.input.parentElement);
    }

    /* ═══ HANDLE VALUE DISPLAY ═══ */
    if (this.hasAttribute('show-value')) {
      const valueEl = document.createElement('div');
      valueEl.className = 'ren-slider-value';
      this.valueDisplay = valueEl;
      this.input.parentElement.appendChild(valueEl);
      this.updateValueDisplay();
    }

    /* ═══ TRANSFER VARIANT CLASSES ═══ */
    this.transferVariantClasses();
  }

  disconnectedCallback() {
    if (this.input) {
      this.input.removeEventListener('input', this.handleInput);
      this.input.removeEventListener('change', this.handleChange);
    }
  }

  /* ═══ UPDATE CSS VARIABLE FOR TRACK FILL ═══ */
  updateValue() {
    if (!this.input) return;

    const min = parseFloat(this.input.min) || 0;
    const max = parseFloat(this.input.max) || 100;
    const value = parseFloat(this.input.value) || min;

    const percentage = ((value - min) / (max - min)) * 100;
    this.input.style.setProperty('--value', `${percentage}%`);
  }

  /* ═══ UPDATE VALUE DISPLAY TEXT ═══ */
  updateValueDisplay() {
    if (!this.valueDisplay || !this.input) return;

    const value = this.input.value;
    const unit = this.getAttribute('unit') || '';
    this.valueDisplay.textContent = `${value}${unit}`;
  }

  /* ═══ INPUT EVENT HANDLER ═══ */
  handleInput(event) {
    this.updateValue();
    this.updateValueDisplay();

    this.dispatchEvent(
      new CustomEvent('ren-slider-input', {
        detail: { value: parseFloat(this.input.value) },
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ CHANGE EVENT HANDLER ═══ */
  handleChange(event) {
    this.dispatchEvent(
      new CustomEvent('ren-slider-change', {
        detail: { value: parseFloat(this.input.value) },
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ TRANSFER VARIANT CLASSES TO TRACK ═══ */
  transferVariantClasses() {
    if (!this.input) return;

    const trackContainer = this.input.parentElement || this.input;
    const variants = ['sm', 'lg', 'success', 'warning', 'danger', 'vertical'];

    variants.forEach((variant) => {
      if (this.classList.contains(`ren-slider-${variant}`)) {
        trackContainer.classList.add(`ren-slider-${variant}`);
      }
    });
  }

  /* ═══ GETTERS AND SETTERS ═══ */
  get value() {
    return this.input ? parseFloat(this.input.value) : null;
  }

  set value(val) {
    if (this.input) {
      this.input.value = val;
      this.updateValue();
      this.updateValueDisplay();
    }
  }

  get min() {
    return this.input ? parseFloat(this.input.min) : null;
  }

  set min(val) {
    if (this.input) {
      this.input.min = val;
      this.updateValue();
    }
  }

  get max() {
    return this.input ? parseFloat(this.input.max) : null;
  }

  set max(val) {
    if (this.input) {
      this.input.max = val;
      this.updateValue();
    }
  }

  get disabled() {
    return this.input ? this.input.disabled : false;
  }

  set disabled(val) {
    if (this.input) {
      this.input.disabled = val;
    }
  }
}

/* ═══ REGISTER COMPONENT ═══ */
if (!customElements.get('ren-slider')) {
  customElements.define('ren-slider', RenSlider);
}
