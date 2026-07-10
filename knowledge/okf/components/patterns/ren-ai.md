---
type: "RenDS Component"
title: ren-ai
description: "RenDS Component generated from the RenDS knowledge graph."
id: component:pattern:ren-ai
sourcePath: components/patterns/ren-ai
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - component
  - pattern
  - ren10
  - rends
---

# ren-ai

Source path: `components/patterns/ren-ai`

## Relationships

- `exposes_selector` -> [.ren-ai-action](../../selectors/ren-ai-action.md)
- `exposes_selector` -> [.ren-ai-action-edit](../../selectors/ren-ai-action-edit.md)
- `exposes_selector` -> [.ren-ai-action-regenerate](../../selectors/ren-ai-action-regenerate.md)
- `exposes_selector` -> [.ren-ai-action-thumbs](../../selectors/ren-ai-action-thumbs.md)
- `exposes_selector` -> [.ren-ai-actions](../../selectors/ren-ai-actions.md)
- `exposes_selector` -> [.ren-ai-citation](../../selectors/ren-ai-citation.md)
- `exposes_selector` -> [.ren-ai-confidence](../../selectors/ren-ai-confidence.md)
- `exposes_selector` -> [.ren-ai-confidence-bar](../../selectors/ren-ai-confidence-bar.md)
- `exposes_selector` -> [.ren-ai-confidence-fill](../../selectors/ren-ai-confidence-fill.md)
- `exposes_selector` -> [.ren-ai-error](../../selectors/ren-ai-error.md)
- `exposes_selector` -> [.ren-ai-error-message](../../selectors/ren-ai-error-message.md)
- `exposes_selector` -> [.ren-ai-file-chip](../../selectors/ren-ai-file-chip.md)
- `exposes_selector` -> [.ren-ai-file-chip-icon](../../selectors/ren-ai-file-chip-icon.md)
- `exposes_selector` -> [.ren-ai-file-chip-name](../../selectors/ren-ai-file-chip-name.md)
- `exposes_selector` -> [.ren-ai-file-chip-remove](../../selectors/ren-ai-file-chip-remove.md)
- `exposes_selector` -> [.ren-ai-file-chip-size](../../selectors/ren-ai-file-chip-size.md)
- `exposes_selector` -> [.ren-ai-message](../../selectors/ren-ai-message.md)
- `exposes_selector` -> [.ren-ai-message-content](../../selectors/ren-ai-message-content.md)
- `exposes_selector` -> [.ren-ai-message-footer](../../selectors/ren-ai-message-footer.md)
- `exposes_selector` -> [.ren-ai-message-header](../../selectors/ren-ai-message-header.md)
- `exposes_selector` -> [.ren-ai-prompt](../../selectors/ren-ai-prompt.md)
- `exposes_selector` -> [.ren-ai-prompt-input](../../selectors/ren-ai-prompt-input.md)
- `exposes_selector` -> [.ren-ai-prompt-send](../../selectors/ren-ai-prompt-send.md)
- `exposes_selector` -> [.ren-ai-skeleton](../../selectors/ren-ai-skeleton.md)
- `exposes_selector` -> [.ren-ai-skeleton-line](../../selectors/ren-ai-skeleton-line.md)
- `exposes_selector` -> [.ren-ai-slug](../../selectors/ren-ai-slug.md)
- `exposes_selector` -> [.ren-ai-source](../../selectors/ren-ai-source.md)
- `exposes_selector` -> [.ren-ai-source-number](../../selectors/ren-ai-source-number.md)
- `exposes_selector` -> [.ren-ai-source-title](../../selectors/ren-ai-source-title.md)
- `exposes_selector` -> [.ren-ai-source-url](../../selectors/ren-ai-source-url.md)
- `exposes_selector` -> [.ren-ai-sources](../../selectors/ren-ai-sources.md)
- `exposes_selector` -> [.ren-ai-streaming](../../selectors/ren-ai-streaming.md)
- `exposes_selector` -> [.ren-ai-tool-call](../../selectors/ren-ai-tool-call.md)
- `exposes_selector` -> [.ren-ai-tool-call-args](../../selectors/ren-ai-tool-call-args.md)
- `exposes_selector` -> [.ren-ai-tool-call-header](../../selectors/ren-ai-tool-call-header.md)
- `exposes_selector` -> [.ren-ai-tool-call-name](../../selectors/ren-ai-tool-call-name.md)
- `exposes_selector` -> [.ren-ai-tool-call-result](../../selectors/ren-ai-tool-call-result.md)
- `exposes_selector` -> [.ren-ai-tool-call-status](../../selectors/ren-ai-tool-call-status.md)
- `exposes_selector` -> [.ren-ai-typing](../../selectors/ren-ai-typing.md)
- `exposes_selector` -> [.ren-ai-typing-dots](../../selectors/ren-ai-typing-dots.md)
- `has_contract` -> [ren-ai pattern.md](../../foundation/contract-pattern-ren-ai.md)
- `has_css` -> [ren-ai.css](../../css/ren-ai-css.md)
- `has_docs_page` -> [ren-ai docs](../../docs/ren-ai-docs.md)
- `used_by_example` -> [ai-panel.html](../../examples/ai-panel-html.md) (ren-ai)
- `uses_token` -> [--body-size](../../tokens/body-size.md)
- `uses_token` -> [--caption-size](../../tokens/caption-size.md)
- `uses_token` -> [--caption-sm-size](../../tokens/caption-sm-size.md)
- `uses_token` -> [--color-ai](../../tokens/color-ai.md)
- `uses_token` -> [--color-ai-hover](../../tokens/color-ai-hover.md)
- `uses_token` -> [--color-ai-subtle](../../tokens/color-ai-subtle.md)
- `uses_token` -> [--color-border](../../tokens/color-border.md)
- `uses_token` -> [--color-border-muted](../../tokens/color-border-muted.md)
- `uses_token` -> [--color-danger](../../tokens/color-danger.md)
- `uses_token` -> [--color-fill](../../tokens/color-fill.md)
- `uses_token` -> [--color-focus-ring](../../tokens/color-focus-ring.md)
- `uses_token` -> [--color-on-ai](../../tokens/color-on-ai.md)
- `uses_token` -> [--color-success](../../tokens/color-success.md)
- `uses_token` -> [--color-surface](../../tokens/color-surface.md)
- `uses_token` -> [--color-surface-raised](../../tokens/color-surface-raised.md)
- `uses_token` -> [--color-surface-sunken](../../tokens/color-surface-sunken.md)
- `uses_token` -> [--color-text](../../tokens/color-text.md)
- `uses_token` -> [--color-text-muted](../../tokens/color-text-muted.md)
- `uses_token` -> [--color-text-secondary](../../tokens/color-text-secondary.md)
- `uses_token` -> [--color-warning](../../tokens/color-warning.md)
- `uses_token` -> [--duration-state](../../tokens/duration-state.md)
- `uses_token` -> [--duration-tactile](../../tokens/duration-tactile.md)
- `uses_token` -> [--ease-enter](../../tokens/ease-enter.md)
- `uses_token` -> [--font-mono](../../tokens/font-mono.md)
- `uses_token` -> [--label-size](../../tokens/label-size.md)
- `uses_token` -> [--leading-normal](../../tokens/leading-normal.md)
- `uses_token` -> [--leading-relaxed](../../tokens/leading-relaxed.md)
- `uses_token` -> [--radius-full](../../tokens/radius-full.md)
- `uses_token` -> [--radius-lg](../../tokens/radius-lg.md)
- `uses_token` -> [--radius-md](../../tokens/radius-md.md)
- `uses_token` -> [--radius-sm](../../tokens/radius-sm.md)
- `uses_token` -> [--radius-xl](../../tokens/radius-xl.md)
- `uses_token` -> [--size-md](../../tokens/size-md.md)
- `uses_token` -> [--size-sm](../../tokens/size-sm.md)
- `uses_token` -> [--space-0-5](../../tokens/space-0-5.md)
- `uses_token` -> [--space-1](../../tokens/space-1.md)
- `uses_token` -> [--space-2](../../tokens/space-2.md)
- `uses_token` -> [--space-3](../../tokens/space-3.md)
- `uses_token` -> [--space-4](../../tokens/space-4.md)
- `uses_token` -> [--stroke-1](../../tokens/stroke-1.md)
- `uses_token` -> [--text-lg](../../tokens/text-lg.md)
- `uses_token` -> [--tracking-wide](../../tokens/tracking-wide.md)
- `uses_token` -> [--weight-bold](../../tokens/weight-bold.md)
- `uses_token` -> [--weight-medium](../../tokens/weight-medium.md)
- `uses_token` -> [--weight-semibold](../../tokens/weight-semibold.md)

