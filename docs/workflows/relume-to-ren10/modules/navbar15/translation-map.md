# Relume to RenDS Translation Map — Navbar 15

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
| Floating bottom-dock (desktop) / top (mobile) shell | one `<ren-nav>` containing one `<nav class="ren-nav">` inside preview chrome that docks bottom at ≥48rem and top below | One landmark and one tree; docking is block chrome, not a second nav |
| Brand / logo + desktop up-icon | one `.ren-nav-brand` with logo mark text for mobile and an authored up-icon shown only on desktop | Same destination; visual swap is CSS, not two trees |
| Four top entries | one `ul.ren-nav-links` | Three links plus one native disclosure |
| Fake dropdown trigger | native `details.rn15-disclosure > summary` | Keyboard activation by default; one authored chevron |
| Three title-only destinations | three whole `a.rn15-destination` anchors | Compact flat menu without invented icons, groups, or descriptions |
| One permanent action | `.ren-nav-actions` with one primary button, **outside** the collapsible links shell | Always visible beside toggle on mobile; end-aligned with links on desktop |
| Mobile toggle | named `.ren-nav-toggle` button | Expanded/controls state owned by `ren-nav` |
| Desktop upward dropdown | absolute panel with `bottom: 100%` corridor | Opens above the bottom-docked bar |

## Interaction policy

- Use the established 48rem Ren10 boundary for shell and dropdown interaction;
  do not preserve the source's 991px split or framework `lg` mismatch.
- Desktop pointer hover previews across a stable trigger-to-panel corridor
  (panel above the bar; corridor fills the gap downward toward the summary).
- Pointer click pins the preview; a second click closes it.
- Native Enter/Space activation remains available.
- Escape closes and focuses summary. Outside click, destination activation,
  mobile-shell close, and breakpoint crossing also close the disclosure.
- Mobile is activation-only; hover never governs its state.

## Cascade risks

- Neutralize Primitive Zero `details` border/padding/margin, summary marker,
  generated `summary::after`, and open-state divider.
- Exactly one `.rn15-chevron`; no native or generated duplicate.
- Desktop panel is absolute, narrow, and aligned **above** its trigger without
  clipping under the bottom-docked bar. Mobile panel returns to normal flow.
- Action stays permanent chrome: closed mobile shows brand + action + toggle;
  open mobile adds the links panel below. Do not hide the action inside the
  collapsible panel the way Navbar 14 does with its two actions.
- Bottom docking must not clip the upward desktop dropdown (`overflow:
  visible` on preview root / nav surface).
- Desktop brand shows up-icon only; mobile shows brand mark + name; never both
  simultaneously as duplicate affordances.

## Responsive adaptation

- At and above 48rem: compact floating horizontal shell docked near the
  **bottom** of the preview (or viewport chrome), brand/up-control at start,
  four-entry menu and one action in one row, narrow absolute dropdown above.
- Below 48rem: one top row with brand + action + toggle; one in-flow navigation
  tree when open; full-width stacked links; in-flow dropdown.
- No duplicate desktop/mobile tree and no viewport-height arithmetic.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled, the inert toggle
  is hidden and the single navigation tree, the permanent action, and native
  disclosure remain visible and usable.

## Rejected mappings

- No `ren-card`: its contract excludes navigation/popover surfaces even though
  the source used Card as chrome.
- No `ren-menu`, `ren-popover`, or `ren-collapsible`: native disclosure is the
  correct semantic baseline and avoids nested widget complexity.
- No two panel-owned actions (Navbar 14 anatomy); this module has one permanent
  action in chrome.
- No top-only floating desktop geometry (Navbar 13/14); this module docks
  bottom on large viewports with upward dropdown.
- No invented submenu content, nested nav landmark, duplicate mobile list, fake
  role button, framework component, or copied Relume asset.
