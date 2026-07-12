# Grok Implementation Packet

## Objective

State the module id, Ren10 block path, and the single implementation outcome
this packet authorizes. Do not expand scope beyond the allowed files.

## Complete reference brief

This packet must be self-contained. Embed the complete filled contents of
`reference-brief.md` inline below. Links or repository paths may be included as
supplemental only and can never replace the embedded content. Grok must treat
source-derived facts and labeled visual inferences separately. Never reconstruct
Relume source from memory if extraction was incomplete.

## RenDS translation map

Embed the complete filled contents of `translation-map.md` inline below. Links
or repository paths may be included as supplemental only and can never replace
the embedded content. Implementation must follow the chosen RenDS parts, cascade
mitigations, responsive adaptation, and progressive-enhancement plan. Rejected
mappings must not reappear.

## Acceptance criteria

Copy the machine-readable criteria from `acceptance.json` and restate any
block-specific structural, behavioral, and visual-structure checks. Automated
criteria are necessary but not sufficient for shipping.

## Required RED evidence

Before production edits, run the focused regression tests against the current
tree and record the expected failing result. Production implementation begins
only after RED evidence is captured.

## Allowed files

List the exact repository-relative paths Grok may change (must match
`packet.json` `allowedFiles`). Feature commits may include only these paths.

## Forbidden files and dependencies

- Planning docs, core RenDS APIs, tokens, registries, and unrelated files unless
  this packet explicitly authorizes them.
- Relume source, classes, text, URLs, assets, and runtime dependencies.
- Framework abstractions (React, Vue, Svelte, JSX/TSX, Tailwind, shadcn).
- Shadow DOM (`attachShadow`).

## Required render matrix

Implement against the states declared in `render-matrix.json`. Minimum coverage
includes desktop/mobile, light/dark, open/default interaction states, JavaScript-
disabled fallback where promised, and reduced motion. Screenshots used for
review must be newly captured after the latest edit (cache-busting URL required).

## Required validation commands

Record the exact commands for this packet, typically:

```bash
node --test scripts/relume-workflow.test.mjs
npx playwright test <focused-spec>
npm run lint
git diff --check
```

Also run any package scripts listed in the packet acceptance contract.

## Completion report format

Report:

1. RED evidence (command + failing summary).
2. GREEN evidence (command + pass summary).
3. Files changed (must equal allowed files).
4. Intentional Ren10 differences from the reference.
5. Render-matrix states prepared for Codex capture.
6. Known residual risks.

Passing automated tests do not advance the packet past `green`. Codex must
perform independent visual review of fresh desktop and mobile captures plus
DOM/CSS cascade inspection before `green` → `reviewed`. A human acceptor (not
automation, CI, Codex, or Grok) must accept before `reviewed` → `accepted`.

Record each stage transition as its own packet-local evidence JSON file and
store the path in `packet.evidence[<completed-stage>]`. A multi-stage audit
ledger cannot substitute for those per-stage files; `validatePacketDir` reloads
every completed pointer with the same schema as `advancePacket`.
