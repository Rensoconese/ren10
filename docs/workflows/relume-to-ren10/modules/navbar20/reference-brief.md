# Reference Brief — Navbar 20

## Retrieval metadata

- Family: navbars
- Module ID: `navbar20` / catalog entry `navbar20_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar20`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: accepted Navbar 14 is the nearest prior floating/compact
  neighbor; Navbar 20 is a later catalog entry with a distinct full-panel menu
- Source variants returned: one complete React section (`Navbar20`)
- Supporting files returned: three vendored primitives (`utils`/`cn`, button,
  input)

## Retrieved facts

- Full-width top bar (not a floating card) with bottom border, logo at
  inline-start, always-visible menu toggle at inline-end, and a desktop-only
  centered primary link row between them.
- Primary bar tree: four top-level entries — three plain destination links plus
  one dropdown parent. The dropdown contains exactly three simple title-only
  destinations (no icons, descriptions, group headings, photographs, or cards).
- One authored chevron on the dropdown parent.
- The menu toggle is present at every width (desktop included). It is not a
  standard mobile-only hamburger that merely reveals the same primary row.
- Opening the toggle mounts a full-viewport-height scrollable overlay panel
  directly beneath the bar. While the overlay is open, the desktop primary row
  is hidden.
- Overlay content (separate from the primary bar tree):
  - ten large bold destination links in a responsive multi-column grid
  - a newsletter cluster: heading, supporting description, email field, one
    secondary submit control, and a short terms note with one privacy link
  - a contact cluster: heading, phone link, email link, plain address text, and
    five social destination links
- Defaults include one logo image link and no permanent CTA actions in the bar
  chrome (actions live only inside the newsletter form).
- Source uses framework motion for toggle morph, dropdown height/opacity, and
  overlay fade; no complete Escape, focus-return, disclosure-state, reduced-motion,
  or named-toggle contract is present.

## Responsive states

- Desktop: full-width bar; logo start; four primary entries centered; toggle end;
  dropdown is an absolute content-width surface beneath its parent; overlay is a
  two-column composition (large-link grid + newsletter/contact column) filling
  remaining viewport height below the bar.
- Tablet: source gates primary bar links and overlay layout at the framework
  large boundary while also using a separate mid-size height tweak on the bar —
  a split Ren10 must not preserve as dual breakpoints.
- Mobile: logo + toggle only in the top row; primary bar links are not shown;
  overlay stacks the ten large links, then newsletter, then contact; dropdown is
  irrelevant on mobile because the primary row is absent.
- Overlay height targets remaining viewport under the bar (`100vh` minus bar
  height variants); Ren10 should use stable tokens / `dvh` without copying
  source arithmetic constants.

## Interaction states

- Toggle open/close morphs multi-line icon chrome into a close affordance.
- Desktop dropdown opens on pointer enter and closes on pointer leave; also
  toggles by activation; chevron rotates when open.
- Overlay open hides desktop primary links; overlay closed restores them.
- Source has no documented outside-click close for the overlay beyond the toggle,
  no Escape handling, no focus return, and no reduced-motion branch.
- Newsletter form prevents default submit and logs a client-side value (demo only).

## Visual relationships

- Source-derived: bar is edge-to-edge with bottom border; primary links are
  geometrically centered between logo and toggle when the overlay is closed.
- Source-derived: overlay is a single full-width scroll surface under the bar,
  not a side drawer and not a second page route.
- Source-derived: large overlay links use display-scale type weight; newsletter
  and contact form a secondary column on large widths and stack below on small.
- Exact resolved typography, utility spacing, and motion durations are not
  treated as authoritative visual evidence.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Menu toggle has no accessible name or expanded/controls relationship.
- Dropdown trigger is a button without a complete expanded/controls disclosure
  contract; submenu mounts as a nested `nav` landmark.
- Conditional mounting of overlay and dropdown may discard focused descendants.
- Email contact link incorrectly reuses the phone URL in defaults.
- No complete Escape, focus restoration, breakpoint reset, or reduced-motion
  handling is present.
- `dangerouslySetInnerHTML` for terms markup is not eligible for Ren10.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, Relume icons,
  Radix Slot, CVA, clsx, and tailwind-merge.
- One placeholder logo image, one chevron icon, five social brand icons, and
  CSS-drawn hamburger lines.
- Button default variant secondary for the newsletter control; text input for
  email.
- No source dependency, class, copy, URL, SVG path, duration, easing, or
  placeholder asset is eligible for Ren10 output.

## Unavailable evidence

- MCP returned metadata, complete source, and primitive source but no
  authoritative rendered screenshot.
- Exact resolved Tailwind breakpoint pixel values beyond the explicit large
  layout gate, runtime typography, and motion curves were not treated as
  authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint constants.
