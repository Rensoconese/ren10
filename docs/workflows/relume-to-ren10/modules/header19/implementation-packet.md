# Implementation Packet — Header 19

## Objective

Implement `header19` as `templates/blocks/hero-split-image-left-copy-dual-cta.html`
with isolated coverage in `tests/components/header19-header.spec.cjs`.

## Exact anatomy

- One content-height section with one constrained container.
- One copy region containing exactly one h1, one description, and two CTA anchors in a wrapping group.
- One rounded full-cover landscape image.
- Copy first and image second in one column through 1023px.
- Image left and copy right in two vertically centered columns from 1024px.
- No form, nav, logo, video, overlay, dialog, third CTA, duplicate tree, or full-svh behavior.

## Ren10 contract

- Vanilla semantic HTML/CSS, Light DOM, semantic/component tokens only.
- `ren-center`, `ren-switcher`, `ren-stack`, `ren-cluster`, and `ren-frame` own structure.
- Two real distinct local destinations, owned meaningful image, focus, 44px, light/dark, reduced motion, axe AA, and JavaScript-disabled completeness.
- No JavaScript unless strictly necessary; any script introduced must be inline `type="module"` and root-scoped.

## RED then GREEN

Run the isolated spec while production HTML is absent and record the genuine missing-page RED. Advance only to `green`; human review remains a later gate.

## Allowed files

- `templates/blocks/hero-split-image-left-copy-dual-cta.html`
- `tests/components/header19-header.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/header19/**`

Do not edit inventory, catalog/index, package files, shared helpers, or other blocks.

