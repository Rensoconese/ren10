# Reference Brief — Header 6

## Retrieval metadata

- Family: headers (`hero-header-sections` in the Relume catalog)
- Module ID: `header6`
- Retrieved through: authenticated Relume OAuth MCP using
  `node /tmp/relume-fetch.mjs header6`, which calls
  `get_component(slug="header6", primitives="names-only")`
- Retrieved at: 2026-07-15
- Complete raw-response SHA-256: `67e3adfe39f79ddc2dca3568503cae6720719fbd7257a092b949bfa169dae4f0`
- Source variants returned: one complete client React section (`Header6`)
- Supporting primitive names returned: `utils`, `button`, `input`

## Retrieved facts

The following is the sanitized complete source evidence.

- Root anatomy: relative section; foreground container; viewport-minimum-height
  vertically centered copy; separate absolute full-inset background layer.
- Copy anatomy and order: one heading, one description, one constrained form
  region, then one legal/terms line.
- Form anatomy: exactly one email input and exactly one submit button. The source
  input has an id, email type, placeholder, controlled value, and change handler.
  The source form prevents default and records the email value; there is no
  remote endpoint or success/error UI.
- Legal anatomy: one short confirmation line containing one terms-and-conditions
  anchor. The source injects this string as HTML; Ren10 must replace that with
  explicit semantic markup.
- Background anatomy: exactly one full-bleed cover image and one full-inset dark
  neutral scrim at half opacity.
- Absent: nav, logo, brand row, second CTA, secondary image, video, disclosure,
  dialog, carousel, social proof, or form fields other than email.
- Source dependencies are client React state, Tailwind utilities, Button and
  Input framework primitives, class utilities, and their transitive packages.

## Responsive states

- Mobile/narrow: viewport-height hero; constrained left copy; email input and
  submit button stack in one column with a small vertical gap.
- Small and wider: the form becomes a two-column input-plus-max-content submit
  row with a larger inline gap.
- Tablet/desktop: the same order and ownership remain; section vertical padding
  increases at source medium and large bands. Copy stays constrained and left
  aligned while remaining vertically centered.
- Background image and scrim cover the full section at every width.

## Interaction states

- Native email focus, invalid, and submit behavior are the only interaction.
- Source submission prevents navigation and logs the controlled email value.
- No loading, disabled, open/closed, animation, or remote success/error state is
  authored by the source.

## Visual relationships

- Source-derived: white copy and form/legal region sit over a dark scrim and
  full-bleed cover image.
- Source-derived: heading is dominant; description is medium body; legal copy
  is tiny and subordinate.
- Source-derived: form width is narrower than the copy column; at wider widths
  the email field grows and the submit control remains intrinsic width.
- Source-derived: copy is substantially narrower than the viewport and is
  vertically centered.
- Exact rendered pixels, screenshot proof, and resolved framework token values
  were not returned.

## Source accessibility and semantic corrections

- Source input has no visible label; Ren10 must add exactly one visible label.
- Source terms markup is injected HTML; Ren10 uses a real paragraph and anchor.
- Source form has no action fallback and prevents default; Ren10 supplies a real
  no-JavaScript GET destination while enhancing successful submission locally.
- Source image alt is placeholder-oriented; Ren10 treats the atmospheric cover
  as decorative because the hero message already names the purpose.
- Input/button focus, 44px targets, invalid behavior, and scrim contrast require
  verification after translation.

## Unavailable evidence

- The MCP returned complete source and primitive names but no authoritative
  rendered screenshot, resolved framework token values, or stored source assets.
- Exact runtime pixel metrics and framework breakpoint pixels are therefore not
  asserted as authoritative; only source-visible relationships are preserved.

## Public-output exclusions

- Exclude source copy, placeholder/CDN URLs, image, injected HTML string, React,
  TSX, Tailwind classes, state code, console logging, framework dependencies,
  source breakpoint constants, and primitive implementation details.
