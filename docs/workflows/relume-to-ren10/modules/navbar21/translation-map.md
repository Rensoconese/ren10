# Relume to RenDS Translation Map — Navbar 21

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

- One `<ren-nav>` wrapping one `<nav class="ren-nav" aria-label="…">` landmark.
- Sticky bar uses `ren-nav` / `ren-nav-sticky` semantics with logo
  (`.ren-nav-brand`), one desktop center list (`ul.ren-nav-links`), and one
  always-visible `.ren-nav-toggle`.
- Preserve four bar entries: three real anchors and one native `details/summary`
  disclosure with exactly three title-only destinations and one authored
  chevron (classless markers neutralized).
- Fullscreen overlay is a single panel **inside** the same landmark (not a
  second tree, not a nested `nav`). It owns:
  - eight large destination anchors in a responsive grid
  - a featured rail with heading, two media+copy article links, and one
    link-styled “view all” control with one trailing chevron
  - a footer strip with one contact link and five named social anchors
- Toggle `aria-controls` points at the fullscreen panel id; `aria-expanded`
  reflects panel open state. Force toggle visible at all breakpoints (source
  always shows it; default `ren-nav` hides it above 48rem).
- Below 48rem, hide the bar link list entirely (source hides center links). Do
  not repurpose `ren-nav`’s mobile link-drawer as the fullscreen composition.
- Use semantic/component tokens for surfaces, borders, type, spacing, motion,
  and elevation. Article media uses tokenized gradient placeholders (no remote
  assets). Social marks use `ren-icon` + `currentColor` SVGs with accessible
  names on the anchors.

## Cascade risks

- Primitive Zero adds native `details`/`summary` chrome and `summary::after`
  chevrons — neutralize for the bar disclosure so only one authored chevron
  remains.
- Default `.ren-nav-toggle` is `display: none` above 48rem; block CSS must force
  `display: flex` at all widths without inventing a second close control.
- Default `.ren-nav-links` at max-width 48rem becomes an absolute under-bar
  drawer when `[data-open]` — override so the bar list stays hidden under 48rem
  and never doubles as the fullscreen panel.
- Fullscreen panel must sit under the sticky logo/toggle stacking context and
  cover the preview/viewport without clipping the bar controls.
- `ren-nav.js` outside-click close only considers the custom element subtree —
  keep the panel inside `<ren-nav>` so destination and social clicks do not
  fight the controller.
- Large panel links and featured rail must not create nested landmarks or
  nested interactive controls inside anchors.

## Responsive adaptation

- Use Ren10’s established 48rem navigation boundary for shell and interaction
  policy (no source 991px / `lg` split).
- ≥48rem: three-zone bar (logo | centered four entries | toggle); absolute
  compact dropdown under the disclosure; fullscreen overlay is a two-column
  large-links | featured composition with a bottom contact/social strip.
- <48rem: logo + toggle only on the bar; same fullscreen overlay stacks
  large links, featured rail, then footer strip; dropdown is not required on
  mobile because bar links are hidden (desktop disclosure remains in DOM for
  progressive enhancement where links are shown).
- Article rows use `ren-switcher` / stacked media+copy rhythm rather than
  pixel-matched source gaps.

## Progressive enhancement

- Native `details/summary` remains keyboard-operable for the bar dropdown
  without block JavaScript on desktop when the list is visible.
- Without JavaScript: hide the inert toggle; expose bar links (all widths as a
  readable stack) plus the fullscreen destinations, featured rail, contact, and
  socials in normal flow so the dual destination sets remain usable.
- Enhancement adds: always-visible toggle controlling the fullscreen panel,
  desktop hover preview + click pin for the bar dropdown, Escape with focus
  return to the relevant trigger, outside/destination close, body scroll lock
  while the panel is open, and breakpoint reset of open state.

## Rejected mappings

- Reject edge `ren-sheet` as the sole shell — source is full-viewport overlay,
  not a side drawer (sheet remains available only if a consumer later composes
  it; this block owns a Light DOM fullscreen panel).
- Reject `ren-dialog` modal chrome that would replace the sticky bar
  relationship; the bar stays interactive above the panel.
- Reject `ren-card` as article chrome if it would imply popover behavior; use
  simple anchors with surface tokens.
- Reject `ren-menu` for destinations — these are navigational links, not
  application commands.
- Reject duplicate mobile/desktop trees of the **same** bar list and nested
  `nav` landmarks.
- Reject copying source icons, URLs, motion values, and breakpoint constants.
