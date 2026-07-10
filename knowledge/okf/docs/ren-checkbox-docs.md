---
type: "RenDS Docs Page"
title: "ren-checkbox docs"
description: "RenDS Docs Page generated from the RenDS knowledge graph."
id: docs:docs/components/ren-checkbox.html
sourcePath: docs/components/ren-checkbox.html
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - docs-page
  - ren10
  - rends
---

# ren-checkbox docs

Source path: `docs/components/ren-checkbox.html`

## Relationships

_No outgoing relationships._

## Source Content

<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Checkbox — RenDS Components</title>
  <link rel="stylesheet" href="../../index.css">
  <link rel="stylesheet" href="../../components/index.css">
  <link rel="stylesheet" href="../../themes/appearance.css">
  <link rel="stylesheet" href="../../tokens/component/tokens.css">
  <link rel="stylesheet" href="../../site/shell.css">
  <style>
    .dx-demo { border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; margin: var(--space-4) 0; }
    .dx-demo-preview { background: var(--color-surface-raised); padding: var(--space-6) var(--space-5); display: flex; flex-direction: column; gap: var(--space-3); }
    .dx-demo-code { margin: 0; border-radius: 0; border: none; border-top: 1px solid var(--color-border); }
    .dx-vgrid { display: grid; gap: var(--space-6); margin: var(--space-4) 0; }
    .dx-vrow { display: grid; grid-template-columns: 140px 1fr; gap: var(--space-4); align-items: start; }
    .dx-vrow-label { font-size: var(--text-xs); font-weight: var(--weight-semibold); text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); padding-top: var(--space-3); }
    .dx-vrow-items { padding: var(--space-4); background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: var(--space-3); }
    @media (max-width: 720px) { .dx-vrow { grid-template-columns: 1fr; gap: var(--space-2); } .dx-vrow-label { padding-top: 0; } }
    .dx-anatomy-stage { background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-6) var(--space-5); margin: var(--space-4) 0; }
  </style>
