# Implementation Packet — Header9

## Scope

Build one standalone Ren10 block at `templates/blocks/hero-fullscreen-media-top-copy-band-dual-cta.html` and one focused suite at `tests/components/header9-header.spec.cjs`.

## Required anatomy

- Full small-viewport-height column.
- Flexible top media region with exactly one cover image.
- Bottom band with h1 left and description plus exactly two CTA links right from desktop; mobile order is heading, description, CTAs.
- No scrim, overlay, form, navigation, logo, video, or extra CTA.

## Quality gate

- Test-first RED from the absent production block.
- Real link destinations and no-JavaScript functionality.
- 320/390/767/768/1280 geometry; light/dark; 44px targets; focus; reduced motion; axe.
- Fresh matrix captures and visual review.
- Packet remains green; repository lint, agent checks, workflow validation, and diff checks pass.
