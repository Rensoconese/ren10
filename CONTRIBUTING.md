# Contributing to RenDS

Thanks for considering a contribution. RenDS is small enough that the workflow is informal, but a few conventions keep the codebase coherent.

## Ground rules

1. **Vanilla-first.** No framework dependencies. No build step required to consume the library. JS only where a component genuinely needs it.
2. **Accessibility is non-negotiable.** Every component must pass WCAG 2.1 AA on its docs section before merging. The `tests/a11y` and `tests/components` suites enforce this.
3. **No hardcoded hex.** Use tokens. The seven justified exceptions are documented in `PHASE-7-7-COMPLETE.md` (raw palette, theme defs, pedagogical examples, Houdini `@property` initial-values, color-picker rainbow stops, JSDoc, theme-builder data). Every other hex is a bug.
4. **Cascade layers.** All styles ship inside `@layer reset, tokens, base, components, utilities;`. Nothing should require `!important`.
5. **Backwards compatibility.** Token renames break consumers — prefer adding aliases to swapping. Document any unavoidable break in the CHANGELOG under `**BREAKING —`.

## Getting set up

```bash
git clone git@github.com:Rensoconese/ren10.git
cd ren10/rends
npm install
npx playwright install chromium firefox webkit
```

You don't need to install RenDS itself — every demo file references the source tree directly via relative paths.

## Running tests

```bash
npm test                  # default Playwright run
npm run test:a11y         # axe-core accessibility audit (required before merging)
npm run test:visual       # visual regression (8 Chromium projects × light/dark)
npm run test:components   # per-component scoped a11y + render
npm run lint              # stylelint + eslint
```

If `test:visual` reports diffs you intended, regenerate baselines:

```bash
npm run test:visual -- --update-snapshots
```

Commit the new PNGs alongside your CSS change.

## Adding a component

1. Pick a layer: `primitives` (no JS), `composites` (interactive, JS allowed), or `patterns` (compound, often layout-aware).
2. Create `rends/components/<layer>/ren-<name>/ren-<name>.css` and (if needed) `ren-<name>.js`.
3. Add an entry to `rends/cli/registry.js` with `name`, `layer`, `dir`, `description`, `files`, `deps`, and a `usage` snippet.
4. Add a section to `rends/docs/components.html` and a registry entry in `tests/components/components.spec.cjs` `SECTION_MAP` if the section ID differs from the component name.
5. Update `rends/CHANGELOG.md` `[Unreleased]` under **Added**.

## Commit style

No strict convention is required, but these prefixes help when scanning history:

- `feat:` — new component, token, or public API.
- `fix:` — bug or accessibility regression.
- `docs:` — docs-only change.
- `chore:` — tooling, deps, CI, non-shipping files.
- `refactor:` — code reshape with no behavior change.
- `test:` — test-only change.

## Pull requests

- Reference any related issue or PHASE doc.
- Note which test suites you ran locally.
- Update `CHANGELOG.md` under `[Unreleased]`.
- For breaking changes, mark with `**BREAKING —` in the changelog and explain the migration path.

## Releases

Releases are cut by bumping `rends/package.json`, moving `[Unreleased]` to a dated version block in `CHANGELOG.md`, and pushing a `v<version>` tag. The `release.yml` workflow handles `npm publish` and the GitHub Release.

## Code of Conduct

By contributing you agree to abide by the [Code of Conduct](./CODE_OF_CONDUCT.md).
