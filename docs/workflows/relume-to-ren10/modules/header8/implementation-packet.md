# Implementation Packet — Header 8

## Objective

Implement `header8` as `templates/blocks/hero-fullscreen-video-email-form.html`
with isolated coverage in `tests/components/header8-header.spec.cjs`.

## Exact anatomy

- One full-viewport background video: autoplay, loop, muted, cover, scrim.
- One left-centered copy stack: `h1`, description, email form, legal line.
- Form: exactly one visible labeled email input and one submit CTA.
- Stack narrow, row when the form has sufficient width.
- No nav, logo, menu, content card, or second marketing CTA.
- One accessible pause/resume media control is required for continuous motion.

## Ren10 and progressive-enhancement contract

- Vanilla HTML/CSS/JS, Light DOM, semantic/component tokens only.
- Use Ren10 layout primitives; real form/button/link elements; 44px targets.
- Use embedded permitted deterministic video plus local poster.
- Reduced motion pauses/hides video. JS-off keeps poster, copy, native form,
  and real local destinations functional.
- Validate light/dark, contrast, focus, axe AA, geometry, and overflow.

## RED then GREEN

Add and run the isolated test while production HTML is absent. Record the
genuine missing-page RED before implementation. Advance only through `green`;
human review remains independent.

## Allowed files

- `templates/blocks/hero-fullscreen-video-email-form.html`
- `tests/components/header8-header.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/header8/**`

Do not edit inventory, indexes, shared helpers, package files, or existing
blocks.
