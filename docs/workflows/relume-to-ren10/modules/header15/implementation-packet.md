# Implementation Packet — Header 15

## Objective

Implement `header15` as
`templates/blocks/hero-split-copy-dual-cta-landscape-image.html` with isolated
coverage in `tests/components/header15-header.spec.cjs`.

## Exact anatomy

- Content-height section with one constrained container.
- Top copy layout: one h1 left and description plus exactly two CTA anchors
  right when wide; one source-order column narrowly.
- One full-width rounded landscape cover image below the copy.
- CTA group wraps when needed.
- No full-svh behavior, nav, logo, form, video, overlay, dialog, or third CTA.

## Ren10 contract

- Vanilla semantic HTML/CSS, Light DOM, semantic/component tokens only.
- `ren-center`, `ren-stack`, `ren-switcher`, `ren-cluster`, and `ren-frame` own
  structure; real anchors and one real image.
- Distinct owned destinations, meaningful alt/intrinsic size, focus, 44px,
  light/dark, reduced motion, axe AA, and JavaScript-disabled completeness.

## RED then GREEN

Run the isolated spec while production HTML is absent and record the genuine
missing-page RED. Advance only to `green`; independent review and human
acceptance remain separate gates.

## Allowed files

- `templates/blocks/hero-split-copy-dual-cta-landscape-image.html`
- `tests/components/header15-header.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/header15/**`

Do not edit inventory, indexes, package files, shared helpers, or other blocks.
