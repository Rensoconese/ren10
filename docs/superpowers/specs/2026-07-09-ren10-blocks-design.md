# Ren10 Blocks Design

Date: 2026-07-09
Status: Draft for review

## Objective

Create a Ren10-owned block library: standalone marketing and application
modules built with RenDS contracts, tokens, layout primitives, components, and
vanilla HTML/CSS/JS.

External block libraries may be used as private structural references during
research, but the public Ren10 output must not name, credit, copy code from, or
depend on those libraries. The deliverable is a native Ren10 interpretation of
each module anatomy.

## Product Shape

Ren10 Blocks are independent modules, not complete pages. Each block demonstrates
how to build one common UI structure with Ren10:

- Navigation blocks
- Hero blocks
- Feature blocks
- Pricing blocks
- FAQ blocks
- CTA blocks
- Footer blocks
- Application shell blocks

Blocks can later be composed into full templates, but the first deliverable is a
block catalog where each module stands alone.

## Public IA

Add a new templates subsection:

- `templates/blocks/index.html` - block catalog and category index
- `templates/blocks/nav-drawer.html` - first standalone block demo
- Future files use lowercase descriptive names, such as:
  - `templates/blocks/nav-mega-menu.html`
  - `templates/blocks/feature-split-card.html`
  - `templates/blocks/pricing-three-tier.html`
  - `templates/blocks/faq-accordion.html`

The existing `templates/index.html` should link to the block catalog as a new
card or section after the current full-page templates.

## Source Translation Model

Each block starts from a structural brief, then is rebuilt in Ren10.

For each reference module, capture:

- Intent: what job the block performs.
- Anatomy: semantic regions and repeated parts.
- Behavior: drawer, accordion, dialog, tabs, validation, or no JS.
- Responsive model: how regions reorder or collapse.
- Content model: required and optional content slots.
- Accessibility requirements: landmarks, keyboard support, names, focus, and
  reduced motion.

Then translate to Ren10:

- Layout primitives before custom layout CSS.
- Semantic HTML first: `nav`, `section`, `header`, `button`, `a`, `details`,
  `dialog`, `form`, `ul`, `li`.
- RenDS components for interaction and visual consistency.
- Semantic and component tokens only.
- Minimal vanilla JS only when RenDS behavior does not already cover the block.

## Public Documentation Rules

The public block pages must read as Ren10-native examples.

Do:

- Name blocks by function, such as "Navbar Drawer" or "Feature Split Card".
- Explain which Ren10 components and layout primitives are used.
- Include accessible, copyable HTML.
- Keep CSS scoped to the block demo and expressed through Ren10 tokens.
- Keep JS small, progressive, and optional where possible.

Do not:

- Mention private reference libraries on public pages.
- Include TSX, JSX, Tailwind classes, React concepts, Radix imports, icon package
  imports, or external setup instructions from the reference source.
- Copy placeholder text, image URLs, class names, component names, or slugs from
  the reference source.
- Promote these blocks as new component APIs before they prove reusable.

## First Block: Navbar Drawer

### Intent

A compact site navigation block with logo, primary CTA, and a drawer-style menu
that works well for marketing sites and small product websites.

### Anatomy

- Top-level `nav` landmark with accessible label.
- Brand link on the left.
- Primary CTA on the right.
- Menu trigger button on the right.
- Drawer panel with:
  - Large navigation links.
  - Optional contact group.
  - Optional social links.
  - Close button.

### Ren10 Mapping

- Page shell: existing template chrome plus `ren-center-wide` for preview
  framing where needed.
- Navigation layout: `ren-row-spread` and `ren-cluster` where practical.
- Buttons: `.ren-btn`, `.ren-btn-secondary`, `.ren-btn-ghost`,
  `.ren-btn-icon`.
- Drawer: `ren-sheet` with `side="right"` and `size` chosen from the sheet
  contract.
- Links: real anchors, styled with RenDS link/nav patterns where appropriate.
- Icons: inline SVG inside `.ren-icon`, with accessible labels for icon-only
  actions.

### Behavior

- Menu trigger opens the sheet.
- Close button and escape key close the sheet through the RenDS sheet behavior.
- Focus remains visible and returns to the trigger after close.
- Links remain regular anchors; no client router assumptions.
- Reduced motion follows RenDS motion tokens.

### Responsive Behavior

- Desktop and mobile both use the drawer variant for the first block, because
  the pattern is useful as a compact navigation regardless of width.
- The top bar keeps brand, CTA, and menu trigger visible.
- Drawer width uses RenDS sheet sizes instead of fixed viewport values.

### Acceptance Criteria

- The block is visible as a standalone page under `templates/blocks/`.
- The block imports only RenDS CSS and local page-specific CSS.
- No React, JSX, Tailwind, external icon package, or reference-source imports.
- Keyboard users can open, navigate, and close the drawer.
- Icon-only controls have accessible names.
- The example works at mobile and desktop widths without overlapping text.
- The block can be copied into another vanilla page with only RenDS imports.

## Future Blocks

After the first navbar block, prioritize one category at a time:

1. Navigation:
   - Drawer navbar
   - Mega menu navbar
   - Centered nav with actions
2. Features:
   - Split image/text
   - Card with subfeatures
   - Icon grid
3. Conversion:
   - Pricing three-tier
   - FAQ accordion
   - CTA split
4. Structure:
   - Footer columns
   - Blog/article header
   - Application shell

Each new block should follow the same translation model and stay independent.

## Validation

For the design/spec phase:

- Spec has no placeholder requirements.
- Scope is limited to the block library and first navbar block.
- Existing unrelated working-tree changes remain untouched.

For implementation later:

- Load `ren-design.md`, `tokens/tokens.md`, `base/layouts.md`,
  `base/primitive-zero.md`, `components/components.md`, and every component
  contract used.
- Run the RenDS validation commands required by `AGENTS.md` before reporting
  implementation complete.
- Add targeted browser verification for the block page at mobile and desktop
  widths.
