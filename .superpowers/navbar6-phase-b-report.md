# Navbar 6 Phase B Report

**Date:** 2026-07-12
**Branch / worktree:** `codex/navbar6` @ `/Users/rensoconese/RenDS/worktrees/navbar6`
**Starting HEAD:** `c82ed8d`
**Scope:** Implement `templates/blocks/nav-mega-menu-featured.html` to GREEN (automated + captures). **No** green→reviewed advance.

## Outcome

Phase B complete. Packet `navbar6` advanced **`red` → `green`** with truthful `red-evidence.json` (Phase A 15×404). Implementation is GREEN on the focused suite (15/15 per project, 30 total), full blocks-navigation suite (60 passed), workflow units (114), lint/tokens, inventory check, and 12-state matrix capture. **Codex visual review and green→reviewed remain open.**

## RED confirmation (before implement)

```bash
CI= npx playwright test --config tests/components/playwright.config.cjs \
  tests/components/blocks-navigation.spec.cjs --grep "navbar6" \
  --retries=0 --workers=1 --project="Desktop Light"
```

**Result: 15 failed / 0 passed** — all `featured block must not 404` at `gotoFeaturedBlock`.

## Implementation

**Single production file:** `templates/blocks/nav-mega-menu-featured.html`

| Contract item | Implementation |
| --- | --- |
| Shell | `<ren-nav>` + `nav.ren-nav` + brand + 2 CTAs + toggle |
| One tree | `#rmf-primary-links` / `ul.ren-nav-links` only |
| Top-level 4 | Product, Resources (mega), Pricing, Docs |
| Mega | Native `details.rmf-disclosure` / `summary` + single `.rmf-chevron` |
| Destinations | 3 `.rmf-group` × 4 `.rmf-dest` = 12 (`.rmf-dest-desc` in DOM) |
| Feature | One `.rmf-feature` anchor + `.rmf-feature-media` **16:9**, no nested button |
| See-all | One `.rmf-view-all` |
| Desktop open | Click / Enter / Space + **pointer hover**; stable summary→panel; leave closes |
| Escape | Closes + restores focus to `SUMMARY` |
| Mobile | Toggle + same tree; mega closes when menu closes |
| JS-off | Toggle hidden; tree + actions forced visible; native disclosure usable |
| Breakpoint | Intentional **48rem** |
| Cascade | Block-local classless resets on details/summary/`::after` |
| Motion | Token transitions; `prefers-reduced-motion` zeros panel/chevron/dest/feature |
| Tokens | Semantic / component tokens only |

### Controller notes

- Desktop hover open via `pointerenter` / `pointermove` (re-open after Escape while pointer still over hit region).
- Click while pointer-inside + already open uses `preventDefault` so Playwright/real hover-then-click does not immediately toggle closed.
- Outside click, destination click, focusout-of-disclosure, mobile-toggle close, and breakpoint cross all close the mega.

### Intentional Ren10 differences (from packet)

- 48rem shell (not source ~991px)
- One tree (source duplicates)
- Native disclosure + keyboard/Escape
- No nested button in feature
- Reduced motion required

## GREEN tests

| Suite | Result |
| --- | --- |
| navbar6 × Desktop Light | **15 passed** |
| navbar6 × Desktop Dark | **15 passed** (30 total) |
| Full `blocks-navigation.spec.cjs` | **60 passed** |
| Workflow units (`relume-workflow` + `capture-block-matrix`) | **114 passed** |
| `npm run lint` | CSS / tokens / contracts OK; JS 0 errors (29 pre-existing warnings) |
| `git diff --check` | clean on block path |
| Packet validate | `navbar6 (green)` |
| `workflow:relume:check` | Valid inventory (navbar5 accepted, navbar6 in_progress) |

## Captures

```bash
npm run workflow:relume:capture -- \
  docs/workflows/relume-to-ren10/modules/navbar6/render-matrix.json \
  --module navbar6 --output .ren10-workflow/captures
```

**12 PNG + 12 JSON** at `.ren10-workflow/captures/navbar6/` (gitignored runtime). Every state `markerCounts`: 12 dest, 12 desc, 1 chevron, 1 feature, 1 view-all, 3 groups.

### Gross visual inspection (not Codex approval)

