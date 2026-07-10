---
type: "RenDS Docs Page"
title: "ren-button docs"
description: "RenDS Docs Page generated from the RenDS knowledge graph."
id: docs:docs/components/ren-button.html
sourcePath: docs/components/ren-button.html
packageName: ren10
packageVersion: 0.9.4
generatedFrom: knowledge/ren10-graph.json
stability: generated
tags:
  - docs-page
  - ren10
  - rends
---

# ren-button docs

Source path: `docs/components/ren-button.html`

## Relationships

_No outgoing relationships._

## Source Content

<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Button — RenDS Components</title>
  <link rel="stylesheet" href="../../index.css">
  <link rel="stylesheet" href="../../components/index.css">
  <link rel="stylesheet" href="../../themes/appearance.css">
  <link rel="stylesheet" href="../../tokens/component/tokens.css">
  <link rel="stylesheet" href="../../site/shell.css">
  <style>
    /* Page-specific styles — chrome lives in shell.css */

    /* ═══════════════════════════════════════════════════════════
       Component-page specific patterns (new)
       ═══════════════════════════════════════════════════════════ */

    /* Demo block: preview frame + code block, stacked */
    .dx-demo { border: 1px solid var(--color-border); border-radius: var(--radius-md); overflow: hidden; margin: var(--space-4) 0; }
    .dx-demo-preview {
      background: var(--color-surface-raised);
      padding: var(--space-8) var(--space-5);
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      align-items: center;
      justify-content: center;
      min-height: 96px;
    }
    .dx-demo-code { margin: 0; border-radius: 0; border: none; border-top: 1px solid var(--color-border); }

    /* Variant grid: structured rows for Variants section */
    .dx-vgrid { display: grid; gap: var(--space-6); margin: var(--space-4) 0; }
    .dx-vrow { display: grid; grid-template-columns: 140px 1fr; gap: var(--space-4); align-items: start; }
    .dx-vrow-label {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
      padding-top: var(--space-3);
    }
    .dx-vrow-items {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      align-items: center;
      padding: var(--space-3);
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }
    @media (max-width: 720px) {
      .dx-vrow { grid-template-columns: 1fr; gap: var(--space-2); }
      .dx-vrow-label { padding-top: 0; }
    }

    /* Anatomy: assembled button on top, 2x2 grid of part specimens below */
    .dx-anatomy {
      margin: var(--space-4) 0;
      display: grid;
      gap: var(--space-4);
    }

    /* Number badge — guaranteed AA: text on surface (black on white / white on black) */
    .dx-anatomy-num {
      display: inline-grid;
      place-items: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--color-text);
      color: var(--color-surface);
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      flex-shrink: 0;
    }

    /* Top: assembled reference */
    .dx-anatomy-stage {
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-8) var(--space-5);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
    }
    .dx-anatomy-stage-label {
      font-size: var(--text-xs);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
      font-weight: var(--weight-semibold);
      margin: 0;
    }
    .dx-anatomy-stage .ren-btn { pointer-events: none; }

    /* Bottom: 2x2 grid of parts */
    .dx-anatomy-parts {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
    }
    @media (max-width: 720px) { .dx-anatomy-parts { grid-template-columns: 1fr; } }

    .dx-anatomy-part {
      background: var(--color-surface-raised);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      display: grid;
      gap: var(--space-3);
    }
    .dx-anatomy-part-header {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
    .dx-anatomy-part-name {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-text);
    }
    .dx-anatomy-part-spec {
      background: var(--color-surface-sunken);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-sm);
      min-height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text);
    }
    .dx-anatomy-part-spec svg { display: block; }
    .dx-anatomy-part-spec .container-frame {
      width: 110px;
      height: 32px;
      border: 2px solid var(--color-accent);
      border-radius: var(--radius-md);
      background: transparent;
    }
    .dx-anatomy-part-desc {
      font-size: var(--text-sm);
      line-height: 1.5;
      color: var(--color-text-secondary);
      margin: 0;
    }
    .dx-anatomy-part-desc code {
      font-size: 0.85em;
    }

    /* .dx-api and .dx-keys live in shell.css so every reference table
       on every component page shares the same column boundary. */
  </style>
