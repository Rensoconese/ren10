# Changelog

All notable changes to RenDS are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Versions up to and including 0.6.0 were development iterations tracked in
`PHASE-*-COMPLETE.md` documents at the root of the repository; this file
consolidates them and starts formal version tracking with 0.7.0.

## [Unreleased]

### Added

### Changed

### Fixed

### Removed

### Security

- Hardened release, compatibility, and agent-skill checks.

### Accessibility milestones

## [0.9.2] — 2026-07-07

Focus: **modern CSS Anchor Positioning for overlay components.** Patch
release for the `position-area` modernization merged in
`feat/anchor-positioning-modernization`.

### Changed

- **Popover and tooltip placement now use `position-area`.** Legacy
  `inset-area` usage was replaced with the current Anchor Positioning
  property, while preserving the existing JS positioning fallback for
  unsupported browsers.
- **Overlay `placement` now mirrors to `data-side`.** `ren-popover` and
  `ren-tooltip` keep their public `placement` API, but sync it to the
  same side attribute used by CSS arrows and modern anchor positioning.
- **Hover card anchor positioning is explicit.** `ren-hover-card` now
  declares `position-area` and uses the same complete anchor-support
  fallback query as the rest of the overlay family.
- **Date picker anchor fallbacks are stricter.** Single-date and
  range-date dropdowns now gate their fallback positioning on complete
  anchor support instead of a partial `anchor()` check.
- **Anchor positioning support is documented centrally.**
  `base/enhancements.css` now captures the canonical `@supports`
  criteria for anchor naming, anchor association, and `position-area`.

### Added

- **Regression coverage for overlay placement.** Component tests now
  assert that popover and tooltip `placement` values mirror to
  `data-side`, including invalid-value fallback behavior.

## [0.9.1] — 2026-07-07

Focus: **CLI bugfixes and popover contract alignment.** Patch release for
issues found after the 0.9.0 agent-ready package.

### Fixed

- **CLI utility import normalization.** `ren10 add`, `remove`, and `upgrade`
  now compare and write copied JS components against the consumer layout
  (`../../utils/`) instead of the package source layout (`../../../utils/`),
  preventing false local override detection and broken `upgrade --force`
  imports.
- **`ren10 init --shape` / `--density` scaffold.** Generated
  `rends/index.css` now imports `./themes/appearance.css` by default, so the
  printed `data-density` / `data-shape` attributes work immediately.
- **`ren-popover` non-modal behavior.** The component contract and runtime now
  agree: popovers keep `aria-modal="false"` and do not trap focus, while still
  restoring focus to the trigger when closed from inside.
- **Agent CLI manifest and knowledge graph commands.** The machine-readable
  manifest now lists `windsurf` in the `agent-docs --agent` enum, and bare
  `ren10 knowledge --json` resolves to the `knowledge.path` response.

### Added

- **Regression coverage for 0.9.1 flows.** CLI smoke tests now cover
  `init --shape`, JS component add / upgrade / remove import preservation, and
  bare `knowledge --json`.

## [0.9.0] — 2026-05-16

Focus: **CLI extension, docs depth, foundations pages, and live
theming controls.** Closes the 17-finding external audit from
2026-05-16 across four feature branches. No breaking changes —
`0.9` is a feature-additive minor bump.

### Added

- **CLI: `ren10 remove <name>` (alias `rm`).** Deletes an installed
  component folder and scrubs its `@import` from
  `components/index.css`. Refuses to delete locally-modified files
  unless `--force` is passed; override detection compares both
  extra files and modified content against the package source.
- **CLI: `ren10 upgrade [name]` (alias `update`).** Diffs each
  installed component against the package source, prompts
  per-component (`y` / `n` / `d`iff / `a`bort), and supports
  `--dry-run` and `--force`. Identical files are silent.
- **CLI: `--density` and `--shape` flags on `ren10 init`.** Validated
  against the same value set as `themes/appearance.css`. Prints the
  `<html data-density="…" data-shape="…">` attributes for the user
  to add. Pairs with the new `spacious` density preset.
- **`[data-density="spacious"]` preset** in `themes/appearance.css`
  (was advertised in docs but missing from CSS): sizes 2.5 / 3 /
  3.5 / 4 rem, `--space-unit: 0.875rem`.
- **`docs/foundations/events.html`.** Central catalog of 34 custom
  events across 27 components: naming convention, bubbles /
  composed policy, full table with `detail` shape, listening
  patterns, common gotchas.
