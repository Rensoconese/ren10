# Changelog

All notable changes to RenDS are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Versions up to and including 0.6.0 were development iterations tracked in
`PHASE-*-COMPLETE.md` documents at the root of the repository; this file
consolidates them and starts formal version tracking with 0.7.0.

## [Unreleased]

- Nothing yet.

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

[Unreleased]: https://github.com/Rensoconese/ren10/compare/v0.7.1...HEAD
[0.7.1]: https://github.com/Rensoconese/ren10/releases/tag/v0.7.1
[0.7.0]: https://github.com/Rensoconese/ren10/releases/tag/v0.7.0
[0.6.0]: https://github.com/Rensoconese/ren10/releases/tag/v0.6.0
[0.5.0]: https://github.com/Rensoconese/ren10/releases/tag/v0.5.0
[0.4.0]: https://github.com/Rensoconese/ren10/releases/tag/v0.4.0
