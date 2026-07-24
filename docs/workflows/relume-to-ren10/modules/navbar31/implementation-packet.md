# Grok Implementation Packet — Navbar 31

## Objective

Implement `navbar31` as
`templates/blocks/nav-logo-cta-right-sheet-contact.html` and add isolated
coverage in `tests/components/navbar31-navigation.spec.cjs`.

## Sanitized Relume facts

- One logo; one permanent top-bar primary action; one menu toggle; five large
  title-only primary destinations only inside a right-edge sheet; contact
  cluster (title, phone, email, address); five social destinations.
- Zero dropdowns / chevrons / mega regions.
- Desktop/tablet/mobile share the same toggle-driven right sheet (no permanent
  horizontal link row).
- Source defects: incomplete toggle a11y, duplicate morphing close chrome,
  icon-only social risk, non-semantic contact lines, incomplete reduced-motion
  / progressive enhancement.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- Permanent bar: brand + one primary `.ren-btn` + named `.ren-nav-toggle`.
- Panel: one `<ren-sheet side="right">` with single close control, one primary
  `nav` landmark / five-link tree, contact cluster with real `tel:`/`mailto:`,
  five named social anchors.
- Public open state only (`aria-expanded`, sheet `open` / events, `data-sheet-close`).
- Escape restores focus to the toggle; outside/backdrop closes; destination
  classes close (primary, contact phone/email, socials, bar CTA while open).
- JS-disabled exposes the five links, action, contact, and socials without the
  inert toggle; no static `aria-hidden="true"` on PE content.
- Semantic/component tokens and layout primitives only.
- Demo chrome shows package version 0.10.0.
- Preview root: `[data-rn31-root]` / `.rn31-preview` (match render matrix).

## Acceptance criteria

1. Exact counts: one brand, five primary links, one permanent action, one
   toggle, one sheet close, contact title/phone/email/address, five socials;
   zero chevrons.
2. One primary landmark/tree; no nested nav; no permanent desktop link row.
3. Closed bar shows brand + action + toggle; open sheet shows the five links
   and contact/social stack as a right-edge panel.
4. Keyboard Escape with focus return, outside close, destination close, same-
   breakpoint resize stability, 767/768/769 seam stability.
5. 320px and 340px keep fully visible 44px targets and no html/root overflow.
6. Light/dark tokens, reduced motion, axe WCAG 2.1 AA.

## RED then GREEN

Add the isolated Navbar 31 suite first and run it while the HTML is absent.
Record expected missing-block failures. Only then implement production.

## Allowed files

- `docs/workflows/relume-to-ren10/modules/navbar31/**`
- `templates/blocks/nav-logo-cta-right-sheet-contact.html`
- `tests/components/navbar31-navigation.spec.cjs`

## Forbidden files and dependencies

- `inventory.json`, `templates/blocks/index.html`, shared navigation specs,
  helpers, package files, core Ren10 files, registries.
- Relume source, frameworks, Shadow DOM, new dependencies.

## Required validation

```bash
npx playwright test tests/components/navbar31-navigation.spec.cjs
npm run lint
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar31
git diff --check
```

Do not run shared full navigation regression or `npm run agent:check` in this
parallel worker. Do not author Codex green-evidence or advance green→reviewed.
