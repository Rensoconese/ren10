# Reference Brief — Header 12

## Retrieval metadata

- Family: `headers`
- Module ID: `header12`
- Retrieved through authenticated Relume source fetch (`node /tmp/relume-fetch.mjs header12`)
- Retrieved at: 2026-07-15
- Source variants returned: one React hero-header section (`Header12`)
- Supporting primitive names returned: `utils`, `button`, `input`

## Retrieved facts

Sanitized structural facts from the complete source; protected copy, classes,
dependencies, and asset URLs are not persisted.

- Full small-viewport-height vertical hero composition.
- The first child is a relative media region that flexes to consume all height
  not used by the bottom band.
- The media region contains exactly one absolutely inset cover video with one
  source. It autoplays, loops, and is muted.
- One full-inset neutral-dark scrim sits above the video.
- The bottom band has horizontal page padding and a constrained container.
- The band is one column narrowly and two columns from the medium state:
  1. one `h1` in the left column;
  2. description, email capture, and legal line in the right column.
- Email capture is exactly one email input and one submit CTA.
- Form controls stack narrowly and become one row from the small state.
- Legal text follows the form and contains one inline terms link.
- No brand, logo, navigation, second CTA, image card, dialog, or menu.

## Responsive states

- Desktop: video fills the flexible top remainder; bottom band splits heading
  left from description/form/legal right.
- Mobile: video remains above; band becomes one column in source order; input
  and submit stack.
- Ren10 width checks: 320, 390, 767, 768, and 1280px.

## Accessibility corrections required by Ren10

- Add `playsinline`, an owned deterministic poster, and an independent real
  pause/play button.
- Start paused under `prefers-reduced-motion` and retain a complete static
  poster fallback when JavaScript is disabled.
- Add a visible email label rather than relying on placeholder text.
- Replace injected legal HTML with semantic markup and a real destination.
- Keep a real no-JavaScript form action, native email validity, corrective
  error text, and a polite enhanced status.
- Preserve 44px targets, visible focus, and theme-safe contrast.

## Public-output exclusions

- Relume source, Tailwind/React classes, default copy, dependencies, and URLs
- Network placeholder media and injected HTML
- Framework abstractions, Shadow DOM, navigation, logo, or second CTA
- Primitive palette tokens and hardcoded chromatic colors
