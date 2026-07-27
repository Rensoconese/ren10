# Reference Brief — Navbar 29

## Retrieval metadata

- Family: navbars
- Module ID: `navbar29` / catalog entry `navbar29_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar29`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: accepted neighbors through `navbar14`; this module is
  the next parallel worker assignment (`navbar29`)
- Source variants returned: one complete React section (`Navbar29`)
- Supporting files returned: three vendored primitives (class-name utility,
  media-query hook, button). No card primitive was returned for this module.

## Retrieved facts

- Full-width horizontal bar shell (not a floating compact card): logo at
  inline-start, primary navigation after the logo, two global actions at
  inline-end on desktop.
- One linked logo, four top-level navigation entries, two action controls, one
  mobile toggle (three geometric bars), and one chevron on the mega trigger.
- Top-level entries: three plain destination links plus one mega-menu parent.
- Mega left region: exactly one titled category group with five simple
  title-only destination links (no icons or descriptions on those links).
- Mega right region: exactly four collection surfaces. Each collection owns
  one cover image, one title, one description, and one nested call-to-action
  label. Source mounts the CTA as an interactive button inside the collection
  surface — an accessibility defect Ren10 must not preserve.
- Collection surfaces use full-bleed media with dark overlays and light
  foreground copy (overlay-card treatment), not a separate media track beside
  body copy.
- Desktop renders two action buttons outside the collapsible navigation region;
  mobile re-renders the same two actions inside the open panel. Ren10 must
  keep one actions ownership model, not a duplicated tree of destinations.
- The source uses one navigation data tree for the four top-level entries at
  all widths (links are not dual-authored as separate desktop/mobile lists).

## Responsive states

- Desktop: horizontal logo | four-entry navigation | two actions. Mega panel is
  absolute, full viewport width under the bar, with a two-region layout
  (narrow category column + four-up collection grid). Border under the bar and
  under the open mega panel.
- Tablet / intermediate: source interaction switches to click-only via an
  explicit max-width media query near the framework large breakpoint while
  layout utilities also gate at `lg`, creating a small inconsistent boundary
  Ren10 must not preserve as dual breakpoints.
- Mobile: logo and toggle share the permanent top row. Opening the shell
  reveals the single stacked navigation tree; the mega expands in normal flow;
  the two actions stack full-width below the links. Collection grid becomes
  one column; category column stacks above collections.
- Source animates the mobile shell toward a viewport-height custom property and
  animates mega height/opacity; exact resolved custom heights are not
  authoritative evidence.

## Interaction states

- Mobile shell opens and closes by toggle activation; three bars morph into a
  close X.
- Desktop mega opens on pointer enter and closes on pointer leave (hover
  disabled when the mobile media query matches).
- Mega also toggles by activation; its chevron rotates with open state.
- Source has no complete Escape, focus return, outside dismissal, route-close,
  reduced-motion branch, or keyboard contract beyond a native button trigger
  for the mega parent (mobile toggle remains unnamed and without expanded
  state).

## Visual relationships

- Source-derived: full-width bar with bottom border; logo start, menu mid-start,
  actions end on desktop.
- Source-derived: mega is deliberately full-bleed under the bar; category column
  is content-sized / narrow; collections occupy the remaining width in four
  equal columns on wide desktop.
- Source-derived: each collection reads as an overlay card — image cover, dark
  scrim, large title, supporting description, and a secondary-alt style CTA.
- Exact resolved typography, spacing tokens, and rendered screenshots were not
  returned as authoritative visual evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Logo and desktop actions sit outside the collapsible menu container.
- Mobile toggle has no accessible name or expanded/controls relationship.
- Collection surfaces nest interactive buttons under non-semantic containers;
  cards are not single whole-card anchors.
- No Escape, outside close, destination close, focus restoration, or
  reduced-motion handling.
- Source breakpoint split between interaction media query and layout utilities
  can disagree at the large boundary.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, Relume icons,
  Radix Slot, CVA, clsx, and tailwind-merge.
- One placeholder logo image, four collection placeholder images, one chevron,
  and CSS-drawn hamburger lines.
- Two header button variants in defaults: secondary + default (primary), both
  small. Collection CTAs use a secondary-alt (light-border) treatment on dark
  media.
- No source dependency, class, copy, URL, SVG path, duration, easing, or
  placeholder asset is eligible for Ren10 output.

## Unavailable evidence

- MCP returned metadata, complete source, and primitive source but no
  authoritative rendered screenshot.
- Exact resolved framework breakpoint pixels beyond the explicit mobile media
  query, runtime typography, and custom height variables were not treated as
  authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint
  constants.
