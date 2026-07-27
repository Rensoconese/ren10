# Ren10 Headers 1–30 Consolidation Design

**Date:** 2026-07-16  
**Target branch:** `codex/header1-5-batch`  
**Target worktree:** `worktrees/header-batch`

## Objective

Deliver one reviewed Ren10 header catalog containing Headers 1 through 30. The
result must consolidate the independently developed batches without restoring
older shell defects, complete the missing Header 29 and Header 30 translations,
and apply one visual and accessibility standard across every standalone demo.

## Current State

- `header-batch` contains reviewed Headers 1–5 plus pending shared shell,
  spacing, CSS Grid, and previous/next navigation improvements.
- `header-batch2` through `header-batch5` cumulatively contain Headers 6–25.
- `header-batch6` is the most polished cumulative snapshot of Headers 1–25.
- `header26`, `header27`, and `header28` contain independently reviewed
  implementations and workflow evidence that have not been consolidated.
- Header 29 and Header 30 have no Ren10 implementation or workflow packet.
- Official source pages exist for Relume Header 29 and Header 30, but their
  public code is gated. Their preview and observable structure are reference
  material only; Ren10 APIs must come from local RenDS contracts.

## Chosen Integration Strategy

Use a deterministic snapshot consolidation rather than sequentially merging
every divergent branch.

1. Treat `header-batch6` as the cumulative source for Headers 1–25.
2. Compare its shared files against the pending polish already present in
   `header-batch`; retain the newer approved shell, Grid, rhythm, and block
   pagination behavior.
3. Import only the unique Header 26–28 implementation, test, workflow packet,
   and catalog additions from their individual branches.
4. Create Header 29 and Header 30 through the full Relume-to-Ren10 workflow.
5. Rebuild the final catalog ordering and previous/next chain once all thirty
   pages exist.

This preserves reviewed feature work without replaying repeated edits to the
same catalog and shared shell files.

## Source And API Rules

- Relume previews inform anatomy, proportion, responsive states, and content
  hierarchy. They do not define public Ren10 selectors or APIs.
- `ren-design.md`, token contracts, layout contracts, Primitive Zero, and
  colocated component contracts remain authoritative.
- Implementation stays vanilla HTML, CSS, and JavaScript in light DOM.
- Two-column hero compositions use `ren-grid ren-grid-2`; they become one
  column below 48rem.
- Vertical composition uses Ren10 layout primitives and parent `gap`, not
  accumulated child margins.
- Consumer CSS uses semantic or component tokens only.
- Every interactive control uses its real semantic element, an accessible
  name, visible focus, keyboard behavior, and a 44px minimum touch target.

## Header 29 And Header 30 Workflow

Each missing header receives an independent packet under
`docs/workflows/relume-to-ren10/modules/header29` or `header30` containing:

- reference brief and captured evidence;
- translation map from observable source anatomy to verified Ren10 parts;
- implementation packet and acceptance criteria;
- render matrix covering desktop/mobile, light/dark, reduced motion, and
  interactive states;
- red, mapped, green, and capture evidence.

The exact composition is derived from the official preview before markup is
written. If a source behavior or asset cannot be verified, the packet must
record the limitation and choose a conservative native fallback rather than
inventing an interaction.

## Shared Demo Chrome

All thirty detail pages share:

- `main.dx-shell.bb-detail-page` as a single-column CSS Grid shell;
- a `bb-detail-header` with breadcrumb, category, title, and description;
- one isolated `bb-detail-preview` surface;
- a two-link `bb-block-pagination` footer naming the actual adjacent blocks;
- a complete ordered chain from Header 1 through Header 30, with the catalog
  used at the two boundaries;
- consistent spacing, border, radius, elevation, and focus treatment from
  shared tokens.

The shared site shell owns demo chrome. Each block stylesheet owns only its
internal composition and states.

## Catalog

`templates/blocks/index.html` lists exactly thirty header cards in numerical
order. Every card links to an existing standalone page and uses a distinct,
descriptive title. The catalog remains separate from the implementation pages
and does not duplicate block CSS.

## Quality Pass

The consolidation includes a deliberate review of all thirty pages for:

- correct CSS Grid behavior at responsive seams;
- balanced internal padding and consistent external rhythm;
- local media that loads without broken requests;
- readable copy measure and heading wrapping;
- no horizontal overflow at 320, 390, 767, 768, and 1280 pixels;
- light and dark theme contrast;
- keyboard reachability, focus return, and Escape behavior where applicable;
- reduced-motion behavior;
- semantic headings, landmarks, form labels, dialog names, and live regions;
- valid previous/next destinations and absence of console/page errors.

## Testing

### Static and contract checks

- exactly thirty header cards and thirty corresponding HTML files;
- every page contains the shared detail shell and two valid pagination links;
- no stale uppercase contract references;
- component contract counts remain 19 primitives, 26 composites, 8 patterns;
- `npm run lint` and `npm run agent:check` pass.

### Browser checks

- focused contract tests for every imported or new header;
- catalog navigation tests;
- direct browser matrix at required widths and themes;
- zero horizontal overflow and zero uncaught page errors;
- axe WCAG 2.1 AA checks for Header 29 and Header 30 plus representative
  regression coverage across the consolidated family;
- screenshots for the canonical desktop and mobile state of every header.

## File Ownership

- Shared chrome: `site/shell.css`.
- Catalog: `templates/blocks/index.html`.
- Block implementations: `templates/blocks/hero-*.html`.
- Header tests: `tests/components/header*-header.spec.cjs` and shared header
  catalog/rhythm suites.
- Workflow evidence: `docs/workflows/relume-to-ren10/modules/header*`.
- Capture artifacts remain in ignored workflow/output directories unless the
  established packet explicitly versions them.

## Non-Goals

- Adding a new RenDS component API.
- Introducing React, Tailwind, framework adapters, or Shadow DOM.
- Redesigning navigation blocks or unrelated component documentation.
- Rewriting already valid block interactions solely for stylistic novelty.
- Publishing, merging to `main`, or changing package version.

## Acceptance Criteria

The work is complete when:

1. Headers 1–30 are present, ordered, reachable, and individually runnable.
2. Header 29 and Header 30 have complete workflow packets, implementations,
   tests, and reviewed browser evidence.
3. Every two-column header uses CSS Grid and stacks at the agreed breakpoint.
4. Every detail page uses the shared rhythm and named previous/next links.
5. The full browser matrix has no overflow, broken destinations, page errors,
   or accessibility blockers.
6. Repository lint, agent checks, contract counts, and diff hygiene pass.

