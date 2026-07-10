---
type: "RenDS Component"
title: ren-dialog
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-dialog
sourcePath: components/composites/ren-dialog
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

# ren-dialog

Source path: `components/composites/ren-dialog`

## Relationships

- `exposes_selector` -> [.ren-alert-dialog](../../selectors/ren-alert-dialog.md)
- `exposes_selector` -> [.ren-dialog](../../selectors/ren-dialog.md)
- `exposes_selector` -> [.ren-dialog-body](../../selectors/ren-dialog-body.md)
- `exposes_selector` -> [.ren-dialog-close](../../selectors/ren-dialog-close.md)
- `exposes_selector` -> [.ren-dialog-description](../../selectors/ren-dialog-description.md)
- `exposes_selector` -> [.ren-dialog-footer](../../selectors/ren-dialog-footer.md)
- `exposes_selector` -> [.ren-dialog-full](../../selectors/ren-dialog-full.md)
- `exposes_selector` -> [.ren-dialog-header](../../selectors/ren-dialog-header.md)
- `exposes_selector` -> [.ren-dialog-lg](../../selectors/ren-dialog-lg.md)
- `exposes_selector` -> [.ren-dialog-md](../../selectors/ren-dialog-md.md)
- `exposes_selector` -> [.ren-dialog-sm](../../selectors/ren-dialog-sm.md)
- `exposes_selector` -> [.ren-dialog-title](../../selectors/ren-dialog-title.md)
- `exposes_selector` -> [.ren-dialog-wrapper](../../selectors/ren-dialog-wrapper.md)
- `exposes_selector` -> [.ren-dialog-xl](../../selectors/ren-dialog-xl.md)
- `has_contract` -> [ren-dialog component.md](../../foundation/contract-composite-ren-dialog.md)
- `has_css` -> [ren-dialog.css](../../css/ren-dialog-css.md)
- `has_docs_page` -> [ren-dialog docs](../../docs/ren-dialog-docs.md)
- `has_js` -> [ren-dialog.js](../../javascript/ren-dialog-js.md)
- `used_by_example` -> [dialog-workflow.html](../../examples/dialog-workflow-html.md) (ren-dialog)
- `uses_token` -> [--color-background-active](../../tokens/color-background-active.md)
- `uses_token` -> [--color-background-hover](../../tokens/color-background-hover.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-border-hover](../../tokens/color-border-hover.md)
- `uses_token` -> [--color-focus-ring](../../tokens/color-focus-ring.md)
- `uses_token` -> [--color-overlay](../../tokens/color-overlay.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--dialog-max-width](../../tokens/dialog-max-width.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--radius-lg](../../tokens/radius-lg.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--radius-xl](../../tokens/radius-xl.md)
- `uses_token` -> [--ring-offset-width](../../tokens/ring-offset-width.md)
- `uses_token` -> [--ring-width](../../tokens/ring-width.md)
- `uses_token` -> [--shadow-xl](../../tokens/shadow-xl.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--space-6](../../tokens/space-6.md)
- `uses_token` -> [--transition-overlay](../../tokens/transition-overlay.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-alert-dialog",
    ".ren-dialog",
    ".ren-dialog-body",
    ".ren-dialog-close",
    ".ren-dialog-description",
    ".ren-dialog-footer",
    ".ren-dialog-full",
    ".ren-dialog-header",
    ".ren-dialog-lg",
    ".ren-dialog-md",
    ".ren-dialog-sm",
    ".ren-dialog-title",
    ".ren-dialog-wrapper",
    ".ren-dialog-xl"
  ],
  "tokens": [
    "--color-background-active",
    "--color-background-hover",
    "--color-border",
    "--color-border-hover",
    "--color-focus-ring",
    "--color-overlay",
    "--color-surface",
    "--color-text",
    "--color-text-muted",
    "--dialog-max-width",
    "--duration-enter",
    "--ease-enter",
    "--radius-lg",
    "--radius-md",
    "--radius-xl",
    "--ring-offset-width",
    "--ring-width",
    "--shadow-xl",
    "--space-2",
    "--space-3",
    "--space-4",
    "--space-6",
    "--transition-overlay",
    "--transition-tactile"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-dialog

Modal dialog composite built on the native `<dialog>` element with focus
trapping, scroll locking, animated open/close, and an alert-mode for
critical confirmations.

Load this file after `ren-design.md` and before generating, editing, or
reviewing any `<ren-dialog>` UI.

## Purpose

Owns the modal-overlay UX of a `<dialog showModal>` plus keyboard / a11y
behavior: focus trap inside the dialog, restore focus on close, dismiss
on Escape (unless `no-escape`), close on backdrop click (unless `alert`),
and animated open/close that respects `prefers-reduced-motion`. Supports
size variants and a mobile sheet adaptation.

## Use When

- The UI requires the user's full attention before continuing — confirms,
  destructive flows, multi-step settings panes.
- The interaction blocks the page underneath (background goes inert).
- A critical alert dialog should not be dismissable by accident
  (use `alert`).
- A multi-step settings or onboarding form should appear inline as a modal.

## Do Not Use When

- The disclosure is non-modal — use `ren-popover`, `ren-tooltip`,
  `ren-hover-card`.
- The disclosure is a side panel — use `ren-sheet`.
- The disclosure is a transient notification — use `ren-toast` /
  `ren-banner`.
- The control is a select / combobox / menu — use those composites.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The flow blocks the underlying page (modal)."
    - "You need focus trap, scroll lock, Escape-to-close, and backdrop dismiss."
    - "You need an alert variant that disables accidental dismissal."
    - "You want the native <dialog> semantics (form method=dialog, returnValue, etc.)."
  avoidWhen:
    - "The disclosure is non-modal (popover, tooltip)."
    - "The disclosure is a side panel — use ren-sheet."
    - "The notification should not steal focus — use ren-toast."

canonicalImports:
  css:
    - "rends/components/composites/ren-dialog/ren-dialog.css"
  js:
    - "rends/components/composites/ren-dialog/ren-dialog.js"
  notes:
    - "JS is required (focus trap, animation, scroll lock). The native <dialog> alone does not provide RenDS' UX guarantees."

requiredMarkup:
  - "<ren-dialog> wraps a real <dialog> element. Do not replace the inner <dialog> with a <div>."
  - "Provide a unique id on <ren-dialog> when triggers reference it via data-dialog-trigger."
  - "Always include .ren-dialog-title (rendered as a real heading) for the accessible name."
  - "Close affordances use [data-dialog-close]; do not call dialog.close() directly from arbitrary handlers."

forbiddenPatterns:
  - "<ren-dialog> wrapping a <div role=\"dialog\"> instead of a real <dialog>."
  - "Animating the backdrop manually with hardcoded rgba — use --ren-dialog-backdrop."
  - "Programmatic open via .show() when the user expects modal behavior — use .open() / .show() per native semantics."
  - "Putting form submit buttons outside <form method=\"dialog\"> when the dialog is a confirmation."

tokenPolicy:
  allowed:
    - "Component tokens: every --ren-dialog-* listed in Public Token API."
    - "Semantic tokens for content inside the dialog (--color-text, --color-text-muted, etc.)."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, etc.) in consumer code."
    - "Hardcoded backdrop colors; use --ren-dialog-backdrop."

