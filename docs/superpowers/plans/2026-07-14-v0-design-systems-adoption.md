# v0 Design Systems Adoption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a verified, versioned Ren10 adapter for v0 with a vanilla starter, canonical consumer application, source provenance, visual approval evidence, lifecycle gates, and application-level agent evals.

**Architecture:** Keep Ren10 contracts and the CLI as the only API source of truth. The distributable skill gains a v0 adapter, pinned provenance, and a self-contained vanilla starter; a separate reference app demonstrates complete real-world consumption. Existing doctor, skill, release, Playwright, and eval surfaces validate these artifacts rather than introducing a competing documentation system.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Node.js ESM, JSON Schema-style validation without new runtime dependencies, Playwright, axe, Ren10 CLI and contracts.

## Global Constraints

- Vanilla HTML, CSS, and JavaScript only; no React, Vue, Svelte, JSX, TSX, Tailwind, or shadcn/ui.
- Light DOM only; real native interactive elements; WCAG 2.1 AA baseline.
- Load `ren-design.md`, `tokens/tokens.md`, `base/layouts.md`, `base/primitive-zero.md`, `components/components.md`, and every selected colocated component contract before UI implementation.
- Use Ren10 layout primitives instead of bespoke flex/grid page skeletons.
- Use semantic or component tokens; no primitive palette tokens or hardcoded chromatic colors in consumer UI.
- `_archive/`, the legacy `rends-skill/`, root phase/status planning notes, and unverified Figma material are never authoritative sources.
- Preserve user changes in `ROADMAP.md`, `STATUS.md`, and `ENHANCEMENT-PLAN.md`; this project must not modify them.
- Adapter, package, starter, and provenance versions must remain synchronized with `package.json`.
- No new production dependency is allowed for adapter validation.

---

### Task 1: Official v0 adapter and vanilla starter

**Files:**
- Create: `skills/rends/v0.json`
- Create: `skills/rends/sources.json`
- Create: `skills/rends/assets/starter/package.json`
- Create: `skills/rends/assets/starter/index.html`
- Create: `skills/rends/assets/starter/app.js`
- Create: `skills/rends/assets/starter/README.md`
- Create: `scripts/check-v0-adapter.mjs`
- Create: `scripts/check-v0-adapter.test.mjs`

**Interfaces:**
- Consumes: `package.json` version, v0 schema version 1, GitHub source `Rensoconese/ren10`, Ren10 CDN/package imports and canonical component contracts.
- Produces: `validateV0Adapter(root)` returning `{ ok, checks, errors }`; `v0.json` uses `starter.source = "skill-directory"` and `starter.path = "assets/starter"`.

- [ ] Write failing Node tests covering missing starter files, version drift, forbidden framework dependencies/strings, invalid source roots, archive/legacy sources, and a valid checked-in adapter.
- [ ] Run `node --test scripts/check-v0-adapter.test.mjs`; expect failures because validator and adapter do not exist.
- [ ] Implement `sources.json` with package name/version, canonical GitHub ref, allowed roots and explicit exclusions.
- [ ] Implement schema-version-1 `v0.json` with a read-only GitHub reference source and `skill-directory` starter.
- [ ] Implement a dependency-light vanilla starter containing a dashboard/settings composition, light/dark control, canonical CSS/JS imports, semantic markup, and reduced-motion-safe behavior.
- [ ] Implement the reusable validator and CLI exit behavior in `check-v0-adapter.mjs` without third-party dependencies.
- [ ] Run `node --test scripts/check-v0-adapter.test.mjs` and `node scripts/check-v0-adapter.mjs`; expect PASS.

### Task 2: Canonical consumer app and visual approval artifact

**Files:**
- Create: `examples/reference-app/index.html`
- Create: `examples/reference-app/app.js`
- Create: `examples/reference-app/README.md`
- Create: `examples/reference-app/starter-validation.json`
- Create: `tests/agent-starter/playwright.config.cjs`
- Create: `tests/agent-starter/reference-app.spec.js`
- Create: `scripts/check-starter-approval.mjs`
- Create: `scripts/check-starter-approval.test.mjs`

**Interfaces:**
- Consumes: package source imports, golden examples, component contracts, Playwright browsers and the repository's axe helper conventions.
- Produces: `validateStarterApproval(root)` returning `{ ok, checks, errors }`; approval JSON records schema version, package version, artifact path, deterministic content hash, scenarios, accessibility requirement, themes, and approval status.

