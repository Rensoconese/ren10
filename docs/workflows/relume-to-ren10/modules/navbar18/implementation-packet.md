# Grok Implementation Packet — Navbar 18

## Objective

Implement `navbar18` as
`templates/blocks/nav-logo-cta-overlay-grid.html` and add focused coverage in
`tests/components/navbar18-navigation.spec.cjs` only.

## Sanitized Relume facts

- Full-width bar: one logo, one permanent primary CTA, one menu toggle.
- Destinations open only in a full-width below-bar overlay (always-overlay model).
- Exactly eight large title-only destination links in a responsive one→two column
  grid; no icons, descriptions, groups, cards, or nested menus.
- Overlay footer: one contact-style action + five social destinations.
- Zero dropdowns and zero chevrons.
- One navigation data tree at all widths.
- Source defects: generic section root, unnamed toggle without expanded/controls,
  conditional unmount, missing Escape/outside/reduced-motion contracts.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- One `<ren-nav>` / `<nav class="ren-nav">` and one responsive list tree.
- Force toggle visibility and collapsible tree at **all** widths (override
  default ren-nav desktop horizontal-links behavior).
- Permanent bar CTA in `.ren-nav-actions` (visible closed and open).
- Eight `.rn18-link` destinations; one `.rn18-contact`; five `.rn18-social-link`.
- Exactly zero chevrons / disclosure markers.
- Named toggle with expanded/controls; Escape, outside, and destination close.
- JavaScript-disabled path hides inert toggle and exposes tree + footer links.
- Semantic/component tokens and layout primitives only; no palette tokens,
  hardcoded colors, raw duration/easing, numeric z-index, framework code, or
  Shadow DOM.
- Demo chrome shows package version 0.10.0.
- Preview root: `[data-rn18-root]` / `.rn18-preview` (match render matrix).

## Acceptance criteria

1. Exact counts: 1 brand, 1 bar CTA, 1 toggle, 8 destinations, 1 contact, 5
   socials, 0 chevrons; one landmark/tree.
2. Closed: destinations not visible as open chrome; bar shows logo + CTA + toggle.
3. Open: full-width overlay below bar with grid links + footer row.
4. Desktop, tablet, and mobile share the always-overlay model.
5. Toggle, Escape, outside, destination close; no hover-open menu.
6. Visible focus, 44px targets, reduced motion, light/dark, axe WCAG 2.1 AA.

## RED then GREEN

Add the isolated Navbar 18 suite first and run it while the HTML is absent.
Record the expected missing-block failures. Only then implement production.
Do not edit shared navigation suites, inventory, or block index.

## Allowed files

- `templates/blocks/nav-logo-cta-overlay-grid.html`
- `tests/components/navbar18-navigation.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/navbar18/**`

## Forbidden files and dependencies

- `docs/workflows/relume-to-ren10/inventory.json`
- `templates/blocks/index.html`
- `tests/components/blocks-navigation.spec.cjs`
- Shared helpers, package files, core Ren10 files, registries, other paths.
- Relume source, classes, text, URLs, assets, and runtime dependencies.
- Framework abstractions (React, Vue, Svelte, JSX/TSX, Tailwind, shadcn).
- Shadow DOM (`attachShadow`).

## Required validation

```bash
npx playwright test tests/components/navbar18-navigation.spec.cjs
npx playwright test tests/components/blocks-navigation.spec.cjs
npm run lint
npm run agent:check
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar18
git diff --check
```

Advance only through red→green with red evidence. Do not author Codex green
visual-review evidence and do not advance green→reviewed.

## Embedded reference brief

See `reference-brief.md` in this packet (complete sanitized extraction).

## Embedded translation map

See `translation-map.md` in this packet (complete Ren10 mapping).
