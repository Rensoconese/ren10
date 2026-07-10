---
type: "RenDS Docs Page"
title: "ren-spinner docs"
description: "RenDS Docs Page generated from the RenDS knowledge graph."
id: docs:docs/components/ren-spinner.html
sourcePath: docs/components/ren-spinner.html
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - docs-page
  - ren10
  - rends
---

# ren-spinner docs

Source path: `docs/components/ren-spinner.html`

## Relationships

_No outgoing relationships._

## Source Content

<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spinner — RenDS Components</title>
  <link rel="stylesheet" href="../../index.css">
  <link rel="stylesheet" href="../../components/index.css">
  <link rel="stylesheet" href="../../themes/appearance.css">
  <link rel="stylesheet" href="../../tokens/component/tokens.css">
  <link rel="stylesheet" href="../../site/shell.css">
  <style>
    .dx-demo { border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; margin: var(--space-4) 0; }
    .dx-demo-preview { background: var(--color-surface-raised); padding: var(--space-6) var(--space-5); display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; }
    .dx-demo-code { margin: 0; border-radius: 0; border: none; border-top: 1px solid var(--color-border); }
    .dx-vgrid { display: grid; gap: var(--space-6); margin: var(--space-4) 0; }
    .dx-vrow { display: grid; grid-template-columns: 140px 1fr; gap: var(--space-4); align-items: start; }
    .dx-vrow-label { font-size: var(--text-xs); font-weight: var(--weight-semibold); text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); padding-top: var(--space-3); }
    .dx-vrow-items { padding: var(--space-3); background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; }
    @media (max-width: 720px) { .dx-vrow { grid-template-columns: 1fr; gap: var(--space-2); } .dx-vrow-label { padding-top: 0; } }
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
        <li><a href="ren-spinner.html" aria-current="page">Spinner</a></li>
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
        <nav class="ren-breadcrumb" aria-label="Breadcrumb" style="margin-bottom: var(--space-4);"><ol><li><a href="../index.html" class="ren-link-plain">Docs</a></li><li><a href="../components.html" class="ren-link-plain">Components</a></li><li aria-current="page">Spinner</li></ol></nav>
        <p class="dx-kicker">Primitive</p>
        <h1>Spinner <span class="dx-api-badge dx-api-badge-css" title="Works without any JavaScript">CSS-only</span></h1>
        <p class="lede">Loading indicator. Five sizes, plus a light variant for dark surfaces. Pure CSS — no JavaScript.</p>
      </header>
      <section class="dx-section" id="overview"><p class="dx-kicker">About</p><h2>Overview</h2><p>Show a spinner when a button or panel is processing and the user can't see the result yet. For longer waits or while content is loading inline, prefer <a href="ren-skeleton.html" class="ren-link">Skeleton</a>.</p></section>
      <section class="dx-section" id="demo"><p class="dx-kicker">Live</p><h2>Demo</h2><div class="dx-demo"><div class="dx-demo-preview"><div class="ren-spinner ren-spinner-xs"></div><div class="ren-spinner ren-spinner-sm"></div><div class="ren-spinner"></div><div class="ren-spinner ren-spinner-lg"></div><div class="ren-spinner ren-spinner-xl"></div></div><pre class="dx-pre dx-demo-code" tabindex="0"><code>&lt;div class="ren-spinner"&gt;&lt;/div&gt;
&lt;div class="ren-spinner ren-spinner-lg"&gt;&lt;/div&gt;
&lt;div class="ren-spinner ren-spinner-light"&gt;&lt;/div&gt; &lt;!-- on dark bg --&gt;</code></pre></div></section>
      <section class="dx-section" id="api"><p class="dx-kicker">Reference</p><h2>API</h2><table class="dx-api"><thead><tr><th>Class</th><th>Effect</th></tr></thead><tbody><tr><td><code class="dx-api-name">.ren-spinner</code></td><td>Base. 24 px circular spinner.</td></tr><tr><td><code class="dx-api-name">.ren-spinner-xs</code> / <code class="dx-api-name">-sm</code> / <code class="dx-api-name">-lg</code> / <code class="dx-api-name">-xl</code></td><td>Size variants. 12 / 16 / 32 / 40 px.</td></tr><tr><td><code class="dx-api-name">.ren-spinner-light</code></td><td>White spinner for dark backgrounds.</td></tr></tbody></table></section>
      <section class="dx-section" id="a11y"><p class="dx-kicker">Inclusive by default</p><h2>Accessibility</h2><ul><li>The container should have <code>role="status"</code> and a screen-reader-only label: <code>&lt;span class="ren-sr-only"&gt;Loading…&lt;/span&gt;</code>.</li><li>Respects <code>prefers-reduced-motion</code> — the spin slows or stops under the user's preference.</li></ul></section>
    </main>
  </div>
  <script src="../../site/shell.js" defer></script>
</body>
</html>