accessibility:
  required:
    - "Use a real <dialog> inside <ren-dialog> so the user agent provides modality semantics."
    - ".ren-dialog-title supplies the accessible label when no aria-label is set."
    - "Modal dialogs trap focus and inert the rest of the page automatically; do not break the trap."
    - "Escape closes the dialog unless no-escape is set."
    - "Backdrop click closes the dialog unless alert is set."
    - "Restore focus to the trigger after close (handled by the component)."
```

## Required CSS / JS Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-dialog/ren-dialog.css">
<script type="module" src="rends/components/composites/ren-dialog/ren-dialog.js"></script>
```

## Canonical Markup

Confirmation dialog with trigger:

```html
<button class="ren-btn" data-dialog-trigger="confirm-delete">Delete project</button>

<ren-dialog id="confirm-delete" alert>
  <dialog>
    <div class="ren-dialog-header">
      <h2 class="ren-dialog-title">Delete project</h2>
      <button class="ren-dialog-close" data-dialog-close aria-label="Close"></button>
    </div>
    <div class="ren-dialog-body">
      <p>This action cannot be undone.</p>
    </div>
    <div class="ren-dialog-footer">
      <button class="ren-btn ren-btn-secondary" data-dialog-close>Cancel</button>
      <button class="ren-btn ren-btn-danger" data-dialog-close="delete">Delete</button>
    </div>
  </dialog>
</ren-dialog>
```

