---
type: "RenDS CSS"
title: ren-popover.css
description: "RenDS CSS generated from the RenDS knowledge graph."
id: file:components/composites/ren-popover/ren-popover.css
sourcePath: components/composites/ren-popover/ren-popover.css
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - css
  - ren10
  - rends
---

# ren-popover.css

Source path: `components/composites/ren-popover/ren-popover.css`

## Relationships

_No outgoing relationships._

## Source Content

/* ═══ ANCHOR POSITIONING & BASE STYLES ═══ */
.ren-popover {
  position: absolute;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-4);
  max-width: 20rem;
  z-index: var(--z-popover, 1000);
  pointer-events: auto;
  margin: 0;
  inset: auto;
  border-top: none;

  /* Anchor positioning (modern browsers) */
  position-anchor: --popover-anchor;

  /* Default: below the trigger with automatic fallback */
  position-area: bottom span-all;

  /* Automatic flip when near viewport edges */
  position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;

  /* Enter/exit transitions driven by semantic motion tokens. */
  opacity: 0;
  transform: translateY(-4px) scale(0.95);
  transition:
    opacity   var(--duration-enter) var(--ease-enter),
    transform var(--duration-enter) var(--ease-enter),
    overlay   var(--duration-enter) var(--ease-enter) allow-discrete,
    display   var(--duration-enter) var(--ease-enter) allow-discrete;
}

/* ═══ POPOVER OPEN STATE ═══ */
.ren-popover:popover-open,
.ren-popover.ren-open {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ═══ POPOVER OPEN WITH @starting-style ═══ */
@starting-style {
  .ren-popover:popover-open {
    opacity: 0;
    transform: translateY(-4px) scale(0.95);
  }
}

/* ═══ POPOVER ARROW/CARET ═══ */
.ren-popover-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background: inherit;
  border: inherit;
  border-top: none;
  border-inline-start: none;
  transform: rotate(45deg);
  z-index: -1;
}

/* ═══ PLACEMENT VARIANTS ═══ */
/* Bottom (default) */
.ren-popover[data-side="bottom"],
.ren-popover:not([data-side]) {
  position-area: bottom span-all;
  margin-block-start: var(--space-2);
  margin-block-end: 0;
  margin-inline: 0;

  & .ren-popover-arrow {
    top: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(225deg);
  }
}

/* Top */
.ren-popover[data-side="top"] {
  position-area: top span-all;
  margin-block-start: 0;
  margin-block-end: var(--space-2);
  margin-inline: 0;

  & .ren-popover-arrow {
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
  }
}

/* Right */
.ren-popover[data-side="right"] {
  position-area: right span-all;
  margin-block: 0;
  margin-inline-start: var(--space-2);
  margin-inline-end: 0;

  & .ren-popover-arrow {
    left: -4px;
    top: 50%;
    transform: translateY(-50%) rotate(135deg);
  }
}

/* Left */
.ren-popover[data-side="left"] {
  position-area: left span-all;
  margin-block: 0;
  margin-inline-start: 0;
  margin-inline-end: var(--space-2);

  & .ren-popover-arrow {
    right: -4px;
    top: 50%;
    transform: translateY(-50%) rotate(315deg);
  }
}

/* ═══ POPOVER SECTIONS ═══ */
.ren-popover-header {
  margin-bottom: var(--space-2);
  font-weight: 600;
  color: var(--color-text-primary);
}

.ren-popover-body {
  color: var(--color-text-secondary);
  font-size: var(--size-body-sm);
  line-height: 1.5;
}

.ren-popover-footer {
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: var(--space-2);
}

/* ═══ RESPECTS MOTION PREFERENCES ═══
   Semantic --duration-enter already collapses to 0ms under
   reduced-motion. We keep this block to drop the transform
   (scale/translate) in the starting-style, so the popover
   fades in place instead of moving. */
@media (prefers-reduced-motion: reduce) {
  .ren-popover {
    transition:
      opacity var(--duration-enter),
      overlay var(--duration-enter) allow-discrete,
      display var(--duration-enter) allow-discrete;
    transform: none;
  }

  @starting-style {
    .ren-popover:popover-open {
      opacity: 0;
      transform: none;
    }
  }
}

/* ═══ FALLBACK FOR BROWSERS WITHOUT COMPLETE ANCHOR POSITIONING ═══ */
@supports not ((anchor-name: --ren-anchor) and
  (position-anchor: --ren-anchor) and
  (position-area: bottom span-all)) {
  .ren-popover {
    position: absolute;
    inset: auto auto auto auto;
  }

  [data-popover-trigger],
  .ren-popover-trigger {
    position: relative;
  }

  /* Fallback animations */
  .ren-popover {
    animation: ren-popover-fallback-open var(--duration-enter) var(--ease-enter);
  }

  .ren-popover:popover-open,
  .ren-popover.ren-open {
    animation: ren-popover-fallback-open var(--duration-enter) var(--ease-enter);
  }

  @keyframes ren-popover-fallback-open {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ren-popover {
      animation: none;
    }
  }
}
