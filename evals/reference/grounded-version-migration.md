Read the installed version from `package.json`, then compare it with the target
release's `CHANGELOG.md` and `MIGRATION.md`. Preview local component changes with
`npx ren10 upgrade --dry-run`, review any local overrides, and only then apply
the compatible upgrade. Finish with `npx ren10 doctor` and the project's Ren10
validation suite.
