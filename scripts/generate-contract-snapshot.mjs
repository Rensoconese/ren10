import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dirs = [
  ['primitives', 'components/primitives', 'component.md'],
  ['composites', 'components/composites', 'component.md'],
  ['patterns', 'components/patterns', 'pattern.md'],
];
const snapshot = {};
for (const [kind, dir, file] of dirs) {
  snapshot[kind] = fs.readdirSync(path.join(root, dir), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(root, dir, entry.name, file)))
    .map((entry) => entry.name).sort();
}
const output = path.join(root, 'tests/snapshots/contracts.json');
fs.mkdirSync(path.dirname(output), { recursive: true });
const text = `${JSON.stringify(snapshot, null, 2)}\n`;
if (process.argv.includes('--update')) fs.writeFileSync(output, text);
else if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== text) {
  console.error('Contract snapshot is stale. Run: npm run snapshots:update'); process.exitCode = 1;
}
if (process.argv.includes('--update')) console.log(`Wrote ${output}`);
