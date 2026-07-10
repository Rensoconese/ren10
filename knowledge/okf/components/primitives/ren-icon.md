---
type: "RenDS Component"
title: ren-icon
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:primitive:ren-icon
sourcePath: components/primitives/ren-icon
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

# ren-icon

Source path: `components/primitives/ren-icon`

## Relationships

- `exposes_selector` -> [.ren-icon](../../selectors/ren-icon.md)
- `exposes_selector` -> [.ren-icon-2xl](../../selectors/ren-icon-2xl.md)
- `exposes_selector` -> [.ren-icon-danger](../../selectors/ren-icon-danger.md)
- `exposes_selector` -> [.ren-icon-lg](../../selectors/ren-icon-lg.md)
- `exposes_selector` -> [.ren-icon-md](../../selectors/ren-icon-md.md)
- `exposes_selector` -> [.ren-icon-muted](../../selectors/ren-icon-muted.md)
- `exposes_selector` -> [.ren-icon-primary](../../selectors/ren-icon-primary.md)
- `exposes_selector` -> [.ren-icon-sm](../../selectors/ren-icon-sm.md)
- `exposes_selector` -> [.ren-icon-spin](../../selectors/ren-icon-spin.md)
- `exposes_selector` -> [.ren-icon-success](../../selectors/ren-icon-success.md)
- `exposes_selector` -> [.ren-icon-warning](../../selectors/ren-icon-warning.md)
- `exposes_selector` -> [.ren-icon-xl](../../selectors/ren-icon-xl.md)
- `exposes_selector` -> [.ren-icon-xs](../../selectors/ren-icon-xs.md)
- `has_contract` -> [ren-icon component.md](../../foundation/contract-primitive-ren-icon.md)
- `has_css` -> [ren-icon.css](../../css/ren-icon-css.md)
- `has_docs_page` -> [ren-icon docs](../../docs/ren-icon-docs.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-danger](../../tokens/color-danger.md)
- `uses_token` -> [--color-success](../../tokens/color-success.md)
- `uses_token` -> [--color-text-secondary](../../tokens/color-text-secondary.md)
- `uses_token` -> [--color-warning](../../tokens/color-warning.md)
- `uses_token` -> [--duration-loop](../../tokens/duration-loop.md)
- `uses_token` -> [--ease-loop](../../tokens/ease-loop.md)

## Structured Data

```json
{
  "kind": "primitive",
  "selectors": [
    ".ren-icon",
    ".ren-icon-2xl",
    ".ren-icon-danger",
    ".ren-icon-lg",
    ".ren-icon-md",
    ".ren-icon-muted",
    ".ren-icon-primary",
    ".ren-icon-sm",
    ".ren-icon-spin",
    ".ren-icon-success",
    ".ren-icon-warning",
    ".ren-icon-xl",
    ".ren-icon-xs"
  ],
  "tokens": [
    "--color-accent",
    "--color-danger",
    "--color-success",
    "--color-text-secondary",
    "--color-warning",
    "--duration-loop",
    "--ease-loop"
  ],
  "hasScript": false,
  "hasDocsPage": true
}
```

## Source Content

# ren-icon Component Contract

Icon sizing, color, and motion utility for SVG icons.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-icon` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-icon` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Icon primitive behavior or visual role.
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
    - "You need a consistent sizing wrapper (xs/sm/md/lg/xl/2xl) around an inline SVG."
    - "You need an icon that inherits the parent text color via currentColor."
    - "You need a semantic color tint (primary, success, warning, danger, muted) on a glyph."
    - "You need a spinning loading glyph that respects prefers-reduced-motion."
    - "You need an icon slot inside ren-button, ren-link, ren-badge, or other primitives."
  avoidWhen:
    - "The graphic is decorative and inline — a raw <svg aria-hidden=\"true\"> is enough."
    - "The element is a clickable control — wrap the icon inside ren-button (ren-btn-icon) instead."
    - "You need a multi-color illustration or logo — use a plain <svg> with its own viewport."

canonicalImports:
  css:
    - "rends/components/primitives/ren-icon/ren-icon.css"
  notes:
    - "CSS-only primitive; no JavaScript file exists for ren-icon."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Always wrap a real <svg> (or icon-font glyph) inside <span class=\"ren-icon\"> — never style the SVG directly with .ren-icon."
  - "Decorative icons inside text or buttons must set aria-hidden=\"true\" on the SVG (the wrapper has no role)."
  - "Standalone meaningful icons must have an accessible name on the parent control (aria-label) or visually-hidden text — the .ren-icon wrapper itself does not carry a name."
  - "Pick exactly one size variant (.ren-icon-xs through .ren-icon-2xl); the base .ren-icon defaults to md (20px)."
  - ".ren-icon-spin must be paired with role=\"status\" or aria-busy on a parent for screen reader users."

