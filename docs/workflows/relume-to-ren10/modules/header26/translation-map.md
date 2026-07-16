# Translation Map — Header26

| Source fact | Ren10 translation |
|---|---|
| Content-height centered hero | Native `section` containing `ren-center ren-center-wide ren-stack` |
| Centered max-width copy | `ren-center ren-center-prose ren-stack` with native `h1` and `p` |
| Two centered actions | Two real anchor destinations in one wrapping `ren-cluster` |
| Full-width landscape image | One `.ren-frame.ren-frame-video` containing one intrinsic `img` |
| No behavior | No script, form, dialog, custom element upgrade, or imperative handler |

## Cascade risks

- All bespoke selectors are prefixed `rh26-` and only reset native margins inside the block.
- Ren10 center, stack, cluster, frame, and button contracts own the layout and controls.
- The cluster wraps at narrow widths; a mobile rule makes both CTAs width-safe at 320px.
- The image owns intrinsic `1600 × 900` dimensions and the frame preserves 16:9.

## Responsive adaptation

- Copy, actions, and image keep one invariant vertical order.
- The action cluster wraps and both anchors remain width-safe at 320px.
- The media frame spans the centered outer container at every tested width.

## Progressive enhancement

- Both destinations are ordinary anchors and remain available without JavaScript.
- No script is necessary or permitted for this block.
