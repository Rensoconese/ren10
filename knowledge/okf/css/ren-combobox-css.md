---
type: "RenDS CSS"
title: ren-combobox.css
description: "RenDS CSS generated from the RenDS knowledge graph."
id: file:components/composites/ren-combobox/ren-combobox.css
sourcePath: components/composites/ren-combobox/ren-combobox.css
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - css
  - ren10
  - rends
---

# ren-combobox.css

Source path: `components/composites/ren-combobox/ren-combobox.css`

## Relationships

_No outgoing relationships._

## Source Content

/**
 * RenDS — Combobox
 * =================
 * Light-DOM combobox. CSS works standalone; <ren-combobox> layers ARIA
 * and behavior on top.
 *
 * Markup:
 *   <div class="ren-combobox">
 *     <input class="ren-combobox-input">
 *     <div class="ren-combobox-list" role="listbox" hidden>
 *       <div class="ren-combobox-item" role="option">…</div>
 *     </div>
 *   </div>
 */

.ren-combobox {
  position: relative;
  display: block;
  width: 100%;

  &-input {
    width: 100%;
    padding-block: var(--space-2);
    padding-inline: var(--space-3);

    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);

    font-family: inherit;
    font-size: var(--text-sm);
    line-height: var(--leading-5);
    color: var(--color-text);

    transition: var(--transition-tactile);

    &::placeholder {
      color: var(--color-text-muted);
    }

    &:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px var(--color-accent-subtle);
    }

    &:disabled {
      background: var(--color-fill);
      color: var(--color-text-muted);
      cursor: not-allowed;
    }

    /* Hide native type="search" decorations */
    &::-webkit-search-cancel-button,
    &::-webkit-search-decoration {
      -webkit-appearance: none;
      appearance: none;
      display: none;
    }
  }

  &-list {
    position: absolute;
    inset-inline: 0;
    top: calc(100% + var(--space-1));
    z-index: 50;

    max-height: 15rem;
    padding-block: var(--space-1);

    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);

    overflow-y: auto;
    overflow-x: hidden;

    /* Scrollbar styling */
    scrollbar-width: thin;
    scrollbar-color: var(--color-fill-active) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-fill-active);
      border-radius: var(--radius-full);
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--color-fill-hover);
    }

    &[hidden] {
      display: none;
    }

    /* Open animation */
    @starting-style {
      opacity: 0;
      translate: 0 -4px;
    }
    animation: ren-combobox-open var(--duration-enter) var(--ease-enter);

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  &[data-side="top"] &-list,
  &-list[data-side="top"] {
    top: auto;
    bottom: calc(100% + var(--space-1));
  }

  &[data-side="bottom"] &-list,
  &-list[data-side="bottom"] {
    top: calc(100% + var(--space-1));
    bottom: auto;
  }

  &-item {
    padding: var(--space-2) var(--space-3);
    cursor: pointer;
    border-radius: var(--radius-sm);

    display: flex;
    flex-direction: column;
    gap: var(--space-0-5, 2px);

    font-size: var(--text-sm);
    color: var(--color-text);

    transition: background-color var(--duration-micro) var(--ease-enter);

    &[hidden] {
      display: none;
    }

    &[data-highlighted] {
      background: var(--color-fill);
    }

    &[aria-selected="true"] {
      background: var(--color-accent-subtle);
      color: var(--color-accent);
      font-weight: 500;
    }

    &[aria-disabled="true"] {
      opacity: 0.5;
      cursor: not-allowed;

      &:hover,
      &[data-highlighted] {
        background: transparent;
      }
    }
  }

  &-item-label {
    font-weight: 500;
    color: var(--color-text);
  }

  &-item-description {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  &-empty {
    padding: var(--space-8) var(--space-3);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);

    &[hidden] {
      display: none;
    }
  }

  &-loading {
    padding: var(--space-3);
    text-align: center;
    color: var(--color-text-muted);
    font-size: var(--text-sm);

    &[hidden] {
      display: none;
    }

    &::before {
      content: '';
      display: inline-block;
      width: 0.875rem;
      height: 0.875rem;
      margin-inline-end: var(--space-2);
      vertical-align: -2px;

      border: 2px solid var(--color-border);
      border-top-color: var(--color-accent);
      border-radius: var(--radius-full);

      animation: ren-combobox-spin var(--duration-slow, 800ms) linear infinite;

      @media (prefers-reduced-motion: reduce) {
        animation: none;
      }
    }
  }

  &-group {
    & + & {
      margin-top: var(--space-1);
      border-top: 1px solid var(--color-border);
      padding-top: var(--space-1);
    }

    &[hidden] {
      display: none;
    }
  }

  &-group-label {
    padding: var(--space-2) var(--space-3);
    padding-bottom: var(--space-1);

    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
  }
}

@keyframes ren-combobox-open {
  from {
    opacity: 0;
    translate: 0 -4px;
  }
  to {
    opacity: 1;
    translate: 0 0;
  }
}

@keyframes ren-combobox-spin {
  to {
    transform: rotate(360deg);
  }
}
