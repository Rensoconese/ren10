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

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "Users must pick an arbitrary color via canvas (S/B) + hue + optional alpha."
    - "Multiple output formats are needed (HEX / RGB / HSL) with a toggle."
    - "Manual entry through hex + channel inputs and preset swatches is required."
    - "Eyedropper integration (EyeDropper API) is desired when supported."
    - "The control opens in a popover anchored to a trigger button showing the current color, with placement=\"top|right|bottom|left\" mirrored to data-side."
  avoidWhen:
    - "Users only need to pick from a small fixed palette — render a list of ren-swatch / radio buttons."
    - "A native <input type=\"color\"> is sufficient (no alpha, no format toggle, no presets)."
    - "The UI is a brand-theme picker driven by tokens — use a token-aware variant."
    - "The control must live inline without a dropdown — wrap the dropdown content directly without the trigger."

canonicalImports:
  css:
    - "rends/components/composites/ren-color-picker/ren-color-picker.css"
  js:
    - "rends/components/composites/ren-color-picker/ren-color-picker.js"
  notes:
    - "If the page already imports rends/components/index.css, do not import the CSS again."
    - "JS is required: HSV ↔ HEX / RGB / HSL conversion, canvas painting, drag handles, and the popover open/close are all implemented in JS."
    - "The dropdown uses the native Popover API plus CSS anchor positioning via position-area; older browsers fall back to local absolute positioning."
    - "JS pairs each trigger with its own dropdown by generating a unique anchor name per instance and applying it inline; the stylesheet declares no shared name, so several pickers can coexist on one page without stealing each other's position."

requiredMarkup:
  - "Root <ren-color-picker> is the consumer-authored host; its JS generates the trigger button and .ren-color-picker-dropdown popover."
  - "Trigger is a real <button class=\"ren-color-picker-trigger\"> with aria-expanded reflecting popover state."
  - "Saturation/brightness area renders a <canvas class=\"ren-color-picker-saturation-canvas\"> inside .ren-color-picker-saturation; do not replace with a gradient div."
  - "The component generates three slider surfaces, each a tab stop with role=\"slider\", an aria-label and aria-valuemin / aria-valuemax / aria-valuenow / aria-valuetext: .ren-color-picker-saturation (two-dimensional), .ren-color-picker-hue and, with the alpha attribute, .ren-color-picker-alpha. The handles inside them (.ren-color-picker-saturation-handle, .ren-color-picker-hue-handle, .ren-color-picker-alpha-handle) are decorative. Do not strip the role, the tab stop or the value attributes."
  - "Swatch grid items are real <button class=\"ren-color-picker-swatch\"> inside a role=\"group\" container; the preset equal to the current color carries aria-current=\"true\", kept in sync by the component."
  - "Use placement=\"bottom\" by default; the host and .ren-color-picker-dropdown mirror the preferred side to data-side."

forbiddenPatterns:
  - "Declaring a single shared CSS anchor name for .ren-color-picker-trigger in consumer overrides — a document-wide name resolves to the last trigger in tree order and misplaces every other dropdown."
  - "Replacing the canvas with a CSS gradient div — drag math relies on canvas pixel sampling."
  - "Hardcoded hue rainbow gradients in consumer overrides; the rainbow's six hex stops are intentional and locked to HSL pure hues."
  - "Setting box-shadow / outline overrides that hide the focus ring on .ren-color-picker-trigger or .ren-color-picker-swatch."
  - "Using window.alert / window.prompt for color input; the component already exposes hex + channel inputs."
  - "Calling EyeDropper directly from consumer code; the .ren-color-picker-eyedropper button wraps the API with feature detection."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-cp-bg, --ren-cp-handle-size, --ren-cp-hue-gradient, --ren-cp-radius, --ren-cp-shadow, --ren-cp-swatch-size, --ren-cp-track-height, --ren-cp-width."
    - "Semantic tokens: --color-surface, --color-surface-raised, --color-border, --color-text, --color-text-muted, --color-fill, --color-fill-hover, --color-accent, --color-input-bg, --color-input-border, --color-input-border-focus, --color-input-focus-ring."
    - "Layout / motion tokens: --space-*, --radius-*, --shadow-lg, --touch-min, --font-mono, --duration-enter, --ease-enter, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides (the hue rainbow stops inside the component are the only sanctioned exception)."
    - "Custom drop shadows that bypass --ren-cp-shadow / --shadow-lg."

