# Relume to RenDS Translation Map — Navbar 29

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
| Mega trigger | Native `details/summary` | Disclosure and one chevron | Keyboard native; JS adds stable hover, pin, Escape, outside/link close |
| Mega two-region layout | `ren-with-sidebar` | Narrow category column + wide collection region | Responsive Ren10 tracks, no source utilities |
| Five-link category | Heading + list of five real anchors | Count/order and narrow emphasis | Not a second nav landmark |
| Four overlay collections | `ren-grid` four-up of whole-card anchors | Image/title/description/CTA relationship | One anchor per card; source nested button becomes non-interactive CTA text; overlay styling via tokens |
| Collection media | Cover media inside card with tokenized scrim | Full-bleed overlay-card relationship | Local safe demo imagery/gradients only; no copied source assets |
| Header actions | Two real anchors styled `.ren-btn` | Secondary + primary hierarchy | Single ownership; CSS shows them end-aligned on desktop and stacked under the open mobile tree |
| Mobile shell | Existing Ren10 toggle and shared tree | Collapsed shell and nested mega | Named ARIA toggle, no duplicated tree |
| Motion/elevation | Ren10 tokens / `--ren-z-sticky` | Timing hierarchy and overlay | Reduced motion; no raw values |

## Interaction contract

- Desktop ≥48rem: hover preview over the combined summary+panel region; crossing
  into category links or collection cards must remain open.
- First pointer click pins; second closes. Enter/Space use native summary.
- Escape closes and restores focus to the summary even when focus was on a
  destination inside the panel.
- Outside click and any mega destination activation close (category links and
  collection cards). This module has no social or mega-footer destination
  classes; header CTAs and brand do not need to act as mega destinations.
- Mobile <48rem is activation-only; closing the mobile shell closes the mega.
- Exactly one authored chevron; no classless pseudo-chevron. Toggle morph is
  owned by ren-nav (three spans → close affordance), not a second icon set.

## Cascade risks

| Risk | Mitigation |
| --- | --- |
| Native details card chrome/marker/divider | Block-scoped reset of border/radius/padding/margins/markers/open divider |
| Double chevron | Neutralize `summary::after`; one SVG owner |
| Overlay text contrast | Tokenized dark scrim + light on-scrim text; axe AA required |
| Nested interactive CTA | Entire collection is one anchor; CTA is plain text span |
| Full-width panel stacking | Panel absolute under bar with `--ren-z-sticky`; no html/root overflow |
| Duplicate landmarks/trees | One `nav.ren-nav`, one `ul.ren-nav-links`; mega regions are labeled content |
| Dual source breakpoints | One Ren10 48rem shell/interaction boundary |
| Raw elevation/motion | Public tokens only |

## Responsive adaptation

- Ren10 shell breakpoint remains `48rem`.
- Mobile: one open shell; category group and four overlay cards stack; cards one
  column; nested disclosure in flow; actions stack full-width below links.
- Tablet ≥48rem and <64rem: horizontal shell; mega absolute full-width under bar;
  category column remains readable; collection grid may reflow to two-up before
  four-up.
- Wide desktop ≥64rem: `ren-with-sidebar` with narrow five-link column and
  four-column collection grid of overlay cards.
- JS-disabled mobile exposes the one tree and native disclosure while hiding
  inert toggle.

## Token/layout policy

- Semantic/component tokens only; no primitive palette tokens, hardcoded color,
  numeric z-index, or raw motion.
- Use `ren-with-sidebar`, `ren-grid`, `ren-stack`, `ren-row`, `ren-cluster`, and
  related primitives before bespoke layout CSS.
- Bespoke CSS is limited to disclosure neutralization, full-width desktop panel
  geometry, pointer bridge, overlay-card treatment, and responsive shell
  integration.

## Progressive enhancement

1. One semantic tree includes the five category links and four whole-card
   collection anchors.
2. Native disclosure works without JavaScript; mobile fallback exposes the tree
   and actions.
3. Ren-nav owns mobile toggle; block controller adds desktop pointer policy and
   dismissal behavior.

## Rejected mappings

- `ren-menu` or menu roles for navigation destinations.
- Top-layer popover for a panel that must become in-flow on mobile.
- Nested button/link inside a collection card anchor.
- Duplicated desktop/mobile trees or nested nav landmarks.
- Six-card editorial media/body cards from Navbar 10 — this module is four
  overlay collection cards.
- Core breakpoint changes, source framework dependencies, raw tokens, or Shadow
  DOM.
