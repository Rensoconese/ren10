# RenDS P1/P2 Contract-First Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make RenDS 0.9.3 satisfy every revalidated P1 contract, then every revalidated P2 contract, prove the result with a fresh full audit, and produce the separate exhaustive plan for future additions.

**Architecture:** Establish machine-checkable CSS and public-API invariants first, then repair component behavior in shared-state groups, then align CLI/docs/package surfaces. A hard P1 audit gate prevents P2 work from masking unresolved blockers. Every behavior change follows RED/GREEN and receives an independent task review.

**Tech Stack:** Vanilla HTML/CSS/ESM JavaScript, Node.js 20+, Playwright, axe-core, Stylelint, npm package/tarball smokes, SQLite/JSON knowledge artifacts.

## Global Constraints

- Work only in `/Users/rensoconese/RenDS/rends-p1-p2` on `codex/rends-p1-p2` until final integration.
- Preserve the dirty source checkout and never touch its `ROADMAP.md`, `STATUS.md`, or `ENHANCEMENT-PLAN.md`.
- Vanilla HTML/CSS/JavaScript only; no framework, Tailwind, Shadow DOM, or simulated native controls.
- Colocated contracts are the API target unless they contradict native HTML, WCAG 2.1 AA, or root hard rules.
- No production change without a focused test observed failing for the intended reason first.
- No P2 task starts until Task 12 proves that the P1 inventory is empty.
- Do not add future catalogue components during remediation.
- Update contracts, docs, examples, evals, and knowledge whenever a public API changes.

---

### Task 1: CSS contract validators

**Files:**
- Create: `scripts/check-css-contracts.mjs`
- Create: `scripts/check-css-contracts.test.mjs`
- Modify: `package.json`
- Modify: `scripts/lint-tokens.mjs`

**Interfaces:**
- Produces `npm run lint:contracts`.
- Reports unresolved custom properties, unconsumed central component tokens, and contract tokens absent from CSS.
- Later Tasks 2–5 consume its diagnostics as a finite worklist.

- [ ] **Step 1: Write a failing fixture-driven test**

  The test must create temporary CSS containing one declared variable, one unresolved variable, one unresolved variable with a fallback, and one public `--ren-*` declaration that is never consumed. It must assert these diagnostics exactly:

  ```js
  assert.deepEqual(result.unresolved, ['--missing']);
  assert.deepEqual(result.unconsumed, ['--ren-demo-bg']);
  assert.equal(result.errors.length, 2);
  ```

- [ ] **Step 2: Verify RED**

  Run: `node scripts/check-css-contracts.test.mjs`

  Expected: failure because `check-css-contracts.mjs` does not exist.

- [ ] **Step 3: Implement the validator**

  Parse every CSS file under `tokens/`, `base/`, and `components/`. Collect declarations, `var()` references, inline fallbacks, and JS `style.setProperty()` assignments. Allow instance variables only through an explicit exported set containing intentional runtime inputs such as `--value` and `--scroll-max`; do not allow unresolved `--ren-*` or `--color-*` names.

  For the Appearance API, collect all declarations from `tokens/component/tokens.css` and require a `var(--token)` consumer outside that file.

- [ ] **Step 4: Connect the validator to lint and verify the repository fails**

  Add:

  ```json
  "lint:contracts": "node scripts/check-css-contracts.mjs",
  "lint": "npm run lint:css && npm run lint:tokens && npm run lint:contracts"
  ```

  Run: `npm run lint:contracts`

  Expected: failure listing the 307 unconsumed Appearance tokens and unresolved tooltip/nav/sidebar/command variables.

- [ ] **Step 5: Commit**

  Commit message: `test: enforce CSS contract integrity`

### Task 2: Appearance API defaults and primitive consumption

**Files:**
- Modify: `tokens/component/tokens.css`
- Modify: `themes/appearance.css`
- Modify: all CSS under `components/primitives/*/`
- Create: `tests/components/fixtures/component-token-overrides.html`
- Create: `tests/components/foundation-contract.spec.cjs`

**Interfaces:**
- Consumes `npm run lint:contracts` from Task 1.
- Produces root/scope-overridable `--ren-*` defaults and computed-style coverage for representative primitives.