## Structured Data

```json
{
  "kind": "pattern",
  "selectors": [
    ".ren-ai-action",
    ".ren-ai-action-edit",
    ".ren-ai-action-regenerate",
    ".ren-ai-action-thumbs",
    ".ren-ai-actions",
    ".ren-ai-citation",
    ".ren-ai-confidence",
    ".ren-ai-confidence-bar",
    ".ren-ai-confidence-fill",
    ".ren-ai-error",
    ".ren-ai-error-message",
    ".ren-ai-file-chip",
    ".ren-ai-file-chip-icon",
    ".ren-ai-file-chip-name",
    ".ren-ai-file-chip-remove",
    ".ren-ai-file-chip-size",
    ".ren-ai-message",
    ".ren-ai-message-content",
    ".ren-ai-message-footer",
    ".ren-ai-message-header",
    ".ren-ai-prompt",
    ".ren-ai-prompt-input",
    ".ren-ai-prompt-send",
    ".ren-ai-skeleton",
    ".ren-ai-skeleton-line",
    ".ren-ai-slug",
    ".ren-ai-source",
    ".ren-ai-source-number",
    ".ren-ai-source-title",
    ".ren-ai-source-url",
    ".ren-ai-sources",
    ".ren-ai-streaming",
    ".ren-ai-tool-call",
    ".ren-ai-tool-call-args",
    ".ren-ai-tool-call-header",
    ".ren-ai-tool-call-name",
    ".ren-ai-tool-call-result",
    ".ren-ai-tool-call-status",
    ".ren-ai-typing",
    ".ren-ai-typing-dots"
  ],
  "tokens": [
    "--body-size",
    "--caption-size",
    "--caption-sm-size",
    "--color-ai",
    "--color-ai-hover",
    "--color-ai-subtle",
    "--color-border",
    "--color-border-muted",
    "--color-danger",
    "--color-fill",
    "--color-focus-ring",
    "--color-on-ai",
    "--color-success",
    "--color-surface",
    "--color-surface-raised",
    "--color-surface-sunken",
    "--color-text",
    "--color-text-muted",
    "--color-text-secondary",
    "--color-warning",
    "--duration-state",
    "--duration-tactile",
    "--ease-enter",
    "--font-mono",
    "--label-size",
    "--leading-normal",
    "--leading-relaxed",
    "--radius-full",
    "--radius-lg",
    "--radius-md",
    "--radius-sm",
    "--radius-xl",
    "--size-md",
    "--size-sm",
    "--space-0-5",
    "--space-1",
    "--space-2",
    "--space-3",
    "--space-4",
    "--stroke-1",
    "--text-lg",
    "--tracking-wide",
    "--weight-bold",
    "--weight-medium",
    "--weight-semibold"
  ],
  "hasScript": false,
  "hasDocsPage": true
}
```

