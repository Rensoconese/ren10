# Reference Brief — Header 2

## Retrieval metadata

- Family: headers (`hero-header-sections` in Relume catalog)
- Module ID: `header2` / catalog entry `header2` (also discovered as
  `section_header2` via targeted search)
- Retrieved through: authenticated Relume MCP
  (`relume_oauth__search_components` query `Header2` limit 5;
  `relume_oauth__get_component` slug `header2`, `primitives: include`)
- Retrieved at: 2026-07-15
- Deterministic order: isolated worktree worker for `header2` on branch
  `codex/header2`
- Source variants returned: one complete React section (`Header2`)
- Supporting files returned: three vendored primitives (`utils`/`cn`,
  `button`, `input`)

## Retrieved facts

- Hero header section (not a navigation bar). No logo row, no menu toggle,
  no primary destinations, no dropdowns, no sheet/drawer.
- Anatomy order (source tree): outer section → container → two-zone grid →
  (1) copy column, (2) media column.
- Copy column ownership: one primary heading (`h1`), one supporting description
  paragraph, then a constrained-width signup cluster.
- Signup cluster ownership: one native form with exactly one email text control
  and exactly one submit action control (single CTA). Below the form sits a
  terms/conditions prose node that includes one inline terms destination link.
- Media column ownership: one full-width image with cover object-fit and a
  rounded image treatment. Image is sibling of the copy column (not background
  media behind the copy).
- CTA count: **one** (form submit button only). No secondary button pair.
- Form behavior: controlled email value; submit handler prevents default and
  logs the email locally (demo, not network). Placeholder text on the email
  control; button carries a title string via the button props object.
- Layout intent: single column by default; two equal columns with vertical
  centering at the large breakpoint (`lg:grid-cols-2 lg:items-center`).
  Vertical section padding steps up across md/lg utility bands. Horizontal
  section padding uses a percent-based inset. Grid column gap is large on the
  horizontal axis relative to the vertical gap.
- Form internal layout: single column by default; from the small breakpoint the
  form becomes a two-track row of flexible email field + max-content button
  (`sm:grid-cols-[1fr_max-content]`). Form max width is constrained
  (`max-w-sm`).
- No open/closed disclosure surface, no hover mega panel, no modal, no motion
  library usage in the section source.

## Responsive states

- Mobile / narrow: single stacked column — copy (heading, description, form,
  terms) first, media second. Form fields stack (email above button).
- Tablet / mid: still predominantly single-column until the large band; form
  row may already sit email+button side by side from the small band.
- Desktop / large: two-column grid, copy start-aligned left zone, media in the
  end zone, columns vertically centered relative to each other. Form remains
  constrained width inside the copy column (not full grid width).
- Exact utility-to-pixel breakpoint resolution and rendered screenshot proof
  were not returned as authoritative visual evidence.

## Interaction states

- Default: form empty, media visible, no expanded surfaces.
- Email field: standard focus / type / validation affordances of a text input.
- Submit: preventDefault + local console log of email value (demo only).
- Terms link: ordinary in-page/hash destination; no modal.
- No hover-only navigation corridor, no open menu state, no Escape trap, no
  reduced-motion branch in the section source.

## Visual relationships

- Source-derived: media is a peer column, not a background layer.
- Source-derived: heading is the largest type in the block; description is
  medium body; terms prose is tiny relative to both.
- Source-derived: signup cluster is narrower than the copy column
  (`max-w-sm`).
- Source-derived: generous horizontal gap between columns on large widths
  relative to vertical stack gap on small widths.
- Exact resolved font metrics, image aspect, and spacing pixels were not
  returned as authoritative screenshots.

## Source accessibility and semantic defects

- Generic `<section>` root without a named landmark label.
- Email input has an `id` but the source does not author a visible `<label>`
  bound to it (placeholder-only labeling).
- Terms markup is injected via `dangerouslySetInnerHTML` rather than composed
  elements.
- No progressive-enhancement story beyond native form controls (acceptable for
  a static hero, but labels and landmarks need Ren10 correction).
- No reduced-motion handling (no section animations present either).

## Dependencies and assets

- React client component, Tailwind utilities, Radix Slot (button), CVA, clsx,
  tailwind-merge.
- One placeholder image URL on a CDN.
- Button and Input primitives vendored by MCP (framework abstractions).
- No source dependency, class string, copy, URL, SVG path, duration, easing,
  breakpoint constant, or placeholder asset is eligible for Ren10 output.

## Unavailable evidence

- MCP returned metadata, complete section source, and primitive source but no
  authoritative rendered screenshot of Header2 in this retrieval.
- Exact resolved framework breakpoint pixel values beyond the utility class
  names present in source, runtime typography metrics, and motion timing were
  not treated as authoritative visual evidence.

## Public-output exclusions

- Exclude all source text, URLs, images, class strings, SVG paths, React code,
  framework dependencies, raw durations/easing, and source breakpoint constants.
  Demo copy and media in Ren10 must be original.
