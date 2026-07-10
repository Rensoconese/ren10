import fs from 'node:fs';
import path from 'node:path';

function walkHtml(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkHtml(absolute));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(absolute);
  }
  return files;
}

export function isStableSemverAtLeast(version, minimum) {
  const parse = (value) => {
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(value || '');
    return match ? match.slice(1).map(Number) : null;
  };
  const actual = parse(version);
  const floor = parse(minimum);
  if (!actual || !floor) return false;
  for (let index = 0; index < 3; index += 1) {
    if (actual[index] !== floor[index]) return actual[index] > floor[index];
  }
  return true;
}

export function findPublicVersionSurfaces(root, expectedVersion) {
  const surfaces = [];
  const errors = [];
  const htmlRoots = ['docs', 'create', 'templates', 'site'];
  const badgePattern = /<span\b[^>]*class=["'][^"']*\bren-badge\b[^"']*["'][^>]*>\s*v(\d+\.\d+\.\d+)\s*<\/span>/g;

  for (const directory of htmlRoots) {
    for (const absolute of walkHtml(path.join(root, directory))) {
      const source = fs.readFileSync(absolute, 'utf8');
      for (const match of source.matchAll(badgePattern)) {
        const file = path.relative(root, absolute);
        surfaces.push({ file, version: match[1], kind: 'html' });
        if (match[1] !== expectedVersion) {
          errors.push(`${file} exposes v${match[1]}; expected v${expectedVersion}`);
        }
      }
    }
  }

  const structured = [
    ...['AGENTS.md', 'CLAUDE.md', '.cursorrules', '.windsurfrules']
      .map((file) => ({ file, pattern: /RenDS v(\d+\.\d+\.\d+)/g })),
    { file: 'ren-design.md', pattern: /^\s*version:\s*(\d+\.\d+\.\d+)\s*$/gm },
    { file: 'README.md', pattern: /Current version:\s*\*\*(\d+\.\d+\.\d+)\*\*/g },
  ];
  for (const { file, pattern } of structured) {
    const absolute = path.join(root, file);
    if (!fs.existsSync(absolute)) {
      errors.push(`${file} is missing`);
      continue;
    }
    const matches = [...fs.readFileSync(absolute, 'utf8').matchAll(pattern)];
    if (matches.length === 0) {
      errors.push(`${file} has no canonical current-version field`);
      continue;
    }
    for (const match of matches) {
      surfaces.push({ file, version: match[1], kind: 'structured' });
      if (match[1] !== expectedVersion) {
        errors.push(`${file} exposes ${match[1]}; expected ${expectedVersion}`);
      }
    }
  }
  return { surfaces, errors };
}

function commandSteps(job) {
  return (job?.steps || []).flatMap((step) => {
    if (typeof step.run !== 'string') return [];
    return step.run.split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((command) => ({ command, if: step.if, continueOnError: step['continue-on-error'] }));
  });
}

function requireBlockingCommands(errors, workflowName, jobName, job, commands, requiredIf = null) {
  if (!job) {
    errors.push(`${workflowName} is missing job ${jobName}`);
    return;
  }
  if (!requiredIf && job['continue-on-error'] !== undefined && job['continue-on-error'] !== false) {
    errors.push(`${workflowName}:${jobName} must be blocking`);
  }
  if (!requiredIf && job.if) errors.push(`${workflowName}:${jobName} must not be conditional`);
  const steps = commandSteps(job);
  for (const command of commands) {
    const step = steps.find((candidate) => candidate.command === command);
    if (!step) {
      errors.push(`${workflowName}:${jobName} missing executable step: ${command}`);
      continue;
    }
    if (step.continueOnError !== undefined && step.continueOnError !== false) {
      errors.push(`${workflowName}:${jobName} makes ${command} non-blocking`);
    }
    if (requiredIf && step.if !== requiredIf) {
      errors.push(`${workflowName}:${jobName} must gate ${command} with ${requiredIf}`);
    } else if (!requiredIf && step.if) {
      errors.push(`${workflowName}:${jobName} must run ${command} unconditionally`);
    }
  }
}

export function validateWorkflowPolicy(workflows, requiredCommands) {
  const errors = [];
  const ci = workflows['ci.yml'];
  const release = workflows['release.yml'];
  const audit = workflows['audit.yml'];
  requireBlockingCommands(errors, 'ci.yml', 'package', ci?.jobs?.package, requiredCommands);
  requireBlockingCommands(errors, 'ci.yml', 'visual', ci?.jobs?.visual, ['npm run test:visual:linux']);
  requireBlockingCommands(errors, 'release.yml', 'verify', release?.jobs?.verify, [
    ...requiredCommands,
    'npm run test:visual:linux',
  ]);

  const publishNeeds = release?.jobs?.publish?.needs;
  const publishDependencies = Array.isArray(publishNeeds) ? publishNeeds : [publishNeeds];
  if (!publishDependencies.includes('verify')) errors.push('release.yml:publish must depend on verify');
  if (release?.jobs?.publish?.['continue-on-error'] !== undefined && release.jobs.publish['continue-on-error'] !== false) {
    errors.push('release.yml:publish must be blocking');
  }
  if (release?.jobs?.publish?.if) errors.push('release.yml:publish must not be conditional');

  const chromiumIf = "matrix.browser == 'chromium'";
  requireBlockingCommands(errors, 'audit.yml', 'audit', audit?.jobs?.audit, requiredCommands, chromiumIf);
  if (audit?.jobs?.audit?.['continue-on-error'] !== "${{ matrix.browser != 'chromium' }}") {
    errors.push('audit.yml:audit must keep Chromium blocking and other browsers advisory');
  }
  return errors;
}
