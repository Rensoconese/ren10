# Relume to RenDS Translation Map — Navbar 12

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/patterns/ren-nav/pattern.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-link/component.md`
- `components/primitives/ren-icon/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Logo-left shell | one `<ren-nav>` containing one `<nav class="ren-nav">` | One landmark and one tree across all widths |
| Four top entries | one `ul.ren-nav-links` | Three links plus one native disclosure |
| Fake dropdown trigger | native `details.rn12-disclosure > summary` | Keyboard activation by default; one authored chevron |
| Two submenu groups | two `.rn12-group.ren-stack-sm` inside `.rn12-groups.ren-grid` | Two columns when space allows, one column on mobile |
| Group headings | styled non-heading labels | Preserve grouping without polluting page outline |
| Eight rich links | eight `a.rn12-destination.ren-row` | Each is one whole anchor with one icon and a text stack |
| Two CTAs | two RenDS button anchors | Same action count and hierarchy |
| Mobile toggle | named `.ren-nav-toggle` button | Expanded/controls state owned by `ren-nav` |

## Interaction policy

- Use the established 48rem Ren10 boundary for both shell layout and dropdown
  interaction; do not preserve the source's 991px/utility split.
- Desktop pointer hover previews across a stable trigger-to-panel corridor.
- Pointer click pins the preview; a second click closes it.
- Native Enter/Space activation remains available.
- Escape closes and focuses summary. Outside click, destination activation,
  mobile-shell close, and breakpoint crossing also close the disclosure.
- Mobile is activation-only; hover never governs its state.

## Cascade risks

- Neutralize Primitive Zero `details` border/padding/margin, summary marker,
  generated `summary::after`, and open-state divider.
- Exactly one `.rn12-chevron`; no native or generated duplicate.
- Desktop panel is absolute and right-biased beneath the trigger without
  overlapping the nav bar. Mobile panel returns to normal flow.
- Group grid must not inherit classless list spacing; destination anchors must
  not inherit nested-card chrome.
- Mobile toggle X must remain centered and links/actions must share exactly one
  separator.

## Responsive adaptation

- At and above 48rem: horizontal shell, compact absolute dropdown, two equal
  group columns, descriptions visible.
- Below 48rem: one in-flow tree, one-column groups, full-width actions, concise
  rows with descriptions hidden.
- No duplicate desktop/mobile tree and no viewport-height arithmetic.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled, the inert toggle
  is hidden and the single navigation tree, actions, group labels, destinations,
  and native disclosure remain visible and usable.

## Rejected mappings

- No `ren-card`: its contract excludes navigation/popover surfaces.
- No `ren-menu` or `ren-popover`: native disclosure is the correct semantic
  baseline and avoids nested widget complexity.
- No nested nav landmark, duplicate mobile list, fake role button, framework
  component, or copied Relume asset.
