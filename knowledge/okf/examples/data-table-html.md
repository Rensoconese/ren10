---
type: "RenDS Example"
title: data-table.html
description: "RenDS Example generated from the RenDS knowledge graph."
id: example:examples/data-table.html
sourcePath: examples/data-table.html
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - example
  - ren10
  - rends
---

# data-table.html

Source path: `examples/data-table.html`

## Relationships

_No outgoing relationships._

## Source Content

<!doctype html>
<html lang="en" data-theme="default">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>RenDS · Data table example</title>

  <link rel="stylesheet" href="../index.css">
  <link rel="stylesheet" href="../components/index.css">

  <script type="module" src="../components/primitives/ren-field/ren-field.js"></script>
</head>
<body>
  <!--
    List management screen: filters at the top, table below, pagination
    underneath. ren-center caps width, ren-stack-lg spaces sections.
  -->
  <main class="ren-center-wide ren-stack-lg" style="padding: var(--space-6)">
    <header class="ren-row-spread">
      <div class="ren-stack-xs">
        <h1>Users</h1>
        <p style="color: var(--color-text-muted)">3,482 active accounts.</p>
      </div>
      <div class="ren-cluster">
        <button class="ren-btn ren-btn-secondary" type="button">Export CSV</button>
        <button class="ren-btn" type="button">Invite user</button>
      </div>
    </header>

    <!-- Filters -->
    <section class="ren-card">
      <div class="ren-card-body ren-row" style="gap: var(--space-3); flex-wrap: wrap">
        <ren-field style="flex: 1; min-width: 12rem">
          <label class="ren-sr-only">Search users</label>
          <span class="ren-input-wrapper">
            <span class="ren-input-icon" aria-hidden="true">🔍</span>
            <input class="ren-input" type="search" name="q" placeholder="Search by name or email">
          </span>
        </ren-field>

        <ren-field>
          <label class="ren-sr-only">Filter role</label>
          <select class="ren-input" name="role">
            <option>All roles</option>
            <option>Admin</option>
            <option>Member</option>
            <option>Billing</option>
          </select>
        </ren-field>

        <ren-field>
          <label class="ren-sr-only">Filter status</label>
          <select class="ren-input" name="status">
            <option>All statuses</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
          </select>
        </ren-field>
      </div>
    </section>

    <!-- Table -->
    <section class="ren-card">
      <table class="ren-table">
        <caption class="ren-sr-only">Users</caption>
        <thead>
          <tr>
            <th scope="col" style="width: 2rem">
              <label class="ren-checkbox">
                <input type="checkbox" aria-label="Select all">
                <span class="ren-checkbox-control"></span>
              </label>
            </th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Status</th>
            <th scope="col">Last seen</th>
            <th scope="col"><span class="ren-sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <label class="ren-checkbox">
                <input type="checkbox" aria-label="Select Sofía">
                <span class="ren-checkbox-control"></span>
              </label>
            </td>
            <td>
              <div class="ren-row" style="gap: var(--space-2)">
                <span class="ren-avatar" aria-hidden="true"><span>S</span></span>
                <span>Sofía Reyes</span>
              </div>
            </td>
            <td>sofia@acme.io</td>
            <td><span class="ren-tag ren-tag-primary">Admin</span></td>
            <td><span class="ren-badge ren-badge-success">Active</span></td>
            <td>2m ago</td>
            <td>
              <button class="ren-btn ren-btn-ghost ren-btn-sm" type="button" aria-label="More actions">⋯</button>
            </td>
          </tr>
          <tr>
            <td>
              <label class="ren-checkbox">
                <input type="checkbox" aria-label="Select Iván">
                <span class="ren-checkbox-control"></span>
              </label>
            </td>
            <td>
              <div class="ren-row" style="gap: var(--space-2)">
                <span class="ren-avatar" aria-hidden="true"><span>I</span></span>
                <span>Iván Castro</span>
              </div>
            </td>
            <td>ivan@acme.io</td>
            <td><span class="ren-tag">Member</span></td>
            <td><span class="ren-badge ren-badge-warning">Pending</span></td>
            <td>1h ago</td>
            <td>
              <button class="ren-btn ren-btn-ghost ren-btn-sm" type="button" aria-label="More actions">⋯</button>
            </td>
          </tr>
          <tr>
            <td>
              <label class="ren-checkbox">
                <input type="checkbox" aria-label="Select Lía">
                <span class="ren-checkbox-control"></span>
              </label>
            </td>
            <td>
              <div class="ren-row" style="gap: var(--space-2)">
                <span class="ren-avatar" aria-hidden="true"><span>L</span></span>
                <span>Lía Vargas</span>
              </div>
            </td>
            <td>lia@acme.io</td>
            <td><span class="ren-tag">Member</span></td>
            <td><span class="ren-badge ren-badge-danger">Suspended</span></td>
            <td>3d ago</td>
            <td>
              <button class="ren-btn ren-btn-ghost ren-btn-sm" type="button" aria-label="More actions">⋯</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Pagination -->
    <nav class="ren-pagination ren-row-spread" aria-label="Pagination">
      <span style="color: var(--color-text-muted)">Showing 1–3 of 3,482</span>
      <div class="ren-cluster">
        <button class="ren-btn ren-btn-ghost" type="button" disabled>Previous</button>
        <button class="ren-btn ren-btn-ghost" type="button">Next</button>
      </div>
    </nav>
  </main>
</body>
</html>
