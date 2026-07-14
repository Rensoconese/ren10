# Relume to Ren10 Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a repeatable, testable workflow that turns a complete Relume reference into a visually reviewed Ren10 block candidate before it reaches the user.

**Architecture:** A Node.js workflow library and CLI scaffold and validate one committed packet per module. A generic Playwright capture runner consumes the packet's render matrix with cache-busting URLs, while reusable structural-visual assertions catch duplicated affordances, alignment, proportional, overflow, and native-cascade defects. The system deliberately does not call Relume or Grok itself: OAuth-bound extraction and model orchestration remain agent responsibilities, while the repository enforces evidence and gates.

**Tech Stack:** Node.js 20+ ESM, Node built-in test runner, Playwright, axe-playwright, vanilla JSON/Markdown, existing RenDS npm scripts.

## Global Constraints

- Relume supplies anatomy, behavior, content relationships, important proportions, states, and responsive intent; Ren10 supplies implementation, contracts, tokens, accessibility, and final visual language.
- Do not require pixel-perfect reproduction or change RenDS solely to imitate Relume.
- Do not copy Relume source, classes, text, URLs, assets, or runtime dependencies into committed artifacts.
- The workflow must never treat a passing automated suite as a substitute for Codex visual review.
- A module cannot reach Grok without complete source extraction, a RenDS map, and an acceptance contract.
- A module cannot reach the user without fresh desktop/mobile screenshots and independent Codex review.
- Keep all generated UI vanilla HTML, CSS, and JavaScript; no React, JSX/TSX, Tailwind, Motion, or framework output.
- Preserve user-owned dirty files and restrict every feature commit to its declared `allowedFiles`.
- Use RED–GREEN–REFACTOR for every workflow behavior and every block defect regression.
- Relume OAuth failure is a hard preflight failure; never substitute memory or an old summary.

---

## Planned File Map

### Workflow runtime

- Create `scripts/lib/relume-workflow.mjs` — packet schema, validation, stage transitions, inventory loading, and pure helpers.
- Create `scripts/relume-workflow.mjs` — `init`, `validate`, and `status` command-line entry point.
- Create `scripts/relume-workflow.test.mjs` — Node tests for the library and CLI behavior.
- Modify `package.json` — add `workflow:relume`, `workflow:relume:check`, and `test:workflow` scripts.

### Workflow documentation and templates

- Create `docs/workflows/relume-to-ren10/README.md` — operator runbook aligned with the approved spec.
- Create `docs/workflows/relume-to-ren10/templates/reference-brief.md` — factual extraction template.
- Create `docs/workflows/relume-to-ren10/templates/translation-map.md` — Relume-to-RenDS mapping and cascade-risk template.
- Create `docs/workflows/relume-to-ren10/templates/implementation-packet.md` — exact Grok handoff template.
- Create `docs/workflows/relume-to-ren10/templates/acceptance.json` — machine-readable acceptance template.
- Create `docs/workflows/relume-to-ren10/inventory.json` — family/module ledger.

### Browser evidence and reusable checks

- Create `tests/utils/static-server.cjs` — shared safe static HTTP server.
- Create `tests/utils/block-quality.cjs` — reusable browser measurements and assertions.
- Create `tests/utils/block-quality.spec.cjs` — regression fixture coverage for those assertions.
- Create `scripts/capture-block-matrix.mjs` — deterministic screenshot capture CLI.
- Create `scripts/capture-block-matrix.test.mjs` — render-matrix validation and cache-busting tests.
- Create `tests/components/fixtures/block-quality.html` — deliberately good/bad structures for helper tests.

### Pilot packet

- Create `docs/workflows/relume-to-ren10/modules/navbar5/packet.json` — sanitized pilot metadata for the completed Mega Menu.
- Create `docs/workflows/relume-to-ren10/modules/navbar5/reference-brief.md` — facts distilled from the MCP response, without copied source.
- Create `docs/workflows/relume-to-ren10/modules/navbar5/translation-map.md` — actual RenDS mapping and known classless risks.
- Create `docs/workflows/relume-to-ren10/modules/navbar5/acceptance.json` — actual structural, functional, and visual gates.
- Create `docs/workflows/relume-to-ren10/modules/navbar5/render-matrix.json` — desktop/mobile/light/dark/no-JS/reduced-motion states.
- Create `docs/workflows/relume-to-ren10/modules/navbar5/evidence.json` — pilot gate ledger and screenshot paths.
- Modify `tests/components/blocks-navigation.spec.cjs` — consume reusable helpers without weakening current coverage.
- Modify `.gitignore` — ignore local workflow screenshot output and Playwright CLI scratch files.
- Modify `AGENTS.md` — route future Relume conversions through the workflow runbook.

---

### Task 1: Packet schema and validation library

**Files:**
- Create: `scripts/lib/relume-workflow.mjs`
- Create: `scripts/relume-workflow.test.mjs`

**Interfaces:**
- Produces: `STAGES`, `REQUIRED_PACKET_FILES`, `validatePacketDir(packetDir, options)`, `nextStage(currentStage)`, and `assertCleanAllowedFiles(changedFiles, allowedFiles)`.
- Consumes: Node `fs`, `path`, and JSON only; no browser or MCP dependency.

- [ ] **Step 1: Write failing tests for a complete and incomplete packet**

Create `scripts/relume-workflow.test.mjs` with temporary directories and these assertions:

```js
import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { copyFile, mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  STAGES,
  assertCleanAllowedFiles,
  nextStage,
  validatePacketDir,
} from './lib/relume-workflow.mjs';

const roots = [];
afterEach(async () => Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))));

async function makePacket(overrides = {}) {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-'));
  roots.push(root);
  const dir = join(root, 'navbar5');
  await mkdir(dir);
  const packet = {
    version: 1,
    family: 'navbars',
    moduleId: 'navbar5',
    blockSlug: 'nav-mega-menu',
    blockPath: 'templates/blocks/nav-mega-menu.html',
    stage: 'reference',
    allowedFiles: [
      'templates/blocks/nav-mega-menu.html',
      'tests/components/blocks-navigation.spec.cjs',
    ],
    ...overrides,
  };
  await writeFile(join(dir, 'packet.json'), `${JSON.stringify(packet, null, 2)}\n`);
  await writeFile(join(dir, 'reference-brief.md'), '# Reference Brief\n\n## Retrieved facts\n\n- Complete source inspected.\n');
  await writeFile(join(dir, 'translation-map.md'), '# Translation Map\n\n## Cascade risks\n\n- Native details inspected.\n');
  await writeFile(join(dir, 'acceptance.json'), '{"version":1,"criteria":[{"id":"one-chevron","kind":"structure","description":"One visible chevron","automated":true}]}\n');
  await writeFile(join(dir, 'render-matrix.json'), '{"version":1,"path":"/templates/blocks/nav-mega-menu.html","root":"[data-rbm-root]","states":[]}\n');
  return dir;
}

test('validatePacketDir accepts a complete reference-stage packet', async () => {
  const dir = await makePacket();
  const result = await validatePacketDir(dir);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.packet.moduleId, 'navbar5');
});

test('validatePacketDir reports every missing required artifact', async () => {
  const dir = await makePacket();
  await rm(join(dir, 'translation-map.md'));
  await rm(join(dir, 'acceptance.json'));
  const result = await validatePacketDir(dir);
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, [
    'Missing required artifact: acceptance.json',
    'Missing required artifact: translation-map.md',
  ]);
});

test('stage order is fixed and cannot skip review', () => {
  assert.deepEqual(STAGES, ['reference', 'mapped', 'red', 'green', 'reviewed', 'accepted']);
  assert.equal(nextStage('green'), 'reviewed');
  assert.equal(nextStage('accepted'), null);
});

test('allowed file audit rejects undeclared changes', () => {
  assert.throws(
    () => assertCleanAllowedFiles(
      ['templates/blocks/nav-mega-menu.html', 'STATUS.md'],
      ['templates/blocks/nav-mega-menu.html'],
    ),
    /Out-of-scope changed file: STATUS\.md/,
  );
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
node --test scripts/relume-workflow.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `scripts/lib/relume-workflow.mjs`.

- [ ] **Step 3: Implement the pure validation library**

Create `scripts/lib/relume-workflow.mjs`:

```js
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const STAGES = Object.freeze(['reference', 'mapped', 'red', 'green', 'reviewed', 'accepted']);
export const REQUIRED_PACKET_FILES = Object.freeze([
  'acceptance.json',
  'packet.json',
  'reference-brief.md',
  'render-matrix.json',
  'translation-map.md',
]);

const REQUIRED_REFERENCE_HEADINGS = ['## Retrieved facts'];
const REQUIRED_MAP_HEADINGS = ['## Cascade risks'];

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

export function nextStage(currentStage) {
  const index = STAGES.indexOf(currentStage);
  if (index < 0) throw new Error(`Unknown workflow stage: ${currentStage}`);
  return STAGES[index + 1] ?? null;
}

export function assertCleanAllowedFiles(changedFiles, allowedFiles) {
  const allowed = new Set(allowedFiles);
  for (const file of changedFiles) {
    if (!allowed.has(file)) throw new Error(`Out-of-scope changed file: ${file}`);
  }
}

export async function validatePacketDir(packetDir) {
  const errors = [];
  for (const name of REQUIRED_PACKET_FILES) {
    if (!(await exists(join(packetDir, name)))) errors.push(`Missing required artifact: ${name}`);
  }
  errors.sort();
  if (errors.length) return { valid: false, errors, packet: null };

  let packet;
  try {
    packet = await readJson(join(packetDir, 'packet.json'));
  } catch (error) {
    return { valid: false, errors: [`Invalid packet.json: ${error.message}`], packet: null };
  }

  if (packet.version !== 1) errors.push('packet.json version must equal 1');
  if (!STAGES.includes(packet.stage)) errors.push(`Unknown workflow stage: ${packet.stage}`);
  if (!Array.isArray(packet.allowedFiles) || packet.allowedFiles.length === 0) {
    errors.push('packet.json allowedFiles must be a non-empty array');
  }

  const reference = await readFile(join(packetDir, 'reference-brief.md'), 'utf8');
  const map = await readFile(join(packetDir, 'translation-map.md'), 'utf8');
  for (const heading of REQUIRED_REFERENCE_HEADINGS) {
    if (!reference.includes(heading)) errors.push(`reference-brief.md missing heading: ${heading}`);
  }
  for (const heading of REQUIRED_MAP_HEADINGS) {
    if (!map.includes(heading)) errors.push(`translation-map.md missing heading: ${heading}`);
  }

  const acceptance = await readJson(join(packetDir, 'acceptance.json'));
  if (!Array.isArray(acceptance.criteria) || acceptance.criteria.length === 0) {
    errors.push('acceptance.json criteria must be a non-empty array');
  }

  const matrix = await readJson(join(packetDir, 'render-matrix.json'));
  if (!Array.isArray(matrix.states)) errors.push('render-matrix.json states must be an array');

  return { valid: errors.length === 0, errors: errors.sort(), packet };
}
```

- [ ] **Step 4: Run the tests and verify GREEN**

Run: `node --test scripts/relume-workflow.test.mjs`

Expected: `4 tests`, `4 pass`, `0 fail`.

- [ ] **Step 5: Commit Task 1**

```bash
git add scripts/lib/relume-workflow.mjs scripts/relume-workflow.test.mjs
git commit -m "feat: add Relume workflow packet validation"
```

---

### Task 2: Workflow CLI and stage evidence

**Files:**
- Create: `scripts/relume-workflow.mjs`
- Modify: `scripts/lib/relume-workflow.mjs`
- Modify: `scripts/relume-workflow.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: Task 1 exports.
- Produces CLI commands:
  - `node scripts/relume-workflow.mjs init --family <family> --module <module> --block <slug> --path <html>`
  - `node scripts/relume-workflow.mjs validate <packet-dir>`
  - `node scripts/relume-workflow.mjs status <packet-dir>`
  - `node scripts/relume-workflow.mjs advance <packet-dir> --evidence <file>`
- Produces `scaffoldPacket(options)` and `advancePacket(packetDir, evidencePath)` for later tasks.

- [ ] **Step 1: Add failing CLI tests**

Append tests that spawn the CLI with a temporary `--root` and assert:

```js
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);

test('init creates a packet with deterministic paths', async () => {
  const root = await mkdtemp(join(tmpdir(), 'ren10-relume-cli-'));
  roots.push(root);
  const { stdout } = await execFileAsync(process.execPath, [
    'scripts/relume-workflow.mjs',
    'init',
    '--root', root,
    '--family', 'navbars',
    '--module', 'navbar6',
    '--block', 'nav-mega-menu-featured',
    '--path', 'templates/blocks/nav-mega-menu-featured.html',
  ], { cwd: process.cwd() });
  assert.match(stdout, /Created workflow packet: .*navbar6/);
  const packet = JSON.parse(await readFile(join(root, 'navbar6', 'packet.json'), 'utf8'));
  assert.equal(packet.stage, 'reference');
  assert.deepEqual(packet.allowedFiles, [
    'templates/blocks/nav-mega-menu-featured.html',
    'tests/components/blocks-navigation.spec.cjs',
  ]);
});

test('advance requires evidence and moves exactly one stage', async () => {
  const dir = await makePacket();
  const evidence = join(dir, 'reference-evidence.json');
  await writeFile(evidence, '{"source":"relume-mcp","completeSource":true}\n');
  const { advancePacket } = await import('./lib/relume-workflow.mjs');
  const updated = await advancePacket(dir, evidence);
  assert.equal(updated.stage, 'mapped');
  assert.equal(updated.evidence.reference, 'reference-evidence.json');
});
```

