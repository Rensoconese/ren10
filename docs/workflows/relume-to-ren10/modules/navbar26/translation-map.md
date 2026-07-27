# Relume to RenDS Translation Map — Navbar 26

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
- `components/primitives/ren-card/component.md` (rejection rationale)
- `components/composites/ren-menu/component.md` (rejection rationale)
- `components/composites/ren-popover/component.md` (rejection rationale)
- `components/composites/ren-collapsible/component.md` (rejection rationale)

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Full-width logo-left / menu / actions shell | one `<ren-nav>` containing one `<nav class="ren-nav">` | One landmark and one tree across all widths; full-width bar chrome is block-local, not a second nav |
| Four top entries | one `ul.ren-nav-links` (`#n26-primary-links`) | Three links plus one native disclosure |
| Mega trigger | native `details.n26-disclosure > summary` | Keyboard activation by default; one authored chevron |
| 3×5 title-only destinations | three groups with five `a.n26-dest` each (15 total) | Preserve title-only lists; no icons or descriptions |
| Group labels | `h3.n26-group-title` + `aria-labelledby` on each list | Accessible names without nested `nav` landmarks |
| Promo panel | non-landmark `aside.n26-promo` with media treatment, title, description, one `a.n26-promo-cta.ren-btn` | One promo action; no button nested inside an image link |
| Two bar actions | one `.ren-nav-actions` cluster (secondary + primary) | Single ownership; desktop end cluster; mobile stacked full-width inside open shell |
| Mobile toggle | named `.ren-nav-toggle` button | Expanded/controls state owned by `ren-nav` |

## Interaction policy

- Use the established **48rem** Ren10 boundary for shell and mega interaction;
  do not preserve the source’s 991px split or framework `lg` mismatch.
- Desktop pointer hover previews across a stable trigger-to-panel corridor
  (full-width panel under the bar; corridor pseudo-element covers the bar gap).
- Pointer click pins the preview; a second click closes it.
- Native Enter/Space activation remains available.
- Escape closes and restores focus to the summary — including when focus is
  inside a focused mega destination.
- Outside click, every destination class activation (category links, promo CTA,
  top-level peers, bar actions), mobile-shell close, and breakpoint crossing
  also close the disclosure.
- Mobile is activation-only; hover never governs its state.
- Same-breakpoint resize must not reset open state; only true shell-boundary
  crossings close.

## Cascade risks

- Neutralize Primitive Zero `details` border/padding/margin, summary marker,
  generated `summary::after`, and open-state divider.
- Exactly one `.n26-chevron`; no native or generated duplicate.
- Desktop panel is absolute, full preview/bar width, under the bar without
  clipping (`overflow: visible` on preview root / nav surface).
- Mobile panel returns to normal flow; categories single column; promo below.
- Actions must collapse with the mobile shell: closed mobile shows only logo +
  toggle; open mobile shows links then stacked full-width actions.
- Progressive enhancement: when `<ren-nav>` is not defined / JS off, hide the
  inert toggle and expose the single tree + actions + native disclosure.

## Responsive adaptation

- **≥48rem:** full-width horizontal shell; toggle hidden; mega absolute under
  bar; three category columns + constrained promo rail (side-by-side at wide
  widths). Mid desktop (≥48rem, <64rem) may stack promo below groups when the
  side rail would squeeze category readability — intentional Ren10 adaptation.
- **<48rem:** logo + toggle top row; one in-flow navigation tree; full-width
  stacked links; two full-width stacked actions inside the opened panel;
  in-flow mega.
- No duplicate desktop/mobile tree and no viewport-height arithmetic.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled, the inert toggle
  is hidden and the single navigation tree, both actions, and native disclosure
  remain visible and usable.

## Rejected mappings

- No `ren-card` for the mega surface or promo chrome (nav/popover surfaces are
  out of card contract).
- No `ren-menu`, `ren-popover`, or `ren-collapsible` for the mega disclosure —
  native `details` is the semantic baseline.
- No icon/description destination rows (that is other modules).
- No 16:9 blog feature + separate “view all” (that is Navbar 6).
- No floating compact card shell (that is Navbar 13/14 family).
- No invented social/footer rails, nested nav landmarks, duplicate mobile list,
  fake role button, framework component, or copied Relume asset.
