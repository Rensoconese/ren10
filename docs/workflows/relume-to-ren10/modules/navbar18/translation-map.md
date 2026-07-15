# Relume to RenDS Translation Map — Navbar 18

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/patterns/ren-nav/pattern.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-link/component.md`
- `components/primitives/ren-icon/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Full-width logo / CTA / toggle bar | one `<ren-nav>` containing one `<nav class="ren-nav">` | One landmark owns brand, permanent CTA, toggle, and the overlay tree |
| Permanent bar CTA | `.ren-nav-actions` with one primary `.ren-btn` anchor | Stays visible in the bar at all widths (not panel-owned like Navbar 14) |
| Always-present menu toggle | named `.ren-nav-toggle` button, forced visible at all widths | Expanded/controls state owned by `ren-nav`; morphing bars become close affordance |
| Eight large destinations | eight `a.ren-nav-link.rn18-link` items in one `ul.ren-nav-links` | Title-only destinations; large type via block tokens; no chevrons |
| Overlay panel | `.rn18-menu` wrapper around the link grid + footer, shown when open | Full-width surface below the bar; single tree; no second nav landmark |
| Two-column link grid | CSS grid on `.ren-nav-links` inside the open menu | One column below the Ren10 content step; two columns from `sm`/tablet up |
| Contact action in overlay footer | `.rn18-contact` link-styled anchor | Underline/link emphasis, not a second primary CTA |
| Five social destinations | five text (or icon+name) anchors in `.rn18-social` | Accessible names; no copied Relume SVG paths or brand assets |
| No dropdown | omit `details` / popover / chevron entirely | Zero chevrons; no hover corridor required |

## Interaction policy

- Use one Ren10 shell boundary for layout density; the toggle remains usable at
  every width because this anatomy is always-overlay (unlike standard ren-nav
  desktop horizontal links).
- Open/close by toggle activation only. No hover-open overlay.
- Escape, outside pointer, destination activation, and toggle re-activation
  close the overlay; focus returns to the toggle after Escape when ren-nav owns
  that path.
- `ren-nav` may auto-close on wide resize (pattern default). Document as an
  intentional Ren10 difference when it conflicts with always-overlay intent;
  block CSS must still allow open state on desktop viewports for tests and use.

## Cascade risks

- Override default ren-nav desktop rules that permanently show `.ren-nav-links`
  and hide `.ren-nav-toggle` above 48rem — this block keeps the toggle and hides
  the tree until open at **all** widths.
- Overlay stacking: menu must sit above page content (`--ren-z-sticky` or
  equivalent public z token) without covering the permanent bar chrome.
- Avoid viewport-height arithmetic that clips under nested demo chrome; prefer
  flexible min-height with internal scroll when content exceeds the panel.
- Exactly zero chevrons / summary markers / generated disclosure pseudo-elements.
- Social cluster and contact row must not introduce a second `<nav>` landmark
  unless labeled as a complementary social group **outside** nested primary
  landmark misuse — prefer a labeled list inside the same shell.
- Preview root must not clip the absolute overlay (`overflow` management).

## Responsive adaptation

- All widths: permanent top row = brand | CTA + toggle.
- Closed: only that top row is interactive chrome for navigation entry.
- Open: one full-width overlay beneath the bar with eight destinations in a
  responsive grid and a footer row (contact + five social links).
- No duplicate desktop/mobile trees and no dropdown geometry.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled, hide the inert
  toggle and expose the single destination tree, contact action, and social
  links so destinations remain reachable.

## Rejected mappings

- No `ren-sheet` / drawer-from-edge: source is a full-width below-bar overlay,
  not an edge sheet (Navbar Drawer is a different block).
- No `details`/`summary`, `ren-menu`, `ren-popover`, or chevron: zero nested
  disclosures in the authenticated anatomy.
- No panel-owned permanent CTA relocation (Navbar 14 pattern): the bar CTA is
  permanent chrome here.
- No horizontal desktop link row (standard ren-nav default): destinations open
  only via the overlay.
- No invented mega-menu cards, icons on destinations, group headings, or second
  navigation tree.
- No copied Relume assets, class strings, social SVG paths, or motion constants.
