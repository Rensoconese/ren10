# Reference Brief — Header21

## Retrieval metadata

- Family: `headers`
- Module ID: `header21`
- Source: authenticated Relume component facts supplied for this isolated task
- Source variant: content-height split hero with a video lightbox

## Retrieved facts

- One content-height section owns one constrained split composition.
- Mobile source order is copy followed by media.
- At desktop the media/lightbox occupies the left column and copy occupies the right column.
- Copy owns exactly one `h1`, one description, and exactly two CTA destinations.
- Media owns exactly one landscape poster trigger with one image, one scrim, and one play affordance.
- Exactly one modal owns one loading indicator and one aspect-video iframe resolving to one video.
- No email form, navigation, logo, background video, third CTA, second trigger, second dialog, or duplicate content tree exists.

## Interaction and responsive states

- Mobile: heading, description, actions, then landscape trigger in logical source order.
- Desktop: landscape trigger left and copy right, aligned at their starts.
- The trigger opens one modal, shows a loader, and reveals one playable video after load.
- Escape, explicit close, and backdrop dismiss; focus returns to the trigger.
- Focus remains trapped while the modal is open.
- Without JavaScript, copy, both CTA destinations, poster, and one real video-alternative destination remain usable.
- Reduced motion removes optional modal motion without disabling interaction.

## Public-output exclusions

- Protected Relume source, dependencies, classes, prose, URLs, and assets
- React, Tailwind, shadcn, Radix, external embeds, or framework code
- Form, nav, logo, background video, third CTA, duplicate media/dialog, primitive palette tokens, or hardcoded chroma
