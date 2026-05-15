# ren-breadcrumb Component Contract

Hierarchical navigation trail built on native navigation/list semantics.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-breadcrumb` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-breadcrumb` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Breadcrumb primitive behavior or visual role.
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
    - "You need a hierarchical trail that shows the user's location within a site / app tree."
    - "The trail has 2+ ancestor levels and the final crumb represents the current page."
    - "You want native <nav> + <ol> semantics with the \"Breadcrumb\" landmark announcement."
    - "You need a customizable separator (default ›) via the --breadcrumb-separator custom property."
    - "Deep paths must collapse middle entries to an ellipsis via .ren-breadcrumb-truncated."
  avoidWhen:
    - "The navigation is the primary site nav — use ren-nav."
    - "The navigation is a tabbed page section — use ren-tabs."
    - "The navigation is a multi-step wizard — use ren-steps / ren-progress."
    - "You only need a single \"Back\" link — use ren-link with an arrow icon."

canonicalImports:
  css:
    - "rends/components/primitives/ren-breadcrumb/ren-breadcrumb.css"
  notes:
    - "CSS-only primitive — no colocated JS exists. Do not import a ren-breadcrumb.js."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Root must be <nav aria-label=\"Breadcrumb\" class=\"ren-breadcrumb\"> — the aria-label is what AT announces."
  - "Items are wrapped in an ordered list: <ol> with <li> children; do not use <ul> or plain <div>s."
  - "Each crumb is an <a href=\"...\"> except the current page, which uses aria-current=\"page\" and may stay as <a> (pointer-events disabled by CSS) or render as plain text."
  - "Separators are CSS-generated via ::before — never insert literal \"/\" or \"›\" characters as text nodes."
  - "Override the separator per-instance with inline style=\"--breadcrumb-separator: '/'\" — do not edit the CSS."

forbiddenPatterns:
  - "Using <div class=\"ren-breadcrumb\"> without <nav> — strips the landmark."
  - "Marking multiple crumbs with aria-current=\"page\" — only the final crumb is current."
  - "Inserting separator glyphs as text content inside <li> — the ::before pseudo handles it."
  - "Hardcoded font-size or color overrides via inline style — use the --ren-breadcrumb-* tokens."
  - "Wrapping crumb links in ren-link / ren-btn — breadcrumb owns its own link chrome."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-breadcrumb-active-color, --ren-breadcrumb-color, --ren-breadcrumb-font-size, --ren-breadcrumb-gap, --ren-breadcrumb-separator."
    - "Semantic tokens: --color-text, --color-text-muted, --color-text-faint, --color-focus-ring."
    - "Layout / motion tokens: --space-1, --radius-sm, --duration-tactile, --ease-enter, --ring-width, --caption-size, --text-sm."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors for link / current / separator styling."
    - "Overriding text-decoration with !important — let :hover and aria-current rules drive it."

accessibility:
  required:
    - "Root <nav> must carry aria-label=\"Breadcrumb\" (translated per locale) so AT announces the landmark."
    - "Current page crumb uses aria-current=\"page\"; CSS disables pointer-events but the semantic state is what matters for AT."
    - "Crumb links must have visible :focus-visible outline driven by --color-focus-ring and --ring-width."
    - "Separators are decorative (CSS ::before) so they are not announced — never put separator text in the DOM."
    - "When using .ren-breadcrumb-truncated, the hidden middle crumbs are display:none — ensure the ellipsis is purely decorative and provide a way to expand if the hidden context matters."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-breadcrumb/ren-breadcrumb.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-breadcrumb">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-breadcrumb`
- `.ren-breadcrumb-truncated`

## States And Attributes

- `[aria-current]`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-breadcrumb-active-color`
- `--ren-breadcrumb-color`
- `--ren-breadcrumb-font-size`
- `--ren-breadcrumb-gap`
- `--ren-breadcrumb-separator`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-breadcrumb/ren-breadcrumb.css`
- `docs/components/ren-breadcrumb.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
