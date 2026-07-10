---
type: "RenDS Component"
title: ren-menubar
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:pattern:ren-menubar
sourcePath: components/patterns/ren-menubar
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - pattern
  - ren10
  - rends
---

# ren-menubar

Source path: `components/patterns/ren-menubar`

## Relationships

- `exposes_selector` -> [.ren-menubar](../../selectors/ren-menubar.md)
- `exposes_selector` -> [.ren-menubar-checkbox](../../selectors/ren-menubar-checkbox.md)
- `exposes_selector` -> [.ren-menubar-item](../../selectors/ren-menubar-item.md)
- `exposes_selector` -> [.ren-menubar-label](../../selectors/ren-menubar-label.md)
- `exposes_selector` -> [.ren-menubar-menu](../../selectors/ren-menubar-menu.md)
- `exposes_selector` -> [.ren-menubar-radio](../../selectors/ren-menubar-radio.md)
- `exposes_selector` -> [.ren-menubar-separator](../../selectors/ren-menubar-separator.md)
- `exposes_selector` -> [.ren-menubar-shortcut](../../selectors/ren-menubar-shortcut.md)
- `exposes_selector` -> [.ren-menubar-submenu](../../selectors/ren-menubar-submenu.md)
- `exposes_selector` -> [.ren-menubar-trigger](../../selectors/ren-menubar-trigger.md)
- `has_contract` -> [ren-menubar pattern.md](../../foundation/contract-pattern-ren-menubar.md)
- `has_css` -> [ren-menubar.css](../../css/ren-menubar-css.md)
- `has_docs_page` -> [ren-menubar docs](../../docs/ren-menubar-docs.md)
- `has_js` -> [ren-menubar.js](../../javascript/ren-menubar-js.md)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--caption-size](../../tokens/caption-size.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-fill-active](../../tokens/color-fill-active.md)
- `uses_token` -> [--color-fill-hover](../../tokens/color-fill-hover.md)
- `uses_token` -> [--color-on-accent](../../tokens/color-on-accent.md)
- `uses_token` -> [--color-separator](../../tokens/color-separator.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--color-surface-raised](../../tokens/color-surface-raised.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--duration-exit](../../tokens/duration-exit.md)
- `uses_token` -> [--duration-tactile](../../tokens/duration-tactile.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--label-size](../../tokens/label-size.md)
- `uses_token` -> [--label-weight](../../tokens/label-weight.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--radius-sm](../../tokens/radius-sm.md)
- `uses_token` -> [--shadow-lg](../../tokens/shadow-lg.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)

## Structured Data

