---
type: "RenDS Component"
title: ren-dropzone
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:composite:ren-dropzone
sourcePath: components/composites/ren-dropzone
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - composite
  - ren10
  - rends
---

# ren-dropzone

Source path: `components/composites/ren-dropzone`

## Relationships

- `exposes_selector` -> [.ren-dropzone](../../selectors/ren-dropzone.md)
- `exposes_selector` -> [.ren-dropzone-compact](../../selectors/ren-dropzone-compact.md)
- `exposes_selector` -> [.ren-dropzone-content](../../selectors/ren-dropzone-content.md)
- `exposes_selector` -> [.ren-dropzone-description](../../selectors/ren-dropzone-description.md)
- `exposes_selector` -> [.ren-dropzone-file](../../selectors/ren-dropzone-file.md)
- `exposes_selector` -> [.ren-dropzone-file-name](../../selectors/ren-dropzone-file-name.md)
- `exposes_selector` -> [.ren-dropzone-file-remove](../../selectors/ren-dropzone-file-remove.md)
- `exposes_selector` -> [.ren-dropzone-file-size](../../selectors/ren-dropzone-file-size.md)
- `exposes_selector` -> [.ren-dropzone-files](../../selectors/ren-dropzone-files.md)
- `exposes_selector` -> [.ren-dropzone-icon](../../selectors/ren-dropzone-icon.md)
- `exposes_selector` -> [.ren-dropzone-input](../../selectors/ren-dropzone-input.md)
- `exposes_selector` -> [.ren-dropzone-title](../../selectors/ren-dropzone-title.md)
- `has_contract` -> [ren-dropzone component.md](../../foundation/contract-composite-ren-dropzone.md)
- `has_css` -> [ren-dropzone.css](../../css/ren-dropzone-css.md)
- `has_docs_page` -> [ren-dropzone docs](../../docs/ren-dropzone-docs.md)
- `has_js` -> [ren-dropzone.js](../../javascript/ren-dropzone-js.md)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--caption-size](../../tokens/caption-size.md)
- `uses_token` -> [--color-accent](../../tokens/color-accent.md)
- `uses_token` -> [--color-accent-subtle](../../tokens/color-accent-subtle.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-border-strong](../../tokens/color-border-strong.md)
- `uses_token` -> [--color-danger](../../tokens/color-danger.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-focus-ring](../../tokens/color-focus-ring.md)
- `uses_token` -> [--color-surface-raised](../../tokens/color-surface-raised.md)
- `uses_token` -> [--color-surface-sunken](../../tokens/color-surface-sunken.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--radius-lg](../../tokens/radius-lg.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--radius-sm](../../tokens/radius-sm.md)
- `uses_token` -> [--ring-offset-width](../../tokens/ring-offset-width.md)
- `uses_token` -> [--ring-width](../../tokens/ring-width.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--space-6](../../tokens/space-6.md)
- `uses_token` -> [--stroke-1](../../tokens/stroke-1.md)
- `uses_token` -> [--text-base](../../tokens/text-base.md)
- `uses_token` -> [--text-sm](../../tokens/text-sm.md)
- `uses_token` -> [--text-xl](../../tokens/text-xl.md)
- `uses_token` -> [--transition-tactile](../../tokens/transition-tactile.md)
- `uses_token` -> [--weight-medium](../../tokens/weight-medium.md)

## Structured Data

```json
{
  "kind": "composite",
  "selectors": [
    ".ren-dropzone",
    ".ren-dropzone-compact",
    ".ren-dropzone-content",
    ".ren-dropzone-description",
    ".ren-dropzone-file",
    ".ren-dropzone-file-name",
    ".ren-dropzone-file-remove",
    ".ren-dropzone-file-size",
    ".ren-dropzone-files",
    ".ren-dropzone-icon",
    ".ren-dropzone-input",
    ".ren-dropzone-title"
  ],
  "tokens": [
    "--body-size",
    "--caption-size",
    "--color-accent",
    "--color-accent-subtle",
    "--color-border",
    "--color-border-strong",
    "--color-danger",
    "--color-fill",
    "--color-focus-ring",
    "--color-surface-raised",
    "--color-surface-sunken",
    "--color-text",
    "--color-text-muted",
    "--radius-full",
    "--radius-lg",
    "--radius-md",
    "--radius-sm",
    "--ring-offset-width",
    "--ring-width",
    "--space-1",
    "--space-2",
    "--space-3",
    "--space-4",
    "--space-6",
    "--stroke-1",
    "--text-base",
    "--text-sm",
    "--text-xl",
    "--transition-tactile",
    "--weight-medium"
  ],
  "hasScript": true,
  "hasDocsPage": true
}
```

