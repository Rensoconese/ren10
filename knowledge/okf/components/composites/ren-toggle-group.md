---
type: "RenDS Component"
title: ren-toggle-group
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-toggle-group
sourcePath: components/composites/ren-toggle-group
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

# ren-toggle-group

Source path: `components/composites/ren-toggle-group`

## Relationships

- `exposes_selector` -> [.ren-toggle-group](../../selectors/ren-toggle-group.md)
- `exposes_selector` -> [.ren-toggle-group-full](../../selectors/ren-toggle-group-full.md)
- `exposes_selector` -> [.ren-toggle-group-item](../../selectors/ren-toggle-group-item.md)
- `exposes_selector` -> [.ren-toggle-group-lg](../../selectors/ren-toggle-group-lg.md)
- `exposes_selector` -> [.ren-toggle-group-sm](../../selectors/ren-toggle-group-sm.md)
- `has_contract` -> [ren-toggle-group component.md](../../foundation/contract-composite-ren-toggle-group.md)
- `has_css` -> [ren-toggle-group.css](../../css/ren-toggle-group-css.md)
- `has_docs_page` -> [ren-toggle-group docs](../../docs/ren-toggle-group-docs.md)
- `has_js` -> [ren-toggle-group.js](../../javascript/ren-toggle-group-js.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-border-strong](../../tokens/color-border-strong.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--font-size-body](../../tokens/font-size-body.md)
- `uses_token` -> [--font-size-label](../../tokens/font-size-label.md)
- `uses_token` -> [--font-size-xs](../../tokens/font-size-xs.md)
- `uses_token` -> [--radius-lg](../../tokens/radius-lg.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--shadow-sm](../../tokens/shadow-sm.md)
- `uses_token` -> [--space-0-5](../../tokens/space-0-5.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--touch-min](../../tokens/touch-min.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-toggle-group",
    ".ren-toggle-group-full",
    ".ren-toggle-group-item",
    ".ren-toggle-group-lg",
    ".ren-toggle-group-sm"
  ],
  "tokens": [
    "--color-accent",
    "--color-border",
    "--color-border-strong",
    "--color-fill",
    "--color-surface",
    "--color-text",
    "--color-text-muted",
    "--font-size-body",
    "--font-size-label",
    "--font-size-xs",
    "--radius-lg",
    "--radius-md",
    "--shadow-sm",
    "--space-0-5",
    "--space-1",
    "--space-2",
    "--space-3",
    "--space-4",
    "--touch-min",
    "--transition-tactile"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-toggle-group Component Contract

Grouped toggle controls for mutually exclusive or multi-select modes.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-toggle-group` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-toggle-group` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Toggle Group composite behavior or visual role.
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
    - "User picks from a small set of mutually exclusive options shown as visually grouped buttons (single mode)."
    - "User toggles multiple independent options that share a control (multiple mode, type=\"multiple\")."
    - "The choices are short labels or icons (text alignment, view density, list/grid mode) better surfaced than in a select."
    - "You want a visual variant — default filled pill group or .ren-toggle-group-outline."
    - "You need size variants (.ren-toggle-group-sm / .ren-toggle-group-lg), full-width fill, or vertical orientation."
  avoidWhen:
    - "The choice set is large or sortable — use ren-select."
    - "The choice is binary on/off for a single concept — use ren-switch or ren-checkbox."
    - "Items are commands rather than state — use ren-toolbar."
    - "Items are pages or routes — use ren-tabs or ren-nav."

canonicalImports:
  css:
    - "rends/components/composites/ren-toggle-group/ren-toggle-group.css"
  js:
    - "rends/components/composites/ren-toggle-group/ren-toggle-group.js"
  notes:
    - "JS is required: it wires role=button, roving tabindex, aria-pressed updates, keyboard navigation, and the ren-toggle-group-change event."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "<ren-toggle-group type=\"single|multiple\" value=\"...\"> wraps real <button class=\"ren-toggle-group-item\" data-value=\"...\"> elements (the component will also accept [role=button] nodes)."
  - "Each item must carry a data-value attribute or a stable textContent — the component uses it to drive selection and the change event."
  - "Set type=\"single\" for mutually-exclusive selection (the component clears other aria-pressed values) or type=\"multiple\" for independent toggles."
  - "Variants are applied on the host: .ren-toggle-group-outline, .ren-toggle-group-sm / -lg, .ren-toggle-group-full, .ren-toggle-group-vertical."
  - "Icons inside items must be <svg> or [role=\"img\"] children sized to 1em (handled by the CSS); accompany icons with text or aria-label."

forbiddenPatterns:
  - "<a href> as items — toggle-group is for state, not navigation."
  - "Setting aria-pressed manually on items; let the component drive it via setValue / click handling."
  - "Using ren-btn inside the group as items — they bring their own chrome; use plain <button class=\"ren-toggle-group-item\"> instead."
  - "Hardcoding the pressed background (background: #fff) — use --color-surface / --color-accent semantic tokens and the outline variant for accent fills."
  - "Removing the focus-visible outline without restoring an outline-offset visible ring."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-toggle-active-bg, --ren-toggle-active-color, --ren-toggle-bg, --ren-toggle-color, --ren-toggle-font-size, --ren-toggle-font-weight, --ren-toggle-height, --ren-toggle-padding-x, --ren-toggle-radius."
    - "Semantic tokens: --color-fill, --color-surface, --color-text, --color-text-muted, --color-accent, --color-border, --color-border-strong."
    - "Shape / motion tokens: --radius-md, --radius-lg, --space-*, --shadow-sm, --touch-min, --transition-tactile, font-size tokens (--font-size-label, --font-size-body, --font-size-xs)."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgb / named color values in overrides for the pressed background or accent border."
    - "Hardcoded transition durations on item hover; route through --transition-tactile."

accessibility:
  required:
    - "Items are real <button> elements with role=\"button\" and aria-pressed reflecting state; roving tabindex ensures only one item is tabindex=0 at a time."
    - "Arrow Right/Down moves focus to the next item, Arrow Left/Up to the previous (wrapping); Home / End jump to first / last."
    - "Touch target meets calc(var(--touch-min) - 4px); .ren-toggle-group-sm should only be used in non-touch contexts."
    - "Active state communicates via background AND font-weight / box-shadow — never rely on color alone."
    - "Focus-visible outline is 2px solid var(--color-accent) with outline-offset; preserve it across all variants."
    - "Disabled items use :disabled with pointer-events: none so they remain in tab order semantics but cannot be activated."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-toggle-group/ren-toggle-group.css">
<script type="module" src="rends/components/composites/ren-toggle-group/ren-toggle-group.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-toggle-group">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-toggle-group`
- `.ren-toggle-group-full`
- `.ren-toggle-group-item`
- `.ren-toggle-group-lg`
- `.ren-toggle-group-outline`
- `.ren-toggle-group-sm`
- `.ren-toggle-group-vertical`

## States And Attributes

- `[aria-pressed]`
- `[data-state]`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-toggle-active-bg`
- `--ren-toggle-active-color`
- `--ren-toggle-bg`
- `--ren-toggle-color`
- `--ren-toggle-font-size`
- `--ren-toggle-font-weight`
- `--ren-toggle-height`
- `--ren-toggle-padding-x`
- `--ren-toggle-radius`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-toggle-group/ren-toggle-group.css`
- `components/composites/ren-toggle-group/ren-toggle-group.js`
- `docs/components/ren-toggle-group.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ═══ REN TOGGLE GROUP COMPONENT ═══ */

/* ═══ BASE CONTAINER ═══ */
.ren-toggle-group {
  display: inline-flex;
  gap: var(--space-0-5);
  background: var(--color-fill);
  border-radius: var(--radius-lg);
  padding: 2px;
  align-items: center;

  & .ren-toggle-group-item {
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--font-size-label);
    color: var(--color-text-muted);
    cursor: pointer;
    min-height: calc(var(--touch-min, 44px) - 4px);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-1);
    transition: var(--transition-tactile);
    user-select: none;
    border: none;
    background: transparent;
    font-family: inherit;
    font-weight: 400;
    white-space: nowrap;

    /* ═══ HOVER STATE ═══ */
    &:hover:not([aria-pressed="true"]) {
      color: var(--color-text);
    }

    /* ═══ ACTIVE/PRESSED STATE ═══ */
    &[aria-pressed="true"],
    &[data-state="on"] {
      background: var(--color-surface);
      color: var(--color-text);
      font-weight: 500;
      box-shadow: var(--shadow-sm);
    }

    /* ═══ FOCUS VISIBLE ═══ */
    &:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }

    /* ═══ DISABLED STATE ═══ */
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
  }
}

