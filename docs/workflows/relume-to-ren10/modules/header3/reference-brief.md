# Reference Brief — Header 3

## Retrieval metadata

- Family: `hero-header-sections`
- Module ID: `header3` / catalog slug `header3`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: header3`, `primitives: names-only`) plus a targeted
  `relume_oauth__search_components` query limited to `header3`
- Retrieved at: 2026-07-15
- Deterministic order: isolated worktree worker for `header3` on branch
  `codex/header3`
- Source variants returned: one complete React hero-header section
- Supporting primitives named (not re-vendored in packet): utils/`cn`, button,
  dialog

## Retrieved facts

- Split hero anatomy: text column first, media column second.
- Text ownership: one primary heading (`h1` in source), one supporting
  description paragraph, exactly two CTA buttons (default/primary then
  secondary variant).
- Media ownership: one full-width video thumbnail image behind a single play
  trigger; activating the trigger opens a modal dialog that hosts one video
  iframe (lazy visibility until load) and a loading indicator while the iframe
  is not ready.
- No logo/brand mark appears in the section tree. No navigation, no dropdowns,
  no mega panel, no secondary media, no form fields.
- Layout container uses horizontal page padding and a max-width container; the
  inner composition is a one-column grid that becomes two equal columns at the
  source large breakpoint, with vertical centering of the two columns when
  side-by-side.
- Play trigger is a full-bleed media button with a dark scrim overlay and a
  centered large play glyph. The dialog is a video lightbox, not a form or
  confirm surface.
- Exactly two CTAs; no third action. No social row, no trust logos, no breadcrumb.
- Dependencies observed privately (React, Tailwind, Radix dialog via dialog
  primitive, class utilities, Relume icons, motion-less section otherwise) are
  ineligible for Ren10 output.

## Responsive states

- Mobile / narrow: single column. Text stack (heading → description → CTA
  cluster) stacks above the media/play surface. Vertical rhythm uses generous
  section padding; CTA cluster is a wrapping horizontal row.
- Tablet: remains single column through the source medium range; vertical gap
  between text and media increases; section padding grows.
- Desktop / large: two columns, items vertically centered, wider horizontal
  gap between text and media. Text stays left-aligned; media sits on the right.
- Dialog iframe width steps up with larger viewports in source; Ren10 must
  express a large video surface without copying raw pixel caps from utilities.

## Interaction states

- Default: closed lightbox; thumbnail + play affordance visible; both CTAs
  idle.
- Open: dialog modal with focus trap; loading indicator until iframe load;
  iframe becomes visible after load.
- Close: Escape and backdrop dismissal via dialog primitive; focus should
  return to the play trigger (source relies on dialog stack; Ren10 must make
  this explicit).
- No hover-open corridor. No keyboard-less-only path documented beyond native
  button/dialog.
- No reduced-motion branch in the section source (spinner uses spin animation).
- No disabled or error states authored for CTAs.

## Visual relationships

- Source-derived: text column owns copy + actions; media column owns only the
  playable thumbnail and lightbox content.
- Source-derived: heading is large and bold; description is medium body; CTAs
  sit under description with a clear gap and wrap with consistent control gap.
- Source-derived: media uses an image-rounded surface with cover object-fit and
  a semi-opaque dark scrim over the thumbnail.
- Source-derived: two-column split is equal columns when side-by-side, with
  larger horizontal gap than vertical stack gap.
- Exact rendered typography, resolved utility spacing, and screenshot proof
  were not returned as authoritative visual evidence from MCP source alone.

## Source accessibility and semantic defects

- Generic `<section>` root rather than a named landmark with
  `aria-labelledby`.
- Play control is a bare `<button>` without an accessible name in source.
- Image alt text is placeholder-oriented; Ren10 must supply meaningful alt or
  treat decorative media carefully when the control carries the name.
- Loading spinner is visual only; busy state for the dialog content must be
  announced properly in Ren10.
- No reduced-motion handling for the spinner animation.
- Framework dialog stack is required for the video; without progressive
  enhancement the media is inert when JS is unavailable.

## Dependencies and assets

- React client component, Tailwind utilities, Radix dialog, CVA/clsx/tailwind-merge,
  Relume icon package (play + progress glyphs).
- One placeholder video thumbnail SVG URL and one external video embed URL in
  defaults — both ineligible for Ren10 output.
- Two button titles in defaults (generic) — rewrite with Ren10 demo copy.
- No source dependency, class string, copy, URL, SVG path, duration, easing,
  breakpoint constant, or placeholder asset is eligible for Ren10 output.

## Unavailable evidence

- MCP returned complete section source and primitive names but no authoritative
  rendered screenshot as stored evidence.
- Exact resolved framework breakpoint pixel values beyond utility class names,
  runtime typography metrics, and dialog motion curves were not treated as
  authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint constants.
