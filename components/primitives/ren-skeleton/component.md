# ren-skeleton Component Contract

Loading placeholder primitive that respects reduced motion.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-skeleton` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-skeleton` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Skeleton primitive behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this primitive.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "Content is asynchronously loading and you need a placeholder that preserves layout dimensions."
    - "You want a shimmer that automatically degrades to a static fill under prefers-reduced-motion."
    - "You need shape-specific placeholders: text line (.ren-skeleton-text), heading (.ren-skeleton-heading), avatar (.ren-skeleton-circle), or block (.ren-skeleton-rect)."
    - "The placeholder is short-lived — it will be replaced by real content within a few seconds."
  avoidWhen:
    - "The wait is indeterminate or very long — use ren-spinner with descriptive copy."
    - "Only a single small inline indicator is needed — use ren-spinner-xs or ren-spinner-sm."
    - "You want a progress bar with a known percentage — use ren-progress instead."

canonicalImports:
  css:
    - "rends/components/primitives/ren-skeleton/ren-skeleton.css"
  notes:
    - "CSS-only primitive. There is no colocated JS — do not import one."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Always combine the base .ren-skeleton with one shape modifier (.ren-skeleton-text, .ren-skeleton-heading, .ren-skeleton-circle, .ren-skeleton-rect) so the size token resolves."
  - "Wrap a group of skeletons in a container that sets aria-busy=\"true\" and aria-live=\"polite\" so assistive tech is told to wait."
  - "Replace skeleton nodes with real content as soon as the data resolves — do not leave them mounted indefinitely."
  - "Match the skeleton's dimensions to the final content (avatar size, line count) to avoid layout shift on swap."

forbiddenPatterns:
  - "Animating with background-image: linear-gradient(...) hex colors directly; use the .ren-skeleton class and let --color-fill / --color-fill-hover drive the shimmer."
  - "Hardcoded width: 60% or height: 1.5em overrides for headings; use .ren-skeleton-heading and override --avatar-md / --radius-* via tokens if needed."
  - "Leaving the skeleton in the DOM after content loads — toggle visibility / remove, never repurpose as decoration."
  - "Using a skeleton for a determinate progress state (e.g. uploading X of Y) — that is a job for ren-progress."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-skeleton-bg, --ren-skeleton-radius, --ren-skeleton-shine, --ren-skeleton-speed."
    - "Semantic tokens consumed internally: --color-fill, --color-fill-hover, --radius-sm, --radius-md, --radius-full, --avatar-md, --duration-loop-slow, --ease-loop-pulse."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgba shimmer colors."
    - "Custom animation durations in seconds; theme via --ren-skeleton-speed or --duration-loop-slow."

accessibility:
  required:
    - "The container holding skeleton placeholders must set aria-busy=\"true\" so AT announces the loading state."
    - "Pair aria-busy with aria-live=\"polite\" when the content swap should be announced once data resolves."
    - "Skeleton nodes are presentational; do not put role=\"img\" or descriptive alt-text on them."
    - "The shimmer animation must stop under prefers-reduced-motion (the CSS already handles this — do not override animation in consumer code)."
    - "Skeleton color must remain perceivable in both light and dark themes via --color-fill (do not pin to a specific gray)."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-skeleton/ren-skeleton.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div aria-busy="true" aria-live="polite"><div class="ren-skeleton ren-skeleton-heading"></div><div class="ren-skeleton ren-skeleton-text"></div></div>

```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-skeleton`
- `.ren-skeleton-circle`
- `.ren-skeleton-heading`
- `.ren-skeleton-rect`
- `.ren-skeleton-text`

## States And Attributes

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

## Public Token API

- `--ren-skeleton-bg`
- `--ren-skeleton-radius`
- `--ren-skeleton-shine`
- `--ren-skeleton-speed`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-skeleton/ren-skeleton.css`
- `docs/components/ren-skeleton.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
