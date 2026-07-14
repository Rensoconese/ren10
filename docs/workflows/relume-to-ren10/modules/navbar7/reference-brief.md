# Reference Brief

## Retrieval metadata

- Family: `navbars`
- Module ID: `navbar7` (Relume component id `navbar7_component`; name Navbar 7; slug `navbar7`)
- Retrieved through: Relume MCP (complete source retrieval for this module)
- Retrieved at: 2026-07-13 (Phase A packet preparation by Codex; sanitized facts only)
- Source variants returned: desktop horizontal bar; tablet/mobile overlay navigation with
  independently mounted trees and state in the reference implementation
- Supporting files returned (complete retrieval set): `Navbar7.tsx` shell plus owned support
  modules `hooks/use-media-query.ts`, `components/ui/button.tsx`, `components/ui/card.tsx`
  (imported but unused in source), and `lib/utils.ts`

## Retrieved facts

Record only facts visible in the complete returned source (sanitized — no proprietary
class names, copy, URLs, assets, or framework source):

### Dependencies (source stack)

- React UI with motion animation library
- Icon package from the reference library
- Button and card UI primitives (card imported but unused)
- Utility media-query hook for breakpoint branching
- Class-name utility helpers

### Default anatomy (counts and ownership)

- **One** linked logo (brand) at the start of the bar — **SVG** mark (no raster logo)
- **Four** top-level primary entries: **three** ordinary destinations plus **one** mega-menu trigger
- **Two** global header action controls (trailing edge of the bar)
- **One** mobile menu toggle control (non-desktop shell) with **three** visual hamburger bars
- Mega panel destinations: **four** titled groups × **four** destinations each = **16** destination anchors
- Every mega destination content model includes **one icon**, a **title**, and a **description**
- Destination icon containers are **square**
- Mega **footer** region: exactly **1** prompt, **1** inline text link, and **2** icon-supported action buttons
- **No** raster / featured media region (unlike Navbar 5 / Navbar 6)
- Link totals (source expanded content model): **20** navigation/content links
  (**3** top-level destinations + **16** mega destinations + **1** footer text link),
  **plus** the **1** linked logo (brand). Global header actions and footer icon actions are
  separate action controls, not counted in those 20.

### Expanded source tree (interaction inventory)

When both shell and mega content are expanded, the source tree exposes:

- **Twenty** navigation/content links (3 top-level + 16 mega destinations + 1 footer text link)
- **One** linked logo (in addition to the 20)
- One mega trigger (disclosure control; not one of the 20 destination links)
- Two global header action controls
- One mobile menu toggle with **three** visual bars
- Footer: one prompt (non-link text), one inline text link (already in the 20), two icon-supported action controls

Exact proprietary labels are excluded from this packet.

### Source tree strategy

- Source **duplicates** desktop and mobile navigation trees
- Desktop and mobile own **independent open/closed state**
- Ren10 translation must **collapse** this into **one responsive light-DOM tree** (see translation map)

### Desktop (wide)

- Horizontal composition: logo | primary nav | actions (actions at trailing edge)
- Mega panel is a **viewport-width** dropdown under the bar
- Destination layout: **four columns** (one column per titled group)
- Mega footer is **horizontal**
- Pointer **hover** and **click** both operate the mega trigger

### Non-desktop / mobile shell

- Logo + menu toggle (three visual hamburger bars)
- Opening reveals **one full-height scrollable** navigation panel below the navbar
- Primary items and actions **stack vertically**
- Source toggle is **not** accessibility-complete (lacks accessible name, `aria-expanded`,
  and `aria-controls` — see Source defects). Ren10 must supply a real named button with
  full ARIA relationships as an intentional improvement, not as a claim about the source.

### Base mobile mega content

- Destination groups: **1 column**
- Destination **descriptions hidden**
- Footer actions **stacked**

### Intermediate (source `sm` / `md` intent)

- Groups become **2 columns** at source `md`
- Descriptions become **visible** at source `md`
- Footer actions become **horizontal** at source `sm`
- Exact Tailwind `sm` / `md` / `lg` pixel values are **unavailable** (no config in packet)

### Source behavioral boundary

- Source uses approximately **`max-width: 991px`** to suppress hover; above that boundary hover works
- Ren10 may use its established shell breakpoint consistently (see translation map); tests must still
  cover **mobile**, an **intermediate tablet width**, and **desktop**

### Motion / interaction notes visible in source

- Desktop mega: hover **or** click
- Mobile mega: click-driven nested disclosure inside the open shell
- Mobile navigation panel: **0.4s** vertical open transition; on exit the panel **unmounts**
  after the close animation
- Dropdown indicator (chevron): rotates **180 degrees** over **0.3s**
- Dropdown panel: **opacity** and **height** transition over **0.2s**
- Outside-click, focus trap, scroll lock, and auto-close-after-navigation behaviors are
  **not** fully specified in the sanitized source set (see Unavailable evidence)

### Source defects (must not be preserved as Ren10 contract)

- Non-native mega trigger lacks proper keyboard support and ARIA disclosure semantics
- Mobile hamburger / menu toggle **lacks an accessible name**, **`aria-expanded`**, and
  **`aria-controls`** in the retrieved source (do not describe the source control as
  accessible; Ren10 must fix this with a real named button and full ARIA wiring)
