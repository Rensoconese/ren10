# Relume to RenDS Translation Map — Navbar 32

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/composites/ren-sheet/component.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-link/component.md`
- `components/primitives/ren-icon/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Full-width logo-left / action / toggle bar | one page-header shell inside `[data-rn32-root]` using `ren-row-spread` | Permanent bar chrome at every width; not a second navigation tree |
| Always-visible menu toggle | named `<button class="rn32-toggle">` with three authored spans | Accessible name + `aria-expanded` / `aria-controls`; morphs to single close X while open |
| Left edge drawer | `<ren-sheet side="left" size="md" id="rn32-drawer">` | Real dialog modality, overlay dismiss, Escape, focus return via public sheet API |
| Five primary destinations | one `<nav class="rn32-nav">` / `#rn32-primary-links` list of five `a.rn32-destination.rn32-link` | One landmark and one primary tree; large type via tokens |
| Contact block | `.rn32-contact` with heading + `address` lines | Phone/email as real links (`rn32-contact-link`); address as text |
| Five social destinations | `.rn32-social` list of five text-named `a.rn32-destination.rn32-social-link` | No nested `nav` landmark; text names instead of brand SVG paths |
| Permanent bar action | one `a.ren-btn.rn32-destination.rn32-cta` in the bar actions cluster | Outside the drawer; closes an open drawer on activation |
| Unused defaults contact button | **omit** | Source does not render it; do not invent a drawer footer CTA |

## Interaction policy

- Drawer open/close is activation-only at every width (no hover corridor — source
  has no dropdowns).
- Toggle calls the public `ren-sheet` `.show()` / `.close()` methods; do not touch
  private sheet fields.
- Escape closes the sheet and restores focus to the toggle (sheet contract).
- Outside/backdrop activation closes the sheet (sheet contract).
- Every destination class (primary, social, contact, bar CTA) closes an open
  sheet on activation.
- Same-breakpoint resize keeps open/closed state stable; no invented second tree
  at any seam (320 / 340 / 767 / 768 / 769).

## Cascade risks

- Ensure the preview root does not clip the fixed sheet (`overflow` management
  on page chrome, not on the dialog).
- Exactly one close morph on the toggle (three bars → one X). Do not author a
  second close glyph that duplicates the open-state X unless it is the standard
  in-sheet close control with a distinct role; prefer a single toggle morph plus
  optional `[data-sheet-close]` text control without a second X icon.
- Primary link list must not inherit Primitive Zero list markers that break the
  large-type stack.
- Social list must not introduce a nested navigation landmark.
- Bar action and toggle must remain independently hittable (≥44px) at 320px
  without horizontal root overflow.

## Responsive adaptation

- All widths: bar = logo start + action + toggle end; primary tree lives only in
  the left sheet.
- Sheet width uses Ren10 size token surface (`size="md"` / component width tokens),
  not source max-width percentages or rem caps copied from utilities.
- No horizontal desktop link row and no mobile-only duplicate list.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled: hide the inert
  toggle, expose the single primary tree + contact + social destinations in
  normal flow beneath the bar, and keep the permanent CTA usable.
- With JavaScript enabled: sheet upgrades to a modal left drawer; toggle gains
  expanded/controls state.

## Rejected mappings

- No `ren-nav` mobile collapse model: source never presents a horizontal desktop
  link row; the menu is always a left drawer.
- No `ren-menu`, `ren-popover`, or native `details` dropdown: source has no
  dropdowns.
- No nested `nav` for socials.
- No invented drawer footer CTA from the unused defaults field.
- No copied Relume assets, icon paths, class strings, durations, or breakpoints.
