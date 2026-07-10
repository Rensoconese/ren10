---
type: "RenDS Component"
title: ren-otp
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-otp
sourcePath: components/composites/ren-otp
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

# ren-otp

Source path: `components/composites/ren-otp`

## Relationships

- `exposes_selector` -> [.ren-otp](../../selectors/ren-otp.md)
- `exposes_selector` -> [.ren-otp-lg](../../selectors/ren-otp-lg.md)
- `exposes_selector` -> [.ren-otp-separator](../../selectors/ren-otp-separator.md)
- `exposes_selector` -> [.ren-otp-slot](../../selectors/ren-otp-slot.md)
- `exposes_selector` -> [.ren-otp-sm](../../selectors/ren-otp-sm.md)
- `has_contract` -> [ren-otp component.md](../../foundation/contract-composite-ren-otp.md)
- `has_css` -> [ren-otp.css](../../css/ren-otp-css.md)
- `has_docs_page` -> [ren-otp docs](../../docs/ren-otp-docs.md)
- `has_js` -> [ren-otp.js](../../javascript/ren-otp-js.md)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-danger](../../tokens/color-danger.md)
- `uses_token` -> [--color-disabled-bg](../../tokens/color-disabled-bg.md)
- `uses_token` -> [--color-disabled-text](../../tokens/color-disabled-text.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-input-bg](../../tokens/color-input-bg.md)
- `uses_token` -> [--color-input-bg-hover](../../tokens/color-input-bg-hover.md)
- `uses_token` -> [--color-input-border](../../tokens/color-input-border.md)
- `uses_token` -> [--color-input-border-focus](../../tokens/color-input-border-focus.md)
- `uses_token` -> [--color-input-focus-ring](../../tokens/color-input-focus-ring.md)
- `uses_token` -> [--color-input-placeholder](../../tokens/color-input-placeholder.md)
- `uses_token` -> [--color-success](../../tokens/color-success.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--font-mono](../../tokens/font-mono.md)
- `uses_token` -> [--radius-lg](../../tokens/radius-lg.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--radius-sm](../../tokens/radius-sm.md)
- `uses_token` -> [--size-lg](../../tokens/size-lg.md)
- `uses_token` -> [--size-sm](../../tokens/size-sm.md)
- `uses_token` -> [--space-0-5](../../tokens/space-0-5.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
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
    ".ren-otp",
    ".ren-otp-lg",
    ".ren-otp-separator",
    ".ren-otp-slot",
    ".ren-otp-sm"
  ],
  "tokens": [
    "--body-size",
    "--color-accent",
    "--color-border",
    "--color-danger",
    "--color-disabled-bg",
    "--color-disabled-text",
    "--color-fill",
    "--color-input-bg",
    "--color-input-bg-hover",
    "--color-input-border",
    "--color-input-border-focus",
    "--color-input-focus-ring",
    "--color-input-placeholder",
    "--color-success",
    "--color-text",
    "--color-text-muted",
    "--font-mono",
    "--radius-lg",
    "--radius-md",
    "--radius-sm",
    "--size-lg",
    "--size-sm",
    "--space-0-5",
    "--space-1",
    "--space-2",
    "--space-3",
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

# ren-otp Component Contract

One-time-passcode segmented input composite.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-otp` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-otp` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Otp composite behavior or visual role.
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
    - "User must enter a short fixed-length code split across N single-character slots (SMS OTP, 2FA, email PIN)."
    - "Need auto-advance to the next slot, Backspace to previous slot, Arrow keys to navigate, Home/End to jump to first/last."
    - "Need clipboard paste to distribute the pasted string across consecutive slots and focus the next empty one."
    - "Need numeric vs alphanumeric filtering (inputmode=\"numeric\" or \"text\") and a per-slot data-filled state."
    - "Need explicit data-valid / data-invalid states on the wrapper plus a ren-complete event when all slots fill."
  avoidWhen:
    - "User pastes a long password / token in one go — use a single <input type=\"password\"> with autocomplete=\"one-time-code\" if it is a single field."
    - "Free-form numeric value with unit / decimals — use ren-number-field."
    - "Code length is variable or unknown — use a single text input."
    - "Code is alphanumeric AND case-sensitive in a way the slot UI cannot make obvious — fall back to a single masked input."

canonicalImports:
  css:
    - "rends/components/composites/ren-otp/ren-otp.css"
  js:
    - "rends/components/composites/ren-otp/ren-otp.js"
  notes:
    - "Public Token API has no --ren-otp-* tokens; theme through the semantic input tokens and size scale listed below."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Use <ren-otp length=\"6\" type=\"numeric\"> as the host element — slots are generated by JS, do not author them by hand."
  - "If you must author slots, each must be a real <input class=\"ren-otp-slot\" type=\"text\" maxlength=\"1\" inputmode=\"numeric|text\" aria-label=\"Code digit N of M\" data-index=\"N\">."
  - "Optional separators are <div class=\"ren-otp-separator\"> placed between slot groups; they are pointer-events: none and decorative."
  - "Size variants .ren-otp-sm and .ren-otp-lg go on the wrapper; do not size individual .ren-otp-slot."
  - "Validation state goes on the wrapper as [data-valid] or [data-invalid]; the per-slot [data-filled] is set automatically by the component."

forbiddenPatterns:
  - "Using a single <input maxlength=\"6\"> styled to look segmented — keyboard caret control and paste-distribute won't work."
  - "Removing maxlength=\"1\" / inputmode — without them mobile keyboards switch back to letters and the auto-advance breaks."
  - "Manually wiring focus on slot blur / change — let handleSlotInput / handleSlotKeydown manage focus transitions to keep Backspace and paste flows correct."
  - "Hardcoding the slot size — use --touch-min for the default, --size-sm via .ren-otp-sm, --size-lg via .ren-otp-lg."
  - "Mixing data-valid and data-invalid on the wrapper simultaneously — setValid() removes the opposite attribute by design."

tokenPolicy:
  allowed:
    - "Semantic input tokens: --color-input-bg, --color-input-bg-hover, --color-input-border, --color-input-border-focus, --color-input-focus-ring, --color-input-placeholder, --color-disabled-bg, --color-disabled-text."
    - "Semantic state / text tokens: --color-text, --color-text-muted, --color-border, --color-fill, --color-accent, --color-danger, --color-success."
    - "Layout / type / motion tokens: --space-0-5, --space-1, --space-2, --space-3, --stroke-1, --radius-sm, --radius-md, --radius-lg, --touch-min, --size-sm, --size-lg, --text-sm, --text-lg, --body-size, --font-mono, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / rgb() colors for focus rings or borders; the current CSS still uses rgb() for the danger / success ring tints — do not replicate, prefer tokens."
    - "Inventing --ren-otp-* custom properties not present in the source until they ship in the Public Token API."

accessibility:
  required:
    - "Slot dimensions default to var(--touch-min) (44px) for thumb accuracy; --size-sm only for non-touch surfaces."
    - "Each slot exposes aria-label=\"Code digit N of M\" so screen readers announce position; do not strip these labels."
    - "Backspace, ArrowLeft/Right, Home, End move focus across slots — keep the keydown handler intact when extending the component."
    - "Paste handler must run on every slot so users can paste from any slot, not only the first."
    - "data-valid and data-invalid are paired with text feedback elsewhere on the form (do not communicate validation through color alone)."
    - ":focus-visible draws --color-accent at 2px outline; do not remove it without restoring an equivalent ring."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-otp/ren-otp.css">
<script type="module" src="rends/components/composites/ren-otp/ren-otp.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-otp">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-otp`
- `.ren-otp-lg`
- `.ren-otp-separator`
- `.ren-otp-slot`
- `.ren-otp-sm`

## States And Attributes

- `[data-filled]`
- `[data-invalid]`
- `[data-valid]`
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

- `components/composites/ren-otp/ren-otp.css`
- `components/composites/ren-otp/ren-otp.js`
- `docs/components/ren-otp.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ═══════════════════════════════════════════════════════════════
   REN OTP (ONE-TIME PASSWORD) INPUT COMPONENT
   ═══════════════════════════════════════════════════════════════
   A flexible OTP input with auto-advancing slots, paste support,
   and validation states. Handles numeric and alphanumeric codes.
   Follows RenDS design token system.

   Usage:
   <ren-otp length="6" type="numeric">
     \3c !-- Slots auto-generated by JS -->
   </ren-otp>

   Attributes:
   - length: Number of OTP digits (default: 6)
   - type: "numeric" or "alphanumeric" (default: "numeric")
   - disabled: Disable all slots

   Data Attributes:
   - data-valid: Success state
   - data-invalid: Error state
   - data-filled: On individual slots when filled
   ═══════════════════════════════════════════════════════════════ */

/* ═══ BASE WRAPPER ═══ */
.ren-otp {
  container-type: inline-size;
  container-name: ren-otp;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

/* ═══ INDIVIDUAL SLOT ═══ */
.ren-otp-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--touch-min);
  height: var(--touch-min);
  padding: 0;
  font-size: var(--text-lg);
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--color-text);
  background-color: var(--color-input-bg);
  border: var(--stroke-1) solid var(--color-input-border);
  border-radius: var(--radius-md);
  outline: none;
  cursor: text;
  caret-color: var(--color-accent);
  text-align: center;
  transition: var(--transition-tactile);

  /* ═══ PLACEHOLDER STYLING ═══ */
  &::placeholder {
    color: var(--color-input-placeholder);
  }

  /* ═══ HOVER STATE ═══ */
  &:hover:not(:disabled):not(:focus) {
    background-color: var(--color-input-bg-hover);
  }

  /* ═══ FOCUS STATE ═══ */
  &:focus {
    border-color: var(--color-input-border-focus);
    box-shadow: 0 0 0 3px var(--color-input-focus-ring);
    background-color: var(--color-input-bg-hover);
  }

  /* ═══ FILLED STATE ═══ */
  &[data-filled] {
    background-color: var(--color-fill);
    border-color: var(--color-input-border);
  }

  /* ═══ DISABLED STATE ═══ */
  &:disabled {
    background-color: var(--color-disabled-bg);
    color: var(--color-disabled-text);
    cursor: not-allowed;
    opacity: 0.7;
    border-color: var(--color-border);
  }
}

