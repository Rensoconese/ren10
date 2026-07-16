# Translation Map — Header21

| Source fact | Ren10 translation |
|---|---|
| Content-height constrained section | Native `section` + `ren-center ren-center-wide` |
| Mobile copy then media / desktop media left | One source-ordered `ren-switcher`; media receives visual order only at desktop |
| Copy flow | `ren-stack` with native `h1`, paragraph, and `ren-cluster` |
| Two CTA destinations | Exactly two real anchors using documented `.ren-btn` variants |
| Landscape poster trigger | Real button + `ren-frame ren-frame-video`, owned landscape image, one scrim, one play icon |
| Modal lightbox | `ren-dialog` wrapping native `dialog`, one close control, loader, and titled iframe |
| Loading | One labelled `ren-spinner` inside a `ren-cover` busy owner |
| Video | Deterministic owned WebM in one iframe `srcdoc`, removed on close |
| No JavaScript | Native CTA anchors and a `noscript` real alternative destination over the poster |

## Cascade risks

- The inline behavior is `type="module"`.
- It selects `[data-rh21-root]` once from `document`; all descendants are queried from that root.
- All consumer selectors use the `rh21-` namespace; no generic element or component rules escape the block.
- Ren10 layout primitives own the structural layout; custom CSS only configures primitive variables, responsive order, and lightbox visuals.
