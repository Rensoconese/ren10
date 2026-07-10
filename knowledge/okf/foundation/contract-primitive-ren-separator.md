---
type: "RenDS Contract"
title: "ren-separator component.md"
description: "RenDS Contract generated from the RenDS knowledge graph."
id: contract:primitive:ren-separator
sourcePath: components/primitives/ren-separator/component.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - contract
  - ren10
  - rends
---

# ren-separator component.md

Source path: `components/primitives/ren-separator/component.md`

## Relationships

_No outgoing relationships._

## Structured Data

```json
{
  "kind": "primitive"
}
```

## Source Content

# ren-separator Component Contract

Visual or semantic divider between content groups.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-separator` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-separator` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Separator primitive behavior or visual role.
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
    - "You need a horizontal divider between content groups inside a flow (use <hr class=\"ren-separator\">)."
    - "You need a vertical divider inside a flex/inline row (use .ren-separator-vertical)."
    - "You need a labeled divider (e.g. \"or\" between auth options) using .ren-separator-label."
    - "The divider is purely visual and does not need any interactivity or focus."
    - "You want spacing tokens (--space-3 / --space-4) baked into the divider's margin instead of ad-hoc CSS."
  avoidWhen:
    - "You need a sectioning landmark — use semantic <section> / <aside> with headings instead."
    - "The divider should also collapse the sidebar / scroll region — use ren-sidebar / a layout primitive."
    - "You want a decorative border around a card — use the card's --color-border, not a separator."

canonicalImports:
  css:
    - "rends/components/primitives/ren-separator/ren-separator.css"
  notes:
    - "CSS-only primitive. There is no colocated JS — do not import one."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Horizontal separators must be a real <hr class=\"ren-separator\"> element so AT exposes the implicit separator role."
  - "Vertical separators use a non-<hr> element (<div class=\"ren-separator-vertical\">) inside a flex row so align-self: stretch can take effect."
  - "Labeled separators use a flex container: <div class=\"ren-separator-label\">or</div>; the ::before / ::after pseudo-elements draw the lines automatically — do not add extra <span> rules."
  - "Do not nest interactive content inside a separator; it is decorative chrome only."

forbiddenPatterns:
  - "<div class=\"ren-separator\"> for horizontal dividers — use the native <hr> so screen readers announce the separator."
  - "border-top: 1px solid #... or border-bottom: 1px solid #... in consumer code; use .ren-separator and let --color-separator drive the color."
  - "Inline margin overrides (style=\"margin: 0\") to tighten spacing — set --space-* tokens at a parent scope instead."
  - "Using .ren-separator-vertical outside a flex / grid container that gives it a measurable cross-axis height."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-separator-color, --ren-separator-margin, --ren-separator-width."
    - "Semantic tokens consumed internally: --color-separator, --color-text-muted, --space-3, --space-4, --caption-size."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgb / named colors for the separator line."
    - "Raw pixel widths in inline styles; use --ren-separator-width."

accessibility:
  required:
    - "Horizontal separators are <hr> so the implicit role=\"separator\" is exposed to assistive technology."
    - "Purely decorative vertical separators may use aria-hidden=\"true\" if they add no information beyond a sibling label."
    - "Labels on .ren-separator-label must remain real text (not background-image) so they are announced and translatable."
    - "Color contrast is not required for decorative separators, but the line must remain visible in both light and dark themes via --color-separator."
    - "Do not add focusable behavior; separators are not interactive."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-separator/ren-separator.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-separator">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-separator`
- `.ren-separator-horizontal`
- `.ren-separator-label`
- `.ren-separator-vertical`

## States And Attributes

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

## Public Token API

- `--ren-separator-color`
- `--ren-separator-margin`
- `--ren-separator-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-separator/ren-separator.css`
- `docs/components/ren-separator.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
