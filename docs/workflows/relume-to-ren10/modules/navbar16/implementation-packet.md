# Grok Implementation Packet — Navbar 16

## Objective

Implement `navbar16` as
`templates/blocks/nav-logo-left-action-overlay-menu.html` with isolated
coverage in `tests/components/navbar16-navigation.spec.cjs`.

## Sanitized Relume facts

- Full-width bar: logo left; permanent primary action + menu toggle right.
- Six primary title-only destinations live only inside a full-viewport overlay
  under the bar (no permanent horizontal link row at any width).
- Overlay footer: one contact text destination + five named social icon
  destinations.
- Zero dropdowns, zero chevrons, zero mega chrome.
- One navigation tree for the six primary links.
- Source defects: unnamed toggle, incomplete Escape/outside/focus, conditional
  mount, missing reduced-motion — Ren10 must correct these without inventing
  extra UI.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- One `<ren-nav>` / `<nav class="ren-nav">` landmark and one primary list tree.
- Permanent top-bar action: one primary `.ren-btn` in `.ren-nav-actions`.
- Overlay panel `.rn16-panel` owns `#rn16-primary-links` (six large links) and
  the footer (`.rn16-contact` + five `.rn16-social-link`).
- Named `.ren-nav-toggle` with `aria-expanded` / `aria-controls` pointing at the
  panel; three-span hamburger only (no second close control, no chevron).
- Toggle always visible; panel hidden unless open — at every viewport.
- Escape, outside click, and destination activation close the shell (host
  `ren-nav` + progressive enhancement).
- JS-disabled: hide inert toggle; expose tree, permanent action, contact, and
  socials.
- Semantic/component tokens and layout primitives only; demo chrome version
  `0.10.0`.
- Preview root: `[data-rn16-root]` / `.rn16-preview` (match render matrix).

## Acceptance criteria

1. Exact counts: one brand, six primary links, one permanent action, one
   contact, five socials, one toggle, zero chevrons / zero dropdowns.
2. One landmark/tree; no nested nav; socials are named anchors, not a second
   primary landmark.
3. Closed chrome: brand + permanent action + toggle only.
4. Open: full-width overlay under bar with large centered stack + footer band.
5. Desktop/tablet/mobile all use toggle-driven overlay (no permanent link row).
6. Visible focus, 44px targets, reduced motion, light/dark, axe WCAG 2.1 AA.

## RED then GREEN

Add the isolated Navbar 16 suite first and run it while the HTML is absent.
Record the expected missing-block failures. Only then implement production.
Do not edit shared navigation specs, inventory, or block index.

## Allowed files

- `docs/workflows/relume-to-ren10/modules/navbar16/**`
- `templates/blocks/nav-logo-left-action-overlay-menu.html`
- `tests/components/navbar16-navigation.spec.cjs`

## Forbidden files and dependencies

- `inventory.json`, `templates/blocks/index.html`,
  `tests/components/blocks-navigation.spec.cjs`, shared helpers, package
  files, core Ren10 sources, registries.
- Relume source, classes, text, URLs, assets, and runtime dependencies.
- Framework abstractions and Shadow DOM.

## Required validation

```bash
npx playwright test tests/components/navbar16-navigation.spec.cjs
npx playwright test tests/components/blocks-navigation.spec.cjs
npm run lint
npm run agent:check
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar16
git diff --check
```

Do not commit production before RED evidence. Do not author Codex green-evidence
or advance green→reviewed. Report RED, GREEN, changed files, intentional
differences, captured states, and residual risks.
