---
type: "RenDS Contract"
title: "ren-avatar component.md"
description: "RenDS Contract generated from the RenDS knowledge graph."
id: contract:primitive:ren-avatar
sourcePath: components/primitives/ren-avatar/component.md
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - contract
  - ren10
  - rends
---

# ren-avatar component.md

Source path: `components/primitives/ren-avatar/component.md`

## Relationships

_No outgoing relationships._

## Structured Data

```json
{
  "kind": "primitive"
}
```

## Source Content

# ren-avatar Component Contract

User identity primitive for images, initials, and presence indicators.

Load this file after `ren-design.md` and before generating, editing, or reviewing `ren-avatar` UI.

## Purpose

- Provide the agent-facing public contract for the `ren-avatar` primitive.
- Keep generated markup aligned with the colocated CSS/JS source.
- Route theming through semantic tokens and the component token API instead of ad hoc styles.

## Use When

- You need the Avatar primitive behavior or visual role.
- The UI should stay inside RenDS' vanilla HTML/CSS/JS conventions.
- The implementation can use the public selectors, states, and imports listed here.

## Do Not Use When

- Native HTML plus `base/primitive-zero.md` is enough.
- A simpler primitive can express the UI without this primitive.
- You would need to invent undocumented selectors, states, or JavaScript APIs.

## aiHints

```yaml
selectionCriteria:
  useWhen:
    - "You need to represent a user or entity identity via image, initials, or fallback glyph."
    - "You need a presence / status dot attached to the identity (online, away, busy, offline)."
    - "You need a stack of overlapping identities (collaborators, attendees) via .ren-avatar-group."
    - "You need consistent circular (or .ren-avatar-square) framing across sizes xs / sm / md / lg / xl / 2xl."
    - "The image must crop to a fixed square with object-fit: cover regardless of source aspect ratio."
  avoidWhen:
    - "You only need a status label or count without identity — use ren-badge / ren-badge-dot."
    - "You need a clickable identity menu / profile dropdown — wrap the avatar in ren-menu / ren-popover."
    - "You need a decorative logo or product icon — use a plain <img> or ren-icon."

canonicalImports:
  css:
    - "rends/components/primitives/ren-avatar/ren-avatar.css"
  notes:
    - "CSS-only primitive — no colocated JS exists. Do not import a ren-avatar.js."
    - "If the page already imports rends/components/index.css, do not import the CSS again."

requiredMarkup:
  - "Root is <div class=\"ren-avatar\"> containing either an <img> or text initials (max 2 chars); never both as siblings."
  - "<img> children must have alt=\"\" when the avatar is decorative, or alt=\"Name\" when it conveys identity."
  - "Status dot must be wrapped together with the avatar in <div class=\"ren-avatar-wrapper\"> with .ren-avatar-status as a sibling, not a child of .ren-avatar."
  - "Avatar groups use <div class=\"ren-avatar-group\"> with .ren-avatar children only (overlap is owned by the group, not by margins on items)."
  - "Size modifiers (.ren-avatar-xs / -sm / -lg / -xl / -2xl) replace the default md size; do not stack two size classes."

forbiddenPatterns:
  - "Background <img> via CSS background-image — always use a real <img> child for alt-text and lazy-loading."
  - "Hardcoded width / height in inline styles — use a size modifier or override --ren-avatar-size."
  - "Communicating presence with .ren-avatar-status alone without a visually-hidden text label (color is not a name)."
  - "Nesting .ren-avatar inside .ren-avatar (e.g., avatar-on-avatar) — group overlap is the documented pattern."
  - "Custom border-radius via inline style — use .ren-avatar-square or override --ren-avatar-radius."

tokenPolicy:
  allowed:
    - "Component tokens: --ren-avatar-bg, --ren-avatar-border, --ren-avatar-color, --ren-avatar-font-size, --ren-avatar-radius, --ren-avatar-size."
    - "Semantic tokens: --color-fill, --color-text-secondary, --color-surface, --color-success, --color-warning, --color-danger."
    - "Size aliases: --avatar-xs / -sm / -md / -lg / -xl / -2xl and --radius-full / --radius-md."
  forbidden:
    - "Primitive palette tokens (--blue-*, --gray-*, --red-*, --green-*, --orange-*, --yellow-*, --teal-*, --purple-*, --pink-*) in consumer code."
    - "Hardcoded hex / named colors for background, border, or status dot."
    - "Bypassing --color-surface for the status ring; the white/dark ring must adapt to theme."

accessibility:
  required:
    - "Provide a meaningful alt attribute on the <img> when the avatar identifies a specific person; use alt=\"\" only when the name is rendered elsewhere."
    - "Initials avatars must have an accessible name via aria-label on the .ren-avatar or visually-hidden text matching the user's full name."
    - "Status indicator must be accompanied by a textual label for screen readers (e.g., visually-hidden \"Online\") — color alone is not sufficient."
    - "Avatar groups should expose a roll-up count or list label (e.g., aria-label=\"3 collaborators\") rather than relying on visual stacking."
    - "Do not attach click handlers to a non-interactive .ren-avatar; wrap in a real <button> or <a> if the identity is actionable."
```

## Required Imports

```html
<link rel="stylesheet" href="rends/components/primitives/ren-avatar/ren-avatar.css">
<!-- No colocated JavaScript file detected. -->
```

If the page already imports `rends/components/index.css`, do not import the CSS twice.

## Canonical Markup

```html
<div class="ren-avatar">...</div>
```

Use the docs page and source files listed below for full examples before adding production markup.

## Variants And Public Selectors

- `.ren-avatar`
- `.ren-avatar-2xl`
- `.ren-avatar-group`
- `.ren-avatar-lg`
- `.ren-avatar-sm`
- `.ren-avatar-square`
- `.ren-avatar-status`
- `.ren-avatar-status-away`
- `.ren-avatar-status-busy`
- `.ren-avatar-status-offline`
- `.ren-avatar-wrapper`
- `.ren-avatar-xl`
- `.ren-avatar-xs`

## States And Attributes

- `None detected in the colocated CSS/JS. Check related files before inventing one.`

## Public Token API

- `--ren-avatar-bg`
- `--ren-avatar-border`
- `--ren-avatar-color`
- `--ren-avatar-font-size`
- `--ren-avatar-radius`
- `--ren-avatar-size`

Theme through these public custom properties before reaching for selectors.

## Accessibility Contract

- Preserve native semantics first; add ARIA only when semantic HTML is insufficient.
- Keep visible keyboard focus via RenDS focus tokens and `:focus-visible`.
- Keep interactive hit areas at 44px minimum unless this file's source clearly defines a smaller non-touch target.
- Respect reduced motion by using RenDS duration/easing tokens only.
- Do not communicate state through color alone.
- This contract is CSS-first; do not introduce JavaScript unless the source component already owns that behavior.

## Related Files

- `components/primitives/ren-avatar/ren-avatar.css`
- `docs/components/ren-avatar.html`
- `ren-design.md`
- `tokens/tokens.md`
- `base/layouts.md`

## Test Expectations

- Run component or docs a11y coverage when markup, states, or ARIA change.
- Run CSS lint when selectors, tokens, or visual states change.
- Manually verify light/dark themes when color, surface, border, or shadow behavior changes.