- **`docs/foundations/cascade-layers.html`.** Explains
  `@layer reset, tokens, base, components, utilities`, override
  recipes, integration with legacy / other-DS CSS, devtools tips.
- **`docs/recipes.html`.** Five cross-component flows with runnable
  HTML and per-recipe edge cases: confirm-and-delete, searchable
  select inside Field, tabbed settings with URL hash, CRUD admin
  row, and auth flow.
- **DO / DON'T visual section for `--color-text-faint`** in
  `docs/tokens.html`. Side-by-side previews of correct uses
  (breadcrumb separator, calendar outside-month, disabled label,
  placeholder) versus incorrect uses (eyebrow, table header, step
  number, help text).
- **API surface badges (CSS-only / Requires JS / Hybrid)** on all
  53 component docs. Each page header declares the component's
  JS dependency at a glance. Styles in `site/shell.css`.
- **Live density/shape toggle on `docs/theming.html`.** Buttons
  (with `aria-pressed`) mutate `<html data-density>` /
  `<html data-shape>` in real time on a four-component showcase.
- **`ren-ai` CSS-only primitives** for error state, regenerate /
  edit actions, file upload chips, and tool-call display:
  `.ren-ai-error` + `-message`, `.ren-ai-action-regenerate`,
  `.ren-ai-action-edit`, `.ren-ai-file-chip` family,
  `.ren-ai-tool-call` collapsible (native `<details>` baseline,
  `data-status="pending|running|success|error"`).
- **Featured F6 → toast viewport** accessibility callout in
  `docs/accessibility.html`. `ren-toast.js` already wired it; the
  docs now surface it as a "beyond WCAG AA" example.
- **`JavaScript methods` table for `ren-combobox`** documenting
  `.value`, `.open()`, `.close()`, `.setLoading(bool)`,
  `.setItems(arr)` (previously existed in code but not in docs).

### Changed

- **Theme builder hash format versioning.** `serializeState` was
  already emitting `v: 1`; `deserializeState` now actually uses it:
  missing `v` → legacy v1 (older shares keep working); `v` higher
  than `HASH_SCHEMA_VERSION` → toast warns "Theme saved with a
  newer RenDS" and falls back to best-effort. Format documented in
  `docs/theming.html`.
- **`ren-table` and `ren-ai` docs expanded** from ~133-line stubs
  to ~570 lines each, matching `ren-button` / `ren-dialog` /
  `ren-tabs` depth. `ren-table.html` corrected to use the real
  `.ren-table-*` API (the stub referenced non-existent
  `.ren-data-table-*` classes). `ren-ai.html` now explicitly
  states it's CSS-only and documents all 25 real selectors.
- **Dialog snippet IDs normalised to `dlg-{purpose}`**:
  `dlg-confirm`, `dlg-save`, `dlg-delete`, `dlg-rename`,
  `dlg-labelling`. Live demo IDs (`demo-*`) preserved as a
  separate namespace.
- **`type-scale.js` clarifies 13 steps total** (`-2..10` mapped to
  `--text-xs` through `--text-8xl`). All ratios preserve the full
  range — smaller ratios just pack steps tighter.
- **Cascade Layers inline mention in `docs/theming.html`** now
  links to the new full foundations page.
- **`ren-toast` JS API table expanded** with return types
  (status methods return `string (id)`) and `dismissAll()` /
  `promise()` methods. Two new example snippets.
- **`ren-form` clarifies `.ren-stepper` status**: a callout
  explicitly states it's an internal CSS pattern of `ren-form`,
  not a standalone primitive.

### Fixed

- **`type="button"` on 112 buttons across docs and examples.** The
  audit flagged 50+ `<button class="ren-btn">` without `type=`
  contradicting `ren-button`'s own warning. A lookahead-based
  rewrite added the attribute everywhere it was missing, preserving
  existing `type="submit"` buttons untouched.

### Removed

(nothing)

### Security

(no security-relevant changes)

### Accessibility milestones

- F6 → toast viewport featured in `docs/accessibility.html`.
  macOS convention rarely implemented elsewhere; lifts RenDS
  above the WCAG 2.1 AA baseline.

## [0.8.6] — 2026-05-12

Focus: **docs-site UX audit fixes.** External review surfaced 16
issues in the docs site (components.html catalog + showcase). Most
are HTML/CSS edits that don't affect the npm package, but one bug
fix in `components/composites/ren-sheet/ren-sheet.css` does ship to
consumers: the sheet was rendering visible-on-load when used as
`<dialog class="ren-sheet">` because the CSS overrode the browser's
`display: none` default for unopened `<dialog>` elements.

