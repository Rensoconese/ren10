# Layout Contract

Load this file before writing custom layout CSS. RenDS layouts are public API:
agents should compose with layout primitives first and only write bespoke
layout CSS when the primitive set does not cover the problem.

## Purpose

- Keep page structure consistent across RenDS consumers.
- Avoid one-off `display: flex` and `display: grid` rules that duplicate the
  foundation.
- Ensure responsive behavior follows the same spacing, width, and container
  rules as the rest of the system.

## Routing Table

| Need | Use | Avoid |
|---|---|---|
| Vertical flow | `ren-stack`, `ren-stack-sm`, `ren-stack-lg` | Custom column flex |
| Inline wrapping group | `ren-cluster` | Custom wrap flex |
| Horizontal row | `ren-row` | Repeated `display:flex; align-items:center` |
| Left/right spread | `ren-row-spread` | Custom `justify-content: space-between` |
| Centered content | `ren-center`, `ren-center-narrow`, `ren-center-wide`, `ren-center-prose` | Fixed width + auto margins |
| Responsive cards | `ren-grid`, `ren-grid-2`, `ren-grid-3`, `ren-grid-4` | Hand-authored repeat grids |
| Sidebar + content | `ren-with-sidebar` | Custom fixed sidebar layout |
| Full-screen centered surface | `ren-cover` | `min-height:100vh` centering |
| Aspect-ratio media | `ren-frame`, `ren-frame-square`, `ren-frame-photo` | Ad hoc aspect wrappers |
| Responsive direction switch | `ren-switcher` | Viewport-only flex swaps |
| Horizontal scroll | `ren-reel` | Raw overflow and scroll snap |

`ren-grid-2/3/4` are modifiers: they only set the column count, so they must be
combined with `ren-grid`. For anything beyond a plain card row - full-bleed
zones, explicit spans, subgrid alignment, bento, animated sidebars - route
through the Grid Routing Table below. `base/grid.css` is already loaded by
`index.css`; its classes are public API, not internals.

## Grid Routing Table

| Need | Use | Instead of |
|---|---|---|
| Plain responsive card row | `ren-grid` (+ `ren-grid-2/3/4`) | Hand-written `repeat(auto-fit, ...)` |
| Item grid that keeps column width stable | `ren-auto-grid`, `ren-auto-grid-sm`, `ren-auto-grid-lg` | `ren-grid`, which stretches few items to full width |
| Cards whose media/title/body/footer align across the row | `ren-card-grid` | Fixed heights or equal-height scripts |
| Column count driven by how many items exist | `ren-quantity-grid` | Counting children in JS |
| Content that must break out of the text column | `ren-page-grid` + `ren-full-bleed` / `ren-feature` / `ren-popout` | Negative margins, `100vw` tricks |
| Same, but capped at reading width | `ren-prose-grid` | `max-width: 65ch` wrapper plus breakout hacks |
| Explicitly designed column spans | `ren-col-grid` + `ren-col-*`, `ren-col-start-*` | Bootstrap-style bespoke grid |
| Full-height app shell with pinned footer | `ren-pancake` | `min-height:100vh` + `margin-top:auto` |
| Sidebar that collapses with animation | `ren-sidebar-grid` (`data-collapsed`) | JS width tweens; `ren-with-sidebar` when it never collapses |
| One column below a threshold, exactly N above | `ren-albatross` | Viewport media queries |
| Irregular tile showcase | `ren-bento` + `ren-tile-main/-medium/-small` | Absolute positioning |
| Strict baseline module grid | `ren-modular-grid` | Per-section fixed heights |
| Nested grid aligned to the parent tracks | `ren-subgrid`, `ren-subgrid-rows`, `ren-subgrid-both` | Redeclaring the same tracks on the child |
| Long list that stutters while scrolling | `ren-lazy-section`, `ren-contain` | JS virtualization |
| Animated grid template change or item reveal | `ren-grid-animate`, `ren-grid-item-reveal` | Height/opacity tweens in JS |
| Keyboard order must follow visual grid order | `ren-grid-reading-flow` | `tabindex` juggling |

## Grid Primitives (base/grid.css)

