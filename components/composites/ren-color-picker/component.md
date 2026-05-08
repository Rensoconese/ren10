# ren-color-picker Component Contract

Color input composite for selecting and previewing colors.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-color-picker` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-color-picker` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Color Picker composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-color-picker/ren-color-picker.css">
<script type="module" src="rends/components/composites/ren-color-picker/ren-color-picker.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-color-picker">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-color-picker`
- `.ren-color-picker-alpha`
- `.ren-color-picker-alpha-gradient`
- `.ren-color-picker-alpha-handle`
- `.ren-color-picker-channel`
- `.ren-color-picker-channel-input`
- `.ren-color-picker-channel-label`
- `.ren-color-picker-channels`
- `.ren-color-picker-controls`
- `.ren-color-picker-controls-left`
- `.ren-color-picker-controls-right`
- `.ren-color-picker-dropdown`
- `.ren-color-picker-eyedropper`
- `.ren-color-picker-eyedropper-icon`
- `.ren-color-picker-format-toggle`
- `.ren-color-picker-hex-input`
- `.ren-color-picker-hue`
- `.ren-color-picker-hue-handle`
- `.ren-color-picker-inputs`
- `.ren-color-picker-preview`
- `.ren-color-picker-preview-info`
- `.ren-color-picker-preview-label`
- `.ren-color-picker-preview-swatch`
- `.ren-color-picker-preview-value`
- `...and 9 more in the source files.`

## States And Attributes

- `[aria-expanded]`
- `[aria-selected]`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-cp-bg`
- `--ren-cp-handle-size`
- `--ren-cp-radius`
- `--ren-cp-shadow`
- `--ren-cp-swatch-size`
- `--ren-cp-track-height`
- `--ren-cp-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-color-picker/ren-color-picker.css`
- `components/composites/ren-color-picker/ren-color-picker.js`
- `docs/components/ren-color-picker.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
