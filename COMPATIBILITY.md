# Browser compatibility

RenDS is vanilla HTML/CSS/JS. Current Chromium, Firefox, and WebKit releases are
tested in CI; Chromium/Linux is the visual baseline. CSS Anchor Positioning,
popover, and container queries progressively enhance components: unsupported
browsers retain the JS positioning and native dialog/menu fallbacks. Provide a
`<noscript>` or server-rendered content for critical workflows.
