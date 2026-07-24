# Reference Brief — Navbar 13

## Retrieval metadata

- Family: navbars
- Module ID: `navbar13` / catalog entry `navbar13_component`
- Retrieved through: authenticated Relume MCP
- Retrieved at: 2026-07-14
- Deterministic order: `navbar12` → `navbar13` → `navbar14`
- Source variants returned: one complete React section
- Supporting files returned: four vendored primitives (`utils`, media query,
  button, card)

## Retrieved facts

- Floating, logo-left/menu-center shell with one logo image, four top-level
  entries, three plain links, one dropdown parent, one action, one mobile
  toggle, and one chevron.
- The dropdown contains exactly three simple destination links. Destinations
  contain titles and URLs only: no icons, descriptions, group headings,
  photographs, promotional cards, or secondary rails.
- The source uses one navigation data tree at all widths.
- The defining difference from Navbar 12 is the centered menu, single action,
  and compact flat dropdown instead of two rich grouped columns.

## Responsive states

- Desktop: a compact floating card contains logo, centered inline navigation,
  and one action; the dropdown is an absolute, content-width vertical surface
  beneath its parent.
- Tablet: the source keeps collapsed mobile chrome through 991px; the action
  remains beside the mobile toggle while the navigation panel opens below.
- Mobile: logo, action, and toggle share the top row; the navigation opens below
  as a full-width stacked panel and the dropdown expands in normal flow.
- The source animates the mobile panel toward a viewport-height custom value,
  without proving that the value accounts for every bar height.

## Interaction states

- Mobile shell opens and closes by activation; three bars morph into a close X.
- Desktop dropdown opens on pointer enter and closes on pointer leave.
- The dropdown also toggles by activation; its chevron rotates and its surface
  animates height, opacity, and vertical offset.
- A document pointer listener closes the mobile shell outside the menu/toggle.
- The source has no complete Escape, focus-return, disclosure-state, or keyboard
  contract for its fake dropdown trigger.

## Visual relationships

- Source-derived: desktop keeps logo, centered four-entry navigation, and one
  action on a single compact floating surface.
- Source-derived: the dropdown is deliberately narrow and flat, with three
  evenly stacked title-only links.
- Source-derived: mobile preserves one top row and places the navigation panel
  directly beneath it; the nested dropdown remains part of that vertical flow.
- Exact rendered typography and resolved utility spacing were not returned as
  authoritative evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Logo and action sit outside the source navigation landmark.
- Mobile toggle has no accessible name or expanded/controls relationship.
- Dropdown trigger is a paragraph with button role, no native tab stop, and no
  native keyboard activation or expanded/controls state.
- Conditional dropdown mounting may discard focused descendants.
- No complete Escape, focus restoration, breakpoint reset, or reduced-motion
  handling is present.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, Relume icons,
  Radix Slot, CVA, clsx, and tailwind-merge.
- One placeholder logo image, one chevron, and CSS-drawn hamburger lines.
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
