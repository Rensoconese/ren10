---
type: "RenDS Contract"
title: "ren-color-picker component.md"
description: "RenDS Contract generated from the RenDS knowledge graph."
id: contract:composite:ren-color-picker
sourcePath: components/composites/ren-color-picker/component.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - contract
  - ren10
  - rends
---

# ren-color-picker component.md

Source path: `components/composites/ren-color-picker/component.md`

## Relationships

_No outgoing relationships._

## Structured Data

```json
{
  "kind": "composite"
}
```

## Source Content

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

requiredMarkup:
  - "Root <div class=\"ren-color-picker\"> contains a trigger button and a .ren-color-picker-dropdown popover; do not flatten the structure."
  - "Trigger is a real <button class=\"ren-color-picker-trigger\"> with aria-expanded reflecting popover state."
  - "Saturation/brightness area renders a <canvas class=\"ren-color-picker-saturation-canvas\"> inside .ren-color-picker-saturation; do not replace with a gradient div."
  - "Hue handle and alpha handle are decorative thumbs (no tab stops) — keyboard input lives on the hex / channel inputs."
  - "Swatch grid items are real <button class=\"ren-color-picker-swatch\"> with aria-selected on the active swatch."
  - "Use placement=\"bottom\" by default; the host and .ren-color-picker-dropdown mirror the preferred side to data-side."

forbiddenPatterns:
  - "Replacing the canvas with a CSS gradient div — drag math relies on canvas pixel sampling."
  - "Hardcoded hue rainbow gradients in consumer overrides; the rainbow's six hex stops are intentional and locked to HSL pure hues."
  - "Setting box-shadow / outline overrides that hide the focus ring on .ren-color-picker-trigger or .ren-color-picker-swatch."
  - "Using window.alert / window.prompt for color input; the component already exposes hex + channel inputs."
  - "Calling EyeDropper directly from consumer code; the .ren-color-picker-eyedropper button wraps the API with feature detection."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-cp-bg, --ren-cp-handle-size, --ren-cp-radius, --ren-cp-shadow, --ren-cp-swatch-size, --ren-cp-track-height, --ren-cp-width."
    - "Semantic tokens: --color-surface, --color-surface-raised, --color-border, --color-text, --color-text-muted, --color-fill, --color-fill-hover, --color-accent, --color-input-bg, --color-input-border, --color-input-border-focus, --color-input-focus-ring."
    - "Layout / motion tokens: --space-*, --radius-*, --shadow-lg, --touch-min, --font-mono, --duration-enter, --ease-enter, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides (the hue rainbow stops inside the component are the only sanctioned exception)."
    - "Custom drop shadows that bypass --ren-cp-shadow / --shadow-lg."

accessibility:
  required:
    - "Trigger button has aria-haspopup=\"dialog\" (or appropriate) and aria-expanded reflects the dropdown state."
    - "All inputs (.ren-color-picker-hex-input, .ren-color-picker-channel-input) have associated <label> via .ren-color-picker-channel-label or aria-label."
    - "The saturation area is operable via keyboard (Arrow keys move the handle in 1% steps; Shift+Arrow in larger steps)."
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
- `[data-side]`
- `placement`
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
