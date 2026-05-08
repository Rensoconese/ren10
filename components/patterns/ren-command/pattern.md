# ren-command Pattern Contract

Command palette pattern for searchable application actions.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-command` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-command` pattern.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Command pattern behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this pattern.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## Required Imports

```html
<link rel="stylesheet" href="rends/components/patterns/ren-command/ren-command.css">
<script type="module" src="rends/components/patterns/ren-command/ren-command.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-command">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-command`
- `.ren-command-empty`
- `.ren-command-footer`
- `.ren-command-footer-hint`
- `.ren-command-group`
- `.ren-command-group-heading`
- `.ren-command-input`
- `.ren-command-input-wrapper`
- `.ren-command-item`
- `.ren-command-item-content`
- `.ren-command-item-description`
- `.ren-command-item-icon`
- `.ren-command-item-shortcut`
- `.ren-command-item-title`
- `.ren-command-kbd`
- `.ren-command-list`
- `.ren-command-separator`

## States And Attributes

- `[aria-disabled]`
- `[aria-live]`
- `[data-empty]`
- `[data-highlighted]`
- `:active`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-command-bg`
- `--ren-command-border`
- `--ren-command-item-height`
- `--ren-command-item-radius`
- `--ren-command-max-height`
- `--ren-command-radius`
- `--ren-command-shadow`
- `--ren-command-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/patterns/ren-command/ren-command.css`
- `components/patterns/ren-command/ren-command.js`
- `docs/components/ren-command.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
