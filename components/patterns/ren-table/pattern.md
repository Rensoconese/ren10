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
