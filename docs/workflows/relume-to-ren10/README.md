# Relume to Ren10 Block Workflow — Operator Runbook

Repeatable conversion of Relume library modules into production Ren10 blocks.
Relume supplies reference anatomy, behavior, relationships, proportions, states,
and responsive intent. Ren10 supplies implementation, contracts, tokens,
accessibility, and final visual language.

This runbook implements the approved design at
`docs/superpowers/specs/2026-07-12-relume-to-ren10-workflow-design.md`.

## Hard rules

- Do not copy Relume source, classes, text, URLs, assets, or runtime dependencies.
- Do not require pixel-perfect reproduction or change RenDS solely to imitate Relume.
- Vanilla HTML, CSS, and JavaScript only (Light DOM).
- Relume OAuth failure is a hard preflight stop; never substitute memory.
- Restrict every feature commit to the packet `allowedFiles`.

Automation can prove declared structure and behavior. It cannot decide whether a
composition looks coherent. A packet cannot advance from `green` to `reviewed`
until Codex has inspected fresh screenshots and the actual DOM/CSS cascade.

## Stages

```
reference → mapped → red → green → reviewed → accepted
```

Stage transitions require packet-local evidence JSON and are enforced by
`scripts/lib/relume-workflow.mjs` (trusted gates from Task 2):

| Transition | Evidence requirements |
| --- | --- |
| `reference` → `mapped` | `stage`, `passed: true`, `source: "relume-mcp"`, `completeSource: true` |
| `mapped` → `red` | `stage`, `passed: true` |
| `red` → `green` | `stage`, `passed: true` |
| `green` → `reviewed` | Codex visual review: `result: "passed"`, `reviewer: "Codex"`, `reviewedCommit` (git hash or `"packet"`), `captures.desktop` + `captures.mobile`, `capturesFresh: true`, non-empty `cascadeInspection` |
| `reviewed` → `accepted` | Explicit human acceptance: `kind: "human-acceptance"`, human `acceptor` (not automation/CI/bot/system/Codex/Grok), `result: "accepted"` or `"passed"` |

Generic `{ "stage", "passed": true }` evidence cannot skip Codex visual review or
human acceptance.

## Templates

| File | Role |
| --- | --- |
| `templates/reference-brief.md` | Complete source-derived extraction (facts, responsive/interaction states, exclusions) |
| `templates/translation-map.md` | RenDS mapping, cascade risks, progressive enhancement |
| `templates/implementation-packet.md` | Self-contained Grok handoff |
| `templates/acceptance.json` | Machine-readable acceptance criteria (includes non-automated Codex visual review) |

## CLI commands

Default module root: `docs/workflows/relume-to-ren10/modules`.

```bash
# Scaffold a new packet (built-in defaults, or --template-root for these templates)
node scripts/relume-workflow.mjs init \
  --family <family> \
  --module <moduleId> \
  --block <block-slug> \
  --path <repo-relative-html> \
  [--test-path <repo-relative-spec>] \
  [--root docs/workflows/relume-to-ren10/modules] \
  [--template-root docs/workflows/relume-to-ren10/templates]

# For non-navbar families, --test-path is required.
node scripts/relume-workflow.mjs init \
  --family heroes \
  --module hero3 \
  --block hero-split \
  --path templates/blocks/hero-split.html \
  --test-path tests/components/blocks-heroes.spec.cjs \
  --template-root docs/workflows/relume-to-ren10/templates

node scripts/relume-workflow.mjs validate <packet-dir>
node scripts/relume-workflow.mjs status <packet-dir>
node scripts/relume-workflow.mjs advance <packet-dir> --evidence <packet-local-evidence.json>
```

Package scripts:

```bash
npm run workflow:relume -- <init|validate|status|advance> ...
npm run workflow:relume:check -- <packet-dir>
npm run test:workflow
```

## Required evidence filenames

Store evidence inside the packet directory (never symlinks or paths outside the
packet). Suggested names:

| Stage completed | Suggested evidence file | Notes |
| --- | --- | --- |
| `reference` | `reference-evidence.json` | Relume MCP complete source only |
| `mapped` | `mapped-evidence.json` | Translation map complete |
| `red` | `red-evidence.json` | Expected failing tests recorded |
| `green` | `green-evidence.json` | Codex visual review proof (not generic pass) |
| `reviewed` | `reviewed-evidence.json` | Explicit human acceptor identity |

Example green evidence shape:

