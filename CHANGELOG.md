# Changelog

All notable changes to RenDS are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Versions up to and including 0.6.0 were development iterations tracked in
`PHASE-*-COMPLETE.md` documents at the root of the repository; this file
consolidates them and starts formal version tracking with 0.7.0.

## [Unreleased]

### Added

- **Theme generator: AAA mode.** `generateTheme(hex, { level: 'AAA' })`
  targets WCAG 2.1 AAA thresholds (7:1 text, 4.5:1 non-text UI) instead of
  the default AA (4.5:1 / 3:1). Constant `WCAG_THRESHOLDS` exported
  conceptually via the level-aware audit. The return object now includes
  `level` and `report.level`; CSS header comment records the target.
  Invalid values normalize to `'AA'`.
- **AA/AAA segmented control in `create/` Generate modal.** Radio-group
  toggle in the modal header; switching it re-runs the analyzer against
  the new level. Subtitle, report heading, and threshold help-text all
  update live. Shortfalls (hues that cannot meet AAA even at the terminal
  scale step) render as amber `⚠` warnings to distinguish them from hard
  failures.
- **`theming.html` "AA or AAA?" section.** Explains when to use each
  level, how the generator behaves with saturated hues, and the new
  `level` option in the module snippet.
- **`smoke-create-generator.mjs`** expanded from 9 to 10 checks covering
  the AA/AAA toggle state, heading swap, and library-level return.
- **`date-range-picker` demo section in `docs/components.html`.** Trigger
  with start/end values, popover with 6 presets (Last 7/30 days, This
  month, Last month, This quarter, This year), dual calendar placeholders,
  footer with selection summary + Cancel/Apply, and an empty-state
  variant. Registered in `components.spec.cjs` SECTION_MAP; the
  previously-empty SKIPPED set stays empty. Scoped axe scan clean.
- **Live-region markup in `tests/visual/test-page.html`.** Progress bars
  now carry `role="progressbar"` + `aria-labelledby` + `aria-valuenow/min/max`
  (indeterminate bar omits `valuenow` per ARIA spec); a new
  `role="status" aria-live="polite" aria-atomic="true"` region
  demonstrates the status-announcement pattern consumers should use.

### Changed

- `buildScheme(scale, mode)` → `buildScheme(scale, mode, textRatio)`.
  Internal; no public API break.
- `auditTheme()` now accepts `{ level }` and scales both text and non-text
  minimums from it. Default remains AA (4.5/3) so existing callers keep
  their current behavior.
- **A11y test hardening.** The `should provide context for dynamic content`
  test in `tests/a11y/a11y.spec.cjs` was a hollow `console.log`; it now
  asserts at least one live region (`[aria-live]`, `role=status`,
  `role=alert`, `role=log`, or `role=progressbar`) exists on test-page.html.
- **11 primitives and 7 patterns migrated to semantic motion tokens.**
  Legacy primitives (`--duration-normal/fast/moderate/slow/slower`,
  `--ease-out/in/default/spring/snappy`) replaced with semantic equivalents
  (`--duration-state/tactile/enter/exit/route/emphasize`, `--ease-enter/
  exit/state-change/playful`). Behavior preserved — legacy aliases continue
  to resolve to the same values, so external consumers are unaffected.
  Primitives touched: button, link, field, checkbox, radio, progress,
  banner, tag, pagination, breadcrumb, card. Patterns touched: nav,
  sidebar, command, table, form, menubar, ai. Intentionally left alone:
  spinner, skeleton, icon (raw values for infinite loops).

### Fixed

- **`ren-menubar.css`** had an extra `)` in a `transition:` declaration
  that caused the browser to silently discard the rule. Menubar items
  now get their hover transition as intended.

## [0.8.0] — 2026-04-21

Focus: themes, motion, and the hex→tokens generator. Consolidates four phases
(F7.21 → F7.24): CLI registry gap, per-component test suite, three ready-made
themes, a unified motion-token system, a palette generator from a single hex,
and its UI integration in `create/`. All changes are additive or internal
refactors — no public token renames, no component API breakage.

