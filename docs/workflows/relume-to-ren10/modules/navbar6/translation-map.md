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
- Canonical prior packet: `docs/workflows/relume-to-ren10/modules/navbar5/`
- Classless cascade: `base/classless.css` (`details`, `summary`, `summary::after`)

## RenDS mapping

| Reference part | RenDS / native choice | Preserved behavior | Intentional Ren10 difference |
| --- | --- | --- | --- |
| Site navbar shell | **`ren-nav`** (`<ren-nav>` + `<nav class="ren-nav">`) | Brand, primary links, actions, mobile toggle, landmark | Ren10 tokens/themes; original demo copy only |
| Primary destinations | Single `<ul class="ren-nav-links" id="rmf-primary-links">` | One tree for all widths | Progressive enhancement for JS-off mobile |
| Four top-level entries | Three `a.ren-nav-link` + one mega disclosure summary | Count and order intent | Native disclosure instead of non-native trigger |
| Mega trigger | Native **`details`/`summary`** (`.rmf-disclosure`) | Open/close panel; single chevron owner | **Desktop pointer hover-open** (Relume parity) **plus** click/Enter/Space; Escape; **stable pointer close** when leaving the disclosure+panel hit region (not flicker when moving summary → panel) |
| Dropdown indicator | Single authored SVG (`.rmf-chevron`) | One visible affordance | Classless `summary::after` neutralized |
| 3×4 destinations | Layout primitives (`ren-grid`, `ren-stack-*`) + anchors (`.rmf-dest`) | Twelve destinations in three groups | Token-driven row anatomy; descriptions hide only via Ren10 CSS at narrow widths |
| Featured blog promo | One feature anchor (`.rmf-feature`) with media/body | 16:9 media, title, description, read-more cue | **No nested button** — text/span cue only; real single anchor |
| See-all control | Real anchor (`.rmf-view-all`) | One see-all destination | Ren10 link/button chrome as appropriate, not nested inside feature |
| CTAs | `.ren-btn` anchors in `.ren-nav-actions` | Two actions | Ren10 button variants |
| Mobile overlay | `ren-nav` toggle + shared tree | Full-height open shell, stacked rows | `48rem` shell breakpoint (not source ~991px) |
| Escape / outside close | Block-local controller | Close + focus return to summary | Minimal JS; native owns open state |
| Motion | RenDS duration tokens + reduced-motion | Open/close feedback | Source 0.2s/0.3s/0.4s mapped to tokens; **must** honor `prefers-reduced-motion` |

### `ren-nav` shell

Chosen because the product needs a horizontal site nav with brand + links +
actions and a hamburger below **`48rem`**. Canonical markup and a11y contract
come from `components/patterns/ren-nav/pattern.md`.

### Native `details`/`summary` disclosure

Chosen so the rich mega panel stays in the Light DOM document flow on mobile
and remains usable without JavaScript. Native keyboard activation replaces the
source’s non-native mega trigger. Block-local JS adds:

- desktop **pointer hover-open** (preserve Relume desktop behavior) with
  **stable pointer close** when the pointer leaves the combined
  disclosure + panel hit region (moving from summary into the panel must not
  close);
- Escape, outside-click, destination-close, mobile-close sync, and
  single-controller re-init.

Hover is **in addition to** click/Enter/Space — never a hover-only contract.
Below `48rem`, mega open remains click-driven (mobile shell path).

### Featured blog (16:9)

Preserves the single promotional region and **16:9** media ratio. Rejects the
source defect of nesting a button inside the feature anchor. Read-more is a
non-interactive textual cue inside the same anchor, or a sibling text span that
is not a second tab stop.

## Cascade risks

Inspected against `base/classless.css`, core `ren-nav`, and navbar5 block lessons:

| Risk | Classless / global rule | Mitigation (block-local ownership) |
| --- | --- | --- |
| Card chrome on details | `details { border; border-radius; padding; margin }` | `.rmf-disclosure` resets border/radius/padding/margin/background |
| Double chevron | `summary::after` draws a CSS chevron | `.rmf-disclosure > summary::after` sets `content: none; display: none` — only `.rmf-chevron` may render |
| Open divider | `details[open] > summary { border-block-end; margin/padding }` | Open summary divider and extra block margins zeroed |
| Marker | `summary::-webkit-details-marker` / `::marker` | Marker emptied / webkit marker hidden |
| Mobile center alignment | Core `ren-nav` mobile `align-items: center` | Block overrides stretch full-width start-aligned rows |
| Absolute mobile links | Core hides/positions `.ren-nav-links` | In-flow open shell + `ren-nav:not(:defined)` progressive fallback |
| Feature nested control | N/A (source defect) | Markup forbids button/role=button inside `.rmf-feature` |
| Description visibility | Consumer CSS only | Hide `.rmf-dest-desc` only below intentional narrow breakpoint; keep in DOM for markers |

