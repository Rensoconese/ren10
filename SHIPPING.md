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

**Activation is deferred to the next authorized release.** Follow the ordered
[OIDC activation and token retirement checklist](release-oidc.md). It includes
first-use verification, both maintainer 2FA approvals, and credential removal
only after both packages have been published and verified through OIDC.

Automated staging uses npm trusted publishing (GitHub OIDC), not `NPM_TOKEN`.
Configure a GitHub Actions trusted publisher on **each** npm package (`ren10`
and `@ren10/astro`): owner `Rensoconese`, repository `ren10`, workflow filename
`release.yml`. Allow **stage only**; leave direct `npm publish` and dist-tag
management disabled. Keep account 2FA throughout the migration. After the
first OIDC release is verified, set the package publishing policy to
**Require two-factor authentication and disallow tokens**. Saving a publisher
is a security-sensitive permission grant and requires maintainer confirmation.

A newly created publisher must complete its first successful publish within
48 hours or npm expires the configuration. Activate and validate the setup
alongside an authorized release; saving the form is not proof OIDC works.
Do not remove the existing secret or revoke its token until the replacement
has published and verified both packages successfully through OIDC. The final migration removes
`NPM_TOKEN` from GitHub and revokes the old token in npm.

`node scripts/check-publish-access.mjs --oidc` validates the GitHub release
context and OIDC availability, not registry permissions. The actual
`npm stage publish` request verifies package-specific trust. `npm whoami`
and organization listing cannot validate OIDC permissions. Local interactive
token diagnostics remain available via `npm run check:publish-access`.

## Authorized publication

Create a reviewable pull request with validation evidence. Merge and publish only after maintainer authorization and passing release checks. Read the version from `package.json` when creating the tag; do not copy a historical tag from this document. `release.yml` verifies that the selected tag matches both package versions, stages integrity-pinned tarballs with provenance using npm 11.21.0 and GitHub OIDC, and skips only byte-identical public versions. A maintainer approves both staged packages with 2FA in npm; the workflow waits up to 30 minutes and verifies exact public tarball integrities and provenance before creating the GitHub Release. All native Linux, browser, accessibility, budget and dependency gates remain blocking.

OIDC cannot list, inspect or download private pending stages. The workflow
therefore never assumes that an existing pending version matches: npm's
shared staged/public version index rejects a duplicate staging request.
If a run was interrupted after staging, review and approve its original
candidate in npm, then rerun. An immutable public version with a different
SHA512 remains a hard failure. Missing authentication or registry errors
never count as permission or successful publication.

To resume after approval, dispatch **Release** on `main` with the original
`release_tag`; it checks out and fully verifies that exact tag again. The
legacy `publish-v*` trigger now only dispatches that same Release workflow,
so no additional npm trusted publisher is needed. This tokenless path is
available for release tags created after the migration; historical tags keep
their original scripts and are not rewritten.

Verify both exact versions in npm and the GitHub Release after publication. Pages is a separate deployment; inspect its assembled artifact and deploy result independently.

Staged publication: https://docs.npmjs.com/staged-publishing/

Trusted publishing: https://docs.npmjs.com/trusted-publishers/
