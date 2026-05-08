# ren-tabs Component Contract

Tabbed interface with trigger list and panels.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-tabs` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-tabs` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Tabs composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-tabs/ren-tabs.css">
<script type="module" src="rends/components/composites/ren-tabs/ren-tabs.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-tabs">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-tab`
- `.ren-tab-list`
- `.ren-tab-list-enclosed`
- `.ren-tab-list-pills`
- `.ren-tab-list-underline`
- `.ren-tab-panel`
- `.ren-tabs`

## States And Attributes

- `[aria-disabled]`
- `[aria-selected]`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-tabs-active-color`
- `--ren-tabs-border-color`
- `--ren-tabs-color`
- `--ren-tabs-duration`
- `--ren-tabs-easing`
- `--ren-tabs-font-size`
- `--ren-tabs-font-weight`
- `--ren-tabs-gap`
- `--ren-tabs-height`
- `--ren-tabs-indicator-color`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-tabs/ren-tabs.css`
- `components/composites/ren-tabs/ren-tabs.js`
- `docs/components/ren-tabs.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
