# Migration guide

## 0.9.x

Use lowercase contract paths (`ren-design.md`, `tokens.md`, `layouts.md`,
`components.md`). Replace primitive palette variables with semantic `--color-*`
tokens and load `index.css` once. Run `npm run lint:contracts` to find stale
aliases before upgrading.