</head>
<body>

  <!-- Top nav -->
  <header class="dx-nav">
    <div class="dx-nav-inner">
      <a href="../index.html" class="dx-brand">
        <span class="dx-brand-mark">R</span>
        <span>RenDS</span>
        <span class="ren-badge ren-badge-secondary" style="margin-left: var(--space-1);">v0.9.0</span>
      </a>
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

    <!-- Persistent sidebar — same nav as the catalog so context is never lost -->
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
        <li><a href="ren-button.html" aria-current="page">Button</a></li>
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

    <!-- Content -->
    <main class="dx-content">

      <!-- Page header -->
      <header class="dx-header">
        <nav class="ren-breadcrumb" aria-label="Breadcrumb" style="margin-bottom: var(--space-4);">
          <ol>
            <li><a href="../index.html" class="ren-link-plain">Docs</a></li>
            <li><a href="../components.html" class="ren-link-plain">Components</a></li>
            <li aria-current="page">Button</li>
          </ol>
        </nav>
        <p class="dx-kicker">Primitive</p>
        <h1>Button <span class="dx-api-badge dx-api-badge-hybrid" title="Renders without JS; JS adds enhancements">Hybrid</span></h1>
        <p class="lede">A multi-variant action trigger with built-in loading and disabled states. Works as a CSS-only class set <em>or</em> as the <code>&lt;ren-button&gt;</code> custom element. Meets a 44 px touch target and AA contrast in every variant out of the box.</p>
      </header>

    <!-- ═══════════════════════════════════════════════════════════
         1. OVERVIEW
         ═══════════════════════════════════════════════════════════ -->
    <section class="dx-section" id="overview">
      <p class="dx-kicker">About</p>
      <h2>Overview</h2>
      <p>A button triggers an action — submitting a form, opening a dialog, deleting a record. RenDS gives you one component with seven visual variants (primary, secondary, ghost, outline, danger, link, accent), three sizes, and a built-in loading state that flips the button to <code>aria-busy="true"</code> and disables interaction without you wiring anything.</p>

      <p>Every variant ships with a 44 px minimum touch target (Apple HIG), a visible focus ring, hover/active feedback that respects <code>prefers-reduced-motion</code>, and AA contrast in both light and dark mode.</p>

      <h3>When to use</h3>
      <ul>
        <li>To trigger an action on the current page (submit, save, delete, copy, run).</li>
        <li>To open or close an overlay (dialog, popover, menu).</li>
        <li>For a primary CTA, group it with a secondary or ghost button — never two primaries side by side.</li>
      </ul>

      <h3>When not to use</h3>
      <ul>
        <li>For navigation to a different page or a different URL — that's <code>&lt;a&gt;</code> or <code>ren-link</code>. A button that navigates breaks browser conventions (no middle-click open, no copy-link).</li>
        <li>For an inline call-to-read-more inside body text — use the <code>link</code> variant only when a button is genuinely needed; otherwise reach for <code>ren-link</code>.</li>
        <li>For a binary state choice — that's <code>ren-toggle</code> or a checkbox.</li>
      </ul>

      <div class="dx-callout">
        <p><strong>Native button, semantically.</strong> The <code>&lt;ren-button&gt;</code> custom element wraps a native <code>&lt;button&gt;</code> in light DOM. Forms still submit, focus still works, screen readers still announce "button". You're not opting out of the platform — you're styling it.</p>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         2. ANATOMY
         ═══════════════════════════════════════════════════════════ -->
    <section class="dx-section" id="anatomy">
      <p class="dx-kicker">Structure</p>
      <h2>Anatomy</h2>
      <p>A button has up to four visible parts. Only the label is mandatory — the rest are optional and combine freely.</p>

      <div class="dx-anatomy">

        <!-- Top: assembled button as reference -->
        <div class="dx-anatomy-stage">
          <p class="dx-anatomy-stage-label">Assembled</p>
          <button class="ren-btn ren-btn-primary ren-btn-lg" type="button" tabindex="-1" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add item
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <!-- Bottom: 4 parts shown in isolation -->
        <div class="dx-anatomy-parts">

          <div class="dx-anatomy-part">
            <div class="dx-anatomy-part-header">
              <span class="dx-anatomy-num" aria-hidden="true">1</span>
              <span class="dx-anatomy-part-name">Container</span>
            </div>
            <div class="dx-anatomy-part-spec" aria-hidden="true">
              <span class="container-frame"></span>
            </div>
            <p class="dx-anatomy-part-desc">The whole clickable surface. Sets the variant color, padding, border-radius, and the 44&nbsp;px touch target. Receives focus.</p>
          </div>

          <div class="dx-anatomy-part">
            <div class="dx-anatomy-part-header">
              <span class="dx-anatomy-num" aria-hidden="true">2</span>
              <span class="dx-anatomy-part-name">Leading icon</span>
            </div>
            <div class="dx-anatomy-part-spec" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <p class="dx-anatomy-part-desc">Optional. Placed before the label, gap-spaced with <code>--space-2</code>. Decorative icons should carry <code>aria-hidden="true"</code>.</p>
          </div>

          <div class="dx-anatomy-part">
            <div class="dx-anatomy-part-header">
              <span class="dx-anatomy-num" aria-hidden="true">3</span>
              <span class="dx-anatomy-part-name">Label</span>
            </div>
            <div class="dx-anatomy-part-spec" aria-hidden="true">
              <span style="font-size: var(--text-base); font-weight: var(--weight-medium);">Add item</span>
            </div>
            <p class="dx-anatomy-part-desc">The visible text. Required for non-icon buttons. For icon-only buttons, omit it and add <code>aria-label</code> on the button itself.</p>
          </div>

          <div class="dx-anatomy-part">
            <div class="dx-anatomy-part-header">
              <span class="dx-anatomy-num" aria-hidden="true">4</span>
              <span class="dx-anatomy-part-name">Trailing icon</span>
            </div>
            <div class="dx-anatomy-part-spec" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
            <p class="dx-anatomy-part-desc">Optional. Same rules as the leading icon. Common cases: a chevron for "more options", an external-link arrow.</p>
          </div>

        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         3. DEMO
         ═══════════════════════════════════════════════════════════ -->
    <section class="dx-section" id="demo">
      <p class="dx-kicker">Live</p>
      <h2>Demo</h2>
      <p>The default button — primary variant, medium size. Tab to it, press Space or Enter to fire the click handler.</p>

      <div class="dx-demo">
        <div class="dx-demo-preview">
          <button class="ren-btn ren-btn-primary" type="button">Primary action</button>
        </div>
        <pre class="dx-pre dx-demo-code" tabindex="0"><code>&lt;!-- CSS-only --&gt;
