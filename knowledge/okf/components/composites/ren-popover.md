---
type: "RenDS Component"
title: ren-popover
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-popover
sourcePath: components/composites/ren-popover
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

# ren-popover

Source path: `components/composites/ren-popover`

## Relationships

- `exposes_selector` -> [.ren-popover](../../selectors/ren-popover.md)
- `exposes_selector` -> [.ren-popover-arrow](../../selectors/ren-popover-arrow.md)
- `exposes_selector` -> [.ren-popover-body](../../selectors/ren-popover-body.md)
- `exposes_selector` -> [.ren-popover-footer](../../selectors/ren-popover-footer.md)
- `exposes_selector` -> [.ren-popover-header](../../selectors/ren-popover-header.md)
- `exposes_selector` -> [.ren-popover-trigger](../../selectors/ren-popover-trigger.md)
- `has_contract` -> [ren-popover component.md](../../foundation/contract-composite-ren-popover.md)
- `has_css` -> [ren-popover.css](../../css/ren-popover-css.md)
- `has_docs_page` -> [ren-popover docs](../../docs/ren-popover-docs.md)
- `has_js` -> [ren-popover.js](../../javascript/ren-popover-js.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--color-text-primary](../../tokens/color-text-primary.md)
- `uses_token` -> [--color-text-secondary](../../tokens/color-text-secondary.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--radius-lg](../../tokens/radius-lg.md)
- `uses_token` -> [--shadow-lg](../../tokens/shadow-lg.md)
- `uses_token` -> [--size-body-sm](../../tokens/size-body-sm.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--z-popover](../../tokens/z-popover.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-popover",
    ".ren-popover-arrow",
    ".ren-popover-body",
    ".ren-popover-footer",
    ".ren-popover-header",
    ".ren-popover-trigger"
  ],
  "tokens": [
    "--color-border",
    "--color-surface",
    "--color-text-primary",
    "--color-text-secondary",
    "--duration-enter",
    "--ease-enter",
    "--radius-lg",
    "--shadow-lg",
    "--size-body-sm",
    "--space-2",
    "--space-3",
    "--space-4",
    "--z-popover"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-popover Component Contract

Non-modal floating surface for contextual controls or content.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-popover` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-popover` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Popover composite behavior or visual role.
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
    - "Click on a trigger should reveal a small contextual surface (filters, mini-form, info card) anchored to that trigger."
    - "You need anchor-positioned placement (top/right/bottom/left) via position-area with automatic viewport flip via position-try-fallbacks."
    - "Need click-outside + Escape dismissal and a visible arrow caret that re-rotates per [data-side]."
    - "Need progressive enhancement: anchor positioning in modern browsers, JS computePosition() fallback elsewhere."
    - "Need header / body / footer slots inside the popover surface, with native role=\"dialog\" + aria-modal=\"false\"."
  avoidWhen:
    - "The disclosure blocks the page and demands the user's attention — use ren-dialog (modal)."
    - "Disclosure is reveal-on-hover-intent for non-essential preview content — use ren-hover-card."
    - "Disclosure is a short text annotation only — use ren-tooltip."
    - "Disclosure is a list of commands (menu) — use ren-menu / ren-context-menu."
    - "Disclosure is a side sheet — use ren-sheet."

canonicalImports:
  css:
    - "rends/components/composites/ren-popover/ren-popover.css"
  js:
    - "rends/components/composites/ren-popover/ren-popover.js"
  notes:
    - "JS attaches click + Escape + outside-click handlers and computes JS positioning only when CSS anchor positioning is unsupported."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Use <ren-popover placement=\"bottom\" offset=\"8\"> as the host so it adds .ren-popover, role=\"dialog\", and popover=\"manual\" automatically."
  - "The trigger is referenced via trigger-id=\"<id>\", or by a child / previous-sibling with [data-popover-trigger]; the component picks them in that order."
  - "Inside the popover, group content into .ren-popover-header / .ren-popover-body / .ren-popover-footer; a .ren-popover-arrow div is injected if missing."
  - "Triggers should be real interactive elements (<button> or <a>) so click + keyboard activation work; the component does not click-style arbitrary nodes."
  - "When using multiple popovers in the same view, set unique trigger-id values so the click handlers do not cross-wire."

forbiddenPatterns:
  - "Manually wiring trigger.addEventListener('click', popover.show) — the host already attaches its click + dismissable listeners."
  - "Calling showPopover() directly while bypassing open() — aria-modal, data-state, and ren-open event won't fire."
  - "Hardcoding inline left/top values — let CSS position-anchor + position-area + position-try-fallbacks handle placement and flips (or the JS computePosition fallback)."
  - "Removing the .ren-popover-arrow element — the [data-side] rules rotate it per side; without it the visual anchor cue disappears."
  - "Using ren-popover purely as a click-bound tooltip — accessibility expectations differ; use ren-tooltip for short, non-interactive text."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-popover-bg, --ren-popover-border-color, --ren-popover-duration, --ren-popover-easing, --ren-popover-padding, --ren-popover-radius, --ren-popover-shadow, --ren-popover-width."
    - "Semantic tokens used inside content: --color-surface, --color-border, --color-text-primary, --color-text-secondary, --shadow-lg, --radius-lg."
    - "Layout / type / motion tokens: --space-2, --space-3, --space-4, --size-body-sm, --z-popover, --duration-enter, --ease-enter."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded backdrop / surface colors via inline styles or rgba()."
    - "Custom animation timings; reuse --duration-enter / --ease-enter (or --ren-popover-duration / --ren-popover-easing) so reduced-motion overrides apply."

accessibility:
  required:
    - "<ren-popover> sets role=\"dialog\" with aria-modal=\"false\" (non-modal by design). Do not set aria-modal=\"true\" or apply focus trapping."
    - "Trigger must be a focusable, real interactive element; click + Enter/Space activation come from native button semantics."
    - "Escape closes the popover via the document keydown handler; outside-click closes via the document click handler — do not stopPropagation on container click outside these targets."
    - "When CSS anchor positioning is unsupported the host applies left/top to the popover element; do not overlay your own positioning style or the flip logic breaks."
    - "Reduced motion strips the transform animation (opacity-only); keep the @media (prefers-reduced-motion: reduce) block intact."
    - "Avoid putting form submit buttons that affect the page outside the popover surface — keep the interaction self-contained within the dialog role."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-popover/ren-popover.css">
<script type="module" src="rends/components/composites/ren-popover/ren-popover.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-popover">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-open`
- `.ren-popover`
- `.ren-popover-arrow`
- `.ren-popover-body`
- `.ren-popover-footer`
- `.ren-popover-header`
- `.ren-popover-trigger`

## States And Attributes

- `[data-popover-trigger]`
- `[data-side]`

## Public Token API

- `--ren-popover-bg`
- `--ren-popover-border-color`
- `--ren-popover-duration`
- `--ren-popover-easing`
- `--ren-popover-padding`
- `--ren-popover-radius`
- `--ren-popover-shadow`
- `--ren-popover-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-popover/ren-popover.css`
- `components/composites/ren-popover/ren-popover.js`
- `docs/components/ren-popover.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ═══ ANCHOR POSITIONING & BASE STYLES ═══ */
.ren-popover {
  position: absolute;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-4);
  max-width: 20rem;
  z-index: var(--z-popover, 1000);
  pointer-events: auto;
  margin: 0;
  inset: auto;
  border-top: none;

  /* Anchor positioning (modern browsers) */
  position-anchor: --popover-anchor;

  /* Default: below the trigger with automatic fallback */
  position-area: bottom span-all;

  /* Automatic flip when near viewport edges */
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;

  /* Enter/exit transitions driven by semantic motion tokens. */
  opacity: 0;
  transform: translateY(-4px) scale(0.95);
  transition:
    opacity   var(--duration-enter) var(--ease-enter),
    transform var(--duration-enter) var(--ease-enter),
    overlay   var(--duration-enter) var(--ease-enter) allow-discrete,
    display   var(--duration-enter) var(--ease-enter) allow-discrete;
}

