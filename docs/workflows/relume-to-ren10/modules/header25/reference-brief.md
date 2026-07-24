# Reference Brief — Header25

## Retrieval metadata

- Family: `headers`
- Module ID: `header25`
- Retrieved through: authenticated Relume source facts supplied for this task
- Source variant: centered content-height search hero

## Retrieved facts

- One content-height section owns one horizontally centered, max-width content column.
- The column owns exactly one `h1`, one description, and one search form.
- The form owns exactly one `input type="search"`, one decorative leading search icon, and one submit button.
- The field has a robust label; the icon does not contribute a second accessible name.
- No legal copy, media, image, video, dialog, navigation, logo, secondary form, or extra CTA exists.

## Responsive and interaction states

- The form is an input/submit row where space permits.
- At narrow widths, including 320px, the field and submit may stack to prevent overflow.
- Native GET submission reaches a real local results target with the search query.
- With JavaScript, valid submission may expose a polite status without adding another action.
- Without JavaScript, the same native form remains fully functional.
- Required native validation prevents an empty search.

## Visual relationships

- Heading, description, and form share one centered text/content axis.
- The search field is the flexible peer and the submit is max-content when inline.
- The decorative icon remains inside the input frame at its left edge.

## Public-output exclusions

- Protected Relume source, prose, classes, dependencies, URLs, and assets
- React, Tailwind, shadcn, Radix, framework runtime, media, legal copy, or additional CTA
- Primitive palette tokens or hardcoded chromatic values
