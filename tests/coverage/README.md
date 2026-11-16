# Per-component test coverage

`npm run coverage:check` checks that every component in `cli/registry.js` has
the tests it needs. `npm run coverage:matrix` prints the full table.

| Category | Who owes it | Where it lives today |
|---|---|---|
| `a11y` | every component | `tests/a11y/docs.spec.cjs`: axe on `docs/components/ren-*.html` |
| `runtime` | every component that ships JS | `tests/components/runtime-smoke.spec.cjs`: mounts the registry usage, activates the first control, and checks that an empty element warns instead of throwing |
| `lifecycle` | every JS component whose usage mounts a `ren-*` element | `runtime-smoke`: lifecycle methods are idempotent, and the element survives disconnect and reconnect |
| `keyboard` | every JS composite and pattern | `tests/components/keyboard-contracts.spec.cjs` and other specs: a test presses the keys the contract promises |
| `rtl` | every component, CSS-only ones included | `tests/components/rtl-smoke.spec.cjs`: mounts the registry usage under `dir="rtl"`; `tests/components/rtl-contracts.spec.cjs`: behaviour that depends on direction |

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

## What `rtl` proves

Every component owes `rtl`, not only the ones that ship JS: a physical `left`
is a right-to-left defect in a stylesheet with no script next to it, and the
generated smoke covers a CSS-only component at no extra cost.

`rtl-smoke.spec.cjs` generates one test per registry component. It mounts the
usage under `dir="ltr"` and `dir="rtl"` and, under RTL, requires that nothing
throws, that the document does not scroll sideways, that no box leaves the
viewport, and that every block-level box is the mirror image of its LTR
position. It checks again with the component open: through `open()` or
`show()`, or through the gesture listed in the spec's `REVEAL` table. A surface
that keeps a physical side on purpose is listed in `PHYSICAL` with the rule
that makes it right; it must stay put and its content must mirror inside it.

The smoke cannot see pseudo-elements, glyphs or key handling, so
`rtl-contracts.spec.cjs` holds the tests for components whose behaviour depends
on direction. Add one there, tagged `@ren-<name> @rtl`, when a component:

- handles `ArrowLeft` / `ArrowRight`;
- places something with a `start` / `end` or `inline-*` option, or with a
  physical side that must not flip;
- draws a fill, a sweep, a thumb, a chevron or an arrow that follows the
  reading order;
- pins part of itself to `direction: ltr`.

The first case is enforced: a test in that spec lists the components whose
script mentions `ArrowLeft` or `ArrowRight` (or uses the roving-focus helper
horizontally) and fails when one of them has no contract there.

The rules those tests apply:

| | Rule |
|---|---|
| Arrow keys | Left/Right are visual. In a horizontal widget the arrow pointing at the inline-end side moves to the next item or opens a submenu: `ArrowRight` under LTR, `ArrowLeft` under RTL. Up/Down, Home/End and PageUp/PageDown keep their meaning; Home is the first item in DOM order. A vertical widget ignores direction. |
| Sides | `top`, `bottom`, `left` and `right` are physical and never flip, on an anchored overlay, a sheet or a toast viewport. Options that follow the direction say so: `start` / `end` alignment, `inline-start` / `inline-end` sides. |
| Flow | What follows the reading order follows the direction: progress and slider fill, the "on" side of a switch, slide order, range caps, leading and trailing icons, directional chevrons and arrows. |
| Not directional | A tick, a colour spectrum and a down/up chevron are the same in both directions. |
| LTR islands | A code is read left to right in every script: OTP slots keep their order and their physical arrow keys. |

Write these tests against visible outcomes: which element has focus, where a
box is relative to another, which slide is in view. Browsers disagree on the
sign of `scrollLeft` under RTL, so never assert on a raw scroll offset. When a
computed value is the only handle on something (a pseudo-element, a gradient),
match it loosely: engines serialise the same value differently.
