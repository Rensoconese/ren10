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
- `components/primitives/ren-link/component.md`
- `components/composites/ren-menu/component.md` (rejection rationale)
- `components/composites/ren-popover/component.md` (rejection rationale)
- Canonical prior packets: `docs/workflows/relume-to-ren10/modules/navbar5/`,
  `docs/workflows/relume-to-ren10/modules/navbar6/`,
  `docs/workflows/relume-to-ren10/modules/navbar7/`
- Classless cascade: `base/classless.css` (`details`, `summary`, `summary::after`)

## RenDS mapping

| Reference part | RenDS / native choice | Preserved behavior | Intentional Ren10 difference |
| --- | --- | --- | --- |
| Site navbar shell | **`ren-nav`** (`<ren-nav>` + `<nav class="ren-nav">`) | Brand, primary links, actions, mobile toggle, single landmark | Ren10 tokens/themes; original demo copy only |
| Primary destinations | Single `<ul class="ren-nav-links" id="rml-primary-links">` | One tree for all widths | Progressive enhancement for JS-off mobile |
| Four top-level entries | Three `a.ren-nav-link` + one mega disclosure summary | Count and order intent (fourth opens mega) | Native disclosure instead of `<p role="button">` |
| Mega trigger | Native **`details`/`summary`** (`.rml-disclosure`) | Open/close panel; single chevron owner | **Desktop pointer hover-preview** + **click pin** (navbar7 policy); Enter/Space; Escape; stable pointer close |
| Dropdown indicator | Single authored SVG (`.rml-chevron`) | One visible affordance | Classless `summary::after` neutralized |
| 3×4 destinations | Layout primitives (`ren-grid` / block tracks) + anchors (`.rml-dest`) | Twelve destinations in three titled groups | Token-driven row anatomy; descriptions hide only via Ren10 CSS at narrow widths |
| Destination icon | `.rml-dest-icon` wrapping `span.ren-icon` + decorative SVG | Square icon container; icon + title + description model | Size from `.ren-icon-*` only — **no** inline SVG `width`/`height` |
| Destination title / description | `.rml-dest-label` / `.rml-dest-desc` | Content model complete in DOM | Descriptions may be visually hidden below intentional narrow breakpoint; remain in DOM |
| Contrast link rail | `.rml-rail` region with heading + five simple links | Distinct contrast surface; five destinations; edge-continued background intent | Semantic surface tokens; no featured media; no nested `nav` |
| Rail heading | Non-interactive text (`.rml-rail-heading`) | Rail ownership label | Not a fake button / not a landmark |
| Rail links | Real `<a class="rml-rail-link">` (exactly **5**) | Simple text links (no icon+desc model) | Ren10 link chrome / tokens |
| Global CTAs | `.ren-btn` anchors in `.ren-nav-actions` | Two actions at trailing edge | Ren10 button variants |
| Mobile overlay | `ren-nav` toggle + shared tree | Full-height open shell, stacked rows | `48rem` shell breakpoint (not source ~991px); **named** toggle with `aria-expanded` / `aria-controls` |
| Escape / outside close / destination close | Block-local controller | Close + focus return to summary | Explicit Ren10 behavior (source facts incomplete) |
| Motion | RenDS duration tokens + reduced-motion | Source **0.4s** mobile panel, **0.2s** dropdown opacity/height, **0.3s** chevron, hamburger staged **0.1/0.2/0.3s** | Map to nearest RenDS duration tokens; **must** honor `prefers-reduced-motion` |
| Elevation | `--ren-z-sticky` / public elevation tokens | Mega sits above page content | **Reject** raw `z-[999]` / literal z-index |
| Featured / raster media | **None** | N/A — module has no featured media | Do not invent a featured column from Navbar 5/6 |

### `ren-nav` shell

Chosen because the product needs a horizontal site nav with brand + links +
actions and a hamburger below **`48rem`**. Canonical markup and a11y contract
come from `components/patterns/ren-nav/pattern.md`. Single `<nav class="ren-nav">`
landmark — **no** nested unlabeled `nav` for the mega or rail.

### Native `details`/`summary` disclosure

Chosen so the rich mega panel stays in the Light DOM document flow on mobile
and remains usable without JavaScript. Native keyboard activation replaces the
source’s `<p role="button">` mega trigger. Block-local JS adds the accepted
**navbar7 interaction policy**:

- desktop **pointer hover may preview** open;
- **click pins** open; **second click closes**;
- keyboard Enter/Space opens/toggles; Escape closes;
- **stable pointer close** when leaving the combined disclosure + panel hit region
  (moving from summary into the panel must not close);
- state/`open` and any supplemental ARIA remain synchronized;
- outside-click, destination-close, mobile-close sync, and single-controller re-init.

