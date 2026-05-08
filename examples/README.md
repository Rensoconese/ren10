# RenDS Golden Examples

Concrete, runnable RenDS UI flows. Each `.html` file is a standalone page
that an agent can copy and adapt. They demonstrate **correct** use of
layout primitives, semantic tokens, ARIA, and component composition.

These examples are not marketing pages — they are reference output. Read
the relevant one before generating a new flow for the same shape.

## Files

| File                   | Demonstrates                                          |
|------------------------|-------------------------------------------------------|
| `auth-form.html`       | Centered auth screen: `ren-cover` + `ren-card` + `ren-form` + `ren-field`. |
| `dashboard-shell.html` | Sidebar + main app shell with stat cards and a recent activity table. |
| `settings-form.html`   | Settings page with profile / notifications / danger sections. |
| `data-table.html`      | List management: filters, sortable table, pagination. |
| `dialog-workflow.html` | Modal `ren-dialog` for a form and an alert dialog for a destructive action. |
| `app-sidebar.html`     | Persistent app shell sidebar with sections and footer. |
| `ai-panel.html`        | Main + AI rail layout using the `ren-ai` pattern.     |

## Conventions

Every example follows these rules:

1. The `<head>` imports `../index.css` (foundation) plus the smallest set
   of component CSS / JS needed for the page.
2. The outer layout uses a RenDS layout primitive
   (`ren-cover`, `ren-with-sidebar`, `ren-center`, etc.).
3. Spacing comes from layout primitives + `--space-*` tokens; never from
   hand-tuned margins.
4. Color uses semantic (`--color-*`) tokens. No hex / rgba in markup.
5. Every interactive element has an accessible name and a visible focus
   ring (no `outline: none` overrides).
6. Form inputs live inside `ren-field`; forms live inside `ren-form`.
7. Dialogs wrap a real `<dialog>`; sidebars wrap a real `<nav>`.
