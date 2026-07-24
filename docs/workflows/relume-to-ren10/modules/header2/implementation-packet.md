# Grok Implementation Packet — Header 2

## Objective

Implement `header2` as
`templates/blocks/hero-split-email-form-media-right.html` with isolated
coverage in `tests/components/header2-header.spec.cjs`.

## Sanitized Relume facts

- Hero header (not navbar): heading + description + email signup form with
  **one** CTA + terms link + peer media image on the end/right.
- Large widths: two columns, copy start, media end, vertically centered.
- Narrow widths: single column, copy then media; form stacks.
- No menu, no dropdowns, no drawer, no second CTA, no logo inside the hero.
- Source defects: placeholder-only email labeling, HTML-injected terms,
  generic section without name, CDN placeholder image, framework stack.
- Do not copy source code, classes, text, URLs, assets, dependencies, or
  breakpoint constants.

## Ren10 contract

- Preview root: `[data-rh2-root]` / `.rh2-hero`.
- Layout: `.rh2-layout.ren-switcher` with `.rh2-copy` and `.rh2-media`.
- Heading: one `h1.rh2-heading`; the compact page chrome has no competing
  heading, so the hero owns the standalone page outline.
- Form: one email `ren-field` + one primary `ren-btn` submit inside `ren-form`.
- Terms: one `.rh2-terms` paragraph with one `.ren-link` that resolves to the
  repository's MIT license document.
- Media: `ren-frame` photo ratio + tokenized placeholder (no CDN).
- Demo brand only in page shell: R-in-square + Ren10.
- Tokens only; Light DOM; vanilla HTML/CSS/JS.
- ≥44px targets; no root overflow at 320/390/767/768/1280; light/dark;
  reduced motion; JS-disabled form usable; axe WCAG 2.1 AA.

## Acceptance criteria

1. Anatomy counts: 1 heading, 1 description, 1 email field, 1 submit CTA,
   1 terms link, 1 media figure, 0 nav toggles, 0 second CTAs.
2. Landmarks: labelled hero section; no nested `nav` inside the block.
3. Responsive geometry at 320 / 390 / 767 / 768 / 1280 without horizontal overflow.
4. Form validates email; submit does not navigate away.
5. Light/dark, reduced motion, JS-disabled usability, axe AA.

## RED then GREEN

Add the isolated Header 2 spec first and run it while the HTML is absent.
Record genuine RED. Only then implement production. Do not edit navbar files,
shared navigation specs, inventory, or block index.

## Allowed files

- `templates/blocks/hero-split-email-form-media-right.html`
- `tests/components/header2-header.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/header2/**` (packet artifacts)

## Forbidden files and dependencies

- Existing navbar block HTML/CSS/JS and navbar* specs
- `docs/workflows/relume-to-ren10/inventory.json`
- `templates/blocks/index.html`
- Core Ren10 package sources beyond consumption
- Relume source and framework abstractions; Shadow DOM

## Required validation

```bash
npx playwright test tests/components/header2-header.spec.cjs --config tests/components/playwright.config.cjs
npm run lint
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/header2
git diff --check
```

Advance packet only through `green` (never `reviewed` / `accepted`).
