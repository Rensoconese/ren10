# Relume to RenDS Translation Map — Navbar 25

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
- `components/primitives/ren-badge/component.md` (demo chrome only)

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Full-width logo-left / links / end-actions shell | one `<ren-nav>` containing one `<nav class="ren-nav">` | One landmark and one tree across all widths; full bar chrome, not floating card |
| Four top entries | one `ul.ren-nav-links` | Three plain `a.ren-nav-link` plus one native mega disclosure |
| Fake mega trigger | native `details.rn25-disclosure > summary` | Keyboard activation by default; one authored `.rn25-chevron` |
| Two category groups × five title-only links | two `.rn25-group` with `a.rn25-destination` | Preserve flat title-only destinations; no icons or descriptions |
| Promo title / description / CTA / square media | `.rn25-promo` with `a.rn25-promo-cta` + `.rn25-promo-media.ren-frame` | Real CTA control; non-interactive square media (no nested button-in-anchor) |
| Unused default sublink array | **omitted** | Not rendered in source; do not invent |
| Duplicated desktop/mobile action mounts | single `.ren-nav-actions` cluster | Desktop end chrome; mobile stacked full-width inside open shell only |
| Mobile toggle | named `.ren-nav-toggle` button | Expanded/controls state owned by `ren-nav` |
| Full-width mega surface | `.rn25-panel` absolute under bar on desktop | Mobile returns to normal flow |

## Interaction policy

- Shell boundary follows ren-nav (`max-width: 48rem` mobile). Block desktop CSS/JS
  uses `min-width: 48.01rem` so 768px remains activation-only mobile and 769px is
  desktop — do not preserve the source 991px / `lg` split.
- Desktop pointer hover previews across a stable trigger-to-panel corridor.
- Pointer click pins the preview; a second click closes it.
- Native Enter/Space activation remains available.
- Escape closes and focuses summary (including when focus is on a destination).
- Outside click, destination activation (category links, promo CTA, header
  actions via outside-containment), mobile-shell close, and breakpoint crossing
  also close the disclosure.
- Mobile is activation-only; hover never governs its state.
- Same-breakpoint resize within the desktop band keeps an open mega stable.

## Cascade risks

- Neutralize Primitive Zero `details` border/padding/margin, summary marker,
  generated `summary::after`, and open-state divider.
- Exactly one `.rn25-chevron`; no native or generated duplicate.
- Desktop panel is absolute, full-band under the bar, without clipping
  (`overflow: visible` on preview / nav). Hover corridor via panel
  `::before` bridge.
- Mobile closed: only logo + toggle in the permanent top row. Actions must not
  remain visible as top-row chrome.
- Mobile open: links then stacked full-width actions; mega expands in flow.
- Promo sunken surface must not force horizontal overflow at 320/340.
- No nested `nav` landmarks.

## Responsive adaptation

- At and above 48.01rem: full-width horizontal shell; logo start; four entries;
  two end actions; full-band absolute mega with categories (2-up groups) beside
  promo (copy + square media).
- Below that (through ren-nav mobile including 768): top row logo + toggle only;
  one in-flow tree; full-width stacked links; two full-width stacked actions
  inside the open shell; in-flow mega stacking categories then promo.
- No duplicate desktop/mobile link tree and no viewport-height arithmetic.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled, the inert toggle
  is hidden and the single navigation tree, both actions, and native disclosure
  remain visible and usable.

## Rejected mappings

- No `ren-card` for category destinations or the mega surface (navigation
  chrome, not content cards).
- No `ren-menu`, `ren-popover`, or `ren-collapsible`: native disclosure is the
  semantic baseline.
- No invented unused sublink row, social row, footer band, product price cards,
  or icon-leading destinations.
- No second mobile link list; no fake role-button trigger; no framework code;
  no copied Relume assets.
