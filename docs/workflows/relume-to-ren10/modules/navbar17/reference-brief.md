# Reference Brief — Navbar 17

## Retrieval metadata

- Family: navbars
- Module ID: `navbar17` / catalog entry `navbar17_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar17`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: `navbar14` (accepted floating actions shell) is a
  nearby catalog neighbor; Navbar 17 is a distinct fullscreen-overlay anatomy
- Source variants returned: one complete React section
- Supporting files returned: two vendored primitives (`utils`/`cn`, button)

## Retrieved facts

- Full-width top bar (not a floating card shell): one logo image link at the
  inline start; one primary action button and one menu toggle clustered at the
  inline end.
- The menu toggle is present at **all** widths. There is no desktop horizontal
  link row; primary destinations live only inside the opened overlay.
- Opening the toggle mounts a full-viewport-height overlay panel that starts
  immediately below the bar (`top: 100%` of the bar, full width).
- The overlay body holds exactly **eight** plain destination links. Links are
  large, bold, end-aligned, vertically distributed to fill remaining height,
  and separated by horizontal rules (top borders on each row; bottom border on
  the last row).
- Destinations are title + URL only: no icons, descriptions, group headings,
  photographs, promotional cards, nested dropdowns, or secondary rails.
- The overlay footer holds one secondary contact-style action (link variant)
  on the inline start and a cluster of **five** social media icon links on the
  inline end.
- One navigation data tree is used at all widths (no duplicate desktop/mobile
  link lists in the defaults).
- No chevron / dropdown parent exists in this module.

## Responsive states

- Desktop: full-width bar with logo | primary action + toggle. Toggle open
  reveals the same full-viewport overlay used at smaller widths. No permanent
  horizontal primary-link cluster.
- Tablet: same bar chrome and overlay path as desktop/mobile (source does not
  switch to an inline desktop menu).
- Mobile: same bar (logo + action + toggle) and full-viewport overlay. Overlay
  height is expressed relative to viewport minus bar height.
- Source animates overlay opacity and morphs four hamburger strokes into a
  close X. No reduced-motion branch is present in the source.

## Interaction states

- Menu open/close is activation-only via the toggle (no hover-governed menu).
- Source hamburger is an unnamed button with no expanded/controls wiring.
- Overlay is conditionally mounted when open (unmount on close).
- No complete Escape, focus-return, outside-dismiss, breakpoint-reset, or
  keyboard contract is present in the source for the overlay shell.
- Social and footer contact are plain anchors; primary bar action is a button
  chrome control in defaults.

## Visual relationships

- Source-derived: logo at start; primary CTA and toggle form an end cluster.
- Source-derived: open overlay is a full-bleed surface under the bar that
  owns eight large end-aligned link rows plus a compact footer row.
- Source-derived: footer is a horizontal strip (contact start / social end)
  with minimum height similar to the top bar.
- Exact rendered typography metrics and resolved utility spacing were not
  returned as authoritative visual evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Logo and top-bar action sit outside any navigation landmark; the overlay is
  a plain `div` of anchors without a single `nav` + list tree.
- Mobile/desktop toggle has no accessible name, no `aria-expanded`, and no
  `aria-controls`.
- Conditional overlay mounting may discard focused descendants.
- No Escape, focus restoration, outside dismiss, or reduced-motion handling.
- Icon-only social links depend on framework icon components without
  proven accessible names in the returned source.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, Relume social
  icons, Radix Slot, CVA, clsx, and tailwind-merge.
- One placeholder logo image; CSS-drawn multi-stroke hamburger.
- Top-bar action defaults to a small solid button; footer contact defaults to
  a link-variant control.
- No source dependency, class, copy, URL, SVG path, duration, easing, or
  placeholder asset is eligible for Ren10 output.

## Unavailable evidence

- MCP returned metadata, complete source, and primitive source but no
  authoritative rendered screenshot.
- Exact resolved framework breakpoint tokens and runtime motion timings were
  not treated as authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint
  constants.
