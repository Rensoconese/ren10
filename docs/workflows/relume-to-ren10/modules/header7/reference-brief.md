# Reference Brief — Header 7

## Retrieval metadata

- Family: `headers` (`hero-header-sections` in the Relume catalog)
- Module ID: `header7`
- Retrieved through: authenticated Relume OAuth MCP via
  `node /tmp/relume-fetch.mjs header7`
- Retrieved at: 2026-07-15
- Source variants returned: one complete React section (`Header7`)
- Supporting primitives named: `utils`, `button`

## Retrieved facts

- Full-viewport background-video hero; it is not navigation.
- The foreground is a constrained, left-aligned copy block vertically centered
  inside a viewport-minimum-height section.
- Exact copy anatomy: one `h1`, one description paragraph, then exactly two CTA
  controls in a wrapping group.
- CTA variants are alternate first and secondary-alternate second.
- The background layer is absolute and full bleed. It owns one native video
  with autoplay, loop and muted behavior, cover fitting, plus one full-inset
  neutral dark scrim.
- The source does not include a logo, nav, form, poster image, dialog, carousel
  or other foreground module.
- Source video metadata includes one URL and MIME type. Ren10 does not retain
  the third-party URL and instead uses a deterministic owned inline WebM.

## Responsive states

- Mobile through desktop: the same content order and left alignment remain.
- The hero and background media fill the viewport; foreground vertical padding
  increases across source breakpoints.
- CTA controls wrap when the narrow inline size requires it.

## Interaction states

- Two CTA hover/focus/active states.
- Native background video autoplays, loops and is muted.
- Ren10 adds a pause/play control because continuously moving background media
  requires a user-operable stop mechanism.
- Reduced-motion users start on a paused frame and may explicitly play it.

## Visual relationships

- Source-derived white foreground copy sits above a dark scrim over cover video.
- Heading is dominant; description is medium body; copy is substantially
  narrower than the viewport.
- No authoritative rendered screenshot or exact token metrics were returned.

## Progressive fallback

- Without JavaScript, native video controls remain enabled so the user can pause
  autoplay media; copy and both destination links remain normal HTML.
- With JavaScript, a compact custom pause/play button replaces native controls.

## Public-output exclusions

- Do not persist source React/Tailwind, original marketing copy, CDN URL,
  dependencies, breakpoint literals, or Relume classes in the public block.
