# Reference Brief

## Retrieval metadata

- Family: `navbars`
- Module ID: `navbar8` (Relume name Navbar 8; slug `navbar8`)
- Retrieved through: Relume MCP (complete source retrieval for this module; sanitized facts only)
- Retrieved at: 2026-07-13 (Phase A packet preparation; proprietary TSX not stored)
- Source variants returned: desktop horizontal bar with full-width mega; tablet/mobile overlay navigation with independently mounted trees in the reference implementation
- Supporting stack (source, not Ren10): React UI, Tailwind utility classes, motion library, icon package, media-query branching

## Retrieved facts

Record only facts visible in the complete returned source (sanitized — no proprietary
class names, copy, URLs, assets, or framework source):

### Dependencies (source stack)

- React UI with motion animation library
- Icon package from the reference library
- Tailwind utility classes (including raw z-index and motion duration utilities)
- Utility media-query hook for breakpoint branching
- Class-name utility helpers

### Default anatomy (counts and ownership)

- **One** linked logo (brand) at the start of the bar
- **Four** top-level primary entries: **three** ordinary destinations plus **one** mega-menu trigger (the **fourth** item)
- **Two** global header action controls (trailing edge of the bar / CTAs)
- **One** mobile menu toggle control (non-desktop shell) with hamburger morph affordance
- Mega primary region: **three** titled groups × **four** destinations each = **12** primary destinations
- Every primary destination content model includes **one icon**, a **title**, and a **description**
- Destination icon containers are **square** (icon + title + description row model)
- **Contrast-surface link rail** (distinct from the primary groups): **one** rail heading + **exactly five** simple text links
- **No** featured image, promotional card, or raster media region
- Link totals (source expanded content model): **3** top-level ordinary destinations + **12** mega destinations + **5** rail links = **20** navigation/content links in the expanded mega content model, **plus** the **1** linked logo (brand). Global header CTAs are separate action controls, not counted in those 20.

### Expanded source tree (interaction inventory)

When both shell and mega content are expanded, the source tree exposes:

- **Twenty** navigation/content links (3 top-level + 12 mega destinations + 5 rail links)
- **One** linked logo (in addition to the 20)
- One mega trigger (disclosure control; not one of the 20 destination links)
- Two global header action controls (CTAs)
- One mobile menu toggle with hamburger morph
- Three group headings + one rail heading (non-link labels)
- Twelve icon + title + description destinations; five simple rail links

Exact proprietary labels are excluded from this packet.

### Source tree strategy

- Source **duplicates** desktop and mobile navigation trees
- Desktop and mobile own **independent open/closed state**
- Ren10 translation must **collapse** this into **one responsive light-DOM tree** (see translation map)

### Desktop (wide)

- Horizontal composition: logo | primary nav (four items) | two CTAs
- Mega panel is a **viewport-width** panel under the bar
- Primary destination layout: **three columns** (one column per titled group)
- Right region: **narrower contrast-surface link rail** (source max width **14rem**) whose background **visually continues to the viewport edge**
- Pointer **hover** and **click/activation** both operate the mega trigger

### Non-desktop / mobile shell

- Logo + menu toggle (hamburger morph)
- Opening reveals **one full-height scrollable** navigation panel below the navbar
- Primary items and CTAs remain available in the open shell
- Mega becomes an **inline nested disclosure** inside the open shell
- Source toggle is **not** accessibility-complete (lacks accessible name, `aria-expanded`,
  and `aria-controls` — see Source defects). Ren10 must supply a real named button with
  full ARIA relationships as an intentional improvement, not as a claim about the source.

### Base mobile mega content

- Destination groups: compact column stacking
- Destination **descriptions hidden** at the smallest width
- Link rail stacks with the primary groups inside the nested disclosure
- Nested mega opens by activation only (no hover requirement)

### Intermediate (source mid-width intent)

- Descriptions become **visible** from a mid breakpoint upward
- Exact Tailwind `sm` / `md` / `lg` pixel values are **unavailable** (no config in packet)

### Source behavioral boundary

- Source uses approximately **`max-width: 991px`** for the desktop/mobile split
- Ren10 may use its established shell breakpoint consistently (see translation map); tests must still
  cover **mobile**, an **intermediate tablet width**, and **desktop**

### Motion / interaction notes visible in source

- Desktop mega: hover **or** activation (click)
- Mobile mega: activation-driven nested disclosure inside the open shell
- Mobile navigation panel: **0.4s** vertical open transition
- Dropdown panel: **opacity** and **height** transition over **0.2s**
- Dropdown indicator (chevron): rotates over **0.3s**
- Hamburger morph: staged delays **0.1s / 0.2s / 0.3s**
- Outside-click, focus trap, scroll lock, and auto-close-after-navigation behaviors are
  **not** fully specified in the sanitized source set (see Unavailable evidence)

### Source defects (must not be preserved as Ren10 contract)

- Mega trigger is **`<p role="button">`** without complete keyboard support and ARIA disclosure semantics
- Mobile hamburger / menu toggle **lacks an accessible name**, **`aria-expanded`**, and
  **`aria-controls`** in the retrieved source (do not describe the source control as
  accessible; Ren10 must fix this with a real named button and full ARIA wiring)
