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

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "User must upload files via drag-and-drop OR click-to-browse with a single clear target."
    - "You want a dashed-border surface that highlights on dragover and lists uploaded files inline."
    - "Drop must also work for keyboard / pointer users by clicking through to a native <input type=\"file\">."
    - "You need a custom event (ren-files-added) carrying File[] instead of wiring the change event yourself."
    - "Showing accepted types / max size hints next to the icon is part of the flow."
  avoidWhen:
    - "The flow is a single hidden file picker triggered by a button — use a plain <input type=\"file\"> + ren-button label."
    - "Files come from a remote URL / clipboard image only — dropzone is for OS file drops."
    - "You need a full upload manager with progress bars, chunked upload, or retries — wrap this dropzone with your own upload UI."
    - "The drop target is a generic editor surface where the file IS the document body (rich-text editor, canvas)."

canonicalImports:
  css:
    - "rends/components/composites/ren-dropzone/ren-dropzone.css"
  js:
    - "rends/components/composites/ren-dropzone/ren-dropzone.js"
  notes:
    - "JS is exposed as initDropZone(el) — call it explicitly on each .ren-dropzone, there is no auto-upgrade custom element."
    - "Without the JS, the CSS still renders a styled file input target, but you lose the dragover state, the dispatched event, and the file array shape."

requiredMarkup:
  - "Root is <div class=\"ren-dropzone\"> (or with .ren-dropzone-compact) and contains a single <input type=\"file\" class=\"ren-dropzone-input\"> covering the surface."
  - "The file input MUST be a real <input type=\"file\"> with absolute positioning; do not replace it with a custom button — keyboard users rely on the native click."
  - "Content sits in .ren-dropzone-content with .ren-dropzone-icon, .ren-dropzone-title, .ren-dropzone-description as siblings inside it."
  - "Uploaded files render as <div class=\"ren-dropzone-files\"> > .ren-dropzone-file rows with .ren-dropzone-file-name / -size / -remove inside each."
  - "Disabled state must set aria-disabled=\"true\" on the wrapper AND disabled on the inner <input> — :has(input:disabled) styles depend on both."

forbiddenPatterns:
  - "Removing <input type=\"file\"> and relying on dragover events alone — there is no keyboard fallback without the native input."
  - "Setting display: none on .ren-dropzone-input — the CSS expects it to overlay the dropzone for click-to-browse."
  - "Toggling drag highlight via inline styles — let the JS set/unset the [data-dragover] attribute so the state and the icon color react together."
  - "Custom error tints via hardcoded red — use the [data-error] attribute which switches the border to --color-danger."
  - "Putting the .ren-dropzone-content above the input in stacking order with pointer-events: auto — content uses pointer-events: none so clicks reach the file input."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-dropzone-bg, --ren-dropzone-border-color, --ren-dropzone-border-style, --ren-dropzone-border-width, --ren-dropzone-hover-bg, --ren-dropzone-hover-border, --ren-dropzone-padding, --ren-dropzone-radius."
    - "Semantic tokens used by the file list and icon: --color-surface-sunken, --color-surface-raised, --color-border, --color-border-strong, --color-fill, --color-text, --color-text-muted, --color-accent, --color-accent-subtle, --color-danger, --color-focus-ring."
    - "Layout / motion / type tokens: --space-*, --radius-md, --radius-lg, --radius-sm, --radius-full, --stroke-1, --text-xl, --text-base, --text-sm, --body-size, --caption-size, --weight-medium, --ring-width, --ring-offset-width, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer styles."
    - "Hardcoded hex / rgb() values for border, dragover background, or remove-button color — theme via the --color-* tokens."
    - "Custom focus rings on the wrapper that bypass --color-focus-ring / --ring-width / --ring-offset-width."

accessibility:
  required:
    - "Dropzone exposes :focus-within outline (--color-focus-ring) sourced from the inner native <input type=\"file\"> — do not remove the outline."
    - "Provide a visible label inside .ren-dropzone-title plus a description in .ren-dropzone-description so screen readers see the purpose, not just the icon."
    - "Disabled state requires aria-disabled=\"true\" AND the native disabled attribute; pointer-events: none alone leaves the input focusable."
    - "Remove buttons inside .ren-dropzone-file must include accessible names (aria-label=\"Remove <file name>\") because the visible glyph alone is decorative."
    - "Drag visual state ([data-dragover]) must not be the only signal — pair it with text feedback when validation fails ([data-error])."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-dropzone/ren-dropzone.css">
<script type="module" src="rends/components/composites/ren-dropzone/ren-dropzone.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-dropzone"><input class="ren-dropzone-input" type="file" multiple><div class="ren-dropzone-content"><span class="ren-dropzone-icon" aria-hidden="true">↑</span><strong class="ren-dropzone-title">Upload files</strong><span class="ren-dropzone-description">Drag files here or browse</span></div></div>

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
