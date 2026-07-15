# Relume to RenDS Translation Map — Header 1

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/primitives/ren-button/component.md`

## RenDS mapping

- Source section/container → semantic `<section>` + `ren-center-wide`.
- Responsive equal split → `ren-switcher` with a Ren10 width-token threshold.
- Copy flow → `ren-stack-lg`; action row → `ren-cluster`.
- Primary and secondary actions → real `<a href>` elements using `.ren-btn` and `.ren-btn-secondary`.
- Cover image → semantic `<figure>` + `ren-frame ren-frame-photo` and one real `<img>`.
- All paint, spacing, type, radius, shadow, border, and motion values resolve through Ren10 semantic/component tokens.

## Cascade risks

- Primitive Zero gives `figure`, `h1`, `p`, and links native margins/styles; block-local rules neutralize only the heading/description margins while Ren10 button CSS owns CTA chrome.
- `ren-switcher` owns display/wrapping; block CSS changes only its public custom properties and cross-axis alignment.
- `ren-frame` owns image sizing and cover behavior; the figure clips its one image at the token radius.
- The secondary CTA uses the documented Ren10 selector, so no generated duplicate affordance is introduced.

## Responsive adaptation

- The source changes to two columns at its large breakpoint. Ren10 uses a content-aware `ren-switcher` threshold so the component stacks whenever two useful columns do not fit, including mobile/tablet widths.
- Copy stays first in DOM and visual order. Both desktop peers receive equal flex growth from the layout primitive.

## Progressive enhancement

- The block is complete semantic HTML without JavaScript. Heading, description, both links, and image remain available when scripts are disabled.

## Rejected mappings

- Rejected React, TSX, Tailwind, Radix Slot, and source utility classes.
- Rejected a decorative div masquerading as image; the implementation keeps one real image.
- Rejected bespoke flex/grid skeletons because Ren10 layout primitives cover the composition.
