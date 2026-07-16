# Implementation Packet — Header 12

## Objective

Implement `header12` as `templates/blocks/hero-video-email-split-band.html`
with isolated coverage in `tests/components/header12-header.spec.cjs`.

## Exact anatomy

- Full-svh vertical composition.
- Top owned cover video region flexes to all remaining height and owns exactly
  one video/source, one poster, one scrim, and one pause/play button.
- Bottom surface band: heading left and description/email/legal right at the
  wide state; stacked in that order narrowly.
- Form: exactly one visibly labeled email input and one submit CTA.
- Form stacks mobile and forms a row from the small state.
- No navigation, logo, second CTA, card, dialog, or menu.

## Ren10 and progressive-enhancement contract

- Vanilla HTML/CSS/JS, Light DOM, semantic/component tokens only.
- Ren10 layout primitives; real form/input/button/link; 44px targets.
- Owned deterministic media only; light/dark, focus, reduced-motion, axe AA.
- Reduced motion starts paused on poster; JavaScript-disabled poster, form,
  and legal destinations remain functional.

## RED then GREEN

Run the isolated spec while production HTML is absent and persist the genuine
missing-page RED. Advance only to `green`; independent review and human
acceptance remain separate gates.

## Allowed files

- `templates/blocks/hero-video-email-split-band.html`
- `tests/components/header12-header.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/header12/**`

Do not edit inventory, indexes, package files, shared helpers, or other blocks.