- [ ] **Step 1: Add computed-style tests for button, card, field, badge, and switch**

  Each fixture applies a root override and a closer scoped override. Assertions must verify values such as:

  ```js
  await expect.poll(() => button.evaluate((el) => getComputedStyle(el).borderRadius)).toBe('23px');
  await expect.poll(() => card.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(1, 2, 3)');
  ```

- [ ] **Step 2: Verify RED**

  Run: `npx playwright test --config tests/components/playwright.config.cjs tests/components/foundation-contract.spec.cjs --project='Desktop Light'`

  Expected: overrides do not change computed styles.

- [ ] **Step 3: Move central defaults to an inheritable scope and consume every primitive token**

  Before wiring a token, reconcile its default with the current computed CSS and the colocated contract so activating the API does not silently redesign the component. In particular, normalize icon, spinner, field, checkbox/radio border, switch, tag, skeleton, breadcrumb, and `--ren-btn-font-weight` defaults identified by the Task 2 audit.

  Component rules must read their public properties, for example:

  ```css
  min-height: var(--ren-btn-height);
  padding: var(--ren-btn-padding-y) var(--ren-btn-padding-x);
  border-radius: var(--ren-btn-radius);
  background: var(--ren-btn-bg);
  color: var(--ren-btn-color);
  ```

  Use `--ren-field-border-color: var(--color-border-interactive)` and rename the stale theme override to `--ren-btn-font-weight`.

- [ ] **Step 4: Run focused and static checks**

  Run the Playwright test, `npm run lint:contracts`, and `npm run lint:css`.

  Expected: primitive override tests pass; all 129 primitive tokens are consumed and exactly 178 unconsumed diagnostics remain, naming only composite/pattern families. Compare representative light/dark computed styles before and after the wiring to catch unintended visual default changes.

- [ ] **Step 5: Commit**

  Commit message: `fix: connect primitive Appearance tokens`

### Task 3: Composite and pattern Appearance API consumption

**Files:**
- Modify: all CSS under `components/composites/*/` that has a central `--ren-*` family
- Modify: all CSS under `components/patterns/*/` that has a central `--ren-*` family
- Modify: `components/composites/ren-tooltip/ren-tooltip.js`
- Modify: `components/composites/ren-toast/ren-toast.js`
- Modify: `scripts/check-css-contracts.mjs`
- Modify: `scripts/check-css-contracts.test.mjs`
- Modify: `tests/components/fixtures/component-token-overrides.html`
- Modify: `tests/components/foundation-contract.spec.cjs`

**Interfaces:**
- Consumes the token defaults established in Task 2.
- Produces zero unconsumed central component tokens.

- [ ] **Step 1: Extend RED coverage**

  Add computed overrides for dialog, tooltip, popover, tabs, calendar, menu, sidebar, table, form, nav, command, and AI surfaces. Use one geometry, one color, and one motion property across the set.

- [ ] **Step 2: Verify RED**

  Run the focused Playwright file and confirm the new assertions fail.

- [ ] **Step 3: Replace direct values with public token consumption**

  Move all 138 composite and 40 pattern defaults from component-local selectors to `:where(:root, [data-theme])` scopes before consuming them. Preserve semantic fallbacks in the central defaults and modifier semantics in local classes. Do not create public tokens not already declared by a contract. Keep `--ren-hover-card-anchor` classified as a CSS dashed identifier, not an Appearance token.

  Runtime tokens must have runtime consumers: `ren-tooltip` reads `--ren-tooltip-delay` for hover/focus scheduling, and `ren-toast` reads `--ren-toast-duration` for its default dwell/progress timer while explicit status/options remain authoritative. Extend the contract checker and fixture to recognize literal `getComputedStyle(...).getPropertyValue('--ren-*')` reads; never add a cosmetic CSS `var()` solely to silence the validator.

  Correct the known implementation hazards while wiring the public properties: slider thumb pseudo-element selectors, menu/context-menu inheritance, date-picker/date-range calendar composition, and calendar width/day-size propagation. Preserve compact/small variants for the later P2 touch audit.

- [ ] **Step 4: Verify all 309 central tokens are consumed**

  Run: `npm run lint:contracts`

  Expected: zero unconsumed Appearance tokens, zero new unresolved properties, and zero false contract tokens for dashed identifiers. The checker must report runtime reads as consumers and must not report a token as consumed if only an inert CSS declaration was added.

