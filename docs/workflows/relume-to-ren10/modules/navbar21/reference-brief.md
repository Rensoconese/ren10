# Reference Brief — Navbar 21

## Retrieval metadata

- Family: navbars
- Module ID: `navbar21` / catalog entry `navbar21_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar21`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: after accepted Navbar 14 cohort; isolated packet for
  `navbar21`
- Source variants returned: one complete React section
- Supporting files returned: two vendored primitives (`utils`/`cn`, button)

## Retrieved facts

- Sticky top shell with logo-left / desktop-center menu / always-visible menu
  toggle anatomy.
- Counts from complete source defaults:
  - one logo image link
  - four top-level **bar** navigation entries (three plain destination links
    plus one dropdown parent)
  - three title-only destinations inside that dropdown
  - one always-visible menu toggle (not mobile-only)
  - eight large **panel** destination links in the fullscreen overlay
  - one featured-rail heading
  - two article cards (image, heading, description, and cue text each)
  - one “view all articles” link-styled control with a trailing chevron
  - one contact link
  - five social destination links
  - one dropdown chevron on the bar disclosure
- The bar link set and the fullscreen panel link set are **different** data
  collections in the source (four bar entries vs eight large panel links).
- The source mounts one bar tree for desktop center links and one separate
  overlay composition for the fullscreen menu; the toggle opens the overlay at
  every width, not only mobile.

## Responsive states

- Desktop: sticky bar with logo at inline-start, four centered bar entries in a
  horizontal cluster, and the menu toggle at inline-end. The dropdown is an
  absolute, bordered, content-width vertical surface beneath its parent. Opening
  the toggle reveals a full-viewport overlay: large panel links on the start
  side, featured articles on the end side, and a bottom strip with contact plus
  five socials.
- Tablet / below the source large breakpoint: center bar links are hidden.
  Logo and toggle share the top row. The same fullscreen overlay opens from the
  toggle and stacks large links, featured rail, and footer strip vertically.
- Overlay uses full viewport height with internal scroll; on large viewports the
  body is a two-column composition with the footer strip absolutely pinned to
  the bottom of the overlay.
- Source layout utilities gate center links at the framework large boundary while
  other spacing uses smaller steps — Ren10 must not preserve raw source
  breakpoint constants.

## Interaction states

- Menu toggle opens and closes the fullscreen overlay; four animated bars morph
  toward a close mark (source uses four motion lines; Ren10 may use the system
  three-stripe toggle affordance).
- Desktop bar dropdown opens on pointer enter and closes on pointer leave; it
  also toggles by activation; chevron rotates.
- Overlay content mounts only while open (conditional presence in source).
- Source has no complete Escape, focus-return, disclosure-state, outside-close
  for the overlay, focus trap, or reduced-motion branch for the bar dropdown.

## Visual relationships

- Source-derived: sticky bar remains above the page; logo and toggle stay above
  the overlay stacking context so the toggle can close the menu.
- Source-derived: desktop bar menu is centered between logo and toggle.
- Source-derived: fullscreen panel juxtaposes large typographic destinations
  against a denser featured-article rail on a contrasting surface band.
- Source-derived: article cards are horizontal media + copy rows at intermediate
  widths and stack at the narrowest widths.
- Exact rendered typography, motion durations, and resolved utility spacing were
  not returned as authoritative visual evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Menu toggle has no accessible name or expanded/controls relationship.
- Bar dropdown uses a real button (better than some siblings) but still lacks a
  complete expanded/controls contract and Escape/focus return.
- Overlay may introduce nested navigation landmarks for the dropdown panel.
- Conditional mounting of overlay and dropdown can discard focused descendants.
- Social icons are unlabeled graphic-only anchors.
- No reduced-motion branch; motion runtime drives open/close.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, Relume icons,
  Radix Slot, CVA, clsx, and tailwind-merge.
- One placeholder logo image, landscape article placeholders, five social icon
  components, one keyboard-arrow chevron, one chevron-right, and CSS-drawn
  hamburger lines.
- No source dependency, class, copy, URL, SVG path, duration, easing, or
  placeholder asset is eligible for Ren10 output.

## Unavailable evidence

- MCP returned metadata, complete source, and primitive source but no
  authoritative rendered screenshot.
- Exact resolved framework breakpoint pixel values beyond class names, runtime
  typography, and motion curves were not treated as authoritative visual
  evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint
  constants.
