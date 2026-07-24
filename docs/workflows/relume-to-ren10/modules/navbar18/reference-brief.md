# Reference Brief — Navbar 18

## Retrieval metadata

- Family: navbars
- Module ID: `navbar18` / catalog entry `navbar18_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar18`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: accepted Navbar 14 is the nearest completed neighbor in
  this worktree; Navbar 18 is a distinct later catalog module with overlay-grid
  anatomy rather than dropdown anatomy
- Source variants returned: one complete React section (`Navbar18`)
- Supporting files returned: two vendored primitives (`utils`/`cn`, button)

## Retrieved facts

- Full-width top bar (not a floating card): one logo image link at inline-start;
  one permanent primary action control and one menu toggle clustered at
  inline-end.
- Navigation destinations live **only** inside an open overlay panel — there is
  no horizontal destination row in the permanent bar at any width.
- Overlay contents: exactly eight large bold destination links plus a bottom
  row with one contact-style action and five social destination links.
- Destination links are title-only anchors (no icons, descriptions, group
  headings, photographs, promotional cards, nested menus, or chevrons).
- The source uses one navigation data tree for all widths (no duplicate
  desktop/mobile link lists).
- The defining differences from Navbar 11–14: always-present toggle, permanent
  bar CTA, full-viewport-height overlay, eight-link grid, social footer row,
  and **zero** dropdowns / chevrons.

## Responsive states

- Desktop: permanent bar shows logo, one CTA, and the toggle only. Opening the
  toggle reveals a full-width overlay beneath the bar sized toward viewport
  height minus bar height. Inside the overlay, the eight links form a two-column
  grid (after the source’s small-width step) with a max content measure, and the
  contact + five social links sit in a bottom row.
- Tablet: same always-overlay model; link grid remains multi-column once the
  source small-width step is active; toggle remains visible.
- Mobile: same permanent bar (logo + CTA + toggle). Overlay uses a single-column
  link stack before the source small-width step; bottom row keeps contact and
  social cluster.
- The source animates overlay opacity and hamburger-line morphing; height uses
  viewport arithmetic relative to bar min-heights.

## Interaction states

- Overlay opens and closes only by toggle activation (no hover-open menu).
- Four-line hamburger morphs into a close X while open.
- Overlay mounts while open and unmounts while closed in the source (conditional
  render + exit animation).
- The source has no document outside-click closer, no Escape/focus-return
  contract, no expanded/controls wiring on the toggle, and no reduced-motion
  branch for the overlay or icon morph.
- No dropdown, hover corridor, or pointer-pin behavior exists (there are no
  nested disclosures).

## Visual relationships

- Source-derived: permanent bar is a full-width surface with logo at start and
  CTA + toggle at end.
- Source-derived: open overlay fills the remaining viewport below the bar and
  scrolls if content overflows.
- Source-derived: eight destinations are large, bold, title-only links in a
  one-to-two column grid with a constrained max measure, vertically centered
  within the overlay body.
- Source-derived: contact action is link-styled (underlined text emphasis) and
  sits opposite a horizontal social icon cluster in the overlay footer.
- Exact resolved typography scales, spacing utilities, and runtime animation
  curves were not returned as authoritative visual evidence beyond what the
  complete source encodes.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Logo, CTA, and toggle sit outside any navigation landmark that owns the eight
  destinations.
- Mobile/desktop toggle has no accessible name and no expanded/controls
  relationship.
- Conditional overlay unmount can discard focused descendants.
- Social icons are image-like glyphs without proven text alternatives in the
  defaults.
- No complete Escape, focus restoration, outside dismiss, or reduced-motion
  handling is present.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, Relume social
  icons, Radix Slot, CVA, clsx, and tailwind-merge.
- One placeholder logo image, CSS-drawn hamburger lines, five social icon
  components, one primary bar button, one link-style contact control.
- No source dependency, class, copy, URL, SVG path, duration, easing curve, or
  placeholder asset is eligible for Ren10 output.

## Unavailable evidence

- MCP returned metadata, complete source, and primitive source but no
  authoritative rendered screenshot.
- Exact resolved framework breakpoint pixel values beyond the utilities encoded
  in source, runtime font metrics, and pixel-perfect spacing were not treated as
  authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint constants.
