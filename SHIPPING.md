# Shipping checklist — RenDS

How to ship a release of `rends` end-to-end. Currently sized for the **0.8.2 launch**, but the per-release pattern is the same after that.

> All commands below run on **your local machine**. They need your git credentials and `npm login`.

> **Repo layout note.** The GitHub repo `Rensoconese/ren10` is the package itself — the working tree is the package root (where `package.json`, `index.css`, `tokens/`, `components/`, etc. live). On Ren's machine that working tree is at `~/RenDS/rends/`. The parent folder `~/RenDS/` is just a Cowork workspace and is **not** part of the GitHub repo.

---

## 0 · One-time setup (do once, before the first push)

1. **`NPM_TOKEN` secret.** Generate an "Automation" token at <https://www.npmjs.com/settings/~/tokens> and add it at:
   `https://github.com/Rensoconese/ren10/settings/secrets/actions/new`
   - Name: `NPM_TOKEN`
   - Value: the token starting with `npm_…`

2. **GitHub Pages → "GitHub Actions" mode.**
   `https://github.com/Rensoconese/ren10/settings/pages` → Source: **GitHub Actions**.

---

## 1 · Push the existing unpushed commits + the new 0.8.2 commit

```bash
cd ~/RenDS/rends    # this folder IS the repo

# Confirm state.
git fetch origin
git status
git log --oneline origin/main..HEAD    # local commits not yet pushed

# Push main and all tags in one shot.
git push origin main --follow-tags
```

What happens after this push:
- `ci.yml` runs against `main` → lint + a11y + components + visual matrix.
- `pages.yml` runs against `main` → deploys the docs site to `https://rensoconese.github.io/ren10/`.
- `release.yml` runs against the `v0.8.2` tag → re-runs lint + a11y + components, verifies the tag matches `package.json` version, then `npm publish`es with provenance, then creates a GitHub Release with notes pulled from `CHANGELOG.md`.

Watch all runs at: <https://github.com/Rensoconese/ren10/actions>

---

## 2 · Verify (~5–10 minutes after the push)

```bash
npm view rends version    # should print 0.8.2
```

- **GitHub Release:** <https://github.com/Rensoconese/ren10/releases/tag/v0.8.2>
- **Pages:** <https://rensoconese.github.io/ren10/>

Smoke test the npm package in a fresh dir:

```bash
mkdir /tmp/rends-smoke && cd /tmp/rends-smoke
npm init -y
npx rends init
npx rends add button dialog tooltip
ls rends/    # tokens/  base/  components/  index.css ...
```

---

## 3 · Things that can go wrong

| Symptom                                                                       | Fix                                                                                                                                    |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `release.yml` `verify` job fails: tag != `package.json` version               | Tag and `package.json` `version` must match exactly. Re-tag, or bump `package.json` and re-tag.                                        |
| `npm publish` fails with `403 Forbidden`                                      | `NPM_TOKEN` is wrong or expired. Regenerate at npmjs.com (type "Automation").                                                          |
| `npm publish` fails with `403 You do not have permission to publish "rends"`  | The package name `rends` is taken on the public registry. Rename to `@rensoconese/rends` in `package.json` and update README examples. |
| `pages.yml` deploys but the site is 404                                       | Settings → Pages → Source must be **GitHub Actions** (not "Deploy from a branch"). Re-run the workflow once the setting is right.      |
| `ci.yml` visual job fails on Firefox/WebKit but Chromium passes               | Linux baselines may differ from your local macOS ones. The matrix has `continue-on-error: true` for non-Chromium so this won't block.  |
| `npm ci` fails: lockfile out of sync                                          | Locally run `rm -rf node_modules package-lock.json && npm install`, recommit.                                                          |

---

## 4 · Cutting future releases

Once 0.8.2 is out, the per-release flow is:

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
