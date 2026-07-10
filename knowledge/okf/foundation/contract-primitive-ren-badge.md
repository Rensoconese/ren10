---
type: "RenDS Contract"
title: "ren-badge component.md"
description: "RenDS Contract generated from the RenDS knowledge graph."
id: contract:primitive:ren-badge
sourcePath: components/primitives/ren-badge/component.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - contract
  - ren10
  - rends
---

# ren-badge component.md

Source path: `components/primitives/ren-badge/component.md`

## Relationships

_No outgoing relationships._

## Structured Data

```json
{
  "kind": "primitive"
}
```

## Source Content

# ren-badge Component Contract

Small status, category, count, or state label.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-badge` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-badge` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Badge primitive behavior or visual role.
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
    - "You need a small inline label for status (success / warning / danger / info), category, count, or tag."
    - "The label is decorative or status-only; it does not navigate or trigger a side effect."
    - "You need a presence dot without text (.ren-badge-dot) — color-coded indicator."
    - "You need a pill-shaped (radius-full) label sized in em so it scales with surrounding text."
    - "The label must sit inline inside a heading, list item, button, or table cell."
  avoidWhen:
    - "The label is a removable chip with an X button — use ren-tag."
    - "The label is a persistent inline message with title/icon/dismiss — use ren-banner."
    - "The label triggers a click action — use ren-btn (or .ren-btn-sm) instead."
    - "You need an avatar / identity surface — use ren-avatar."

canonicalImports:
  css:
    - "rends/components/primitives/ren-badge/ren-badge.css"
  notes:
    - "CSS-only primitive — no colocated JS exists. Do not import a ren-badge.js."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Use <span class=\"ren-badge\"> (inline) — not <div> — so badges flow with surrounding text."
  - "Combine .ren-badge with a single variant modifier (.ren-badge-primary | -secondary | -success | -warning | -danger | -info | -outline); do not stack two variants."
  - "Status badges that convey meaning must include text (or visually-hidden text) — color alone is not sufficient."
  - "Dot indicators use <span class=\"ren-badge-dot ren-badge-dot-success\"> (empty content) and require a sibling text label."
  - "Numeric count badges should set aria-label (e.g., aria-label=\"3 unread\") when the number is ambiguous without context."

forbiddenPatterns:
  - "<button class=\"ren-badge\"> — badges are not interactive; use ren-btn for actions."
  - "Hardcoded background / color overrides via inline style — override --ren-badge-bg / --ren-badge-color instead."
  - "Using .ren-badge as a removable chip with a close button — that is ren-tag's contract."
  - "Color-only status (.ren-badge-danger with no text and no aria-label)."
  - "Setting font-size in px on .ren-badge — the em-based padding will desynchronize from the text scale."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-badge-bg, --ren-badge-color, --ren-badge-font-size, --ren-badge-font-weight, --ren-badge-height, --ren-badge-padding-x, --ren-badge-radius."
    - "Semantic tokens: --color-fill, --color-fill-hover, --color-accent, --color-on-accent, --color-success-subtle / -strong, --color-warning-subtle / -strong, --color-danger-subtle / -strong, --color-info-subtle / -strong, --color-border."
    - "Layout tokens: --space-1, --radius-full, --stroke-1, --text-xs, --weight-semibold."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors for badge background, text, or dot color."
    - "Reaching past the semantic -subtle / -strong pair into raw success / warning / danger primitives."

accessibility:
  required:
    - "Badges that communicate status must not rely on color alone — include text or visually-hidden labels."
    - "Numeric badges need aria-label when the meaning is ambiguous (e.g., \"3 unread messages\")."
    - "Decorative dot badges (.ren-badge-dot) should be paired with adjacent text content — not used alone."
    - "Do not place a badge inside a focusable element without ensuring the badge itself is not announced twice; rely on the parent's accessible name."
    - "Maintain WCAG AA contrast: variants pair -subtle background with -strong text by design; do not invert."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-badge/ren-badge.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-badge">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-badge`
- `.ren-badge-danger`
- `.ren-badge-dot`
- `.ren-badge-dot-danger`
- `.ren-badge-dot-success`
- `.ren-badge-dot-warning`
- `.ren-badge-info`
- `.ren-badge-outline`
- `.ren-badge-primary`
- `.ren-badge-secondary`
- `.ren-badge-success`
- `.ren-badge-warning`

## States And Attributes

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

## Public Token API

- `--ren-badge-bg`
- `--ren-badge-color`
- `--ren-badge-font-size`
- `--ren-badge-font-weight`
- `--ren-badge-height`
- `--ren-badge-padding-x`
- `--ren-badge-radius`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-badge/ren-badge.css`
- `docs/components/ren-badge.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
