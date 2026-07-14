import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  hashStarterArtifact,
  validateStarterApproval,
} from './check-starter-approval.mjs';

const REQUIRED_SCENARIOS = [
  'shell-sidebar',
  'settings-form',
  'data-table',
  'dialog-keyboard-focus',
  'status-empty-feedback',
];

async function makeFixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'ren-starter-approval-'));
  const artifact = path.join(root, 'examples', 'reference-app');
  await mkdir(artifact, { recursive: true });
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ version: '0.10.0' }));
  await mkdir(path.join(root, 'tests', 'agent-starter'), { recursive: true });
  await writeFile(path.join(root, 'tests', 'agent-starter', 'reference-app.spec.js'), 'test suite\n');
  await writeFile(path.join(artifact, 'index.html'), '<!doctype html><title>Reference</title>\n');
  await writeFile(path.join(artifact, 'app.js'), 'export const ready = true;\n');
  await writeFile(path.join(artifact, 'README.md'), '# Reference app\n');
  await mkdir(path.join(artifact, 'screenshots'));
  for (const file of ['light.png', 'dark.png', 'dialog-open.png']) {
    await writeFile(path.join(artifact, 'screenshots', file), Buffer.from('not-empty'));
  }
  await writeFile(path.join(artifact, 'visual-references.json'), JSON.stringify({
    schemaVersion: 1,
    packageVersion: '0.10.0',
    apiAuthority: {
      source: 'package-contracts-and-cli',
      contracts: ['ren-design.md', 'components/components.md'],
      cli: ['npx ren10 build'],
    },
    figma: {
      role: 'optional-visual-only',
      apiAuthority: false,
    },
    capture: {
      command: 'node scripts/capture-starter-visuals.mjs',
      viewport: { width: 1280, height: 900 },
    },
    scenarios: [
      { id: 'light', file: 'screenshots/light.png', theme: 'light', dialogOpen: false },
      { id: 'dark', file: 'screenshots/dark.png', theme: 'dark', dialogOpen: false },
      { id: 'dialog-open', file: 'screenshots/dialog-open.png', theme: 'light', dialogOpen: true },
    ],
  }));

  const approval = {
    schemaVersion: 1,
    packageVersion: '0.10.0',
    artifactPath: 'examples/reference-app',
    contentHash: await hashStarterArtifact(root, 'examples/reference-app'),
    scenarios: REQUIRED_SCENARIOS,
    accessibility: {
      standard: 'WCAG 2.1 AA',
      axeRequired: true,
    },
    themes: ['light', 'dark'],
    visualManifest: 'examples/reference-app/visual-references.json',
    review: {
      process: 'independent-review',
      reviewer: 'Ren10 maintainers',
      reviewedAt: '2026-07-14',
      command: 'node scripts/capture-starter-visuals.mjs && npx playwright test --config tests/agent-starter/playwright.config.cjs',
      result: 'approved',
    },
    suiteEvidence: {
      suitePath: 'tests/agent-starter/reference-app.spec.js',
      command: 'npx playwright test --config tests/agent-starter/playwright.config.cjs',
      result: { status: 'passed', tests: 11, failures: 0, axeViolations: 0 },
    },
    status: 'approved',
  };
  await writeFile(
    path.join(artifact, 'starter-validation.json'),
    `${JSON.stringify(approval, null, 2)}\n`,
  );
  return root;
}

async function mutateVisualManifest(root, mutate) {
  const file = path.join(root, 'examples', 'reference-app', 'visual-references.json');
  const manifest = JSON.parse(await readFile(file, 'utf8'));
  mutate(manifest);
  await writeFile(file, `${JSON.stringify(manifest, null, 2)}\n`);
  await mutateApproval(root, async (approval) => {
    approval.contentHash = await hashStarterArtifact(root, approval.artifactPath);
  });
}