&lt;button class="ren-btn ren-btn-primary" type="button"&gt;Primary action&lt;/button&gt;

&lt;!-- Web Component (same output, attribute-driven) --&gt;
&lt;ren-button variant="primary"&gt;Primary action&lt;/ren-button&gt;</code></pre>
      </div>

      <div class="dx-callout">
        <p><strong>Two ways to use it, one component.</strong> The CSS classes work standalone — you don't need the JS at all. The <code>&lt;ren-button&gt;</code> element exists for two reasons: declarative attributes (<code>variant</code>, <code>loading</code>) you can flip from JS, and built-in ARIA wiring for the loading state.</p>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         4. VARIANTS
         ═══════════════════════════════════════════════════════════ -->
    <section class="dx-section" id="variants">
      <p class="dx-kicker">Catalog</p>
      <h2>Variants</h2>
      <p>Pick the variant that matches the action's <em>weight</em>, not its category. Primary for the one most-likely action on the screen, secondary for everything else, danger for destructive, ghost when the button has to disappear into the chrome.</p>

      <div class="dx-vgrid">

        <div class="dx-vrow">
          <span class="dx-vrow-label">Variant</span>
          <div class="dx-vrow-items">
            <button class="ren-btn ren-btn-primary" type="button">Primary</button>
            <button class="ren-btn ren-btn-secondary" type="button">Secondary</button>
            <button class="ren-btn ren-btn-ghost" type="button">Ghost</button>
            <button class="ren-btn ren-btn-outline" type="button">Outline</button>
            <button class="ren-btn ren-btn-danger" type="button">Danger</button>
            <button class="ren-btn ren-btn-link" type="button">Link</button>
          </div>
        </div>

        <div class="dx-vrow">
          <span class="dx-vrow-label">Size</span>
          <div class="dx-vrow-items">
            <button class="ren-btn ren-btn-primary ren-btn-sm" type="button">Small</button>
            <button class="ren-btn ren-btn-primary" type="button">Medium</button>
            <button class="ren-btn ren-btn-primary ren-btn-lg" type="button">Large</button>
          </div>
        </div>

        <div class="dx-vrow">
          <span class="dx-vrow-label">State</span>
          <div class="dx-vrow-items">
            <button class="ren-btn ren-btn-primary" type="button">Default</button>
            <button class="ren-btn ren-btn-primary" type="button" disabled>Disabled</button>
            <button class="ren-btn ren-btn-primary" type="button" data-loading aria-busy="true">Loading</button>
          </div>
        </div>

        <div class="dx-vrow">
          <span class="dx-vrow-label">Icon-only</span>
          <div class="dx-vrow-items">
            <button class="ren-btn ren-btn-primary ren-btn-icon" type="button" aria-label="Add">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            </button>
            <button class="ren-btn ren-btn-secondary ren-btn-icon" type="button" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
            <button class="ren-btn ren-btn-ghost ren-btn-icon" type="button" aria-label="More options">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>
        </div>

        <div class="dx-vrow">
          <span class="dx-vrow-label">Full width</span>
          <div class="dx-vrow-items" style="display: block;">
            <button class="ren-btn ren-btn-primary ren-btn-full" type="button">Continue</button>
          </div>
        </div>

        <div class="dx-vrow">
          <span class="dx-vrow-label">Group</span>
          <div class="dx-vrow-items">
            <div class="ren-btn-group">
              <button class="ren-btn ren-btn-secondary" type="button">Day</button>
              <button class="ren-btn ren-btn-secondary" type="button" aria-pressed="true">Week</button>
              <button class="ren-btn ren-btn-secondary" type="button">Month</button>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         5. API
         ═══════════════════════════════════════════════════════════ -->
    <section class="dx-section" id="api">
      <p class="dx-kicker">Reference</p>
      <h2>API</h2>
      <p>Two parallel surfaces. Pick the one that matches your codebase: CSS classes for static markup, the custom element for declarative attributes you can flip at runtime.</p>

      <h3>CSS classes</h3>
      <table class="dx-api">
        <thead>
          <tr>
            <th>Class</th>
            <th>Effect</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code class="dx-api-name">.ren-btn</code></td>
            <td>Base. Required on every button. Resolves to <em>primary</em> if no variant modifier is present.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">.ren-btn-primary</code></td>
            <td>Filled accent. The default — also implicit when only <code>.ren-btn</code> is set.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">.ren-btn-secondary</code></td>
            <td>Filled neutral. The most common companion to a primary.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">.ren-btn-ghost</code></td>
            <td>No background until hover. For toolbars and dense chrome.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">.ren-btn-outline</code></td>
            <td>Border only, transparent fill. A lighter secondary.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">.ren-btn-danger</code></td>
            <td>Destructive actions. Filled red, text-on-red passes AA in both modes.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">.ren-btn-link</code></td>
            <td>Looks like an inline link but behaves as a button. Use sparingly.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">.ren-btn-sm</code> / <code class="dx-api-name">.ren-btn-lg</code></td>
            <td>Size modifiers. Default (no modifier) is medium with a 44 px touch target.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">.ren-btn-icon</code></td>
            <td>Square aspect ratio for icon-only buttons. Pair with <code>aria-label</code>.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">.ren-btn-full</code></td>
            <td>Stretches to <code>width: 100%</code>. For mobile CTAs and stepped forms.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">.ren-btn-group</code></td>
            <td>Wrapper class. Joins adjacent buttons into a segmented control with shared borders.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">[data-loading]</code></td>
            <td>Attribute, not a class. Shows a spinner, hides the label, sets <code>aria-busy</code>.</td>
          </tr>
        </tbody>
      </table>

      <h3>Web Component attributes</h3>
      <p>Set on the <code>&lt;ren-button&gt;</code> element. All are reactive — flipping them in JS re-renders the underlying button.</p>
      <table class="dx-api dx-api-cols-4">
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Type</th>
            <th>Default</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code class="dx-api-name">variant</code></td>
            <td><span class="dx-api-type">"primary" | "secondary" | "ghost" | "outline" | "danger" | "link"</span></td>
            <td><span class="dx-api-default">"primary"</span></td>
            <td>Visual variant.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">size</code></td>
            <td><span class="dx-api-type">"sm" | "md" | "lg"</span></td>
            <td><span class="dx-api-default">"md"</span></td>
            <td>Padding and font scale.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">loading</code></td>
            <td><span class="dx-api-type">boolean</span></td>
            <td><span class="dx-api-default">false</span></td>
            <td>Adds <code>data-loading</code> + <code>aria-busy="true"</code>.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">disabled</code></td>
            <td><span class="dx-api-type">boolean</span></td>
            <td><span class="dx-api-default">false</span></td>
            <td>Mirrors the native <code>disabled</code> + sets <code>aria-disabled</code>.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">icon</code></td>
            <td><span class="dx-api-type">boolean</span></td>
            <td><span class="dx-api-default">false</span></td>
            <td>Square button for icon-only usage.</td>
          </tr>
          <tr>
            <td><code class="dx-api-name">full</code></td>
            <td><span class="dx-api-type">boolean</span></td>
            <td><span class="dx-api-default">false</span></td>
            <td>Stretches to 100% width.</td>
          </tr>
        </tbody>
      </table>

      <h3>JS properties</h3>
      <p>The <code>RenButton</code> class exposes getters/setters that mirror the boolean attributes. Useful when you'd rather flip a property than toggle an attribute.</p>
      <div class="dx-pre" tabindex="0"><code>const btn = document.querySelector('ren-button');