## Source Content

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
  - "Hardcoding the AI accent (e.g. #8B5CF6, --purple-*) instead of using --color-ai / --color-ai-subtle."
  - "Adding colored side borders to mark AI content; use the AI surface, icon/slug, and semantic tokens instead."
  - "Animating the typing dots or skeleton manually; the pattern ships keyframes + reduced-motion fallbacks."

tokenPolicy:
  allowed:
    - "Semantic tokens: --color-ai, --color-ai-hover, --color-ai-subtle, --color-on-ai, --color-text, --color-text-muted, --color-surface-raised, --color-surface-sunken, --color-fill, --color-border-muted, --color-success, --color-warning, --color-danger."
    - "Layout / type tokens: --space-*, --radius-*, --stroke-1, --body-size, --caption-size, --caption-sm-size, --label-size, --leading-relaxed, --weight-medium, --weight-semibold, --weight-bold."
    - "Motion tokens: --duration-tactile, --duration-state, --ease-enter."
    - "Size tokens for the send button and action chrome: --size-sm, --size-md, --text-lg."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code or inside the pattern CSS."
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


/* ============================================
   RenDS — Carbon for AI Patterns
   ============================================
   Design patterns for AI-generated content.
   Inspired by IBM Carbon for AI.

   Components:
   - AI Message bubble (streaming + complete)
   - AI Typing indicator
   - AI Citation / Source reference
   - AI Confidence indicator
   - AI Regenerate action
   - AI Prompt input
   - AI Slug (inline AI label)

   All CSS-only where possible, minimal JS for
   streaming text animation.
   ============================================ */

