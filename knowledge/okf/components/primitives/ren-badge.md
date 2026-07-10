---
type: "RenDS Component"
title: ren-badge
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:primitive:ren-badge
sourcePath: components/primitives/ren-badge
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

# ren-badge

Source path: `components/primitives/ren-badge`

## Relationships

- `exposes_selector` -> [.ren-badge](../../selectors/ren-badge.md)
- `exposes_selector` -> [.ren-badge-danger](../../selectors/ren-badge-danger.md)
- `exposes_selector` -> [.ren-badge-dot](../../selectors/ren-badge-dot.md)
- `exposes_selector` -> [.ren-badge-dot-danger](../../selectors/ren-badge-dot-danger.md)
- `exposes_selector` -> [.ren-badge-dot-success](../../selectors/ren-badge-dot-success.md)
- `exposes_selector` -> [.ren-badge-dot-warning](../../selectors/ren-badge-dot-warning.md)
- `exposes_selector` -> [.ren-badge-info](../../selectors/ren-badge-info.md)
- `exposes_selector` -> [.ren-badge-outline](../../selectors/ren-badge-outline.md)
- `exposes_selector` -> [.ren-badge-primary](../../selectors/ren-badge-primary.md)
- `exposes_selector` -> [.ren-badge-secondary](../../selectors/ren-badge-secondary.md)
- `exposes_selector` -> [.ren-badge-success](../../selectors/ren-badge-success.md)
- `exposes_selector` -> [.ren-badge-warning](../../selectors/ren-badge-warning.md)
- `has_contract` -> [ren-badge component.md](../../foundation/contract-primitive-ren-badge.md)
- `has_css` -> [ren-badge.css](../../css/ren-badge-css.md)
- `has_docs_page` -> [ren-badge docs](../../docs/ren-badge-docs.md)
- `used_by_example` -> [app-sidebar.html](../../examples/app-sidebar-html.md) (ren-badge)
- `used_by_example` -> [dashboard-shell.html](../../examples/dashboard-shell-html.md) (ren-badge)
- `used_by_example` -> [data-table.html](../../examples/data-table-html.md) (ren-badge)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-danger](../../tokens/color-danger.md)
- `uses_token` -> [--color-danger-strong](../../tokens/color-danger-strong.md)
- `uses_token` -> [--color-danger-subtle](../../tokens/color-danger-subtle.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-fill-hover](../../tokens/color-fill-hover.md)
- `uses_token` -> [--color-info-strong](../../tokens/color-info-strong.md)
- `uses_token` -> [--color-info-subtle](../../tokens/color-info-subtle.md)
- `uses_token` -> [--color-on-accent](../../tokens/color-on-accent.md)
- `uses_token` -> [--color-success](../../tokens/color-success.md)
- `uses_token` -> [--color-success-strong](../../tokens/color-success-strong.md)
- `uses_token` -> [--color-success-subtle](../../tokens/color-success-subtle.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-secondary](../../tokens/color-text-secondary.md)
- `uses_token` -> [--color-warning](../../tokens/color-warning.md)
- `uses_token` -> [--color-warning-strong](../../tokens/color-warning-strong.md)
- `uses_token` -> [--color-warning-subtle](../../tokens/color-warning-subtle.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--stroke-1](../../tokens/stroke-1.md)
- `uses_token` -> [--text-xs](../../tokens/text-xs.md)
- `uses_token` -> [--weight-semibold](../../tokens/weight-semibold.md)

## Structured Data

```json
{
  "kind": "primitive",
  "selectors": [
    ".ren-badge",
    ".ren-badge-danger",
    ".ren-badge-dot",
    ".ren-badge-dot-danger",
    ".ren-badge-dot-success",
    ".ren-badge-dot-warning",
    ".ren-badge-info",
    ".ren-badge-outline",
    ".ren-badge-primary",
    ".ren-badge-secondary",
    ".ren-badge-success",
    ".ren-badge-warning"
  ],
  "tokens": [
    "--color-accent",
    "--color-border",
    "--color-danger",
    "--color-danger-strong",
    "--color-danger-subtle",
    "--color-fill",
    "--color-fill-hover",
    "--color-info-strong",
    "--color-info-subtle",
    "--color-on-accent",
    "--color-success",
    "--color-success-strong",
    "--color-success-subtle",
    "--color-text",
    "--color-text-secondary",
    "--color-warning",
    "--color-warning-strong",
    "--color-warning-subtle",
    "--radius-full",
    "--space-1",
    "--stroke-1",
    "--text-xs",
    "--weight-semibold"
  ],
  "hasScript": false,
  "hasDocsPage": true
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


/* ============================================
   RenDS — Badge
   ============================================
   Small inline label for status, counts, or tags.
   CSS-only, no JS needed.

   Sibling primitives that used to live here are
   now in their own folders:
     - ren-separator
     - ren-avatar
     - ren-spinner
     - ren-skeleton
     - ren-kbd

   Usage:
     <span class="ren-badge">3</span>
     <span class="ren-badge ren-badge-success">Active</span>
     <span class="ren-badge-dot ren-badge-dot-danger"></span>
   ============================================ */

.ren-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0.15em 0.55em;
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  line-height: 1.5;
  white-space: nowrap;
  border-radius: var(--radius-full);
  /* Default: neutral */
  background-color: var(--color-fill);
  color: var(--color-text-secondary);
}

/* ─── Variants ─── */
.ren-badge-primary {
  background-color: var(--color-accent);
  color: var(--color-on-accent);
}

.ren-badge-secondary {
  background-color: var(--color-fill-hover);
  color: var(--color-text);
}

.ren-badge-success {
  background-color: var(--color-success-subtle);
  color: var(--color-success-strong);
}

.ren-badge-warning {
  background-color: var(--color-warning-subtle);
  color: var(--color-warning-strong);
}

.ren-badge-danger {
  background-color: var(--color-danger-subtle);
  color: var(--color-danger-strong);
}

.ren-badge-info {
  background-color: var(--color-info-subtle);
  color: var(--color-info-strong);
}

/* Outline variant */
.ren-badge-outline {
  background-color: transparent;
  border: var(--stroke-1) solid var(--color-border);
  color: var(--color-text-secondary);
}

/* ─── Dot indicator (no text) ─── */
.ren-badge-dot {
  width: 0.5rem;
  height: 0.5rem;
  padding: 0;
  border-radius: var(--radius-full);
  background-color: var(--color-accent);
}

.ren-badge-dot-success { background-color: var(--color-success); }
.ren-badge-dot-warning { background-color: var(--color-warning); }
.ren-badge-dot-danger  { background-color: var(--color-danger); }
