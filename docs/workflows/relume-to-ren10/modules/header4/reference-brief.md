# Reference Brief — Header 4

## Retrieval metadata

- Family: `headers`
- Module ID: `header4`
- Retrieved through: Relume OAuth MCP (`relume_oauth__search_components` query
  `Header4` + `relume_oauth__get_component` slug `header4`, primitives
  `names-only`)
- Retrieved at: 2026-07-15
- Source variants returned: one React section (`Header4` / slug `header4`) under
  hero-header-sections; tags: 2 Columns, Image/Video Right, Text Align Left,
  Form, Video Lightbox, Hero Header Section
- Supporting files returned: primitive names only (`utils`, `button`, `dialog`,
  `input`) — full primitive source not stored
- Preview URL (MCP search only, not stored as asset): section header4 preview
  image on Relume CDN

## Retrieved facts

Sanitized structural facts from the complete returned source (no proprietary
copy, classes, URLs, or assets persisted below):

- **Role:** Hero header section (not a navigation bar).
- **Section shell:** Full-width section with horizontal padding and vertical
  section padding that scales up at medium and large breakpoints.
- **Inner container:** Constrained content width.
- **Layout:** Two regions in one responsive grid:
  1. **Copy + form column** (text left-aligned)
  2. **Media column** (image / video affordance on the right at large widths)
- **Copy column anatomy (order):**
  1. One primary heading (`h1`)
  2. One supporting description paragraph
  3. One email capture form (max-width constrained)
  4. One terms / legal line under the form that includes an inline text link
- **Form anatomy:**
  - One email text field (type email) with placeholder
  - One primary submit CTA (single action button — count: **1**)
  - At narrow widths the field and button stack; from a small breakpoint they
    sit in one row: field grows, button is max-content width
  - Submit handler is client-side (prevent default + log) in the reference
- **Media column anatomy:**
  - One full-width media trigger control (button)
  - Poster image covering the trigger
  - Darkened overlay over the poster
  - Centered play-circle icon on the overlay
  - Rounded image treatment on the media surface
- **Video lightbox behavior:**
  - Trigger opens a modal dialog
  - Dialog body hosts an iframe for embedded video
  - While the iframe has not loaded, a centered spinning progress indicator is
    shown; after load the iframe becomes visible and the spinner is suppressed
  - Iframe allows autoplay / encrypted-media / picture-in-picture and fullscreen
- **CTA count:** **1** (the form submit button). No secondary CTA in the copy
  column. The media play control is a separate non-CTA media disclosure, not a
  second marketing button.
- **Media placement:** Right of copy at large two-column layout; below copy when
  the grid stacks to one column.
- **No brand / logo / navigation** inside the section itself.
- **No dropdowns, menus, or mobile nav toggle.**

## Responsive states

### Desktop (large, two-column)

- Grid becomes two equal columns with large horizontal gap; columns are
  vertically centered.
- Copy left, video poster right.
- Form field + submit sit on one horizontal row (field flexible, button content-sized).

### Tablet / medium

- Vertical section padding increases vs mobile.
- Form may already be horizontal (sm+ in source); full two-column split is
  gated to the large breakpoint.
- Until the large breakpoint, the media region stacks under the copy region
  with increased vertical gap.

### Mobile (narrow)

- Single column: copy + form first, media second.
- Form stacks: email full width, then submit full width.
- Section padding is the smallest vertical rhythm.
- Touch targets must remain usable; media trigger is full width of the content.

### Width matrix used by Ren10 acceptance

- 320, 390, 767, 768, 1280 — geometry and overflow checks at these widths
  (Ren10 suite convention; source does not name these pixel values).

## Interaction states

| State | Verified behavior |
| --- | --- |
| Default | Section static; dialog closed; form empty |
| Form submit | Prevented default submit; demo may retain values |
| Media trigger activate | Opens dialog lightbox |
| Dialog open / loading | Spinner visible until iframe load event |
| Dialog open / loaded | Iframe visible; spinner hidden |
| Dialog dismiss | Escape and backdrop close (dialog primitive); play control remains |
| Focus | Trigger and form controls are keyboard reachable |
| Hover-only open | Not present — open is activation-driven |
| Disabled / error | Not present in source beyond native email validity |

## Visual relationships

**Source-derived:**

- Two-column hero with text/form left and media right at large widths.
- Media is a rounded, full-width poster with a centered play glyph and dimming
  overlay.
- Form is narrower than the copy column (max-width constraint on the form
  wrapper).
- One primary CTA only.
- Terms line uses smaller type than the description.

**Labeled inference (Ren10, not Relume tokens):**

- Heading uses display scale tokens; description uses body scale.
- Poster uses 16:9 aspect via `ren-frame` / video frame.
- Overlay uses semantic overlay / surface tokens, not hardcoded chroma.
- Play control meets ≥44×44 touch target (icon may be larger).

**Unavailable:** Exact Relume token values, pixel spacing table, proprietary
poster asset dimensions, and rendered MCP screenshots (preview URL only).

## Unavailable evidence

- Primitive file bodies were requested as `names-only` and are not stored.
- Live Relume rendered HTML preview was not captured into the repo.
- Exact Tailwind spacing numbers and proprietary default strings/URLs are
  excluded from public packet artifacts (sanitized only).

## Public-output exclusions

Must not appear in Ren10 public output:

- Relume product/module marketing names beyond internal packet ids
- Relume class names, React/Motion/Tailwind source, or dependency imports
  (`@radix-ui/*`, `relume-icons`, `clsx`, etc.)
- Copied proprietary heading/description/placeholder/button copy
- Copied YouTube / CloudFront / placeholder image URLs from the reference
- Shadow DOM, framework abstractions (React, Vue, Svelte, JSX/TSX, shadcn)
- Primitive palette tokens and hardcoded non-grayscale chromatic colors in
  block CSS
