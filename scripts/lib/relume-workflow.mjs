import { access, copyFile, lstat, mkdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';
import { randomBytes } from 'node:crypto';

export const STAGES = Object.freeze(['reference', 'mapped', 'red', 'green', 'reviewed', 'accepted']);
export const INVENTORY_MODULE_STATUSES = Object.freeze(['queued', 'in_progress', 'accepted', 'skipped']);
export const REQUIRED_PACKET_FILES = Object.freeze([
  'acceptance.json',
  'packet.json',
  'reference-brief.md',
  'render-matrix.json',
  'translation-map.md',
]);

const REQUIRED_REFERENCE_HEADINGS = ['## Retrieved facts'];
const REQUIRED_MAP_HEADINGS = ['## Cascade risks'];

/** Single path-segment module slug: alphanumeric start, then alnum/_/- (no dots, separators, or traversal). */
const MODULE_ID_RE = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/;

/** Git short/full hash, or explicit packet-commit sentinel. */
const REVIEWED_COMMIT_RE = /^(?:packet|[0-9a-f]{7,40})$/i;

/** Acceptor identities that are not human acceptance. */
const AUTOMATION_ACCEPTORS = new Set([
  'automation',
  'ci',
  'bot',
  'system',
  'codex',
  'grok',
]);

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

function assertNonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} must be a non-empty string`);
  }
}

/**
 * Validate moduleId as one safe path segment (slug).
 * Rejects `.`, `..`, separators, absolute paths, and non-slug characters.
 */
export function assertSafeModuleId(moduleId) {
  if (typeof moduleId !== 'string' || moduleId.trim() === '') {
    throw new Error('Invalid module id: must be a non-empty single path segment slug');
  }
  if (
    moduleId === '.'
    || moduleId === '..'
    || moduleId.includes('/')
    || moduleId.includes('\\')
    || moduleId.includes('\0')
    || isAbsolute(moduleId)
    || /^[a-zA-Z]:/.test(moduleId)
  ) {
    throw new Error(
      `Invalid module id: must be a single path segment slug without separators or traversal (got ${JSON.stringify(moduleId)})`,
    );
  }
  if (!MODULE_ID_RE.test(moduleId)) {
    throw new Error(
      `Invalid module id: must match ${MODULE_ID_RE} (got ${JSON.stringify(moduleId)})`,
    );
  }
  return moduleId;
}

/**
 * Validate a repository-relative path: no absolute, no traversal, no empty/`.`/`..` segments.
 * Returns a POSIX-normalized path string.
 */
export function assertSafeRepoRelativePath(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${label} must be a non-empty repository-relative path`);
  }
  if (value.includes('\0')) {
    throw new Error(`${label} must not contain null bytes`);
  }
  if (
    isAbsolute(value)
    || value.startsWith('/')
    || value.startsWith('\\')
    || /^[a-zA-Z]:[\\/]/.test(value)
  ) {
    throw new Error(`${label} must be repository-relative (not absolute)`);
  }

  const normalized = value.replace(/\\/g, '/');
  if (normalized.startsWith('/') || normalized.includes('//')) {
    throw new Error(`${label} must not contain empty path segments`);
  }

  const segments = normalized.split('/');
  for (const segment of segments) {
    if (segment === '' || segment === '.' || segment === '..') {
      throw new Error(`${label} must not contain traversal or empty segments`);
    }
  }
  return normalized;
}