- No demonstrated Escape handling, outside-click, or focus restoration policy
- Raw utility z-index (`z-[999]`) instead of design-system elevation tokens
- Raw motion durations without `prefers-reduced-motion` evidence
- React / Tailwind / Motion runtime dependencies
- Duplicated desktop/mobile DOM trees
- Possible **extra unlabeled nested `nav` landmark** (must not ship duplicate landmarks)
- No Shadow DOM is required; Ren10 must stay Light DOM only

## Responsive states

### Desktop (wide)

- Horizontal logo / four primary entries / two CTAs
- Viewport-width mega panel under the bar
- Three-column titled destination groups (12 destinations) + right contrast link rail (heading + 5 links)
- Rail background continues toward the viewport edge; rail narrower than primary region (source max-width 14rem intent)
- Open via hover **or** activation in source; Ren10 preserves desktop **pointer hover-preview**
  **and** requires keyboard-equivalent open (click / Enter / Space on a native
  disclosure) plus Escape, click-pin, and stable pointer close — see translation map

### Intermediate / tablet

- Source treats widths up to ~991px as the non-hover / mobile-shell path
- At mid width, descriptions become **visible**
- Exact `sm`/`md`/`lg` pixels unavailable — Ren10 maps content bands intentionally
- Mid-width composition must keep three groups + rail readable (may reflow groups without inventing featured media)

### Mobile (narrow)

- Menu toggle opens full-height scrollable navigation panel below the bar
- Mobile panel uses the source **0.4s** vertical transition intent (map to RenDS tokens)
- Same content model as intermediate path, with compact groups, **hidden descriptions**,
  stacked rail links, nested mega by activation only

## Interaction states

| State | Verified behavior (source) |
| --- | --- |
| Default (closed) | Mega closed; mobile shell closed |
| Desktop mega open | Hover or activation on mega trigger; full-width panel visible |
| Mobile navigation open | Toggle opens shell; mega may remain closed |
| Mobile nested open | Shell open **and** mega open |
| Keyboard / ARIA (source) | Incomplete — `<p role="button">` trigger and toggle defects |
| Escape / focus return (source) | Absent / unverified |
| Motion durations (source) | Mobile panel **0.4s** vertical; dropdown opacity/height **0.2s**; chevron **0.3s**; hamburger staged **0.1 / 0.2 / 0.3s** |
| Reduced motion (source) | Absent (`prefers-reduced-motion` not evidenced) |
| Outside click / focus trap / scroll lock / auto-close after nav (source) | Unavailable as verified source facts |
| Disabled / loading / error | Not present as a documented source matrix for this module |

## Visual relationships

**Source-derived structural relationships:**

- Desktop: three titled groups form the **primary multi-column region**; contrast rail sits to the **right**
- Rail background is a **distinct contrast surface** that continues to the **viewport edge**
- Rail is **narrower** than the primary region (source max-width **14rem** intent; proportions may adapt)
- Every primary destination pairs a **square icon** with title + description
- Rail links are **simple text links** (no icon + description model)
- **No** featured / promotional media region
- Exactly one chevron-like indicator intent on the mega trigger (rotates over **0.3s** in source; source may still render duplicate indicators via CSS — Ren10 requires **exactly one visible chevron owner**)
- Mobile menu toggle uses a hamburger morph with staged delays
- Three groups × four destinations; one rail with one heading and five links
- **20** navigation/content links + **1** linked logo in the expanded content model
- Small mobile hides destination descriptions; mid widths show them

**Labeled inference (Ren10 test targets, not raw Relume tokens):**

- Mega trigger should share the primary-link vertical alignment axis with peer top-level links
- No nested-card chrome on the disclosure from classless `details` defaults
- Destination icon containers remain square and sized via `ren-icon` variants (not inline SVG width/height)
- Touch targets meet 44×44 in a touch context
- Desktop panel sits under the bar; mobile panel stays in-flow inside the open shell
- Intermediate tablet must not cramp three columns + rail into unreadable widths
- Single landmark `nav` — no unlabeled nested `nav`

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
  (motion **durations** themselves **are** available — see Motion section above)
- Proprietary marketing copy, image URLs, and class names (intentionally excluded)

## Public-output exclusions

Must not appear in Ren10 public output:

- Relume product/module marketing names beyond internal packet ids (`navbar8`)
- Relume / React / Motion / Tailwind / Radix / CVA class names or imports
- Copied proprietary copy, image URLs, or assets from the reference library
- Duplicated desktop/mobile DOM trees
- Nested interactive controls (button inside anchor, dual tab stops)
- Shadow DOM; framework abstractions (React, Vue, Svelte, JSX/TSX, shadcn)
- Primitive palette tokens and hardcoded non-grayscale colors in block CSS
- Raw z-index literals (including `999` / `z-[999]`) — use RenDS elevation tokens
- Hover-only open without keyboard equivalence
- Removed focus outlines
- Featured / promotional media regions (not part of this module’s anatomy)
- Extra unlabeled nested `nav` landmarks
- Source `<p role="button">` mega trigger pattern
