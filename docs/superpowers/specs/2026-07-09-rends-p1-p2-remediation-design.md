# RenDS P1/P2 Contract-First Remediation Design

## Objective

Bring the integrated RenDS 0.9.3 codebase into verifiable alignment with its
published contracts. Complete every validated P1 first, then every validated
P2, repeat the repository-wide audit, and only after that produce an
exhaustive implementation plan for the proposed future quality additions.

## Scope

This remediation covers:

- the 19 primitive, 26 composite, and 8 pattern contracts;
- component CSS, JavaScript, public custom properties, events, attributes,
  methods, keyboard behavior, lifecycle, and form participation;
- foundations: tokens, themes, cascade layers, layouts, grids, density,
  typography, motion, and progressive enhancement;
- CLI discovery/copy/upgrade/agent-docs behavior and dependency resolution;
- documentation, canonical examples, golden examples, evals, and navigation;
- package exports, packlist, knowledge artifacts, lint, CI, release metadata,
  browser support, and migration guidance;
- a fresh completion audit against the actual branch state.

New catalogue components are outside the remediation itself. Existing
contracts that refer to unavailable components must either identify them as
future work or route to a component that actually exists.

## Source-of-truth policy

The remediation is contract-first.

1. `ren-design.md` defines project-wide philosophy and invariants.
2. `tokens/tokens.md`, `base/layouts.md`, and `base/primitive-zero.md` define
   foundation behavior.
3. The colocated `component.md` or `pattern.md`, especially its `aiHints`, is
   the public API target for a component.
4. Native HTML semantics, WCAG 2.1 AA, keyboard operability, Light DOM, and
   the root hard rules override a contradictory snippet or stale prose line.
5. When a contract contradicts itself, use the semantic/native requirement
   and `aiHints.requiredMarkup` as the intended behavior, then correct every
   duplicated surface in the same task.
6. A public promise may be removed only when implementing it would violate a
   higher-level invariant or when the repository explicitly marks it as a
   future API. Removal requires a migration/deprecation note and a test for
   the remaining API.

## Workspace and preservation

Implementation occurs in the isolated worktree:

`/Users/rensoconese/RenDS/rends-p1-p2`

on branch:

`codex/rends-p1-p2`

The branch starts from local `main` and includes `origin/main` 0.9.3 through
an explicit merge. The dirty source checkout remains untouched. In
particular, the pre-existing modifications to `ROADMAP.md`, `STATUS.md`, and
`ENHANCEMENT-PLAN.md` must never be stashed, reset, overwritten, or included
in remediation commits.

## Architecture of the remediation

### 1. Foundation integrity

Foundation correctness is established before component behavior because all
53 parts depend on it. This stream will:

- make every supported `--ren-*` custom property affect the rule that owns
  it;
- reject unresolved custom-property references unless they have an explicit,
  intentional fallback;
- deliver the documented cascade-layer ordering in the install path;
- make built-in theme pairs meet their documented contrast baseline;
- either implement the documented AAA scope or remove the false runtime
  promise with an explicit migration note;
- resolve density, typography-role, grid, reduced-motion, and FOUC contracts.

Static validation proves graph integrity; browser tests prove computed-style
behavior. A declaration existing in a token file is not sufficient evidence
that the public override API works.

### 2. Component runtime and accessibility

Runtime work is grouped by shared state model rather than by catalogue tier:

- form participation and validation;
- local-date parsing, serialization, and range coordination;
- selection controls and multi-value state;
- keyboard navigation, roving tabindex, focus restoration, and disabled
  filtering;
- overlays/dialogs and Escape/dismiss state synchronization;
- lifecycle cleanup and reconnect safety;
- touch-target and loading/disabled activation semantics.

Each component keeps native elements as its behavioral core. No fix may
replace a native button, input, dialog, details, table, link, or form with an
ARIA-simulated `div`.

### 3. CLI, contracts, documentation, and package metadata

A component dependency graph becomes the installation source of truth. The
CLI must copy all component and utility dependencies recursively, and a
tarball-installed consumer smoke must verify every JavaScript-bearing
component.

Duplicated public metadata is validated semantically:

- canonical markup must satisfy `aiHints.requiredMarkup`;
- documented selectors must exist in shipped CSS;
- documented custom elements must be registered by shipped JavaScript;
- documented imports must be exported and present in the packlist;
- documented events must match emitted names, bubbling, and detail shapes;
- examples and evals must exercise actual components rather than lookalikes.

