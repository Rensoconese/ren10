# Relume to RenDS Translation Map — Navbar 20

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
- `components/primitives/ren-field/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Full-width logo / center primary / always-on toggle bar | one `<ren-nav>` containing one `<nav class="ren-nav">` | One primary landmark; full-width bar chrome (not floating card) |
| Four primary entries | one `ul.ren-nav-links` (desktop-only when enhanced) | Three links + one native disclosure; never duplicated as a second mobile list of the same tree |
| Fake dropdown trigger | native `details.rn20-disclosure > summary` | Keyboard by default; one authored `.rn20-chevron` |
| Three title-only destinations | three whole `a.rn20-destination` anchors | Compact flat menu; no icons, groups, descriptions |
| Always-visible menu toggle | named `.ren-nav-toggle` shown at all widths | Expanded/controls points at the overlay panel id, not a second primary tree |
| Full-viewport overlay shell | `.rn20-overlay` region under the bar | One scrollable panel; not a nested `nav` landmark; large links as a list |
| Ten large overlay destinations | `ul.rn20-menu-links` with ten `a` items | Multi-column grid via layout primitives; display-scale type via tokens |
| Newsletter cluster | native `form` + `ren-field`/`ren-input` + secondary `ren-btn` | Demo submit prevented; terms with one privacy `a` |
| Contact + five social links | contact block + five labeled social anchors | Real links; no brand SVG paths from source |

## Interaction policy

- Use the established 48rem Ren10 boundary for desktop primary-row visibility and
  dropdown hover; do not preserve source dual-breakpoint splits.
- Desktop pointer hover previews the primary dropdown across a stable
  trigger-to-panel corridor; click pins; second click closes.
- Native Enter/Space activation remains available on the disclosure.
- Escape closes the open disclosure (focus summary) and the overlay (focus toggle).
- Outside click, destination activation, overlay close, and breakpoint crossing
  also close the disclosure.
- Overlay is activation-only (toggle); hover never opens the overlay.
- When the overlay opens, hide the desktop primary row (source relationship).
- Mobile never shows the primary bar row; only logo + toggle + overlay content.

## Cascade risks

- Force `.ren-nav-toggle` visible at all widths for this block only.
- Neutralize Primitive Zero `details` border/padding/margin, summary marker,
  generated `summary::after`, and open-state divider.
- Exactly one `.rn20-chevron`; no native or generated duplicate.
- Primary `ul.ren-nav-links` must not use ren-nav’s default mobile absolute
  panel — that role belongs to `.rn20-overlay`.
- Overlay must sit below the bar (`top: 100%` of relative shell), fill remaining
  height, scroll internally, and not create horizontal overflow.
- Desktop dropdown is absolute, narrow, under its trigger; mobile/overlay path
  does not host the primary disclosure.
- Hide inert toggle and expose overlay + usable links when JavaScript is disabled.

## Responsive adaptation

- At and above 48rem: full-width bar; logo start; centered four-entry primary;
  always-visible toggle; narrow absolute dropdown; overlay two-column layout.
- Below 48rem: logo + toggle only; primary row hidden; overlay stacks large
  links then newsletter then contact.
- No duplicate primary tree and no copied viewport-height constants.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled: hide the inert
  toggle; keep the primary destinations (where applicable) and the overlay
  content (large links, newsletter, contact, social) visible and usable; native
  disclosure remains available on desktop-width viewports.

## Rejected mappings

- No `ren-card` for the overlay or dropdown surfaces.
- No `ren-menu`, `ren-popover`, or `ren-collapsible` for the primary dropdown —
  native disclosure is the semantic baseline.
- No `ren-sheet` side drawer — the source is a full-width under-bar panel.
- No nested `nav` landmark inside the dropdown or overlay.
- No permanent bar CTAs (source has none outside the newsletter form).
- No copied Relume assets, social SVG paths, class strings, or motion constants.
