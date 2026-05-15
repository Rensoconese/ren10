# ren-link Component Contract

Accessible link styling for inline, muted, nav, external, and skip links.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-link` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-link` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Link primitive behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this primitive.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "The element navigates to a URL, anchor, or routed page (i.e., it has a real href)."
    - "You need inline text links inside paragraphs styled with underline + hover."
    - "You need a navigation link with a 44px touch target (.ren-link-nav) plus active-route styling via aria-current=\"page\" / [data-active]."
    - "You need an external-link affordance with a trailing ↗ marker (.ren-link-external)."
    - "You need a skip-to-content link that becomes visible only on focus (.ren-link-skip)."
    - "You need a muted or unstyled (inherits color) anchor (.ren-link-muted, .ren-link-plain)."
  avoidWhen:
    - "The element triggers an imperative action (submit, open dialog, delete) — use ren-button."
    - "The element is a tab, menuitem, or pagination control — use the corresponding component."
    - "The element is a stateful toggle — use a switch, checkbox, or button with aria-pressed."

canonicalImports:
  css:
    - "rends/components/primitives/ren-link/ren-link.css"
  notes:
    - "CSS-only primitive; no JavaScript file exists for ren-link."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Always render an actual <a href=\"...\"> element. Never style a <button> or <span> as a link."
  - "External links should set rel=\"noopener noreferrer\" and target=\"_blank\" alongside .ren-link-external when opening in a new tab."
  - "Nav links representing the current page set aria-current=\"page\" (or data-active for non-routing states) on the <a>."
  - "Skip links (.ren-link-skip) must be the first focusable element in <body> and reference a real target id (e.g., href=\"#main\")."
  - "The trailing ↗ on .ren-link-external is decorative content — never use it as the only signal that a link opens externally; provide aria-label or visually-hidden text for screen readers if needed."

forbiddenPatterns:
  - "<button class=\"ren-link\"> — use a real <a> with an href."
  - "<a class=\"ren-link\" onclick=\"...\"> without an href — non-focusable, breaks keyboard activation."
  - "Removing the focus ring (outline: none) without restoring a visible :focus-visible style."
  - "Hardcoded color overrides like style=\"color:#0066cc\" — use --ren-link-color / --color-text-link."
  - "Using .ren-link-nav for inline prose links; it expects flex layout and a 44px hit area."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-link-color, --ren-link-font-weight, --ren-link-hover-color, --ren-link-underline."
    - "Semantic tokens: --color-text-link, --color-text-link-hover, --color-text, --color-text-muted, --color-accent, --color-accent-subtle, --color-on-accent, --color-focus-ring, --color-fill."
    - "Layout / motion tokens: --space-*, --radius-sm, --radius-md, --touch-min, --ring-width, --duration-tactile, --ease-enter."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors in consumer overrides."
    - "Custom underline colors via text-decoration shorthand that bypass --ren-link-underline."

accessibility:
  required:
    - "Real <a href> semantics; never simulate a link with a div + onclick."
    - "Visible :focus-visible ring driven by --color-focus-ring and --ring-width."
    - ".ren-link-nav guarantees a 44px touch target via min-height: var(--touch-min)."
    - "The current navigation item must set aria-current=\"page\" so screen readers announce route position."
    - "Skip links must be reachable as the first Tab stop and become visually focused via .ren-link-skip:focus."
    - "External-link ↗ glyph is a visual hint only; do not rely on it for assistive-tech announcement."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-link/ren-link.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-link">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-link`
- `.ren-link-external`
- `.ren-link-muted`
- `.ren-link-nav`
- `.ren-link-plain`
- `.ren-link-skip`

## States And Attributes

- `[aria-current]`
- `[data-active]`
- `:active`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-link-color`
- `--ren-link-font-weight`
- `--ren-link-hover-color`
- `--ren-link-underline`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-link/ren-link.css`
- `docs/components/ren-link.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
