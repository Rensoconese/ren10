# Reference Brief — Navbar 25

## Retrieval metadata

- Family: navbars
- Module ID: `navbar25` / catalog entry `navbar25_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar25`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: after accepted mega neighbors (Navbar 23 product-intro /
  Navbar 24 product-rail); Navbar 25 is the next catalog module with a
  categories-plus-promo mega anatomy
- Source variants returned: one complete React section
- Supporting files returned: three vendored primitives (class-name utility,
  media-query hook, button)
- Complete source: **true**

## Retrieved facts

### Default anatomy and ownership

- One linked logo image at the start of a full-width top bar with a bottom border
  (not a floating card shell).
- Exactly **four** top-level navigation entries: **three** plain destination
  links plus **one** mega-menu parent with a single disclosure chevron.
- Two global header actions (secondary + primary hierarchy). On wide viewports
  they live in a permanent end cluster outside the collapsible link region. On
  narrow viewports the source mounts a second stacked action cluster **inside**
  the collapsible navigation panel (Ren10 collapses this into one responsive
  action cluster that follows the open shell).
- One mobile hamburger with three geometric bars that morph into a close X.
- Mega panel anatomy (only what the source **renders**):
  - **Category region** (start): exactly **two** labeled groups. Each group has
    one group title and **five** title-only destination links (**ten** category
    destinations total). No icons, descriptions, badges, or nested interactive
    controls on category destinations.
  - **Promo region** (end): one large heading title, one supporting description,
    one secondary-style call-to-action control, and one square media frame
    (source expresses aspect-square cover crop). Promo media is not wrapped as a
    separate destination anchor; the CTA is a real control beside the copy.
- Source defaults also declare an unused flat sublink array that is **never
  rendered** by the component tree. Ren10 must not invent those destinations.
- Zero social rows, zero footer bands, zero product price cards, zero icon-leading
  destination lists, zero multi-tree desktop/mobile link lists in the data model
  (one data tree; actions alone are duplicated in source markup).

### Responsive states

- Desktop (source wide / `lg` intent): horizontal logo | four primary entries
  after the brand | two end actions. Mega panel is absolute, full viewport width
  under the bar, with a bottom border. Category region uses a two-column group
  grid at intermediate widths; promo region sits beside it with a sunken surface
  band. Toggle is hidden. Desktop pointer hover opens / leave closes the mega;
  activation also toggles.
- Tablet / mobile shell (source interaction media query near 991px; layout
  utilities also gate at framework `lg`): collapsed brand + toggle top row.
  Opening the shell reveals the single tree with stacked entries; mega expands
  inline in flow; both actions stack full-width below the links. Category groups
  reflow toward one column at the narrowest widths; promo stacks below categories.
- Source interaction media query and framework layout breakpoint can disagree;
  Ren10 must use one seam only (48rem / ren-nav; block desktop at 48.01rem).

### Interaction states

| State | Source behavior |
| --- | --- |
| Default | Mobile shell and mega closed |
| Desktop hover | Pointer enter opens; leave closes (disabled on mobile media query) |
| Trigger activation | Toggles mega at all widths; chevron rotates |
| Mobile shell open | Expanding full-height scroll region under the bar |
| Mobile nested open | Mega expands inline within the shell |
| Mega CTA / category activation | Navigates; source does not close on destination click |
| Escape / outside / focus return | Not implemented in source |
| Keyboard trigger | Real button element with incomplete ARIA expanded/controls |

### Motion

- Mobile shell height transition is present.
- Mega open/close opacity/height and chevron rotation are present.
- Hamburger staged morph timing is present.
- No reduced-motion branch in source.

### Visual relationships

#### Source-derived

- Category region is narrower than the promo band on wide viewports; groups form
  a two-up grid of title-only links under semibold group titles.
- Promo region uses a distinct sunken surface; copy (title, description, CTA)
  sits beside a square media frame at intermediate+ widths.
- Mega surface shares the bar background language and gains a bottom border on
  desktop when open.
- Actions: secondary then primary hierarchy.

#### Ren10 review targets

- Trigger aligns with peer top-level links; moving into the full-width panel
  does not close it prematurely (stable pointer corridor).
- Categories remain scannable and narrower than the promo region on desktop.
- Promo CTA is a real link/button outside nested interactive traps; square media
  keeps cover crop without overflow.
- Exactly one authored chevron; classless details chrome neutralized.
- Mobile closed: logo + toggle only in the permanent top row.

## Source accessibility defects

- Root is a generic section rather than a page-header / nav landmark.
- Mobile toggle lacks accessible name and complete expanded/controls wiring.
- Mega trigger is a button without complete disclosure ARIA wiring.
- No Escape, outside close, destination close, focus restoration, or
  reduced-motion handling.
- Nested landmark risk if mobile re-wraps a second nav.
- Source duplicates action controls across desktop/mobile mounts.
- Returned button primitive removes outline without a visible focus replacement.
- Raw high z-index in source.

## Dependencies and assets (excluded from Ren10 output)

- React client component, motion runtime, Tailwind utilities, icon package,
  Radix Slot, CVA, clsx, tailwind-merge, button primitive.
- One logo image, one promo placeholder image, one chevron icon, CSS hamburger
  lines.
- No source text, URL, asset, SVG path, class string, duration, easing, or
  breakpoint constant is eligible for Ren10 output.

## Unavailable evidence

- MCP returned complete source and primitive source but no authoritative rendered
  screenshot.
- Exact resolved framework token values beyond the explicit mobile media query
  and runtime typography were not treated as authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint constants.
