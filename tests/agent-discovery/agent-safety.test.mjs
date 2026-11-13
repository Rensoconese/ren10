import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// docs/agent-safety.md: the button that commits a destructive action carries
// data-agent-confirm. Shipped demo HTML is what agents and people copy, so
// every destructive button inside a <dialog> (a confirmation) must be marked
// with a sentence a person can answer, and the trigger that only opens the
// dialog must not be.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCANNED = ['examples', 'templates', 'docs'];
const SKIPPED = new Set(['docs/audits', 'docs/workflows', 'docs/superpowers', 'templates/blocks/media']);

function htmlFiles(dir) {
  if (SKIPPED.has(dir)) return [];
  return readdirSync(path.join(root, dir)).flatMap((entry) => {
    const relative = `${dir}/${entry}`;
    if (statSync(path.join(root, relative)).isDirectory()) return htmlFiles(relative);
    return entry.endsWith('.html') ? [relative] : [];
  });
}

// Drop <pre>/<code> samples and comments: they document markup, they are not markup.
const liveMarkup = (html) => html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<pre[\s\S]*?<\/pre>/g, '')
  .replace(/<code[\s\S]*?<\/code>/g, '');

const isDanger = (tag) => /class="[^"]*\bren-btn-danger\b/.test(tag);
const confirmText = (tag) => tag.match(/data-agent-confirm="([^"]*)"/)?.[1] ?? null;

const files = SCANNED.flatMap(htmlFiles);

test('every destructive button inside a dialog states what it does for agents', () => {
  const problems = [];
  let checked = 0;
  for (const file of files) {
    const html = liveMarkup(readFileSync(path.join(root, file), 'utf8'));
    for (const dialog of html.match(/<dialog\b[\s\S]*?<\/dialog>/g) ?? []) {
      for (const tag of dialog.match(/<button\b[^>]*>/g) ?? []) {
        if (!isDanger(tag)) continue;
        checked += 1;
        const text = confirmText(tag);
        if (text === null) problems.push(`${file}: ${tag} lacks data-agent-confirm`);
        else if (text.trim().split(/\s+/).length < 4) problems.push(`${file}: data-agent-confirm="${text}" must say what happens, in a sentence`);
      }
    }
  }
  assert.deepEqual(problems, []);
  assert.ok(checked >= 6, `expected the shipped confirmation dialogs to be scanned, found ${checked}`);
});

test('a trigger that only opens a dialog is not marked', () => {
  const problems = [];
  for (const file of files) {
    const html = liveMarkup(readFileSync(path.join(root, file), 'utf8'));
    for (const tag of html.match(/<[a-z-]+\b[^>]*\bdata-dialog-trigger="[^"]*"[^>]*>/g) ?? []) {
      if (confirmText(tag) !== null) problems.push(`${file}: ${tag} — mark the confirming button, not the trigger`);
    }
  }
  assert.deepEqual(problems, []);
});

test('every data-dialog-trigger in the golden examples opens a dialog on the same page', () => {
  for (const file of htmlFiles('examples')) {
    const html = readFileSync(path.join(root, file), 'utf8');
    for (const [, id] of html.matchAll(/data-dialog-trigger="([^"]+)"/g)) {
      assert.match(html, new RegExp(`<ren-dialog\\b[^>]*\\bid="${id}"`), `${file}: trigger points at missing #${id}`);
    }
  }
});
