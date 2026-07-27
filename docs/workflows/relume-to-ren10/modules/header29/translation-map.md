# Header 29 Translation Map

| Reference role | Ren10 implementation |
| --- | --- |
| Centered section | `.rh29-hero` + `ren-center ren-stack` |
| Heading and supporting copy | Native `h1` and `p` with semantic typography tokens |
| Email capture | Native `form`, `ren-field`, `ren-input`, and real submit button |
| Field / action row | `ren-grid` with `1fr` then `minmax(0, 1fr) auto` |
| Landscape media | `figure` + `button.ren-frame-video` + owned poster |
| Video lightbox | `ren-dialog`, real generated `dialog`, `ren-spinner`, and lazy iframe |
| Block navigation | Shared `.bb-block-pagination.ren-grid` outside the preview |

## Cascade risks addressed

- The shared detail page owns the 32px header→preview and preview→pagination gaps.
- The custom-element host for `ren-sheet` uses `display: contents` so overlays cannot become empty Grid rows.
- Header 5 no longer nests one `.bb-detail-preview` inside another.
- Header 29 uses no flexbox layout and no viewport-height minimum.