/* ═══ POPOVER OPEN STATE ═══ */
.ren-popover:popover-open,
.ren-popover.ren-open {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ═══ POPOVER OPEN WITH @starting-style ═══ */
@starting-style {
  .ren-popover:popover-open {
    opacity: 0;
    transform: translateY(-4px) scale(0.95);
  }
}

/* ═══ POPOVER ARROW/CARET ═══ */
.ren-popover-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  border: inherit;
  border-top: none;
  border-inline-start: none;
  transform: rotate(45deg);
  z-index: -1;
}

/* ═══ PLACEMENT VARIANTS ═══ */
/* Bottom (default) */
.ren-popover[data-side="bottom"],
.ren-popover:not([data-side]) {
  position-area: bottom span-all;
  margin-block-start: var(--space-2);
  margin-block-end: 0;
  margin-inline: 0;

  & .ren-popover-arrow {
    top: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(225deg);
  }
}

/* Top */
.ren-popover[data-side="top"] {
  position-area: top span-all;
  margin-block-start: 0;
  margin-block-end: var(--space-2);
  margin-inline: 0;

  & .ren-popover-arrow {
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
  }
}

/* Right */
.ren-popover[data-side="right"] {
  position-area: right span-all;
  margin-block: 0;
  margin-inline-start: var(--space-2);
  margin-inline-end: 0;

  & .ren-popover-arrow {
    left: -4px;
    top: 50%;
    transform: translateY(-50%) rotate(135deg);
  }
}