btn.loading = true;          // shows spinner
btn.disabled = true;
btn.variant  = 'danger';     // re-renders</code></div>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         6. ACCESSIBILITY
         ═══════════════════════════════════════════════════════════ -->
    <section class="dx-section" id="a11y">
      <p class="dx-kicker">Inclusive by default</p>
      <h2>Accessibility</h2>
      <p>Every button passes WCAG 2.1 AA in both modes and every variant. The component does most of the work for you, but a few things are still your call.</p>

      <h3>Keyboard</h3>
      <div class="dx-keys">
        <div class="dx-keyrow">
          <span class="keys"><kbd class="ren-kbd">Tab</kbd></span>
          <span>Moves focus to the button (skips disabled buttons).</span>
        </div>
        <div class="dx-keyrow">
          <span class="keys"><kbd class="ren-kbd">Space</kbd></span>
          <span>Fires the click handler. Standard native behavior.</span>
        </div>
        <div class="dx-keyrow">
          <span class="keys"><kbd class="ren-kbd">Enter</kbd></span>
          <span>Fires the click handler. Inside a form, also submits the form unless <code>type="button"</code> is set.</span>
        </div>
      </div>

      <div class="dx-callout">
        <p><strong>Always set <code>type="button"</code></strong> on buttons that aren't form submitters. The browser default is <code>type="submit"</code>, which will submit the nearest enclosing form on Enter — usually not what you want for "Cancel", "Open menu", or any non-submit action.</p>
      </div>

      <h3>ARIA wiring</h3>
      <ul>
        <li>The button has <code>role="button"</code> implicitly via the native <code>&lt;button&gt;</code>. No need to set it.</li>
        <li>For <strong>icon-only</strong> buttons, set <code>aria-label</code> on the button. Decorative icons inside should carry <code>aria-hidden="true"</code>.</li>
        <li>For <strong>loading</strong> state, the component sets <code>aria-busy="true"</code> automatically. Screen readers will announce the state change.</li>
        <li>For <strong>disabled</strong> state, both <code>disabled</code> and <code>aria-disabled="true"</code> are set. Disabled buttons are skipped in tab order; if you need a focusable-but-inert button (rare), use <code>aria-disabled</code> alone and handle the click guard yourself.</li>
        <li>For <strong>toggle</strong> buttons (a button that flips between two states), add <code>aria-pressed="true"</code> or <code>"false"</code>. The <em>group</em> example above uses this.</li>
      </ul>

      <h3>Screen reader announcements</h3>
      <ul>
        <li>"Add to cart, button" — for a regular labelled button.</li>
        <li>"Search, button, busy" — when <code>loading</code> is set.</li>
        <li>"Save, button, dimmed" (or similar) — when <code>disabled</code> is set.</li>
        <li>"Week, button, pressed" — for a toggled button in a group.</li>
      </ul>

      <h3>Touch and pointer</h3>
      <ul>
        <li>Default and large sizes meet the <strong>44 × 44 px</strong> minimum touch target. The small size is below that and should only be used in dense desktop UI (toolbars, table cells).</li>
        <li>The press-down feedback (a <code>scale(0.97)</code> on <code>:active</code>) respects <code>prefers-reduced-motion</code> via the semantic motion tokens — it stays subtle for users who request reduced motion.</li>
        <li>Hover styles never replace focus styles. A keyboard user always sees a focus ring on the focused button, even when a different button is hovered.</li>
      </ul>
    </section>

    <!-- ═══════════════════════════════════════════════════════════
         7. EXAMPLES
         ═══════════════════════════════════════════════════════════ -->
    <section class="dx-section" id="examples">
      <p class="dx-kicker">Recipes</p>
      <h2>Examples</h2>
      <p>Common patterns that combine the variants above with other RenDS primitives. Copy the markup, swap the labels.</p>

      <h3>Primary + secondary pair</h3>
      <p>The classic "confirm and cancel" pairing. Primary on the right (or last), secondary on the left.</p>
      <div class="dx-demo">
        <div class="dx-demo-preview">
          <div class="ren-cluster" style="--cluster-gap: var(--space-2);">
            <button class="ren-btn ren-btn-secondary" type="button">Cancel</button>
            <button class="ren-btn ren-btn-primary" type="button">Save changes</button>
          </div>
        </div>
        <pre class="dx-pre dx-demo-code" tabindex="0"><code>&lt;div class="ren-cluster"&gt;
  &lt;button class="ren-btn ren-btn-secondary" type="button"&gt;Cancel&lt;/button&gt;
  &lt;button class="ren-btn ren-btn-primary"   type="button"&gt;Save changes&lt;/button&gt;
