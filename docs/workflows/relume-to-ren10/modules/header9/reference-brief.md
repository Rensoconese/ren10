# Reference Brief — Header9

## Retrieval metadata

- Family: headers
- Module ID: header9
- Retrieved through: authenticated Relume MCP using `node /tmp/relume-fetch.mjs header9`
- Retrieved at: 2026-07-15
- Source variants returned: one complete section source (`Header9.tsx`)
- Supporting files returned: primitive inventory for `utils` and `button`; primitive bodies were not required to establish section anatomy
- Sanitized complete-source SHA-256: `e61c924a756fbf78e5c9ef2a17dad188474f51672aaf7a96304f9eb041fc0700`

## Retrieved facts

- The section is a full small-viewport-height vertical column.
- Its first child is a relative media region that flexes to consume all remaining height.
- The media region contains exactly one absolutely inset image using cover fitting.
- Its second child is a bottom copy band with one constrained container.
- The band contains a single responsive layout: heading first; then description followed by an action group.
- The action group maps exactly two supplied buttons. Defaults identify the first as primary and second as secondary.
- There is no navigation, brand, logo, overlay, scrim, form, video, dialog, or third action.

## Responsive states

- Mobile: the bottom-band content is one column in source order: heading, description, actions.
- Medium and wider: the bottom-band content becomes two columns; heading owns the left and description/actions own the right.
- The media region remains first and flexible at every viewport; bottom-band vertical padding increases at medium and large sizes.
- The action group wraps when space is constrained.

## Interaction states

- The section has only the normal link/button interactions supplied by its two CTA primitives.
- No open, loading, disabled, error, media-control, or custom JavaScript state exists in the returned section.

## Visual relationships

- Source-derived: the image fills the flexible top region and never shares the copy-band grid.
- Source-derived: copy-band peers align at the top in a two-column grid from medium widths.
- Source-derived: CTA spacing follows the description, and the two CTAs sit in a wrapping horizontal group when space permits.
- Inference: exact resolved dimensions, colors, fonts, and image crop are unavailable and therefore translate through Ren10 tokens.

## Unavailable evidence

- MCP returned source, not a rendered preview.
- Exact resolved Relume tokens, pixel measurements, hover/focus rendering, and the production image asset were unavailable.
- The returned image URL is a placeholder and is not suitable for public output.

## Public-output exclusions

- Do not copy React/TSX, source utility classes, package imports, install instructions, placeholder prose, CloudFront URL, or framework dependencies.
- Do not expose MCP transport logs or authenticated session data.
