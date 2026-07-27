# Implementation Packet — Header 16

## Objective

Implement `header16` as `templates/blocks/hero-split-email-form-landscape-image.html`
with isolated coverage in `tests/components/header16-header.spec.cjs`.

## Exact anatomy

- One content-height section with one constrained container.
- Upper layout: one h1 left and one description plus exactly one email form right when wide; one source-order column narrowly.
- Form: exactly one visible-label email input, one submit, linked error, polite status, legal copy, and one terms link; stacked narrowly and row from small.
- One full-width rounded landscape cover image below the copy.
- No full-svh behavior, extra CTA, nav, logo, video, overlay, dialog, or duplicate tree.

## Ren10 contract

- Vanilla semantic HTML/CSS, Light DOM, semantic/component tokens only.
- `ren-center`, `ren-stack`, `ren-switcher`, and `ren-frame` own structure; `ren-field` and `ren-button` own controls.
- Real local action and terms destinations, owned meaningful image, focus, 44px, light/dark, reduced motion, axe AA, and JavaScript-disabled completeness.
- Exactly one block-local inline `type="module"` script, rooted at `[data-rh16-root]`.

## RED then GREEN

Run the isolated spec while production HTML is absent and record the genuine missing-page RED. Advance only to `green`; human review remains a later gate.

## Allowed files

- `templates/blocks/hero-split-email-form-landscape-image.html`
- `tests/components/header16-header.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/header16/**`

Do not edit inventory, catalog/index, package files, shared helpers, or other blocks.

