# Relume to RenDS Translation Map — Navbar 14

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
| Floating logo-left/menu-right/actions shell | one `<ren-nav>` containing one `<nav class="ren-nav">` | One landmark and one tree across all widths; floating compact surface is block chrome, not a second nav |
| Four top entries | one `ul.ren-nav-links` | Three links plus one native disclosure |
| Fake dropdown trigger | native `details.rn14-disclosure > summary` | Keyboard activation by default; one authored chevron |
| Three title-only destinations | three whole `a.rn14-destination` anchors | Preserve compact flat menu without invented icons, groups, or descriptions |
| Two actions inside collapsible panel | `.ren-nav-actions` owned by the same open/closed shell as the link tree | Desktop horizontal cluster after links; mobile stacked full-width **inside** the opened panel — never permanent top-row chrome beside the toggle |
| Mobile toggle | named `.ren-nav-toggle` button | Expanded/controls state owned by `ren-nav` |

## Interaction policy

- Use the established 48rem Ren10 boundary for shell and dropdown interaction;
  do not preserve the source's 991px split or framework `lg` mismatch.
- Desktop pointer hover previews across a stable trigger-to-panel corridor.
- Pointer click pins the preview; a second click closes it.
- Native Enter/Space activation remains available.
- Escape closes and focuses summary. Outside click, destination activation,
  mobile-shell close, and breakpoint crossing also close the disclosure.
- Mobile is activation-only; hover never governs its state.

## Cascade risks

- Neutralize Primitive Zero `details` border/padding/margin, summary marker,
  generated `summary::after`, and open-state divider.
- Exactly one `.rn14-chevron`; no native or generated duplicate.
- Desktop panel is absolute, narrow, and aligned beneath its trigger without
  overlapping the bar. Mobile panel returns to normal flow.
- Actions must collapse with the mobile shell: closed mobile shows only logo +
  toggle; open mobile shows links then stacked full-width actions. Do not leave
  actions visible in the top row the way Navbar 13 keeps its single CTA.
- Mobile links/actions must not accumulate duplicate separators.
- Floating shell must not clip the absolute desktop dropdown (`overflow`
  management on the preview root / nav surface).

## Responsive adaptation

- At and above 48rem: compact floating horizontal shell, logo at start, menu
  and two actions at the end in one row, narrow absolute dropdown.
- Below 48rem: one top row with logo + toggle only; one in-flow navigation
  tree; full-width stacked links; two full-width stacked actions inside the
  opened panel; in-flow dropdown.
- No duplicate desktop/mobile tree and no viewport-height arithmetic.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled, the inert toggle
  is hidden and the single navigation tree, both actions, and native disclosure
  remain visible and usable.

## Rejected mappings

- No `ren-card`: its contract excludes navigation/popover surfaces even though
  the source used Card as chrome.
- No `ren-menu`, `ren-popover`, or `ren-collapsible`: native disclosure is the
  correct semantic baseline and avoids nested widget complexity.
- No permanent top-row actions on mobile (that is Navbar 13 / different
  anatomy); actions belong to the collapsible panel.
- No centered menu geometry (Navbar 13); this module is end-aligned menu +
  actions.
- No invented submenu content, nested nav landmark, duplicate mobile list, fake
  role button, framework component, or copied Relume asset.