forbiddenPatterns:
  - "Setting width/height inline on <svg> instead of using the .ren-icon-* size variants."
  - "Hardcoding fill=\"#...\" on the inner SVG — drive color via currentColor and the .ren-icon-* color variants."
  - "Using .ren-icon-danger to convey state without an accompanying text label (state by color alone)."
  - "Animating the spin with a custom CSS animation instead of .ren-icon-spin (loses reduced-motion guard)."
  - "Using .ren-icon as a clickable target — wrap with a real <button> or use ren-button instead."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-icon-color, --ren-icon-fill, --ren-icon-size."
    - "Semantic tokens consumed internally: --color-accent, --color-success, --color-warning, --color-danger, --color-text-secondary."
    - "Motion tokens: --duration-loop, --ease-loop (for .ren-icon-spin)."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex or named colors on the SVG or wrapper."
    - "Raw animation durations; rely on --duration-loop / --ease-loop via .ren-icon-spin."

accessibility:
  required:
    - "Decorative icons set aria-hidden=\"true\" on the SVG element."
    - "Meaningful icons get their accessible name from the surrounding control (button aria-label, link text, etc.) — never from the .ren-icon wrapper alone."
    - "Color variants (.ren-icon-success, .ren-icon-danger) must be paired with text or aria-label so meaning is not color-only."
    - ".ren-icon-spin animation honors prefers-reduced-motion: reduce automatically."
    - "Do not turn .ren-icon into an interactive target; it has no focus styles or hit-area guarantees."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-icon/ren-icon.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-icon">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-icon`
- `.ren-icon-2xl`
- `.ren-icon-danger`
- `.ren-icon-lg`
- `.ren-icon-md`
- `.ren-icon-muted`
- `.ren-icon-primary`
- `.ren-icon-sm`
- `.ren-icon-spin`
- `.ren-icon-success`
- `.ren-icon-warning`
- `.ren-icon-xl`
- `.ren-icon-xs`

## States And Attributes

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

## Public Token API

- `--ren-icon-color`
- `--ren-icon-fill`
- `--ren-icon-size`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-icon/ren-icon.css`
- `docs/components/ren-icon.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ============================================
   RenDS — Icon Component
   ============================================
   Icon sizing, coloring, and animation utilities.
   Works with any SVG or icon font.

   The base class provides inline layout,
   color inheritance, and shrink-to-fit.

   Usage:
     <span class="ren-icon ren-icon-md">
       <svg>...</svg>
     </span>

     <button>
       <span class="ren-icon ren-icon-lg ren-icon-success">
         <svg>...</svg>
       </span>
       Export
     </button>

     <span class="ren-icon ren-icon-spin ren-icon-xl">
       <svg>...</svg>
     </span>
   ============================================ */

/* ═══════════════════════════════
   ICON BASE
   ═══════════════════════════════ */

.ren-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.25rem;   /* 20px — default md */
  height: 1.25rem;
  color: currentColor;
}

.ren-icon > svg {
  width: 100%;
  height: 100%;
  display: block;
}

/* ─── Sizes ─── */

.ren-icon-xs {
  width: 0.75rem;   /* 12px */
  height: 0.75rem;
}

.ren-icon-sm {
  width: 1rem;      /* 16px */
  height: 1rem;
}

.ren-icon-md {
  width: 1.25rem;   /* 20px */
  height: 1.25rem;
}

.ren-icon-lg {
  width: 1.5rem;    /* 24px */
  height: 1.5rem;
}

.ren-icon-xl {
  width: 2rem;      /* 32px */
  height: 2rem;
}

.ren-icon-2xl {
  width: 3rem;      /* 48px */
  height: 3rem;
}

/* ─── Color Variants ─── */

.ren-icon-primary {
  color: var(--color-accent);
}

.ren-icon-success {
  color: var(--color-success);
}

.ren-icon-warning {
  color: var(--color-warning);
}

.ren-icon-danger {
  color: var(--color-danger);
}

.ren-icon-muted {
  color: var(--color-text-secondary);
}

/* ─── Animation ─── */

.ren-icon-spin {
  animation: ren-icon-spin var(--duration-loop) var(--ease-loop) infinite;
}

@keyframes ren-icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .ren-icon-spin {
    animation: none;
  }
}