/* ═══ OUTLINE VARIANT ═══ */
.ren-toggle-group.ren-toggle-group-outline {
  background: transparent;
  padding: 0;
  gap: var(--space-1);

  & .ren-toggle-group-item {
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-muted);

    &:hover:not([aria-pressed="true"]) {
      border-color: var(--color-border-strong);
      color: var(--color-text);
    }

    &[aria-pressed="true"],
    &[data-state="on"] {
      border-color: var(--color-accent);
      background: color-mix(in srgb, var(--color-accent) 10%, transparent);
      color: var(--color-accent);
      font-weight: 500;
      box-shadow: none;
    }
  }
}

/* ═══ SIZE VARIANTS ═══ */
.ren-toggle-group {
  &.ren-toggle-group-sm {
    gap: 1px;
    padding: 1px;

    & .ren-toggle-group-item {
      padding: var(--space-0-5) var(--space-2);
      font-size: var(--font-size-xs);
      min-height: calc(var(--touch-min, 44px) - 12px);
    }
  }

  &.ren-toggle-group-lg {
    gap: var(--space-1);
    padding: var(--space-0-5);

    & .ren-toggle-group-item {
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-body);
      min-height: calc(var(--touch-min, 44px) + 4px);
    }
  }
}

/* ═══ FULL WIDTH ═══ */
.ren-toggle-group.ren-toggle-group-full {
  display: flex;
  width: 100%;

  & .ren-toggle-group-item {
    flex: 1;
  }
}

