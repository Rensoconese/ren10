// Headless regression test for the motion-token migration of
// ren-dialog, ren-toast, ren-popover, and ren-menu.
//
// What we verify, per component:
//   1. It opens / closes with no console errors.
//   2. CSS custom properties --duration-enter / --duration-exit /
//      --ease-enter / --ease-exit / --transition-tactile are all
//      resolved (not empty), meaning the semantic token import
//      reached the component layer.
//   3. No runtime errors from the component's JS.
//
// Also exercises themes/preview.html to confirm the motion preset
// utilities still work under the new tokens.

import http from 'node:http';
import fs   from 'node:fs';
import path from 'node:path';
import url  from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  const u = url.parse(req.url);
  let p = path.join(ROOT, decodeURIComponent(u.pathname || '/'));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { res.writeHead(404); res.end('not found ' + req.url); return; }
  const ext = path.extname(p);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const BASE = 'http://127.0.0.1:' + port;

// External CDNs referenced by create/index.html — blocked in the
// sandbox and unrelated to our motion / tokens work.
const IGNORE_URL_SUBSTRS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com/lucide',
  'cdnjs.cloudflare.com/ajax/libs/jszip',
];
const shouldIgnoreUrl = (u) => IGNORE_URL_SUBSTRS.some((s) => u.includes(s));

const browser = await chromium.launch();
const ctx     = await browser.newContext();
const page    = await ctx.newPage();

const errors = [];
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  const loc = m.location && m.location();
  if (loc && loc.url && shouldIgnoreUrl(loc.url)) return;
  if (/Failed to load resource/.test(m.text())) return;
  errors.push('[console] ' + m.text());
});
page.on('pageerror', (e) => errors.push('[pageerror] ' + e.message));
page.on('requestfailed', (r) => {
  if (shouldIgnoreUrl(r.url())) return;
  errors.push('[requestfailed] ' + r.url() + ' ' + (r.failure() && r.failure().errorText));
});

// ─────────────────────────────────────────
// 1. Load docs/components.html + smoke the 4 migrated composites.
// ─────────────────────────────────────────
await page.goto(BASE + '/rends/docs/components.html', { waitUntil: 'networkidle' });

// 1a. Semantic motion tokens must resolve on :root.
const tokens = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  return {
    durEnter: cs.getPropertyValue('--duration-enter').trim(),
    durExit:  cs.getPropertyValue('--duration-exit').trim(),
    easeEnter: cs.getPropertyValue('--ease-enter').trim(),
    easeExit:  cs.getPropertyValue('--ease-exit').trim(),
    transitionTactile: cs.getPropertyValue('--transition-tactile').trim(),
    transitionOverlay: cs.getPropertyValue('--transition-overlay').trim(),
  };
});
for (const [k, v] of Object.entries(tokens)) {
  if (!v) throw new Error('semantic token did not resolve: --' + k);
}
console.log('✓ semantic motion tokens resolve:', tokens.durEnter + ' /', tokens.easeEnter.slice(0, 22) + '…');

// 1b. Dialog open/close.
const dialogOpenBtn = page.locator('button', { hasText: 'Open Dialog' }).first();
await dialogOpenBtn.click();
const dlg = page.locator('#dialog-1');
await dlg.waitFor({ state: 'visible' });
const dlgOpen = await dlg.evaluate((el) => el.open === true);
if (!dlgOpen) throw new Error('dialog did not receive [open]');
await dlg.locator('.ren-dialog-close').click();
await page.waitForFunction(() => !document.getElementById('dialog-1').open);
console.log('✓ ren-dialog opens + closes');

// 1c. Toast shown + auto-dismiss.
const initialToasts = await page.locator('#toast-viewport .ren-toast').count();
await page.locator('button', { hasText: 'Success' }).first().click();
await page.waitForFunction(
  (n) => document.querySelectorAll('#toast-viewport .ren-toast').length > n,
  initialToasts,
  { timeout: 2000 }
);
const nowToasts = await page.locator('#toast-viewport .ren-toast').count();
console.log('✓ ren-toast rendered (' + nowToasts + ' visible)');

