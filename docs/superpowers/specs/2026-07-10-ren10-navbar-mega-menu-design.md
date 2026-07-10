# Ren10 Navbar Mega Menu — Design

Date: 2026-07-10  
Status: Ready for user review

## Objective

Add the second Ren10 navigation block: a standalone, copyable mega-menu navbar
built with RenDS contracts and vanilla HTML/CSS/JS. The private structural
research input is Relume `navbar5`; the public result is a Ren10-owned
interpretation and must not expose Relume names, React, Motion, Tailwind, copied
class names, copied content, or external UI dependencies.

This task adds a block example. It does not add or change a RenDS component API.

## Why This Variant Comes First

The Relume navbar family contains 32 modules. The existing Ren10 Navbar Drawer
covers the desktop-hamburger/drawer branch. `navbar5` is the smallest useful
mega-menu baseline that still exercises the important anatomy:

- brand, primary links, and two actions;
- grouped destination links;
- two featured content cards;
- one responsive navigation tree rather than duplicated desktop/mobile trees.

Later navbar variants can reuse this structural decision while changing group
count, featured content, imagery, alignment, newsletter, or CTA regions.

## Alternatives Considered

### A. Native disclosure inside `ren-nav` — selected

Use the `ren-nav` pattern for the navbar shell/mobile toggle and a native
`details`/`summary` disclosure for the rich mega panel. Add a small block-local
controller only for Escape, outside-click, focus return, and link-close.

Benefits:

- one DOM tree across desktop and mobile;
- usable before JavaScript upgrades;
- native keyboard activation and disclosure semantics;
- rich panel content is not forced into command-menu roles;
- no core RenDS API changes.

### B. `ren-nav` popover dropdown

This follows the existing `data-dropdown` API, but the panel enters the top
layer. That is useful for small dropdowns and awkward for a full-width panel
that must become in-flow content inside the mobile menu.

### C. `ren-popover` or `ren-menu`

`ren-popover` could carry rich content but repeats the same mobile top-layer
problem. `ren-menu` is rejected because grouped navigation links and article
cards are not imperative `menuitem` commands.

## Files

Create:

- `templates/blocks/nav-mega-menu.html`
- `tests/components/blocks-navigation.spec.cjs`

Modify:

- `templates/blocks/index.html`

No component, token, registry, package, or workflow file changes are expected.

## Public Block Anatomy

The standalone page follows the existing block-demo shell:

1. Docs navbar and breadcrumb.
2. Page heading explaining the Ren10 composition.
3. Framed preview containing:
   - `<ren-nav>` host;
   - real `<nav class="ren-nav" aria-label="Example site">`;
   - brand anchor;
   - one `<ul class="ren-nav-links">` shared by all widths;
   - ordinary navigation anchors;
   - one native mega-menu disclosure;
   - two navigation CTAs;
   - the canonical `.ren-nav-toggle` button;
   - a quiet hero surface below the navbar so overlay and stacking behavior are
     visible.

The mega panel contains:

- two link groups with four destinations each;
- every destination as a real anchor with a decorative inline SVG;
- a featured region with two article anchors;
- article image, category, title, short description, and textual “Read” cue;
- one “View all insights” anchor outside the cards.

No anchor contains a button or another anchor.

## RenDS Mapping

- Navbar behavior and responsive shell: `ren-nav` pattern.
- Page/block structure: `ren-stack`, `ren-stack-sm`, `ren-row`,
  `ren-row-spread`, `ren-cluster`, `ren-grid`, and `ren-center-wide` where their
  public behavior fits.
- CTAs: real anchors with `.ren-btn` only where the destination is presented as
  a primary action.
- Navigation destinations: `.ren-nav-link` or `.ren-link-nav` according to
  placement; never button styling for plain navigation.
- Featured content: semantic `article` inside a single enclosing anchor with
  block-local card styling. `.ren-card` is not forced onto the link because its
  canonical markup expects internal card regions that do not improve this
  compact composition.
- Icons: `.ren-icon` wrappers with decorative SVGs using `currentColor`.
- Images: local/demo-safe gradients or existing repository assets; no Relume
  image URLs or copied alt text.
- Values: semantic/component tokens only; no primitive palette tokens, hex, or
  non-grayscale rgba.

## Disclosure And Interaction

The disclosure is `<details class="rbm-disclosure">` with a
`<summary class="ren-nav-link">Solutions</summary>` and a sibling rich panel.