The first implementation may keep the current registry format, but it must
centralize enough metadata to prevent another source from silently
contradicting it. The later “What to add” plan will specify the full manifest
generator as a separate project.

### 4. P2 hardening

Only after the P1 completion gate passes, address:

- density and typography-role consumption;
- grid defaults and standalone prose-grid validity;
- touch-target consistency and reduced-motion strategy;
- package size, optional knowledge delivery, built/minified bundles, and
  request budgets;
- complete package exports and installed-skill version handshake;
- JavaScript lint/import checks, dependency audit, and portable visual
  baselines;
- release, changelog, compatibility, migration, and browser-policy gaps;
- docs information architecture and remaining stale copy.

P2 fixes follow the same RED/GREEN/review gates as P1; they are not treated
as documentation-only cleanup unless the behavior is genuinely prose-only.

## Testing strategy

Every behavior change follows this sequence:

1. Add the smallest regression test that expresses the public contract.
2. Run it and record the expected failure caused by the missing behavior.
3. Implement the minimal production change.
4. Run the targeted test and its nearest existing suite.
5. Refactor only while the tests remain green.
6. Review the task for contract compliance and code quality.

Test layers:

- Node/static checks for token references, metadata, import graphs, packlist,
  exports, and generated artifacts;
- Playwright component fixtures for keyboard, focus, open state, lifecycle,
  form reset/submission, and computed CSS;
- theme tests for all built-in themes, schemes, contrast modes, and state
  pairs;
- tarball consumer tests for the CLI, exports, copied dependencies, and
  agent-docs target paths;
- visual tests only after their platform baseline policy is portable and
  explicit.

Passing the current suite is necessary but not sufficient. Completion needs
new evidence for every audit finding.

## Agent workflow

Parallel agents may inspect independent domains, design regression tests, and
perform reviews concurrently. Production edits are integrated as isolated,
reviewable tasks so two agents never mutate the same source surface at the
same time. Each task has:

- a bounded brief;
- a RED/GREEN report;
- a focused commit or commit range;
- an independent contract-and-quality review;
- a progress-ledger entry only after review findings are resolved.

At the end of each P1 domain, run its full domain suite. After all P1 domains,
repeat the P1 audit before any P2 implementation begins.

## P1 completion gate

P1 is complete only when all of the following are proven on the integrated
branch:

- every revalidated P1 audit item has a regression test and passing behavior;
- no unresolved public custom-property reference remains;
- the supported component-token override surface changes computed styles;
- critical forms, dates, selection, overlays, and keyboard flows match their
  contracts;
- CLI copy/upgrade/agent-docs works from an installed tarball for every
  relevant component;
- canonical markup, events, imports, selectors, goldens, and evals agree with
  shipped code;
- lint, agent checks, component tests, a11y tests, theme tests, export tests,
  knowledge checks, and relevant cross-browser tests pass;
- a fresh P1 audit finds no remaining P1.

## P2 completion gate

P2 is complete only when every revalidated P2 item has either:

- a tested implementation and updated public contract; or
- evidence that upstream 0.9.3 already resolved it, plus a regression check
  that covers the resolution.

The package, docs, visual-test portability, dependency audit, compatibility,
and migration checks must be part of the final verification command set.

## Final audit and future-additions deliverable

After P2, repeat the original audit from the current branch rather than from
memory. Re-scan all 53 contracts and implementation surfaces, run the full
validation suite, inspect the packed tarball, and exercise representative
browser flows. Any new P1/P2 finding returns to its matching remediation
stream.

Only after that audit is clean, create an exhaustive implementation plan for:

- canonical per-component manifests;
- custom-property definition/consumption validation;
- selector, tag, import, and event validators;
- recursive component dependency graphs;
- contract tests for all 53 components;
- full Playwright matrices for keyboard, open states, reconnect, RTL,
  themes, density, and reduced motion;
- tarball consumer smoke environments;
- nine-theme and AAA contrast coverage;
- package/CSS/memory/request budgets;
- compatibility, migration, and deprecation policy;
- explicitly selected future components after catalogue stabilization.

That plan is a deliverable, not an authorization to implement the future
projects during this remediation.
