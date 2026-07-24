# Grok Implementation Packet — Navbar 30

## Objective

Implement `navbar30` as the Ren10 block
`templates/blocks/nav-mega-menu-categories-products.html` with isolated
Playwright coverage in `tests/components/navbar30-navigation.spec.cjs`.

## Source-neutral identity

- Block slug: `nav-mega-menu-categories-products`
- Preview root: `[data-rmcp-root]`
- Links list id: `#rmcp-primary-links`
- Class prefix: `rmcp-`

## Anatomy to implement

1. One `<ren-nav>` wrapping one `<nav class="ren-nav" aria-label="…">`.
2. One brand link, four top-level `<li>` peers: three plain `.ren-nav-link`
   anchors + one `details.rmcp-disclosure`.
3. Mega panel with:
   - three category groups (heading + five `.rmcp-mega-link` each → 15 links);
   - two product whole-card anchors (`a.rmcp-card.ren-card.ren-card-interactive`)
     each with `.rmcp-card-media.ren-frame` (~3:2) + `.rmcp-card-title` only.
4. Two actions in `.ren-nav-actions` (secondary + primary `.ren-btn` anchors).
5. One `.ren-nav-toggle` with accessible name, `aria-expanded`, `aria-controls`.
6. Exactly one `.rmcp-chevron` inside the summary.

## Behavior to implement

- Desktop ≥48rem: absolute full-width mega under the bar; hover corridor;
  click pin; Escape returns focus to summary even from a focused destination;
  outside click closes; category link, product card, and action CTA activation
  close when appropriate.
- Mobile <48rem: toggle shell; mega in-flow; closing shell closes mega;
  activation-only (no hover open).
- Same-breakpoint resize stable; crossing 48rem closes mega and resets hover
  policy.
- JS-off: tree + actions + native disclosure usable; toggle hidden.
- Light/dark tokens; reduced motion; 44×44 targets; no html overflow;
  single chevron / no classless pseudo-chevron.

## Forbidden

- Copying Relume source, classes, copy, URLs, assets, SVG paths, durations, or
  breakpoint constants.
- Editing inventory, blocks index, shared navigation suite, helpers, or core
  Ren10 files.
- Advancing green→reviewed or authoring Codex green-evidence for visual review.
- Accessing private custom-element fields such as `_isOpen`.

## Verification

1. Isolated RED with HTML absent.
2. Implement HTML only under allowed paths.
3. Focused Playwright on `navbar30-navigation.spec.cjs`.
4. Render-matrix capture, lint, packet validate, `git diff --check`, contract
   count greps.
5. Advance only red→green with real red evidence (not Codex visual green).
