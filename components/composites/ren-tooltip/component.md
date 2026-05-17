# ren-tooltip Component Contract

Short accessible description attached to a trigger.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-tooltip` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-tooltip` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Tooltip composite behavior or visual role.
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
    - "You need a short, non-interactive description attached to a hoverable / focusable trigger (icon button label, truncated text expansion)."
    - "The content is plain text under ~15rem and provides supplementary info, not essential interaction."
    - "Disclosure is driven by hover, focus, and the popover API with anchor positioning + flip-block fallback."
    - "You need the dark high-contrast pill with an optional arrow caret (.ren-tooltip-arrow)."
    - "You can place [data-side=\"top|right|bottom|left\"] on the .ren-tooltip to indicate preferred side; CSS handles flipping."
  avoidWhen:
    - "The content is interactive (links, buttons, form fields) — use ren-popover or ren-hover-card."
    - "The content is critical for completing the task — use inline helper text or a visible label."
    - "The disclosure is value selection — use ren-select or ren-menu."
    - "The trigger has no accessible name and the tooltip is the only label — give the trigger a real aria-label or visible text instead."

canonicalImports:
  css:
    - "rends/components/composites/ren-tooltip/ren-tooltip.css"
  js:
    - "rends/components/composites/ren-tooltip/ren-tooltip.js"
  notes:
    - "JS is required: it owns the popover toggle, hover/focus timing (--ren-tooltip-delay), and the fallback positioning for browsers without CSS anchor-name support."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Pair a .ren-tooltip-trigger (real <button> or focusable element) with a .ren-tooltip element referenced via the popover API (popovertarget / id linkage)."
  - "The tooltip carries popover attribute so it lives in the top layer; do not implement it as a plain absolutely-positioned <div>."
  - "Include .ren-tooltip-arrow as a child of .ren-tooltip when an arrow is desired; position is driven by [data-side]."
  - "Set the desired side on the tooltip via data-side=\"top|right|bottom|left\"; CSS uses inset-area + position-try-fallbacks: flip-block for safe placement."
  - "Tooltip content must be plain text — no buttons, links, or form fields (those break the contract; use ren-popover instead)."

forbiddenPatterns:
  - "Putting interactive elements inside .ren-tooltip — pointer-events: none on the tooltip means clicks would not work and screen readers would not focus them anyway."
  - "Showing the tooltip only on hover without keyboard focus support — every trigger must reveal the tooltip on :focus-visible."
  - "Using a tooltip as the sole accessible name for an icon button — provide aria-label on the trigger and let the tooltip echo it."
  - "Animating the tooltip via custom @keyframes; rely on the documented opacity + transform transition with @starting-style."
  - "Hardcoding background / color on .ren-tooltip — override --ren-tooltip-bg / --ren-tooltip-color tokens instead."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-tooltip-bg, --ren-tooltip-color, --ren-tooltip-delay, --ren-tooltip-duration, --ren-tooltip-easing, --ren-tooltip-font-size, --ren-tooltip-padding-x, --ren-tooltip-padding-y, --ren-tooltip-radius, --ren-tooltip-shadow."
    - "Shape / motion tokens: --radius-md, --space-1, --space-2, --size-caption, --duration-enter, --ease-enter, --z-tooltip."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code. Note: the current default uses --color-gray-900 as the surface; consumers should override --ren-tooltip-bg with a semantic token (e.g. --color-text) rather than reaching for another --gray-* directly."
    - "Hardcoded hex / rgb / named color values (e.g. background: #111, color: white) in overrides — use --ren-tooltip-bg and --ren-tooltip-color."
    - "Hardcoded transition durations; route through --duration-enter / --ren-tooltip-duration and the paired easings."

accessibility:
  required:
    - "Trigger has its own accessible name (visible text or aria-label); the tooltip supplements but does not replace it."
    - "Tooltip opens on both :hover and keyboard :focus-visible; closing on blur / mouseleave / Escape."
    - "Hover delay respects --ren-tooltip-delay; do not show tooltips instantly on mouse jitter or hide them on the next mousemove."
    - "Tooltip text must meet contrast for the chosen --ren-tooltip-bg / --ren-tooltip-color pair (default dark bg / white text is WCAG AA against typical surfaces)."
    - "Touch users: tooltips should not be the only way to reveal essential info — provide a visible label or alternate disclosure for touch."
    - "Tooltip is pointer-events: none and never receives focus — if the content needs interaction, switch to ren-popover."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-tooltip/ren-tooltip.css">
<script type="module" src="rends/components/composites/ren-tooltip/ren-tooltip.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-tooltip">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-open`
- `.ren-tooltip`
- `.ren-tooltip-arrow`
- `.ren-tooltip-trigger`

## States And Attributes

- `[data-side]`

## Public Token API

- `--ren-tooltip-bg`
- `--ren-tooltip-color`
- `--ren-tooltip-delay`
- `--ren-tooltip-duration`
- `--ren-tooltip-easing`
- `--ren-tooltip-font-size`
- `--ren-tooltip-padding-x`
- `--ren-tooltip-padding-y`
- `--ren-tooltip-radius`
- `--ren-tooltip-shadow`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-tooltip/ren-tooltip.css`
- `components/composites/ren-tooltip/ren-tooltip.js`
- `docs/components/ren-tooltip.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