```json
{
  "kind": "pattern",
  "selectors": [
    ".ren-menubar",
    ".ren-menubar-checkbox",
    ".ren-menubar-item",
    ".ren-menubar-label",
    ".ren-menubar-menu",
    ".ren-menubar-radio",
    ".ren-menubar-separator",
    ".ren-menubar-shortcut",
    ".ren-menubar-submenu",
    ".ren-menubar-trigger"
  ],
  "tokens": [
    "--body-size",
    "--caption-size",
    "--color-accent",
    "--color-border",
    "--color-fill-active",
    "--color-fill-hover",
    "--color-on-accent",
    "--color-separator",
    "--color-surface",
    "--color-surface-raised",
    "--color-text",
    "--color-text-muted",
    "--duration-exit",
    "--duration-tactile",
    "--ease-enter",
    "--label-size",
    "--label-weight",
    "--radius-md",
    "--radius-sm",
    "--shadow-lg",
    "--space-1",
    "--space-2",
    "--space-3"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-menubar Pattern Contract

Application menubar pattern for top-level menu navigation.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-menubar` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-menubar` pattern.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Menubar pattern behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this pattern.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The UI is a desktop-style application menubar with persistent top-level menus (File / Edit / View / Help)."
    - "You need WAI-ARIA Menubar semantics: role=\"menubar\", role=\"menu\", role=\"menuitem|menuitemcheckbox|menuitemradio\"."
    - "You need keyboard navigation (Arrow keys, Enter, Space, Escape, Home, End) with roving focus and \"menubar glide\" between triggers."
    - "You need typeahead character matching for fast item selection."
    - "You need checkbox / radio menu items (.ren-menubar-checkbox, .ren-menubar-radio) with aria-checked state."
    - "You need nested submenus with chevron and lateral keyboard navigation."
  avoidWhen:
    - "The nav is a horizontal site bar (Home / About / Pricing) — use ren-nav."
    - "It is a single dropdown / context menu — use ren-menu or ren-popover."
    - "It is a side rail with sections — use ren-sidebar."
    - "It is a Ctrl+K searchable launcher — use ren-command."

canonicalImports:
  css:
    - "rends/components/patterns/ren-menubar/ren-menubar.css"
  js:
    - "rends/components/patterns/ren-menubar/ren-menubar.js"
  notes:
    - "JS owns the keyboard model, roving focus, submenu opening, and ren-menubar-select event. CSS-only fallback only renders static chrome."
    - "Custom element registers as <ren-menubar>; menus are toggled via the [hidden] attribute on .ren-menubar-menu."

requiredMarkup:
  - "Root is <ren-menubar> wrapping <div class=\"ren-menubar\" role=\"menubar\">."
  - "Each top-level menu uses <button class=\"ren-menubar-trigger\" aria-haspopup=\"menu\" aria-expanded=\"false\"> + a sibling <div class=\"ren-menubar-menu\" role=\"menu\" hidden>."
  - "Each item is a <button class=\"ren-menubar-item\" role=\"menuitem\"> (or role=\"menuitemcheckbox|menuitemradio\" for stateful variants)."
  - "Checkbox / radio items carry aria-checked=\"true|false\"; the ::before pseudo renders the check / dot — do not hand-draw it."
  - "Separators are <div class=\"ren-menubar-separator\" role=\"separator\">; submenu chevrons are added automatically by .ren-menubar-submenu::after."
  - "Keyboard shortcuts shown via <span class=\"ren-menubar-shortcut\">⌘N</span>; mirror with a real document-level keydown handler."

forbiddenPatterns:
  - "Building from <a> tags — items must be <button> so Space activates them."
  - "Hiding menus with display: none from external code — toggle the [hidden] attribute; the component owns animation states."
  - "Setting aria-expanded manually from consumer code — the menubar JS manages it on the trigger."
  - "Wrapping items in <li> without role=\"none\" parent — keep the menu role tree flat or wrap with role=\"none\"."
  - "Reimplementing keyboard navigation; the component already handles arrows, typeahead, Home/End, and Escape."

tokenPolicy:
  allowed:
    - "Semantic surface / text tokens: --color-surface, --color-surface-raised, --color-border, --color-separator, --color-text, --color-text-muted, --color-fill-hover, --color-fill-active, --color-accent, --color-on-accent."
    - "Spacing / radius / shadow tokens: --space-1, --space-2, --space-3, --radius-sm, --radius-md, --shadow-lg."
    - "Type tokens: --body-size, --label-size, --label-weight, --caption-size."
    - "Motion tokens: --duration-tactile, --duration-exit, --ease-enter."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / named colors for hover, active, or accent."
    - "Replacing the focus outline color with anything other than --color-accent."

accessibility:
  required:
    - "Container has role=\"menubar\" and each <button> is a real menuitem with role=\"menuitem|menuitemcheckbox|menuitemradio\"."
    - "Triggers expose aria-haspopup=\"menu\" and aria-expanded reflects the open/closed state of the associated menu."
    - "Roving tabindex: only one focusable item at a time; arrow keys move focus. The component manages this — do not set tabindex manually on every item."
    - "Checkbox / radio items expose aria-checked; the visual check (::before) must not be the only state cue."
    - "Disabled items use [data-disabled] AND pointer-events: none (CSS handles the latter)."
    - "Focus-visible outline uses --color-accent — never strip without restoring a visible alternative."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/patterns/ren-menubar/ren-menubar.css">
<script type="module" src="rends/components/patterns/ren-menubar/ren-menubar.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-menubar">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-menubar`
- `.ren-menubar-checkbox`
- `.ren-menubar-item`
- `.ren-menubar-label`
- `.ren-menubar-menu`
- `.ren-menubar-radio`
- `.ren-menubar-separator`
- `.ren-menubar-shortcut`
- `.ren-menubar-submenu`
- `.ren-menubar-trigger`

## States And Attributes

- `[aria-checked]`
- `[aria-expanded]`
- `[data-disabled]`
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