Native command API (when supported):

```html
<button commandfor="settings" command="show-modal">Open settings</button>
<ren-dialog id="settings">
  <dialog>...</dialog>
</ren-dialog>
```

Programmatic API:

```js
const dlg = document.querySelector('#settings');
dlg.show();              // open
dlg.close('saved');      // close with returnValue
dlg.addEventListener('ren-close', (e) => console.log(e.detail.returnValue));
```

## Attributes, Events, and API

- Host attributes: `open`, `alert`, `size="sm|md|lg|xl|full"`, `no-escape`.
- Trigger attributes: `[data-dialog-trigger="<id>"]`, native
  `commandfor` + `command="show-modal"` where supported.
- Close attributes: `[data-dialog-close]`. Optional value becomes the
  dialog's `returnValue`.
- Methods: `show()`, `open()`, `close(returnValue)`.
- Getters: `isOpen`, `dialog`.
- Events: `ren-open`, `ren-close` (with `detail.returnValue`).

## Variants

| Class                  | Role                                   |
|------------------------|----------------------------------------|
| `.ren-dialog`          | Default surface (applied internally).  |
| `.ren-dialog-sm`       | Small width.                           |
| `.ren-dialog-md`       | Medium (default size).                 |
| `.ren-dialog-lg`       | Large width.                           |
| `.ren-dialog-xl`       | Extra-large.                           |
| `.ren-dialog-full`     | Full-screen on desktop.                |
| `.ren-alert-dialog`    | Critical confirmation styling.         |
| `.ren-dialog-header`   | Header slot.                           |
| `.ren-dialog-title`    | Heading slot (renders as `<h*>`).      |
| `.ren-dialog-description` | Subheading / description slot.      |
| `.ren-dialog-body`     | Scrollable body slot.                  |
| `.ren-dialog-footer`   | Action footer.                         |
| `.ren-dialog-close`    | Close button slot.                     |

## States

| Selector / attr             | Meaning                                  |
|-----------------------------|------------------------------------------|
| `[open]`                    | Native `<dialog>` open state.            |
| `[data-mobile-sheet]`       | Mobile adaptation as a bottom sheet.     |
| `[data-dialog-trigger]`     | Marks an opener for a target dialog.     |
| `[data-dialog-close]`       | Marks a close affordance.                |

## Public Token API

- `--ren-dialog-bg`
- `--ren-dialog-border-color`
- `--ren-dialog-radius`
- `--ren-dialog-padding`
- `--ren-dialog-gap`
- `--ren-dialog-width`
- `--ren-dialog-shadow`
- `--ren-dialog-backdrop`
- `--ren-dialog-duration`
- `--ren-dialog-easing`

## Accessibility Contract

- A real `<dialog>` element supplies modality semantics; never substitute a
  `<div role="dialog">`.
- `.ren-dialog-title` provides the accessible name; if you omit it, set
  `aria-label` on `<ren-dialog>`.
- The component traps focus inside the dialog and inerts background content.
- Escape closes the dialog unless `no-escape` is set.
- Backdrop click closes the dialog unless `alert` is set.
- After close, focus returns to the original trigger.

## Anti-Patterns

- ❌ `<ren-dialog><div role="dialog">…</div></ren-dialog>` — must be a real
  `<dialog>` inside.
- ❌ Calling `dialog.show()` when modal behavior is needed — use `.open()` /
  the native `.showModal()` flow the component provides.
- ❌ Custom backdrops via `position: fixed; background: rgba(0,0,0,.5)` —
  use `--ren-dialog-backdrop`.
- ❌ Skipping `.ren-dialog-title` and not providing `aria-label`.

## Related Files

- `components/composites/ren-dialog/ren-dialog.css`
- `components/composites/ren-dialog/ren-dialog.js`
- `docs/components/ren-dialog.html`
- `ren-design.md`
- `tokens/tokens.md`

## Test Expectations

- Run component / docs a11y coverage on focus trap, Escape, backdrop click.
- Run `npm run lint` after token / selector changes.
- Manually verify reduced-motion: open / close should still work but
  without animation.


