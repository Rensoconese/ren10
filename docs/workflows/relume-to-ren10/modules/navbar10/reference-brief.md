# Reference Brief

## Retrieval metadata

- Family: `navbars`
- Module ID: `navbar10` (category id `navbar10_component`, slug `navbar10`)
- Retrieved through: authenticated Relume MCP (`list_components` → `get_component` with primitives)
- Retrieved at: 2026-07-14
- Complete source: **true**
- Supporting files: media-query hook, button primitive, and class-name utility

## Retrieved facts

### Source stack

- React client component and local state
- Motion animation runtime
- Tailwind utilities
- Media-query hook
- Button primitive backed by slot/variant utilities
- Icon package for the dropdown indicator

### Default anatomy and ownership

- One linked logo.
- Four top-level entries: three ordinary links and one mega trigger.
- Two global header actions.
- One mobile hamburger with three animated lines.
- Mega left region: exactly one titled link group with five simple links.
- Mega right region: exactly six linked editorial/category cards.
- Every card owns one image, title, description, and a nested source button label.
- The source card is an anchor containing an interactive button, an accessibility defect Ren10 must not preserve.
- Desktop and mobile render duplicated navigation trees.

### Desktop

- Horizontal logo | primary navigation | actions.
- Mega panel spans under the bar and becomes a two-region layout.
- Left region is narrow, capped around 15rem, with one heading and five stacked links.
- Right region is a two-column grid of six cards.
- At the source large breakpoint each card becomes horizontal: media track about 0.5fr and content track about 1fr.
- Card media uses an approximately 3:2 aspect ratio and cover crop.
- Desktop pointer hover opens/leaves closes; activation also toggles.

### Tablet/mobile

- Source interaction switches to click-only at `max-width: 991px`.
- Below source `lg`, hamburger opens a `100dvh`, scrollable overlay below the bar.
- Primary entries and actions stack; mega becomes an inline nested disclosure.
- Card grid is one column by default and two columns from source `sm`.
- No separately authored tablet tree exists; exact Tailwind breakpoint pixels are unavailable.
- The source duplicates the desktop and mobile content trees; Ren10 must use one.

## Interaction states

| State | Source behavior |
| --- | --- |
| Default | Mobile shell and mega closed |
| Desktop hover | Pointer enter opens; leave closes |
| Trigger activation | Toggles mega at all widths |
| Mobile shell open | Full-height overlay mounted and scrollable |
| Mobile nested open | Mega expands inline within the shell |
| Mega open | Opacity 1, open height, chevron 180° |
| Mega closed | Panel removed, opacity 0, closed height, chevron 0° |
| Escape/outside/link close | Not implemented in source |
| Keyboard trigger | Incomplete fake button without tabindex/key handling |

## Motion

- Mobile height and translation: 0.4s.
- Mega opacity/height: 0.2s.
- Chevron rotation: 0.3s.
- Hamburger uses staged 0.1s/0.2s/0.3s timing.
- Button primitive uses 200ms easing.
- No reduced-motion branch.

## Visual relationships

### Source-derived

- Narrow five-link column sits left of a substantially wider six-card editorial region.
- Six cards form two columns; card media is approximately 3:2.
- At wide desktop each card aligns image and copy horizontally with media narrower than copy.
- Card title, description, and CTA text are grouped together.
- One chevron belongs to the mega trigger.

### Ren10 review targets

- Trigger aligns with peer links and moving into the panel does not close it prematurely.
- Left navigation remains clearly narrower than the card region.
- Cards preserve one whole-card click target with no nested interactive descendant.
- Images retain 3:2 frames without layout shift or overflow.
- Tablet reflows before either the link column or cards become cramped.
- Classless details chrome and generated chevron remain neutralized.

## Source accessibility defects

- Hamburger lacks accessible name, `aria-expanded`, and `aria-controls`.
- Mega trigger is a non-focusable paragraph with `role="button"`, no keyboard activation, and no disclosure ARIA.
- No Escape, outside close, route close, or focus restoration.
- Featured card anchor contains a nested interactive button.
- Returned button primitive removes focus outline without replacement.
- No reduced-motion handling.
- Duplicate desktop/mobile trees and unstable landmark ownership.
- Raw z-index `999`.

## Unavailable evidence

- Rendered preview/computed styles and resolved colors.
- Exact Tailwind `sm`/`md`/`lg` pixel values.
- Exact logo dimensions, icon SVG geometry, and card asset metadata.
- RTL/i18n, scroll lock, route integration, analytics, or multi-mega coordination.
- Agreement between the 991px JS breakpoint and source `lg` CSS breakpoint.

## Public-output exclusions

- Proprietary source, utilities/classes, copy, URLs, assets, preview URLs, and SVG paths.
- React, Motion, Tailwind, Radix, CVA, or source runtime dependencies.
- Nested interactive controls, duplicated trees, fake buttons, Shadow DOM, or frameworks.
- Primitive palette tokens, hardcoded colors, raw timings, or numeric z-index.