</head>
<body>

  <header class="dx-nav">
    <div class="dx-nav-inner">
      <a href="../index.html" class="dx-brand"><span class="dx-brand-mark">R</span><span>RenDS</span><span class="ren-badge ren-badge-secondary" style="margin-left: var(--space-1);">v0.9.0</span></a>
      <nav class="dx-nav-menu" aria-label="Primary">
        <a href="../index.html">Docs</a>
        <a href="../components.html" aria-current="page">Components</a>
        <a href="../../templates/index.html">Templates</a>
        <a href="../../create/index.html">Theme Builder</a>
      </nav>
      <div class="dx-nav-actions">
        <a href="https://github.com/Rensoconese/ren10" class="ren-btn ren-btn-ghost ren-btn-sm">GitHub</a>
        <a href="../getting-started.html" class="ren-btn ren-btn-primary ren-btn-sm">Get started</a>
      </div>
    </div>
  </header>

  <div class="dx-shell dx-shell-grid">
    <aside class="dx-sidebar" aria-label="Site navigation">
      <h3>Guides</h3>
      <ul>
        <li><a href="../getting-started.html">Getting Started</a></li>
        <li><a href="../theming.html">Theming</a></li>
        <li><a href="../accessibility.html">Accessibility</a></li>
        <li><a href="../cli.html">CLI</a></li>
      </ul>

      <h3>Foundations</h3>
      <ul>
        <li><a href="../primitive-zero.html">Primitive Zero</a></li>
        <li><a href="../tokens.html">Tokens</a></li>
        <li><a href="../layouts.html">Layouts</a></li>
      </ul>

      <h3>Primitives</h3>
      <ul>
        <li><a href="ren-button.html">Button</a></li>
        <li><a href="ren-card.html">Card</a></li>
        <li><a href="ren-badge.html">Badge</a></li>
        <li><a href="ren-tag.html">Tag</a></li>
        <li><a href="ren-link.html">Link</a></li>
        <li><a href="ren-banner.html">Banner</a></li>
        <li><a href="ren-breadcrumb.html">Breadcrumb</a></li>
        <li><a href="ren-pagination.html">Pagination</a></li>
        <li><a href="ren-separator.html">Separator</a></li>
        <li><a href="ren-avatar.html">Avatar</a></li>
        <li><a href="ren-spinner.html">Spinner</a></li>
        <li><a href="ren-skeleton.html">Skeleton</a></li>
        <li><a href="ren-kbd.html">Keyboard Key</a></li>
        <li><a href="ren-icon.html">Icons</a></li>
        <li><a href="ren-field.html">Field</a></li>
        <li><a href="ren-checkbox.html" aria-current="page">Checkbox</a></li>
        <li><a href="ren-switch.html">Switch</a></li>
        <li><a href="ren-radio.html">Radio</a></li>
        <li><a href="ren-progress.html">Progress</a></li>
      </ul>

      <h3>Composites</h3>
      <ul>
        <li><a href="ren-tabs.html">Tabs</a></li>
        <li><a href="ren-accordion.html">Accordion</a></li>
        <li><a href="ren-dialog.html">Dialog</a></li>
        <li><a href="ren-alert-dialog.html">Alert Dialog</a></li>
        <li><a href="ren-toast.html">Toast</a></li>
        <li><a href="ren-tooltip.html">Tooltip</a></li>
        <li><a href="ren-popover.html">Popover</a></li>
        <li><a href="ren-hover-card.html">Hover Card</a></li>
        <li><a href="ren-sheet.html">Sheet</a></li>
        <li><a href="ren-collapsible.html">Collapsible</a></li>
        <li><a href="ren-toolbar.html">Toolbar</a></li>
        <li><a href="ren-dropzone.html">Dropzone</a></li>
        <li><a href="ren-combobox.html">Combobox</a></li>
        <li><a href="ren-slider.html">Slider</a></li>
        <li><a href="ren-toggle-group.html">Toggle Group</a></li>
        <li><a href="ren-scroll-area.html">Scroll Area</a></li>
        <li><a href="ren-select.html">Select</a></li>
        <li><a href="ren-menu.html">Menu</a></li>
        <li><a href="ren-menubar.html">Menubar</a></li>
        <li><a href="ren-context-menu.html">Context Menu</a></li>
        <li><a href="ren-command.html">Command Palette</a></li>
        <li><a href="ren-number-field.html">Number Field</a></li>
        <li><a href="ren-otp.html">Input OTP</a></li>
        <li><a href="ren-color-picker.html">Color Picker</a></li>
        <li><a href="ren-calendar.html">Calendar</a></li>
        <li><a href="ren-date-picker.html">Date Picker</a></li>
        <li><a href="ren-date-range-picker.html">Date Range Picker</a></li>
        <li><a href="ren-carousel.html">Carousel</a></li>
      </ul>

      <h3>Patterns</h3>
      <ul>
        <li><a href="ren-nav.html">Nav</a></li>
        <li><a href="ren-sidebar.html">Sidebar</a></li>
        <li><a href="ren-empty-state.html">Empty State</a></li>
        <li><a href="ren-table.html">Data Table</a></li>
        <li><a href="ren-form.html">Form Validation</a></li>
        <li><a href="ren-ai.html">AI Patterns</a></li>
      </ul>

      <h3>Reference</h3>
      <ul>
        <li><a href="../components.html">Components catalog</a></li>
