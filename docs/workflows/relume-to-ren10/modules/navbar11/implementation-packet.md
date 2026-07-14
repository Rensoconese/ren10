# Grok Implementation Packet — Navbar 11

## Objective

Implement `navbar11` as `templates/blocks/nav-logo-left-menu-right-dropdown.html`
and add focused coverage to `tests/components/blocks-navigation.spec.cjs`.

## Complete sanitized reference

Relume MCP confirmed `navbar11_component` immediately after navbar10 with
complete section source and four vendored primitives.

- One logo, four top-level entries (three links + one dropdown trigger), two
  actions, one hamburger, and one chevron.
- Dropdown: exactly four one-column destinations. Each has one icon, title,
  description, and URL. No images, cards, footer rail, or mega-menu columns.
- Desktop: horizontal logo-left/menu-right shell; compact absolute panel around
  20rem below the trigger.
- Mobile/tablet: collapsed shell with in-flow dropdown and stacked full-width
  actions. Descriptions are hidden at small mobile widths and visible from an
  intermediate source breakpoint.
- Desktop hover opens/leaves closes; activation toggles everywhere.
- Source defects: unnamed toggle, fake role-button trigger, no keyboard/Escape/
  outside/focus return, nested nav risk, weak focus, no reduced motion, and
  mismatched interaction/layout breakpoints.
- Do not copy source code, classes, text, URLs, assets, SVG paths, dependencies,
  or framework behavior.

## Complete RenDS translation

- One `<ren-nav>` / `<nav class="ren-nav">` and one responsive list tree.
- Native `details/summary`; reset classless details chrome, marker, divider, and
  pseudo-chevron. Exactly one authored chevron.
- Exactly four `.rn11-dropdown-link` anchors. Each composes `ren-row`, one
  `.rn11-destination-icon.ren-icon`, and a `ren-stack-xs` title/description.
- Two action anchors use RenDS buttons; one correctly named nav toggle controls
  the one tree.
- Do not use `ren-card`, `ren-menu`, `ren-popover`, nested nav landmarks, or a
  second mobile tree.
- Use Ren10's 48rem boundary for both layout and interaction policy. Desktop
  panel is compact/absolute; mobile is full-width/in-flow/activation-only.
- Desktop hover previews across trigger/panel. Click pins; second click closes.
  Enter/Space remain native. Escape focuses summary. Outside click, destination
  activation, mobile shell close, and breakpoint changes close the dropdown.
- JS-disabled mobile exposes the one tree, two actions, and native disclosure.
- Semantic/component tokens and layout primitives only; no palette tokens,
  hardcoded color, raw duration/easing, numeric z-index, framework code, or
  Shadow DOM.

## Acceptance criteria

1. Exact counts: one brand, four top entries, four rich anchors, four icons,
   two actions, one toggle, one chevron.
2. One landmark/tree with valid native links and no nested interactive content.
3. Stable hover, click pin, keyboard, Escape, outside/destination close, mobile,
   breakpoint, and JS-disabled behavior.
4. Compact desktop panel, aligned peer trigger, coherent icon/text rows, tablet
   descriptions, small-mobile condensed rows, and no overflow.
5. Visible focus, 44px targets, reduced motion, light/dark, and axe WCAG 2.1 AA.

## RED then GREEN

Add Navbar 11 tests first and run them against the missing block to record the
expected failures. Only then implement production and drive focused/full tests green.

## Allowed files

- `templates/blocks/nav-logo-left-menu-right-dropdown.html`
- `tests/components/blocks-navigation.spec.cjs`

## Required validation

```bash
npx playwright test tests/components/blocks-navigation.spec.cjs
npm run lint
git diff --check
```

Do not commit. Report RED, GREEN, exact files, intentional differences, render
states, and residual risks.