- [ ] **Step 5: Commit**

  Commit message: `fix: connect composite and pattern Appearance tokens`

### Task 4: Undefined custom properties and real cascade layers

**Files:**
- Modify: `components/composites/ren-tooltip/ren-tooltip.css`
- Modify: `components/patterns/ren-nav/ren-nav.css`
- Modify: `components/patterns/ren-sidebar/ren-sidebar.css`
- Modify: `components/patterns/ren-command/ren-command.css`
- Modify: `base/layouts.css`
- Modify: `index.css`
- Modify: `base/index.css`
- Modify: `components/index.css`
- Modify: `docs/foundations/cascade-layers.html`
- Create: `tests/components/fixtures/cascade-contract.html`
- Modify: `tests/components/foundation-contract.spec.cjs`

**Interfaces:**
- Produces five populated top-level layers in order: reset, tokens, base, components, utilities.
- Keeps app CSS outside a layer stronger than RenDS styles.

- [ ] **Step 1: Add RED tests**

  Assert that tooltip has an opaque semantic background, sidebar/nav/command have nontransparent surfaces, app CSS wins without `!important`, and `.ren-visually-hidden` is sourced from the utilities layer.

- [ ] **Step 2: Verify RED and static diagnostics**

  Run the focused Playwright file and `npm run lint:contracts`; confirm both fail for current unresolved aliases/layering.

- [ ] **Step 3: Replace legacy aliases with canonical semantics**

  Map surface, text, fill, accent, border, and separator references to existing `--color-*` names. Give `--container-name` an explicit consumer fallback rather than a silent unresolved reference.

- [ ] **Step 4: Restructure entrypoints**

  `base/index.css` must import reset with `layer(reset)`, content files with `layer(base)`, and utilities with `layer(utilities)`. `components/index.css` must import each component with `layer(components)`. `index.css` declares order and imports tokens, base, and components exactly once.

- [ ] **Step 5: Verify and commit**

  Run focused tests, `npm run lint`, and `npm run test:exports`.

  Commit message: `fix: enforce CSS variables and cascade layers`

### Task 5: Theme contrast, AAA mode, and progressive enhancement

**Files:**
- Modify: `themes/appearance.css`
- Modify: `themes/theme-generator.test.js`
- Modify: `base/utilities.css`
- Modify: `ren-design.md`
- Modify: `README.md`
- Create: `tests/components/fixtures/theme-progressive-contract.html`
- Modify: `tests/components/foundation-contract.spec.cjs`

**Interfaces:**
- Produces AA-valid accent/on-accent pairs for all nine themes.
- Produces a real `[data-contrast="aaa"]` scope with normal-text pairs at or above 7:1.
- Leaves custom-element content visible when JavaScript is absent.

- [ ] **Step 1: Expand theme tests to all nine named themes and AAA**

  Parse the shipped values and assert:

  ```js
  assert.ok(contrast(onAccent, accent) >= 4.5);
  assert.ok(contrast(aaaText, aaaSurface) >= 7);
  ```

  Add a no-JS fixture containing field, accordion, nav, form, and tooltip markup and assert each host has opacity greater than zero.

- [ ] **Step 2: Verify RED**

  Run `npm run test:theme` and the focused Playwright test. Forest, sunset, AAA, and no-JS visibility must fail.

- [ ] **Step 3: Implement contrast and visibility contracts**

  Give forest/sunset explicit compatible on-accent values. Add AAA overrides after named themes so the contrast scope wins. Remove the global `:not(:defined) { opacity: 0 }` list; any future pending state must be explicit via `[data-ren-pending]`.

- [ ] **Step 4: Verify and commit**

  Run theme, component, lint, and a11y suites.

  Commit message: `fix: deliver contrast and progressive enhancement contracts`

### Task 6: Forms and field contract

**Files:**
- Modify: `components/patterns/ren-form/ren-form.js`
- Modify: `components/patterns/ren-form/pattern.md`
- Modify: `components/primitives/ren-field/ren-field.js`
- Create: `tests/components/fixtures/form-contract.html`
- Create: `tests/components/form-contract.spec.cjs`

**Interfaces:**
- Produces native Constraint Validation plus `data-rules`, async submitting state, repeated-value arrays, real step scoping, and reconnect-safe field listeners.

