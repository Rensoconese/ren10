# Task 3 re-review

Status: APPROVED

Reviewed the Task 3 brief, implementer report, and diff `89e92d5..cfbbf3`.

## Toast fix

- `showOnViewport()` appends the generated toast before reading `getComputedStyle(toast).getPropertyValue('--ren-toast-duration')`, so an individual `.ren-toast`/scoped override is effective.
- The resolved duration updates the progress transition and timer consistently; a zero token removes the progress bar and duration attribute.
- Explicit `duration` remains authoritative (`durationExplicit`), and explicit/status helper calls remain authoritative (`statusExplicit`), preserving status-specific defaults.

Tooltip runtime delay is likewise read from the tooltip element after styling, with explicit `show-delay` taking precedence.

## Verification

- Contract fixture: passed.
- `npm run lint:contracts`: 0 unconsumed, 0 contract-absent, 14 pre-existing unresolved aliases (expected Task 4).
- `npm run test:components`: 48 passed (Desktop Light and Dark), including composite/pattern geometry/color/motion and scoped toast assertions.
- `npm run lint:css`: passed.
- `npm run lint:tokens`: passed.

Sampled the original requirements: scoped `:where(:root, [data-theme])` defaults, runtime reads, composite composition/known hazards, and preservation of modifiers are represented in the reviewed changes. No Critical or Important findings remain.

