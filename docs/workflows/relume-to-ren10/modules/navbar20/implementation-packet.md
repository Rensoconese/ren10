# Grok Implementation Packet — Navbar 20

## Objective

Implement `navbar20` as
`templates/blocks/nav-logo-left-center-links-overlay-panel.html` with isolated
coverage in `tests/components/navbar20-navigation.spec.cjs`.

## Complete reference brief

### Retrieval metadata

- Family: navbars
- Module ID: `navbar20`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar20`, `primitives: include`)
- Retrieved at: 2026-07-15
- Source variants returned: one complete React section
- Supporting files returned: three vendored primitives (utils, button, input)

### Retrieved facts

- Full-width top bar with logo start, desktop-centered four-entry primary row,
  and always-visible menu toggle at the end.
- Primary: three plain links + one dropdown with three title-only destinations
  and one chevron.
- Toggle opens a full-viewport-height scrollable overlay under the bar; while
  open, the desktop primary row hides.
- Overlay: ten large destination links, newsletter (heading, description, email,
  secondary submit, terms + privacy link), contact (heading, phone, email,
  address), five social links.
- No permanent bar CTAs outside the newsletter form.
- Source defects: unnamed toggle, incomplete keyboard/Escape/focus, nested nav
  risk, dual breakpoint split, missing reduced motion, unsafe terms HTML.

### Responsive / interaction (sanitized)

- Desktop: centered primary + absolute narrow dropdown; overlay two-column.
- Mobile: logo + toggle only; overlay stacks content; primary row absent.
- Dropdown: hover + activation on desktop; one chevron.
- Overlay: toggle activation only; hide primary while open.

### Public-output exclusions

No source text, URLs, images, classes, SVG paths, React, dependencies, raw
durations/easing, or breakpoint constants.

## RenDS translation map

- One `<ren-nav>` / `<nav class="ren-nav">` primary landmark.
- Native `details/summary` for the primary dropdown; neutralize classless chrome;
  exactly one `.rn20-chevron`.
- Exactly three `.rn20-destination` title-only anchors.
- Always-visible named toggle controls `#rn20-overlay` (not a second primary tree).
- Overlay region with ten `.rn20-menu-link` anchors, newsletter form
  (`ren-input` + secondary `ren-btn`), contact, five `.rn20-social` links.
- One 48rem boundary; desktop primary centered; mobile logo+toggle; no nested nav.
- Hover corridor + click pin for dropdown; Escape/outside/destination/breakpoint
  close; overlay Escape focuses toggle.
- JS-disabled: hide inert toggle; expose overlay destinations + form + contact.
- Tokens and layout primitives only; demo chrome version 0.10.0.
- Preview root: `[data-rn20-root]` / `.rn20-preview`.

## Acceptance criteria

1. Exact anatomy counts listed in `acceptance.json`.
2. One primary landmark; no nested `nav`; no duplicate primary tree.
3. Desktop geometry: logo start, primary centered, toggle end, full-width bar.
4. Overlay under bar, scrollable, no horizontal overflow; primary hidden when open.
5. Dropdown and overlay interaction contracts complete.
6. Progressive enhancement, 44px targets, focus, reduced motion, light/dark, axe AA.

## RED then GREEN

Add the isolated Navbar 20 suite first and run it while the HTML is absent.
Record missing-block failures. Only then implement production. Do not edit
shared `blocks-navigation.spec.cjs`, inventory, or block index.

## Allowed files

- `docs/workflows/relume-to-ren10/modules/navbar20/**`
- `templates/blocks/nav-logo-left-center-links-overlay-panel.html`
- `tests/components/navbar20-navigation.spec.cjs`

## Forbidden files and dependencies

- `inventory.json`, `templates/blocks/index.html`, shared navigation specs,
  helpers, package files, core Ren10, registries.
- Relume source and runtime dependencies; frameworks; Shadow DOM.

## Required validation

```bash
npx playwright test tests/components/navbar20-navigation.spec.cjs
npx playwright test tests/components/blocks-navigation.spec.cjs
npm run lint
npm run agent:check
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar20
git diff --check
```

Do not author Codex green-evidence or advance green→reviewed. Stop at stage
`green` after red evidence advancement once tests pass.
