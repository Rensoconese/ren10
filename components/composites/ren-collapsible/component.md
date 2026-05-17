# ren-collapsible Component Contract

Expandable/collapsible region with explicit state.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-collapsible` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-collapsible` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Collapsible composite behavior or visual role.
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
    - "A single, standalone expandable section is needed (no sibling exclusivity)."
    - "You want a zero-JS disclosure based on native <details>/<summary>."
    - "Initial state must be declarable in HTML via the [open] attribute."
    - "A subtle ghost variant (no border, flush) is desired."
    - "The content area animates height via CSS interpolate-size (no JS measurement)."
  avoidWhen:
    - "Multiple grouped disclosures share chrome — use ren-accordion (handles exclusive mode)."
    - "The disclosure floats above content as a popover — use ren-popover."
    - "The trigger must control a remote panel — use a button + aria-controls on a custom panel."
    - "The disclosure is a navigation reveal — use ren-sidebar / ren-menu."

canonicalImports:
  css:
    - "rends/components/composites/ren-collapsible/ren-collapsible.css"
  notes:
    - "If the page already imports rends/components/index.css, do not import the CSS again."
    - "No colocated JS — open / close uses the native <details> toggle event; consumers can listen for 'toggle' if needed."
    - "Add interpolate-size support polyfill only if you require height animation on legacy browsers."

requiredMarkup:
  - "Root element is <details class=\"ren-collapsible\">; do not wrap a <div> with a custom click handler."
  - "Trigger is the first child <summary>; content lives in a sibling <div class=\"ren-collapsible-content\">."
  - "Use the [open] attribute to render expanded on first paint (do not set hidden / display via style)."
  - "Add .ren-collapsible-ghost to the host for the borderless variant; do not invent additional variant classes."
  - "Keep the chevron decorative — it is rendered via the summary::after pseudo-element."

forbiddenPatterns:
  - "<div class=\"ren-collapsible\"><div role=\"button\">…</div></div> — must be a real <details>/<summary>."
  - "Custom triangle / chevron inside the summary text content; rely on summary::after rotation."
  - "Animating with JavaScript-driven max-height; CSS interpolate-size handles auto-to-zero transitions."
  - "Removing the focus ring (outline: none) without restoring :focus-visible on summary."
  - "Calling .open = true on a detached <details> outside the DOM — bind it inside .ren-collapsible first."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-collapse-bg, --ren-collapse-border, --ren-collapse-duration, --ren-collapse-easing, --ren-collapse-padding, --ren-collapse-radius, --ren-collapse-trigger-font, --ren-collapse-trigger-weight."
    - "Semantic tokens: --color-border, --color-text, --color-text-muted, --color-text-secondary, --color-fill, --color-focus-ring."
    - "Layout / motion tokens: --space-*, --radius-md, --stroke-1, --touch-min, --ring-width, --duration-enter, --ease-enter, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Raw transition values; use --duration-enter / --ease-enter or --ren-collapse-duration / --ren-collapse-easing."

accessibility:
  required:
    - "Use the real <details>/<summary> pair so the browser exposes the native disclosure pattern and supports Enter / Space toggle."
    - "Touch target on the summary stays ≥ var(--touch-min) (44px) — do not shrink below this on touch surfaces."
    - "Visible :focus-visible ring on summary uses --color-focus-ring and --ring-width; do not remove it."
    - "Chevron is decorative (::after pseudo) — never expose its rotation to AT via aria-label."
    - "Communicate open state through the [open] attribute (native semantics) — never rely on color alone."
    - "Animations respect prefers-reduced-motion (chevron rotation transition is disabled)."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-collapsible/ren-collapsible.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-collapsible">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-collapsible`
- `.ren-collapsible-content`
- `.ren-collapsible-ghost`

## States And Attributes

- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-collapse-bg`
- `--ren-collapse-border`
- `--ren-collapse-duration`
- `--ren-collapse-easing`
- `--ren-collapse-padding`
- `--ren-collapse-radius`
- `--ren-collapse-trigger-font`
- `--ren-collapse-trigger-weight`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/composites/ren-collapsible/ren-collapsible.css`
- `docs/components/ren-collapsible.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
