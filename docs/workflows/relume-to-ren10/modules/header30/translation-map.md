# Header 30 Translation Map

| Reference role | Ren10 implementation |
| --- | --- |
| Fullscreen-style stage | `.rh30-hero.ren-cover` with bounded `--cover-height` |
| Cover media and scrim | Owned intrinsic image plus semantic `--color-overlay` layers |
| Centered content | `ren-cover-center`, `ren-center`, and `ren-stack` |
| Two actions | `ren-grid` and two real `.ren-btn` links |
| Block navigation | Shared `.bb-block-pagination.ren-grid` outside the preview |

## Cascade risks addressed

- Height is clamped from 32rem to 44rem, avoiding uncontrolled viewport whitespace.
- Outer detail rhythm remains the shared 32px Grid gap.
- No flexbox or framework layout is introduced.
