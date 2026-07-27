# Grok Implementation Packet — Navbar 17

## Objective

Implement `navbar17` as
`templates/blocks/nav-logo-left-fullscreen-menu-social.html` with isolated
coverage in `tests/components/navbar17-navigation.spec.cjs`.

## Sanitized Relume facts

- Full-width bar: one logo; one primary top-bar action; one menu toggle at all
  widths.
- Overlay under the bar: eight large end-aligned plain destination links plus
  one footer contact action and five social icon links.
- No dropdown parents, chevrons, mega rails, or floating card shell.
- One navigation tree at all widths; activation-only open/close.
- Source defects include unnamed toggle, missing expanded/controls wiring,
  incomplete keyboard/Escape/focus/outside handling, conditional unmount risk,
  missing reduced motion, and weak landmark structure.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- One `<ren-nav>` / `<nav class="ren-nav">` and one responsive list tree.
- Exactly eight `.ren-nav-link` destinations in `#rn17-primary-links`.
- One primary top-bar action in `.ren-nav-actions`.
- Overlay shell `.rn17-menu` owns links + `.rn17-menu-footer` (contact + five
  social anchors). No nested `nav` landmark for socials.
- One named `.ren-nav-toggle` always visible when JS is available; three
  strokes only; no chevron and no second close control.
- Full-viewport overlay under the bar when open; closed state shows bar only.
- Escape, outside click, destination/footer activation close; focus returns to
  the toggle on Escape.
- JavaScript-disabled path exposes the tree, footer, and primary action; hides
  the inert toggle.
- Semantic/component tokens and layout primitives only; no palette tokens,
  hardcoded colors, raw duration/easing, numeric z-index, framework code, or
  Shadow DOM.
- Demo chrome must show the current package version 0.10.0.
- Preview root: `[data-rn17-root]` / `.rn17-preview` (match render matrix).

## Acceptance criteria

1. Exact counts: one brand, eight primary links, one top-bar primary action,
   one footer contact, five social links, one toggle, zero chevrons.
2. One landmark/tree with valid native links; no nested interactive content or
   nested nav landmarks inside the preview root.
3. Closed: bar shows logo + primary action + toggle. Open: full-viewport
   overlay with eight rows and footer.
4. Toggle visible and functional at desktop, tablet, and mobile.
5. Escape/outside/destination close, focus return, reduced motion, light/dark,
   44px targets, and axe WCAG 2.1 AA.
6. JS-disabled usability of the single tree + actions.

## RED then GREEN

Add the isolated Navbar 17 suite first and run it while the HTML is absent.
Record the expected missing-block failures. Only then implement production.
Do not edit the shared navigation suite, inventory, or block index.

## Allowed files

- `docs/workflows/relume-to-ren10/modules/navbar17/**`
- `templates/blocks/nav-logo-left-fullscreen-menu-social.html`
- `tests/components/navbar17-navigation.spec.cjs`

## Forbidden files and dependencies

- `docs/workflows/relume-to-ren10/inventory.json`
- `templates/blocks/index.html`
- `tests/components/blocks-navigation.spec.cjs`
- Shared helpers, package files, core Ren10 files, registries
- Relume source, classes, text, URLs, assets, and runtime dependencies
- Framework abstractions and Shadow DOM

## Required validation

```bash
npx playwright test tests/components/navbar17-navigation.spec.cjs --config=tests/components/playwright.config.cjs
npx playwright test tests/components/blocks-navigation.spec.cjs --config=tests/components/playwright.config.cjs
npm run lint
npm run agent:check
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar17
git diff --check
```

Do not author Codex green-evidence or advance green→reviewed. Report RED,
GREEN, changed files, intentional differences, captured states, and residual
risks.
