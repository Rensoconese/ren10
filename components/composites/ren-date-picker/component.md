# ren-date-picker Component Contract

Date input composite using a calendar popover.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-date-picker` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-date-picker` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Date Picker composite behavior or visual role.
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
    - "User needs to pick a single date (or a single contiguous range) from a calendar popover."
    - "Trigger should be a button-like control that opens a positioned popover (CSS anchor positioning with position-area) with an embedded <ren-calendar>."
    - "The form needs an ISO-string value submitted via a hidden input under a given name."
    - "Preset shortcuts (Today, Tomorrow, This Week) should appear alongside the calendar grid."
    - "Mobile must adapt to a bottom sheet automatically; desktop floats below the trigger."
  avoidWhen:
    - "You need two independent start/end inputs with apply/cancel — use ren-date-range-picker."
    - "You only need a raw native <input type=\"date\"> with no popover styling — fall back to base/primitive-zero."
    - "You need a non-date generic dropdown — use ren-menu, ren-select, or ren-popover."
    - "You need a multi-month calendar surface without an input trigger — render <ren-calendar> directly."

canonicalImports:
  css:
    - "rends/components/composites/ren-date-picker/ren-date-picker.css"
  js:
    - "rends/components/composites/ren-date-picker/ren-date-picker.js"
  notes:
    - "Also requires ren-calendar to be registered (the component instantiates <ren-calendar> inside its dropdown)."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Use <ren-date-picker> as the host element so the upgrade lifecycle wires up the trigger, dropdown, and hidden input."
  - "Trigger must be a real <button class=\"ren-date-picker-trigger\"> with type=\"button\", aria-haspopup=\"dialog\", and aria-expanded; the component sets these if it renders the trigger itself."
  - "The dropdown surface is a <div class=\"ren-date-picker-dropdown\" popover=\"manual\"> — keep the popover attribute so showPopover()/hidePopover() work."
  - "Inside the dropdown render a <ren-calendar> child; the host syncs its mode/locale/min/max attributes onto it."
  - "If you need form submission, set name=\"…\" on <ren-date-picker> so the auto-injected <input type=\"hidden\"> carries the ISO value."
  - "Use placement=\"bottom\" by default; the host and .ren-date-picker-dropdown mirror the preferred side to data-side."

forbiddenPatterns:
  - "Styling a <div> or <span> as the trigger instead of a real <button> — keyboard activation and aria-expanded depend on the button."
  - "Replacing the inner <ren-calendar> with raw markup — the host wires ren-date-select events directly to the calendar element."
  - "Hardcoding popover positioning offsets via inline styles — rely on anchor-name: --ren-date-picker-anchor, position-anchor, and position-area in the stylesheet."
  - "Toggling the dropdown by setting display: none — use open()/close()/toggle() on the host so aria-expanded and popover state stay in sync."
  - "Wrapping a native <input type=\"date\"> in .ren-date-picker — the component expects to own its trigger and popover."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-calendar-bg, --ren-calendar-border, --ren-calendar-day-size, --ren-calendar-radius, --ren-calendar-range-bg, --ren-calendar-selected-bg, --ren-calendar-selected-color, --ren-calendar-today-bg, --ren-calendar-width."
    - "Semantic surface tokens used by the trigger / dropdown: --color-surface, --color-surface-raised, --color-border, --color-border-strong, --color-text, --color-text-muted, --color-fill, --color-fill-hover, --color-fill-active, --color-accent, --color-danger, --color-success."
    - "Layout/motion tokens: --space-*, --radius-md, --radius-lg, --shadow-lg, --duration-enter, --ease-enter, --transition-tactile, --touch-min, --body-size, --label-size."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / rgb() colors for trigger or dropdown chrome; theme via --color-* and the --ren-calendar-* token API."
    - "Custom transition/animation durations; reuse --duration-enter and --ease-enter so reduced-motion overrides apply."

accessibility:
  required:
    - "Trigger is a real <button type=\"button\"> with aria-haspopup=\"dialog\" and aria-expanded that flips true/false as the dropdown opens and closes."
    - "Trigger min-height is var(--touch-min) so the tap target meets 44px; do not reduce it for touch contexts."
    - ":focus-visible on the trigger and presets must show the --color-accent outline; do not remove it without restoring an equivalent ring."
    - "Escape closes the dropdown; Enter/Space on the trigger opens it; opening focuses the first non-disabled .ren-calendar-day."
    - "Error/success states (.ren-date-picker-error, .ren-date-picker-success) must be paired with a text message — do not rely on border color alone."
    - "Closing returns focus to the trigger; do not break this contract when overriding open()/close()."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-date-picker/ren-date-picker.css">
<script type="module" src="rends/components/composites/ren-date-picker/ren-date-picker.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<ren-date-picker name="start-date" placement="bottom"><button class="ren-date-picker-trigger" type="button" aria-haspopup="dialog" aria-expanded="false">Choose date</button><div class="ren-date-picker-dropdown" popover="manual"><ren-calendar></ren-calendar></div></ren-date-picker>

```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-calendar`
- `.ren-date-picker`
- `.ren-date-picker-dropdown`
- `.ren-date-picker-empty`
- `.ren-date-picker-error`
- `.ren-date-picker-preset`
- `.ren-date-picker-presets`
- `.ren-date-picker-range`
- `.ren-date-picker-success`
- `.ren-date-picker-trigger`
- `.ren-date-picker-value`

## States And Attributes

- `[data-side]`
- `placement`
- `:active`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-calendar-bg`
- `--ren-calendar-border`
- `--ren-calendar-day-size`
- `--ren-calendar-radius`
- `--ren-calendar-range-bg`
- `--ren-calendar-selected-bg`
- `--ren-calendar-selected-color`
- `--ren-calendar-today-bg`
- `--ren-calendar-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-date-picker/ren-date-picker.css`
- `components/composites/ren-date-picker/ren-date-picker.js`
- `docs/components/ren-date-picker.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
