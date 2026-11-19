# Migration guide

## 0.15.0 — overlay, keyboard and right-to-left corrections

Most of this release fixes behaviour that was broken, so most consumers only
need to upgrade and look at their overlays, date controls and sheets once.
Review these if you styled or scripted around the old behaviour:

- Anchored overlays (`ren-popover`, `ren-tooltip`, `ren-hover-card`,
  `ren-date-picker`, `ren-date-range-picker`, `ren-color-picker`) are
  `position: fixed` instead of `absolute`, so they flip by the room on screen
  on a scrolled page. Remove any override that set their `position`, and any
  workaround that scrolled or repositioned them by hand.
- `ren-popover`, `ren-tooltip`, `ren-hover-card`: the arrow follows the side
  the overlay actually landed on, exposed as `data-placed-side` while it is
  open. Custom arrow styles keyed on `data-side` alone point the wrong way
  after a flip; key them on `data-placed-side`.
- In a browser without CSS anchor positioning, all six anchored overlays are
  now placed next to their trigger by script, with inline `left` and `top`,
  and follow it while the page scrolls. Before, four of them opened in the
  top left corner. Remove local fallbacks that positioned them yourself.
- `<ren-calendar>` is a block-level card `--ren-calendar-width` wide (280px by
  default) wherever it is placed. In a plain block parent it used to stretch to
  the parent's width; set the token if you relied on that.
- `ren-date-picker`: the dropdown is 282px wide (was 334px) with the same day
  size as a standalone calendar. It opens on its value's month, with focus on
  the selected day or on today, and at 480px and below it is a full-width
  bottom sheet. Remove local padding or width fixes on the dropdown.
- `ren-date-range-picker`: the dropdown has the width of its two calendars and
  is a full-width sheet at 680px and below. Remove width workarounds.
- `ren-sheet`: `side="top"` and `side="bottom"` open on that edge and span the
  viewport whatever `size` is; sizes set the width of side sheets only.
  `side="left"` and `side="right"` are physical. Use `side="inline-start"` or
  `side="inline-end"` for a sheet that follows the text direction.
- `ren-color-picker`: `getValue()` and `ren-change` return the color that was
  set, not the nearest color of the picker's model (`#5b6cff` stays `#5b6cff`).
  `setValue()` updates what is shown and ignores a string that is not a color.
  A key press on a slider dispatches `ren-change` as well as `ren-input`. The
  current preset is marked `aria-current="true"`, not `aria-selected="true"`:
  update selectors that targeted the old attribute.
- `ren-select`: Tab closes the open list and leaves focus where it went.
  `close()` accepts `{ restoreFocus: false }`; the default is unchanged.
- `ren-menu`: an open menu is repositioned on scroll and resize.
- `ren-menubar`: panels no longer clip their content (submenus were invisible).
  The first and last items take the panel's corner radius instead. Re-check a
  custom panel that relied on `overflow: hidden`.
- `ren-sidebar`: the closed mobile drawer is `visibility: hidden`. Do not force
  it visible to animate it; the transition already keeps it shown while it
  slides.
- `ren-table`: every `.ren-th` is `position: relative` so each column holds its
  own resize handle.
- `ren-carousel`: slides are labelled "1 of 3" (was "Slide 1 of 3") and the
  fallback label is "Gallery". Update tests that matched the old names.
- The reset hides `input[type="hidden"]` with `display: none !important`.
  WebKit otherwise shows them as empty Tab stops under the classless field
  rule.
- `@ren10/astro`: the generated `Navigation` wrapper no longer puts
  `class="ren-nav"` on the `<ren-nav>` host. Target the inner
  `<nav class="ren-nav">`.

## 0.14.0 — field-audit corrections

- The standalone reset declares the `reset` layer, including when loaded
  directly, so it cannot override component typography or surfaces.
- All component CSS now declares the `components` cascade layer itself. Load
  `foundation.css` once and import component CSS directly, including through
  Astro wrappers. Remove redundant `layer(components)` from selective imports
  to avoid a nested `components.components` layer. The complete and split
  bundles preserve the same layer order as source files. Ordinary unlayered
  application overrides win consistently; review workarounds that previously
  depended on the broken bundle's higher specificity.
- A `.ren-stack` now owns direct flow-element block margins and initializes
  its own `--stack-gap`. A nested plain stack no longer inherits a parent's
  size modifier. Add the desired modifier or `--stack-gap` to each stack;
  change `--space-stack` for a shared theme default. Comfortable/compact/
  spacious defaults remain 12/8/16px. Explicit size modifiers stay fixed.
  Nested prose inside a wrapper retains classless reading rhythm.
- `.ren-card-cover` is an edge-to-edge image or image wrapper. Remove local
  fixes that compensated for first/last-child padding after visually checking
  the upgraded card. `.ren-card-simple` is for sectionless content and applies
  padding once on the root. Do not combine it with structured slots.
- Refresh older installed Ren10 skills from `skills/rends/`; check provenance
  with `npm run agent:provenance -- --skill /path/to/SKILL.md /path/to/project`.
  Equal package versions can still contain different CSS; compare hashes.
- See `docs/composition-recipes.md` and `examples/tour-composition.html` for
  wrapping CTA labels, consent/form groups and informational tour actions.

Upgrade and visually verify each consumer
before removing its existing compatibility patches.

## 0.9.x

Use lowercase contract paths (`ren-design.md`, `tokens.md`, `layouts.md`,
`components.md`). Replace primitive palette variables with semantic `--color-*`
tokens and load `index.css` once. Run `npm run lint:contracts` to find stale
aliases before upgrading.

## Audit follow-up compatibility

- Existing theme and event names remain valid. `data-mode` is additive and lets a named preset keep a separately forced color scheme.
- Scoped themes now recolor links and focus consistently. Scoped density affects cards and form rhythm: card padding is 12px compact, 16px default and 32px spacious; forms use 12/24/32px. Fixed stack modifiers remain fixed.
- Carousel dot tokens style the visual marker inside a 44px button. Overrides of the button's own width/height should migrate to `--ren-carousel-dot-size`.
- Muted links keep an underline in text. Host accessibility attributes on `ren-button` now name the real control and update reactively.
- Native option and validation colors follow semantic tokens; consumers should override those tokens instead of primitive colors.
- Initialization-only attributes are explicitly documented per component. Event names were preserved to avoid a breaking migration.
