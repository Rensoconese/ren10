# Relume to RenDS Translation Map

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/patterns/ren-nav/pattern.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-icon/component.md`
- `components/primitives/ren-link/component.md`
- `base/classless.css` rules for `details`, `summary`, markers, and `summary::after`

## RenDS mapping

| Reference part | Ren10 choice | Preserved behavior | Intentional difference |
| --- | --- | --- | --- |
| Navbar shell | `<ren-nav>` with one `<nav class="ren-nav">` | Brand, primary entries, actions, mobile toggle | One landmark and one responsive tree |
| Primary entries | One `ul.ren-nav-links` | Three links plus one mega trigger | No duplicated desktop/mobile DOM |
| Mega trigger | Native `details/summary` | Open/closed disclosure and one chevron | Keyboard works natively; JS adds stable hover, click pin, Escape, outside/link close |
| Destination area | `ren-grid` with four titled groups | Four groups and four icon/title/description destinations | Reflows at Ren10 content bands |
| Destination icons | `span.ren-icon` with decorative SVG | Leading icon relationship | Size variants own size; no inline SVG width/height |
| Footer band | Semantic `div`/section-like region with heading and one real anchor | Separate full-width contrast band | Semantic Ren10 surface and link tokens |
| Header actions | Real anchors styled as `.ren-btn` | Two trailing CTAs | Ren10 variants and focus rings |
| Mobile shell | Existing `ren-nav` toggle + shared tree | Collapsed shell and nested mega | Named toggle with full ARIA; no duplicate tree |
| Elevation | `--ren-z-sticky` | Panel above page content | No literal `999` |
| Motion | Ren10 duration/easing tokens | Relative timing hierarchy | Reduced-motion support is mandatory |

## Interaction contract

- Desktop (at and above the Ren10 `48rem` nav breakpoint): pointer hover may preview the mega.
- Moving from the summary into the panel must keep it open; use a short tokenized close delay over the combined disclosure hit region.
- A desktop click pins the disclosure; a second click closes it.
- Enter/Space operate the native summary. Escape closes and restores focus to the summary.
- Clicking outside or activating a destination/footer link closes the mega.
- Mobile uses activation only; hover behavior must not run below `48rem`.
- Closing the mobile shell also closes the nested mega.
- State ownership must not create a second chevron or a second mobile control.

## Cascade risks

| Risk | Mitigation |
| --- | --- |
| `details` card border/radius/padding/margin | Reset only the block disclosure selector |
| Classless `summary::after` chevron | Set `content: none`/`display: none`; authored SVG is sole owner |
| Native marker | Hide WebKit marker and empty `::marker` |
| Open summary divider/margins | Reset open-state border and spacing |
| Core mobile alignment centering rows | Stretch the shared tree and keep rows start-aligned |
| Absolute desktop panel leaking into mobile | Panel absolute only above `48rem`; in-flow below |
| Four columns cramped at tablet width | Use responsive grid bands; do not force four columns before readable |
| Full-width footer overflow | Keep paint block-scoped and tokenized inside panel geometry |
| Icon size conflict | `.ren-icon-*` controls size; SVG has viewBox only |
| Duplicate landmark | Exactly one `nav.ren-nav`; mega/footer are not nested nav landmarks |
| Duplicate chevron | Neutralize classless pseudo-element and author one SVG only |

## Responsive adaptation

- Ren10 shell breakpoint remains `48rem`; core `ren-nav` is not retuned to imitate the source 991px boundary.
- Below `48rem`: toggle opens the shared tree; mega is in-flow; destination groups stack; descriptions may hide at the narrowest widths; actions stack.
- From `48rem` through tablet widths: horizontal shell; mega absolute below bar; groups use two columns when four would be cramped; descriptions remain visible.
- At wide desktop (target `64rem` and above): four equal destination columns above the footer band.
- JavaScript-disabled/custom-element-unupgraded mobile fallback exposes the one tree and native disclosure while hiding the inert toggle.

## Token policy

- Use semantic/component tokens for surfaces, text, borders, focus, spacing, radius, shadows, motion, and elevation.
- Layout primitives (`ren-row`, `ren-row-spread`, `ren-stack`, `ren-cluster`, `ren-grid`) precede bespoke layout rules.
- Bespoke CSS is allowed only for the absolute desktop mega, disclosure cascade resets, hover bridge behavior, and footer full-width paint.
- No primitive palette tokens, hardcoded hex/non-grayscale rgba, raw z-index, raw transition duration/easing, or Tailwind classes.
- A 4.5rem demo bar height is an accepted existing navbar-block convention; all other reusable geometry should map to public size/spacing tokens.

## Progressive enhancement

1. Native markup contains one brand, one list tree, one `details/summary`, four destinations, one footer link, and two actions.
2. Without JavaScript, the mobile tree is visible and the disclosure works natively.
3. With `ren-nav` upgraded, its named toggle controls the mobile shell.
4. Block-local JS adds hover preview/click pin/Escape/outside/link close without replacing native semantics.

## Rejected mappings

- `ren-menu`: command-menu roles are wrong for navigation destinations.
- Popover/top-layer mega: fights the required in-flow mobile disclosure.
- Duplicated desktop/mobile trees: accessibility and maintenance failure.
- Hover-only disclosure: lacks keyboard equivalence.
- Featured media/card or side rail: absent from Navbar 9.
- Fake button (`p role=button`) or nested interactive controls.
- Core `ren-nav` breakpoint/API changes solely to mirror Relume.
- Inline icon dimensions, raw z-index, source runtime dependencies, or Shadow DOM.

