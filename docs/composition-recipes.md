# Composition recipes

Grounded rules for composing RenDS parts into a page. Every recipe here is
demonstrated by the runnable page `examples/tour-composition.html` and
checked by `tests/components/tour-composition.spec.cjs` at 390px and 1280px.

Read this after `ren-design.md`, `base/layouts.md`, `base/primitive-zero.md`,
and the colocated contracts for the parts you compose. The page addresses
three recurring defects:

- **F06 — inconsistent CTA sizes and detached icons.** `.ren-btn` ships
  `white-space: nowrap` (`components/primitives/ren-button/ren-button.css`).
  Long bilingual labels overflow their control at narrow widths.
- **F07 — payment text, action and result are not grouped.** Explanatory
  copy, the action, and the result note drift apart, so users cannot tell
  what the button will do.
- **F08 — a tour action implies purchase and navigation inherits accordion chrome.** The action must open details, not
  checkout; disclosure must be a real `details`/`summary` or the canonical
  `ren-nav`, keyboard operable, with no nested interactive controls.

## 1. Spatial ownership: prose vs stack

Give each concern exactly one owner:

| Concern | Owner | Why |
| --- | --- | --- |
| Vertical rhythm between siblings | `ren-stack` plus a size modifier | One flex gap per region; no hand-tuned margins. |
| Reading measure for paragraphs | `--width-prose` / `ren-center-prose` | Text wraps at a comfortable measure, independent of layout. |
| Horizontal grouping that wraps | `ren-cluster` | Wraps instead of clipping. |
| Two-dimensional item placement | `ren-grid` plus a column modifier | Collapses to one column below 640px. |

A **stack** owns spacing; **prose** owns measure. Never mix the two: a
paragraph inside a stack does not set its own margins, and a stack does not
narrow itself to a reading width. In the example, the page is
`ren-center ren-stack ren-stack-lg`, sections are `ren-stack`, and only paragraphs get
`max-width: var(--width-prose)`:

```html
<main class="ren-stack ren-center ren-stack-lg">
  <section class="ren-stack">
    <p class="tour-prose">…</p>
  </section>
</main>
```

## 2. Section and footer composition

Compose the page skeleton from named regions in document order:

1. `ren-nav` — site landmark (`<nav aria-label>` + `<ul>` of links).
2. `main` — the single primary landmark, `ren-center ren-stack ren-stack-lg`.
3. `section` — one per theme, each with its own `ren-stack` rhythm.
4. `footer` — a sibling of `main`, not inside it, with `ren-separator`.

Cards own their internal regions through the documented slots: header
(titles/description), body, and footer. The call to action lives in
`ren-card-footer`; the card itself stays a passive `<article>`, so there is
no nested interactive control (no link wrapping a link). Card titles are real
`<h2>`/`<h3>` elements, never styled `<div>`s.

## 3. Native semantics vs visual role

Keep the native element that matches the behavior, then let RenDS classes
supply the visual role:

- **Action** → real `<button>` (or `.ren-btn` on a `<button>`). Never a
  `<div>`.
- **Navigation** → real `<a href>`. If it is the card's primary call to
  action, it may carry `.ren-btn` to get the CTA role, but it stays an anchor
  so the browser's navigation semantics are intact.
- **Disclosure** → native `<details><summary>`. It is keyboard operable and
  announced by every screen reader with no JavaScript. Do not emulate it
  with `div`/`aria-expanded`.
- **Checkbox/consent** → real `<input type="checkbox">` inside
  `<label class="ren-checkbox">`, grouped in a `<fieldset>` + `<legend>`.

Icons are decoration, not controls. An icon that sits inside a button or
link is `aria-hidden="true"` and `focusable="false"`; the control's own text
(or `aria-label`) carries the accessible name.

## 4. Foundation-only brand adapters

A foundation-only installation includes tokens, reset, classless styles and
layouts; it does not include component CSS or behavior. A site can own its
brand components on top of that foundation. Do not assume that a local class
called `ren-card` implements the package card contract. Check VERSION.md and
the actual imports first. This example uses the full package. Its scoped
page styles adapt composition without changing the system source.

Rules for a brand adapter:

- Scope every selector to a page wrapper (`.tour-composition …`). Never edit
  `base/classless.css`, `base/layouts.css`, or component CSS to fit one page.
