# Reference Brief — Navbar 32

## Retrieval metadata

- Family: navbars
- Module ID: `navbar32` / catalog entry `navbar32`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar32`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: isolated worktree worker for `navbar32` on branch
  `codex/navbar32` (not sequenced from a prior accepted sibling in this packet)
- Source variants returned: one complete React section
- Supporting files returned: three vendored primitives (utils/`cn`, button, sheet)

## Retrieved facts

- Logo-left / permanent action / always-visible menu-toggle anatomy on a single
  full-width bar. Exactly one logo image link, one permanent action control in
  the bar, one menu toggle, five primary destination links, one contact block,
  and five social destination links.
- Primary destinations are plain title-only links. There are no dropdown
  parents, no chevrons, no icons on primary destinations, no descriptions, no
  group headings, no photographs, and no promotional cards in the link list.
- The menu surface is an edge-attached left drawer (sheet), not an in-bar
  collapsible list and not a pointer hover dropdown. The drawer is used at
  every width: the toggle remains available on desktop, tablet, and mobile.
- Drawer body has two vertical ownership zones: (1) the five primary links in
  a single column with large bold type; (2) a lower zone with a contact heading,
  phone line, email line, postal address line, then a horizontal row of five
  social icon links.
- The permanent bar action sits outside the drawer, beside the toggle (with
  horizontal clearance so the toggle does not overlap the action). It is not
  duplicated inside the drawer footer.
- A `navBottom.button` field exists in the typed defaults object but is **not
  rendered** in the section tree. Do not invent a second contact CTA in the
  drawer from that unused field.
- One navigation data tree for the five primary links (no duplicate
  desktop/mobile lists). Social links are a separate destination class, not a
  second primary tree.
- Dependencies observed privately (framework, motion runtime, icon package,
  dialog/sheet primitive, class utilities) are ineligible for Ren10 output.

## Responsive states

- Desktop: full-width bar with logo at inline-start and action + toggle at
  inline-end. Opening the drawer reveals a left-edge panel whose width is a
  substantial fraction of the viewport but capped (source uses progressive
  max-width steps toward a rem cap). Large primary link type.
- Tablet: same always-on toggle model. Drawer width steps down from the desktop
  cap toward a mid fraction of the viewport. Bar remains logo + action + toggle.
- Mobile / narrow: same bar ownership (logo + action + toggle). Drawer occupies
  a larger fraction of the viewport width. Primary links remain a single stacked
  column; contact and social stay in the lower zone. No second tree.
- Source animates drawer enter/exit and morphs the four-line hamburger into a
  close X. Exact durations and easing constants are excluded from public output.

## Interaction states

- Toggle opens and closes the left drawer; line segments morph into a close X
  while open.
- Outside activation on the overlay/backdrop dismisses the drawer.
- Destination activation is expected to leave the surface (Ren10 must close the
  drawer for every destination class: primary, social, contact, and the bar CTA
  when the drawer is open).
- The source sheet stack provides modal focus trapping and Escape dismissal via
  its dialog primitive, but the toggle itself is an unnamed button in source
  and lacks an explicit expanded/controls contract.
- No pointer-hover corridor: there are no dropdowns.
- No reduced-motion branch is present in the section source.

## Visual relationships

- Source-derived: permanent top bar keeps logo start-aligned and action + toggle
  end-aligned on one row at all documented widths.
- Source-derived: primary destinations use large, bold type and generous
  vertical padding relative to contact/social chrome.
- Source-derived: contact block sits below the link column; social icons form a
  compact horizontal cluster under the contact lines.
- Source-derived: drawer is left-edge attached with a trailing border against the
  remaining page surface.
- Exact rendered typography, resolved utility spacing, and screenshot proof were
  not returned as authoritative visual evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Menu toggle has no accessible name and no expanded/controls relationship.
- Primary destinations live only inside the drawer; without progressive
  enhancement they are unreachable when the sheet runtime is unavailable.
- Social destinations are icon-only in source and rely on icon assets rather
  than visible text names.
- No reduced-motion handling in the section.
- Conditional mounting / motion layers may interfere with focus stability;
  Ren10 must use a real modal edge surface with Escape and focus return.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, Relume icons,
  Radix dialog (via sheet), CVA, clsx, and tailwind-merge.
- One placeholder logo image, five social brand icons, CSS/motion hamburger
  lines.
- One permanent bar button (default/primary, size small). Contact block text
  fields for heading, phone, email, and address.
- No source dependency, class, copy, URL, SVG path, duration, easing, breakpoint
  constant, or placeholder asset is eligible for Ren10 output.

## Unavailable evidence

- MCP returned metadata, complete source, and primitive source but no
  authoritative rendered screenshot.
- Exact resolved framework breakpoint pixel values beyond the utility class
  names present in source, runtime typography metrics, and motion timing curves
  were not treated as authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint constants.
