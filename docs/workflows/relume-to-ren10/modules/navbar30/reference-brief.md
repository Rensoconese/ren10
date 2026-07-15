# Reference Brief — Navbar 30

## Retrieval metadata

- Family: navbars
- Module ID: `navbar30` / catalog entry `navbar30_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar30`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: after accepted Navbar 14 workstream; module id from
  authenticated catalog slug `navbar30`
- Source variants returned: one complete React section
- Supporting files returned: three vendored primitives (class-name utility,
  media-query hook, button)

## Retrieved facts

- Full-width top bar (not floating): logo at inline-start, primary navigation
  after the logo, and two global actions at inline-end on desktop.
- One linked logo, four top-level navigation entries, two actions, one mobile
  toggle, and one chevron.
- Top-level entries: three plain destination links plus one mega-menu parent.
- The mega menu has two peer regions:
  1. **Category columns** — exactly three titled groups, each with five
     title-only destination links (15 category destinations total).
  2. **Product media cards** — exactly two linked cards. Each rendered card
     owns one media slot and one title. Source data also carries a description
     field that is **not rendered** in the returned section markup.
- Desktop actions live in a permanent end-of-bar cluster outside the
  collapsible mobile region. Mobile reuses the same action pair inside the
  open shell (full-width stacked), not as permanent top-row chrome beside the
  toggle.
- The source uses one navigation data tree at all widths (no separate mobile
  content model), though framework classes re-host the action pair for mobile
  vs desktop chrome.
- Defining differences from Navbar 10 (card-grid): three category columns
  instead of one five-link rail; two media/title product cards instead of six
  rich editorial cards with description and CTA chrome; no nested interactive
  control inside cards.

## Responsive states

- Desktop: horizontal bar with logo, four entries, and two actions. The mega
  panel is an absolute, full-viewport-width surface under the bar with a
  bottom border. Inside the panel, categories and product cards sit in a
  horizontal band: category groups form a multi-column grid (three columns
  from the source medium band); product cards form a two-column band from the
  source small band upward.
- Tablet: source interaction media query treats roughly `max-width: 991px` as
  mobile while layout utilities also gate at the framework large boundary —
  Ren10 must not preserve that split. Category columns and product cards
  remain readable; shell still collapses via Ren10’s single nav breakpoint.
- Mobile: logo and toggle share the top row only. Opening the shell reveals
  one full-width stacked tree with the four entries, nested mega disclosure
  in flow, and two full-width actions below the links. Product cards stack
  toward a single column on the narrowest widths.
- Mobile shell height animates toward a viewport-height custom value; exact
  accounting for chrome bars is not proven by returned evidence.

## Interaction states

- Mobile shell opens and closes by toggle activation; three bars morph into a
  close affordance.
- Desktop mega opens on pointer enter and closes on pointer leave (hover
  disabled when the mobile media query reports true).
- Mega also toggles by activation; its chevron rotates with open state; the
  panel animates height/opacity/visibility.
- Source has no complete Escape, focus-return, outside-dismiss, destination
  close, breakpoint-reset, or reduced-motion branch.

## Visual relationships

- Source-derived: full-width bar with bottom border and solid surface — not a
  floating card.
- Source-derived: desktop mega is viewport-wide under the bar, not a narrow
  content-width dropdown.
- Source-derived: category region emphasizes three equal titled columns of
  simple links; product region emphasizes two media-first cards with title
  under the image (~3:2 media aspect).
- Source-derived: desktop actions are end-aligned peers of the link cluster;
  mobile actions stack under the open tree.
- Exact rendered typography and resolved utility spacing were not returned as
  authoritative evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Mobile toggle has no accessible name or expanded/controls relationship.
- Mega trigger is a real button in source (better than some neighbors) but
  lacks a full expanded/controls/Escape/focus contract.
- Conditional panel mounting may discard focused descendants.
- No reduced-motion branch; button primitive removes outline without a proven
  compensating focus treatment in the returned primitive.
- Source 991px interaction boundary can disagree with framework layout
  breakpoints.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, icon package,
  media-query hook, button primitive with slot/variant utilities.
- One placeholder logo image, placeholder product images, one chevron, CSS
  hamburger lines.
- Two button variants in defaults: secondary + default (primary), both small.
- No source dependency, class, copy, URL, SVG path, duration constant, or
  placeholder asset is eligible for Ren10 output.

## Unavailable evidence

- MCP returned metadata, complete source, and primitive source but no
  authoritative rendered screenshot.
- Exact resolved Tailwind breakpoint pixels beyond the explicit mobile media
  query, runtime typography, and custom height CSS variables were not treated
  as authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint
  constants.
