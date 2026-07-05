# Shipping checklist — RenDS

How to ship a release of `ren10` end-to-end. Currently sized for the
**0.9.0 line**, but the per-release pattern is the same after that.

> All commands below run on **your local machine**. They need your git credentials and `npm login`.

> **Repo layout note.** The GitHub repo `Rensoconese/ren10` is the package itself — the working tree is the package root (where `package.json`, `index.css`, `tokens/`, `components/`, etc. live). On Ren's machine that working tree is at `~/RenDS/rends/`. The parent folder `~/RenDS/` is just a Cowork workspace and is **not** part of the GitHub repo.

---

## 0 · One-time setup (do once, before the first push)

1. **`NPM_TOKEN` secret.** Generate an "Automation" token at <https://www.npmjs.com/settings/~/tokens> and add it at:
   `https://github.com/Rensoconese/ren10/settings/secrets/actions/new`
   - Name: `NPM_TOKEN`
   - Value: the token starting with `npm_…`

2. **GitHub Pages** — `pages.yml` is present. One-time setup: GitHub
   Settings → Pages → Source → GitHub Actions.

---

## 1 · Push the release branch and open the PR

```bash
cd ~/RenDS/rends    # this folder IS the repo

# Confirm state. Replace feat/cli-extend with the current release branch.
git fetch origin
git status
git log --oneline origin/main..feat/cli-extend

# Push the branch — triggers ci.yml against the PR.
git push -u origin feat/cli-extend

# Open the PR.
gh pr create --base main --head feat/cli-extend \
  --title "release: harden RenDS 0.9.0" \
  --body-file PR_BODY.md   # See `PR_BODY.md` if generated, or paste manually
```

While CI runs, expect:
- **Chromium jobs**: must pass (gating)
- **Firefox / WebKit jobs**: advisory (`continue-on-error: true`). Engine-specific diffs surface as warnings, not failures.
- **Package smoke**: includes `npm run agent:check`, which validates the
  agent CLI JSON surface, `ren10 doctor`, evals, knowledge graph/package
  files, and the versioned skill.

---

## 2 · Merge to main, then cut tags

After the PR is reviewed and merged:

```bash
git checkout main && git pull

# Tag the package version at the merge commit. release.yml fires on tag push.
git tag -a v0.9.0 -m "Release v0.9.0"
git push origin v0.9.0
```

Optional — retroactive tags for the CHANGELOG compare-links:

```bash
# v0.8.2 is the only previous release with a clearly-identified commit.
git tag -a v0.8.2 1301c32 -m "Release v0.8.2 (retroactive)"
git push origin v0.8.2

# v0.7.0 and v0.8.0 don't have separate release commits (the repo's
# Initial commit at 76bb445 bundled the pre-0.7.1 history). Skipping
# their tags; their CHANGELOG compare-links already point at the
# placeholder /releases/tag/v0.x.y URL.
```

Existing tags on origin: `v0.7.1` (1502ea7), `v0.8.1` (annotated, → bfd2f81).

---

## 3 · Verify (~5–10 minutes after the tag push)

```bash
npm view ren10 version    # should print 0.9.0
```

- **GitHub Release:** <https://github.com/Rensoconese/ren10/releases/tag/v0.9.0>

Smoke test the npm package in a fresh dir:

```bash
mkdir /tmp/rends-smoke && cd /tmp/rends-smoke
npm init -y
npx ren10 init
npx ren10 add button dialog tooltip
ls rends/    # tokens/  base/  components/  index.css ...
```

---

## 4 · Things that can go wrong

| Symptom                                                                       | Fix                                                                                                                                    |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `release.yml` `verify` job fails: tag != `package.json` version               | Tag and `package.json` `version` must match exactly. Re-tag, or bump `package.json` and re-tag.                                        |
| `npm publish` fails with `403 Forbidden`                                      | `NPM_TOKEN` is wrong or expired. Regenerate at npmjs.com (type "Automation").                                                          |
| `npm publish` fails with `403 You do not have permission to publish "rends"`  | The package name was rejected by npm's anti-typosquatting policy as 'too similar to existing packages'. Renamed to `ren10` in 0.8.4 (already applied; this row is left as a marker if the next rename round-trip ever repeats). |
| `ci.yml` Firefox/WebKit a11y or components fail but Chromium passes           | Engine-specific bug surfaced by the matrix. Advisory; doesn't block merge. Investigate via the uploaded `playwright-report-*-firefox` (or `-webkit`) artifact. |
| `ci.yml` visual job fails on Firefox/WebKit but Chromium passes               | Visual baselines are chromium/linux only by design. Firefox/WebKit visual runs always diff against those baselines — they're advisory. |
| `npm ci` fails: lockfile out of sync                                          | Locally run `rm -rf node_modules package-lock.json && npm install`, recommit.                                                          |

---

## 5 · Cutting future releases

Once 0.8.3 is out, the per-release flow is:

1. Land changes on `main`. Each PR that ships user-visible behavior updates `## [Unreleased]` in `CHANGELOG.md`.
2. When ready to cut **X.Y.Z**:
   ```bash
   # 1. Rename the [Unreleased] section header to [X.Y.Z] — YYYY-MM-DD.
   # 2. Add a fresh empty [Unreleased] block above it with the 6 standard buckets.
   # 3. Add the compare-link at the bottom: [X.Y.Z]: ...compare/v(prev)...vX.Y.Z
   # 4. Bump package.json "version" → "X.Y.Z".
   # 5. Update "Current version: X.Y.Z" in README.md.
   # 6. Run npm run agent:skill:pack if you need the distributable skill tarball.
   git add -A
   git commit -m "chore(release): X.Y.Z"
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push --follow-tags
   ```
3. The release workflow does the rest.
