# Relume to RenDS Translation Map — Header 16

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-field/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / correction |
| --- | --- | --- |
| Content-height section | Semantic `section.rh16-hero` | Content determines height; no viewport minimum |
| Constrained module | `ren-center ren-center-wide` inside `ren-stack` | One container owns copy and media |
| Responsive upper split | `ren-switcher` | One column narrowly; equal top-aligned peers from medium |
| Supporting copy | `ren-stack` | Description precedes form |
| Email control | One `ren-field` with visible label and native email input | Component owns ARIA/error wiring |
| Submit | One real `button.ren-btn` | Native submit semantics and 44px target |
| Form row | `ren-switcher` with block-local responsive constraints | Stacked narrowly, row from small |
| Legal terms | Native paragraph and one real local anchor | Destination remains available without JavaScript |
| Success feedback | Native polite status node | Inline module reveals feedback only after valid submit |
| Landscape media | Semantic `figure.ren-frame` with one owned image | Full-width rounded cover image with intrinsic size |

## Progressive enhancement

- Native action, required/email validity, terms URL, and image work without JavaScript.
- The inline `type="module"` imports `ren-field`, selects only within `[data-rh16-root]`, and enhances valid submit with a polite status.

## Cascade risks

- Primitive Zero margins are neutralized so layout primitives exclusively own rhythm.
- The initial error must remain hidden until native invalid interaction marks `ren-field[data-invalid]`.
- The 640px form seam and 768px copy seam must not create overlap or overflow.
- `ren-frame` owns landscape geometry; the image fills it without baseline gaps or escaping the rounded edge.

## Rejected mappings

- No `ren-cover`, CTA link group, navigation, brand, video, dialog, overlay, duplicated mobile tree, external asset, or JavaScript-only form.