- [ ] Write failing validator tests for stale package versions, wrong hashes, missing scenarios, missing themes, and unapproved state.
- [ ] Run `node --test scripts/check-starter-approval.test.mjs`; expect RED.
- [ ] Build a cohesive reference application exercising shell/sidebar, settings form, table, dialog, status/empty feedback, theme switching, keyboard behavior, and reduced motion using only contracted Ren10 APIs.
- [ ] Add Playwright coverage for loading, theme switching, dialog keyboard/focus behavior, form naming, absence of horizontal overflow, and axe violations.
- [ ] Implement deterministic hash validation and create the approved `starter-validation.json` for the checked-in reference app.
- [ ] Run `node --test scripts/check-starter-approval.test.mjs` and the focused Playwright suite; expect PASS.

### Task 3: Doctor, skill, and release lifecycle integration

**Files:**
- Modify: `cli/index.js`
- Modify: `scripts/check-agent-skill.mjs`
- Modify: `scripts/check-release.mjs`
- Modify: `scripts/check-release-p2.test.mjs`
- Modify: `scripts/smoke-agent-cli.mjs`
- Modify: `scripts/smoke-installed-package.mjs`

**Interfaces:**
- Consumes: `validateV0Adapter(root)` and `validateStarterApproval(root)` from Tasks 1 and 2.
- Produces: doctor checks named `v0-adapter` and `starter-approval`; skill/release failures on missing, invalid, stale, or unpackaged adapter assets; installed-tarball verification.

- [ ] Add RED assertions to CLI smoke, release-policy, skill, and installed-package coverage for adapter discovery, validation, pack inclusion, and version drift.
- [ ] Run focused tests and confirm failure against the pre-integration CLI.
- [ ] Integrate both reusable validators into doctor JSON/text output, `agent:skill:check`, and release checks with actionable diagnostics.
- [ ] Extend installed-package smoke so the packed skill includes `v0.json`, `sources.json`, and all starter files and validates outside the repository.
- [ ] Run `node scripts/smoke-agent-cli.mjs`, `node scripts/check-agent-skill.mjs`, `node --test scripts/check-release-p2.test.mjs`, and `node scripts/smoke-installed-package.mjs`; expect PASS.

### Task 4: Application-level evals, documentation, and package wiring

**Files:**
- Modify: `package.json`
- Modify: `skills/rends/SKILL.md`
- Modify: `skills/rends/README.md`
- Modify: `docs/agent-ready-roadmap.md`
- Modify: `evals/prompts.json`
- Modify: `evals/run-eval.mjs`
- Modify: `evals/README.md`
- Modify: `evals/checklist.md`
- Modify: `scripts/pack-agent-skill.mjs` only if pack behavior requires an explicit allowlist update.

**Interfaces:**
- Consumes: adapter/starter validators, reference app suite, existing deterministic eval format and package scripts.
- Produces: package scripts `agent:v0:check`, `test:agent-starter`, integrated `agent:check`/release gates, and eval cases for full-app generation, framework repair, nonexistent components, and version migration.

- [ ] Add deterministic RED eval fixtures/assertions for dashboard composition, forbidden-framework repair, refusal to invent a component, and migration/version grounding.
- [ ] Implement the smallest evaluator extensions necessary to grade those cases without model/network calls.
- [ ] Wire focused checks into package scripts and ensure `agent:check` exercises adapter and approval validity.
- [ ] Document source precedence, the v0 import workflow, starter review, update lifecycle, and the distinction between visual references and API truth.
- [ ] Run focused eval and package-script checks; expect PASS.

### Task 5: Whole-project verification and review

**Files:**
- Modify only files required to correct findings from integrated verification.

**Interfaces:**
- Consumes: all preceding deliverables.
- Produces: a release-ready, reviewed implementation with no stale contract references or user-file regressions.

- [ ] Run the stale-uppercase-reference grep and contract-count commands from `AGENTS.md`.
- [ ] Run `npm run lint`, `npm run agent:check`, focused reference-app Playwright, `npm run test:portable`, and `npm run check:release`.
- [ ] Inspect the complete diff for framework leakage, duplicated sources of truth, version drift, inaccessible UI, and modifications to user-owned files.
- [ ] Request an independent whole-change review and resolve all Critical/Important findings.
- [ ] Re-run every failed or impacted gate and record final evidence.
