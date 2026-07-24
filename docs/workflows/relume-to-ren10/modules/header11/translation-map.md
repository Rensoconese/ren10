# Relume to RenDS Translation Map — Header11

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/primitives/ren-button/component.md`

## RenDS mapping

- Full-svh source section → semantic `<section>` using `ren-cover` as the sole viewport-height owner.
- Flexible top media → block-local flexing region containing exactly one native `<video>` with cover fitting.
- Source video flags → `autoplay loop muted playsinline`; `playsinline` is the necessary mobile accessibility/behavior completion.
- Source scrim → exactly one inert full-inset layer using `--color-overlay`, scoped to the media region.
- Accessible motion control → one real `.ren-btn` button layered inside the media region; JavaScript toggles playback, label, and visible text.
- No-JavaScript fallback → native `controls` remain in markup; enhancement removes them only after JavaScript is running and exposes the custom button.
- Reduced motion → media query state is read before enhancement playback; matching users start paused and can explicitly opt in.
- Constrained bottom band → `ren-center ren-center-wide`.
- Responsive two-column band → `ren-switcher`; DOM order stays h1 then right-hand copy/actions so mobile stacks without duplication.
- Right-hand copy → `ren-stack` containing one description then one `ren-cluster`.
- Two source actions → exactly two real destination anchors using `ren-btn` and `ren-btn-outline`.

## Cascade risks

- Native figure/video, heading, and paragraph defaults must not introduce margins or aspect rules that make the cover exceed 100svh.
- `ren-cover` must remain the only viewport owner while the media region uses flex growth and `min-height: 0`.
- The absolutely positioned video, scrim, and control require explicit z-index ownership so the control is never behind the scrim.
- The motion control must remain inside the media region and must not be clipped against its inset edge.
- Button focus must use documented Ren10 ring behavior and remain visible over the scrim and on the copy-band surface.
- Enhancement must hide native controls only after the custom control is usable; failure falls back to native controls.

## Responsive adaptation

- Below 48rem the switcher is forced to one column in source order.
- At 48rem and above the heading and right-hand stack become equal-width, top-aligned columns.
- CTA cluster wraps naturally and remains touch-safe; no alternate DOM tree is rendered.
- The video consumes the remaining top height at 320, 390, 767, 768, and 1280px widths.

## Progressive enhancement

- With JavaScript disabled, the full anatomy, video with native controls, heading, description, and two real links remain available.
- With JavaScript enabled, native controls are replaced by one focused pause/play control.
- If programmatic playback fails, native controls are restored and the custom control is hidden.

## Rejected mappings

- Rejected a background image because the source owns a native video.
- Rejected a full-hero text overlay because the copy belongs in a separate lower band.
- Rejected a bespoke grid and duplicated mobile tree because `ren-switcher` preserves source order.
- Rejected an icon-only or non-semantic motion affordance because a visible real button is clearer and accessible.
- Rejected nav, logo, form, image, dialog, and third-CTA additions because the source does not own them.
