# Grok Implementation Packet — Navbar 29

## Objective

Implement `navbar29` as
`templates/blocks/nav-mega-menu-overlay-collections.html` with focused coverage
in the isolated suite
`tests/components/navbar29-navigation.spec.cjs`.

## Sanitized Relume facts

- Full-width bar (not floating card): logo left, four top entries, two desktop
  end actions, one mobile toggle, one chevron.
- Three plain links + one mega parent.
- Mega: one category heading with five title-only links + four overlay
  collection cards (image, title, description, CTA label).
- Desktop mega is full-width absolute under the bar; mobile mega is in-flow
  inside one shared tree; actions stack full-width under open mobile tree.
- Source defects include unnamed toggle, nested interactive CTAs on collections,
  incomplete Escape/focus/outside contracts, dual breakpoint gates, and missing
  reduced motion.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- One `<ren-nav>` / `<nav class="ren-nav">` and one responsive list tree.
- Native `details/summary`; neutralize classless details chrome; author exactly
  one `.rmoc-chevron`.
- Exactly five `.rmoc-mega-link` category anchors and four whole-card
  `a.rmoc-card` collection anchors without nested interactive descendants.
- Two action anchors use RenDS buttons (secondary + primary). Single ownership;
  desktop end-aligned; mobile under open shell.
- One named nav toggle controls the tree.
- Desktop full-width absolute mega; mobile in-flow mega.
- Desktop hover preview, click pin/second-click close, native Enter/Space,
  Escape with focus return (including when focus was on a destination), outside
  close, destination close for every mega destination class, mobile shell close,
  same-breakpoint resize stability, and breakpoint reset are required.
- JavaScript-disabled mobile exposes the tree, both actions, and native
  disclosure.
- Semantic/component tokens and layout primitives only.
- Demo chrome must show package version 0.10.0.
- Preview root: `[data-rmoc-root]` (match render matrix).

## Acceptance criteria

1. Exact counts: one brand, four top entries (3 plain + 1 mega), five category
   links, four overlay collection cards, two actions, one toggle, one chevron.
2. One landmark/tree; no nested nav; whole-card anchors without nested controls.
3. Desktop: full-width bar, end actions, full-width absolute mega with narrow
   category column + four-up overlay grid at wide widths.
4. Mobile: logo+toggle top row; open shell shows shared tree, stacked actions,
   in-flow mega, one-column cards.
5. Interactions, 320/340 narrow widths, 767/768/769 seams, reduced motion,
   light/dark tokens, 44px targets, no html overflow, axe WCAG 2.1 AA.

## RED then GREEN

Add the isolated Navbar 29 suite first and run it while the HTML is absent.
Record the expected missing-block failure. Only then implement production. Do
not edit shared navigation suites, inventory, or block index.

## Allowed files

- `docs/workflows/relume-to-ren10/modules/navbar29/**`
- `templates/blocks/nav-mega-menu-overlay-collections.html`
- `tests/components/navbar29-navigation.spec.cjs`

## Forbidden files and dependencies

- `docs/workflows/relume-to-ren10/inventory.json`
- `templates/blocks/index.html`
- `tests/components/blocks-navigation.spec.cjs`
- Shared helpers, package files, core Ren10 files, registries, other paths
- Relume source and framework abstractions
- Shadow DOM (`attachShadow`)
- New dependencies

## Required validation

```bash
npx playwright test tests/components/navbar29-navigation.spec.cjs --max-failures=1
npx playwright test tests/components/navbar29-navigation.spec.cjs
npm run lint
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar29
git diff --check
```

Do not run the shared full navigation regression or `npm run agent:check` in this
parallel worker. Do not author green-evidence or advance green→reviewed.
