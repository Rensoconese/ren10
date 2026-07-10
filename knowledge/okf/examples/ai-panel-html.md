---
type: "RenDS Example"
title: ai-panel.html
description: "RenDS Example generated from the RenDS knowledge graph."
id: example:examples/ai-panel.html
sourcePath: examples/ai-panel.html
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - example
  - ren10
  - rends
---

# ai-panel.html

Source path: `examples/ai-panel.html`

## Relationships

_No outgoing relationships._

## Source Content

<!doctype html>
<html lang="en" data-theme="default">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RenDS · AI / status panel example</title>

  <link rel="stylesheet" href="../index.css">
  <link rel="stylesheet" href="../components/index.css">

  <script type="module" src="../components/primitives/ren-button/ren-button.js"></script>
</head>
<body>
  <!--
    AI / status panel: ren-with-sidebar with main content on the left
    and a secondary AI rail on the right. Use ren-ai pattern for the
    assistant slot.
  -->
  <main class="ren-with-sidebar" style="--sidebar-width: 22rem">
    <section class="ren-stack-lg" style="padding: var(--space-6)">
      <header class="ren-stack-xs">
        <h1>Compose</h1>
        <p style="color: var(--color-text-muted)">Drafting a release announcement.</p>
      </header>

      <article class="ren-card">
        <div class="ren-card-body ren-stack">
          <h2>Announcing RenDS 0.8.2</h2>
          <p>RenDS 0.8.2 ships an AI-compliance layer …</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      </article>
    </section>

    <!-- AI rail -->
    <aside class="ren-stack" style="padding: var(--space-6); border-inline-start: var(--stroke-1) solid var(--color-border)">
      <header class="ren-stack-xs">
        <h2 class="ren-row" style="gap: var(--space-2)">
          <span class="ren-ai-indicator" aria-hidden="true"></span>
          Assistant
        </h2>
        <p style="color: var(--color-text-muted)">Ask for a rewrite, summary, or tone shift.</p>
      </header>

      <ol class="ren-ai-thread ren-stack" style="list-style: none; padding: 0; margin: 0">
        <li class="ren-ai-message ren-ai-message-user">
          <p>Tighten the opening paragraph.</p>
        </li>
        <li class="ren-ai-message ren-ai-message-assistant">
          <p>Here's a tighter version: "RenDS 0.8.2 adds an AI-compliance
          layer with stricter token enforcement, golden examples, and
          per-component aiHints."</p>
          <div class="ren-cluster">
            <button class="ren-btn ren-btn-sm ren-btn-secondary" type="button">Insert</button>
            <button class="ren-btn ren-btn-sm ren-btn-ghost" type="button">Try again</button>
          </div>
        </li>
        <li class="ren-ai-message ren-ai-message-assistant ren-ai-message-thinking" aria-live="polite">
          <span class="ren-spinner" aria-hidden="true"></span>
          <span>Thinking…</span>
        </li>
      </ol>

      <form class="ren-stack-sm" novalidate>
        <label class="ren-sr-only" for="ai-prompt">Ask the assistant</label>
        <textarea id="ai-prompt" class="ren-input" rows="3"
                  placeholder="Make it shorter, change the tone, etc."></textarea>
        <div class="ren-row-spread">
          <span class="ren-tag" data-status="info">⌘+Enter to send</span>
          <button class="ren-btn ren-btn-sm" type="submit">Ask</button>
        </div>
      </form>
    </aside>
  </main>
</body>
</html>
