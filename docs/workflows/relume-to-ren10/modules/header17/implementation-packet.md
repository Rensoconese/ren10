# Header17 Implementation Packet

Implement `templates/blocks/hero-split-copy-dual-cta-landscape-lightbox.html` and `tests/components/header17-header.spec.cjs` only after recording real RED.

Preserve the source-derived anatomy in `reference-brief.md`: content-height container; responsive h1/support split; exactly two CTA destinations; one full-width landscape image trigger; one scrim/play affordance; one `ren-dialog` loader-to-single-iframe/video flow; 738px medium and 940px large aspect-video stage. Provide native no-JavaScript fallback, light/dark AA, reduced motion, 44px targets, focus trap/restore, Escape/backdrop/close, and no overflow at 320/390/767/768/1280.

Use vanilla Light DOM and documented Ren10 APIs only. Inline behavior must be `type="module"`, select the Header17 root once, and scope every descendant query to that root. Do not add form/nav/logo/background video/third CTA/duplicate trigger or dialog; do not copy Relume source/dependencies/assets; do not modify catalogs, inventory, core tokens, components, or unrelated files.
