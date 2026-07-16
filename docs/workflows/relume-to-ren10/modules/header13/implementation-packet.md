# Implementation Packet — Header 13

## Objective

Translate Relume `header13` into
`templates/blocks/hero-lightbox-top-copy-band-dual-cta.html` using only
Ren10 vanilla HTML, CSS, and JavaScript.

## Required anatomy

- One full-height vertical hero.
- One flexible upper poster trigger with image, scrim, and play icon.
- One accessible `ren-dialog` lightbox with loader and one iframe.
- One lower band: h1 left; description and exactly two CTA links right.
- Mobile stack and medium two-column band.

## Required behavior

- Lazy deterministic playable media; explicit loading state.
- Escape, backdrop, close control, focus trap, and focus restoration.
- Video unloaded on close.
- Reduced motion and JavaScript-disabled fallback.
- Both CTA and fallback destinations resolve locally.

## Allowed files

- `templates/blocks/hero-lightbox-top-copy-band-dual-cta.html`
- `tests/components/header13-header.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/header13/**`

## Forbidden scope

- Inventory, catalog, global block index, package/core/component sources.
- Any framework source or dependency, external copied URL/asset, nav, logo,
  form, background video, third CTA, or duplicate media control.

## Required validation

```bash
npx playwright test tests/components/header13-header.spec.cjs --config tests/components/playwright.config.cjs --workers=1
npm run lint
npm run agent:check
node evals/run-eval.mjs --all
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/header13
git diff --check
```

Advance through `green` only. Independent review owns `reviewed`.
