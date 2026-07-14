# Task 2 final review — primitive Appearance tokens

**Decision: APPROVED**

Reviewed the implementer report, review diff, and follow-up commits `07f1882`,
`fa8995d`, and `627dce2`. No Critical or Important findings.

Verification performed:

- `npx playwright test ... foundation-contract.spec.cjs`: **6 passed** (light/dark root overrides, closer-scope precedence, and theme overrides surviving token import).
- `npm run test:a11y`: **376 passed**, including docs/tokens contrast and axe checks.
- `npm run lint:css`: passed.
- `npm run lint:tokens`: passed (54 CSS files, 7 exemptions).
- `npm run lint`: correctly remains **RED** at the contract-inventory stage with **14 unresolved custom properties + 178 unconsumed composite/pattern Appearance tokens = 192 violations**. The corrected report in `627dce2` accurately states this; it does not claim a green lint.

Review notes:

- The 129 primitive-family tokens are consumed by concrete properties, with defaults scoped via `:where(:root, [data-theme])`; this preserves inheritance while allowing closer scopes and theme/component overrides to win.
- Variant and state rules remain later in the cascade, so danger/success/checked, compact, and size behavior are not erased by base Appearance defaults.
- The reviewed corrections (button font-weight hook, interactive checkbox/radio borders, field input background semantics, switch dimensions, icon fill behavior, avatar group border scope) are contract-consistent and covered by focused tests.
- Documentation/examples use the actual `--ren-btn-border-color` API and semantic AI/on-AI colors; accessibility checks pass.

The remaining 192 contract violations are composite/pattern handoff inventory and known unresolved references, explicitly outside Task 2 scope; they are not regressions introduced by this change.
