# ren-tooltip Component Contract

Short accessible description attached to a trigger.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-tooltip` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-tooltip` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Tooltip composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-tooltip/ren-tooltip.css">
<script type="module" src="rends/components/composites/ren-tooltip/ren-tooltip.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-tooltip">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-open`
- `.ren-tooltip`
- `.ren-tooltip-arrow`
- `.ren-tooltip-trigger`

## States And Attributes

- `[data-side]`

## Public Token API

- `--ren-tooltip-bg`
- `--ren-tooltip-color`
- `--ren-tooltip-delay`
- `--ren-tooltip-duration`
- `--ren-tooltip-easing`
- `--ren-tooltip-font-size`
- `--ren-tooltip-padding-x`
- `--ren-tooltip-padding-y`
- `--ren-tooltip-radius`
- `--ren-tooltip-shadow`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-tooltip/ren-tooltip.css`
- `components/composites/ren-tooltip/ren-tooltip.js`
- `docs/components/ren-tooltip.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
