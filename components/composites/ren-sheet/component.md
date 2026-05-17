# ren-sheet Component Contract

Edge-attached dialog/surface for secondary workflows.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-sheet` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-sheet` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Sheet composite behavior or visual role.
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
    - "The disclosure is an edge-anchored panel (right / left / top / bottom) over the main app."
    - "You need the native <dialog> behavior — modal focus trap, ::backdrop, Escape to dismiss — on a side surface."
    - "You need a slide-in transition controlled by [data-side] with @starting-style fallback."
    - "You need swipe-to-dismiss on touch and outside-click / Escape dismissal."
    - "You need a mobile bottom sheet with a drag handle (.ren-sheet-handle)."
  avoidWhen:
    - "The disclosure should be centered and block the page — use ren-dialog."
    - "The panel is persistent app-shell navigation — use ren-sidebar."
    - "The disclosure is a small anchored popup — use ren-popover, ren-tooltip, or ren-menu."
    - "The notification is transient and must not steal focus — use ren-toast."

canonicalImports:
  css:
    - "rends/components/composites/ren-sheet/ren-sheet.css"
  js:
    - "rends/components/composites/ren-sheet/ren-sheet.js"
  notes:
    - "JS is required: it wraps the consumer's children in a real <dialog class=\"ren-sheet\"> and wires triggers, swipe, and lifecycle events."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "<ren-sheet id=\"...\" side=\"right|left|top|bottom\"> is the host; do not replace the inner <dialog> the component generates with a <div>."
  - "Header / body / footer slots use .ren-sheet-header, .ren-sheet-body, .ren-sheet-footer in that order so the body grows and the footer pins to the bottom."
  - "Provide .ren-sheet-title as a real heading; it supplies the accessible name when no aria-label is set on <ren-sheet>."
  - "Close affordances use [data-sheet-close]; triggers elsewhere on the page use [data-sheet-trigger=\"<id>\"]."
  - "Use size variants via the .-sm / .-md / .-lg / .-xl / .-full classes — do not inline width on the host."

forbiddenPatterns:
  - "<ren-sheet> rendered as a <div role=\"dialog\"> — the component must use the real <dialog> it generates."
  - "Calling .show() / .close() on the inner <dialog> directly; always use the <ren-sheet> .show() / .close() methods."
  - "Hardcoded backdrop colors (rgba(0,0,0,...)); use --color-overlay via the component's ::backdrop rule."
  - "Animating slide-in with custom @keyframes; use the documented [data-side] + @starting-style + --duration-enter / --ease-enter pipeline."
  - "Toggling visibility via display: none / display: block — the [open] attribute drives the @starting-style translate."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-sheet-backdrop, --ren-sheet-bg, --ren-sheet-border, --ren-sheet-duration, --ren-sheet-easing, --ren-sheet-padding, --ren-sheet-radius, --ren-sheet-shadow, --ren-sheet-width."
    - "Semantic surface tokens: --color-surface, --color-text, --color-text-muted, --color-border, --color-overlay, --color-fill, --color-fill-active, --color-fill-hover."
    - "Spacing / motion tokens: --space-*, --radius-full, --duration-enter, --duration-exit, --ease-enter, --ease-exit, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgb / named color values in overrides — even for the box-shadow on the leading edge (use semantic tokens or override --ren-sheet-shadow)."
    - "Hardcoded transition durations; route through --duration-enter / --duration-exit and their paired easings."

accessibility:
  required:
    - "Modality is provided by the inner real <dialog> (focus trap + inert background); do not break the trap with manual focus moves."
    - ".ren-sheet-title supplies the accessible label; if omitted, set aria-label on <ren-sheet>."
    - "Escape closes the sheet (unless dismissible=\"false\"); the close button [data-sheet-close] has a visible aria-label."
    - "Restore focus to the original trigger element after close (handled by the component via the returnFocus reference)."
    - "Swipe-to-dismiss must coexist with keyboard dismissal; do not override touch-action on the dialog."
    - "Respect prefers-reduced-motion: the slide-in collapses to a plain fade automatically — do not reintroduce custom animations there."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-sheet/ren-sheet.css">
<script type="module" src="rends/components/composites/ren-sheet/ren-sheet.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-sheet">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-sheet`
- `.ren-sheet-body`
- `.ren-sheet-close`
- `.ren-sheet-description`
- `.ren-sheet-footer`
- `.ren-sheet-handle`
- `.ren-sheet-header`
- `.ren-sheet-title`

## States And Attributes

- `[data-sheet-close]`
- `[data-sheet-trigger]`
- `[data-side]`
- `:active`
- `:hover`

## Public Token API

- `--ren-sheet-backdrop`
- `--ren-sheet-bg`
- `--ren-sheet-border`
- `--ren-sheet-duration`
- `--ren-sheet-easing`
- `--ren-sheet-padding`
- `--ren-sheet-radius`
- `--ren-sheet-shadow`
- `--ren-sheet-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-sheet/ren-sheet.css`
- `components/composites/ren-sheet/ren-sheet.js`
- `docs/components/ren-sheet.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
