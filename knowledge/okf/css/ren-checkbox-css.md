---
type: "RenDS CSS"
title: ren-checkbox.css
description: "RenDS CSS generated from the RenDS knowledge graph."
id: file:components/primitives/ren-checkbox/ren-checkbox.css
sourcePath: components/primitives/ren-checkbox/ren-checkbox.css
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - css
  - ren10
  - rends
---

# ren-checkbox.css

Source path: `components/primitives/ren-checkbox/ren-checkbox.css`

## Relationships

_No outgoing relationships._

## Source Content

/* ============================================
   RenDS — Checkbox Component
   ============================================
   Custom-styled checkbox built on native
   <input type="checkbox">.

   Preserves native semantics and accessibility.
   Custom visuals via CSS only.

   Usage:
     <label class="ren-checkbox">
       <input type="checkbox">
       <span class="ren-checkbox-control"></span>
       <span>Accept terms</span>
     </label>

   For toggle switches, see ren-switch.
   ============================================ */

.ren-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  font-size: var(--body-size);
  font-weight: var(--weight-regular);
  color: var(--color-text);
  user-select: none;
  /* Ensure touch target */
  min-height: var(--touch-min);
}

/* Hide native checkbox visually but keep accessible */
.ren-checkbox > input[type="checkbox"] {
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

/* Custom checkbox visual */
.ren-checkbox-control {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;   /* 20px */
  height: 1.25rem;
  flex-shrink: 0;
  border: 2px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background-color: transparent;
  transition:
    background-color var(--duration-state) var(--ease-enter),
    border-color var(--duration-state) var(--ease-enter),
    transform var(--duration-tactile) var(--ease-playful);
}

/* Checkmark (hidden by default) */
.ren-checkbox-control::after {
  content: '';
  display: block;
  width: 0.45rem;
  height: 0.7rem;
  border: solid var(--color-on-accent);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) scale(0);
  transition: transform var(--duration-state) var(--ease-playful);
  margin-top: -2px;
}

/* ─── States ─── */

/* Checked */
.ren-checkbox > input:checked + .ren-checkbox-control {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
}

.ren-checkbox > input:checked + .ren-checkbox-control::after {
  transform: rotate(45deg) scale(1);
}

/* Hover */
.ren-checkbox:hover > .ren-checkbox-control {
  border-color: var(--color-accent);
}

.ren-checkbox:hover > input:checked + .ren-checkbox-control {
  background-color: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

/* Focus */
.ren-checkbox > input:focus-visible + .ren-checkbox-control {
  outline: var(--ring-width) solid var(--color-focus-ring);
  outline-offset: var(--ring-offset-width);
}

/* Active / Press */
.ren-checkbox:active > .ren-checkbox-control {
  transform: scale(0.9);
}

/* Disabled */
.ren-checkbox:has(input:disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Indeterminate */
.ren-checkbox > input:indeterminate + .ren-checkbox-control {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
}

.ren-checkbox > input:indeterminate + .ren-checkbox-control::after {
  border: none;
  width: 0.6rem;
  height: 2px;
  background-color: var(--color-on-accent);
  transform: none;
  margin: 0;
  border-radius: 1px;
}
