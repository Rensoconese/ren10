# Relume to RenDS Translation Map — Navbar 11

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

## RenDS mapping

- One `<ren-nav>` and one `<nav class="ren-nav">` own one responsive `ul.ren-nav-links` tree.
- Preserve four top-level entries: three real anchors and one native `details/summary` disclosure.
- Preserve exactly four rich dropdown destinations as real anchors. Each composes `ren-row`, a `ren-icon` wrapper, and a shallow `ren-stack-xs` text group.
- Preserve two action links using RenDS button styling and one correctly named `.ren-nav-toggle`.
- Author exactly one chevron in the dropdown summary; neutralize the classless summary marker and generated pseudo-chevron.
- Use semantic/component tokens for the panel surface, border, radius, shadow, type, spacing, motion, and elevation.
- Do not use `ren-card`: its contract explicitly excludes popover/navigation surfaces even though the Relume source used a Card primitive as visual chrome.

## Cascade risks

- Primitive Zero adds native `details`, `summary`, marker, border, margin, padding, and `summary::after` styles; reset all of them locally.
- `ren-nav.css` hides the link tree at its mobile breakpoint and owns toggle state. Block CSS must preserve one tree and avoid a second desktop/mobile copy.
- `.ren-nav-link` is normally an anchor; the summary must match peer height, center alignment, padding, and focus treatment without duplicate markers.
- The desktop dropdown must be positioned relative to the navigation bar without clipping by the preview shell.
- Mobile actions need one separator only; inherited borders or pseudo-elements must not create a double rule.
- Icon SVGs must size through `ren-icon`, use `currentColor`, and carry no inline width/height or copied source paths.

## Responsive adaptation

- Use Ren10's established 48rem navigation boundary for both layout and interaction policy, removing the source split between 991px and framework `lg`.
- At 48rem and above, render an absolute compact dropdown below the trigger and allow pointer hover preview.
- Below 48rem, keep the panel in flow, activation-only, full width, and part of the same navigation tree.
- Hide descriptions at small mobile widths and reveal them at an intermediate width while keeping all destination names available.
- Actions stack full width on mobile and return to a horizontal cluster on desktop.

## Progressive enhancement

- Native `details/summary` remains keyboard-operable without block JavaScript.
- With JavaScript disabled on mobile, hide the inert toggle and expose the one navigation tree, actions, and native dropdown.
- Enhancement adds desktop hover preview/click pinning, Escape with focus return, outside/destination close, mobile-shell coordination, and breakpoint reset.

## Rejected mappings

- Reject the source fake `role="button"` trigger; native summary provides click, Enter, and Space.
- Reject nested navigation landmarks; submenu destinations remain a labeled list inside the primary navigation.
- Reject `ren-card` as dropdown chrome because its component contract excludes popover behavior.
- Reject `ren-menu`: these are navigational destinations with title/description, not application commands.
- Reject duplicate mobile/desktop trees and framework/Motion dependencies.
- Reject separate 991px interaction and 1024px layout breakpoints.
