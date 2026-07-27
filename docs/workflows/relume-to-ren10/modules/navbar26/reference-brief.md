# Reference Brief — Navbar 26

## Retrieval metadata

- Family: navbars
- Module ID: `navbar26` / catalog entry `navbar26_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar26`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: accepted mega-menu family neighbors (`navbar5`–
  `navbar10`) inform translation patterns only; anatomy is unique to this
  module
- Source variants returned: one complete React section
- Supporting files returned: three vendored primitives (`utils`/`cn`, media
  query hook, button)

## Retrieved facts

- Full-width top bar with bottom border (not a floating compact card): logo at
  inline-start, primary navigation after the logo, two action controls at
  inline-end on wide widths.
- One logo image link, four top-level navigation entries, two action buttons,
  one mobile toggle, and one chevron.
- Top-level entries: three plain destination links plus one mega-menu parent.
- The mega panel contains exactly **three labeled category groups**. Each group
  contains **five title-only destination links** (fifteen destinations total).
  Category destinations have titles and URLs only: no icons, descriptions,
  nested media, or secondary rails inside those lists.
- Beside the category columns sits **one promotional panel**: background media
  with a darkened overlay, a heading, a short description, and one nested
  action control (secondary-alt / inverted surface intent in the source).
- Source places bar actions in two markup branches (wide-only cluster outside
  the collapsible panel; narrow-only stacked cluster inside the panel). Ren10
  must collapse that into **one** action ownership model on a single tree.
- The source uses one navigation link tree for primary entries at all widths
  (not a second independently mounted mobile link list), with the action
  duplication noted above.
- Defining differences from nearby mega-menu modules: **title-only** category
  destinations (no icon/description rows), **five** links per group (not four),
  and a **media-backed overlay promo** with a real nested action rather than a
  16:9 blog-style feature card plus separate “view all” control.

## Responsive states

- Desktop (wide): horizontal full-width bar; logo and four entries on the start
  cluster; two actions on the end; mega panel is an absolute, **viewport-width**
  surface under the bar with a bottom border. Panel body is a row: three-column
  category grid plus a constrained promo column.
- Tablet: source keeps collapsed mobile chrome through an explicit
  `max-width: 991px` media query while layout utilities also gate at the
  framework `lg` boundary — a split the Ren10 translation must not preserve.
  Mid widths still express multi-column category intent when space allows.
- Mobile: logo and toggle share the top row only. Opening the shell reveals one
  full-width stacked panel with the four entries and two full-width stacked
  actions. The mega expands in normal flow inside that panel; categories stack
  toward one column; the promo stacks below the groups.
- The source animates the mobile panel toward a viewport-height custom value
  (`var(--height-open, 100dvh)`), without proving that the value accounts for
  every chrome height.

## Interaction states

- Mobile shell opens and closes by toggle activation; three bars morph into a
  close X.
- Desktop mega opens on pointer enter and closes on pointer leave (hover
  disabled when the 991px media query reports mobile).
- The mega also toggles by activation; its chevron rotates and its surface
  animates height/opacity/visibility.
- Source has no document outside-click closer for the mega, no complete Escape
  or focus-return contract, and no reduced-motion branch.
- Source mega trigger is a native button (better than role-button paragraphs
  in earlier modules) but still lacks expanded/controls disclosure ARIA and
  Escape/focus restoration.

## Visual relationships

- Source-derived: desktop keeps logo, four-entry navigation, and two end-side
  actions on one full-width bordered bar.
- Source-derived: mega is deliberately full viewport width under the bar, with
  three equal category columns and a narrower promo rail.
- Source-derived: category destinations are compact title-only stacks under
  group labels.
- Source-derived: promo is a filled media panel with light-on-dark copy and one
  inverted action.
- Exact rendered typography and resolved utility spacing were not returned as
  authoritative evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Logo and wide actions sit outside the collapsible menu container.
- Mobile toggle has no accessible name or expanded/controls relationship.
- Mega trigger lacks expanded/controls disclosure semantics and Escape/focus
  return.
- No reduced-motion handling.
- Duplicated action markup for mobile vs desktop risks double CTAs if both
  branches render without CSS gating.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, Relume icons,
  Radix Slot, CVA, clsx, and tailwind-merge.
- One placeholder logo image, one chevron, one promo background image, and
  CSS-drawn hamburger lines.
- Two bar button variants in defaults: secondary + default (primary), both size
  `sm`. Promo action uses secondary-alt (inverted outline) size `sm`.
- No source dependency, class, copy, URL, SVG path, or placeholder asset is
  eligible for Ren10 output.

## Unavailable evidence

- MCP returned metadata, complete source, and primitive source but no
  authoritative rendered screenshot.
- Exact resolved Tailwind breakpoint values beyond the explicit 991px query,
  runtime typography, and runtime custom height value were not treated as
  authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint
  constants.
