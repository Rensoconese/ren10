---
type: "RenDS Component"
title: ren-sheet
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-sheet
sourcePath: components/composites/ren-sheet
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

# ren-sheet

Source path: `components/composites/ren-sheet`

## Relationships

- `exposes_selector` -> [.ren-sheet](../../selectors/ren-sheet.md)
- `exposes_selector` -> [.ren-sheet-body](../../selectors/ren-sheet-body.md)
- `exposes_selector` -> [.ren-sheet-close](../../selectors/ren-sheet-close.md)
- `exposes_selector` -> [.ren-sheet-description](../../selectors/ren-sheet-description.md)
- `exposes_selector` -> [.ren-sheet-footer](../../selectors/ren-sheet-footer.md)
- `exposes_selector` -> [.ren-sheet-handle](../../selectors/ren-sheet-handle.md)
- `exposes_selector` -> [.ren-sheet-header](../../selectors/ren-sheet-header.md)
- `exposes_selector` -> [.ren-sheet-title](../../selectors/ren-sheet-title.md)
- `has_contract` -> [ren-sheet component.md](../../foundation/contract-composite-ren-sheet.md)
- `has_css` -> [ren-sheet.css](../../css/ren-sheet-css.md)
- `has_docs_page` -> [ren-sheet docs](../../docs/ren-sheet-docs.md)
- `has_js` -> [ren-sheet.js](../../javascript/ren-sheet-js.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-fill-active](../../tokens/color-fill-active.md)
- `uses_token` -> [--color-fill-hover](../../tokens/color-fill-hover.md)
- `uses_token` -> [--color-overlay](../../tokens/color-overlay.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--duration-exit](../../tokens/duration-exit.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--ease-exit](../../tokens/ease-exit.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--space-6](../../tokens/space-6.md)
- `uses_token` -> [--space-8](../../tokens/space-8.md)
- `uses_token` -> [--text-lg](../../tokens/text-lg.md)
- `uses_token` -> [--text-sm](../../tokens/text-sm.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-sheet",
    ".ren-sheet-body",
    ".ren-sheet-close",
    ".ren-sheet-description",
    ".ren-sheet-footer",
    ".ren-sheet-handle",
    ".ren-sheet-header",
    ".ren-sheet-title"
  ],
  "tokens": [
    "--color-border",
    "--color-fill",
    "--color-fill-active",
    "--color-fill-hover",
    "--color-overlay",
    "--color-surface",
    "--color-text",
    "--color-text-muted",
    "--duration-enter",
    "--duration-exit",
    "--ease-enter",
    "--ease-exit",
    "--radius-full",
    "--space-2",
    "--space-3",
    "--space-4",
    "--space-6",
    "--space-8",
    "--text-lg",
    "--text-sm",
    "--transition-tactile"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

# ren-sheet Component Contract

Edge-attached dialog/surface for secondary workflows.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-sheet` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-sheet` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Sheet composite behavior or visual role.
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
    - "The disclosure is an edge-anchored panel (right / left / top / bottom) over the main app."
    - "You need the native <dialog> behavior — modal focus trap, ::backdrop, Escape to dismiss — on a side surface."
    - "You need a slide-in transition controlled by [data-side] with @starting-style fallback."
    - "You need swipe-to-dismiss on touch and outside-click / Escape dismissal."
    - "You need a mobile bottom sheet with a drag handle (.ren-sheet-handle)."
  avoidWhen:
    - "The disclosure should be centered and block the page — use ren-dialog."
    - "The panel is persistent app-shell navigation — use ren-sidebar."
    - "The disclosure is a small anchored popup — use ren-popover, ren-tooltip, or ren-menu."
    - "The notification is transient and must not steal focus — use ren-toast."

canonicalImports:
  css:
    - "rends/components/composites/ren-sheet/ren-sheet.css"
  js:
    - "rends/components/composites/ren-sheet/ren-sheet.js"
  notes:
    - "JS is required: it wraps the consumer's children in a real <dialog class=\"ren-sheet\"> and wires triggers, swipe, and lifecycle events."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "<ren-sheet id=\"...\" side=\"right|left|top|bottom\"> is the host; do not replace the inner <dialog> the component generates with a <div>."
  - "Header / body / footer slots use .ren-sheet-header, .ren-sheet-body, .ren-sheet-footer in that order so the body grows and the footer pins to the bottom."
  - "Provide .ren-sheet-title as a real heading; it supplies the accessible name when no aria-label is set on <ren-sheet>."
  - "Close affordances use [data-sheet-close]; triggers elsewhere on the page use [data-sheet-trigger=\"<id>\"]."
  - "Use size variants via the .-sm / .-md / .-lg / .-xl / .-full classes — do not inline width on the host."

forbiddenPatterns:
  - "<ren-sheet> rendered as a <div role=\"dialog\"> — the component must use the real <dialog> it generates."
  - "Calling .show() / .close() on the inner <dialog> directly; always use the <ren-sheet> .show() / .close() methods."
  - "Hardcoded backdrop colors (rgba(0,0,0,...)); use --color-overlay via the component's ::backdrop rule."
  - "Animating slide-in with custom @keyframes; use the documented [data-side] + @starting-style + --duration-enter / --ease-enter pipeline."
  - "Toggling visibility via display: none / display: block — the [open] attribute drives the @starting-style translate."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-sheet-backdrop, --ren-sheet-bg, --ren-sheet-border, --ren-sheet-duration, --ren-sheet-easing, --ren-sheet-padding, --ren-sheet-radius, --ren-sheet-shadow, --ren-sheet-width."
    - "Semantic surface tokens: --color-surface, --color-text, --color-text-muted, --color-border, --color-overlay, --color-fill, --color-fill-active, --color-fill-hover."
    - "Spacing / motion tokens: --space-*, --radius-full, --duration-enter, --duration-exit, --ease-enter, --ease-exit, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgb / named color values in overrides — even for the box-shadow on the leading edge (use semantic tokens or override --ren-sheet-shadow)."
    - "Hardcoded transition durations; route through --duration-enter / --duration-exit and their paired easings."

accessibility:
  required:
    - "Modality is provided by the inner real <dialog> (focus trap + inert background); do not break the trap with manual focus moves."
    - ".ren-sheet-title supplies the accessible label; if omitted, set aria-label on <ren-sheet>."
    - "Escape closes the sheet (unless dismissible=\"false\"); the close button [data-sheet-close] has a visible aria-label."
    - "Restore focus to the original trigger element after close (handled by the component via the returnFocus reference)."
    - "Swipe-to-dismiss must coexist with keyboard dismissal; do not override touch-action on the dialog."
    - "Respect prefers-reduced-motion: the slide-in collapses to a plain fade automatically — do not reintroduce custom animations there."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-sheet/ren-sheet.css">
<script type="module" src="rends/components/composites/ren-sheet/ren-sheet.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-sheet">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-sheet`
- `.ren-sheet-body`
- `.ren-sheet-close`
- `.ren-sheet-description`
- `.ren-sheet-footer`
- `.ren-sheet-handle`
- `.ren-sheet-header`
- `.ren-sheet-title`

## States And Attributes

- `[data-sheet-close]`
- `[data-sheet-trigger]`
- `[data-side]`
- `:active`
- `:hover`

## Public Token API

- `--ren-sheet-backdrop`
- `--ren-sheet-bg`
- `--ren-sheet-border`
- `--ren-sheet-duration`
- `--ren-sheet-easing`
- `--ren-sheet-padding`
- `--ren-sheet-radius`
- `--ren-sheet-shadow`
- `--ren-sheet-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-sheet/ren-sheet.css`
- `components/composites/ren-sheet/ren-sheet.js`
- `docs/components/ren-sheet.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* Hide the dialog when it isn't open. The browser default for
   `<dialog>` without `open` is `display: none`, but the rule below
   sets `display: flex` for layout, so without this explicit reset
   the sheet would render in-flow on every page load. */
.ren-sheet:not([open]) {
  display: none;
}

.ren-sheet {
  position: fixed;
  margin: 0;
  padding: 0;
  border: none;

  background: var(--color-surface);
  color: var(--color-text);
  border-radius: 0;

  /* Header/body/footer stack: body grows, footer pins to the bottom */
  display: flex;
  flex-direction: column;

  z-index: 50;
  max-width: 100%;
  max-height: 100%;
  touch-action: none; /* Prevent scroll chaining; swipe-to-dismiss handled by JS */

  &[data-side='right'] {
    inset-inline-end: 0;
    top: 0;
    bottom: 0;

    width: min(24rem, 90vw);
    height: 100dvh;

    @starting-style {
      translate: 100% 0;
    }

    translate: 0 0;
  }

  &[data-side='left'] {
    inset-inline-start: 0;
    top: 0;
    bottom: 0;

    width: min(24rem, 90vw);
    height: 100dvh;

    @starting-style {
      translate: -100% 0;
    }

    translate: 0 0;
  }

  &[data-side='bottom'] {
    bottom: 0;
    inset-inline: 0;

    width: 100vw;
    max-height: 85dvh;

    @starting-style {
      translate: 0 100%;
    }

    translate: 0 0;
  }

  &[data-side='top'] {
    top: 0;
    inset-inline: 0;

    width: 100vw;
    max-height: 85dvh;

    @starting-style {
      translate: 0 -100%;
    }

    translate: 0 0;
  }

  /* Size variants */
  &.-sm {
    width: min(18rem, 90vw);
  }

  &.-md {
    width: min(24rem, 90vw);
  }

  &.-lg {
    width: min(32rem, 90vw);
  }

  &.-xl {
    width: min(42rem, 90vw);
  }

  &.-full {
    width: 100vw;
    height: 100dvh;
  }

  /* Transitions — semantic tokens keep sheet in sync with ren-dialog and
     friends; --duration-enter / --ease-enter collapse to 0ms under
     prefers-reduced-motion via tokens/semantic/motion.css. */
  transition: translate var(--duration-enter) var(--ease-enter),
    opacity var(--duration-enter) var(--ease-enter);
  transition-behavior: allow-discrete;

  /* Reduce motion */
  @media (prefers-reduced-motion: reduce) {
    transition: none;

    @starting-style {
      opacity: 0;
    }

    opacity: 1;
  }

  /* Shadow on appropriate edge */
  &[data-side='right'] {
    box-shadow: -12px 0 32px rgb(0, 0, 0, 0.12);
  }

  &[data-side='left'] {
    box-shadow: 12px 0 32px rgb(0, 0, 0, 0.12);
  }

  &[data-side='bottom'] {
    box-shadow: 0 -12px 32px rgb(0, 0, 0, 0.12);
  }

  &[data-side='top'] {
    box-shadow: 0 12px 32px rgb(0, 0, 0, 0.12);
  }

  /* Backdrop animations — enter uses --duration-enter / --ease-enter,
     close uses the exit pair so the scrim fades at a slightly brisker
     clip than the entry, matching the rest of the overlay family. */
  &[open]::backdrop {
    animation: ren-sheet-backdrop-open var(--duration-enter) var(--ease-enter) forwards;
  }

  &::backdrop {
    @starting-style {
      opacity: 0;
    }

    opacity: 1;
    background: var(--color-overlay);
    backdrop-filter: blur(4px);

    animation: ren-sheet-backdrop-close var(--duration-exit) var(--ease-exit) forwards;
  }

  &:modal::backdrop {
    background: var(--color-overlay);
    backdrop-filter: blur(4px);
  }
}

.ren-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: var(--space-6);
  padding-block: var(--space-4);

  border-bottom: 1px solid var(--color-border);
}

