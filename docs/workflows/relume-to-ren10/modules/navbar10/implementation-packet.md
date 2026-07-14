# Grok Implementation Packet — Navbar 10

## Objective

Implement `navbar10` as `templates/blocks/nav-mega-menu-card-grid.html` and add
focused coverage to `tests/components/blocks-navigation.spec.cjs`. Change no other files.

## Complete sanitized reference

Relume MCP authenticated retrieval confirmed `navbar10_component`, slug
`navbar10`, immediately after Navbar 9 with `completeSource=true`.

- One brand, four top entries (three links + one mega trigger), two header actions,
  one hamburger, and one chevron.
- Mega left: one titled group with exactly five simple links.
- Mega right: exactly six linked editorial cards. Every source card has one image,
  title, description, and nested button label.
- Desktop: narrow left column capped around 15rem; much wider right two-column card
  grid. At wide desktop each card uses horizontal media/copy tracks (about 0.5fr/1fr).
- Media is approximately 3:2 with cover crop.
- Mobile: full-height scrollable shell; nested mega in flow; cards one column by
  default and two columns from a source intermediate breakpoint.
- Desktop hover opens/leaves closes; activation toggles everywhere; source uses
  `max-width:991px` to suppress hover.
- Motion hierarchy: mobile 0.4s, mega 0.2s, chevron 0.3s, staged hamburger.
- Source defects to fix: unnamed toggle; fake keyboard-inaccessible mega trigger;
  anchor containing interactive button; no Escape/outside/focus return; duplicate
  trees; removed focus outline; no reduced motion; numeric z-index.
- Do not copy source code, classes, text, URLs, assets, image URLs, SVG paths, or dependencies.

## Complete RenDS translation

- One `<ren-nav>` / `<nav class="ren-nav">` and one responsive links tree.
- Native `details/summary`; reset classless card chrome, markers, divider, and
  pseudo-chevron. Exactly one authored chevron.
- Use `ren-with-sidebar` for five-link column + card region and `ren-grid-2` for
  six cards. Use `ren-frame` with 3:2 media.
- Each card is exactly one `<a class="ren-card ren-card-interactive">`; CTA text is
  a non-interactive span. Never nest button/link descendants inside the card anchor.
- Use semantic/component tokens and layout primitives. No raw color, primitive
  palette token, raw duration/easing, numeric z-index, or Tailwind.
- Keep Ren10's 48rem shell. Mobile is activation-only and in-flow; tablet keeps
  cards readable; wide ≥64rem restores narrow-left/wide-right and horizontal cards.
- Desktop pointer hover previews across the combined trigger/panel region. Click
  pins; second click closes. Enter/Space native; Escape focuses summary; outside
  click and any mega link/card activation close. Closing mobile shell closes mega.
- JS-disabled mobile exposes the one tree and usable native disclosure.
- No `ren-menu`, popover, duplicate trees, nested landmarks, Shadow DOM, or framework.

## Acceptance criteria

1. Exact counts: one brand, four entries, five simple mega links, six cards, two
   actions, one toggle, one chevron.
2. Six cards are single anchors without nested interactive descendants.
3. Stable hover, click pin, keyboard, Escape, outside/link/card close, and mobile work.
4. Left region stays narrower; media is 3:2; tablet/mobile reflow without overflow.
5. One landmark/tree, visible focus, 44px touch targets, reduced motion, light/dark,
   and JS-disabled fallback pass.

## RED then GREEN

Add Navbar 10 tests first and run them against the missing block to record expected
404/anatomy failures. Only then implement production and drive focused/full tests green.

## Allowed files

- `templates/blocks/nav-mega-menu-card-grid.html`
- `tests/components/blocks-navigation.spec.cjs`

## Required validation

```bash
npx playwright test tests/components/blocks-navigation.spec.cjs
npm run lint
git diff --check
```

Do not commit. Report RED, GREEN, exact files, intentional differences, render
states, and residual risks.
