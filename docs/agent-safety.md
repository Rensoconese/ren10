# Agent safety attributes

Browser agents (computer-use models, browser extensions, WebMCP tools) can
press buttons, fill fields and read the page. Three `data-agent-*`
attributes let a RenDS page state, in its own markup, what such an agent
must not do on its own. They are plain HTML attributes: no script reads
them, nothing changes for people, and they cost nothing when no agent is
present.

| Attribute | Put it on | Meaning for an agent |
|---|---|---|
| `data-agent-confirm="<what it does>"` | The control that performs an irreversible or outward-facing action: delete, pay, send, publish, transfer. | Ask a person before activating this element or anything inside it. Show them the sentence. |
| `data-agent-secret` | A field whose value an agent may fill but must never read back. | Fill it if asked; never read, quote or log its value. |
| `data-agent-hidden` | A region an agent should not see at all: recovery codes, API keys shown once, private notes. | Ignore this region and everything inside it. |

The names and meanings match the agent bridge of
[ui-sdk](https://github.com/vercel-labs/ui) (`@ui-sdk/*`), so a page marked
for one host is marked for all of them. RenDS itself ships no agent bridge
and does **not** enforce these attributes: they are a declaration that an
agent host honors. Never rely on them as access control. The server must
still authorize every destructive request.

## `data-agent-confirm`

- **Mark the control that commits the action, not the one that opens a
  confirmation.** For a `<ren-dialog alert>`, put it on the confirming
  button (`data-dialog-close="delete"`), not on the trigger (opening the
  dialog is harmless) and not on the `<dialog>` (that would also gate
  Cancel).
- **Write the sentence for the person who will be asked**, in plain words
  and from the page's own state: "Permanently deletes project Atlas, its
  members and all historical data", not "Confirm" or "delete".
- **Give the confirming button its own wording.** "Yes, delete my account"
  for a "Delete account" trigger. An agent that looks for "Delete" should not
  find the confirming button first.
- It covers the element and its descendants. A whole `<form>` that sends
  money can carry it once; a menu of mixed items marks only the destructive
  `menuitem`.

```html
<button type="button" class="ren-btn ren-btn-danger" data-dialog-trigger="confirm-delete">
  Delete account
</button>

<ren-dialog id="confirm-delete" alert>
  <dialog class="ren-dialog ren-dialog-sm ren-alert-dialog">
    <div class="ren-dialog-header">
      <h2 class="ren-dialog-title">Delete your account?</h2>
    </div>
    <div class="ren-dialog-footer">
      <button type="button" class="ren-btn ren-btn-secondary" data-dialog-close>Cancel</button>
      <button type="button" class="ren-btn ren-btn-danger" data-dialog-close="delete"
              data-agent-confirm="Permanently deletes your account and all associated data">
        Yes, delete my account
      </button>
    </div>
  </dialog>
</ren-dialog>
```

`examples/dialog-workflow.html` and `examples/settings-form.html` show the
pattern in full.

## `data-agent-secret`

Password fields (`type="password"`), one-time-code fields
(`autocomplete="one-time-code"`) and payment card fields
(`autocomplete="cc-*"`) are secret already; do not add the attribute to
them. Use it for other values an agent may enter but should not repeat: a
recovery phrase, a personal ID number, a private API key typed by the user,
and `<ren-otp>`, whose per-digit inputs use `autocomplete="off"`. On a
container it covers every field inside.

```html
<ren-otp length="6" type="numeric" aria-label="Verification code" data-agent-secret></ren-otp>
```

```html
<ren-field>
  <label for="recovery-phrase">Recovery phrase</label>
  <input id="recovery-phrase" name="recovery-phrase" type="text" autocomplete="off" data-agent-secret>
</ren-field>
```

## `data-agent-hidden`

Use it on a region whose content an agent should not read at all, such as
backup codes shown once. Do not use it to hide interface an agent needs
to operate, and do not use it instead of `aria-hidden="true"`: decorative
content still takes `aria-hidden`, which hides it from assistive technology
and agents alike.

```html
<section class="ren-card" aria-labelledby="backup-codes-title" data-agent-hidden>
  <h2 id="backup-codes-title" class="ren-card-title">Backup codes</h2>
  <ul class="ren-stack-xs">...</ul>
</section>
```

## For agent hosts

A host that drives a RenDS page honors the attributes before it acts:

```js
const needsPerson = (element) => element.closest('[data-agent-confirm]')?.dataset.agentConfirm ?? null;
const isSecret = (field) =>
  field.closest('[data-agent-secret]') !== null
  || field.type === 'password'
  || /^(one-time-code|cc-)/.test(field.autocomplete);
const isHidden = (element) => element.closest('[data-agent-hidden]') !== null;
```

Ask the person with the `needsPerson` sentence before a click or submit,
leave secret values out of anything the model reads, and drop hidden regions
from the page snapshot.
