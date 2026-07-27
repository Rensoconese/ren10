# Grok Implementation Packet — Header 4

## Objective

Implement Relume `header4` as
`templates/blocks/hero-split-email-video-lightbox.html` with isolated coverage in
`tests/components/header4-header.spec.cjs`.

## Sanitized Relume facts

- Hero header section (not navigation): copy left, video poster right at large
  widths; stacks on smaller widths.
- Anatomy: `h1` + description + email form (1 email field + 1 submit CTA) +
  terms line with link; media trigger with poster, dim overlay, play icon;
  dialog lightbox with loading spinner + video iframe.
- One marketing CTA only. No brand, no nav, no dropdowns.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- Preview root: `[data-rh4-root]` / `.rh4-section`.
- Layout: `ren-switcher` split for copy / media; form uses `ren-field` +
  `ren-btn`; terms use `ren-link`; media opens `ren-dialog`; spinner uses
  `ren-spinner`; play glyph uses `ren-icon`; the iframe contains deterministic
  native video media rather than a visual placeholder.
- Demo page chrome brand: R-in-square + Ren10 (and version badge). No brand
  inside the hero (source has none).
- Tokens only; Light DOM; real elements; ≥44px targets; reduced motion;
  light/dark; axe WCAG 2.1 AA.
- Demo package version 0.10.0.

## Acceptance criteria

1. Structure: one `h1`, one description, one email field, one submit CTA, one
   terms link, one media trigger, one dialog, one spinner, one iframe.
2. Landmarks: section root; no nested interactive duplicate controls.
3. Responsive: no root overflow at 320 / 390 / 767 / 768 / 1280; two-column at
   1280; stacked copy-above-media at 390.
4. Behavior: trigger opens dialog with playable video; Escape/backdrop close;
   spinner is visible until iframe load; form preventDefault submit;
   JS-disabled form and legal destinations resolve locally.
5. A11y: visible focus, 44px targets, reduced motion, light/dark, axe AA.

## RED then GREEN

Add the isolated Header 4 spec first and run it while the HTML is absent.
Record genuine RED. Only then implement production. Do not edit navbar files,
shared navigation specs, inventory, or block index.

## Allowed files

- `templates/blocks/hero-split-email-video-lightbox.html`
- `tests/components/header4-header.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/header4/**` (packet artifacts)

## Forbidden files and dependencies

- Existing `templates/blocks/nav-*.html` and navbar packet modules
- `docs/workflows/relume-to-ren10/inventory.json` (unless required by a later
  integration worker)
- Shared helpers, package files, core Ren10 files, registries
- Relume source and framework abstractions; Shadow DOM

## Required validation

```bash
npx playwright test tests/components/header4-header.spec.cjs --config tests/components/playwright.config.cjs
npm run lint
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/header4
git diff --check
```

Advance only through `green`. Do not author reviewed/accepted human acceptance.
