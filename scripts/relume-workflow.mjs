#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import {
  advancePacket,
  scaffoldPacket,
  validateInventory,
  validatePacketDir,
} from './lib/relume-workflow.mjs';

const [, , command, ...tokens] = process.argv;

const USAGE = `Usage:
  relume-workflow init --family <family> --module <module> --block <slug> --path <html> [--root <dir>] [--test-path <file>] [--template-root <dir>]
  relume-workflow validate <packet-dir>
  relume-workflow status <packet-dir>
  relume-workflow advance <packet-dir> --evidence <file>
  relume-workflow validate-all <inventory.json>`;

const COMMAND_SCHEMAS = Object.freeze({
  init: Object.freeze({
    positionals: 0,
    requiredFlags: Object.freeze(['family', 'module', 'block', 'path']),
    optionalFlags: Object.freeze(['root', 'test-path', 'template-root']),
  }),
  validate: Object.freeze({
    positionals: 1,
    requiredFlags: Object.freeze([]),
    optionalFlags: Object.freeze([]),
  }),
  status: Object.freeze({
    positionals: 1,
    requiredFlags: Object.freeze([]),
    optionalFlags: Object.freeze([]),
  }),
  advance: Object.freeze({
    positionals: 1,
    requiredFlags: Object.freeze(['evidence']),
    optionalFlags: Object.freeze([]),
  }),
  'validate-all': Object.freeze({
    positionals: 1,
    requiredFlags: Object.freeze([]),
    optionalFlags: Object.freeze([]),
  }),
});

function argsToObject(values) {
  const result = { _: [] };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith('--')) {
      result._.push(value);
      continue;
    }
    const key = value.slice(2);
    if (!key) throw new Error(`Invalid flag: ${value}\n${USAGE}`);
    const next = values[index + 1];
    if (next === undefined || next.startsWith('--')) {
      throw new Error(`Missing value for --${key}\n${USAGE}`);
    }
    result[key] = next;
    index += 1;
  }
  return result;
}

function validateCommandArgs(commandName, args) {
  const schema = COMMAND_SCHEMAS[commandName];
  if (!schema) {
    throw new Error(`Unknown command: ${commandName}\n${USAGE}`);
  }

  const allowedFlags = new Set([...schema.requiredFlags, ...schema.optionalFlags]);
  for (const key of Object.keys(args)) {
    if (key === '_') continue;
    if (!allowedFlags.has(key)) {
      throw new Error(`Unknown flag: --${key}\n${USAGE}`);
    }
  }

  if (args._.length !== schema.positionals) {
    if (schema.positionals === 1) {
      const subject = commandName === 'validate-all'
        ? 'inventory path'
        : 'packet directory';
      throw new Error(
        `Command "${commandName}" requires exactly one ${subject} positional argument\n${USAGE}`,
      );
    }
    throw new Error(
      `Command "${commandName}" does not accept positional arguments (got ${args._.length})\n${USAGE}`,
    );
  }

  for (const flag of schema.requiredFlags) {
    if (args[flag] === undefined) {
      throw new Error(`Missing required argument: --${flag}\n${USAGE}`);
    }
    if (typeof args[flag] === 'string' && args[flag].trim() === '') {
      throw new Error(`Argument --${flag} must be non-empty\n${USAGE}`);
    }
  }

  return schema;
}

async function main() {
  if (!command) {
    throw new Error(USAGE);
  }

  const args = argsToObject(tokens);
  validateCommandArgs(command, args);

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
      templateRoot: args['template-root'] ? resolve(args['template-root']) : undefined,
    });
    console.log(`Created workflow packet: ${packetDir}`);
    return;
  }

  if (command === 'validate-all') {
    const inventoryPath = resolve(args._[0]);
    let inventory;
    try {
      const raw = await readFile(inventoryPath, 'utf8');
      if (!raw.trim()) {
        throw new Error('Inventory file is empty');
      }
      inventory = JSON.parse(raw);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Inventory file not found: ${inventoryPath}`);
      }
      throw new Error(`Invalid inventory JSON: ${error.message}`);
    }

    const modulesRoot = join(dirname(inventoryPath), 'modules');
    const result = await validateInventory(inventory, modulesRoot);
    if (!result.valid) {
      throw new Error(result.errors.join('\n'));
    }

    const familyCount = Array.isArray(inventory.families) ? inventory.families.length : 0;
    const moduleCount = Array.isArray(inventory.families)
      ? inventory.families.reduce(
        (count, family) => count + (Array.isArray(family?.modules) ? family.modules.length : 0),
        0,
      )
      : 0;
    console.log(`Valid inventory: ${familyCount} families, ${moduleCount} modules`);
    return;
  }

  throw new Error(USAGE);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
