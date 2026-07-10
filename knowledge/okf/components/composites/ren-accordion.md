---
type: "RenDS Component"
title: ren-accordion
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-accordion
sourcePath: components/composites/ren-accordion
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

# ren-accordion

Source path: `components/composites/ren-accordion`

## Relationships

- `exposes_selector` -> [.ren-accordion](../../selectors/ren-accordion.md)
- `exposes_selector` -> [.ren-accordion-bordered](../../selectors/ren-accordion-bordered.md)
- `exposes_selector` -> [.ren-accordion-content](../../selectors/ren-accordion-content.md)
- `exposes_selector` -> [.ren-accordion-flush](../../selectors/ren-accordion-flush.md)
- `exposes_selector` -> [.ren-accordion-item](../../selectors/ren-accordion-item.md)
- `exposes_selector` -> [.ren-accordion-trigger](../../selectors/ren-accordion-trigger.md)
- `has_contract` -> [ren-accordion component.md](../../foundation/contract-composite-ren-accordion.md)
- `has_css` -> [ren-accordion.css](../../css/ren-accordion-css.md)
- `has_docs_page` -> [ren-accordion docs](../../docs/ren-accordion-docs.md)
- `has_js` -> [ren-accordion.js](../../javascript/ren-accordion-js.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-fill-active](../../tokens/color-fill-active.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--label-lg-size](../../tokens/label-lg-size.md)
- `uses_token` -> [--label-lg-weight](../../tokens/label-lg-weight.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--size-lg](../../tokens/size-lg.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-accordion",
    ".ren-accordion-bordered",
    ".ren-accordion-content",
    ".ren-accordion-flush",
    ".ren-accordion-item",
    ".ren-accordion-trigger"
  ],
  "tokens": [
    "--color-accent",
    "--color-border",
    "--color-fill",
    "--color-fill-active",
    "--color-text",
    "--color-text-muted",
    "--duration-enter",
    "--ease-enter",
    "--label-lg-size",
    "--label-lg-weight",
    "--radius-md",
    "--size-lg",
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

# ren-accordion Component Contract

Disclosure group for vertically stacked expandable sections.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-accordion` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-accordion` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Accordion composite behavior or visual role.
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
    - "You need a vertically stacked group of disclosure sections sharing chrome."
    - "Exclusive (single open) behavior is required, optionally with collapsible=all-closed."
    - "Multiple sections may be open simultaneously (type=\"multiple\")."
    - "You want native <details>/<summary> semantics with smooth height animation."
    - "Initial open items must be declarable via default-value=\"0,2\"."
  avoidWhen:
    - "Only one disclosure is needed — use ren-collapsible instead."
    - "Sections should not share chrome / divider lines — use isolated ren-collapsible items."
    - "The disclosure is a navigation menu — use ren-menu or ren-sidebar."
    - "Content swaps in place without expanding — use ren-tabs."

canonicalImports:
  css:
    - "rends/components/composites/ren-accordion/ren-accordion.css"
  js:
    - "rends/components/composites/ren-accordion/ren-accordion.js"
  notes:
    - "If the page already imports rends/components/index.css, do not import the CSS again."
    - "JS adds exclusive mode, default-value parsing, and the ren-accordion-change event; native <details> handles open/close without JS."

requiredMarkup:
  - "<ren-accordion> wraps real <details> elements; each <details> holds a <summary class=\"ren-accordion-trigger\"> and a <div class=\"ren-accordion-content\">."
  - "Do not replace <details>/<summary> with <button>+<div> — exclusive mode relies on native [name] grouping."
  - "Use type=\"single\" (default) or type=\"multiple\"; add collapsible only when single mode must allow all closed."
  - "Set default-value=\"0,1\" (comma-separated indices) to declare initial open items."
  - "Use .ren-accordion-bordered or .ren-accordion-flush on the host for variants; do not invent new variant classes."

forbiddenPatterns:
  - "<div role=\"button\"> styled as a summary instead of a real <summary> / <button>."
  - "Manual height animation with hardcoded max-height: 500px in inline styles — rely on the component's ::details-content transition."
  - "Hardcoded chevron icons inside the summary; the ::after pseudo-element already renders one."
  - "Toggling open state via display: none on .ren-accordion-content instead of the <details>[open] attribute."
  - "Overriding focus ring with outline: none on .ren-accordion-trigger without restoring :focus-visible."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-collapse-bg, --ren-collapse-border, --ren-collapse-duration, --ren-collapse-easing, --ren-collapse-padding, --ren-collapse-radius, --ren-collapse-trigger-font, --ren-collapse-trigger-weight."
    - "Semantic tokens: --color-border, --color-text, --color-text-muted, --color-fill, --color-fill-active, --color-accent."
    - "Layout / motion tokens: --space-*, --size-*, --radius-*, --duration-enter, --ease-enter, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Raw transition durations; use --duration-enter / --ease-enter or --ren-collapse-duration / --ren-collapse-easing."

accessibility:
  required:
    - "Use real <details>/<summary> so the browser exposes the native disclosure pattern to AT."
    - "Keep the chevron decorative (::after pseudo); never put text inside it that an AT must announce."
    - "Touch target on .ren-accordion-trigger is min-height: var(--size-lg); do not shrink below 44px on touch surfaces."
    - "Visible :focus-visible outline (2px solid --color-accent) must be preserved on the summary."
    - "Disabled triggers must set aria-disabled=\"true\" and not toggle on activation."
    - "Animations respect prefers-reduced-motion (transitions are removed under reduce)."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-accordion/ren-accordion.css">
<script type="module" src="rends/components/composites/ren-accordion/ren-accordion.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-accordion">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-accordion`
- `.ren-accordion-bordered`
- `.ren-accordion-content`
- `.ren-accordion-flush`
- `.ren-accordion-item`
- `.ren-accordion-trigger`

## States And Attributes

- `[aria-disabled]`
- `[aria-expanded]`
- `:active`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-collapse-bg`
- `--ren-collapse-border`
- `--ren-collapse-duration`
- `--ren-collapse-easing`
- `--ren-collapse-padding`
- `--ren-collapse-radius`
- `--ren-collapse-trigger-font`
- `--ren-collapse-trigger-weight`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-accordion/ren-accordion.css`
- `components/composites/ren-accordion/ren-accordion.js`
- `docs/components/ren-accordion.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/**
 * RenDS — <ren-accordion> Component
 * ═══════════════════════════════════
 * CSS-first accordion using native <details><summary>
 *
 * Features:
 *   - Smooth height animation using ::details-content
 *   - Chevron rotation on open state
 *   - Multiple variants: default, bordered, flush
 *   - Reduced motion support
 *   - Dark mode support (via semantic tokens)
 *   - Fallback for browsers without ::details-content support
 */

/* ═══════════════════════════════════════════════════════════════════ */
/* ACCORDION CONTAINER */
/* ═══════════════════════════════════════════════════════════════════ */

.ren-accordion {
  display: flex;
  flex-direction: column;
  width: 100%;
  border-top: 1px solid var(--color-border);

  /* Default variant: divider lines between items */
  & > details {
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════ */
/* TRIGGER / SUMMARY ELEMENT */
/* ═══════════════════════════════════════════════════════════════════ */

.ren-accordion-trigger,
.ren-accordion > details > summary {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  font-weight: var(--label-lg-weight);
  font-size: var(--label-lg-size);
  line-height: 1.4;
  color: var(--color-text);
  background-color: transparent;
  border: none;
  min-height: var(--size-lg);
  width: 100%;
  text-align: start;
  user-select: none;
  list-style: none;
  transition: var(--transition-tactile);

  /* Remove default browser marker */
  &::marker,
  &::-webkit-details-marker {
    display: none;
    content: '';
  }

  /* Chevron icon via ::after pseudo-element */
  &::after {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-inline-start: var(--space-3);
    flex-shrink: 0;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    transition: transform var(--duration-enter) var(--ease-enter);
      border: none;
    transform: rotate(0deg);
  }

  /* Hover state */
  &:hover {
    background-color: var(--color-fill);
  }

  /* Active state */
  &:active {
    background-color: var(--color-fill-active);
  }

  /* Focus ring */
  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: -2px;
  }

  /* Disabled state */
  &:disabled,
  &[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;

    &:hover {
      background-color: transparent;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════ */
/* REMOVE NATIVE DISCLOSURE TRIANGLE (WebKit fallback) */
/* ═══════════════════════════════════════════════════════════════════ */

.ren-accordion > details > summary::-webkit-details-marker {
  display: none;
}

.ren-accordion-trigger::-webkit-details-marker {
  display: none;
}

/* ═══════════════════════════════════════════════════════════════════ */
/* OPEN STATE — ROTATE CHEVRON */
/* ═══════════════════════════════════════════════════════════════════ */

.ren-accordion > details[open] > summary::after {
  transform: rotate(180deg);
}

/* Fallback for custom markup */
.ren-accordion-trigger[aria-expanded="true"]::after {
  transform: rotate(180deg);
}

/* ═══════════════════════════════════════════════════════════════════ */
/* CONTENT ANIMATION — MODERN APPROACH */
/* ═══════════════════════════════════════════════════════════════════ */

.ren-accordion > details {
  /* Modern: use ::details-content for height animation */
  & > .ren-accordion-content {
    padding: 0 var(--space-4) var(--space-4);
    color: var(--color-text-muted);
    line-height: 1.6;
    overflow: hidden;

    /* Browsers with ::details-content support */
    @supports selector(::-webkit-details-content) {
      height: 0;
      overflow: hidden;
      transition:
        height var(--duration-enter) var(--ease-enter),
        opacity var(--duration-enter) var(--ease-enter);
    }

    /* Also try Chrome/V8 syntax (may vary by engine) */
    @supports selector(::details-content) {
      height: 0;
      overflow: hidden;
      transition:
        height var(--duration-enter) var(--ease-enter),
        opacity var(--duration-enter) var(--ease-enter);
    }
  }

  /* Fallback for browsers without ::details-content: use opacity + max-height */
  & > .ren-accordion-content {
    opacity: 0;
    max-height: 0;
    transition:
      opacity var(--duration-enter) var(--ease-enter),
      max-height var(--duration-enter) var(--ease-enter);
  }

  /* When details is open */
  &[open] > .ren-accordion-content {
    opacity: 1;
    max-height: 1000px; /* Reasonable fallback limit */

    /* Modern: animate to auto height with ::details-content */
    @supports selector(::details-content) {
      height: auto;
    }
  }

  /* Entry animation starting point (for ::details-content) */
  @starting-style {
    &[open] > .ren-accordion-content {
      opacity: 0;
      max-height: 0;
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════ */
/* CONTENT ELEMENT */
/* ═══════════════════════════════════════════════════════════════════ */

.ren-accordion-content {
  padding: 0 var(--space-4) var(--space-4);
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* Hide custom content via hidden attribute (for non-details markup) */
.ren-accordion-content[hidden] {
  display: none;
}

/* ═══════════════════════════════════════════════════════════════════ */
/* VARIANT: BORDERED */
/* ═══════════════════════════════════════════════════════════════════ */

.ren-accordion-bordered {
  border-top: none;

  & > details,
  & .ren-accordion-item {
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-2);
    overflow: hidden;

    &:last-child {
      margin-bottom: 0;
    }
  }

  & > details > summary,
  & .ren-accordion-trigger {
    padding: var(--space-4) var(--space-4);
  }

  & > details > .ren-accordion-content,
  & .ren-accordion-content {
    padding: 0 var(--space-4) var(--space-4);
  }
}

/* ═══════════════════════════════════════════════════════════════════ */
/* VARIANT: FLUSH (no borders, minimal spacing) */
/* ═══════════════════════════════════════════════════════════════════ */

.ren-accordion-flush {
  border-top: none;

  & > details,
  & .ren-accordion-item {
    border-bottom: none;
    padding: var(--space-2) 0;

    &:last-child {
      border-bottom: none;
    }
  }

  & > details > summary,
  & .ren-accordion-trigger {
    padding: var(--space-3) 0;
  }

  & > details > .ren-accordion-content,
  & .ren-accordion-content {
    padding: 0 0 var(--space-3);
  }
}

/* ═══════════════════════════════════════════════════════════════════ */
/* REDUCED MOTION */
/* ═══════════════════════════════════════════════════════════════════ */

@media (prefers-reduced-motion: reduce) {
  .ren-accordion-trigger::after,
  .ren-accordion > details > summary::after {
    transition: none;
  }

  .ren-accordion > details > .ren-accordion-content {
    transition: none;
  }
}

/* ═══════════════════════════════════════════════════════════════════ */
/* ACCESSIBILITY SUPPORT */
/* ═══════════════════════════════════════════════════════════════════ */

/* Ensure proper contrast for focus states */
.ren-accordion > details > summary:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}

/* Dark mode: tokens will auto-adjust via CSS variables */
@media (prefers-color-scheme: dark) {
  /* Tokens like --color-text, --color-border, etc. should already be defined
     in the design system's color token reset. No additional changes needed. */
}


/**
 * RenDS — <ren-accordion> (Minimal Enhancement)
 * ════════════════════════════════════════════════
 *
 * Native <details><summary> handles 90% of the work.
 * This JS only adds:
 *   - Exclusive mode (single): close others when one opens
 *     → Uses native <details name="..."> when supported,
 *       with JS fallback for older browsers
 *   - default-value attribute: open items on init
 *   - ren-accordion-change event: custom event dispatch
 *
 * Attributes:
 *   type:          'single' (default) | 'multiple'
 *   collapsible:   boolean (single mode only) — allow all closed
 *   default-value: comma-separated indices to open on init
 *
 * Markup:
 *   <ren-accordion type="single" default-value="0">
 *     <details>
 *       <summary class="ren-accordion-trigger">Item 1</summary>
 *       <div class="ren-accordion-content">Content...</div>
 *     </details>
 *     <details>
 *       <summary class="ren-accordion-trigger">Item 2</summary>
 *       <div class="ren-accordion-content">Content...</div>
 *     </details>
 *   </ren-accordion>
 *
 * Events:
 *   ren-accordion-change: Fired when item open state changes
 *   - detail: { item, isOpen, index }
 */

/**
 * Feature detect: does <details name="..."> support exclusive mode natively?
 * When supported, setting the same `name` on multiple <details> makes them
 * behave like radio buttons — opening one closes the others automatically.
 */
const supportsDetailsName = (() => {
  try {
    const d1 = document.createElement('details');
    const d2 = document.createElement('details');
    d1.name = 'test';
    d2.name = 'test';
    d1.open = true;
    d2.open = true;
    const container = document.createElement('div');
    container.append(d1, d2);
    document.body.append(container);
    // If native exclusive works, opening d2 should close d1
    const works = !d1.open;
    container.remove();
    return works;
  } catch {
    return false;
  }
})();

export class RenAccordion extends HTMLElement {
  static get observedAttributes() {
    return ['type', 'collapsible', 'default-value'];
  }

  constructor() {
    super();
    /** @private */ this._useNativeExclusive = false;
    /** @private */ this._groupName = '';
  }

  connectedCallback() {
    this.classList.add('ren-accordion');

    // Determine mode (exclusive or multiple)
    this._exclusive = this.getAttribute('type') !== 'multiple';
    this._collapsible = this.hasAttribute('collapsible');

    // Generate a unique group name for native <details name>
    this._groupName = `ren-accordion-${this.id || Math.random().toString(36).slice(2, 8)}`;

    // Use native exclusive mode when browser supports it
    this._useNativeExclusive = supportsDetailsName && this._exclusive;
    this._applyNativeExclusive();

    // Listen for toggle events on all child details (event delegation)
    this.addEventListener('toggle', this._handleToggle.bind(this), true);

    // Apply default open items
    const defaultValue = this.getAttribute('default-value');
    if (defaultValue) {
      this._setDefaultOpen(defaultValue);
    }
  }

  /**
   * Apply or remove the native `name` attribute on child <details>.
   * When supported, this lets the browser handle exclusive mode natively.
   * @private
   */
  _applyNativeExclusive() {
    this.items.forEach((detail) => {
      if (this._useNativeExclusive) {
        detail.setAttribute('name', this._groupName);
      } else {
        // Remove name if switching to multiple mode or no native support
        if (detail.getAttribute('name') === this._groupName) {
          detail.removeAttribute('name');
        }
      }
    });
  }

  /**
   * Handle toggle event on child <details> elements
   * @private
   */
  _handleToggle(event) {
    const details = event.target;

    // Only handle <details> that are direct children or nested in .ren-accordion-item
    if (!this._isValidDetail(details)) {
      return;
    }

    // Set data-state for CSS styling
    details.setAttribute('data-state', details.open ? 'open' : 'closed');

    // JS fallback for exclusive mode (only when native isn't handling it)
    if (this._exclusive && !this._useNativeExclusive && details.open) {
      this._closeOtherDetails(details);
    }

    // Sync data-state on siblings closed by native <details name>
    if (this._useNativeExclusive && details.open) {
      this.items.forEach((d) => {
        if (d !== details) {
          d.setAttribute('data-state', d.open ? 'open' : 'closed');
        }
      });
    }

    // Dispatch custom event
    const index = this.items.indexOf(details);
    this.dispatchEvent(
      new CustomEvent('ren-accordion-change', {
        detail: {
          item: details,
          isOpen: details.open,
          index,
        },
        bubbles: true,
      })
    );
  }

  /**
   * Check if a details element is a valid child
   * @private
   */
  _isValidDetail(details) {
    if (details.tagName !== 'DETAILS') {
      return false;
    }

    // Direct child of accordion
    if (details.parentElement === this) {
      return true;
    }

    // Child of .ren-accordion-item within accordion
    const parent = details.parentElement;
    if (
      parent &&
      parent.classList &&
      parent.classList.contains('ren-accordion-item') &&
      parent.parentElement === this
    ) {
      return true;
    }

    return false;
  }

  /**
   * Close all other details except the specified one
   * @private
   */
  _closeOtherDetails(openDetails) {
    this.items.forEach((detail) => {
      if (detail !== openDetails && detail.open) {
        detail.open = false;
        detail.setAttribute('data-state', 'closed');
      }
    });
  }

  /**
   * Set which items should be open by default
   * @private
   */
  _setDefaultOpen(value) {
    const indices = value
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((i) => !isNaN(i));

    this.items.forEach((detail, index) => {
      detail.open = indices.includes(index);
      detail.setAttribute('data-state', detail.open ? 'open' : 'closed');
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isConnected) return;

    if (name === 'type') {
      // Update exclusive mode
      this._exclusive = newValue !== 'multiple';
      this._useNativeExclusive = supportsDetailsName && this._exclusive;
      this._applyNativeExclusive();
    } else if (name === 'collapsible') {
      // Collapsible flag updated
      this._collapsible = this.hasAttribute('collapsible');
    } else if (name === 'default-value') {
      // Re-apply defaults
      if (newValue) {
        this._setDefaultOpen(newValue);
      }
    }
  }

  /* ═══════════════════════════════════════════ */
  /* PUBLIC API */
  /* ═══════════════════════════════════════════ */

  /**
   * Get all details elements
   */
  get items() {
    const items = [];

    // Direct <details> children
    this.querySelectorAll(':scope > details').forEach((d) => items.push(d));

    // <details> nested in .ren-accordion-item children
    this.querySelectorAll(':scope > .ren-accordion-item > details').forEach(
      (d) => items.push(d)
    );

    return items;
  }

  /**
   * Open a specific item by index
   */
  openItem(index) {
    const item = this.items[index];
    if (!item) return;

    // Exclusive mode: close others
    if (this._exclusive) {
      this._closeOtherDetails(item);
    }

    item.open = true;
  }

  /**
   * Close a specific item by index
   */
  closeItem(index) {
    const item = this.items[index];
    if (!item) return;

    // In exclusive mode without collapsible: prevent closing if only open item
    if (
      this._exclusive &&
      !this._collapsible &&
      this.items.filter((d) => d.open).length === 1 &&
      item.open
    ) {
      return; // Keep at least one open
    }

    item.open = false;
  }

  /**
   * Toggle a specific item by index
   */
  toggleItem(index) {
    const item = this.items[index];
    if (!item) return;

    if (item.open) {
      this.closeItem(index);
    } else {
      this.openItem(index);
    }
  }

  /**
   * Check if item is open
   */
  isOpen(index) {
    return this.items[index]?.open ?? false;
  }

  /**
   * Get all currently open indices
   */
  getOpenItems() {
    return this.items
      .map((item, index) => (item.open ? index : -1))
      .filter((i) => i !== -1);
  }
}

// Register the component
if (!customElements.get('ren-accordion')) {
  customElements.define('ren-accordion', RenAccordion);
}