Hover is **in addition to** click/Enter/Space — never a hover-only contract.
Below `48rem`, mega open remains activation-driven (mobile shell path).

### Icon destinations (square)

Preserves the 12-destination content model (icon + title + description) with
square icon containers. Uses `ren-icon` size variants; forbids inline SVG
width/height attributes (navbar6/7 lesson). No featured media rail.

### Contrast link rail

Preserves the distinct right-hand rail: one heading + five simple links on a
contrast surface whose background continues toward the viewport edge on desktop.
Rail links are real anchors — never nested interactive controls, never a second
`nav` landmark. Source max-width **14rem** is an anatomy proportion, not a hard
pixel contract; Ren10 may map to nearest size/width tokens while keeping the rail
visibly narrower than the primary three-group region.

### Edge-rail composition (bespoke CSS justification)

Layout primitives (`ren-grid`, `ren-stack`, `ren-cluster`, etc.) cover most
navbar5–7 compositions. Navbar 8’s desktop mega requires a **primary multi-column
region + narrower edge-continued contrast rail**. If `ren-grid` alone cannot
express “rail background paints to the viewport edge while content stays in the
content band,” Phase B may use **narrowly block-scoped** CSS under
`[data-rml-root]` (for example a full-bleed rail track with tokenized
`background` / `max-width`). Do **not** retune core `ren-nav` or invent global
utilities. Document any residual geometry literals in the Token policy section.

## Cascade risks

Inspected against `base/classless.css`, core `ren-nav`, and navbar5–7 block lessons:

| Risk | Classless / global rule | Mitigation (block-local ownership) |
| --- | --- | --- |
| Card chrome on details | `details { border; border-radius; padding; margin }` | `.rml-disclosure` resets border/radius/padding/margin/background |
| Double chevron | `summary::after` draws a CSS chevron | `.rml-disclosure > summary::after` sets `content: none; display: none` — only `.rml-chevron` may render |
| Open divider | `details[open] > summary { border-block-end; margin/padding }` | Open summary divider and extra block margins zeroed |
| Marker | `summary::-webkit-details-marker` / `::marker` | Marker emptied / webkit marker hidden |
| Mobile center alignment | Core `ren-nav` mobile `align-items: center` | Block overrides stretch full-width start-aligned rows |
| Absolute mobile links | Core hides/positions `.ren-nav-links` | In-flow open shell + `ren-nav:not(:defined)` progressive fallback |
| Description visibility | Consumer CSS only | Hide `.rml-dest-desc` only below intentional narrow breakpoint; keep in DOM |
| Cramped 3-up + rail tablet | Wide desktop composition forced at mid width | Mid-width content band reflows groups (e.g. 1–2 columns) while keeping rail readable; avoid unreadable squeeze |
| Rail edge paint | Full-bleed contrast vs content band | Block-scoped rail track; tokens only; no raw hex |
| Icon sizing | Inline SVG width/height fights tokens | `.ren-icon-*` only; square containers via CSS aspect / fixed track |
| Duplicate landmarks | Extra nested `nav` | Exactly one `nav.ren-nav`; rail is a region/div, not a second landmark |
| Raw elevation | `z-[999]` | Use `--ren-z-sticky` / public elevation tokens only |

**Ownership rule:** cascade neutralization lives in the block stylesheet, not in
core RenDS classless or `ren-nav` CSS. Follow the navbar5–7 ownership model.

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
  - **&lt;48rem (mobile):** compact groups; **descriptions visually hidden**;
    rail links stacked; panel in-flow inside open nav shell.
  - **48rem–63.999rem (tablet / mid desktop):** groups reflow for readability
    with **visible descriptions**; rail remains distinct; avoid unreadable
    three-column + edge-rail squeeze at ~834px.
  - **≥64rem (wide desktop):** **three-column** primary groups + narrower
    edge-continued contrast rail (source-intent wide mega).
- Hover-preview / click-pin applies only on the desktop shell path (≥48rem).
  Below 48rem, mega remains activation-driven.

## Explicit Ren10 behavior (source facts incomplete)

Define these in implementation and acceptance; do **not** claim them as Relume facts:

| Behavior | Ren10 contract |
| --- | --- |
| Outside click | Click outside the open disclosure + panel closes mega and restores focus to summary when focus was inside |
| Destination / rail link activation | Activating a mega destination or rail link closes the mega disclosure |
| Mobile shell close | Closing `.ren-nav-toggle` also closes an open mega disclosure |
| Click pin (desktop) | First click pins open; second click closes (navbar7 parity) |
| Focus trap | **No** focus trap — Light DOM document tab order; Escape closes mega |
| Scroll lock | **No** body scroll lock on mega open (desktop absolute panel / mobile in-flow shell); mobile panel remains scrollable |
| Auto-close after navigation | Close on in-page destination activation (hash/demo anchors); full page navigations unload naturally |
| Landmarks | Exactly one primary `nav`; rail is not a nested landmark |
| Logo dimensions | Brand mark uses a token-sized SVG via layout/`ren-icon` or fixed token box (e.g. `--size-sm`); no invented ratio claimed as source |

