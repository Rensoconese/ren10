# Task 3 review

## Verdict: CHANGES_REQUESTED

The bridge covers the sampled composite/pattern surfaces and the static checker
recognizes literal runtime reads.  I found no Critical issue, but one Important
issue remains around toast duration scoping.

## Findings

### Important — toast runtime read ignores a toast-node scoped override

`showOnViewport()` reads `--ren-toast-duration` from the viewport before it
creates the toast (`components/composites/ren-toast/ren-toast.js`).  A consumer
override placed on an individual `.ren-toast` node (or a pre-existing toast that
is being replaced) is therefore never observed; the node is created only after
the duration has already been selected.  This makes runtime token behavior
inconsistent with the component API's closer-scope override semantics and with
the implementer's own noted concern.  The read should resolve the effective
scope for the target toast (or otherwise document/enforce that duration is only
viewport-scoped) while preserving explicit `duration` and `status` authority.

No Critical findings. Slider pseudo selectors, calendar/menu composition, and
the sampled alert/dialog, sheet, tooltip, popover, and pattern bridges look
correct on inspection.

## Verification

- `node scripts/check-css-contracts.test.mjs` — PASS
- `npm run lint:css` — PASS
- `npm run test:components` — PASS (46 tests, Light + Dark)
- `npm run lint:contracts` reports exactly the expected 14 pre-existing
  unresolved aliases; static output has zero unconsumed/contract-absent tokens.

Because the toast scope issue is Important, this review is not APPROVED.
