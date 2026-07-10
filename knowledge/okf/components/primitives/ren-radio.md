---
type: "RenDS Component"
title: ren-radio
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:primitive:ren-radio
sourcePath: components/primitives/ren-radio
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - primitive
  - ren10
  - rends
---

# ren-radio

Source path: `components/primitives/ren-radio`

## Relationships

- `exposes_selector` -> [.ren-radio](../../selectors/ren-radio.md)
- `exposes_selector` -> [.ren-radio-control](../../selectors/ren-radio-control.md)
- `exposes_selector` -> [.ren-radio-group](../../selectors/ren-radio-group.md)
- `exposes_selector` -> [.ren-radio-group-horizontal](../../selectors/ren-radio-group-horizontal.md)
- `has_contract` -> [ren-radio component.md](../../foundation/contract-primitive-ren-radio.md)
- `has_css` -> [ren-radio.css](../../css/ren-radio-css.md)
- `has_docs_page` -> [ren-radio docs](../../docs/ren-radio-docs.md)
- `has_js` -> [ren-radio.js](../../javascript/ren-radio-js.md)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-accent-hover](../../tokens/color-accent-hover.md)
- `uses_token` -> [--color-border-strong](../../tokens/color-border-strong.md)
- `uses_token` -> [--color-focus-ring](../../tokens/color-focus-ring.md)
- `uses_token` -> [--color-on-accent](../../tokens/color-on-accent.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--duration-state](../../tokens/duration-state.md)
- `uses_token` -> [--duration-tactile](../../tokens/duration-tactile.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--ease-playful](../../tokens/ease-playful.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--ring-offset-width](../../tokens/ring-offset-width.md)
- `uses_token` -> [--ring-width](../../tokens/ring-width.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--touch-min](../../tokens/touch-min.md)
- `uses_token` -> [--weight-regular](../../tokens/weight-regular.md)

## Structured Data

```json
{
  "kind": "primitive",
  "selectors": [
    ".ren-radio",
    ".ren-radio-control",
    ".ren-radio-group",
    ".ren-radio-group-horizontal"
  ],
  "tokens": [
    "--body-size",
    "--color-accent",
    "--color-accent-hover",
    "--color-border-strong",
    "--color-focus-ring",
    "--color-on-accent",
    "--color-text",
    "--duration-state",
    "--duration-tactile",
    "--ease-enter",
    "--ease-playful",
    "--radius-full",
    "--ring-offset-width",
    "--ring-width",
    "--space-2",
    "--space-3",
    "--space-4",
    "--touch-min",
    "--weight-regular"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-radio Component Contract

Native radio group styling with optional custom element keyboard enhancement.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-radio` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-radio` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Radio primitive behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this primitive.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The user must pick exactly one option from 2-7 mutually-exclusive choices."
    - "All choices should be visible at once (no overflow / collapse)."
    - "You need a custom-styled radio dot built on native <input type=\"radio\"> with preserved semantics."
    - "You need keyboard arrow navigation + roving tabindex via <ren-radio-group>."
    - "You need a vertical (.ren-radio-group) or horizontal (.ren-radio-group-horizontal) layout."
  avoidWhen:
    - "There are more than ~7 options or the list overflows — use a ren-select / combobox."
    - "Multiple selections are allowed — use ren-checkbox."
    - "The choice is binary on/off — use ren-switch or ren-checkbox."
    - "The selection drives navigation or filters with immediate side effects — consider ren-segmented or tabs."

canonicalImports:
  css:
    - "rends/components/primitives/ren-radio/ren-radio.css"
  js:
    - "rends/components/primitives/ren-radio/ren-radio.js"
  notes:
    - "JS is only required when using <ren-radio-group> for arrow-key roving tabindex; a plain <fieldset role=\"radiogroup\"> with .ren-radio labels works CSS-only with native browser radio behavior."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Each option is a <label class=\"ren-radio\"> containing a real <input type=\"radio\" name=\"<group>\">, a <span class=\"ren-radio-control\"></span>, and the visible label text — in that DOM order so the :checked + .ren-radio-control adjacent selector works."
  - "All radios in one group share the same name attribute so the browser enforces single-selection."
  - "Wrap the group in <ren-radio-group> (auto-sets role=\"radiogroup\") or in a <fieldset> with <legend> + role=\"radiogroup\" when no JS is desired."
  - "Use <ren-radio-group orientation=\"horizontal\"> to switch to row layout; the JS swaps the class to .ren-radio-group-horizontal."
  - "Never set tabindex manually on inputs inside <ren-radio-group> — the roving-tabindex utility manages it."

forbiddenPatterns:
  - "Replacing <input type=\"radio\"> with a styled <div role=\"radio\"> — loses form submission + native a11y."
  - "Hiding the input with display: none (breaks focus) — use the built-in visually-hidden clip-path pattern."
  - "Two radios with different name attributes in the same group (allows multi-selection)."
  - "Using .ren-radio for an icon-only toggle without a visible text label or aria-label."
  - "Animating the dot via custom keyframes that bypass --duration-state / --ease-playful."

tokenPolicy:
  allowed:
    - "Semantic tokens consumed internally: --color-text, --color-border-strong, --color-accent, --color-accent-hover, --color-on-accent, --color-focus-ring."
    - "Layout / motion tokens: --space-2, --space-3, --space-4, --radius-full, --body-size, --weight-regular, --touch-min, --ring-width, --ring-offset-width, --duration-state, --duration-tactile, --ease-enter, --ease-playful."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Custom radio sizes that fall below the 20px control + 44px label touch target."

accessibility:
  required:
    - "Real <input type=\"radio\"> elements so the browser handles single-selection, form submission, and assistive-tech announcement."
    - ".ren-radio label has min-height: var(--touch-min) so the whole row is a 44px touch target."
    - "Visible :focus-visible ring on .ren-radio-control driven by --color-focus-ring (the native input is visually hidden but focus is delegated to its sibling)."
    - "<ren-radio-group> sets role=\"radiogroup\" and supports arrow-key navigation (Up/Down vertical, Left/Right horizontal) with loop; selection follows focus."
    - "Disabled options use <input disabled> (handled via :has(input:disabled)) — do not rely on opacity alone."
    - "Provide a group label via <legend> inside <fieldset> or aria-label / aria-labelledby on <ren-radio-group>."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-radio/ren-radio.css">
<script type="module" src="rends/components/primitives/ren-radio/ren-radio.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-radio">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-radio`
- `.ren-radio-control`
- `.ren-radio-group`
- `.ren-radio-group-horizontal`