- `components/patterns/ren-menubar/ren-menubar.css`
- `components/patterns/ren-menubar/ren-menubar.js`
- `docs/components/ren-menubar.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/**
 * RenDS Menubar
 * Horizontal menu bar component (File, Edit, View, etc.)
 *
 * Implements WAI-ARIA Menubar pattern with keyboard navigation,
 * roving focus, submenu support, and checkbox/radio items.
 *
 * Classes:
 * - .ren-menubar: Root horizontal menu bar
 * - .ren-menubar-trigger: Top-level menu button
 * - .ren-menubar-menu: Dropdown menu panel
 * - .ren-menubar-item: Individual menu item
 * - .ren-menubar-separator: Divider between item groups
 * - .ren-menubar-shortcut: Keyboard shortcut indicator
 * - .ren-menubar-label: Non-interactive group label
 * - .ren-menubar-submenu: Submenu with chevron
 * - .ren-menubar-checkbox: Checkbox menu item
 * - .ren-menubar-radio: Radio menu item
 */

/* =================================================================
   ROOT MENUBAR
   ================================================================= */

.ren-menubar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: relative;
}

/* =================================================================
   MENUBAR TRIGGER (Top-level Menu Button)
   ================================================================= */

.ren-menubar-trigger {
  position: relative;
  padding: var(--space-1) var(--space-2);
  background-color: transparent;
  color: var(--color-text);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--body-size);
  font-weight: var(--label-weight);
  cursor: pointer;
  transition: background-color var(--duration-tactile) var(--ease-enter);
  white-space: nowrap;
}

.ren-menubar-trigger:hover:not([aria-expanded="true"]) {
  background-color: var(--color-fill-hover);
}

.ren-menubar-trigger[aria-expanded="true"] {
  background-color: var(--color-fill-active);
  color: var(--color-text);
}

.ren-menubar-trigger:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.ren-menubar-trigger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* =================================================================
   MENUBAR MENU (Dropdown Panel)
   ================================================================= */

.ren-menubar-menu {
  position: absolute;
  top: 100%;
  inset-inline-start: 0;
  margin-top: var(--space-1);
  min-width: 200px;
  background-color: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Visible state for menu open */
.ren-menubar-menu:not([hidden]) {
  display: flex;
  animation: menubar-menu-open var(--duration-exit) var(--ease-enter);
}

/* Hidden state for menu closed */
.ren-menubar-menu[hidden] {
  display: none;
  animation: menubar-menu-close var(--duration-exit) var(--ease-enter);
}

@starting-style {
  .ren-menubar-menu:not([hidden]) {
    opacity: 0;
    transform: translateY(-4px);
  }
}

@keyframes menubar-menu-open {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes menubar-menu-close {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}

/* =================================================================
   MENUBAR ITEM (Menu Item)
   ================================================================= */

.ren-menubar-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background-color: transparent;
  color: var(--color-text);
  border: none;
  font-size: var(--body-size);
  font-weight: normal;
  text-align: start;
  cursor: pointer;
  transition: background-color var(--duration-tactile) var(--ease-enter);
  position: relative;
  gap: var(--space-2);
}

.ren-menubar-item:hover:not([data-disabled]) {
  background-color: var(--color-fill-hover);
}

.ren-menubar-item:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

.ren-menubar-item[data-disabled] {
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.ren-menubar-item[data-disabled]:hover {
  background-color: transparent;
}

/* =================================================================
   MENUBAR SHORTCUT (Keyboard Shortcut Indicator)
   ================================================================= */

.ren-menubar-shortcut {
  display: inline-block;
  margin-inline-start: auto;
  padding-inline-start: var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--caption-size);
  font-family: monospace;
  flex-shrink: 0;
}

/* =================================================================
   MENUBAR SEPARATOR (Divider)
   ================================================================= */

.ren-menubar-separator {
  height: 1px;
  background-color: var(--color-separator);
  margin: var(--space-1) 0;
}

/* =================================================================
   MENUBAR LABEL (Group Label)
   ================================================================= */

.ren-menubar-label {
  padding: var(--space-2) var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--label-size);
  font-weight: var(--label-weight);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  user-select: none;
  pointer-events: none;
}

/* =================================================================
   MENUBAR SUBMENU (With Chevron)
   ================================================================= */

.ren-menubar-submenu {
  position: relative;
}

/* Chevron indicator via ::after */
.ren-menubar-submenu::after {
  content: '›';
  display: inline-block;
  margin-inline-start: auto;
  padding-inline-start: var(--space-3);
  color: var(--color-text-muted);
  font-size: var(--body-size);
  flex-shrink: 0;
}

/* Submenu panel positioning (higher z-index for layering) */
.ren-menubar-submenu > .ren-menubar-menu {
  top: 0;
  inset-inline-start: calc(100% + var(--space-1));
  margin-top: 0;
  z-index: 1100;
}

/* =================================================================
   MENUBAR CHECKBOX (Checkbox Menu Item)
   ================================================================= */

.ren-menubar-checkbox {
  position: relative;
}

/* Checkmark via ::before */
.ren-menubar-checkbox::before {
  content: '';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  margin-inline-end: var(--space-1);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: transparent;
  flex-shrink: 0;
}

.ren-menubar-checkbox[aria-checked="true"]::before {
  content: '✓';
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-on-accent);
  font-size: 0.75em;
  font-weight: bold;
}

/* =================================================================
   MENUBAR RADIO (Radio Menu Item)
   ================================================================= */

.ren-menubar-radio {
  position: relative;
}

/* Radio indicator via ::before */
.ren-menubar-radio::before {
  content: '';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  margin-inline-end: var(--space-1);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background-color: transparent;
  flex-shrink: 0;
}

.ren-menubar-radio[aria-checked="true"]::before {
  content: '';
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  box-shadow: inset 0 0 0 2px var(--color-surface-raised);
}

/* =================================================================
   ACCESSIBILITY & INTERACTION STATES
   ================================================================= */

/* Hover fill for interactive items */
.ren-menubar-item:not([data-disabled]):not(.ren-menubar-label) {
  user-select: none;
}

/* Focus management for submenus */
.ren-menubar-menu [role="menuitem"]:focus-visible,
.ren-menubar-menu [role="menuitemcheckbox"]:focus-visible,
.ren-menubar-menu [role="menuitemradio"]:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

/* Ensure disabled items don't respond to pointer events */
.ren-menubar-item[data-disabled] {
  pointer-events: none;
}

/* Active/selected state */
.ren-menubar-item.is-focused {
  background-color: var(--color-fill-hover);
}

/* =================================================================
   MEDIA QUERIES & RESPONSIVE
   ================================================================= */

@media (prefers-reduced-motion: reduce) {
  .ren-menubar-trigger,
  .ren-menubar-item,
  .ren-menubar-menu {
    transition: none;
    animation: none;
  }
}


/**
 * RenDS Menubar Component
 * Horizontal menu bar with WAI-ARIA Menubar pattern support
 *
 * Features:
 * - Keyboard navigation (Arrow keys, Enter, Space, Escape, Home, End)
 * - Roving focus with "menubar glide" (hover opens adjacent menus when one is open)
 * - Typeahead character matching for quick item selection
 * - Checkbox and radio menu items with state management
 * - Submenu support with nested navigation
 * - Full accessibility compliance with ARIA roles and attributes
 *
 * Usage:
 * <ren-menubar>
 *   <div class="ren-menubar" role="menubar">
 *     <button class="ren-menubar-trigger">File</button>
 *     <div class="ren-menubar-menu" role="menu">
 *       <button class="ren-menubar-item" role="menuitem">New</button>
 *     </div>
 *   </div>
 * </ren-menubar>
 *
 * Events:
 * - ren-menubar-select: Fired when a menu item is activated
 *   detail: { item: Element, value: string, checked?: boolean }
 *
 * Public Methods:
 * - closeAll(): Close all open menus
 * - openMenu(triggerIndex): Open menu at specified trigger index
 */

export class RenMenubar extends HTMLElement {
  constructor() {
    super();
    this.triggers = [];
    this.menus = [];
    this.activeMenuIndex = -1;
    this.currentMenu = null;
    this.focusedItem = null;
    this.typeaheadBuffer = '';
    this.typeaheadTimeout = null;
  }

  /* ===================================================================
     LIFECYCLE HOOKS
     =================================================================== */

  connectedCallback() {
    this.initialize();
  }

  /* ===================================================================
     INITIALIZATION
     =================================================================== */

  /**
   * Initialize the menubar:
   * - Cache triggers and menus
   * - Set up ARIA attributes
   * - Attach event listeners
   */
  initialize() {
    const menubarEl = this.querySelector('[role="menubar"]');
    if (!menubarEl) return;

    // Find all triggers and their associated menus
    this.triggers = Array.from(menubarEl.querySelectorAll('.ren-menubar-trigger'));
    this.menus = this.triggers.map((trigger) => {
      // Menu is the next sibling after the trigger
      const menu = trigger.nextElementSibling;
      if (menu && menu.classList.contains('ren-menubar-menu')) {
        return menu;
      }
      return null;
    }).filter(Boolean);

    // Ensure triggers and menus have proper ARIA attributes
    this.triggers.forEach((trigger, index) => {
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('role', 'button');
      trigger.addEventListener('click', () => this.toggleMenu(index));
      trigger.addEventListener('keydown', (e) => this.handleTriggerKeydown(e, index));
      trigger.addEventListener('mouseenter', () => this.handleTriggerMouseenter(index));
    });

    // Set up menu items
    this.menus.forEach((menu, menuIndex) => {
      if (menu) {
        const items = this.getMenuItems(menu);
        items.forEach((item, itemIndex) => {
          item.addEventListener('click', (e) => this.handleItemClick(e, menuIndex, itemIndex));
          item.addEventListener('keydown', (e) => this.handleItemKeydown(e, menuIndex, itemIndex));
          item.addEventListener('mouseenter', () => this.handleItemMouseenter(menuIndex, itemIndex));
        });
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target)) {
        this.closeAll();
      }
    });
  }

  /* ===================================================================
     MENU MANAGEMENT
     =================================================================== */

  /**
   * Toggle menu visibility for trigger at index
   */
  toggleMenu(index) {
    if (this.activeMenuIndex === index) {
      this.closeAll();
    } else {
      this.openMenu(index);
    }
  }

  /**
   * Open menu at specified trigger index and focus first item
   */
  openMenu(index) {
    if (index < 0 || index >= this.triggers.length) return;

    // Close any currently open menu
    if (this.activeMenuIndex !== -1) {
      this.closeMenu(this.activeMenuIndex);
    }

    this.activeMenuIndex = index;
    const trigger = this.triggers[index];
    const menu = this.menus[index];

    if (menu) {
      menu.removeAttribute('hidden');
      trigger.setAttribute('aria-expanded', 'true');
      this.currentMenu = menu;

      // Focus first focusable item in menu
      const items = this.getMenuItems(menu);
      if (items.length > 0) {
        this.focusItem(items[0]);
      }
    }
  }

  /**
   * Close menu at specified index
   */
  closeMenu(index) {
    if (index < 0 || index >= this.triggers.length) return;

    const trigger = this.triggers[index];
    const menu = this.menus[index];

    if (menu) {
      menu.setAttribute('hidden', '');
      trigger.setAttribute('aria-expanded', 'false');
    }

    if (this.activeMenuIndex === index) {
      this.activeMenuIndex = -1;
      this.currentMenu = null;
      this.focusedItem = null;
      trigger.focus();
    }
  }

  /**
   * Close all open menus and return focus to the last active trigger
   */
  closeAll() {
    if (this.activeMenuIndex !== -1) {
      this.closeMenu(this.activeMenuIndex);
    }
  }

  /* ===================================================================
     ITEM NAVIGATION & FOCUS
     =================================================================== */

  /**
   * Get focusable menu items (excluding separators and labels)
   */
  getMenuItems(menu) {
    const items = Array.from(menu.querySelectorAll(
      '[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]'
    ));
    return items.filter(item => !item.hasAttribute('data-disabled'));
  }

  /**
   * Focus a specific menu item and update aria-selected state
   */
  focusItem(item) {
    if (!item) return;

    // Remove focus class from previously focused item
    if (this.focusedItem && this.focusedItem !== item) {
      this.focusedItem.classList.remove('is-focused');
    }

    this.focusedItem = item;
    item.classList.add('is-focused');
    item.focus();
  }

  /**
   * Get the next focusable item in menu (wraps around)
   */
  getNextItem(menu, currentItem, direction = 1) {
    const items = this.getMenuItems(menu);
    if (items.length === 0) return null;

    const currentIndex = items.indexOf(currentItem);
    const nextIndex = (currentIndex + direction + items.length) % items.length;
    return items[nextIndex];
  }

  /* ===================================================================
     EVENT HANDLERS: TRIGGERS
     =================================================================== */

  /**
   * Handle keyboard events on trigger buttons
   */
  handleTriggerKeydown(event, triggerIndex) {
    const { key } = event;

    // ArrowRight: move to next trigger
    if (key === 'ArrowRight') {
      event.preventDefault();
      const nextIndex = (triggerIndex + 1) % this.triggers.length;
      this.openMenu(nextIndex);
    }

    // ArrowLeft: move to previous trigger
    if (key === 'ArrowLeft') {
      event.preventDefault();
      const prevIndex = (triggerIndex - 1 + this.triggers.length) % this.triggers.length;
      this.openMenu(prevIndex);
    }

    // ArrowDown: open menu
    if (key === 'ArrowDown' || key === ' ' || key === 'Enter') {
      event.preventDefault();
      this.openMenu(triggerIndex);
    }

    // Home: first trigger
    if (key === 'Home') {
      event.preventDefault();
      this.openMenu(0);
    }

    // End: last trigger
    if (key === 'End') {
      event.preventDefault();
      this.openMenu(this.triggers.length - 1);
    }
  }

  /**
   * Handle mouse enter on trigger (roving focus "glide" behavior)
   * If a menu is already open, open the new menu instead
   */
  handleTriggerMouseenter(triggerIndex) {
    if (this.activeMenuIndex !== -1 && this.activeMenuIndex !== triggerIndex) {
      this.openMenu(triggerIndex);
    }
  }

  /* ===================================================================
     EVENT HANDLERS: MENU ITEMS
     =================================================================== */

  /**
   * Handle click on menu item
   */
  handleItemClick(event, menuIndex, itemIndex) {
    event.preventDefault();
    const menu = this.menus[menuIndex];
    const items = this.getMenuItems(menu);
    const item = items[itemIndex];

    if (!item || item.hasAttribute('data-disabled')) return;

    this.activateItem(item);
  }

  /**
   * Handle keyboard events within menu
   */
  handleItemKeydown(event, menuIndex, itemIndex) {
    const { key } = event;
    const menu = this.menus[menuIndex];
    const items = this.getMenuItems(menu);
    const item = items[itemIndex];

    if (!item) return;

    // ArrowDown: next item
    if (key === 'ArrowDown') {
      event.preventDefault();
      const nextItem = this.getNextItem(menu, item, 1);
      if (nextItem) this.focusItem(nextItem);
    }

    // ArrowUp: previous item
    if (key === 'ArrowUp') {
      event.preventDefault();
      const prevItem = this.getNextItem(menu, item, -1);
      if (prevItem) this.focusItem(prevItem);
    }

    // ArrowRight: open submenu or move to next trigger
    if (key === 'ArrowRight') {
      event.preventDefault();
      const submenu = item.querySelector('.ren-menubar-menu');
      if (submenu && item.classList.contains('ren-menubar-submenu')) {
        submenu.removeAttribute('hidden');
        const subItems = this.getMenuItems(submenu);
        if (subItems.length > 0) this.focusItem(subItems[0]);
      } else {
        // Move to next trigger
        const nextIndex = (menuIndex + 1) % this.triggers.length;
        this.openMenu(nextIndex);
      }
    }

    // ArrowLeft: close submenu or go back to previous menu
    if (key === 'ArrowLeft') {
      event.preventDefault();
      const parentMenu = item.closest('.ren-menubar-menu');
      const parentTrigger = parentMenu?.previousElementSibling;
      if (parentTrigger && parentTrigger.classList.contains('ren-menubar-submenu')) {
        const submenu = parentTrigger.querySelector('.ren-menubar-menu');
        if (submenu) submenu.setAttribute('hidden', '');
        this.focusItem(parentTrigger);
      } else {
        const prevIndex = (menuIndex - 1 + this.triggers.length) % this.triggers.length;
        this.openMenu(prevIndex);
      }
    }

    // Enter or Space: activate item
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.activateItem(item);
    }

    // Escape: close menu
    if (key === 'Escape') {
      event.preventDefault();
      this.closeMenu(menuIndex);
    }

    // Home: first item
    if (key === 'Home') {
      event.preventDefault();
      if (items.length > 0) this.focusItem(items[0]);
    }

    // End: last item
    if (key === 'End') {
      event.preventDefault();
      if (items.length > 0) this.focusItem(items[items.length - 1]);
    }

    // Typeahead: match item by first letter
    if (key.length === 1 && /^[a-z0-9]$/i.test(key)) {
      event.preventDefault();
      this.handleTypeahead(key, menu);
    }
  }

  /**
   * Handle mouse enter on item (focus and close typeahead)
   */
  handleItemMouseenter(menuIndex, itemIndex) {
    const menu = this.menus[menuIndex];
    const items = this.getMenuItems(menu);
    const item = items[itemIndex];

    if (item) {
      this.focusItem(item);
    }

    // Clear typeahead buffer on mouse movement
    this.typeaheadBuffer = '';
    if (this.typeaheadTimeout) {
      clearTimeout(this.typeaheadTimeout);
    }
  }

  /* ===================================================================
     ITEM ACTIVATION & STATE MANAGEMENT
     =================================================================== */

  /**
   * Activate a menu item (handle checkbox/radio states and emit event)
   */
  activateItem(item) {
    if (item.hasAttribute('data-disabled')) return;

    const role = item.getAttribute('role');

    // Handle checkbox items
    if (role === 'menuitemcheckbox') {
      const isChecked = item.getAttribute('aria-checked') === 'true';
      item.setAttribute('aria-checked', !isChecked ? 'true' : 'false');
      this.emitSelectEvent(item, !isChecked);
    }
    // Handle radio items
    else if (role === 'menuitemradio') {
      const name = item.getAttribute('name');
      const menu = item.closest('[role="menu"]');
      const radioGroup = menu.querySelectorAll(`[role="menuitemradio"][name="${name}"]`);
      radioGroup.forEach(radio => radio.setAttribute('aria-checked', 'false'));
      item.setAttribute('aria-checked', 'true');
      this.emitSelectEvent(item, true);
    }
    // Handle standard menu items
    else {
      this.emitSelectEvent(item);
    }

    // Close menu after activation (unless it's a checkbox/radio)
    if (role !== 'menuitemcheckbox' && role !== 'menuitemradio') {
      this.closeAll();
    }
  }

  /**
   * Emit ren-menubar-select event with item details
   */
  emitSelectEvent(item, checked = undefined) {
    const detail = {
      item,
      value: item.textContent?.trim() || item.getAttribute('value') || '',
    };

    if (checked !== undefined) {
      detail.checked = checked;
    }

    this.dispatchEvent(new CustomEvent('ren-menubar-select', {
      detail,
      bubbles: true,
      composed: true,
    }));
  }

  /* ===================================================================
     TYPEAHEAD SUPPORT
     =================================================================== */

  /**
   * Handle typeahead character matching
   * Type characters to jump to matching items
   */
  handleTypeahead(char, menu) {
    // Clear buffer after 500ms of inactivity
    if (this.typeaheadTimeout) {
      clearTimeout(this.typeaheadTimeout);
    }

    this.typeaheadBuffer += char.toLowerCase();

    // Find item matching buffer
    const items = this.getMenuItems(menu);
    const currentIndex = items.indexOf(this.focusedItem);
    const startIndex = (currentIndex + 1) % items.length;

    let matchedItem = null;
    for (let i = 0; i < items.length; i++) {
      const index = (startIndex + i) % items.length;
      const item = items[index];
      const text = item.textContent?.trim().toLowerCase() || '';
      if (text.startsWith(this.typeaheadBuffer)) {
        matchedItem = item;
        break;
      }
    }

    if (matchedItem) {
      this.focusItem(matchedItem);
    }

    // Clear buffer after 500ms
    this.typeaheadTimeout = setTimeout(() => {
      this.typeaheadBuffer = '';
    }, 500);
  }

  /* ===================================================================
     PUBLIC API
     =================================================================== */

  /**
   * Close all open menus
   * @public
   */
  closeAll() {
    if (this.activeMenuIndex !== -1) {
      this.closeMenu(this.activeMenuIndex);
    }
  }

  /**
   * Open menu at specified trigger index
   * @param {number} triggerIndex - Index of the trigger to open
   * @public
   */
  openMenu(triggerIndex) {
    if (triggerIndex < 0 || triggerIndex >= this.triggers.length) {
      throw new RangeError(`Invalid trigger index: ${triggerIndex}`);
    }
    this.openMenu(triggerIndex);
  }
}

// Register custom element
if (!customElements.get('ren-menubar')) {
  customElements.define('ren-menubar', RenMenubar);
}