### Fixed

- **`ren-sheet` was visible without the `open` attribute.** The
  selector `.ren-sheet { display: flex; position: fixed; }` overrode
  the browser default `display: none` for `<dialog>` without `open`,
  so any page that declared a `<dialog class="ren-sheet">` for
  later use rendered it on top of the content from frame zero
  (caught in the docs showcase, where Navigation and Filter Results
  sheets greeted the user before they could see anything). Added an
  explicit `.ren-sheet:not([open]) { display: none; }` rule that
  restores the expected behavior. `ren-dialog` and `ren-popover`
  weren't affected — they don't set `display` on their root
  selector.

### Changed

- Docs site: 15 catalog/navigation/copy fixes that don't touch the
  npm package (sidebar tidying, layout consistency between cards,
  terminology, the "Multi-Step Form" sidebar entry that pointed at
  the same URL as Form Validation). Full list in PR #13.

## [0.8.5] — 2026-05-12

Focus: **modernize CSS color and clip syntax to satisfy the new
stylelint-config-standard rules.** Bumps `stylelint` from 16.26.1 to
17.11.0 and `stylelint-config-standard` from 36.0.1 to 40.0.0. The
new config enables `color-function-alias-notation: "without-alpha"`
(prefer `rgb(R G B / A)` over `rgba(R, G, B, A)`) and
`property-no-deprecated` (flag legacy `clip:` in favor of
`clip-path:`). Both syntaxes resolve identically in modern browsers
(Baseline since 2023), so the change is purely shape — pixel output
matches the previous release byte-for-byte. Components verified
16/16 + visual regression 47/47.

### Changed

- **`rgba()` → `rgb(R G B / A)` across 61 occurrences** in
  `base/`, `tokens/`, `components/`. Auto-fixed via
  `stylelint --fix`. Browser support is Baseline since 2023.

- **`clip: rect(0, 0, 0, 0)` → `clip-path: inset(50%)`** and
  **`clip: auto` → `clip-path: none`** in the 5 visually-hidden /
  screen-reader-only patterns: `base/utilities.css`
  (`.ren-sr-only`, `.ren-sr-only-focusable`),
  `components/primitives/ren-checkbox/ren-checkbox.css`,
  `components/primitives/ren-radio/ren-radio.css`,
  `components/primitives/ren-switch/ren-switch.css`. The legacy
  `clip` property was deprecated; `clip-path` is the modern
  equivalent and produces the same zero-area rendering.

- **devDependencies bumped:** `stylelint` 16.26.1 → 17.11.0,
  `stylelint-config-standard` 36.0.1 → 40.0.0. Supersedes the open
  dependabot PR #10.

## [0.8.4] — 2026-05-12

