# Grok Implementation Packet — Header 5

## Objective

Implement `header5` at `templates/blocks/hero-fullscreen-bg-left-copy-dual-cta.html`.

## Complete reference brief and RenDS map

The packet-local `reference-brief.md` and `translation-map.md` contain the complete
sanitized source facts and verified Ren10 mapping: fullscreen cover media, dark scrim,
one constrained left copy stack, one h1, one description, exactly two CTA controls.

## Acceptance and RED

Use `acceptance.json` and `render-matrix.json`. RED must be the focused
`tests/components/header5-header.spec.cjs` failing because the production block is absent.

## Allowed files

- `templates/blocks/hero-fullscreen-bg-left-copy-dual-cta.html`
- `tests/components/header5-header.spec.cjs`
- packet-local artifacts under `docs/workflows/relume-to-ren10/modules/header5/`

## Forbidden

No inventory/index/shared files, framework code, source copy/assets/classes/URLs,
primitive palette tokens, Shadow DOM, nav, brand, form, or third CTA.

## Required validation

Focused Playwright, render matrix, lint, agent check, workflow validation, and diff check.
Advance only through `green`.
