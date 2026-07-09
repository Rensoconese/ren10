# Task 3 implementer report

Status: DONE

## RED / GREEN

- RED: the new representative composite/pattern Playwright assertion failed before the bridge rules (`#scoped-dialog` resolved to its legacy width instead of `--ren-dialog-width`).
- GREEN: after wiring public variables, the focused fixture passed in both Desktop Light and Desktop Dark.
- Runtime validator RED/GREEN: the checker fixture now fails to classify a literal `getComputedStyle(...).getPropertyValue('--ren-*')` read as unconsumed, and the unit fixture passes.

## Changes

- Connected Appearance tokens for dialog/alert-dialog, sheet, tooltip, popover, tabs, calendar, menu, slider, collapsible/accordion, color-picker, carousel, toast, toggle-group, toolbar, dropzone, empty-state, sidebar, table, form, nav, command, and AI-safe pattern surfaces.
- Moved the composite/pattern defaults in `tokens/component/tokens.css` to `:where(:root, [data-theme])` scopes.
- Fixed slider pseudo-element selectors and ensured calendar/menu/table/popover geometry variables reach their actual surfaces.
- Added runtime token reads for tooltip delay and toast duration; explicit toast status/options retain status-specific defaults and explicit duration authority.
- Kept the existing 14 unresolved aliases untouched for Task 4 and did not introduce a hover-card token family.

## Verification

- `node scripts/check-css-contracts.test.mjs` ✅
- `npm run lint:contracts` ✅ expected static result: `0 unconsumed`, `0 contract-absent`, exactly `14 unresolved`
- `npm run lint:css` ✅
- `npm run test:components` ✅ 46 passed (Desktop Light + Dark)

## Follow-up resolution

- Scoped toast duration now resolves from `getComputedStyle(toast)` after insertion, so selector-level overrides are honored while explicit duration/status remain authoritative. Progress transition and timer are updated without scheduling an additional animation frame.
- RED coverage added for the scoped runtime read; focused component test passes in Desktop Light and Dark.
- `npm run lint:css` and `npm run lint:tokens` pass. Full `npm run lint` remains expected RED only because Task 4's 14 unresolved aliases are intentionally preserved.
- Independent re-review after the scoped-toast fix: APPROVED, no Critical/Important findings.