// 1d. Popover open/close via Popover API.
const popoverBtn = page.locator('[popovertarget="demo-popover-1"]').first();
await popoverBtn.click();
await page.waitForFunction(
  () => {
    const el = document.getElementById('demo-popover-1');
    return el && el.matches(':popover-open');
  },
  null,
  { timeout: 2000 }
);
console.log('✓ ren-popover opens via Popover API');
// Close by clicking it again (light-dismiss fallback: press Escape).
await page.keyboard.press('Escape');
await page.waitForFunction(() => !document.getElementById('demo-popover-1').matches(':popover-open'), null, { timeout: 2000 });
console.log('✓ ren-popover closes on Escape');

// 1e. Menu open/close via Popover API.
const menuBtn = page.locator('[popovertarget="demo-menu-1"]').first();
await menuBtn.click();
await page.waitForFunction(
  () => {
    const el = document.getElementById('demo-menu-1');
    return el && el.matches(':popover-open');
  },
  null,
  { timeout: 2000 }
);
console.log('✓ ren-menu opens via Popover API');
await page.keyboard.press('Escape');
await page.waitForFunction(() => !document.getElementById('demo-menu-1').matches(':popover-open'), null, { timeout: 2000 });
console.log('✓ ren-menu closes on Escape');

// 1f. Confirm each component's computed style still references a
// resolved duration/ease (not empty, not 'initial').
const compStyles = await page.evaluate(() => {
  const out = {};
  const probe = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      transition: cs.transition,
      animation:  cs.animation,
    };
  };
  out['.ren-dialog']     = probe('.ren-dialog');
  out['.ren-toast']      = probe('.ren-toast');
  out['.ren-popover']    = probe('.ren-popover');
  out['.ren-menu']       = probe('.ren-menu');
  return out;
});
for (const [sel, vals] of Object.entries(compStyles)) {
  if (!vals) { console.log('  (no instance in DOM for ' + sel + ', skipping)'); continue; }
  // Either transition or animation should be non-empty after the migration.
  if ((!vals.transition || vals.transition === 'all 0s ease 0s') &&
      (!vals.animation  || vals.animation  === 'none 0s ease 0s 1 normal none running')) {
    throw new Error(sel + ': neither transition nor animation is set — tokens may not have cascaded');
  }
}
console.log('✓ all 4 composites have non-empty transition/animation computed styles');

// ─────────────────────────────────────────
// 2. Themes preview (motion preset utilities).
// ─────────────────────────────────────────
await page.goto(BASE + '/rends/themes/preview.html', { waitUntil: 'networkidle' });
const motionTarget = page.locator('#motion-target');
await motionTarget.waitFor();
// Trigger each preset; animations should replay without throwing.
// The preview.html click handler is async (closed→open), so we wait
// for data-state to return to 'open' after each click before firing
// the next one.
for (const preset of ['fade', 'scale', 'pop', 'slide-up', 'slide-left', 'blur']) {
  await page.locator('button[data-play="' + preset + '"]').click();
  await page.waitForFunction(
    () => document.getElementById('motion-target').dataset.state === 'open',
    null,
    { timeout: 3000 }
  );
}
const finalState = await motionTarget.getAttribute('data-state');
if (finalState !== 'open') throw new Error('motion preset did not return to open state; got: ' + finalState);
console.log('✓ themes/preview.html motion presets fire');

// ─────────────────────────────────────────
// 3. create/ page still loads + generator still wires up.
// ─────────────────────────────────────────
await page.goto(BASE + '/rends/create/index.html', { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.rendsGen && typeof window.rendsGen.generateTheme === 'function');
console.log('✓ create/ page: rendsGen module loaded');

// ─────────────────────────────────────────
if (errors.length) {
  console.error('\n✗ errors:');
  errors.forEach((e) => console.error('  ' + e));
  process.exitCode = 1;
} else {
  console.log('\n✓ no console / page errors');
}

await browser.close();
server.close();
