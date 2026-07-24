# Relume to RenDS Translation Map — Navbar 13

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
- `components/primitives/ren-card/component.md`
- `components/composites/ren-collapsible/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Floating logo-left/menu-center shell | one `<ren-nav>` containing one `<nav class="ren-nav">` | One landmark and one tree across all widths |
| Four top entries | one `ul.ren-nav-links` | Three links plus one native disclosure |
| Fake dropdown trigger | native `details.rn13-disclosure > summary` | Keyboard activation by default; one authored chevron |
| Three title-only destinations | three whole `a.rn13-destination` anchors | Preserve compact flat menu without invented icons, groups, or descriptions |
| One action | one RenDS primary button anchor | Preserve exact action count and prominence |
| Mobile toggle | named `.ren-nav-toggle` button | Expanded/controls state owned by `ren-nav` |

## Interaction policy

- Use the established 48rem Ren10 boundary for shell and dropdown interaction;
  do not preserve the source's 991px split.
- Desktop pointer hover previews across a stable trigger-to-panel corridor.
- Pointer click pins the preview; a second click closes it.
- Native Enter/Space activation remains available.
- Escape closes and focuses summary. Outside click, destination activation,
  mobile-shell close, and breakpoint crossing also close the disclosure.
- Mobile is activation-only; hover never governs its state.

## Cascade risks

- Neutralize Primitive Zero `details` border/padding/margin, summary marker,
  generated `summary::after`, and open-state divider.
- Exactly one `.rn13-chevron`; no native or generated duplicate.
- Desktop panel is absolute, narrow, and centered beneath its trigger without
  overlapping the bar. Mobile panel returns to normal flow.
- The center menu must remain visually centered independently of unequal logo
  and action widths; use the RenDS shell grid rather than incidental spacing.
- Mobile links/actions must not accumulate duplicate separators.

## Responsive adaptation

- At and above 48rem: compact floating horizontal shell, centered menu, one
  right-side action, and narrow absolute dropdown.
- Below 48rem: one top row with logo/action/toggle, one in-flow navigation tree,
  full-width stacked links, and in-flow dropdown.
- No duplicate desktop/mobile tree and no viewport-height arithmetic.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled, the inert toggle
  is hidden and the single navigation tree, action, and native disclosure remain
  visible and usable.

## Rejected mappings

- No `ren-card`: its contract excludes navigation/popover surfaces.
- No `ren-menu`, `ren-popover`, or `ren-collapsible`: native disclosure is the
  correct semantic baseline and avoids nested widget complexity.
- No invented submenu content, nested nav landmark, duplicate mobile list, fake
  role button, framework component, or copied Relume asset.
