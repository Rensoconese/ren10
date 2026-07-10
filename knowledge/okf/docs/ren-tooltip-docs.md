---
type: "RenDS Docs Page"
title: "ren-tooltip docs"
description: "RenDS Docs Page generated from the RenDS knowledge graph."
id: docs:docs/components/ren-tooltip.html
sourcePath: docs/components/ren-tooltip.html
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - docs-page
  - ren10
  - rends
---

# ren-tooltip docs

Source path: `docs/components/ren-tooltip.html`

## Relationships

_No outgoing relationships._

## Source Content

<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tooltip — RenDS Components</title>
  <link rel="stylesheet" href="../../index.css">
  <link rel="stylesheet" href="../../components/index.css">
  <link rel="stylesheet" href="../../themes/appearance.css">
  <link rel="stylesheet" href="../../tokens/component/tokens.css">
  <link rel="stylesheet" href="../../site/shell.css">
  <style>
    .dx-demo { border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: visible; margin: var(--space-4) 0; }
    .dx-demo-preview { background: var(--color-surface-raised); padding: var(--space-8) var(--space-5); display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; justify-content: center; min-height: 120px; }
    .dx-demo-code { margin: 0; border-radius: 0; border: none; border-top: 1px solid var(--color-border); }
    .dx-vgrid { display: grid; gap: var(--space-6); margin: var(--space-4) 0; }
    .dx-vrow { display: grid; grid-template-columns: 140px 1fr; gap: var(--space-4); align-items: start; }
    .dx-vrow-label { font-size: var(--text-xs); font-weight: var(--weight-semibold); text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); padding-top: var(--space-3); }
    .dx-vrow-items { padding: var(--space-3); background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; }
    @media (max-width: 720px) { .dx-vrow { grid-template-columns: 1fr; gap: var(--space-2); } .dx-vrow-label { padding-top: 0; } }

    /* Demo tooltip — pure CSS hover popup */
    .demo-tip { position: relative; display: inline-flex; }
    .demo-tip-target { padding: var(--space-2) var(--space-3); }
    .demo-tip-content {
      position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%);
      padding: var(--space-1) var(--space-2);
      background: var(--color-text); color: var(--color-surface);
      border-radius: var(--radius-sm); font-size: var(--text-xs); white-space: nowrap;
      opacity: 0; pointer-events: none;
      transition: opacity var(--duration-state) var(--ease-enter);
      z-index: 5;
    }
    .demo-tip:hover .demo-tip-content,
    .demo-tip:focus-within .demo-tip-content { opacity: 1; }
  </style>
</head>
<body>
  <header class="dx-nav"><div class="dx-nav-inner"><a href="../index.html" class="dx-brand"><span class="dx-brand-mark">R</span><span>RenDS</span><span class="ren-badge ren-badge-secondary" style="margin-left: var(--space-1);">v0.9.0</span></a><nav class="dx-nav-menu" aria-label="Primary"><a href="../index.html">Docs</a><a href="../components.html" aria-current="page">Components</a><a href="../../templates/index.html">Templates</a><a href="../../create/index.html">Theme Builder</a></nav><div class="dx-nav-actions"><a href="https://github.com/Rensoconese/ren10" class="ren-btn ren-btn-ghost ren-btn-sm">GitHub</a><a href="../getting-started.html" class="ren-btn ren-btn-primary ren-btn-sm">Get started</a></div></div></header>

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
        <li><a href="ren-checkbox.html">Checkbox</a></li>
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
        <li><a href="ren-tooltip.html" aria-current="page">Tooltip</a></li>
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
        <nav class="ren-breadcrumb" aria-label="Breadcrumb" style="margin-bottom: var(--space-4);"><ol><li><a href="../index.html" class="ren-link-plain">Docs</a></li><li><a href="../components.html" class="ren-link-plain">Components</a></li><li aria-current="page">Tooltip</li></ol></nav>
        <p class="dx-kicker">Composite</p>
        <h1>Tooltip <span class="dx-api-badge dx-api-badge-hybrid" title="Renders without JS; JS adds enhancements">Hybrid</span></h1>
        <p class="lede">Brief contextual text that appears on hover and focus. For supplementary hints — never the primary explanation. Reveals on hover after a short delay, on focus immediately, on touch via long-press.</p>
      </header>

      <section class="dx-section" id="overview">
        <p class="dx-kicker">About</p>
        <h2>Overview</h2>
        <p>Tooltips show short text labels next to icon buttons, abbreviations, or anything where a tiny extra hint helps. The trigger is always interactive (a button or link), the tooltip is always supplementary — never put critical information in a tooltip alone, because touch users may not see it.</p>
        <div class="dx-callout">
          <p><strong>Tooltip vs Popover vs Hover Card.</strong> Tooltip = short text. Popover = rich content + keyboard interaction. Hover Card = preview content with a slightly longer hover delay (think Twitter profile previews).</p>
        </div>
      </section>

      <section class="dx-section" id="demo">
        <p class="dx-kicker">Live</p>
        <h2>Demo</h2>
        <p>Hover or focus the buttons below.</p>
        <div class="dx-demo">
          <div class="dx-demo-preview">
            <span class="demo-tip"><button class="ren-btn ren-btn-secondary demo-tip-target" aria-describedby="t1">Save</button><span class="demo-tip-content" role="tooltip" id="t1">⌘S</span></span>
            <span class="demo-tip"><button class="ren-btn ren-btn-secondary demo-tip-target" aria-describedby="t2" aria-label="Settings"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></button><span class="demo-tip-content" role="tooltip" id="t2">Settings</span></span>
            <span class="demo-tip"><button class="ren-btn ren-btn-ghost demo-tip-target" aria-describedby="t3">Help</button><span class="demo-tip-content" role="tooltip" id="t3">Press ? for shortcuts</span></span>
          </div>
          <pre class="dx-pre dx-demo-code" tabindex="0"><code>&lt;ren-tooltip content="⌘S"&gt;
  &lt;button class="ren-btn ren-btn-secondary"&gt;Save&lt;/button&gt;