```json
{
  "stage": "green",
  "result": "passed",
  "reviewer": "Codex",
  "reviewedCommit": "packet",
  "captures": {
    "desktop": "captures/desktop-light-default.png",
    "mobile": "captures/mobile-light-default.png"
  },
  "capturesFresh": true,
  "cascadeInspection": "Inspected DOM semantics and CSS cascade; no duplicate affordances."
}
```

Example reviewed evidence shape:

```json
{
  "stage": "reviewed",
  "kind": "human-acceptance",
  "acceptor": "product-owner",
  "result": "accepted"
}
```

## Cache-busting rule

Every capture URL must include a unique workflow cache key so browser and proxy
caches cannot serve stale HTML/CSS/JS. The capture runner appends
`?ren10_capture=<module>-<state>-<commit>`. Screenshots whose DOM does not
contain the expected new anatomy, or that were not recaptured after the latest
edit, are invalid for Gate 6 / `green` → `reviewed`.

## Gates 0–8

### Gate 0 — Tool and workspace preflight

1. Confirm Relume MCP is authenticated and callable.
2. Confirm Grok authentication and selected model.
3. Confirm local browser, test runner, and static server can run.
4. Record branch, worktree state, and user-owned dirty files.
5. Define exact files Grok may change (`allowedFiles`).

OAuth recovery (do not store or document tokens):

```bash
codex mcp login relume
```

If OAuth fails, stop. Do not reconstruct reference from memory or an old summary.

### Gate 1 — Complete Relume extraction

Retrieve the complete module via Relume MCP. Fill `reference-brief.md` with only
source-visible facts. Label unavailable evidence. Keep proprietary source private;
public Ren10 output must not contain Relume names, classes, URLs, content, or
framework dependencies.

Advance only with `source: "relume-mcp"` and `completeSource: true`.

### Gate 2 — RenDS translation map

Load contracts in AGENTS.md order. Fill `translation-map.md`, including
`primitive-zero.md` cascade inspection for native elements. Record rejected
mappings.

### Gate 3 — Acceptance contract and RED tests

Finalize `acceptance.json` criteria. Grok writes failing regression tests and
records expected RED before production edits.

### Gate 4 — Grok implementation packet

Send a filled `implementation-packet.md` (reference brief, translation map,
acceptance criteria, allowed/forbidden files, RED rule, validation commands).
Grok implements only inside allowed scope.

### Gate 5 — Standard render matrix

Render from a local HTTP server with cache-busting URLs. Minimum matrix:

| View | Required states |
| --- | --- |
| Desktop light | Default and every major open state |
| Desktop dark | Default and every major open state |
| Mobile light | Default, primary navigation open, nested state open |
| Mobile dark | Primary/nested state open |
| JavaScript disabled | Usable mobile fallback |
| Reduced motion | Every animated interactive state |

Capture only after the latest edit.

### Gate 6 — Independent Codex review

Codex does not rely on Grok's report. Independently check git diff/scope, DOM
semantics, cascade/pseudo-elements, visual coherence, render-matrix screenshots,
intentional differences, and validation output. Advance `green` → `reviewed`
only with complete Codex visual-review evidence (fresh desktop + mobile captures
and cascade inspection).

### Gate 7 — Final validation

- Focused Playwright behavior and structural-visual assertions
- axe WCAG 2.1 AA, keyboard/focus, touch targets
- Desktop/mobile overflow and overlap
- Light/dark themes, JS-disabled fallback, reduced motion
- `npm run lint`, `npm run agent:check` when applicable
- AGENTS.md contract checks
- `git diff --check` and `allowedFiles` audit

### Gate 8 — User presentation

Present only a candidate that passed Gates 0–7. Include desktop and mobile
screenshots, block path, intentional differences, validation results, and commit
id. Advance `reviewed` → `accepted` only after explicit human acceptance
evidence (not automation or model identities).

## Failure handling

- Expired Relume OAuth: `codex mcp login relume`; do not reconstruct from memory.
- Missing preview: factual brief from complete source; label inferences.
- Grok changes forbidden files: stop, preserve user work, restrict the diff.
- Tests pass but screenshots look wrong: fail Gate 6; do not advance to reviewed.
- Screenshot and DOM disagree: invalidate cache, reload with a new query value, recapture.
- Three unsuccessful correction cycles: stop and reconsider the translation architecture.

## Family-by-family operation

1. Inventory modules.
2. Group by shared anatomy.
3. Choose the smallest representative baseline.
4. Complete the entire workflow for that baseline.
5. Reuse validated structure for later variants without assuming cosmetic-only differences.

One module in implementation at a time unless modules are independent with
separate files/worktrees.
