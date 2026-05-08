# RenDS Agent Self-Check

Run through this list before reporting any RenDS UI task complete. Each
item is binary: pass / fail. Failures must be fixed, not noted-and-shipped.

## Routing

- [ ] I loaded `rends/ren-design.md` first.
- [ ] I loaded `rends/tokens/tokens.md` before choosing any visual value.
- [ ] I loaded `rends/base/layouts.md` before writing any layout CSS.
- [ ] I loaded the colocated `component.md` / `pattern.md` for every
      RenDS part I used.
- [ ] I did not invent component selectors, attributes, or token names
      that are not in those contracts.

## Stack

- [ ] No React, Vue, Svelte, JSX/TSX, or framework imports.
- [ ] No Tailwind utility classes, no shadcn/ui imports.
- [ ] No Shadow DOM (`attachShadow`); web components render light DOM.
- [ ] Every interactive element is the real semantic element
      (`<button>`, `<a>`, `<input>`, `<dialog>`, `<form>`, …).

## Tokens

- [ ] No primitive palette tokens in component / consumer code:
      `--blue-*`, `--gray-*`, `--red-*`, `--green-*`, `--orange-*`,
      `--yellow-*`, `--teal-*`, `--purple-*`, `--pink-*`.
- [ ] No hardcoded hex / non-grayscale `rgba()` / `hsl()` colors.
- [ ] All overrides theme through `--ren-*` component tokens or semantic
      `--color-*` tokens.

## Layout

- [ ] I used a RenDS layout primitive (`ren-stack`, `ren-cluster`,
      `ren-row`, `ren-row-spread`, `ren-grid`, `ren-with-sidebar`,
      `ren-cover`, `ren-frame`, `ren-switcher`, `ren-reel`,
      `ren-center*`) for the outer skeleton.
- [ ] No raw `display: flex` / `display: grid` where a layout primitive
      already covers the case.
- [ ] No `min-height: 100vh` + manual centering; used `ren-cover`.
- [ ] No `max-width: ...; margin: 0 auto`; used `ren-center*`.

## Accessibility

- [ ] Every interactive element has an accessible name.
- [ ] Every interactive element has visible `:focus-visible` (no
      uncompensated `outline: none`).
- [ ] Touch targets are at least 44×44 (default `ren-btn` size). `-sm`
      sizes are reserved for non-touch contexts.
- [ ] Status / state is not communicated by color alone (text or icon
      pairs the color).
- [ ] Form inputs are labeled (real `<label>`, not placeholder-only).
- [ ] `.ren-form-error-summary` carries `role="alert"` AND `tabindex="-1"`
      (the component will set `tabindex="-1"` if it is missing, but mark
      it explicitly in markup so the contract is visible).
- [ ] Dialogs trap focus and restore it on close (use `ren-dialog`).
- [ ] `[data-dialog-close="value"]` propagates `value` through
      `ren-close.detail.returnValue`. Verified by
      `evals/regression-checks.mjs`.
- [ ] Custom motion respects `prefers-reduced-motion` (use RenDS motion
      tokens).

## Component contracts

- [ ] I matched the `aiHints.requiredMarkup` of every component I used.
- [ ] I avoided every entry in `aiHints.forbiddenPatterns`.
- [ ] My imports match `aiHints.canonicalImports` (CSS first, JS only
      when needed).

## Lint exemptions (hardening debt)

- [ ] If you add a CSS file under `components/`, do not extend the
      `EXEMPT_FILES` list in `stylelint.config.mjs` /
      `scripts/lint-tokens.mjs` without a colocated comment in the CSS
      explaining the non-trivial primitive / hex use.
- [ ] Prefer per-line allowlists (stylelint inline disable comments)
      over full-file exemptions. Full-file exemptions are tracked as
      hardening debt for the 0.9.x line.

## Validation

- [ ] `rg -n "rends/design\.md|DESIGN\.md|COMPONENT\.md|PATTERN\.md|TOKENS\.md|LAYOUTS\.md|PRIMITIVE-ZERO\.md|COMPONENTS\.md" .` returns no stale references.
- [ ] `find rends/components/primitives -mindepth 2 -maxdepth 2 -type f -name component.md | wc -l` is `18`.
- [ ] `find rends/components/composites -mindepth 2 -maxdepth 2 -type f -name component.md | wc -l` is `26`.
- [ ] `find rends/components/patterns   -mindepth 2 -maxdepth 2 -type f -name pattern.md   | wc -l` is `8`.
- [ ] `cd rends && npm run lint` exits 0.
- [ ] `cd rends && node evals/run-eval.mjs --all` exits 0 (covers HTML
      reference grading + JS regression checks).
