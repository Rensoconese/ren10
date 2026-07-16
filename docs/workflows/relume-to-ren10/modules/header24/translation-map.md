# Relume Header 24 → Ren10 Translation Map

## Contracts loaded

`ren-design.md`, `tokens/tokens.md`, `base/layouts.md`, `base/primitive-zero.md`,
`components/components.md`, `ren-button/component.md`, and `ren-field/component.md`.

## Mapping

- Labelled native section → semantic content-height landmark.
- Finite centered region → `ren-center` + `ren-stack`.
- Heading/description/legal → native `h1`/`p`.
- Email → one `ren-field` with visible label, required native email input, one
  linked error message, and no pristine error display.
- Form row → `ren-switcher`, stacked base and nowrap at 640px.
- Submit → one native `.ren-btn` submit.
- Terms → one real local anchor.
- Enhancement → one root-scoped inline ES module; native form remains functional
  without JavaScript, enhanced valid submit announces one polite success status.

## Cascade risks

- Reset heading/paragraph margins so stacks own rhythm.
- `ren-field-error` uses an authored display rule; a block-local class must ensure
  `[hidden]` wins in the pristine state.
- Do not create a second custom validation message or duplicate required indicator.
- No global document query beyond locating the block root.

## Responsive adaptation

- One centered column at every width.
- Form stacked through 639px and flexible-field/intrinsic-submit row from 640px.
- No raw flex/grid declaration; `ren-switcher` owns layout.

## Rejected mappings

- Placeholder-only label, injected legal HTML, fragment terms, console-only action,
  raw grid, duplicated mobile form, and any media are rejected.
