---
type: "RenDS Example"
title: dialog-workflow.html
description: "RenDS Example generated from the RenDS knowledge graph."
id: example:examples/dialog-workflow.html
sourcePath: examples/dialog-workflow.html
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - example
  - ren10
  - rends
---

# dialog-workflow.html

Source path: `examples/dialog-workflow.html`

## Relationships

_No outgoing relationships._

## Source Content

<!doctype html>
<html lang="en" data-theme="default">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RenDS · Dialog workflow example</title>

  <link rel="stylesheet" href="../index.css">
  <link rel="stylesheet" href="../components/index.css">

  <script type="module" src="../components/composites/ren-dialog/ren-dialog.js"></script>
  <script type="module" src="../components/primitives/ren-field/ren-field.js"></script>
  <script type="module" src="../components/patterns/ren-form/ren-form.js"></script>
</head>
<body>
  <main class="ren-center ren-stack-lg" style="padding: var(--space-6)">
    <header class="ren-stack-xs">
      <h1>Project: Atlas</h1>
      <p style="color: var(--color-text-muted)">Manage settings and dangerous operations.</p>
    </header>

    <section class="ren-card ren-stack">
      <header class="ren-card-header">
        <h2 class="ren-card-title">Quick actions</h2>
      </header>
      <div class="ren-card-body ren-cluster">
        <button class="ren-btn ren-btn-secondary" type="button" data-dialog-trigger="invite-dialog">
          Invite collaborator
        </button>
        <button class="ren-btn ren-btn-danger" type="button" data-dialog-trigger="confirm-delete">
          Delete project
        </button>
      </div>
    </section>

    <!--
      Modal dialog with form.
      <ren-dialog> wraps a real <dialog>. The form uses method="dialog"
      so the browser closes the dialog on submit.
    -->
    <ren-dialog id="invite-dialog">
      <dialog class="ren-dialog ren-dialog-md">
        <div class="ren-dialog-header">
          <h2 class="ren-dialog-title">Invite collaborator</h2>
          <button class="ren-dialog-close" data-dialog-close aria-label="Close"></button>
        </div>

        <form method="dialog" class="ren-dialog-body ren-stack" id="invite-form">
          <ren-field>
            <label>Email address</label>
            <input class="ren-input" type="email" name="email" autocomplete="email" required>
          </ren-field>
          <ren-field>
            <label>Role</label>
            <select class="ren-input" name="role">
              <option value="viewer">Viewer</option>
              <option value="editor" selected>Editor</option>
              <option value="admin">Admin</option>
            </select>
          </ren-field>
        </form>

        <div class="ren-dialog-footer">
          <button type="button" class="ren-btn ren-btn-secondary" data-dialog-close>Cancel</button>
          <button class="ren-btn" type="submit" form="invite-form" data-dialog-close="invite">
            Send invite
          </button>
        </div>
      </dialog>
    </ren-dialog>

    <!--
      Alert dialog: critical destructive confirmation.
      `alert` disables backdrop dismissal so it cannot be closed accidentally.
    -->
    <ren-dialog id="confirm-delete" alert>
      <dialog class="ren-dialog ren-dialog-sm ren-alert-dialog">
        <div class="ren-dialog-header">
          <h2 class="ren-dialog-title">Delete project Atlas?</h2>
        </div>
        <div class="ren-dialog-body">
          <p>This permanently removes the project, its members, and all
          historical data. This action cannot be undone.</p>
        </div>
        <div class="ren-dialog-footer">
          <button type="button" class="ren-btn ren-btn-secondary" data-dialog-close>Cancel</button>
          <button type="button" class="ren-btn ren-btn-danger" data-dialog-close="delete">
            Yes, delete
          </button>
        </div>
      </dialog>
    </ren-dialog>
  </main>

  <script type="module">
    document.querySelector('#invite-dialog').addEventListener('ren-close', (event) => {
      if (event.detail.returnValue === 'invite') {
        const form = document.getElementById('invite-form');
        const data = Object.fromEntries(new FormData(form));
        console.log('invite', data);
        // Send invite via API here.
      }
    });

    document.querySelector('#confirm-delete').addEventListener('ren-close', (event) => {
      if (event.detail.returnValue === 'delete') {
        console.log('delete confirmed');
      }
    });
  </script>
</body>
</html>
