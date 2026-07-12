# Relume to RenDS Translation Map

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/patterns/ren-nav/pattern.md`
- `components/composites/ren-menu/component.md` (rejection rationale)
- `components/composites/ren-popover/component.md` (rejection rationale)
- Block evidence: `templates/blocks/nav-mega-menu.html`
- Classless cascade: `base/classless.css` (`details`, `summary`, `summary::after`)

## RenDS mapping

| Reference part | RenDS / native choice | Preserved behavior | Intentional Ren10 difference |
| --- | --- | --- | --- |
| Site navbar shell | **`ren-nav`** pattern (`<ren-nav>` + `<nav class="ren-nav">`) | Brand, primary links, actions, mobile toggle, landmark | Ren10 tokens/themes; original Northline demo copy |
| Primary destinations | Single `<ul class="ren-nav-links">` | One tree for all widths | Progressive enhancement for JS-off mobile |
| Mega trigger | Native **`details`/`summary`** (`.rbm-disclosure`) | Click/Enter/Space open; semantic disclosure | Not `ren-nav-dropdown` popover |
| Dropdown indicator | Single authored SVG (`.rbm-chevron`) | One visible affordance | Classless `summary::after` neutralized |
| Grouped destinations | Layout primitives (`ren-grid`, `ren-stack-*`) + anchors | Two groups × four destinations | Ren10 icon/label/desc anatomy |
| Featured articles | Block-local feature anchors (not forced `ren-card`) | Two articles; desktop horizontal, mobile stacked | Token surfaces (`--color-surface-sunken`) |
| CTAs | `.ren-btn` anchors in `.ren-nav-actions` | Two actions | Ren10 button variants |
| Escape / outside close | Block-local controller | Close + focus return | Minimal JS; native owns open |

### `ren-nav` shell

Chosen because the product needs a horizontal site nav with brand + links +
actions and a hamburger below **`48rem`**. Canonical markup and a11y contract
come from `components/patterns/ren-nav/pattern.md`.

### Native `details`/`summary` disclosure

Chosen so the rich mega panel stays in the Light DOM document flow on mobile
and remains usable without JavaScript. Native keyboard activation is preserved.
Block-local JS only adds Escape, outside-click, destination-close, mobile-close
sync, and single-controller re-init.

## Cascade risks

Inspected against `base/classless.css` and block-local resets:

| Risk | Classless / global rule | Mitigation (block-local ownership) |
| --- | --- | --- |
| Card chrome on details | `details { border; border-radius; padding; margin }` | `.rbm-disclosure` resets border/radius/padding/margin/background |
| Double chevron | `summary::after` draws a CSS chevron | `.rbm-disclosure > summary::after` sets `content: none; display: none` — only `.rbm-chevron` may render |
| Open divider | `details[open] > summary { border-block-end; margin/padding }` | Open summary divider and extra block margins zeroed |
| Marker | `summary::-webkit-details-marker` / `::marker` | Marker emptied / webkit marker hidden |
| Mobile center alignment | Core `ren-nav` mobile `align-items: center` | Block overrides stretch full-width start-aligned rows |
| Absolute mobile links | Core hides/positions `.ren-nav-links` | In-flow open shell + `ren-nav:not(:defined)` progressive fallback |

**Ownership rule:** cascade neutralization lives in the block stylesheet, not in
core RenDS classless or `ren-nav` CSS. Rebuild commit `73d1416` established and
tested this ownership.

## Responsive adaptation

- Ren10 breakpoint: **`48rem`** (matches `ren-nav` contract; ~768px).
- This is an **intentional Ren10 difference** if the reference used another
  shell width — Ren10 does not retune core `ren-nav` solely to imitate Relume.
- Desktop: panel `position: absolute` under the bar.
- Mobile: panel in-flow; groups single column; feature media stacks over text.

## Progressive enhancement

**One-tree progressive enhancement:**

1. With custom elements upgraded and JS on: toggle controls mobile shell;
   disclosure works natively; block controller adds Escape/outside/link close.
2. With JS disabled / `ren-nav` not defined: inert toggle is hidden; single
   `.ren-nav-links` tree and actions are forced visible below `48rem`; native
   `details` still opens mega destinations.
3. No second mobile DOM tree is authored.

## Rejected mappings

| Rejected choice | Why |
| --- | --- |
| **`ren-menu`** | Command menu with `role="menu"` / `menuitem` is wrong for persistent navigation destinations and rich article cards. Contract routes app navigation to `ren-nav` / `ren-sidebar`. |
| **Top-layer popovers** (`ren-popover`, `ren-nav-dropdown` `[popover]`) | Useful for small dropdowns; awkward for a full-width mega panel that must become **in-flow** content inside the mobile menu. Top layer fights mobile stacked layout. |
| Hover-only open | Not keyboard-equivalent; excluded from Ren10 contract. |
| Duplicated desktop/mobile trees | Violates one-tree progressive enhancement and a11y landmark clarity. |
