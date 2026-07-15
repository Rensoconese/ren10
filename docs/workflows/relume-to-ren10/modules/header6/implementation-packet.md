# Implementation Packet — Header 6

## Objective

Implement authenticated Relume `header6` as
`templates/blocks/hero-fullscreen-bg-left-email-capture.html` with focused
coverage in `tests/components/header6-header.spec.cjs`.

## Sanitized source contract

- Full-viewport background image + full-inset dark scrim.
- Vertically centered constrained left copy: one h1, one description.
- Exactly one visible-label email input + exactly one submit CTA.
- Form stacks narrow and becomes growing-input/intrinsic-button row from small.
- One legal line + one real terms link.
- No nav, logo, second CTA, media sibling, video, disclosure, or dialog.

## Ren10 implementation contract

- Root `[data-rh6-root]`, `ren-cover`, `ren-center-wide`, `ren-stack`,
  `ren-switcher`, one `ren-field`, one `.ren-input`, one `.ren-btn`.
- Local decorative cover asset, one scrim with semantic overlay composition.
- Native required/email/autocomplete validation and a real GET form action that
  remains usable with JavaScript disabled.
- JS enhancement announces success without navigation; no fake backend claim.
- Tokens only, Light DOM, visible focus, 44px targets, reduced motion, AA.

## RED then GREEN

Write and run the focused spec while the production block is absent. Record the
expected missing-root/anatomy failures. Only then add production HTML/CSS/JS.
Advance this packet only through `green`.

## Allowed files

- `templates/blocks/hero-fullscreen-bg-left-email-capture.html`
- `tests/components/header6-header.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/header6/**`

## Forbidden

No shared inventory/index, other blocks/tests, source copy/assets/classes/URLs,
framework dependencies, primitive palette tokens, Shadow DOM, nav, logo, second
CTA, injected HTML, fake remote API, or third-party runtime.

## Required validation

Focused Playwright, complete render matrix, axe, light/dark, reduced-motion,
JavaScript-disabled form navigation, lint, evals/agent check, workflow validation,
contract counts, stale-reference check, `git diff --check`, and scope audit.
