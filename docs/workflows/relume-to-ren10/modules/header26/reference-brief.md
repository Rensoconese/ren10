# Reference Brief — Header26

## Retrieval metadata

- Family: `headers`
- Module ID: `header26`
- Source: authenticated Relume MCP response
- Source variant: centered copy and dual CTA above one landscape image

## Retrieved facts

- One content-height section owns one centered column.
- A centered max-width copy group owns exactly one `h1`, one description, and one action row.
- The action row owns exactly two CTA controls.
- One full-width landscape image follows the copy group.
- There is no form, input, legal copy, video, dialog, overlay, navigation, logo, or JavaScript behavior.

## Responsive facts

- DOM and visual order remain copy, actions, then image at every viewport.
- Section padding and the copy-to-image gap increase at larger breakpoints.
- The two actions remain centered and must wrap safely rather than overflow at 320px.
- The image remains a full-width 16:9 landscape frame.

## Ren10 safety additions

- Both CTAs become real anchors with distinct, resolvable destinations.
- The image is an owned intrinsic SVG data asset with truthful alternative text, width, and height.
- Focus, touch geometry, light/dark, reduced motion, no-JavaScript, and axe AA are required.

## Public-output exclusions

- Protected Relume prose, classes, dependencies, URLs, and assets
- React, Tailwind, shadcn, Radix, framework runtime, form behavior, or extra interaction
- Primitive palette tokens or hardcoded chromatic CSS values
