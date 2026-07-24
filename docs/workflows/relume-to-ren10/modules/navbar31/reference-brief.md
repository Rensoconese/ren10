# Reference Brief — Navbar 31

## Retrieval metadata

- Family: navbars
- Module ID: `navbar31` / catalog entry `navbar31_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar31`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: accepted Navbar 14 is the nearest completed neighbor in
  this worktree; Navbar 31 is a distinct later catalog module with edge-sheet
  anatomy rather than dropdown or full-viewport overlay anatomy
- Source variants returned: one complete React section
- Supporting files returned: three vendored primitives (class-name utility,
  button, sheet/dialog shell)

## Retrieved facts

- Full-width top bar (not a floating card): one logo image link at inline-start;
  one permanent primary action control and one menu toggle clustered at
  inline-end.
- Primary navigation destinations live **only** inside a right-edge sheet panel
  that opens from the toggle — there is **no** permanent horizontal destination
  row at any width.
- Sheet contents: exactly **five** large bold title-only destination links, plus
  a lower contact cluster (heading text, phone line, email line, plain address
  line) and exactly **five** social icon destinations.
- Destination links are title + URL only: no icons, descriptions, group
  headings, photographs, promotional cards, nested menus, or chevrons.
- Defaults also declare a footer-style button field that the returned section
  **does not render** — Ren10 must not invent a second panel CTA from that
  unused field.
- One linked logo image, one permanent top-bar action (button variant), one
  hamburger toggle (multi-line bars that morph toward a close X), and a
  separate close control inside the sheet header.
- Zero dropdown parents, zero chevrons, zero mega regions, zero secondary
  rails.
- The source uses one navigation data tree for the five primary links at all
  widths (no duplicate desktop/mobile lists).

## Responsive states

- Desktop: full-width bar with logo start and action + toggle end. Opening the
  toggle reveals a right-edge sheet (partial viewport width, not full-width
  under-bar overlay). Primary links form a large bold vertical stack near the
  top of the sheet; contact and socials sit lower with space-between ownership
  of the sheet body.
- Tablet: same toggle-driven right sheet; width steps wider than mobile but
  remains an edge panel. Source uses framework width utilities for sheet max
  measure — Ren10 must preserve edge-panel intent without copying constants.
- Mobile: same permanent bar (logo + action + toggle). Sheet is nearly full
  width from the right edge and scrolls when content exceeds viewport height.
- Source sizes the sheet with percentage / rem max-width steps; Ren10 maps to
  `ren-sheet` size tokens rather than source utility numbers.

## Interaction states

- Menu opens and closes by toggle activation at every width (no hover-open
  destinations; no permanent open desktop link row).
- Hamburger bars morph toward a close X while open; sheet header also exposes a
  close control that shares the morphing icon in source.
- Sheet slides in from the right with overlay/backdrop dismissal behavior from
  the sheet primitive.
- Source has incomplete accessible naming on the toggle, incomplete expanded
  state wiring, no reduced-motion branch on the custom hamburger motion, and
  no first-class focus-return contract beyond the sheet primitive’s defaults.

## Visual relationships

- Source-derived: permanent chrome is logo-left / action+toggle-right on a
  full-width bar surface with bottom-aligned bar height rhythm.
- Source-derived: primary destinations are oversized, bold, stacked titles
  inside the right sheet (not a multi-column grid and not a full under-bar
  overlay).
- Source-derived: contact block is a vertical stack (title, phone, email,
  address) below the link stack; social icons form a horizontal cluster under
  the contact stack.
- Source-derived: social glyphs are compact square icon targets; phone and
  email present with text-link emphasis; address is plain text.
- Exact rendered typography, icon drawings, and resolved utility spacing were
  not returned as authoritative visual evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Toggle lacks a complete accessible name / expanded / controls contract in
  source markup.
- Sheet close and bar toggle can present duplicate morphing chrome.
- Social anchors may rely on icon-only content without guaranteed accessible
  names.
- Contact phone/email may be plain text with underline styling rather than real
  `tel:` / `mailto:` anchors.
- No reduced-motion branch for custom hamburger motion; incomplete progressive
  enhancement when the sheet runtime is unavailable.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, icon package,
  Radix dialog-based sheet, Radix Slot, CVA, clsx, and tailwind-merge.
- One placeholder logo image, five social brand icons, CSS/motion hamburger
  lines, one permanent button.
- No source dependency, class, copy, URL, SVG path, or placeholder asset is
  eligible for Ren10 output.

## Unavailable evidence

- MCP returned metadata, complete source, and primitive source but no
  authoritative rendered screenshot.
- Exact resolved Tailwind breakpoint pixels, runtime typography metrics, and
  exact icon path geometry were not treated as authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint
  constants.