accessibility:
  required:
    - "Trigger button has aria-haspopup=\"dialog\" (or appropriate) and aria-expanded reflects the dropdown state; its aria-label names the current color and follows every change."
    - "All inputs (.ren-color-picker-hex-input, .ren-color-picker-channel-input) have associated <label> via .ren-color-picker-channel-label or aria-label."
    - "The saturation/brightness area is a focusable two-dimensional slider (role=\"slider\", aria-roledescription \"2D slider\"): Left/Right change saturation and Up/Down change brightness in 1% steps, Shift+Arrow in 10% steps, PageUp/PageDown move brightness by 10%, Home/End jump to 0% / 100% saturation. aria-valuenow is the saturation and aria-valuetext reads both axes."
    - "The hue slider and the alpha slider are tab stops with role=\"slider\": arrows step by 1 (degree / percent), Shift+Arrow and PageUp/PageDown by 10, Home/End jump to the ends. Hue wraps around; opacity stops at 0% and 100%."
    - "Every control in the dropdown is reachable with Tab in visual order (area, hue, alpha, hex, channels, format toggle, eyedropper, swatches); Escape closes it and returns focus to the trigger."
    - "Focus rings use --color-input-focus-ring; never set outline: none without restoring box-shadow ring."
    - "Color is never communicated by hue alone — value text appears alongside the swatch (preview label + value)."
    - "Animations honor prefers-reduced-motion (open animation and transitions are clamped to 0.01ms)."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-color-picker/ren-color-picker.css">
<script type="module" src="rends/components/composites/ren-color-picker/ren-color-picker.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

UI strings and `aria-label`s resolve through `utils/i18n.js` at DOM-build time, so call `setLocale()` **before** importing/mounting `ren-color-picker` — a later locale change does not relabel already-rendered instances.

## Canonical Markup

```html
<ren-color-picker value="#007aff" placement="bottom"></ren-color-picker>

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

- `[aria-current]` — on the preset swatch that equals the current color.
- `[aria-expanded]`
- `[aria-valuenow]` / `[aria-valuetext]` — on the three slider surfaces.
- `[data-side]`
- `placement`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-cp-bg`
- `--ren-cp-handle-size`
- `--ren-cp-hue-gradient` — HSV input spectrum; preserve hue order when overriding.
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
- Right-to-left: the saturation area, the hue and alpha tracks and their handles are not mirrored under `dir="rtl"` (they keep `direction: ltr`, as a native colour picker does). The trigger, labels and inputs around them mirror.

### Keyboard

The trigger opens the dropdown with Enter or Space; Escape closes it and
returns focus to the trigger. Inside, the saturation/brightness area, the hue
slider and the alpha slider are the first three tab stops, each a
`role="slider"` with a name and a current value.

| Key | Saturation / brightness area | Hue slider | Alpha slider |
|---|---|---|---|
| Left / Right | saturation −1% / +1% | hue −1° / +1° | opacity −1% / +1% |
| Up / Down | brightness +1% / −1% | hue +1° / −1° | opacity +1% / −1% |
| Shift + arrow | the same, by 10 | the same, by 10 | the same, by 10 |
| Page Up / Page Down | brightness +10% / −10% | hue +10° / −10° | opacity +10% / −10% |
| Home / End | saturation 0% / 100% | hue 0° / 360° | opacity 0% / 100% |

- The area is two-dimensional, which ARIA has no role for: it is a slider
  whose `aria-valuenow` is the saturation and whose `aria-valuetext` reads
  both axes ("Saturation 72%, brightness 94%"), with
  `aria-roledescription="2D slider"`.
- Hue is a circle, so its steps wrap (one step below 0° is 359°). Saturation,
  brightness and opacity stop at their ends.
- A key press on a slider dispatches `ren-input` and then `ren-change`, like
  a native range input. A pointer drag dispatches `ren-input` while it moves
  and `ren-change` on release.
- A pointer press on a slider also focuses it, so the arrows can fine-tune
  from where the pointer left it.
- The format toggle rebuilds the fields and keeps focus on itself.
- The strings (`aria-label`, value text, role description) come from
  `utils/i18n.js` under `colorPicker.*`.

## Related Files

- `components/composites/ren-color-picker/ren-color-picker.css`
- `components/composites/ren-color-picker/ren-color-picker.js`
- `docs/components/ren-color-picker.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- `tests/components/keyboard-contracts.spec.cjs` drives every key in the table above and checks the name, role and value of each control (including an axe pass over the open dropdown).
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.

## Attribute lifecycle

`value` are read when the component connects. Changing those attributes after mount is not a supported update mechanism; use only the documented methods for runtime changes. For a new initialization configuration, create a new component instance. `placement`, where documented, is reactive. Existing event names remain stable; see the [event reference](../../../docs/foundations/events.html).