/* ═══ SEPARATOR ═══ */
.ren-otp-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: var(--touch-min);
  padding: 0 var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--text-lg);
  font-weight: 300;
  user-select: none;
  pointer-events: none;
}

/* ═══════════════════════════════════════════════════════════════
   VALIDATION STATES
   ═══════════════════════════════════════════════════════════════ */

/* ═══ ERROR STATE ═══ */
.ren-otp[data-invalid] .ren-otp-slot {
  border-color: var(--color-danger);

  &:focus {
    box-shadow: 0 0 0 3px rgb(255, 59, 48, 0.15);
    border-color: var(--color-danger);
  }
}

/* ═══ SUCCESS STATE ═══ */
.ren-otp[data-valid] .ren-otp-slot {
  border-color: var(--color-success);

  &:focus {
    box-shadow: 0 0 0 3px rgb(52, 199, 89, 0.15);
    border-color: var(--color-success);
  }
}

/* ═══════════════════════════════════════════════════════════════
   SIZE VARIANTS
   ═══════════════════════════════════════════════════════════════ */

/* ═══ SMALL VARIANT ═══ */
.ren-otp-sm {
  gap: var(--space-1);

  & .ren-otp-slot {
    width: var(--size-sm);
    height: var(--size-sm);
    font-size: var(--text-sm);
    border-radius: var(--radius-sm);
  }

  & .ren-otp-separator {
    height: var(--size-sm);
    font-size: var(--text-sm);
  }
}