- Neutralize a component default only at the smallest scope that needs it,
  and say why in a comment. The example removes `.ren-btn` clipping for
  `.tour-cta` only.
- Use semantic (`--color-*`), spacing (`--space-*`) and component
  (`--ren-*`) tokens. Never primitive palette tokens (`--blue-*`, `--gray-*`,
  …) or raw hex.
- Preserve global classless defaults for everyone else. A native `details`
  styled locally must not restyle every `details` on other pages.

## Recipe: bilingual long CTA that wraps instead of clipping (F06)

The label is longer than a narrow control can hold in one line. The adapter
restores wrapping and lets the control grow; the icon stays inside the real
link and keeps its size.

```css
.tour-composition .tour-cta {
  white-space: normal;              /* undo .ren-btn nowrap locally */
  height: auto;                     /* let the control grow */
  line-height: var(--body-leading);
  text-align: start;                /* wrap from the inline start */
}
.tour-composition .tour-cta svg { flex-shrink: 0; }
```

```html
<a class="ren-btn tour-cta" href="#tour-alhambra-details">
  <svg aria-hidden="true" focusable="false" width="16" height="16">…</svg>
  <span>View full tour details, departure times and meeting point</span>
</a>
```

Keep every CTA on the same size and typographic role (here: default
`.ren-btn`, both languages). Do not fix the height; a fixed height hides
wrapped text.

## Recipe: grouped payment region, action, then result (F07)

The explanatory text, the action, and the result note are one region so the
consequence of the button is unambiguous. The region is chrome only — no
payment semantics, no network, no charge.

```html
<div class="ren-stack tour-payment ren-stack-sm" aria-labelledby="payment-heading">
  <h3 id="payment-heading">Payment</h3>
  <p>No payment is taken here. …</p>
  <div>
    <button class="ren-btn tour-cta" type="submit">…</button>
  </div>
  <p class="ren-form-success" data-booking-result aria-live="polite" hidden></p>
</div>
```

Order is fixed: explanation first, then action, then result. The result note
is a live region so the confirmation is announced without moving focus.

## Recipe: disclosure and mobile nav, no horizontal scroll or obstruction (F08)

Use the canonical `ren-nav` for site navigation. The hamburger owns
`aria-expanded` / `aria-controls`; `ren-nav.js` handles Escape-to-close,
resize and link activation. The open menu is absolutely positioned inside the
sticky bar, so it never introduces horizontal scroll.

For in-page "what is included" detail, use native `<details>` and only
neutralize its look locally:

```html
<details class="tour-includes">
  <summary>What is included in this tour?</summary>
  <ul>…</ul>
</details>
```

Do not put interactive controls inside `<summary>` or inside the card's CTA.
The card's primary action opens the details section, never purchase.

## Form composition: labeled required/optional fields and consent

- Text/date/textarea controls live in `ren-field`; checkbox primitives keep
  their native labels. The form lives in `ren-form`. Required consent is
  checked by the demo consumer before announcing success.
- Required controls carry the native `required` attribute; optional labels
  say "optional" in words (not placeholder-only).
- Consent uses real checkboxes. The one-line consent is required; the
  multiline consent is optional and describes how to withdraw it.
- `ren-form` owns validation and emits `ren-submit`. A demo consumer listens
  to `ren-submit`, calls `preventDefault()`, and writes the result note. It
  never POSTs.

```html
<ren-form data-validate="onTouched">
  <form class="ren-form ren-stack" novalidate>
    <ren-field data-rules="required">
      <label>Full name</label>
      <input class="ren-input" type="text" name="fullName" required>
      <span data-error></span>
    </ren-field>
    …
  </form>
</ren-form>
```

## Verification

`tests/components/tour-composition.spec.cjs` loads the example at 390px and
1280px and asserts:

- no horizontal document overflow and every CTA fully inside its card;
- each CTA icon is inside the control's box and the full bilingual label is
  present and not clipped;
- the native `details` toggles open and closed by keyboard;
- the `ren-nav` hamburger opens and closes with the keyboard and does not
  create horizontal scroll;
- the form blocks empty required fields, then shows the demo-only result note
  on a valid, consented submit.
