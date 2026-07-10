---
type: "RenDS Component"
title: ren-collapsible
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-collapsible
sourcePath: components/composites/ren-collapsible
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

# ren-collapsible

Source path: `components/composites/ren-collapsible`

## Relationships

- `exposes_selector` -> [.ren-collapsible](../../selectors/ren-collapsible.md)
- `exposes_selector` -> [.ren-collapsible-content](../../selectors/ren-collapsible-content.md)
- `exposes_selector` -> [.ren-collapsible-ghost](../../selectors/ren-collapsible-ghost.md)
- `has_contract` -> [ren-collapsible component.md](../../foundation/contract-composite-ren-collapsible.md)
- `has_css` -> [ren-collapsible.css](../../css/ren-collapsible-css.md)
- `has_docs_page` -> [ren-collapsible docs](../../docs/ren-collapsible-docs.md)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-focus-ring](../../tokens/color-focus-ring.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--color-text-secondary](../../tokens/color-text-secondary.md)
- `uses_token` -> [--duration-enter](../../tokens/duration-enter.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--leading-normal](../../tokens/leading-normal.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--ring-width](../../tokens/ring-width.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--stroke-1](../../tokens/stroke-1.md)
- `uses_token` -> [--touch-min](../../tokens/touch-min.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)
- `uses_token` -> [--weight-medium](../../tokens/weight-medium.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-collapsible",
    ".ren-collapsible-content",
    ".ren-collapsible-ghost"
  ],
  "tokens": [
    "--body-size",
    "--color-border",
    "--color-fill",
    "--color-focus-ring",
    "--color-text",
    "--color-text-muted",
    "--color-text-secondary",
    "--duration-enter",
    "--ease-enter",
    "--leading-normal",
    "--radius-md",
    "--ring-width",
    "--space-2",
    "--space-3",
    "--space-4",
    "--stroke-1",
    "--touch-min",
    "--transition-tactile",
    "--weight-medium"
  ],
  "hasScript": false,
  "hasDocsPage": true
}
```

## Source Content

# ren-collapsible Component Contract

Expandable/collapsible region with explicit state.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-collapsible` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-collapsible` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Collapsible composite behavior or visual role.
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
    - "A single, standalone expandable section is needed (no sibling exclusivity)."
    - "You want a zero-JS disclosure based on native <details>/<summary>."
    - "Initial state must be declarable in HTML via the [open] attribute."
    - "A subtle ghost variant (no border, flush) is desired."
    - "The content area animates height via CSS interpolate-size (no JS measurement)."
  avoidWhen:
    - "Multiple grouped disclosures share chrome — use ren-accordion (handles exclusive mode)."
    - "The disclosure floats above content as a popover — use ren-popover."
    - "The trigger must control a remote panel — use a button + aria-controls on a custom panel."
    - "The disclosure is a navigation reveal — use ren-sidebar / ren-menu."

canonicalImports:
  css:
    - "rends/components/composites/ren-collapsible/ren-collapsible.css"
  notes:
    - "If the page already imports rends/components/index.css, do not import the CSS again."
    - "No colocated JS — open / close uses the native <details> toggle event; consumers can listen for 'toggle' if needed."
    - "Add interpolate-size support polyfill only if you require height animation on legacy browsers."

requiredMarkup:
  - "Root element is <details class=\"ren-collapsible\">; do not wrap a <div> with a custom click handler."
  - "Trigger is the first child <summary>; content lives in a sibling <div class=\"ren-collapsible-content\">."
  - "Use the [open] attribute to render expanded on first paint (do not set hidden / display via style)."
  - "Add .ren-collapsible-ghost to the host for the borderless variant; do not invent additional variant classes."
  - "Keep the chevron decorative — it is rendered via the summary::after pseudo-element."

forbiddenPatterns:
  - "<div class=\"ren-collapsible\"><div role=\"button\">…</div></div> — must be a real <details>/<summary>."
  - "Custom triangle / chevron inside the summary text content; rely on summary::after rotation."
  - "Animating with JavaScript-driven max-height; CSS interpolate-size handles auto-to-zero transitions."
  - "Removing the focus ring (outline: none) without restoring :focus-visible on summary."
  - "Calling .open = true on a detached <details> outside the DOM — bind it inside .ren-collapsible first."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-collapse-bg, --ren-collapse-border, --ren-collapse-duration, --ren-collapse-easing, --ren-collapse-padding, --ren-collapse-radius, --ren-collapse-trigger-font, --ren-collapse-trigger-weight."
    - "Semantic tokens: --color-border, --color-text, --color-text-muted, --color-text-secondary, --color-fill, --color-focus-ring."
    - "Layout / motion tokens: --space-*, --radius-md, --stroke-1, --touch-min, --ring-width, --duration-enter, --ease-enter, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Raw transition values; use --duration-enter / --ease-enter or --ren-collapse-duration / --ren-collapse-easing."

accessibility:
  required:
    - "Use the real <details>/<summary> pair so the browser exposes the native disclosure pattern and supports Enter / Space toggle."
    - "Touch target on the summary stays ≥ var(--touch-min) (44px) — do not shrink below this on touch surfaces."
    - "Visible :focus-visible ring on summary uses --color-focus-ring and --ring-width; do not remove it."
    - "Chevron is decorative (::after pseudo) — never expose its rotation to AT via aria-label."
    - "Communicate open state through the [open] attribute (native semantics) — never rely on color alone."
    - "Animations respect prefers-reduced-motion (chevron rotation transition is disabled)."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-collapsible/ren-collapsible.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-collapsible">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-collapsible`
