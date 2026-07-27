# Reference Brief — Header22

## Retrieval metadata

- Family: headers
- Module ID: header22
- Retrieved through: authenticated Relume source supplied for this task
- Retrieved at: 2026-07-15
- Source variants returned: one complete split content-height section

## Retrieved facts

- One content-height section owns one constrained responsive split.
- Mobile source order is copy, email form and legal line, then media.
- Desktop uses two vertically centered columns: video lightbox media left and copy/form/legal right.
- Copy owns exactly one h1 and one description.
- The form owns exactly one visible email label/input and one submit, followed by one legal line and one terms destination.
- Media owns exactly one poster, one button trigger, one scrim/play affordance, one dialog, one loader and one video surface.
- No navigation, logo, second CTA, second form, second trigger, second dialog, overlay copy or background video exists.

## Responsive states

- 320/390: one column in semantic order; form stacks; media follows copy.
- 640: outer layout remains one column; email and submit form one row.
- 1023: outer layout remains copy then media.
- 1024/1280: two equal centered columns; media is visually left and copy visually right.

## Interaction states

- Pristine: field error and success status are hidden.
- Invalid: one Ren10 error appears and focus remains on the email input, without duplicate browser feedback.
- Success: one polite status is announced without navigation.
- Lightbox loading: dialog opens, loader appears and video surface remains hidden.
- Lightbox loaded: loader hides and exactly one playable video surface appears.
- Escape, close and backdrop dismiss the dialog and restore trigger focus.
- JavaScript disabled: native email validation/submission, terms and a real media alternative remain usable.

## Visual relationships

- Both desktop columns are equal and vertically centered.
- Poster is a single rounded landscape surface with a uniform scrim and centered play affordance.
- Copy/form width remains readable; input grows while submit remains intrinsic at the small seam.

## Unavailable evidence

- Exact resolved source pixels, proprietary assets and production copy are not public output.

## Public-output exclusions

- Source classes, copy, URLs, dependencies and assets
- React, Tailwind, framework abstractions or remote media
- Duplicate form, trigger, dialog, loader or video trees
- Primitive palette tokens or hardcoded chromatic colors
