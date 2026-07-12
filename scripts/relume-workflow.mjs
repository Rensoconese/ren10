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