/* ═══ VERTICAL ORIENTATION ═══ */
.ren-toggle-group.ren-toggle-group-vertical {
  flex-direction: column;
  display: inline-flex;

  &.ren-toggle-group-full {
    display: flex;
    width: 100%;
  }
}

/* ═══ ICON SUPPORT ═══ */
.ren-toggle-group-item {
  & [role="img"],
  & svg {
    width: 1em;
    height: 1em;
    display: inline-block;
    vertical-align: middle;
  }
}

/* ═══ TRANSITIONS ═══ */
@media (prefers-reduced-motion: reduce) {
  .ren-toggle-group-item {
    transition: none;
  }
}


/* ═══ REN TOGGLE GROUP WEB COMPONENT ═══ */

export class RenToggleGroup extends HTMLElement {
  constructor() {
    super();
    this.type = 'single';
    this.selectedValue = null;
    this.items = [];
    this.handleItemClick = this.handleItemClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  connectedCallback() {
    /* ═══ READ ATTRIBUTES ═══ */
    this.type = this.getAttribute('type') || 'single';
    const initialValue = this.getAttribute('value');

    /* ═══ FIND ALL ITEMS ═══ */
    this.items = Array.from(
      this.querySelectorAll('.ren-toggle-group-item, [role="button"]')
    );

    if (this.items.length === 0) {
      console.warn('RenToggleGroup: No items found');
      return;
    }

    /* ═══ SET UP ARIA ATTRIBUTES ═══ */
    this.items.forEach((item, index) => {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
      item.setAttribute('aria-pressed', 'false');

      /* ═══ ADD CLASSES ═══ */
      item.classList.add('ren-toggle-group-item');

      /* ═══ EVENT LISTENERS ═══ */
      item.addEventListener('click', this.handleItemClick);
      item.addEventListener('keydown', this.handleKeyDown);
    });

    /* ═══ SET INITIAL VALUE ═══ */
    if (initialValue) {
      this.setValue(initialValue);
    }

    /* ═══ ENSURE CONTAINER HAS CLASS ═══ */
    this.classList.add('ren-toggle-group');
  }

  disconnectedCallback() {
    this.items.forEach((item) => {
      item.removeEventListener('click', this.handleItemClick);
      item.removeEventListener('keydown', this.handleKeyDown);
    });
  }

  /* ═══ ITEM CLICK HANDLER ═══ */
  handleItemClick(event) {
    const item = event.currentTarget;
    const value = item.getAttribute('data-value') || item.textContent;

    if (this.type === 'single') {
      this.setValue(value);
    } else {
      /* ═══ MULTIPLE MODE: TOGGLE ═══ */
      const isPressed = item.getAttribute('aria-pressed') === 'true';
      item.setAttribute('aria-pressed', !isPressed);
      this.dispatchChangeEvent();
    }
  }

  /* ═══ KEYBOARD NAVIGATION ═══ */
  handleKeyDown(event) {
    const currentIndex = this.items.indexOf(event.currentTarget);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % this.items.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + this.items.length) % this.items.length;
    } else if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.click();
      return;
    }

    if (nextIndex !== currentIndex) {
      this.items[currentIndex].setAttribute('tabindex', '-1');
      const nextItem = this.items[nextIndex];
      nextItem.setAttribute('tabindex', '0');
      nextItem.focus();
    }
  }

  /* ═══ SET SINGLE VALUE ═══ */
  setValue(value) {
    if (this.type !== 'single') {
      console.warn('RenToggleGroup: setValue only works in single mode');
      return;
    }

    /* ═══ CLEAR PREVIOUS SELECTION ═══ */
    this.items.forEach((item) => {
      item.setAttribute('aria-pressed', 'false');
    });

    /* ═══ SET NEW SELECTION ═══ */
    const targetItem = this.items.find(
      (item) =>
        (item.getAttribute('data-value') || item.textContent) === value
    );

    if (targetItem) {
      targetItem.setAttribute('aria-pressed', 'true');
      this.selectedValue = value;
      this.dispatchChangeEvent();
    }
  }

  /* ═══ DISPATCH CHANGE EVENT ═══ */
  dispatchChangeEvent() {
    const selectedItems =
      this.type === 'single'
        ? [this.items.find((item) => item.getAttribute('aria-pressed') === 'true')]
        : this.items.filter((item) => item.getAttribute('aria-pressed') === 'true');

    const values = selectedItems
      .filter(Boolean)
      .map((item) => item.getAttribute('data-value') || item.textContent);

    this.dispatchEvent(
      new CustomEvent('ren-toggle-change', {
        detail: {
          value: this.type === 'single' ? values[0] : values,
          items: selectedItems.filter(Boolean),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /* ═══ GETTERS AND SETTERS ═══ */
  get value() {
    if (this.type === 'single') {
      return this.selectedValue;
    } else {
      return this.items
        .filter((item) => item.getAttribute('aria-pressed') === 'true')
        .map((item) => item.getAttribute('data-value') || item.textContent);
    }
  }

  set value(val) {
    if (this.type === 'single') {
      this.setValue(val);
    }
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(val) {
    if (val) {
      this.setAttribute('disabled', '');
      this.items.forEach((item) => item.setAttribute('disabled', ''));
    } else {
      this.removeAttribute('disabled');
      this.items.forEach((item) => item.removeAttribute('disabled'));
    }
  }
}

/* ═══ REGISTER COMPONENT ═══ */
if (!customElements.get('ren-toggle-group')) {
  customElements.define('ren-toggle-group', RenToggleGroup);
}
