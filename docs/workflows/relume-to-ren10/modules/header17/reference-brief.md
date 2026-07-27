# Reference Brief — Header 17

## Retrieval metadata

- Family: `headers`
- Module ID: `header17`
- Retrieved through: authenticated Relume MCP source retrieval supplied for this task
- Retrieved at: 2026-07-15
- Source variant: one content-height hero with a landscape lightbox

## Retrieved facts

- The section is content-height and owns one horizontally constrained container.
- The first region is responsive copy:
  1. exactly one `h1` on the left;
  2. exactly one description followed by exactly two CTA controls on the right.
- The second region is exactly one full-width landscape lightbox trigger below the copy.
- The trigger owns exactly one cover image, one scrim, and one play affordance.
- One dialog owns a loader and exactly one iframe that resolves to one video.
- The dialog media width is approximately 738px at medium widths and 940px at large widths, with a 16:9 stage.
- No form, navigation, logo, background video, third CTA, second trigger, or duplicate content tree exists.

## Responsive and interaction states

- Mobile: heading, description, actions, then media form one source-ordered column; actions wrap.
- Medium and wider: heading is left; description/actions are right; trigger remains full container width below.
- The lightbox opens from the single media trigger, shows loading state, then reveals one playable video.
- Escape, explicit close, and backdrop dismiss the modal; focus returns to the invoking trigger.
- The modal traps keyboard focus while open.
- Without JavaScript, poster/copy/actions remain visible and one alternative media destination remains usable.
- Reduced motion removes optional dialog/loader animation without disabling the interaction.

## Visual relationships

- Copy and media share one container edge.
- The media is landscape, full-width, cover-cropped, rounded, and overlaid with a single scrim/play affordance.
- Dialog video stage remains 16:9 and grows from the medium target width to the large target width.

## Public-output exclusions

- Protected Relume source, classes, copy, dependencies, URLs, and assets
- React/Tailwind or other framework primitives
- Network/placeholder media
- Form, nav, logo, background video, third CTA, duplicate trigger, or duplicate dialog/media
- Primitive palette tokens and hardcoded chromatic colors
