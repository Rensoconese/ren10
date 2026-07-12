# Relume to Ren10 Block Workflow — Design

Date: 2026-07-12
Status: Approved design; ready for written-spec review

## Objective

Define a repeatable workflow for converting Relume library modules into
production-quality Ren10 blocks without requiring the user to detect basic
structural, alignment, cascade, or responsive defects.

The target is not pixel-perfect reproduction. Relume supplies the reference
anatomy, behavior, content relationships, important proportions, states, and
responsive intent. Ren10 supplies the implementation model, component
contracts, tokens, accessibility baseline, and final visual language.

## Quality Standard

A converted block must:

- preserve the reference function and recognizable anatomy;
- preserve important visual relationships without copying exact pixels;
- contain no duplicated controls, indicators, icons, or interaction states;
- remain aligned and visually coherent at all supported widths;
- use only documented RenDS selectors, states, tokens, and layout primitives;
- satisfy the repository accessibility and progressive-enhancement contracts;
- make every intentional departure from the reference explainable;
- pass automated validation and an independent visual review before user review.

Pixel-level equivalence, copied source-library styling, and changes to RenDS
made solely to imitate Relume are not goals.

## Selected Approach

Use a reference-structure workflow with visual gates.

Relume is neither copied literally nor treated as loose inspiration. Each
module is fully inspected, translated through RenDS contracts, implemented by
Grok from explicit acceptance criteria, rendered across a standard state
matrix, and reviewed by Codex before it is presented to the user.

Two rejected alternatives are:

- Pixel-perfect cloning, which would subordinate Ren10 to Relume's styling and
  implementation assumptions.
- Ren10-first loose interpretation, which is faster but permits missing
  anatomy, incorrect proportions, duplicated affordances, and visual drift.

## Roles

### Relume MCP

Provides the source reference:

- category and module discovery;
- complete component source and supporting files;
- dependencies and responsive conditions;
- structural and state information available in the retrieved implementation.

The MCP may not provide a rendered preview image. Source-derived facts and
visual inference must therefore be labeled separately.

### Codex

Owns orchestration and acceptance:

- selects the next module with the user;
- extracts and analyzes the complete Relume reference;
- loads all mandatory RenDS contracts;
- produces the reference brief and translation map;
- identifies cascade and native-element risks;
- defines testable acceptance criteria;
- prompts Grok with the complete implementation packet;
- independently reviews diffs, rendered states, accessibility, and tests;
- returns defects to Grok before presenting a candidate to the user.

### Grok

Owns implementation inside the allowed file scope:

- reads the supplied reference and RenDS contracts;
- writes failing regression tests first;
- implements the block in vanilla HTML, CSS, and JavaScript;
- runs focused validation and reports exact RED and GREEN evidence;
- does not modify planning files, core APIs, tokens, registries, or unrelated
  files unless the implementation packet explicitly authorizes them.

### User

Selects families/modules and approves product quality. The user should receive
a visually reviewed candidate, not be used as the first visual QA pass.

## Workflow

### Gate 0 — Tool and workspace preflight

Before starting a module:

1. Confirm the Relume MCP is authenticated and callable. OAuth expiry is a hard
   stop for reference extraction, not a reason to work from memory.
2. Confirm Grok authentication and the selected model.
3. Confirm the local browser, test runner, and static server can run.
4. Record the current branch, worktree state, and user-owned dirty files.
5. Define the exact files Grok may change.

No implementation begins while the source reference or required tools are
unavailable.

### Gate 1 — Complete Relume extraction

Retrieve the complete selected module rather than a prose summary. Capture:

- module identifier and family;
- all returned source files and dependencies;
- DOM/component anatomy;
- desktop, tablet, and mobile behavior;
- open, closed, hover, focus, active, and disabled states where applicable;
- alignment and content ordering;
- important width, spacing, and aspect-ratio relationships;
- icon and indicator ownership;
- animation and conditional-rendering logic;
- mobile duplication or alternate trees in the source;
- facts unavailable from the MCP.

The extraction becomes a private reference artifact. Relume names, copied
classes, URLs, content, and framework dependencies must not enter public Ren10
output.

### Gate 2 — RenDS translation map

Load the mandatory repository contracts in AGENTS.md order and map every
reference part to a documented RenDS primitive, composite, pattern, layout, or
native element.

The translation map records:

- the RenDS part used for each reference part;
- important structure and behavior that must be preserved;
- intentional Ren10 differences;
- unavailable APIs that require block-local composition;
- native-element and cascade risks;
- required resets for classless elements;
- the chosen responsive adaptation;
- fallback behavior without JavaScript.

Before choosing `details`, `summary`, headings, lists, forms, tables, dialogs,
or other native elements, inspect both `primitive-zero.md` and the effective
CSS cascade. This step must detect duplicate pseudo-elements, inherited layout,
default margins, and other collisions before implementation.

### Gate 3 — Acceptance contract and RED tests

Write observable acceptance criteria before production edits. Criteria cover:

- correct function and interaction state;
- exact ownership/count of controls, indicators, and decorative affordances;
- fundamental alignment and ordering;
- approximate proportional relationships where visually meaningful;
- desktop and mobile stacking;
- required content anatomy;
- accessibility and keyboard behavior;
- light/dark themes, reduced motion, and no-JavaScript fallback;
- absence of overflow, overlap, nested interactive elements, and copied
  dependencies.

