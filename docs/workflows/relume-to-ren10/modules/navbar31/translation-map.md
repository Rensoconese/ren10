# Relume to RenDS Translation Map — Navbar 31

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
- `components/patterns/ren-nav/pattern.md` (brand/actions/toggle class reuse only)

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Full-width logo-left / action+toggle-right bar | block chrome bar using `.ren-nav-brand`, `.ren-nav-actions`, `.ren-nav-toggle` | One permanent top row at all widths; not a floating card |
| Five primary destinations | one `ul#rn31-primary-links` of five `a.rn31-primary-link` | Large bold stack only inside the open right sheet |
| Permanent top-bar action | one primary `.ren-btn` anchor in `.ren-nav-actions` | Always visible in the bar (not panel-owned like Navbar 14) |
| Right-edge sheet panel | `<ren-sheet id="rn31-sheet" side="right" size="md">` | Native dialog modality, backdrop, Escape, focus return |
| Sheet close | one `.ren-sheet-close[data-sheet-close]` | Single close control; no second morphing hamburger in the header |
| Contact cluster | `.rn31-contact` with title, `tel:` phone, `mailto:` email, plain address | Real anchors for contact destinations |
| Five social destinations | five named `.rn31-social-link` anchors with authored `.ren-icon` SVGs | Accessible names required; generic geometry — never Relume icon paths |
| Hamburger toggle | named `.ren-nav-toggle` + `data-sheet-trigger` | Expanded/controls synced via public `ren-open` / `ren-close` and `aria-expanded` |

## Interaction policy

- Toggle-driven open/close at **all** widths. Do not invent a permanent desktop
  horizontal link row or under-bar full-width overlay (Navbar 16 pattern).
- Open/close ownership: public DOM only — toggle `aria-expanded`, sheet `open`
  attribute / `.open` getter, `[data-sheet-close]` destinations. Never private
  `_isOpen` fields.
- Escape closes the sheet and restores focus to the toggle (ren-sheet contract).
- Backdrop / outside activation closes the sheet.
- Primary links, contact phone/email, and social destinations close via
  `data-sheet-close`. Permanent bar CTA also closes an open sheet through the
  public controller (destination-class completeness).
- No dropdown hover corridor (source has no dropdowns / zero chevrons).
- Reduced-motion: block-local transitions collapse to none; sheet motion uses
  RenDS enter/exit tokens.

## Cascade risks

- Force the menu toggle visible at desktop — default `ren-nav` hides it above
  48rem; this module is toggle-driven at every width.
- Sheet body must own a vertical space-between layout: primary stack top,
  contact + socials bottom, without inventing a second landmark tree.
- Exactly one close control in the sheet header; bar toggle remains the open
  affordance and must not render a second close glyph while closed.
- Zero chevrons (`details`/`summary` not used).
- Social icons inherit `currentColor` and meet 44px targets via the anchor hit
  area.
- Narrow 320–340 viewports: keep brand mark + permanent CTA + 44px toggle fully
  inside the bar without html/root horizontal overflow.

## Responsive adaptation

- All widths: full-width bar; logo start; permanent action + toggle end;
  destinations only in the right sheet when open (or PE stack when JS is off).
- Open sheet: five large bold links; contact cluster; five socials; scrollable
  body if needed.
- Closed (JS on): only brand, permanent action, and toggle visible in the bar.
- Breakpoint seams (767 / 768 / 769) keep the same sheet model — width steps only.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled, hide the inert
  toggle and expose the single five-link tree, permanent action, contact
  cluster, and social destinations in a usable stacked layout under the bar
  (`ren-sheet:not(:defined)` shows children as static content).
- Never author static `aria-hidden="true"` on the PE-visible panel content.

## Rejected mappings

- No full under-bar overlay (Navbar 16) — source is a right-edge sheet.
- No permanent horizontal desktop links (default `ren-nav` desktop tree).
- No `ren-card`, `ren-menu`, `ren-popover`, `ren-collapsible`, or mega pattern.
- No invented panel footer CTA from the unused source button field.
- No nested `nav`, fake role buttons, duplicate close hamburger, fourth bar
  line, or copied Relume assets/icons.