/* ═══════════════════════════════════════════════
   AI SLUG — Inline "AI" label
   ═══════════════════════════════════════════════ */
.ren-ai-slug {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-0-5) var(--space-2);
  font-size: var(--caption-sm-size);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-ai);
  background: color-mix(in srgb, var(--color-ai) 10%, transparent);
  border-radius: var(--radius-sm);
  line-height: 1;
}

.ren-ai-slug::before {
  content: '✦';
  font-size: 0.75em;
}

/* ═══════════════════════════════════════════════
   AI MESSAGE — Chat bubble for AI responses
   ═══════════════════════════════════════════════ */
.ren-ai-message {
  position: relative;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-ai-subtle) 70%, var(--color-surface-raised));
  border: var(--stroke-1) solid var(--color-border);
  line-height: var(--leading-relaxed);
}

.ren-ai-message-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  font-size: var(--label-size);
}

.ren-ai-message-content {
  font-size: var(--body-size);
  color: var(--color-text);
}

.ren-ai-message-content p:last-child {
  margin-bottom: 0;
}

.ren-ai-message-footer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: var(--stroke-1) solid var(--color-border-muted);
  font-size: var(--caption-size);
  color: var(--color-text-muted);
}

/* ═══════════════════════════════════════════════
   AI STREAMING — Typing animation
   ═══════════════════════════════════════════════ */
.ren-ai-streaming .ren-ai-message-content::after {
  content: '▊';
  display: inline;
  animation: ren-ai-blink 0.8s step-end infinite;
  color: var(--color-ai);
  margin-inline-start: 1px;
}

@keyframes ren-ai-blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ren-ai-streaming .ren-ai-message-content::after {
    animation: none;
    opacity: 0.7;
  }
}

/* ═══════════════════════════════════════════════
   AI TYPING INDICATOR — "AI is thinking..."
   ═══════════════════════════════════════════════ */
.ren-ai-typing {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: var(--caption-size);
  color: var(--color-text-muted);
}

.ren-ai-typing-dots {
  display: inline-flex;
  gap: 3px;
}

.ren-ai-typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-ai);
  animation: ren-ai-dot-bounce 1.4s ease-in-out infinite;
}

.ren-ai-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.ren-ai-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes ren-ai-dot-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40%           { transform: translateY(-4px); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .ren-ai-typing-dots span {
    animation: ren-ai-dot-fade 1.4s ease-in-out infinite;
  }
  @keyframes ren-ai-dot-fade {
    0%, 80%, 100% { opacity: 0.3; }
    40%           { opacity: 1; }
  }
}

/* ═══════════════════════════════════════════════
   AI CITATION — Source reference
   ═══════════════════════════════════════════════ */
.ren-ai-citation {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-0-5) var(--space-2);
  font-size: var(--caption-sm-size);
  font-weight: var(--weight-medium);
  color: var(--color-ai);
  background: color-mix(in srgb, var(--color-ai) 8%, transparent);
  border-radius: var(--radius-sm);
  text-decoration: none;
  cursor: pointer;
  transition: background var(--duration-tactile) var(--ease-enter);
  vertical-align: super;
  line-height: 1;
}

.ren-ai-citation:hover {
  background: color-mix(in srgb, var(--color-ai) 14%, transparent);
}

/* Citation list at bottom of message */
.ren-ai-sources {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: var(--stroke-1) solid var(--color-border-muted);
}

.ren-ai-source {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  font-size: var(--caption-size);
  text-decoration: none;
  color: var(--color-text);
  transition: background var(--duration-tactile) var(--ease-enter);
}

.ren-ai-source:hover {
  background: var(--color-fill);
}

.ren-ai-source-number {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--caption-sm-size);
  font-weight: var(--weight-bold);
  color: var(--color-ai);
  background: color-mix(in srgb, var(--color-ai) 10%, transparent);
  border-radius: var(--radius-sm);
}

.ren-ai-source-title {
  font-weight: var(--weight-medium);
}

.ren-ai-source-url {
  color: var(--color-text-muted);
  font-size: var(--caption-sm-size);
}

/* ═══════════════════════════════════════════════
   AI CONFIDENCE — Certainty indicator
   ═══════════════════════════════════════════════ */
.ren-ai-confidence {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--caption-size);
  color: var(--color-text-muted);
}

.ren-ai-confidence-bar {
  width: 3rem;
  height: 4px;
  border-radius: var(--radius-full);
  background: var(--color-fill);
  overflow: hidden;
}

