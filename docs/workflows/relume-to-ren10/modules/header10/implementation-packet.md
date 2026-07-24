# Implementation Packet — Header 10

## Objective

Implement `header10` as `templates/blocks/hero-cover-image-email-split-band.html`
with isolated coverage in `tests/components/header10-header.spec.cjs`.

## Exact anatomy

- Full-svh vertical composition.
- Top owned cover image region flexes to all remaining height.
- Bottom surface band: heading left and description/email/legal right at the
  wide state; stacked in that order narrowly.
- Form: exactly one visibly labeled email input and one submit CTA.
- Form stacks mobile and forms a row when there is enough room.
- No CTA pair, scrim, video, navigation, logo, card, or menu.

## Ren10 and progressive-enhancement contract

- Vanilla HTML/CSS/JS, Light DOM, semantic/component tokens only.
- Ren10 layout primitives; real image/form/input/button/link; 44px targets.
- Local owned media only; light/dark, focus, reduced-motion, axe AA.
- JavaScript-disabled form and legal destinations remain functional.

## RED then GREEN

Run the isolated spec while production HTML is absent and persist the genuine
missing-page RED. Advance only to `green`; human review/acceptance remain
independent.

## Allowed files

- `templates/blocks/hero-cover-image-email-split-band.html`
- `tests/components/header10-header.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/header10/**`

Do not edit inventory, indexes, package files, shared helpers, or other blocks.
