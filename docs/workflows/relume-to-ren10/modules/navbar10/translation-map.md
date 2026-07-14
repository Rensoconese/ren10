# Relume to RenDS Translation Map

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/patterns/ren-nav/pattern.md`
- `components/primitives/ren-card/component.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-link/component.md`
- `base/classless.css` details/summary cascade

## RenDS mapping

| Reference part | Ren10 choice | Preserved behavior | Intentional difference |
| --- | --- | --- | --- |
| Navbar shell | One `<ren-nav>` / `<nav class="ren-nav">` | Brand, entries, actions, toggle | One landmark and one responsive tree |
| Mega trigger | Native `details/summary` | Disclosure and one chevron | Keyboard native; JS adds stable hover, pin, Escape, outside/link close |
| Mega two-region layout | `ren-with-sidebar` | Narrow link column + wide card region | Responsive Ren10 tracks, no source utilities |
| Five-link column | Heading + list of five real anchors | Count/order and narrow emphasis | Not a second nav landmark |
| Six editorial cards | `ren-grid-2` of six whole-card anchors using `.ren-card.ren-card-interactive` | Image/title/description/CTA relationship | One anchor per card; source nested button becomes non-interactive CTA text |
| Card media | `ren-frame` with 3:2 aspect | Cover image relationship | Local safe demo imagery/gradients only; no copied source assets |
| Header actions | Two real anchors styled `.ren-btn` | Trailing CTA hierarchy | Ren10 focus/touch behavior |
| Mobile shell | Existing Ren10 toggle and shared tree | Collapsed shell and nested mega | Named ARIA toggle, no duplicated tree |
| Motion/elevation | Ren10 tokens / `--ren-z-sticky` | Timing hierarchy and overlay | Reduced motion; no raw values |

## Interaction contract

- Desktop ≥48rem: hover preview over the combined summary+panel region; crossing into content must remain open.
- First pointer click pins; second closes. Enter/Space use native summary.
- Escape closes and restores focus; outside click and any mega link/card activation close.
- Mobile <48rem is activation-only; closing the mobile shell closes the mega.
- Exactly one authored chevron; no classless pseudo-chevron.

## Cascade risks

| Risk | Mitigation |
| --- | --- |
| Native details card chrome/marker/divider | Block-scoped reset of border/radius/padding/margins/markers/open divider |
| Double chevron | Neutralize `summary::after`; one SVG owner |
| Cramped sidebar/cards | `ren-with-sidebar` variables and responsive content bands |
| Card nested controls | Entire card is one anchor; CTA is plain text span |
| Image distortion | `ren-frame` 3:2 with object-fit cover |
| Duplicate landmarks/trees | One `nav.ren-nav`, one `ul.ren-nav-links`; mega regions are labeled content, not nav landmarks |
| Mobile center alignment | Shared tree stretches and rows align start |
| Raw elevation/motion | Public tokens only |

## Responsive adaptation

- Ren10 shell breakpoint remains `48rem`.
- Mobile: one open shell; left link group and cards stack; cards one column; nested disclosure in flow.
- Tablet 48–63.999rem: horizontal shell; mega absolute; left link group stacks above or beside a readable two-column card grid depending available width.
- Wide desktop ≥64rem: `ren-with-sidebar` with narrow five-link column and wide two-column card grid; individual cards may use horizontal media/copy composition.
- JS-disabled mobile exposes the one tree and native disclosure while hiding inert toggle.

## Token/layout policy

- Semantic/component tokens only; no primitive palette tokens, hardcoded color, numeric z-index, or raw motion.
- Use `ren-with-sidebar`, `ren-grid-2`, `ren-stack`, `ren-row`, `ren-cluster`, `ren-center-wide`, and `ren-frame` before bespoke layout CSS.
- Bespoke CSS is limited to disclosure neutralization, desktop panel geometry, pointer bridge, card horizontal variant, and responsive shell integration.

## Progressive enhancement

1. One semantic tree includes the five links and six whole-card anchors.
2. Native disclosure works without JavaScript; mobile fallback exposes the tree and actions.
3. Ren-nav owns mobile toggle; block controller adds desktop pointer policy and dismissal behavior.

## Rejected mappings

- `ren-menu` or menu roles for navigation destinations.
- Top-layer popover for a panel that must become in-flow on mobile.
- Nested button/link inside a card anchor.
- Duplicated desktop/mobile trees or nested nav landmarks.
- Featured side rail/card counts borrowed from Navbar 5–9.
- Core breakpoint changes, source framework dependencies, raw tokens, or Shadow DOM.

