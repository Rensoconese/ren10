# Navbar 7 Phase A Report

**Date:** 2026-07-13
**Branch / worktree:** `codex/navbar7` @ `/Users/rensoconese/RenDS/worktrees/navbar7`
**HEAD:** `6d55e7a`
**Scope:** Packet preparation + RED tests only (no product HTML/CSS/JS implementation)

## Outcome

Phase A complete. Packet `navbar7` is at stage **`red`** with trusted evidence lineage for `reference` and `mapped`. Focused Playwright tests for the icons mega-menu block fail because the block file is absent. Existing navbar5/navbar6 navigation tests remain green. Inventory lists navbar7 as the sole `in_progress` module; navbar5 and navbar6 remain `accepted`.

## Changed files

| Path | Role |
| --- | --- |
| `docs/workflows/relume-to-ren10/modules/navbar7/packet.json` | Stage `red`; allowedFiles = block + navigation tests |
| `docs/workflows/relume-to-ren10/modules/navbar7/reference-brief.md` | Sanitized Relume MCP facts + unavailable evidence |
| `docs/workflows/relume-to-ren10/modules/navbar7/reference-evidence.json` | `source: relume-mcp`, `completeSource: true` |
| `docs/workflows/relume-to-ren10/modules/navbar7/translation-map.md` | RenDS mapping, cascade risks, rejections, Ren10 policies |
| `docs/workflows/relume-to-ren10/modules/navbar7/mapped-evidence.json` | Translation map complete |
| `docs/workflows/relume-to-ren10/modules/navbar7/acceptance.json` | 21 criteria (structure/behavior/visual + Codex review) |
| `docs/workflows/relume-to-ren10/modules/navbar7/render-matrix.json` | **12** capture states with selector actions + markers |
| `docs/workflows/relume-to-ren10/modules/navbar7/red-evidence.json` | Actual 16/16 RED Playwright failure recorded |
| `docs/workflows/relume-to-ren10/inventory.json` | navbar5/6 `accepted`; navbar7 sole `in_progress` |
| `tests/components/blocks-navigation.spec.cjs` | Preserved navbar5/6 suites + **16** navbar7 RED tests |
| `.superpowers/navbar7-phase-a-report.md` | This report |

**Not created:** `templates/blocks/nav-mega-menu-icons.html` (intentional RED).

## Ren10 anatomy locked for green implementation

Public selectors (do not invent alternatives without updating tests + matrix):

- Root: `[data-rmi-root]`
- One tree: `#rmi-primary-links` / `ul.ren-nav-links`
- Shell: `<ren-nav>` + `nav.ren-nav` + named `.ren-nav-toggle` + **two** trailing `.ren-nav-actions` CTAs
- Four top-level entries: **3** direct `a.ren-nav-link` + **1** `.rmi-disclosure > summary`
- Chevron: exactly one `.rmi-chevron` (neutralize classless `summary::after` / marker)
- Panel: `.rmi-panel` with **4** `.rmi-group` × **4** `.rmi-dest` = **16** destinations
- Each destination: `.rmi-dest-icon` (square) + `.rmi-dest-label` + `.rmi-dest-desc` (16 of each marker)
- Footer: **1** `.rmi-footer` with **1** `.rmi-footer-prompt`, **1** `.rmi-footer-link`, **2** `.rmi-footer-action`
- **No** featured/raster media region (reject Navbar 5/6 feature rail leakage)
- Breakpoint: intentional shell **`48rem`** (not source ~991px)
- Content bands:
  - **&lt;48rem:** 1-column groups; descriptions visually hidden; footer actions stacked; in-flow panel
  - **48rem–63.999rem (e.g. 834px):** desktop shell (no toggle); **2-column** groups; descriptions visible; footer horizontal
  - **≥64rem:** **4-column** groups; horizontal footer; absolute panel under bar
- Desktop pointer **hover-open** + click/Enter/Space; stable pointer corridor; Escape + focus restore
- One responsive tree; JS-off native `details` usable; Light DOM only; reduced motion required

## Validation commands

```bash
node scripts/relume-workflow.mjs init \
  --family navbars --module navbar7 --block nav-mega-menu-icons \
  --path templates/blocks/nav-mega-menu-icons.html \
  --test-path tests/components/blocks-navigation.spec.cjs \
  --template-root docs/workflows/relume-to-ren10/templates

node scripts/relume-workflow.mjs advance docs/workflows/relume-to-ren10/modules/navbar7 \
  --evidence docs/workflows/relume-to-ren10/modules/navbar7/reference-evidence.json
# → mapped

node scripts/relume-workflow.mjs advance docs/workflows/relume-to-ren10/modules/navbar7 \
  --evidence docs/workflows/relume-to-ren10/modules/navbar7/mapped-evidence.json
# → red

node scripts/relume-workflow.mjs validate docs/workflows/relume-to-ren10/modules/navbar7
# Valid workflow packet: navbar7 (red)

node scripts/relume-workflow.mjs status docs/workflows/relume-to-ren10/modules/navbar7
# navbar7: red

npm run workflow:relume:check
# Valid inventory: 1 families, 3 modules
```

