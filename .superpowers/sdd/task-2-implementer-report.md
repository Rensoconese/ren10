# Task 2 implementer report — primitive Appearance tokens

Status: **DONE**

## Scope delivered

- Moved all 129 public primitive defaults (18 families; `ren-radio` remains intentionally family-less) from component-local selectors to inheritable `:root, [data-theme]` scopes.
- Connected every primitive token to a property with an observable computed effect.
- Kept semantic/size variants later in the cascade so base Appearance overrides do not erase danger, success, checked, compact, or size behavior.
- Renamed the two stale theme overrides from `--ren-btn-weight` to `--ren-btn-font-weight`.
- Corrected checkbox/radio borders to `--color-border-interactive` and retained the required input-background semantics for fields.
- Added native/contractual computed-style coverage for root and closer-scope overrides on button, card, field, badge, and switch.

## TDD evidence

### Task 2 regression RED/GREEN

- Specificity regression: the added foundation assertion fails against the old `:root, [data-theme]` selectors when `tokens/component/tokens.css` is imported after theme CSS (theme radius/weight are overwritten). Wrapping defaults in `:where(:root, [data-theme])` restores the expected cascade; focused foundation contract is now **6 passed** across Desktop Light/Dark.
- Documentation contrast regression: the token docs preview previously rendered a hotpink button at 2.64:1 and documented the stale `--ren-btn-border` hook. The preview and examples now use the real `--ren-btn-border-color` API with the semantic `--color-ai`/`--color-on-ai` pair; docs accessibility and contrast checks are green.

### RED

Command:

```text
npx playwright test --config tests/components/playwright.config.cjs tests/components/foundation-contract.spec.cjs --project='Desktop Light'
```

Observed before production edits: **2 failed**. Both button assertions proved the API was inert: expected root/scoped radii `17px` / `23px`, received the hardcoded `8px` in both cases. The remaining assertions were behind those first failures.

### GREEN

Focused light project: **2 passed**. Full light/dark matrix: **4 passed**. The complete component suite, including the new tests: **42 passed**.

The static validator now reports:

| Inventory | Before | After |
|---|---:|---:|
| Unresolved custom properties | 14 | 14 |
| Unconsumed Appearance tokens | 307 | 178 |
| Unconsumed primitive-family tokens | 129 | 0 |
| Contract tokens absent from CSS | 0 | 0 |

`npm run lint:contracts` therefore remains red by design with exactly 192 pending violations (14 unresolved + 178 composite/pattern tokens) for Tasks 3 and 4; Task 2 neither hid nor increased that inventory.

## Defaults reconciled before activation

| Family | Activated default matching published behavior |
|---|---|
| Button | 44px minimum height; 8px/16px padding; 16px/500 type; 8px radius; accent background/border; state/enter transition; public focus ring tokens. |
| Card | Raised surface; 1px decorative border; 12px radius; 16px section padding; no shadow; 4px header gap; 0px optional section gap. |
| Field | 44px minimum height; 8px/12px padding; input background; interactive border; input placeholder/focus/error semantics. |
| Badge | Auto minimum height; 0.15em/0.55em padding; 11px semibold type; pill radius; fill + secondary text. |
| Tag | Auto minimum height; 0.25em/0.65em padding; caption/medium type; pill radius; existing fill/border/text. |
| Banner | 12px/16px padding; 8px radius; 12px gap; 24px icon; existing info tint and mixed border. |
| Checkbox | 20px control; 4px radius; interactive border; accent/on-accent checked pair; state/playful motion. |
| Switch | Contractual Apple-HIG 51px × 31px track, 27px thumb; active fill off-state; success checked-state; state-change motion. |
| Avatar | 40px pill; fill + secondary text; 13px type. `--ren-avatar-border` applies only to group children, never standalone avatars. |
| Breadcrumb | Caption type; 4px gaps; muted/current colors; `--ren-breadcrumb-separator` with compatibility fallback to the legacy instance property. |
| Pagination | 44px targets; label type; 8px radius; transparent rest, fill hover, accent active. |
| Progress | 8px pill track; fill/accent pair; state/enter width transition. |
| Spinner | Required 24px size, 2.5px stroke, accent leading edge, 1s cycle. |
| Skeleton | Fill/fill-hover shimmer; 4px base radius; loop-slow duration; static fill in reduced motion. |
| Separator | Semantic separator color; 1px stroke; 16px block margin. |
| Link | Link/hover colors; 1px underline; explicit `var(--ren-link-font-weight, inherit)` fallback preserves ancestor weight. |
| Kbd | Existing 0.1em/0.4em padding; caption/mono type; sunken/strong-border chip. |
| Icon | Required `--icon-md` (20px); currentColor color/fill inheritance without overriding explicit SVG `fill="none"`. |
| Radio | No component-token family added; only the required interactive-border semantic correction was made. |

## Default appearance comparison

Representative light/dark computed styles were captured before wiring and after wiring through a clean HTTP fixture.

| Primitive | Result |
|---|---|
| Button | Identical in light and dark: height, padding, type, radius, background, foreground, and border. |
| Card | Identical in light and dark: surface, border, radius, and shadow. |
| Field | Identical computed light/dark appearance; the activated default now names the already-equivalent interactive semantic directly. |
| Badge | Identical in light and dark: auto min-height, 6.05px computed inline padding, 11px/600 type, pill radius, fill, and text. |
| Switch | Intentional contract correction only: 51.1875×30.3906px became exact 51×31px; colors were unchanged. |

The other intentional visible correction is the stronger unchecked checkbox/radio border required by WCAG 1.4.11 and the root contract.

## Commands and outcomes

```text
npx playwright test --config tests/components/playwright.config.cjs tests/components/foundation-contract.spec.cjs --project='Desktop Light'
# 2 passed

npx playwright test --config tests/components/playwright.config.cjs tests/components/foundation-contract.spec.cjs
# 4 passed (Desktop Light + Desktop Dark)

npm run test:components
# 42 passed

node scripts/check-css-contracts.test.mjs
# CSS contract validator fixture: OK

npm run lint:css
# passed

npm run lint:tokens
# passed; 54 component CSS files, 7 documented exemptions

npm run lint:contracts
# expected RED: 14 unresolved, 178 unconsumed, 0 contract-absent

npm run test:a11y
# 376 tests passed (docs/tokens included in light/dark contrast and axe checks)

npm run lint
# expected RED: the CSS and token-policy stages pass; `lint:contracts` exits 1 for 14 unresolved + 178 unconsumed + 0 absent
```

## Residual risks / review focus

- Individual primitive styles now require the documented token import (`tokens/index.css` or `tokens/component/tokens.css`) before the component stylesheet; the golden fixture does so explicitly.
- `--ren-card-gap` affects adjacency between documented card sections without changing the card root to flex/grid; review consumers that intentionally add margins to those section classes.
- Base tokens deliberately do not replace semantic variant values on hover, danger/success states, or size modifiers.
- Composite/pattern defaults remain component-local and unconsumed; that is the explicit handoff to Task 3, not a Task 2 omission.
