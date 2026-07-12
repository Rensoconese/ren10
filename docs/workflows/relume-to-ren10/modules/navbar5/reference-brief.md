# Reference Brief

## Retrieval metadata

- Family: `navbars`
- Module ID: `navbar5`
- Retrieved through: Relume MCP (historical extraction; not re-fetched in Task 6)
- Retrieved at: 2026-07-10 (design/research phase; see `docs/superpowers/specs/2026-07-10-ren10-navbar-mega-menu-design.md`)
- Source variants returned: desktop and mobile navigation states for the mega-menu baseline
- Supporting files returned: unavailable in this sanitized packet (proprietary source not stored)

## Retrieved facts

Record only previously verified, sanitized facts from the completed mega-menu pilot
(not proprietary Relume source text, classes, URLs, or assets):

- One desktop horizontal navigation bar containing brand, primary destinations,
  and two action destinations.
- Ren10 implements **one responsive link tree** (a single primary links list)
  serving both desktop and mobile rather than duplicated trees.
- Mega panel anatomy: **two groups of four destinations** each (eight total
  destination anchors with labels and short descriptions).
- **Two featured articles** in a secondary featured region (media + body).
- **One dropdown indicator** (single authored chevron affordance on the mega
  trigger) — not a second classless-generated chevron.
- Desktop layout intent: **category-heavy split** — grouped destinations occupy
  the main region; featured articles occupy a secondary region.
- Featured articles on desktop are **horizontal** (media beside text).
- Featured articles on mobile are **stacked** (media above text).
- Source distinguishes **mobile vs desktop** interaction shells: desktop exposes
  the mega disclosure in the horizontal bar; mobile opens a navigation shell
  first, then nested disclosure content becomes in-flow under the same tree.
- Opening is click/keyboard driven (not hover-only).
- Destinations remain ordinary anchors; the mega trigger uses native disclosure
  semantics in the Ren10 interpretation.

## Responsive states

### Desktop (wide)

- Horizontal brand / links / actions composition.
- Mega panel opens beneath the bar and spans the preview width.
- Grouped destinations and featured region sit side-by-side (category-heavy).
- Featured article media/text remain horizontal.

### Mobile (narrow)

- Primary navigation collapses behind a toggle shell.
- The same single link tree is revealed when the toggle expands.
- Mega panel content becomes static/in-flow under its summary.
- Link groups and featured articles collapse toward one column; articles stack.

### Tablet

- Unavailable as a separately verified source matrix row beyond the Ren10
  `48rem` shell breakpoint used by `ren-nav` (see translation map).

## Interaction states

| State | Verified behavior |
| --- | --- |
| Default (closed) | Mega disclosure closed; panel not shown |
| Open (mega) | Summary activates native `details`; panel visible with destinations + features |
| Mobile navigation open | Toggle expands the shared tree; mega may still be closed |
| Mobile nested open | Tree open **and** mega disclosure open |
| Keyboard | Enter/Space open summary; Escape closes and restores focus to summary |
| Outside activation | Click outside disclosure closes it; destination activation closes it |
| Hover-only open | Not part of the Ren10 contract (explicitly rejected) |
| Disabled / loading / error | Unavailable — not present in verified pilot scope |

## Visual relationships

**Source-derived / previously verified structural relationships:**

- Category-heavy desktop split (groups wider than featured column intent).
- Horizontal desktop featured articles; stacked mobile featured articles.
- Exactly one dropdown indicator ownership.
- Eight destinations with visible descriptions in the open panel.

**Labeled inference (from Ren10 rebuild tests, not raw Relume tokens):**

- Solutions trigger should share the primary-link vertical alignment axis with
  peer links (Product / Pricing).
- No nested-card chrome on the disclosure (border + radius + padding combo).
- Featured region uses a distinct surface from the panel body.
- Touch targets meet 44×44 in a touch context.

**Unavailable:** exact Relume resolved token values, pixel-perfect spacing
rhythm, and proprietary asset dimensions.

## Unavailable evidence

- Live Relume MCP re-fetch was **not** performed in Task 6 (MCP auth unavailable
  in this session). Facts above are limited to previously verified sanitized
  pilot notes and current repository evidence (`templates/blocks/nav-mega-menu.html`,
  design spec, rebuild commit `73d1416`).
- Rendered Relume preview screenshots are **not** stored in-repo.
- Exact pre-rebuild Playwright failure logs are **not** retained as artifacts;
  RED defects are known only from rebuild test comments and commit message.
- Proprietary class names, copy, image URLs, and framework source are excluded.

## Public-output exclusions

Must not appear in Ren10 public output:

- Relume product/module marketing names beyond internal packet ids
- Relume class names, React/Motion/Tailwind source, or dependency imports
- Copied proprietary copy, image URLs, or assets from the reference library
- Shadow DOM, framework abstractions (React, Vue, Svelte, JSX/TSX, shadcn)
- Primitive palette tokens and hardcoded non-grayscale colors in block CSS
