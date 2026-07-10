---
type: "RenDS Component"
title: ren-progress
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:primitive:ren-progress
sourcePath: components/primitives/ren-progress
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

# ren-progress

Source path: `components/primitives/ren-progress`

## Relationships

- `exposes_selector` -> [.ren-meter](../../selectors/ren-meter.md)
- `exposes_selector` -> [.ren-meter-lg](../../selectors/ren-meter-lg.md)
- `exposes_selector` -> [.ren-meter-sm](../../selectors/ren-meter-sm.md)
- `exposes_selector` -> [.ren-meter-xl](../../selectors/ren-meter-xl.md)
- `exposes_selector` -> [.ren-progress](../../selectors/ren-progress.md)
- `exposes_selector` -> [.ren-progress-bar](../../selectors/ren-progress-bar.md)
- `exposes_selector` -> [.ren-progress-danger](../../selectors/ren-progress-danger.md)
- `exposes_selector` -> [.ren-progress-indeterminate](../../selectors/ren-progress-indeterminate.md)
- `exposes_selector` -> [.ren-progress-info](../../selectors/ren-progress-info.md)
- `exposes_selector` -> [.ren-progress-label](../../selectors/ren-progress-label.md)
- `exposes_selector` -> [.ren-progress-lg](../../selectors/ren-progress-lg.md)
- `exposes_selector` -> [.ren-progress-sm](../../selectors/ren-progress-sm.md)
- `exposes_selector` -> [.ren-progress-success](../../selectors/ren-progress-success.md)
- `exposes_selector` -> [.ren-progress-value](../../selectors/ren-progress-value.md)
- `exposes_selector` -> [.ren-progress-warning](../../selectors/ren-progress-warning.md)
- `exposes_selector` -> [.ren-progress-xl](../../selectors/ren-progress-xl.md)
- `has_contract` -> [ren-progress component.md](../../foundation/contract-primitive-ren-progress.md)
- `has_css` -> [ren-progress.css](../../css/ren-progress-css.md)
- `has_docs_page` -> [ren-progress docs](../../docs/ren-progress-docs.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-danger](../../tokens/color-danger.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-info](../../tokens/color-info.md)
- `uses_token` -> [--color-success](../../tokens/color-success.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-secondary](../../tokens/color-text-secondary.md)
- `uses_token` -> [--color-warning](../../tokens/color-warning.md)
- `uses_token` -> [--duration-state](../../tokens/duration-state.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--label-size](../../tokens/label-size.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--weight-medium](../../tokens/weight-medium.md)
- `uses_token` -> [--weight-regular](../../tokens/weight-regular.md)

## Structured Data

```json
{
  "kind": "primitive",
  "selectors": [
    ".ren-meter",
    ".ren-meter-lg",
    ".ren-meter-sm",
    ".ren-meter-xl",
    ".ren-progress",
    ".ren-progress-bar",
    ".ren-progress-danger",
    ".ren-progress-indeterminate",
    ".ren-progress-info",
    ".ren-progress-label",
    ".ren-progress-lg",
    ".ren-progress-sm",
    ".ren-progress-success",
    ".ren-progress-value",
    ".ren-progress-warning",
    ".ren-progress-xl"
  ],
  "tokens": [
    "--color-accent",
    "--color-danger",
    "--color-fill",
    "--color-info",
    "--color-success",
    "--color-text",
    "--color-text-secondary",
    "--color-warning",
    "--duration-state",
    "--ease-enter",
    "--label-size",
    "--radius-full",
    "--space-1",
    "--weight-medium",
    "--weight-regular"
  ],
  "hasScript": false,
  "hasDocsPage": true
}
```

## Source Content

# ren-progress Component Contract

