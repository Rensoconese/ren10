---
type: "RenDS Contract"
title: "ren-banner component.md"
description: "RenDS Contract generated from the RenDS knowledge graph."
id: contract:primitive:ren-banner
sourcePath: components/primitives/ren-banner/component.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - contract
  - ren10
  - rends
---

# ren-banner component.md

Source path: `components/primitives/ren-banner/component.md`

## Relationships

_No outgoing relationships._

## Structured Data

```json
{
  "kind": "primitive"
}
```

## Source Content

# ren-banner Component Contract

Persistent inline message for status, warning, or alert content.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-banner` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-banner` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Banner primitive behavior or visual role.
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
    - "You need a persistent inline message that sits in page flow (success / warning / danger / info / neutral)."
    - "The message has structured content: icon + title + message + optional actions or dismiss button."
    - "You need a page-top full-bleed announcement via .ren-banner-full (no border-radius, no side borders)."
    - "You need a compact single-line variant for dense surfaces (.ren-banner-compact)."
    - "The banner should remain on screen until user dismisses it or the underlying state changes."
  avoidWhen:
    - "The message is transient and overlay-style — use ren-toast."
    - "The message blocks the entire flow and requires confirmation — use ren-dialog (alert)."
    - "You only need a small inline status label — use ren-badge."
    - "The message is form validation tied to a single field — use ren-field's error slot."

canonicalImports:
  css:
    - "rends/components/primitives/ren-banner/ren-banner.css"
  notes:
    - "CSS-only primitive — no colocated JS exists. Dismiss button is plain HTML; if you wire dismissal, set data-dismissing to trigger the documented animation."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Root must carry role=\"status\" (info / success / neutral) or role=\"alert\" (danger / urgent warning) so AT announces correctly."
  - "Use the documented children: <span class=\"ren-banner-icon\">, <div class=\"ren-banner-content\"> with <strong class=\"ren-banner-title\"> + <p class=\"ren-banner-message\">."
  - "Dismiss button is <button class=\"ren-banner-dismiss\" aria-label=\"Dismiss\"> — never a <div> with click handler."
  - "Wrap any banner action buttons in <div class=\"ren-banner-actions\"> placed inside .ren-banner-content."
  - "To animate dismissal, set [data-dismissing] on the root; do not animate via inline styles."

forbiddenPatterns:
  - "Using a banner as a transient toast that auto-dismisses without user action — wrong semantics."
  - "Hardcoded border / background colors per severity — use the .ren-banner-{success | warning | danger | neutral} variant."
  - "Stacking two severity variants on the same banner (e.g., .ren-banner-success.ren-banner-danger)."
  - "Dismiss button without aria-label or visible text — the ✕ glyph alone is not an accessible name."
  - "Communicating severity with icon color only; the role attribute and surrounding text must convey severity to AT."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-banner-bg, --ren-banner-border-color, --ren-banner-border-width, --ren-banner-color, --ren-banner-gap, --ren-banner-icon-size, --ren-banner-padding, --ren-banner-radius."
    - "Semantic tokens: --color-info-subtle, --color-success-subtle, --color-warning-subtle, --color-danger-subtle, --color-surface-sunken, --color-border, --color-text, --color-text-secondary, --color-text-muted, --color-focus-ring."
    - "Motion tokens: --duration-tactile, --duration-state, --ease-enter."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors or hardcoded rgba border tints — use color-mix on semantic tokens as the CSS already does."
    - "Inline transition / animation values; use --duration-* / --ease-* tokens."

accessibility:
  required:
    - "Set role=\"alert\" for danger / urgent warning banners and role=\"status\" for non-urgent info / success / neutral."
    - "Dismiss button must have aria-label (or visible text) and a visible :focus-visible ring driven by --color-focus-ring."
    - ".ren-banner-title renders as a real heading-like element (<strong>); when stacked among <h*> content, follow document outline."
    - "Respect prefers-reduced-motion: the [data-dismissing] animation collapses to display:none per the CSS — do not re-introduce motion."
    - "Banner content must not rely on color alone; the icon + title + message convey severity together."
    - "Action buttons inside .ren-banner-actions must be real <button> elements with their own keyboard focus order."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-banner/ren-banner.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-banner">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-banner`
- `.ren-banner-actions`
- `.ren-banner-compact`
- `.ren-banner-content`
- `.ren-banner-danger`
- `.ren-banner-dismiss`
- `.ren-banner-full`
- `.ren-banner-icon`
- `.ren-banner-message`
- `.ren-banner-neutral`
- `.ren-banner-success`
- `.ren-banner-title`
- `.ren-banner-warning`

## States And Attributes

- `[data-dismissing]`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-banner-bg`
- `--ren-banner-border-color`
- `--ren-banner-border-width`
- `--ren-banner-color`
- `--ren-banner-gap`
- `--ren-banner-icon-size`
- `--ren-banner-padding`
- `--ren-banner-radius`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-banner/ren-banner.css`
- `docs/components/ren-banner.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
