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
- `.ren-ai-action-thumbs`
- `.ren-ai-actions`
- `.ren-ai-citation`
- `.ren-ai-confidence`
- `.ren-ai-confidence-bar`
- `.ren-ai-confidence-fill`
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
- `.ren-ai-typing`
- `...and 1 more in the source files.`

## States And Attributes

- `[data-active]`
- `[data-level]`
- `:active`
- `:disabled`
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