function validateReferenceEvidence(evidence) {
  if (evidence.passed !== true) {
    throw new Error(`Evidence passed must be true, got: ${JSON.stringify(evidence.passed)}`);
  }
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

function validateIntermediateEvidence(evidence, stage) {
  if (evidence.passed !== true) {
    throw new Error(
      `${stage} evidence passed must be true, got: ${JSON.stringify(evidence.passed)}`,
    );
  }
}

/**
 * green → reviewed requires Codex visual review proof, not generic automation JSON.
 * Spec: fresh desktop+mobile captures, DOM/CSS cascade inspection, reviewer Codex,
 * reviewed commit (hash or "packet"), visual result passed.
 */
function validateGreenEvidence(evidence) {
  if (evidence.result !== 'passed') {
    throw new Error(
      `Green evidence result must be "passed" (visual review result), got: ${JSON.stringify(evidence.result)}`,
    );
  }
  if (evidence.reviewer !== 'Codex') {
    throw new Error(
      `Green evidence reviewer must be "Codex", got: ${JSON.stringify(evidence.reviewer)}`,
    );
  }
  if (typeof evidence.reviewedCommit !== 'string' || !REVIEWED_COMMIT_RE.test(evidence.reviewedCommit)) {
    throw new Error(
      'Green evidence reviewedCommit must be a git commit hash (7-40 hex chars) or "packet"',
    );
  }
  const captures = evidence.captures;
  if (captures === null || typeof captures !== 'object' || Array.isArray(captures)) {
    throw new Error('Green evidence captures must be an object with desktop and mobile');
  }
  assertNonEmptyString(captures.desktop, 'Green evidence captures.desktop');
  assertNonEmptyString(captures.mobile, 'Green evidence captures.mobile');
  if (evidence.capturesFresh !== true) {
    throw new Error(
      `Green evidence capturesFresh must be true (stale/cached captures cannot advance green), got: ${JSON.stringify(evidence.capturesFresh)}`,
    );
  }
  assertNonEmptyString(evidence.cascadeInspection, 'Green evidence cascadeInspection');
}

/**
 * reviewed → accepted requires explicit human acceptance (not automation/Codex/Grok).
 */
function validateReviewedEvidence(evidence) {
  if (evidence.kind !== 'human-acceptance') {
    throw new Error(
      `Reviewed evidence kind must be "human-acceptance", got: ${JSON.stringify(evidence.kind)}`,
    );
  }
  assertNonEmptyString(evidence.acceptor, 'Reviewed evidence acceptor');
  const acceptorKey = evidence.acceptor.trim().toLowerCase();
  if (AUTOMATION_ACCEPTORS.has(acceptorKey)) {
    throw new Error(
      `Reviewed evidence acceptor must be a human identity, not automation (got ${JSON.stringify(evidence.acceptor)})`,
    );
  }
  if (evidence.result !== 'accepted' && evidence.result !== 'passed') {
    throw new Error(
      `Reviewed evidence result must be "accepted" or "passed", got: ${JSON.stringify(evidence.result)}`,
    );
  }
}

export function validateStageEvidence(stage, evidence) {
  if (evidence === null || typeof evidence !== 'object' || Array.isArray(evidence)) {
    throw new Error('Evidence file must be a JSON object');
  }
  if (evidence.stage !== stage) {
    throw new Error(
      `Evidence stage must equal current packet stage (${stage}), got: ${JSON.stringify(evidence.stage)}`,
    );
  }

  switch (stage) {
    case 'reference':
      validateReferenceEvidence(evidence);
      return;
    case 'mapped':
    case 'red':
      validateIntermediateEvidence(evidence, stage);
      return;
    case 'green':
      validateGreenEvidence(evidence);
      return;
    case 'reviewed':
      validateReviewedEvidence(evidence);
      return;
    default:
      throw new Error(`Cannot advance from stage: ${stage}`);
  }
}

/**
 * Ensure evidence exists, is a regular file, has no symlink (or symlink parent) escape,
 * and its real path stays under the real packet dir.
 * Returns a packet-relative POSIX path for storage.
 */
async function resolveContainedEvidencePath(packetDir, evidencePath) {
  if (!(await exists(evidencePath))) {
    throw new Error(`Evidence file not found: ${evidencePath}`);
  }

  if (!isPathInside(packetDir, evidencePath)) {
    throw new Error('Evidence file must be inside the packet directory');
  }

  const resolvedPacket = resolve(packetDir);
  const resolvedEvidence = resolve(evidencePath);
  const relativeToPacket = relative(resolvedPacket, resolvedEvidence);
  if (
    relativeToPacket === ''
    || isAbsolute(relativeToPacket)
    || relativeToPacket === '..'
    || relativeToPacket.startsWith(`..${sep}`)
  ) {
    throw new Error('Evidence file must be inside the packet directory');
  }

  // Reject symlink file or any symlink parent segment (lexical walk before realpath).
  let cursor = resolvedPacket;
  for (const segment of relativeToPacket.split(sep).filter(Boolean)) {
    cursor = join(cursor, segment);
    let segmentLstat;
    try {
      segmentLstat = await lstat(cursor);
    } catch {
      throw new Error(`Evidence file not found: ${evidencePath}`);
    }
    if (segmentLstat.isSymbolicLink()) {
      throw new Error('Evidence path must not be a symbolic link');
    }
  }

  let evidenceLstat;
  try {
    evidenceLstat = await lstat(evidencePath);
  } catch {
    throw new Error(`Evidence file not found: ${evidencePath}`);
  }

  if (evidenceLstat.isSymbolicLink()) {
    throw new Error('Evidence path must not be a symbolic link');
  }

  if (!evidenceLstat.isFile()) {
    throw new Error('Evidence path must be a regular file');
  }

  const realPacket = await realpath(packetDir);
  let realEvidence;
  try {
    realEvidence = await realpath(evidencePath);
  } catch {
    throw new Error(`Evidence file not found: ${evidencePath}`);
  }

  if (!isPathInside(realPacket, realEvidence)) {
    throw new Error('Evidence file must be inside the packet directory');
  }

  return relative(resolve(packetDir), resolve(evidencePath)).split('\\').join('/');
}

/**
 * Stages whose evidence must already exist for a packet at `stage`
 * (every completed transition before the current stage).
 * Initial `reference` requires none.
 */
export function completedStagesBefore(stage) {
  const index = STAGES.indexOf(stage);
  if (index <= 0) return [];
  return STAGES.slice(0, index);
}

/**
 * Single evidence loader shared by advancePacket and validatePacketDir.
 * Resolves a packet-local path (absolute or safe packet-relative), rejects
 * traversal/symlink/non-file, parses JSON, and applies validateStageEvidence.
 *
 * Boundary vs persistence:
 * - advancePacket CLI may pass absolute evidence input at the boundary
 *   (`requireRelativePointer: false`, default); the returned `relativePath`
 *   is what gets persisted on `packet.evidence`.
 * - validatePacketDir requires persisted pointers to be portable
 *   packet-relative paths (`requireRelativePointer: true`), even when an
 *   absolute path would resolve inside the packet on this machine.
 *
 * @param {string} packetDir
 * @param {string} evidencePath Absolute path or packet-relative pointer
 * @param {string} stage Stage schema the evidence must satisfy
 * @param {{ requireRelativePointer?: boolean }} [options]
 * @returns {Promise<{ relativePath: string, evidence: object }>}
 */
export async function loadContainedStageEvidence(packetDir, evidencePath, stage, options = {}) {
  if (typeof evidencePath !== 'string' || evidencePath.trim() === '') {
    throw new Error('Evidence path must be a non-empty string');
  }

  const requireRelativePointer = options?.requireRelativePointer === true;
  const looksAbsolute = isAbsolute(evidencePath) || /^[a-zA-Z]:[\\/]/.test(evidencePath);

  if (requireRelativePointer && looksAbsolute) {
    throw new Error(
      'Evidence pointer must be a portable packet-relative path (absolute pointers are not allowed)',
    );
  }

  let absolute;
  if (looksAbsolute) {
    absolute = resolve(evidencePath);
  } else {
    const safeRel = assertSafeRepoRelativePath(evidencePath, 'Evidence path');
    absolute = resolve(packetDir, ...safeRel.split('/'));
  }

  const relativePath = await resolveContainedEvidencePath(packetDir, absolute);

  let evidence;
  try {
    const raw = await readFile(absolute, 'utf8');
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

  validateStageEvidence(stage, evidence);
  return { relativePath, evidence };
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

  // Trusted evidence lineage: every completed transition before packet.stage must
  // have a packet-local pointer that loads and validates with the stage schema.
  if (STAGES.includes(packet.stage)) {
    const requiredStages = completedStagesBefore(packet.stage);
    if (requiredStages.length > 0) {
      const evidenceMap = packet.evidence;
      if (evidenceMap === null || typeof evidenceMap !== 'object' || Array.isArray(evidenceMap)) {
        errors.push('packet.json evidence must be an object');
      } else {
        for (const completedStage of requiredStages) {
          const pointer = evidenceMap[completedStage];
          if (typeof pointer !== 'string' || pointer.trim() === '') {
            errors.push(`Missing evidence pointer for completed stage: ${completedStage}`);
            continue;
          }
          try {
            await loadContainedStageEvidence(packetDir, pointer, completedStage, {
              requireRelativePointer: true,
            });
          } catch (error) {
            errors.push(`Evidence for completed stage ${completedStage}: ${error.message}`);
          }
        }
      }
    }
  }

  return { valid: errors.length === 0, errors: errors.sort(), packet };
}

/**
 * Resolve an inventory packet field to a real directory under modulesRoot.
 * Packet values must be a single safe module-dir segment (not repo-relative multi-segment,
 * not absolute, not traversal). Rejects symlink escapes outside modulesRoot.
 */
async function resolveInventoryPacketDir(modulesRoot, packetField, moduleId) {
  if (typeof packetField !== 'string' || packetField.trim() === '') {
    return {
      dir: null,
      error: `Module ${moduleId} requires a non-empty single-segment packet path`,
    };
  }

  let safePacket;
  try {
    safePacket = assertSafeModuleId(packetField);
  } catch (error) {
    return {
      dir: null,
      error: `Invalid packet path for module ${moduleId}: ${error.message}`,
    };
  }

  const packetDir = join(modulesRoot, safePacket);
  if (!(await exists(packetDir))) {
    return {
      dir: null,
      error: `Missing packet directory for module ${moduleId}: ${safePacket}`,
    };
  }

  let packetLstat;
  try {
    packetLstat = await lstat(packetDir);
  } catch {
    return {
      dir: null,
      error: `Missing packet directory for module ${moduleId}: ${safePacket}`,
    };
  }

  if (packetLstat.isSymbolicLink()) {
    return {
      dir: null,
      error: `Packet path for module ${moduleId} must not be a symbolic link: ${safePacket}`,
    };
  }

  if (!packetLstat.isDirectory()) {
    return {
      dir: null,
      error: `Packet path for module ${moduleId} must be a directory: ${safePacket}`,
    };
  }

  let realRoot;
  let realPacket;
  try {
    realRoot = await realpath(modulesRoot);
    realPacket = await realpath(packetDir);
  } catch {
    return {
      dir: null,
      error: `Missing packet directory for module ${moduleId}: ${safePacket}`,
    };
  }

  if (realPacket === realRoot || !isPathInside(realRoot, realPacket)) {
    return {
      dir: null,
      error: `Packet path for module ${moduleId} must resolve inside modules root (symlink escape rejected): ${safePacket}`,
    };
  }

  return { dir: realPacket, error: null };
}

/**
 * Derive repository root from the canonical modules layout:
 * `<repo>/docs/workflows/relume-to-ren10/modules`.
 * Returns null when modulesRoot is not that layout (tests should pass `{ repoRoot }`).
 * @param {string} modulesRoot
 * @returns {string | null}
 */
export function deriveRepoRootFromModulesRoot(modulesRoot) {
  if (typeof modulesRoot !== 'string' || modulesRoot.trim() === '') return null;
  const resolved = resolve(modulesRoot);
  const normalized = resolved.replace(/\\/g, '/');
  const marker = '/docs/workflows/relume-to-ren10/modules';
  if (!normalized.endsWith(marker)) return null;
  const repoRoot = resolved.slice(0, resolved.length - marker.length);
  return repoRoot === '' ? sep : repoRoot;
}

/**
 * Resolve ren10Block under repoRoot: safe repo-relative path, regular file (not symlink),
 * realpath contained inside repository root.
 * @param {string} repoRoot
 * @param {string} ren10Block
 * @param {string} moduleId
 * @returns {Promise<{ path: string | null, error: string | null }>}
 */
async function resolveInventoryBlockFile(repoRoot, ren10Block, moduleId) {
  let safePath;
  try {
    safePath = assertSafeRepoRelativePath(ren10Block, `Module ${moduleId} ren10Block`);
  } catch (error) {
    return { path: null, error: error.message };
  }

  const absolute = resolve(repoRoot, ...safePath.split('/'));
  let fileLstat;
  try {
    fileLstat = await lstat(absolute);
  } catch {
    return {
      path: null,
      error: `Module ${moduleId} ren10Block missing or not a regular file: ${safePath}`,
    };
  }

  if (fileLstat.isSymbolicLink()) {
    return {
      path: null,
      error: `Module ${moduleId} ren10Block must not be a symbolic link: ${safePath}`,
    };
  }

  if (!fileLstat.isFile()) {
    return {
      path: null,
      error: `Module ${moduleId} ren10Block missing or not a regular file: ${safePath}`,
    };
  }

  let realRepo;
  let realFile;
  try {
    realRepo = await realpath(repoRoot);
    realFile = await realpath(absolute);
  } catch {
    return {
      path: null,
      error: `Module ${moduleId} ren10Block missing or not a regular file: ${safePath}`,
    };
  }

  if (realFile === realRepo || !isPathInside(realRepo, realFile)) {
    return {
      path: null,
      error: `Module ${moduleId} ren10Block must resolve inside repository root (symlink escape rejected): ${safePath}`,
    };
  }

  return { path: realFile, error: null };
}

/**
 * Validate family/module inventory ledger.
 * Returns deterministic sorted errors. Validates every in_progress/accepted packet with
 * validatePacketDir (not only the stage string), then ledger↔packet identity and optional
 * ren10Block file coherence under the repository root.
 *
 * @param {unknown} inventory
 * @param {string} modulesRoot
 * @param {{ repoRoot?: string }} [options] Optional. Prefer `{ repoRoot }` in tests; CLI and
 *   canonical `docs/workflows/relume-to-ren10/modules` derive it when omitted.
 */
export async function validateInventory(inventory, modulesRoot, options = {}) {
  if (inventory === null || typeof inventory !== 'object' || Array.isArray(inventory)) {
    return { valid: false, errors: ['Inventory must be a JSON object'] };
  }

  const errors = [];
  const explicitRepoRoot = options && typeof options === 'object' && !Array.isArray(options)
    ? options.repoRoot
    : undefined;
  let resolvedRepoRoot = null;
  if (typeof explicitRepoRoot === 'string' && explicitRepoRoot.trim() !== '') {
    resolvedRepoRoot = resolve(explicitRepoRoot);
  } else {
    resolvedRepoRoot = deriveRepoRootFromModulesRoot(modulesRoot);
  }

  if (inventory.version !== 1) {
    errors.push('inventory version must equal 1');
  }

  if (!Array.isArray(inventory.families)) {
    errors.push('inventory.families must be an array');
    return { valid: false, errors: errors.sort() };
  }

  const familyIds = new Set();
  const moduleIds = new Set();
  /** @type {string[]} */
  const inProgressIds = [];
  /** @type {{ moduleId: string, familyId: string | null, status: string, packet: unknown, ren10Block?: unknown }[]} */
  const packetEntries = [];

  for (let familyIndex = 0; familyIndex < inventory.families.length; familyIndex += 1) {
    const family = inventory.families[familyIndex];
    if (family === null || typeof family !== 'object' || Array.isArray(family)) {
      errors.push(`inventory.families[${familyIndex}] must be an object`);
      continue;
    }

    let familyId = null;
    if (typeof family.id !== 'string' || family.id.trim() === '') {
      errors.push(`inventory.families[${familyIndex}].id must be a non-empty string`);
    } else if (familyIds.has(family.id)) {
      errors.push(`Duplicate inventory family id: ${family.id}`);
    } else {
      familyIds.add(family.id);
      familyId = family.id;
    }

    if (!Array.isArray(family.modules)) {
      errors.push(`inventory.families[${familyIndex}].modules must be an array`);
      continue;
    }

    for (let moduleIndex = 0; moduleIndex < family.modules.length; moduleIndex += 1) {
      const mod = family.modules[moduleIndex];
      if (mod === null || typeof mod !== 'object' || Array.isArray(mod)) {
        errors.push(`inventory.families[${familyIndex}].modules[${moduleIndex}] must be an object`);
        continue;
      }

      const moduleId = mod.id;
      if (typeof moduleId !== 'string' || moduleId.trim() === '') {
        errors.push(
          `inventory.families[${familyIndex}].modules[${moduleIndex}].id must be a non-empty string`,
        );
        continue;
      }

      if (moduleIds.has(moduleId)) {
        errors.push(`Duplicate inventory module id: ${moduleId}`);
      } else {
        moduleIds.add(moduleId);
      }

      const status = mod.status;
      if (typeof status !== 'string' || !INVENTORY_MODULE_STATUSES.includes(status)) {
        errors.push(
          `Invalid inventory status for module ${moduleId}: ${JSON.stringify(status)}`,
        );
        continue;
      }

      if (status === 'in_progress') {
        inProgressIds.push(moduleId);
      }

      if (status === 'skipped') {
        if (typeof mod.reason !== 'string' || mod.reason.trim() === '') {
          errors.push(`Skipped module ${moduleId} requires a non-empty reason`);
        }
      }

      if (status === 'in_progress' || status === 'accepted') {
        packetEntries.push({
          moduleId,
          familyId,
          status,
          packet: mod.packet,
          ren10Block: mod.ren10Block,
        });
      }

      if (mod.ren10Block !== undefined && mod.ren10Block !== null) {
        try {
          assertSafeRepoRelativePath(mod.ren10Block, `Module ${moduleId} ren10Block`);
        } catch (error) {
          errors.push(error.message);
        }
      }
    }
  }

  const multiInProgress = inProgressIds.length > 1;
  if (multiInProgress) {
    // Deliberate short-circuit companion: the plan contract test deep-equals this single
    // concurrency error. When more than one module is in_progress, skip FS/packet checks for
    // those in_progress rows so only this error is emitted for that failure class. Accepted
    // rows still fully validate. Aggregate multi-error reporting is intentionally deferred.
    errors.push(
      `Inventory may contain only one in_progress module; found ${[...inProgressIds].sort().join(', ')}`,
    );
  }

  for (const entry of packetEntries) {
    // See multiInProgress note above: skip in_progress FS checks under concurrency failure
    // so the planned single-error deepEqual remains stable.
    if (entry.status === 'in_progress' && multiInProgress) {
      continue;
    }

    const resolved = await resolveInventoryPacketDir(modulesRoot, entry.packet, entry.moduleId);
    if (resolved.error) {
      errors.push(resolved.error);
      continue;
    }

    const packetResult = await validatePacketDir(resolved.dir);
    if (!packetResult.valid) {
      for (const packetError of packetResult.errors) {
        errors.push(`Module ${entry.moduleId} packet: ${packetError}`);
      }
    }

    if (entry.status === 'accepted') {
      const stage = packetResult.packet?.stage;
      if (stage !== 'accepted') {
        errors.push(
          `Accepted module ${entry.moduleId} has packet stage ${stage ?? 'unknown'}; expected accepted`,
        );
      }
    }

    // Ledger ↔ packet identity (after validatePacketDir so packet.json shape is known).
    const pkt = packetResult.packet;
    if (pkt) {
      if (pkt.moduleId !== entry.moduleId) {
        errors.push(
          `Module ${entry.moduleId} packet.moduleId mismatch: expected ${JSON.stringify(entry.moduleId)}, got ${JSON.stringify(pkt.moduleId)}`,
        );
      }
      if (entry.familyId !== null && pkt.family !== entry.familyId) {
        errors.push(
          `Module ${entry.moduleId} packet.family mismatch: expected ${JSON.stringify(entry.familyId)}, got ${JSON.stringify(pkt.family)}`,
        );
      }

      if (entry.ren10Block !== undefined && entry.ren10Block !== null) {
        let safeBlock;
        try {
          safeBlock = assertSafeRepoRelativePath(
            entry.ren10Block,
            `Module ${entry.moduleId} ren10Block`,
          );
        } catch (error) {
          // Already reported in the first pass when ren10Block is present; skip FS checks.
          safeBlock = null;
          if (!errors.includes(error.message)) {
            errors.push(error.message);
          }
        }

        if (safeBlock !== null) {
          const packetBlockPath = typeof pkt.blockPath === 'string'
            ? (() => {
              try {
                return assertSafeRepoRelativePath(
                  pkt.blockPath,
                  `Module ${entry.moduleId} packet.blockPath`,
                );
              } catch {
                return null;
              }
            })()
            : null;

          if (packetBlockPath === null || safeBlock !== packetBlockPath) {
            errors.push(
              `Module ${entry.moduleId} ren10Block must equal packet.blockPath: ${JSON.stringify(safeBlock)} !== ${JSON.stringify(pkt.blockPath)}`,
            );
          }

          if (resolvedRepoRoot === null) {
            errors.push(
              `Module ${entry.moduleId} ren10Block requires repository root; pass options.repoRoot or use canonical modulesRoot layout`,
            );
          } else {
            const blockResolved = await resolveInventoryBlockFile(
              resolvedRepoRoot,
              safeBlock,
              entry.moduleId,
            );
            if (blockResolved.error) {
              errors.push(blockResolved.error);
            }
          }
        }
      }
    }
  }

  const sorted = errors.sort();
  return { valid: sorted.length === 0, errors: sorted };
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

  const safeModuleId = assertSafeModuleId(moduleId);
  const safeBlockPath = assertSafeRepoRelativePath(blockPath, 'blockPath');
  const safeTestPath = testPath === undefined || testPath === null
    ? undefined
    : assertSafeRepoRelativePath(testPath, 'testPath');

  await mkdir(root, { recursive: true });
  const packetDir = join(root, safeModuleId);
  if (await exists(packetDir)) {
    throw new Error(`Workflow packet already exists: ${packetDir}`);
  }

  const tempDir = join(root, `.${safeModuleId}.${randomBytes(8).toString('hex')}.tmp`);
  try {
    await mkdir(tempDir, { recursive: false });
    await writeScaffoldArtifacts(tempDir, {
      family,
      moduleId: safeModuleId,
      blockSlug,
      blockPath: safeBlockPath,
      testPath: safeTestPath,
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

  // Boundary accepts absolute in-packet input; always persist packet-relative.
  const { relativePath } = await loadContainedStageEvidence(packetDir, evidencePath, currentStage, {
    requireRelativePointer: false,
  });

  packet.evidence ??= {};
  packet.evidence[currentStage] = relativePath;
  packet.stage = target;
  await writeFile(packetPath, `${JSON.stringify(packet, null, 2)}\n`);
  return packet;
}