- [ ] **Step 1: Add RED tests**

  Cover custom-element field discovery, native required/email/pattern/min/max, rules on the control, current-step-only validation, stable summary focus, async disable duration, repeated names, reset, and reconnect.

- [ ] **Step 2: Verify RED**

  Run only `form-contract.spec.cjs`; confirm failures correspond to missing behavior.

- [ ] **Step 3: Implement native-plus-custom validation**

  Query both `ren-field` and `.ren-field`, use `checkValidity()`/`validity`, merge custom rule errors, keep focus on the summary until the user follows an error link, and represent repeated `FormData` keys as arrays.

  Async submission uses a cancelable `ren-submit` contract with an explicit completion promise or method; remove the fixed 100 ms timer.

- [ ] **Step 4: Implement step and lifecycle behavior**

  Scope fields to the active step, update hidden/active panels, restore focus predictably, and use an AbortController recreated on each connect.

- [ ] **Step 5: Verify and commit**

  Run form tests, existing interaction hardening, a11y, and lint.

  Commit message: `fix: complete form and field contracts`

### Task 7: Local-date stack

**Files:**
- Create: `utils/local-date.js`
- Modify: `utils/index.js`
- Modify: `components/composites/ren-calendar/ren-calendar.js`
- Modify: `components/composites/ren-date-picker/ren-date-picker.js`
- Modify: `components/composites/ren-date-range-picker/ren-date-range-picker.js`
- Modify: the three colocated contracts
- Create: `tests/components/fixtures/date-contract.html`
- Create: `tests/components/date-contract.spec.cjs`

**Interfaces:**
- Produces `parseLocalDate(iso)`, `formatLocalDate(date)`, and `clampLocalDate(date, min, max)` without UTC conversion.

- [ ] **Step 1: Add RED timezone and interaction tests**

  Run fixtures under `America/Argentina/Buenos_Aires` and `Pacific/Auckland`; `2026-03-31` must remain identical through parse, display, selection, hidden input, and reset. Cover cross-calendar range, preset bounds, Escape inside grids, and focus preservation.

- [ ] **Step 2: Verify RED**

  Run `date-contract.spec.cjs` in both timezones and record date shifts/empty hidden fields.

- [ ] **Step 3: Implement the shared local-date utility and hidden-input order**

  Parse ISO components with `new Date(year, month - 1, day)` and serialize local getters with zero-padding. Create form internals before applying initial values.

- [ ] **Step 4: Unify range draft state and keyboard semantics**

  The host owns one draft range shared by both calendars. Calendar navigation buttons are `type="button"`; selection rerender restores the intended day; presets implement listbox keyboard behavior and respect min/max.

- [ ] **Step 5: Verify and commit**

  Run date tests, interaction tests, a11y, and utility export tests.

  Commit message: `fix: make date controls local and form-safe`

### Task 8: Selection, menu, and context-menu contracts

**Files:**
- Modify: `utils/keyboard-nav.js`
- Modify: `components/composites/ren-select/ren-select.js`
- Modify: `components/composites/ren-select/ren-select.css`
- Modify: `components/composites/ren-select/component.md`
- Modify: `components/composites/ren-menu/ren-menu.js`
- Modify: `components/composites/ren-menu/ren-menu.css`
- Modify: `components/composites/ren-menu/component.md`
- Modify: `components/composites/ren-context-menu/ren-context-menu.js`
- Modify: `components/composites/ren-context-menu/ren-context-menu.css`
- Modify: `components/composites/ren-context-menu/component.md`
- Create: `tests/components/fixtures/select-menu-contract.html`
- Create: `tests/components/select-menu-contract.spec.cjs`

**Interfaces:**
- Produces a single context-menu implementation and a true array-valued select multiple API.

- [ ] **Step 1: Add RED tests**

  Cover A+B accumulation, chips/removal, repeated FormData values, get/set API, `aria-disabled="false"`, two independent triggers, Shift+F10/Menu key, left-click non-opening, Escape focus restoration, and reconnect exactly-once events.

- [ ] **Step 2: Verify RED**

  Run the focused test and confirm each missing contract fails.

