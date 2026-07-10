---
type: "RenDS Component"
title: ren-checkbox
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:primitive:ren-checkbox
sourcePath: components/primitives/ren-checkbox
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - primitive
  - ren10
  - rends
---

# ren-checkbox

Source path: `components/primitives/ren-checkbox`

## Relationships

- `exposes_selector` -> [.ren-checkbox](../../selectors/ren-checkbox.md)
- `exposes_selector` -> [.ren-checkbox-control](../../selectors/ren-checkbox-control.md)
- `has_contract` -> [ren-checkbox component.md](../../foundation/contract-primitive-ren-checkbox.md)
- `has_css` -> [ren-checkbox.css](../../css/ren-checkbox-css.md)
- `has_docs_page` -> [ren-checkbox docs](../../docs/ren-checkbox-docs.md)
- `used_by_example` -> [data-table.html](../../examples/data-table-html.md) (ren-checkbox)
- `used_by_example` -> [settings-form.html](../../examples/settings-form-html.md) (ren-checkbox)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-accent-hover](../../tokens/color-accent-hover.md)
- `uses_token` -> [--color-border-strong](../../tokens/color-border-strong.md)
- `uses_token` -> [--color-focus-ring](../../tokens/color-focus-ring.md)
- `uses_token` -> [--color-on-accent](../../tokens/color-on-accent.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--duration-state](../../tokens/duration-state.md)
- `uses_token` -> [--duration-tactile](../../tokens/duration-tactile.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--ease-playful](../../tokens/ease-playful.md)
- `uses_token` -> [--radius-sm](../../tokens/radius-sm.md)
- `uses_token` -> [--ring-offset-width](../../tokens/ring-offset-width.md)
- `uses_token` -> [--ring-width](../../tokens/ring-width.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--touch-min](../../tokens/touch-min.md)
- `uses_token` -> [--weight-regular](../../tokens/weight-regular.md)

## Structured Data

```json
{
  "kind": "primitive",
  "selectors": [
    ".ren-checkbox",
    ".ren-checkbox-control"
  ],
  "tokens": [
    "--body-size",
    "--color-accent",
    "--color-accent-hover",
    "--color-border-strong",
    "--color-focus-ring",
    "--color-on-accent",
    "--color-text",
    "--duration-state",
    "--duration-tactile",
    "--ease-enter",
    "--ease-playful",
    "--radius-sm",
    "--ring-offset-width",
    "--ring-width",
    "--space-2",
    "--touch-min",
    "--weight-regular"
  ],
  "hasScript": false,
  "hasDocsPage": true
}
```

## Source Content

# ren-checkbox Component Contract

Native checkbox styling with checked, indeterminate, disabled, and focus states.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-checkbox` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-checkbox` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Checkbox primitive behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this primitive.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The control toggles a boolean value (checked / unchecked) for a single option."
    - "The control belongs in a list where each option is independently selectable (multi-select)."
    - "You need an indeterminate / mixed state (e.g., parent of a tree, \"select all\" with partial children)."
    - "You need native form-submission semantics (name / value / required) tied to a real <input type=\"checkbox\">."
    - "The label sits next to a custom-styled box that participates in :checked / :hover / :focus-visible / :indeterminate / :disabled states."
  avoidWhen:
    - "The control is an on/off toggle with two visible states — use ren-switch."
    - "The control is one of several mutually-exclusive options — use ren-radio."
    - "You need a yes/no choice inside a tabular row without form submission — consider ren-switch."
    - "You need a tri-state with named states beyond on/off/mixed — design a custom segmented control."

canonicalImports:
  css:
    - "rends/components/primitives/ren-checkbox/ren-checkbox.css"
  notes:
    - "CSS-only primitive — no colocated JS exists. Indeterminate must be set in JS via input.indeterminate = true; the CSS reacts to :indeterminate."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Wrap each control in <label class=\"ren-checkbox\"> containing exactly one <input type=\"checkbox\"> and one <span class=\"ren-checkbox-control\"> sibling, in that order."
  - "Label text goes in a trailing <span> (or text node) after .ren-checkbox-control so :checked + .ren-checkbox-control adjacency works."
  - "Group related checkboxes inside a <fieldset> with a <legend> to provide a group accessible name."
  - "For indeterminate state, set input.indeterminate = true via JS; you cannot express it via an HTML attribute alone."
  - "Disabled inputs must use the real disabled attribute — the .ren-checkbox:has(input:disabled) selector relies on it."

