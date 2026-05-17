# ren-table Pattern Contract

Data table pattern with sorting, row state, selection, and dense scanning.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-table` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-table` pattern.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Table pattern behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this pattern.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The UI is a tabular dataset with rows + columns that needs sortable headers (.ren-th-sortable + data-sort)."
    - "You need row selection (multi-select with shift-click range) using a leading <input type=\"checkbox\"> in .ren-table-select cells."
    - "You need client-side pagination (.ren-table-pagination + data-page-prev/data-page-next/data-page-size-select buttons)."
    - "You need search / filter via a [data-table-search] input inside .ren-table-toolbar."
    - "You need density variants (.ren-table-compact, .ren-table-comfortable) or sticky / pinned headers and columns."
    - "You need integrated empty state (.ren-table-empty) and loading shimmer ([data-loading] + .ren-table-loading-overlay)."
  avoidWhen:
    - "The data is a list of cards / tiles — use ren-card grid, not a table."
    - "There are only 2-3 key/value pairs per item — use ren-description-list."
    - "It is a tree / hierarchical view — use ren-tree."
    - "It is a single read-only stat — use ren-stat / ren-metric."
    - "The dataset is bigger than what fits in memory — pair with server-side pagination, not the built-in client pager."

canonicalImports:
  css:
    - "rends/components/patterns/ren-table/ren-table.css"
  js:
    - "rends/components/patterns/ren-table/ren-table.js"
  notes:
    - "JS registers <ren-table> and owns sorting, selection, pagination, keyboard nav, column resize, and search filter."
    - "Use real <table>, <thead>, <tbody>, <tr>, <th>, <td> — the JS hooks the standard elements; do not replace with divs."

requiredMarkup:
  - "Root is <ren-table data-page-size=\"…\"> wrapping a <div class=\"ren-table-wrapper\"> > <table class=\"ren-table\">."
  - "Header row uses <thead class=\"ren-table-header\"><tr><th class=\"ren-th\">…</th></tr></thead>; sortable headers add .ren-th-sortable + data-column=\"<key>\"."
  - "Body rows are <tr class=\"ren-tr\" data-row-id=\"…\"> with <td class=\"ren-td\"> cells; selection column uses class .ren-table-select on both th/td and a real <input type=\"checkbox\" aria-label=\"Select row\">."
  - "Pagination chrome goes in <div class=\"ren-table-pagination\"> with .ren-table-pagination-info + .ren-table-pagination-controls containing buttons carrying [data-page-prev] / [data-page-next] / [data-page-size-select]."
  - "Toolbar lives in <div class=\"ren-table-toolbar\"> and the search box must include the [data-table-search] attribute so the JS wires filtering."
  - "Empty state is <div class=\"ren-table-empty\"> with .ren-table-empty-icon / .ren-table-empty-title / .ren-table-empty-description (or reuse the ren-empty-state pattern)."

forbiddenPatterns:
  - "Replacing <table> with <div role=\"table\"> — kills native keyboard / screen-reader support."
  - "Implementing sort by clicking a non-th element — sort affordance must live on <th class=\"ren-th-sortable\">."
  - "Setting [data-sort] manually from consumer code — the component owns asc/desc cycling."
  - "Custom checkbox UI inside .ren-table-select — keep the native <input type=\"checkbox\"> (accent-color is themed via --color-accent)."
  - "Toggling rows with display: none for filtering — let the JS manage row visibility through its filter pipeline."
  - "Hardcoding pinned column offsets — use .ren-th-pinned / .ren-td-pinned which already set sticky positioning."

tokenPolicy:
  allowed:
    - "Public component tokens listed in Public Token API: --ren-table-border-color, --ren-table-cell-padding, --ren-table-header-bg, --ren-table-header-color, --ren-table-header-size, --ren-table-header-weight, --ren-table-hover-bg, --ren-table-row-height, --ren-table-selected-bg, --ren-table-stripe-bg."
    - "Semantic tokens consumed by selectors: --color-surface, --color-surface-raised, --color-border, --color-text, --color-text-muted, --color-fill, --color-fill-hover, --color-accent, --color-on-accent, --color-accent-subtle."
    - "Spacing / radius / type tokens: --space-2, --space-3, --space-4, --space-10, --radius-sm, --radius-md, --stroke-1, --body-size, --label-size, --label-weight, --caption-size, --touch-min."
    - "Motion tokens: --duration-tactile, --duration-state, --ease-enter."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) for stripes, borders, or selection."
    - "Hardcoded hex / named colors for hover, selected, or accent."
    - "Inline transition values — use --duration-* / --ease-* tokens."

accessibility:
  required:
    - "Use a real <table> with <thead> / <tbody>; sortable <th> elements set aria-sort=\"ascending|descending|none\" mirroring [data-sort]."
    - "Selection checkboxes are real <input type=\"checkbox\"> with aria-label (\"Select all\" / \"Select row N\"); rows reflect state via aria-selected=\"true\" on <tr>."
    - "Pagination buttons are real <button> with min-width/height of 44px (--touch-min); disabled state uses the disabled attribute, not opacity alone."
    - "Loading state sets [data-loading] on <ren-table> and exposes pointer-events: none on rows; pair with an aria-live announcement so SR users hear \"Loading…\" / \"Loaded N rows\"."
    - "Empty state must include a visible .ren-table-empty-title text; do not rely on icon alone."
    - "Focus rings on <th>, <td>, .ren-tr (:focus-within), and pagination buttons all use --color-accent — never strip without restoring a visible alternative."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/patterns/ren-table/ren-table.css">
<script type="module" src="rends/components/patterns/ren-table/ren-table.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-table">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-table`
- `.ren-table-body`
- `.ren-table-comfortable`
- `.ren-table-compact`
- `.ren-table-empty`
- `.ren-table-empty-description`
- `.ren-table-empty-icon`
- `.ren-table-empty-title`
- `.ren-table-header`
- `.ren-table-loading-overlay`
- `.ren-table-pagination`
- `.ren-table-pagination-button`
- `.ren-table-pagination-controls`
- `.ren-table-pagination-info`
- `.ren-table-select`
- `.ren-table-toolbar`
- `.ren-table-toolbar-search`
- `.ren-table-wrapper`
- `.ren-td`
- `.ren-td-pinned`
- `.ren-th`
- `.ren-th-pinned`
- `.ren-th-resize`
- `.ren-th-sortable`
- `...and 1 more in the source files.`

## States And Attributes

- `[aria-selected]`
- `[data-loading]`
- `[data-page-next]`
- `[data-page-prev]`
- `[data-page-size-select]`
- `[data-sort]`
- `[data-table-search]`
- `:active`
- `:checked`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-table-border-color`
- `--ren-table-cell-padding`
- `--ren-table-header-bg`
- `--ren-table-header-color`
- `--ren-table-header-size`
- `--ren-table-header-weight`
- `--ren-table-hover-bg`
- `--ren-table-row-height`
- `--ren-table-selected-bg`
- `--ren-table-stripe-bg`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/patterns/ren-table/ren-table.css`
- `components/patterns/ren-table/ren-table.js`
- `docs/components/ren-table.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