- Incomplete relationship exposure on disclosure controls more broadly
- No Escape handling or focus restoration on close
- Focus outline removed or insufficient in source styling
- No `prefers-reduced-motion` handling (source still expresses 0.4s / 0.3s / 0.2s motion)
- Duplicated desktop/mobile DOM trees
- No Shadow DOM is required; Ren10 must stay Light DOM only

## Responsive states

### Desktop (wide)

- Horizontal logo / four primary entries / two actions
- Viewport-width mega panel under the bar
- Four-column titled destination groups (16 destinations)
- Horizontal mega footer (prompt + inline link + two icon actions)
- Open via hover **or** click in source; Ren10 preserves desktop **pointer hover-open**
  **and** requires keyboard-equivalent open (click / Enter / Space on a native
  disclosure) plus Escape and stable pointer close — see translation map

### Intermediate / tablet

- Source treats widths up to ~991px as the non-hover / mobile-shell path
- At mid width, groups reflow to **two columns** with **visible descriptions**
- Footer actions can be horizontal while the shell may still be non-desktop in source
- Exact `sm`/`md`/`lg` pixels unavailable — Ren10 maps content bands intentionally

### Mobile (narrow)

- Menu toggle (three bars) opens full-height scrollable navigation panel below the bar
- Mobile panel uses the source **0.4s** vertical transition and exit unmount
- Same content model as intermediate path, with one-column groups, hidden descriptions,
  stacked footer actions
- Nested mega opens by click only

## Interaction states

| State | Verified behavior (source) |
| --- | --- |
| Default (closed) | Mega closed; mobile shell closed |
| Desktop mega open | Hover or click on mega trigger; absolute panel visible |
| Mobile navigation open | Toggle opens shell; mega may remain closed |
| Mobile nested open | Shell open **and** mega open |
| Keyboard / ARIA (source) | Incomplete — non-native trigger and toggle defects |
| Escape / focus return (source) | Absent / unverified |
| Motion durations (source) | Mobile panel **0.4s** vertical + exit unmount; chevron **180° / 0.3s**; dropdown opacity/height **0.2s** |
| Reduced motion (source) | Absent (`prefers-reduced-motion` not handled) |
| Outside click / focus trap / scroll lock / auto-close after nav (source) | Unavailable as verified source facts |
| Disabled / loading / error | Not present as a documented source matrix for this module |

## Visual relationships

**Source-derived structural relationships:**

- Desktop: four titled groups form a **four-column** main region; footer sits below groups
- Every destination pairs a **square icon** with title + description
- Logo is **SVG** (no raster brand media)
- **No** featured / promotional media region
- Exactly one chevron-like indicator intent on the mega trigger (rotates **180°** over
  **0.3s** in source; source may still render duplicate indicators via CSS — Ren10 requires
  **exactly one visible chevron owner**)
- Mobile menu toggle shows **three** visual hamburger bars
- Four groups × four destinations; one footer with one prompt, one text link, two icon actions
- **20** navigation/content links + **1** linked logo in the expanded content model
- Small mobile hides destination descriptions; mid widths show them

**Labeled inference (Ren10 test targets, not raw Relume tokens):**

- Mega trigger should share the primary-link vertical alignment axis with peer top-level links
- No nested-card chrome on the disclosure from classless `details` defaults
- Destination icon containers remain square and sized via `ren-icon` variants (not inline SVG width/height)
- Touch targets meet 44×44 in a touch context
- Desktop panel sits under the bar; mobile panel stays in-flow inside the open shell
- Intermediate tablet must not cramp four columns into unreadable widths

**Unavailable as measured values:** exact spacing rhythm, resolved colors, SVG path data,
pixel-perfect column widths, logo aspect ratio/dimensions, icon source metadata.

## Unavailable evidence

- Tailwind configuration and **exact** `sm` / `md` / `lg` pixel breakpoint values
- Exact logo ratio / dimensions and global source styles
- Icon source metadata (library asset ids / path data)
- Outside-click behavior, focus trap, scroll lock, and auto-close-after-navigation as verified source facts
- Rendered Relume preview screenshot / computed styles
- WCAG audit results and multi-browser test matrix from the source library
- Source evidence for `prefers-reduced-motion` handling or RTL behavior
  (motion **durations** themselves **are** available: 0.4s mobile panel, 0.3s chevron
  rotation, 0.2s dropdown opacity/height — see Motion section above)
- Proprietary marketing copy, image URLs, and class names (intentionally excluded)

## Public-output exclusions

Must not appear in Ren10 public output:

- Relume product/module marketing names beyond internal packet ids (`navbar7`)
- Relume / React / Motion / Tailwind / Radix / CVA class names or imports
- Copied proprietary copy, image URLs, or assets from the reference library
- Duplicated desktop/mobile DOM trees
- Nested interactive controls (button inside anchor, dual tab stops)
- Shadow DOM; framework abstractions (React, Vue, Svelte, JSX/TSX, shadcn)
- Primitive palette tokens and hardcoded non-grayscale colors in block CSS
- Hover-only open without keyboard equivalence
- Removed focus outlines
- Raster featured media (not part of this module’s anatomy)