/* Left */
.ren-popover[data-side="left"] {
  position-area: left span-all;
  margin-block: 0;
  margin-inline-start: 0;
  margin-inline-end: var(--space-2);

  & .ren-popover-arrow {
    right: -4px;
    top: 50%;
    transform: translateY(-50%) rotate(315deg);
  }
}

/* ═══ POPOVER SECTIONS ═══ */
.ren-popover-header {
  margin-bottom: var(--space-2);
  font-weight: 600;
  color: var(--color-text-primary);
}

.ren-popover-body {
  color: var(--color-text-secondary);
  font-size: var(--size-body-sm);
  line-height: 1.5;
}

.ren-popover-footer {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: var(--space-2);
}

/* ═══ RESPECTS MOTION PREFERENCES ═══
   Semantic --duration-enter already collapses to 0ms under
   reduced-motion. We keep this block to drop the transform
   (scale/translate) in the starting-style, so the popover
   fades in place instead of moving. */
@media (prefers-reduced-motion: reduce) {
  .ren-popover {
    transition:
      opacity var(--duration-enter),
      overlay var(--duration-enter) allow-discrete,
      display var(--duration-enter) allow-discrete;
    transform: none;
  }

  @starting-style {
    .ren-popover:popover-open {
      opacity: 0;
      transform: none;
    }
  }
}

/* ═══ FALLBACK FOR BROWSERS WITHOUT COMPLETE ANCHOR POSITIONING ═══ */
@supports not ((anchor-name: --ren-anchor) and
  (position-anchor: --ren-anchor) and
  (position-area: bottom span-all)) {
  .ren-popover {
    position: absolute;
    inset: auto auto auto auto;
  }

  [data-popover-trigger],
  .ren-popover-trigger {
    position: relative;
  }

  /* Fallback animations */
  .ren-popover {
    animation: ren-popover-fallback-open var(--duration-enter) var(--ease-enter);
  }

  .ren-popover:popover-open,
  .ren-popover.ren-open {
    animation: ren-popover-fallback-open var(--duration-enter) var(--ease-enter);
  }

  @keyframes ren-popover-fallback-open {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ren-popover {
      animation: none;
    }
  }
}


let nextPopoverId = 0;
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');
const PLACEMENTS = new Set(['top', 'right', 'bottom', 'left']);

function supportsAnchorPositioning() {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('anchor-name', '--ren-anchor') &&
    CSS.supports('position-anchor', '--ren-anchor') &&
    CSS.supports('position-area', 'bottom span-all')
  );
}

function normalizePlacement(value, fallback = 'bottom') {
  return PLACEMENTS.has(value) ? value : fallback;
}

/**
 * Fallback position computation for browsers without CSS anchor positioning.
 * Used only when full CSS anchor positioning support is unavailable.
 *
 * @param {HTMLElement} trigger - The trigger element
 * @param {HTMLElement} popover - The popover element
 * @param {string} placement - Placement: 'top', 'right', 'bottom', 'left'
 * @param {number} offset - Offset in pixels between trigger and popover
 * @returns {Object} Position object with x, y, and finalPlacement properties
 */