&lt;/ren-tooltip&gt;</code></pre>
        </div>
      </section>

      <section class="dx-section" id="variants">
        <p class="dx-kicker">Placements</p>
        <h2>Variants</h2>
        <div class="dx-vgrid">
          <div class="dx-vrow"><span class="dx-vrow-label">Placement</span><div class="dx-vrow-items">
            <p style="margin: 0; font-size: var(--text-sm); color: var(--color-text-muted);">Four placements via <code>placement="top|right|bottom|left"</code> (default <code>top</code>). The component flips to the opposite side automatically when there isn't room.</p>
          </div></div>
          <div class="dx-vrow"><span class="dx-vrow-label">Delay</span><div class="dx-vrow-items">
            <p style="margin: 0; font-size: var(--text-sm); color: var(--color-text-muted);">Default hover delay is 300 ms. Override with <code>delay="500"</code> for less-interruptive contexts. Focus shows the tooltip with no delay.</p>
          </div></div>
        </div>
      </section>

      <section class="dx-section" id="api">
        <p class="dx-kicker">Reference</p>
        <h2>API</h2>
        <h3>CSS classes</h3>
        <table class="dx-api">
          <thead><tr><th>Class</th><th>Effect</th></tr></thead>
          <tbody>
            <tr><td><code class="dx-api-name">.ren-tooltip</code></td><td>The floating bubble. <code>role="tooltip"</code>. Dark surface on light theme, light on dark.</td></tr>
            <tr><td><code class="dx-api-name">.ren-tooltip-arrow</code></td><td>Optional arrow pointing at the trigger.</td></tr>
          </tbody>
        </table>
        <h3>Web Component attributes</h3>
        <table class="dx-api dx-api-cols-4">
          <thead><tr><th>Attribute</th><th>Type</th><th>Default</th><th>Notes</th></tr></thead>
          <tbody>
            <tr><td><code class="dx-api-name">content</code></td><td><span class="dx-api-type">string</span></td><td><span class="dx-api-default">—</span></td><td>The tooltip text. Required.</td></tr>
            <tr><td><code class="dx-api-name">placement</code></td><td><span class="dx-api-type">"top" | "right" | "bottom" | "left"</span></td><td><span class="dx-api-default">"top"</span></td><td>Preferred side. Auto-flips when there isn't room.</td></tr>
            <tr><td><code class="dx-api-name">delay</code></td><td><span class="dx-api-type">number (ms)</span></td><td><span class="dx-api-default">300</span></td><td>Hover delay before showing. Focus is always instant.</td></tr>
          </tbody>
        </table>
      </section>

      <section class="dx-section" id="a11y">
        <p class="dx-kicker">Inclusive by default</p>
        <h2>Accessibility</h2>
        <ul>
          <li><strong>Trigger must be focusable.</strong> Tooltips on a non-interactive element aren't keyboard-reachable.</li>
          <li><strong>Use <code>aria-describedby</code></strong> linking the trigger to the tooltip's <code>id</code>. Screen readers announce the tooltip after the trigger's accessible name.</li>
          <li><strong>Show on focus, not just hover.</strong> Keyboard users never trigger a hover.</li>
          <li><strong>Dismissable with Escape.</strong> Pressing Escape while the tooltip is open closes it.</li>
          <li><strong>Don't put essential info in a tooltip.</strong> Touch users may never see it. Pair the tooltip with a visible label or icon-with-text on small viewports.</li>
        </ul>
        <h3>Keyboard</h3>
        <div class="dx-keys">
          <div class="dx-keyrow"><span class="keys"><kbd>Tab</kbd></span><span>Focus the trigger; tooltip shows immediately.</span></div>
          <div class="dx-keyrow"><span class="keys"><kbd>Esc</kbd></span><span>Hides the tooltip while keeping focus on the trigger.</span></div>
        </div>
      </section>

      <section class="dx-section" id="examples">
        <p class="dx-kicker">Patterns</p>
        <h2>Examples</h2>
        <h3>Icon-only button with hint</h3>
        <div class="dx-pre" tabindex="0"><code>&lt;ren-tooltip content="Settings" placement="bottom"&gt;
  &lt;button class="ren-btn ren-btn-ghost" aria-label="Settings"&gt;&lt;!-- gear SVG --&gt;&lt;/button&gt;
&lt;/ren-tooltip&gt;</code></div>
        <h3>Keyboard shortcut hint</h3>
        <div class="dx-pre" tabindex="0"><code>&lt;ren-tooltip content="⌘S to save"&gt;
  &lt;button class="ren-btn ren-btn-primary"&gt;Save&lt;/button&gt;
&lt;/ren-tooltip&gt;</code></div>
      </section>

    </main>
  </div>
  <script type="module" src="../../components/composites/ren-tooltip/ren-tooltip.js"></script>
  <script src="../../site/shell.js" defer></script>
</body>
</html>