- [ ] **Step 3: Implement array state and one context-menu path**

  Multiple select stores an ordered array, renders/removes chips, and writes one hidden input per value. `aria-disabled` is disabled only when its normalized value equals `true`. Export/register context menu from one module and make the other path a compatibility re-export.

- [ ] **Step 4: Scope triggers and lifecycle**

  Resolve triggers relative to each host or explicit ID, store listener functions/AbortControllers, and restore focus to the contextual target.

- [ ] **Step 5: Verify and commit**

  Run focused tests, interaction hardening, exports, and a11y.

  Commit message: `fix: complete selection and context menu behavior`

### Task 9: Dialog, sheet, and alert state machines

**Files:**
- Modify: `components/composites/ren-dialog/ren-dialog.js`
- Modify: `components/composites/ren-alert-dialog/component.md`
- Modify: `components/composites/ren-sheet/ren-sheet.js`
- Modify: associated CSS/contracts
- Create: `tests/components/fixtures/dialog-contract.html`
- Create: `tests/components/dialog-contract.spec.cjs`

**Interfaces:**
- Produces one close synchronization path for Escape, native close, form method=dialog, backdrop, and programmatic close.

- [ ] **Step 1: Add RED tests**

  Assert alert/no-escape blocks Escape; normal dialog closes once; native form close synchronizes host/open/inert/returnValue/focus; sheet Escape synchronizes; reconnect works; changing alert updates role/class/closedBy.

- [ ] **Step 2: Verify RED**

  Run the focused test and confirm current inverted/missing branches fail.

- [ ] **Step 3: Implement a single native-event reconciliation path**

  Handle `cancel` with `preventDefault()` when alert/no-escape applies. On native `close`, always update host state, release locks/traps, dispatch exactly one `ren-close`, and restore focus. Recreate lifecycle controllers on reconnect.

- [ ] **Step 4: Verify and commit**

  Run dialog tests, existing returnValue regression, lifecycle fixture, and a11y.

  Commit message: `fix: synchronize dialog and sheet state`

### Task 10: Keyboard, focus, tooltip, and media contracts

**Files:**
- Modify: `components/composites/ren-number-field/ren-number-field.js`, `ren-number-field.css`, and `component.md`
- Modify: `components/composites/ren-slider/ren-slider.js`, `ren-slider.css`, and `component.md`
- Modify: `components/patterns/ren-command/ren-command.js`, `ren-command.css`, and `pattern.md`
- Modify: `components/composites/ren-color-picker/ren-color-picker.js`, `ren-color-picker.css`, and `component.md`
- Modify: `components/composites/ren-combobox/ren-combobox.js`, `ren-combobox.css`, and `component.md`
- Modify: `components/composites/ren-tabs/ren-tabs.js`, `ren-tabs.css`, and `component.md`
- Modify: `components/composites/ren-toggle-group/ren-toggle-group.js`, `ren-toggle-group.css`, and `component.md`
- Modify: `components/primitives/ren-radio/ren-radio.js`, `ren-radio.css`, and `component.md`
- Modify: `components/composites/ren-carousel/ren-carousel.js`, `ren-carousel.css`, and `component.md`
- Modify: `components/composites/ren-tooltip/ren-tooltip.js`, `ren-tooltip.css`, and `component.md`
- Create: `tests/components/fixtures/keyboard-contract.html`
- Create: `tests/components/keyboard-contract.spec.cjs`

**Interfaces:**
- Produces consistent disabled filtering, roving focus, activedescendant, dual slider, and Escape behavior.

- [ ] **Step 1: Add RED tests**

  Cover number button keyboard/no-submit, command two-arrow activedescendant, color saturation keyboard, disabled skipping, carousel nested-input arrows, reduced-motion scroll behavior, dual slider values/events, tooltip describedby composition/Escape/cleanup, and reconnect exactly once.

- [ ] **Step 2: Verify RED**

  Run the focused test and preserve separate assertions for every component.

- [ ] **Step 3: Implement native keyboard paths**

  Generated stepper buttons use `type="button"` and native `click`; command retains focus in input; color saturation exposes an operable slider-like keyboard surface; dual slider manages both inputs; carousel ignores keystrokes originating in editable/range controls.

- [ ] **Step 4: Implement focus/lifecycle contracts**

  Compose rather than replace `aria-describedby`, remove owned IDs on disconnect, close tooltip on Escape, skip disabled controls, and recreate controllers/listeners on reconnect.

