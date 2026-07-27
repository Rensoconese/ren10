# Reference Brief — Header 19

## Retrieval metadata

- Family: `headers`
- Module ID: `header19`
- Source: complete authenticated Relume source supplied for this isolated task
- Retrieved at: 2026-07-15
- Source variant: content-height split image/copy hero with two actions

## Retrieved facts

- One content-height section and one horizontally constrained container.
- The main region is one responsive layout with vertically centered peers at large widths.
- Copy owns exactly one `h1`, one description, and exactly two CTA controls in a wrapping inline group.
- Media owns exactly one rounded cover image.
- Mobile and tablet: one column, copy first and image second.
- Large and wider: two columns, image left and copy right.
- Section, inter-column, copy, and action gaps increase through responsive bands.
- No form, dialog, video, overlay, navigation, logo, third CTA, or duplicate mobile tree exists.

## Required responsive checks

- 320, 390, 767, and 1023px: copy remains above the single image.
- 1024 and 1280px: image is left, copy is right, and the peers align around their vertical centers.
- CTA group wraps without shrinking controls below 44px or producing horizontal overflow.

## Ren10 corrections

- Replace source placeholder destinations with two distinct real local URLs.
- Use an owned local image with meaningful alternative text and intrinsic dimensions.
- Preserve real anchors, visible focus, 44px targets, theme-safe contrast, and reduced-motion-safe Ren10 transitions.
- Keep complete copy, actions, and image usable without JavaScript.

## Public-output exclusions

- Protected source, framework classes/imports, original copy, dependencies, URLs, or remote assets
- Form, dialog, video, overlay, navigation, logo, third CTA, duplicated content tree, full-viewport forcing
- Primitive palette tokens, hardcoded chromatic colors, or bespoke raw flex/grid skeletons

