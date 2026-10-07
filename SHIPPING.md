# Shipping ren10

Validate the current checkout before preparing a release. Read `package.json`, `packages/astro/package.json`, `CHANGELOG.md`, and `MIGRATION.md`; both packages and the versioned skill must agree. The checkout version and the latest published npm version are separate facts.

## Local validation

```bash
npm ci
npm run lint
npm run agent:check
npm run test:portable
npm run test:visual:linux
npm run check:budgets
npm run audit:runtime
npm run audit:full
npm run check:release
npm run check:supply-chain
npm run test:release-policy
```

`test:portable` is the full local suite; `test:visual:linux` uses the CI-pinned browser image and committed baselines. Inspect real visual changes before updating snapshots. Keep any unresolved advisory visible; do not downgrade lint tooling or skip an audit to make a release pass.

## Registry prerequisites

Before publication, run `npm run check:publish-access` with the intended npm identity. The check verifies authentication and membership in the `ren10` organization before the core package can publish. Granular token write permissions are still enforced by npm during publication. A scoped package returning E404 does not prove permission to create it. The local tarball fallback is documented in `docs/astro.md`.

## Authorized publication

Create a reviewable pull request with validation evidence. Merge and publish only after maintainer authorization and passing release checks. Read the version from `package.json` when creating the tag; do not copy a historical tag from this document. `release.yml` verifies that the tag matches both package versions, publishes with provenance, skips versions already present, and creates the GitHub Release. `publish-retry.yml` supports recovery of the scoped package without republishing the core.

Verify both exact versions in npm and the GitHub Release after publication. Pages is a separate deployment; inspect its assembled artifact and deploy result independently.
