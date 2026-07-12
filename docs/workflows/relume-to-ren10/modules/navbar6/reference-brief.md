# Reference Brief

## Retrieval metadata

- Family: `navbars`
- Module ID: `navbar6` (Relume component id `navbar6_component`; name Navbar 6; slug `navbar6`)
- Retrieved through: Relume MCP (complete source retrieval for this module)
- Retrieved at: 2026-07-12 (Phase A packet preparation; sanitized facts only)
- Source variants returned: desktop horizontal bar; tablet/mobile overlay navigation with
  independently mounted trees and state in the reference implementation
- Supporting files returned (complete retrieval set): component tree modules for the navbar
  shell, button primitive, media-query hook, and class-name utility helpers

## Retrieved facts

Record only facts visible in the complete returned source (sanitized — no proprietary
class names, copy, URLs, assets, or framework source):

### Dependencies (source stack)

- React UI with motion animation library
- Icon package from the reference library
- Radix Slot, class-variance-authority (CVA), `clsx`, and `tailwind-merge`
- Utility media-query hook for breakpoint branching

### Default anatomy (counts and ownership)

- Linked logo (brand) at the start of the bar
- **Four** top-level primary entries: **three** ordinary destinations plus **one** mega-menu trigger
- **Two** navbar action controls (end of bar)
- **One** mobile menu toggle control
- Mega panel: **three** destination groups × **four** destinations each = **12** destination anchors
- **One** featured-blog promotional region: media (source expresses **16:9** aspect), title,
  description, and a nested “read more” control (source nests a button-like control inside the
  promotional anchor — a known source defect; Ren10 must not reproduce button-in-anchor)
- **One** “see all” control associated with the mega destinations / featured region

### Expanded source tree (interaction inventory)

When both shell and mega content are expanded, the source tree exposes approximately:

- **17** anchors
- **five** button-like controls
- **one** paragraph treated with `role="button"` semantics in the source

Exact proprietary labels are excluded from this packet.

### Source tree strategy

- Source **duplicates** desktop and **conditionally mounted** mobile trees
- Desktop and mobile own **independent open/closed state**
- Ren10 translation must **collapse** this into **one responsive light-DOM tree** (see translation map)

### Desktop (wide / `lg` intent)

- Horizontal composition: logo | primary nav | actions
- Mega panel is a **viewport-width absolute** dropdown under the bar
- Panel layout: **three-column** destination groups plus a **constrained right** featured panel

### Tablet (source: up to ~991px uses mobile shell)

- Uses the **mobile click / hamburger overlay** path rather than desktop hover bar
- At source `md`, destination groups become **three columns** and **descriptions appear**

### Small mobile

- **Full-height scroll** overlay
- Stacked primary nav and actions
- Destination groups collapse to **one column**
- Destination **descriptions hidden**
- Featured item stacks **below** the groups

### Motion (source-expressed durations)

- Mobile overlay transition: **0.4s**
- Mega desktop open: **hover or click**
- Mega mobile open: **click**
- Dropdown open/close: **0.2s**
- Chevron rotation: **0.3s**

### Source defects (must not be preserved as Ren10 contract)

- Non-native mega trigger lacks proper keyboard support and ARIA disclosure semantics
- Mobile toggle lacks an accessible name and full ARIA expanded/controls wiring in source
- No Escape handling or focus restoration on close
- Focus outline removed in source styling
- Interactive control nested inside an anchor (featured read-more)
- No `prefers-reduced-motion` handling

## Responsive states

### Desktop (wide)

- Horizontal logo / four primary entries / two actions
- Viewport-width absolute mega panel under the bar
- Three-column destinations + constrained featured column (16:9 media intent)
- Open via hover **or** click in source; Ren10 preserves desktop **pointer hover-open**
  **and** requires keyboard-equivalent open (click / Enter / Space on a native
  disclosure) plus Escape and stable pointer close — see translation map

### Tablet

- Source treats widths up to ~991px as the mobile overlay path
- At mid width, groups can reflow to three columns with visible descriptions
- Exact Tailwind `md`/`lg` pixel values are **unavailable** in this packet (no config)

### Mobile (narrow)

- Hamburger opens full-height scroll overlay
- Same expanded content model as tablet path, with one-column groups, hidden descriptions,
  featured below, stacked actions
- Nested mega opens by click only

## Interaction states

| State | Verified behavior (source) |
| --- | --- |
| Default (closed) | Mega closed; mobile overlay closed |
| Desktop mega open | Hover or click on mega trigger; absolute panel visible |
| Mobile navigation open | Toggle opens overlay shell; mega may remain closed |
| Mobile nested open | Overlay open **and** mega open |
| Keyboard / ARIA (source) | Incomplete — non-native trigger and toggle defects |
| Escape / focus return (source) | Absent |
| Reduced motion (source) | Absent |
| Nested control in feature (source) | Button-like control nested in promotional anchor |
| Disabled / loading / error | Not present as a documented source matrix for this module |

## Visual relationships

**Source-derived structural relationships:**

- Desktop: destinations form a **three-column** main region; featured panel is **right-constrained**
- Featured media aspect expressed as **16:9**
- Exactly one chevron-like indicator intent on the mega trigger (source may still render
  duplicate indicators via CSS — Ren10 requires **exactly one visible chevron owner**)
- Three groups × four destinations; one featured promo; one see-all control
- Small mobile hides destination descriptions; mid widths show them

**Labeled inference (Ren10 test targets, not raw Relume tokens):**

- Mega trigger should share the primary-link vertical alignment axis with peer top-level links
- No nested-card chrome on the disclosure from classless `details` defaults
- Featured region uses a distinct surface from the panel body
- Touch targets meet 44×44 in a touch context
- Desktop panel sits under the bar; mobile panel stays in-flow inside the open shell

**Unavailable as measured values:** exact spacing rhythm, resolved colors, SVG path data,
pixel-perfect column widths.

## Unavailable evidence

- Tailwind configuration and **exact** `md` / `lg` pixel breakpoint values
- Rendered Relume preview screenshot / computed styles
- SVG icon path contents
- WCAG audit results and multi-browser test matrix from the source library
- Source evidence for reduced-motion or RTL behavior
- Proprietary marketing copy, image URLs, and class names (intentionally excluded)

## Public-output exclusions

Must not appear in Ren10 public output:

- Relume product/module marketing names beyond internal packet ids (`navbar6`)
- Relume / React / Motion / Tailwind / Radix / CVA class names or imports
- Copied proprietary copy, image URLs, or assets from the reference library
- Duplicated desktop/mobile DOM trees
- Nested `<button>` (or role=button) inside an `<a>`
- Shadow DOM; framework abstractions (React, Vue, Svelte, JSX/TSX, shadcn)
- Primitive palette tokens and hardcoded non-grayscale colors in block CSS
- Hover-only open without keyboard equivalence
- Removed focus outlines
