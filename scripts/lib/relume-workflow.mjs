import { access, copyFile, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { randomBytes } from 'node:crypto';

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

/** Built-in scaffold defaults — complete enough to validate; not proof of extraction. */
export const DEFAULT_REFERENCE_BRIEF = `# Reference Brief

## Retrieved facts

- Scaffold placeholder. Replace after complete Relume source inspection via relume-mcp.
- This packet was created by workflow init; facts above are not yet retrieved.
`;

export const DEFAULT_TRANSLATION_MAP = `# Translation Map

## Cascade risks

- Scaffold placeholder. Document cascade risks after mapping Relume structure to RenDS.
- No cascade analysis has been completed yet.
`;

export const DEFAULT_ACCEPTANCE = Object.freeze({
  version: 1,
  criteria: Object.freeze([
    Object.freeze({
      id: 'scaffold-baseline',
      kind: 'structure',
      description: 'Baseline scaffold criterion — replace with block-specific acceptance criteria after mapping',
      automated: false,
    }),
  ]),
});

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

async function readJsonArtifact(file, label) {
  try {
    return { data: await readJson(file), error: null };
  } catch (error) {
    return { data: null, error: `Invalid ${label}: ${error.message}` };
  }
}

function isPathInside(parentDir, childPath) {
  const parent = resolve(parentDir);
  const child = resolve(childPath);
  if (parent === child) return false;
  const rel = relative(parent, child);
  if (rel === '' || isAbsolute(rel) || rel === '..') return false;
  return !rel.startsWith(`..${sep}`);
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

  const { data: acceptance, error: acceptanceError } = await readJsonArtifact(
    join(packetDir, 'acceptance.json'),
    'acceptance.json',
  );
  if (acceptanceError) {
    errors.push(acceptanceError);
  } else if (!Array.isArray(acceptance.criteria) || acceptance.criteria.length === 0) {
    errors.push('acceptance.json criteria must be a non-empty array');
  }

  const { data: matrix, error: matrixError } = await readJsonArtifact(
    join(packetDir, 'render-matrix.json'),
    'render-matrix.json',
  );
  if (matrixError) {
    errors.push(matrixError);
  } else if (!Array.isArray(matrix.states)) {
    errors.push('render-matrix.json states must be an array');
  }

  return { valid: errors.length === 0, errors: errors.sort(), packet };
}

async function writeScaffoldArtifacts(packetDir, {
  family,
  moduleId,
  blockSlug,
  blockPath,
  testPath,
  templateRoot,
}) {
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

  if (templateRoot) {
    for (const [source, target] of [
      ['reference-brief.md', 'reference-brief.md'],
      ['translation-map.md', 'translation-map.md'],
      ['acceptance.json', 'acceptance.json'],
    ]) {
      await copyFile(join(templateRoot, source), join(packetDir, target));
    }
  } else {
    await writeFile(join(packetDir, 'reference-brief.md'), DEFAULT_REFERENCE_BRIEF);
    await writeFile(join(packetDir, 'translation-map.md'), DEFAULT_TRANSLATION_MAP);
    await writeFile(
      join(packetDir, 'acceptance.json'),
      `${JSON.stringify(DEFAULT_ACCEPTANCE, null, 2)}\n`,
    );
  }

  await writeFile(join(packetDir, 'render-matrix.json'), `${JSON.stringify({
    version: 1,
    path: `/${blockPath}`,
    root: '[data-block-root]',
    states: [],
  }, null, 2)}\n`);
}

export async function scaffoldPacket({ root, family, moduleId, blockSlug, blockPath, testPath, templateRoot }) {
  if (family !== 'navbars' && !testPath) {
    throw new Error('--test-path is required for non-navbar families');
  }

  await mkdir(root, { recursive: true });
  const packetDir = join(root, moduleId);
  if (await exists(packetDir)) {
    throw new Error(`Workflow packet already exists: ${packetDir}`);
  }

  const tempDir = join(root, `.${moduleId}.${randomBytes(8).toString('hex')}.tmp`);
  try {
    await mkdir(tempDir, { recursive: false });
    await writeScaffoldArtifacts(tempDir, {
      family,
      moduleId,
      blockSlug,
      blockPath,
      testPath,
      templateRoot,
    });
    await rename(tempDir, packetDir);
  } catch (error) {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    throw error;
  }

  return packetDir;
}

export async function advancePacket(packetDir, evidencePath) {
  const packetPath = join(packetDir, 'packet.json');
  const packet = await readJson(packetPath);
  const currentStage = packet.stage;
  const target = nextStage(currentStage);
  if (!target) throw new Error('Workflow packet is already accepted');

  if (!(await exists(evidencePath))) {
    throw new Error(`Evidence file not found: ${evidencePath}`);
  }

  if (!isPathInside(packetDir, evidencePath)) {
    throw new Error('Evidence file must be inside the packet directory');
  }

  const packetRelative = relative(resolve(packetDir), resolve(evidencePath)).split('\\').join('/');

  let evidence;
  try {
    const raw = await readFile(evidencePath, 'utf8');
    if (!raw.trim()) {
      throw new Error('Evidence file is empty');
    }
    evidence = JSON.parse(raw);
  } catch (error) {
    if (error instanceof SyntaxError || /JSON|empty/i.test(error.message)) {
      throw new Error(`Evidence file must be valid JSON: ${error.message}`);
    }
    throw error;
  }

  if (evidence === null || typeof evidence !== 'object' || Array.isArray(evidence)) {
    throw new Error('Evidence file must be a JSON object');
  }

  if (evidence.stage !== currentStage) {
    throw new Error(
      `Evidence stage must equal current packet stage (${currentStage}), got: ${JSON.stringify(evidence.stage)}`,
    );
  }
  if (evidence.passed !== true) {
    throw new Error(`Evidence passed must be true, got: ${JSON.stringify(evidence.passed)}`);
  }

  if (currentStage === 'reference') {
    if (evidence.source !== 'relume-mcp') {
      throw new Error(
        `Reference evidence source must be "relume-mcp" (OAuth/memory cannot advance reference), got: ${JSON.stringify(evidence.source)}`,
      );
    }
    if (evidence.completeSource !== true) {
      throw new Error(
        `Reference evidence completeSource must be true (incomplete source cannot advance reference), got: ${JSON.stringify(evidence.completeSource)}`,
      );
    }
  }

  packet.evidence ??= {};
  packet.evidence[currentStage] = packetRelative;
  packet.stage = target;
  await writeFile(packetPath, `${JSON.stringify(packet, null, 2)}\n`);
  return packet;
}
