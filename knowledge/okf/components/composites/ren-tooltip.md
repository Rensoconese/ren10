---
type: "RenDS Component"
title: ren-tooltip
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-tooltip
sourcePath: components/composites/ren-tooltip
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

# ren-tooltip

Source path: `components/composites/ren-tooltip`

## Relationships

- `exposes_selector` -> [.ren-tooltip](../../selectors/ren-tooltip.md)
- `exposes_selector` -> [.ren-tooltip-arrow](../../selectors/ren-tooltip-arrow.md)
- `exposes_selector` -> [.ren-tooltip-trigger](../../selectors/ren-tooltip-trigger.md)
- `has_contract` -> [ren-tooltip component.md](../../foundation/contract-composite-ren-tooltip.md)
- `has_css` -> [ren-tooltip.css](../../css/ren-tooltip-css.md)
- `has_docs_page` -> [ren-tooltip docs](../../docs/ren-tooltip-docs.md)
- `has_js` -> [ren-tooltip.js](../../javascript/ren-tooltip-js.md)
- `uses_token` -> [--color-gray-900](../../tokens/color-gray-900.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--size-caption](../../tokens/size-caption.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--z-tooltip](../../tokens/z-tooltip.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-tooltip",
    ".ren-tooltip-arrow",
    ".ren-tooltip-trigger"
  ],
  "tokens": [
    "--color-gray-900",
    "--duration-enter",
    "--ease-enter",
    "--radius-md",
    "--size-caption",
    "--space-1",
    "--space-2",
    "--z-tooltip"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-tooltip Component Contract

Short accessible description attached to a trigger.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-tooltip` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-tooltip` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Tooltip composite behavior or visual role.
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
    - "You need a short, non-interactive description attached to a hoverable / focusable trigger (icon button label, truncated text expansion)."
    - "The content is plain text under ~15rem and provides supplementary info, not essential interaction."
    - "Disclosure is driven by hover, focus, and the popover API with anchor positioning + flip-block fallback."
    - "You need the dark high-contrast pill with an optional arrow caret (.ren-tooltip-arrow)."
    - "You can place [data-side=\"top|right|bottom|left\"] on the .ren-tooltip to indicate preferred side; CSS handles flipping."
  avoidWhen:
    - "The content is interactive (links, buttons, form fields) — use ren-popover or ren-hover-card."
    - "The content is critical for completing the task — use inline helper text or a visible label."
    - "The disclosure is value selection — use ren-select or ren-menu."
    - "The trigger has no accessible name and the tooltip is the only label — give the trigger a real aria-label or visible text instead."

canonicalImports:
  css:
    - "rends/components/composites/ren-tooltip/ren-tooltip.css"
  js:
    - "rends/components/composites/ren-tooltip/ren-tooltip.js"
  notes:
    - "JS is required: it owns the popover toggle, hover/focus timing (--ren-tooltip-delay), and the fallback positioning for browsers without CSS anchor-name support."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Pair a .ren-tooltip-trigger (real <button> or focusable element) with a .ren-tooltip element referenced via the popover API (popovertarget / id linkage)."
  - "The tooltip carries popover attribute so it lives in the top layer; do not implement it as a plain absolutely-positioned <div>."
  - "Include .ren-tooltip-arrow as a child of .ren-tooltip when an arrow is desired; position is driven by [data-side]."
  - "Set the desired side on the tooltip via data-side=\"top|right|bottom|left\"; CSS uses position-area + position-try-fallbacks: flip-block for safe placement."
  - "Tooltip content must be plain text — no buttons, links, or form fields (those break the contract; use ren-popover instead)."

forbiddenPatterns:
  - "Putting interactive elements inside .ren-tooltip — pointer-events: none on the tooltip means clicks would not work and screen readers would not focus them anyway."
  - "Showing the tooltip only on hover without keyboard focus support — every trigger must reveal the tooltip on :focus-visible."
  - "Using a tooltip as the sole accessible name for an icon button — provide aria-label on the trigger and let the tooltip echo it."
  - "Animating the tooltip via custom @keyframes; rely on the documented opacity + transform transition with @starting-style."
  - "Hardcoding background / color on .ren-tooltip — override --ren-tooltip-bg / --ren-tooltip-color tokens instead."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-tooltip-bg, --ren-tooltip-color, --ren-tooltip-delay, --ren-tooltip-duration, --ren-tooltip-easing, --ren-tooltip-font-size, --ren-tooltip-padding-x, --ren-tooltip-padding-y, --ren-tooltip-radius, --ren-tooltip-shadow."
    - "Shape / motion tokens: --radius-md, --space-1, --space-2, --size-caption, --duration-enter, --ease-enter, --z-tooltip."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code. Note: the current default uses --color-gray-900 as the surface; consumers should override --ren-tooltip-bg with a semantic token (e.g. --color-text) rather than reaching for another --gray-* directly."
    - "Hardcoded hex / rgb / named color values (e.g. background: #111, color: white) in overrides — use --ren-tooltip-bg and --ren-tooltip-color."
    - "Hardcoded transition durations; route through --duration-enter / --ren-tooltip-duration and the paired easings."

accessibility:
  required:
    - "Trigger has its own accessible name (visible text or aria-label); the tooltip supplements but does not replace it."
    - "Tooltip opens on both :hover and keyboard :focus-visible; closing on blur / mouseleave / Escape."
    - "Hover delay respects --ren-tooltip-delay; do not show tooltips instantly on mouse jitter or hide them on the next mousemove."
    - "Tooltip text must meet contrast for the chosen --ren-tooltip-bg / --ren-tooltip-color pair (default dark bg / white text is WCAG AA against typical surfaces)."
    - "Touch users: tooltips should not be the only way to reveal essential info — provide a visible label or alternate disclosure for touch."
    - "Tooltip is pointer-events: none and never receives focus — if the content needs interaction, switch to ren-popover."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-tooltip/ren-tooltip.css">
<script type="module" src="rends/components/composites/ren-tooltip/ren-tooltip.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-tooltip">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-open`
- `.ren-tooltip`
- `.ren-tooltip-arrow`
- `.ren-tooltip-trigger`

## States And Attributes

- `[data-side]`

## Public Token API

- `--ren-tooltip-bg`
- `--ren-tooltip-color`
- `--ren-tooltip-delay`
- `--ren-tooltip-duration`
- `--ren-tooltip-easing`
- `--ren-tooltip-font-size`
- `--ren-tooltip-padding-x`
- `--ren-tooltip-padding-y`
- `--ren-tooltip-radius`
- `--ren-tooltip-shadow`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-tooltip/ren-tooltip.css`
- `components/composites/ren-tooltip/ren-tooltip.js`
- `docs/components/ren-tooltip.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ═══ ANCHOR POSITIONING & BASE STYLES ═══ */
.ren-tooltip {
  position: absolute;
  background: var(--color-gray-900);
  color: white;
  border-radius: var(--radius-md);
  padding: var(--space-1) var(--space-2);
  font-size: var(--size-caption, 0.75rem);
  max-width: 15rem;
  pointer-events: none;
  z-index: var(--z-tooltip, 2000);
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
  margin: 0;
  inset: auto;

  /* Anchor positioning (modern browsers) */
  position-anchor: --tooltip-anchor;

  /* Default: above the trigger with automatic fallback */
  position-area: top span-all;

  /* Automatic flip when near viewport edges */
  position-try-fallbacks: flip-block;

  /* Smooth transitions — semantic tokens keep tooltip in sync with the
     rest of the overlay family (popover, menu, dialog). Collapses to
     0ms under prefers-reduced-motion via tokens/semantic/motion.css. */
  opacity: 0;
  transform: translateY(4px) scale(0.95);
  transition:
    opacity var(--duration-enter) var(--ease-enter),
    transform var(--duration-enter) var(--ease-enter),
    overlay var(--duration-enter) var(--ease-enter) allow-discrete,
    display var(--duration-enter) var(--ease-enter) allow-discrete;
}

/* ═══ TOOLTIP OPEN STATE ═══ */
.ren-tooltip:popover-open,
.ren-tooltip.ren-open {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ═══ TOOLTIP OPEN WITH @starting-style ═══ */
@starting-style {
  .ren-tooltip:popover-open {
    opacity: 0;
    transform: translateY(4px) scale(0.95);
  }
}

/* ═══ TOOLTIP ARROW/CARET ═══ */
.ren-tooltip-arrow {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--color-gray-900);
  transform: rotate(45deg);
  z-index: -1;
}

/* ═══ PLACEMENT VARIANTS ═══ */
/* Bottom */
.ren-tooltip[data-side="bottom"] {
  position-area: bottom span-all;
  margin-block-start: var(--space-1);
  margin-block-end: 0;
  margin-inline: 0;

  & .ren-tooltip-arrow {
    top: -3px;
    left: 50%;
    transform: translateX(-50%) rotate(225deg);
  }
}

/* Top (default) */
.ren-tooltip[data-side="top"],
.ren-tooltip:not([data-side]) {
  position-area: top span-all;
  margin-block-start: 0;
  margin-block-end: var(--space-1);
  margin-inline: 0;

  & .ren-tooltip-arrow {
    bottom: -3px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
  }
}

/* Right */
.ren-tooltip[data-side="right"] {
  position-area: right span-all;
  margin-block: 0;
  margin-inline-start: var(--space-1);
  margin-inline-end: 0;

  & .ren-tooltip-arrow {
    left: -3px;
    top: 50%;
    transform: translateY(-50%) rotate(135deg);
  }
}

/* Left */
.ren-tooltip[data-side="left"] {
  position-area: left span-all;
  margin-block: 0;
  margin-inline-start: 0;
  margin-inline-end: var(--space-1);

  & .ren-tooltip-arrow {
    right: -3px;
    top: 50%;
    transform: translateY(-50%) rotate(315deg);
  }
}

/* ═══ RESPECTS MOTION PREFERENCES ═══
   Semantic tokens already collapse to 0ms under reduce, but we keep
   this belt-and-suspenders block so the transform-half can be skipped
   entirely (no scale bounce) while overlay/display discrete swaps
   still happen. */
@media (prefers-reduced-motion: reduce) {
  .ren-tooltip {
    transition: opacity var(--duration-enter), transform var(--duration-enter),
                overlay var(--duration-enter) allow-discrete,
                display var(--duration-enter) allow-discrete;
  }

  @starting-style {
    .ren-tooltip:popover-open {
      opacity: 0;
      transform: scale(1);
    }
  }
}

/* ═══ FALLBACK FOR BROWSERS WITHOUT COMPLETE ANCHOR POSITIONING ═══ */
@supports not ((anchor-name: --ren-anchor) and
  (position-anchor: --ren-anchor) and
  (position-area: top span-all)) {
  .ren-tooltip {
    position: absolute;
    inset: auto auto auto auto;
  }

  .ren-tooltip-trigger {
    position: relative;
  }

  /* Fallback animations */
  .ren-tooltip {
    animation: ren-tooltip-fallback-open var(--duration-enter) var(--ease-enter);
  }

  .ren-tooltip:popover-open,
  .ren-tooltip.ren-open {
    animation: ren-tooltip-fallback-open var(--duration-enter) var(--ease-enter);
  }

  @keyframes ren-tooltip-fallback-open {
    from {
      opacity: 0;
      transform: translateY(4px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ren-tooltip {
      animation: none;
    }
  }
}


const PLACEMENTS = new Set(['top', 'right', 'bottom', 'left']);

function supportsAnchorPositioning() {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('anchor-name', '--ren-anchor') &&
    CSS.supports('position-anchor', '--ren-anchor') &&
    CSS.supports('position-area', 'top span-all')
  );
}

function normalizePlacement(value, fallback = 'top') {
  return PLACEMENTS.has(value) ? value : fallback;
}

/**
 * Fallback position computation for browsers without CSS anchor positioning.
 * Used only when full CSS anchor positioning support is unavailable.
 *
 * @param {HTMLElement} trigger - The trigger element
 * @param {HTMLElement} tooltip - The tooltip element
 * @param {string} placement - Placement: 'top', 'right', 'bottom', 'left'
 * @param {number} offset - Offset in pixels between trigger and tooltip
 * @returns {Object} Position object with x, y, and finalPlacement properties
 */
function computePosition(trigger, tooltip, placement = 'top', offset = 8) {
  const triggerRect = trigger.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const viewport = { width: window.innerWidth, height: window.innerHeight };

  let x = 0;
  let y = 0;
  let finalPlacement = placement;

  const placements = {
    top: () => {
      x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      y = triggerRect.top - tooltipRect.height - offset;
      if (y < 0) {
        finalPlacement = 'bottom';
        return placements.bottom();
      }
      return { x, y };
    },
    bottom: () => {
      x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      y = triggerRect.bottom + offset;
      if (y + tooltipRect.height > viewport.height) {
        finalPlacement = 'top';
        return placements.top();
      }
      return { x, y };
    },
    left: () => {
      x = triggerRect.left - tooltipRect.width - offset;
      y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      if (x < 0) {
        finalPlacement = 'right';
        return placements.right();
      }
      return { x, y };
    },
    right: () => {
      x = triggerRect.right + offset;
      y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
      if (x + tooltipRect.width > viewport.width) {
        finalPlacement = 'left';
        return placements.left();
      }
      return { x, y };
    },
  };

  const result = placements[placement]?.() || placements.top();

  // Clamp X position within viewport
  if (result.x < 0) result.x = 8;
  else if (result.x + tooltipRect.width > viewport.width)
    result.x = viewport.width - tooltipRect.width - 8;

  return { ...result, finalPlacement };
}

/**
 * Tooltip component with CSS Anchor Positioning and native Popover API
 *
 * Lightweight tooltip that displays helpful text on hover/focus with automatic
 * viewport collision handling via CSS anchor positioning.
 *
 * @example
 * <button>Hover me
 *   <ren-tooltip placement="top" show-delay="500">Helpful text</ren-tooltip>
 * </button>
 *
 * @fires ren-open - Fired when tooltip opens
 * @fires ren-close - Fired when tooltip closes
 */
export class RenTooltip extends HTMLElement {
  static observedAttributes = ['placement'];
  static supportsAnchor = supportsAnchorPositioning();

  #trigger = null;
  #showTimeout = null;
  #hideTimeout = null;
  #touchTimer = null;
  #listenerController = null;

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'placement' && oldValue !== newValue) {
      this.#syncPlacement();
    }
  }

  connectedCallback() {
    this.setupTooltip();
    this.findTrigger();
    this.attachTriggerListeners();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  /**
   * Setup tooltip element with required attributes and structure
   * @private
   */
  setupTooltip() {
    this.classList.add('ren-tooltip');

    // Add arrow if not present
    if (!this.querySelector('.ren-tooltip-arrow')) {
      const arrow = document.createElement('div');
      arrow.className = 'ren-tooltip-arrow';
      this.appendChild(arrow);
    }

    // Set accessibility attributes
    this.setAttribute('role', 'tooltip');
    this.id = this.id || `ren-tooltip-${Math.random().toString(36).substr(2, 9)}`;

    // Setup native Popover API with manual mode
    if ('popover' in HTMLElement.prototype) {
      this.setAttribute('popover', 'manual');
    }

    this.#syncPlacement();
  }

  /**
   * Find the trigger element (parent that contains the tooltip)
   * @private
   */
  findTrigger() {
    this.#trigger = this.parentElement;

    if (this.#trigger) {
      // Wire aria-describedby relationship
      if (!this.#trigger.hasAttribute('aria-describedby')) {
        this.#trigger.setAttribute('aria-describedby', this.id);
      }

      // Set up anchor relationship if CSS anchors are supported
      if (RenTooltip.supportsAnchor) {
        this.#trigger.style.anchorName = '--tooltip-anchor';
      } else {
        // Fallback: ensure trigger can be positioned relative to
        if (getComputedStyle(this.#trigger).position === 'static') {
          this.#trigger.style.position = 'relative';
        }
      }
    }
  }

  /**
   * Attach event listeners to trigger
   * @private
   */
  attachTriggerListeners() {
    if (!this.#trigger) return;

    this.#listenerController?.abort();
    this.#listenerController = new AbortController();
    const { signal } = this.#listenerController;

    // Mouse events
    this.#trigger.addEventListener('mouseenter', () => this.scheduleShow(), { signal });
    this.#trigger.addEventListener('mouseleave', () => this.scheduleHide(), { signal });

    // Focus events (use capture for better timing)
    this.#trigger.addEventListener('focus', () => this.scheduleShow(), { capture: true, signal });
    this.#trigger.addEventListener('blur', () => this.scheduleHide(), { capture: true, signal });

    // Touch events for long-press detection
    this.#trigger.addEventListener('touchstart', (e) => this.handleTouchStart(e), { signal });
    this.#trigger.addEventListener('touchend', (e) => this.handleTouchEnd(e), { signal });
  }

  /**
   * Handle touch start (long press detection)
   * @private
   */
  handleTouchStart(e) {
    this.#touchTimer = setTimeout(() => {
      this.show();
    }, 500);
  }

  /**
   * Handle touch end
   * @private
   */
  handleTouchEnd(e) {
    if (this.#touchTimer) {
      clearTimeout(this.#touchTimer);
      this.#touchTimer = null;
    }

    if (this.isOpen()) {
      this.hide();
    }
  }

  /**
   * Schedule tooltip show with delay
   * @private
   */
  scheduleShow() {
    this.clearTimeouts();

    const delay = parseInt(this.getAttribute('show-delay')) || 500;
    this.#showTimeout = setTimeout(() => {
      this.show();
    }, delay);
  }

  /**
   * Schedule tooltip hide with delay
   * @private
   */
  scheduleHide() {
    this.clearTimeouts();

    const delay = parseInt(this.getAttribute('hide-delay')) || 0;
    this.#hideTimeout = setTimeout(() => {
      this.hide();
    }, delay);
  }

  /**
   * Clear all pending timeouts
   * @private
   */
  clearTimeouts() {
    if (this.#showTimeout) clearTimeout(this.#showTimeout);
    if (this.#hideTimeout) clearTimeout(this.#hideTimeout);
    if (this.#touchTimer) clearTimeout(this.#touchTimer);

    this.#showTimeout = null;
    this.#hideTimeout = null;
    this.#touchTimer = null;
  }

  /**
   * Position the tooltip relative to trigger (fallback for non-anchor browsers)
   * @private
   */
  positionTooltip() {
    if (!this.#trigger || RenTooltip.supportsAnchor) return;

    const placement = normalizePlacement(this.getAttribute('placement'), 'top');
    const offset = parseInt(this.getAttribute('offset')) || 8;

    const { x, y, finalPlacement } = computePosition(
      this.#trigger,
      this,
      placement,
      offset
    );

    this.style.left = `${x}px`;
    this.style.top = `${y}px`;
    this.setAttribute('data-side', finalPlacement);
  }

  #syncPlacement() {
    const placement = normalizePlacement(this.getAttribute('placement'), 'top');
    this.setAttribute('data-side', placement);
  }

  /**
   * Show the tooltip
   */
  show() {
    if (this.isOpen()) return;

    this.clearTimeouts();
    this.positionTooltip();
    this.setAttribute('data-state', 'open');

    if ('popover' in HTMLElement.prototype) {
      try {
        this.showPopover();
      } catch (e) {
        // Already open or other error
      }
    } else {
      this.classList.add('ren-open');
    }

    this.dispatchEvent(new CustomEvent('ren-open', { bubbles: true }));
  }

  /**
   * Hide the tooltip
   */
  hide() {
    if (!this.isOpen()) return;

    this.clearTimeouts();
    this.setAttribute('data-state', 'closed');

    if ('popover' in HTMLElement.prototype) {
      try {
        this.hidePopover();
      } catch (e) {
        // Already closed or other error
      }
    } else {
      this.classList.remove('ren-open');
    }

    this.dispatchEvent(new CustomEvent('ren-close', { bubbles: true }));
  }

  /**
   * Check if tooltip is currently open
   * @returns {boolean}
   */
  isOpen() {
    if ('popover' in HTMLElement.prototype) {
      return this.matches(':popover-open');
    }
    return this.classList.contains('ren-open');
  }

  /**
   * Cleanup event listeners and timeouts
   * @private
   */
  cleanup() {
    this.clearTimeouts();
    this.#listenerController?.abort();
    this.#listenerController = null;
  }

  /**
   * Get the trigger element
   * @returns {HTMLElement|null}
   */
  getTrigger() {
    return this.#trigger;
  }
}

if (!customElements.get('ren-tooltip')) {
  customElements.define('ren-tooltip', RenTooltip);
}
