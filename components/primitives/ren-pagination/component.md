# ren-pagination Component Contract

Pagination navigation for page ranges and previous/next movement.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-pagination` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-pagination` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Pagination primitive behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this primitive.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "A list, table, or grid is broken into discrete numbered pages with a known total count."
    - "You need prev / next + numbered items with aria-current=\"page\" on the active page."
    - "You need a minimal prev / info / next layout (.ren-pagination-simple) when total pages is unknown."
    - "You need a compact variant for dense tables (.ren-pagination-compact)."
    - "You need a centered standalone block under content (.ren-pagination-centered)."
    - "You need an ellipsis spacer between page ranges (.ren-pagination-ellipsis)."
  avoidWhen:
    - "The feed is infinite-scroll or load-more — use a button + scroll observer, not pagination."
    - "The data is paged by cursor with no concept of page numbers — show only prev/next."
    - "You need step navigation inside a wizard — use a stepper component."
    - "The navigation is between sibling sections of a page — use tabs or anchor links."

canonicalImports:
  css:
    - "rends/components/primitives/ren-pagination/ren-pagination.css"
  notes:
    - "CSS-only primitive; no JavaScript file exists for ren-pagination."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Wrap the control in a real <nav aria-label=\"Pagination\"> with class=\"ren-pagination\"."
  - "Each page link is an <a href=\"...\"> with class=\"ren-pagination-item\"; mark the active page with aria-current=\"page\" (it auto-disables pointer-events)."
  - "Prev / next are <a class=\"ren-pagination-prev\"> / <a class=\"ren-pagination-next\"> with aria-label describing direction when the content is a glyph (e.g., aria-label=\"Previous page\")."
  - "Use <span class=\"ren-pagination-ellipsis\" aria-hidden=\"true\">…</span> for visual gaps — it must not be focusable."
  - "Disabled prev/next use aria-disabled=\"true\" (preferred for <a>) or disabled (for <button>)."

forbiddenPatterns:
  - "<div role=\"navigation\"> or <ul> instead of <nav> for the wrapper."
  - "Plain <span> or <button> styled as a pagination item — use <a class=\"ren-pagination-item\">."
  - "Marking the active page with only a CSS class — must include aria-current=\"page\" for screen readers."
  - "Hiding disabled prev/next via display: none — keep them in DOM with aria-disabled so layout stays stable."
  - "Hardcoded color overrides on the active item that bypass --color-accent / --color-on-accent."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-pagination-active-bg, --ren-pagination-active-color, --ren-pagination-bg, --ren-pagination-font-size, --ren-pagination-gap, --ren-pagination-hover-bg, --ren-pagination-radius, --ren-pagination-size."
    - "Semantic tokens consumed internally: --color-text, --color-text-muted, --color-accent, --color-on-accent, --color-fill, --color-fill-hover, --color-disabled-text, --color-focus-ring."
    - "Layout tokens: --touch-min, --size-sm, --space-1, --space-2, --radius-md, --stroke-1, --ring-width, --ring-offset-width, --duration-tactile, --ease-enter."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Inline width/height styling that breaks min 44px touch target on default variant."

accessibility:
  required:
    - "Wrapper is a real <nav> landmark with aria-label=\"Pagination\" (or equivalent)."
    - "Active page uses aria-current=\"page\"; do not duplicate it on a separate <span>."
    - "Default and simple variants guarantee min 44px touch targets (--touch-min); compact variant is for non-touch contexts only."
    - "Visible :focus-visible ring driven by --color-focus-ring + --ring-width / --ring-offset-width."
    - "Glyph-only prev/next provide an aria-label so the direction is announced."
    - "Disabled prev/next set aria-disabled=\"true\" AND pointer-events: none (handled by CSS); do not rely on visual dimming alone."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-pagination/ren-pagination.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-pagination">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-pagination`
- `.ren-pagination-centered`
- `.ren-pagination-compact`
- `.ren-pagination-ellipsis`
- `.ren-pagination-info`
- `.ren-pagination-item`
- `.ren-pagination-next`
- `.ren-pagination-prev`
- `.ren-pagination-simple`

## States And Attributes

- `[aria-current]`
- `[aria-disabled]`
- `:active`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-pagination-active-bg`
- `--ren-pagination-active-color`
- `--ren-pagination-bg`
- `--ren-pagination-font-size`
- `--ren-pagination-gap`
- `--ren-pagination-hover-bg`
- `--ren-pagination-radius`
- `--ren-pagination-size`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-pagination/ren-pagination.css`
- `docs/components/ren-pagination.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