/* ═══════════════════════════════════════════════════════════════════════════
   REN DIALOG / MODAL COMPONENT
   Native <dialog> element enhancement with CSS animations and modern APIs
   Uses @starting-style, transition-behavior: allow-discrete, and CSS nesting
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══ DIALOG CONTAINER ═══ */
.ren-dialog {
  /* Structure */
  margin: auto;
  padding: 0;
  border: none;

  /* Sizing */
  max-width: var(--dialog-max-width, 32rem);
  max-height: 85dvh;
  width: 90vw;
  overflow: auto;

  /* Appearance */
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);

  /* Smooth scrolling for body overflow */
  scrollbar-gutter: stable;

  /* ═══ ANIMATION STATES ═══
     Uses semantic motion tokens so global motion tuning
     cascades to every component. See tokens/semantic/motion.css. */
  opacity: 1;
  transform: scale(1) translateY(0);

  transition:
    opacity   var(--duration-enter) var(--ease-enter),
    transform var(--duration-enter) var(--ease-enter),
    overlay   var(--duration-enter) allow-discrete,
    display   var(--duration-enter) allow-discrete;

  /* ═══ ENTRY ANIMATION (CSS Transitions instead of keyframes) ═══ */
  @starting-style {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
  }

  /* ═══ BACKDROP STYLING ═══
     Uses --transition-overlay so scrim fade/blur duration
     is tuned in one place (tokens/semantic/motion.css). */
  &::backdrop {
    background-color: rgb(0, 0, 0, 0);
    backdrop-filter: blur(0px);

    transition: var(--transition-overlay);

    /* ═══ BACKDROP ENTRY ANIMATION ═══ */
    @starting-style {
      background-color: rgb(0, 0, 0, 0);
      backdrop-filter: blur(0px);
    }
  }

  /* ═══ OPEN STATE ═══ */
  &[open] {
    opacity: 1;
    transform: scale(1) translateY(0);

    &::backdrop {
      background-color: var(--color-overlay);
      backdrop-filter: blur(4px);
    }
  }

  /* ═══ REDUCED MOTION ═══ */
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &::backdrop {
      transition: none;
    }
  }
}

/* ═══ DIALOG HEADER ═══
   No bottom border — separation from the body comes from spacing, not lines.
   Header padding-bottom + body padding-top give the breathing room. */
.ren-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-6) var(--space-6) var(--space-3);
  flex-shrink: 0;
}

/* ═══ DIALOG TITLE ═══ */
.ren-dialog-title {
  margin: 0;
  font-size: 1.25rem; /* ~20px */
  line-height: 1.5;
  font-weight: 600;
  color: var(--color-text);
}

/* ═══ DIALOG DESCRIPTION ═══ */
.ren-dialog-description {
  margin: 0;
  margin-top: var(--space-2);
  font-size: 0.875rem; /* caption */
  line-height: 1.5;
  color: var(--color-text-muted);
}

/* ═══ DIALOG BODY ═══ */
.ren-dialog-body {
  padding: var(--space-6);
  overflow-y: auto;
  flex: 1;
  min-height: 0; /* Allow flex shrinking */

  /* ═══ SCROLLBAR STYLING ═══ */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;

    &:hover {
      background: var(--color-border-hover);
    }
  }
}

/* ═══ DIALOG FOOTER ═══ */
.ren-dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-6);
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

