# Relume to RenDS Translation Map — Navbar 19

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- `components/patterns/ren-nav/pattern.md`
- `components/primitives/ren-button/component.md`
- `components/primitives/ren-link/component.md`
- `components/primitives/ren-icon/component.md`
- `components/primitives/ren-badge/component.md`
- `components/primitives/ren-breadcrumb/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Full-width logo / center bar / always-visible toggle shell | one `<ren-nav>` containing one `<nav class="ren-nav">` | One landmark; toggle remains visible at every width via block CSS override of default mobile-only toggle |
| Four desktop bar entries | one `ul.ren-nav-links` owned by the bar | Three plain `.ren-nav-link` anchors plus one native disclosure |
| Fake dropdown trigger + chevron | `details.rn19-disclosure > summary` with one authored `.rn19-chevron` | Keyboard activation by default; neutralize classless marker/`::after` |
| Three title-only destinations | three whole `a.rn19-destination` anchors | No icons, groups, descriptions, or cards |
| Full-viewport site panel | `#rn19-site-panel.rn19-site-panel` controlled by the named toggle (`aria-controls`) | Panel is a region inside the single landmark, not a second nav; opens at every width |
| Eight large panel destinations | eight `a.rn19-primary-link` | Heavy type weight; dense multi-column grid at wider widths |
| Four titled columns × five links | four `.rn19-column` groups with five `a.rn19-column-link` each | Preserve column count and per-column link count |
| Contact cluster | phone + email anchors + location text in `.rn19-contact` | Real `tel:` / `mailto:` semantics with neutral demo values |
| Five social links | five `a.rn19-social` with accessible names and simple geometric icons | No brand SVG paths from the source icon pack |
| Hamburger / close morph | standard `.ren-nav-toggle` three-span affordance | One close icon owner; no duplicate mobile chrome |

## Interaction policy

- Use the established 48rem Ren10 boundary for desktop bar visibility, absolute
  dropdown geometry, and hover preview. Do not preserve dual source breakpoints.
- Desktop pointer hover previews the dropdown across a stable trigger-to-panel
  corridor. Pointer click pins; second click closes.
- Native Enter/Space on summary remains available.
- Escape closes the open disclosure and returns focus to the summary. Escape
  also closes the site panel and returns focus to the toggle when the panel owns
  the expanded state.
- Outside activation, destination activation, and breakpoint crossing close the
  disclosure. Site-panel destinations and outside clicks close the panel.
- Site-panel open state is owned by the block controller through public DOM/ARIA
  only (`aria-expanded` on `.ren-nav-toggle`, `data-open` on `ren-nav` and the
  panel). Private ren-nav fields are never read or written.
- Same-band resizes inside the desktop or mobile band preserve panel state;
  only a 48rem band cross closes panel and disclosure.
- Mobile never uses hover to open the dropdown or the site panel.
- When the site panel is open on desktop, the centered bar row is hidden
  (source function). On narrow viewports the bar row stays closed chrome and
  the site panel is the navigable catalog.

## Cascade risks

- Force `.ren-nav-toggle { display: flex }` at all widths; default ren-nav CSS
  hides it above 48rem.
- Neutralize Primitive Zero `details` border/padding/margin, summary marker,
  generated `summary::after`, and open-state divider.
- Exactly one `.rn19-chevron`; no native or generated duplicate.
- Desktop dropdown is absolute, narrow, and aligned beneath its trigger without
  clipping; mobile/in-panel disclosures (if any) stay in flow — this module keeps
  the dropdown only on the desktop bar row.
- Site panel must not create a nested `nav` landmark.
- ren-nav `[data-open]` rules that reveal `.ren-nav-links` on narrow viewports
  must be overridden so mobile open state shows the site panel, not a second
  four-link list.
- Overflow on the preview root must not clip the absolute desktop dropdown or
  the full-width site panel.

## Responsive adaptation

- At and above 48rem: horizontal bar with logo start, centered four-entry row,
  always-visible toggle end; absolute dropdown; full-width site panel under the
  bar when open; bar row hidden while panel open.
- Below 48rem: top row is logo + toggle only; site panel is the open catalog
  (large links, columns, contact, socials); bar four-entry row is not a
  separate mobile clone.
- No raw `100vh - bar` contract; use available block space with internal scroll
  if content exceeds the preview.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled: hide the inert
  toggle, keep the single landmark, expose the site-panel catalog, and keep the
  native disclosure usable. Desktop still shows the four bar entries.

## Rejected mappings

- No `ren-card`, `ren-menu`, `ren-popover`, or `ren-collapsible` for the site
  panel or dropdown — native disclosure + controlled region is the semantic
  baseline.
- No second `nav` landmark inside the panel or dropdown.
- No permanent top-row CTA buttons (source has none).
- No mobile-only-only toggle (source toggle is always present).
- No invented submenu content, brand SVG paths, framework components, or copied
  Relume assets/text/URLs.
