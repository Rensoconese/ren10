# RenDS compatibility matrix

The canonical interactive catalog and feature examples live at
[Rensoconese/ren10 on GitHub Pages](https://rensoconese.github.io/ren10/).

| Surface | Chromium | Firefox | WebKit/Safari | Fallback |
|---|---|---|---|---|
| Vanilla HTML/CSS/JS | Current | Current | Current | Server-rendered HTML |
| `<dialog>` / popover | Native | Native | Native/current | RenDS JS close/focus handling |
| Container queries | Current | Current | Current | Width-independent layout |
| Anchor positioning | Progressive | Progressive | Progressive | JS positioning |
| `prefers-reduced-motion` | Supported | Supported | Supported | Motion tokens collapse |
| Custom elements / light DOM | Supported | Supported | Supported | Native markup remains usable |

CI runs the Playwright matrix. Chromium is blocking; Firefox and WebKit are
compatibility signals and should be investigated before a major release.