- [ ] **Step 5: Verify and commit**

  Run keyboard, interaction, a11y, and component suites.

  Commit message: `fix: complete keyboard and focus contracts`

### Task 11: Installed CLI dependency graph and agent-docs

**Files:**
- Modify: `cli/registry.js`
- Modify: `cli/index.js`
- Replace/extend: `scripts/smoke-cli-copy.mjs`
- Create: `scripts/smoke-installed-package.mjs`
- Modify: `package.json`

**Interfaces:**
- Registry entries gain explicit `components` and exact `utils` dependencies.
- `add` and `upgrade` resolve the same recursive graph.

- [ ] **Step 1: Add a tarball-installed RED smoke**

  Pack to a temporary directory, install into an empty consumer, run each of the 53 `add` commands separately, recursively resolve every copied JS import, and verify required CSS/component files. Include explicit sheet, date-picker, date-range-picker, and context-menu assertions.

- [ ] **Step 2: Add agent-docs RED assertions**

  Assert consumer `AGENTS.md` changes, package `node_modules/ren10/AGENTS.md` does not, and a second run is byte-identical.

- [ ] **Step 3: Verify RED**

  Run `node scripts/smoke-installed-package.mjs`; confirm missing deps and wrong agent-docs target.

- [ ] **Step 4: Implement graph resolution and project roots**

  Resolve package reads from package root and all consumer writes from `process.cwd()`. `upgrade` repairs missing/new dependencies and partial installs.

- [ ] **Step 5: Verify and commit**

  Run installed smoke, existing smoke, exports, agent checks, and pack dry-run.

  Commit message: `fix: make installed CLI dependency-complete`

### Task 12: Public metadata, events, onboarding, goldens, and P1 gate

**Files:**
- Modify: `cli/registry.js`
- Modify: `components/primitives/*/component.md`, `components/composites/*/component.md`, and `components/patterns/*/pattern.md`
- Modify: `cli/index.js`
- Modify: `docs/foundations/events.html`
- Modify: `docs/getting-started.html`, `README.md`, affected component docs
- Modify: `examples/*.html`, `evals/prompts.json`
- Modify: `package.json`, `utils/index.js`
- Create: `scripts/check-public-contracts.mjs`
- Create: `scripts/check-public-contracts.test.mjs`

**Interfaces:**
- Produces semantically valid canonical usage, event metadata, docs/examples/evals, and exported documented utilities.
- This task is the P1 completion gate.

- [ ] **Step 1: Add RED static validation**

  Fail on placeholder canonical markup, nonexistent documented selectors/tags/imports, event names absent from runtime, runtime events absent from contracts, and eval components absent from shipped CSS/JS.

- [ ] **Step 2: Verify RED**

  Run the checker and confirm it identifies all 46 placeholders, stale registry usages, event mismatches, AI golden classes, and utility exports.

- [ ] **Step 3: Align the public surfaces**

  Replace every placeholder with semantic `aiHints.requiredMarkup`; make dense output include selection criteria, required markup, and canonical usage; correct event name/detail/flags; update onboarding to npm/CLI reality; rebuild goldens with real selectors; export `./utils/*` and `./utils/index.js`.

- [ ] **Step 4: Rebuild derived artifacts**

  Run `npm run knowledge:build`, evals, docs/agent checks, and packlist checks.

- [ ] **Step 5: Execute the P1 audit gate**

  Run all P1-specific static/Playwright tests, `npm run lint`, `npm run agent:check`, `npm run test:a11y`, `npm run test:components`, `npm run test:theme`, installed-package smoke, exports, and knowledge checks. Repeat the audit queries for token consumption, undefined properties, placeholders, invalid selectors/tags, event parity, CLI dependency closure, and runtime contract cases.

  Expected: zero remaining P1. If any P1 remains, create a failing regression and fix it before Task 13.

- [ ] **Step 6: Commit**

  Commit message: `fix: align RenDS public contracts`

### Task 13: P2 foundation behavior