| Primitive | Solves | Choose over | Config and contract |
|---|---|---|---|
| `ren-page-grid` | Page shell with named breakout zones | `ren-center*`, when nothing breaks out | Direct children default to the content zone; `.ren-full-bleed` goes edge to edge, `.ren-feature` adds up to 7rem per side, `.ren-popout` up to 2rem. Vars: `--grid-max-width` (1280px), `--grid-margin`, `--grid-gutter` (row gap). Below 768px feature/popout nearly collapse to content width |
| `ren-prose-grid` | Article body capped at reading width with full-bleed figures | `ren-page-grid`, when the column should be 1280px rather than 65ch | Content = `min(--width-prose, 100% - 2x --grid-margin)`. Only `.ren-full-bleed` and `.ren-feature` (up to 3rem per side) are wired here; `.ren-popout` has no rule inside this grid |
| `ren-col-grid` + `ren-col-1..12`, `ren-col-start-1..12`, `ren-col-md-*`, `ren-col-lg-*` | Layouts where spans are a design decision, not a consequence of item width | `ren-auto-grid`, when the column count should follow content | `--grid-columns` (12), `--grid-gutter`. Mobile-first: bare `ren-col-N` applies at every width, `ren-col-md-*` overrides from 768px, `ren-col-lg-*` from 1024px. Offsets follow the same three tiers: `ren-col-start-N`, `ren-col-md-start-N`, `ren-col-lg-start-N` |
| `ren-auto-grid`, `-sm` (10rem), `-lg` (20rem) | Reflowing grid with a stable column width; unused tracks stay empty (`auto-fill`) so two items do not stretch across the row | `ren-grid`, which uses `auto-fit` and does stretch them - pick that when stretching is what you want | `--auto-grid-min` (15rem), `--auto-grid-gap` (`--grid-gutter`), `--auto-grid-placement` (set `auto-fit` to stretch). The `-sm`/`-lg` variants hardcode their minimum, so only the base class reacts to `--auto-grid-min` |
| `ren-card-grid` | Cards whose internal rows line up across the whole row via subgrid | `ren-auto-grid`, when internal alignment does not matter (no markup contract) | Each card needs exactly 4 direct children in order: media, title, body, footer; the body row is the flexible `1fr`. Sized by `--grid-min-item` / `--grid-gutter`. Explicit tracks cover 4 rows of cards, later rows fall back to auto sizing. Degrades to a plain grid where subgrid is unsupported |
| `ren-quantity-grid` | Column count derived from the number of children, with no classes on the items | `ren-auto-grid`, when the column width matters more than the item count | 1 item gives 1 column, 2 gives 2, 3 or 4 gives 3, 5+ switches to auto-fill from `--grid-min-item`. Capped at 2 columns below 1024px and 1 column below 640px |
| `ren-pancake` | Full-height shell where main absorbs free space and the footer stays at the bottom | `ren-cover`, which centers a hero instead of framing the page | Rows are assigned by tag, so it needs direct `header` / `main` / `footer` elements. `--pancake-height` (100dvh). No gap: pad the rows |
| `ren-sidebar-grid` | Sidebar plus content, collapsible without JS layout math | `ren-with-sidebar` (flex) when there is no collapse; that one wraps, this one animates | Sidebar is the first child, sized `minmax(--sidebar-min 15rem, --sidebar-max 25%)`. `data-collapsed` on the container animates the track to `0fr` using `--duration-normal` / `--ease-out`. Below 768px it stacks, and collapsed means the first child is clipped to zero height |
| `ren-albatross` | One column below a threshold, exactly N above, keyed to the container width so it works inside cards and panels | `ren-auto-grid`, when a gradual 1 to 2 to 3 ramp is wanted - this is an all-or-nothing switch | `--albatross-bp` (40rem), `--albatross-cols` (3), gap `--grid-gutter`. No media or container queries involved |
| `ren-bento` + `ren-tile-main` (2x2), `ren-tile-medium` (1 col x 2 rows), `ren-tile-small` (1x1) | Irregular tile showcase over a fixed row rhythm | `ren-auto-grid`, when tiles are uniform - bento only pays off with mixed sizes | `--bento-cols` (12; 6 below 900px, 4 below 600px), `--bento-row` (6rem, fixed, so taller content overflows unless it spans more rows). Tile spans are column counts, not fractions: at 12 columns `ren-tile-small` is 1/12 wide, so lower `--bento-cols` or set `grid-column: span N` yourself |
| `ren-modular-grid` | Swiss baseline module where every block snaps to the same row height | `ren-bento`, when irregular tiles matter more than a strict baseline | `--mod-cols` (6; 4 below 768px, 2 below 640px), `--mod-row` (4.5rem). Items place themselves with `grid-column` / `grid-row: span N`; fixed row height means overflow when content is taller |
| `ren-subgrid`, `ren-subgrid-rows`, `ren-subgrid-both` | Nested grid that adopts the parent tracks so nested content aligns to the outer rhythm | `ren-card-grid`, when the case is literally a card list (it wires subgrid for you) | Only meaningful on a grid item that spans several tracks (`grid-column` / `grid-row: span N`). Without subgrid support they fall back to 12 columns and `auto 1fr auto` rows |
| `ren-lazy-section`, `ren-contain` | Skip rendering offscreen items (`content-visibility: auto`) and isolate layout/style/paint | Plain markup - add only when a long list actually stutters | `--lazy-height` (600px) reserves the placeholder size; a wrong value makes the scrollbar jump. `ren-contain` clips paint, so never put it on a wrapper that a tooltip, popover, or dropdown must escape |
| `ren-grid-animate`, `ren-grid-item-reveal`, `ren-grid-reading-flow` | Animate a changing grid template, fade and scale items in, make keyboard order follow visual grid order | `ren-sidebar-grid`, which already animates itself - `ren-grid-animate` is for other grids whose template changes | Timing from `--duration-normal` / `--ease-out`. `ren-grid-item-reveal` honors `prefers-reduced-motion` and has no stagger built in (add `animation-delay` per item). `ren-grid-reading-flow` only applies where `reading-flow` is supported |

