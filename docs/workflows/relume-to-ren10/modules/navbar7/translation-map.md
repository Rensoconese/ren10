# Relume to RenDS Translation Map

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/patterns/ren-nav/pattern.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-icon/component.md`
- `components/primitives/ren-link/component.md` (footer prompt link)
- `components/composites/ren-menu/component.md` (rejection rationale)
- `components/composites/ren-popover/component.md` (rejection rationale)
- Canonical prior packets: `docs/workflows/relume-to-ren10/modules/navbar5/`,
  `docs/workflows/relume-to-ren10/modules/navbar6/`
- Classless cascade: `base/classless.css` (`details`, `summary`, `summary::after`)

## RenDS mapping

| Reference part | RenDS / native choice | Preserved behavior | Intentional Ren10 difference |
| --- | --- | --- | --- |
| Site navbar shell | **`ren-nav`** (`<ren-nav>` + `<nav class="ren-nav">`) | Brand, primary links, actions, mobile toggle, landmark | Ren10 tokens/themes; original demo copy only |
| Primary destinations | Single `<ul class="ren-nav-links" id="rmi-primary-links">` | One tree for all widths | Progressive enhancement for JS-off mobile |
| Four top-level entries | Three `a.ren-nav-link` + one mega disclosure summary | Count and order intent | Native disclosure instead of non-native trigger |
| Mega trigger | Native **`details`/`summary`** (`.rmi-disclosure`) | Open/close panel; single chevron owner | **Desktop pointer hover-open** (Relume parity) **plus** click/Enter/Space; Escape; **stable pointer close** when leaving the disclosure+panel hit region |
| Dropdown indicator | Single authored SVG (`.rmi-chevron`) | One visible affordance | Classless `summary::after` neutralized |
| 4×4 destinations | Layout primitives (`ren-grid` / `ren-grid-4` / block tracks) + anchors (`.rmi-dest`) | Sixteen destinations in four titled groups | Token-driven row anatomy; descriptions hide only via Ren10 CSS at narrow widths |
| Destination icon | `.rmi-dest-icon` wrapping `span.ren-icon` + decorative SVG | Square icon container; icon + title + description model | Size from `.ren-icon-*` only — **no** inline SVG `width`/`height`; square frame via layout / aspect |
| Destination title / description | `.rmi-dest-label` / `.rmi-dest-desc` | Content model complete in DOM | Descriptions may be visually hidden below intentional narrow breakpoint; remain in DOM for markers/a11y |
| Mega footer | `.rmi-footer` region | One prompt, one text link, two icon actions | Real anchors/buttons; no nested interactive controls |
| Footer prompt | Non-interactive text (`.rmi-footer-prompt`) | Prompt copy ownership | Not a fake button |
| Footer text link | Real `<a>` (`.rmi-footer-link`) | One inline text link | Ren10 link chrome / tokens |
| Footer icon actions | Two real anchors or buttons (`.rmi-footer-action`) with `ren-icon` | Two icon-supported actions | Horizontal on desktop/mid; stacked on narrow mobile |
| Global CTAs | `.ren-btn` anchors in `.ren-nav-actions` | Two actions at trailing edge | Ren10 button variants |
| Mobile overlay | `ren-nav` toggle (three bars) + shared tree | Full-height open shell, stacked rows | `48rem` shell breakpoint (not source ~991px); **named** toggle with `aria-expanded` / `aria-controls` (source hamburger lacks these — Ren10 fix, not source parity) |
| Escape / outside close / destination close | Block-local controller | Close + focus return to summary | Explicit Ren10 behavior (source facts incomplete) |
| Motion | RenDS duration tokens + reduced-motion | Source **0.4s** mobile panel (vertical + exit unmount), **0.3s** chevron **180°**, **0.2s** dropdown opacity/height | Map to nearest RenDS duration tokens; **must** honor `prefers-reduced-motion` |
| Featured / raster media | **None** | N/A — module has no featured media | Do not invent a featured column from Navbar 5/6 |

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

### Icon destinations (square)

Preserves the 16-destination content model (icon + title + description) with
square icon containers. Uses `ren-icon` size variants; forbids inline SVG
width/height attributes (navbar6 lesson). No featured media rail.

### Mega footer

Preserves the footer trio: prompt text, one inline link, two icon-supported
actions. Footer actions reflow stacked → horizontal across Ren10 content bands
(see Responsive adaptation). Actions are real interactive elements — never
nested button-in-anchor.

## Cascade risks

Inspected against `base/classless.css`, core `ren-nav`, and navbar5/navbar6 block lessons:

| Risk | Classless / global rule | Mitigation (block-local ownership) |
| --- | --- | --- |
| Card chrome on details | `details { border; border-radius; padding; margin }` | `.rmi-disclosure` resets border/radius/padding/margin/background |
| Double chevron | `summary::after` draws a CSS chevron | `.rmi-disclosure > summary::after` sets `content: none; display: none` — only `.rmi-chevron` may render |
| Open divider | `details[open] > summary { border-block-end; margin/padding }` | Open summary divider and extra block margins zeroed |
| Marker | `summary::-webkit-details-marker` / `::marker` | Marker emptied / webkit marker hidden |
| Mobile center alignment | Core `ren-nav` mobile `align-items: center` | Block overrides stretch full-width start-aligned rows |
| Absolute mobile links | Core hides/positions `.ren-nav-links` | In-flow open shell + `ren-nav:not(:defined)` progressive fallback |
| Description visibility | Consumer CSS only | Hide `.rmi-dest-desc` only below intentional narrow breakpoint; keep in DOM for markers |
| Cramped 4-up tablet | Wide desktop composition forced at mid width | Mid-width content band uses **2 columns**, not 4 (source `md` intent) |
| Icon sizing | Inline SVG width/height fights tokens | `.ren-icon-*` only; square containers via CSS aspect / fixed track |

**Ownership rule:** cascade neutralization lives in the block stylesheet, not in
core RenDS classless or `ren-nav` CSS. Follow the navbar5/navbar6 ownership model.

## Responsive adaptation

- Ren10 shell breakpoint: **`48rem`** (matches `ren-nav` contract; ~768px).
- This is an **intentional Ren10 difference** versus the source tablet/mobile split
  near ~991px and Tailwind `sm`/`md`/`lg` (exact values unavailable).
- **Desktop shell (≥48rem):** panel `position: absolute` under the bar; **no
  hamburger toggle interaction** (toggle is shell chrome for the mobile path
  only). Mid widths such as **834px** stay on the desktop shell — render-matrix
  `tablet-light-open` captures that honestly (mega open via disclosure, not
  `.ren-nav-toggle`).
- **Mega content bands (intentional mid-width adaptation):**
  - **&lt;48rem (mobile):** one-column groups; **descriptions visually hidden**;
    footer actions **stacked**; panel in-flow inside open nav shell.
  - **48rem–63.999rem (tablet / mid desktop):** **two-column** groups with
    **visible descriptions**; footer **horizontal** (prompt/link/actions
    readable without 4-up squeeze). Avoids unreadable four-column destinations
    at ~834px.
  - **≥64rem (wide desktop):** **four-column** destination groups + horizontal
    footer (source-intent wide mega).
- Hover-open applies only on the desktop shell path (≥48rem). Below 48rem,
  mega remains click-driven.

## Explicit Ren10 behavior (source facts incomplete)

Define these in implementation and acceptance; do **not** claim them as Relume facts:

| Behavior | Ren10 contract |
| --- | --- |
| Outside click | Click outside the open disclosure + panel closes mega and restores focus to summary when focus was inside |
| Destination / footer link activation | Activating a mega destination or footer action closes the mega disclosure |
| Mobile shell close | Closing `.ren-nav-toggle` also closes an open mega disclosure |
| Focus trap | **No** focus trap — Light DOM document tab order; Escape closes mega |
| Scroll lock | **No** body scroll lock on mega open (desktop absolute panel / mobile in-flow shell) |
| Auto-close after navigation | Close on in-page destination activation (hash/demo anchors); full page navigations unload naturally |
| Logo dimensions | Brand mark uses a token-sized SVG via layout/`ren-icon` or fixed token box (e.g. `--size-sm`); no invented ratio claimed as source |

## Token policy (geometry / radii / widths)

Reusable literals in the block map to RenDS size tokens where a token exists:

| Role | Token / decision |
| --- | --- |
| Brand mark ~32px | `var(--size-sm)` (2rem / 32px) when applicable |
| Summary radius | `var(--radius-md)` |
| Panel max width | `var(--width-7xl)` or full viewport band under bar |
| Destination icon square | `ren-icon` size + square container; no primitive palette fills |
| Summary / row padding | `var(--space-2)` / `var(--space-3)` |
| Inline SVG width/height on icons | **Forbidden** — size from `.ren-icon-sm` / `.ren-icon-lg` only |

### Justified residuals (no matching token; documented)

| Literal | Why retained |
| --- | --- |
| `--ren-nav-height: 4.5rem` | Intentional demo bar taller than component default `3.5rem` (navbar5/6 parity) |
| `--grid-min` for destination tracks | Custom min track floor for 2-up / 4-up groups if `ren-grid-*` alone is insufficient |
| Shell / content breakpoints `48rem` / `48.01rem` / `63.999rem` / `64rem` | Intentional Ren10 shell honesty + mid-width mega composition bands |
| Hero `min-height` on preview canvas | Preview-page only (not mega chrome) |

## Progressive enhancement

**One-tree progressive enhancement:**

1. With custom elements upgraded and JS on: toggle controls mobile shell;
   disclosure works natively; block controller adds hover/Escape/outside/link close.
2. With JS disabled / `ren-nav` not defined: inert toggle is hidden; single
   `.ren-nav-links` tree and actions are forced visible below `48rem`; native
   `details` still opens mega destinations (including 16 destinations + footer).
3. No second mobile DOM tree is authored (explicit rejection of source duplication).

## Rejected mappings

| Rejected choice | Why |
| --- | --- |
| **`ren-menu`** | Command menu with `role="menu"` / `menuitem` is wrong for persistent navigation destinations and a rich multi-group mega. Contract routes app navigation to `ren-nav` / `ren-sidebar`. |
| **Top-layer popovers** (`ren-popover`, `ren-nav-dropdown` `[popover]`) | Useful for small dropdowns; awkward for a full-width mega panel that must become **in-flow** content inside the mobile menu. Top layer fights stacked mobile layout. |
| Hover-**only** open (no keyboard/click) | Not keyboard-equivalent. **Desktop hover-open is preserved** alongside click/Enter/Space. |
| Duplicated desktop/mobile trees | Violates one-tree progressive enhancement and a11y landmark clarity; source does this — Ren10 does not. |
| Featured media / blog rail from Navbar 5/6 | **Not in Navbar 7 anatomy** — do not copy. |
| Nested button inside anchors | Invalid HTML / dual interactive targets. |
| Motion without reduced-motion | Source omits it; Ren10 requires `prefers-reduced-motion` zeroing of block-local transitions. |
| Retuning core `ren-nav` breakpoint to ~991px | Would change the design system shell solely to imitate Relume; rejected. |
| Inline SVG width/height on destination icons | Fights `ren-icon` size contract validated on navbar6. |
