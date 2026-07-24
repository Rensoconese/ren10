# Translation Map — Header25

| Source fact | Ren10 translation |
|---|---|
| Centered max-width content-height hero | Native `section` + `ren-center ren-center-prose ren-stack` |
| Heading and description | Native `h1` and `p` |
| Search form | Native GET `form` with `ren-switcher` row |
| Search field | `ren-field` with visible `label`, `.ren-input-wrapper`, and one native search input |
| Leading icon | `.ren-input-icon` containing decorative `aria-hidden` SVG |
| Submit | One real `.ren-btn` submit button |
| Feedback | One hidden polite status populated after enhanced valid submission |
| No JavaScript | Native required validation and GET navigation to a resolvable local target |

## Cascade risks

- Native heading, paragraph, and form margins are reset only inside `rh25-` selectors.
- The inline script is `type="module"`, selects `[data-rh25-root]` once, and scopes all descendant queries.
- Ren10 center, stack, switcher, field, input-wrapper, and button contracts own layout and control styling.
- No generic selector or global ID is used for behavior.

## Responsive adaptation

- The form stacks by default and uses a no-wrap switcher row from 40rem.
- The input wrapper remains width-safe with `min-width: 0`; the submit becomes max-content only in the inline state.

## Progressive enhancement

- Before upgrade and without JavaScript, the visible label, native search input, required validation, submit, action, and query parameter work.
- JavaScript only replaces valid navigation with a polite status that names the searched term; it does not add a CTA.
