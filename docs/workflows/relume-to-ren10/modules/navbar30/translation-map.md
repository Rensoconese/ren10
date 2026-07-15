# Relume to RenDS Translation Map — Navbar 30

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/patterns/ren-nav/pattern.md`
- `components/primitives/ren-card/component.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-link/component.md`
- `base/classless.css` details/summary cascade

## RenDS mapping

| Reference part | Ren10 choice | Preserved behavior | Intentional difference |
| --- | --- | --- | --- |
| Navbar shell | One `<ren-nav>` / `<nav class="ren-nav">` | Brand, four entries, two actions, toggle | One landmark and one responsive tree |
| Mega trigger | Native `details/summary` + one SVG chevron | Disclosure + chevron rotation | Keyboard native; JS adds stable hover corridor, pin, Escape, outside/destination close, focus return |
| Category columns | Three labeled groups of five real anchors | 3×5 title-only destinations | Not nested `nav` landmarks; headings + lists |
| Product cards | Two whole-card anchors using `.ren-card.ren-card-interactive` + `ren-frame` 3:2 | Image + title relationship | Description field not rendered (matches source render); no nested button |
| Two-region mega layout | `ren-with-sidebar` / grid primitives (`ren-grid-3`, `ren-grid-2`) | Categories peer to product media band | Ren10 tracks/gaps; no source utilities |
| Header actions | Two real anchors styled `.ren-btn` (secondary + primary) | End cluster desktop; stacked full-width in open mobile shell | Ren10 focus/touch; single action DOM, CSS rehost |
| Mobile shell | Ren10 toggle + shared tree | Collapsed chrome; nested mega in flow | Named ARIA toggle; no duplicated tree |
| Motion/elevation | Ren10 duration/easing + `--ren-z-sticky` | Timing hierarchy and sticky stacking | Reduced-motion branch; no raw values |

## Interaction contract

- Desktop ≥48rem: hover preview over the combined summary+panel corridor;
  crossing into category links or product cards must remain open.
- First pointer click pins; second closes. Enter/Space use native summary.
- Escape closes and restores focus to the summary — including when focus is
  already on a mega destination or product card.
- Outside click and activation of every destination class (category link,
  product card, and top-level CTA action anchors that leave the disclosure
  context) close the mega.
- Mobile <48rem is activation-only; closing the mobile shell closes the mega.
- Same-breakpoint resize must not thrash open state; crossing 48rem resets
  hover policy and closes open mega.
- Exactly one authored chevron; no classless pseudo-chevron; single close
  affordance on the mobile toggle.

## Cascade risks

| Risk | Mitigation |
| --- | --- |
| Native details card chrome/marker/divider | Block-scoped reset of border/radius/padding/margins/markers/open divider |
| Double chevron | Neutralize `summary::after`; one SVG owner |
| Full-viewport panel overflow | Panel under bar, constrained inner width, overflow checks at 320/340/390/767–769/834/1280 |
| Product card nested controls | Entire card is one anchor; title is text, media is non-interactive |
| Duplicate landmarks/trees | One `nav.ren-nav`, one `ul.ren-nav-links`; category groups are labeled content |
| Mobile center alignment | Shared tree stretches; rows align start |
| Raw elevation/motion | Public tokens only |

## Responsive adaptation

- Ren10 shell breakpoint remains **`48rem`** (matches `ren-nav`; ~768px).
  Source 991px interaction constant is not preserved.
- Mobile: one open shell; categories and products stack; product cards one
  column by default; nested disclosure in flow; actions stacked full-width.
- Tablet ≥48rem and mid widths: horizontal shell; mega absolute full-width;
  category groups readable (1–3 columns by width); two product cards side by
  side when space allows.
- Wide desktop: three category columns beside two product cards; media ~3:2.
- JS-disabled mobile exposes the one tree, native disclosure, and actions while
  hiding the inert toggle.

## Token/layout policy

- Semantic/component tokens only; no primitive palette tokens, hardcoded color,
  numeric z-index, or raw motion durations.
- Use `ren-nav`, `ren-with-sidebar`, `ren-grid-2` / `ren-grid-3`, `ren-stack`,
  `ren-row`, `ren-cluster`, `ren-frame` before bespoke layout CSS.
- Bespoke CSS is limited to disclosure neutralization, desktop full-width panel
  geometry, pointer corridor, and responsive shell integration.

## Progressive enhancement

1. One semantic tree includes three plain links, the mega disclosure, fifteen
   category destinations, and two product-card anchors.
2. Native disclosure works without JavaScript; mobile fallback exposes the tree
   and actions.
3. Ren-nav owns mobile toggle; block controller adds desktop pointer policy,
   Escape/focus return, outside/destination close, and breakpoint reset.

## Rejected mappings

- `ren-menu` or menu roles for navigation destinations.
- Top-layer popover for a panel that must become in-flow on mobile.
- Nested button/link inside a product card.
- Duplicated desktop/mobile trees or nested nav landmarks.
- Rendering the unused source description field on product cards.
- Six-card editorial grid (Navbar 10) or featured/footer/rail mega variants.
- Core breakpoint changes, source framework dependencies, raw tokens, or Shadow DOM.
