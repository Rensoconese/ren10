# Relume to RenDS Translation Map — Navbar 17

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
| Full-width logo-left / action+toggle-right shell | one `<ren-nav>` containing one `<nav class="ren-nav">` | One landmark and one tree at all widths; bar is full-bleed block chrome, not a floating card |
| Eight large destinations | one `ul.ren-nav-links` of eight `a.ren-nav-link` rows | End-aligned, large type, border-separated rows; no invented dropdowns or groups |
| Full-viewport overlay under bar | block-local `.rn17-menu` shell owning links + footer | Absolute under the bar; fills remaining viewport; scrollable if needed |
| Top-bar primary CTA | `.ren-nav-actions` with one `a.ren-btn` primary | Always visible beside the toggle at every width |
| Footer contact + five socials | `.rn17-menu-footer` with link-style contact + social list | Inside the same open/closed shell as the eight links; not a second landmark |
| Menu toggle (all widths) | named `.ren-nav-toggle` | Always displayed; expanded/controls state owned by `ren-nav` |
| Hamburger → close morph | three authored toggle strokes (Ren10 standard) | One close affordance; no second close button and no chevron |

## Interaction policy

- Overlay is activation-only at every width (no hover-open menu).
- Toggle open/close, Escape with focus return to the toggle, outside click,
  destination activation, footer/social activation, and resize close (via
  `ren-nav`) dismiss the shell.
- No dropdown hover corridor exists in this module.
- Prefer one Ren10 boundary for layout overrides; do not preserve source
  framework breakpoint constants or raw motion durations.

## Cascade risks

- Force `.ren-nav-toggle { display: flex }` at all widths — default `ren-nav`
  hides the toggle above 48rem.
- Force the primary tree hidden unless open at **all** widths — default
  `ren-nav` always shows desktop links.
- Neutralize default mobile `.ren-nav-links` absolute geometry in favor of the
  full-viewport `.rn17-menu` shell.
- Keep the top-bar action permanently visible; do not bury it inside the
  collapsible panel (different anatomy from Navbar 14).
- Exactly one toggle/close affordance; no chevron, no sheet close control, no
  second mobile chrome.
- Overlay must not clip under the bar and must not leave a permanent body
  scroll trap when closed.
- Social list must not introduce a nested `nav` landmark.

## Responsive adaptation

- All widths: full-width bar with logo start + primary action + toggle end.
- All widths: closed shell shows only the bar chrome; open shell reveals the
  eight-link tree and footer inside one overlay.
- Links grow to share remaining height; footer stays compact at the bottom.
- No duplicate desktop/mobile trees and no viewport-height arithmetic beyond
  tokenized bar height offsets.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled, the inert toggle
  is hidden and the single navigation tree (eight links + footer contact +
  socials) and the top-bar primary action remain visible and usable.

## Rejected mappings

- No `ren-sheet` / drawer side panel: source anatomy is a full-viewport
  under-bar overlay, not an edge sheet (Navbar Drawer is a different block).
- No floating compact card shell (Navbar 13/14).
- No mega-menu columns, featured cards, icon groups, or dropdown parents
  (Navbar 5–12 patterns).
- No permanent horizontal primary-link row on large screens.
- No nested social `nav` landmark, fake role button, framework component, or
  copied Relume asset.
