---
type: "RenDS CSS"
title: ren-switch.css
description: "RenDS CSS generated from the RenDS knowledge graph."
id: file:components/primitives/ren-switch/ren-switch.css
sourcePath: components/primitives/ren-switch/ren-switch.css
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - css
  - ren10
  - rends
---

# ren-switch.css

Source path: `components/primitives/ren-switch/ren-switch.css`

## Relationships

_No outgoing relationships._

## Source Content

/* ============================================
   RenDS — Switch / Toggle Component
   ============================================
   Custom-styled toggle switch built on native
   <input type="checkbox" role="switch">.

   Preserves native semantics and accessibility.
   Custom visuals via CSS only.

   Usage:
     <label class="ren-switch">
       <input type="checkbox" role="switch">
       <span class="ren-switch-track"></span>
       <span>Dark mode</span>
     </label>
   ============================================ */

.ren-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--body-size);
  font-weight: var(--weight-regular);
  color: var(--color-text);
  user-select: none;
  min-height: var(--touch-min);
}

/* Hide native input */
.ren-switch > input[type="checkbox"] {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border-width: 0;
}

/* Track */
.ren-switch-track {
  position: relative;
  width: 3.2rem;    /* 51px — Apple HIG */
  height: 1.9rem;   /* 31px */
  flex-shrink: 0;
  background-color: var(--color-fill-active);
  border-radius: var(--radius-full);
  transition:
    background-color var(--duration-state) var(--ease-enter);
}

/* Thumb */
.ren-switch-track::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(1.9rem - 4px);   /* 27px */
  height: calc(1.9rem - 4px);
  background-color: var(--white);
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  transition:
    transform var(--duration-state) var(--ease-state-change),
    box-shadow var(--duration-state) var(--ease-enter);
}

/* ─── States ─── */

/* Checked (on) */
.ren-switch > input:checked + .ren-switch-track {
  background-color: var(--color-success);
}

.ren-switch > input:checked + .ren-switch-track::after {
  transform: translateX(calc(3.2rem - 1.9rem));
}

/* Hover */
.ren-switch:hover > .ren-switch-track {
  background-color: var(--color-fill-hover);
}

.ren-switch:hover > input:checked + .ren-switch-track {
  background-color: var(--color-success-strong);
}

/* Focus */
.ren-switch > input:focus-visible + .ren-switch-track {
  outline: var(--ring-width) solid var(--color-focus-ring);
  outline-offset: var(--ring-offset-width);
}

/* Active */
.ren-switch:active > .ren-switch-track::after {
  width: calc(1.9rem + 2px);
}

.ren-switch:active > input:checked + .ren-switch-track::after {
  transform: translateX(calc(3.2rem - 1.9rem - 6px));
}

/* Disabled */
.ren-switch:has(input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}
