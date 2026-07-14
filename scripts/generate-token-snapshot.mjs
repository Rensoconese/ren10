import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const files = fs.readdirSync(path.join(root, 'tokens')).filter((f) => f.endsWith('.css')).sort();
const tokens = {};
for (const file of files) {
  const source = fs.readFileSync(path.join(root, 'tokens', file), 'utf8');
  tokens[file] = [...source.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]).sort();
}
const output = path.join(root, 'tests/snapshots/tokens.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
const text = `${JSON.stringify(tokens, null, 2)}\n`;
if (process.argv.includes('--update')) fs.writeFileSync(output, text);
else if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== text) {
  console.error('Token snapshot is stale. Run: npm run snapshots:update'); process.exitCode = 1;
}
if (process.argv.includes('--update')) console.log(`Wrote ${output}`);
