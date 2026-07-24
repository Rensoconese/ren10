# Reference Brief — Header 5

## Retrieval metadata

- Family: headers (`hero-header-sections` in the Relume catalog)
- Module ID: `header5`
- Retrieved through: authenticated Relume OAuth MCP, targeted
  `relume_oauth__get_component(slug="header5", primitives="names-only")`
- Retrieved at: 2026-07-15
- Source variants returned: one complete React section (`Header5`)
- Supporting files named: `utils`, `button`

## Retrieved facts

- A fullscreen/background-image hero header, not a navigation bar.
- Anatomy order: relative section → foreground container → vertically centered
  copy block → heading, description, CTA cluster; a separate absolute full-bleed
  background layer owns one cover image and one dark scrim.
- Foreground copy is left aligned and constrained to a medium content width.
- Exactly one `h1`, one description paragraph, and exactly two CTA controls.
- CTA variants are `alternate` first and `secondary-alt` second.
- The section uses viewport-minimum height, caps its source foreground wrapper at
  a large height, and increases vertical padding across responsive bands.
- Background image fills both axes with cover fitting. The scrim covers the same
  absolute inset and is a neutral darkest overlay at half opacity.
- There is no logo, brand row, nav, form, disclosure, modal, carousel, or JS state.

## Responsive states

- Narrow/mobile: viewport-height hero, left-aligned constrained copy, wrapping CTA cluster.
- Tablet/desktop: same ownership and order; vertical padding increases but copy
  remains vertically centered and constrained rather than expanding across the page.
- Background media and scrim remain full bleed at every width.

## Interaction states

- Only the two CTA hover/focus/active states exist.
- No open/closed state and no animation library.

## Visual relationships

- Source-derived: text is white over a dark scrim on full-bleed cover media.
- Source-derived: heading is the dominant type; description is medium body.
- Source-derived: CTA cluster has equal inter-control gap and may wrap.
- Source-derived: copy width is substantially narrower than the viewport.
- No authoritative rendered screenshot or resolved pixel metrics were returned.

## Source accessibility and semantic notes

- Real section and `h1` are present in the source.
- Background image receives an alt prop, although the image is visual atmosphere
  behind the same hero message; Ren10 treats it as decorative to avoid redundant output.
- CTA focus, hit targets, and overlay contrast must be verified after translation.

## Public-output exclusions

- Exclude source copy, CDN URL, image, React/TSX, Tailwind classes, Radix/CVA
  dependencies, Relume names, source breakpoint constants, and framework primitives.
