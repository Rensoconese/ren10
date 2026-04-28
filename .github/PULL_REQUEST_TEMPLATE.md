<!--
Thanks for the PR! Please fill in the sections below. Delete anything that doesn't apply.
For very small changes (typo fix, doc clarification) feel free to keep this short.
-->

## Summary

<!-- 1–3 sentences. What does this change do, and why? -->

## Type of change

- [ ] feat — new functionality
- [ ] fix — bug or regression
- [ ] docs — documentation only
- [ ] chore — tooling, deps, CI, non-shipping files
- [ ] refactor — code reshape with no behavior change
- [ ] test — test-only change

## Related issue / phase doc

<!-- Link the issue this closes, or the PHASE-*-COMPLETE.md doc this implements. -->
Closes #

## Scope

- [ ] Touches a component (which? `ren-...`)
- [ ] Touches tokens (which? `--...`)
- [ ] Touches the CLI
- [ ] Touches the theme generator / themes
- [ ] Touches the docs site
- [ ] Touches tests / CI only

## Checklist

- [ ] `npm run lint` passes (CSS + JS)
- [ ] `npm run test:a11y` passes
- [ ] `npm run test:components` passes (and new components are registered)
- [ ] `npm run test:visual` passes; if I changed a visual on purpose, baselines are updated and the diff is described below
- [ ] No hardcoded hex literals introduced (semantic tokens only, see `PHASE-7-7-COMPLETE.md` for documented exceptions)
- [ ] `rends/CHANGELOG.md` `[Unreleased]` updated under the right bucket
- [ ] If this is a breaking change, it's marked `**BREAKING —` in the changelog and the migration path is described

## Accessibility

<!-- For component / token / docs changes, describe the a11y posture: -->
<!-- - Keyboard interaction (Tab, Esc, arrows, Enter / Space)? -->
<!-- - Screen reader (ARIA roles, labels, live regions)? -->
<!-- - Color contrast (AA min, AAA where opt-in)? -->
<!-- - Reduced motion? -->

## Visual diff notes

<!-- If `test:visual` baselines were regenerated, list the affected files and explain why. -->

## Screenshots / GIFs

<!-- For UI changes. Drag and drop into the editor. -->
