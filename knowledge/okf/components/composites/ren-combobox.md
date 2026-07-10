---
type: "RenDS Component"
title: ren-combobox
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-combobox
sourcePath: components/composites/ren-combobox
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

# ren-combobox

Source path: `components/composites/ren-combobox`

## Relationships

- `exposes_selector` -> [.ren-combobox](../../selectors/ren-combobox.md)
- `has_contract` -> [ren-combobox component.md](../../foundation/contract-composite-ren-combobox.md)
- `has_css` -> [ren-combobox.css](../../css/ren-combobox-css.md)
- `has_docs_page` -> [ren-combobox docs](../../docs/ren-combobox-docs.md)
- `has_js` -> [ren-combobox.js](../../javascript/ren-combobox-js.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-accent-subtle](../../tokens/color-accent-subtle.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-fill-active](../../tokens/color-fill-active.md)
- `uses_token` -> [--color-fill-hover](../../tokens/color-fill-hover.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--duration-micro](../../tokens/duration-micro.md)
- `uses_token` -> [--duration-slow](../../tokens/duration-slow.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--leading-5](../../tokens/leading-5.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--radius-lg](../../tokens/radius-lg.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--radius-sm](../../tokens/radius-sm.md)
- `uses_token` -> [--shadow-lg](../../tokens/shadow-lg.md)
- `uses_token` -> [--space-0-5](../../tokens/space-0-5.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-8](../../tokens/space-8.md)
- `uses_token` -> [--text-sm](../../tokens/text-sm.md)
- `uses_token` -> [--text-xs](../../tokens/text-xs.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-combobox"
  ],
  "tokens": [
    "--color-accent",
    "--color-accent-subtle",
    "--color-border",
    "--color-fill",
    "--color-fill-active",
    "--color-fill-hover",
    "--color-surface",
    "--color-text",
    "--color-text-muted",
    "--duration-enter",
    "--duration-micro",
    "--duration-slow",
    "--ease-enter",
    "--leading-5",
    "--radius-full",
    "--radius-lg",
    "--radius-md",
    "--radius-sm",
    "--shadow-lg",
    "--space-0-5",
    "--space-1",
    "--space-2",
    "--space-3",
    "--space-8",
    "--text-sm",
    "--text-xs",
    "--transition-tactile"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-combobox Component Contract

Autocomplete/select composite with input, listbox, and keyboard behavior.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-combobox` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-combobox` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Combobox composite behavior or visual role.
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
    - "Users must filter / autocomplete from a large list using free-text input."
    - "You need a typeahead with keyboard navigation (Arrow Up/Down, Enter, Escape)."
    - "Grouped options or items with secondary descriptions are needed."
    - "Async loading states (.ren-combobox-loading) or empty states (.ren-combobox-empty) are required."
    - "Single-select with a text-input affordance is the right control (input visible at rest)."
    - "The inline list needs a preferred top/bottom opening side via placement without becoming a Popover API overlay."
  avoidWhen:
    - "Users pick from a short fixed list without filtering — use ren-select."
    - "Multi-select with tag chips is required — use a dedicated multi-select / ren-multiselect."
    - "The input is a free-form search that submits a query — use ren-input + ren-search."
    - "The list is a navigation menu — use ren-menu / ren-command."

canonicalImports:
  css:
    - "rends/components/composites/ren-combobox/ren-combobox.css"
  js:
    - "rends/components/composites/ren-combobox/ren-combobox.js"
  notes:
    - "If the page already imports rends/components/index.css, do not import the CSS again."
    - "CSS works standalone on the .ren-combobox structure; <ren-combobox> JS adds ARIA wiring, filtering, highlight bookkeeping, and open/close."
    - "The component does not define --ren-combobox-* tokens; theme through semantic tokens or scope semantic token overrides."

requiredMarkup:
  - "Root <div class=\"ren-combobox\"> wraps an <input class=\"ren-combobox-input\"> and a sibling <div class=\"ren-combobox-list\" role=\"listbox\">."
  - "Each option is <div class=\"ren-combobox-item\" role=\"option\"> with aria-selected toggled by the component and data-highlighted reflecting keyboard focus."
  - "Use .ren-combobox-item-label and .ren-combobox-item-description inside items for two-line content; do not nest extra layout divs."
  - "Empty state lives in <div class=\"ren-combobox-empty\" hidden> and the loading state in <div class=\"ren-combobox-loading\" hidden>."
  - "Group items inside <div class=\"ren-combobox-group\"> with a leading <div class=\"ren-combobox-group-label\">."
  - "Use placement=\"bottom\" by default; the host and .ren-combobox-list mirror placement to data-side. Top changes the absolute list fallback to open above the input."

forbiddenPatterns:
  - "Replacing <input> with a contentEditable div — breaks IME, autofill, and form submission."
  - "Using <ul>/<li> for the list when the component's CSS targets .ren-combobox-list / .ren-combobox-item with role=\"listbox\" / role=\"option\"."
  - "Using :hover styling alone to indicate keyboard highlight; rely on [data-highlighted] and aria-selected=\"true\"."
  - "Toggling visibility with display: none on the list; use the [hidden] attribute (CSS handles the close transition)."
  - "Hardcoded dropdown widths; the list uses inset-inline: 0 to match the input width — override --space-* / --radius-* tokens instead."

tokenPolicy:
  allowed:
    - "Semantic tokens: --color-surface, --color-border, --color-text, --color-text-muted, --color-fill, --color-fill-hover, --color-fill-active, --color-accent, --color-accent-subtle."
    - "Typography / layout: --text-xs, --text-sm, --leading-5, --space-*, --radius-sm, --radius-md, --radius-lg, --radius-full, --shadow-lg."
    - "Motion tokens: --duration-micro, --duration-enter, --duration-slow, --ease-enter, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Defining new --ren-combobox-* component tokens — the component intentionally inherits semantic tokens."

accessibility:
  required:
    - "Input has role=\"combobox\", aria-expanded reflecting list visibility, aria-controls pointing to the .ren-combobox-list id, and aria-activedescendant pointing to the highlighted option."
    - "List has role=\"listbox\" and each item has role=\"option\"; do not nest interactive controls inside an option."
    - "Keyboard contract: Arrow Down opens / moves down, Arrow Up moves up, Enter selects, Escape closes; preserve all four."
    - "Selected option sets aria-selected=\"true\"; selection is announced — never communicate via color alone."
    - "Disabled options set aria-disabled=\"true\" AND ignore activation in JS (pointer-events styling is not enough)."
    - "Loading state uses an aria-live region (or aria-busy on the input) so AT users know results are pending."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-combobox/ren-combobox.css">
<script type="module" src="rends/components/composites/ren-combobox/ren-combobox.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-combobox">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-combobox`

## States And Attributes

- `[aria-disabled]`
- `[aria-selected]`
- `[data-side]`
- `[data-highlighted]`
- `placement`
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

- `components/composites/ren-combobox/ren-combobox.css`
- `components/composites/ren-combobox/ren-combobox.js`
- `docs/components/ren-combobox.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/**
 * RenDS — Combobox
 * =================
 * Light-DOM combobox. CSS works standalone; <ren-combobox> layers ARIA
 * and behavior on top.
 *
 * Markup:
 *   <div class="ren-combobox">
 *     <input class="ren-combobox-input">
 *     <div class="ren-combobox-list" role="listbox" hidden>
 *       <div class="ren-combobox-item" role="option">…</div>
 *     </div>
 *   </div>
 */

.ren-combobox {
  position: relative;
  display: block;
  width: 100%;

  &-input {
    width: 100%;
    padding-block: var(--space-2);
    padding-inline: var(--space-3);

    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);

    font-family: inherit;
    font-size: var(--text-sm);
    line-height: var(--leading-5);
    color: var(--color-text);

    transition: var(--transition-tactile);

    &::placeholder {
      color: var(--color-text-muted);
    }

    &:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px var(--color-accent-subtle);
    }

    &:disabled {
      background: var(--color-fill);
      color: var(--color-text-muted);
      cursor: not-allowed;
    }

    /* Hide native type="search" decorations */
    &::-webkit-search-cancel-button,
    &::-webkit-search-decoration {
      -webkit-appearance: none;
      appearance: none;
      display: none;
    }
  }

  &-list {
    position: absolute;
    inset-inline: 0;
    top: calc(100% + var(--space-1));
    z-index: 50;

    max-height: 15rem;
    padding-block: var(--space-1);

    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);

    overflow-y: auto;
    overflow-x: hidden;

    /* Scrollbar styling */
    scrollbar-width: thin;
    scrollbar-color: var(--color-fill-active) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-fill-active);
      border-radius: var(--radius-full);
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--color-fill-hover);
    }

    &[hidden] {
      display: none;
    }

    /* Open animation */
    @starting-style {
      opacity: 0;
      translate: 0 -4px;
    }
    animation: ren-combobox-open var(--duration-enter) var(--ease-enter);

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  &[data-side="top"] &-list,
  &-list[data-side="top"] {
    top: auto;
    bottom: calc(100% + var(--space-1));
  }

  &[data-side="bottom"] &-list,
  &-list[data-side="bottom"] {
    top: calc(100% + var(--space-1));
    bottom: auto;
  }

  &-item {
    padding: var(--space-2) var(--space-3);
    cursor: pointer;
    border-radius: var(--radius-sm);

    display: flex;
    flex-direction: column;
    gap: var(--space-0-5, 2px);

    font-size: var(--text-sm);
    color: var(--color-text);

    transition: background-color var(--duration-micro) var(--ease-enter);

    &[hidden] {
      display: none;
    }

    &[data-highlighted] {
      background: var(--color-fill);
    }

    &[aria-selected="true"] {
      background: var(--color-accent-subtle);
      color: var(--color-accent);
      font-weight: 500;
    }

    &[aria-disabled="true"] {
      opacity: 0.5;
      cursor: not-allowed;

      &:hover,
      &[data-highlighted] {
        background: transparent;
      }
    }
  }

  &-item-label {
    font-weight: 500;
    color: var(--color-text);
  }

  &-item-description {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  &-empty {
    padding: var(--space-8) var(--space-3);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);

    &[hidden] {
      display: none;
    }
  }

  &-loading {
    padding: var(--space-3);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);

    &[hidden] {
      display: none;
    }

    &::before {
      content: '';
      display: inline-block;
      width: 0.875rem;
      height: 0.875rem;
      margin-inline-end: var(--space-2);
      vertical-align: -2px;

      border: 2px solid var(--color-border);
      border-top-color: var(--color-accent);
      border-radius: var(--radius-full);

      animation: ren-combobox-spin var(--duration-slow, 800ms) linear infinite;

      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }
    }
  }

  &-group {
    & + & {
      margin-top: var(--space-1);
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-1);
    }

    &[hidden] {
      display: none;
    }
  }

  &-group-label {
    padding: var(--space-2) var(--space-3);
    padding-bottom: var(--space-1);

    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
  }
}

