# Reference Brief — Navbar 11

## Retrieval metadata

- Family: navbars
- Module ID: navbar11
- Relume component ID: navbar11_component
- Retrieved through: authenticated Relume MCP via Grok 4.5
- Retrieved at: 2026-07-14
- Source variants returned: complete React section source
- Supporting files returned: four vendored primitives (`cn`, media-query hook, button, card)
- Ordering proof: the Relume navbar listing returned `navbar10_component`, then `navbar11_component`, then `navbar12_component`.

## Retrieved facts

- The source has one linked logo, four top-level navigation entries, two actions, and one mobile toggle.
- Three top-level entries are plain links. One entry owns a single dropdown trigger and one chevron.
- The dropdown contains exactly four enriched destinations in one column.
- Every destination contains one icon slot, one title, one description, and one URL.
- The source has no editorial cards, submenu images, footer rail, or multi-column mega region.
- The desktop dropdown uses one bordered surface around 20rem wide. The source uses a Card primitive only for that shell.
- The logo is the only authored image. Four destination icons plus one chevron are authored; the hamburger is three geometric bars.

## Responsive states

- Desktop layout is a horizontal bar with logo at inline-start and links/actions at inline-end. The dropdown is absolutely positioned below its trigger.
- Below the source `lg` layout breakpoint, the shell becomes a brand/toggle header plus a vertically expanding navigation region.
- The source interaction media query uses 991px while its layout classes use the framework `lg` breakpoint, creating a small inconsistent boundary.
- Tablet keeps the collapsed shell but shows destination descriptions from the source `md` breakpoint upward.
- Mobile uses one vertical tree, full-width stacked actions, and an in-flow dropdown. Descriptions are hidden below the source `md` breakpoint.

## Interaction states

- The mobile shell toggles open/closed on toggle activation.
- The dropdown toggles on activation at every width.
- Desktop pointer enter opens and pointer leave closes; hover is disabled by the 991px media query on narrower screens.
- The chevron rotates 180 degrees with the dropdown state.
- Source motion is approximately 0.3s for shell height, dropdown opacity/translation, chevron, and staged hamburger changes.
- The source has no Escape behavior, focus return, outside dismissal, keyboard handling for its fake dropdown trigger, or reduced-motion branch.

## Visual relationships

- The functional identity is logo-left/menu-right with one compact rich-link dropdown, not a mega menu.
- Dropdown destinations form a vertical rhythm: compact icon at inline-start, title above description at inline-end.
- Desktop panel width is constrained near 20rem; mobile panel becomes full-width and in flow.
- Source-derived proportions are directional only because resolved framework tokens and a rendered preview were not returned.

## Source accessibility defects

- Mobile toggle has no accessible name, `aria-expanded`, or `aria-controls`.
- Dropdown trigger is a non-interactive element with `role="button"`, no tab stop, no keyboard activation, and no expanded state.
- No Escape, outside close, focus restoration, or reduced-motion behavior exists.
- A nested `nav` can appear inside the primary `nav` on mobile.
- The returned button primitive removes the outline without a compensating visible focus treatment.
- The 991px interaction boundary and framework layout breakpoint can disagree.

## Unavailable evidence

- Relume MCP did not return a rendered screenshot, resolved Tailwind token values, exact installed icon drawings, or downloadable assets.
- Exact visual equality is therefore not an acceptance target; anatomy, function, semantic hierarchy, and alignment are.

## Public-output exclusions

- Do not copy source code, framework classes, text, URLs, image assets, SVG paths, React/Motion logic, dependencies, or primitive implementations.
