# Reference Brief — Navbar 12

## Retrieval metadata

- Family: navbars
- Module ID: `navbar12` / catalog entry `navbar12_component`
- Retrieved through: authenticated Relume MCP only
- Retrieved at: 2026-07-14
- Deterministic order: `navbar11` → `navbar12` → `navbar13`
- Source variants returned: one complete React section
- Supporting files returned: four vendored primitives (`utils`, media query,
  button, card)

## Retrieved facts

- Logo-left, menu-right shell with one logo image, four top-level entries,
  three plain links, one dropdown parent, two actions, one mobile toggle, and
  one chevron.
- The dropdown has exactly two labeled groups. Each group contains four rich
  destination links, for eight destinations total.
- Every destination contains one leading icon, title, description, and URL.
- There are no photographs, feature cards, promotional rails, or background
  images in the dropdown.
- The source data model nests `subMenuLinks` beneath two group objects; this is
  the defining difference from Navbar 11's flat list.

## Responsive states

- Desktop: horizontal logo-left/menu-right bar; inline actions; a right-biased,
  capped-width absolute dropdown surface; two-column grouped content.
- Tablet: the source keeps collapsed mobile chrome until 992px while showing
  two group columns and descriptions from its intermediate breakpoint.
- Mobile: logo/toggle row, stacked navigation and full-width actions; dropdown
  opens in flow as one column; descriptions are hidden at the smallest widths.
- The source subtracts a fixed 64px from viewport height for its open panel even
  when the intermediate bar becomes taller, producing a possible tablet height
  mismatch.

## Interaction states

- Mobile shell opens/closes by activation; its three bars morph into a close X.
- Desktop dropdown opens on pointer enter and closes on pointer leave.
- Mobile dropdown toggles by activation.
- Chevron rotates and panel enters with opacity/vertical motion.
- Source has no outside-click close, Escape close, focus return, or full keyboard
  support for its fake dropdown trigger.

## Visual relationships

- Desktop aligns logo, four-entry navigation, and two-action cluster on one
  horizontal bar.
- The dropdown is a capped, elevated surface aligned toward the menu end and
  divided into two equal content groups.
- Each destination is an icon/text row with title above description; mobile
  preserves icon/title rhythm while condensing secondary copy.
- These are source-derived relationships; exact resolved spacing and typography
  were not available as authoritative rendered evidence.

## Source accessibility and semantic defects

- Generic root section rather than a page-header landmark.
- Logo and actions sit outside the source primary nav landmark.
- Unnamed mobile toggle without expanded/controls relationship.
- Dropdown trigger is a paragraph with button role, no tab stop, no keyboard
  activation, and no expanded/controls state.
- Conditional mounting may discard focused descendants.
- Nested navigation-like submenu risks redundant landmarks.
- Group labels use contextual heading levels that may pollute the host document
  outline.
- No Escape, outside dismissal, focus restoration, or reduced-motion handling.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, Relume icons,
  Radix Slot, CVA, clsx, and tailwind-merge.
- One placeholder logo image, eight generic destination icons, and one chevron.
- No source dependency, class, copy, URL, SVG path, or placeholder asset is
  eligible for Ren10 output.

## Unavailable evidence

- MCP returned source and metadata but no authoritative rendered screenshot.
- Resolved Tailwind `md`/`lg` pixel values and exact runtime typography are not
  treated as evidence beyond the explicit 991px media query.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations, and source breakpoint constants.
