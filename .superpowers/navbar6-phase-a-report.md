# Navbar 6 Phase A Report

**Date:** 2026-07-12  
**Branch / worktree:** `codex/navbar6` @ `/Users/rensoconese/RenDS/worktrees/navbar6`  
**Scope:** Packet preparation + RED tests only (no product HTML/CSS/JS implementation)

## Outcome

Phase A complete. Packet `navbar6` is at stage **`red`** with trusted evidence lineage for `reference` and `mapped`. Focused Playwright tests for the featured mega-menu block fail because the block file is absent. Existing navbar5 navigation tests remain green.

## Artifacts

| Path | Role |
| --- | --- |
| `docs/workflows/relume-to-ren10/modules/navbar6/reference-brief.md` | Sanitized Relume MCP facts + unavailable evidence |
| `docs/workflows/relume-to-ren10/modules/navbar6/translation-map.md` | RenDS mapping, cascade risks, rejections |
| `docs/workflows/relume-to-ren10/modules/navbar6/acceptance.json` | 19 criteria (structure/behavior/visual + Codex review) |
| `docs/workflows/relume-to-ren10/modules/navbar6/render-matrix.json` | **11** capture states with selector actions + markers |
| `docs/workflows/relume-to-ren10/modules/navbar6/reference-evidence.json` | `source: relume-mcp`, `completeSource: true` |
| `docs/workflows/relume-to-ren10/modules/navbar6/mapped-evidence.json` | Translation map complete |
| `docs/workflows/relume-to-ren10/modules/navbar6/packet.json` | Stage `red`; allowedFiles limited to block + tests |
| `docs/workflows/relume-to-ren10/inventory.json` | navbar5 `accepted`; navbar6 sole `in_progress` |
| `tests/components/blocks-navigation.spec.cjs` | Preserved navbar5 suite + 15 navbar6 RED tests |

## Ren10 anatomy locked for green implementation

Public selectors (do not invent alternatives without updating tests + matrix):

- Root: `[data-rmf-root]`
- One tree: `#rmf-primary-links` / `ul.ren-nav-links`
- Shell: `<ren-nav>` + `nav.ren-nav` + `.ren-nav-toggle` + two `.ren-nav-actions` CTAs
- Four top-level entries: **3** `a.ren-nav-link` + **1** `.rmf-disclosure > summary`
- Chevron: exactly one `.rmf-chevron` (neutralize classless `summary::after`)
- Panel: `.rmf-panel` with **3** `.rmf-group` × **4** `.rmf-dest` = **12** destinations (`.rmf-dest-desc` present)
- Featured: **1** `.rmf-feature` anchor + `.rmf-feature-media` (**16:9**), no nested `button` / `[role=button]`
- See-all: **1** `.rmf-view-all`
- Breakpoint: intentional **`48rem`** (not source ~991px tablet shell)
- One responsive tree; JS-off native `details` usable

## Validation

```text
$ node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar6
Valid workflow packet: navbar6 (red)

$ node scripts/relume-workflow.mjs status docs/workflows/relume-to-ren10/modules/navbar6
navbar6: red

$ npm run workflow:relume:check
Module navbar6 ren10Block missing or not a regular file: templates/blocks/nav-mega-menu-featured.html
```

**Inventory failure is expected and only because the RED block file is absent.** Packet-local validation (without inventory block-file FS check) is valid at `red`.

Green/reviewed evidence was **not** forged. Stage was advanced only:

1. `reference` → `mapped` via `reference-evidence.json`
2. `mapped` → `red` via `mapped-evidence.json`

## RED tests

Command:

```bash
CI= npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/blocks-navigation.spec.cjs --grep "navbar6" \
  --retries=0 --workers=1 --project="Desktop Light"
```

**Result: 15 failed / 0 passed** (Desktop Light).

Exact failure (all 15 cases):

```text
Error: featured block must not 404 — implement templates/blocks/nav-mega-menu-featured.html
Expected: 200
Received: 404
  at gotoFeaturedBlock (tests/components/blocks-navigation.spec.cjs)
```

Failed cases:

1. block page loads with ren-nav shell and featured root  
2. exactly one primary links tree serves desktop and mobile  
3. anatomy: four top-level entries, 3×4 destinations, one feature, one see-all, one chevron  
4. featured promo is a single anchor without nested button controls  
5. summary opens by click and keyboard; Escape restores focus  
6. outside click and destination activation close the disclosure  
7. mobile toggle exposes the same tree and closes mega on menu close  
8. JS-disabled mobile keeps the nav tree and mega destinations usable  
9. viewport geometry: desktop panel under bar, mobile in-flow, no horizontal overflow  
10. desktop chrome: single chevron, neutral details, aligned trigger, 16:9 feature  
11. mobile rows: full width, start-aligned, no nested-card details  
12. visible interactive targets meet 44×44 in a touch context  
13. reduced-motion disables block-local transitions and animations  
14. featured mega menu preview passes WCAG 2.1 AA axe scan  
15. light and dark surfaces resolve through RenDS tokens  

Quality helpers used in the navbar6 suite: `expectSingleVisibleAffordance`, `expectAligned`, `expectWidthRatio`, `expectNoOverflow`, `inspectNativeChrome`.

## Regression check (navbar5 preserved)

```bash
CI= npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/blocks-navigation.spec.cjs --grep-invert "navbar6" \
  --retries=0 --workers=2 --project="Desktop Light"
```

**Result: 15 passed** (existing Navigation blocks suite unchanged).

## Explicit non-goals (Phase A)

- Did **not** create `templates/blocks/nav-mega-menu-featured.html`
- Did **not** copy Relume proprietary source, classes, copy, URLs, or assets
- Did **not** advance to green/reviewed/accepted
- Did **not** capture render-matrix screenshots (Gate 5 is post-implementation)

## Next (Phase B / green)

1. Implement only `templates/blocks/nav-mega-menu-featured.html` (+ catalog index if allowed in a later packet expansion).
2. Keep changes inside `packet.allowedFiles`.
3. Re-run navbar6 suite to green; then matrix capture + Codex visual gate.
