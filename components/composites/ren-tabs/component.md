# ren-tabs Component Contract

Tabbed interface with trigger list and panels.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-tabs` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-tabs` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Tabs composite behavior or visual role.
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
    - "You need a tablist that shows one panel at a time with mutually exclusive triggers."
    - "You need ARIA tablist semantics (role=tablist, role=tab, role=tabpanel) plus arrow-key keyboard navigation."
    - "You need a default-value (index or tab id) to control which panel renders on first paint."
    - "You need manual activation (arrow moves focus, Enter/Space selects) or automatic activation (arrow selects)."
    - "You need a visual variant — .ren-tab-list-underline (default), .ren-tab-list-pills, or .ren-tab-list-enclosed."
    - "The layout must adapt to narrow widths via container query (horizontal scroll on the .ren-tab-list)."
  avoidWhen:
    - "Each section should be visible simultaneously — use ren-accordion (multiple) or simple sections."
    - "The control switches the entire page route, not in-page content — use ren-nav or anchor links."
    - "Only two states are needed — use ren-toggle-group with a single selection."
    - "You need a stepper/wizard with sequential progress — use ren-stepper."

canonicalImports:
  css:
    - "rends/components/composites/ren-tabs/ren-tabs.css"
  js:
    - "rends/components/composites/ren-tabs/ren-tabs.js"
  notes:
    - "JS is required: it sets up roving tabindex, ARIA wiring, and the ren-tab-change event. CSS-only renders triggers but not the selection state."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "<ren-tabs> wraps a <div role=\"tablist\" class=\"ren-tab-list\"> followed by sibling <div role=\"tabpanel\" class=\"ren-tab-panel\"> elements."
  - "Each tab trigger is a real <button role=\"tab\" class=\"ren-tab\">; never use <a> or <div> for the trigger."
  - "Tab triggers and tabpanels must match 1:1 in document order; the component pairs them by index."
  - "Inactive panels carry the hidden attribute (the component toggles it); do not use display: none manually."
  - "Provide aria-label on <ren-tabs> when there are multiple tablists on the page, so screen-readers can distinguish them."

forbiddenPatterns:
  - "Wrapping a <a href> as the tab trigger — tabs change the visible panel, they are not navigation links."
  - "Setting aria-selected manually on a tab; let the component drive it via _selectedIndex."
  - "Hiding inactive panels with display: none in CSS overrides — use the hidden attribute the JS manages."
  - "Adding interactive elements (buttons, links) directly inside .ren-tab — keep the trigger a single activation surface."
  - "Removing the .ren-tab:focus-visible outline without restoring a visible focus indicator inside the inset offset."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-tabs-active-color, --ren-tabs-border-color, --ren-tabs-color, --ren-tabs-duration, --ren-tabs-easing, --ren-tabs-font-size, --ren-tabs-font-weight, --ren-tabs-gap, --ren-tabs-height, --ren-tabs-indicator-color."
    - "Semantic tokens: --color-text, --color-text-muted, --color-accent, --color-border, --color-fill, --color-fill-hover, --color-surface."
    - "Shape / motion tokens: --radius-sm, --radius-md, --space-*, --size-lg, --label-md-size, --label-md-weight, --label-lg-weight, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / rgb / named color values in overrides for the active underline or pill background."
    - "Hardcoded transition durations on the .ren-tab hover; route through --transition-tactile."

accessibility:
  required:
    - "Triggers are real <button role=\"tab\"> with aria-selected reflecting state and tabindex managed by roving (only the selected tab is tabindex=0)."
    - "Tabpanels carry role=\"tabpanel\" and an aria-labelledby pointing at their trigger id (the component fills this in)."
    - "Arrow Left/Right (horizontal) or Up/Down (vertical) moves focus; Home / End jump to first / last; Enter / Space activate in manual mode."
    - "The .ren-tab meets touch target via min-height: var(--size-lg); do not shrink it below this in touch contexts."
    - "Active tab is distinguished by color AND the underline / pill / enclosed visual — never rely on color alone."
    - "Focus-visible ring is provided by outline + outline-offset on .ren-tab and the panel; preserve both."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-tabs/ren-tabs.css">
<script type="module" src="rends/components/composites/ren-tabs/ren-tabs.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-tabs">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-tab`
- `.ren-tab-list`
- `.ren-tab-list-enclosed`
- `.ren-tab-list-pills`
- `.ren-tab-list-underline`
- `.ren-tab-panel`
- `.ren-tabs`

## States And Attributes

- `[aria-disabled]`
- `[aria-selected]`
- `:disabled`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-tabs-active-color`
- `--ren-tabs-border-color`
- `--ren-tabs-color`
- `--ren-tabs-duration`
- `--ren-tabs-easing`
- `--ren-tabs-font-size`
- `--ren-tabs-font-weight`
- `--ren-tabs-gap`
- `--ren-tabs-height`
- `--ren-tabs-indicator-color`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-tabs/ren-tabs.css`
- `components/composites/ren-tabs/ren-tabs.js`
- `docs/components/ren-tabs.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
