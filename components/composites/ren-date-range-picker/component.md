# ren-date-range-picker Component Contract

Two-date selection composite for ranges.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-date-range-picker` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-date-range-picker` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Date Range Picker composite behavior or visual role.
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
    - "User needs to pick a contiguous date range (start + end) confirmed by an explicit Apply action."
    - "UI needs dual side-by-side calendars (left = start month, right = next month) inside a CSS-anchor-positioned popover."
    - "Preset shortcuts like Last 7 / Last 30 / This Month / Last Month should be selectable as a sidebar listbox."
    - "Form submission needs two ISO-string fields named `<name>-start` and `<name>-end` via injected hidden inputs."
    - "Selection has Apply/Cancel semantics — draft state on outside-click or Cancel must revert to the previously confirmed range."
  avoidWhen:
    - "Only a single date is needed — use ren-date-picker (mode=\"single\")."
    - "User picks two unrelated dates (start-of-trip, end-of-warranty) that are not a contiguous range — use two ren-date-picker instances."
    - "Range needs commit-on-click without Apply/Cancel — use ren-date-picker with mode=\"range\"."
    - "No calendar UI is needed; a quick \"last N days\" preset is enough — render ren-select / ren-menu of presets only."

canonicalImports:
  css:
    - "rends/components/composites/ren-date-range-picker/ren-date-range-picker.css"
  js:
    - "rends/components/composites/ren-date-range-picker/ren-date-range-picker.js"
  notes:
    - "Also requires ren-calendar to be registered — the component instantiates two <ren-calendar mode=\"range\"> children inside the dropdown."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Use <ren-date-range-picker> as the host so the upgrade lifecycle builds the trigger, dropdown, dual calendars, presets, and hidden inputs."
  - "The trigger is a real <button class=\"ren-date-range-trigger\"> with aria-haspopup=\"dialog\" and aria-expanded; do not replace it with a div."
  - "The dropdown root carries role=\"dialog\", aria-label, and popover=\"manual\"; presets render inside role=\"listbox\" with each preset as role=\"option\" + data-preset=\"<key>\"."
  - "Footer must contain .ren-date-range-summary (aria-live=\"polite\"), .ren-date-range-cancel, and .ren-date-range-apply — Apply is disabled until both endpoints are set."
  - "Use `name=\"…\"` on the host so the component injects <input type=\"hidden\" name=\"<name>-start\"> and `…-end` for form submission."
  - "Use placement=\"bottom\" by default; the host and .ren-date-range-dropdown mirror the preferred side to data-side."

forbiddenPatterns:
  - "Wiring presets to a single ren-calendar instead of using both calendarLeft/calendarRight — the host depends on having two ren-calendar children to call setRange on."
  - "Skipping the Apply button and writing directly to the trigger — Cancel/outside-click revert depends on a draft vs confirmed split."
  - "Hardcoding dropdown placement offsets or breakpoints — use placement/data-side for side preference, and keep the container-type: inline-size @container ren-date-range layout under 500px."
  - "Adding extra inline color tokens to .ren-date-range-preset[aria-selected=\"true\"] — the highlighted preset already styles via --color-accent-subtle / --color-accent."
  - "Calling showPopover() directly from outside — use the host's open() / close() / handleApply() / handleCancel() so draft/confirmed state stays consistent."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-calendar-bg, --ren-calendar-border, --ren-calendar-day-size, --ren-calendar-radius, --ren-calendar-range-bg, --ren-calendar-selected-bg, --ren-calendar-selected-color, --ren-calendar-today-bg, --ren-calendar-width."
    - "Semantic surface / text / accent tokens: --color-surface, --color-surface-raised, --color-border, --color-border-strong, --color-text, --color-text-secondary, --color-text-muted, --color-accent, --color-accent-hover, --color-accent-subtle, --color-on-accent, --color-fill, --color-fill-active, --color-danger, --color-success."
    - "Layout/motion tokens: --space-*, --radius-md, --radius-lg, --shadow-lg, --duration-enter, --ease-enter, --transition-tactile, --touch-min, --body-size, --label-size, --weight-semibold."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgba colors for any of the trigger, dropdown, presets, or actions — theme via the semantic and --ren-calendar-* tokens."
    - "Custom transition durations; reuse --duration-enter / --ease-enter so reduced-motion handling continues to apply."

accessibility:
  required:
    - "Trigger is a real <button type=\"button\"> with aria-haspopup=\"dialog\" and aria-expanded synced to the dropdown state."
    - "Dropdown is role=\"dialog\" with aria-label=\"Date range selection\" and focuses the first preset (or first calendar day) on open."
    - "Preset listbox uses role=\"listbox\" with each .ren-date-range-preset as role=\"option\"; the active preset sets aria-selected=\"true\"."
    - ".ren-date-range-summary uses aria-live=\"polite\" so changes to the draft range are announced."
    - "Escape closes via Cancel semantics (reverts draft to confirmed); outside-click does the same — do not silently apply."
    - "Apply button is disabled (real disabled attribute) until both draftStart and draftEnd are present; do not bypass via aria-disabled alone."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-date-range-picker/ren-date-range-picker.css">
<script type="module" src="rends/components/composites/ren-date-range-picker/ren-date-range-picker.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-date-range-picker">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-calendar`
- `.ren-date-range-actions`
- `.ren-date-range-apply`
- `.ren-date-range-calendars`
- `.ren-date-range-cancel`
- `.ren-date-range-divider`
- `.ren-date-range-dropdown`
- `.ren-date-range-empty`
- `.ren-date-range-end`
- `.ren-date-range-error`
- `.ren-date-range-footer`
- `.ren-date-range-inner`
- `.ren-date-range-picker`
- `.ren-date-range-preset`
- `.ren-date-range-presets`
- `.ren-date-range-separator`
- `.ren-date-range-start`
- `.ren-date-range-success`
- `.ren-date-range-summary`
- `.ren-date-range-trigger`
- `.ren-date-range-value`

## States And Attributes

- `[aria-selected]`
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

- `components/composites/ren-date-range-picker/ren-date-range-picker.css`
- `components/composites/ren-date-range-picker/ren-date-range-picker.js`
- `docs/components/ren-date-range-picker.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
