# ren-ai Pattern Contract

AI interaction pattern for prompts, responses, suggestions, and assistant surfaces.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-ai` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-ai` pattern.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Ai pattern behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this pattern.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The UI surfaces AI-generated content (chat reply, completion, summary, suggestion)."
    - "You need an AI message bubble with streaming caret (.ren-ai-streaming) or typing indicator."
    - "You need to render citations / source references attached to AI output (.ren-ai-citation, .ren-ai-sources)."
    - "You need a confidence indicator with high/medium/low levels (data-level=\"high|medium|low\")."
    - "You need a chat-style prompt input (.ren-ai-prompt + .ren-ai-prompt-input + .ren-ai-prompt-send)."
    - "You need to mark non-AI content as AI-augmented via an inline slug (.ren-ai-slug)."
  avoidWhen:
    - "The content is a generic human message — use a plain card / message bubble."
    - "The control is a generic submit button — use ren-button, not .ren-ai-prompt-send."
    - "The loading state is for non-AI fetch/page — use ren-skeleton, not .ren-ai-skeleton."

canonicalImports:
  css:
    - "rends/components/patterns/ren-ai/ren-ai.css"
  notes:
    - "CSS-only pattern. No colocated JS — streaming text and feedback handlers live in consumer code."
    - "Animations respect prefers-reduced-motion via fallback rules; do not override."

requiredMarkup:
  - "Wrap AI replies in <div class=\"ren-ai-message\"> with a .ren-ai-message-header (slug + meta) and .ren-ai-message-content."
  - "Streaming responses add the .ren-ai-streaming class on .ren-ai-message; the blinking caret is the ::after on .ren-ai-message-content."
  - "Citations are inline <a class=\"ren-ai-citation\"> with vertical-align: super; source lists use <a class=\"ren-ai-source\"> rows inside .ren-ai-sources."
  - ".ren-ai-confidence MUST carry data-level=\"high|medium|low\"; the fill width and color are driven by that attribute."
  - "The prompt composer must be .ren-ai-prompt wrapping a <textarea class=\"ren-ai-prompt-input\"> and a <button class=\"ren-ai-prompt-send\"> with an accessible name."

forbiddenPatterns:
  - "Using .ren-ai-message for non-AI chat content (use a neutral message component instead)."
  - "Faking confidence levels by inline-styling .ren-ai-confidence-fill width — set data-level."
  - "Replacing .ren-ai-prompt-send with a bare <button> styled as a circle — use the documented selector."
  - "Hardcoding the purple accent (e.g. #8B5CF6) instead of letting the pattern resolve --purple-500 / --purple-300 via light-dark()."
  - "Animating the typing dots or skeleton manually; the pattern ships keyframes + reduced-motion fallbacks."

tokenPolicy:
  allowed:
    - "Semantic tokens: --color-text, --color-text-muted, --color-surface-raised, --color-surface-sunken, --color-fill, --color-border-muted, --color-success, --color-warning, --color-danger."
    - "Layout / type tokens: --space-*, --radius-*, --stroke-1, --body-size, --caption-size, --caption-sm-size, --label-size, --leading-relaxed, --weight-medium, --weight-semibold, --weight-bold."
    - "Motion tokens: --duration-tactile, --duration-state, --ease-enter."
    - "Size tokens for the send button and action chrome: --size-sm, --size-md, --text-lg."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code — the pattern owns the purple accent internally."
    - "Hardcoded hex / named colors (e.g. #8B5CF6, purple, rgb(...))."
    - "Raw transition durations or easings; use --duration-* / --ease-*."

accessibility:
  required:
    - "AI messages must include a visible AI slug or .ren-ai-message-header so screen-reader users know the source is AI-generated, not human."
    - "Streaming caret and typing dots respect prefers-reduced-motion; never strip those fallbacks."
    - ".ren-ai-action-thumbs feedback buttons need accessible names (aria-label=\"Helpful\" / \"Not helpful\"); icon-only is not enough."
    - ".ren-ai-prompt-input is a real <textarea> with an associated <label> (or aria-label); the send button must reflect disabled state via the disabled attribute, not opacity alone."
    - "Confidence must not rely on color alone — keep the numeric / textual level visible next to .ren-ai-confidence-bar."
    - ".ren-ai-citation must be a real <a> with href and an accessible target; do not implement as a styled <span>."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/patterns/ren-ai/ren-ai.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-ai-action">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-ai-action`
- `.ren-ai-action-edit`
- `.ren-ai-action-regenerate`
- `.ren-ai-action-thumbs`
- `.ren-ai-actions`
- `.ren-ai-citation`
- `.ren-ai-confidence`
- `.ren-ai-confidence-bar`
- `.ren-ai-confidence-fill`
- `.ren-ai-error`
- `.ren-ai-error-message`
- `.ren-ai-file-chip`
- `.ren-ai-file-chip-icon`
- `.ren-ai-file-chip-name`
- `.ren-ai-file-chip-remove`
- `.ren-ai-file-chip-size`
- `.ren-ai-message`
- `.ren-ai-message-content`
- `.ren-ai-message-footer`
- `.ren-ai-message-header`
- `.ren-ai-prompt`
- `.ren-ai-prompt-input`
- `.ren-ai-prompt-send`
- `.ren-ai-skeleton`
- `.ren-ai-skeleton-line`
- `.ren-ai-slug`
- `.ren-ai-source`
- `.ren-ai-source-number`
- `.ren-ai-source-title`
- `.ren-ai-source-url`
- `.ren-ai-sources`
- `.ren-ai-streaming`
- `.ren-ai-tool-call`
- `.ren-ai-tool-call-args`
- `.ren-ai-tool-call-header`
- `.ren-ai-tool-call-name`
- `.ren-ai-tool-call-result`
- `.ren-ai-tool-call-status`
- `.ren-ai-typing`
- `.ren-ai-typing-dots`

All selectors are CSS-only — the consumer wires retry handlers, file
upload state, tool execution, and edit-and-resend logic. The pattern
gives you the visuals (and a sane `<details>` baseline for tool calls
so collapse works without JS); state belongs to your app.

## States And Attributes

- `[data-active]`
- `[data-level]` — on `.ren-ai-confidence` (high|medium|low)
- `[data-status]` — on `.ren-ai-tool-call` (pending|running|success|error)
- `[open]` — native on `.ren-ai-tool-call` when expanded
- `:active`
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
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/patterns/ren-ai/ren-ai.css`
- `docs/components/ren-ai.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
