# Relume to RenDS Translation Map — Navbar 24

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
- `components/primitives/ren-badge/component.md`
- `components/primitives/ren-card/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Full-width logo-left / menu / actions shell | one `<ren-nav>` containing one `<nav class="ren-nav">` | One landmark and one tree across all widths |
| Four top entries | one `ul.ren-nav-links` | Three plain links plus one native disclosure |
| Fake / incomplete mega trigger | native `details.rmpr-disclosure > summary` | Keyboard activation by default; one authored chevron |
| Intro title + description + CTA | intro stack + one `a.ren-btn` mega CTA | Preserve copy hierarchy without inventing media |
| Eight bold sublinks | eight `a.rmpr-sublink` in a two-column grid | Title-only destinations; no icons or descriptions |
| Product showcase rail | one whole `a.rmpr-product.ren-card` | Single interactive ancestor; badge is non-interactive |
| Product media portrait frame | `ren-frame` with ~10/12 aspect | Cover crop via frame; no remote placeholder assets |
| Two header actions | one `ren-nav-actions` cluster (secondary + primary) | One action set for all widths; no desktop/mobile duplicate |
| Mobile toggle | named `.ren-nav-toggle` button | Expanded/controls owned by `ren-nav` |
| Product badge | `span.ren-badge` | Non-interactive status chrome inside the product anchor |

## Interaction policy

- Use the established 48rem Ren10 boundary for shell and mega interaction; do not
  preserve the source 991px / framework-large split.
- Desktop pointer hover previews across a stable trigger-to-panel corridor that
  spans the full-width panel, including the product rail.
- Pointer click pins the preview; a second click closes it.
- Native Enter/Space activation remains available.
- Escape closes and focuses the summary even when focus is on a mega destination.
- Outside click, every destination class (sublink, product, intro CTA), mobile
  shell close, and breakpoint crossing also close the disclosure.
- Mobile is activation-only; hover never governs its state.
- Same-breakpoint resize keeps open/closed state stable; only a real shell
  boundary cross resets disclosure state.

## Cascade risks

- Neutralize Primitive Zero `details` border/padding/margin, summary marker,
  generated `summary::after`, and open-state divider.
- Exactly one `.rmpr-chevron`; no native or generated duplicate.
- Desktop panel is absolute, full-width under the bar, above the hero, without
  clipping or horizontal overflow.
- Mobile panel returns to normal flow; actions stack full-width only when the
  shell is open.
- Product rail sunken surface must not create stacking/overflow traps at narrow
  widths (320px / 340px).
- No `html`/root overflow at any tested viewport including 767/768/769 seams.

## Responsive adaptation

- At and above 48rem: horizontal shell, absolute full-width mega, two-track
  interior (intro+sublinks | product rail).
- Below 48rem: logo + toggle top row; one in-flow navigation tree; stacked
  full-width actions when open; in-flow mega with stacked intro, sublinks, and
  product rail.
- No duplicate desktop/mobile tree and no viewport-height arithmetic.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled, the inert toggle is
  hidden and the single navigation tree, both actions, native disclosure, eight
  sublinks, intro CTA, and product destination remain visible and usable.

## Rejected mappings

- No `ren-menu`, `ren-popover`, or `ren-collapsible` for the mega surface: native
  disclosure is the correct semantic baseline.
- No nested `nav` landmark inside the primary tree.
- No second mobile link list and no second action cluster.
- No nested interactive descendants inside the product anchor.
- No framework component, Tailwind class, or copied Relume asset.
