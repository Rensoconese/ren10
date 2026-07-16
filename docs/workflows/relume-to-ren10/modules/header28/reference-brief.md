# Reference Brief — Header28

## Retrieval metadata

- Family: headers
- Module ID: header28
- Retrieved through: complete authenticated Relume source supplied for this task
- Retrieved at: 2026-07-15
- Source variant: one centered content-height header with landscape lightbox

## Retrieved facts

- One content-height section owns one centered constrained copy block.
- Copy owns exactly one h1, one description and exactly two distinct CTA destinations.
- One landscape media region follows the copy and owns exactly one poster button, scrim and centered play affordance.
- Exactly one dialog owns one title, close control, loader and aspect-video iframe.
- There is no form, input, navigation, logo, background video, second trigger, second dialog or second iframe.

## Responsive and interaction states

- Mobile through desktop keeps centered copy above landscape media; CTAs wrap without losing 44px targets.
- Closed: copy, two CTAs and poster trigger are visible.
- Open/loading: named dialog opens with busy stage, loader visible and iframe hidden.
- Loaded: loader hides and exactly one playable video appears.
- Escape, close and backdrop dismiss and restore focus to the trigger.
- Repeated open/close creates no duplicate video and clears iframe content each time.
- JavaScript disabled preserves copy, CTAs, poster and one real media-alternative link.
- Reduced motion removes optional dialog/control motion.

## Visual relationships

- h1 and description are centered with readable max widths.
- CTA cluster is centered beneath description.
- Landscape media is a single rounded wide surface beneath copy with uniform scrim and one play mark.

## Public-output exclusions

- Protected source prose/classes/URLs/assets/dependencies
- React, Tailwind, framework lightboxes or remote video
- Duplicate controls/media trees, forms or inputs
- Primitive palette tokens or hardcoded chromatic colors
