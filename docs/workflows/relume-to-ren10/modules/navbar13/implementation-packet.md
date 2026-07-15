# Grok Implementation Packet — Navbar 13

## Objective

Implement `navbar13` as
`templates/blocks/nav-logo-left-menu-center-dropdown.html` and add focused
coverage to `tests/components/blocks-navigation.spec.cjs`.

## Sanitized Relume facts

- One logo; four top entries (three links plus one dropdown); one action; one
  mobile toggle; one chevron.
- Dropdown: exactly three title-only destination links with no icons,
  descriptions, groups, images, cards, or promotional content.
- Desktop: compact floating shell with menu centered between logo and action;
  narrow absolute dropdown below its parent.
- Tablet/mobile: action remains in the top row; the navigation opens below and
  the dropdown expands in flow.
- Source defects include fake trigger semantics, unnamed toggle, incomplete
  keyboard/Escape/focus behavior, and missing reduced-motion handling.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- One `<ren-nav>` / `<nav class="ren-nav">` and one responsive list tree.
- Native `details/summary`; neutralize all classless details chrome and author
  exactly one `.rn13-chevron`.
- Exactly three `.rn13-destination` whole anchors. Do not invent icons,
  descriptions, group labels, or additional rails.
- One action anchor uses a RenDS button; one named nav toggle controls the tree.
- Desktop menu must remain geometrically centered despite unequal side content.
- No `ren-card`, `ren-menu`, `ren-popover`, `ren-collapsible`, nested nav, fake
  role button, or duplicate mobile tree.
- Use one 48rem boundary. Desktop uses a narrow absolute dropdown; mobile uses
  one in-flow tree and dropdown.
- Desktop hover preview, click pin/second-click close, native Enter/Space,
  Escape with focus return, outside close, destination close, mobile shell
  close, and breakpoint reset are required.
- JavaScript-disabled mobile exposes the tree, action, and native disclosure.
- Semantic/component tokens and layout primitives only; no palette tokens,
  hardcoded colors, raw duration/easing, numeric z-index, framework code, or
  Shadow DOM.
- Demo chrome must show the current package version 0.10.0.

## RED then GREEN

Add one Navbar 13 test suite first and run it while the HTML is absent. Record
the expected missing-block failures. Only then implement production. Do not
duplicate an existing suite or weaken shared assertions.

## Required validation

```bash
npx playwright test tests/components/blocks-navigation.spec.cjs -g 'Navbar 13|navbar13'
npx playwright test tests/components/blocks-navigation.spec.cjs
npm run lint
npm run agent:check
git diff --check
```

Do not commit production before RED evidence. Report RED, GREEN, changed files,
intentional differences, captured states, and residual risks.
