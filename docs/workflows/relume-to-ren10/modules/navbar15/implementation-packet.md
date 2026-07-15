# Grok Implementation Packet — Navbar 15

## Objective

Implement `navbar15` as
`templates/blocks/nav-floating-bottom-logo-left-menu-actions.html` and add an
isolated suite at `tests/components/navbar15-navigation.spec.cjs`.

## Sanitized Relume facts

- One brand destination (logo treatment on small viewports; up-icon on large);
  four top entries (three plain links plus one dropdown); three title-only
  destinations; **one** permanent action in chrome (with the toggle); one
  mobile toggle; one chevron.
- Dropdown: exactly three title-only destination links with no icons,
  descriptions, groups, images, cards, or promotional content.
- Desktop: compact floating shell **docked near the bottom**; brand/up-control
  left; horizontal menu; one action; narrow absolute dropdown **above** its
  parent.
- Tablet/mobile: top-docked bar with brand + permanent action + toggle; opening
  the shell reveals the single navigation tree with stacked full-width links;
  dropdown expands in flow.
- Source defects include fake trigger semantics, unnamed toggle, incomplete
  keyboard/Escape/focus behavior, nested `nav` risk on mobile, mismatched
  991px / `lg` boundaries, and missing reduced-motion handling.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- One `<ren-nav>` / `<nav class="ren-nav">` and one responsive list tree.
- Native `details/summary`; neutralize all classless details chrome and author
  exactly one `.rn15-chevron`.
- Exactly three `.rn15-destination` whole anchors. Do not invent icons,
  descriptions, group labels, or additional rails.
- One action anchor uses a RenDS primary button. It remains permanent chrome
  (visible with brand + toggle when mobile is closed).
- One named nav toggle controls the tree.
- Desktop is bottom-docked floating shell with upward dropdown — not top-only
  floating or panel-owned dual actions.
- No `ren-card`, `ren-menu`, `ren-popover`, `ren-collapsible`, nested nav, fake
  role button, or duplicate mobile tree.
- Use one 48rem boundary. Desktop uses a narrow absolute upward dropdown;
  mobile uses one in-flow tree and dropdown.
- Desktop hover preview, click pin/second-click close, native Enter/Space,
  Escape with focus return, outside close, destination close, mobile shell
  close, and breakpoint reset are required.
- JavaScript-disabled mobile exposes the tree, the permanent action, and native
  disclosure.
- Semantic/component tokens and layout primitives only; no palette tokens,
  hardcoded colors, raw duration/easing, numeric z-index, framework code, or
  Shadow DOM.
- Demo chrome must show the current package version 0.10.0.
- Preview root: `[data-rn15-root]` / `.rn15-preview` (match render matrix).

## Acceptance criteria

1. Exact counts: one brand, four top entries, three flat destinations, one
   action, one toggle, one chevron; no rich-destination chrome.
2. One landmark/tree with valid native links and no nested interactive content
   or nested nav landmarks.
3. Mobile closed: brand + action + toggle visible in the bar. Mobile open: same
   top chrome plus links (and in-flow dropdown when opened).
4. Desktop: bottom-docked floating shell, horizontal menu + one action, narrow
   absolute dropdown above the bar.
5. Stable hover, click pin, keyboard, Escape, outside/destination close,
   mobile, breakpoint, and JS-disabled behavior.
6. Visible focus, 44px targets, reduced motion, light/dark, and axe WCAG 2.1 AA.

## RED then GREEN

Add the isolated Navbar 15 test suite first and run it while the HTML is
absent. Record the expected missing-block failures. Only then implement
production. Do not edit shared navigation suites or weaken shared assertions.

## Allowed files

- `templates/blocks/nav-floating-bottom-logo-left-menu-actions.html`
- `tests/components/navbar15-navigation.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/navbar15/**`

## Forbidden files and dependencies

- Inventory, shared block index, shared navigation suite, core RenDS APIs,
  tokens, registries, package files, helpers, and any new dependencies.
