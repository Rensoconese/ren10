# Reference Brief — Header 23

## Retrieval metadata

- Family: `headers`
- Module ID: `header23`
- Retrieved through: authenticated Relume MCP (`get_component`)
- Retrieved at: 2026-07-15
- Source variants returned: one complete content-height centered hero
- Supporting primitives named by source: button and utility helper

## Retrieved facts

- One content-height section with responsive vertical padding.
- One horizontally constrained container owns the whole section.
- One centered inner copy region has a finite maximum width.
- The copy region owns exactly one `h1`, one description, and one action group.
- The action group owns exactly two CTA controls: primary followed by secondary.
- There is no form, input, image, video, dialog, overlay, navigation, logo, card,
  badge, icon, third CTA, or duplicated responsive tree.

## Responsive states

- The centered single-column anatomy is unchanged across mobile, tablet, and desktop.
- Section spacing and copy-to-action spacing increase at the medium band.
- The source action row is centered; Ren10 must preserve the relationship while
  allowing safe wrapping on narrow screens.

## Interaction states

- Only the two CTA controls are interactive.
- The source defines no open, loading, disabled, selected, or error state.
- Ren10 replaces placeholder controls with two distinct real local destinations.

## Visual relationships

- Heading, description, and actions share one centered alignment axis.
- The copy region is narrower than the outer container.
- The primary CTA precedes the secondary CTA.
- Typography and spacing increase through responsive bands, without viewport-height forcing.

## Unavailable evidence

- MCP returned complete source but no rendered preview, resolved theme tokens, or
  production assets. No pixel-perfect inference is accepted.

## Public-output exclusions

- Protected source, source copy, classes, URLs, framework code, dependencies, and runtime setup
- Form, media, dialog, overlay, navigation, logo, icon, third CTA, duplicate tree
- Primitive palette tokens, hardcoded chromatic colors, or bespoke raw flex/grid skeletons
