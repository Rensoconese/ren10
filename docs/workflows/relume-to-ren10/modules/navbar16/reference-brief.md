# Reference Brief — Navbar 16

## Retrieval metadata

- Family: navbars
- Module ID: `navbar16` / catalog entry `navbar16_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar16`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: `navbar14` → `navbar16` (accepted Navbar 14 is the
  nearest prior packet; this module is the next isolated worker target)
- Source variants returned: one complete React section
- Supporting files returned: two vendored primitives (class-name utility,
  button)

## Retrieved facts

- Full-width top bar (not a floating card): logo at inline-start; permanent
  primary action and menu toggle clustered at inline-end.
- Exactly **six** primary destination links. Destinations are title + URL
  only: no icons, descriptions, group headings, photographs, cards, or nested
  disclosures.
- The six links live **only** inside a full-viewport overlay panel that opens
  under the bar. There is **no** permanent horizontal link row at any width.
- Overlay footer owns exactly **one** contact-style destination (link-variant
  control) and exactly **five** social icon destinations.
- One linked logo image, one permanent top-bar action (button-variant), one
  hamburger toggle (four geometric bars that morph into a close X).
- Zero dropdown parents, zero chevrons, zero mega regions, zero secondary
  rails.
- The source uses one navigation data tree for the six primary links at all
  widths (no duplicate desktop/mobile lists).

## Responsive states

- Desktop: full-width bar with logo start and action + toggle end. Opening
  the toggle reveals a viewport-height overlay under the bar. Primary links
  form a large, bold, vertically centered stack. Footer row sits at the
  overlay bottom with contact start and five socials end.
- Tablet: same toggle-driven overlay model; no permanent horizontal link
  cluster. Source uses framework `md` / `lg` utility gates for bar height
  and toggle margin only — not a second navigation tree.
- Mobile: same anatomy. Bar remains logo | action | toggle. Overlay fills
  remaining viewport height under the bar and scrolls when needed.
- Source sizes the overlay with viewport-height arithmetic relative to the
  bar height. Ren10 must preserve the “fills remaining viewport under the
  bar” relationship without copying source constants.

## Interaction states

- Menu opens and closes only by toggle activation at every width (no hover
  open, no permanent open desktop links).
- Hamburger bars morph into a close X while open.
- Overlay fades opacity on open/close; source has staged bar-line motion.
- Source has no document outside-click close, no Escape, no focus return, no
  disclosure ARIA on the toggle, and no reduced-motion branch.

## Visual relationships

- Source-derived: permanent chrome is logo-left / action+toggle-right on a
  full-width bar surface.
- Source-derived: primary destinations are oversized, bold, centered titles
  stacked in the vertical middle of the overlay.
- Source-derived: overlay footer is a single horizontal band — contact at
  start, five equal social icons at end.
- Source-derived: social glyphs are compact square icon targets; contact is
  text with link emphasis (underline treatment in source).
- Exact rendered typography, icon drawings, and resolved utility spacing were
  not returned as authoritative visual evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Mobile toggle has no accessible name, expanded state, or controls wiring.
- Overlay is conditionally mounted (may discard focus when closed).
- Social anchors may lack accessible names beyond icon-only content.
- No Escape, outside dismissal, focus restoration, breakpoint policy, or
  reduced-motion handling.
- Button primitive removes outline without a compensating focus treatment.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, icon package,
  Radix Slot, CVA, clsx, and tailwind-merge.
- One placeholder logo image, five social brand icons, CSS-drawn hamburger
  lines, one permanent button, one footer link-style button.
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