Progress and meter styling for determinate and indeterminate completion states.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-progress` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-progress` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Progress primitive behavior or visual role.
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
    - "You need a determinate horizontal bar showing percent completion of a known task (.ren-progress + .ren-progress-bar with inline width)."
    - "You need an indeterminate loading bar with sliding animation (.ren-progress-indeterminate)."
    - "You need a semantic-colored progress state (success / warning / danger / info)."
    - "You need a meter (current value within a min/max range, not progress) — use <meter class=\"ren-meter\">."
    - "You need optional caption rows above (.ren-progress-label) and below (.ren-progress-value) the bar."
    - "You need multiple bar heights: sm (4px), md (8px default), lg (12px), xl (16px)."
  avoidWhen:
    - "You need a circular spinner — use .ren-icon-spin on a loading glyph."
    - "You need a busy state on a button — use ren-button with data-loading / aria-busy."
    - "You need a step indicator with discrete milestones — use a stepper component."
    - "You need a skeleton placeholder while content loads — use ren-skeleton."

canonicalImports:
  css:
    - "rends/components/primitives/ren-progress/ren-progress.css"
  notes:
    - "CSS-only primitive; no JavaScript file exists for ren-progress."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Determinate progress: <div class=\"ren-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\" aria-valuenow=\"<pct>\"><div class=\"ren-progress-bar\" style=\"width: <pct>%\"></div></div>."
  - "Indeterminate progress: add class .ren-progress-indeterminate to the outer and omit aria-valuenow (set aria-valuetext or aria-busy=\"true\" instead)."
  - "Native semantics alternative: <progress class=\"ren-progress\" max=\"100\" value=\"<pct>\"></progress> when no custom inner bar is needed."
  - "Meter: <meter class=\"ren-meter\" min=\"0\" max=\"10\" value=\"<n>\"> — for a current value in a range (battery, score), not for progress over time."
  - "Provide an accessible label via aria-label, aria-labelledby, or a sibling .ren-progress-label."

forbiddenPatterns:
  - "<div class=\"ren-progress\"> without role=\"progressbar\" + aria-value* (when not using native <progress>)."
  - "Animating bar width with a custom transition that bypasses --duration-state / --ease-enter."
  - "Using .ren-progress-danger to convey state by color alone — pair with a text label."
  - "Hardcoded background colors on .ren-progress-bar that bypass --color-accent / semantic variants."
  - "Using <meter> for a progress-over-time scenario or <progress> for a current-value-in-range scenario."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-progress-bg, --ren-progress-duration, --ren-progress-easing, --ren-progress-fill, --ren-progress-height, --ren-progress-radius."
    - "Semantic tokens consumed internally: --color-fill, --color-accent, --color-success, --color-warning, --color-danger, --color-info, --color-text, --color-text-secondary."
    - "Layout / type tokens: --radius-full, --label-size, --weight-medium, --weight-regular, --space-1, --duration-state, --ease-enter."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Raw animation durations; rely on --ren-progress-duration / --duration-state."

accessibility:
  required:
    - "Determinate bars expose role=\"progressbar\" + aria-valuemin / aria-valuemax / aria-valuenow (or use native <progress>)."
    - "Indeterminate bars omit aria-valuenow and set aria-busy=\"true\" or aria-valuetext=\"Loading\" so AT can announce status."
    - "Every progress bar has an accessible name (aria-label, aria-labelledby, or a .ren-progress-label paired by id)."
    - "Color-coded variants (success / warning / danger / info) must be paired with a text label or .ren-progress-value — never color-only."
    - "Indeterminate animation auto-honors prefers-reduced-motion: reduce (slide is suppressed, bar holds at 50%)."
    - "Width transition is suppressed under reduced motion so value updates do not animate."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-progress/ren-progress.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-progress">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-meter`
- `.ren-meter-lg`
- `.ren-meter-sm`
- `.ren-meter-xl`
- `.ren-progress`
- `.ren-progress-bar`
- `.ren-progress-danger`
- `.ren-progress-indeterminate`
- `.ren-progress-info`
- `.ren-progress-label`
- `.ren-progress-lg`
- `.ren-progress-sm`
- `.ren-progress-success`
- `.ren-progress-value`
- `.ren-progress-warning`
- `.ren-progress-xl`

## States And Attributes

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

## Public Token API

- `--ren-progress-bg`
- `--ren-progress-duration`
- `--ren-progress-easing`
- `--ren-progress-fill`
- `--ren-progress-height`
- `--ren-progress-radius`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-progress/ren-progress.css`
- `docs/components/ren-progress.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.