## Source Content

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


/* ============================================
   RenDS — DropZone Component
   ============================================
   Drag & drop file upload area.
   Minimal JS for drag events — CSS handles visuals.

   Uses native drag events, no library needed.

   Usage:
     <div class="ren-dropzone" data-accept=".jpg,.png,.pdf" data-max-size="5MB">
       <div class="ren-dropzone-content">
         <span class="ren-dropzone-icon">↑</span>
         <p class="ren-dropzone-title">Drop files here</p>
         <p class="ren-dropzone-description">or click to browse</p>
       </div>
       <input type="file" class="ren-dropzone-input" multiple accept=".jpg,.png,.pdf">
     </div>
   ============================================ */

.ren-dropzone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 10rem;
  padding: var(--space-6);
  border: 2px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface-sunken);
  cursor: pointer;
  transition: var(--transition-tactile);
}

.ren-dropzone:hover {
  border-color: var(--color-accent);
  background-color: var(--color-accent-subtle);
}

/* Drag over state (set via JS: element.dataset.dragover = true) */
.ren-dropzone[data-dragover] {
  border-color: var(--color-accent);
  background-color: var(--color-accent-subtle);
  border-style: solid;
}

.ren-dropzone:focus-within {
  outline: var(--ring-width) solid var(--color-focus-ring);
  outline-offset: var(--ring-offset-width);
}

/* Hidden file input covers entire dropzone */
.ren-dropzone-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

/* Content */
.ren-dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  text-align: center;
  pointer-events: none;
}

.ren-dropzone-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  font-size: var(--text-xl);
  color: var(--color-text-muted);
  background-color: var(--color-fill);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-1);
}

.ren-dropzone[data-dragover] .ren-dropzone-icon {
  color: var(--color-accent);
  background-color: color-mix(in oklch, var(--color-accent), transparent 85%);
}

.ren-dropzone-title {
  font-size: var(--body-size);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.ren-dropzone-description {
  font-size: var(--caption-size, var(--text-sm));
  color: var(--color-text-muted);
}

/* ─── File list (after upload) ─── */
.ren-dropzone-files {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
  margin-top: var(--space-3);
}

.ren-dropzone-file {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-surface-raised);
  border: var(--stroke-1) solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--caption-size, var(--text-sm));
}

.ren-dropzone-file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ren-dropzone-file-size {
  color: var(--color-text-muted);
  white-space: nowrap;
}

.ren-dropzone-file-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
}

.ren-dropzone-file-remove:hover {
  color: var(--color-danger);
}

/* ─── Compact variant ─── */
.ren-dropzone-compact {
  min-height: auto;
  padding: var(--space-3) var(--space-4);
  flex-direction: row;
  gap: var(--space-3);
}

.ren-dropzone-compact .ren-dropzone-content {
  flex-direction: row;
}

.ren-dropzone-compact .ren-dropzone-icon {
  width: 2rem;
  height: 2rem;
  font-size: var(--text-base);
  margin-bottom: 0;
}

/* ─── Disabled ─── */
.ren-dropzone[aria-disabled="true"],
.ren-dropzone:has(input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* ─── Error state ─── */
.ren-dropzone[data-error] {
  border-color: var(--color-danger);
}


/* ============================================
   RenDS — DropZone Drag & Drop Handler
   ============================================
   Minimal JS for drag events. Handles:
   - Drag enter/leave visual state
   - File drop processing
   - Custom event dispatch

   Usage:
     import { initDropZone } from './ren-dropzone.js';
     const dz = initDropZone(document.querySelector('.ren-dropzone'));
     dz.addEventListener('ren-files-added', (e) => {
       console.log(e.detail.files);
     });
   ============================================ */

/**
 * @param {HTMLElement} dropzone
 * @returns {HTMLElement}
 */
export function initDropZone(dropzone) {
  if (!dropzone) return null;

  let dragCounter = 0;
  const input = dropzone.querySelector('.ren-dropzone-input');

  const handleFiles = (files) => {
    dropzone.dispatchEvent(
      new CustomEvent('ren-files-added', {
        detail: { files: [...files] },
        bubbles: true,
      })
    );
  };

  dropzone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    dropzone.dataset.dragover = '';
  });

  dropzone.addEventListener('dragleave', () => {
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      delete dropzone.dataset.dragover;
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    delete dropzone.dataset.dragover;
    if (e.dataTransfer?.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  });

  if (input) {
    input.addEventListener('change', () => {
      if (input.files?.length) {
        handleFiles(input.files);
      }
    });
  }

  return dropzone;
}