**Files:**
- Modify: `tokens/semantic/spacing.css`, `themes/appearance.css`, `base/layouts.css`
- Modify: `tokens/semantic/typography.css`, `base/reset.css`, `base/classless.css`
- Modify: `base/grid.css`, `tokens/semantic/motion.css`, and component CSS files named by the failing reduced-motion assertions
- Create: `tests/components/fixtures/foundation-p2.html`
- Create: `tests/components/foundation-p2.spec.cjs`

**Interfaces:**
- Density changes visual rhythm but never reduces touch targets below 44×44.
- Body/heading typography roles are consumed.
- Grid and reduced-motion contracts are computed, not prose-only.

- [ ] **Step 1: Add RED tests**

  Assert monotonic compact/default/spacious gaps, default=comfortable, 44×44 touch sizes, amber body/heading families, 1280px page-grid cap, valid standalone prose grid, zero non-loop durations, and intentional spinner gentle feedback.

- [ ] **Step 2: Verify RED**

  Run the focused test and record density, typography, grid, and motion failures.

- [ ] **Step 3: Consolidate density/typography/grid/motion**

  Remove primitive size mutation from density, route layouts/components through semantic density values, consume `--font-body`/`--font-heading`, use `--width-7xl`, define prose-grid internals locally, and remove the global 0.01ms reset in favor of token/component alternatives.

- [ ] **Step 4: Verify and commit**

  Run foundation, a11y, visual-computed, lint, and theme tests.

  Commit message: `fix: complete density typography grid and motion`

### Task 14: P2 package size, bundles, and budgets

**Files:**
- Modify: `scripts/build-knowledge-graph.mjs`
- Modify: `scripts/check-knowledge-graph.mjs`
- Create: `scripts/build-css-bundles.mjs`
- Create: `scripts/check-package-budgets.mjs`
- Modify: `package.json`, package lock, exports/files
- Add generated, versioned artifacts under `dist/`

**Interfaces:**
- Produces source-equivalent full/foundation/component CSS bundles and minified variants.
- Produces enforced tarball, unpacked, knowledge, CSS, request-count, and CLI-memory budgets.

- [ ] **Step 1: Add RED budget and bundle tests**

  Capture current measured values, then set explicit improvement targets in the checker. Require recursive import closure and selector/custom-property parity between source and bundles.

- [ ] **Step 2: Verify RED**

  Run budget checker; current 16.4 MB unpacked package, duplicated knowledge bodies, and missing bundles must fail.

- [ ] **Step 3: Remove knowledge duplication and build bundles**

  Store full source bodies once in the graph representation, preserve SQLite search/fallback correctness, and generate deterministic CSS artifacts without runtime dependencies or postinstall scripts.

- [ ] **Step 4: Verify and commit**

  Rebuild twice and compare hashes, run knowledge queries, package budgets, exports, `npm pack --dry-run`, and install the tarball externally.

  Commit message: `perf: reduce package and publish CSS bundles`

### Task 15: P2 tooling, security, release, compatibility, and visual portability

