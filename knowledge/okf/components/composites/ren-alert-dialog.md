---
type: "RenDS Component"
title: ren-alert-dialog
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-alert-dialog
sourcePath: components/composites/ren-alert-dialog
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

# ren-alert-dialog

Source path: `components/composites/ren-alert-dialog`

## Relationships

- `exposes_selector` -> [.ren-alert-dialog](../../selectors/ren-alert-dialog.md)
- `exposes_selector` -> [.ren-alert-dialog-actions](../../selectors/ren-alert-dialog-actions.md)
- `exposes_selector` -> [.ren-alert-dialog-description](../../selectors/ren-alert-dialog-description.md)
- `exposes_selector` -> [.ren-alert-dialog-icon](../../selectors/ren-alert-dialog-icon.md)
- `exposes_selector` -> [.ren-alert-dialog-icon-danger](../../selectors/ren-alert-dialog-icon-danger.md)
- `exposes_selector` -> [.ren-alert-dialog-icon-warning](../../selectors/ren-alert-dialog-icon-warning.md)
- `exposes_selector` -> [.ren-alert-dialog-title](../../selectors/ren-alert-dialog-title.md)
- `has_contract` -> [ren-alert-dialog component.md](../../foundation/contract-composite-ren-alert-dialog.md)
- `has_css` -> [ren-alert-dialog.css](../../css/ren-alert-dialog-css.md)
- `has_docs_page` -> [ren-alert-dialog docs](../../docs/ren-alert-dialog-docs.md)
- `used_by_example` -> [dialog-workflow.html](../../examples/dialog-workflow-html.md) (ren-alert-dialog)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--color-danger](../../tokens/color-danger.md)
- `uses_token` -> [--color-danger-subtle](../../tokens/color-danger-subtle.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-overlay](../../tokens/color-overlay.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--color-warning](../../tokens/color-warning.md)
- `uses_token` -> [--color-warning-subtle](../../tokens/color-warning-subtle.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--icon-xl](../../tokens/icon-xl.md)
- `uses_token` -> [--leading-normal](../../tokens/leading-normal.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--radius-xl](../../tokens/radius-xl.md)
- `uses_token` -> [--shadow-xl](../../tokens/shadow-xl.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-5](../../tokens/space-5.md)
- `uses_token` -> [--space-6](../../tokens/space-6.md)
- `uses_token` -> [--text-lg](../../tokens/text-lg.md)
- `uses_token` -> [--text-xl](../../tokens/text-xl.md)
- `uses_token` -> [--title-sm-size](../../tokens/title-sm-size.md)
- `uses_token` -> [--transition-overlay](../../tokens/transition-overlay.md)
- `uses_token` -> [--weight-semibold](../../tokens/weight-semibold.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-alert-dialog",
    ".ren-alert-dialog-actions",
    ".ren-alert-dialog-description",
    ".ren-alert-dialog-icon",
    ".ren-alert-dialog-icon-danger",
    ".ren-alert-dialog-icon-warning",
    ".ren-alert-dialog-title"
  ],
  "tokens": [
    "--body-size",
    "--color-danger",
    "--color-danger-subtle",
    "--color-fill",
    "--color-overlay",
    "--color-surface",
    "--color-text",
    "--color-text-muted",
    "--color-warning",
    "--color-warning-subtle",
    "--duration-enter",
    "--ease-enter",
    "--icon-xl",
    "--leading-normal",
    "--radius-full",
    "--radius-xl",
    "--shadow-xl",
    "--space-2",
    "--space-3",
    "--space-5",
    "--space-6",
    "--text-lg",
    "--text-xl",
    "--title-sm-size",
    "--transition-overlay",
    "--weight-semibold"
  ],
  "hasScript": false,
  "hasDocsPage": true
}
```

## Source Content

# ren-alert-dialog Component Contract

Non-dismissible confirmation dialog for destructive or critical decisions.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-alert-dialog` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-alert-dialog` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Alert Dialog composite behavior or visual role.
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
    - "A destructive or irreversible action (delete, sign-out, discard) requires explicit confirmation."
    - "Accidental dismissal (Escape, backdrop click) must NOT close the dialog."
    - "The decision is binary and centered around two actions (cancel + confirm)."
    - "Content is short: an icon, a title, a one-paragraph description, and two buttons."
    - "You want the native <dialog> showModal() flow with returnValue for the outcome."
  avoidWhen:
    - "The dialog hosts a form, multi-step flow, or scrollable content — use ren-dialog."
    - "The disclosure should dismiss on Escape / backdrop — use ren-dialog (no alert)."
    - "The notification does not block the page — use ren-toast or ren-banner."

canonicalImports:
  css:
    - "rends/components/composites/ren-alert-dialog/ren-alert-dialog.css"
  notes:
    - "If the page already imports rends/components/index.css, do not import the CSS again."
    - "No colocated JS — call dialog.showModal() / dialog.close(returnValue) directly on the native <dialog>."
    - "The component uses the same --ren-dialog-* token namespace as ren-dialog, so token overrides cascade."

requiredMarkup:
  - "The root element is a real <dialog class=\"ren-alert-dialog\">; never substitute a <div role=\"alertdialog\">."
  - "Provide a .ren-alert-dialog-title (heading) and a .ren-alert-dialog-description so AT can announce the decision."
  - "Actions live inside .ren-alert-dialog-actions and use real <button> elements (.ren-btn-secondary + .ren-btn-danger or similar)."
  - "Each button calls dialog.close('cancel' | 'confirm' | …) so the consumer can read returnValue on the close event."
  - "Use .ren-alert-dialog-icon-danger or .ren-alert-dialog-icon-warning on the icon slot for severity — do not invent new severity classes."

forbiddenPatterns:
  - "<div class=\"ren-alert-dialog\"> rendered without the native <dialog> element."
  - "Calling dialog.show() instead of dialog.showModal() — alert behavior requires modality + ::backdrop."
  - "Adding Escape-to-close handlers; the alert variant intentionally blocks accidental dismissal."
  - "Hardcoded rgba backdrops (background: rgba(0,0,0,.5)) — the ::backdrop already reads --color-overlay."
  - "Replacing .ren-alert-dialog-actions with arbitrary flex containers that bypass the @container narrow-stack layout."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-dialog-backdrop, --ren-dialog-bg, --ren-dialog-border-color, --ren-dialog-duration, --ren-dialog-easing, --ren-dialog-gap, --ren-dialog-padding, --ren-dialog-radius, --ren-dialog-shadow, --ren-dialog-width."
    - "Semantic tokens: --color-surface, --color-overlay, --color-text, --color-text-muted, --color-danger, --color-danger-subtle, --color-warning, --color-warning-subtle, --color-fill."
    - "Layout / motion tokens: --space-*, --radius-*, --shadow-xl, --icon-xl, --duration-enter, --ease-enter, --transition-overlay."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Custom backdrop opacity values that bypass --color-overlay or --transition-overlay."

accessibility:
  required:
    - "Use a real <dialog> so the browser exposes role=\"dialog\" + aria-modal automatically; add aria-labelledby pointing to .ren-alert-dialog-title."
    - "Open with showModal(); the backdrop becomes inert so background content is unreachable to keyboard / AT."
    - "The destructive button must be visually distinct (.ren-btn-danger) AND announced by its text — never rely on color alone."
    - "Focus must move into the dialog on open and return to the trigger on close (native <dialog> behavior)."
    - "Touch targets on action buttons stay ≥ 44px (default .ren-btn size)."
    - "Reduced motion: transitions are disabled under prefers-reduced-motion (already handled by the component)."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-alert-dialog/ren-alert-dialog.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-alert-dialog">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-alert-dialog`