| State | Gross notes |
| --- | --- |
| `desktop-light-open` | Bar + 3 columns + right featured 16:9; panel under bar; no hero bleed after stacking fix |
| `desktop-dark-open` | Same anatomy on dark tokens |
| `mobile-light-nested-open` | Toggle open, mega open, stacked groups + feature, start-aligned rows |
| `mobile-js-disabled-open` | No toggle; tree visible; native mega open |
| `tablet-light-open` | Desktop shell at 834px (no hamburger); columns narrower — residual for Codex |

**Do not treat Grok gross inspection as Gate 6.** Independent Codex review required before `green` → `reviewed`.

## Evidence / stage

| File | Role |
| --- | --- |
| `red-evidence.json` | Truthful Phase A 15×404; used to advance red→green |
| `green-evidence.json` | Schema-shaped readiness + full testResults + capture paths; **not** used to advance |
| `packet.json` | Stage **`green`**; evidence pointers: reference, mapped, red |

**Not advanced:** green→reviewed, reviewed→accepted.

## Files changed

| Path | Notes |
| --- | --- |
| `templates/blocks/nav-mega-menu-featured.html` | Sole product implementation |
| `docs/workflows/relume-to-ren10/modules/navbar6/red-evidence.json` | New |
| `docs/workflows/relume-to-ren10/modules/navbar6/green-evidence.json` | New (tests + capture readiness) |
| `docs/workflows/relume-to-ren10/modules/navbar6/packet.json` | stage green; red evidence pointer |
| `.superpowers/navbar6-phase-b-report.md` | This report |

**Tests not modified** (no packet/test contradiction).
**Preserved:** `.superpowers/navbar6-phase-a-*`, user scratch files.

## Residual risks (current)

1. ~~Tablet mid-width column density (3 groups + featured at 834px).~~ **Addressed** — stacked mega composition at 48rem–63.999rem; Codex + independent review confirm readable destinations.
2. Desktop hover vs click co-existence (preventDefault while pointer-inside) — still intentional; covered by interaction tests.
3. Absolute mega panel stacking relative to page hero — fixed in block; re-verify after any ren-nav core change.
4. Catalog index does not yet list the featured block (out of allowedFiles for this packet).

## Gate 6 status

- **Stage remains `green`** — do **not** advance green→reviewed until packet evidence pointer + human acceptance flow require it.
- Codex visual + cascade inspection is recorded in `green-evidence.json` after the tablet fix and RenDS contract alignment.
- Human acceptance → `reviewed` / `accepted` remains open.

---

## Tablet composition fix (post-Codex visual gate FAIL)

**Date:** 2026-07-12
**Trigger:** Codex visual gate FAILED on `tablet-light-open` at **834px** — three destination columns + right feature rail made titles/descriptions excessively narrow and vertically fragmented.
**Starting HEAD:** `81d8cb2`
**Resulting HEAD:** `63424a9`
**Constraint:** Stay at packet stage **`green`** (no green→reviewed advance). Preserve markers/content/one-tree/hover.

### Intentional adaptation

| Band | Shell | Mega content |
| --- | --- | --- |
| `<48rem` | Mobile toggle shell | Single-column groups; feature below; descs may hide |
| **48rem–63.999rem** | **Desktop shell** (no hamburger) | **3 groups full width; featured stacked below as horizontal media\|copy card** |
| **≥64rem** | Desktop shell | 3 groups + constrained right feature rail (source-intent side-by-side) |

Shell breakpoint remains intentional Ren10 **`48rem`** (`ren-nav`). Mid-width change is content composition only.

### Changes

| Path | Change |
| --- | --- |
| `templates/blocks/nav-mega-menu-featured.html` | Split desktop mega CSS into tablet stack band + wide side-by-side band; horizontal featured card at mid width |
| `tests/components/blocks-navigation.spec.cjs` | New structural test: readable dest width, stacked featured, horizontal media\|body, ≥64rem side-by-side restore |
| `docs/.../translation-map.md` | Document mega content bands |
| `docs/.../acceptance.json` | Criterion `tablet-mega-composition` |
| `docs/.../render-matrix.json` | Notes on `tablet-light-open` intentional adaptation |

### Verification (at `63424a9`)

| Suite | Result |
| --- | --- |
| navbar6 (Desktop Light + Dark) | **32 passed** (was 30; +2 for tablet test ×2 projects) |
| Full `blocks-navigation.spec.cjs` | **62 passed** (was 60) |
| Workflow + capture units | **114 passed** |
| Matrix recapture | **12 PNG + 12 JSON** at `63424a9` |

