# Implementation Packet — Header 7

## Objective

Translate authenticated Relume `header7` into the vanilla Ren10 block
`templates/blocks/hero-fullscreen-bg-video-left-copy-dual-cta.html`.

## Exact anatomy

- Full-viewport native background video with autoplay, loop, muted, cover and scrim.
- Vertically centered, constrained left copy: one `h1`, one description and exactly
  two CTA destinations using alternate then secondary emphasis.
- One accessible pause/play control is permitted as a media control, not a CTA.
- No nav, logo, form, image, dialog or framework abstraction.

## Required quality

- Deterministic owned video source; reduced motion starts paused.
- JavaScript-disabled fallback exposes native video controls.
- No overflow at 320/390/767/768/1280; light/dark and AA contrast.
- Real destinations, visible focus, 44px targets, axe WCAG 2.1 AA.

## Allowed files

- `templates/blocks/hero-fullscreen-bg-video-left-copy-dual-cta.html`
- `tests/components/header7-header.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/header7/**`

Advance only to `green`; independent Codex review is a later transition.