&lt;/div&gt;</code></pre>
      </div>

      <h3>Destructive confirmation</h3>
      <p>For irreversible actions. The danger variant signals stakes; pair with secondary, never with another colored variant.</p>
      <div class="dx-demo">
        <div class="dx-demo-preview">
          <div class="ren-cluster" style="--cluster-gap: var(--space-2);">
            <button class="ren-btn ren-btn-secondary" type="button">Keep account</button>
            <button class="ren-btn ren-btn-danger" type="button">Delete account</button>
          </div>
        </div>
        <pre class="dx-pre dx-demo-code" tabindex="0"><code>&lt;div class="ren-cluster"&gt;
  &lt;button class="ren-btn ren-btn-secondary" type="button"&gt;Keep account&lt;/button&gt;
  &lt;button class="ren-btn ren-btn-danger"    type="button"&gt;Delete account&lt;/button&gt;
&lt;/div&gt;</code></pre>
      </div>

      <h3>Loading from JS</h3>
      <p>Flip <code>loading</code> on submit, flip it back when the request resolves.</p>
      <div class="dx-demo">
        <div class="dx-demo-preview">
          <ren-button id="demo-load" variant="primary">Save</ren-button>
        </div>
        <pre class="dx-pre dx-demo-code" tabindex="0"><code>const btn = document.querySelector('ren-button#demo-load');
