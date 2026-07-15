# Reference Brief — Navbar 24

## Retrieval metadata

- Family: navbars
- Module ID: `navbar24` / catalog entry `navbar24_component`
- Retrieved through: authenticated Relume MCP (`relume_oauth__get_component`,
  `slug: navbar24`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: after accepted Navbar 14; next mega-menu catalog neighbor
- Source variants returned: one complete React section
- Supporting files returned: four vendored primitives (class-name utility,
  media-query hook, badge, button)
- Complete source: **true**

## Retrieved facts

### Default anatomy and ownership

- One linked logo image.
- Four top-level entries: three ordinary destination links and one mega-menu parent.
- Two global header actions (secondary + primary emphasis).
- One mobile hamburger with three animated lines.
- One chevron owned by the mega trigger.
- Mega intro region: one heading title, one supporting description, one secondary
  call-to-action control.
- Mega sublink region: exactly eight bold title-only destinations arranged as a
  two-column grid at intermediate and larger widths.
- Mega product rail: exactly one linked product showcase containing one image,
  product name, variant label, price, and optional badge overlay.
- Source product card is a single anchor wrapping media and copy; the badge is
  non-interactive chrome inside that anchor.

### Desktop

- Full-width bar with bottom border: logo at inline-start, horizontal primary
  navigation, actions at inline-end.
- Mobile toggle is hidden.
- Mega panel is a full-viewport-width absolute surface under the bar with a
  bottom border.
- Panel interior is a two-region layout: primary content track (~2/3) and product
  rail (~1/3) with a distinct sunken background on the rail.
- Primary content stacks intro copy + CTA beside the eight-link grid at medium
  widths, then keeps both in the left track of the two-region layout.
- Product media uses a portrait frame (approximately 10:12) with cover crop.
- Desktop pointer hover opens the mega; pointer leave closes; activation also
  toggles.

### Tablet / mobile

- Source interaction switches to click-only at an explicit `max-width: 991px`
  media query while layout utilities also gate at the framework large boundary —
  a split Ren10 must not preserve.
- Below the large boundary: logo and toggle share the permanent top row only.
- Opening the shell reveals one scrollable stacked panel: four top-level entries
  then two full-width stacked actions (source duplicates action markup for
  desktop-outside vs mobile-inside; Ren10 must use one tree).
- Nested mega expands in normal flow inside that panel; product rail stacks under
  the intro and sublink regions.
- Mobile panel height animates toward a viewport-height custom value without
  proving bar-height accounting.

## Interaction states

| State | Source behavior |
| --- | --- |
| Default | Mobile shell and mega closed |
| Desktop hover | Pointer enter opens; leave closes (disabled when mobile query matches) |
| Trigger activation | Toggles mega at all widths; chevron rotates 180° |
| Mobile shell open | Full-height scrollable overlay mounted below the bar |
| Mobile nested open | Mega expands inline within the shell |
| Outside mobile shell | Document pointer closes shell when target is outside menu and toggle |
| Escape / focus return | Not implemented |
| Keyboard trigger | Incomplete — source uses a real button for the mega trigger but without a full disclosure contract |

## Motion

- Mobile shell height transition around 0.4s.
- Mega visibility/height/opacity around 0.3s.
- Chevron rotation around 0.3s.
- Hamburger uses staged open/rotate/closed line phases.
- No reduced-motion branch.

## Visual relationships

### Source-derived

- Desktop keeps logo, four-entry navigation, and two actions on one full-width bar.
- Mega spans full bar width with intro+sublinks on the larger track and a single
  product showcase on the narrower rail.
- Eight sublinks read as large bold underlined titles in two columns.
- Product rail contrast is deliberate (sunken surface behind the card).
- One chevron belongs to the mega trigger; hamburger morphs into a close X.

### Ren10 review targets

- Trigger aligns with peer links; moving into the full-width panel does not close
  it prematurely (stable hover corridor).
- Intro, eight sublinks, and product rail remain readable at tablet mid-width.
- Product media keeps a portrait frame without layout shift or overflow.
- Classless details chrome and generated chevrons remain neutralized.
- Exactly one close icon and one authored chevron at every width.

## Source accessibility and semantic defects

- Generic section root rather than a page-header landmark.
- Logo and desktop actions sit outside the collapsible menu container; mobile
  actions sit inside a duplicated markup branch.
- Mobile toggle has no accessible name or expanded/controls relationship.
- Mega trigger lacks a complete expanded/controls disclosure contract.
- Nested conditional surfaces may discard focus.
- No complete Escape, focus restoration, outside-desktop close, destination
  close, breakpoint reset, or reduced-motion handling.
- Numeric z-index on the shell.

## Dependencies and assets

- React client component, Tailwind utilities, motion runtime, Relume icons,
  Radix Slot, CVA, clsx, and tailwind-merge.
- One placeholder logo, one chevron icon, CSS-drawn hamburger lines, one product
  placeholder image, and a badge primitive.
- No source dependency, class string, copy, URL, SVG path, duration, breakpoint
  constant, or placeholder asset is eligible for Ren10 output.

## Unavailable evidence

- MCP returned metadata, complete source, and primitive source but no
  authoritative rendered screenshot.
- Exact resolved Tailwind breakpoint pixels beyond the explicit 991px query and
  runtime custom height values were not treated as authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint constants.