.ren-ai-confidence-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--duration-state) var(--ease-enter);
}

.ren-ai-confidence[data-level="high"] .ren-ai-confidence-fill {
  width: 100%;
  background: var(--color-success);
}

.ren-ai-confidence[data-level="medium"] .ren-ai-confidence-fill {
  width: 66%;
  background: var(--color-warning);
}

.ren-ai-confidence[data-level="low"] .ren-ai-confidence-fill {
  width: 33%;
  background: var(--color-danger);
}

/* ═══════════════════════════════════════════════
   AI ACTIONS — Regenerate, Copy, Feedback
   ═══════════════════════════════════════════════ */
.ren-ai-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.ren-ai-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  font-size: var(--caption-size);
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--duration-tactile) var(--ease-enter);
  min-height: var(--size-sm);
}

.ren-ai-action:hover {
  color: var(--color-text);
  background: var(--color-fill);
}

.ren-ai-action:active {
  transform: scale(0.95);
}

.ren-ai-action[data-active="true"] {
  color: var(--color-ai);
}

/* Feedback buttons (thumbs up/down) */
.ren-ai-action-thumbs {
  display: inline-flex;
  gap: 0;
  border: var(--stroke-1) solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.ren-ai-action-thumbs .ren-ai-action {
  border-radius: 0;
  padding: var(--space-1) var(--space-2);
}

.ren-ai-action-thumbs .ren-ai-action + .ren-ai-action {
  border-inline-start: var(--stroke-1) solid var(--color-border);
}

/* ═══════════════════════════════════════════════
   AI PROMPT INPUT — Chat-style input
   ═══════════════════════════════════════════════ */
.ren-ai-prompt {
  display: flex;
  align-items: flex-end;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: var(--stroke-1) solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  transition: border-color var(--duration-tactile) var(--ease-enter);
}

.ren-ai-prompt:focus-within {
  border-color: var(--color-ai);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-ai) 15%, transparent);
}

.ren-ai-prompt-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: var(--body-size);
  color: var(--color-text);
  resize: none;
  outline: none;
  min-height: 1.5rem;
  max-height: 8rem;
  field-sizing: content;
  line-height: var(--leading-normal);
}

.ren-ai-prompt-input::placeholder {
  color: var(--color-text-muted);
}

.ren-ai-prompt-send {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size-md);
  height: var(--size-md);
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-ai);
  color: var(--color-on-ai);
  cursor: pointer;
  transition: all var(--duration-tactile) var(--ease-enter);
  font-size: var(--text-lg);
}

.ren-ai-prompt-send:hover {
  background: var(--color-ai-hover);
  transform: scale(1.05);
}

.ren-ai-prompt-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}

/* ═══════════════════════════════════════════════
   AI SKELETON — Loading placeholder for AI
   ═══════════════════════════════════════════════ */
.ren-ai-skeleton {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-ai-subtle) 55%, var(--color-surface-raised));
  border: var(--stroke-1) solid var(--color-border-muted);
}

.ren-ai-skeleton-line {
  height: 0.875rem;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--color-fill) 25%,
    color-mix(in srgb, var(--color-ai) 6%, var(--color-fill)) 50%,
    var(--color-fill) 75%
  );
  background-size: 200% 100%;
  animation: ren-ai-shimmer 1.5s ease-in-out infinite;
}

.ren-ai-skeleton-line + .ren-ai-skeleton-line {
  margin-top: var(--space-2);
}

.ren-ai-skeleton-line:last-child {
  width: 60%;
}

@keyframes ren-ai-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .ren-ai-skeleton-line {
    animation: none;
  }
}

/* ═══════════════════════════════════════════════
   AI ERROR — Message failure state
   ═══════════════════════════════════════════════ */
.ren-ai-error {
  position: relative;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-danger) 6%, var(--color-surface-raised));
  border: var(--stroke-1) solid color-mix(in srgb, var(--color-danger) 30%, transparent);
  display: grid;
  gap: var(--space-2);
}

.ren-ai-error-message {
  color: var(--color-text);
  font-size: var(--body-size);
  line-height: 1.5;
}

.ren-ai-error-message::before {
  content: '⚠ ';
  color: var(--color-danger);
  margin-inline-end: var(--space-1);
}

/* ═══════════════════════════════════════════════
   AI ACTION VARIANTS — Regenerate, edit-and-resend
   These extend the existing .ren-ai-action base.
   ═══════════════════════════════════════════════ */
