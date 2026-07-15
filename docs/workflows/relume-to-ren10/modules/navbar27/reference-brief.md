# Reference Brief — Navbar 27

## Retrieval metadata

- Family: `navbars`
- Module ID: `navbar27` / catalog entry `navbar27_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar27`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: catalog neighbor after earlier mega-menu modules
  (navbar10 card-grid family); this module is a distinct category-plus-collections
  mega variant, not a duplicate of card-grid or featured anatomy
- Source variants returned: one complete React section
- Supporting files returned: three vendored primitives (`utils`/`cn`, media-query
  hook, button)

## Retrieved facts

- Full-width edge-to-edge header shell (not a floating card): logo at inline-start,
  primary navigation after the brand, global actions at inline-end on wide viewports.
- Exactly four top-level navigation entries: three plain destination links and one
  mega-menu parent with a single chevron affordance.
- Exactly two global action controls (secondary then primary).
- Exactly one mobile hamburger toggle (three geometric bars morphing to a close X).
- Mega content anatomy:
  - Exactly two labeled category groups.
  - Each group contains exactly five plain title-only destination links (no icons,
    no descriptions) — ten category destinations total.
  - Exactly two promotional collection cards.
  - Each collection owns media, title, description, and a nested action control in
    the source (accessibility defect: interactive control nested under non-link
    chrome / button-in-surface). Ren10 must not preserve nested interactive
    descendants; whole-card single anchors are the correction.
- The source uses one navigation data model, but desktop permanent actions live
  outside the collapsible height region while mobile stacks those same actions
  inside the opened shell. Ren10 must still ship **one** responsive tree (no
  duplicate desktop/mobile link lists).

## Responsive states

- Desktop: horizontal full-width bar; logo and four entries form the start cluster;
  two actions remain permanently visible at the end. The mega surface is
  viewport-width absolute under the bar with a bottom border. Categories occupy a
  constrained left region (two-column grid, source max about 26rem). Collections
  occupy a wider right region as a two-column grid of image-backed promo cards.
- Tablet: source interaction uses an explicit max-width media query near 991px
  while layout utilities also gate at the framework large breakpoint — a split
  Ren10 must not preserve. Intermediate widths show multi-column category and
  collection grids before the mobile shell.
- Mobile: logo and toggle share the top row only when closed. Opening the shell
  reveals one stacked panel with the four entries and two full-width actions.
  The mega expands in normal flow inside that panel; categories stack and
  collections reflow toward one or two columns by available width.
- Source open-panel height targets a large viewport custom value without proving
  safe accounting for every chrome height.

## Interaction states

- Mobile shell opens and closes by toggle activation; three bars morph into a
  close X.
- Desktop mega opens on pointer enter and closes on pointer leave (hover disabled
  when the mobile media query reports true).
- Mega also toggles by activation; chevron rotates with open state; panel
  animates height/opacity/visibility.
- Source has no complete Escape, focus-return, outside-dismiss, destination-close,
  keyboard disclosure ARIA, or reduced-motion branch for the mega trigger.

## Visual relationships

- Source-derived: full-width bar with bottom border; mega is a full-bleed under-bar
  surface, not a narrow floating card.
- Source-derived: left category region is narrower than the collection region;
  two equal category columns of five plain links each sit beside two large
  image-backed collection promos with dark scrim and light inverted copy.
- Source-derived: collection cards are tall editorial tiles (title prominent,
  description, then action label) rather than compact icon rows or six-up grids.
- Exact resolved typography, spacing tokens, and rendered previews were not
  returned as authoritative evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Logo and desktop actions sit outside the collapsible menu container; mobile
  actions sit inside it.
- Mobile toggle has no accessible name or expanded/controls relationship.
- Mega trigger is a button-like control without complete disclosure ARIA in the
  source pattern family; keyboard/Escape/focus restoration incomplete.
- Collection cards nest interactive button chrome inside the promo surface.
- Conditional height/visibility may leave focused descendants poorly managed.
- No reduced-motion branch; focus outline risk from source button primitive.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, icon package,
  Radix Slot, CVA, clsx, and tailwind-merge.
- One placeholder logo image, two collection media placeholders, one chevron,
  CSS-drawn hamburger lines.
- Action variants: secondary + default (primary), compact size.
- No source dependency, class, copy, URL, SVG path, duration constant, breakpoint
  constant, or placeholder asset is eligible for Ren10 output.

## Unavailable evidence

- MCP returned metadata, complete source, and primitive source but no
  authoritative rendered screenshot.
- Exact resolved Tailwind breakpoint pixels beyond the explicit mobile query,
  runtime typography, and custom height values are not treated as authoritative
  visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint constants.