btn.addEventListener('click', async () =&gt; {
  btn.loading = true;
  try {
    await fetch('/api/save', { method: 'POST' });
  } finally {
    btn.loading = false;
  }
});</code></pre>
      </div>

      <h3>Icon-only in a toolbar</h3>
      <p>Ghost icon buttons disappear into chrome until hovered. Always set <code>aria-label</code>.</p>
      <div class="dx-demo">
        <div class="dx-demo-preview">
          <div class="ren-cluster" style="--cluster-gap: var(--space-1);">
            <button class="ren-btn ren-btn-ghost ren-btn-icon" type="button" aria-label="Bold">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M14 12a4 4 0 0 0 0-8H6v8"/><path d="M15 20a4 4 0 0 0 0-8H6v8z"/></svg>
            </button>
            <button class="ren-btn ren-btn-ghost ren-btn-icon" type="button" aria-label="Italic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
            </button>
            <button class="ren-btn ren-btn-ghost ren-btn-icon" type="button" aria-label="Underline">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/></svg>
            </button>
          </div>
        </div>
        <pre class="dx-pre dx-demo-code" tabindex="0"><code>&lt;div class="ren-cluster"&gt;
  &lt;button class="ren-btn ren-btn-ghost ren-btn-icon" type="button" aria-label="Bold"&gt;
    &lt;svg ... aria-hidden="true"&gt;...&lt;/svg&gt;
  &lt;/button&gt;
  &lt;!-- repeat for italic, underline --&gt;
