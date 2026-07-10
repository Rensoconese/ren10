---
type: "RenDS CSS"
title: ren-kbd.css
description: "RenDS CSS generated from the RenDS knowledge graph."
id: file:components/primitives/ren-kbd/ren-kbd.css
sourcePath: components/primitives/ren-kbd/ren-kbd.css
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - css
  - ren10
  - rends
---

# ren-kbd.css

Source path: `components/primitives/ren-kbd/ren-kbd.css`

## Relationships

_No outgoing relationships._

## Source Content

/* ============================================
   RenDS — Kbd (keyboard shortcut)
   ============================================
   Inline chip showing a keyboard key or shortcut
   combo. Uses native <kbd> semantics.

   Usage:
     <kbd class="ren-kbd">⌘</kbd>
     <kbd class="ren-kbd">K</kbd>

   Combo:
     <kbd class="ren-kbd">⌘</kbd> + <kbd class="ren-kbd">K</kbd>
   ============================================ */

.ren-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5em;
  padding: 0.1em 0.4em;
  font-family: var(--font-mono);
  font-size: var(--caption-size);
  font-weight: var(--weight-medium);
  line-height: 1.4;
  color: var(--color-text);
  background-color: var(--color-surface-sunken);
  border: var(--stroke-1) solid var(--color-border-strong);
  border-bottom-width: 2px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}
