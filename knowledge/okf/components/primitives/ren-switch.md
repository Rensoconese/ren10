---
type: "RenDS Component"
title: ren-switch
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:primitive:ren-switch
sourcePath: components/primitives/ren-switch
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

# ren-switch

Source path: `components/primitives/ren-switch`

## Relationships

- `exposes_selector` -> [.ren-switch](../../selectors/ren-switch.md)
- `exposes_selector` -> [.ren-switch-track](../../selectors/ren-switch-track.md)
- `has_contract` -> [ren-switch component.md](../../foundation/contract-primitive-ren-switch.md)
- `has_css` -> [ren-switch.css](../../css/ren-switch-css.md)
- `has_docs_page` -> [ren-switch docs](../../docs/ren-switch-docs.md)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--color-fill-active](../../tokens/color-fill-active.md)
- `uses_token` -> [--color-fill-hover](../../tokens/color-fill-hover.md)
- `uses_token` -> [--color-focus-ring](../../tokens/color-focus-ring.md)
- `uses_token` -> [--color-success](../../tokens/color-success.md)
- `uses_token` -> [--color-success-strong](../../tokens/color-success-strong.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--duration-state](../../tokens/duration-state.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--ease-state-change](../../tokens/ease-state-change.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--ring-offset-width](../../tokens/ring-offset-width.md)
- `uses_token` -> [--ring-width](../../tokens/ring-width.md)
- `uses_token` -> [--shadow-sm](../../tokens/shadow-sm.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--touch-min](../../tokens/touch-min.md)
- `uses_token` -> [--weight-regular](../../tokens/weight-regular.md)
- `uses_token` -> [--white](../../tokens/white.md)

## Structured Data

```json
{
  "kind": "primitive",
  "selectors": [
    ".ren-switch",
    ".ren-switch-track"
  ],
  "tokens": [
    "--body-size",
    "--color-fill-active",
    "--color-fill-hover",
    "--color-focus-ring",
    "--color-success",
    "--color-success-strong",
    "--color-text",
    "--duration-state",
    "--ease-enter",
    "--ease-state-change",
    "--radius-full",
    "--ring-offset-width",
    "--ring-width",
    "--shadow-sm",
    "--space-2",
    "--touch-min",
    "--weight-regular",
    "--white"
  ],
  "hasScript": false,
  "hasDocsPage": true
}
```

## Source Content

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

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The control flips an immediate on/off setting (dark mode, notifications, feature flags)."
    - "The change should take effect the moment the user toggles it, with no submit step."
    - "Native checkbox semantics extended with role=\"switch\" are the right a11y model."
    - "You want the iOS-style 51×31 track plus full label wrapper for a 44px touch target."
    - "You need the checked color to come from --color-success (positive enablement), not the brand accent."
  avoidWhen:
    - "The change must wait for a Save / Submit step — use ren-checkbox so users can review before commit."
    - "There are 3+ choices or the option is mutually exclusive within a set — use ren-radio or ren-toggle-group."
    - "The control needs a checkmark glyph to communicate selection — use ren-checkbox."
    - "The control is a tab / segmented selector across views — use ren-tabs or ren-toggle-group."

canonicalImports:
  css:
    - "rends/components/primitives/ren-switch/ren-switch.css"
  notes:
    - "CSS-only primitive. There is no colocated JS — do not import one."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Wrap the control in a <label class=\"ren-switch\"> so the entire label area is the click / touch target."
  - "Use a real <input type=\"checkbox\" role=\"switch\"> as the first child; the CSS hides it visually but keeps it focusable and announced."
  - "Follow the input with <span class=\"ren-switch-track\"></span>; the thumb is the track's ::after pseudo-element — do not add a separate thumb element."
  - "Include a visible <span>Label</span> sibling for sighted users; if the switch is icon-only, set aria-label on the input."
  - "Persist on/off changes immediately via the input's change event — never defer to a separate Save action."

