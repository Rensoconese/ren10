# Grok Implementation Packet — Navbar 22

## Objective

Implement `navbar22` as
`templates/blocks/nav-sticky-logo-center-dropdown-fullscreen-contact.html`
and add focused coverage in
`tests/components/navbar22-navigation.spec.cjs`.

## Sanitized Relume facts

- Sticky full-width bar: one logo; four desktop-centered top entries (three
  plain links plus one dropdown); three title-only destinations; one always-
  visible menu toggle; one chevron.
- Toggle opens a full-viewport overlay with eight large destinations, a contact
  form (name, email, message, terms, submit), phone + email + address details,
  and five social links.
- Desktop shows logo / centered bar tree / toggle; mobile shows logo + toggle
  only; bar tree is not an under-bar mobile list.
- Source defects include unnamed toggle, incomplete keyboard/Escape/focus for
  the dropdown, nested nav risk, framework breakpoint split, and missing
  reduced-motion handling.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- One `<ren-nav>` / `<nav class="ren-nav ren-nav-sticky">` primary landmark.
- Native `details/summary` for the bar dropdown; exactly one `.rn22-chevron`.
- Exactly three `.rn22-destination` whole anchors; eight `.rn22-menu-link`
  large destinations in the overlay list (not a second `nav` landmark).
- Overlay is a dialog region controlled by the named toggle; always visible at
  every width.
- Contact form uses `ren-field` / `.ren-input` / `.ren-checkbox` / `.ren-btn`.
- One 48rem boundary. Desktop absolute dropdown; mobile/desktop overlay is
  full-viewport.
- Desktop hover preview, click pin, keyboard, Escape, outside close, destination
  close, overlay close, and breakpoint reset are required.
- JavaScript-disabled: expose large links + form + details; hide inert toggle.
- Semantic/component tokens and layout primitives only.
- Demo chrome must show package version 0.10.0.
- Preview root: `[data-rn22-root]` / `.rn22-preview`.

## Acceptance criteria

1. Exact counts: one brand, four bar entries, three flat destinations, one
   toggle, one chevron, eight large links, complete contact form, details,
   five socials.
2. One primary landmark; no nested nav landmarks; valid native links.
3. Mobile closed: only logo + toggle in the bar. Overlay open: large links +
   contact rail. Desktop: centered bar menu + always-visible toggle.
4. Stable hover, click pin, keyboard, Escape, outside/destination close,
   overlay, breakpoint, and JS-disabled behavior.
5. Visible focus, 44px targets, reduced motion, light/dark, axe WCAG 2.1 AA.

## RED then GREEN

Add the isolated Navbar 22 suite first and run it while the HTML is absent.
Record genuine RED failures. Only then implement production. Do not author
Codex green-evidence or advance green→reviewed.

## Allowed files

- `templates/blocks/nav-sticky-logo-center-dropdown-fullscreen-contact.html`
- `tests/components/navbar22-navigation.spec.cjs`
- Packet files under `docs/workflows/relume-to-ren10/modules/navbar22/**`

## Forbidden files and dependencies

- `docs/workflows/relume-to-ren10/inventory.json`
- `templates/blocks/index.html`
- `tests/components/blocks-navigation.spec.cjs`
- Shared helpers, package files, core Ren10 files, registries
- Relume source, classes, text, URLs, assets, runtime dependencies
- Framework abstractions; Shadow DOM

## Required validation

```bash
npx playwright test tests/components/navbar22-navigation.spec.cjs
npm run lint
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar22
git diff --check
```

Do not run the shared full navigation regression or `npm run agent:check` in
this parallel worker.
