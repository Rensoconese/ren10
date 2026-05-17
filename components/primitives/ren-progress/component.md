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