Native behavior owns click, Enter, and Space. Block-local JavaScript may only:

- close the disclosure on Escape and return focus to the summary;
- close it when focus/click moves outside the disclosure;
- close it after a destination is activated;
- close it when the mobile navigation itself closes or crosses to desktop;
- keep a single listener set if the block is initialized more than once.

The script must not implement hover-only opening, focus trapping, roving
tabindex, client routing, or duplicated menu state. With JavaScript disabled,
the summary remains operable and all destinations remain regular links.

## Responsive Design

The breakpoint aligns with the `ren-nav` contract at `48rem`.

Desktop:

- navbar is a horizontal brand / links / actions composition;
- mega panel is positioned beneath the navbar and spans the preview width;
- grouped links occupy the main region and featured articles occupy the
  secondary region;
- opening is click/keyboard driven, not hover-only.

Mobile:

- the canonical hamburger opens the existing `.ren-nav-links` tree;
- actions move into the same expanded navigation region without creating a
  second copy;
- mega content becomes static/in-flow under its summary;
- link groups and featured articles collapse to one column;
- content scrolls inside the page naturally; no fixed `100dvh` duplicate panel.

## Accessibility

- Preserve one labelled `nav` landmark and list semantics for primary links.
- `.ren-nav-toggle` has `type="button"`, accessible label, `aria-expanded`, and
  `aria-controls` pointing to the real links list.
- `summary` provides the disclosure name and native keyboard operation.
- All destinations are real anchors with visible `:focus-visible` treatment.
- Decorative SVGs use `aria-hidden="true"` and `focusable="false"`.
- Featured images have meaningful original alt text or empty alt when the
  adjacent title carries the same information.
- Touch targets remain at least 44×44 on touch-capable layouts.
- Motion uses semantic RenDS durations and collapses under
  `prefers-reduced-motion`; no Motion library is used.
- Escape closes only the open disclosure/mobile nav and restores a predictable
  focus target.

## Visual Direction

The block should feel related to Navbar Drawer without copying its composition:

- neutral raised surface and restrained border/shadow;
- strong typographic hierarchy instead of decorative gradients;
- small monochrome icons;
- featured cards provide the visual weight;
- light and dark themes remain equally legible.

Content uses a new fictional product context and original wording. It does not
reuse the source library's labels, descriptions, images, or URLs.

## Error And Fallback Behavior

- If custom elements have not upgraded, navigation, details, links, and content
  remain visible and usable.
- If `showPopover` is unavailable, nothing changes because the selected design
  does not require it.
- Missing images must not collapse card labels or interactive targets.
- Repeated initialization aborts/replaces its previous listener controller.
- The script silently returns when the block root or summary is absent; the
  native HTML remains the fallback.

## Testing

`tests/components/blocks-navigation.spec.cjs` adds targeted browser coverage:

- catalog links to the new block and both pages load without console/page
  errors;
- exactly one primary links tree exists;
- summary opens by click and keyboard;
- Escape closes and restores focus;
- outside click and destination activation close the disclosure;
- mobile toggle updates `aria-expanded` and exposes the same tree;
- viewport checks at desktop and mobile show no overlap or horizontal scroll;
- every visible interactive target is at least 44×44 in a touch context;
- reduced-motion mode has no nonzero block-local transition/animation;
- axe reports no WCAG 2.1 AA violations;
- light and dark computed surfaces/text remain resolved through RenDS tokens.

Repository validation also runs `npm run lint`, `npm run agent:check`, focused
component tests, and the AGENTS.md contract-count/stale-reference checks.

## Acceptance Criteria

- `templates/blocks/nav-mega-menu.html` is a standalone, copyable Ren10 block.
- The block catalog lists Navbar Drawer and Navbar Mega Menu under Navigation.
- Output contains no React/JSX/TSX, Tailwind, Motion, external icon package,
  source-library dependency, or copied source content.
- One navigation tree serves desktop and mobile.
- Disclosure, mobile toggle, focus, Escape, links, touch targets, and reduced
  motion meet the behavior above.
- No new RenDS public component API is introduced.
- Targeted and repository validation are green.

## Out Of Scope

- Implementing Navbar 6–32.
- Adding hover-to-open behavior.
- Changing `ren-nav` core behavior or selectors.
- Adding a generic mega-menu component.
- Forms, newsletter signup, authentication, routing, localization, or CMS data.
- Publishing, pushing, or changing the user's planning files.