**Ownership rule:** cascade neutralization lives in the block stylesheet, not in
core RenDS classless or `ren-nav` CSS. Follow the navbar5 ownership model
validated under packet `navbar5`.

## Responsive adaptation

- Ren10 shell breakpoint: **`48rem`** (matches `ren-nav` contract; ~768px).
- This is an **intentional Ren10 difference** versus the source tablet/mobile split
  near ~991px and Tailwind `md`/`lg` (exact values unavailable).
- **Desktop shell (≥48rem):** panel `position: absolute` under the bar; **no
  hamburger toggle interaction** (toggle is shell chrome for the mobile path
  only). Mid widths such as **834px** stay on the desktop shell — render-matrix
  `tablet-light-open` captures that honestly (mega open via disclosure, not
  `.ren-nav-toggle`).
- **Mega content bands (intentional mid-width adaptation):**
  - **48rem–63.999rem (tablet / mid desktop):** three destination groups span
    the **full panel width**; featured region **stacks below** as a **horizontal
    promo card** (16:9 media beside copy). Avoids the unreadable 3-column +
    right-rail squeeze that appears when the wide desktop composition is forced
    at ~834px.
  - **≥64rem (wide desktop):** three destination columns + **constrained right
    feature panel** (source-intent side-by-side mega); 16:9 feature media in the
    rail.
- Mobile (<48rem): panel in-flow inside open nav shell; groups single column;
  descriptions may hide; feature stacks below groups; toggle opens shell.

## Token policy (geometry / radii / widths)

Reusable literals in the block map to RenDS size tokens where a token exists:

| Former / role | Token / decision |
| --- | --- |
| Brand mark `32px` | `var(--size-sm)` (2rem / 32px) |
| Summary radius `0.375rem` | `var(--radius-md)` (no 0.375rem token; align with dest surfaces) |
| Panel max width `80rem` | `var(--width-7xl)` |
| Featured rail `20rem` (default / mobile stack base) | `var(--width-xs)` |
| Summary padding soft `--ren-space-*` fallbacks | `var(--space-2)` / `var(--space-3)` |
| Inline SVG `width`/`height` on `.ren-icon-*` children | **Removed** — size from `.ren-icon-sm` / `.ren-icon-lg` only |

### Justified residuals (no matching token; documented)

| Literal | Why retained |
| --- | --- |
| `--ren-nav-height: 4.5rem` | Intentional demo bar taller than component default `3.5rem` (navbar5 parity) |
| `--grid-min: 9rem` | Custom 3-up destination track floor; no width token between control sizes and `--width-xs` |
| Featured wide rail `18rem` | Source-intent constrained side panel; deliberately narrower than `--width-xs` (20rem) |
| Tablet media track `minmax(10rem, 14rem)` | Custom media\|copy proportion for mid-width horizontal featured card |
| Hero `min-height: 360px` | Preview-page canvas only (not mega chrome); no matching size token |
| Shell / content breakpoints `48rem` / `48.01rem` / `63.999rem` / `64rem` | Intentional Ren10 shell honesty + mid-width mega composition bands (see Responsive adaptation) |

## Progressive enhancement

**One-tree progressive enhancement:**

1. With custom elements upgraded and JS on: toggle controls mobile shell;
   disclosure works natively; block controller adds Escape/outside/link close.
2. With JS disabled / `ren-nav` not defined: inert toggle is hidden; single
   `.ren-nav-links` tree and actions are forced visible below `48rem`; native
   `details` still opens mega destinations (including 12 destinations + feature
   + see-all).
3. No second mobile DOM tree is authored (explicit rejection of source duplication).

## Rejected mappings

| Rejected choice | Why |
| --- | --- |
| **`ren-menu`** | Command menu with `role="menu"` / `menuitem` is wrong for persistent navigation destinations and a rich featured article. Contract routes app navigation to `ren-nav` / `ren-sidebar`. |
| **Top-layer popovers** (`ren-popover`, `ren-nav-dropdown` `[popover]`) | Useful for small dropdowns; awkward for a full-width mega panel that must become **in-flow** content inside the mobile menu. Top layer fights stacked mobile layout. |
| Hover-**only** open (no keyboard/click) | Not keyboard-equivalent. **Desktop hover-open is preserved** alongside click/Enter/Space; rejecting hover-only is not rejecting Relume pointer open. |
| Duplicated desktop/mobile trees | Violates one-tree progressive enhancement and a11y landmark clarity; source does this — Ren10 does not. |
| Nested button inside feature anchor | Invalid HTML / dual interactive targets; source defect must be fixed, not ported. |
| Motion without reduced-motion | Source omits it; Ren10 requires `prefers-reduced-motion` zeroing of block-local transitions. |
| Retuning core `ren-nav` breakpoint to ~991px | Would change the design system shell solely to imitate Relume; rejected. |
