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