Focus: **first published release.** Renames the npm package from
`rends` to `ren10` to satisfy the npm typosquatting policy
("Package name too similar to existing packages read, redis, send,
runjs"). The CLI binary is renamed to match — `npx ren10 init`
replaces `npx rends init` — but the local directory the CLI
scaffolds in your project is still `rends/`, because that's the
design-system name (same separation as `tailwindcss` package vs
the local `tailwind.config.js`). 0.8.3 was tagged but never reached
npm because of this rename gap; everything in 0.8.3 ships in 0.8.4.

### Added

- **Cross-browser CI matrix (Firefox + WebKit, advisory).** `ci.yml`
  now runs the `a11y` and `components` jobs against `[chromium, firefox,
  webkit]` in parallel. Chromium continues to gate (failures block);
  Firefox and WebKit use `continue-on-error: ${{ matrix.browser !=
  'chromium' }}` so engine-specific regressions surface without blocking
  merges. Cache key includes the browser to avoid collisions. The
  visual job stays Chromium-only — committed baselines are
  chromium/linux and we don't auto-generate Firefox/WebKit baselines
  per run. The playwright configs detect `PLAYWRIGHT_BROWSER` and skip
  the Mobile/Tablet projects for Firefox (Firefox doesn't support
  `isMobile: true`; Chromium and WebKit do). Closes the gap F7.7
  documented.

- **CI / npm / license badges in README.** Top of `rends/README.md`
  now has CI status, npm version, monthly downloads, license, and
  WCAG 2.1 AA badges. Picked up live from the published package.

### Changed

- **README Theming section rewritten** to document both the preset
  themes (link `themes/appearance.css`) and the hex→tokens generator
  (`import { generateTheme } from 'ren10/themes/theme-generator.js'`).
  The old wording suggested the presets worked from `index.css` alone,
  which was untrue.

- **GitHub Actions bumped to Node 24-ready releases.** `ci.yml` and
  `release.yml` now use `actions/checkout@v6`, `actions/setup-node@v6`,
  `actions/cache@v5`, `actions/upload-artifact@v7`, and
  `softprops/action-gh-release@v3`. The previous v4/v2 pins ran on
  Node 20, which GitHub will start forcing to Node 24 on June 2nd,
  2026 and remove on September 16th, 2026. Closes the 8 "Node.js 20
  actions are deprecated" warnings that appeared on every CI run.
  Supersedes the dependabot PRs #1, #4, #5, #6, #7 — those can be
  closed.

### Fixed

- **`themes/appearance.css` and `themes/theme-generator.js` now
  publish to npm.** The previous `package.json` `files` array did NOT
  include `themes/`, so any consumer that installed `rends` and added
  `<html data-theme="ocean">` got no theme styles — the file simply
  wasn't in the tarball. Both files are now explicitly listed under
  `files`, and `exports` exposes `./themes/appearance.css` and
  `./themes/theme-generator.js` as importable subpaths. The internal
  builder UI (`themes/preview.html`) and the unit test
  (`themes/theme-generator.test.js`) stay out of the tarball.
  Tarball: 199 → 201 files, 302 → 312 kB.

- **`npx ren10 init` copies `themes/`** (`appearance.css` +
  `theme-generator.js`) into the consumer's `rends/` directory. Before,
  init created `tokens/`, `base/`, `components/`, and `index.css` but
  silently skipped `themes/`, so users who followed the README's
  `<html data-theme="ocean">` example after `npx ren10 init` still got
  nothing. The files are now physically present where the README
  points.

- **`npx ren10 add <a> <b> <c>` processes all positional arguments.**
  Before, the command parsed only `args[1]` and silently dropped every
  argument after the first — `npx ren10 add button dialog tooltip`
  copied only `button` with no warning. Refactored into an
  `addOneComponent` helper called once per positional arg. Unknown or
  already-present components log an `ℹ` info line and the loop
  continues instead of fatally exiting. The final usage block now
  prints one snippet per component that was actually added.

- **`components/index.css` no longer gets `@import` lines spliced
  inside its header comment.** The previous regex for "where to splice"
  treated indented lines (`   RenDS — Components Layer`) as "not a
  comment" and inserted the import on line 1, breaking the close
  comment and leaving subsequent imports invisible to the CSS parser.
  The init template now emits a `/* @rends-imports */` marker, and the
  splice logic prefers that marker, then the last existing `@import`,
  then the first `*/` of any preceding comment block, then end-of-file
  as a last resort. Verified end-to-end with a clean `npm pack` +
  `npx ren10 init` + `npx ren10 add button dialog tooltip` + smoke of
  the resulting `components/index.css`.

- **`npx ren10 version` now works.** The help text listed `version, -v`
  as a valid command but the dispatch switch only had cases for `-v`
  and `--version` — typing `npx ren10 version` returned an "Unknown
  command" error. Added `case 'version':` to the switch.

- **`npx ren10 add --all` uses the same splice logic as `add <name>`.**
  Before, `add --all` concatenated `@import` lines to the end of the
  file with a leading `\n`, which left a stray blank line between any
  pre-existing imports (from a prior `add <name>`) and the new batch,
  and didn't honor the `/* @rends-imports */` marker. Refactored to
  call `addOneComponent` in a loop with a new `silent: true` option,
  so `--all` reuses the same anchor-aware splice and the only output
  is the `✓ Added N components` summary. The utility-copy step now
  skips files that already exist (was unconditional rewrite before).

### Removed

- **`docs/constraint-driven-design.css` and `docs/content-guidelines.css`**
  — two orphan utility-class stylesheets (`.constraint-*` and
  `.content-*`) that were never imported by any HTML or JS. Dead code
  residual from early iterations; verified zero consumers via grep.
  Neither file was in `package.json` `files`, so removal doesn't affect
  the npm tarball.

### Security

### Accessibility milestones

## [0.8.3] — 2026-05-11

Focus: documentation maturity. Lands the marketing page, the 52
dedicated component pages (the long-running F8 work), the unified
site shell, the Cmd+K command palette, and the mobile drawer.
Aligns the `docs/components/` filenames with their colocated
component directories so an agent that reads `ren-design.md` can
predict the doc URL. Promotes `ren-switch` to its own primitive
(18 → 19 primitives; 52 → 53 components total). All package-API
changes are additive: the same selectors, tokens, and markup that
worked on 0.8.2 still work — only the `docs/components/*.html`
file names changed.

### Added

- **Marketing landing page** at `rends/index.html`. Hero, three pillars,
  atomic-stack visual, live preview block (rendered components alongside
  their source), templates strip, and a Theme Builder CTA. Uses the
  shared shell chrome so it sits inside the doc-site nav system.

- **Full per-component documentation.** Every primitive (18), composite
  (26) and pattern (8) — 52 components total — now has its own page
  under `docs/components/`. Each page includes Overview, Demo, API
  reference (with consistent column boundaries via the centralized
  `.dx-api` class), Accessibility notes, and a persistent left sidebar
  listing every component in the system.

- **Article-detail blog template** at `templates/blog-post.html`. A
  long-form reading layout with hero, 21:9 cover, rich typography
  (headings, lists, blockquote, callout, inline + block code), author
  card, and a related-posts strip — wired up from the blog list so
  every post link lands somewhere real.

- **Centralized site shell** in `site/shell.css`. Top nav (`.dx-nav`),
  sidebar (`.dx-sidebar`), shell containers (`.dx-shell`,
  `.dx-shell-grid`), code blocks (`.dx-pre`), callouts (`.dx-callout`),
  API tables (`.dx-api`, `.dx-api-cols-4`), and keyboard tables
  (`.dx-keys`). Every doc, template, and component page now imports
  the same chrome.

- **Unified sidebar across the doc site.** Same six-section structure
  on every page (Guides → Foundations → Primitives → Composites →
  Patterns → Reference) so navigation is rock-stable as the user
  moves between pages. `aria-current="page"` highlights the entry
  for the current page; everything else stays put. Applied to all
  61 doc-level pages.

- **Mobile drawer + sidebar live filter** (`site/shell.js`, ~5.6 KB,
  loaded on 64 pages). On screens ≤900px, a hamburger button slides
  the sidebar in from the side with a backdrop, ESC to close, click
  outside to close, focus management included. A search input pinned
  to the top of every sidebar live-filters the 60+ entries; group
  headers hide automatically when all their items are filtered out.

- **Cmd+K command palette.** Press `⌘K` (Mac) / `Ctrl+K` (Win/Linux)
  on any doc page to open a fuzzy-searchable palette over the entire
  site nav. Multi-word queries are supported (`"date pic"` matches
  Date Picker), exact > prefix > substring scoring, arrow keys
  navigate, Enter opens, Esc closes. Built on a native `<dialog>`
  with `showModal()` for free focus trap + ARIA. A visible "Search"
  button in the top nav exposes the shortcut; on mobile it shrinks
  to a magnifier icon.

### Changed

- **Promoted `ren-switch` to its own primitive.** The switch toggle was
  living inside `ren-checkbox.css` (and its `component.md` was overloaded
  with both `--ren-checkbox-*` and `--ren-switch-*` tokens), but the two
  have different semantics (immediate-effect toggle vs. submit-time
  checkbox) and warranted their own contract. New layout:
  `components/primitives/ren-switch/{ren-switch.css, component.md}`.
  `ren-checkbox.css` is now checkbox-only; `ren-checkbox/component.md`
  no longer lists `.ren-switch` / `.ren-switch-track` selectors or the
  `--ren-switch-*` tokens. Public API for `.ren-switch` is unchanged —
  the same selectors, tokens, and markup still work. Conteo: 18 → 19
  primitives; 52 → 53 components total. `cli/registry.js` and
  `components/index.css` updated.

- **Renamed 5 `docs/components/*.html` files** to match their colocated
  component directory names: `ren-ai-patterns.html → ren-ai.html`,
  `ren-data-table.html → ren-table.html`, `ren-form-validation.html →
  ren-form.html`, `ren-icons.html → ren-icon.html`, `ren-input-otp.html
  → ren-otp.html`. Updated 71 files of internal references (sidebar
  embedded in every component page, `docs/components.html` catalog,
  `site/shell.js` command palette registry, cross-links from foundation
  pages and templates). External links to the old filenames will 404.

- **Renamed `rends/blocks/` to `rends/templates/`** and updated 139
  internal references across 68 files (docs pages, every component
  detail page, the new root landing, every template page, and the
  shell.css comments). The old `blocks` directory has been removed.

- **Refreshed the blog list template** (`templates/blog.html`).
  Tightened excerpt copy, fixed the broken `Create` shorthand link,
  pointed the featured post and grid cards at the new
  `blog-post.html`, and aligned the preview banner with the new
  templates routing.

- **Translated `docs/primitive-zero.html` to English.** 227 string-level
  replacements covering the TOC, every section title, every element's
  purpose copy, code-sample comments, and demo content. Document
  language is now `lang="en" data-theme="light"`.

- **Components catalog** (`docs/components.html`) now reflects the
  fully documented system: every layer reads "all documented" and
  every component card links to its dedicated page.

- **Foundation pages now use the unified shell.** `primitive-zero.html`,
  `tokens.html`, and `layouts.html` were rewritten from their bespoke
  layouts to the shared `dx-shell-grid` + `dx-sidebar` so they sit
  inside the same nav as the component pages.

- **"Kbd" → "Keyboard Key"** in every sidebar, the catalog card, the
  page title, the breadcrumb, and the H1 of the component page. The
  three-letter HTML tag name was meaningful but not self-explanatory
  in navigation.

- **Removed the ★ "documented" markers** (3,058 instances across 56
  files) from sidebars, status pills, and featured cards. Now that
  every component is documented they no longer carry information.

- **Removed the legacy `components-showcase.html` link** from every
  sidebar's Reference section. The monolith is preserved on disk for
  history but the per-component pages are the source of truth and
  the catalog is the single entry point.

- **Promoted templates landing page** (`templates/index.html`) — copy
  rewritten from "Blocks: Full-page examples" to "Templates: Full-page
  templates" to match the rename.

- **Theme Builder polish** (`create/index.html`). Added the standard
  `dx-nav` top bar with paths relative to `create/`, linked the full
  RenDS stylesheet stack, removed the redundant in-builder nav since
  the top bar now exposes Docs / Components / Templates / Theme
  Builder. The builder logic itself is unchanged.

### Fixed

- **Tabs panels not rendering and dialog triggers not firing in demo
  pages.** The `<ren-tabs>` custom element had `display: inline` by
  default, which collapsed panels in the live demos; live-demo wrappers
  were swapped to `<div class="ren-tabs">` with inline keyboard JS.
  The `<ren-dialog>` JS had a wrong relative path
  (`../../utils/` should have been `../../../utils/`) — fixed across
  9 source files (`ren-sheet.js`, `ren-combobox.js`, `ren-select.js`,
  `ren-menu.js`, `ren-dialog.js`, `ren-toast.js`, `ren-tabs.js`,
  `ren-field.js`, `ren-radio.js`).

- **Double divider lines inside dialogs.** Removed the
  `border-bottom` on `.ren-dialog-header` and `border-top` on
  `.ren-dialog-footer`; separation is now handled by spacing alone.

- **API table column collapse on component pages.** 4-column
  attribute tables were rendering with columns 2 and 3 at zero
  width because the legacy CSS only sized first/last children.
  Centralized in `.dx-api` with `table-layout: fixed` plus an
  explicit `.dx-api-cols-4` modifier (18% / 32% / 14% / 36%).

- **Code samples truncated.** The hard-coded `max-width: 72ch` on
  demos, tables, and code blocks clipped long lines and made the
  examples unreadable. Removed; added `white-space: pre-wrap` so
  long lines wrap instead of disappearing.

- **Skeleton component page was truncated** (`docs/components/ren-skeleton.html`)
  — the file ended mid-sentence with the literal fragment "on" after
  the lede. Rebuilt with full content (Overview, Demo, Variants —
  line/circle/rectangle, API, Accessibility) and a working pulsing
  preview that respects `prefers-reduced-motion`.

- **Calendar demo cut off mid-month.** The static demo grid only
  rendered days 1–11 of May 2026 instead of the full month. Now
  shows the complete grid (1–31) with appropriate outside days, a
  selected state on day 7, today/hover/disabled visuals, and ARIA
  roles for the grid.

- **Accordion showed two arrows next to each summary.** The native
  disclosure marker wasn't being suppressed on Firefox / non-WebKit
  browsers because the demo CSS only had `::-webkit-details-marker`
  and `list-style: none`. Added an explicit `summary::marker { display:
  none; content: '' }` and replaced the `›` glyph (which rotated 90°
  to look like a corner) with an inline Lucide chevron-down SVG that
  rotates 180° on `[open]`.

- **Context Menu demo did nothing on right-click.** The page had
  `data-context="demo-cm"` but no actual `<ren-context-menu id="demo-cm">`
  attached, so the right-click did nothing. Added a vanilla-JS fallback
  that listens for `contextmenu` on the demo target, positions a
  mock menu (Cut / Copy / Paste / Delete) at the cursor, dismisses
  on click outside or Escape, and supports keyboard focus.

- **Empty State demo used a 📦 emoji.** Replaced with the Lucide
  `package` SVG so the icon respects `currentColor` and renders
  consistently across platforms instead of as a full-color emoji.

- **Seven other component pages had stray emojis** in demo content
  (`ren-banner.html` ✓⚠✕, `ren-form-validation.html` ✕, `ren-menu.html`
  ✎, `ren-multi-step-form.html` ✓, `ren-select.html` 💡, `ren-tag.html`
  ✕, `ren-tooltip.html` ⚙). All swapped for inline Lucide SVGs in
  live demos and `<!-- icon SVG -->` placeholders in code samples.

- **Templates with emoji-as-icon** swapped for Lucide SVGs.
  `landing.html` (◐ ⌨ ⊞ ↯ ◈ ≋ → clock / keyboard / layout-grid /
  plus / edit / lines), `dashboard.html` (📊 📦 👥 🧾 ⚙️ 🔔 👤 📈 →
  chart-bar / package / users / file-text / settings / bell / user /
  trending-up).

- **Hardcoded colors that broke dark mode.** Five files had
  `color: white`, `border: 2px solid white`, or
  `box-shadow: rgba(0,0,0,0.18)` instead of semantic tokens. Replaced
  in `components-showcase.html`, `components.html`, `ren-avatar.html`,
  `ren-multi-step-form.html`, and `templates/blog.html` with
  `var(--color-on-accent)`, `var(--color-on-success)`,
  `var(--color-surface)`, and `var(--shadow-color-5)` as appropriate.

- **`.ren-card-footer-border` over-spacing when stacked directly after
  `.ren-card-header`.** Without a body in between, the footer's
  `padding-top: var(--space-3)` plus the description's line-height extra
  produced ~17px of visual space between the description text and the
  divider line, which read as too loose. Added a contextual rule
  (`.ren-card-header + .ren-card-footer-border { padding-top: var(--space-2); }`)
  that tightens the top padding to 8px when the bordered footer is the
  direct sibling of the header — so the line sits ~9-10px below the
  description text instead of ~17px.

- **Browser-default margin leakage across primitive text classes.**
  Several semantic classes (`.ren-card-title`, `.ren-card-description`,
  `.ren-banner-title`, `.ren-banner-message`, `.ren-field-description`,
  `.ren-field-error`, `.ren-progress-label`, `.ren-progress-value`) are
  typically applied to `<h2>`–`<h4>`, `<p>`, or `<span>`, which carry
  browser-default block margins (~1em top and bottom on h-tags and p).
  When these classes lived inside flex containers with explicit `gap`,
  the browser margins stacked on top of the gap, producing ~40px of
  visual space where 4px was intended. Each class now explicitly resets
  margin (`margin: 0` for unrelated stacks; `margin: 0 0 var(--space-1)`
  for the ones that intentionally set bottom spacing). Closes the
  `.ren-card-header` "huge gap between title and description" issue
  surfaced when reviewing the Card docs page; same root cause swept
  across banner, field, and progress.

### Removed

- `rends/blocks/` directory (renamed to `templates/`).
- "Browse all in one page" reference link from every sidebar
  (legacy showcase preserved on disk but no longer linked from the
  unified nav).
- Stale Playwright artifacts: 310 PNG visual baselines (~48 MB),
  the 45 MB `playwright-report/` HTML output, and old
  `test-results/` JSON. The test source code (4 specs, 3 configs,
  test page, docs) is intact. Next visual run should regenerate
  baselines: `npm run test:visual -- --update-snapshots`.

### Security

### Accessibility milestones

## [0.8.2] — 2026-04-27

Focus: post-0.8.1 polish. Centralizes the three remaining "infinite loop"
animations (spinner, skeleton, icon-spin) on a new family of motion tokens,
and rounds out the theme generator with a "did you mean…" hue suggester for
the rare AAA shortfall case. Closes the last technical loose end carried
over from F7.26 (F7.27). All changes are additive — no public API breaks,
no token renames, no consumer-visible behavior changes.

### Added

- **`suggestAlternativeHues(hex, level, count)`** in
  `themes/theme-generator.js`: searches nearby hues (±15°/±30°/…) at
  constant saturation and lightness for candidates that meet the target
  WCAG level without an AAA shortfall. Exposed on `window.rendsGen`.
- **Shortfall suggestions in the `create/` Generate modal.** When the
  audit report contains a `shortfall` row (hue cannot reach the target
  at any scale step), a yellow callout below the report offers up to
  4 nearby hues that do pass, shown as clickable swatches. Clicking a
  swatch re-runs the generator with that hex.
- **Loop motion tokens** in `tokens/semantic/motion.css`:
  `--duration-loop` (1s), `--duration-loop-slow` (1.5s),
  `--duration-loop-gentle` (2s), `--ease-loop` (linear),
  `--ease-loop-smooth` (breathy material-style rotation),
  `--ease-loop-pulse` (ease-in-out). Designed for continuous
  animations and deliberately do not collapse under
  `prefers-reduced-motion` — a reduced spinner would freeze
  visually. Components using them are expected to swap to a
  reduced-motion variant that also uses loop tokens.

### Changed

- **`ren-spinner`, `ren-skeleton`, `ren-icon`** now consume the
  new loop tokens instead of raw values. Behavior preserved 1:1
  (same durations, same curves, same reduced-motion fallback);
  all three can now be centrally retuned by overriding
  `--duration-loop*` or `--ease-loop*`. Closes the last loose end
  from F7.26.

### Semver notes

Patch bump (0.8.1 → 0.8.2). All changes are additive: a new helper
function, a new UI block that only renders on shortfall, and a new
token family. The migration of spinner/skeleton/icon to loop tokens
preserves resolved values 1:1 — no consumer-visible motion difference.

## [0.8.1] — 2026-04-23

Focus: post-0.8.0 polish. Closes the F7.25–F7.26 loose ends (date-range
picker demo, a11y test hardening, motion-token migration across primitives
and patterns) and repairs five pre-existing broken visual-regression
locators inherited from v0.7.1. No public API or token changes — all
additive or strictly test-internal.

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
- **5 visual-regression tests with broken locators** in
  `tests/visual/visual.spec.cjs`. Pre-existing since v0.7.1, documented
  in the F7.26 phase note.
  - `should render buttons section correctly` — selector
    `h2:has-text("Primitives") ~ .test-subsection:first-child` never
    matched (h2 is the first-child of `.test-section`, the subsection
    div is not). Replaced with `.test-subsection` filtered by a
    `:text-is("Buttons")` h3, which disambiguates from "Radio Buttons".
  - `should render RTL section correctly` — used
    `text="RTL"`-chained navigation that landed on the wrong ancestor;
    replaced with `.test-section:has(h2:has-text("RTL"))`, pinning to
    the expected section directly.
  - `should render RTL layout correctly`, `should verify RTL text
    direction`, `should verify flex order in RTL` — all used
    `page.locator('dir=rtl')`, which is not a valid Playwright selector
    engine prefix and silently matched nothing. Replaced with the CSS
    attribute selector `[dir="rtl"]`.
  - `should display all component sections` — used
    `text="${section}"` exact-match inside a loop that included
    `"RTL"`, which never matched the full heading
    `RTL (Right-to-Left)`. Replaced with
    `page.getByText(section, { exact: false })`.

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

[Unreleased]: https://github.com/Rensoconese/ren10/compare/v0.9.2...HEAD
[0.9.2]: https://github.com/Rensoconese/ren10/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/Rensoconese/ren10/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/Rensoconese/ren10/compare/v0.8.6...v0.9.0
[0.8.6]: https://github.com/Rensoconese/ren10/compare/v0.8.5...v0.8.6
[0.8.5]: https://github.com/Rensoconese/ren10/compare/v0.8.4...v0.8.5
[0.8.4]: https://github.com/Rensoconese/ren10/compare/v0.8.3...v0.8.4
[0.8.3]: https://github.com/Rensoconese/ren10/compare/v0.8.2...v0.8.3
[0.8.2]: https://github.com/Rensoconese/ren10/compare/v0.8.1...v0.8.2
[0.8.1]: https://github.com/Rensoconese/ren10/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/Rensoconese/ren10/compare/v0.7.1...v0.8.0
[0.7.1]: https://github.com/Rensoconese/ren10/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/Rensoconese/ren10/releases/tag/v0.7.0
[0.6.0]: https://github.com/Rensoconese/ren10/releases/tag/v0.6.0
[0.5.0]: https://github.com/Rensoconese/ren10/releases/tag/v0.5.0
[0.4.0]: https://github.com/Rensoconese/ren10/releases/tag/v0.4.0
