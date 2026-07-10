---
type: "RenDS Contract"
title: "ren-radio component.md"
description: "RenDS Contract generated from the RenDS knowledge graph."
id: contract:primitive:ren-radio
sourcePath: components/primitives/ren-radio/component.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - contract
  - ren10
  - rends
---

# ren-radio component.md

Source path: `components/primitives/ren-radio/component.md`

## Relationships

_No outgoing relationships._

## Structured Data

```json
{
  "kind": "primitive"
}
```

## Source Content

# ren-radio Component Contract

Native radio group styling with optional custom element keyboard enhancement.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-radio` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-radio` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Radio primitive behavior or visual role.
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
    - "The user must pick exactly one option from 2-7 mutually-exclusive choices."
    - "All choices should be visible at once (no overflow / collapse)."
    - "You need a custom-styled radio dot built on native <input type=\"radio\"> with preserved semantics."
    - "You need keyboard arrow navigation + roving tabindex via <ren-radio-group>."
    - "You need a vertical (.ren-radio-group) or horizontal (.ren-radio-group-horizontal) layout."
  avoidWhen:
    - "There are more than ~7 options or the list overflows — use a ren-select / combobox."
    - "Multiple selections are allowed — use ren-checkbox."
    - "The choice is binary on/off — use ren-switch or ren-checkbox."
    - "The selection drives navigation or filters with immediate side effects — consider ren-segmented or tabs."

canonicalImports:
  css:
    - "rends/components/primitives/ren-radio/ren-radio.css"
  js:
    - "rends/components/primitives/ren-radio/ren-radio.js"
  notes:
    - "JS is only required when using <ren-radio-group> for arrow-key roving tabindex; a plain <fieldset role=\"radiogroup\"> with .ren-radio labels works CSS-only with native browser radio behavior."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Each option is a <label class=\"ren-radio\"> containing a real <input type=\"radio\" name=\"<group>\">, a <span class=\"ren-radio-control\"></span>, and the visible label text — in that DOM order so the :checked + .ren-radio-control adjacent selector works."
  - "All radios in one group share the same name attribute so the browser enforces single-selection."
  - "Wrap the group in <ren-radio-group> (auto-sets role=\"radiogroup\") or in a <fieldset> with <legend> + role=\"radiogroup\" when no JS is desired."
  - "Use <ren-radio-group orientation=\"horizontal\"> to switch to row layout; the JS swaps the class to .ren-radio-group-horizontal."
  - "Never set tabindex manually on inputs inside <ren-radio-group> — the roving-tabindex utility manages it."

forbiddenPatterns:
  - "Replacing <input type=\"radio\"> with a styled <div role=\"radio\"> — loses form submission + native a11y."
  - "Hiding the input with display: none (breaks focus) — use the built-in visually-hidden clip-path pattern."
  - "Two radios with different name attributes in the same group (allows multi-selection)."
  - "Using .ren-radio for an icon-only toggle without a visible text label or aria-label."
  - "Animating the dot via custom keyframes that bypass --duration-state / --ease-playful."

tokenPolicy:
  allowed:
    - "Semantic tokens consumed internally: --color-text, --color-border-strong, --color-accent, --color-accent-hover, --color-on-accent, --color-focus-ring."
    - "Layout / motion tokens: --space-2, --space-3, --space-4, --radius-full, --body-size, --weight-regular, --touch-min, --ring-width, --ring-offset-width, --duration-state, --duration-tactile, --ease-enter, --ease-playful."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Custom radio sizes that fall below the 20px control + 44px label touch target."

accessibility:
  required:
    - "Real <input type=\"radio\"> elements so the browser handles single-selection, form submission, and assistive-tech announcement."
    - ".ren-radio label has min-height: var(--touch-min) so the whole row is a 44px touch target."
    - "Visible :focus-visible ring on .ren-radio-control driven by --color-focus-ring (the native input is visually hidden but focus is delegated to its sibling)."
    - "<ren-radio-group> sets role=\"radiogroup\" and supports arrow-key navigation (Up/Down vertical, Left/Right horizontal) with loop; selection follows focus."
    - "Disabled options use <input disabled> (handled via :has(input:disabled)) — do not rely on opacity alone."
    - "Provide a group label via <legend> inside <fieldset> or aria-label / aria-labelledby on <ren-radio-group>."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-radio/ren-radio.css">
<script type="module" src="rends/components/primitives/ren-radio/ren-radio.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-radio">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-radio`
- `.ren-radio-control`
- `.ren-radio-group`
- `.ren-radio-group-horizontal`

## States And Attributes

- `:active`
- `:checked`
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

- `components/primitives/ren-radio/ren-radio.css`
- `components/primitives/ren-radio/ren-radio.js`
- `docs/components/ren-radio.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
