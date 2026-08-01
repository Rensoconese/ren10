import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { REGISTRY } from '../cli/registry.js';
import { validateRegistryAiHints } from './lib/ai-hints.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const result = validateRegistryAiHints(root, REGISTRY);

if (result.errors.length > 0) {
  console.error(`RenDS aiHints schema validation failed:\n- ${result.errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`RenDS aiHints schema v${result.schemaVersion}: OK (${result.records.length} contracts)`);