/* ═══ LARGE VARIANT ═══ */
.ren-otp-lg {
  gap: var(--space-3);

  & .ren-otp-slot {
    width: var(--size-lg);
    height: var(--size-lg);
    font-size: var(--body-size);
    border-radius: var(--radius-lg);
  }

  & .ren-otp-separator {
    height: var(--size-lg);
    font-size: var(--body-size);
  }
}

/* ═══════════════════════════════════════════════════════════════
   ACCESSIBILITY
   ═══════════════════════════════════════════════════════════════ */

/* ═══ FOCUS VISIBLE (KEYBOARD NAVIGATION) ═══ */
.ren-otp-slot:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* ═══ DISABLED WRAPPER ═══ */
.ren-otp[disabled] .ren-otp-slot {
  cursor: not-allowed;
  opacity: 0.6;
}

/* ═══════════════════════════════════════════════════════════════
   REDUCED MOTION
   ═══════════════════════════════════════════════════════════════ */

@media (prefers-reduced-motion: reduce) {
  .ren-otp-slot {
    transition: none;
  }
}

/* ═══════════════════════════════════════════════════════════════
   MOBILE RESPONSIVENESS
   ═══════════════════════════════════════════════════════════════ */

@container ren-otp (max-width: 360px) {
  .ren-otp {
    gap: var(--space-1);

    & .ren-otp-slot {
      width: var(--size-sm);
      height: var(--size-sm);
      font-size: var(--text-sm);
    }

    & .ren-otp-separator {
      height: var(--size-sm);
      font-size: var(--text-sm);
      padding: 0 var(--space-0-5);
    }
  }
}


