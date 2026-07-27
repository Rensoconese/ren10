# Reference Brief — Header 8

## Retrieval metadata

- Family: `headers`
- Module ID: `header8`
- Retrieved through authenticated Relume source fetch (`node /tmp/relume-fetch.mjs header8`)
- Retrieved at: 2026-07-15
- Source variants returned: one React hero-header section (`Header8`)
- Supporting primitive names returned: `utils`, `button`, `input`

## Retrieved facts

Sanitized structural facts from the complete source; no protected copy, class
strings, dependencies, or asset URLs are persisted here.

- Hero header section, not navigation.
- Full-viewport section with a background video that covers the section.
- Decorative video is muted, loops, and starts automatically.
- A dark scrim separates foreground copy from moving media.
- One left-aligned, vertically centered copy region containing, in order:
  1. one `h1`;
  2. one supporting paragraph;
  3. one email form;
  4. one legal line with an inline terms link.
- Form anatomy is exactly one email input and one submit CTA.
- Form controls stack narrowly and share a row from the small state upward.
- No logo, brand, navigation, menu, second marketing CTA, or content card.

## Responsive states

- Desktop: full-height cover video; copy remains constrained and left aligned;
  email input grows while the submit stays content-sized in one row.
- Mobile: full-height cover media; copy remains vertically centered; input and
  submit stack to preserve usable widths and 44px targets.
- Ren10 width checks: 320, 390, 767, 768, and 1280px.

## Accessibility corrections required by Ren10

- Add a visible label instead of relying on placeholder text.
- Add `playsinline` and a deterministic, permitted media source.
- Provide a static poster and a JavaScript-disabled fallback.
- Pause decorative motion when `prefers-reduced-motion: reduce` is active.
- Provide a user-operable pause/resume control for continuous motion.
- Keep a real form action and real terms destination when JavaScript is off.

## Public-output exclusions

- Relume source, Tailwind/React classes, default copy, dependencies, and URLs
- Proprietary or network-dependent background assets
- Framework abstractions, Shadow DOM, invented navigation, or a second CTA
- Primitive palette tokens and hardcoded chromatic colors
