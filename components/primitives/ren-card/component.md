# ren-card

Container primitive for grouped content with header, body, footer, status,
and interactive (clickable / selectable) variants.

Load this file after `ren-design.md` and before generating, editing, or
reviewing any `.ren-card` UI.

## Purpose

Owns the shape, padding, surface, and border of grouped content. Provides
slots (`-header`, `-body`, `-footer`) and a small set of variants
(`-elevated`, `-outline`, `-sunken`, `-ghost`, `-simple`,
`-interactive`, `-selectable`) plus a status hook (`[data-status]`).
Card never owns inputs, dialogs, or navigation behavior — it is a passive
container.

## Use When

- A group of related content needs its own surface separated from the page.
- A list of repeating items would benefit from a consistent card grid
  (`ren-grid` + `ren-card`).
- A tile must be clickable or selectable as a whole (use
  `.ren-card-interactive` or `.ren-card-selectable`).
- A surface needs a header / body / footer layout already proven by RenDS.

## Do Not Use When

- The container is just a layout primitive — use `ren-stack`, `ren-cluster`,
  `ren-grid`, etc.
- The container is a modal — use `ren-dialog`.
- The container is a popover / tooltip / menu — use those composites.
- You need an alert / banner / call-out — use `ren-banner`.
- You need a form section — use `ren-form` + `ren-field` directly.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "You want a visually grouped surface (border / shadow / radius) with predictable spacing."
    - "You need a card grid (stat tiles, product cards, list items)."
    - "You need a whole-card click target (.ren-card-interactive) or selection (.ren-card-selectable)."
    - "You need a status accent driven by [data-status]."
  avoidWhen:
    - "You only need vertical spacing — use ren-stack."
    - "You need overlay behavior — use ren-dialog / ren-popover / ren-sheet."
    - "You need a banner / alert message — use ren-banner."
    - "You need a navigation list with hover / active — use ren-sidebar items."

canonicalImports:
  css:
    - "rends/components/primitives/ren-card/ren-card.css"
  notes:
    - "Card is CSS-only. There is no <ren-card> custom element."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "A single .ren-card root wrapping any number of .ren-card-header, .ren-card-body, .ren-card-footer."
  - ".ren-card-title is the heading; use a real <h*> element inside it for outline / a11y."
  - "Selectable cards must wire aria-selected (or [data-selected]) AND a keyboard handler — the class only styles."
  - "Interactive cards (whole-card click) should wrap content in a real <a> or <button>, not a div with onclick."

forbiddenPatterns:
  - "Nesting another .ren-card inside .ren-card-body — flatten the structure."
  - "Replacing internal .ren-card-* selectors with custom classes for theming — use --ren-card-* tokens."
  - "Hardcoded shadow / radius values overriding card defaults; theme through tokens."

tokenPolicy:
  allowed:
    - "Component tokens: every --ren-card-* listed in Public Token API."
    - "Semantic tokens for content inside the card (--color-text, --color-text-muted, etc.)."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, etc.) in consumer code."
    - "Hardcoded hex / rgb colors in consumer overrides."

accessibility:
  required:
    - "Card titles use real heading elements (<h2>, <h3>) — never style a <div> as a heading."
    - "Whole-card click targets must use <a> or <button> wrappers and respect tab order / focus rings."
    - "Selectable cards announce state via aria-selected + data-selected; pair with keyboard activation."
    - "[data-status] is decorative; pair it with meaningful text or icons, not color alone."
```

## Required CSS / JS Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-card/ren-card.css">
<!-- No JS — card is CSS-only. -->
```

## Canonical Markup

Static card with header + body:

```html
<article class="ren-card">
  <div class="ren-card-header">
    <h3 class="ren-card-title">Project status</h3>
    <p class="ren-card-description">Updated 2 minutes ago.</p>
  </div>
  <div class="ren-card-body">
    <p>All checks passing.</p>
  </div>
</article>
```

Interactive (whole-card click) with link wrapper:

```html
<a class="ren-card ren-card-interactive" href="/projects/atlas">
  <div class="ren-card-header">
    <h3 class="ren-card-title">Atlas</h3>
  </div>
  <div class="ren-card-body">42 open issues</div>
</a>
```

Selectable in a grid:

```html
<div class="ren-grid-3">
  <button class="ren-card ren-card-selectable" type="button" aria-pressed="false">
    <span class="ren-card-title">Hobby</span>
    <span class="ren-card-description">$0/mo</span>
  </button>
</div>
```

## Variants

| Class                   | Role                                      |
|-------------------------|-------------------------------------------|
| `.ren-card`             | Default surface.                          |
| `.ren-card-elevated`    | Adds shadow.                              |
| `.ren-card-outline`     | Border-only, transparent fill.            |
| `.ren-card-sunken`      | Inset surface (sunken background).        |
| `.ren-card-ghost`       | No surface; spacing only.                 |
| `.ren-card-simple`      | Reduced padding for dense lists.          |
| `.ren-card-interactive` | Hover / focus styles for clickable cards. |
| `.ren-card-selectable`  | Toggleable card; pair with `aria-selected`. |
| `.ren-card-cover`       | Edge-to-edge media slot at the top.       |
| `.ren-card-group`       | Joined sibling cards with shared borders. |
| `.ren-card-footer-border` | Footer with top divider.                |

## States

| Selector / attr        | Meaning                                     |
|------------------------|---------------------------------------------|
| `:hover` / `:active`   | Pointer interaction (interactive cards).    |
| `:focus-visible`       | Keyboard focus ring (interactive cards).    |
| `[aria-selected="true"]` / `[data-selected]` | Selection state.       |
| `[data-status="success" / "warning" / "danger" / "info"]` | Status accent. |

## Public Token API

- `--ren-card-bg`
- `--ren-card-border-color`
- `--ren-card-border-width`
- `--ren-card-radius`
- `--ren-card-padding`
- `--ren-card-gap`
- `--ren-card-header-gap`
- `--ren-card-shadow`

## Accessibility Contract

- Card titles are real `<h*>` elements; never style a `<div>` as a heading.
- Whole-card clickability wraps the entire card in a real `<a>` or `<button>`.
- Selectable cards must expose `aria-selected` (or `aria-pressed`) plus a
  visible focus ring via `:focus-visible`.
- `[data-status]` is decorative; status meaning must be carried by text or
  icons too.

## Anti-Patterns

- ❌ `<div class="ren-card" onclick="...">` — wrap with a real link / button.
- ❌ Nesting `.ren-card` inside `.ren-card-body`.
- ❌ Inline hex colors on `.ren-card { background: #FFFFFF; }` — override
  `--ren-card-bg` on the parent scope.
- ❌ Replacing built-in selectors (`.ren-card-title`) with custom classes
  for theming — theme through component tokens.

## Related Files

- `components/primitives/ren-card/ren-card.css`
- `docs/components/ren-card.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, ARIA, or states change.
- Run `npm run lint` after token / selector changes.
- Manually verify light/dark themes when surface, border, or shadow values
  change.
