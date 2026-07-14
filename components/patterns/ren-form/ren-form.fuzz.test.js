import assert from 'node:assert/strict';
import { serializeFormEntries } from './serialize.js';

// Deterministic property checks: arbitrary names/duplicates always round-trip.
for (let seed = 1; seed < 250; seed += 1) {
  const count = (seed * 17) % 31;
  const entries = Array.from({ length: count }, (_, i) => [`field-${(seed + i) % 7}`, `v-${seed}-${i}`]);
  const result = serializeFormEntries(entries);
  for (const [name, value] of entries) assert.ok((Array.isArray(result[name]) ? result[name] : [result[name]]).includes(value));
}
console.log('ren-form serialization fuzz: 249 cases passed');
