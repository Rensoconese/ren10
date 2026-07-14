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
const dropzoneControllers = new WeakMap();

export function initDropZone(dropzone) {
  if (!dropzone) return null;

  dropzoneControllers.get(dropzone)?.abort();
  delete dropzone.dataset.dragover;
  const controller = new AbortController();
  dropzoneControllers.set(dropzone, controller);
  const { signal } = controller;

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
  }, { signal });

  dropzone.addEventListener('dragleave', () => {
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      delete dropzone.dataset.dragover;
    }
  }, { signal });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
  }, { signal });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    delete dropzone.dataset.dragover;
    if (e.dataTransfer?.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  }, { signal });

  if (input) {
    input.addEventListener('change', () => {
      if (input.files?.length) {
        handleFiles(input.files);
      }
    }, { signal });
  }

  return dropzone;
}
