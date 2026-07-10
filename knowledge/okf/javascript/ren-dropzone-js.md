---
type: "RenDS JavaScript"
title: ren-dropzone.js
description: "RenDS JavaScript generated from the RenDS knowledge graph."
id: file:components/composites/ren-dropzone/ren-dropzone.js
sourcePath: components/composites/ren-dropzone/ren-dropzone.js
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - javascript
  - ren10
  - rends
---

# ren-dropzone.js

Source path: `components/composites/ren-dropzone/ren-dropzone.js`

## Relationships

_No outgoing relationships._

## Source Content

/* ============================================
   RenDS — DropZone Drag & Drop Handler
   ============================================
   Minimal JS for drag events. Handles:
   - Drag enter/leave visual state
   - File drop processing
   - Custom event dispatch

   Usage:
     import { initDropZone } from './ren-dropzone.js';
     const dz = initDropZone(document.querySelector('.ren-dropzone'));
     dz.addEventListener('ren-files-added', (e) => {
       console.log(e.detail.files);
     });
   ============================================ */

/**
 * @param {HTMLElement} dropzone
 * @returns {HTMLElement}
 */
export function initDropZone(dropzone) {
  if (!dropzone) return null;

  let dragCounter = 0;
  const input = dropzone.querySelector('.ren-dropzone-input');

  const handleFiles = (files) => {
    dropzone.dispatchEvent(
      new CustomEvent('ren-files-added', {
        detail: { files: [...files] },
        bubbles: true,
      })
    );
  };

  dropzone.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    dropzone.dataset.dragover = '';
  });

  dropzone.addEventListener('dragleave', () => {
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      delete dropzone.dataset.dragover;
    }
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    delete dropzone.dataset.dragover;
    if (e.dataTransfer?.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  });

  if (input) {
    input.addEventListener('change', () => {
      if (input.files?.length) {
        handleFiles(input.files);
      }
    });
  }

  return dropzone;
}