</ul>
    </aside>

    <main class="dx-content">
      <header class="dx-header">
        <nav class="ren-breadcrumb" aria-label="Breadcrumb" style="margin-bottom: var(--space-4);">
          <ol>
            <li><a href="../index.html" class="ren-link-plain">Docs</a></li>
            <li><a href="../components.html" class="ren-link-plain">Components</a></li>
            <li aria-current="page">Checkbox</li>
          </ol>
        </nav>
        <p class="dx-kicker">Primitive</p>
        <h1>Checkbox <span class="dx-api-badge dx-api-badge-hybrid" title="Renders without JS; JS adds enhancements">Hybrid</span></h1>
        <p class="lede">A boolean toggle wrapped around a native <code>&lt;input type="checkbox"&gt;</code>. Custom-styled control, native semantics, full keyboard and screen-reader support out of the box. Indeterminate state included.</p>
      </header>

      <section class="dx-section" id="overview">
        <p class="dx-kicker">About</p>
        <h2>Overview</h2>
        <p>Checkbox is a CSS-only enhancement over the native input. The actual checkbox is the hidden <code>&lt;input&gt;</code> — keyboard, screen readers, and form submission all use the platform's standard behavior. RenDS only paints the visual control on top via <code>.ren-checkbox-control</code>.</p>
        <div class="dx-callout">
          <p><strong>Use a Switch instead</strong> when the checkbox represents an immediate setting that takes effect right away (notifications on/off, dark mode). Use a Checkbox for things that get committed on form submit.</p>
        </div>
      </section>

      <section class="dx-section" id="demo">
        <p class="dx-kicker">Live</p>
        <h2>Demo</h2>
        <div class="dx-demo">
          <div class="dx-demo-preview">
            <label class="ren-checkbox">
              <input type="checkbox">
              <span class="ren-checkbox-control"></span>
              <span>Subscribe to the weekly digest</span>
            </label>
            <label class="ren-checkbox">
              <input type="checkbox" checked>
              <span class="ren-checkbox-control"></span>
              <span>Email me about product updates</span>
            </label>
            <label class="ren-checkbox">
              <input type="checkbox" disabled>
              <span class="ren-checkbox-control"></span>
              <span>Marketing emails (disabled — change in account settings)</span>
            </label>
          </div>
          <pre class="dx-pre dx-demo-code" tabindex="0"><code>&lt;label class="ren-checkbox"&gt;
  &lt;input type="checkbox"&gt;
  &lt;span class="ren-checkbox-control"&gt;&lt;/span&gt;
  &lt;span&gt;Subscribe to the weekly digest&lt;/span&gt;
