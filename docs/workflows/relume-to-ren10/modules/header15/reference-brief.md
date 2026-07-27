# Reference Brief — Header 15

## Retrieval metadata

- Family: `headers`
- Module ID: `header15`
- Source: complete authenticated Relume MCP retrieval performed in the current
  Header batch before this isolated implementation task
- Retrieved at: 2026-07-15
- Source variant: one content-height hero-header section (`Header15`)

## Retrieved facts

Sanitized facts from the authenticated complete source; protected source,
classes, copy, dependencies, and URLs are not persisted.

- Content-height section; it is not a full-viewport composition.
- One horizontally constrained container owns the complete module.
- The first region is a responsive copy layout:
  1. exactly one `h1` on the left;
  2. exactly one description followed by exactly two CTA controls on the right.
- The second region is exactly one full-width landscape image below the copy.
- The image uses cover fitting and a rounded frame.
- CTA controls form a wrapping inline group.
- No overlay, scrim, video, dialog, form, navigation, brand, logo, card grid, or
  additional action exists.

## Responsive states

- Mobile: heading, description, and CTA group form one column in source order;
  the image remains below and spans the container.
- Medium and wider: heading owns the left column; description and actions own
  the right column; the image remains full-width below.
- Section padding, inter-column gap, and copy-to-image gap increase through the
  source responsive bands.
- Width checks: 320, 390, 767, 768, and 1280px.

## Accessibility corrections required by Ren10

- Replace source placeholder destinations with two distinct real local URLs.
- Use an owned image with meaningful alternative text and intrinsic dimensions.
- Preserve real anchors, visible focus, 44px targets, logical DOM/focus order,
  theme-safe contrast, and reduced-motion-safe Ren10 transitions.
- Keep the complete content and destinations usable without JavaScript.

## Public-output exclusions

- Relume source, React/Tailwind classes, default copy, dependencies, and URLs
- Placeholder/network assets and framework primitives
- Overlay, video, form, nav, logo, dialog, third CTA, or duplicate content tree
- Primitive palette tokens and hardcoded chromatic colors
