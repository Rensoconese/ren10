# ren-popover Component Contract

Non-modal floating surface for contextual controls or content.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-popover` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-popover` composite.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Popover composite behavior or visual role.
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
    - "Click on a trigger should reveal a small contextual surface (filters, mini-form, info card) anchored to that trigger."
    - "You need anchor-positioned placement (top/right/bottom/left) via position-area with automatic viewport flip via position-try-fallbacks."
    - "Need click-outside + Escape dismissal and a visible arrow caret that re-rotates per [data-side]."
    - "Need progressive enhancement: anchor positioning in modern browsers, JS computePosition() fallback elsewhere."
    - "Need header / body / footer slots inside the popover surface, with native role=\"dialog\" + aria-modal=\"false\"."
  avoidWhen:
    - "The disclosure blocks the page and demands the user's attention — use ren-dialog (modal)."
    - "Disclosure is reveal-on-hover-intent for non-essential preview content — use ren-hover-card."
    - "Disclosure is a short text annotation only — use ren-tooltip."
    - "Disclosure is a list of commands (menu) — use ren-menu / ren-context-menu."
    - "Disclosure is a side sheet — use ren-sheet."

canonicalImports:
  css:
    - "rends/components/composites/ren-popover/ren-popover.css"
  js:
    - "rends/components/composites/ren-popover/ren-popover.js"
  notes:
    - "JS attaches click + Escape + outside-click handlers and computes JS positioning only when CSS anchor positioning is unsupported."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Use <ren-popover placement=\"bottom\" offset=\"8\"> as the host so it adds .ren-popover, role=\"dialog\", and popover=\"manual\" automatically."
  - "The trigger is referenced via trigger-id=\"<id>\", or by a child / previous-sibling with [data-popover-trigger]; the component picks them in that order."
  - "Inside the popover, group content into .ren-popover-header / .ren-popover-body / .ren-popover-footer; a .ren-popover-arrow div is injected if missing."
  - "Triggers should be real interactive elements (<button> or <a>) so click + keyboard activation work; the component does not click-style arbitrary nodes."
  - "When using multiple popovers in the same view, set unique trigger-id values so the click handlers do not cross-wire."

forbiddenPatterns:
  - "Manually wiring trigger.addEventListener('click', popover.show) — the host already attaches its click + dismissable listeners."
  - "Calling showPopover() directly while bypassing open() — aria-modal, data-state, and ren-open event won't fire."
  - "Hardcoding inline left/top values — let CSS position-anchor + position-area + position-try-fallbacks handle placement and flips (or the JS computePosition fallback)."
  - "Removing the .ren-popover-arrow element — the [data-side] rules rotate it per side; without it the visual anchor cue disappears."
  - "Using ren-popover purely as a click-bound tooltip — accessibility expectations differ; use ren-tooltip for short, non-interactive text."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-popover-bg, --ren-popover-border-color, --ren-popover-duration, --ren-popover-easing, --ren-popover-padding, --ren-popover-radius, --ren-popover-shadow, --ren-popover-width."
    - "Semantic tokens used inside content: --color-surface, --color-border, --color-text-primary, --color-text-secondary, --shadow-lg, --radius-lg."
    - "Layout / type / motion tokens: --space-2, --space-3, --space-4, --size-body-sm, --z-popover, --duration-enter, --ease-enter."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer overrides."
    - "Hardcoded backdrop / surface colors via inline styles or rgba()."
    - "Custom animation timings; reuse --duration-enter / --ease-enter (or --ren-popover-duration / --ren-popover-easing) so reduced-motion overrides apply."

accessibility:
  required:
    - "<ren-popover> sets role=\"dialog\" with aria-modal=\"false\" (non-modal by design). Do not set aria-modal=\"true\" or apply focus trapping."
    - "Trigger must be a focusable, real interactive element; click + Enter/Space activation come from native button semantics."
    - "Escape closes the popover via the document keydown handler; outside-click closes via the document click handler — do not stopPropagation on container click outside these targets."
    - "When CSS anchor positioning is unsupported the host applies left/top to the popover element; do not overlay your own positioning style or the flip logic breaks."
    - "Reduced motion strips the transform animation (opacity-only); keep the @media (prefers-reduced-motion: reduce) block intact."
    - "Avoid putting form submit buttons that affect the page outside the popover surface — keep the interaction self-contained within the dialog role."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/composites/ren-popover/ren-popover.css">
<script type="module" src="rends/components/composites/ren-popover/ren-popover.js"></script>
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<button id="account-trigger" type="button" data-popover-trigger>Account</button>
<ren-popover trigger-id="account-trigger" placement="bottom">
  <div class="ren-popover-header"><strong>Account</strong></div>
  <div class="ren-popover-body">Signed in as Jane</div>
</ren-popover>

```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-open`
- `.ren-popover`
- `.ren-popover-arrow`
- `.ren-popover-body`
- `.ren-popover-footer`
- `.ren-popover-header`
- `.ren-popover-trigger`

## States And Attributes

- `[data-popover-trigger]`
- `[data-side]`

## Public Token API

- `--ren-popover-bg`
- `--ren-popover-border-color`
- `--ren-popover-duration`
- `--ren-popover-easing`
- `--ren-popover-padding`
- `--ren-popover-radius`
- `--ren-popover-shadow`
- `--ren-popover-width`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- Keep JS behavior progressive: the visual structure should remain understandable before enhancement.

## Related Files

- `components/composites/ren-popover/ren-popover.css`
- `components/composites/ren-popover/ren-popover.js`
- `docs/components/ren-popover.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