Update imports to include `readFile`.

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/relume-workflow.test.mjs`

Expected: FAIL because the CLI and `advancePacket` do not exist.

- [ ] **Step 3: Add scaffold and evidence transitions**

Extend `scripts/lib/relume-workflow.mjs` with:

```js
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';

export async function scaffoldPacket({ root, family, moduleId, blockSlug, blockPath, testPath, templateRoot }) {
  const packetDir = join(root, moduleId);
  await mkdir(packetDir, { recursive: false });
  const packet = {
    version: 1,
    family,
    moduleId,
    blockSlug,
    blockPath,
    stage: 'reference',
    allowedFiles: [
      blockPath,
      testPath ?? (family === 'navbars' ? 'tests/components/blocks-navigation.spec.cjs' : null),
    ].filter(Boolean),
    evidence: {},
  };
  await writeFile(join(packetDir, 'packet.json'), `${JSON.stringify(packet, null, 2)}\n`);
  for (const [source, target] of [
    ['reference-brief.md', 'reference-brief.md'],
    ['translation-map.md', 'translation-map.md'],
    ['acceptance.json', 'acceptance.json'],
  ]) {
    await copyFile(join(templateRoot, source), join(packetDir, target));
  }
  await writeFile(join(packetDir, 'render-matrix.json'), `${JSON.stringify({
    version: 1,
    path: `/${blockPath}`,
    root: '[data-block-root]',
    states: [],
  }, null, 2)}\n`);
  return packetDir;
}

export async function advancePacket(packetDir, evidencePath) {
  const packetPath = join(packetDir, 'packet.json');
  const packet = await readJson(packetPath);
  const target = nextStage(packet.stage);
  if (!target) throw new Error('Workflow packet is already accepted');
  if (!(await exists(evidencePath))) throw new Error(`Evidence file not found: ${evidencePath}`);
  packet.evidence ??= {};
  packet.evidence[packet.stage] = basename(evidencePath);
  packet.stage = target;
  await writeFile(packetPath, `${JSON.stringify(packet, null, 2)}\n`);
  return packet;
}
```

Use `tests/components/blocks-navigation.spec.cjs` as the default only for the `navbars` family; other families must receive `--test-path` rather than guessing a filename. Add this condition to `scaffoldPacket` and its CLI argument validation.

- [ ] **Step 4: Implement the CLI parser and commands**

Create `scripts/relume-workflow.mjs` with explicit argument parsing, nonzero exits, and JSON-free human output. The main dispatch must be:

```js
#!/usr/bin/env node
import { resolve } from 'node:path';
import {
  advancePacket,
  scaffoldPacket,
  validatePacketDir,
} from './lib/relume-workflow.mjs';

const [, , command, ...tokens] = process.argv;

function argsToObject(values) {
  const result = { _: [] };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith('--')) {
      result._.push(value);
      continue;
    }
    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith('--')) throw new Error(`Missing value for --${key}`);
    result[key] = next;
    index += 1;
  }
  return result;
}

