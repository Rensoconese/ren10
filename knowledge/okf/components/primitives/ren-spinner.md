---
type: "RenDS Component"
title: ren-spinner
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:primitive:ren-spinner
sourcePath: components/primitives/ren-spinner
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

# ren-spinner

Source path: `components/primitives/ren-spinner`

## Relationships

- `exposes_selector` -> [.ren-spinner](../../selectors/ren-spinner.md)
- `exposes_selector` -> [.ren-spinner-lg](../../selectors/ren-spinner-lg.md)
- `exposes_selector` -> [.ren-spinner-light](../../selectors/ren-spinner-light.md)
- `exposes_selector` -> [.ren-spinner-sm](../../selectors/ren-spinner-sm.md)
- `exposes_selector` -> [.ren-spinner-xl](../../selectors/ren-spinner-xl.md)
- `exposes_selector` -> [.ren-spinner-xs](../../selectors/ren-spinner-xs.md)
- `has_contract` -> [ren-spinner component.md](../../foundation/contract-primitive-ren-spinner.md)
- `has_css` -> [ren-spinner.css](../../css/ren-spinner-css.md)
- `has_docs_page` -> [ren-spinner docs](../../docs/ren-spinner-docs.md)
- `used_by_example` -> [ai-panel.html](../../examples/ai-panel-html.md) (ren-spinner)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-fill-active](../../tokens/color-fill-active.md)
- `uses_token` -> [--duration-loop](../../tokens/duration-loop.md)
- `uses_token` -> [--duration-loop-gentle](../../tokens/duration-loop-gentle.md)
- `uses_token` -> [--ease-loop-pulse](../../tokens/ease-loop-pulse.md)
- `uses_token` -> [--ease-loop-smooth](../../tokens/ease-loop-smooth.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--white](../../tokens/white.md)

## Structured Data

```json
{
  "kind": "primitive",
  "selectors": [
    ".ren-spinner",
    ".ren-spinner-lg",
    ".ren-spinner-light",
    ".ren-spinner-sm",
    ".ren-spinner-xl",
    ".ren-spinner-xs"
  ],
  "tokens": [
    "--color-accent",
    "--color-fill-active",
    "--duration-loop",
    "--duration-loop-gentle",
    "--ease-loop-pulse",
    "--ease-loop-smooth",
    "--radius-full",
    "--white"
  ],
  "hasScript": false,
  "hasDocsPage": true
}
```

## Source Content

# ren-spinner Component Contract

Small loading indicator for pending or busy states.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-spinner` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-spinner` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Spinner primitive behavior or visual role.
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
    - "You need a small inline busy / pending indicator with no known duration."
    - "You need to indicate loading inside a button or near a single control (xs / sm sizes)."
    - "The spinner sits on a dark / colored surface — use .ren-spinner-light."
    - "The wait is short and content layout is not yet known (otherwise prefer ren-skeleton for layout preservation)."
    - "You want CSS-only animation that automatically degrades to an opacity pulse under prefers-reduced-motion."
  avoidWhen:
    - "Content placeholders that preserve layout — use ren-skeleton for cards, lists, avatars."
    - "Determinate progress (you know the percentage) — use ren-progress."
    - "Long-running background operations where the user can navigate away — use ren-toast / ren-banner status messaging instead of a persistent spinner."

canonicalImports:
  css:
    - "rends/components/primitives/ren-spinner/ren-spinner.css"
  notes:
    - "CSS-only primitive. There is no colocated JS — do not import one."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Render a <span class=\"ren-spinner\"> (or another inline-block element) with role=\"status\" and an aria-label like \"Loading\"."
  - "Add a size modifier when the default 1.5rem is wrong: .ren-spinner-xs (0.875rem), .ren-spinner-sm (1rem), .ren-spinner-lg (2rem), .ren-spinner-xl (3rem)."
  - "Use .ren-spinner-light only on dark / colored surfaces where the default --color-accent ring would lack contrast."
  - "When a spinner replaces a button's label, also set aria-busy=\"true\" on the button so AT announces the busy state."