/* ═══════════════════════════════════════════════════════════════
   REN OTP (ONE-TIME PASSWORD) INPUT WEB COMPONENT
   ═══════════════════════════════════════════════════════════════
   A light-DOM web component for collecting OTP/PIN codes.
   Auto-creates input slots, manages focus transitions,
   handles paste events, and validates completion.

   Attributes:
   - length: Number of code slots (default: 6)
   - type: "numeric" or "alphanumeric" (default: "numeric")
   - disabled: Disable all slots

   Data Attributes:
   - data-valid: Set to mark as success
   - data-invalid: Set to mark as error
   - data-filled: Set on individual slots when they have content

   Events:
   - ren-change: Dispatched on any slot change { value: partial }
   - ren-complete: Dispatched when all slots filled { value: complete }

   Methods:
   - getValue(): Return current combined code
   - reset(): Clear all slots
   - focus(): Focus first slot
   ═══════════════════════════════════════════════════════════════ */

export class RenOtp extends HTMLElement {
  constructor() {
    super();

    /* ═══ STATE ═══ */
    this.length = 6;
    this.type = 'numeric';
    this.slots = [];

    /* ═══ BIND METHODS ═══ */
    this.handleSlotInput = this.handleSlotInput.bind(this);
    this.handleSlotKeydown = this.handleSlotKeydown.bind(this);
    this.handleSlotPaste = this.handleSlotPaste.bind(this);
    this.handleSlotFocus = this.handleSlotFocus.bind(this);
  }

  connectedCallback() {
    /* ═══ READ ATTRIBUTES ═══ */
    const lengthAttr = this.getAttribute('length');
    const typeAttr = this.getAttribute('type');
    const disabledAttr = this.hasAttribute('disabled');

    if (lengthAttr !== null) this.length = parseInt(lengthAttr, 10);
    if (typeAttr !== null) this.type = typeAttr;

    /* ═══ CREATE SLOTS ═══ */
    this.createSlots(disabledAttr);
  }