Visual defects must be expressed as measurable regressions where practical.
Examples include “one visible chevron,” “trigger aligns with sibling links,”
and “mobile rows occupy the available width.” Grok runs these tests against the
pre-implementation state and records the expected RED result.

### Gate 4 — Grok implementation packet

Codex sends Grok one self-contained packet containing:

- module identifier and complete source-derived reference brief;
- RenDS translation map and mandatory contracts;
- approved intentional differences;
- known cascade risks;
- acceptance criteria and required RED tests;
- allowed and forbidden files;
- required validation commands;
- the rule that production edits begin only after expected RED evidence.

Grok performs the RED–GREEN–REFACTOR cycle without creating new plans or
expanding scope.

### Gate 5 — Standard render matrix

Every candidate is rendered from a local HTTP server with a cache-busting URL.
The minimum matrix is:

| View | Required states |
| --- | --- |
| Desktop light | Default and every major open state |
| Desktop dark | Default and every major open state |
| Mobile light | Default, primary navigation open, nested state open |
| Mobile dark | Primary/nested state open |
| JavaScript disabled | Usable mobile fallback |
| Reduced motion | Every animated interactive state |

Additional widths and states are added when the reference contains tablet,
sticky, overlay, validation, loading, error, carousel, or form behavior.

Screenshots must be newly captured after the latest edit. Cached screenshots
or screenshots whose DOM does not contain the expected new anatomy are invalid.

### Gate 6 — Independent Codex review

Codex does not rely on Grok's completion report. It independently checks:

- the actual git diff and file scope;
- DOM semantics and documented RenDS APIs;
- cascade conflicts and pseudo-elements;
- visual alignment, rhythm, hierarchy, proportions, surfaces, and iconography;
- all standard render-matrix screenshots;
- comparison with the reference brief;
- all declared intentional differences;
- focused and repository-wide validation output.

Any basic structural or visual defect returns directly to Grok with concrete
evidence. The user does not see a candidate that has failed this gate.

### Gate 7 — Final validation

A candidate must pass:

- focused Playwright behavior and structural-visual assertions;
- axe WCAG 2.1 AA;
- keyboard and focus behavior;
- touch targets;
- desktop/mobile overflow and overlap checks;
- light and dark themes;
- JavaScript-disabled fallback where promised;
- reduced motion;
- `npm run lint`;
- `npm run agent:check`;
- AGENTS.md stale-contract and contract-count checks;
- `git diff --check` and a file-scope audit.

Existing unrelated warnings or dirty files are reported and excluded from the
feature commit.

### Gate 8 — User presentation

Only a candidate that passed Gates 0–7 is presented. The handoff includes:

- a desktop screenshot;
- a mobile screenshot;
- the block path;
- intentional differences from Relume;
- validation results;
- the isolated commit identifier.

User feedback remains authoritative. If it exposes a new class of defect, the
defect becomes a regression test and updates this workflow when broadly useful.

## Family-by-Family Operation

Work continues one Relume family at a time. Before implementing a family:

1. Inventory its modules.
2. Group modules by shared anatomy and behavior.
3. Choose the smallest representative baseline.
4. Complete the entire workflow for that baseline.
5. Reuse validated structure and tests for later variants without assuming
   their differences are cosmetic.

Only one module is in implementation at a time unless modules are demonstrably
independent and use separate files/worktrees.

## Failure Handling

- Expired Relume OAuth: reauthenticate; do not reconstruct from memory.
- Missing preview: derive a factual reference brief from complete source and
  label visual inferences.
- Grok changes forbidden files: stop, preserve user work, and restrict the
  implementation diff before continuing.
- Tests pass but screenshots look wrong: candidate fails Gate 6.
- Screenshot and DOM disagree: invalidate cache, reload with a new query value,
  and recapture.
- Three unsuccessful correction cycles: stop and reconsider the translation
  architecture rather than adding another patch.

## Deliverables for Workflow Automation

The later implementation plan should define reusable artifacts for:

- a reference-brief template;
- a Relume-to-RenDS translation-map template;
- an implementation-packet template for Grok;
- a standard Playwright render-matrix helper;
- reusable alignment, duplicate-affordance, width, overflow, and cascade checks;
- a review checklist and result ledger;
- a family/module inventory that records status and shared baselines.

The automation must assist judgment, not replace visual review.

## Acceptance Criteria for This Workflow

- A new module cannot reach Grok without complete source extraction and RenDS
  mapping.
- A new module cannot reach the user without fresh desktop/mobile screenshots
  and independent Codex review.
- Visual correctness includes alignment, recognizable anatomy, coherent
  proportions, and absence of duplicates; it does not require pixel matching.
- Every correction caused by a missed observable defect adds a regression test.
- User-owned planning files and unrelated changes remain outside block commits.
- The workflow remains compatible with vanilla Ren10 and requires no Relume
  runtime dependency.

## Out of Scope

- Implementing another Relume block.
- Changing RenDS component APIs or tokens.
- Pixel-diff snapshot testing against copyrighted Relume renders.
- Copying Relume source, styling, content, assets, URLs, or package dependencies.
- Publishing or pushing repository changes.
