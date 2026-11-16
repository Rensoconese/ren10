# Per-component test coverage

`npm run coverage:check` checks that every component in `cli/registry.js` has
the tests it needs. `npm run coverage:matrix` prints the full table.

| Category | Who owes it | Where it lives today |
|---|---|---|
| `a11y` | every component | `tests/a11y/docs.spec.cjs`: axe on `docs/components/ren-*.html` |
| `runtime` | every component that ships JS | `tests/components/runtime-smoke.spec.cjs`: mounts the registry usage, activates the first control, and checks that an empty element warns instead of throwing |
| `lifecycle` | every JS component whose usage mounts a `ren-*` element | `runtime-smoke`: lifecycle methods are idempotent, and the element survives disconnect and reconnect |
| `keyboard` | every JS composite and pattern | `tests/components/keyboard-contracts.spec.cjs` and other specs: a test presses the keys the contract promises |
| `leaks` | every component that ships JS | `tests/components/leaks.spec.cjs`: mounted, driven and removed six times, it leaves no listener, timer, animation frame, observer or page-level DOM behind |

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

## What `leaks` proves

`leaks` is owed by every component that ships JS, the same rule as `runtime`:
a custom element can forget something in `disconnectedCallback`, and a
component initialised by a function (`initDropZone`, `initToolbar`) can lack a
teardown altogether.

The test that covers the cell runs on every browser. Before the component
module loads, `tests/utils/resource-accounting.cjs` patches the page to count
what is acquired outside the component's own subtree: listeners on `window`,
`document`, `matchMedia()` results, `visualViewport` and any node that stays in
the page; `setInterval` and pending `setTimeout`; animation frames;
Mutation/Resize/IntersectionObservers that were not disconnected; nodes added
to `<head>` or `<body>` and attributes changed on `<html>` and `<body>`. The
component is then mounted, driven (pointer, focus, keys, its lifecycle methods
and one disconnect and reconnect) and removed twice in each of three states:
idle, open, and removed in the task that opened it. After every removal the
count has to be back at the baseline; pending timers are waited for, not
ignored. Across the reconnect, the component's own subtree must not gain
listeners either: one that is added again without having been removed runs its
handler twice. A custom element is removed from the DOM; a function-initialised
component is torn down through the function it exports and stays in the page.
The two projects of the suite differ only in colour scheme, so the test runs
in the light one.

The test fails before any of that if the registry usage makes the component
warn while it mounts (`RenTabs: No tablist found`): a component that bails out
acquires nothing, so nothing would have been tested.

Two things in `leaks.spec.cjs` need a decision when a component changes:

- `SHARED` lists the module-level singletons, such as one delegated
  `document` listener for every instance. They are allowed because they do not
  grow, and the test checks that they do not. Something held after removal
  that is not in the list fails, and the message says whether it grows with
  every instance or stays constant.
- `DRIVERS` holds what the generic driver cannot reach (a toast has to be
  shown, a context menu right-clicked). Run the spec with `LEAKS_SITES=1` to
  print the call sites a test reached: an acquisition that is not there is not
  being tested.

A second test per component forces a garbage collection over CDP and checks
that no instance of the element class survives. It only runs on Chromium, so it
carries no `@ren-*` or `@leaks` tag and never covers a cell.
