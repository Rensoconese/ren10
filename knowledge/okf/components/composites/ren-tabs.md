---
type: "RenDS Component"
title: ren-tabs
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-tabs
sourcePath: components/composites/ren-tabs
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

# ren-tabs

Source path: `components/composites/ren-tabs`

## Relationships

- `exposes_selector` -> [.ren-tab](../../selectors/ren-tab.md)
- `exposes_selector` -> [.ren-tab-list](../../selectors/ren-tab-list.md)
- `exposes_selector` -> [.ren-tab-list-enclosed](../../selectors/ren-tab-list-enclosed.md)
- `exposes_selector` -> [.ren-tab-list-pills](../../selectors/ren-tab-list-pills.md)
- `exposes_selector` -> [.ren-tab-list-underline](../../selectors/ren-tab-list-underline.md)
- `exposes_selector` -> [.ren-tab-panel](../../selectors/ren-tab-panel.md)
- `exposes_selector` -> [.ren-tabs](../../selectors/ren-tabs.md)
- `has_contract` -> [ren-tabs component.md](../../foundation/contract-composite-ren-tabs.md)
- `has_css` -> [ren-tabs.css](../../css/ren-tabs-css.md)
- `has_docs_page` -> [ren-tabs docs](../../docs/ren-tabs-docs.md)
- `has_js` -> [ren-tabs.js](../../javascript/ren-tabs-js.md)
- `used_by_example` -> [dashboard-shell.html](../../examples/dashboard-shell-html.md) (selector)
- `used_by_example` -> [data-table.html](../../examples/data-table-html.md) (selector)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-fill-hover](../../tokens/color-fill-hover.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--label-lg-weight](../../tokens/label-lg-weight.md)
- `uses_token` -> [--label-md-size](../../tokens/label-md-size.md)
- `uses_token` -> [--label-md-weight](../../tokens/label-md-weight.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--radius-sm](../../tokens/radius-sm.md)
- `uses_token` -> [--size-lg](../../tokens/size-lg.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-tab",
    ".ren-tab-list",
    ".ren-tab-list-enclosed",
    ".ren-tab-list-pills",
    ".ren-tab-list-underline",
    ".ren-tab-panel",
    ".ren-tabs"
  ],
  "tokens": [
    "--color-accent",
    "--color-border",
    "--color-fill",
    "--color-fill-hover",
    "--color-surface",
    "--color-text",
    "--color-text-muted",
    "--label-lg-weight",
    "--label-md-size",
    "--label-md-weight",
    "--radius-md",
    "--radius-sm",
    "--size-lg",
    "--space-1",
    "--space-2",
    "--space-3",
    "--space-4",
    "--transition-tactile"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-tabs Component Contract

Tabbed interface with trigger list and panels.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-tabs` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-tabs` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Tabs composite behavior or visual role.
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
    - "You need a tablist that shows one panel at a time with mutually exclusive triggers."
    - "You need ARIA tablist semantics (role=tablist, role=tab, role=tabpanel) plus arrow-key keyboard navigation."
    - "You need a default-value (index or tab id) to control which panel renders on first paint."
    - "You need manual activation (arrow moves focus, Enter/Space selects) or automatic activation (arrow selects)."
    - "You need a visual variant — .ren-tab-list-underline (default), .ren-tab-list-pills, or .ren-tab-list-enclosed."
    - "The layout must adapt to narrow widths via container query (horizontal scroll on the .ren-tab-list)."
  avoidWhen:
    - "Each section should be visible simultaneously — use ren-accordion (multiple) or simple sections."
    - "The control switches the entire page route, not in-page content — use ren-nav or anchor links."
    - "Only two states are needed — use ren-toggle-group with a single selection."
    - "You need a stepper/wizard with sequential progress — use ren-stepper."

canonicalImports:
  css:
    - "rends/components/composites/ren-tabs/ren-tabs.css"
  js:
    - "rends/components/composites/ren-tabs/ren-tabs.js"
  notes:
    - "JS is required: it sets up roving tabindex, ARIA wiring, and the ren-tab-change event. CSS-only renders triggers but not the selection state."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "<ren-tabs> wraps a <div role=\"tablist\" class=\"ren-tab-list\"> followed by sibling <div role=\"tabpanel\" class=\"ren-tab-panel\"> elements."
  - "Each tab trigger is a real <button role=\"tab\" class=\"ren-tab\">; never use <a> or <div> for the trigger."
  - "Tab triggers and tabpanels must match 1:1 in document order; the component pairs them by index."
  - "Inactive panels carry the hidden attribute (the component toggles it); do not use display: none manually."
  - "Provide aria-label on <ren-tabs> when there are multiple tablists on the page, so screen-readers can distinguish them."

forbiddenPatterns:
  - "Wrapping a <a href> as the tab trigger — tabs change the visible panel, they are not navigation links."
  - "Setting aria-selected manually on a tab; let the component drive it via _selectedIndex."
  - "Hiding inactive panels with display: none in CSS overrides — use the hidden attribute the JS manages."
  - "Adding interactive elements (buttons, links) directly inside .ren-tab — keep the trigger a single activation surface."
  - "Removing the .ren-tab:focus-visible outline without restoring a visible focus indicator inside the inset offset."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-tabs-active-color, --ren-tabs-border-color, --ren-tabs-color, --ren-tabs-duration, --ren-tabs-easing, --ren-tabs-font-size, --ren-tabs-font-weight, --ren-tabs-gap, --ren-tabs-height, --ren-tabs-indicator-color."
    - "Semantic tokens: --color-text, --color-text-muted, --color-accent, --color-border, --color-fill, --color-fill-hover, --color-surface."
    - "Shape / motion tokens: --radius-sm, --radius-md, --space-*, --size-lg, --label-md-size, --label-md-weight, --label-lg-weight, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgb / named color values in overrides for the active underline or pill background."
    - "Hardcoded transition durations on the .ren-tab hover; route through --transition-tactile."

accessibility:
  required:
    - "Triggers are real <button role=\"tab\"> with aria-selected reflecting state and tabindex managed by roving (only the selected tab is tabindex=0)."
    - "Tabpanels carry role=\"tabpanel\" and an aria-labelledby pointing at their trigger id (the component fills this in)."
    - "Arrow Left/Right (horizontal) or Up/Down (vertical) moves focus; Home / End jump to first / last; Enter / Space activate in manual mode."
    - "The .ren-tab meets touch target via min-height: var(--size-lg); do not shrink it below this in touch contexts."
    - "Active tab is distinguished by color AND the underline / pill / enclosed visual — never rely on color alone."
    - "Focus-visible ring is provided by outline + outline-offset on .ren-tab and the panel; preserve both."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-tabs/ren-tabs.css">
<script type="module" src="rends/components/composites/ren-tabs/ren-tabs.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-tabs">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-tab`
- `.ren-tab-list`
- `.ren-tab-list-enclosed`
- `.ren-tab-list-pills`
- `.ren-tab-list-underline`
- `.ren-tab-panel`
- `.ren-tabs`

## States And Attributes

- `[aria-disabled]`
- `[aria-selected]`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-tabs-active-color`
- `--ren-tabs-border-color`
- `--ren-tabs-color`
- `--ren-tabs-duration`
- `--ren-tabs-easing`
- `--ren-tabs-font-size`
- `--ren-tabs-font-weight`
- `--ren-tabs-gap`
- `--ren-tabs-height`
- `--ren-tabs-indicator-color`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-tabs/ren-tabs.css`
- `components/composites/ren-tabs/ren-tabs.js`
- `docs/components/ren-tabs.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ═══ TABS CONTAINER ═══ */
.ren-tabs {
  container-type: inline-size;
  container-name: ren-tabs;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* ═══ TAB LIST ═══ */
.ren-tab-list {
  display: flex;
  flex-direction: row;
  gap: var(--space-2);
  border-bottom: 1px solid var(--color-border);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Smooth scrolling for horizontal tabs */
.ren-tab-list {
  scroll-behavior: smooth;
}

/* ═══ TAB ITEM (UNDERLINE VARIANT - DEFAULT) ═══ */
.ren-tab {
  position: relative;
  padding: var(--space-2) var(--space-4);
  font-size: var(--label-md-size);
  font-weight: var(--label-md-weight);
  line-height: 1;
  color: var(--color-text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  min-height: var(--size-lg);
  display: flex;
  align-items: center;
  white-space: nowrap;
  user-select: none;
  transition: var(--transition-tactile);
}

/* Active tab */
.ren-tab[aria-selected="true"] {
  color: var(--color-text);
  border-bottom-color: var(--color-accent);
  font-weight: var(--label-lg-weight);
}

/* Tab hover state */
.ren-tab:hover:not([aria-disabled="true"]):not(:disabled) {
  color: var(--color-text);
  background-color: var(--color-fill);
}

/* Tab focus ring */
.ren-tab:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
  border-radius: var(--radius-sm);
}

/* Disabled tab */
.ren-tab:disabled,
.ren-tab[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  color: var(--color-text-muted);
}

.ren-tab:disabled:hover,
.ren-tab[aria-disabled="true"]:hover {
  background-color: transparent;
}

/* ═══ TAB PANELS ═══ */
.ren-tab-panel {
  padding-block: var(--space-4);
}

.ren-tab-panel[hidden] {
  display: none;
}

/* Panel focus ring */
.ren-tab-panel:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: var(--radius-md);
}

/* ═══ VARIANT: PILLS ═══ */
.ren-tab-list-pills {
  border-bottom: none;
  gap: var(--space-1);
}

.ren-tab-list-pills .ren-tab {
  border-bottom: none;
  border-radius: var(--radius-md);
  background-color: transparent;
  padding: var(--space-2) var(--space-3);
}

.ren-tab-list-pills .ren-tab[aria-selected="true"] {
  background-color: var(--color-fill);
  border-bottom-color: transparent;
  font-weight: var(--label-lg-weight);
}

.ren-tab-list-pills .ren-tab:hover:not([aria-disabled="true"]):not(:disabled) {
  background-color: var(--color-fill-hover);
}

/* ═══ VARIANT: UNDERLINE (DEFAULT) ═══ */
.ren-tab-list-underline {
  border-bottom: 1px solid var(--color-border);
  gap: var(--space-2);
}

.ren-tab-list-underline .ren-tab {
  border-bottom: 2px solid transparent;
}

.ren-tab-list-underline .ren-tab[aria-selected="true"] {
  border-bottom-color: var(--color-accent);
}

/* ═══ VARIANT: ENCLOSED ═══ */
.ren-tab-list-enclosed {
  border-bottom: none;
  gap: var(--space-2);
}

.ren-tab-list-enclosed .ren-tab {
  border: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  background-color: var(--color-fill);
  padding: var(--space-3) var(--space-4);
}

.ren-tab-list-enclosed .ren-tab[aria-selected="true"] {
  border-color: var(--color-border);
  border-bottom-color: var(--color-surface);
  background-color: var(--color-surface);
  color: var(--color-text);
  position: relative;
  z-index: 1;
}

.ren-tab-list-enclosed .ren-tab[aria-selected="true"]::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: -1px;
  right: -1px;
  height: 1px;
  background-color: var(--color-surface);
}

.ren-tab-list-enclosed .ren-tab:hover:not([aria-disabled="true"]):not(:disabled) {
  background-color: var(--color-fill-hover);
}

/* ═══ COMPACT LAYOUT (Container Query) ═══ */
@container ren-tabs (max-width: 480px) {
  .ren-tab-list {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    /* Add scrollbar styling for better UX */
    scrollbar-width: thin;
    scrollbar-color: var(--color-border) transparent;
  }

  .ren-tab-list::-webkit-scrollbar {
    height: 4px;
  }

  .ren-tab-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .ren-tab-list::-webkit-scrollbar-thumb {
    background-color: var(--color-border);
    border-radius: 2px;
  }
}

/* ═══ REDUCED MOTION ═══ */
@media (prefers-reduced-motion: reduce) {
  .ren-tab {
    transition: none;
  }
}


/**
 * RenDS — <ren-tabs> Web Component
 * ==================================
 * Accessible tabbed interface with keyboard navigation.
 * Implements ARIA tablist pattern with manual or automatic activation.
 *
 * Uses Light DOM — no Shadow DOM.
 * Works with semantic HTML or custom tab markup.
 *
 * Attributes:
 *   activation:    'manual' (default) | 'automatic'
 *                  - manual: arrow keys move focus, Enter/Space selects
 *                  - automatic: arrow keys immediately select tabs
 *   default-value: index or tab ID to select initially
 *   orientation:   'horizontal' (default) | 'vertical'
 *
 * Markup:
 *   <ren-tabs>
 *     <div role="tablist" class="ren-tab-list">
 *       <button role="tab" class="ren-tab">Tab 1</button>
 *       <button role="tab" class="ren-tab">Tab 2</button>
 *     </div>
 *     <div role="tabpanel" class="ren-tab-panel">
 *       Panel 1 content
 *     </div>
 *     <div role="tabpanel" class="ren-tab-panel">
 *       Panel 2 content
 *     </div>
 *   </ren-tabs>
 *
 * Events:
 *   ren-tab-change: Dispatched when a tab is selected
 *   - detail: { tab, panel, index, id }
 */

import { createKeyboardNav } from '../../../utils/keyboard-nav.js';
import { autoId } from '../../../utils/id-generator.js';

export class RenTabs extends HTMLElement {
  static get observedAttributes() {
    return ['activation', 'orientation', 'default-value'];
  }

  constructor() {
    super();
    this._nav = null;
    this._tabList = null;
    this._tabs = [];
    this._panels = [];
    this._selectedIndex = -1;
  }

  /**
   * Lifecycle: Element inserted into DOM
   */
  connectedCallback() {
    this._initialize();
  }

  /**
   * Lifecycle: Element removed from DOM
   */
  disconnectedCallback() {
    if (this._nav) {
      this._nav.detach();
      this._nav = null;
    }
  }

  /**
   * Lifecycle: Observed attribute changed
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'default-value' && this.isConnected) {
      this._selectTabByValue(newValue);
    }
  }

  /* ═══ INITIALIZATION ═══ */

  /**
   * Initialize the tabs component
   * @private
   */
  _initialize() {
    // Find tablist container
    this._tabList = this.querySelector('[role="tablist"]') || this.querySelector('.ren-tab-list');
    if (!this._tabList) {
      console.warn('RenTabs: No tablist found');
      return;
    }

    // Collect tabs and panels
    this._tabs = Array.from(this.querySelectorAll('[role="tab"], .ren-tab'));
    this._panels = Array.from(this.querySelectorAll('[role="tabpanel"], .ren-tab-panel'));

    if (this._tabs.length === 0) {
      console.warn('RenTabs: No tabs found');
      return;
    }

    // Ensure all elements have proper ARIA roles
    this._tabList.setAttribute('role', 'tablist');
    this._tabs.forEach((tab) => {
      if (!tab.hasAttribute('role')) {
        tab.setAttribute('role', 'tab');
      }
    });
    this._panels.forEach((panel) => {
      if (!panel.hasAttribute('role')) {
        panel.setAttribute('role', 'tabpanel');
      }
    });

    // Wire up ARIA relationships
    this._wireAria();

    // Set up keyboard navigation
    this._setupKeyboardNav();

    // Select initial tab
    const defaultValue = this.getAttribute('default-value');
    if (defaultValue !== null) {
      this._selectTabByValue(defaultValue);
    } else {
      // Select first tab by default
      this._selectTab(0);
    }

    // Listen for clicks on tabs
    this._tabList.addEventListener('click', this._handleTabClick.bind(this));
  }

  /**
   * Wire up ARIA attributes between tabs and panels
   * @private
   */
  _wireAria() {
    this._tabs.forEach((tab, index) => {
      // Ensure tab has an ID
      autoId(tab, `tab-${index}`);

      // Find corresponding panel
      const panel = this._panels[index];
      if (panel) {
        // Ensure panel has an ID
        autoId(panel, `tabpanel-${index}`);

        // Wire aria-controls: tab controls panel
        tab.setAttribute('aria-controls', panel.id);

        // Wire aria-labelledby: panel is labeled by tab
        panel.setAttribute('aria-labelledby', tab.id);
      }

      // Initialize aria-selected state
      tab.setAttribute('aria-selected', index === this._selectedIndex ? 'true' : 'false');
    });
  }

  /**
   * Set up keyboard navigation using createKeyboardNav
   * @private
   */
  _setupKeyboardNav() {
    const activation = this.getAttribute('activation') || 'manual';
    const orientation = this.getAttribute('orientation') || 'horizontal';

    this._nav = createKeyboardNav(this._tabList, {
      selector: '[role="tab"]',
      orientation,
      loop: true,
      typeahead: false,
      focusOnHover: false,
      onActivate: (tab, index) => {
        // Arrow key navigation
        if (activation === 'automatic') {
          // Automatic: immediately select the tab
          this._selectTab(index);
        }
        // Manual: just move focus, don't select
        // (User must press Enter/Space to select)
      },
      onSelect: (tab, index) => {
        // Enter/Space pressed on focused tab
        this._selectTab(index);
      },
    });

    this._nav.attach();
  }

  /**
   * Handle direct click on a tab
   * @private
   */
  _handleTabClick(event) {
    const tab = event.target.closest('[role="tab"]');
    if (!tab) return;

    const index = this._tabs.indexOf(tab);
    if (index !== -1) {
      this._selectTab(index);
      // Ensure focus is on the clicked tab
      tab.focus();
    }
  }

  /* ═══ TAB SELECTION ═══ */

  /**
   * Select a tab by index
   * @param {number} index - Tab index
   * @private
   */
  _selectTab(index) {
    if (index < 0 || index >= this._tabs.length) {
      return;
    }

    // Deselect all tabs and hide all panels
    this._tabs.forEach((tab, i) => {
      const isSelected = i === index;
      tab.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      tab.setAttribute('data-state', isSelected ? 'active' : 'inactive');
      if (this._panels[i]) {
        this._panels[i].toggleAttribute('hidden', !isSelected);
      }
    });

    this._selectedIndex = index;

    // Dispatch custom event
    const tab = this._tabs[index];
    const panel = this._panels[index];
    this.dispatchEvent(
      new CustomEvent('ren-tab-change', {
        detail: {
          tab,
          panel,
          index,
          id: tab.id,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Select a tab by ID or index value
   * @param {string|number} value - Tab ID or index string
   * @private
   */
  _selectTabByValue(value) {
    // Try parsing as index first
    const indexValue = parseInt(value, 10);
    if (!isNaN(indexValue) && indexValue >= 0 && indexValue < this._tabs.length) {
      this._selectTab(indexValue);
      return;
    }

    // Try finding by ID
    const tab = this._tabs.find((t) => t.id === value);
    if (tab) {
      const index = this._tabs.indexOf(tab);
      this._selectTab(index);
    }
  }

  /* ═══ PUBLIC API ═══ */

  /**
   * Get the currently selected tab index
   * @returns {number}
   */
  get selectedIndex() {
    return this._selectedIndex;
  }

  /**
   * Get the currently selected tab element
   * @returns {HTMLElement|null}
   */
  get selectedTab() {
    return this._selectedIndex >= 0 ? this._tabs[this._selectedIndex] : null;
  }

  /**
   * Get the currently selected panel element
   * @returns {HTMLElement|null}
   */
  get selectedPanel() {
    return this._selectedIndex >= 0 ? this._panels[this._selectedIndex] : null;
  }

  /**
   * Programmatically select a tab by index
   * @param {number} index
   */
  selectTabByIndex(index) {
    this._selectTab(index);
  }

  /**
   * Programmatically select a tab by ID
   * @param {string} id
   */
  selectTabById(id) {
    const index = this._tabs.findIndex((t) => t.id === id);
    if (index !== -1) {
      this._selectTab(index);
    }
  }

  /**
   * Get all tabs
   * @returns {HTMLElement[]}
   */
  get tabs() {
    return [...this._tabs];
  }

  /**
   * Get all panels
   * @returns {HTMLElement[]}
   */
  get panels() {
    return [...this._panels];
  }
}

// Register the component
if (!customElements.get('ren-tabs')) {
  customElements.define('ren-tabs', RenTabs);
}