.ren-sheet-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.ren-sheet-description {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin: var(--space-2) 0 0 0;
}

.ren-sheet-close {
  display: flex;
  align-items: center;
  justify-content: center;

  width: var(--space-8);
  height: var(--space-8);

  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;

  font-size: 1.5rem;
  color: var(--color-text-muted);

  transition: var(--transition-tactile);

  &:hover {
    color: var(--color-text);
  }

  &:active {
    color: var(--color-text-muted);
  }
}

.ren-sheet-body {
  flex: 1;
  padding: var(--space-6);

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
}

.ren-sheet-footer {
  display: flex;
  gap: var(--space-3);

  padding: var(--space-6);
  padding-block: var(--space-4);

  border-top: 1px solid var(--color-border);
}

.ren-sheet-handle {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: var(--space-3);

  margin-bottom: var(--space-4);

  &::before {
    content: '';
    display: block;

    width: 40px;
    height: 4px;

    background: var(--color-fill);
    border-radius: var(--radius-full);
  }
}

@keyframes ren-sheet-backdrop-open {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes ren-sheet-backdrop-close {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}


/**
 * RenDS — <ren-sheet> Web Component
 * ==================================
 * Edge-anchored modal panel. Light DOM only — wraps the consumer's children
 * in a native <dialog class="ren-sheet"> so we get focus trap, ::backdrop,
 * Esc handling, and inert-on-body for free.
 *
 * Markup:
 *   <ren-sheet side="right" id="filters">
 *     <header class="ren-sheet-header">
 *       <h2 class="ren-sheet-title">Filters</h2>
 *       <button class="ren-sheet-close" data-sheet-close aria-label="Close">×</button>
 *     </header>
 *     <div class="ren-sheet-body"> … </div>
 *     <footer class="ren-sheet-footer"> … </footer>
 *   </ren-sheet>
 *
 *   <button data-sheet-trigger="filters">Open</button>
 *
 * Attributes:
 *   side         — "right" | "left" | "top" | "bottom" (default "right")
 *   size         — "sm" | "md" | "lg" | "xl" | "full" (default "md")
 *   open         — reflects show()/close()
 *   dismissible  — if "false", only the close button dismisses
 *
 * Methods:
 *   .show()
 *   .close()
 *   .open  (getter)
 *
 * Events (bubble):
 *   ren-open
 *   ren-close
 *
 * Light-DOM hooks:
 *   [data-sheet-trigger="<id>"]  anywhere on the page  → opens the sheet
 *   [data-sheet-close]           inside the sheet      → closes the sheet
 */

import { autoId } from '../../../utils/id-generator.js';

export class RenSheet extends HTMLElement {
  static get observedAttributes() {
    return ['side', 'size', 'data-side', 'data-size', 'open', 'dismissible'];
  }

  #dialog;
  #titleId;
  #upgraded = false;
  #returnFocus = null;

  // Touch swipe
  #startX = 0;
  #startY = 0;
  #dragging = false;

  connectedCallback() {
    if (this.#upgraded) return;
    this.#upgraded = true;
    autoId(this, 'sheet');
    this.#enhance();
    this.#wire();

    // If consumer set open as initial attribute, show
    if (this.hasAttribute('open')) {
      // Defer to ensure dialog is connected
      queueMicrotask(() => this.show());
    }
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this.#upgraded || !this.#dialog) return;
    if (name === 'side' || name === 'data-side') {
      this.#dialog.setAttribute('data-side', this.#getSide());
    } else if (name === 'size' || name === 'data-size') {
      this.#syncSize();
    } else if (name === 'open') {
      const should = this.hasAttribute('open');
      if (should && !this.#dialog.open) this.show();
      if (!should && this.#dialog.open) this.close();
    }
  }

  /* ─── Enhancement ─── */

  #enhance() {
    // Move existing children into a <dialog>
    const fragment = document.createDocumentFragment();
    while (this.firstChild) fragment.appendChild(this.firstChild);

    this.#dialog = document.createElement('dialog');
    this.#dialog.className = 'ren-sheet';
    this.#dialog.setAttribute('role', 'dialog');
    this.#dialog.setAttribute('data-side', this.#getSide());
    this.#syncSize();

    this.#dialog.appendChild(fragment);

    // Wire aria-labelledby to a heading inside the sheet, if any
    const heading =
      this.#dialog.querySelector('.ren-sheet-title') ||
      this.#dialog.querySelector('h1, h2, h3');
    if (heading) {
      this.#titleId = autoId(heading, 'sheet-title');
      this.#dialog.setAttribute('aria-labelledby', this.#titleId);
    }

    this.appendChild(this.#dialog);
  }

  #getSide() {
    return (
      this.getAttribute('side') ||
      this.getAttribute('data-side') ||
      'right'
    );
  }

  #getSize() {
    return (
      this.getAttribute('size') ||
      this.getAttribute('data-size') ||
      'md'
    );
  }

  #syncSize() {
    if (!this.#dialog) return;
    // Drop any prior -sm/-md/-lg/-xl/-full classes
    this.#dialog.classList.remove('-sm', '-md', '-lg', '-xl', '-full');
    this.#dialog.classList.add(`-${this.#getSize()}`);
  }

  /* ─── Wiring ─── */

  #wire() {
    // Backdrop click: native <dialog> dispatches click on the dialog itself
    // when the user clicks on the backdrop. e.target === dialog → it was the
    // backdrop, not content inside.
    this.#dialog.addEventListener('click', (e) => {
      if (!this.#isDismissible()) return;
      if (e.target === this.#dialog) this.close();
    });

    // Esc — handled natively, but we intercept to honor dismissible=false
    this.#dialog.addEventListener('cancel', (e) => {
      if (!this.#isDismissible()) e.preventDefault();
    });

    // [data-sheet-close] anywhere inside
    this.#dialog.addEventListener('click', (e) => {
      const closer = e.target.closest('[data-sheet-close]');
      if (closer && this.#dialog.contains(closer)) this.close();
    });

    // Swipe to dismiss
    this.#dialog.addEventListener('touchstart', (e) => {
      if (!this.#isDismissible()) return;
      this.#startX = e.touches[0].clientX;
      this.#startY = e.touches[0].clientY;
      this.#dragging = true;
    }, { passive: true });

    this.#dialog.addEventListener('touchmove', (e) => {
      if (!this.#dragging) return;
      const dx = e.touches[0].clientX - this.#startX;
      const dy = e.touches[0].clientY - this.#startY;
      const side = this.#getSide();
      const threshold = 50;
      if (
        (side === 'right' && dx > threshold) ||
        (side === 'left' && dx < -threshold) ||
        (side === 'bottom' && dy > threshold) ||
        (side === 'top' && dy < -threshold)
      ) {
        this.#dragging = false;
        this.close();
      }
    }, { passive: true });

    this.#dialog.addEventListener('touchend', () => {
      this.#dragging = false;
    });
  }

  #isDismissible() {
    return this.getAttribute('dismissible') !== 'false';
  }

  /* ─── Public API ─── */

  show() {
    if (!this.#dialog || this.#dialog.open) return;
    this.#returnFocus = document.activeElement;
    this.#dialog.showModal();
    this.setAttribute('open', '');

    // Focus the first usable element inside, or the close button
    const focusable =
      this.#dialog.querySelector('[autofocus]') ||
      this.#dialog.querySelector(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    if (focusable) {
      focusable.focus({ preventScroll: true });
    }

    this.dispatchEvent(new CustomEvent('ren-open', { bubbles: true }));
  }

  close() {
    if (!this.#dialog || !this.#dialog.open) return;
    this.#dialog.close();
    this.removeAttribute('open');

    // Restore focus to the element that opened the sheet
    if (this.#returnFocus && document.contains(this.#returnFocus)) {
      this.#returnFocus.focus({ preventScroll: true });
    }
    this.#returnFocus = null;

    this.dispatchEvent(new CustomEvent('ren-close', { bubbles: true }));
  }

  get open() {
    return !!(this.#dialog && this.#dialog.open);
  }
}

if (!customElements.get('ren-sheet')) {
  customElements.define('ren-sheet', RenSheet);
}

/* ─── Global trigger delegation ─── */
/**
 * <button data-sheet-trigger="some-id"> opens <ren-sheet id="some-id">.
 *
 * One global listener handles every trigger on the page so consumers don't
 * need any wiring of their own. Idempotent across module re-imports.
 */
if (typeof window !== 'undefined' && !window.__renSheetTriggerWired) {
  window.__renSheetTriggerWired = true;
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-sheet-trigger]');
    if (!trigger) return;
    const targetId = trigger.getAttribute('data-sheet-trigger');
    if (!targetId) return;
    const sheet = document.getElementById(targetId);
    if (sheet && typeof sheet.show === 'function') {
      e.preventDefault();
      sheet.show();
    }
  });
}
