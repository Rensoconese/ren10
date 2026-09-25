# ren-calendar Component Contract

Calendar grid and date selection composite.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-calendar` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-calendar` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Calendar composite behavior or visual role.
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
    - "The UI needs a full month grid for date browsing or selection."
    - "You need single, range, or multiple selection modes (mode=\"single|range|multiple\")."
    - "Locale-aware month names and first-day-of-week must be supported (locale, first-day attrs)."
    - "min / max bounds must constrain selectable dates."
    - "You need ARIA grid + roving tabindex keyboard navigation across days."
  avoidWhen:
    - "You only need a date text input — use ren-date-picker (composite that may embed ren-calendar)."
    - "You need a year/decade picker without a month grid — use a different control."
    - "The UI is a schedule / agenda view rather than date selection — use a calendar-view pattern."
    - "Only a static date display is needed — use ren-text with a formatted Date."

canonicalImports:
  css:
    - "rends/components/composites/ren-calendar/ren-calendar.css"
  js:
    - "rends/components/composites/ren-calendar/ren-calendar.js"
  notes:
    - "If the page already imports rends/components/index.css, do not import the CSS again."
    - "JS is required: <ren-calendar> renders the grid imperatively; there is no static markup fallback."
    - "Configure via attributes (value, mode, locale, first-day, min, max); avoid manual DOM mutations on .ren-calendar-grid."

requiredMarkup:
  - "Render <ren-calendar> as the host; the component populates its own .ren-calendar-header and .ren-calendar-grid."
  - "The grid follows the ARIA grid structure: .ren-calendar-grid[role=\"grid\"] > rows only — .ren-calendar-weekdays[role=\"row\"] (the header row, 7 × .ren-calendar-weekday[role=\"columnheader\"]) followed by 6 × .ren-calendar-week[role=\"row\"] (7 × [role=\"gridcell\"] each). Cells are never direct children of the grid."
  - "Rows are ARIA structure only: .ren-calendar-weekdays and .ren-calendar-week are display: contents inside the grid, so the 7-column track stays on .ren-calendar-grid. Do not give them their own layout."
  - "Each day cell is a real <button class=\"ren-calendar-day\" role=\"gridcell\"> with aria-selected and (when applicable) data-today / data-outside / [disabled]."
  - "Navigation arrows use .ren-calendar-prev / .ren-calendar-next inside .ren-calendar-nav and rely on the component's chevron pseudo-elements."
  - "Use .ren-calendar-sm or .ren-calendar-lg on the host for size variants; do not invent custom size classes."
  - "For ranges, the component sets .ren-calendar-day-range-start, .ren-calendar-day-in-range, .ren-calendar-day-range-end — do not author these by hand."

forbiddenPatterns:
  - "Putting [role=\"gridcell\"] or [role=\"columnheader\"] directly under [role=\"grid\"] without a [role=\"row\"] wrapper — fails axe aria-required-children and aria-required-parent (WCAG 2.1 A, 1.3.1)."
  - "Giving .ren-calendar-week or the in-grid .ren-calendar-weekdays a display other than contents — it breaks the shared 7-column track and misaligns headers from cells."
  - "Replacing day <button>s with <div role=\"button\"> — breaks keyboard + screen reader expectations."
  - "Hardcoded today highlight (border: 2px solid #...) — rely on [data-today] and --color-accent."
  - "Toggling a day's selected state by adding a custom class instead of aria-selected=\"true\"."
  - "Mounting the calendar inside a non-modal popover without focus management — wrap in ren-popover or ren-dialog if floating."
  - "Hardcoded weekday labels in the markup; the component renders them from locale."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-calendar-bg, --ren-calendar-border, --ren-calendar-day-size, --ren-calendar-radius, --ren-calendar-range-bg, --ren-calendar-selected-bg, --ren-calendar-selected-color, --ren-calendar-today-bg, --ren-calendar-width."
    - "Semantic tokens: --color-surface-raised, --color-border, --color-text, --color-text-muted, --color-text-faint, --color-fill, --color-fill-active, --color-accent, --color-accent-subtle, --color-on-accent."
    - "Layout / motion tokens: --space-*, --radius-*, --shadow-md, --touch-min, --duration-enter, --ease-enter, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Hardcoded day-cell sizes; tune --ren-calendar-day-size or pick the .ren-calendar-sm / .ren-calendar-lg variant."

accessibility:
  required:
    - "The grid is a complete ARIA grid: role=\"grid\" > role=\"row\" > role=\"columnheader\" / role=\"gridcell\". A flat grid of gridcells is invalid ARIA and screen readers lose row/column context."
    - "The weekday header row lives INSIDE the grid as role=\"row\" with role=\"columnheader\" cells, so AT can announce the weekday alongside the date; each columnheader carries the full locale weekday name in aria-label because the visible text is a 2-letter abbreviation."
    - "The grid is named by the month/year title through aria-labelledby, so entering it announces the month being browsed."
    - "Day cells implement the ARIA grid pattern with a single roving tabindex; never expose more than one tab stop in the grid."
    - "Keyboard: Arrow keys move focus between days, PageUp/PageDown move months, Home/End jump within a week — preserve these in any customization."
    - "Selected days set aria-selected=\"true\"; do not communicate selection through color alone."
    - "Today indicator uses [data-today] AND an inset ring (box-shadow); the ring is required so color-blind users perceive today."
    - "Out-of-month days set [data-outside] and pointer-events: none; do not let them receive focus."
    - "Min/max bounds disable cells via the native [disabled] attribute so the browser blocks activation."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-calendar/ren-calendar.css">
<script type="module" src="rends/components/composites/ren-calendar/ren-calendar.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<ren-calendar value="2026-07-10" aria-label="Choose a date"></ren-calendar>

```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-calendar`
- `.ren-calendar-day`
- `.ren-calendar-day-in-range`
- `.ren-calendar-day-range-end`
- `.ren-calendar-day-range-start`
- `.ren-calendar-grid`
- `.ren-calendar-header`
- `.ren-calendar-lg`
- `.ren-calendar-nav`
- `.ren-calendar-next`
- `.ren-calendar-prev`
- `.ren-calendar-sm`
- `.ren-calendar-title`
- `.ren-calendar-week`
- `.ren-calendar-weekday`
- `.ren-calendar-weekdays`

## States And Attributes

- `[aria-selected]`
- `[data-outside]`
- `[data-today]`
- `:active`
- `:disabled`
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

- `components/composites/ren-calendar/ren-calendar.css`
- `components/composites/ren-calendar/ren-calendar.js`
- `docs/components/ren-calendar.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
