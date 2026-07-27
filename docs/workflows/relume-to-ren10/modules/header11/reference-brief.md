# Reference Brief — Header11

## Retrieval metadata

- Family: headers
- Module ID: header11
- Retrieved through: authenticated Relume MCP using `node /tmp/relume-fetch.mjs header11`
- Retrieved at: 2026-07-15
- Source variants returned: one complete section source (`Header11.tsx`)
- Supporting files returned: primitive inventory for `utils` and `button`; primitive bodies were not required to establish section anatomy
- Sanitized complete-source SHA-256: `490ea5aecfa79b7b4dd918a81013c9c70221fd52cfccd9dd5aff4448efbaa460`

## Retrieved facts

- The section is a full small-viewport-height vertical column.
- Its first child is a relative media region that flexes to consume all remaining height.
- The media region contains exactly one absolutely inset video using cover fitting.
- The source video autoplays, loops, and is muted; inline playback was not declared.
- Exactly one full-inset dark scrim overlays the video.
- The second child is a bottom copy band with one constrained container.
- The band contains a single responsive layout: heading first; then description followed by an action group.
- The action group maps exactly two supplied buttons. Defaults identify the first as primary and second as secondary.
- There is no navigation, brand, logo, form, image, dialog, or third action.

## Responsive states

- Mobile: the bottom-band content is one column in source order: heading, description, actions.
- Medium and wider: the bottom-band content becomes two columns; heading owns the left and description/actions own the right.
- The media region remains first and flexible at every viewport; bottom-band vertical padding increases at medium and large sizes.
- The action group wraps when space is constrained.

## Interaction states

- Source behavior is autoplaying ambient video plus normal interactions from two CTA primitives.
- Source does not provide pause/play control or reduced-motion adaptation.
- Ren10 must add a real pause/play button, start paused for reduced motion, and preserve native video controls without JavaScript as required accessibility improvements.

## Visual relationships

- Source-derived: the video fills the flexible top region and never shares the copy-band grid.
- Source-derived: the scrim covers only the media region, not the copy band.
- Source-derived: copy-band peers align at the top in a two-column grid from medium widths.
- Source-derived: CTA spacing follows the description, and the two CTAs sit in a wrapping horizontal group when space permits.
- Inference: exact resolved dimensions, colors, fonts, and video content are unavailable and therefore translate through Ren10 tokens and a deterministic local source.

## Unavailable evidence

- MCP returned source, not a rendered preview.
- Exact resolved Relume tokens, pixel measurements, hover/focus rendering, and production video asset were unavailable.
- The returned CloudFront video is a placeholder and is not suitable for public output.

## Public-output exclusions

- Do not copy React/TSX, source utility classes, package imports, install instructions, placeholder prose, CloudFront URL, or framework dependencies.
- Do not expose MCP transport logs or authenticated session data.
