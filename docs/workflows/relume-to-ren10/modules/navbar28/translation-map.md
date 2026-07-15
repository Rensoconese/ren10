# Relume to RenDS Translation Map — Navbar 28

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
- `components/primitives/ren-badge/component.md` (docs chrome only)

## RenDS mapping

- One `<ren-nav>` and one `<nav class="ren-nav">` own one responsive
  `ul.ren-nav-links` tree and one `.ren-nav-actions` cluster (no dual action DOM).
- Four top-level entries: three real anchors plus one native `details/summary`
  mega disclosure with exactly one authored chevron.
- Mega left: one group heading + five simple destination anchors in a narrow
  column (`ren-with-sidebar` + `ren-stack`).
- Mega right: three whole-card anchors in `ren-grid-3` on desktop, stacking to
  one column below the shell boundary. Each card is a single `<a>` with
  background surface, dark overlay via tokens, title, description, and a
  non-interactive CTA span — never a nested button/link.
- Two actions use `.ren-btn` / `.ren-btn-secondary` + `.ren-btn-primary` as
  anchors. Desktop shows them in the permanent actions cluster; mobile shows
  the same cluster under the open shell (CSS order, not a second copy).
- Mobile toggle is the canonical `.ren-nav-toggle` with accessible name,
  `aria-expanded`, and `aria-controls`.
- Semantic/component tokens for surfaces, borders, type, spacing, motion, and
  z-index (`--ren-z-sticky`). No primitive palette tokens or hardcoded colors.
- Full-width bar with bottom border (not floating card shell).

## Cascade risks

- Primitive Zero adds native `details`/`summary` marker, border, margin,
  padding, open divider, and `summary::after` chevron — neutralize all of them
  inside the block disclosure.
- `ren-nav.css` owns mobile hide/show of the links tree via toggle
  `aria-expanded` / host `data-open`. Block CSS must not invent a second tree.
- Desktop mega panel must sit under the bar without clipping by the preview
  shell (`overflow: visible` on preview + nav).
- Overlay collection cards need inverted text tokens that remain readable in
  light and dark themes without hardcoding hex.
- One action separator only on mobile; avoid double borders from links +
  actions.
- Hamburger close-X centering must not introduce a second close icon.

## Responsive adaptation

- Use Ren10's established 48rem navigation boundary for both layout and
  interaction policy (not the source 991px / `lg` split).
- At 48rem and above: absolute full-width mega under the bar; pointer hover
  preview with a stable summary→panel corridor; three-column collection grid;
  narrow category column capped near 15rem.
- Below 48rem: in-flow mega; activation-only; stacked full-width actions; single
  collection column; brand + toggle top row.
- 767 / 768 / 769 seams and narrow 320 / 340 widths must not overflow the root
  or duplicate chrome.

## Progressive enhancement

- Native `details/summary` remains keyboard-operable without block JavaScript.
- With JavaScript disabled on mobile, hide the inert toggle and expose the one
  navigation tree, actions, and native mega disclosure.
- Enhancement adds desktop hover preview/click pin, Escape with focus return
  (including when focus is on a menu destination), outside/destination close
  for every destination class, mobile-shell coordination, and breakpoint reset.

## Rejected mappings

- Reject nested interactive buttons inside collection cards; one whole-card
  anchor only.
- Reject `ren-menu` / `ren-popover` for navigational mega destinations.
- Reject `ren-card` as the sole card chrome when it would fight full-bleed
  overlay collection composition (use a block-local whole-card anchor instead).
- Reject duplicate desktop/mobile link or action trees.
- Reject nested `nav` landmarks inside the mega panel.
- Reject framework motion, numeric z-index, and source breakpoint constants.
