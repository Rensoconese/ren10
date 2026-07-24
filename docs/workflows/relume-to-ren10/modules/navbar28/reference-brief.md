# Reference Brief — Navbar 28

## Retrieval metadata

- Family: navbars
- Module ID: `navbar28` / catalog entry `navbar28_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar28`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: after accepted Navbar 14 series; next mega-menu neighbor
  with category-column + collection-card anatomy
- Source variants returned: one complete React section
- Supporting files returned: three vendored primitives (class-name utility,
  media-query hook, button)

## Retrieved facts

- Full-width header shell with bottom border (not a floating card): logo at
  inline-start, primary navigation after the brand, and two global actions at
  inline-end on desktop.
- Four top-level navigation entries: three plain destination links and one
  mega-menu parent with a single chevron.
- Mega left region: exactly one titled category group containing exactly five
  simple destination links. No icons or descriptions on those links.
- Mega right region: exactly three collection cards. Each collection owns a
  background image, a dark overlay, a title, a description, and a nested
  button label (source nests a button inside the card).
- Two header actions (secondary + primary). Desktop renders them as permanent
  chrome beside the navigation; mobile re-renders them full-width inside the
  collapsible panel. Ren10 must collapse this into one action cluster, not two
  DOM copies.
- One mobile hamburger composed of three geometric bars.
- The source keeps one navigation data tree for links at all widths, but
  duplicates the action buttons across desktop chrome and mobile panel.

## Responsive states

- Desktop: horizontal bar; mega panel is absolutely positioned full-viewport
  width under the bar with a bottom border; left category column is narrow
  (source caps around 15rem); right region is a three-column collection grid.
- Tablet/mobile: source interaction media query uses a framework-era
  `max-width: 991px` while layout utilities also gate at `lg`, creating a
  split Ren10 must not preserve.
- Below source `lg`: brand and toggle share the top row; opening the shell
  expands a scrollable full-viewport-height panel with the four entries and
  stacked full-width actions; mega expands in normal flow.
- Collection grid is single-column on small viewports and three columns on
  large desktop.

## Interaction states

- Mobile shell opens and closes by toggle activation; three bars morph into a
  close X.
- Desktop mega opens on pointer enter and closes on pointer leave (hover
  disabled while the mobile media query matches).
- Mega also toggles by activation at every width; chevron rotates with open
  state.
- Source does not implement Escape, focus return, outside dismissal, route
  close, reduced-motion branches, or a complete keyboard contract for the mega
  trigger (the trigger is a native button without disclosure ARIA).
- No document-level outside-click close for the mobile shell is present in the
  returned source.

## Visual relationships

- Source-derived: logo-left / links / actions full-width bar with bottom border.
- Source-derived: mega is a two-region composition — narrow titled link column
  beside a substantially wider three-card collection band.
- Source-derived: collection cards are full-bleed image surfaces with dark
  overlay and light inverted text/CTA, not horizontal media+copy tracks.
- Exact resolved utility spacing, typography, and runtime heights were not
  returned as authoritative visual evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Mobile toggle lacks an accessible name and expanded/controls relationship.
- Mega trigger lacks expanded/controls disclosure state.
- Collection cards nest interactive buttons inside non-interactive decorative
  containers (and source button labels are interactive descendants of
  non-semantic shells) — Ren10 must use one whole-card destination anchor with
  no nested interactive descendants.
- No Escape, focus restoration, outside close, breakpoint reset, or reduced
  motion.
- Numeric z-index and framework motion timings are not portable.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, icon package,
  Radix Slot, CVA, clsx, and tailwind-merge.
- One placeholder logo image, one chevron, three collection placeholder images,
  and CSS-drawn hamburger lines.
- No source dependency, class, copy, URL, SVG path, duration constant, or
  placeholder asset is eligible for Ren10 output.

## Unavailable evidence

- MCP returned complete section source and primitives but no authoritative
  rendered screenshot.
- Exact resolved framework breakpoint pixels beyond the explicit media query,
  runtime custom height values, and installed icon path drawings were not
  treated as authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint constants.