forbiddenPatterns:
  - "<div class=\"ren-spinner\" aria-hidden=\"true\"> with no accessible label when the spinner is the only signal of busy state."
  - "Hardcoded border-color: #... overrides; theme via --ren-spinner-color or use .ren-spinner-light for inverted surfaces."
  - "Custom animation-duration values in inline styles; use --ren-spinner-speed (or --duration-loop)."
  - "Combining .ren-spinner-light with --color-accent overrides — pick one approach; light is for inverted surfaces only."
  - "Spinner left mounted after the operation finishes — remove it or replace with success / error state."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-spinner-color, --ren-spinner-size, --ren-spinner-speed, --ren-spinner-width."
    - "Semantic tokens consumed internally: --color-fill-active, --color-accent, --white, --radius-full, --duration-loop, --ease-loop-smooth, --ease-loop-pulse."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgba border colors."
    - "Raw animation: spin 1s linear infinite; use the .ren-spinner class and --ren-spinner-speed."

accessibility:
  required:
    - "The spinner must have role=\"status\" and an aria-label (e.g. \"Loading\") when it conveys busy state."
    - "When the spinner replaces a button label, set aria-busy=\"true\" on the button so the busy state is exposed once."
    - "Do not stack multiple labeled spinners in the same live region — they will be announced repeatedly."
    - "Reduced-motion users see a gentle opacity pulse (built-in); do not override animation in consumer code."
    - "Color is not the only signal: the spinner is also a moving shape. Ensure the rotation / pulse is visible against the background."
    - "Provide a textual fallback (\"Saving…\") near the spinner whenever the wait can exceed a couple of seconds."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-spinner/ren-spinner.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-spinner">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-spinner`
- `.ren-spinner-lg`
- `.ren-spinner-light`
- `.ren-spinner-sm`
- `.ren-spinner-xl`
- `.ren-spinner-xs`

## States And Attributes

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

## Public Token API

- `--ren-spinner-color`
- `--ren-spinner-size`
- `--ren-spinner-speed`
- `--ren-spinner-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-spinner/ren-spinner.css`
- `docs/components/ren-spinner.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ============================================
   RenDS — Spinner
   ============================================
   Circular loading indicator. CSS-only animation
   that respects prefers-reduced-motion (falls
   back to a gentle opacity pulse instead of
   rotating).

   Usage:
     <span class="ren-spinner" role="status"
           aria-label="Loading"></span>
     <span class="ren-spinner ren-spinner-lg"></span>

   Accessibility:
     - Provide role="status" and aria-label for SR
     - On dark surfaces use .ren-spinner-light
   ============================================ */

.ren-spinner {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  border: 2.5px solid var(--color-fill-active);
  border-top-color: var(--color-accent);
  border-radius: var(--radius-full);
  animation: ren-spin var(--duration-loop) var(--ease-loop-smooth) infinite;
}

/* ─── Sizes ─── */
.ren-spinner-xs { width: 0.875rem; height: 0.875rem; border-width: 2px; }
.ren-spinner-sm { width: 1rem;     height: 1rem;     border-width: 2px; }
.ren-spinner-lg { width: 2rem;     height: 2rem;     border-width: 3px; }
.ren-spinner-xl { width: 3rem;     height: 3rem;     border-width: 3px; }

/* ─── Color variants ─── */
.ren-spinner-light {
  border-color: rgb(255, 255, 255, 0.3);
  border-top-color: var(--white);
}

@keyframes ren-spin {
  to { transform: rotate(360deg); }
}

/* Reduced motion: pulse opacity instead of rotating */
@media (prefers-reduced-motion: reduce) {
  .ren-spinner {
    animation: ren-spin-gentle var(--duration-loop-gentle) var(--ease-loop-pulse) infinite;
  }

  @keyframes ren-spin-gentle {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.4; }
  }
}
