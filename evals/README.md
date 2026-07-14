# RenDS Evals

Machine-checkable rules for RenDS-aware agents.

## Files

- `prompts.json` — deterministic prompt set. Each entry pairs a user request
  with markup, attributes, textual evidence, and anti-patterns that must (or
  must not) appear in an agent's HTML or prose output.
- `checklist.md` — the binary self-check an agent must pass before
  reporting completion.
- `run-eval.mjs` — minimal regex grader. Verifies a candidate HTML or prose
  artifact against a prompt definition. `--all` also runs
  `regression-checks.mjs`.
- `regression-checks.mjs` — source-level assertions for promised JS
  behavior that an HTML grader cannot exercise (e.g. that `ren-dialog`
  reads `data-dialog-close` and propagates it as `returnValue`).
- `fixtures/` — deliberately invalid inputs for repair, refusal, and migration
  evals. `--all` must reject each negative fixture before accepting the
  corresponding reference output.

## Workflow

1. Pick a prompt from `prompts.json` (or feed an agent a task that maps
   to one of the IDs).
2. The agent generates the requested HTML or grounded prose output.
3. Run the grader:

   ```bash
   node evals/run-eval.mjs auth-form path/to/candidate.html
   ```

4. Optionally grade all reference examples in one shot:

   ```bash
   node evals/run-eval.mjs --all
   ```

5. Run `npm run lint` from the package root to enforce token policy on
   any extracted CSS.

## Adding a new eval

- Pick a unique `id` (kebab-case).
- Write the user prompt the way a real consumer would phrase it.
- Fill `expectedComponents`, `expectedAttributes`, `expectedText`, and
  `forbiddenPatterns` with the smallest deterministic set that captures the
  rule.
- Add a reference artifact under `examples/` for executable UI or
  `evals/reference/` for grounded prose, and link it via `referenceFile` so
  `--all` keeps regressions in scope.
- For repair or refusal cases, add `inputFixture`. The full eval run treats
  acceptance of that negative artifact as a test failure.

## Limits

The grader is regex-based. It catches missing primitives and disallowed
tokens but does NOT validate a11y, focus order, or runtime behavior.
Pair with `npm run lint` and the Playwright a11y suite.