- `.ren-alert-dialog-actions`
- `.ren-alert-dialog-description`
- `.ren-alert-dialog-icon`
- `.ren-alert-dialog-icon-danger`
- `.ren-alert-dialog-icon-warning`
- `.ren-alert-dialog-title`

## States And Attributes

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

## Public Token API

- `--ren-dialog-backdrop`
- `--ren-dialog-bg`
- `--ren-dialog-border-color`
- `--ren-dialog-duration`
- `--ren-dialog-easing`
- `--ren-dialog-gap`
- `--ren-dialog-padding`
- `--ren-dialog-radius`
- `--ren-dialog-shadow`
- `--ren-dialog-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/composites/ren-alert-dialog/ren-alert-dialog.css`
- `docs/components/ren-alert-dialog.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ============================================
   RenDS — Alert Dialog Component
   ============================================
   Confirmation dialog that blocks interaction.
   Extends native <dialog> like ren-dialog but:
   - No dismiss on outside click (::backdrop blocks)
   - No dismiss on Escape (optional)
   - Requires explicit action (confirm/cancel)

   Minimal JS: just showModal() and close().

   Usage:
     <dialog class="ren-alert-dialog" id="confirm">
       <div class="ren-alert-dialog-icon">⚠</div>
       <h2 class="ren-alert-dialog-title">Delete item?</h2>
       <p class="ren-alert-dialog-description">
         This action cannot be undone.
       </p>
       <div class="ren-alert-dialog-actions">
         <button class="ren-btn-secondary" onclick="this.closest('dialog').close('cancel')">
           Cancel
         </button>
         <button class="ren-btn-danger" onclick="this.closest('dialog').close('confirm')">
           Delete
         </button>
       </div>
     </dialog>

   Open: document.getElementById('confirm').showModal()
   Result: dialog.addEventListener('close', () => dialog.returnValue)
   ============================================ */

.ren-alert-dialog {
  container-type: inline-size;
  container-name: ren-alert-dialog;

  /* Structure */
  margin: auto;
  padding: var(--space-6);
  border: none;

  /* Sizing */
  max-width: 24rem;
  width: 90vw;

  /* Appearance */
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  text-align: center;

  /* Animation — semantic tokens keep this in sync with ren-dialog
     and respect prefers-reduced-motion via tokens/semantic/motion.css. */
  opacity: 1;
  transform: scale(1);
  transition:
    opacity   var(--duration-enter) var(--ease-enter),
    transform var(--duration-enter) var(--ease-enter),
    overlay   var(--duration-enter) var(--ease-enter) allow-discrete,
    display   var(--duration-enter) var(--ease-enter) allow-discrete;
}

/* Entry animation */
@starting-style {
  .ren-alert-dialog[open] {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* Exit */
.ren-alert-dialog:not([open]) {
  opacity: 0;
  transform: scale(0.95);
}

/* Backdrop — shared overlay transition keeps all scrims in sync. */
.ren-alert-dialog::backdrop {
  background-color: var(--color-overlay);
  transition: var(--transition-overlay);
}

@starting-style {
  .ren-alert-dialog[open]::backdrop {
    opacity: 0;
  }
}

/* ─── Icon (optional) ─── */
.ren-alert-dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--icon-xl);
  height: var(--icon-xl);
  margin: 0 auto var(--space-3);
  font-size: var(--text-xl);
  background-color: var(--color-fill);
  border-radius: var(--radius-full);
}

/* Danger icon */
.ren-alert-dialog-icon-danger {
  background-color: var(--color-danger-subtle);
  color: var(--color-danger);
}

/* Warning icon */
.ren-alert-dialog-icon-warning {
  background-color: var(--color-warning-subtle);
  color: var(--color-warning);
}

/* ─── Title ─── */
.ren-alert-dialog-title {
  font-size: var(--title-sm-size, var(--text-lg));
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

/* ─── Description ─── */
.ren-alert-dialog-description {
  font-size: var(--body-size);
  color: var(--color-text-muted);
  line-height: var(--leading-normal);
  margin-bottom: var(--space-5);
}

/* ─── Actions ─── */
.ren-alert-dialog-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: center;
}

/* Stack actions when dialog is narrow */
@container ren-alert-dialog (max-width: 24rem) {
  .ren-alert-dialog-actions {
    flex-direction: column-reverse;
  }

  .ren-alert-dialog-actions > * {
    width: 100%;
  }
}

/* ─── Reduced motion ─── */
@media (prefers-reduced-motion: reduce) {
  .ren-alert-dialog {
    transition: none;
  }
  .ren-alert-dialog::backdrop {
    transition: none;
  }
}
