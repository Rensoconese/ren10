# Implementation Packet — Header11

## Scope

Build one standalone Ren10 block at `templates/blocks/hero-fullscreen-video-top-copy-band-dual-cta.html` and one focused suite at `tests/components/header11-header.spec.cjs`.

## Required anatomy

- Full small-viewport-height column.
- Flexible top media region with exactly one native cover video and one full-region scrim.
- One accessible pause/play button inside the media region.
- Bottom band with h1 left and description plus exactly two CTA links right from desktop; mobile order is heading, description, CTAs.
- No form, navigation, logo, image, dialog, or extra CTA.

## Required behavior

- Video declares autoplay, loop, muted, and playsinline.
- JavaScript enhancement exposes one pause/play control and hides native controls only after enhancement.
- Reduced-motion users start paused and may explicitly play.
- JavaScript-disabled users retain native controls, full content, and both working destinations.
- Playback failure restores native controls.

## Quality gate

- Test-first RED from the absent production block.
- Real CTA destinations and deterministic permitted local video source.
- 320/390/767/768/1280 geometry; light/dark; 44px targets; focus; reduced motion; axe.
- Fresh cache-busted render matrix and visual inspection.
- Packet advances through reference, mapped, red, and green only; never reviewed.
- Focused tests, relevant lint, workflow validation, contract checks, and diff checks pass.