.ren-ai-action-regenerate::before {
  content: '↻';
  margin-inline-end: var(--space-1);
  font-size: 1.1em;
  display: inline-block;
  /* Subtle hint that this re-runs inference */
  transition: transform var(--duration-state, 200ms) var(--ease-enter, ease);
}

.ren-ai-action-regenerate:hover::before {
  transform: rotate(-45deg);
}

.ren-ai-action-edit::before {
  content: '✎';
  margin-inline-end: var(--space-1);
  font-size: 1.05em;
}

@media (prefers-reduced-motion: reduce) {
  .ren-ai-action-regenerate::before {
    transition: none;
  }
}

/* ═══════════════════════════════════════════════
   AI FILE CHIP — Uploaded file reference
   Compact pill showing a file the user attached,
   with icon, name, size, and remove affordance.
   ═══════════════════════════════════════════════ */
.ren-ai-file-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: var(--color-surface-raised);
  border: var(--stroke-1) solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--caption-size);
  max-width: 220px;
}

.ren-ai-file-chip-icon {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  color: var(--color-text-muted);
  display: grid;
  place-items: center;
}

.ren-ai-file-chip-name {
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text);
  font-weight: var(--weight-medium);
}

.ren-ai-file-chip-size {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: var(--caption-sm-size);
}

.ren-ai-file-chip-remove {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  display: grid;
  place-items: center;
  border: 0;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}

.ren-ai-file-chip-remove:hover,
.ren-ai-file-chip-remove:focus-visible {
  background: var(--color-fill);
  color: var(--color-text);
}

.ren-ai-file-chip-remove:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* ═══════════════════════════════════════════════
   AI TOOL CALL — Model invoking a tool / function
   Collapsible block built on native <details>
   so JS is optional. Status via data-status.
   ═══════════════════════════════════════════════ */
.ren-ai-tool-call {
  border: var(--stroke-1) solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-raised);
  margin-block: var(--space-2);
  overflow: hidden;
}

.ren-ai-tool-call-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-surface-sunken);
  font-size: var(--caption-size);
  font-weight: var(--weight-medium);
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
  list-style: none;
}

.ren-ai-tool-call-header::-webkit-details-marker { display: none; }

.ren-ai-tool-call-header::before {
  content: '▸';
  font-size: 0.75em;
  color: var(--color-text-muted);
  transition: transform var(--duration-state, 200ms) var(--ease-enter, ease);
}

.ren-ai-tool-call[open] > .ren-ai-tool-call-header::before {
  transform: rotate(90deg);
}

@media (prefers-reduced-motion: reduce) {
  .ren-ai-tool-call-header::before {
    transition: none;
  }
}

.ren-ai-tool-call-name {
  font-family: var(--font-mono);
  color: var(--color-text);
}

.ren-ai-tool-call-status {
  margin-inline-start: auto;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--caption-sm-size);
  font-weight: var(--weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: var(--stroke-1) solid transparent;
}

.ren-ai-tool-call[data-status="pending"] .ren-ai-tool-call-status {
  color: var(--color-text-muted);
  background: var(--color-fill);
}

.ren-ai-tool-call[data-status="running"] .ren-ai-tool-call-status {
  color: var(--color-warning);
  background: color-mix(in srgb, var(--color-warning) 15%, transparent);
}

.ren-ai-tool-call[data-status="success"] .ren-ai-tool-call-status {
  color: var(--color-success);
  background: color-mix(in srgb, var(--color-success) 15%, transparent);
}

.ren-ai-tool-call[data-status="error"] .ren-ai-tool-call-status {
  color: var(--color-danger);
  background: color-mix(in srgb, var(--color-danger) 15%, transparent);
}

.ren-ai-tool-call-args,
.ren-ai-tool-call-result {
  padding: var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--caption-size);
  line-height: 1.5;
  color: var(--color-text-secondary);
  white-space: pre-wrap;
  overflow-x: auto;
}

.ren-ai-tool-call-args {
  border-bottom: var(--stroke-1) solid var(--color-border-muted);
}

.ren-ai-tool-call-result {
  background: var(--color-surface);
}

.ren-ai-tool-call[data-status="error"] .ren-ai-tool-call-result {
  background: color-mix(in srgb, var(--color-danger) 4%, var(--color-surface));
  color: var(--color-text);
}