forbiddenPatterns:
  - "<div role=\"switch\" tabindex=\"0\"> custom toggles; always use a real <input type=\"checkbox\" role=\"switch\">."
  - "Hiding the input with display: none — it removes it from the accessibility tree. Keep the existing clip-path / visually-hidden pattern."
  - "Hardcoded track / thumb colors via background-color in inline styles; theme via --ren-switch-bg, --ren-switch-checked-bg, --ren-switch-thumb-color."
  - "Putting the switch inside a <form> where it only applies after submit — that is checkbox territory."
  - "Removing the focus outline on .ren-switch-track without restoring an equivalent :focus-visible ring."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-switch-bg, --ren-switch-checked-bg, --ren-switch-duration, --ren-switch-easing, --ren-switch-height, --ren-switch-thumb-color, --ren-switch-thumb-size, --ren-switch-width."
    - "Semantic tokens consumed internally: --color-fill-active, --color-fill-hover, --color-success, --color-success-strong, --color-text, --color-focus-ring, --white, --radius-full, --ring-width, --ring-offset-width, --touch-min, --shadow-sm."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors for the checked / unchecked track."
    - "Custom transition values; use --ren-switch-duration and --ren-switch-easing."

accessibility:
  required:
    - "The native <input type=\"checkbox\" role=\"switch\"> must remain in the DOM and focusable — assistive tech announces it as a switch with on/off states."
    - "The whole <label class=\"ren-switch\"> wrapper provides a touch target of at least --touch-min (44px)."
    - "Focus must show the outline ring on .ren-switch-track via :focus-visible (the CSS already wires this up; do not remove it)."
    - "Do not signal state by color alone — the thumb position (left vs right) is the primary visual cue."
    - "When the switch is disabled, set disabled on the <input> (the parent .ren-switch:has(input:disabled) handles styling) instead of a custom data attribute."
    - "If the switch's label is not adjacent text, set aria-label or aria-labelledby on the <input>."
```

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


/* ============================================
   RenDS — Switch / Toggle Component
   ============================================
   Custom-styled toggle switch built on native
   <input type="checkbox" role="switch">.

   Preserves native semantics and accessibility.
   Custom visuals via CSS only.

   Usage:
     <label class="ren-switch">
       <input type="checkbox" role="switch">
       <span class="ren-switch-track"></span>
       <span>Dark mode</span>
     </label>
   ============================================ */

.ren-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--body-size);
  font-weight: var(--weight-regular);
  color: var(--color-text);
  user-select: none;
  min-height: var(--touch-min);
}

/* Hide native input */
.ren-switch > input[type="checkbox"] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}

/* Track */
.ren-switch-track {
  position: relative;
  width: 3.2rem;    /* 51px — Apple HIG */
  height: 1.9rem;   /* 31px */
  flex-shrink: 0;
  background-color: var(--color-fill-active);
  border-radius: var(--radius-full);
  transition:
    background-color var(--duration-state) var(--ease-enter);
}

/* Thumb */
.ren-switch-track::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(1.9rem - 4px);   /* 27px */
  height: calc(1.9rem - 4px);
  background-color: var(--white);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  transition:
    transform var(--duration-state) var(--ease-state-change),
    box-shadow var(--duration-state) var(--ease-enter);
}

/* ─── States ─── */

/* Checked (on) */
.ren-switch > input:checked + .ren-switch-track {
  background-color: var(--color-success);
}

.ren-switch > input:checked + .ren-switch-track::after {
  transform: translateX(calc(3.2rem - 1.9rem));
}

/* Hover */
.ren-switch:hover > .ren-switch-track {
  background-color: var(--color-fill-hover);
}

.ren-switch:hover > input:checked + .ren-switch-track {
  background-color: var(--color-success-strong);
}

/* Focus */
.ren-switch > input:focus-visible + .ren-switch-track {
  outline: var(--ring-width) solid var(--color-focus-ring);
  outline-offset: var(--ring-offset-width);
}

/* Active */
.ren-switch:active > .ren-switch-track::after {
  width: calc(1.9rem + 2px);
}

.ren-switch:active > input:checked + .ren-switch-track::after {
  transform: translateX(calc(3.2rem - 1.9rem - 6px));
}

/* Disabled */
.ren-switch:has(input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}
