# ren-nav Pattern Contract

Navigation pattern for responsive site/app nav and active states.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-nav` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-nav` pattern.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Nav pattern behavior or visual role.
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
    - "The product needs a horizontal site / app top navigation bar (brand + links + actions)."
    - "The nav must collapse to a hamburger menu below 48rem (768px) with an animated <span>-stripe toggle."
    - "Active route should be reflected via aria-current=\"page\" (or the .active class) on a .ren-nav-link."
    - "You need optional sticky-on-scroll behavior with a translucent backdrop blur (.ren-nav-sticky)."
    - "You need a transparent variant for hero sections (.ren-nav-transparent)."
    - "You need top-level dropdown menus inside the nav using the native [popover] API (.ren-nav-dropdown)."
  avoidWhen:
    - "The nav is a persistent left/right rail — use ren-sidebar."
    - "The UI is a desktop-style application menubar (File / Edit / View) — use ren-menubar."
    - "The disclosure is a one-off dropdown unrelated to site nav — use ren-menu or ren-popover."
    - "The nav lives inside a card or pattern as secondary tabs — use ren-tabs."

canonicalImports:
  css:
    - "rends/components/patterns/ren-nav/ren-nav.css"
  js:
    - "rends/components/patterns/ren-nav/ren-nav.js"
  notes:
    - "JS registers <ren-nav> and owns the mobile toggle, Escape-to-close, resize handler, and popover-based dropdowns."
    - "CSS-only fallback renders the desktop layout; mobile menu requires JS to toggle [aria-expanded] on .ren-nav-toggle."

requiredMarkup:
  - "Wrap the bar in <ren-nav> containing a <nav class=\"ren-nav\" aria-label=\"…\">."
  - "Brand block uses <a class=\"ren-nav-brand\" href=\"/\"> with a logo + product name; it sits at the inline-start."
  - "Links live in <ul class=\"ren-nav-links\"> of <li><a class=\"ren-nav-link\" href=\"…\"></a></li>; active item adds aria-current=\"page\"."
  - "Mobile hamburger is <button class=\"ren-nav-toggle\" aria-expanded=\"false\" aria-controls=\"…\" aria-label=\"Toggle menu\"> with three <span> stripes inside."
  - "Action area (CTA buttons, theme toggle, sign-in) goes in <div class=\"ren-nav-actions\"> which floats to the inline-end via margin-inline-start: auto."
  - "Dropdowns use .ren-nav-dropdown wrapping a trigger <a class=\"ren-nav-link\" aria-expanded=\"false\" popovertarget=\"…\"> and a [popover] panel."

forbiddenPatterns:
  - "Using <div> stacks instead of <nav> + <ul>/<li> — landmarks and list semantics matter."
  - "Manually toggling display: none on .ren-nav-links for mobile — set [data-open] on .ren-nav or aria-expanded on .ren-nav-toggle."
  - "Styling links with ren-btn — sidebar / nav items own their own chrome via .ren-nav-link."
  - "Replacing the hamburger with a custom toggle that lacks aria-expanded / aria-controls."
  - "Hardcoding the sticky backdrop color — the .ren-nav-sticky variant already uses color-mix on --color-surface."

tokenPolicy:
  allowed:
    - "Public component tokens listed in Public Token API: --ren-nav-bg, --ren-nav-border, --ren-nav-gap, --ren-nav-height, --ren-nav-link-active, --ren-nav-link-color, --ren-nav-padding-x."
    - "Semantic tokens consumed by selectors: --color-surface, --color-border, --color-text, --color-text-muted, --color-accent, --color-accent-subtle, --color-fill (for sticky color-mix)."
    - "Spacing / radius tokens: --ren-space-1, --ren-space-2, --ren-space-3, --ren-space-4, --ren-title-sm-size, --ren-label-size."
    - "Motion tokens: --duration-overlay, --duration-state, --duration-route, --duration-enter, --ease-state-change, --ease-enter."
    - "Z-index token: --ren-z-sticky."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded hex / named colors for bg, border, active, or hover."
    - "Custom z-index values that bypass --ren-z-sticky for sticky mode."

accessibility:
  required:
    - "Root is a real <nav> with aria-label (e.g. \"Primary\") so screen readers can list landmarks."
    - "Active route uses aria-current=\"page\" (the .active class is a styling alias, not the source of truth)."
    - ".ren-nav-toggle has aria-expanded reflecting menu state, aria-controls pointing to the links list, and an aria-label (icon-only is not a name)."
    - "Mobile menu closes on Escape and on link activation (the component owns both behaviors)."
    - "Dropdown triggers expose aria-expanded; popover panels are real [popover] elements so the platform manages focus return."
    - "Focus-visible outlines use --color-accent at 2px offset — do not remove without a visible alternative."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/patterns/ren-nav/ren-nav.css">
<script type="module" src="rends/components/patterns/ren-nav/ren-nav.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-nav">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-nav`
- `.ren-nav-actions`
- `.ren-nav-brand`
- `.ren-nav-dropdown`
- `.ren-nav-link`
- `.ren-nav-links`
- `.ren-nav-sticky`
- `.ren-nav-toggle`
- `.ren-nav-transparent`

## States And Attributes

- `[aria-current]`
- `[aria-expanded]`
- `[data-dropdown]`
- `[data-open]`
- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-nav-bg`
- `--ren-nav-border`
- `--ren-nav-gap`
- `--ren-nav-height`
- `--ren-nav-link-active`
- `--ren-nav-link-color`
- `--ren-nav-padding-x`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/patterns/ren-nav/ren-nav.css`
- `components/patterns/ren-nav/ren-nav.js`
- `docs/components/ren-nav.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
