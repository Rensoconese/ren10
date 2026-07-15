# Relume to RenDS Translation Map — Navbar 23

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/patterns/ren-nav/pattern.md`
- `components/primitives/ren-card/component.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-badge/component.md`
- `components/primitives/ren-link/component.md`
- `base/classless.css` details/summary cascade

## RenDS mapping

| Reference part | Ren10 choice | Preserved behavior | Intentional difference |
| --- | --- | --- | --- |
| Navbar shell | One `<ren-nav>` / `<nav class="ren-nav">` | Brand, four entries, two actions, toggle | One landmark and one responsive tree |
| Mega trigger | Native `details/summary` | Disclosure + one chevron | Keyboard native; JS adds stable hover, pin, Escape, outside/destination close |
| Intro region | Constrained start column with heading, copy, real CTA anchor | Title / description / CTA relationship | CTA is a single real `.ren-btn` link, not a framework Button primitive |
| Three products | `ren-grid-3` of whole-card anchors using `.ren-card.ren-card-interactive` | Image / name / variant / price / badge | One anchor per product; badge is non-interactive `ren-badge` |
| Product media | `ren-frame` with 5/6 (10:12) portrait aspect | Cover crop relationship | Local safe demo imagery/gradients only |
| Header actions | Two real anchors styled `.ren-btn` (ghost/outline + primary) | Secondary then primary hierarchy | Ren10 focus/touch; mobile ownership via open shell |
| Mobile shell | Existing Ren10 toggle + shared tree | Collapsed shell and nested mega | Named ARIA toggle; no duplicated tree |
| Motion/elevation | Ren10 tokens / `--ren-z-sticky` | Timing hierarchy and overlay | Reduced motion; no raw values |

## Interaction contract

- Desktop ≥48rem: hover preview over the combined summary+panel region; crossing into intro/products must remain open.
- First pointer click pins; second closes. Enter/Space use native summary.
- Escape closes and restores focus to the summary (or hierarchical restore when focus was inside the open panel).
- Outside click and every mega destination class close: product cards, intro CTA.
- Header action activation closes the mobile shell via ren-nav when applicable.
- Mobile <48rem is activation-only; closing the mobile shell closes the mega.
- Exactly one authored chevron; no classless pseudo-chevron; no duplicate close chrome.

## Cascade risks

| Risk | Mitigation |
| --- | --- |
| Native details card chrome/marker/divider | Block-scoped reset of border/radius/padding/margins/markers/open divider |
| Double chevron | Neutralize `summary::after`; one SVG owner |
| Cramped intro/products | `ren-with-sidebar` variables and responsive product columns |
| Nested controls in products | Entire product is one anchor; badge and price are spans |
| Portrait distortion | `ren-frame` 5/6 with object-fit cover |
| Duplicate landmarks/trees | One `nav.ren-nav`, one `ul.ren-nav-links`; mega regions are labeled content |
| Mobile center alignment | Shared tree stretches and rows align start |
| Full-width mega corridor | Panel seam + lateral hover zone JS; pointer leave defers to geometry |
| Raw elevation/motion | Public tokens only |

## Responsive adaptation

- Ren10 shell breakpoint remains **48rem** (767/768 mobile, 769 desktop).
- Mobile: one open shell; intro stacks above products; products one column by default (two-up when space allows at mid-mobile/tablet); nested disclosure in flow.
- Tablet ≥48rem and <64rem: horizontal shell; mega absolute full band; intro stacks above or beside a readable product grid.
- Wide desktop ≥64rem: intro sidebar constrained; three product columns side-by-side.
- JS-disabled mobile exposes the one tree, both actions, and native disclosure while hiding inert toggle.

## Token/layout policy

- Semantic/component tokens only; no primitive palette tokens, hardcoded color, numeric z-index, or raw motion.
- Use `ren-with-sidebar`, `ren-grid-3`, `ren-stack`, `ren-row`, `ren-cluster`, `ren-frame` before bespoke layout CSS.
- Bespoke CSS is limited to disclosure neutralization, desktop full-band panel geometry, pointer bridge, product badge overlay, and responsive shell integration.

## Progressive enhancement

1. One semantic tree includes three plain links, one disclosure, three product anchors, and the intro CTA.
2. Native disclosure works without JavaScript; mobile fallback exposes the tree and actions.
3. Ren-nav owns mobile toggle; block controller adds desktop pointer policy and dismissal behavior.

## Rejected mappings

- `ren-menu` or menu roles for navigation destinations.
- Top-layer popover for a panel that must become in-flow on mobile.
- Nested button/link inside a product anchor.
- Duplicated desktop/mobile trees or nested nav landmarks.
- Editorial featured rails, six-card grids, icon lists, or social footers borrowed from Navbar 5–16.
- Core breakpoint changes, source framework dependencies, raw tokens, or Shadow DOM.
