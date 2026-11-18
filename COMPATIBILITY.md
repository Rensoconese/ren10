# Browser compatibility

RenDS is vanilla HTML/CSS/JS. Current Chromium, Firefox, and WebKit releases are
tested in CI; Chromium/Linux is the visual baseline. CSS Anchor Positioning,
popover, and container queries progressively enhance components: unsupported
browsers retain the JS positioning and native dialog/menu fallbacks. Provide a
`<noscript>` or server-rendered content for critical workflows.

## Known engine limits

- Anchored overlays (`ren-popover`, `ren-tooltip`, `ren-hover-card`,
  `ren-date-picker`, `ren-date-range-picker`, `ren-color-picker`) flip to the
  other side of their trigger through CSS `position-try-fallbacks`. WebKit 26.4
  does not apply that flip at the bottom edge of a page that has scrolled: an
  overlay with no room under its trigger opens below the fold there (a picker
  that takes focus scrolls the page to itself). WebKit 26.6, Chromium and
  Firefox flip it. `tests/components/overlay-flip.spec.cjs` probes the engine
  with a bare anchored box and skips the flip assertion, with this reason,
  where the engine does not flip.

