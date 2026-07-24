# Grok Implementation Packet — Navbar 26

## Objective

Implement `navbar26` as
`templates/blocks/nav-mega-menu-category-promo-panel.html` with isolated
coverage in `tests/components/navbar26-navigation.spec.cjs`.

## Sanitized Relume facts

- One logo; four top entries (three plain links plus one mega parent); three
  category groups × five title-only destinations = fifteen destinations; one
  media-backed promo panel with heading, description, and one CTA; two bar
  actions; one mobile toggle; one chevron.
- Desktop: full-width bordered bar; logo + links start cluster; two end actions;
  full-width absolute mega under the bar with three category columns + promo
  rail.
- Mobile: top row is logo + toggle only; opening the shell reveals the single
  navigation tree with stacked full-width links and two stacked full-width
  actions; mega expands in flow.
- Source defects include incomplete disclosure ARIA, unnamed toggle, missing
  Escape/focus return, missing reduced motion, duplicated action markup, and a
  991px / `lg` boundary split.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- One `<ren-nav>` / `<nav class="ren-nav">` and one responsive list tree
  (`#n26-primary-links`).
- Native `details/summary` (`.n26-disclosure`); neutralize all classless details
  chrome and author exactly one `.n26-chevron`.
- Exactly fifteen `.n26-dest` whole anchors in three labeled groups. Do not
  invent icons or descriptions on those destinations.
- Promo is `.n26-promo` with media treatment and one `.n26-promo-cta` action
  (not a button nested inside an image anchor).
- Two action anchors use RenDS buttons (secondary + primary). They collapse with
  the mobile shell and never permanently occupy the mobile top row.
- One named nav toggle controls the tree.
- Use one 48rem boundary. Desktop uses a full-width absolute mega; mobile uses
  one in-flow tree and mega.
- Desktop hover preview, click pin/second-click close, native Enter/Space,
  Escape with focus return (including from a focused destination), outside
  close, destination close for every destination class, mobile shell close,
  same-breakpoint resize stability, and breakpoint reset are required.
- JavaScript-disabled mobile exposes the tree, both actions, and native
  disclosure.
- Semantic/component tokens and layout primitives only.
- Demo chrome must show the current package version 0.10.0.
- Preview root: `[data-n26-root]` / `.n26-preview` (match render matrix).

## Acceptance criteria

1. Exact counts: one brand, four top entries, three groups × five destinations,
   one promo CTA, two actions, one toggle, one chevron.
2. One landmark/tree with valid native links and no nested nav landmarks.
3. Mobile closed: only logo + toggle in the bar. Mobile open: links and two
   full-width stacked actions inside the panel.
4. Desktop: full-width bar; full-width absolute mega with category columns +
   promo rail.
5. Stable hover corridor, click pin, keyboard, Escape focus restore, outside/
   destination close, mobile, breakpoint, narrow 320/340 geometry, 767/768/769
   seams, and JS-disabled behavior.
6. Visible focus, 44px targets, reduced motion, light/dark, and axe WCAG 2.1 AA.

## RED then GREEN

Add the isolated Navbar 26 suite first and run it while the HTML is absent.
Record expected missing-block failures. Only then implement production. Do not
author Codex green-evidence or advance green→reviewed.

## Allowed files

- `docs/workflows/relume-to-ren10/modules/navbar26/**`
- `templates/blocks/nav-mega-menu-category-promo-panel.html`
- `tests/components/navbar26-navigation.spec.cjs`

## Forbidden files and dependencies

- `inventory.json`, `templates/blocks/index.html`, shared
  `blocks-navigation.spec.cjs`, helpers, package files, core Ren10 files.
- Relume source, classes, text, URLs, assets, and runtime dependencies.
- Framework abstractions (React, Vue, Svelte, JSX/TSX, Tailwind, shadcn).
- Shadow DOM (`attachShadow`).

## Required validation

```bash
npx playwright test tests/components/navbar26-navigation.spec.cjs --max-failures=1
npx playwright test tests/components/navbar26-navigation.spec.cjs
npm run workflow:relume -- validate docs/workflows/relume-to-ren10/modules/navbar26
npm run lint
git diff --check
```

Do not run shared full navigation regression or `npm run agent:check` in this
parallel worker.
