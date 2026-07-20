# Ren10 Visual Quality Detector

The detector checks composed pages for violations that component-level lint
cannot see: layout clipping, inconsistent design values, broken semantics,
rendered overflow, unreadable measures, and contrast failures.

It complements Stylelint, axe, component tests, and visual snapshots. It does
not replace them or impose a generic visual style on Ren10.

## Start

Generate project context from the canonical package contracts:

```bash
npx ren10 design-context --write
```

This writes `.ren10/design.json`. The file is generated from
`ren-design.md`, token CSS, layout contracts, and the component registry. Do
not edit it by hand; regenerate it when those sources change.

Audit source files or a directory:

```bash
npx ren10 detect templates/
npx ren10 detect templates/blocks/index.html --profile codex
npx ren10 detect templates/ --profile strict --json
```

Audit a rendered page:

```bash
npx ren10 detect --url http://localhost:3000
```

Rendered audits require Playwright in the consumer project:

```bash
npm install -D playwright
npx playwright install chromium
```

## Profiles

| Profile | Purpose | Blocking policy |
|---|---|---|
| `generic` | Objective Ren10 contract, semantic, and accessibility checks | Errors block; warnings report |
| `codex` | Generic checks plus recurring generated-layout advisories | Errors block; advisories report |
| `strict` | Release hardening with all profiles enabled | Warnings are promoted to errors |

Provider-specific aesthetic findings are warnings outside `strict`. Ren10
does not ban system fonts, neutral colors, or one-font interfaces merely
because another detector considers them a style tell.

## Static Rules

- `hardcoded-color`
- `primitive-color-token`
- `off-scale-font-size`
- `off-scale-radius`
- `tight-leading`
- `heading-order`
- `broken-image`
- `button-type`
- `clipped-overlay-risk`
- `bespoke-layout` (`codex`)
- `decorative-grid-background` (`codex`)

## Rendered Rules

- `content-overflow`
- `text-viewport-edge`
- `tight-leading`
- `long-line`
- `cramped-padding`
- `low-contrast`
- `monotonous-spacing` (`codex`)

Rendered checks use computed styles and actual element geometry. Static
checks remain dependency-free and are suitable for fast local and CI runs.

## Reviews

Persist an audit when it is useful as a comparison baseline:

```bash
npx ren10 detect templates/blocks/ \
  --profile codex \
  --save-review \
  --review-slug blocks-catalog
```

Snapshots are written to `.ren10/reviews/YYYY-MM-DD__slug.json`. CI does not
write reviews unless explicitly requested.

## Exceptions

Exceptions require an explicit reason and should use the narrowest possible
scope:

```bash
npx ren10 ignores add-value hardcoded-color '#ff0000' \
  --file exports/brand.html \
  --reason 'External brand export owns this value'

npx ren10 ignores add-rule heading-order \
  --reason 'Imported legacy article archive'

npx ren10 ignores add-file 'fixtures/**' \
  --reason 'Intentional detector fixtures'
```

A wildcard value is accepted only with at least one file scope. Project-wide
rule exceptions use `add-rule`, making broad decisions visible in review.

## Codex Hook

Install the post-edit hook in the current project:

```bash
npx ren10 hooks install
```

The command merges `.codex/hooks.json` without replacing existing hooks and
stores runtime settings in `.ren10/config.json`. Approve the project hook in
Codex when prompted.

```bash
npx ren10 hooks status
npx ren10 hooks off
npx ren10 hooks on
```

The hook scans only changed UI files, skips generated and oversized files,
tracks the complete current set of findings, avoids repeated fresh-finding
noise, removes corrected findings, and reports a regression again if it
returns. Ephemeral state lives in `.ren10/cache/` and should not be committed.

## CI

Use `generic` for ordinary pull-request enforcement and `strict` for an
intentional release gate:

```bash
npx ren10 detect templates/ --profile generic
npm run test:detector
npm run design:check
```

Exit code is non-zero when the active profile contains at least one error.
JSON output uses the standard Ren10 API envelope with type
`detector.report`.