@keyframes ren-combobox-open {
  from {
    opacity: 0;
    translate: 0 -4px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

@keyframes ren-combobox-spin {
  to {
    transform: rotate(360deg);
  }
}


/**
 * RenDS — <ren-combobox> Web Component
 * =====================================
 * Searchable, accessible combobox built on light DOM.
 *
 * Progressive enhancement: the markup ships with classes that work
 * standalone (.ren-combobox, .ren-combobox-input, .ren-combobox-list,
 * .ren-combobox-item). The Web Component layers ARIA wiring, keyboard
 * navigation, filtering, and a hidden form input on top.
 *
 * No Shadow DOM — light DOM only, like the rest of RenDS.
 *
 * Markup:
 *   <ren-combobox name="country" placeholder="Search a country…" value="ar">
 *     <div class="ren-combobox-item" data-value="ar">Argentina</div>
 *     <div class="ren-combobox-item" data-value="br">Brazil</div>
 *     <div class="ren-combobox-item" data-value="cl">Chile</div>
 *   </ren-combobox>
 *
 * Attributes:
 *   name        — form field name (a hidden input with this name carries the value)
 *   value       — initial selected data-value
 *   placeholder — input placeholder (default: "Search...")
 *   disabled    — locks the input
 *   async       — suppresses local filtering; consumer provides items via ren-search
 *
 * Public methods:
 *   .value          — getter / setter for the selected value
 *   .open()         — show the list
 *   .close()        — hide the list
 *   .setLoading(b)  — toggle the loading row
 *   .setItems(arr)  — replace items, each { value, label, description? }
 *
 * Events (all bubble):
 *   ren-change  — { value, item }   selection changed
 *   ren-search  — { query }         user typed (use for async loading)
 *   ren-open / ren-close            list visibility
 */

import { autoId } from '../../../utils/id-generator.js';

const COMBOBOX_SIDES = new Set(['top', 'right', 'bottom', 'left']);

function normalizeComboboxSide(value) {
  const side = String(value || 'bottom').toLowerCase().split('-')[0];

  return COMBOBOX_SIDES.has(side) ? side : 'bottom';
}

export class RenCombobox extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'placeholder', 'disabled', 'placement'];
  }

  #input;
  #list;
  #empty;
  #loading;
  #hidden;
  #liveRegion;
  #isOpen = false;
  #highlightedIndex = -1;
  #upgraded = false;
  #onDocClick;

  connectedCallback() {
    if (this.#upgraded) return;
    this.#upgraded = true;
    this.#enhance();
    this.#wire();

    // Apply initial value if present
    const initial = this.getAttribute('value');
    if (initial) {
      this.#selectByValue(initial, { silent: true });
    }
  }

  disconnectedCallback() {
    if (this.#onDocClick) {
      document.removeEventListener('click', this.#onDocClick);
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this.#upgraded) return;
    if (name === 'placeholder' && this.#input) {
      this.#input.placeholder = newVal || 'Search...';
    } else if (name === 'disabled' && this.#input) {
      this.#input.disabled = this.hasAttribute('disabled');
    } else if (name === 'value' && newVal !== oldVal) {
      this.#selectByValue(newVal, { silent: true });
    } else if (name === 'placement' && newVal !== oldVal) {
      this.#syncPlacement();
    }
  }

  /* ─── Enhancement: take light-DOM children and wire structure ─── */

  #enhance() {
    this.classList.add('ren-combobox');

    // Items: anything the consumer wrote inside (items, groups, labels).
    // Move them into a list container.
    const fragment = document.createDocumentFragment();
    while (this.firstChild) {
      fragment.appendChild(this.firstChild);
    }

    // Input. type="search" + an unguessable autocomplete value defeats the
    // Chromium heuristic that autofills "country"-flavored fields.
    this.#input = document.createElement('input');
    this.#input.type = 'search';
    this.#input.className = 'ren-combobox-input';
    this.#input.setAttribute('autocomplete', 'ren-combobox-no-autofill');
    this.#input.setAttribute('autocorrect', 'off');
    this.#input.setAttribute('autocapitalize', 'off');
    this.#input.setAttribute('data-1p-ignore', '');
    this.#input.setAttribute('data-lpignore', 'true');
    this.#input.spellcheck = false;
    this.#input.placeholder = this.getAttribute('placeholder') || 'Search...';
    if (this.hasAttribute('disabled')) this.#input.disabled = true;
    autoId(this.#input, 'combobox-input');

    // List
    this.#list = document.createElement('div');
    this.#list.className = 'ren-combobox-list';
    this.#list.hidden = true;
    autoId(this.#list, 'combobox-list');

    // Move user content into the list
    this.#list.appendChild(fragment);

    // Ensure an empty-state row exists
    this.#empty = this.#list.querySelector('.ren-combobox-empty');
    if (!this.#empty) {
      this.#empty = document.createElement('div');
      this.#empty.className = 'ren-combobox-empty';
      this.#empty.textContent = 'No results';
      this.#empty.hidden = true;
      this.#list.appendChild(this.#empty);
    }

    // Loading row (hidden by default)
    this.#loading = this.#list.querySelector('.ren-combobox-loading');
    if (!this.#loading) {
      this.#loading = document.createElement('div');
      this.#loading.className = 'ren-combobox-loading';
      this.#loading.textContent = 'Loading…';
      this.#loading.hidden = true;
      this.#list.insertBefore(this.#loading, this.#list.firstChild);
    }

    // Hidden input for form submission
    this.#hidden = document.createElement('input');
    this.#hidden.type = 'hidden';
    if (this.hasAttribute('name')) this.#hidden.name = this.getAttribute('name');

    // Live region for screen-reader announcements
    this.#liveRegion = document.createElement('div');
    this.#liveRegion.className = 'ren-sr-only';
    this.#liveRegion.setAttribute('role', 'status');
    this.#liveRegion.setAttribute('aria-live', 'polite');

    // ARIA wiring
    this.#input.setAttribute('role', 'combobox');
    this.#input.setAttribute('aria-autocomplete', 'list');
    this.#input.setAttribute('aria-expanded', 'false');
    this.#input.setAttribute('aria-controls', this.#list.id);
    this.#list.setAttribute('role', 'listbox');

    this.#decorateItems();

    // Append in canonical order
    this.appendChild(this.#input);
    this.appendChild(this.#list);
    this.appendChild(this.#hidden);
    this.appendChild(this.#liveRegion);

    this.#syncPlacement();
  }

  #syncPlacement() {
    const side = normalizeComboboxSide(this.getAttribute('placement'));

    this.setAttribute('data-side', side);
    if (this.#list) {
      this.#list.setAttribute('data-side', side);
    }
  }

  #decorateItems() {
    const items = this.#getItems();
    items.forEach((item) => {
      if (!item.hasAttribute('role')) item.setAttribute('role', 'option');
      autoId(item, 'combobox-opt');
      if (!item.hasAttribute('aria-selected')) {
        item.setAttribute('aria-selected', 'false');
      }
      if (!item.hasAttribute('tabindex')) item.setAttribute('tabindex', '-1');
    });
  }

  #getItems() {
    return Array.from(this.#list.querySelectorAll('.ren-combobox-item'));
  }

  #getVisibleItems() {
    return this.#getItems().filter((i) => !i.hidden);
  }

  /* ─── Event wiring ─── */

  #wire() {
    // Open on click (not focus): programmatic .focus() after selection
    // shouldn't reopen the list.
    this.#input.addEventListener('mousedown', () => this.open());
    this.#input.addEventListener('input', (e) => this.#onInput(e));
    this.#input.addEventListener('keydown', (e) => this.#onKeydown(e));

    // Item selection (delegated)
    this.#list.addEventListener('click', (e) => {
      const item = e.target.closest('.ren-combobox-item');
      if (item && !item.hasAttribute('aria-disabled')) {
        this.#selectItem(item);
      }
    });

    this.#list.addEventListener('mouseover', (e) => {
      const item = e.target.closest('.ren-combobox-item');
      if (!item || item.hidden) return;
      const visible = this.#getVisibleItems();
      const idx = visible.indexOf(item);
      if (idx !== -1) this.#highlight(idx);
    });

    // Close on outside click
    this.#onDocClick = (e) => {
      if (!this.contains(e.target)) this.close();
    };
    document.addEventListener('click', this.#onDocClick);
  }

  #onInput(e) {
    const query = e.target.value;

    if (this.hasAttribute('async')) {
      // Async mode: emit ren-search and let the consumer replace items
      this.dispatchEvent(
        new CustomEvent('ren-search', {
          detail: { query },
          bubbles: true,
        })
      );
    } else {
      this.#filter(query);
    }

    if (!this.#isOpen) this.open();
  }

  #onKeydown(e) {
    const visible = this.#getVisibleItems();

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!this.#isOpen) this.open();
        this.#highlight(Math.min(this.#highlightedIndex + 1, visible.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (this.#isOpen) {
          this.#highlight(Math.max(this.#highlightedIndex - 1, 0));
        }
        break;
      case 'Home':
        if (this.#isOpen) {
          e.preventDefault();
          this.#highlight(0);
        }
        break;
      case 'End':
        if (this.#isOpen) {
          e.preventDefault();
          this.#highlight(visible.length - 1);
        }
        break;
      case 'Enter':
        if (this.#isOpen && visible[this.#highlightedIndex]) {
          e.preventDefault();
          this.#selectItem(visible[this.#highlightedIndex]);
        }
        break;
      case 'Escape':
        if (this.#isOpen) {
          e.preventDefault();
          this.close();
        } else if (this.#input.value) {
          this.#input.value = '';
          this.#filter('');
        }
        break;
    }
  }

  /* ─── Filtering ─── */

  #filter(query) {
    const needle = (query || '').toLowerCase().trim();
    const items = this.#getItems();

    items.forEach((item) => {
      const match = !needle || item.textContent.toLowerCase().includes(needle);
      item.hidden = !match;
    });

    // Hide groups whose items are all hidden
    this.querySelectorAll('.ren-combobox-group').forEach((group) => {
      const groupItems = group.querySelectorAll('.ren-combobox-item');
      const anyVisible = Array.from(groupItems).some((i) => !i.hidden);
      group.hidden = !anyVisible;
    });

    const anyVisible = items.some((i) => !i.hidden);
    this.#empty.hidden = anyVisible;
    this.#highlightedIndex = -1;

    // Clear ARIA active descendant
    this.#input.removeAttribute('aria-activedescendant');

    // Announce result count
    const count = items.filter((i) => !i.hidden).length;
    if (this.#liveRegion) {
      this.#liveRegion.textContent = count
        ? `${count} result${count === 1 ? '' : 's'} available`
        : 'No results';
    }
  }

  /* ─── Highlight management (aria-activedescendant pattern) ─── */

  #highlight(index) {
    const visible = this.#getVisibleItems();
    if (!visible.length) {
      this.#highlightedIndex = -1;
      this.#input.removeAttribute('aria-activedescendant');
      return;
    }

    this.#getItems().forEach((i) => i.removeAttribute('data-highlighted'));

    const clamped = Math.max(0, Math.min(index, visible.length - 1));
    const target = visible[clamped];
    target.setAttribute('data-highlighted', '');
    this.#input.setAttribute('aria-activedescendant', target.id);
    this.#highlightedIndex = clamped;

    // Best-effort scroll; not critical if unsupported.
    if (typeof target.scrollIntoView === 'function') {
      try {
        target.scrollIntoView({ block: 'nearest' });
      } catch {}
    }
  }

  /* ─── Selection ─── */

  #selectItem(item) {
    const value = item.getAttribute('data-value') || item.textContent.trim();
    const label = item.textContent.trim();

    this.#input.value = label;
    this.#hidden.value = value;
    this.setAttribute('value', value);

    this.#getItems().forEach((i) => {
      i.setAttribute('aria-selected', i === item ? 'true' : 'false');
    });

    this.close();
    this.#input.focus();

    this.dispatchEvent(
      new CustomEvent('ren-change', {
        detail: { value, item },
        bubbles: true,
      })
    );
  }

  #selectByValue(value, { silent = false } = {}) {
    const item = this.#getItems().find(
      (i) => i.getAttribute('data-value') === value
    );
    if (!item) return;

    if (silent) {
      this.#input.value = item.textContent.trim();
      this.#hidden.value = value;
      this.#getItems().forEach((i) => {
        i.setAttribute('aria-selected', i === item ? 'true' : 'false');
      });
    } else {
      this.#selectItem(item);
    }
  }

  /* ─── Public API ─── */

  open() {
    if (this.#isOpen) return;
    this.#isOpen = true;
    this.#list.hidden = false;
    this.#input.setAttribute('aria-expanded', 'true');
    this.dispatchEvent(new CustomEvent('ren-open', { bubbles: true }));
  }

  close() {
    if (!this.#isOpen) return;
    this.#isOpen = false;
    this.#list.hidden = true;
    this.#input.setAttribute('aria-expanded', 'false');
    this.#input.removeAttribute('aria-activedescendant');
    this.#getItems().forEach((i) => i.removeAttribute('data-highlighted'));
    this.#highlightedIndex = -1;
    this.dispatchEvent(new CustomEvent('ren-close', { bubbles: true }));
  }

  setLoading(isLoading) {
    if (!this.#loading) return;
    this.#loading.hidden = !isLoading;
    if (isLoading) this.#empty.hidden = true;
  }

  setItems(items) {
    // Clear existing items (preserve groups, empty, loading)
    this.#getItems().forEach((i) => i.remove());

    const frag = document.createDocumentFragment();
    items.forEach(({ value, label, description, disabled }) => {
      const item = document.createElement('div');
      item.className = 'ren-combobox-item';
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');
      item.setAttribute('tabindex', '-1');
      autoId(item, 'combobox-opt');
      item.dataset.value = value;
      if (disabled) item.setAttribute('aria-disabled', 'true');

      if (description) {
        const main = document.createElement('div');
        main.className = 'ren-combobox-item-label';
        main.textContent = label;
        const desc = document.createElement('div');
        desc.className = 'ren-combobox-item-description';
        desc.textContent = description;
        item.append(main, desc);
      } else {
        item.textContent = label;
      }
      frag.appendChild(item);
    });

    this.#list.insertBefore(frag, this.#empty);
    this.#empty.hidden = items.length > 0;
    this.#highlightedIndex = -1;
  }

  get value() {
    return this.#hidden ? this.#hidden.value : '';
  }

  set value(val) {
    if (val == null || val === '') {
      if (this.#input) this.#input.value = '';
      if (this.#hidden) this.#hidden.value = '';
      this.#getItems().forEach((i) => i.setAttribute('aria-selected', 'false'));
      this.removeAttribute('value');
    } else {
      this.setAttribute('value', val);
    }
  }
}

if (!customElements.get('ren-combobox')) {
  customElements.define('ren-combobox', RenCombobox);
}