### Visual states (tablet fix)

| State | Notes |
| --- | --- |
| `tablet-light-open` (834px) | **Fixed/readable:** desktop shell; 3 readable columns; featured full-width horizontal card below groups |
| `desktop-light-open` (1280) | Side-by-side groups + right rail restored |
| `mobile-light-nested-open` | Toggle + stacked groups/feature unchanged |

---

## RenDS contract alignment (GREEN review findings)

**Date:** 2026-07-12
**Base HEAD:** `63424a9`
**Constraint:** Stage stays **`green`** (no advance).

### Findings addressed

1. **`green-evidence.json`** made truthful/current after Codex + independent cascade/visual inspection (full commit hash, suite counts, all matrix states).
2. **ren-icon contract:** removed explicit `width`/`height` from every inline SVG owned by `.ren-icon-*`; preserved `viewBox`, `focusable="false"`, `aria-hidden="true"`; computed sizes verified via regression test.
3. **Token geometry audit:** replaced reusable literals (`32px`, `0.375rem`, `80rem`, `20rem`, soft `--ren-space-*` fallbacks) with size/radius/width/space tokens; documented justified residuals (`4.5rem` bar, `9rem` grid-min, `18rem` rail, `10–14rem` tablet media track, `360px` hero canvas, breakpoints) in `translation-map.md` and block comments.
4. **Hygiene:** trailing-whitespace clean; obsolete Phase B “residual tablet for Codex / not approval” statements reconciled above.

### Regression

- New Playwright test: `ren-icon wrappers size SVGs without width/height attributes` (forbids attrs; asserts sm≈16px / lg≈24px fill).

### Verification

See appended GREEN contract-alignment section at end of this report (filled after suites/captures).

### Verification (contract alignment — exact)

| Suite | Result |
| --- | --- |
| navbar6 focused (Light+Dark) | **34 passed** (17×2; +1 ren-icon attr/size regression vs 32 at 63424a9) |
| Full `blocks-navigation.spec.cjs` | **64 passed** (was 62 at 63424a9) |
| Workflow + capture units | **114 passed** |
| `npm run lint` | CSS/tokens/contracts OK; JS 0 errors (29 pre-existing warnings) |
| `git diff --check` | clean |
| Matrix recapture | **12 PNG + 12 JSON** stamped full `10cf71b1b07e400cfcf57d59588a269379b2b97b` (freshness refresh; every ignored JSON commit matches HEAD) |
| Packet validate | `navbar6 (green)` — **not advanced** |

### Capture freshness refresh (post–contract alignment)

**Date:** 2026-07-12
**HEAD:** `10cf71b1b07e400cfcf57d59588a269379b2b97b`
**Scope:** evidence/report only — no product code, stage stays **`green`**.

| Check | Result |
| --- | --- |
| `npm run workflow:relume:capture …` | **12 PNG + 12 JSON** under `.ren10-workflow/captures/navbar6` |
| JSON `commit` stamps | **12/12** = `10cf71b1b07e400cfcf57d59588a269379b2b97b` |
| `markerCounts` vs matrix | **12/12** states: 12 dest, 12 desc, 1 chevron, 1 feature, 1 view-all, 3 groups |
| `green-evidence.reviewedCommit` | full `10cf71b1b07e400cfcf57d59588a269379b2b97b` |
| `capturesFresh` | **true** only after verification above |
| Suite counts (current) | **34** / **64** / **114** |

### Cascade / visual (Codex + independent, re-checked at `10cf71b`)

- **desktop-light-open / desktop-dark-open:** groups + right 16:9 rail; single chevron; opaque panel; ren-icon SVGs sized (no attr regressions).
- **tablet-light-open:** fixed/readable — 3 full-width columns + horizontal featured card below.
- **mobile-light-nested-open / mobile-dark-nested-open:** one tree; start-aligned rows; feature below; icons OK on light/dark.
- **mobile-js-disabled-open:** no toggle; tree + mega usable progressive enhancement.
- **desktop-reduced-motion-open:** panel open, motion zeroed, layout parity with open.
- Remaining matrix states (closed, hover-open, mobile-nav-open) inspected; markerCounts 12/12/1/1/1/3.

**Stage remains `green`. Do not advance green→reviewed.**
