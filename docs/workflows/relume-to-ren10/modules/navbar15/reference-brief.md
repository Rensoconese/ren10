# Reference Brief — Navbar 15

## Retrieval metadata

- Family: navbars
- Module ID: `navbar15` / catalog entry `navbar15_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar15`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: `navbar14` → `navbar15` (accepted Navbar 14 is the
  immediate precedent; Navbar 15 is the next catalog neighbor)
- Source variants returned: one complete React section
- Supporting files returned: four vendored primitives (utils/`cn`, media
  query hook, button, card)

## Retrieved facts

- Floating shell with **viewport-edge docking that flips by width**: near the
  top edge on small/medium viewports, near the **bottom** edge on large
  viewports. One compact card surface owns brand, navigation, one action, and
  the mobile toggle.
- One logo/brand destination link. On small viewports the brand presents a logo
  image treatment; on large viewports the same destination presents an
  **upward icon** control (not the logo image).
- Four top-level navigation entries: three plain destination links plus one
  dropdown parent.
- The dropdown contains exactly three simple destination links. Destinations
  contain titles and URLs only: no icons, descriptions, group headings,
  photographs, promotional cards, or secondary rails.
- Exactly **one** action control (default/primary treatment, compact size).
- The action lives **outside** the collapsible navigation panel, in a permanent
  chrome cluster with the mobile toggle (always available on the top/bottom
  bar). The links tree alone collapses on small viewports.
- The source uses one navigation data tree at all widths (no duplicate
  desktop/mobile link lists).
- Defining differences from Navbar 14: bottom-docked large-viewport shell,
  single action (not two), action permanent in chrome (not panel-owned), brand
  swaps to an up-icon on large viewports, and the desktop dropdown opens
  **upward** from the bottom-docked bar.

## Responsive states

- Desktop (large): a compact floating card sits near the **bottom** of the
  viewport with horizontal side inset. Layout is brand/up-control at
  inline-start, horizontal four-entry navigation, and one action at
  inline-end. The mobile toggle is hidden. The dropdown is an absolute,
  content-width vertical surface that opens **above** its parent
  (toward the page content).
- Tablet: the source keeps collapsed mobile chrome through an explicit
  `max-width: 991px` media query while layout utilities also gate at the
  framework `lg` boundary — a split the Ren10 translation must not preserve.
- Mobile: brand (logo treatment) and the permanent action + toggle share the
  top row. Opening the shell reveals one full-width stacked panel **beneath**
  the bar with the four entries only (action stays in the top row). The
  dropdown expands in normal flow inside that panel.
- The source animates the mobile panel toward a viewport-height custom value
  (`var(--height, 100vh)`), without proving that the value accounts for every
  bar height.

## Interaction states

- Mobile shell opens and closes by toggle activation; three bars morph into a
  close X.
- Desktop dropdown opens on pointer enter and closes on pointer leave
  (hover disabled when the 991px media query reports mobile).
- The dropdown also toggles by activation; its chevron rotates and its surface
  animates height, opacity, and vertical offset (upward offset on large
  viewports).
- A document pointer listener closes the mobile shell when the event target is
  outside the menu panel and outside the toggle button.
- The source has no complete Escape, focus-return, disclosure-state, or
  keyboard contract for its fake dropdown trigger, and no reduced-motion
  branch.

## Visual relationships

- Source-derived: large viewports dock a compact floating bar at the bottom
  edge with brand/up-control, four horizontal entries, and one action.
- Source-derived: the desktop dropdown is deliberately narrow and flat, with
  three evenly stacked title-only links, and opens **upward** so it does not
  leave the viewport under a bottom-docked bar.
- Source-derived: mobile preserves one top row (brand + action + toggle) and
  places the navigation panel directly beneath it; the nested dropdown remains
  part of that vertical flow.
- Exact rendered typography and resolved utility spacing were not returned as
  authoritative evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Logo/up-control and the action/toggle cluster sit outside the collapsible
  menu container; only links live inside the collapsible panel.
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
- One placeholder logo image, one up-arrow icon (desktop brand), one down
  chevron (dropdown), and CSS-drawn hamburger lines.
- One button in defaults: default (primary) treatment, size `sm`.
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