Green/reviewed evidence was **not** forged. Stage was advanced only:

1. `reference` → `mapped` via `reference-evidence.json`
2. `mapped` → `red` via `mapped-evidence.json`

`red-evidence.json` documents the failing suite for Phase B handoff; it is **not** attached to `packet.evidence` (that pointer is written when advancing `red` → `green`).

## RED tests

Command:

```bash
CI= npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/blocks-navigation.spec.cjs --grep navbar7 \
  --retries=0 --workers=1 --project="Desktop Light"
```

**Result: 16 failed / 0 passed** (Desktop Light).

Exact failure (all 16 cases):

```text
Error: icons block must not 404 — implement templates/blocks/nav-mega-menu-icons.html
Expected: 200
Received: 404
  at gotoIconsBlock (tests/components/blocks-navigation.spec.cjs)
```

Failed cases:

1. block page loads with ren-nav shell and icons root
2. exactly one primary links tree serves desktop and mobile
3. anatomy: four top-level entries, 4×4 destinations, footer, one chevron
4. summary opens by click, keyboard, and desktop pointer hover; Escape restores focus
5. outside click and destination activation close the disclosure
6. mobile toggle exposes the same tree and closes mega on menu close
7. JS-disabled mobile keeps the nav tree and mega destinations usable
8. viewport geometry: desktop panel under bar, mobile in-flow, no horizontal overflow
9. tablet mid-width: two-column groups, visible descriptions, horizontal footer
10. ren-icon wrappers size SVGs without width/height attributes; dest icons square
11. desktop chrome: single chevron, neutral details, aligned trigger
12. mobile rows: full width, start-aligned, descriptions hidden, footer stacked
13. visible interactive targets meet 44×44 in a touch context
14. reduced-motion disables block-local transitions and animations
15. icons mega menu preview passes WCAG 2.1 AA axe scan
16. light and dark surfaces resolve through RenDS tokens

Quality helpers used: `expectSingleVisibleAffordance`, `expectAligned`, `expectWidthRatio`, `expectNoOverflow`, `inspectNativeChrome`.

## Regression check (navbar5 / navbar6 preserved)

```bash
CI= npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/blocks-navigation.spec.cjs --grep-invert "navbar7" \
  --retries=0 --workers=2 --project="Desktop Light"
```

**Result: 32 passed** (existing Navigation blocks + navbar6 suites unchanged).

## Assumptions (explicit, not source facts)

| Topic | Ren10 decision |
| --- | --- |
| Shell breakpoint | `48rem` (`ren-nav`), not source ~991px |
| Mid-width content | 2-column groups + visible descriptions + horizontal footer at 48–64rem |
| Wide content | 4-column groups at ≥64rem |
| Outside click / dest close | Close mega; restore focus to summary when appropriate |
| Focus trap / scroll lock | **None** |
| Auto-close after nav | Close on in-page destination activation |
| Logo / icon pixel metadata | Token-sized SVG / `ren-icon` variants; no invented source ratios |
| Exact Tailwind sm/md/lg px | Unavailable — not claimed as source facts |

## Exact next implementation contract (Phase B)

1. Create **only** `templates/blocks/nav-mega-menu-icons.html` inside `packet.allowedFiles` (tests may be adjusted only if acceptance requires it; prefer making the block match tests).
2. Vanilla HTML/CSS/JS, Light DOM, semantic elements, RenDS tokens + layout primitives, WCAG 2.1 AA, reduced motion.
3. Implement the locked selectors and counts above; one semantic tree; native `details`/`summary` mega; named toggle with `aria-expanded` / `aria-controls`.
4. Neutralize classless `details`/`summary` chrome so exactly one `.rmi-chevron` is visible.
5. Desktop hover-open with stable pointer corridor; Escape; outside/destination close; mobile shell sync.
6. Progressive enhancement: JS-off shows the single tree and native mega (16 dest + footer).
7. Re-run navbar7 suite to green; keep navbar5/6 green.
8. Capture render matrix (12 states); Codex visual gate; do not invent green/reviewed evidence.

## Explicit non-goals (Phase A)

- Did **not** create `templates/blocks/nav-mega-menu-icons.html`
- Did **not** copy Relume proprietary source, classes, copy, URLs, or assets
- Did **not** advance to green/reviewed/accepted
- Did **not** capture render-matrix screenshots (Gate 5 is post-implementation)
- Did **not** commit