## Grid Configuration

All grid variables are declared at `:root` and can be overridden on any element,
inline or in a rule, without writing new grid CSS.

| Variable | Default | Affects |
|---|---|---|
| `--grid-columns` | `12` | `ren-col-grid`, subgrid fallback |
| `--grid-gutter` | `clamp(1rem, 3vw, 1.5rem)` | Gap of every `grid.css` primitive |
| `--grid-margin` | `clamp(1rem, 5vw, 3rem)` | Outer margin of page/prose grids |
| `--grid-max-width` | `var(--width-7xl)` | `ren-page-grid` content zone |
| `--grid-min-item` | `15rem` | Item floor for auto/card/quantity grids |
| `--auto-grid-min`, `--auto-grid-gap`, `--auto-grid-placement` | `--grid-min-item`, `--grid-gutter`, `auto-fill` | `ren-auto-grid` only |
| `--pancake-height` | `100dvh` | `ren-pancake` |
| `--sidebar-min`, `--sidebar-max` | `15rem`, `25%` | `ren-sidebar-grid` |
| `--albatross-bp`, `--albatross-cols` | `40rem`, `3` | `ren-albatross` |
| `--bento-cols`, `--bento-row` | `12`, `6rem` | `ren-bento` |
| `--mod-cols`, `--mod-row` | `6`, `4.5rem` | `ren-modular-grid` |
| `--lazy-height` | `600px` | `ren-lazy-section` |

Naming trap: `ren-grid` (layouts.css) reads `--grid-min` and `--grid-gap`, while
`grid.css` primitives read `--grid-min-item` and `--grid-gutter`. Setting one
does not affect the other. Descendants of `ren-page-grid`, `ren-col-grid`,
`ren-auto-grid`, and `ren-sidebar-grid` get a `--color-focus-ring` outline on
`:focus-visible`. Breakpoints used by `grid.css`: 600px, 640px, 768px, 900px,
1024px.

## Required Imports

```html
<link rel="stylesheet" href="rends/index.css">
```

## Rules

- Decide the page skeleton before selecting components.
- Use layout primitives for structure, then place primitives/composites/patterns
  inside them.
- Prefer `gap` on the parent over margins on children.
- Prefer container-query helpers when behavior depends on component width.
- Keep nested layout primitives shallow; flatten structure when possible.
- Use semantic spacing tokens such as `--space-*`, `--space-card-padding`, and
  `--space-section` when a custom value is unavoidable.
- Use the Grid Routing Table before writing any `grid-template-columns` by hand:
  `base/grid.css` ships the page, col, auto, card, quantity, albatross, bento,
  modular, subgrid, and pancake primitives and is already in the bundle.
- Use `ren-grid` for a plain card row, `ren-auto-grid` to hold column width,
  `ren-card-grid` to align card internals, `ren-quantity-grid` to let the item
  count pick the columns.
- Use `ren-page-grid` or `ren-prose-grid` whenever content must break out of the
  text column; never fake breakouts with negative margins or `100vw`.
- Prefer configuring a grid primitive through its `--grid-*`, `--auto-grid-*`,
  `--sidebar-*`, `--albatross-*`, `--bento-*`, or `--mod-*` variables over
  redeclaring `display: grid`.

## Related Files

- `base/layouts.css` - implementation source of truth.
- `base/grid.css` - grid system source: page/prose zones, 12-column spans,
  auto/card/quantity grids, albatross, bento, modular, subgrid, plus
  containment and animation helpers.
- `base/utilities.css` - small utilities.
- `rends-skill/references/architecture.md` - expanded agent guidance.
- `docs/layouts.html` - visual reference.

## Test Expectations

- Layout changes should keep responsive docs/pages readable at mobile and
  desktop widths.
- Do not add raw layout CSS when an existing primitive can express the same
  structure.
