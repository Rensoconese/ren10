#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'cli', 'index.js');

const fail = (message, result) => {
  if (result?.stdout) console.error(result.stdout);
  if (result?.stderr) console.error(result.stderr);
  throw new Error(message);
};

const run = (args) => {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10,
  });
  if (result.status !== 0) {
    fail(`ren10 ${args.join(' ')} failed with exit ${result.status}`, result);
  }
  return result.stdout;
};

const json = (args, expectedType) => {
  const stdout = run(args);
  let parsed;
  try {
    parsed = JSON.parse(stdout);
  } catch (err) {
    fail(`ren10 ${args.join(' ')} did not emit parseable JSON: ${err.message}`, { stdout });
  }
  if (parsed.apiVersion !== 1) {
    throw new Error(`ren10 ${args.join(' ')} emitted apiVersion=${parsed.apiVersion}, expected 1`);
  }
  if (parsed.type !== expectedType) {
    throw new Error(`ren10 ${args.join(' ')} emitted type=${parsed.type}, expected ${expectedType}`);
  }
  if (!parsed.data || typeof parsed.data !== 'object') {
    throw new Error(`ren10 ${args.join(' ')} emitted no data object`);
  }
  return parsed.data;
};

const manifest = json(['manifest', '--json'], 'manifest');
if (!manifest.commands?.some((command) => command.name === 'build')) {
  throw new Error('manifest is missing the build command');
}
if (!manifest.docs?.['agent-ready-roadmap']) {
  throw new Error('manifest is missing the agent-ready roadmap docs topic');
}

const globalManifest = json(['--json'], 'manifest');
if (globalManifest.version !== manifest.version) {
  throw new Error('global --json manifest version drifted from manifest --json');
}

const list = json(['list', '--json'], 'component.list');
if ((list.primitives?.length ?? 0) !== 19 || (list.composites?.length ?? 0) !== 26 || (list.patterns?.length ?? 0) !== 8) {
  throw new Error('component.list returned unexpected component counts');
}

const button = json(['component', 'button', '--json'], 'component.detail');
if (button.key !== 'button' || !button.aiHints || !button.contractPath) {
  throw new Error('component button JSON is missing key contract fields');
}
run(['component', 'button', '--dense']);

const roadmap = json(['docs', 'agent-ready-roadmap', '--json'], 'docs.detail');
if (roadmap.path !== 'docs/agent-ready-roadmap.md' || !roadmap.body) {
  throw new Error('agent-ready roadmap docs JSON is incomplete');
}

const evals = json(['docs', 'evals', '--json'], 'docs.detail');
if (evals.path !== 'evals/README.md' || !evals.body) {
  throw new Error('evals docs JSON is incomplete');
}

const knowledgePath = json(['knowledge', 'path', '--json'], 'knowledge.path');
if (!knowledgePath.sqlitePath || !knowledgePath.jsonPath) {
  throw new Error('knowledge path JSON is missing graph paths');
}

const knowledgeQuery = json(['knowledge', 'query', 'ren-toast status', '--json', '--limit', '3'], 'knowledge.query');
if (knowledgeQuery.results.length === 0 || knowledgeQuery.limit !== 3) {
  throw new Error('knowledge query JSON returned no limited results');
}

const search = json(['search', 'dialog workflow', '--json', '--limit', '4'], 'search');
if (search.results.length === 0 || !search.results[0].command) {
  throw new Error('search JSON returned no actionable command');
}

const build = json(['build', 'dashboard with sidebar', '--json', '--limit', '6'], 'build.kit');
if (!Array.isArray(build.start) || build.start.length === 0) {
  throw new Error('build JSON returned no start commands');
}

const doctor = json(['doctor', '--json'], 'doctor');
if ((doctor.summary?.fail ?? 0) !== 0) {
  throw new Error('doctor JSON reported failures');
}

console.log('RenDS agent CLI smoke: OK');
