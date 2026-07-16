# Reference Brief — Header 10

## Retrieval metadata

- Family: `headers`
- Module ID: `header10`
- Retrieved through authenticated Relume source fetch (`node /tmp/relume-fetch.mjs header10`)
- Retrieved at: 2026-07-15
- Source variants returned: one React hero-header section (`Header10`)
- Supporting primitive names returned: `utils`, `button`, `input`

## Retrieved facts

Sanitized structural facts from the complete source; protected copy, classes,
dependencies, and asset URLs are not persisted.

- Full small-viewport-height vertical hero composition.
- Top region is cover image media and flexes to consume all height not used by
  the copy band.
- Bottom copy band has horizontal page padding and a constrained container.
- The band is one column narrowly and two columns from the medium state:
  1. one `h1` in the left column;
  2. description, email capture, and legal line in the right column.
- Email capture is exactly one email input and one submit CTA.
- Form controls stack narrowly and become one row from the small state.
- Legal text follows the form and contains one inline terms link.
- No brand, logo, navigation, video, scrim, CTA pair, dialog, or menu.

## Responsive states

- Desktop: top cover image fills remaining height; bottom band is two columns
  with heading left and supporting content/form right.
- Mobile: image remains above; band becomes one column; heading precedes the
  description and form; input and submit stack.
- Ren10 width checks: 320, 390, 767, 768, and 1280px.

## Accessibility corrections required by Ren10

- Add a visible label rather than relying on placeholder text.
- Replace placeholder/network media with an owned local image.
- Replace injected legal HTML with semantic markup and a real destination.
- Keep a real no-JavaScript form action and native email validity.
- Preserve 44px targets, visible focus, and theme-safe contrast.

## Public-output exclusions

- Relume source, Tailwind/React classes, default copy, dependencies, and URLs
- Network placeholder assets and injected HTML
- Framework abstractions, Shadow DOM, navigation, video, scrim, or second CTA
- Primitive palette tokens and hardcoded chromatic colors
