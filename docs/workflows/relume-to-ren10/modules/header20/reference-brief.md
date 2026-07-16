# Reference Brief — Header 20

## Retrieval metadata

- Family: `headers`
- Module ID: `header20`
- Retrieved through: complete authenticated Relume source supplied for this task
- Retrieved at: 2026-07-15
- Source variant: one content-height split image/email hero

## Retrieved facts

- One content-height section owns one constrained container and one responsive grid.
- Mobile is one column in source order: copy first, then exactly one image.
- Large widths use two vertically centered columns: image left, copy right.
- Copy owns exactly one `h1`, one description, and exactly one email form.
- The form owns one visible email label/input, one submit, one legal line, and one terms link.
- The form stacks initially and becomes an input/submit row at the small breakpoint.
- The only image is owned, meaningfully labelled, intrinsically sized, rounded, and cover-fitted.
- No extra CTA, second form, dialog, video, overlay/scrim, navigation, brand, or logo exists.

## Responsive and behavior states

- 320/390: one-column copy then image; form stacked.
- 640: layout remains one-column while form changes to a row.
- 1023: layout remains one-column.
- 1024/1280: image moves left of copy in two equal centered columns.
- JavaScript enhances native validation with visible error and live success status.
- Without JavaScript the labelled required email form submits through its real native action and the terms destination remains usable.
- Reduced motion collapses optional control transitions.

## Accessibility corrections

- Keep a visible label, native `required`/`type=email`, wired error, explicit invalid state, live status, real form action, and real terms URL.
- Preserve real input/button/link elements, keyboard focus, 44px targets, meaningful alt, and intrinsic image dimensions.

## Public-output exclusions

- Protected source, classes, copy, URLs, dependencies, and assets
- React/Tailwind or framework primitives
- Placeholder/network image
- Extra CTA/form, dialog, video, overlay, nav, brand, logo, or duplicate tree
- Primitive palette tokens and hardcoded chromatic colors
