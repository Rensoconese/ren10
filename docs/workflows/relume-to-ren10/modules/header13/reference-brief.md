# Reference Brief — Header 13

## Retrieval metadata

- Family: `headers`
- Module ID: `header13`
- Retrieved through: authenticated Relume MCP `get_component` via
  `node /tmp/relume-fetch.mjs header13`
- Retrieved at: 2026-07-15
- Complete source returned: one section plus primitive names (`utils`,
  `button`, `dialog`)

## Retrieved facts

- One hero section is a full small-viewport-height vertical shell.
- Its upper region flexes to fill remaining height.
- The upper region contains exactly one full-cover button trigger with one
  cover image, one dark scrim, and one centered play-circle icon.
- Activating the trigger opens exactly one modal dialog.
- The dialog contains a centered loading indicator until exactly one iframe
  loads, then reveals that iframe.
- The iframe allows autoplay, encrypted media, picture-in-picture, and
  fullscreen.
- The lower content band contains one constrained container and one responsive
  two-column layout.
- The h1 is the left column. The right column contains one description and
  exactly two CTA controls, primary then secondary.
- On narrow screens the lower band stacks h1 first, then description and CTAs.
  From the medium state it becomes two columns; CTA controls wrap when needed.
- There is no form, navigation, logo, dropdown, background video, third CTA,
  or second play control.

## Responsive states

- Mobile: full-height shell; flexible media above; lower band is one column;
  CTA group wraps without changing DOM order.
- Medium and larger: lower band becomes two top-aligned columns with the h1 on
  the left and description/actions on the right.
- The dialog iframe stays aspect-video, fills available width, and is capped at
  progressively wider dimensions.
- Acceptance probes 320, 390, 767, 768, and 1280 widths without treating those
  exact pixels as copied Relume breakpoints.

## Interaction states

- Closed: poster, scrim, play icon, copy, and both CTAs are visible.
- Open/loading: native modal is open; loader visible; iframe hidden.
- Open/loaded: loader hidden; iframe visible and playable.
- Dismissed: Escape, backdrop, and explicit close dismiss the dialog and return
  focus to the trigger.
- JavaScript disabled: poster, copy, both CTA destinations, and a video
  alternative destination remain available; no dialog behavior is assumed.

## Public-output exclusions

- Do not persist copied Relume code, classes, marketing copy, external media
  URLs, framework dependencies, or proprietary assets.
- Do not introduce React, JSX/TSX, Tailwind, Radix, `relume-icons`, `clsx`,
  Shadow DOM, primitive palette tokens, or hardcoded chromatic values.
