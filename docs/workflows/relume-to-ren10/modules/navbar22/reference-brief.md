# Reference Brief — Navbar 22

## Retrieval metadata

- Family: navbars
- Module ID: `navbar22` / catalog entry `navbar22_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar22`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: neighbor of accepted floating/centered navbars; this
  module is a sticky bar with a full-viewport contact menu rather than an
  in-bar mobile tree collapse
- Source variants returned: one complete React section
- Supporting files returned: vendored primitives for button, checkbox, input,
  label, textarea, and a class-merge utility

## Retrieved facts

- Sticky top shell with a bottom border: one logo image link at the start, a
  desktop-only centered primary row of four top-level entries, and one always-
  visible menu toggle at the end (toggle is present at every width, not only
  mobile).
- Top-level bar entries: three plain destination links plus one dropdown parent.
- The bar dropdown contains exactly three simple title-only destinations (no
  icons, descriptions, group headings, photographs, promotional cards, or
  secondary rails) and one chevron affordance on the parent.
- Activating the menu toggle opens a full-viewport overlay (not an under-bar
  mobile link list). The overlay contains:
  - eight large destination links in a multi-column grid at wider widths
  - a contact rail with a heading, short description, and a contact form
    (name field, email field, message field, terms acceptance control, submit)
  - contact details: one phone link, one email link, one plain address line
  - five social media icon links
- The source keeps two distinct link collections: the four-item centered bar
  tree (desktop) and the eight large overlay destinations (all widths when the
  overlay is open). These are separate surfaces, not a duplicated responsive
  copy of the same list.
- No permanent CTA action buttons live in the sticky bar; the only end-side
  chrome is the menu toggle.

## Responsive states

- Desktop: sticky bar shows logo, centered four-entry navigation, and the menu
  toggle. The bar dropdown is an absolute bordered surface under its parent.
  Opening the toggle covers the viewport with the overlay grid (large links +
  contact rail + details/socials).
- Tablet: the source gates the centered bar links behind a large-framework
  breakpoint and keeps the full-viewport overlay as the menu surface; Ren10
  must not preserve the framework `lg` / 991px split.
- Mobile: logo and toggle share the top row only. Opening the toggle reveals the
  same full-viewport overlay; large links stack first, then the contact rail,
  then details/socials. The bar dropdown is not part of the mobile chrome (bar
  links are desktop-only in the source).

## Interaction states

- Menu toggle opens and closes the full-viewport overlay; hamburger lines morph
  into a close affordance when open.
- Desktop bar dropdown opens on pointer enter and closes on pointer leave, and
  also toggles by activation; the chevron rotates when open.
- Overlay form is a standard submit form with controlled fields (name, email,
  message, terms). Terms is a checkbox + label.
- Source has incomplete Escape, focus-return, disclosure-state, outside-dismiss
  contracts for the fake dropdown, and incomplete accessible naming for the
  menu toggle. No reduced-motion branch is present in the source.

## Visual relationships

- Source-derived: sticky full-width bar with bottom border; logo at start;
  primary entries centered; toggle at end with elevated stacking so it stays
  above the overlay.
- Source-derived: overlay is a full-viewport scrollable surface; large links
  occupy a primary column/grid; contact form sits on a contrasting surface
  rail; contact details and socials anchor toward the start/bottom on wide
  layouts.
- Source-derived: bar dropdown is a compact flat title-only list under its
  parent on desktop.
- Exact rendered typography and resolved utility spacing were not returned as
  authoritative evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Menu toggle has no accessible name or expanded/controls relationship.
- Desktop dropdown trigger is a button without a complete expanded/controls
  contract and mounts a nested `nav` for destinations.
- Conditional mounting of dropdown/overlay may discard focused descendants.
- No complete Escape, focus restoration, inert background, or reduced-motion
  handling is present.
- Social links rely on icon-only content without guaranteed accessible names in
  the defaults shape.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, Relume icons,
  Radix Slot/checkbox/label, CVA, clsx, and tailwind-merge.
- One placeholder logo image, one chevron, CSS-drawn hamburger lines, five
  social brand icons.
- Form primitives: labeled inputs, textarea, checkbox, primary submit button.
- No source dependency, class, copy, URL, SVG path, or placeholder asset is
  eligible for Ren10 output.

## Unavailable evidence

- MCP returned metadata, complete source, and primitive source but no
  authoritative rendered screenshot.
- Exact resolved framework breakpoint values beyond the explicit large-width
  gating, runtime typography, and motion durations were not treated as
  authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint
  constants.
