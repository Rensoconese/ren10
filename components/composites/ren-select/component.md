# ren-select Component Contract

Custom select/listbox composite with trigger, options, and keyboard navigation.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-select` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-select` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Select composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-select/ren-select.css">
<script type="module" src="rends/components/composites/ren-select/ren-select.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-select">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-open`
- `.ren-select`
- `.ren-select-chip`
- `.ren-select-chip-remove`
- `.ren-select-chips`
- `.ren-select-content`
- `.ren-select-empty`
- `.ren-select-group`
- `.ren-select-icon`
- `.ren-select-item`
- `.ren-select-label`
- `.ren-select-lg`
- `.ren-select-placeholder`
- `.ren-select-separator`
- `.ren-select-sm`
- `.ren-select-trigger`
- `.ren-select-value`

## States And Attributes

- `[aria-disabled]`
- `[aria-expanded]`
- `[aria-selected]`
- `[data-highlighted]`
- `[data-select-content]`
- `[data-select-item]`
- `[data-select-trigger]`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

If no `--ren-*` token is detected here, theme through semantic tokens from `tokens/tokens.md` and avoid selector overrides.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-select/ren-select.css`
- `components/composites/ren-select/ren-select.js`
- `docs/components/ren-select.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