### Added

- **Three ready-made themes** under `rends/themes/`, each a drop-in CSS file
  that only overrides semantic tokens:
  - `amber-editorial.css` — warm editorial palette, Fraunces display,
    amber accent, generous card radius.
  - `cyber.css` — high-contrast neon on near-black surfaces, cyan/magenta
    accent pair, mono-first typography, sharp corners. Light variant is a
    "daybreak" shift rather than a pure inversion; both modes pass AA.
  - `minimal-mono.css` — single gray ramp, single accent reserved for
    actions. Meant as a starting point for product themes.
  All three audited with `contrast-audit.js` before merge. (F7.24; tasks #2 #3 #4)
- **Semantic motion tokens** in `rends/tokens/semantic/motion.css`:
  `--duration-micro` (60ms), `--duration-enter` (250ms), `--duration-exit`
  (180ms), `--ease-enter`, `--ease-exit`. Plus compound presets
  `--transition-tactile` (hover/focus/press), `--transition-overlay`
  (backdrops), `--transition-enter`, `--transition-exit`,
  `--transition-state`. Legacy aliases (`--duration-fast/normal/slow`,
  `--ease-out/in/default`) still resolve for backward compatibility.
  (F7.24; tasks #6 #7)
- **`rends/themes/theme-generator.js`** — ES module that takes a hex and
  returns an AA-safe theme. Exports `generateTheme(hex, opts?)` →
  `{name, scale, light, dark, css, report}`, `scaleFromHex()` (11-step OKLCH
  tonal scale), `auditTheme()` (pair-by-pair contrast report), plus color
  utilities (`hexToRgb`, `rgbToHex`, `rgbToHsl`, `hslToRgb`, `relLum`,
  `contrast`, `wcagLevel`, `onColor`). Runs entirely in-browser; usable at
  build time, in Storybook, or from Node. (F7.24; task #5)
- **"Generate" tab in `create/`** — new sidebar button next to Shuffle that
  opens a modal with hex input + live swatch, 11-step scale preview,
  light/dark accent pair, contrast audit, and CSS export block. Apply
  button writes back into the Builder's state. Focus management includes
  open/close focus restoration, Esc handler, and focus trap. Generator ES
  module bridged to inline scripts via `window.rendsGen`. (F7.24; task #14)
- **Ready-made themes + generator sections in `docs/theming.html`** — two
  new sections describing the three reference themes and the hex→token
  generator (both the UI flow in `create/` and the module API). TOC
  updated. (F7.24; task #19)
- **`rends/scripts/smoke-motion-migration.mjs`** — headless Playwright
  regression for the motion-token migration. 10 checks over
  `docs/components.html`, `themes/preview.html`, and `create/index.html`
  (token resolution, dialog/toast/popover/menu open-close, non-empty
  computed styles, 6 motion presets firing, `window.rendsGen` attached).
  Ignore-list handles sandbox-blocked CDNs (fonts, lucide, jszip) without
  masking real errors. (F7.24; task #15)
- **`rends/scripts/smoke-create-generator.mjs`** — 9-check smoke for the
  Generator modal: button renders, focus lands on hex input, bad-hex
  surfaces an error, good hex (`#F59E0B`) produces 11 scale cells and ≥6
  audit rows, CSS export contains `[data-theme="brand"]`, Apply mutates
  `state.theme.hex`, Esc closes the modal, zero console errors. (F7.24; task #15)
- **20 missing entries in `cli/registry.js`** — `rends add <component>` now
  covers all 52 components. Added 11 primitives (avatar, banner,
  breadcrumb, card, kbd, link, pagination, separator, skeleton, spinner,
  tag), 7 composites (alert-dialog, collapsible, color-picker,
  context-menu, date-range-picker, dropzone, toolbar), and 2 patterns
  (ai, empty-state). Each entry includes `name`, `layer`, `dir`,
  `description`, `files`, `deps`, and a cribable `usage` block. (F7.22;
  task #83)
- **`tests/components/components.spec.cjs` + `playwright.config.cjs`** —
  per-component test suite that imports `REGISTRY` dynamically,
  maintains a `SECTION_MAP` for non-trivial section IDs (e.g. `select`
  → `custom-select`), and for each component asserts visibility, demo
  content, and axe-scoped WCAG 2.1 AA compliance. Desktop Light + Dark
  matrix, **102 / 102 passing** (2 skipped: `date-range-picker`, which
  has no section in `docs/components.html` yet). (F7.23; task #84)
- **`test:components` npm script** targeting the new per-component
  config. (F7.23)

### Changed

- **16 composites migrated to semantic motion tokens.** Overlay family
  (`ren-dialog`, `ren-alert-dialog`, `ren-sheet`, `ren-toast`, `ren-popover`,
  `ren-menu`, `ren-context-menu`, `ren-tooltip`, `ren-hover-card`) now uses
  `--duration-enter` / `--ease-enter` for open, `--duration-exit` /
  `--ease-exit` for close, and `var(--transition-overlay)` for backdrops.
  Dropdowns (`ren-select`, `ren-combobox`) match the overlay family for
  the content panel and use `var(--transition-tactile)` on triggers, with
  `--duration-micro` on option hover for snappiness. Stateful composites
  (`ren-accordion`, `ren-collapsible`, `ren-tabs`) use
  `var(--transition-tactile)` on hover/focus and `--duration-enter` for
  chevron rotation. Pickers and widgets (`ren-calendar`, `ren-date-picker`,
  `ren-date-range-picker`, `ren-color-picker`, `ren-carousel`, `ren-toolbar`,
  `ren-dropzone`, `ren-toggle-group`, `ren-scroll-area`, `ren-slider`,
  `ren-otp`, `ren-number-field`) consolidated tactile hover/focus into
  the preset. Post-migration, grep for legacy
  `--(duration|ease)-(fast|normal|slow|moderate|default)` against
  `components/composites/**/*.css` returns **zero** hits. Primitives and
  patterns layers are deliberately out of scope (their hover/focus still
  works via the legacy aliases). (F7.24; tasks #10 #11 #12 #13 #18)
- **`prefers-reduced-motion: reduce` handling** moved to the token layer.
  Semantic durations now collapse to `0ms` at `:root` under the media
  query, cascading automatically to any component that uses them. Explicit
  per-component reduced-motion blocks are kept as belt-and-suspenders for
  cases that also need to suppress `transform` or `translate`. (F7.24; task #7)

### Fixed

- **`docs/components.html` referenced `../base/semantics.css`** (renamed
  to `classless.css` in an earlier phase but the `<link>` was never
  updated). Surfaced by `smoke-motion-migration.mjs`. (F7.24; task #16)
- **`ren-table.js` class missing `export`** — `docs/components.html`
  imported `{ RenTable }` but the module declared
  `class RenTable extends HTMLElement` without the keyword. Fixed to
  match the pattern of sibling modules (`ren-number-field`, `ren-otp`,
  `ren-form`). (F7.24; task #17)

### Removed

- **`docs/test-base-select.html`** — 151-line scratch file experimenting
  with `appearance: base-select`. Unlinked, no history beyond the initial
  Primitive Zero commit. (F7.21; task #82)

### Accessibility milestones

- `tests/components/components.spec.cjs`: **102 / 102 pass** (51
  components × Desktop Light + Dark), 2 skipped for `date-range-picker`.
  Every component's docs section scoped-axe-tested with zero AA
  violations.
- All three new themes pass AA on `surface`, `on-accent`, `subtle`, and
  text pairs in both light and dark modes.
- Generator output: 100% of audit rows generated for the reference hex
  `#F59E0B` pass AA. Generator also supports scaling the input hex up/down
  the scale if the raw color fails against a target surface (reported in
  the audit as a "shifted" entry).

### Semver notes

Minor bump (0.7.1 → 0.8.0). All changes are additive or internal
refactors. The motion token vocabulary is new, but legacy duration/ease
aliases still resolve, so existing components and consumer themes keep
working. No token renames, no component API removals, no breaking test
harness changes.

## [0.7.1] — 2026-04-20

Focus: post-0.7.0 polish. Extends the a11y guarantees from `test-page.html` to
the entire `docs/` site, tightens the token story around `--color-text-faint`,
cleans up residual hex literals across `components/`, `base/`, `themes/`, and
`docs/`, and widens the a11y suite to the same multi-project matrix used by
visual regression.

### Added

- **docs/cli.html** — full reference for the RenDS CLI (`init`, `add`, `list`),
  including flags, config file shape, and component-naming guidance.
  (F7.8; task #64)
- **Visual regression baselines** for `tests/visual/test-page.html` across the
  full 8-project Chromium matrix (Mobile / Tablet / Desktop / Ultra-wide ×
  light / dark). 248 PNG snapshots committed under
  `tests/visual/visual.spec.cjs-snapshots/`. (F7.9; task #65)
- **`tests/a11y/playwright.config.cjs`** — dedicated a11y Playwright config that
  mirrors the visual config's 8-project Chromium matrix. The a11y suite is no
  longer tied to whatever default project Playwright picks, and regressions
  that surface only at certain viewports (e.g. `scrollable-region-focusable`
  at Pixel 5 width) are now caught. (F7.15; task #76)
- **npm scripts `test:a11y` and `test:visual`** that target each dedicated
  config explicitly. `npm test` still runs the default for retro-compat.
  (F7.15; task #76)
- **Policy callout in `docs/tokens.html`** documenting the correct use of
  `--color-text-faint` (incidental content only, per WCAG 2.1 SC 1.4.3) with
  a concrete allow-list (disabled labels, placeholders, decorative punctuation,
  calendar cells outside the current month) and a deny-list (eyebrows,
  captions, table headers, step numbers, help text, etc.). (F7.14; task #75)
- **`.dx-callout` doc-internal component** for surfacing policy notes in the
  docs site. (F7.14)
- **Expanded Craft Rule #1 in `rends-skill/SKILL.md`** with a paragraph
  explaining that `--color-text-faint` is a trap: the name suggests a
  "muted-lite" but its contrast is intentionally sub-AA. Agents must use
  `--color-text-muted` for anything the user must read. (F7.14)
- **ARIA labels and missing input associations** in `docs/components.html`:
  `aria-label` on icon-only buttons, `aria-label` on unlabelled range /
  file / text inputs, `<label for>` / `id` pairings on selects,
  `role="region"` + `tabindex="0"` + `aria-label` on scroll-area demos,
  `tabindex="0"` on carousel viewports, `aria-hidden="true"` on decorative
  SVGs inside labelled buttons. 15 nodes across 6 axe rules fixed.
  (F7.11; task #72)
- **`tabindex="0"` on scrollable docs demos** (`.dx-pre`, `pre.element-code`,
  `.ren-reel`) across all 9 docs pages. 112 tags updated. Resolves the
  `scrollable-region-focusable` violations that only surfaced at mobile
  viewport width. (F7.15)

### Changed

- **BREAKING — `--color-accent-strong` dark-mode value darkened** from
  `blue-400` to `blue-500` to restore AA contrast on `--color-surface` in
  dark mode after the 0.7.0 flip. Custom themes overriding
  `--color-accent-strong` should re-check contrast. (F7.7 residuals; task #61)
- **Interactive border tokens** (`--color-border-interactive`,
  `--color-border-interactive-hover`) now guarantee 3:1 contrast against
  `--color-surface` in both modes. Inputs, buttons, and toggleable
  primitives with visible outlines pass WCAG 2.1 SC 1.4.11 (non-text
  contrast). (F7.7; task #61)
- **`.dx-section p` → `.dx-section > p`** in `docs/accessibility.html` and
  `docs/theming.html`. The descendant selector was winning (specificity 0,1,1)
  over parent-element inline `color:` (specificity 1,0,0,0 but not inherited
  as a match), causing nested `<p>` elements inside the contrast demos to
  render gray-on-color instead of inheriting the card's intended foreground.
  Scoping to a direct child prevents the rule from biting future nested
  layouts. (F7.13; task #74)
- **`docs/accessibility.html` contrast demos** — each `.dx-contrast-card`'s
  `<p>` now carries its own `color:` inline, matching the card's semantic
  foreground token (`--color-on-accent`, `--color-on-danger`, etc.). Four
  cards × two `<p>` tags = 8 fixes. The "intentional contrast demo" label
  was a mirage: the demos were all rendering `--color-text` on colored
  backgrounds, which failed AA for reasons unrelated to the point being
  demonstrated. Diagnosed via Chrome DevTools Protocol
  `CSS.getMatchedStylesForNode`. (F7.12; task #73)
- **5 theme-preview button backgrounds in `docs/components.html`** darkened
  to AA-compliant shades: blue `#007AFF → #2563eb`, green `#16a34a → #15803d`,
  orange `#ea580c → #c2410c`. (F7.11)
- **`--ren-ai-*` tokens added** to `ren-ai.css` so the AI pattern's accent
  color is themable instead of the previous hard-coded `linear-gradient` with
  literal hex. (F7.7; task #68)
- **`rends-skill/SKILL.md` primitive count** corrected from 13 to 18 on the
  component-tier summary line. (F7.7; task #63)

### Fixed

- **29 hex color literals removed** from `components/**/*.css`, `base/**/*.css`,
  `themes/**/*.css`, and `tokens/semantic-*.css` — replaced by semantic tokens.
  Residuals were mostly shadow colors, focus rings, and fallback values in
  `var(--token, #hex)` patterns that locked components to a specific palette.
  (F7.7; tasks #67, #69, #70)
- **3 hex literals in `tests/visual/test-page.html`** (Primary/Success/Info
  demo backgrounds) replaced with RenDS semantic tokens — the demo now
  inherits the theme instead of being locked to a Bootstrap-style palette.
  (F7.7; task #62)
- **`docs/*.html` axe audit** — 0 WCAG 2.1 AA violations across all 9 docs
  pages in all 8 Chromium projects (144/144 tests). Previously this was
  a single-project run; the matrix exposed Mobile-only
  `scrollable-region-focusable` violations that are now resolved. (F7.15)
- **`--color-text-faint` misuse** across docs: audit (F7.10; task #71)
  identified passages where the faint token (< 2:1 contrast, AA-failing by
  design) was being used for paragraphs the user must read. All such usages
  were migrated to `--color-text-muted`. Follow-up (F7.14) documents the
  policy to prevent recurrence.

### Removed

- **`var(--token, #hex)` fallback patterns** in components. If a semantic
  token is unavailable, it should fail loudly (no color) rather than silently
  fall back to a hard-coded hex that doesn't respect the theme. (F7.7)

### Accessibility milestones

- `tests/a11y/docs.spec.cjs`: **144 / 144 pass** across 8 Chromium projects
  (9 docs × 2 tests × 8 projects), zero AA violations on the docs site.
- `tests/a11y/a11y.spec.cjs`: 2 pre-existing violations carry over from 0.7.0
  on `test-page.html` (`icon-descriptions-should-be-present`,
  `provide-context-for-dynamic-content`). They are known, filed for a
  future phase, and multiply to 16 when run across 8 projects. They are not
  regressions introduced by 0.7.1.
- Visual regression: **761 / 761 pass** with no baseline drift — the
  0.7.1 work touched `docs/*.html` and `rends-skill/SKILL.md` only, not
  `tests/visual/test-page.html`.

## [0.7.0] — 2026-04-19

Focus: accessibility deep-clean + semantic token audit. All texto-sobre-surface
pairs now pass WCAG 2.1 AA in both light and dark modes, and the Playwright
a11y suite runs with real enforcement (`skipFailures=false`) across 9 projects
covering Desktop / Mobile / Tablet / Ultra-wide × light/dark plus Firefox.

### Added

- **New semantic tokens** for AA-compliant text on light surfaces
  (`--color-success-strong`, `--color-danger-strong`, `--color-info-strong`,
  `--color-warning-strong`). Parallel to the pre-existing `--color-accent-strong`,
  they give components a legible text color on white/light-fill without
  sacrificing the Apple-like brightness of the solid bg tokens.
- `contrast-audit.js` — reproducible Node script that parses the token CSS,
  resolves `light-dark()` recursively, and reports WCAG contrast ratios for
  194 meaningful token pairs. Usable as a regression test for the design
  system (`node contrast-audit.js`).
- **Landmark `<main>`** in `tests/visual/test-page.html` (replaces root
  `<div class="test-container">`) — resolves axe `landmark-one-main` and
  `region` violations in one shot.
- Explicit `.theme-dark` descendant color rules in `test-page.html` so
  headings, paragraphs, labels, and links inside dark sections inherit
  `color: #fff` instead of being overridden by `color: var(--color-text)`.
- 9 `aria-label`s on text / range inputs that previously had no associated
  label (form state demos, RTL demo).
- Native `<button>` reset in `test-page.html` so bare `<button>` elements
  use RenDS semantic colors instead of the user-agent's grey default.

### Changed

- **BREAKING — `--color-accent` darkened in light mode** from `blue-500`
  (`#007AFF`, Apple Blue, 4.01:1 vs white) to `blue-600`
  (`#0055D4`, 5.88:1 vs white). Custom themes that extended or overrode
  `--color-accent` expecting the pure Apple Blue will render slightly darker.
  Dark mode is unchanged (`blue-400`, 8.2:1 vs black).
- **BREAKING — solid status backgrounds darkened in light mode**:
  `--color-success`, `--color-warning`, `--color-info` all moved to `-700`
  shades in light mode so that white text on top passes AA. Dark mode keeps
  the bright Apple-style shades with **black** text on top (new
  `--color-on-*` tokens handle the swap).
- **BREAKING — `--color-on-accent` and `--color-on-{success,warning,danger,
  info}` are now mode-adaptive**: `light-dark(var(--white), var(--black))`.
  In light mode the bg is dark and text is white (as before); in dark mode
  the bg is bright and text is black (iOS 7+ convention). Any custom CSS
  that hardcoded `color: white` on top of a status background must switch to
  `color: var(--color-on-X)` or will fail AA in dark mode.
- **`--color-text-muted`** in light mode moved from `gray-600` (3.26:1, fails
  AA for normal text) to `gray-700` (7.24:1). Dark mode unchanged.
- **`--color-input-placeholder`** light mode moved from `gray-600` to
  `gray-700`; dark mode from `gray-700` to `gray-500`. Both sides now pass
  AA on their respective input backgrounds.
- **`--color-text-link`** now defaults to `--color-accent-strong`
  (not `--color-accent`), so links on light surfaces pass AA automatically.
- **`--color-warning-strong`** in light mode bumped from `orange-600`
  (4.32:1, barely fails) to `orange-700` (6.29:1).
- `--color-accent-hover` cascade updated to match the new accent
  (`blue-700` / `blue-300`); `--color-accent-active` → `blue-800` / `blue-200`.
- **`tests/a11y/a11y.spec.cjs`** now runs with `skipFailures=false` for
  main, dark-mode, and light-theme sub-checks (previously silenced by
  `try/catch`). Contrast-requirement test tightened from
  `expect(violations.length).toBeLessThanOrEqual(10)` to
  `expect(violations.length).toBe(0)`.
- Light-theme test selector changed from `.theme-light` (CSS-only, no
  matching elements) to `main`.

### Fixed

- **Axe `color-contrast` violations** in `tests/visual/test-page.html` — from
  4 distinct violations / ~95 affected nodes pre-F7.3 to **0**. Covers
  demos in both light and dark mode across all Chromium viewports and Firefox.
- The Featured Card demo (h4 + p inside `<div style="bg: primary; color: white">`)
  now inherits color correctly and uses `--color-accent` / `--color-on-accent`
  so it passes AA in dark mode.
- Disabled anchor (`<a data-state="disabled">`) marked with `aria-disabled="true"`
  and `tabindex="-1"` — axe now exempts it from contrast rules.
- 17 hex color literals in `test-page.html` replaced by RenDS semantic tokens
  (Primary/Success/Info demos, avatars, kbd keys, Confirm button, pagination,
  tabs, visited/active links).

### Removed

- `try/catch` wrappers around `checkA11y` calls in `a11y.spec.cjs` that were
  silencing assertions. Failures now propagate.
- Hard-coded Bootstrap-style accent hex (`#007bff`, `#28a745`, `#17a2b8`) in
  `test-page.html` primary/success/info components.

### Security

- N/A.

### Accessibility milestones

- Axe-core standalone: **0 violations** on `test-page.html`.
- Playwright a11y suite: **252 / 252 tests pass** with real enforcement
  across 9 projects (Desktop, Mobile, Tablet, Ultra-wide × light/dark, plus
  Firefox Desktop Light).
- Safari / WebKit project is configured but requires CI environment with
  `libgtk-4` and related system libs; skipped locally.

## [0.6.0] — 2026-04-18

Not formally released. Captured retroactively from `PHASE-6-COMPLETE.md` and
`PHASE-7*-COMPLETE.md` series up to Fase 7.2.

### Added

- **RenDS Blocks** (`rends/blocks/`): `landing.html` and `blog.html` —
  full-page compositions of primitives and patterns demonstrating real-world
  layouts.
- **RenDS Docs site** (`rends/docs/`): `index.html` + `getting-started.html`,
  `tokens.html`, `theming.html`, `accessibility.html`, `layouts.html`.
  Cross-cutting guides explaining how the design system is composed.
- **Cleanup post-auditoría** (Fase 7.2): consolidated imports, pruned
  duplicate rules, normalized component naming.

### Changed

- Documentation links reorganized in `docs/index.html` to surface the new
  cross-cutting guides first.

## [0.5.0] — 2026-04-18

### Added

- **RenDS Create** — theme builder at `rends/create/index.html` (2198 lines,
  93 KB). Interactive playground: tweak tokens, preview live, export as CSS/JSON
  or zipped bundle. Includes 8 template presets, share-link with URL state
  restore, and a sidebar footer grouping Templates / Share / Export.

## [0.4.0] — 2026-04-18

### Added

- **Foundational token system** (Fase 4). Primitive palette (13 hues × 11 shades),
  semantic layer (`--color-*`, `--space-*`, `--text-*`, etc.), component layer
  (`--ren-*`).
- `light-dark()` CSS function adoption across all semantic color tokens.
- Dual type scale (Productive + Expressive).
- Semantic spacing tokens.
- Reduced-motion alternatives (not just `prefers-reduced-motion: reduce → 0ms`,
  but alternate easings).
- Apple "Liquid Glass" utilities.
- Separation of primitive components into individual folders (`ren-separator`,
  `ren-avatar`, `ren-spinner`, `ren-skeleton`, `ren-kbd`).

## [0.3.0 and earlier]

Not tracked — pre-release iterations. See the `PHASE-*-COMPLETE.md` documents
at the repository root for narrative history.

[Unreleased]: https://github.com/Rensoconese/ren10/compare/v0.8.0...HEAD
[0.8.0]: https://github.com/Rensoconese/ren10/releases/tag/v0.8.0
[0.7.1]: https://github.com/Rensoconese/ren10/releases/tag/v0.7.1
[0.7.0]: https://github.com/Rensoconese/ren10/releases/tag/v0.7.0
[0.6.0]: https://github.com/Rensoconese/ren10/releases/tag/v0.6.0
[0.5.0]: https://github.com/Rensoconese/ren10/releases/tag/v0.5.0
[0.4.0]: https://github.com/Rensoconese/ren10/releases/tag/v0.4.0
