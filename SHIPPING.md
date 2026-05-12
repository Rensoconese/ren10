# Shipping checklist — RenDS

How to ship a release of `rends` end-to-end. Currently sized for the **0.8.3 launch**, but the per-release pattern is the same after that.

> All commands below run on **your local machine**. They need your git credentials and `npm login`.

> **Repo layout note.** The GitHub repo `Rensoconese/ren10` is the package itself — the working tree is the package root (where `package.json`, `index.css`, `tokens/`, `components/`, etc. live). On Ren's machine that working tree is at `~/RenDS/rends/`. The parent folder `~/RenDS/` is just a Cowork workspace and is **not** part of the GitHub repo.

---

## 0 · One-time setup (do once, before the first push)

1. **`NPM_TOKEN` secret.** Generate an "Automation" token at <https://www.npmjs.com/settings/~/tokens> and add it at:
   `https://github.com/Rensoconese/ren10/settings/secrets/actions/new`
   - Name: `NPM_TOKEN`
   - Value: the token starting with `npm_…`

2. **GitHub Pages** — currently no `pages.yml` workflow. If you want a public docs site, decide hosting first (re-add `pages.yml`, or Vercel / Netlify / Cloudflare Pages). The repo `pages.yml` was removed deliberately in commit `15d027f`.

---

## 1 · Push the audit branch and open the PR

```bash
cd ~/RenDS/rends    # this folder IS the repo

# Confirm state. The audit work lives on chore/audit-and-cut-0.8.3.
git fetch origin
git status
git log --oneline origin/main..chore/audit-and-cut-0.8.3
# Should show 8 commits ending in 0f8a9ec (ci matrix) and 0e2b303 (release 0.8.3).

# Push the branch — triggers ci.yml against the PR.
git push -u origin chore/audit-and-cut-0.8.3

# Open the PR.
gh pr create --base main --head chore/audit-and-cut-0.8.3 \
  --title "chore: audit 2026-05-11 + cut 0.8.3 + cross-browser CI" \
  --body-file PR_BODY.md   # See `PR_BODY.md` if generated, or paste manually
```

While CI runs, expect:
- **Chromium jobs**: must pass (gating)
- **Firefox / WebKit jobs**: advisory (`continue-on-error: true`). Engine-specific diffs surface as warnings, not failures.

---

## 2 · Merge to main, then cut tags

After the PR is reviewed and merged:

```bash
git checkout main && git pull

# Tag v0.8.3 at the merge commit. release.yml fires on tag push.
git tag -a v0.8.3 -m "Release v0.8.3"
git push origin v0.8.3
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
npm view rends version    # should print 0.8.3
```

- **GitHub Release:** <https://github.com/Rensoconese/ren10/releases/tag/v0.8.3>

Smoke test the npm package in a fresh dir:

```bash
mkdir /tmp/rends-smoke && cd /tmp/rends-smoke
npm init -y
npx rends init
npx rends add button dialog tooltip
ls rends/    # tokens/  base/  components/  index.css ...
```

---

## 4 · Things that can go wrong

| Symptom                                                                       | Fix                                                                                                                                    |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `release.yml` `verify` job fails: tag != `package.json` version               | Tag and `package.json` `version` must match exactly. Re-tag, or bump `package.json` and re-tag.                                        |
| `npm publish` fails with `403 Forbidden`                                      | `NPM_TOKEN` is wrong or expired. Regenerate at npmjs.com (type "Automation").                                                          |
| `npm publish` fails with `403 You do not have permission to publish "rends"`  | The package name `rends` is taken on the public registry. Rename to `@rensoconese/rends` in `package.json` and update README examples. |
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
   git add -A
   git commit -m "chore(release): X.Y.Z"
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push --follow-tags
   ```
3. The release workflow does the rest.
