# Reference Brief

## Retrieval metadata

- Family: `navbars`
- Module ID: `navbar9` (category id `navbar9_component`, retrieval slug `navbar9`)
- Retrieved through: authenticated Relume MCP (`list_categories` → `list_components` → `get_component`)
- Retrieved at: 2026-07-13
- Complete source: **true**
- Source variants returned: desktop horizontal navigation and separately rendered mobile overlay tree
- Supporting files returned: media-query hook, button primitive, and class-name utility

## Retrieved facts

Only sanitized facts from the complete returned source are recorded here.

### Source stack

- React state and fragments
- Motion animation runtime
- Tailwind utilities
- Media-query hook
- Button primitive backed by slot/variant utilities
- Icon package for the chevron and default destination icons

### Default anatomy and ownership

- One linked brand logo.
- Four top-level navigation entries: three ordinary links and one mega-menu trigger.
- Two global action controls.
- One mobile menu toggle.
- The mega owns exactly four link groups.
- Default data provides exactly one destination per group: four mega destinations total.
- Every mega destination has an icon, title, and description.
- One footer band beneath the destination grid with a title and one text link.
- No featured image/card and no side rail.
- Desktop and mobile render duplicated navigation trees with independent shell placement.

### Desktop

- Horizontal composition: brand | primary entries | two trailing actions.
- Bar minimum height is 4rem, increasing to 4.5rem at the source medium breakpoint.
- Horizontal inset is 5%.
- Mega panel is absolute below the bar and effectively viewport width.
- Mega content becomes a four-column grid from the source medium breakpoint.
- Each destination is an icon-leading row with title and description.
- Descriptions are visible from the source medium breakpoint.
- A full-width contrast footer band sits below the destination grid.
- Desktop pointer hover opens/closes the mega; activation also toggles it.

### Tablet and mobile

- The source interaction query uses `max-width: 991px` to suppress hover behavior.
- Below the source large breakpoint, a 3rem-square hamburger opens an overlay below the bar.
- The overlay grows to `100dvh`, is vertically scrollable, and contains primary links followed by stacked actions.
- The mega becomes an inline nested disclosure inside the open mobile shell.
- Mega content is one column at the smallest width and four columns from the source medium breakpoint.
- Descriptions are hidden below the source medium breakpoint.
- The source duplicates desktop and mobile link trees; Ren10 must not.
- Exact pixel values for Tailwind `sm`, `md`, and `lg` are unavailable.

## Interaction states

| State | Source behavior |
| --- | --- |
| Default | Mobile shell and mega closed |
| Desktop hover | Pointer enter opens; pointer leave closes |
| Trigger activation | Toggles mega at every width |
| Mobile shell open | Overlay mounted below bar and expanded to viewport height |
| Mobile nested open | Mega expands in-flow within the open shell |
| Mega open | Panel mounted; opacity 1, open height, chevron rotated 180° |
| Mega closed | Panel removed; opacity 0, closed height, chevron at 0° |
| Escape/outside/link close | Not implemented in source |
| Keyboard trigger | Incomplete: non-button role without tabindex or key handlers |
| Disabled/loading/error | Not part of this module's documented state model |

## Motion

- Mobile outer height and inner translation: 0.4s.
- Mega opacity and height: 0.2s.
- Chevron rotation: 0.3s.
- Hamburger lines use staged 0.1s/0.2s/0.3s delays.
- Shared button primitive uses a 200ms transition.
- No reduced-motion branch is present.

## Visual relationships

### Source-derived

- Brand anchors the start edge; the expanding navigation/action row occupies the remainder.
- Mega panel spans below the bar, with four equal destination columns above a distinct full-width footer band.
- Each destination pairs a leading icon with trailing title and secondary description.
- Footer content is visually separate from the destination grid and contains one text link.
- Mobile actions follow the stacked links with deliberate separation.
- Exactly one chevron-like indicator belongs to the mega trigger.

### Ren10 review targets (labeled inference)

- The mega trigger shares the same vertical axis as peer top-level links.
- Moving from trigger into the desktop panel does not close it prematurely.
- Classless `details` styles do not add card chrome, a divider, marker, or second chevron.
- Touch targets are at least 44×44px.
- The four destination columns reflow before becoming cramped.
- Footer band remains visually distinct without raw colors or full-viewport overflow bugs.

## Source accessibility defects

- Hamburger lacks accessible name, `aria-expanded`, and `aria-controls`.
- Mega trigger is a paragraph with `role="button"`, but has no tabindex, keyboard activation, or `aria-expanded`.
- No Escape close, outside close, focus restoration, or route/link close.
- No reduced-motion handling.
- Duplicate desktop/mobile trees depend only on CSS visibility.
- Focus-visible outline is removed in the returned button primitive without a replacement.
- Decorative icons lack explicit accessibility treatment in default data wiring.
- Raw z-index `999` bypasses design-system elevation.

## Unavailable evidence

- Rendered Relume screenshots and computed styles.
- Resolved source color values and full spacing scale.
- Exact Tailwind breakpoint pixels.
- Runtime behavior in any gap between the 991px JS query and the source `lg` breakpoint.
- Scroll lock, route integration, analytics, RTL, i18n, and multi-mega coordination.
- Non-default prop configurations.

## Public-output exclusions

- Proprietary React/TypeScript source, utility classes, and primitive implementations.
- Relume names in public UI, copied marketing text, URLs, assets, image URLs, or SVG paths.
- React, Motion, Tailwind, Radix, CVA, or other source runtime dependencies.
- Duplicated desktop/mobile trees, Shadow DOM, or framework abstractions.
- Raw z-index values, primitive palette tokens, hardcoded non-grayscale colors, or raw motion durations.
- Source accessibility defects such as fake buttons or unnamed toggles.

