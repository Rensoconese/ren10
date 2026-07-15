# Reference Brief — Header 1

## Retrieval metadata

- Family: headers
- Module ID: header1
- Retrieved through: authenticated Relume MCP `get_component`
- Source slug: `header1`
- Primitive names returned: button, utils
- Source variants returned: one section

## Retrieved facts

- One semantic section contains a constrained container.
- The content is a responsive two-part composition: copy first and media second.
- Copy contains exactly one heading, one description, and one action group.
- The action group maps over exactly two default actions: one primary and one secondary.
- Media contains exactly one image with an alternate-text input.
- Small and medium layouts use one column; the large layout uses two equal columns and vertically centers both parts.
- Vertical section spacing increases across small, medium, and large widths.
- The image fills its column, uses cover fitting, and has rounded corners.

## Responsive states

- Mobile: copy followed by media in one column; actions may wrap.
- Tablet: same one-column order with larger vertical spacing.
- Large desktop: two equal columns with copy left, media right, aligned vertically.

## Interaction states

- Two navigational calls to action expose native link hover, active, and focus states.
- No disclosure, modal, carousel, animation, disabled, loading, or error state exists.

## Visual relationships

- Source-derived: copy and image are peers; desktop columns are equal; media is a single rounded cover image.
- Source-derived: copy elements use heading → description → actions ordering.
- Intentional Ren10 interpretation: semantic spacing, typography, button, surface, radius, border, and shadow tokens replace source utility values.

## Unavailable evidence

- MCP returned complete component source but no rendered screenshot, resolved theme values, or production image asset.

## Public-output exclusions

- Do not copy source class names, placeholder prose, placeholder URL, React/TSX, Tailwind utilities, Radix dependencies, or Relume runtime setup.
