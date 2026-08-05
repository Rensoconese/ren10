#!/usr/bin/env node
/**
 * Runs the authoritative visual regression gate.
 *
 * The committed baselines are pixel-exact for one rendering environment.
 * They used to be captured on the GitHub Actions `ubuntu-latest` runner,
 * which made the gate unreproducible anywhere else: the same suite on the
 * official Playwright image failed 20 of 47 tests with ~200px text diffs,
 * purely because the font stacks differ. A gate nobody can run locally is a
 * gate that only ever fails in CI.
 *
 * Baselines are now captured inside the pinned Playwright container, and every
 * caller renders in that same image: when already inside it we run directly,
 * and everywhere else — a developer laptop, or a bare ubuntu-latest runner —
 * we shell into Docker so the result is identical.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const PKG_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * True when we are already running inside the pinned Playwright image.
 *
 * Deliberately not a `platform === 'linux'` check: release.yml and audit.yml
 * run this gate on a bare ubuntu-latest runner, which is Linux but renders
 * with the runner's fonts, not the image's. Testing for the image's own
 * browser root is what tells the two apart — `npx playwright install` puts
 * browsers under ~/.cache/ms-playwright, never at /ms-playwright.
 */
const insideVisualImage = () => process.platform === 'linux' && existsSync('/ms-playwright');

/**
 * The container the baselines were captured in. Derived from the installed
 * Playwright version so it cannot silently drift: bumping @playwright/test
 * changes this string, and check-performance-contract.mjs then fails until
 * .github/workflows/ci.yml is updated to match.
 */
export function visualImage() {
  const { version } = require('@playwright/test/package.json');
  return `mcr.microsoft.com/playwright:v${version}-noble`;
}

const PLAYWRIGHT_ARGS = [
  'playwright',
  'test',
  '--config',
  'tests/visual/playwright.config.cjs',
  '--project=Desktop Light',
];

function runNative(extraArgs) {
  return spawnSync('npx', [...PLAYWRIGHT_ARGS, ...extraArgs], {
    cwd: PKG_ROOT,
    stdio: 'inherit',
  });
}

function runContainerised(extraArgs) {
  const probe = spawnSync('docker', ['version', '--format', '{{.Server.Version}}'], {
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  if (probe.status !== 0) {
    console.error(
      'The authoritative visual baseline renders inside the pinned Playwright\n' +
        `container (${visualImage()}), and Docker is not available here.\n` +
        'Start Docker, or run "npm test" for the portable suite.'
    );
    return { status: 1 };
  }

  return spawnSync(
    'docker',
    [
      'run',
      '--rm',
      '-v',
      `${PKG_ROOT}:/work`,
      '-w',
      '/work',
      // Playwright writes caches under HOME, and /root is not reliably
      // writable once the bind mount maps host ownership into the container.
      '-e',
      'HOME=/tmp',
      visualImage(),
      'npx',
      ...PLAYWRIGHT_ARGS,
      ...extraArgs,
    ],
    { stdio: 'inherit' }
  );
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const extraArgs = process.argv.slice(2);
  const result = insideVisualImage() ? runNative(extraArgs) : runContainerised(extraArgs);
  process.exit(result.status ?? 1);
}
