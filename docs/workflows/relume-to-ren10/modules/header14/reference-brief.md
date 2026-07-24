# Reference Brief — Header14

## Retrieval metadata

- Family: headers
- Module ID: header14
- Source: complete authenticated Relume MCP extraction performed by the parallel reference-review agent in this same batch; reused after the local callback port became occupied.
- Retrieved at: 2026-07-15
- Complete source returned: one section plus primitive inventory.
- Raw source was not persisted and no source hash is invented.

## Retrieved facts

- One section is a full small-viewport-height vertical column.
- Its upper region flexes to consume remaining height.
- The upper region contains exactly one absolute full-cover button trigger with one cover image, one 50% dark scrim, and one centered play-circle affordance.
- Exactly one modal dialog contains one loading spinner and exactly one iframe; the iframe remains hidden until load.
- The iframe is aspect-video, fills available width, has progressive medium/large caps, allows autoplay, encrypted media, picture-in-picture, and fullscreen.
- The lower band contains one constrained responsive layout: h1 left; description plus exactly one email form and one legal line right.
- The form contains exactly one email input and one submit control. Mobile uses one column; from small width it uses input plus max-content submit in one row.
- Mobile stacks the band; medium and wider use two top-aligned columns.
- Source omits a visible label, validation/status UI, real form destination, and real terms destination; Ren10 supplies those required accessibility/progressive-enhancement improvements.
- There is no extra CTA, nav, logo, background video, second dialog, second iframe, or second form.

## Interaction states

- Closed: poster trigger, copy, form, legal line, and terms link are visible.
- Open/loading: modal open, spinner visible, iframe hidden.
- Open/loaded: spinner hidden and iframe visible.
- Dismissed: Escape, backdrop, or close affordance closes and returns focus.
- JavaScript disabled: image, copy, native form destination, legal link, and video-alternative destination remain available.

## Public-output exclusions

- Do not persist copied source, utility classes, injected HTML, placeholder prose, proprietary media URLs, fragment destinations, or framework dependencies.
- Do not introduce React/TSX, Tailwind, Radix, external embeds, or Relume runtime code.