  /* ═══════════════════════════════════════════════════════════════
     SLOT CREATION & SETUP
     ═══════════════════════════════════════════════════════════════ */
  createSlots(disabled = false) {
    /* ═══ CLEAR EXISTING SLOTS ═══ */
    this.slots = [];
    const existingSlots = this.querySelectorAll('.ren-otp-slot');
    existingSlots.forEach((slot) => slot.remove());

    /* ═══ CREATE NEW SLOTS ═══ */
    for (let i = 0; i < this.length; i++) {
      const slot = document.createElement('input');
      slot.type = 'text';
      slot.className = 'ren-otp-slot';
      slot.setAttribute('inputmode', this.type === 'numeric' ? 'numeric' : 'text');
      slot.setAttribute('maxlength', '1');
      slot.setAttribute('placeholder', '•');
      slot.setAttribute('autocomplete', 'off');
      slot.setAttribute('data-index', i.toString());
      slot.setAttribute('aria-label', `Code digit ${i + 1} of ${this.length}`);

      if (disabled) {
        slot.disabled = true;
      }

      /* ═══ ATTACH EVENT LISTENERS ═══ */
      slot.addEventListener('input', this.handleSlotInput);
      slot.addEventListener('keydown', this.handleSlotKeydown);
      slot.addEventListener('paste', this.handleSlotPaste);
      slot.addEventListener('focus', this.handleSlotFocus);

      this.appendChild(slot);
      this.slots.push(slot);
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     EVENT HANDLERS
     ═══════════════════════════════════════════════════════════════ */

  handleSlotInput = (e) => {
    const slot = e.target;
    const index = parseInt(slot.getAttribute('data-index'), 10);
    let value = slot.value;

    /* ═══ VALIDATE INPUT ═══ */
    if (this.type === 'numeric') {
      value = value.replace(/[^0-9]/g, '');
    } else if (this.type === 'alphanumeric') {
      value = value.replace(/[^a-zA-Z0-9]/g, '');
    }

    /* ═══ ENFORCE MAX LENGTH ═══ */
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    slot.value = value;

    /* ═══ UPDATE FILLED STATE ═══ */
    if (value) {
      slot.setAttribute('data-filled', '');
    } else {
      slot.removeAttribute('data-filled');
    }

    /* ═══ AUTO-ADVANCE TO NEXT SLOT ═══ */
    if (value && index < this.slots.length - 1) {
      this.slots[index + 1].focus();
    }

    /* ═══ DISPATCH CHANGE EVENT ═══ */
    this.dispatchChangeEvent();

    /* ═══ CHECK COMPLETION ═══ */
    this.checkCompletion();
  };

  handleSlotKeydown = (e) => {
    const slot = e.target;
    const index = parseInt(slot.getAttribute('data-index'), 10);

    /* ═══ BACKSPACE: MOVE TO PREVIOUS SLOT ═══ */
    if (e.key === 'Backspace') {
      if (slot.value) {
        slot.value = '';
        slot.removeAttribute('data-filled');
        this.dispatchChangeEvent();
      } else if (index > 0) {
        e.preventDefault();
        const prevSlot = this.slots[index - 1];
        prevSlot.value = '';
        prevSlot.removeAttribute('data-filled');
        prevSlot.focus();
        this.dispatchChangeEvent();
      }
    }

    /* ═══ ARROW KEYS: NAVIGATE SLOTS ═══ */
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      this.slots[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < this.slots.length - 1) {
      e.preventDefault();
      this.slots[index + 1].focus();
    }

    /* ═══ HOME/END: FIRST/LAST SLOT ═══ */
    if (e.key === 'Home') {
      e.preventDefault();
      this.slots[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      this.slots[this.slots.length - 1].focus();
    }
  };

  handleSlotPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData?.getData('text') || '';

    if (!pastedData) return;

    /* ═══ VALIDATE PASTED DATA ═══ */
    let sanitized = pastedData;
    if (this.type === 'numeric') {
      sanitized = pastedData.replace(/[^0-9]/g, '');
    } else if (this.type === 'alphanumeric') {
      sanitized = pastedData.replace(/[^a-zA-Z0-9]/g, '');
    }

    /* ═══ DISTRIBUTE ACROSS SLOTS ═══ */
    const index = parseInt(e.target.getAttribute('data-index'), 10);
    for (let i = 0; i < sanitized.length && index + i < this.slots.length; i++) {
      const slot = this.slots[index + i];
      slot.value = sanitized[i];
      slot.setAttribute('data-filled', '');
    }

    /* ═══ FOCUS NEXT EMPTY OR LAST SLOT ═══ */
    const nextEmptyIndex = this.slots.findIndex(
      (s, i) => i >= index && s.value === ''
    );
    if (nextEmptyIndex !== -1) {
      this.slots[nextEmptyIndex].focus();
    } else {
      this.slots[this.slots.length - 1].focus();
    }

    /* ═══ DISPATCH CHANGE & CHECK COMPLETION ═══ */
    this.dispatchChangeEvent();
    this.checkCompletion();
  };

  handleSlotFocus = (e) => {
    /* ═══ SELECT ALL TEXT WHEN FOCUSED ═══ */
    e.target.select();
  };

  /* ═══════════════════════════════════════════════════════════════
     PUBLIC METHODS
     ═══════════════════════════════════════════════════════════════ */

  getValue() {
    return this.slots.map((slot) => slot.value).join('');
  }

  reset() {
    this.slots.forEach((slot) => {
      slot.value = '';
      slot.removeAttribute('data-filled');
    });

    this.removeAttribute('data-valid');
    this.removeAttribute('data-invalid');
    this.dispatchChangeEvent();

    if (this.slots.length > 0) {
      this.slots[0].focus();
    }
  }

  setValid(isValid) {
    if (isValid) {
      this.setAttribute('data-valid', '');
      this.removeAttribute('data-invalid');
    } else {
      this.setAttribute('data-invalid', '');
      this.removeAttribute('data-valid');
    }
  }

  clearValidation() {
    this.removeAttribute('data-valid');
    this.removeAttribute('data-invalid');
  }

  /* ═══════════════════════════════════════════════════════════════
     UTILITY METHODS
     ═══════════════════════════════════════════════════════════════ */

  checkCompletion() {
    const value = this.getValue();
    const isComplete = value.length === this.length;

    if (isComplete) {
      this.dispatchCompleteEvent(value);
    }
  }

  dispatchChangeEvent() {
    const value = this.getValue();

    this.dispatchEvent(
      new CustomEvent('ren-change', {
        bubbles: true,
        composed: true,
        detail: {
          value: value,
        },
      })
    );
  }

  dispatchCompleteEvent(value) {
    this.dispatchEvent(
      new CustomEvent('ren-complete', {
        bubbles: true,
        composed: true,
        detail: {
          value: value,
        },
      })
    );
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
      this.slots.forEach((slot) => {
        slot.disabled = true;
      });
    } else {
      this.removeAttribute('disabled');
      this.slots.forEach((slot) => {
        slot.disabled = false;
      });
    }
  }

  /* ═══ OVERRIDE FOCUS METHOD ═══ */
  focus() {
    if (this.slots.length > 0) {
      this.slots[0].focus();
    }
  }
}

/* ═══ REGISTER COMPONENT ═══ */
if (!customElements.get('ren-otp')) {
  customElements.define('ren-otp', RenOtp);
}
