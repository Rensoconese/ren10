# ren-dropzone Component Contract

File drop and upload affordance with keyboard fallback.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-dropzone` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-dropzone` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Dropzone composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-dropzone/ren-dropzone.css">
<script type="module" src="rends/components/composites/ren-dropzone/ren-dropzone.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-dropzone">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-dropzone`
- `.ren-dropzone-compact`
- `.ren-dropzone-content`
- `.ren-dropzone-description`
- `.ren-dropzone-file`
- `.ren-dropzone-file-name`
- `.ren-dropzone-file-remove`
- `.ren-dropzone-file-size`
- `.ren-dropzone-files`
- `.ren-dropzone-icon`
- `.ren-dropzone-input`
- `.ren-dropzone-title`

## States And Attributes

- `[aria-disabled]`
- `[data-dragover]`
- `[data-error]`
- `:disabled`
- `:hover`

## Public Token API

- `--ren-dropzone-bg`
- `--ren-dropzone-border-color`
- `--ren-dropzone-border-style`
- `--ren-dropzone-border-width`
- `--ren-dropzone-hover-bg`
- `--ren-dropzone-hover-border`
- `--ren-dropzone-padding`
- `--ren-dropzone-radius`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-dropzone/ren-dropzone.css`
- `components/composites/ren-dropzone/ren-dropzone.js`
- `docs/components/ren-dropzone.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