async function mutateApproval(root, mutate) {
  const file = path.join(root, 'examples', 'reference-app', 'starter-validation.json');
  const approval = JSON.parse(await readFile(file, 'utf8'));
  await mutate(approval);
  await writeFile(file, `${JSON.stringify(approval, null, 2)}\n`);
}

async function withFixture(run) {
  const root = await makeFixture();
  try {
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('accepts a current approved reference application', async () => {
  await withFixture(async (root) => {
    const result = await validateStarterApproval(root);
    assert.equal(result.ok, true, result.errors.join('\n'));
    assert.ok(result.checks.includes('starter approval is approved'));
  });
});

test('rejects a stale package version', async () => {
  await withFixture(async (root) => {
    await mutateApproval(root, (approval) => {
      approval.packageVersion = '0.9.2';
    });
    const result = await validateStarterApproval(root);
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /package version/i);
  });
});

test('rejects a content hash that does not match the artifact', async () => {
  await withFixture(async (root) => {
    await mutateApproval(root, (approval) => {
      approval.contentHash = `sha256:${'0'.repeat(64)}`;
    });
    const result = await validateStarterApproval(root);
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /content hash/i);
  });
});

test('rejects approval without every required scenario', async () => {
  await withFixture(async (root) => {
    await mutateApproval(root, (approval) => {
      approval.scenarios = approval.scenarios.filter((scenario) => scenario !== 'data-table');
    });
    const result = await validateStarterApproval(root);
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /data-table/);
  });
});

test('rejects approval without light and dark themes', async () => {
  await withFixture(async (root) => {
    await mutateApproval(root, (approval) => {
      approval.themes = ['light'];
    });
    const result = await validateStarterApproval(root);
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /dark theme/i);
  });
});

test('rejects an unapproved review state', async () => {
  await withFixture(async (root) => {
    await mutateApproval(root, (approval) => {
      approval.status = 'pending';
    });
    const result = await validateStarterApproval(root);
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /approved/i);
  });
});

test('rejects approval without verifiable review identity, date, command, and result', async () => {
  for (const field of ['reviewer', 'reviewedAt', 'command', 'result']) {
    await withFixture(async (root) => {
      await mutateApproval(root, (approval) => {
        delete approval.review[field];
      });
      const result = await validateStarterApproval(root);
      assert.equal(result.ok, false);
      assert.match(result.errors.join('\n'), new RegExp(field, 'i'));
    });
  }
});

test('rejects approval without declared passing suite evidence', async () => {
  await withFixture(async (root) => {
    await mutateApproval(root, (approval) => {
      approval.suiteEvidence.result.failures = 1;
    });
    const result = await validateStarterApproval(root);
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /suite evidence/i);
  });
});

test('rejects a visual manifest that grants Figma API authority', async () => {
  await withFixture(async (root) => {
    await mutateVisualManifest(root, (manifest) => {
      manifest.figma.apiAuthority = true;
    });
    const result = await validateStarterApproval(root);
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /figma/i);
  });
});

test('rejects missing or empty visual screenshots', async () => {
  await withFixture(async (root) => {
    await unlink(path.join(root, 'examples/reference-app/screenshots/dark.png'));
    await mutateApproval(root, async (approval) => {
      approval.contentHash = await hashStarterArtifact(root, approval.artifactPath);
    });
    const result = await validateStarterApproval(root);
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /dark\.png/i);
  });
  await withFixture(async (root) => {
    await writeFile(path.join(root, 'examples/reference-app/screenshots/dialog-open.png'), Buffer.alloc(0));
    await mutateApproval(root, async (approval) => {
      approval.contentHash = await hashStarterArtifact(root, approval.artifactPath);
    });
    const result = await validateStarterApproval(root);
    assert.equal(result.ok, false);
    assert.match(result.errors.join('\n'), /dialog-open\.png/i);
  });
});

test('validates the checked-in reference application approval', async () => {
  const result = await validateStarterApproval(path.resolve('.'));
  assert.equal(result.ok, true, result.errors.join('\n'));
});
