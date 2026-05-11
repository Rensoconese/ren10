# ren-switch Component Contract

Toggle switch primitive built on native `<input type="checkbox" role="switch">` with checked, hover, focus, active, and disabled states.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-switch` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-switch` primitive.
- Keep generated markup aligned with the colocated CSS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- The UI requires an instant on/off state that takes effect immediately (e.g. enable/disable a setting, toggle dark mode).
- The control sits in a settings panel or in-line preference area, not in a form that must be submitted before changes apply.
- Native checkbox semantics with `role="switch"` are appropriate.

## Do Not Use When

- The choice should only take effect on form submit — use `ren-checkbox` instead.
- More than two states are possible — use `ren-radio` or `ren-toggle-group`.
- The control must look like a checkbox (square box with checkmark) — use `ren-checkbox`.

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-switch/ren-switch.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<label class="ren-switch">
  <input type="checkbox" role="switch">
  <span class="ren-switch-track"></span>
  <span>Dark mode</span>
</label>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-switch`
- `.ren-switch-track`

## States And Attributes

- `:active`
- `:checked`
- `:disabled`
- `:focus-visible`
- `:hover`
- `role="switch"` on the native input (announces toggle semantics to assistive technology)

## Public Token API

- `--ren-switch-bg`
- `--ren-switch-checked-bg`
- `--ren-switch-duration`
- `--ren-switch-easing`
- `--ren-switch-height`
- `--ren-switch-thumb-color`
- `--ren-switch-thumb-size`
- `--ren-switch-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; the `role="switch"` on the input announces the on/off toggle pattern.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum (the track is 51×31 but the label wrapper provides the full touch target).
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone — the thumb position is the primary visual signal.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-switch/ren-switch.css`
- `docs/components/ren-switch.html`
- `components/primitives/ren-checkbox/component.md` (sibling primitive — submit-time vs immediate semantics)
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
