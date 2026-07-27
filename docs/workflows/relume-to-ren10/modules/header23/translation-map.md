# Relume Header 23 → Ren10 Translation Map

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/primitives/ren-button/component.md`

## RenDS mapping

| Reference part | Ren10 part | Preserved behavior |
| --- | --- | --- |
| Content-height section | Native labelled `section` | Semantic landmark without viewport forcing |
| Constrained centered copy | `ren-center` + block-local public width token | Finite centered measure |
| Copy flow | `ren-stack` | Heading, description, actions order |
| Heading / description | Native `h1` / `p` | Primitive Zero semantics and one heading |
| Two CTA row | `ren-cluster` | Centered, wrapping ownership |
| CTA controls | Real anchors with `.ren-btn` and outline variant | Two real distinct destinations, 44px and focus |

## Cascade risks

- Reset native `h1` and `p` margins so `ren-stack` is the only vertical rhythm owner.
- Do not add generated icons or pseudo-elements to either CTA.
- Keep action centering on the cluster; do not duplicate actions for mobile.
- Foundation button CSS owns focus, touch size, theme colors, and reduced-motion transition collapse.

## Responsive adaptation

- One centered column at every width.
- Base section spacing uses `--space-section-sm`; medium and larger use
  `--space-section-lg`.
- The `ren-cluster` wraps naturally. At 320px the two intrinsic CTA labels may
  occupy separate rows; wider widths may keep them on one centered row.

## Progressive enhancement

- No JavaScript is required.
- Both CTA anchors remain named, focusable, and navigable with JavaScript disabled.

## Rejected mappings

- `ren-row`: rejected because it cannot wrap safely.
- Custom flex/grid: rejected because `ren-stack`, `ren-cluster`, and `ren-center` cover the anatomy.
- Buttons without destinations: rejected because the source placeholders require real navigation corrections.
