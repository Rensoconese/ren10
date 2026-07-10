---
type: "RenDS Component"
title: ren-number-field
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-number-field
sourcePath: components/composites/ren-number-field
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

# ren-number-field

Source path: `components/composites/ren-number-field`

## Relationships

- `exposes_selector` -> [.ren-number-field](../../selectors/ren-number-field.md)
- `exposes_selector` -> [.ren-number-field-decrement](../../selectors/ren-number-field-decrement.md)
- `exposes_selector` -> [.ren-number-field-increment](../../selectors/ren-number-field-increment.md)
- `exposes_selector` -> [.ren-number-field-input](../../selectors/ren-number-field-input.md)
- `exposes_selector` -> [.ren-number-field-lg](../../selectors/ren-number-field-lg.md)
- `exposes_selector` -> [.ren-number-field-sm](../../selectors/ren-number-field-sm.md)
- `has_contract` -> [ren-number-field component.md](../../foundation/contract-composite-ren-number-field.md)
- `has_css` -> [ren-number-field.css](../../css/ren-number-field-css.md)
- `has_docs_page` -> [ren-number-field docs](../../docs/ren-number-field-docs.md)
- `has_js` -> [ren-number-field.js](../../javascript/ren-number-field-js.md)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-danger](../../tokens/color-danger.md)
- `uses_token` -> [--color-disabled-bg](../../tokens/color-disabled-bg.md)
- `uses_token` -> [--color-disabled-text](../../tokens/color-disabled-text.md)
- `uses_token` -> [--color-fill-active](../../tokens/color-fill-active.md)
- `uses_token` -> [--color-fill-hover](../../tokens/color-fill-hover.md)
- `uses_token` -> [--color-input-bg](../../tokens/color-input-bg.md)
- `uses_token` -> [--color-input-bg-hover](../../tokens/color-input-bg-hover.md)
- `uses_token` -> [--color-input-border](../../tokens/color-input-border.md)
- `uses_token` -> [--color-input-border-focus](../../tokens/color-input-border-focus.md)
- `uses_token` -> [--color-input-focus-ring](../../tokens/color-input-focus-ring.md)
- `uses_token` -> [--color-input-placeholder](../../tokens/color-input-placeholder.md)
- `uses_token` -> [--color-success](../../tokens/color-success.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--font-mono](../../tokens/font-mono.md)
- `uses_token` -> [--radius-lg](../../tokens/radius-lg.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--radius-sm](../../tokens/radius-sm.md)
- `uses_token` -> [--size-lg](../../tokens/size-lg.md)
- `uses_token` -> [--size-sm](../../tokens/size-sm.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--stroke-1](../../tokens/stroke-1.md)
- `uses_token` -> [--text-lg](../../tokens/text-lg.md)
- `uses_token` -> [--text-sm](../../tokens/text-sm.md)
- `uses_token` -> [--touch-min](../../tokens/touch-min.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-number-field",
    ".ren-number-field-decrement",
    ".ren-number-field-increment",
    ".ren-number-field-input",
    ".ren-number-field-lg",
    ".ren-number-field-sm"
  ],
  "tokens": [
    "--body-size",
    "--color-border",
    "--color-danger",
    "--color-disabled-bg",
    "--color-disabled-text",
    "--color-fill-active",
    "--color-fill-hover",
    "--color-input-bg",
    "--color-input-bg-hover",
    "--color-input-border",
    "--color-input-border-focus",
    "--color-input-focus-ring",
    "--color-input-placeholder",
    "--color-success",
    "--color-text",
    "--font-mono",
    "--radius-lg",
    "--radius-md",
    "--radius-sm",
    "--size-lg",
    "--size-sm",
    "--space-1",
    "--space-2",
    "--space-3",
    "--space-4",
    "--stroke-1",
    "--text-lg",
    "--text-sm",
    "--touch-min",
    "--transition-tactile"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-number-field Component Contract

Numeric input composite with increment/decrement affordances.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-number-field` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-number-field` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Number Field composite behavior or visual role.
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
    - "User needs a discrete numeric value with visible − / + stepper buttons (quantities, counts, ratings out of N)."
    - "Need long-press auto-repeat with acceleration on the stepper buttons (mouse and touch)."
    - "Need keyboard contract: ArrowUp/Down for ±step, Home/End for min/max, clamped to min/max/step bounds."
    - "Need data-invalid / data-valid states wired to the wrapper (single source of truth for the focus ring)."
    - "Need :has(:focus) to color the whole group, not just the inner input."
  avoidWhen:
    - "Free-form numeric typing without bounds — use a plain <input type=\"number\"> styled via ren-input."
    - "Continuous value selection with visible track — use ren-slider."
    - "Numeric value paired with a unit selector (10 px / 1 rem) — compose ren-input with a ren-select."
    - "Currency / locale-formatted amount with thousands separators — that needs a masked input, not a stepper."

canonicalImports:
  css:
    - "rends/components/composites/ren-number-field/ren-number-field.css"
  js:
    - "rends/components/composites/ren-number-field/ren-number-field.js"
  notes:
    - "Public Token API has no --ren-number-field-* tokens; theme through semantic input/fill tokens listed below."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Use <ren-number-field min=\"…\" max=\"…\" step=\"…\" value=\"…\"> as the host so attributes wire min/max/step on the inner input."
  - "Inner input is <input type=\"number\" class=\"ren-number-field-input\"> — keep type=\"number\" so mobile keyboards switch to digits."
  - "Decrement / increment must be real <button class=\"ren-number-field-decrement\"> / <button class=\"ren-number-field-increment\"> with aria-label=\"Decrease\" / \"Increase\" (the component fills these if missing)."
  - "Validation state goes on the wrapper as [data-invalid] or [data-valid]; the inner focus ring color reads from --color-danger / --color-success."
  - "Size variants are .ren-number-field-sm and .ren-number-field-lg on the wrapper; do not size buttons or input independently."

forbiddenPatterns:
  - "Wrapping a <span role=\"button\"> instead of a real <button> for the steppers — long-press auto-repeat hooks depend on native button events."
  - "Showing the native spinner UI — the CSS already hides ::-webkit-inner-spin-button / ::-webkit-outer-spin-button and uses -moz-appearance: textfield."
  - "Bypassing the host's clamp() by writing this.value directly — call setValue(), increment(), or decrement() so min/max/step clamping runs and ren-change dispatches."
  - "Removing aria-label from the stepper buttons — the visible ± glyph alone has no accessible name."
  - "Custom outline on the inner input — focus styling is owned by the wrapper via :has(.ren-number-field-input:focus)."

tokenPolicy:
  allowed:
    - "Semantic input tokens: --color-input-bg, --color-input-bg-hover, --color-input-border, --color-input-border-focus, --color-input-focus-ring, --color-input-placeholder, --color-disabled-bg, --color-disabled-text."
    - "Semantic neutral / state tokens: --color-text, --color-border, --color-fill-hover, --color-fill-active, --color-danger, --color-success."
    - "Layout / type / motion tokens: --space-1, --space-2, --space-3, --space-4, --stroke-1, --radius-sm, --radius-md, --radius-lg, --touch-min, --size-sm, --size-lg, --body-size, --text-sm, --text-lg, --font-mono, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / rgb() values; the current CSS still has two rgb() calls for focus-ring tints — do not propagate that pattern, theme via tokens."
    - "Inventing --ren-number-field-* custom properties not present in the source until they ship in the Public Token API."

accessibility:
  required:
    - "Stepper buttons keep min-width / height = var(--touch-min) (44px) — do not shrink below this except inside .ren-number-field-sm for non-touch contexts."
    - "Each stepper has an aria-label (\"Decrease\" / \"Increase\"); the icon is decorative content."
    - "ArrowUp / ArrowDown on the input dispatch increment()/decrement(); Home / End jump to min / max; values are always clamped before dispatching ren-change."
    - "Disabled state sets disabled on the inner input AND both buttons so they are removed from the tab order — do not rely on opacity alone."
    - "data-invalid / data-valid changes border AND focus ring color, but always pair with text feedback near the field — color is not the only signal."
    - "Long-press auto-repeat must stop on pointerup/touchend AND mouseleave so dragging off the button cancels acceleration."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-number-field/ren-number-field.css">
<script type="module" src="rends/components/composites/ren-number-field/ren-number-field.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-number-field">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-number-field`
- `.ren-number-field-decrement`
- `.ren-number-field-increment`
- `.ren-number-field-input`
- `.ren-number-field-lg`
- `.ren-number-field-sm`

## States And Attributes

- `[data-invalid]`
- `[data-valid]`
- `:active`
- `:disabled`
- `:hover`

## Public Token API

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

If no `--ren-*` token is detected here, theme through semantic tokens from `tokens/tokens.md` and avoid selector overrides.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-number-field/ren-number-field.css`
- `components/composites/ren-number-field/ren-number-field.js`
- `docs/components/ren-number-field.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ═══════════════════════════════════════════════════════════════
   REN NUMBER FIELD (STEPPER) COMPONENT
   ═══════════════════════════════════════════════════════════════
   A controlled number input with increment/decrement buttons.
   Supports keyboard navigation, long-press acceleration, and
   min/max bounds. Follows RenDS design token system.

   Usage:
   <ren-number-field min="0" max="100" step="1" value="5">
     <button class="ren-number-field-decrement" aria-label="Decrease">−</button>
     <input class="ren-number-field-input" type="number" value="5">
     <button class="ren-number-field-increment" aria-label="Increase">+</button>
   </ren-number-field>
   ═══════════════════════════════════════════════════════════════ */

/* ═══ BASE WRAPPER ═══ */
.ren-number-field {
  display: inline-flex;
  align-items: center;
  gap: 0;
  border: var(--stroke-1) solid var(--color-input-border);
  border-radius: var(--radius-md);
  background-color: var(--color-input-bg);
  transition: var(--transition-tactile);

  /* ═══ FOCUS STATE ON GROUP ═══ */
  &:has(.ren-number-field-input:focus) {
    border-color: var(--color-input-border-focus);
    box-shadow: 0 0 0 3px var(--color-input-focus-ring);
    background-color: var(--color-input-bg-hover);
  }

  /* ═══ HOVER STATE ═══ */
  &:hover:not(:has(:disabled)) {
    background-color: var(--color-input-bg-hover);
  }

  /* ═══ DISABLED STATE ═══ */
  &:has(:disabled) {
    background-color: var(--color-disabled-bg);
    border-color: var(--color-border);
    cursor: not-allowed;
    opacity: 0.7;
  }
}

/* ═══ STEPPER BUTTONS ═══ */
.ren-number-field-decrement,
.ren-number-field-increment {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: var(--touch-min);
  height: var(--touch-min);
  padding: 0 var(--space-2);
  background: transparent;
  border: none;
  color: var(--color-text);
  cursor: pointer;
  font-size: var(--text-lg);
  font-weight: 600;
  font-family: var(--font-mono);
  transition: var(--transition-tactile);

  /* ═══ REMOVE FOCUS OUTLINE - GROUP HANDLES IT ═══ */
  &:focus {
    outline: none;
  }

  /* ═══ HOVER STATE ═══ */
  &:hover:not(:disabled) {
    background-color: var(--color-fill-hover);
  }

  /* ═══ ACTIVE STATE ═══ */
  &:active:not(:disabled) {
    background-color: var(--color-fill-active);
  }

  /* ═══ DISABLED STATE ═══ */
  &:disabled {
    color: var(--color-disabled-text);
    cursor: not-allowed;
    opacity: 0.5;
  }
}

/* ═══ DECREMENT BUTTON (LEFT) ═══ */
.ren-number-field-decrement {
  border-inline-end: var(--stroke-1) solid var(--color-border);
  border-radius: var(--radius-md) 0 0 var(--radius-md);

  /* ═══ MINUS ICON ═══ */
  &::before {
    content: '−';
  }
}

/* ═══ INCREMENT BUTTON (RIGHT) ═══ */
.ren-number-field-increment {
  border-inline-start: var(--stroke-1) solid var(--color-border);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;

  /* ═══ PLUS ICON ═══ */
  &::before {
    content: '+';
  }
}

/* ═══ INPUT FIELD (CENTER) ═══ */
.ren-number-field-input {
  flex: 1;
  min-width: 3rem;
  padding: var(--space-2) var(--space-3);
  font-size: var(--body-size);
  font-family: var(--font-mono);
  font-weight: 500;
  color: var(--color-text);
  text-align: center;
  background: transparent;
  border: none;
  outline: none;
  cursor: text;

  /* ═══ HIDE NATIVE NUMBER SPINNER ═══ */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }

  /* ═══ PLACEHOLDER ═══ */
  &::placeholder {
    color: var(--color-input-placeholder);
  }

  /* ═══ DISABLED ═══ */
  &:disabled {
    cursor: not-allowed;
    color: var(--color-disabled-text);
  }
}

/* ═══ VARIANT: SMALL ═══ */
.ren-number-field-sm {
  height: var(--size-sm);
  border-radius: var(--radius-sm);

  & .ren-number-field-decrement,
  & .ren-number-field-increment {
    min-width: var(--size-sm);
    height: var(--size-sm);
    padding: 0 var(--space-1);
    font-size: var(--text-sm);
  }

  & .ren-number-field-decrement {
    border-radius: var(--radius-sm) 0 0 var(--radius-sm);
  }

  & .ren-number-field-increment {
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  }

  & .ren-number-field-input {
    padding: var(--space-1) var(--space-2);
    font-size: var(--text-sm);
  }
}

/* ═══ VARIANT: LARGE ═══ */
.ren-number-field-lg {
  height: var(--size-lg);
  border-radius: var(--radius-lg);

  & .ren-number-field-decrement,
  & .ren-number-field-increment {
    min-width: var(--size-lg);
    height: var(--size-lg);
    padding: 0 var(--space-3);
    font-size: var(--text-lg);
  }

  & .ren-number-field-decrement {
    border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  }

  & .ren-number-field-increment {
    border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  }

  & .ren-number-field-input {
    padding: var(--space-3) var(--space-4);
    font-size: var(--text-lg);
  }
}

/* ═══ ERROR STATE ═══ */
.ren-number-field[data-invalid] {
  border-color: var(--color-danger);

  &:focus-within {
    box-shadow: 0 0 0 3px rgb(255, 59, 48, 0.15);
  }
}

/* ═══ SUCCESS STATE ═══ */
.ren-number-field[data-valid] {
  border-color: var(--color-success);

  &:focus-within {
    box-shadow: 0 0 0 3px rgb(52, 199, 89, 0.15);
  }
}

/* ═══ REDUCED MOTION ═══ */
@media (prefers-reduced-motion: reduce) {
  .ren-number-field,
  .ren-number-field-decrement,
  .ren-number-field-increment {
    transition: none;
  }
}


/* ═══════════════════════════════════════════════════════════════
   REN NUMBER FIELD (STEPPER) WEB COMPONENT
   ═══════════════════════════════════════════════════════════════
   A light-DOM web component that enhances a number input with
   increment/decrement buttons. Handles keyboard navigation,
   long-press auto-repeat with acceleration, and min/max bounds.

   Attributes:
   - min: Minimum value (default: 0)
   - max: Maximum value (default: 100)
   - step: Step size (default: 1)
   - value: Current value
   - disabled: Disable the field

   Events:
   - ren-change: Dispatched on value change { value, oldValue }

   Methods:
   - increment(): Increase value by step
   - decrement(): Decrease value by step
   - getValue(): Return current numeric value
   - setValue(val): Set value and clamp to bounds
   ═══════════════════════════════════════════════════════════════ */

export class RenNumberField extends HTMLElement {
  constructor() {
    super();

    /* ═══ STATE ═══ */
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.value = 0;
    this.pressTimeout = null;
    this.pressInterval = null;
    this.pressRepeatDelay = 500;
    this.pressRepeatInterval = 100;
    this.pressRepeatAcceleration = 0.95;

    /* ═══ BIND METHODS ═══ */
    this.handleDecrementPress = this.handleDecrementPress.bind(this);
    this.handleIncrementPress = this.handleIncrementPress.bind(this);
    this.handleDecrementRelease = this.handleDecrementRelease.bind(this);
    this.handleIncrementRelease = this.handleIncrementRelease.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleInputKeydown = this.handleInputKeydown.bind(this);
  }

  connectedCallback() {
    /* ═══ READ ATTRIBUTES ═══ */
    const minAttr = this.getAttribute('min');
    const maxAttr = this.getAttribute('max');
    const stepAttr = this.getAttribute('step');
    const valueAttr = this.getAttribute('value');
    const disabledAttr = this.hasAttribute('disabled');

    if (minAttr !== null) this.min = parseFloat(minAttr);
    if (maxAttr !== null) this.max = parseFloat(maxAttr);
    if (stepAttr !== null) this.step = parseFloat(stepAttr);
    if (valueAttr !== null) this.value = parseFloat(valueAttr);

    /* ═══ GET OR CREATE ELEMENTS ═══ */
    this.input = this.querySelector('.ren-number-field-input');
    this.decrementBtn = this.querySelector('.ren-number-field-decrement');
    this.incrementBtn = this.querySelector('.ren-number-field-increment');

    /* ═══ CREATE IF MISSING ═══ */
    if (!this.input) {
      this.input = document.createElement('input');
      this.input.type = 'number';
      this.input.className = 'ren-number-field-input';
      this.appendChild(this.input);
    }

    if (!this.decrementBtn) {
      this.decrementBtn = document.createElement('button');
      this.decrementBtn.className = 'ren-number-field-decrement';
      this.decrementBtn.setAttribute('aria-label', 'Decrease');
      this.insertBefore(this.decrementBtn, this.input);
    }

    if (!this.incrementBtn) {
      this.incrementBtn = document.createElement('button');
      this.incrementBtn.className = 'ren-number-field-increment';
      this.incrementBtn.setAttribute('aria-label', 'Increase');
      this.appendChild(this.incrementBtn);
    }

    /* ═══ SET INITIAL VALUES ═══ */
    this.input.value = this.value.toString();
    this.input.min = this.min.toString();
    this.input.max = this.max.toString();
    this.input.step = this.step.toString();

    if (disabledAttr) {
      this.input.disabled = true;
      this.decrementBtn.disabled = true;
      this.incrementBtn.disabled = true;
    }

    /* ═══ ATTACH EVENT LISTENERS ═══ */
    this.input.addEventListener('change', this.handleInputChange);
    this.input.addEventListener('keydown', this.handleInputKeydown);

    /* ═══ BUTTON PRESS & HOLD ═══ */
    this.decrementBtn.addEventListener('mousedown', this.handleDecrementPress);
    this.decrementBtn.addEventListener('mouseup', this.handleDecrementRelease);
    this.decrementBtn.addEventListener('mouseleave', this.handleDecrementRelease);
    this.decrementBtn.addEventListener('touchstart', this.handleDecrementPress);
    this.decrementBtn.addEventListener('touchend', this.handleDecrementRelease);

    this.incrementBtn.addEventListener('mousedown', this.handleIncrementPress);
    this.incrementBtn.addEventListener('mouseup', this.handleIncrementRelease);
    this.incrementBtn.addEventListener('mouseleave', this.handleIncrementRelease);
    this.incrementBtn.addEventListener('touchstart', this.handleIncrementPress);
    this.incrementBtn.addEventListener('touchend', this.handleIncrementRelease);
  }

  disconnectedCallback() {
    /* ═══ CLEAN UP EVENT LISTENERS ═══ */
    if (this.input) {
      this.input.removeEventListener('change', this.handleInputChange);
      this.input.removeEventListener('keydown', this.handleInputKeydown);
    }

    if (this.decrementBtn) {
      this.decrementBtn.removeEventListener('mousedown', this.handleDecrementPress);
      this.decrementBtn.removeEventListener('mouseup', this.handleDecrementRelease);
      this.decrementBtn.removeEventListener('mouseleave', this.handleDecrementRelease);
      this.decrementBtn.removeEventListener('touchstart', this.handleDecrementPress);
      this.decrementBtn.removeEventListener('touchend', this.handleDecrementRelease);
    }

    if (this.incrementBtn) {
      this.incrementBtn.removeEventListener('mousedown', this.handleIncrementPress);
      this.incrementBtn.removeEventListener('mouseup', this.handleIncrementRelease);
      this.incrementBtn.removeEventListener('mouseleave', this.handleIncrementRelease);
      this.incrementBtn.removeEventListener('touchstart', this.handleIncrementPress);
      this.incrementBtn.removeEventListener('touchend', this.handleIncrementRelease);
    }

    /* ═══ CLEAR TIMERS ═══ */
    this.clearPressTimers();
  }

  /* ═══════════════════════════════════════════════════════════════
     DECREMENT BUTTON HANDLERS
     ═══════════════════════════════════════════════════════════════ */
  handleDecrementPress = (e) => {
    if (this.input.disabled || this.decrementBtn.disabled) return;
    e.preventDefault();

    this.decrement();

    /* ═══ START LONG PRESS REPEAT ═══ */
    this.pressTimeout = setTimeout(() => {
      let repeatInterval = this.pressRepeatInterval;

      this.pressInterval = setInterval(() => {
        this.decrement();
        /* ═══ ACCELERATE ═══ */
        repeatInterval *= this.pressRepeatAcceleration;
        clearInterval(this.pressInterval);

        this.pressInterval = setInterval(
          () => this.decrement(),
          Math.max(50, repeatInterval)
        );
      }, this.pressRepeatInterval);
    }, this.pressRepeatDelay);
  };

  handleDecrementRelease = () => {
    this.clearPressTimers();
  };

  /* ═══════════════════════════════════════════════════════════════
     INCREMENT BUTTON HANDLERS
     ═══════════════════════════════════════════════════════════════ */
  handleIncrementPress = (e) => {
    if (this.input.disabled || this.incrementBtn.disabled) return;
    e.preventDefault();

    this.increment();

    /* ═══ START LONG PRESS REPEAT ═══ */
    this.pressTimeout = setTimeout(() => {
      let repeatInterval = this.pressRepeatInterval;

      this.pressInterval = setInterval(() => {
        this.increment();
        /* ═══ ACCELERATE ═══ */
        repeatInterval *= this.pressRepeatAcceleration;
        clearInterval(this.pressInterval);

        this.pressInterval = setInterval(
          () => this.increment(),
          Math.max(50, repeatInterval)
        );
      }, this.pressRepeatInterval);
    }, this.pressRepeatDelay);
  };

  handleIncrementRelease = () => {
    this.clearPressTimers();
  };

  /* ═══════════════════════════════════════════════════════════════
     INPUT HANDLERS
     ═══════════════════════════════════════════════════════════════ */
  handleInputChange = (e) => {
    const newValue = parseFloat(e.target.value);

    if (!isNaN(newValue)) {
      const oldValue = this.value;
      this.value = this.clamp(newValue);
      this.input.value = this.value.toString();

      this.dispatchChangeEvent(oldValue);
    }
  };

  handleInputKeydown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.increment();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.decrement();
    } else if (e.key === 'Home') {
      e.preventDefault();
      const oldValue = this.value;
      this.value = this.min;
      this.input.value = this.value.toString();
      this.dispatchChangeEvent(oldValue);
    } else if (e.key === 'End') {
      e.preventDefault();
      const oldValue = this.value;
      this.value = this.max;
      this.input.value = this.value.toString();
      this.dispatchChangeEvent(oldValue);
    }
  };

  /* ═══════════════════════════════════════════════════════════════
     PUBLIC METHODS
     ═══════════════════════════════════════════════════════════════ */
  increment() {
    const oldValue = this.value;
    this.value = this.clamp(this.value + this.step);
    this.input.value = this.value.toString();
    this.dispatchChangeEvent(oldValue);
  }

  decrement() {
    const oldValue = this.value;
    this.value = this.clamp(this.value - this.step);
    this.input.value = this.value.toString();
    this.dispatchChangeEvent(oldValue);
  }

  getValue() {
    return this.value;
  }

  setValue(val) {
    const oldValue = this.value;
    this.value = this.clamp(parseFloat(val) || 0);
    this.input.value = this.value.toString();
    this.dispatchChangeEvent(oldValue);
  }

  /* ═══════════════════════════════════════════════════════════════
     UTILITY METHODS
     ═══════════════════════════════════════════════════════════════ */
  clamp(val) {
    return Math.max(this.min, Math.min(this.max, val));
  }

  dispatchChangeEvent(oldValue) {
    if (this.value !== oldValue) {
      this.dispatchEvent(
        new CustomEvent('ren-change', {
          bubbles: true,
          composed: true,
          detail: {
            value: this.value,
            oldValue: oldValue,
          },
        })
      );
    }
  }

  clearPressTimers() {
    if (this.pressTimeout) {
      clearTimeout(this.pressTimeout);
      this.pressTimeout = null;
    }

    if (this.pressInterval) {
      clearInterval(this.pressInterval);
      this.pressInterval = null;
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     PROPERTIES
     ═══════════════════════════════════════════════════════════════ */
  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
      if (this.input) this.input.disabled = true;
      if (this.decrementBtn) this.decrementBtn.disabled = true;
      if (this.incrementBtn) this.incrementBtn.disabled = true;
    } else {
      this.removeAttribute('disabled');
      if (this.input) this.input.disabled = false;
      if (this.decrementBtn) this.decrementBtn.disabled = false;
      if (this.incrementBtn) this.incrementBtn.disabled = false;
    }
  }
}

/* ═══ REGISTER COMPONENT ═══ */
if (!customElements.get('ren-number-field')) {
  customElements.define('ren-number-field', RenNumberField);
}