function computePosition(trigger, popover, placement = 'bottom', offset = 8) {
  const triggerRect = trigger.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  const viewport = { width: window.innerWidth, height: window.innerHeight };

  let x = 0;
  let y = 0;
  let finalPlacement = placement;

  const placements = {
    top: () => {
      x = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
      y = triggerRect.top - popoverRect.height - offset;
      if (y < 0) {
        finalPlacement = 'bottom';
        return placements.bottom();
      }
      return { x, y };
    },
    bottom: () => {
      x = triggerRect.left + (triggerRect.width - popoverRect.width) / 2;
      y = triggerRect.bottom + offset;
      if (y + popoverRect.height > viewport.height) {
        finalPlacement = 'top';
        return placements.top();
      }
      return { x, y };
    },
    left: () => {
      x = triggerRect.left - popoverRect.width - offset;
      y = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
      if (x < 0) {
        finalPlacement = 'right';
        return placements.right();
      }
      return { x, y };
    },
    right: () => {
      x = triggerRect.right + offset;
      y = triggerRect.top + (triggerRect.height - popoverRect.height) / 2;
      if (x + popoverRect.width > viewport.width) {
        finalPlacement = 'left';
        return placements.left();
      }
      return { x, y };
    },
  };

  const result = placements[placement]?.() || placements.bottom();

  // Clamp X position within viewport
  if (result.x < 0) result.x = 8;
  else if (result.x + popoverRect.width > viewport.width)
    result.x = viewport.width - popoverRect.width - 8;

  return { ...result, finalPlacement };
}

/**
 * Popover component with CSS Anchor Positioning and native Popover API
 *
 * Displays content relative to a trigger element with automatic viewport collision
 * handling via CSS anchor positioning. Falls back to JS positioning in unsupported browsers.
 *
 * @example
 * <button data-popover-trigger>Open Popover</button>
 * <ren-popover placement="bottom" offset="8">
 *   <div class="ren-popover-header">Title</div>
 *   <div class="ren-popover-body">Content</div>
 * </ren-popover>
 *
 * @fires ren-open - Fired when popover opens
 * @fires ren-close - Fired when popover closes
 */
export class RenPopover extends HTMLElement {
  static observedAttributes = ['placement'];
  static supportsAnchor = supportsAnchorPositioning();

