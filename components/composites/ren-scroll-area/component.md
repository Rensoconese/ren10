# ren-scroll-area Component Contract

Scrollable region styling that preserves native scrolling.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-scroll-area` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-scroll-area` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Scroll Area composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "A bounded region needs themed native scrollbars (Firefox scrollbar-color + WebKit ::-webkit-scrollbar)."
    - "You want consistent scrollbar styling across light/dark themes without injecting JS or shadow DOM."
    - "Need preset max-height utilities (.ren-scroll-area-sm/-md/-lg/-xl/-full) and direction variants (.-x, .-y)."
    - "Need fade-edge masks (.-fade, .-fade-x) to hint at overflow without resorting to JS observers."
    - "Need an \"auto\" variant where the scrollbar only appears on hover / focus-within."
  avoidWhen:
    - "You need virtualization, restore-scroll-position, or scroll-into-view APIs — those need bespoke JS, not this CSS contract."
    - "You need a custom-drawn track / thumb (e.g. mini-map, position indicator) — native scrollbar styling cannot do this."
    - "The container should never scroll (clip overflow) — use overflow: clip / hidden directly."
    - "The content scrolls horizontally only and needs snap behavior — use a dedicated carousel/scroll-snap pattern."

canonicalImports:
  css:
    - "rends/components/composites/ren-scroll-area/ren-scroll-area.css"
  notes:
    - "CSS-only component: no JavaScript file is colocated. Do not introduce JS unless the source component grows that responsibility."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Apply class=\"ren-scroll-area\" to a real block element that owns overflow (commonly <div>, <section>, <main>)."
  - "Add tabindex=\"0\" plus an accessible name (aria-label / aria-labelledby) unless the region already contains a focusable descendant. Static content — text, images, non-interactive lists — always needs it: <section class=\"ren-scroll-area ren-scroll-area-md\" tabindex=\"0\" aria-label=\"Activity log\">…</section>."
  - "Only omit tabindex when every scroll position is reachable by tabbing through focusable children (links, buttons, form controls) already inside the region."
  - "Constrain height/width explicitly — either via .ren-scroll-area-sm/-md/-lg/-xl/-full, an inline --scroll-max custom property, or a parent flex/grid track."
  - "Pair direction with intent: .-x for horizontal-only, .-y for vertical-only; omit for auto in both axes."
  - "When using .-fade or .-fade-x the masking ::before/::after read from --color-surface; ensure the scroll area sits on a surface that matches that token."

forbiddenPatterns:
  - "A .ren-scroll-area whose content overflows, with no tabindex=\"0\" and no focusable descendant — keyboard-only users cannot reach the hidden content (axe: scrollable-region-focusable, WCAG 2.1 A, 2.1.1)."
  - "Removing the :focus-visible outline (outline: none) from a .ren-scroll-area that carries tabindex=\"0\" — the tab stop then exists but is invisible (WCAG 2.4.7)."
  - "Overriding overflow with overflow: hidden — that defeats the entire component (no scrollbar, no fade mask alignment)."
  - "Wrapping a <ren-scroll-area> custom element instead of the .ren-scroll-area class — no custom element exists for this composite."
  - "Stacking position: absolute children that escape the scroll context — the fade overlays (::before/::after at z-index: 10) assume in-flow content underneath."
  - "Hardcoding scrollbar-color or ::-webkit-scrollbar-thumb hex values — theme via --color-fill-active / --color-fill-hover so dark mode adapts."
  - "Setting --scroll-max on the parent expecting cascade — the rule is .ren-scroll-area[--scroll-max] { max-height: var(--scroll-max) } so the variable must be authored on the same element."

tokenPolicy:
  allowed:
    - "Semantic tokens used by the scrollbar, fade masks, and focus ring: --color-fill-active, --color-fill-hover, --color-surface, --color-focus-ring."
    - "Layout / shape / motion tokens: --radius-full, --ring-width, --ring-offset-width, --duration-enter, --ease-enter, --transition-tactile."
    - "Authoring custom max-height via the --scroll-max custom property on the .ren-scroll-area element."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / rgb() values for scrollbar thumb or fade-mask gradients."
    - "Inventing --ren-scroll-area-* tokens — none are part of the Public Token API today."

accessibility:
  required:
    - "If the scrollable region contains no focusable child, set tabindex=\"0\" on the .ren-scroll-area so keyboard users can scroll it with Arrow / PageUp / PageDown. This is not optional polish: without it the content is unreachable without a mouse."
    - "A .ren-scroll-area with tabindex=\"0\" must also carry an accessible name (aria-label / aria-labelledby), otherwise the tab stop announces as an unnamed group; e.g. <section class=\"ren-scroll-area\" tabindex=\"0\" aria-label=\"Logs\">."
    - "The component ships the focus ring for that tab stop (:focus-visible → --ring-width / --color-focus-ring / --ring-offset-width). Do not suppress it."
    - "Honor prefers-reduced-motion: the component disables scroll-behavior: smooth via the existing @media rule — do not re-enable smooth scrolling under reduced-motion."
    - "Do not rely on the fade-edge gradients alone to signal more content; pair with a visible affordance (chevron, scroll-hint) when content overflow is decision-critical."
    - "Scrollbar contrast: --color-fill-active and --color-fill-hover must remain distinguishable from --color-surface in both themes; do not theme so the thumb disappears."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-scroll-area/ren-scroll-area.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<section class="ren-scroll-area ren-scroll-area-md" tabindex="0" aria-label="Activity log"><p>Activity entry</p></section>

```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-scroll-area`
- `.ren-scroll-area-full`
- `.ren-scroll-area-lg`
- `.ren-scroll-area-md`
- `.ren-scroll-area-sm`
- `.ren-scroll-area-xl`

## States And Attributes

- `:focus-visible`
- `:hover`
- `[tabindex]`

## Public Token API

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

If no `--ren-*` token is detected here, theme through semantic tokens from `tokens/tokens.md` and avoid selector overrides.

## Accessibility Contract

- A scrollable region with no focusable descendant must be focusable itself
  (`tabindex="0"`) and named. Scrolling is an operation; WCAG 2.1.1 requires it
  to be available from the keyboard.
- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/composites/ren-scroll-area/ren-scroll-area.css`
- `docs/components/ren-scroll-area.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