- `.ren-collapsible-content`
- `.ren-collapsible-ghost`

## States And Attributes

- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-collapse-bg`
- `--ren-collapse-border`
- `--ren-collapse-duration`
- `--ren-collapse-easing`
- `--ren-collapse-padding`
- `--ren-collapse-radius`
- `--ren-collapse-trigger-font`
- `--ren-collapse-trigger-weight`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/composites/ren-collapsible/ren-collapsible.css`
- `docs/components/ren-collapsible.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ============================================
   RenDS — Collapsible Component
   ============================================
   Expand/collapse content panel.
   Uses native <details>/<summary> — ZERO JS.

   CSS-only animation with interpolate-size.

   Different from Accordion: standalone, no group
   exclusivity. For single expand/collapse sections.

   Usage:
     <details class="ren-collapsible">
       <summary>Click to expand</summary>
       <div class="ren-collapsible-content">
         Hidden content here
       </div>
     </details>

   Open by default:
     <details class="ren-collapsible" open>
       ...
     </details>
   ============================================ */

/* Enable height animation on details */
.ren-collapsible {
  interpolate-size: allow-keywords;
  border: var(--stroke-1) solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

/* Summary (trigger) */
.ren-collapsible > summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  min-height: var(--touch-min);
  padding: var(--space-3) var(--space-4);
  font-size: var(--body-size);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
  list-style: none; /* Remove default marker */
  transition: var(--transition-tactile);
}

/* Remove default marker in WebKit */
.ren-collapsible > summary::-webkit-details-marker {
  display: none;
}

/* Custom chevron */
.ren-collapsible > summary::after {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border: solid var(--color-text-muted);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  flex-shrink: 0;
  transition: transform var(--duration-enter) var(--ease-enter);
}

.ren-collapsible[open] > summary::after {
  transform: rotate(-135deg);
}

.ren-collapsible > summary:hover {
  background-color: var(--color-fill);
}

.ren-collapsible > summary:focus-visible {
  outline: var(--ring-width) solid var(--color-focus-ring);
  outline-offset: -2px;
}

/* Content area */
.ren-collapsible-content {
  padding: 0 var(--space-4) var(--space-4);
  font-size: var(--body-size);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

/* ─── Ghost variant (no border) ─── */
.ren-collapsible-ghost {
  border: none;
}

.ren-collapsible-ghost > summary {
  padding-inline: 0;
}

.ren-collapsible-ghost .ren-collapsible-content {
  padding-inline: 0;
}

/* ─── Animate open/close ─── */
/* Uses CSS content-visibility for animation */
.ren-collapsible .ren-collapsible-content {
  content-visibility: visible;
}

/* Reduced motion — no animation */
@media (prefers-reduced-motion: reduce) {
  .ren-collapsible > summary::after {
    transition: none;
  }
}
