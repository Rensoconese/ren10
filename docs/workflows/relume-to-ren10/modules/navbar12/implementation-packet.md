# Grok Implementation Packet — Navbar 12

## Objective

Implement `navbar12` as `templates/blocks/nav-logo-left-menu-right-grouped.html`
and add focused coverage to `tests/components/blocks-navigation.spec.cjs`.

## Sanitized Relume facts

- One logo; four top entries (three links + one dropdown); two actions; one
  toggle; one chevron.
- Dropdown: exactly two labeled groups with four rich links each: eight whole
  links, eight icons, eight titles, and eight descriptions.
- Desktop: horizontal shell and right-biased absolute two-column dropdown.
- Source tablet: collapsed shell plus two-column grouped content. Mobile: in-flow
  one-column dropdown and stacked actions; smallest widths hide descriptions.
- Source defects include fake trigger semantics, unnamed toggle, no keyboard,
  Escape, outside close, focus return, reduced motion, and mismatched breakpoint
  and viewport-height arithmetic.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  or framework behavior.

## Ren10 contract

- One `<ren-nav>` / `<nav class="ren-nav">` and one responsive list tree.
- Native `details/summary`; neutralize all classless details chrome and author
  exactly one `.rn12-chevron`.
- Exactly two `.rn12-group` regions, each with one `.rn12-group-label` and four
  `.rn12-destination.ren-row` anchors.
- Exactly eight `.rn12-destination-icon.ren-icon` elements. Each destination
  owns one icon plus a `ren-stack-xs` title/description stack.
- Two action anchors use RenDS buttons; one named nav toggle controls the tree.
- No `ren-card`, `ren-menu`, `ren-popover`, nested nav, fake role button, or
  duplicate mobile tree.
- Use one 48rem boundary. Desktop/tablet show two groups and descriptions;
  mobile uses one in-flow group column and hides descriptions.
- Desktop hover preview, click pin/second-click close, native Enter/Space,
  Escape with focus return, outside close, destination close, mobile shell
  close, and breakpoint reset are required.
- JavaScript-disabled mobile exposes the tree, actions, and native disclosure.
- Semantic/component tokens and layout primitives only; no palette tokens,
  hardcoded colors, raw duration/easing, numeric z-index, framework code, or
  Shadow DOM.
- Demo chrome must show the current package version 0.10.0.

## RED then GREEN

Add the Navbar 12 test suite first and run it while the HTML is absent. Record
the expected missing-block failures. Only then implement production.

## Required validation

```bash
npx playwright test tests/components/blocks-navigation.spec.cjs -g 'Navbar 12|navbar12'
npx playwright test tests/components/blocks-navigation.spec.cjs
npm run lint
npm run agent:check
git diff --check
```

Do not commit. Report RED, GREEN, changed files, intentional differences,
captured states, and residual risks.
