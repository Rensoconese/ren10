#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateV0Adapter } from './check-v0-adapter.mjs';
import { validateStarterApproval } from './check-starter-approval.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const skillDir = path.join(root, 'skills', 'rends');
const skillPath = path.join(skillDir, 'SKILL.md');
const readmePath = path.join(skillDir, 'README.md');

const errors = [];
const fail = (message) => errors.push(message);

for (const [label, validate, command] of [
  ['v0 adapter', validateV0Adapter, 'node scripts/check-v0-adapter.mjs'],
  ['starter approval', validateStarterApproval, 'node scripts/check-starter-approval.mjs'],
]) {
  const result = await validate(root);
  const diagnostics = Array.isArray(result?.errors) ? result.errors : [];
  if (result?.ok !== true || diagnostics.length > 0) {
    if (diagnostics.length === 0) {
      fail(`${label}: validation failed without diagnostics. Run ${command}.`);
    } else {
      for (const diagnostic of diagnostics) fail(`${label}: ${diagnostic}`);
    }
  }
}

if (!existsSync(skillPath)) fail('Missing skills/rends/SKILL.md.');
if (!existsSync(readmePath)) fail('Missing skills/rends/README.md.');

const skill = existsSync(skillPath) ? readFileSync(skillPath, 'utf8') : '';
const readme = existsSync(readmePath) ? readFileSync(readmePath, 'utf8') : '';
const combined = `${skill}\n${readme}`;

if (!/^---\n[\s\S]*?\n---/.test(skill)) {
  fail('SKILL.md must start with YAML frontmatter.');
}
if (!/^name:\s*rends$/m.test(skill)) {
  fail('SKILL.md frontmatter must declare name: rends.');
}
if (!/ren10/.test(skill)) {
  fail('SKILL.md must mention the ren10 package/CLI.');
}
for (const required of [
  'npx ren10 manifest --json',
  'npx ren10 build "<user intent>" --json',
  'npx ren10 component <name> --dense',
  'npx ren10 doctor',
  'rends/ren-design.md',
  'rends/tokens/tokens.md',
  'rends/base/layouts.md',
  'rends/components/components.md',
  'npm run agent:check',
]) {
  if (!skill.includes(required)) fail(`SKILL.md is missing required guidance: ${required}`);
}

const contractFile = (base) => `${base}.md`;
const oldCommand = (name) => `rends ${name}`;
for (const stale of [
  `ren10@${['0', '8'].join('.')}`,
  ['0', '8', '6'].join('.'),
  `${52} components`,
  `${18} single-element`,
  `Primitives** (${18})`,
  oldCommand('init'),
  oldCommand('add'),
  oldCommand('list'),
  contractFile('DESIGN'),
  contractFile('COMPONENT'),
  contractFile('PATTERN'),
  contractFile('TOKENS'),
  contractFile('LAYOUTS'),
  contractFile('PRIMITIVE-ZERO'),
  contractFile('COMPONENTS'),
]) {
  if (combined.includes(stale)) fail(`Agent skill contains stale text: ${stale}`);
}

const versionPattern = new RegExp(`rends-skill-${pkg.version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.tgz`);
if (!versionPattern.test(readme)) {
  fail(`README.md must document the current package artifact name: rends-skill-${pkg.version}.tgz`);
}

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  process.exit(1);
}

console.log(`RenDS agent skill check: OK (${pkg.name}@${pkg.version}; v0 adapter and starter approval valid).`);
