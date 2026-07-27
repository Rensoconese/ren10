# Reference Brief — Header 16

## Retrieval metadata

- Family: `headers`
- Module ID: `header16`
- Source: complete authenticated Relume source supplied for this isolated task
- Retrieved at: 2026-07-15
- Source variant: content-height split-copy email hero with landscape media

## Retrieved facts

- One content-height section; it is not a full-viewport composition.
- One horizontally constrained container owns the whole module.
- The upper region is one responsive copy layout:
  1. exactly one `h1` on the left;
  2. exactly one description followed by exactly one form on the right;
  3. the form owns exactly one email field, one submit control, validation/error/status, and legal copy with one terms link.
- The form is stacked narrowly and becomes an email-plus-submit row from the small breakpoint.
- The lower region is exactly one full-width landscape image with rounded clipping and cover fitting.
- No second CTA, navigation, logo, video, dialog, overlay, scrim, card grid, or duplicated mobile tree exists.

## Responsive states

- Mobile: heading, description, form, legal copy, and image remain in source order in one column.
- Small and wider: the email and submit control share one row.
- Medium and wider: heading owns the left column and description/form own the right column; both columns align at the top.
- The landscape image remains full container width below the copy at every width.
- Required width checks: 320, 390, 640, 767, 768, and 1280px.

## Ren10 corrections

- Provide a visible email label, native email/required validity, linked error state, and a polite success status.
- Replace placeholder destinations with a real local form action and real local terms URL.
- Use one owned local image with meaningful alternative text and intrinsic dimensions.
- Keep the form, terms destination, image, and native validation useful without JavaScript.
- Scope the single inline module to the block root.

## Public-output exclusions

- Protected source, framework code/classes, original copy, dependencies, URLs, or remote assets
- Full-viewport forcing, extra CTA, navigation, logo, dialog, video, overlay, duplicate tree
- Primitive palette tokens, hardcoded chromatic colors, and raw flex/grid skeletons