forbiddenPatterns:
  - "Replacing <input type=\"checkbox\"> with a <div role=\"checkbox\"> — breaks form submission and native keyboard."
  - "Hiding the input with display:none — destroys keyboard focus; use the documented visually-hidden technique already in the CSS."
  - "Custom checkmark glyphs injected via JS or inline SVG — the ::after pseudo owns the checkmark."
  - "Mixing two label nodes per input (e.g., wrapping <label> plus a separate <label for>) — choose one."
  - "Communicating error / validity via color alone; pair with text or an inline error message."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-checkbox-border, --ren-checkbox-checked-bg, --ren-checkbox-checked-color, --ren-checkbox-duration, --ren-checkbox-easing, --ren-checkbox-gap, --ren-checkbox-radius, --ren-checkbox-size."
    - "Semantic tokens: --color-accent, --color-accent-hover, --color-on-accent, --color-border-strong, --color-text, --color-focus-ring."
    - "Layout / motion tokens: --space-2, --radius-sm, --touch-min, --ring-width, --ring-offset-width, --duration-state, --duration-tactile, --ease-enter, --ease-playful."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors for the checked fill, border, or checkmark."
    - "Raw transition values; use --ren-checkbox-duration / --ren-checkbox-easing or the --duration-* / --ease-* tokens."

accessibility:
  required:
    - "Always use a real <input type=\"checkbox\"> so Space toggles, Tab focuses, and form submission carries the value."
    - "Touch target stays ≥ var(--touch-min) via min-height on .ren-checkbox; do not shrink below that for touch contexts."
    - "Focus is visible on the .ren-checkbox-control via :focus-visible outline driven by --color-focus-ring and --ring-width."
    - "Each checkbox has an accessible name via its wrapping <label> text; never rely on placeholder or title alone."
    - "Group multiple related checkboxes inside <fieldset><legend> for a programmatic group name."
    - "Disabled state must use the native disabled attribute (not just aria-disabled) so the input is excluded from form submission and keyboard navigation."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-checkbox/ren-checkbox.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-checkbox">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-checkbox`
- `.ren-checkbox-control`

For toggle switches with on/off semantics, see the sibling primitive `ren-switch`.

## States And Attributes

- `:active`
- `:checked`
- `:disabled`
- `:focus-visible`
- `:hover`
- `:indeterminate`

## Public Token API

- `--ren-checkbox-border`
- `--ren-checkbox-checked-bg`
- `--ren-checkbox-checked-color`
- `--ren-checkbox-duration`
- `--ren-checkbox-easing`
- `--ren-checkbox-gap`
- `--ren-checkbox-radius`
- `--ren-checkbox-size`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-checkbox/ren-checkbox.css`
- `docs/components/ren-checkbox.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ============================================
   RenDS — Checkbox Component
   ============================================
   Custom-styled checkbox built on native
   <input type="checkbox">.

   Preserves native semantics and accessibility.
   Custom visuals via CSS only.

   Usage:
     <label class="ren-checkbox">
       <input type="checkbox">
       <span class="ren-checkbox-control"></span>
       <span>Accept terms</span>
     </label>

   For toggle switches, see ren-switch.
   ============================================ */

.ren-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--body-size);
  font-weight: var(--weight-regular);
  color: var(--color-text);
  user-select: none;
  /* Ensure touch target */
  min-height: var(--touch-min);
}

/* Hide native checkbox visually but keep accessible */
.ren-checkbox > input[type="checkbox"] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}

/* Custom checkbox visual */
.ren-checkbox-control {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;   /* 20px */
  height: 1.25rem;
  flex-shrink: 0;
  border: 2px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background-color: transparent;
  transition:
    background-color var(--duration-state) var(--ease-enter),
    border-color var(--duration-state) var(--ease-enter),
    transform var(--duration-tactile) var(--ease-playful);
}

/* Checkmark (hidden by default) */
.ren-checkbox-control::after {
  content: '';
  display: block;
  width: 0.45rem;
  height: 0.7rem;
  border: solid var(--color-on-accent);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) scale(0);
  transition: transform var(--duration-state) var(--ease-playful);
  margin-top: -2px;
}

/* ─── States ─── */

/* Checked */
.ren-checkbox > input:checked + .ren-checkbox-control {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
}

.ren-checkbox > input:checked + .ren-checkbox-control::after {
  transform: rotate(45deg) scale(1);
}

/* Hover */
.ren-checkbox:hover > .ren-checkbox-control {
  border-color: var(--color-accent);
}

.ren-checkbox:hover > input:checked + .ren-checkbox-control {
  background-color: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

/* Focus */
.ren-checkbox > input:focus-visible + .ren-checkbox-control {
  outline: var(--ring-width) solid var(--color-focus-ring);
  outline-offset: var(--ring-offset-width);
}

/* Active / Press */
.ren-checkbox:active > .ren-checkbox-control {
  transform: scale(0.9);
}

/* Disabled */
.ren-checkbox:has(input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Indeterminate */
.ren-checkbox > input:indeterminate + .ren-checkbox-control {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
}

.ren-checkbox > input:indeterminate + .ren-checkbox-control::after {
  border: none;
  width: 0.6rem;
  height: 2px;
  background-color: var(--color-on-accent);
  transform: none;
  margin: 0;
  border-radius: 1px;
}
