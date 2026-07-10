---
type: "RenDS Component"
title: ren-menu
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-menu
sourcePath: components/composites/ren-menu
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

# ren-menu

Source path: `components/composites/ren-menu`

## Relationships

- `exposes_selector` -> [.ren-menu](../../selectors/ren-menu.md)
- `exposes_selector` -> [.ren-menu-checkbox-item](../../selectors/ren-menu-checkbox-item.md)
- `exposes_selector` -> [.ren-menu-group](../../selectors/ren-menu-group.md)
- `exposes_selector` -> [.ren-menu-item](../../selectors/ren-menu-item.md)
- `exposes_selector` -> [.ren-menu-item-description](../../selectors/ren-menu-item-description.md)
- `exposes_selector` -> [.ren-menu-item-icon](../../selectors/ren-menu-item-icon.md)
- `exposes_selector` -> [.ren-menu-item-shortcut](../../selectors/ren-menu-item-shortcut.md)
- `exposes_selector` -> [.ren-menu-label](../../selectors/ren-menu-label.md)
- `exposes_selector` -> [.ren-menu-radio-item](../../selectors/ren-menu-radio-item.md)
- `exposes_selector` -> [.ren-menu-separator](../../selectors/ren-menu-separator.md)
- `exposes_selector` -> [.ren-open](../../selectors/ren-open.md)
- `has_contract` -> [ren-menu component.md](../../foundation/contract-composite-ren-menu.md)
- `has_css` -> [ren-menu.css](../../css/ren-menu-css.md)
- `has_docs_page` -> [ren-menu docs](../../docs/ren-menu-docs.md)
- `has_js` -> [ren-menu.js](../../javascript/ren-menu-js.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-danger](../../tokens/color-danger.md)
- `uses_token` -> [--color-danger-subtle](../../tokens/color-danger-subtle.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-fill-hover](../../tokens/color-fill-hover.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--duration-exit](../../tokens/duration-exit.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--ease-exit](../../tokens/ease-exit.md)
- `uses_token` -> [--radius-lg](../../tokens/radius-lg.md)
- `uses_token` -> [--radius-sm](../../tokens/radius-sm.md)
- `uses_token` -> [--shadow-lg](../../tokens/shadow-lg.md)
- `uses_token` -> [--size-body](../../tokens/size-body.md)
- `uses_token` -> [--size-caption](../../tokens/size-caption.md)
- `uses_token` -> [--size-icon-md](../../tokens/size-icon-md.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)
- `uses_token` -> [--z-dropdown](../../tokens/z-dropdown.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-menu",
    ".ren-menu-checkbox-item",
    ".ren-menu-group",
    ".ren-menu-item",
    ".ren-menu-item-description",
    ".ren-menu-item-icon",
    ".ren-menu-item-shortcut",
    ".ren-menu-label",
    ".ren-menu-radio-item",
    ".ren-menu-separator",
    ".ren-open"
  ],
  "tokens": [
    "--color-accent",
    "--color-border",
    "--color-danger",
    "--color-danger-subtle",
    "--color-fill",
    "--color-fill-hover",
    "--color-surface",
    "--color-text",
    "--color-text-muted",
    "--duration-enter",
    "--duration-exit",
    "--ease-enter",
    "--ease-exit",
    "--radius-lg",
    "--radius-sm",
    "--shadow-lg",
    "--size-body",
    "--size-caption",
    "--size-icon-md",
    "--space-1",
    "--space-2",
    "--space-3",
    "--transition-tactile",
    "--z-dropdown"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-menu Component Contract

Menu/listbox-style command surface with keyboard navigation.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-menu` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-menu` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Menu composite behavior or visual role.
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
    - "A trigger button needs to open a list of imperative commands (Edit, Duplicate, Delete) with role=\"menu\"."
    - "You need keyboard navigation (Arrow keys, Home/End, typeahead) plus click-outside / Escape dismissal."
    - "Items must support menuitem, menuitemcheckbox, menuitemradio, separators, group labels, danger styling, and right-aligned shortcut text."
    - "Right-click context menus reuse the same chrome via <ren-context-menu> (extends RenMenu) at pointer coordinates."
    - "Positioning needs viewport-aware placement (bottom-start / bottom-end / top-start / top-end, with right/left also accepted) with native Popover API support."
  avoidWhen:
    - "User is selecting a single value to commit into a form field — use ren-select."
    - "User is filtering a combobox of suggestions — use ren-combobox."
    - "The disclosure is non-list (rich content, header/body/footer) — use ren-popover or ren-hover-card."
    - "Items are persistent navigation across the app — use ren-sidebar / ren-nav."

canonicalImports:
  css:
    - "rends/components/composites/ren-menu/ren-menu.css"
  js:
    - "rends/components/composites/ren-menu/ren-menu.js"
  notes:
    - "JS depends on utils/keyboard-nav.js and utils/dismissable.js — keep the relative paths intact when copying files."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Place a trigger element with data-menu-trigger (or referenced via trigger-id=\"<id>\" on the host) immediately before <ren-menu>."
  - "Each interactive item is a real <button class=\"ren-menu-item\"> with role=\"menuitem\" (the component sets role=\"menuitemcheckbox\" / \"menuitemradio\" when those classes are present)."
  - "Visual separators use <div class=\"ren-menu-separator\"> and group titles use <div class=\"ren-menu-label\">; do not use <hr> or <h*> for these slots."
  - "Disabled items set aria-disabled=\"true\"; the component skips them in keyboard navigation and selection."
  - "Set data-value=\"…\" on items so the dispatched ren-menu-select event carries that value in detail.value (falls back to textContent)."
  - "Use placement=\"bottom-start\" by default; the host mirrors the resolved side/alignment to data-side=\"top|right|bottom|left\" and data-align=\"start|end\"."

forbiddenPatterns:
  - "Using <a href> for menu items that perform JS actions — use <button> and listen to ren-menu-select."
  - "Replacing the trigger with a div that toggles via inline click — the trigger must receive aria-haspopup=\"menu\" + aria-controls + aria-expanded from the component."
  - "Manually positioning the menu with custom left/top — let positionMenu() handle viewport collision (or use placement=\"bottom-end\" etc)."
  - "Toggling visibility with display: none — the menu relies on [popover] / .ren-open and animates via the [data-closing] state."
  - "Putting non-menu rich content (forms, multi-line text blocks) directly inside <ren-menu> — wrap such content in ren-popover instead."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-menu-bg, --ren-menu-border, --ren-menu-danger-color, --ren-menu-duration, --ren-menu-easing, --ren-menu-item-height, --ren-menu-item-hover-bg, --ren-menu-item-padding, --ren-menu-item-radius, --ren-menu-padding, --ren-menu-radius, --ren-menu-shadow, --ren-menu-width."
    - "Semantic tokens used inside items: --color-surface, --color-border, --color-text, --color-text-muted, --color-fill, --color-fill-hover, --color-danger, --color-danger-subtle, --color-accent."
    - "Layout / size / motion tokens: --space-* (1, 2, 3), --radius-sm, --radius-lg, --shadow-lg, --size-body, --size-caption, --size-icon-md, --z-dropdown, --duration-enter, --ease-enter, --duration-exit, --ease-exit, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / rgb() colors for hover, active, or danger states — pipe through --color-fill / --color-fill-hover / --color-danger / --color-danger-subtle."
    - "Custom animation timings; reuse --duration-enter / --duration-exit so reduced-motion handling continues to apply."

accessibility:
  required:
    - "<ren-menu> sets role=\"menu\" on itself and forces role=\"menuitem\" / \"menuitemcheckbox\" / \"menuitemradio\" on its children — do not override."
    - "Trigger receives aria-haspopup=\"menu\", aria-controls=\"<menu-id>\", and aria-expanded that flips with open()/close()."
    - "Keyboard contract: ArrowDown/ArrowUp on the trigger opens the menu; Arrow keys navigate vertically with loop; Home/End jump to first/last; typeahead matches printable characters; Enter/Space selects."
    - "Checkbox / radio items toggle aria-checked; radio items reset siblings within .ren-menu-radio-group (or the menu root) before activating themselves."
    - "Dismissable layer closes on Escape and outside click via the shared dismissable util; do not block its event listeners."
    - "Danger items rely on a paired text label (Delete, Remove) — color alone (--color-danger-subtle) is not sufficient."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-menu/ren-menu.css">
<script type="module" src="rends/components/composites/ren-menu/ren-menu.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-menu">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-menu`
- `.ren-menu-checkbox-item`
- `.ren-menu-group`
- `.ren-menu-item`
- `.ren-menu-item-danger`
- `.ren-menu-item-description`
- `.ren-menu-item-icon`
- `.ren-menu-item-shortcut`
- `.ren-menu-label`
- `.ren-menu-radio-item`
- `.ren-menu-separator`
- `.ren-open`

## States And Attributes

- `[aria-checked]`
- `[aria-disabled]`
- `[data-closing]`
- `[data-align]`
- `[data-highlighted]`
- `[data-menu-trigger]`
- `[data-side]`
- `placement`
- `:active`
- `:hover`

## Public Token API

- `--ren-menu-bg`
- `--ren-menu-border`
- `--ren-menu-danger-color`
- `--ren-menu-duration`
- `--ren-menu-easing`
- `--ren-menu-item-height`
- `--ren-menu-item-hover-bg`
- `--ren-menu-item-padding`
- `--ren-menu-item-radius`
- `--ren-menu-padding`
- `--ren-menu-radius`
- `--ren-menu-shadow`
- `--ren-menu-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-menu/ren-menu.css`
- `components/composites/ren-menu/ren-menu.js`
- `docs/components/ren-menu.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ═══ MENU CONTAINER ═══ */
.ren-menu {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg, 0.5rem);
  box-shadow: var(--shadow-lg, 0 10px 25px rgb(0, 0, 0, 0.1));
  padding-block: var(--space-1, 0.25rem);
  min-width: 12rem;
  z-index: var(--z-dropdown, 1000);
  position: absolute;
  animation: ren-menu-open var(--duration-enter) var(--ease-enter);
  visibility: hidden;
  opacity: 0;
  inset: auto auto auto auto;
  margin: 0;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* ═══ MENU OPEN STATE ═══ */
.ren-menu[popover]:popover-open,
.ren-menu.ren-open {
  visibility: visible;
  opacity: 1;
}

/* ═══ MENU ITEM BASE ═══ */
.ren-menu-item {
  padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
  display: flex;
  align-items: center;
  gap: var(--space-2, 0.5rem);
  cursor: pointer;
  font-size: var(--size-body, 1rem);
  color: var(--color-text);
  border-radius: var(--radius-sm, 0.25rem);
  min-height: 2rem;
  /* Tactile hover/focus — shared preset from semantic motion tokens */
  transition: var(--transition-tactile);
  white-space: nowrap;
  text-decoration: none;
}

.ren-menu-item:hover,
.ren-menu-item[data-highlighted] {
  background-color: var(--color-fill);
  color: var(--color-text);
}

.ren-menu-item:active {
  background-color: var(--color-fill-hover);
}

/* ═══ MENU ITEM DISABLED STATE ═══ */
.ren-menu-item[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* ═══ MENU ITEM DANGER VARIANT ═══ */
.ren-menu-item.ren-menu-item-danger:hover,
.ren-menu-item.ren-menu-item-danger[data-highlighted] {
  background-color: var(--color-danger-subtle);
  color: var(--color-danger);
}

/* ═══ MENU ITEM ICON ═══ */
.ren-menu-item-icon {
  flex-shrink: 0;
  width: var(--size-icon-md, 1.25rem);
  height: var(--size-icon-md, 1.25rem);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ═══ MENU ITEM SHORTCUT/LABEL ═══ */
.ren-menu-item-shortcut {
  margin-inline-start: auto;
  font-size: var(--size-caption, 0.75rem);
  color: var(--color-text-muted);
  font-family: monospace;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ═══ MENU ITEM DESCRIPTION ═══ */
.ren-menu-item-description {
  font-size: var(--size-caption, 0.75rem);
  color: var(--color-text-muted);
  line-height: 1.3;
}

/* ═══ MENU SEPARATOR ═══ */
.ren-menu-separator {
  height: 1px;
  background: var(--color-border);
  margin-block: var(--space-1, 0.25rem);
}

/* ═══ MENU LABEL/GROUP HEADER ═══ */
.ren-menu-label {
  padding: var(--space-1, 0.25rem) var(--space-3, 0.75rem);
  font-size: var(--size-caption, 0.75rem);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ═══ MENU GROUP ═══ */
.ren-menu-group {
  display: contents;
}

/* ═══ CHECKBOX MENU ITEM ═══ */
.ren-menu-checkbox-item,
.ren-menu-radio-item {
  position: relative;
  padding-inline-start: calc(var(--space-3, 0.75rem) + 20px + var(--space-2, 0.5rem));
}

.ren-menu-checkbox-item::before,
.ren-menu-radio-item::before {
  content: '';
  position: absolute;
  inset-inline-start: var(--space-3, 0.75rem);
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-radius: 2px;
  background: white;
  /* Tactile — shared semantic preset */
  transition: var(--transition-tactile);
}

.ren-menu-radio-item::before {
  border-radius: 50%;
}

/* ═══ CHECKBOX/RADIO CHECKED STATE ═══ */
.ren-menu-checkbox-item[aria-checked="true"]::before,
.ren-menu-radio-item[aria-checked="true"]::before {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.ren-menu-checkbox-item[aria-checked="true"]::after,
.ren-menu-radio-item[aria-checked="true"]::after {
  content: '';
  position: absolute;
  inset-inline-start: calc(var(--space-3, 0.75rem) + 4px);
  top: 50%;
  transform: translateY(-50%);
}

.ren-menu-checkbox-item[aria-checked="true"]::after {
  width: 8px;
  height: 4px;
  border-inline-start: 2px solid white;
  border-bottom: 2px solid white;
  transform: translateY(-55%) rotate(-45deg);
}

.ren-menu-radio-item[aria-checked="true"]::after {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  transform: translateY(-50%);
}

/* ═══ ANIMATIONS ═══ */
@keyframes ren-menu-open {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ═══ CLOSING STATE WITH ANIMATION ═══ */
.ren-menu[data-closing] {
  animation: ren-menu-close var(--duration-exit) var(--ease-exit) forwards;
}

@keyframes ren-menu-close {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-4px) scale(0.98);
  }
}

/* ═══ RESPECTS MOTION PREFERENCES ═══
   Semantic --duration-* already collapse to 0ms under reduced-motion
   (see tokens/semantic/motion.css). We keep this block as a
   belt-and-suspenders fallback and to drop the scale/translate
   keyframe so the menu simply appears/disappears in place. */
@media (prefers-reduced-motion: reduce) {
  .ren-menu {
    animation: none;
    transition: opacity var(--duration-enter);
  }

  .ren-menu:not(.ren-open) {
    opacity: 0;
  }

  .ren-menu-item {
    transition: background-color 0s, color 0s;
  }

  .ren-menu[data-closing] {
    animation: none;
  }
}

/* ═══ NATIVE POPOVER API SUPPORT ═══ */
@supports (selector(:popover-open)) {
  .ren-menu[popover] {
    visibility: visible;
    opacity: 0;
    transition: opacity var(--duration-enter) var(--ease-enter),
                overlay var(--duration-enter) var(--ease-enter) allow-discrete,
                display var(--duration-enter) var(--ease-enter) allow-discrete;
    animation: none;
  }

  @starting-style {
    .ren-menu[popover]:popover-open {
      opacity: 0;
    }
  }

  .ren-menu[popover]:popover-open {
    opacity: 1;
  }
}

/* ═══ SCROLLBAR STYLING ═══ */
.ren-menu::-webkit-scrollbar {
  width: 6px;
}

.ren-menu::-webkit-scrollbar-track {
  background: transparent;
}

.ren-menu::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 3px;
}

.ren-menu::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}


/**
 * RenDS — <ren-menu> Web Component
 * ==================================
 * Dropdown menu component with keyboard navigation, accessibility, and theming.
 * Supports items, groups, separators, checkboxes, and radio items.
 *
 * Uses Light DOM — no Shadow DOM.
 * Native Popover API when available, falls back to class-based positioning.
 *
 * Attributes:
 *   placement:     'bottom-start' (default) | 'bottom-end' | 'top-start' | 'top-end'
 *                  | 'right-start' | 'right-end' | 'left-start' | 'left-end'
 *                  - Controls menu position relative to trigger
 *
 * Markup:
 *   <button data-menu-trigger id="menu-trigger">Menu</button>
 *   <ren-menu trigger-id="menu-trigger" placement="bottom-start">
 *     <button class="ren-menu-item" role="menuitem">Option 1</button>
 *     <button class="ren-menu-item" role="menuitem" data-value="opt2">Option 2</button>
 *     <div class="ren-menu-separator"></div>
 *     <button class="ren-menu-item ren-menu-item-danger" role="menuitem">Delete</button>
 *   </ren-menu>
 *
 * Features:
 *   - Arrow key navigation (vertical)
 *   - Home/End to first/last item
 *   - Enter/Space to select
 *   - Typeahead search
 *   - Click outside to close
 *   - Escape key to close
 *   - Focus management
 *   - Checkbox and radio item support
 *
 * Events:
 *   ren-menu-select:  Dispatched when an item is selected
 *   - detail: { item, value }
 *   ren-menu-open:    Dispatched when menu opens
 *   ren-menu-close:   Dispatched when menu closes
 */

import { createKeyboardNav } from '../../../utils/keyboard-nav.js';
import { createDismissable } from '../../../utils/dismissable.js';

const MENU_SIDES = new Set(['top', 'right', 'bottom', 'left']);
const MENU_ALIGNS = new Set(['start', 'end']);

function normalizeMenuPlacement(value) {
  const [sideValue, alignValue] = String(value || 'bottom-start')
    .toLowerCase()
    .split('-');
  const side = MENU_SIDES.has(sideValue) ? sideValue : 'bottom';
  const align = MENU_ALIGNS.has(alignValue) ? alignValue : 'start';

  return { side, align };
}

export class RenMenu extends HTMLElement {
  static observedAttributes = ['placement'];

  #trigger = null;
  #isOpen = false;
  #keyboardNav = null;
  #dismissable = null;
  #animationFrame = null;
  #boundItemClick = null;

  constructor() {
    super();
  }

  /**
   * Lifecycle: Element inserted into DOM
   */
  connectedCallback() {
    this.loadStyles();
    this.setupMenu();
    this.findTrigger();
    this.attachTriggerListeners();
    this.attachItemListeners();
  }

  /**
   * Lifecycle: Element removed from DOM
   */
  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'placement' && oldValue !== newValue) {
      this.syncPlacement();
      if (this.#isOpen) {
        this.positionMenu();
      }
    }
  }

  /* ═══ INITIALIZATION ═══ */

  /**
   * Load component styles
   * @private
   */
  loadStyles() {
    if (!document.getElementById('ren-menu-styles')) {
      const style = document.createElement('style');
      style.id = 'ren-menu-styles';
      style.textContent = this.constructor.styles || '';
      document.head.appendChild(style);
    }
  }

  /**
   * Setup menu element with required attributes and structure
   * @private
   */
  setupMenu() {
    this.classList.add('ren-menu');

    // Set accessibility attributes
    this.setAttribute('role', 'menu');
    this.id = this.id || `ren-menu-${Math.random().toString(36).substr(2, 9)}`;

    // Check for native Popover API support
    if ('popover' in HTMLElement.prototype) {
      this.setAttribute('popover', 'manual');
    }

    this.syncPlacement();

    // Ensure all items have correct roles if not already set
    this.querySelectorAll(
      '.ren-menu-item, .ren-menu-checkbox-item, .ren-menu-radio-item, [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]'
    ).forEach((item) => {
      if (!item.hasAttribute('role')) {
        if (item.classList.contains('ren-menu-checkbox-item')) {
          item.setAttribute('role', 'menuitemcheckbox');
        } else if (item.classList.contains('ren-menu-radio-item')) {
          item.setAttribute('role', 'menuitemradio');
        } else {
          item.setAttribute('role', 'menuitem');
        }
      }

      if (!item.hasAttribute('tabindex')) {
        item.setAttribute('tabindex', '-1');
      }
    });
  }

  /**
   * Find the trigger element
   * Searches for: trigger-id attribute, data-menu-trigger, or previous sibling
   * @private
   */
  findTrigger() {
    const triggerId = this.getAttribute('trigger-id');
    if (triggerId) {
      this.#trigger = document.getElementById(triggerId);
    }

    if (!this.#trigger) {
      this.#trigger = document.querySelector('[data-menu-trigger]');
    }

    if (!this.#trigger) {
      this.#trigger = this.previousElementSibling;
    }

    if (this.#trigger) {
      this.#trigger.setAttribute('aria-haspopup', 'menu');
      this.#trigger.setAttribute('aria-controls', this.id);
    }
  }

  /**
   * Attach event listeners to trigger element
   * @private
   */
  attachTriggerListeners() {
    if (!this.#trigger) return;

    this.#trigger.addEventListener('click', (e) => this.handleTriggerClick(e));
    this.#trigger.addEventListener('keydown', (e) => this.handleTriggerKeydown(e));
  }

  /**
   * Attach delegated item listeners
   * @private
   */
  attachItemListeners() {
    this.#boundItemClick = this.#boundItemClick || ((e) => this.handleItemClick(e));
    this.removeEventListener('click', this.#boundItemClick);
    this.addEventListener('click', this.#boundItemClick);
  }

  /* ═══ TRIGGER HANDLING ═══ */

  /**
   * Handle trigger click to open menu
   * @private
   */
  handleTriggerClick(e) {
    e.preventDefault();
    if (this.#isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Handle trigger keydown (arrow down to open)
   * @private
   */
  handleTriggerKeydown(e) {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !this.#isOpen) {
      e.preventDefault();
      this.open();
    }
  }

  /**
   * Handle item click selection
   * @private
   */
  handleItemClick(e) {
    const item = e.target.closest('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]');

    if (!item || !this.contains(item) || item.getAttribute('aria-disabled') === 'true') {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    this.handleItemSelect(item);
  }

  /* ═══ POSITIONING ═══ */

  /**
   * Mirror preferred placement to public data attributes.
   */
  syncPlacement() {
    const { side, align } = normalizeMenuPlacement(this.getAttribute('placement'));

    this.setAttribute('data-side', side);
    this.setAttribute('data-align', align);
  }

  /**
   * Position the menu relative to trigger element
   * @private
   */
  positionMenu() {
    if (!this.#trigger) return;

    const placement = normalizeMenuPlacement(this.getAttribute('placement'));
    const triggerRect = this.#trigger.getBoundingClientRect();
    const menuRect = this.getBoundingClientRect();
    const gap = 8;
    const margin = 8;

    let finalSide = placement.side;
    let left = triggerRect.left;
    let top = triggerRect.bottom + gap;

    if (placement.align === 'end') {
      left = triggerRect.right - menuRect.width;
    }

    if (placement.side === 'top') {
      top = triggerRect.top - menuRect.height - gap;
    } else if (placement.side === 'right') {
      left = triggerRect.right + gap;
      top = placement.align === 'end'
        ? triggerRect.bottom - menuRect.height
        : triggerRect.top;
    } else if (placement.side === 'left') {
      left = triggerRect.left - menuRect.width - gap;
      top = placement.align === 'end'
        ? triggerRect.bottom - menuRect.height
        : triggerRect.top;
    }

    // Viewport collision detection
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    if (
      placement.side === 'bottom' &&
      top + menuRect.height > viewport.height - margin &&
      triggerRect.top - menuRect.height - gap >= margin
    ) {
      finalSide = 'top';
      top = triggerRect.top - menuRect.height - gap;
    } else if (
      placement.side === 'top' &&
      top < margin &&
      triggerRect.bottom + menuRect.height + gap <= viewport.height - margin
    ) {
      finalSide = 'bottom';
      top = triggerRect.bottom + gap;
    } else if (
      placement.side === 'right' &&
      left + menuRect.width > viewport.width - margin &&
      triggerRect.left - menuRect.width - gap >= margin
    ) {
      finalSide = 'left';
      left = triggerRect.left - menuRect.width - gap;
    } else if (
      placement.side === 'left' &&
      left < margin &&
      triggerRect.right + menuRect.width + gap <= viewport.width - margin
    ) {
      finalSide = 'right';
      left = triggerRect.right + gap;
    }

    // Clamp horizontal and vertical position to viewport.
    if (left < margin) {
      left = margin;
    } else if (left + menuRect.width > viewport.width - margin) {
      left = viewport.width - menuRect.width - margin;
    }

    if (top < margin) {
      top = margin;
    } else if (top + menuRect.height > viewport.height - margin) {
      top = viewport.height - menuRect.height - margin;
    }

    this.setAttribute('data-side', finalSide);
    this.setAttribute('data-align', placement.align);
    this.style.left = `${left}px`;
    this.style.top = `${top}px`;
  }

  /* ═══ KEYBOARD NAVIGATION ═══ */

  /**
   * Setup keyboard navigation for menu items
   * @private
   */
  setupKeyboardNav() {
    if (this.#keyboardNav) {
      this.#keyboardNav.detach();
    }

    this.#keyboardNav = createKeyboardNav(this, {
      selector: '[role="menuitem"]:not([aria-disabled="true"]), [role="menuitemcheckbox"]:not([aria-disabled="true"]), [role="menuitemradio"]:not([aria-disabled="true"])',
      orientation: 'vertical',
      loop: true,
      typeahead: true,
      focusOnHover: true,
      onActivate: (item) => {
        item.focus();
      },
      onSelect: (item) => {
        this.handleItemSelect(item);
      },
    });

    this.#keyboardNav.attach();
  }

  /**
   * Teardown keyboard navigation
   * @private
   */
  teardownKeyboardNav() {
    if (this.#keyboardNav) {
      this.#keyboardNav.detach();
      this.#keyboardNav = null;
    }
  }

  /* ═══ DISMISSABLE LAYER ═══ */

  /**
   * Setup dismissable layer (click-outside, Escape key)
   * @private
   */
  setupDismissable() {
    if (this.#dismissable) {
      this.#dismissable.deactivate();
    }

    this.#dismissable = createDismissable(this, {
      onDismiss: () => this.close(),
      triggerElement: this.#trigger,
      escapeKey: true,
      clickOutside: true,
    });

    this.#dismissable.activate();
  }

  /**
   * Teardown dismissable layer
   * @private
   */
  teardownDismissable() {
    if (this.#dismissable) {
      this.#dismissable.deactivate();
      this.#dismissable = null;
    }
  }

  /* ═══ ITEM SELECTION ═══ */

  /**
   * Handle menu item selection
   * @private
   */
  handleItemSelect(item) {
    const role = item.getAttribute('role');

    // Handle checkbox items
    if (item.classList.contains('ren-menu-checkbox-item') || role === 'menuitemcheckbox') {
      const isChecked = item.getAttribute('aria-checked') === 'true';
      item.setAttribute('aria-checked', !isChecked ? 'true' : 'false');
      this.dispatchSelectEvent(item);
      return;
    }

    // Handle radio items (exclusive selection within group)
    if (item.classList.contains('ren-menu-radio-item') || role === 'menuitemradio') {
      const group = item.closest('.ren-menu-radio-group') || this;
      group
        .querySelectorAll('.ren-menu-radio-item, [role="menuitemradio"]')
        .forEach((radioItem) => radioItem.setAttribute('aria-checked', 'false'));
      item.setAttribute('aria-checked', 'true');
      this.dispatchSelectEvent(item);
      this.close();
      return;
    }

    // Regular menu item: dispatch event and close
    this.dispatchSelectEvent(item);
    this.close();
  }

  /**
   * Dispatch ren-menu-select event
   * @private
   */
  dispatchSelectEvent(item) {
    const value = item.getAttribute('data-value') || item.textContent.trim();
    this.dispatchEvent(
      new CustomEvent('ren-menu-select', {
        bubbles: true,
        detail: { item, value },
      })
    );
  }

  /* ═══ PUBLIC API ═══ */

  /**
   * Open the menu
   */
  open() {
    if (this.#isOpen) return;

    this.#isOpen = true;
    this.setAttribute('data-state', 'open');
    this.setupKeyboardNav();
    this.setupDismissable();

    this.positionMenu();

    if ('popover' in HTMLElement.prototype) {
      try {
        this.showPopover();
      } catch (e) {
        // Popover might already be open
      }
    } else {
      this.classList.add('ren-open');
    }

    // Reposition on next frame for accuracy
    this.#animationFrame = requestAnimationFrame(() => {
      this.positionMenu();

      // Focus first item
      const firstItem = this.querySelector('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]');
      if (firstItem) {
        firstItem.focus();
      }
    });

    this.#trigger?.setAttribute('aria-expanded', 'true');
    this.dispatchEvent(new CustomEvent('ren-menu-open', { bubbles: true }));
  }

  /**
   * Close the menu
   */
  close() {
    if (!this.#isOpen) return;

    this.#isOpen = false;
    this.setAttribute('data-state', 'closed');
    this.teardownKeyboardNav();
    this.teardownDismissable();

    // Add closing animation class
    this.setAttribute('data-closing', '');

    // Wait for animation to finish before actually closing
    const animationDuration = getComputedStyle(this).animationDuration;
    const duration = parseFloat(animationDuration) * 1000;

    setTimeout(() => {
      this.removeAttribute('data-closing');

      if ('popover' in HTMLElement.prototype) {
        try {
          this.hidePopover();
        } catch (e) {
          // Popover might already be closed
        }
      } else {
        this.classList.remove('ren-open');
      }

      this.#trigger?.setAttribute('aria-expanded', 'false');
    }, Math.min(duration, 150)); // Cap at 150ms

    this.dispatchEvent(new CustomEvent('ren-menu-close', { bubbles: true }));
  }

  /**
   * Check if menu is currently open
   * @returns {boolean}
   */
  isOpen() {
    return this.#isOpen;
  }

  /**
   * Get the trigger element
   * @returns {HTMLElement|null}
   */
  getTrigger() {
    return this.#trigger;
  }

  /**
   * Cleanup event listeners and resources
   * @private
   */
  cleanup() {
    this.close();
    this.teardownKeyboardNav();
    this.teardownDismissable();

    if (this.#animationFrame) {
      cancelAnimationFrame(this.#animationFrame);
    }

    if (this.#boundItemClick) {
      this.removeEventListener('click', this.#boundItemClick);
    }

    if (this.#trigger) {
      this.#trigger.removeEventListener('click', (e) => this.handleTriggerClick(e));
      this.#trigger.removeEventListener('keydown', (e) => this.handleTriggerKeydown(e));
    }
  }
}

/**
 * RenDS — <ren-context-menu> Web Component
 * ===========================================
 * Context menu component that extends ren-menu.
 * Opens on right-click (contextmenu event) at pointer coordinates.
 *
 * Attributes:
 *   Same as ren-menu
 *
 * Markup:
 *   <div data-context-menu-trigger id="target">Right-click me</div>
 *   <ren-context-menu trigger-id="target">
 *     <button class="ren-menu-item" role="menuitem">Copy</button>
 *     <button class="ren-menu-item" role="menuitem">Cut</button>
 *     <button class="ren-menu-item" role="menuitem">Paste</button>
 *   </ren-context-menu>
 *
 * Events:
 *   Same as ren-menu (ren-menu-select, ren-menu-open, ren-menu-close)
 *   Plus: ren-context-menu-open with { x, y, target }
 */
export class RenContextMenu extends RenMenu {
  #contextMenuX = 0;
  #contextMenuY = 0;

  /**
   * Lifecycle: Element inserted into DOM
   */
  connectedCallback() {
    super.connectedCallback();
    this.attachContextMenuListener();
  }

  /**
   * Attach contextmenu event listener to trigger
   * @private
   */
  attachContextMenuListener() {
    const trigger = this.getTrigger();
    if (!trigger) return;

    trigger.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
  }

  /**
   * Handle right-click to open context menu at pointer position
   * @private
   */
  handleContextMenu(e) {
    e.preventDefault();

    this.#contextMenuX = e.clientX;
    this.#contextMenuY = e.clientY;

    // Close any existing menu first
    if (this.isOpen()) {
      this.close();
    }

    // Open at pointer position
    this.open();

    // Apply pointer positioning instead of trigger-based positioning
    requestAnimationFrame(() => {
      const menuRect = this.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
      };

      let left = this.#contextMenuX;
      let top = this.#contextMenuY;

      // Clamp to viewport
      if (left + menuRect.width > viewport.width) {
        left = viewport.width - menuRect.width - 8;
      }
      if (top + menuRect.height > viewport.height) {
        top = viewport.height - menuRect.height - 8;
      }

      left = Math.max(8, left);
      top = Math.max(8, top);

      this.style.left = `${left}px`;
      this.style.top = `${top}px`;
    });

    this.dispatchEvent(
      new CustomEvent('ren-context-menu-open', {
        bubbles: true,
        detail: {
          x: this.#contextMenuX,
          y: this.#contextMenuY,
          target: e.target,
        },
      })
    );
  }
}

if (!customElements.get('ren-menu')) {
  customElements.define('ren-menu', RenMenu);
}

if (!customElements.get('ren-context-menu')) {
  customElements.define('ren-context-menu', RenContextMenu);
}
