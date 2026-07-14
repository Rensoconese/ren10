# Grok Implementation Packet — Navbar 9

## Objective

Implement `navbar9` as the standalone Ren10 block
`templates/blocks/nav-mega-menu-footer.html` and add focused regression coverage
to `tests/components/blocks-navigation.spec.cjs`. Do not change any other file.

## Complete sanitized reference

Authenticated Relume MCP retrieval confirmed `navbar9_component` immediately
after `navbar8_component`; slug `navbar9`; `completeSource=true`.

- One linked brand, four top-level entries (three links + one mega trigger),
  two global actions, and one mobile toggle.
- The mega contains exactly four groups and the default data contains exactly
  one destination per group (four total). Every destination has one decorative
  icon, a title, and a description.
- A distinct full-width footer band sits beneath the destination grid and owns
  one heading and one text link. There is no featured media/card and no side rail.
- Wide desktop is brand | navigation | actions. The mega is absolute below the
  bar, effectively viewport width, with four equal columns above the footer.
- At narrow widths the source uses a full-height scrollable shell and an in-flow
  nested mega. Destination descriptions hide at the smallest width.
- Source pointer behavior: desktop hover opens/leaves closes; activation toggles.
  Mobile suppresses hover through an explicit `max-width: 991px` query.
- Source motion hierarchy: mobile 0.4s; mega height/opacity 0.2s; chevron 0.3s;
  staged hamburger delays. Map these to Ren10 tokens, never raw timings.
- Source defects that must be corrected: fake non-keyboard mega trigger; unnamed
  hamburger without ARIA; no Escape/outside/link close; duplicate desktop/mobile
  trees; removed focus outline; no reduced-motion; raw z-index 999.
- Unavailable and therefore not to be invented: rendered source screenshot,
  computed styles/colors, exact Tailwind breakpoint pixels, RTL/i18n rules.
- Never copy Relume source, classes, text, URLs, assets, SVG paths, or dependencies.

The complete factual record is also stored in `reference-brief.md`; it is
authoritative if wording here is ambiguous.

## Complete RenDS translation

- Use `<ren-nav>` with exactly one `<nav class="ren-nav">` landmark.
- Author one responsive `ul.ren-nav-links`; never duplicate desktop/mobile trees.
- Use native `details/summary` for the mega. Reset classless details card chrome,
  marker, open divider, and `summary::after`; exactly one authored chevron remains.
- Use `ren-grid`/Ren10 layout primitives for the four groups before bespoke CSS.
- Use `.ren-icon` size variants; decorative SVGs have `aria-hidden="true"` and
  `focusable="false"`, a viewBox, and no inline width/height.
- Use real anchors for destinations, footer link, and actions. Header CTA anchors
  may use `.ren-btn`; preserve visible focus and minimum touch targets.
- Use semantic/component tokens only. No primitive palette tokens, hardcoded
  non-grayscale colors, literal z-index, raw durations/easing, or Tailwind.
- Keep the core Ren10 `48rem` shell breakpoint. Below it, the one tree and mega
  are in-flow and activation-only. From 48rem, the mega is absolute; use two
  columns at cramped tablet widths and four columns at wide desktop.
- Desktop hover is a preview over the combined trigger+panel hit region; moving
  into the panel must not close it. Click pins, second click closes. Escape closes
  and restores focus. Outside activation and destination/footer activation close.
  Mobile uses activation only; closing the shell also closes its mega.
- Without JavaScript/custom-element upgrade, hide the inert toggle, expose the
  one mobile tree, and preserve native disclosure usability.
- Bespoke CSS is restricted to block-local disclosure neutralization, absolute
  panel geometry, stable hover bridge, responsive reflow, and footer band paint.
- Do not use `ren-menu`, top-layer popover, featured media, side rail, fake
  controls, Shadow DOM, or changes to core RenDS APIs.

Full cascade and responsive rationale is also stored in `translation-map.md`.

## Acceptance criteria

1. Exact anatomy counts: one brand; four top entries; four mega groups; four
   destinations; one footer link; two actions; one mobile toggle; one chevron.
2. Native activation, stable desktop hover transfer, click pin, Escape, outside
   close, link close, and mobile nested disclosure are covered.
3. Top-level peers align; tablet reflow is readable; footer is a distinct band.
4. JS-disabled mobile exposes the one tree and usable native disclosure.
5. Exactly one nav landmark, synchronized named toggle, visible focus, 44px
   touch targets, decorative icon treatment, and reduced-motion behavior.

## Required RED then GREEN sequence

Before production edits, add the Navbar 9 regression tests to the focused spec
and run them against the missing block. Record the expected failing result.
Only after that RED result may you create the HTML block and drive the tests green.

## Allowed files

- `templates/blocks/nav-mega-menu-footer.html`
- `tests/components/blocks-navigation.spec.cjs`

## Required validation

```bash
npx playwright test tests/components/blocks-navigation.spec.cjs
npm run lint
git diff --check
```

Do not commit. Report the RED command/failure, GREEN results, exact files changed,
intentional Ren10 differences, render states prepared, and residual risks.