  #trigger = null;
  #triggerController = null;
  #dismissController = null;

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'placement' && oldValue !== newValue) {
      this.#syncPlacement();
    }
  }

  connectedCallback() {
    this.setupPopover();
    this.findTrigger();
    this.attachTriggerListener();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  /**
   * Setup popover element with required attributes
   * @private
   */
  setupPopover() {
    this.classList.add('ren-popover');

    if (!this.id) {
      this.id = `ren-popover-${++nextPopoverId}`;
    }

    // Add arrow if not present
    if (!this.querySelector('.ren-popover-arrow')) {
      const arrow = document.createElement('div');
      arrow.className = 'ren-popover-arrow';
      this.appendChild(arrow);
    }

    // Setup native Popover API
    if ('popover' in HTMLElement.prototype) {
      this.setAttribute('popover', 'manual');
    }

    // Set accessibility attributes
    this.setAttribute('role', 'dialog');
    this.setAttribute('aria-modal', 'false');
    this.#syncPlacement();
  }

  /**
   * Find the trigger element
   * @private
   */
  findTrigger() {
    // Explicit trigger ID
    const triggerId = this.getAttribute('trigger-id');
    if (triggerId) {
      this.#trigger = document.getElementById(triggerId);
    }

    // Query selector for data-popover-trigger
    if (!this.#trigger) {
      this.#trigger = this.querySelector('[data-popover-trigger]');
    }

    // Fall back to previous sibling
    if (!this.#trigger) {
      this.#trigger = this.previousElementSibling;
    }
  }

  /**
   * Attach trigger listener and setup anchor relationship
   * @private
   */
  attachTriggerListener() {
    if (!this.#trigger) return;

    this.#triggerController?.abort();
    this.#triggerController = new AbortController();

    // Set up anchor relationship if CSS anchors are supported
    if (RenPopover.supportsAnchor) {
      this.#trigger.style.anchorName = '--popover-anchor';
    } else {
      // Fallback: ensure trigger can be positioned relative to
      if (getComputedStyle(this.#trigger.parentElement).position === 'static') {
        this.#trigger.parentElement.style.position = 'relative';
      }
    }

    // Wire up popovertarget if not already set
    if (!this.#trigger.hasAttribute('popovertarget')) {
      this.#trigger.setAttribute('popovertarget', this.id);
    }
    this.#trigger.setAttribute('aria-haspopup', 'dialog');
    this.#trigger.setAttribute('aria-controls', this.id);
    this.#trigger.setAttribute('aria-expanded', this.isOpen() ? 'true' : 'false');

    // Click handler
    this.#trigger.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggle();
      },
      { signal: this.#triggerController.signal }
    );

    // Setup dismiss behavior (click outside, Escape key)
    this.#dismissController?.abort();
    this.#dismissController = new AbortController();

    document.addEventListener(
      'click',
      (e) => {
        if (
          this.isOpen() &&
          e.target !== this &&
          !this.contains(e.target) &&
          e.target !== this.#trigger &&
          !this.#trigger?.contains(e.target)
        ) {
          this.close();
        }
      },
      { signal: this.#dismissController.signal }
    );

    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.close();
        }
      },
      { signal: this.#dismissController.signal }
    );
  }

  /**
   * Position popover relative to trigger (fallback for non-anchor browsers)
   * @private
   */
  positionPopover() {
    if (!this.#trigger || RenPopover.supportsAnchor) return;

    const placement = normalizePlacement(this.getAttribute('placement'), 'bottom');
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
    const placement = normalizePlacement(this.getAttribute('placement'), 'bottom');
    this.setAttribute('data-side', placement);
  }

  /**
   * Open the popover
   */
  open() {
    if (this.isOpen()) return;

    this.positionPopover();
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

    // Popover is explicitly non-modal (see component.md).
    // No aria-modal or focus trap — those are for ren-dialog / ren-sheet.
    this.setAttribute('aria-modal', 'false');
    this.#trigger?.setAttribute('aria-expanded', 'true');
    // Note: no focus trap for non-modal popover.
    requestAnimationFrame(() => this.#focusInitialElement());
    this.dispatchEvent(new CustomEvent('ren-open', { bubbles: true }));
  }

  /**
   * Close the popover
   */
  close() {
    if (!this.isOpen()) return;

    const activeElement = document.activeElement;
    const shouldRestoreFocus =
      this.#trigger &&
      activeElement instanceof HTMLElement &&
      this.contains(activeElement);

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

    this.setAttribute('aria-modal', 'false');
    this.#trigger?.setAttribute('aria-expanded', 'false');
    if (shouldRestoreFocus) {
      this.#trigger.focus({ preventScroll: true });
    }
    this.dispatchEvent(new CustomEvent('ren-close', { bubbles: true }));
  }

  /**
   * Toggle popover open/closed state
   */
  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Check if popover is currently open
   * @returns {boolean}
   */
  isOpen() {
    if ('popover' in HTMLElement.prototype) {
      return this.matches(':popover-open');
    }
    return this.classList.contains('ren-open');
  }

  /**
   * Cleanup event listeners
   * @private
   */
  cleanup() {
    this.#triggerController?.abort();
    this.#triggerController = null;
    this.#dismissController?.abort();
    this.#dismissController = null;
  }

  #focusInitialElement() {
    const target = this.querySelector(FOCUSABLE_SELECTOR) || this;
    if (target === this && !this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '-1');
    }
    target.focus({ preventScroll: true });
  }

  /**
   * Get the trigger element
   * @returns {HTMLElement|null}
   */
  getTrigger() {
    return this.#trigger;
  }

  /**
   * Set the trigger element
   * @param {HTMLElement} trigger
   */
  setTrigger(trigger) {
    this.#trigger = trigger;
    this.attachTriggerListener();
  }
}

if (!customElements.get('ren-popover')) {
  customElements.define('ren-popover', RenPopover);
}
