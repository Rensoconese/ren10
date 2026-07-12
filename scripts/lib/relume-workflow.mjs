import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

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

async function readJsonArtifact(file, label) {
  try {
    return { data: await readJson(file), error: null };
  } catch (error) {
    return { data: null, error: `Invalid ${label}: ${error.message}` };
  }
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

export async function scaffoldPacket({ root, family, moduleId, blockSlug, blockPath, testPath, templateRoot }) {
  if (family !== 'navbars' && !testPath) {
    throw new Error('--test-path is required for non-navbar families');
  }
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