/* ═══ CLOSE BUTTON ═══ */
.ren-dialog-close {
  margin-inline-start: auto;
  padding: var(--space-2);
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  /* Tactile transitions (hover / focus / press) */
  transition: var(--transition-tactile);

  &:hover {
    background-color: var(--color-background-hover);
    color: var(--color-text);
  }

  &:active {
    background-color: var(--color-background-active);
  }

  &:focus {
    outline: var(--ring-width) solid var(--color-focus-ring);
    outline-offset: var(--ring-offset-width);
  }

  & svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

/* ═══ SIZE VARIANTS ═══ */

/* Small dialog (24rem) */
.ren-dialog-sm {
  --dialog-max-width: 24rem;
}

/* Medium dialog (32rem) - DEFAULT */
.ren-dialog-md {
  --dialog-max-width: 32rem;
}

/* Large dialog (42rem) */
.ren-dialog-lg {
  --dialog-max-width: 42rem;
}

/* Extra Large dialog (56rem) */
.ren-dialog-xl {
  --dialog-max-width: 56rem;
}

/* Full width dialog (95dvw) */
.ren-dialog-full {
  max-width: 95dvw;
  max-height: 95dvh;
  width: 95dvw;
}

/* ═══ ALERT DIALOG VARIANT ═══ */
.ren-alert-dialog {
  /* No additional styling needed - alert behavior handled in JS */
}

/* ═══ MOBILE RESPONSIVE ═══ */
@media (max-width: 640px) {
  .ren-dialog {
    max-width: 100%;
    max-height: 100dvh;
    width: 100%;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;

    /* ═══ BOTTOM SHEET ANIMATION (Mobile) ═══ */
    &[data-mobile-sheet] {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      margin: 0;
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;

      transform: translateY(100%);
      transition:
        transform var(--duration-enter) var(--ease-enter),
        opacity   var(--duration-enter) var(--ease-enter),
        overlay   var(--duration-enter) allow-discrete,
        display   var(--duration-enter) allow-discrete;

      @starting-style {
        transform: translateY(100%);
      }

      &[open] {
        transform: translateY(0);
      }
    }
  }

  .ren-dialog-header,
  .ren-dialog-body,
  .ren-dialog-footer {
    padding: var(--space-4);
  }

  .ren-dialog-title {
    font-size: 1.125rem;
  }
}

/* ═══ WEB COMPONENT CONTAINER ═══ */
ren-dialog {
  display: contents;
}

.ren-dialog-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}


import { createFocusTrap } from '../../../utils/focus-trap.js';

/**
 * RenDialog - Modal/Dialog Web Component
 *
 * A minimal, modern dialog component built on the native <dialog> element.
 * Animations are handled entirely by CSS using @starting-style and transitions.
 *
 * Features:
 * - Native <dialog> element with `.ren-dialog` enhancement
 * - Auto-wiring of [data-dialog-trigger] and [data-dialog-close] buttons
 * - Progressive enhancement: [commandfor] and [command] attributes support
 * - Progressive enhancement: closedby attribute for modern browsers
 * - Focus trap management for accessibility
 * - Escape key support and click-outside dismissal via native dialog + simple click handler
 * - Size variants (sm, md, lg, xl, full)
 * - Mobile-responsive bottom sheet behavior
 * - Custom events: ren-open, ren-close
 *
 * @example
 * <ren-dialog size="md">
 *   <dialog>
 *     <div class="ren-dialog-header">
 *       <h2 class="ren-dialog-title">Confirm Action</h2>
 *       <button class="ren-dialog-close" data-dialog-close>&times;</button>
 *     </div>
 *     <div class="ren-dialog-body">Are you sure?</div>
 *     <div class="ren-dialog-footer">
 *       <button data-dialog-close>Cancel</button>
 *       <button>Confirm</button>
 *     </div>
 *   </dialog>
 * </ren-dialog>
 *
 * @example
 * <button data-dialog-trigger="my-dialog">Open</button>
 * <ren-dialog id="my-dialog">...</ren-dialog>
 *
 * @example
 * <button commandfor="my-dialog" command="show-modal">Open</button>
 * <ren-dialog id="my-dialog">...</ren-dialog>
 */
export class RenDialog extends HTMLElement {
  #dialogElement = null;
  #focusTrap = null;
  #abortController = new AbortController();
  #inertElements = new WeakMap();

  static observedAttributes = ['open', 'alert', 'size'];

  constructor() {
    super();
    this.#setupDialogElement();
  }

  connectedCallback() {
    this.#initializeDialogElement();
    this.#wireupTriggers();
  }

