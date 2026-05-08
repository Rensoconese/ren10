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