/* ============================================
   RenDS — Progress Bar & Meter Components
   ============================================
   Progress indicators and meter displays.
   CSS-only, works with <progress> and <meter>.

   Supports multiple sizes, colors, and states.
   Includes indeterminate animations.

   Usage:
     <div class="ren-progress">
       <div class="ren-progress-bar" style="width: 65%"></div>
     </div>

     <div class="ren-progress ren-progress-lg ren-progress-success">
       <div class="ren-progress-bar" style="width: 85%"></div>
     </div>

     <meter class="ren-meter" value="6" min="0" max="10"></meter>
   ============================================ */

/* ═══════════════════════════════
   PROGRESS BAR
   ═══════════════════════════════ */

.ren-progress {
  display: flex;
  width: 100%;
  height: 0.5rem;   /* default / md */
  background-color: var(--color-fill);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.ren-progress-bar {
  height: 100%;
  width: 0%;
  background-color: var(--color-accent);
  border-radius: var(--radius-full);
  transition: width var(--duration-state) var(--ease-enter);
}

/* ─── Sizes ─── */

.ren-progress-sm {
  height: 0.25rem;
}

.ren-progress-lg {
  height: 0.75rem;
}

.ren-progress-xl {
  height: 1rem;
}

/* ─── Color Variants ─── */

.ren-progress-success .ren-progress-bar {
  background-color: var(--color-success);
}

.ren-progress-warning .ren-progress-bar {
  background-color: var(--color-warning);
}

.ren-progress-danger .ren-progress-bar {
  background-color: var(--color-danger);
}

.ren-progress-info .ren-progress-bar {
  background-color: var(--color-info);
}

/* ─── Indeterminate Animation ─── */

.ren-progress-indeterminate .ren-progress-bar {
  width: 30% !important;
  animation: ren-progress-slide 1.5s var(--ease-enter) infinite;
}

@keyframes ren-progress-slide {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(500%);
  }
  100% {
    transform: translateX(500%);
  }
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .ren-progress-indeterminate .ren-progress-bar {
    animation: none;
    width: 50% !important;
  }

  .ren-progress-bar {
    transition: none;
  }
}

/* ═══════════════════════════════
   PROGRESS LABELS
   ═══════════════════════════════ */

.ren-progress-label {
  display: block;
  font-size: var(--label-size);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  margin: 0 0 var(--space-1);
}

.ren-progress-value {
  display: block;
  font-size: var(--label-size);
  font-weight: var(--weight-regular);
  color: var(--color-text-secondary);
  margin: var(--space-1) 0 0;
  text-align: end;
}

/* ═══════════════════════════════
   METER ELEMENT
   ═══════════════════════════════ */

.ren-meter {
  display: block;
  width: 100%;
  height: 0.5rem;
  border: none;
  border-radius: var(--radius-full);
  overflow: hidden;
  background-color: var(--color-fill);
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

/* Webkit browsers (Chrome, Safari) */
.ren-meter::-webkit-meter-inner-element {
  border-radius: var(--radius-full);
}

.ren-meter::-webkit-meter-bar {
  background-color: var(--color-fill);
  border-radius: var(--radius-full);
  overflow: hidden;
  border: none;
}

.ren-meter::-webkit-meter-optimum-value {
  background-color: var(--color-success);
  border-radius: var(--radius-full);
}

.ren-meter::-webkit-meter-suboptimum-value {
  background-color: var(--color-warning);
  border-radius: var(--radius-full);
}

.ren-meter::-webkit-meter-even-less-good-value {
  background-color: var(--color-danger);
  border-radius: var(--radius-full);
}

/* Firefox */
.ren-meter::-moz-meter-bar {
  background: var(--color-success);
  border-radius: var(--radius-full);
  border: none;
}

/* ─── Meter Sizes ─── */

.ren-meter-sm {
  height: 0.25rem;
}

.ren-meter-lg {
  height: 0.75rem;
}

.ren-meter-xl {
  height: 1rem;
}