## States And Attributes

- `:active`
- `:checked`
- `:disabled`
- `:focus-visible`
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

- `components/primitives/ren-radio/ren-radio.css`
- `components/primitives/ren-radio/ren-radio.js`
- `docs/components/ren-radio.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ============================================
   RenDS — Radio Button & Radio Group Components
   ============================================
   Custom-styled radio buttons and radio groups
   built on native <input type="radio">.

   Preserves native semantics and accessibility.
   Custom visuals via CSS only.

   Usage:
     <div class="ren-radio-group" role="radiogroup">
       <label class="ren-radio">
         <input type="radio" name="option" value="a">
         <span class="ren-radio-control"></span>
         <span>Option A</span>
       </label>
       <label class="ren-radio">
         <input type="radio" name="option" value="b">
         <span class="ren-radio-control"></span>
         <span>Option B</span>
       </label>
     </div>
   ============================================ */

/* ═══════════════════════════════
   RADIO BUTTON
   ═══════════════════════════════ */

.ren-radio {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--body-size);
  font-weight: var(--weight-regular);
  color: var(--color-text);
  user-select: none;
  /* Ensure touch target */
  min-height: var(--touch-min);
}

/* Hide native radio visually but keep accessible */
.ren-radio > input[type="radio"] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}

/* Custom radio visual */
.ren-radio-control {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;   /* 20px */
  height: 1.25rem;
  flex-shrink: 0;
  border: 2px solid var(--color-border-strong);
  border-radius: var(--radius-full);
  background-color: transparent;
  transition:
    background-color var(--duration-state) var(--ease-enter),
    border-color var(--duration-state) var(--ease-enter),
    transform var(--duration-tactile) var(--ease-playful);
}

/* Radio dot (hidden by default) */
.ren-radio-control::after {
  content: '';
  display: block;
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--color-on-accent);
  border-radius: var(--radius-full);
  transform: scale(0);
  transition: transform var(--duration-state) var(--ease-playful);
}

/* ─── States ─── */

/* Checked */
.ren-radio > input:checked + .ren-radio-control {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
}

.ren-radio > input:checked + .ren-radio-control::after {
  transform: scale(1);
}

/* Hover */
.ren-radio:hover > .ren-radio-control {
  border-color: var(--color-accent);
}

.ren-radio:hover > input:checked + .ren-radio-control {
  background-color: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

/* Focus */
.ren-radio > input:focus-visible + .ren-radio-control {
  outline: var(--ring-width) solid var(--color-focus-ring);
  outline-offset: var(--ring-offset-width);
}

/* Active / Press */
.ren-radio:active > .ren-radio-control {
  transform: scale(0.9);
}

/* Disabled */
.ren-radio:has(input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ═══════════════════════════════
   RADIO GROUP
   ═══════════════════════════════ */

.ren-radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.ren-radio-group-horizontal {
  display: flex;
  flex-direction: row;
  gap: var(--space-4);
}


/**
 * RenDS — <ren-radio-group> Web Component
 * ========================================
 * Accessible radio group with keyboard navigation.
 * Implements arrow key navigation and roving tabindex.
 *
 * Uses Light DOM — no Shadow DOM.
 * Works with native <input type="radio"> elements.
 *
 * Attributes:
 *   orientation: 'vertical' (default) | 'horizontal'
 *   role:        'radiogroup' (auto-set)
 *
 * Usage:
 *   <ren-radio-group>
 *     <label class="ren-radio">
 *       <input type="radio" name="option" value="a">
 *       <span class="ren-radio-control"></span>
 *       <span>Option A</span>
 *     </label>
 *     <label class="ren-radio">
 *       <input type="radio" name="option" value="b">
 *       <span class="ren-radio-control"></span>
 *       <span>Option B</span>
 *     </label>
 *   </ren-radio-group>
 *
 * Arrow keys navigate between radios.
 * Selecting a radio via arrow keys also checks it.
 */

import { createKeyboardNav } from '../../../utils/keyboard-nav.js';

export class RenRadioGroup extends HTMLElement {
  static get observedAttributes() {
    return ['orientation'];
  }

  constructor() {
    super();
    this._nav = null;
  }

  connectedCallback() {
    // Set ARIA role
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'radiogroup');
    }

    // Find all radio inputs
    const radios = this.querySelectorAll('input[type="radio"]');
    if (radios.length === 0) return;

    // Set up keyboard navigation using roving tabindex
    const orientation = this.getAttribute('orientation') || 'vertical';

    this._nav = createKeyboardNav(this, {
      selector: 'input[type="radio"]',
      orientation,
      loop: true,
      typeahead: false,
      focusOnHover: false,
      onActivate: (radio, index) => {
        // When arrow key navigation moves to a radio, check it
        radio.checked = true;
        // Dispatch change event to match native behavior
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      },
      onSelect: null,
    });

    this._nav.attach();

    // Update class based on orientation
    this._updateOrientationClass();
  }

  disconnectedCallback() {
    if (this._nav) {
      this._nav.detach();
      this._nav = null;
    }
  }

  attributeChangedCallback(name) {
    if (name === 'orientation') {
      this._updateOrientationClass();
      // Detach and reattach nav with new orientation
      if (this._nav) {
        this._nav.detach();
        const orientation = this.getAttribute('orientation') || 'vertical';
        this._nav = createKeyboardNav(this, {
          selector: 'input[type="radio"]',
          orientation,
          loop: true,
          typeahead: false,
          focusOnHover: false,
          onActivate: (radio, index) => {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
          },
          onSelect: null,
        });
        this._nav.attach();
      }
    }
  }

  _updateOrientationClass() {
    const orientation = this.getAttribute('orientation') || 'vertical';

    // Remove existing orientation classes
    this.classList.remove('ren-radio-group', 'ren-radio-group-horizontal');

    // Add appropriate class
    if (orientation === 'horizontal') {
      this.classList.add('ren-radio-group-horizontal');
    } else {
      this.classList.add('ren-radio-group');
    }
  }

  // ─── Programmatic API ───

  /**
   * Get the currently checked radio value
   */
  get value() {
    const checked = this.querySelector('input[type="radio"]:checked');
    return checked ? checked.value : null;
  }

  /**
   * Set which radio is checked by value
   */
  set value(val) {
    const radio = this.querySelector(`input[type="radio"][value="${val}"]`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  /**
   * Get all radio inputs
   */
  get radios() {
    return Array.from(this.querySelectorAll('input[type="radio"]'));
  }
}

// Register
if (!customElements.get('ren-radio-group')) {
  customElements.define('ren-radio-group', RenRadioGroup);
}
