# Reference Brief — Navbar 14

## Retrieval metadata

- Family: navbars
- Module ID: `navbar14` / catalog entry `navbar14_component`
- Retrieved through: authenticated Relume MCP (`relume__get_component`,
  `slug: navbar14`, `primitives: include`)
- Retrieved at: 2026-07-14
- Deterministic order: `navbar13` → `navbar14` (accepted Navbar 13 is the
  immediate precedent; Navbar 14 is the next catalog neighbor)
- Source variants returned: one complete React section (`Navbar14.tsx`)
- Supporting files returned: four vendored primitives (`utils`/`cn`, media
  query hook, button, card)

## Retrieved facts

- Floating shell with logo-left / menu-right / actions-in-panel anatomy: one
  logo image link, four top-level navigation entries, two action buttons, one
  mobile toggle, and one chevron.
- Top-level entries: three plain destination links plus one dropdown parent.
- The dropdown contains exactly three simple destination links. Destinations
  contain titles and URLs only: no icons, descriptions, group headings,
  photographs, promotional cards, or secondary rails.
- The two actions live **inside** the collapsible navigation panel (same
  container as the link list), not as permanent top-row chrome beside the
  toggle. On desktop they form a horizontal cluster after the links; on
  mobile they stack full-width below the links.
- The source uses one navigation data tree at all widths (no duplicate
  desktop/mobile link lists).
- The defining differences from Navbar 13 are: menu aligned to the end (not
  geometrically centered), two actions rather than one, and actions owned by
  the collapsible panel rather than the permanent top row.

## Responsive states

- Desktop: a compact floating card contains the logo at inline-start and a
  horizontal cluster of four entries plus two actions at inline-end. The
  mobile toggle is hidden. The dropdown is an absolute, content-width
  vertical surface beneath its parent.
- Tablet: the source keeps collapsed mobile chrome through an explicit
  `max-width: 991px` media query while layout utilities also gate at the
  framework `lg` boundary — a split the Ren10 translation must not preserve.
- Mobile: logo and toggle share the top row only. Opening the shell reveals
  one full-width stacked panel beneath with the four entries and the two
  actions stacked full-width. The dropdown expands in normal flow inside
  that panel.
- The source animates the mobile panel toward a viewport-height custom value
  (`var(--height, 100vh)`), without proving that the value accounts for every
  bar height.

## Interaction states

- Mobile shell opens and closes by toggle activation; three bars morph into a
  close X.
- Desktop dropdown opens on pointer enter and closes on pointer leave
  (hover disabled when the 991px media query reports mobile).
- The dropdown also toggles by activation; its chevron rotates and its surface
  animates height, opacity, and vertical offset.
- A document pointer listener closes the mobile shell when the event target is
  outside the menu panel and outside the toggle button.
- The source has no complete Escape, focus-return, disclosure-state, or
  keyboard contract for its fake dropdown trigger, and no reduced-motion
  branch.

## Visual relationships

- Source-derived: desktop keeps logo, end-aligned four-entry navigation, and
  two actions on a single compact floating surface.
- Source-derived: the dropdown is deliberately narrow and flat, with three
  evenly stacked title-only links.
- Source-derived: mobile preserves one top row (logo + toggle only) and places
  the navigation panel — including stacked full-width actions — directly
  beneath it; the nested dropdown remains part of that vertical flow.
- Exact rendered typography and resolved utility spacing were not returned as
  authoritative evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Logo and toggle sit outside the collapsible menu container; actions sit
  inside it with the links.
- Mobile toggle has no accessible name or expanded/controls relationship.
- Dropdown trigger is a paragraph with button role, no native tab stop, and no
  native keyboard activation or expanded/controls state.
- On mobile the dropdown panel mounts as a nested `nav` landmark inside the
  primary navigation tree.
- Conditional dropdown mounting may discard focused descendants.
- No complete Escape, focus restoration, breakpoint reset, or reduced-motion
  handling is present.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, Relume icons,
  Radix Slot, CVA, clsx, and tailwind-merge.
- One placeholder logo image, one chevron, and CSS-drawn hamburger lines.
- Two button variants in defaults: secondary + default (primary), both size
  `sm`, both rendered `w-full` so mobile stacking inherits full width.
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
