# Grok Implementation Packet — Header 3

## Objective

Implement Relume `header3` as the standalone Ren10 block
`templates/blocks/hero-text-left-video-lightbox.html` with isolated coverage in
`tests/components/header3-header.spec.cjs`.

## Sanitized Relume facts

- Split hero: text left (heading + description + exactly two CTAs), media right
  (video thumbnail with play control opening a modal video lightbox).
- One iframe video surface and a loading indicator while the embed loads.
- No brand/logo in the section tree, no navigation, no dropdowns, no third CTA.
- Responsive intent: stack on small/medium; two columns with vertical centering
  at large; wrapping CTA cluster.
- Source defects: unnamed play button, anonymous section, spinner without
  reduced-motion branch, no progressive enhancement for the media path.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- Preview root: `[data-rh3-root]` / `.rh3-hero`.
- Landmark: `<header aria-labelledby="rh3-heading">`.
- Copy: heading + lede + `.rh3-actions` with primary + secondary `.ren-btn`.
- Layout: `.rh3-layout.ren-switcher` + media in `.ren-frame.ren-frame-video`.
- Lightbox: `<ren-dialog id="rh3-video" size="xl">` with title, close control,
  spinner, and titled iframe.
- Media opener: single named control with `data-dialog-trigger="rh3-video"`;
  progressive link fallback when JS is off.
- Tokens only; Light DOM; package demo chrome uses R-in-square + Ren10.
- ≥44px targets; no root overflow; light/dark; reduced motion; axe WCAG 2.1 AA.

## RED then GREEN

Create the isolated Header 3 spec first and run it while the HTML is absent.
Record genuine RED. Only then implement production HTML/CSS/JS in the block
file. Advance the packet only through `green` (never `reviewed` / `accepted`).

## Allowed files

- `templates/blocks/hero-text-left-video-lightbox.html`
- `tests/components/header3-header.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/header3/**` (packet artifacts)
- `docs/workflows/relume-to-ren10/inventory.json` (module ledger entry only)

## Forbidden files and dependencies

- Existing navbar block HTML/CSS/JS and navbar packet files
- `tests/components/blocks-navigation.spec.cjs` and other navbar specs
- Other worktrees
- Relume source and framework abstractions; Shadow DOM

## Required validation

```bash
npx playwright test tests/components/header3-header.spec.cjs --config tests/components/playwright.config.cjs --workers=1
npm run lint
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/header3
git diff --check
```
