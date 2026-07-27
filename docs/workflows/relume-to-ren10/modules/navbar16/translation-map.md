# Relume to RenDS Translation Map — Navbar 16

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
| Full-width logo-left / action+toggle-right bar | one `<ren-nav>` containing one `<nav class="ren-nav">` | One landmark across all widths; bar is block chrome, not a second nav |
| Six primary destinations | one `ul.ren-nav-links` of six `a.ren-nav-link` (block class `rn16-primary-link`) | Large centered stack only inside the open overlay; never a permanent horizontal row |
| Permanent top-bar action | `.ren-nav-actions` with one primary `.ren-btn` anchor | Always visible in the bar at every width (not panel-owned like Navbar 14) |
| Overlay shell under bar | `.rn16-panel` sibling of brand/actions/toggle, shown when `data-open` / `aria-expanded` | Fills remaining viewport under the bar; owns the six links plus footer |
| Contact footer destination | one `.rn16-contact` text link | Link emphasis via Ren10 tokens, not source underline utilities |
| Five social destinations | five named `.rn16-social-link` anchors with authored `.ren-icon` SVGs | Accessible names required; generic geometry — never Relume icon paths |
| Hamburger / close morph | named `.ren-nav-toggle` with three spans (Ren10 standard) | Expanded/controls state owned by `ren-nav`; no fourth bar, no second close control |

## Interaction policy

- Toggle-driven open/close at **all** widths (desktop, tablet, mobile). Do not
  invent a permanent desktop horizontal link row.
- Use Ren10 shell ownership from `ren-nav`: Escape closes, outside click closes,
  primary link activation closes, named toggle with `aria-expanded` /
  `aria-controls`.
- No dropdown hover corridor (source has no dropdowns).
- Breakpoint crossing may reset open state via host `ren-nav` policy; do not
  invent a second tree when that happens.
- Reduced-motion: block-local transitions collapse to none.

## Cascade risks

- Force `.ren-nav-toggle` visible at desktop (`display: flex`) — default
  pattern hides it above 48rem.
- Force `.rn16-panel` / `.ren-nav-links` hidden unless open at **all**
  breakpoints — default pattern shows horizontal links on desktop.
- Permanent `.ren-nav-actions` must stay in the top row always; do not hide it
  with the overlay (Navbar 14 pattern is the opposite ownership model).
- Overlay must sit under the bar (`top: 100%`), full inline width, without
  covering brand/action/toggle, without horizontal overflow.
- Exactly one toggle affordance; no duplicate close button inside the panel.
- Zero chevrons (`details`/`summary` not used).
- Social icons must inherit `currentColor` and meet 44px targets via the
  anchor hit area, not tiny glyph-only boxes.

## Responsive adaptation

- All widths: full-width bar; logo start; permanent action + toggle end;
  overlay panel only when open.
- Open overlay: large centered six-link stack; footer band with contact + five
  socials; scrollable if content exceeds remaining viewport.
- Closed: only brand, permanent action, and toggle visible in the bar.
- No duplicate desktop/mobile trees.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled, hide the inert
  toggle and expose the single six-link tree, permanent action, contact link,
  and social destinations in a usable stacked layout.

## Rejected mappings

- No `ren-card`, `ren-menu`, `ren-popover`, `ren-collapsible`, or mega pattern:
  destinations are plain titles.
- No floating compact shell (Navbar 13/14); this module is a full-width bar.
- No permanent horizontal desktop links (standard `ren-nav` default) — the
  defining anatomy is toggle-only overlay at every width.
- No panel-owned permanent CTA hide-on-mobile (Navbar 14); the top action stays
  in the bar.
- No nested `nav`, fake role buttons, second close control, fourth hamburger
  bar, or copied Relume assets/icons.
