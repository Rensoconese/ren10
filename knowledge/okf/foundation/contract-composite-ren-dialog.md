---
type: "RenDS Contract"
title: "ren-dialog component.md"
description: "RenDS Contract generated from the RenDS knowledge graph."
id: contract:composite:ren-dialog
sourcePath: components/composites/ren-dialog/component.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - contract
  - ren10
  - rends
---

# ren-dialog component.md

Source path: `components/composites/ren-dialog/component.md`

## Relationships

_No outgoing relationships._

## Structured Data

```json
{
  "kind": "composite"
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
