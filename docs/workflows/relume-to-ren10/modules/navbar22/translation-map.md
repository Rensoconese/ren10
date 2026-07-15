# Relume to RenDS Translation Map — Navbar 22

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
- `components/primitives/ren-field/component.md`
- `components/primitives/ren-checkbox/component.md`

## RenDS mapping

| Reference part | Ren10 mapping | Preserved behavior / deliberate correction |
| --- | --- | --- |
| Sticky logo / center bar / end toggle shell | one `<ren-nav>` containing one `<nav class="ren-nav ren-nav-sticky">` | One primary landmark; sticky bar chrome is block styling, not a second nav |
| Four desktop bar entries | one `ul.ren-nav-links` (desktop-visible) | Three links plus one native disclosure; never duplicated for mobile |
| Fake dropdown trigger | native `details.rn22-disclosure > summary` | Keyboard activation by default; one authored `.rn22-chevron` |
| Three title-only destinations | three whole `a.rn22-destination` anchors | Compact flat menu; no invented icons/groups/descriptions |
| Always-visible menu toggle | named `.ren-nav-toggle` controlling the overlay (`aria-controls`) | Visible at every width; expanded state owns fullscreen panel |
| Full-viewport overlay | `.rn22-overlay` as `role="dialog"` + `aria-modal` region inside the preview root | Not a nested `<nav>` landmark; large links are a list, not a second primary tree |
| Eight large destinations | `ul.rn22-menu-links` with eight `a.rn22-menu-link` | Grid via `ren-grid` / block CSS at wider widths; stack on small |
| Contact form | native `<form>` + `<ren-field>` + `.ren-input` + `.ren-checkbox` + `.ren-btn` | Name, email, message, terms, submit; progressive enhancement |
| Contact details + five socials | address block + named social anchors with simple icons | Accessible names required; no brand package dependency |

## Interaction policy

- Use the established 48rem Ren10 boundary for desktop bar visibility and
  dropdown hover; do not preserve framework `lg` / 991px constants.
- Desktop pointer hover previews the bar disclosure across a stable
  trigger-to-panel corridor; pointer click pins; second click closes.
- Native Enter/Space activation remains available on the summary.
- Escape closes the open disclosure (focus summary) and the open overlay
  (focus toggle), in that priority when both could apply.
- Outside click, destination activation, overlay close, and breakpoint
  crossing also close the disclosure.
- Overlay is activation-only (toggle); hover never opens the fullscreen panel.
- When the overlay is open, background page content is inert for pointer and
  the dialog is the interaction surface.

## Cascade risks

- Neutralize Primitive Zero `details` border/padding/margin, summary marker,
  generated `summary::after`, and open-state divider.
- Exactly one `.rn22-chevron`; no native or generated duplicate.
- Force desktop bar links always visible at ≥48rem and always hidden below,
  regardless of `ren-nav` `[data-open]` / toggle expanded state (toggle owns the
  overlay, not an under-bar mobile tree).
- Force `.ren-nav-toggle` visible at every width (override pattern’s mobile-only
  display).
- Sticky bar and toggle must stack above the overlay; overlay must not trap the
  toggle under an opaque layer without a usable close control.
- Fullscreen panel must not create nested `nav` landmarks or duplicate chevrons.
- Form fields must use Ren10 field chrome; avoid bare unlabelled inputs.
- Overlay open state must not leave horizontal overflow on the preview root.

## Responsive adaptation

- At and above 48rem: sticky horizontal shell; logo start; centered four-entry
  bar tree; toggle end; absolute narrow bar dropdown; fullscreen overlay on
  toggle with two-column large-link grid + contact rail.
- Below 48rem: logo + toggle only in the bar; no under-bar ren-nav link list;
  fullscreen overlay stacks large links, contact rail, details/socials.
- No duplicate desktop/mobile copy of the bar tree.

## Progressive enhancement

- Before custom-element upgrade and with JavaScript disabled: hide the inert
  toggle; keep the single desktop bar tree usable at wide widths; expose the
  eight large destinations, contact form, details, and socials in normal flow
  so the contact menu remains reachable without the overlay controller.

## Rejected mappings

- No `ren-card` for the overlay chrome (not a card content surface).
- No `ren-menu` / `ren-popover` for the bar dropdown (native disclosure is the
  semantic baseline).
- No `ren-sheet` side drawer (source is full-viewport, not a side sheet).
- No second primary `nav` landmark inside the overlay.
- No under-bar mobile collapse of the four bar links (source uses the overlay
  as the mobile navigation surface).
- No invented mega-menu cards, icon destination rails, or permanent bar CTAs.
- No framework components, Shadow DOM, or copied Relume assets.
