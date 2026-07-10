---
type: "RenDS CSS"
title: ren-skeleton.css
description: "RenDS CSS generated from the RenDS knowledge graph."
id: file:components/primitives/ren-skeleton/ren-skeleton.css
sourcePath: components/primitives/ren-skeleton/ren-skeleton.css
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - css
  - ren10
  - rends
---

# ren-skeleton.css

Source path: `components/primitives/ren-skeleton/ren-skeleton.css`

## Relationships

_No outgoing relationships._

## Source Content

/* ============================================
   RenDS — Skeleton
   ============================================
   Loading placeholder with shimmer animation.
   Respects prefers-reduced-motion (static fill).

   Usage:
     <div class="ren-skeleton ren-skeleton-heading"></div>
     <div class="ren-skeleton ren-skeleton-text"></div>
     <div class="ren-skeleton ren-skeleton-circle"></div>
     <div class="ren-skeleton ren-skeleton-rect"></div>

   Accessibility:
     - Wrap multiple skeletons in a container with
       aria-busy="true" aria-live="polite"
     - Replace with real content when loaded
   ============================================ */

.ren-skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--color-fill) 25%,
    var(--color-fill-hover) 50%,
    var(--color-fill) 75%
  );
  background-size: 200% 100%;
  animation: ren-skeleton-pulse var(--duration-loop-slow) var(--ease-loop-pulse) infinite;
  border-radius: var(--radius-sm);
  min-height: 1rem;
}

/* ─── Variants ─── */
.ren-skeleton-text {
  height: 1em;
  width: 100%;
  border-radius: var(--radius-sm);
}

.ren-skeleton-heading {
  height: 1.5em;
  width: 60%;
  border-radius: var(--radius-sm);
}

.ren-skeleton-circle {
  width: var(--avatar-md);
  height: var(--avatar-md);
  border-radius: var(--radius-full);
}

.ren-skeleton-rect {
  width: 100%;
  height: 8rem;
  border-radius: var(--radius-md);
}

@keyframes ren-skeleton-pulse {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .ren-skeleton {
    animation: none;
    background: var(--color-fill);
  }
}