&lt;/div&gt;</code></pre>
      </div>

      <h3>Segmented control</h3>
      <p>Three buttons in a group, one pressed. Manage <code>aria-pressed</code> from JS as the user clicks.</p>
      <div class="dx-demo">
        <div class="dx-demo-preview">
          <div class="ren-btn-group" role="group" aria-label="View by">
            <button class="ren-btn ren-btn-secondary" type="button">Day</button>
            <button class="ren-btn ren-btn-secondary" type="button" aria-pressed="true">Week</button>
            <button class="ren-btn ren-btn-secondary" type="button">Month</button>
          </div>
        </div>
        <pre class="dx-pre dx-demo-code" tabindex="0"><code>&lt;div class="ren-btn-group" role="group" aria-label="View by"&gt;
  &lt;button class="ren-btn ren-btn-secondary" type="button"&gt;Day&lt;/button&gt;
  &lt;button class="ren-btn ren-btn-secondary" type="button" aria-pressed="true"&gt;Week&lt;/button&gt;
  &lt;button class="ren-btn ren-btn-secondary" type="button"&gt;Month&lt;/button&gt;
&lt;/div&gt;</code></pre>
      </div>

      <h3>Full-width on mobile</h3>
      <p>Stretch the primary CTA on small screens for comfortable thumb reach.</p>
      <div class="dx-demo">
        <div class="dx-demo-preview" style="display: block;">
          <button class="ren-btn ren-btn-primary ren-btn-lg ren-btn-full" type="button">Continue</button>
        </div>
        <pre class="dx-pre dx-demo-code" tabindex="0"><code>&lt;button class="ren-btn ren-btn-primary ren-btn-lg ren-btn-full" type="button"&gt;
  Continue
&lt;/button&gt;</code></pre>
      </div>
    </section>

    </main>

  </div>

  <!-- Web Component registration so the live demos render -->
  <script type="module" src="../../components/primitives/ren-button/ren-button.js"></script>

  <!-- Demo: simulate loading toggle -->
  <script>
    const demoLoad = document.getElementById('demo-load');
    if (demoLoad) {
      demoLoad.addEventListener('click', () => {
        if (demoLoad.loading) return;
        demoLoad.loading = true;
        setTimeout(() => { demoLoad.loading = false; }, 1600);
      });
    }
  </script>

  <script src="../../site/shell.js" defer></script>
</body>
</html>