&lt;/label&gt;</code></pre>
        </div>
      </section>

      <section class="dx-section" id="variants">
        <p class="dx-kicker">States</p>
        <h2>Variants</h2>
        <div class="dx-vgrid">
          <div class="dx-vrow">
            <span class="dx-vrow-label">States</span>
            <div class="dx-vrow-items">
              <label class="ren-checkbox"><input type="checkbox"><span class="ren-checkbox-control"></span><span>Unchecked</span></label>
              <label class="ren-checkbox"><input type="checkbox" checked><span class="ren-checkbox-control"></span><span>Checked</span></label>
              <label class="ren-checkbox"><input type="checkbox" id="indet-demo"><span class="ren-checkbox-control"></span><span>Indeterminate</span></label>
              <label class="ren-checkbox"><input type="checkbox" disabled><span class="ren-checkbox-control"></span><span>Disabled (unchecked)</span></label>
              <label class="ren-checkbox"><input type="checkbox" checked disabled><span class="ren-checkbox-control"></span><span>Disabled (checked)</span></label>
              <script>document.getElementById('indet-demo').indeterminate = true;</script>
            </div>
          </div>
          <div class="dx-vrow">
            <span class="dx-vrow-label">Group</span>
            <div class="dx-vrow-items">
              <fieldset style="border: 0; padding: 0; margin: 0;">
                <legend style="font-size: var(--label-size); font-weight: var(--label-weight); margin-bottom: var(--space-2);">Notify me about</legend>
                <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                  <label class="ren-checkbox"><input type="checkbox" name="notify" value="comments" checked><span class="ren-checkbox-control"></span><span>Comments on my posts</span></label>
                  <label class="ren-checkbox"><input type="checkbox" name="notify" value="mentions" checked><span class="ren-checkbox-control"></span><span>Mentions</span></label>
                  <label class="ren-checkbox"><input type="checkbox" name="notify" value="follows"><span class="ren-checkbox-control"></span><span>New followers</span></label>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </section>

      <section class="dx-section" id="api">
        <p class="dx-kicker">Reference</p>
        <h2>API</h2>
        <h3>CSS classes</h3>
        <table class="dx-api">
          <thead><tr><th>Class</th><th>Effect</th></tr></thead>
          <tbody>
            <tr><td><code class="dx-api-name">.ren-checkbox</code></td><td>The label wrapper. Inline-flex layout with the control + text. Clicking anywhere in the label toggles the input.</td></tr>
            <tr><td><code class="dx-api-name">.ren-checkbox-control</code></td><td>The painted box. Sits next to the hidden input and listens to <code>:checked</code> via the adjacent sibling selector.</td></tr>
            <tr><td><code class="dx-api-name">.ren-checkbox &gt; input[type="checkbox"]</code></td><td>The native input. Visually hidden but keyboard- and screen-reader-accessible. Submits with the form like any other checkbox.</td></tr>
          </tbody>
        </table>
        <h3>States handled by CSS</h3>
        <table class="dx-api">
          <thead><tr><th>State</th><th>Selector</th></tr></thead>
          <tbody>
            <tr><td>Checked</td><td><code>input:checked + .ren-checkbox-control</code> (filled with accent color, white check mark)</td></tr>
            <tr><td>Indeterminate</td><td><code>input:indeterminate + .ren-checkbox-control</code> (filled with a horizontal bar)</td></tr>
            <tr><td>Hover</td><td><code>.ren-checkbox:hover &gt; .ren-checkbox-control</code> (border darkens)</td></tr>
            <tr><td>Focus visible</td><td><code>input:focus-visible + .ren-checkbox-control</code> (focus ring)</td></tr>
            <tr><td>Disabled</td><td><code>.ren-checkbox:has(input:disabled)</code> (opacity reduced, cursor not-allowed)</td></tr>
          </tbody>
        </table>
        <p>No JavaScript or Web Component — every state is pure CSS.</p>
      </section>

      <section class="dx-section" id="a11y">
        <p class="dx-kicker">Inclusive by default</p>
        <h2>Accessibility</h2>
        <p>Because the actual control is a real <code>&lt;input type="checkbox"&gt;</code>, every accessibility behavior comes from the platform: Tab focus, Space to toggle, screen reader announcement of state, native form participation.</p>
        <h3>Keyboard</h3>
        <div class="dx-keys">
          <div class="dx-keyrow"><span class="keys"><kbd>Tab</kbd></span><span>Moves focus to the input.</span></div>
          <div class="dx-keyrow"><span class="keys"><kbd>Space</kbd></span><span>Toggles the checked state.</span></div>
        </div>
        <div class="dx-callout">
          <p><strong>Always wrap the input in the label.</strong> The pattern <code>&lt;label class="ren-checkbox"&gt;&lt;input&gt;…&lt;/label&gt;</code> means the click target is the entire label — not just the small box. That's a 44 px touch target without any extra work.</p>
        </div>
        <h3>Indeterminate state</h3>
        <p>Set programmatically: <code>checkbox.indeterminate = true</code>. Use it for parent checkboxes that summarize a mixed group of children. Any user interaction (click or Space) clears the indeterminate flag.</p>
      </section>

      <section class="dx-section" id="examples">
        <p class="dx-kicker">Patterns</p>
        <h2>Examples</h2>
        <h3>Select-all with indeterminate parent</h3>
        <div class="dx-pre" tabindex="0"><code>const all = document.querySelector('#all');
const items = document.querySelectorAll('input[name="items"]');

const sync = () =&gt; {
  const checked = Array.from(items).filter(i =&gt; i.checked);
  all.checked = checked.length === items.length;
  all.indeterminate = checked.length &gt; 0 &amp;&amp; checked.length &lt; items.length;
};

all.addEventListener('change', () =&gt; {
  items.forEach(i =&gt; i.checked = all.checked);
});
items.forEach(i =&gt; i.addEventListener('change', sync));
sync();</code></pre>
      </section>

    </main>
  </div>
  <script src="../../site/shell.js" defer></script>
</body>
</html>