**Files:**
- Create: `eslint.config.js`
- Modify: `package.json`, `package-lock.json`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`
- Modify: `CHANGELOG.md`, `SHIPPING.md`, `README.md`, `CONTRIBUTING.md`
- Create: `COMPATIBILITY.md`, `MIGRATION.md`
- Create/modify: `scripts/check-release.mjs`, `scripts/check-package-budgets.mjs`
- Modify: `tests/visual/playwright.config.cjs`, `tests/visual/visual.spec.cjs`, and `.gitignore`
- Modify: `scripts/check-agent-skill.mjs`, `scripts/pack-agent-skill.mjs`, and the skill-related CLI commands in `cli/index.js`

**Interfaces:**
- `npm run lint` includes JavaScript.
- Runtime audit is zero and full audit has no moderate-or-higher vulnerability.
- Local `npm test` is portable; Linux visual gate remains authoritative.

- [ ] **Step 1: Add RED checks**

  Require JS lint, `npm audit --audit-level=moderate`, Node engine metadata, current changelog section/link, compatibility and migration files, visual policy detection, and skill/package version parity in a temporary HOME.

- [ ] **Step 2: Verify RED**

  Run each check; confirm missing ESLint/metadata/docs, js-yaml 4.1.1, stale shipping, and first-run Darwin visual failure.

- [ ] **Step 3: Implement tooling and policies**

  Add ESLint with browser/Node globals by directory; update the vulnerable dev dependency through supported package resolution; declare tested Node versions; make release fail without changelog; document actual browser feature/fallback support; separate portable `npm test` from Linux snapshot gate or run the gate in a documented Linux container.

- [ ] **Step 4: Add skill install/status/doctor coverage**

  Test against a temporary HOME, detect old versions and nonexistent `components/all.css`, and expose an explicit update path. Do not mutate the real installed skill until repository behavior passes.

- [ ] **Step 5: Verify and commit**

  Run lint, audits, release checks, CI-equivalent package tests, portable test, and skill checks.

  Commit message: `chore: harden tooling release and compatibility`

### Task 16: P2 lifecycle, touch, reactivity, and ARIA matrix

**Files:**
- Create: `tests/components/lifecycle-touch-contract.spec.cjs`
- Create: registry-driven fixtures/helpers
- Modify after a recorded RED failure: the matching JS/CSS/contract files under `components/primitives/`, `components/composites/`, or `components/patterns/`; the known audit set starts with accordion, OTP input, tabs, menubar, field, menu, context menu, color picker, carousel, button, pagination, toolbar, toast, sidebar, calendar, slider, and table

**Interfaces:**
- Covers all 32 JavaScript entrypoints and every interactive control under a touch-capable project.

- [ ] **Step 1: Add registry-driven RED tests**

  Mount/remove/reinsert every JS component and assert one action/event. Measure every interactive target with both `width >= 44` and `height >= 44` when `hasTouch` is true. Test dynamic attribute/item/option changes and carousel ARIA/autoplay visibility behavior.

- [ ] **Step 2: Verify RED**

  Run the matrix and record failures by component; do not weaken assertions with `Math.max` or partial sampling.

- [ ] **Step 3: Repair lifecycle, targets, and reactivity**

  Use reconnect-safe controllers, explicit non-touch compact variants, expanded hit areas where visual size remains small, observed attributes/mutations where contracts promise reactivity, and valid carousel relationships/live behavior.

- [ ] **Step 4: Verify and commit**

  Run the matrix in Chromium plus advisory Firefox/WebKit, then component and a11y suites.

  Commit message: `fix: harden lifecycle touch and reactive behavior`

### Task 17: Full completion audit and future-additions plan

**Files:**
- Create: `docs/audits/2026-07-09-rends-p1-p2-verification.md`
- Create: `docs/superpowers/plans/2026-07-09-rends-future-additions.md`
- Modify after a recorded RED failure: the exact production, contract, or test path named alongside that finding in the verification report

**Interfaces:**
- Produces requirement-by-requirement completion evidence.
- Produces the requested exhaustive future plan without implementing it.

- [ ] **Step 1: Re-run the original audit from current files**

  Re-read all 53 contracts, rescan CSS/JS/docs/CLI/package, exercise actual browser flows, inspect tarball contents/sizes/imports, and compare every original P1/P2 item to authoritative evidence.

- [ ] **Step 2: Fix every escaped P1/P2 through RED/GREEN**

  Any finding creates a focused regression test and reviewed fix before continuing. Record commands and outputs in the verification report.

- [ ] **Step 3: Run fresh full verification**

  Run lint, all static contract checks, agent checks, a11y, components, themes, portable tests, Linux visual gate policy, exports, installed CLI/tarball, knowledge, package budgets, audits, and release checks. Record exact pass/fail counts and artifact hashes.

- [ ] **Step 4: Write the exhaustive future-additions plan**

  Cover canonical manifests, validators, recursive dependency graphs, 53-component contract generation, full Playwright matrices, tarball environments, nine-theme/AAA coverage, budgets, compatibility/migration/deprecation, and carefully selected future components. Include architecture, interfaces, exact files, TDD steps, migration, rollout, risks, and acceptance gates.

- [ ] **Step 5: Self-review both documents**

  Scan for placeholders, contradictions, missing original requirements, mismatched interfaces, and evidence weaker than the requirement it claims to prove.

- [ ] **Step 6: Final whole-branch review and integration**

  Generate a full review package from the pre-remediation merge base, dispatch independent spec/quality review, fix all Critical/Important findings, rerun full verification, then fast-forward/integrate without touching the user's dirty planning files.

  Commit message: `docs: verify remediation and plan future additions`