  disconnectedCallback() {
    this.#abortController.abort();
    this.#teardownFocusTrap();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'open':
        newValue !== null ? this.show() : this.close();
        break;
      case 'size':
        this.#updateSizeClass();
        break;
    }
  }

  /* ═══ PUBLIC API ═══ */

  /**
   * Show the dialog with modal behavior
   * @public
   */
  show() {
    if (!this.#dialogElement?.open) {
      this.#dialogElement.showModal();
      this.#setInert(true);
      this.setAttribute('open', '');
      this.setAttribute('data-state', 'open');
      this.#setupFocusTrap();
      this.#updateMobileSheet();
      this.dispatchEvent(new CustomEvent('ren-open', { bubbles: true, composed: true }));
    }
  }

  /**
   * Alias for show()
   * @public
   */
  open() {
    this.show();
  }

  /**
   * Close the dialog
   * CSS transitions handle the exit animation automatically
   *
   * @public
   * @param {string} [returnValue]
   */
  close(returnValue = '') {
    if (this.#dialogElement?.open) {
      this.#setInert(false);
      this.#dialogElement.close(returnValue);
      this.removeAttribute('open');
      this.setAttribute('data-state', 'closed');
      this.#teardownFocusTrap();
      this.dispatchEvent(
        new CustomEvent('ren-close', {
          bubbles: true,
          composed: true,
          detail: { returnValue },
        })
      );
    }
  }

  /**
   * Check if dialog is open
   * @public
   * @returns {boolean}
   */
  get isOpen() {
    return this.#dialogElement?.open ?? false;
  }

  /**
   * Get the underlying dialog element
   * @public
   * @returns {HTMLDialogElement | null}
   */
  get dialog() {
    return this.#dialogElement;
  }

  /* ═══ PRIVATE: INITIALIZATION ═══ */

  /**
   * Find or create the dialog element
   * @private
   */
  #setupDialogElement() {
    this.#dialogElement = this.querySelector('dialog');
    if (!this.#dialogElement) {
      this.#dialogElement = document.createElement('dialog');
      this.appendChild(this.#dialogElement);
    }
  }

  /**
   * Initialize dialog with classes and event listeners
   * @private
   */
  #initializeDialogElement() {
    if (!this.#dialogElement) this.#setupDialogElement();

    this.#dialogElement.classList.add('ren-dialog');
    this.#updateSizeClass();

    if (this.hasAttribute('alert')) {
      this.#dialogElement.classList.add('ren-alert-dialog');
      this.#dialogElement.setAttribute('role', 'alertdialog');
    }

    // Add aria-label fallback if no title found
    if (!this.#dialogElement.getAttribute('aria-label')) {
      const title = this.#dialogElement.querySelector('.ren-dialog-title, [role="heading"]');
      if (title) {
        this.#dialogElement.setAttribute('aria-label', title.textContent?.trim() || 'Dialog');
      } else {
        this.#dialogElement.setAttribute('aria-label', 'Dialog');
      }
    }

    // Handle Escape key (native dialog behavior)
    this.#dialogElement.addEventListener(
      'cancel',
      (e) => {
        const noEscape = this.hasAttribute('no-escape');
        if (!noEscape) {
          e.preventDefault();
          this.close();
        }
      },
      { signal: this.#abortController.signal }
    );

    // Handle click-outside dismissal
    // Clicking on the dialog itself when event.target === dialog means backdrop was clicked
    this.#dialogElement.addEventListener(
      'click',
      (e) => {
        if (e.target === this.#dialogElement && !this.hasAttribute('alert')) {
          this.close();
        }
      },
      { signal: this.#abortController.signal }
    );

    // Wire up close buttons
    this.#wireupCloseButtons();

    // Progressive enhancement: set closedby attribute for modern browsers
    if ('closedBy' in HTMLDialogElement.prototype) {
      if (this.hasAttribute('alert')) {
        this.#dialogElement.closedBy = 'closerequest';
      } else if (this.hasAttribute('no-escape')) {
        this.#dialogElement.closedBy = 'none';
      } else {
        this.#dialogElement.closedBy = 'any';
      }
    }
  }

  /**
   * Wire up trigger buttons that open this dialog
   * Supports both [data-dialog-trigger] and native commandfor/command attributes
   * @private
   */
  #wireupTriggers() {
    const id = this.id;
    if (!id) return;

    const triggers = document.querySelectorAll(`[data-dialog-trigger="${id}"]`);
    triggers.forEach((trigger) => {
      trigger.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          this.show();
        },
        { signal: this.#abortController.signal }
      );
    });

    // Progressive enhancement: support command/commandfor in browsers that don't yet support it natively
    if (!('commandForElement' in HTMLButtonElement.prototype)) {
      const commandTriggers = document.querySelectorAll(`[commandfor="${id}"]`);
      commandTriggers.forEach((trigger) => {
        const command = trigger.getAttribute('command');
        if (command === 'show-modal' || command === 'show') {
          trigger.addEventListener(
            'click',
            (e) => {
              e.preventDefault();
              this.show();
            },
            { signal: this.#abortController.signal }
          );
        } else if (command === 'close') {
          trigger.addEventListener(
            'click',
            (e) => {
              e.preventDefault();
              this.close();
            },
            { signal: this.#abortController.signal }
          );
        }
      });
    }
  }

  /**
   * Wire up close buttons within the dialog
   * @private
   */
  #wireupCloseButtons() {
    const closeButtons = this.#dialogElement?.querySelectorAll('[data-dialog-close]');
    closeButtons?.forEach((button) => {
      button.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          // [data-dialog-close="value"] propagates `value` as ren-close.detail.returnValue.
          // Bare [data-dialog-close] (no value) closes with "".
          const returnValue = button.getAttribute('data-dialog-close') ?? '';
          this.close(returnValue);
        },
        { signal: this.#abortController.signal }
      );
    });
  }

  /* ═══ PRIVATE: FOCUS MANAGEMENT ═══ */

  /**
   * Setup focus trap for keyboard navigation
   * @private
   */
  #setupFocusTrap() {
    if (this.#focusTrap) return;
    this.#focusTrap = createFocusTrap(this.#dialogElement, {
      initialFocus: this.#dialogElement.querySelector('[autofocus]'),
      returnFocusOnDeactivate: true,
    });
    this.#focusTrap.activate();
  }

  /**
   * Teardown focus trap
   * @private
   */
  #teardownFocusTrap() {
    if (this.#focusTrap) {
      this.#focusTrap.deactivate();
      this.#focusTrap = null;
    }
  }

  /* ═══ PRIVATE: UTILITIES ═══ */

  /**
   * Update size variant class
   * @private
   */
  #updateSizeClass() {
    if (!this.#dialogElement) return;
    this.#dialogElement.classList.remove(
      'ren-dialog-sm',
      'ren-dialog-md',
      'ren-dialog-lg',
      'ren-dialog-xl',
      'ren-dialog-full'
    );
    const size = this.getAttribute('size') || 'md';
    this.#dialogElement.classList.add(`ren-dialog-${size}`);
  }

  /**
   * Apply mobile bottom sheet styling on small screens
   * @private
   */
  #updateMobileSheet() {
    if (!this.#dialogElement) return;
    if (window.innerWidth <= 640) {
      this.#dialogElement.setAttribute('data-mobile-sheet', '');
    } else {
      this.#dialogElement.removeAttribute('data-mobile-sheet');
    }
  }

  /**
   * Toggle inert attribute on sibling elements
   * When active, makes background elements non-interactive
   * @private
   * @param {boolean} active
   */
  #setInert(active) {
    const children = document.body.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      // Skip the dialog itself and meta elements
      if (
        child === this ||
        child.tagName === 'SCRIPT' ||
        child.tagName === 'STYLE' ||
        child.tagName === 'LINK'
      ) {
        continue;
      }

      if (active) {
        // Save original inert state and set inert
        if (!this.#inertElements.has(child)) {
          this.#inertElements.set(child, child.inert);
        }
        child.inert = true;
      } else {
        // Restore original inert state
        const originalInert = this.#inertElements.get(child);
        if (originalInert !== undefined) {
          child.inert = originalInert;
          this.#inertElements.delete(child);
        }
      }
    }
  }
}

/**
 * RenAlertDialog - Alert Dialog Variant
 *
 * An alert dialog that prevents click-outside dismissal by default.
 * Escape key and other behavior can be controlled via attributes.
 *
 * @example
 * <ren-alert-dialog>
 *   <dialog>...</dialog>
 * </ren-alert-dialog>
 */
export class RenAlertDialog extends RenDialog {
  constructor() {
    super();
    this.setAttribute('alert', '');
  }
}

/* ═══ REGISTER CUSTOM ELEMENTS ═══ */
if (!customElements.get('ren-dialog')) {
  customElements.define('ren-dialog', RenDialog);
}
if (!customElements.get('ren-alert-dialog')) {
  customElements.define('ren-alert-dialog', RenAlertDialog);
}
