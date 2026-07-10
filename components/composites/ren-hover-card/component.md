# ren-hover-card Component Contract

Non-blocking preview surface shown from hover/focus intent.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-hover-card` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-hover-card` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Hover Card composite behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this composite.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "Hover or keyboard-focus over a trigger should reveal a richer-than-tooltip preview (header + body + footer)."
    - "The preview is informational and non-essential — user can ignore it without losing access to the action."
    - "Show/hide should respect intent: 200ms show delay, 300ms hide grace area so the cursor can move into the card."
    - "Need anchor positioning via position-area + viewport flip via CSS position-try-fallbacks (no JS positioning)."
    - "Trigger keyboard accessibility via focusin/focusout, not just :hover."
  avoidWhen:
    - "The trigger is a primary action and the disclosure is required for the task — use ren-popover (click-driven) or ren-dialog."
    - "You only need a short text annotation — use ren-tooltip (smaller surface, role=\"tooltip\")."
    - "The disclosure must be operable on touch devices without a hover state — touch has no hover; use ren-popover."
    - "Content includes form inputs, focusable controls beyond simple links — ren-popover gives proper dialog semantics."

canonicalImports:
  css:
    - "rends/components/composites/ren-hover-card/ren-hover-card.css"
  js:
    - "rends/components/composites/ren-hover-card/ren-hover-card.js"
  notes:
    - "JS is required: it adds anchor-name/position-anchor inline styles, wires mouseenter/leave + focusin/out, and toggles the native Popover API."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Place the trigger element immediately before <ren-hover-card>, OR set data-hover-trigger=\"<selector>\" on the host to point at a remote trigger."
  - "Inside <ren-hover-card> include a real element with class=\"ren-hover-card\" (the JS will add popover=\"manual\" and the .ren-hover-card class if missing)."
  - "Use .ren-hover-card-header / -body / -footer as the three layout slots; headers should contain a real <h3> or <h4> for the accessible heading."
  - "The trigger receives aria-haspopup=\"tooltip\" and aria-expanded automatically — do not override these in markup."
  - "Show/hide delays come from show-delay / hide-delay attributes (milliseconds) on the host; do not throttle via inline scripts."

forbiddenPatterns:
  - "Using ren-hover-card for click-driven disclosure — there is no click handler, only mouseenter/focusin."
  - "Putting interactive form inputs inside .ren-hover-card-body — the card closes on mouseleave/focusout, so focusing an input would dismiss it."
  - "Manually setting popover=\"auto\" on the inner card — the JS uses popover=\"manual\" so the open/close lifecycle stays in the component's hands."
  - "Overriding the ::before arrow with custom shapes — keep the inherited background/border so it auto-themes."
  - "Hardcoding width via inline styles or non-token values — use .ren-hover-card-sm / -lg or override --color-surface / --shadow-xl through semantic tokens."

tokenPolicy:
  allowed:
    - "Component-level positioning anchor token: --ren-hover-card-anchor (and the internal --ren-hover-card-anchor anchor-name)."
    - "Semantic tokens that style the card chrome and content: --color-surface, --color-border, --color-text, --color-text-muted, --color-accent, --color-accent-strong, --shadow-xl, --radius-lg, --radius-md."
    - "Layout / type / motion tokens: --space-* (0-25, 0-5, 1, 2, 3, 4, 5), --font-size-body, --font-size-body-sm, --font-size-xs, --duration-enter, --ease-enter, --transition-tactile."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded box-shadow / hex colors on the card surface — pipe through --shadow-xl and --color-surface / --color-border."
    - "Custom transition durations; reuse --duration-enter / --ease-enter to honour reduced-motion."

accessibility:
  required:
    - "Trigger must be a focusable element so focusin/focusout reveal the card via keyboard, not only hover."
    - "Trigger carries aria-haspopup=\"tooltip\" and aria-expanded that flips true/false in sync with show()/hide()."
    - "The card uses the native Popover API (popover=\"manual\") so it inerts other content correctly when shown."
    - "Reduced motion disables the entrance animation and hides the decorative arrow; do not override the @media (prefers-reduced-motion: reduce) rules."
    - "On viewports under 640px the card stretches to viewport width — do not lock min-width that breaks this responsive behavior."
    - "Hover cards must never be the only path to an action; provide a click-driven affordance (ren-popover / ren-link) for touch and AT users."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-hover-card/ren-hover-card.css">
<script type="module" src="rends/components/composites/ren-hover-card/ren-hover-card.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<button id="profile-trigger" type="button">Jane Doe</button><ren-hover-card data-hover-trigger="#profile-trigger"><div class="ren-hover-card"><div class="ren-hover-card-header"><h3>Jane Doe</h3></div><div class="ren-hover-card-body">Product designer</div></div></ren-hover-card>

```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-hover-card`
- `.ren-hover-card-body`
- `.ren-hover-card-disabled`
- `.ren-hover-card-footer`
- `.ren-hover-card-header`
- `.ren-hover-card-lg`
- `.ren-hover-card-loading`
- `.ren-hover-card-sm`
- `.ren-hover-card-trigger`

## States And Attributes

- `:focus-visible`
- `:hover`

## Public Token API

- `--ren-hover-card-anchor`

If no `--ren-*` token is detected here, theme through semantic tokens from `tokens/tokens.md` and avoid selector overrides.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-hover-card/ren-hover-card.css`
- `components/composites/ren-hover-card/ren-hover-card.js`
- `docs/components/ren-hover-card.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
