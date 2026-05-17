# ren-menubar Pattern Contract

Application menubar pattern for top-level menu navigation.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-menubar` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-menubar` pattern.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Menubar pattern behavior or visual role.
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
    - "The UI is a desktop-style application menubar with persistent top-level menus (File / Edit / View / Help)."
    - "You need WAI-ARIA Menubar semantics: role=\"menubar\", role=\"menu\", role=\"menuitem|menuitemcheckbox|menuitemradio\"."
    - "You need keyboard navigation (Arrow keys, Enter, Space, Escape, Home, End) with roving focus and \"menubar glide\" between triggers."
    - "You need typeahead character matching for fast item selection."
    - "You need checkbox / radio menu items (.ren-menubar-checkbox, .ren-menubar-radio) with aria-checked state."
    - "You need nested submenus with chevron and lateral keyboard navigation."
  avoidWhen:
    - "The nav is a horizontal site bar (Home / About / Pricing) — use ren-nav."
    - "It is a single dropdown / context menu — use ren-menu or ren-popover."
    - "It is a side rail with sections — use ren-sidebar."
    - "It is a Ctrl+K searchable launcher — use ren-command."

canonicalImports:
  css:
    - "rends/components/patterns/ren-menubar/ren-menubar.css"
  js:
    - "rends/components/patterns/ren-menubar/ren-menubar.js"
  notes:
    - "JS owns the keyboard model, roving focus, submenu opening, and ren-menubar-select event. CSS-only fallback only renders static chrome."
    - "Custom element registers as <ren-menubar>; menus are toggled via the [hidden] attribute on .ren-menubar-menu."

requiredMarkup:
  - "Root is <ren-menubar> wrapping <div class=\"ren-menubar\" role=\"menubar\">."
  - "Each top-level menu uses <button class=\"ren-menubar-trigger\" aria-haspopup=\"menu\" aria-expanded=\"false\"> + a sibling <div class=\"ren-menubar-menu\" role=\"menu\" hidden>."
  - "Each item is a <button class=\"ren-menubar-item\" role=\"menuitem\"> (or role=\"menuitemcheckbox|menuitemradio\" for stateful variants)."
  - "Checkbox / radio items carry aria-checked=\"true|false\"; the ::before pseudo renders the check / dot — do not hand-draw it."
  - "Separators are <div class=\"ren-menubar-separator\" role=\"separator\">; submenu chevrons are added automatically by .ren-menubar-submenu::after."
  - "Keyboard shortcuts shown via <span class=\"ren-menubar-shortcut\">⌘N</span>; mirror with a real document-level keydown handler."

forbiddenPatterns:
  - "Building from <a> tags — items must be <button> so Space activates them."
  - "Hiding menus with display: none from external code — toggle the [hidden] attribute; the component owns animation states."
  - "Setting aria-expanded manually from consumer code — the menubar JS manages it on the trigger."
  - "Wrapping items in <li> without role=\"none\" parent — keep the menu role tree flat or wrap with role=\"none\"."
  - "Reimplementing keyboard navigation; the component already handles arrows, typeahead, Home/End, and Escape."

tokenPolicy:
  allowed:
    - "Semantic surface / text tokens: --color-surface, --color-surface-raised, --color-border, --color-separator, --color-text, --color-text-muted, --color-fill-hover, --color-fill-active, --color-accent, --color-on-accent."
    - "Spacing / radius / shadow tokens: --space-1, --space-2, --space-3, --radius-sm, --radius-md, --shadow-lg."
    - "Type tokens: --body-size, --label-size, --label-weight, --caption-size."
    - "Motion tokens: --duration-tactile, --duration-exit, --ease-enter."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / named colors for hover, active, or accent."
    - "Replacing the focus outline color with anything other than --color-accent."

accessibility:
  required:
    - "Container has role=\"menubar\" and each <button> is a real menuitem with role=\"menuitem|menuitemcheckbox|menuitemradio\"."
    - "Triggers expose aria-haspopup=\"menu\" and aria-expanded reflects the open/closed state of the associated menu."
    - "Roving tabindex: only one focusable item at a time; arrow keys move focus. The component manages this — do not set tabindex manually on every item."
    - "Checkbox / radio items expose aria-checked; the visual check (::before) must not be the only state cue."
    - "Disabled items use [data-disabled] AND pointer-events: none (CSS handles the latter)."
    - "Focus-visible outline uses --color-accent — never strip without restoring a visible alternative."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/patterns/ren-menubar/ren-menubar.css">
<script type="module" src="rends/components/patterns/ren-menubar/ren-menubar.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-menubar">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-menubar`
- `.ren-menubar-checkbox`
- `.ren-menubar-item`
- `.ren-menubar-label`
- `.ren-menubar-menu`
- `.ren-menubar-radio`
- `.ren-menubar-separator`
- `.ren-menubar-shortcut`
- `.ren-menubar-submenu`
- `.ren-menubar-trigger`

## States And Attributes

- `[aria-checked]`
- `[aria-expanded]`
- `[data-disabled]`
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
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/patterns/ren-menubar/ren-menubar.css`
- `components/patterns/ren-menubar/ren-menubar.js`
- `docs/components/ren-menubar.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
