# Grok Implementation Packet — Navbar 32

## Objective

Implement `navbar32` as
`templates/blocks/nav-logo-cta-left-drawer.html` with isolated coverage in
`tests/components/navbar32-navigation.spec.cjs`.

## Sanitized Relume facts

- One logo; one permanent bar CTA; one always-visible menu toggle; five primary
  title-only destinations; contact heading + phone + email + address; five
  social destinations.
- Menu is a left edge drawer at every width (not a hover dropdown, not a
  ren-nav horizontal collapse). No chevrons, no dropdown parents, no duplicate
  mobile tree.
- Drawer body: large primary link column, then contact block, then social row.
- Bar CTA stays outside the drawer. An unused defaults contact button is not
  rendered in source — do not invent it.
- Source defects: unnamed toggle, weak progressive enhancement, icon-only
  socials, missing reduced-motion branch, generic section root.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- Preview root: `[data-rn32-root]` / `.rn32-preview`.
- Permanent bar: brand + CTA + named toggle (three spans, morph to one X).
- Left drawer: `<ren-sheet side="left" size="md" id="rn32-drawer">` with one
  `<nav class="rn32-nav" aria-label="Primary">` and `#rn32-primary-links`
  containing five `a.rn32-destination.rn32-link`.
- Contact: `.rn32-contact` with `.rn32-contact-title`, phone/email
  `a.rn32-destination.rn32-contact-link`, address text.
- Social: five `a.rn32-destination.rn32-social-link` without nested `nav`.
- Bar CTA: `a.ren-btn.rn32-destination.rn32-cta`.
- Public sheet API only (`.show()`, `.close()`, `.open`, events, ARIA). Never
  private fields such as `_isOpen`.
- Destination close for primary, social, contact, and bar CTA; Escape restores
  focus from a focused destination; outside close; same-breakpoint resize
  stability; JS-disabled tree visible; reduced motion; light/dark tokens;
  ≥44px targets; no root overflow.
- Demo chrome shows package version 0.10.0.

## Acceptance criteria

1. Exact counts: 1 brand, 1 CTA, 1 toggle, 5 primary links, contact block, 5
   socials, 0 chevrons/dropdowns.
2. One primary landmark/tree; no nested nav.
3. Toggle always available with JS; left sheet open/close at desktop/tablet/
   mobile including 320, 340, 767, 768, 769.
4. Escape focus restoration; destination close for every destination class.
5. JS-disabled exposes tree + contact + socials + CTA; toggle hidden/inert.
6. Visible focus, 44px targets, reduced motion, light/dark, axe WCAG 2.1 AA.

## RED then GREEN

Add the isolated Navbar 32 spec first and run it while the HTML is absent.
Record genuine RED. Only then implement production. Do not edit shared
navigation specs, inventory, or block index.

## Allowed files

- `templates/blocks/nav-logo-cta-left-drawer.html`
- `tests/components/navbar32-navigation.spec.cjs`
- `docs/workflows/relume-to-ren10/modules/navbar32/**` (packet artifacts)

## Forbidden files and dependencies

- `docs/workflows/relume-to-ren10/inventory.json`
- `templates/blocks/index.html`
- `tests/components/blocks-navigation.spec.cjs`
- Shared helpers, package files, core Ren10 files, registries
- Relume source and framework abstractions; Shadow DOM

## Required validation

```bash
npx playwright test tests/components/navbar32-navigation.spec.cjs --config tests/components/playwright.config.cjs
npm run lint
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar32
git diff --check
```

Do not run the shared full navigation regression or `npm run agent:check` in
this parallel worker. Do not author Codex green-evidence or advance
green→reviewed.
