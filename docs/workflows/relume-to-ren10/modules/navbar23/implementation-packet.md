# Grok Implementation Packet — Navbar 23

## Objective

Implement `navbar23` as
`templates/blocks/nav-mega-menu-product-intro.html` with isolated coverage in
`tests/components/navbar23-navigation.spec.cjs`.

## Sanitized Relume facts

- One logo; four top entries (three plain links plus one mega parent); three
  product destinations; one intro title/description/CTA; two header actions;
  one mobile toggle; one chevron.
- Mega: intro region (title, description, CTA) beside three product cards
  (portrait media, name, variant, price, optional badge).
- Desktop: full-width bar, logo-left / links / end actions, full-band absolute
  mega under the bar with hover corridor.
- Mobile: top row logo + toggle only; open shell reveals one tree with stacked
  links and two full-width actions; mega expands in flow.
- Source defects include incomplete ARIA, missing Escape/focus/outside close,
  no reduced motion, and mismatched 991px / `lg` boundaries.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  durations, easing, or breakpoint constants.

## Ren10 contract

- One `<ren-nav>` / `<nav class="ren-nav">` and one responsive list tree.
- Native `details/summary`; neutralize classless details chrome; author exactly
  one `.rn23-chevron`.
- Exactly three `a.rn23-product` whole-card anchors with media/name/variant/price
  and non-interactive badge spans. Exactly one `.rn23-intro-cta` real link.
- Two action anchors use RenDS buttons (secondary + primary). They collapse with
  the mobile shell and never permanently occupy the closed mobile top row.
- One named nav toggle controls the tree.
- Use one 48rem boundary. Desktop full-band absolute mega; mobile in-flow.
- Desktop hover preview, click pin/second-click close, native Enter/Space,
  Escape with focus return (including from a focused destination), outside
  close, destination close for every destination class (products + intro CTA +
  header actions where applicable), mobile shell close, same-breakpoint resize
  stability, and breakpoint reset are required.
- JavaScript-disabled mobile exposes the tree, both actions, and native
  disclosure.
- Semantic/component tokens and layout primitives only.
- Demo chrome must show package version 0.10.0.
- Preview root: `[data-rn23-root]` / `.rn23-preview` (match render matrix).

## Acceptance criteria

1. Exact counts: one brand, four top entries, three products, one intro CTA,
   two actions, one toggle, one chevron; no social/footer inventions.
2. One landmark/tree with valid native links and no nested interactive content
   or nested nav landmarks.
3. Mobile closed: only logo + toggle in the bar. Mobile open: links and two
   full-width stacked actions inside the panel.
4. Desktop: full-width bar, end actions, full-band absolute mega with intro +
   three products.
5. Stable hover, click pin, keyboard, Escape, outside/destination close, mobile,
   320/340, 767/768/769 seams, same-breakpoint resize, and JS-disabled behavior.
6. Visible focus, 44px targets, reduced motion, light/dark, and axe WCAG 2.1 AA.

## RED then GREEN

Add the isolated Navbar 23 suite first and run it while the HTML is absent.
Record the expected missing-block failures. Only then implement production.

## Allowed files

- `docs/workflows/relume-to-ren10/modules/navbar23/**`
- `templates/blocks/nav-mega-menu-product-intro.html`
- `tests/components/navbar23-navigation.spec.cjs`

## Forbidden files and dependencies

- `inventory.json`, `templates/blocks/index.html`, shared
  `blocks-navigation.spec.cjs`, helpers, package files, core Ren10 files.
- Relume source, classes, text, URLs, assets, and runtime dependencies.
- Framework abstractions and Shadow DOM.

## Required validation

```bash
npx playwright test tests/components/navbar23-navigation.spec.cjs
npm run lint
node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar23
git diff --check
```

Do not run shared full navigation regression or `npm run agent:check` in this
worker. Do not author Codex green-evidence or advance green→reviewed.