async function main() {
  const args = argsToObject(tokens);
  if (command === 'validate') {
    const packetDir = resolve(args._[0]);
    const result = await validatePacketDir(packetDir);
    if (!result.valid) throw new Error(result.errors.join('\n'));
    console.log(`Valid workflow packet: ${result.packet.moduleId} (${result.packet.stage})`);
    return;
  }
  if (command === 'status') {
    const result = await validatePacketDir(resolve(args._[0]));
    if (!result.packet) throw new Error(result.errors.join('\n'));
    console.log(`${result.packet.moduleId}: ${result.packet.stage}`);
    return;
  }
  if (command === 'advance') {
    const packet = await advancePacket(resolve(args._[0]), resolve(args.evidence));
    console.log(`${packet.moduleId}: advanced to ${packet.stage}`);
    return;
  }
  if (command === 'init') {
    const root = resolve(args.root ?? 'docs/workflows/relume-to-ren10/modules');
    const packetDir = await scaffoldPacket({
      root,
      family: args.family,
      moduleId: args.module,
      blockSlug: args.block,
      blockPath: args.path,
      testPath: args['test-path'],
      templateRoot: resolve('docs/workflows/relume-to-ren10/templates'),
    });
    console.log(`Created workflow packet: ${packetDir}`);
    return;
  }
  throw new Error('Usage: relume-workflow <init|validate|status|advance>');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
```

- [ ] **Step 5: Add package scripts**

Add to `package.json`:

```json
"workflow:relume": "node scripts/relume-workflow.mjs",
"workflow:relume:check": "node scripts/relume-workflow.mjs validate",
"test:workflow": "node --test scripts/relume-workflow.test.mjs scripts/capture-block-matrix.test.mjs"
```

Do not add `test:workflow` to `test:portable` until Tasks 1–6 are green.

- [ ] **Step 6: Run CLI tests and lint**

Run:

```bash
node --test scripts/relume-workflow.test.mjs
npm run lint:js
```

Expected: all workflow tests PASS; ESLint exits 0 with no new warnings from the new files.

- [ ] **Step 7: Commit Task 2**

```bash
git add package.json scripts/lib/relume-workflow.mjs scripts/relume-workflow.mjs scripts/relume-workflow.test.mjs
git commit -m "feat: add Relume workflow CLI"
```

---

### Task 3: Operator templates and runbook

**Files:**
- Create: `docs/workflows/relume-to-ren10/README.md`
- Create: `docs/workflows/relume-to-ren10/templates/reference-brief.md`
- Create: `docs/workflows/relume-to-ren10/templates/translation-map.md`
- Create: `docs/workflows/relume-to-ren10/templates/implementation-packet.md`
- Create: `docs/workflows/relume-to-ren10/templates/acceptance.json`
- Modify: `scripts/relume-workflow.test.mjs`

**Interfaces:**
- Consumes: Task 2 `scaffoldPacket`.
- Produces stable headings required by `validatePacketDir` and a self-contained Grok packet format.

- [ ] **Step 1: Add failing template-content tests**

Add a test that reads each template and asserts exact required sections:

```js
test('workflow templates contain every mandatory gate', async () => {
  const templateRoot = join(process.cwd(), 'docs/workflows/relume-to-ren10/templates');
  const reference = await readFile(join(templateRoot, 'reference-brief.md'), 'utf8');
  const map = await readFile(join(templateRoot, 'translation-map.md'), 'utf8');
  const packet = await readFile(join(templateRoot, 'implementation-packet.md'), 'utf8');
  assert.match(reference, /## Retrieved facts/);
  assert.match(reference, /## Responsive states/);
  assert.match(reference, /## Unavailable evidence/);
  assert.match(map, /## RenDS mapping/);
  assert.match(map, /## Cascade risks/);
  assert.match(map, /primitive-zero\.md/);
  assert.match(packet, /## Required RED evidence/);
  assert.match(packet, /## Allowed files/);
  assert.match(packet, /## Required render matrix/);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/relume-workflow.test.mjs`

Expected: FAIL with `ENOENT` for the template directory.

- [ ] **Step 3: Create the reference brief template**

Create `reference-brief.md` with these headings and instructions:

```markdown
# Reference Brief

## Retrieval metadata

- Family:
- Module ID:
- Retrieved through: Relume MCP
- Retrieved at:
- Source variants returned:
- Supporting files returned:

## Retrieved facts

Record only facts visible in the complete returned source: anatomy, ordering,
ownership, counts, dimensions expressed by the source, dependencies, and state logic.

## Responsive states

Record desktop, tablet, and mobile behavior separately, including duplicated or
conditionally rendered source trees.

## Interaction states

Record default, open, hover, focus, active, disabled, loading, and error states
that actually exist in the reference.

## Visual relationships

Record meaningful proportions, alignment, spacing rhythm, aspect ratios, and
surface relationships. Mark source-derived facts separately from inference.

## Unavailable evidence

State whether the MCP omitted a rendered preview, exact resolved tokens, assets,
or other evidence. Never fill missing evidence from memory.

## Public-output exclusions

List source text, URLs, assets, class names, dependencies, and framework code
that must not appear in Ren10 output.
```

- [ ] **Step 4: Create the translation and implementation templates**

`translation-map.md` must contain:

```markdown
# Relume to RenDS Translation Map

## Mandatory contracts loaded

- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`
- `base/primitive-zero.md`
- `components/components.md`
- Colocated contracts for every selected RenDS part

## RenDS mapping

For every reference part, record the chosen RenDS part or native element, the
preserved behavior, and the intentional Ren10 difference.

## Cascade risks

Inspect computed styles and source rules for native elements, pseudo-elements,
layout inheritance, global margins, borders, generated icons, and open/closed states.

## Responsive adaptation

Record the RenDS breakpoint and any deliberate difference from the reference.

## Progressive enhancement

Describe the usable HTML state before custom-element upgrade and with JavaScript disabled.

## Rejected mappings

Record mappings rejected because their semantics or mobile behavior are incorrect.
```

`implementation-packet.md` must contain the exact sections:

```markdown
# Grok Implementation Packet

## Objective
## Complete reference brief
## RenDS translation map
## Acceptance criteria
## Required RED evidence
## Allowed files
## Forbidden files and dependencies
## Required render matrix
## Required validation commands
## Completion report format
```

- [ ] **Step 5: Create the acceptance JSON template**

Create `acceptance.json`:

```json
{
  "version": 1,
  "criteria": [
    {
      "id": "function-primary",
      "kind": "behavior",
      "description": "Primary interaction reaches every documented state",
      "automated": true
    },
    {
      "id": "affordance-count",
      "kind": "structure",
      "description": "Every control and indicator has exactly one owner and no duplicate rendering",
      "automated": true
    },
    {
      "id": "alignment-primary",
      "kind": "visual-structure",
      "description": "Primary peer elements share the intended alignment axis",
      "automated": true
    },
    {
      "id": "visual-review",
      "kind": "human-review",
      "description": "Codex reviewed fresh desktop and mobile captures against the reference brief",
      "automated": false
    }
  ]
}
```

- [ ] **Step 6: Write the operator runbook**

The README must list Gates 0–8 from the approved spec, exact CLI commands, required evidence filenames, the cache-busting rule, and this explicit statement:

```markdown
Automation can prove declared structure and behavior. It cannot decide whether a
composition looks coherent. A packet cannot advance from `green` to `reviewed`
until Codex has inspected fresh screenshots and the actual DOM/CSS cascade.
```

Include the OAuth recovery command `codex mcp login relume`, but do not store or document tokens.

- [ ] **Step 7: Run template and CLI tests**

Run: `node --test scripts/relume-workflow.test.mjs`

Expected: all tests PASS.

- [ ] **Step 8: Commit Task 3**

```bash
git add docs/workflows/relume-to-ren10 scripts/relume-workflow.test.mjs
git commit -m "docs: add Relume workflow templates"
```

---

### Task 4: Deterministic render-matrix capture

**Files:**
- Create: `tests/utils/static-server.cjs`
- Create: `scripts/capture-block-matrix.mjs`
- Create: `scripts/capture-block-matrix.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces `startStaticServer(root)` returning `{ origin, close }`.
- Produces `validateRenderMatrix(matrix)` and `captureMatrix({ matrixPath, repoRoot, outputRoot })`.
- Consumes a `render-matrix.json` whose actions are `{ type: 'click'|'press'|'focus', selector?, key? }`.

- [ ] **Step 1: Write failing matrix validation and cache-busting tests**

Create `scripts/capture-block-matrix.test.mjs`:

```js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildStateUrl, validateRenderMatrix } from './capture-block-matrix.mjs';

const matrix = {
  version: 1,
  path: '/templates/blocks/nav-mega-menu.html',
  root: '[data-rbm-root]',
  states: [{
    id: 'desktop-light-open',
    viewport: { width: 1280, height: 1024 },
    theme: 'light',
    javaScript: true,
    reducedMotion: false,
    actions: [{ type: 'click', selector: '.rbm-disclosure > summary' }],
  }],
};

test('validateRenderMatrix accepts a complete state', () => {
  assert.deepEqual(validateRenderMatrix(matrix), []);
});

test('validateRenderMatrix rejects duplicate state ids', () => {
  const duplicate = { ...matrix, states: [matrix.states[0], matrix.states[0]] };
  assert.deepEqual(validateRenderMatrix(duplicate), ['Duplicate render state id: desktop-light-open']);
});

test('buildStateUrl always includes a unique workflow cache key', () => {
  assert.equal(
    buildStateUrl('http://127.0.0.1:8000', matrix.path, 'navbar5-desktop-light-open'),
    'http://127.0.0.1:8000/templates/blocks/nav-mega-menu.html?ren10_capture=navbar5-desktop-light-open',
  );
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/capture-block-matrix.test.mjs`

Expected: FAIL because `capture-block-matrix.mjs` does not exist.

- [ ] **Step 3: Extract the safe static server**

Move the safe path-normalization logic currently duplicated in `blocks-navigation.spec.cjs` into `tests/utils/static-server.cjs` using this complete implementation:

```js
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

async function startStaticServer(root) {
  const resolvedRoot = path.resolve(root);
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
    const filePath = path.normalize(path.join(resolvedRoot, pathname));
    if (!filePath.startsWith(`${resolvedRoot}${path.sep}`) && filePath !== resolvedRoot) {
      response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
      response.end('Forbidden');
      return;
    }
    fs.readFile(filePath, (error, data) => {
      if (error) {
        response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
      }
      const extension = path.extname(filePath);
      const headers = { 'content-type': CONTENT_TYPES[extension] || 'application/octet-stream' };
      if (['.html', '.css', '.js'].includes(extension)) headers['cache-control'] = 'no-store';
      response.writeHead(200, headers);
      response.end(data);
    });
  });
  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolveClose, rejectClose) => {
      server.close((error) => (error ? rejectClose(error) : resolveClose()));
    }),
  };
}

module.exports = { startStaticServer };
```

The server returns 403 for traversal, 404 for missing files, and `Cache-Control: no-store` for HTML, CSS, and JavaScript so browser evidence cannot be stale.

- [ ] **Step 4: Implement matrix validation and URL construction**

Create `scripts/capture-block-matrix.mjs` with named exports:

```js
export function buildStateUrl(origin, pagePath, cacheKey) {
  const url = new URL(pagePath, origin);
  url.searchParams.set('ren10_capture', cacheKey);
  return url.href;
}

export function validateRenderMatrix(matrix) {
  const errors = [];
  if (matrix.version !== 1) errors.push('Render matrix version must equal 1');
  if (!matrix.path?.startsWith('/')) errors.push('Render matrix path must start with /');
  if (!matrix.root) errors.push('Render matrix root selector is required');
  const ids = new Set();
  for (const state of matrix.states ?? []) {
    if (ids.has(state.id)) errors.push(`Duplicate render state id: ${state.id}`);
    ids.add(state.id);
    if (!state.viewport?.width || !state.viewport?.height) errors.push(`State ${state.id} requires viewport width and height`);
    if (!['light', 'dark'].includes(state.theme)) errors.push(`State ${state.id} has invalid theme`);
    if (!Array.isArray(state.actions)) errors.push(`State ${state.id} actions must be an array`);
  }
  return errors.sort();
}
```

- [ ] **Step 5: Implement Playwright capture**

Implement `captureMatrix` with this exact control flow:

```js
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { startStaticServer } = require('../tests/utils/static-server.cjs');

async function runAction(page, action) {
  if (action.type === 'click') return page.locator(action.selector).click();
  if (action.type === 'focus') return page.locator(action.selector).focus();
  if (action.type === 'press') {
    if (action.selector) await page.locator(action.selector).focus();
    return page.keyboard.press(action.key);
  }
  throw new Error(`Unsupported render action: ${action.type}`);
}

async function collectMarkerCounts(page, expectedMarkers = {}) {
  const result = {};
  for (const [selector, expected] of Object.entries(expectedMarkers)) {
    const actual = await page.locator(selector).count();
    if (actual !== expected) {
      throw new Error(`Stale or incorrect DOM for ${selector}: expected ${expected}, received ${actual}`);
    }
    result[selector] = actual;
  }
  return result;
}

export async function captureMatrix({ matrixPath, moduleId, repoRoot, outputRoot }) {
  const matrix = JSON.parse(await readFile(matrixPath, 'utf8'));
  const errors = validateRenderMatrix(matrix);
  if (errors.length) throw new Error(errors.join('\n'));
  const server = await startStaticServer(repoRoot);
  const browser = await chromium.launch();
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' }).trim();
  const moduleRoot = join(outputRoot, moduleId);
  await mkdir(moduleRoot, { recursive: true });
  try {
    for (const state of matrix.states) {
      const context = await browser.newContext({
        viewport: state.viewport,
        colorScheme: state.theme,
        javaScriptEnabled: state.javaScript !== false,
        reducedMotion: state.reducedMotion ? 'reduce' : 'no-preference',
      });
      try {
        const page = await context.newPage();
        const url = buildStateUrl(server.origin, matrix.path, `${moduleId}-${state.id}-${commit.slice(0, 12)}`);
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.evaluate((theme) => document.documentElement.setAttribute('data-theme', theme), state.theme);
        for (const action of state.actions) await runAction(page, action);
        await page.locator(matrix.root).waitFor({ state: 'visible' });
        const markerCounts = await collectMarkerCounts(page, state.expectedMarkers);
        await page.screenshot({ path: join(moduleRoot, `${state.id}.png`), fullPage: true });
        await writeFile(join(moduleRoot, `${state.id}.json`), `${JSON.stringify({
          id: state.id,
          url,
          viewport: state.viewport,
          theme: state.theme,
          javaScript: state.javaScript !== false,
          reducedMotion: Boolean(state.reducedMotion),
          markerCounts,
          commit,
          capturedAt: new Date().toISOString(),
        }, null, 2)}\n`);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }
}
```

The CLI argument branch resolves `matrixPath`, requires `--module` and `--output`, calls `captureMatrix`, prints the number of captured states, and exits nonzero through the existing `main().catch` pattern.

`captureMatrix` therefore:

1. Validate the matrix before launching Chromium.
2. Start the shared static server.
3. Create a fresh context per state with its viewport, color scheme, JavaScript setting, and reduced-motion preference.
4. Navigate with `waitUntil: 'networkidle'` to a cache-busted URL.
5. Set `data-theme` explicitly after navigation.
6. Execute only allowlisted action types.
7. Assert the configured root exists and is visible.
8. Save `<module>/<state-id>.png` plus `<module>/<state-id>.json` containing URL, viewport, theme, DOM marker counts, timestamp, and git commit.
9. Close context/server in `finally` blocks.

The CLI invocation must be:

```bash
node scripts/capture-block-matrix.mjs \
  docs/workflows/relume-to-ren10/modules/navbar5/render-matrix.json \
  --module navbar5 \
  --output .ren10-workflow/captures
```

- [ ] **Step 6: Add package script and output ignore**

Add:

```json
"workflow:relume:capture": "node scripts/capture-block-matrix.mjs"
```

Add to `.gitignore`:

```gitignore
.ren10-workflow/
.playwright-cli/
output/playwright/
output/playwright-verify/
```

- [ ] **Step 7: Run unit tests and a smoke capture**

Run:

```bash
node --test scripts/capture-block-matrix.test.mjs
node scripts/capture-block-matrix.mjs docs/workflows/relume-to-ren10/modules/navbar5/render-matrix.json --module navbar5 --output .ren10-workflow/captures
```

During this task the second command is expected to fail with a clear `ENOENT` until Task 6 creates the pilot matrix. Confirm the failure is the missing matrix, not a browser error.

- [ ] **Step 8: Commit Task 4**

```bash
git add .gitignore package.json scripts/capture-block-matrix.mjs scripts/capture-block-matrix.test.mjs tests/utils/static-server.cjs
git commit -m "feat: add block render matrix capture"
```

---

### Task 5: Reusable structural-visual quality assertions

**Files:**
- Create: `tests/utils/block-quality.cjs`
- Create: `tests/utils/block-quality.spec.cjs`
- Create: `tests/components/fixtures/block-quality.html`

**Interfaces:**
- Produces Playwright-aware helpers:
  - `expectSingleVisibleAffordance(page, selectors, label)`
  - `expectAligned(page, selectors, axis, tolerancePx)`
  - `expectWidthRatio(page, subject, container, minimum, maximum)`
  - `expectNoOverflow(page, rootSelector)`
  - `inspectNativeChrome(page, selector)`
- Consumes only a Playwright `page` and selectors; no block-specific classes.

- [ ] **Step 1: Create a deliberately defective fixture**

Create `tests/components/fixtures/block-quality.html` containing:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    .peer { display: inline-block; height: 44px; }
    .misaligned { transform: translateY(8px); }
    .container { width: 300px; }
    .narrow { width: 60px; }
    .overflow { width: 400px; }
    details { border: 1px solid; padding: 12px; margin: 8px; }
  </style>
</head>
<body>
  <div id="good-affordance" aria-hidden="true">⌄</div>
  <div id="duplicate-a" aria-hidden="true">⌄</div>
  <div id="duplicate-b" aria-hidden="true">⌄</div>
  <span class="peer" id="peer-a">A</span>
  <span class="peer misaligned" id="peer-b">B</span>
  <div class="container" id="container"><div class="narrow" id="narrow"></div></div>
  <div class="container"><div class="overflow" id="overflow"></div></div>
  <details id="native"><summary>Open</summary><p>Content</p></details>
</body>
</html>
```

- [ ] **Step 2: Write failing helper tests**

Create `tests/utils/block-quality.spec.cjs` using the component Playwright config and assert that each helper both passes a good case and throws a diagnostic containing measured values for the bad case.

```js
const { test, expect } = require('@playwright/test');
const {
  expectAligned,
  expectNoOverflow,
  expectSingleVisibleAffordance,
  expectWidthRatio,
  inspectNativeChrome,
} = require('./block-quality.cjs');

test.beforeEach(async ({ page }) => {
  await page.goto(`file://${process.cwd()}/tests/components/fixtures/block-quality.html`);
});

test('single-affordance helper reports duplicates', async ({ page }) => {
  await expectSingleVisibleAffordance(page, ['#good-affordance'], 'good chevron');
  await expect(
    expectSingleVisibleAffordance(page, ['#duplicate-a', '#duplicate-b'], 'menu chevron'),
  ).rejects.toThrow(/menu chevron: expected 1 visible affordance, received 2/);
});

test('alignment helper includes the measured delta', async ({ page }) => {
  await expect(expectAligned(page, ['#peer-a', '#peer-b'], 'centerY', 1)).rejects.toThrow(/delta 8/);
});

test('native chrome inspection exposes border padding margin and pseudo content', async ({ page }) => {
  const chrome = await inspectNativeChrome(page, '#native');
  expect(chrome.borderTopWidth).toBe('1px');
  expect(chrome.paddingTop).toBe('12px');
  expect(chrome.marginTop).toBe('8px');
});
```

- [ ] **Step 3: Run and verify RED**

Run:

```bash
npx playwright test --config tests/components/playwright.config.cjs tests/utils/block-quality.spec.cjs --project="Desktop Light"
```

Expected: FAIL because `block-quality.cjs` does not exist.

- [ ] **Step 4: Implement the reusable measurements**

Create `tests/utils/block-quality.cjs` with the complete helper surface:

```js
function isVisibleMetric(metric) {
  return metric.display !== 'none'
    && metric.visibility !== 'hidden'
    && metric.width > 0
    && metric.height > 0;
}

async function elementMetrics(page, selectors) {
  const metrics = [];
  for (const selector of selectors) {
    const values = await page.locator(selector).evaluateAll((elements, sourceSelector) => elements.map((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        selector: sourceSelector,
        display: style.display,
        visibility: style.visibility,
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
      };
    }), selector);
    metrics.push(...values);
  }
  return metrics;
}

async function expectSingleVisibleAffordance(page, selectors, label) {
  const elements = (await elementMetrics(page, selectors)).filter(isVisibleMetric);
  if (elements.length !== 1) {
    throw new Error(`${label}: expected 1 visible affordance, received ${elements.length}`);
  }
}

async function expectAligned(page, selectors, axis, tolerancePx = 1) {
  if (!['top', 'centerY', 'left', 'centerX'].includes(axis)) throw new Error(`Unsupported alignment axis: ${axis}`);
  const elements = (await elementMetrics(page, selectors)).filter(isVisibleMetric);
  if (elements.length < 2) throw new Error(`Alignment requires at least 2 visible elements; received ${elements.length}`);
  const values = elements.map((metric) => metric[axis]);
  const delta = Math.max(...values) - Math.min(...values);
  if (delta > tolerancePx) throw new Error(`${axis} alignment delta ${Math.round(delta * 100) / 100}px exceeds ${tolerancePx}px`);
}

async function expectWidthRatio(page, subject, container, minimum, maximum) {
  const measurement = await page.evaluate(({ subjectSelector, containerSelector }) => {
    const subjectElement = document.querySelector(subjectSelector);
    const containerElement = document.querySelector(containerSelector);
    if (!subjectElement || !containerElement) return null;
    return subjectElement.getBoundingClientRect().width / containerElement.getBoundingClientRect().width;
  }, { subjectSelector: subject, containerSelector: container });
  if (measurement === null) throw new Error(`Width ratio elements missing: ${subject} / ${container}`);
  if (measurement < minimum || measurement > maximum) {
    throw new Error(`Width ratio ${measurement.toFixed(3)} outside ${minimum}..${maximum} for ${subject}`);
  }
}

async function expectNoOverflow(page, rootSelector) {
  const result = await page.locator(rootSelector).evaluate((root) => ({
    scrollWidth: root.scrollWidth,
    clientWidth: root.clientWidth,
  }));
  if (result.scrollWidth > result.clientWidth + 1) {
    throw new Error(`Horizontal overflow: scrollWidth ${result.scrollWidth}, clientWidth ${result.clientWidth}`);
  }
}

async function inspectNativeChrome(page, selector) {
  return page.locator(selector).evaluate((element) => {
    const style = getComputedStyle(element);
    const after = getComputedStyle(element, '::after');
    const marker = getComputedStyle(element, '::marker');
    return {
      borderTopWidth: style.borderTopWidth,
      paddingTop: style.paddingTop,
      marginTop: style.marginTop,
      afterContent: after.content,
      afterDisplay: after.display,
      markerContent: marker.content,
      markerDisplay: marker.display,
    };
  });
}

module.exports = {
  expectAligned,
  expectNoOverflow,
  expectSingleVisibleAffordance,
  expectWidthRatio,
  inspectNativeChrome,
};
```

The helper intentionally measures authored elements. When a block uses a pseudo-element affordance, its block-specific test must inspect `inspectNativeChrome` and count the pseudo-element separately.

Do not import block selectors or hardcode navbar assumptions.

- [ ] **Step 5: Run helper tests and lint**

Run:

```bash
npx playwright test --config tests/components/playwright.config.cjs tests/utils/block-quality.spec.cjs --project="Desktop Light"
npm run lint:js
```

Expected: all helper tests PASS and no new ESLint warnings.

- [ ] **Step 6: Commit Task 5**

```bash
git add tests/components/fixtures/block-quality.html tests/utils/block-quality.cjs tests/utils/block-quality.spec.cjs
git commit -m "test: add reusable block quality assertions"
```

---

### Task 6: Pilot the workflow on Navbar 5 / Mega Menu

**Files:**
- Create: `docs/workflows/relume-to-ren10/modules/navbar5/packet.json`
- Create: `docs/workflows/relume-to-ren10/modules/navbar5/reference-brief.md`
- Create: `docs/workflows/relume-to-ren10/modules/navbar5/translation-map.md`
- Create: `docs/workflows/relume-to-ren10/modules/navbar5/acceptance.json`
- Create: `docs/workflows/relume-to-ren10/modules/navbar5/render-matrix.json`
- Create: `docs/workflows/relume-to-ren10/modules/navbar5/evidence.json`
- Modify: `tests/components/blocks-navigation.spec.cjs`

**Interfaces:**
- Consumes: Tasks 1–5 CLI, templates, capture runner, static server, and quality helpers.
- Produces: the canonical example packet later modules copy and a fully captured matrix in ignored `.ren10-workflow/captures/navbar5/`.

- [ ] **Step 1: Write the sanitized reference and translation artifacts**

Populate the reference brief with only previously verified facts: one desktop bar, one responsive link tree in Ren10, two groups of four destinations, two featured articles, one dropdown indicator, category-heavy desktop split, horizontal desktop articles, stacked mobile articles, and the source's mobile/desktop state distinctions.

The translation map must explicitly record:

- `ren-nav` shell;
- native `details/summary` disclosure;
- `base/classless.css` `details`, `summary::after`, and open-divider collision;
- Ren10 `48rem` breakpoint as an intentional difference;
- one-tree progressive enhancement;
- block-local reset ownership;
- why `ren-menu` and top-layer popovers were rejected.

- [ ] **Step 2: Write packet, acceptance, and evidence JSON**

Use this packet metadata:

```json
{
  "version": 1,
  "family": "navbars",
  "moduleId": "navbar5",
  "blockSlug": "nav-mega-menu",
  "blockPath": "templates/blocks/nav-mega-menu.html",
  "stage": "accepted",
  "allowedFiles": [
    "templates/blocks/nav-mega-menu.html",
    "templates/blocks/index.html",
    "tests/components/blocks-navigation.spec.cjs"
  ],
  "evidence": {
    "reference": "evidence.json",
    "mapped": "evidence.json",
    "red": "evidence.json",
    "green": "evidence.json",
    "reviewed": "evidence.json"
  }
}
```

`evidence.json` records commit `73d1416`, RED failures from the rebuild, GREEN `30 passed`, lint/agent checks, and fresh screenshot identifiers. It must not claim screenshots exist in committed paths; the capture paths point to ignored `.ren10-workflow/captures/navbar5/`.

- [ ] **Step 3: Define the full render matrix**

Create states for:

- desktop light closed/open;
- desktop dark closed/open;
- mobile light closed/navigation-open/nested-open;
- mobile dark nested-open;
- mobile JavaScript-disabled native disclosure open;
- desktop reduced-motion open.

Every open state uses selector actions, not text queries. Every state declares `expectedMarkers`, such as `.rbm-dest-desc: 8` and `.rbm-chevron: 1`, so the capture runner can reject stale DOM before saving evidence.

- [ ] **Step 4: Add a failing test for shared-helper adoption**

Before refactoring, add an assertion in `blocks-navigation.spec.cjs` that imports `tests/utils/block-quality.cjs` and uses `expectSingleVisibleAffordance`, `expectAligned`, `expectWidthRatio`, `expectNoOverflow`, and `inspectNativeChrome`. Run the focused suite and confirm RED if any current inline measurement does not match the helper contract.

- [ ] **Step 5: Refactor duplicated inline measurements**

Replace only duplicated logic. Preserve all current behavior, axe, keyboard, fallback, touch, theme, and reconnect tests. Do not delete a block-specific assertion merely because a generic helper exists.

- [ ] **Step 6: Validate packet and capture all states**

Run:

```bash
npm run workflow:relume -- validate docs/workflows/relume-to-ren10/modules/navbar5
npm run workflow:relume:capture -- docs/workflows/relume-to-ren10/modules/navbar5/render-matrix.json --module navbar5 --output .ren10-workflow/captures
find .ren10-workflow/captures/navbar5 -type f -name '*.png' | wc -l
```

Expected: packet valid; capture command exits 0; screenshot count equals the matrix state count (`10`).

- [ ] **Step 7: Run the focused and workflow suites**

Run:

```bash
npx playwright test --config tests/components/playwright.config.cjs tests/components/blocks-navigation.spec.cjs --retries=0
node --test scripts/relume-workflow.test.mjs scripts/capture-block-matrix.test.mjs
```

Expected: navigation suite remains `30 passed`; all workflow unit tests PASS.

- [ ] **Step 8: Commit Task 6**

```bash
git add docs/workflows/relume-to-ren10/modules/navbar5 tests/components/blocks-navigation.spec.cjs
git commit -m "test: pilot Relume workflow on mega menu"
```

---

### Task 7: Family inventory, routing, and repository gates

**Files:**
- Create: `docs/workflows/relume-to-ren10/inventory.json`
- Modify: `scripts/lib/relume-workflow.mjs`
- Modify: `scripts/relume-workflow.test.mjs`
- Modify: `AGENTS.md`
- Modify: `package.json`
- Modify: `docs/workflows/relume-to-ren10/README.md`

**Interfaces:**
- Consumes: accepted pilot packet and CLI.
- Produces `validateInventory(inventory, modulesRoot)` and makes `workflow:relume:check` validate every inventory entry.

- [ ] **Step 1: Write failing inventory validation tests**

Add explicit tests for duplicate module IDs, nonexistent packet paths, more than one `in_progress` module, and accepted inventory entries whose packet is not accepted:

```js
test('inventory permits at most one in-progress module', async () => {
  const inventory = {
    version: 1,
    families: [{
      id: 'navbars',
      modules: [
        { id: 'navbar5', status: 'in_progress', packet: 'navbar5' },
        { id: 'navbar6', status: 'in_progress', packet: 'navbar6' },
      ],
    }],
  };
  const { validateInventory } = await import('./lib/relume-workflow.mjs');
  assert.deepEqual(
    (await validateInventory(inventory, '/tmp/modules')).errors,
    ['Inventory may contain only one in_progress module; found navbar5, navbar6'],
  );
});

test('inventory rejects duplicate module ids across families', async () => {
  const inventory = {
    version: 1,
    families: [
      { id: 'navbars', modules: [{ id: 'navbar5', status: 'queued' }] },
      { id: 'headers', modules: [{ id: 'navbar5', status: 'queued' }] },
    ],
  };
  const { validateInventory } = await import('./lib/relume-workflow.mjs');
  const result = await validateInventory(inventory, '/tmp/modules');
  assert.deepEqual(result.errors, ['Duplicate inventory module id: navbar5']);
});

test('accepted inventory entry requires an accepted packet', async () => {
  const modulesRoot = await mkdtemp(join(tmpdir(), 'ren10-inventory-'));
  roots.push(modulesRoot);
  const packetDir = await makePacket({ stage: 'green' });
  await mkdir(join(modulesRoot, 'navbar5'));
  for (const file of ['packet.json', 'reference-brief.md', 'translation-map.md', 'acceptance.json', 'render-matrix.json']) {
    await copyFile(join(packetDir, file), join(modulesRoot, 'navbar5', file));
  }
  const inventory = {
    version: 1,
    families: [{ id: 'navbars', modules: [{ id: 'navbar5', status: 'accepted', packet: 'navbar5' }] }],
  };
  const { validateInventory } = await import('./lib/relume-workflow.mjs');
  const result = await validateInventory(inventory, modulesRoot);
  assert.deepEqual(result.errors, ['Accepted module navbar5 has packet stage green; expected accepted']);
});
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test scripts/relume-workflow.test.mjs`

Expected: FAIL because `validateInventory` is not exported.

- [ ] **Step 3: Implement inventory validation**

Add `validateInventory` with deterministic sorted errors. It must validate:

- `version === 1`;
- unique family IDs and module IDs;
- statuses limited to `queued`, `in_progress`, `accepted`, `skipped`;
- at most one `in_progress` module globally;
- packet directory exists for `in_progress` and `accepted` entries;
- accepted inventory entries have an accepted packet;
- skipped entries include a non-empty reason.

- [ ] **Step 4: Create the initial inventory**

Create:

```json
{
  "version": 1,
  "families": [
    {
      "id": "navbars",
      "sourceCategory": "navbars",
      "status": "in_progress",
      "baseline": "navbar5",
      "modules": [
        {
          "id": "navbar5",
          "status": "accepted",
          "packet": "navbar5",
          "ren10Block": "templates/blocks/nav-mega-menu.html"
        }
      ]
    }
  ]
}
```

Do not invent the remaining navbar IDs from memory. Populate additional modules only after a successful authenticated category query.

- [ ] **Step 5: Route future agents through the workflow**

Add an `## Relume-to-Ren10 Blocks` section to `AGENTS.md` after the Agent CLI section. It must require:

1. Read the approved workflow runbook.
2. Run `npm run workflow:relume -- status <packet-dir>`.
3. Refuse implementation without a valid reference/map/acceptance packet.
4. Capture the standard render matrix.
5. Keep user review after the Codex visual gate.

Do not change the existing mandatory RenDS loading order or hard rules.

- [ ] **Step 6: Add workflow checks to portable validation**

Change package scripts to:

```json
"workflow:relume:check": "node scripts/relume-workflow.mjs validate-all docs/workflows/relume-to-ren10/inventory.json",
"test:workflow": "node --test scripts/relume-workflow.test.mjs scripts/capture-block-matrix.test.mjs",
"test:portable": "npm run test:a11y && npm run test:components && npm run test:theme && npm run test:evals && npm run test:exports && npm run test:knowledge-package && npm run smoke:cli-copy && npm run test:release-policy && npm run test:workflow && npm run workflow:relume:check"
```

Implement `validate-all` in the CLI before changing `test:portable`.

- [ ] **Step 7: Run complete repository verification**

Run:

```bash
npm run test:workflow
npm run workflow:relume:check
npm run lint
npm run agent:check
npm test
rg -n "rends/design\.md|DESIGN\.md|COMPONENT\.md|PATTERN\.md|TOKENS\.md|LAYOUTS\.md|PRIMITIVE-ZERO\.md|COMPONENTS\.md" . --glob '!node_modules/**'
find components/primitives -mindepth 2 -maxdepth 2 -type f -name component.md | wc -l
find components/composites -mindepth 2 -maxdepth 2 -type f -name component.md | wc -l
find components/patterns -mindepth 2 -maxdepth 2 -type f -name pattern.md | wc -l
git diff --check
```

Expected:

- all commands exit 0;
- stale-reference search produces no matches;
- counts are `19`, `26`, and `8`;
- no changed files outside this plan and pre-existing user-owned dirty files;
- `.ren10-workflow/`, `.playwright-cli/`, and local output screenshots remain untracked/ignored.

- [ ] **Step 8: Perform the workflow's own visual gate**

Codex opens every pilot capture from `.ren10-workflow/captures/navbar5/`, compares it with the pilot reference brief, and records in `evidence.json`:

- reviewer identity `Codex`;
- reviewed commit;
- exact capture IDs reviewed;
- declared intentional differences;
- result `pass` or `fail`;
- no unresolved basic alignment, duplicate-affordance, stacking, or cascade defect.

If the result is `fail`, do not commit Task 7. Add a regression criterion, return to the failing task, and repeat capture/review.

- [ ] **Step 9: Commit Task 7**

```bash
git add AGENTS.md package.json scripts/lib/relume-workflow.mjs scripts/relume-workflow.mjs scripts/relume-workflow.test.mjs docs/workflows/relume-to-ren10
git commit -m "feat: enforce Relume to Ren10 workflow"
```

---

## Execution Notes

- Execute tasks sequentially because Tasks 2–7 consume interfaces created earlier.
- Use Grok for bounded implementation steps, but Codex must review each task's diff and test output before the task commit.
- Do not allow Grok to call Relume from a non-interactive session unless OAuth has been verified there. Codex may extract the reference and provide the sanitized brief instead.
- The currently expired Relume OAuth token must be renewed with `codex mcp login relume` immediately before the first new family/module extraction, not while building the offline workflow tooling.
- The first module after this automation should remain in the `navbars` family so the workflow is validated against a related variant before expanding to another family.
