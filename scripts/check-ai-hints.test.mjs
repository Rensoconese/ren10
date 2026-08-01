import assert from 'node:assert/strict';
import test from 'node:test';

import { validateAiHints } from './lib/ai-hints.mjs';

const valid = {
  selectionCriteria: { useWhen: ['Use it.'], avoidWhen: ['Avoid it.'] },
  canonicalImports: { css: ['rends/example.css'], notes: ['Import once.'] },
  requiredMarkup: ['Use semantic HTML.'],
  forbiddenPatterns: ['No fake controls.'],
  tokenPolicy: { allowed: ['Semantic tokens.'], forbidden: ['Primitive tokens.'] },
  accessibility: { required: ['Accessible name.'] },
};

test('aiHints schema accepts the normalized contract shape', () => {
  assert.deepEqual(validateAiHints(valid), []);
});

test('aiHints schema rejects unknown keys, empty arrays, and invalid nested values', () => {
  const invalid = structuredClone(valid);
  invalid.extra = true;
  invalid.requiredMarkup = [];
  invalid.accessibility.required = [''];

  const errors = validateAiHints(invalid);
  assert.ok(errors.some((error) => error.includes('unknown key extra')));
  assert.ok(errors.some((error) => error.includes('requiredMarkup')));
  assert.ok(errors.some((error) => error.includes('accessibility.required')));
});
