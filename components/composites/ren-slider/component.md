# ren-slider Component Contract

Range input composite for numeric adjustment.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-slider` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-slider` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Slider composite behavior or visual role.
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
    - "User needs to pick a continuous numeric value within a known min/max range (volume, opacity, brightness, percentage)."
    - "You need a single-thumb slider or a dual-thumb range slider (.ren-slider-range) with two inputs."
    - "You need a visible value readout (.ren-slider-value via show-value attribute) and/or tick marks (.ren-slider-marks)."
    - "You need semantic color variants for status: .ren-slider-success / .ren-slider-warning / .ren-slider-danger."
    - "You need a size variant (.ren-slider-sm / .ren-slider-lg) or a vertical orientation (.ren-slider-vertical)."
    - "Native <input type=\"range\"> ARIA and keyboard support is sufficient (Arrow keys, Home/End, PageUp/PageDown)."
  avoidWhen:
    - "The choice is from a discrete enumerated list — use ren-select, ren-radio-group, or ren-toggle-group."
    - "The value is text, number-typed, or formatted (currency, date) — use ren-field with a typed input."
    - "The control toggles binary state — use ren-switch, ren-checkbox, or ren-toggle."
    - "You need rating stars — use ren-rating."

canonicalImports:
  css:
    - "rends/components/composites/ren-slider/ren-slider.css"
  js:
    - "rends/components/composites/ren-slider/ren-slider.js"
  notes:
    - "JS is required to compute the --value percentage CSS variable that paints the track fill; without it the gradient stays at 0%."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "<ren-slider> wraps a real <input type=\"range\"> with min / max / step / value set as attributes — never style a <div> as a slider."
  - "Pair the input with a real <label for=\"...\"> or set aria-label / aria-labelledby on the input for an accessible name."
  - "Use show-value attribute on <ren-slider> to opt into the .ren-slider-value readout; use label attribute to inject a .ren-slider-label."
  - "Dual-thumb range mode wraps two <input type=\"range\"> elements inside .ren-slider-range with a .ren-slider-track-input visual rail."
  - "Tick marks use .ren-slider-marks > .ren-slider-mark > (.ren-slider-mark-tick + .ren-slider-mark-label); preserve that structure."

forbiddenPatterns:
  - "Replacing <input type=\"range\"> with a <div> + JS drag — accessibility and form submission depend on the native input."
  - "Setting the track fill via inline background gradients; the JS updates --value and the CSS handles the gradient automatically."
  - "Hardcoding thumb colors (background: #fff / blue) on ::-webkit-slider-thumb or ::-moz-range-thumb — use --color-accent or the .ren-slider-success/warning/danger variants."
  - "Removing the focus-visible outline on ::-webkit-slider-thumb / ::-moz-range-thumb without restoring an equivalent visible focus indicator."
  - "Stripping aria-valuemin / aria-valuemax / aria-valuenow (native input provides these — do not block them via role overrides)."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-slider-duration, --ren-slider-easing, --ren-slider-fill-color, --ren-slider-thumb-bg, --ren-slider-thumb-border, --ren-slider-thumb-shadow, --ren-slider-thumb-size, --ren-slider-track-bg, --ren-slider-track-height, --ren-slider-track-radius."
    - "Semantic state tokens: --color-accent, --color-success, --color-warning, --color-danger, --color-fill-active, --color-fill-subtle, --color-text, --color-text-muted."
    - "Shape / motion tokens: --radius-full, --space-*, --shadow-sm, --transition-tactile, font-size tokens (--font-size-label, --font-size-body, --font-size-xs)."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgb / named color values in overrides — including the white thumb border (keep it as a token override if you need to change it)."
    - "Hardcoded transition durations on the thumb hover/active scale; route through --transition-tactile."

accessibility:
  required:
    - "Use a real <input type=\"range\"> so native ARIA (role=slider, aria-valuemin/max/now) and keyboard (Arrow, Home/End, PageUp/Down) work."
    - "Visible focus ring on the thumb via outline: 2px solid var(--color-accent) with outline-offset; never set outline: none without an equivalent."
    - "Provide an accessible name via <label for> or aria-label; the .ren-slider-label class alone does not associate the label."
    - "Color variants must not be the only signal of state — accompany .ren-slider-danger with text or an icon for non-color cues."
    - "Disabled state uses :disabled on the input plus cursor: not-allowed; opacity changes alone are not sufficient on their own for state."
    - "Touch / drag interactions must not block keyboard nudges — both must drive the same change/input events the component dispatches."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-slider/ren-slider.css">
<script type="module" src="rends/components/composites/ren-slider/ren-slider.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-slider">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-slider`
- `.ren-slider-danger`
- `.ren-slider-label`
- `.ren-slider-lg`
- `.ren-slider-mark`
- `.ren-slider-mark-label`
- `.ren-slider-mark-tick`
- `.ren-slider-marks`
- `.ren-slider-range`
- `.ren-slider-sm`
- `.ren-slider-success`
- `.ren-slider-track`
- `.ren-slider-track-input`
- `.ren-slider-value`
- `.ren-slider-vertical`
- `.ren-slider-warning`

## States And Attributes

- `:active`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-slider-duration`
- `--ren-slider-easing`
- `--ren-slider-fill-color`
- `--ren-slider-thumb-bg`
- `--ren-slider-thumb-border`
- `--ren-slider-thumb-shadow`
- `--ren-slider-thumb-size`
- `--ren-slider-track-bg`
- `--ren-slider-track-height`
- `--ren-slider-track-radius`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-slider/ren-slider.css`
- `components/composites/ren-slider/ren-slider.js`
- `docs/components/ren-slider.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
