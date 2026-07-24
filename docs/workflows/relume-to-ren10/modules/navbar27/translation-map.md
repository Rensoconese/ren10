# Relume to RenDS Translation Map — Navbar 27

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
- `components/primitives/ren-card/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Full-width logo-left / menu / end-actions shell | one `<ren-nav>` containing one `<nav class="ren-nav">` | One landmark and one tree across all widths; full-width bar chrome (not floating card) |
| Four top entries | one `ul.ren-nav-links` | Three plain `a.ren-nav-link` plus one native disclosure |
| Fake mega trigger | native `details.rmcc-disclosure > summary` | Keyboard by default; one authored chevron |
| Two category groups × five title-only links | two titled columns with ten `a.rmcc-mega-link` destinations | No icons or descriptions invented |
| Two collection promos with nested buttons | two whole `a.rmcc-collection` anchors (media + title + description + CTA span) | Nested interactive descendants forbidden |
| Desktop permanent end actions | `.ren-nav-actions` visible at desktop end | Secondary + primary `ren-btn` |
| Mobile actions inside opened shell | same `.ren-nav-actions` hidden until shell open below 48rem | Full-width stacked actions; closed mobile shows brand + toggle only |
| Mobile toggle | named `.ren-nav-toggle` button | Expanded/controls owned by `ren-nav` |
| Full-bleed mega surface | `.rmcc-panel` absolute under bar on desktop; static in flow on mobile | Viewport-width under-bar relationship, not a narrow popover |

## Interaction policy

- Use the established 48rem Ren10 boundary for shell and mega interaction; do not
  preserve the source 991px / framework large-breakpoint split.
- Desktop pointer hover previews across a stable trigger-to-panel corridor
  (including lateral travel toward collection cards).
- Pointer click pins the preview; a second click closes it.
- Native Enter/Space activation remains available.
- Escape closes and restores focus to the summary whether focus was on the
  summary or a focused mega destination.
- Outside click, destination activation (category links, collection cards, and
  global CTAs while the mega is open), mobile-shell close, and breakpoint
  crossing also close the disclosure.
- Mobile is activation-only; hover never governs its state.

## Cascade risks

- Neutralize Primitive Zero `details` border/padding/margin, summary marker,
  generated `summary::after`, and open-state divider.
- Exactly one `.rmcc-chevron`; no native or generated duplicate.
- Desktop panel is absolute full-bleed under the bar without clipping (`overflow`
  management on the preview root / nav surface).
- Collection cards: single anchor only — no nested `button` / `a` / `role="button"`.
- Mobile closed row must show only brand + toggle; actions collapse with the shell.
- Mobile links/actions must not accumulate duplicate separators or a second tree.
- Dark collection scrim must use semantic tokens (`--color-text`, inverted text,
  surface mixes) — never primitive palette tokens or hardcoded brand hex.

## Responsive adaptation

- At and above 48rem: full-width horizontal shell; logo + four entries + two
  permanent end actions; absolute full-bleed mega with two category columns beside
  two collection cards.
- Below 48rem: one top row with logo + toggle only; one in-flow navigation tree;
  full-width stacked links; two full-width stacked actions inside the opened
  panel; in-flow mega.
- No duplicate desktop/mobile tree and no viewport-height arithmetic.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled, the inert toggle
  is hidden and the single navigation tree, both actions, native disclosure, ten
  category links, and two collection cards remain visible and usable.

## Rejected mappings

- No second mobile navigation tree or conditionally mounted mega clone.
- No `ren-menu` / `ren-popover` as the mega substrate — native disclosure is the
  baseline; block-local JS only adds desktop hover corridor and dismissal policy.
- No nested interactive controls inside collection cards.
- No six-up card grid (navbar10), featured single rail (navbar6), icon rows
  (navbar7), or floating compact shell (navbar14).
- No copied Relume assets, class strings, copy, URLs, durations, or breakpoints.
