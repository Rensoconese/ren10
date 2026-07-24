# Relume to RenDS Translation Map — Header9

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/primitives/ren-button/component.md`

## RenDS mapping

- Full-svh source section → semantic `<section>` using `ren-cover` as the height owner and a vertical column; no custom duplicate viewport owner.
- Flexible top media → `ren-frame` inside a flexing media region, with exactly one decorative local `<img>` using cover fit.
- Constrained bottom band → `ren-center ren-center-wide`.
- Responsive two-column content → `ren-switcher`; DOM order stays h1, then right-hand copy/actions so mobile stacks correctly without duplication.
- Right-hand copy → `ren-stack` containing one description then one `ren-cluster`.
- Two source buttons → exactly two real destination anchors using `ren-btn` and `ren-btn-outline`.
- Text, surfaces, spacing, focus rings, and sizing → semantic/public Ren10 tokens only.

## Cascade risks

- The section must not inherit heading or paragraph margins that distort the band grid; block-scoped rules reset those margins.
- `ren-cover` must retain the only viewport minimum while the media region uses flex growth and `min-height: 0`.
- `ren-frame` aspect behavior must not force the page taller than the viewport; the media frame fills its flexing parent.
- Button focus must use the documented public ring token and must not be clipped.

## Responsive adaptation

- Below 48rem the switcher is forced to one column in source order.
- At 48rem and above the heading and right-hand stack become equal-width top-aligned columns.
- CTA cluster wraps naturally and remains touch-safe; no alternate DOM tree is rendered.

## Progressive enhancement

- The complete structure, image, heading, copy, and two real links are usable before any JavaScript and when JavaScript is disabled.
- No script or custom-element upgrade is required for core content or navigation.

## Rejected mappings

- Rejected a background-image/scrim hero because the reference owns an independent top media region and no overlay.
- Rejected a bespoke grid and duplicated mobile markup because `ren-switcher` preserves order responsively.
- Rejected buttons with click handlers or fragment placeholders because both actions are navigation and require real destinations.
- Rejected form, nav, logo, video, and third-CTA additions because the source does not own them.
