# Grok Implementation Packet — Navbar 14

## Objective

Implement `navbar14` as
`templates/blocks/nav-floating-logo-left-menu-right-actions.html` and add
focused coverage to `tests/components/blocks-navigation.spec.cjs`.

## Sanitized Relume facts

- One logo; four top entries (three plain links plus one dropdown); three
  title-only destinations; two actions **inside** the collapsible panel; one
  mobile toggle; one chevron.
- Dropdown: exactly three title-only destination links with no icons,
  descriptions, groups, images, cards, or promotional content.
- Desktop: compact floating shell with logo left and menu + two actions in one
  end-aligned row; narrow absolute dropdown below its parent.
- Tablet/mobile: top row is logo + toggle only; opening the shell reveals the
  single navigation tree with stacked full-width links and two stacked
  full-width actions; dropdown expands in flow.
- Source defects include fake trigger semantics, unnamed toggle, incomplete
  keyboard/Escape/focus behavior, nested `nav` risk on mobile, mismatched
  991px / `lg` boundaries, and missing reduced-motion handling.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- One `<ren-nav>` / `<nav class="ren-nav">` and one responsive list tree.
- Native `details/summary`; neutralize all classless details chrome and author
  exactly one `.rn14-chevron`.
- Exactly three `.rn14-destination` whole anchors. Do not invent icons,
  descriptions, group labels, or additional rails.
- Two action anchors use RenDS buttons (secondary + primary). They collapse
  with the mobile shell and never permanently occupy the mobile top row.
- One named nav toggle controls the tree.
- Desktop is logo-left / menu-right / actions-row — not centered menu geometry.
- No `ren-card`, `ren-menu`, `ren-popover`, `ren-collapsible`, nested nav, fake
  role button, or duplicate mobile tree.
- Use one 48rem boundary. Desktop uses a narrow absolute dropdown; mobile uses
  one in-flow tree and dropdown.
- Desktop hover preview, click pin/second-click close, native Enter/Space,
  Escape with focus return, outside close, destination close, mobile shell
  close, and breakpoint reset are required.
- JavaScript-disabled mobile exposes the tree, both actions, and native
  disclosure.
- Semantic/component tokens and layout primitives only; no palette tokens,
  hardcoded colors, raw duration/easing, numeric z-index, framework code, or
  Shadow DOM.
- Demo chrome must show the current package version 0.10.0.
- Preview root: `[data-rn14-root]` / `.rn14-preview` (match render matrix).

## Acceptance criteria

1. Exact counts: one brand, four top entries, three flat destinations, two
   actions, one toggle, one chevron; no rich-destination chrome.
2. One landmark/tree with valid native links and no nested interactive content
   or nested nav landmarks.
3. Mobile closed: only logo + toggle visible in the bar. Mobile open: links and
   two full-width stacked actions inside the panel.
4. Desktop: floating shell, end-aligned menu + actions row, narrow absolute
   dropdown.
5. Stable hover, click pin, keyboard, Escape, outside/destination close,
   mobile, breakpoint, and JS-disabled behavior.
6. Visible focus, 44px targets, reduced motion, light/dark, and axe WCAG 2.1 AA.

## RED then GREEN

Add one Navbar 14 test suite first and run it while the HTML is absent. Record
the expected missing-block failures. Only then implement production. Do not
duplicate an existing suite or weaken shared assertions.

## Allowed files

- `templates/blocks/nav-floating-logo-left-menu-right-actions.html`
- `tests/components/blocks-navigation.spec.cjs`

## Forbidden files and dependencies

- Planning docs outside this packet, core RenDS APIs, tokens, registries, and
  unrelated files.
- Relume source, classes, text, URLs, assets, and runtime dependencies.
- Framework abstractions (React, Vue, Svelte, JSX/TSX, Tailwind, shadcn).
- Shadow DOM (`attachShadow`).

## Required validation

```bash
npx playwright test tests/components/blocks-navigation.spec.cjs -g 'Navbar 14|navbar14'
npx playwright test tests/components/blocks-navigation.spec.cjs
npm run lint
npm run agent:check
git diff --check
```

Do not commit production before RED evidence. Report RED, GREEN, changed files,
intentional differences, captured states, and residual risks.
