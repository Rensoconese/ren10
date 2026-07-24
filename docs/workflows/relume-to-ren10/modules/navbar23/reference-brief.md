# Reference Brief — Navbar 23

## Retrieval metadata

- Family: navbars
- Module ID: `navbar23` / catalog entry `navbar23_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar23`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: accepted Navbar 14 is the nearest completed neighbor in
  this worktree; Navbar 23 is a later catalog module with product-intro mega
  anatomy rather than simple dropdown or editorial card-grid anatomy
- Source variants returned: one complete React section
- Supporting files returned: four vendored primitives (class-name utility,
  media-query hook, badge, button)

## Retrieved facts

- Full-width top bar with bottom border (not a floating card): one logo image
  link at inline-start; primary entries after the logo; two action controls at
  inline-end on wide viewports; one mobile hamburger toggle.
- Exactly **four** top-level navigation entries: **three** plain destination
  links plus **one** mega-menu parent with a single disclosure chevron.
- Mega panel anatomy:
  - **Intro region** (start): one heading title, one supporting description,
    and **one** secondary-style CTA control.
  - **Product region** (end): exactly **three** product destinations.
  - Each product destination owns one cover image, product name, variant line,
    price line, and an optional badge overlay on the media.
- Product media uses a portrait frame intent (source expresses a 10:12 aspect).
- Two global header actions: secondary + primary hierarchy. On wide viewports
  they live in the permanent bar end cluster. On narrow viewports they live
  **inside** the collapsible navigation panel under the link tree (not as
  permanent closed-shell top-row chrome beside the toggle).
- One mobile toggle with three geometric bars that morph into a close X.
- The source uses **one** navigation data tree at all widths (no authored
  duplicate desktop/mobile link lists in defaults), with the mega panel
  rendered as a nested disclosure under the fourth entry.
- Zero social rows, zero footer bands, zero multi-column link groups, zero
  editorial featured-blog rails, zero icon-only destination lists.

## Responsive states

- Desktop (source wide / `lg` intent): horizontal logo | four primary entries |
  two end actions. Mega panel is absolute, full viewport width under the bar,
  with intro region beside a three-column product grid. Toggle is hidden.
  Desktop pointer hover opens/leaves closes the mega; activation also toggles.
- Tablet / mobile shell (source interaction media query near 991px, layout
  utilities also gate at framework `lg`): collapsed brand + toggle top row.
  Opening the shell reveals the single tree with stacked entries; mega expands
  inline in flow; both actions stack full-width below the links. Product grid
  reflows toward fewer columns at narrow widths.
- Source interaction media query and framework layout breakpoint can disagree;
  Ren10 must use one seam (48rem) only.

## Interaction states

| State | Source behavior |
| --- | --- |
| Default | Mobile shell and mega closed |
| Desktop hover | Pointer enter opens; leave closes (disabled on mobile media query) |
| Trigger activation | Toggles mega at all widths; chevron rotates |
| Mobile shell open | Expanding full-height scroll region under the bar |
| Mobile nested open | Mega expands inline within the shell |
| Mega CTA / product activation | Navigates; source does not close on destination click |
| Escape / outside / focus return | Not implemented in source |
| Keyboard trigger | Real button element with incomplete ARIA expanded/controls |

## Motion

- Mobile shell height transition is present (source ~0.4s).
- Mega open/close opacity/height (~0.3s).
- Chevron rotation (~0.3s).
- Hamburger staged morph timing.
- No reduced-motion branch in source.

## Visual relationships

### Source-derived

- Intro column is constrained and narrower than the product band on wide
  viewports; products form a three-up grid.
- Product cards are vertical: portrait media above name / variant / price.
- Optional badge overlays the media near the start edge.
- Mega surface shares the bar background language and gains a bottom border on
  desktop when open.
- Actions: secondary then primary hierarchy.

### Ren10 review targets

- Trigger aligns with peer top-level links; moving into the full-width panel
  does not close it prematurely (stable pointer corridor).
- Intro remains readable and narrower than the product region on desktop.
- Each product is one whole-card anchor with no nested interactive control.
- Portrait frames keep cover crop without overflow or layout shift.
- Exactly one authored chevron; classless details chrome neutralized.
- Mobile closed: logo + toggle only in the permanent top row.

## Source accessibility defects

- Root is a generic section rather than a page-header / nav landmark.
- Mobile toggle lacks accessible name and complete expanded/controls wiring.
- Mega trigger is a button without `aria-expanded` / `aria-controls`.
- No Escape, outside close, destination close, focus restoration, or
  reduced-motion handling.
- Nested landmark risk if mobile re-wraps a second nav.
- Conditional height animation can discard focus stability.
- Returned button primitive removes outline without a visible focus replacement.
- Raw high z-index in source.

## Dependencies and assets (excluded from Ren10 output)

- React client component, motion runtime, Tailwind utilities, icon package,
  Radix Slot, CVA, clsx, tailwind-merge, badge and button primitives.
- One logo image, three product placeholder images, one chevron icon, CSS
  hamburger lines.
- No source text, URL, asset, SVG path, class string, duration, easing, or
  breakpoint constant is eligible for Ren10 output.

## Unavailable evidence

- Relume MCP did not return a rendered screenshot, resolved runtime token
  values, or downloadable binary assets.
- Exact equality of framework utility spacing and typography is therefore not
  an acceptance target; anatomy, function, hierarchy, and alignment are.

## Public-output exclusions

- Exclude all source code, framework classes, proprietary copy, URLs, images,
  SVG paths, React/Motion logic, dependencies, raw durations/easing, and source
  breakpoint constants.
