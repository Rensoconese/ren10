# Per-component test coverage

`npm run coverage:check` checks that every component in `cli/registry.js` has
the tests it needs. `npm run coverage:matrix` prints the full table.

| Category | Who owes it | Where it lives today |
|---|---|---|
| `a11y` | every component | `tests/a11y/docs.spec.cjs`: axe on `docs/components/ren-*.html` |
| `runtime` | every component that ships JS | `tests/components/runtime-smoke.spec.cjs`: mounts the registry usage, activates the first control, and checks that an empty element warns instead of throwing |
| `lifecycle` | every JS component whose usage mounts a `ren-*` element | `runtime-smoke`: lifecycle methods are idempotent, and the element survives disconnect and reconnect |
| `keyboard` | every JS composite and pattern | `tests/components/keyboard-contracts.spec.cjs` and other specs: a test presses the keys the contract promises |

## How a test counts

A test counts for a cell when it has both tags, on the test or on an enclosing
`describe`:

```js
test('ren-menu closes on Escape', { tag: ['@ren-menu', '@keyboard'] }, async ({ page }) => {
  // ...
});
```

The check reads the tags with `playwright test --list`, which loads the specs
without starting a browser. It fails on these cases:

- a test has one of the two tags but not the other;
- a `@ren-*` tag names something that is not in the registry;
- a required cell has no test and no exemption.

## Exemptions only shrink

[`exemptions.json`](exemptions.json) lists required cells that have no test
yet, each with the reason. It is a list of debt, not a way to opt out:

- An exemption for a cell that now has a test fails the check, so you have to
  delete the entry when you add the test.
- In a pull request, CI runs `coverage:check --base <base branch>`, which fails
  on any exemption the base branch did not have. A new component has to come
  with its tests.

To pay off an entry, write the test with both tags, run `npm run
coverage:check` (it will ask you to remove the entry), and delete the entry.