## Token policy (geometry / radii / widths)

Reusable literals in the block map to RenDS size tokens where a token exists:

| Role | Token / decision |
| --- | --- |
| Brand mark ~32px | `var(--size-sm)` (2rem / 32px) when applicable |
| Summary radius | `var(--radius-md)` |
| Panel max width / full band | Full viewport band under bar; content tracks via layout tokens |
| Destination icon square | `ren-icon` size + square container; no primitive palette fills |
| Rail contrast surface | Semantic surface / fill tokens (e.g. `--color-surface-raised` / `--color-fill` / equivalent public surface pair) — never hex |
| Rail max width intent (~14rem) | Nearest public width/size token or documented residual |
| Summary / row padding | `var(--space-2)` / `var(--space-3)` |
| Motion (0.4s / 0.3s / 0.2s / staged hamburger) | `--duration-overlay`, `--duration-state`, `--duration-enter` (or nearest public duration tokens) + reduced-motion zeroing |
| Elevation | `--ren-z-sticky` (or public elevation token) — never raw `999` |
| Inline SVG width/height on icons | **Forbidden** — size from `.ren-icon-sm` / `.ren-icon-lg` only |

### Justified residuals (no matching token; documented)

| Literal | Why retained |
| --- | --- |
| `--ren-nav-height: 4.5rem` | Intentional demo bar taller than component default `3.5rem` (navbar5–7 parity) |
| `--grid-min` for destination tracks | Custom min track floor for group columns if `ren-grid-*` alone is insufficient |
| Shell / content breakpoints `48rem` / `48.01rem` / `63.999rem` / `64rem` | Intentional Ren10 shell honesty + mid-width mega composition bands |
| Rail edge-bleed geometry | Block-scoped full-bleed contrast rail if primitives cannot express viewport-edge paint |
| Hero `min-height` on preview canvas | Preview-page only (not mega chrome) |

## Progressive enhancement

**One-tree progressive enhancement:**

1. With custom elements upgraded and JS on: toggle controls mobile shell;
   disclosure works natively; block controller adds hover-preview/click-pin/Escape/outside/link close.
2. With JS disabled / `ren-nav` not defined: inert toggle is hidden; single
   `.ren-nav-links` tree and actions are forced visible below `48rem`; native
   `details` still opens mega destinations (including 12 destinations + rail).
3. No second mobile DOM tree is authored (explicit rejection of source duplication).

## Rejected mappings

| Rejected choice | Why |
| --- | --- |
| **`ren-menu`** | Command menu with `role="menu"` / `menuitem` is wrong for persistent navigation destinations and a rich multi-group mega + rail. Contract routes app navigation to `ren-nav` / `ren-sidebar`. |
| **Top-layer popovers** (`ren-popover`, `ren-nav-dropdown` `[popover]`) | Useful for small dropdowns; awkward for a full-width mega panel that must become **in-flow** content inside the mobile menu and paint an edge rail. Top layer fights stacked mobile layout and edge-bleed. |
| Hover-**only** open (no keyboard/click) | Not keyboard-equivalent. **Desktop hover-preview is preserved** alongside click pin / Enter / Space. |
| Duplicated desktop/mobile trees | Violates one-tree progressive enhancement and a11y landmark clarity; source does this — Ren10 does not. |
| Featured media / blog rail from Navbar 5/6 | **Not in Navbar 8 anatomy** — do not copy. Navbar 8’s rail is **simple links on a contrast surface**, not a promo card. |
| Nested button inside anchors | Invalid HTML / dual interactive targets. |
| Extra nested `nav` for rail or mega | Duplicate landmarks; use one `nav.ren-nav` only. |
| Source `<p role="button">` trigger | Incomplete keyboard/ARIA — replace with native `details`/`summary`. |
| Motion without reduced-motion | Source omits it; Ren10 requires `prefers-reduced-motion` zeroing of block-local transitions. |
| Raw `z-[999]` / literal z-index | Token policy violation — use public elevation tokens. |
| Retuning core `ren-nav` breakpoint to ~991px | Would change the design system shell solely to imitate Relume; rejected. |
| Inline SVG width/height on destination icons | Fights `ren-icon` size contract validated on navbar6/7. |
