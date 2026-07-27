# Reference Brief — Navbar 19

## Retrieval metadata

- Family: navbars
- Module ID: `navbar19` / catalog entry `navbar19_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar19`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: accepted `navbar14` is the nearest completed neighbor in
  this worktree; this module continues the family sequence at `navbar19`
- Source variants returned: one complete React section (`Navbar19`)
- Supporting files returned: no separate primitive file set (section-only
  payload with runtime library imports)

## Retrieved facts

- Full-width top bar: one logo image link at inline-start, a desktop-only
  centered horizontal link row, and one menu toggle at inline-end.
- Desktop bar row contains exactly four top-level entries: three plain
  destination links plus one dropdown parent.
- The dropdown owns exactly three title-only destinations (no icons,
  descriptions, group headings, cards, or secondary rails) and one chevron.
- The menu toggle is present at every width (not mobile-only). Activating it
  opens a full-viewport site panel that fills the space below the bar.
- While the site panel is open, the desktop centered bar row is hidden.
- Site panel anatomy (separate from the desktop bar row):
  - eight large bold primary destinations in a dense link grid
  - four titled navigation columns, each with five destination links
    (twenty column links total)
  - contact cluster: phone link, email link, and plain location text
  - five social destination links with icon affordances
- Source uses one React tree for the section; the desktop bar links and the
  site-panel catalog are different content sets, not a duplicated clone of the
  same four bar entries.
- No permanent CTA action buttons appear in the top bar.
- Motion runtime animates the toggle bars into a close glyph and animates the
  site panel opacity. Dropdown open/close also uses motion.

## Responsive states

- Desktop: logo at start, four-entry centered bar row, always-visible toggle at
  end. Dropdown is absolute, content-width, beneath its parent. Site panel is a
  full-width overlay under the bar with a multi-region grid (large links,
  columns, contact/social).
- Tablet: source layout utilities gate the centered bar at the framework `lg`
  boundary while an explicit `max-width: 991px`-style interaction split also
  appears in sibling family modules — Ren10 must not preserve that dual-boundary
  mismatch.
- Mobile: logo + toggle only in the permanent top row. Opening the toggle
  reveals the site panel only; the four bar entries are not a mobile-only
  second list.
- Site panel height is expressed as viewport height minus bar height arithmetic
  in source; Ren10 should not re-encode raw viewport math as a hard contract.

## Interaction states

- Toggle opens and closes the site panel at every width; bars morph toward a
  close glyph when open.
- Desktop dropdown opens on pointer enter and closes on pointer leave; also
  toggles on activation. Chevron rotates with open state.
- Source does not provide a complete Escape, focus-return, outside-dismiss for
  the site panel, disclosure-state ARIA, keyboard contract for the fake dropdown
  trigger, or reduced-motion branch.
- No document-level outside close for the site panel is proven beyond Animate
  Presence mounting.

## Visual relationships

- Source-derived: permanent bar is a single horizontal band; logo start, centered
  four-entry cluster, toggle end.
- Source-derived: site panel is a large editorial catalog surface under the bar,
  not a compact popover.
- Source-derived: large primary destinations read heavier (heading-scale weight)
  than the smaller column links; contact sits with socials in a trailing cluster.
- Exact rendered typography, resolved utility spacing, and screenshots were not
  returned as authoritative visual evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Menu toggle has no accessible name and no expanded/controls relationship.
- Desktop dropdown trigger is a paragraph with button role, no native tab stop,
  and no expanded/controls state.
- Dropdown surface mounts as a nested `nav` landmark under the primary chrome.
- Conditional mounting may discard focused descendants.
- No complete Escape, focus restoration, breakpoint reset, or reduced-motion
  handling is present for either the site panel or the dropdown.

## Dependencies and assets

- React client component, utility class runtime, motion runtime, icon package.
- One placeholder logo image, one chevron, CSS/motion-drawn hamburger lines,
  five social brand icons.
- No source dependency, class, copy, URL, SVG path, motion duration, or
  placeholder asset is eligible for Ren10 output.

## Unavailable evidence

- MCP returned complete section source but no authoritative rendered screenshot.
- Exact resolved framework breakpoint pixels, runtime typography, and custom
  height arithmetic were not treated as authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint constants.
