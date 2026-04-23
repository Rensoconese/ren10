// Headless smoke test for the create/ generator tab.
//
// - Serves rends/ over a tiny HTTP server so ES modules load cleanly.
// - Opens create/index.html.
// - Clicks Generate → types a hex → clicks Analyze → clicks Apply.
// - Fails if any console error fires, or if the generator didn't wire up.

import http from 'node:http';
import fs   from 'node:fs';
import path from 'node:path';
import url  from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
// Script lives at rends/scripts/, so two levels up is the repo root
// that contains rends/create/index.html.
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

const browser = await chromium.launch();
const ctx     = await browser.newContext();
const page    = await ctx.newPage();

// External CDNs we embed in create/index.html — blocked in the sandbox.
// They aren't regressions from generator work, so filter them out.
const IGNORE_URL_SUBSTRS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'unpkg.com/lucide',
  'cdnjs.cloudflare.com/ajax/libs/jszip',
];
const shouldIgnoreUrl = (url) => IGNORE_URL_SUBSTRS.some((s) => url.includes(s));

const errors = [];
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  const loc = m.location && m.location();
  if (loc && loc.url && shouldIgnoreUrl(loc.url)) return;
  // Also silence the paired "Failed to load resource" messages that
  // Chromium emits for the filtered network failures.
  if (/Failed to load resource/.test(m.text())) return;
  errors.push('[console] ' + m.text());
});
page.on('pageerror',     (e) => errors.push('[pageerror] ' + e.message));
page.on('requestfailed', (r) => {
  if (shouldIgnoreUrl(r.url())) return;
  errors.push('[requestfailed] ' + r.url() + ' ' + (r.failure() && r.failure().errorText));
});

await page.goto(BASE + '/rends/create/index.html', { waitUntil: 'networkidle' });

// 1) Generator module should have attached to window.
await page.waitForFunction(() => window.rendsGen && typeof window.rendsGen.generateTheme === 'function');
console.log('✓ window.rendsGen is ready');

// 2) Sidebar "Generate" button exists.
const genBtn = page.locator('button.sidebar-btn', { hasText: 'Generate' });
await genBtn.waitFor({ state: 'visible', timeout: 3000 });
console.log('✓ sidebar Generate button rendered');

// 3) Click → modal opens, input focused.
await genBtn.click();
await page.waitForSelector('#generator-modal', { state: 'visible' });
const activeId = await page.evaluate(() => document.activeElement && document.activeElement.id);
if (activeId !== 'gen-hex') throw new Error('expected gen-hex to be focused on open, got: ' + activeId);
console.log('✓ modal opens and focuses hex input');

// 4) Bad hex → error.
await page.fill('#gen-hex', 'not-a-hex');
await page.click('#gen-run-btn');
const errorVisible = await page.locator('#gen-error').isVisible();
if (!errorVisible) throw new Error('expected error shown for invalid hex');
console.log('✓ invalid hex surfaces error');

// 5) Good hex → results render.
await page.fill('#gen-hex', '#F59E0B');
await page.click('#gen-run-btn');
await page.waitForSelector('#gen-results', { state: 'visible' });
const scaleCells = await page.locator('#gen-scale > div').count();
if (scaleCells !== 11) throw new Error('expected 11 scale cells, got ' + scaleCells);
const auditRows  = await page.locator('#gen-report > li').count();
if (auditRows < 6) throw new Error('expected at least 6 audit rows, got ' + auditRows);
console.log('✓ analyze produced ' + scaleCells + '-step scale and ' + auditRows + ' audit rows');

// 6) CSS output is non-empty and looks like [data-theme].
const cssText = await page.locator('#gen-css').innerText();
if (!cssText.includes('[data-theme="brand"]')) throw new Error('CSS output missing [data-theme]');
console.log('✓ CSS export block present');

// 7) Apply button → theme applied to builder.
const beforeHex = await page.evaluate(() => state.theme.hex);
const applyBtn  = page.locator('#gen-apply-btn');
await applyBtn.click();
await page.waitForFunction(() => document.getElementById('generator-modal').style.display === 'none');
const afterHex  = await page.evaluate(() => state.theme.hex);
if (afterHex === beforeHex) throw new Error('theme did not change after apply');
if (!/^#[0-9a-fA-F]{6}$/.test(afterHex)) throw new Error('applied hex malformed: ' + afterHex);
console.log('✓ generator applied theme: ' + beforeHex + ' → ' + afterHex);

// 8) AAA toggle re-runs analyzer, updates heading + report-heading, and
//    the returned theme from the library API reports level:'AAA'.
await genBtn.click();
await page.waitForSelector('#generator-modal', { state: 'visible' });
await page.fill('#gen-hex', '#4F46E5');
await page.click('#gen-run-btn');
await page.waitForSelector('#gen-results', { state: 'visible' });

// Verify AA is the initial state.
const aaHeading = await page.locator('#gen-report-heading').innerText();
if (!/WCAG AA\b/.test(aaHeading)) throw new Error('expected AA heading initially, got: ' + aaHeading);
const aaChecked = await page.getAttribute('#gen-level-aa', 'aria-checked');
if (aaChecked !== 'true') throw new Error('expected AA button aria-checked=true initially');

// Click AAA.
await page.click('#gen-level-aaa');
// Heading swaps to AAA and help text updates.
await page.waitForFunction(() => /WCAG AAA/.test(document.getElementById('gen-report-heading').textContent));
const aaaHelp = await page.locator('#gen-level-help').innerText();
if (!aaaHelp.includes('7:1')) throw new Error('expected AAA help text to mention 7:1, got: ' + aaaHelp);
const aaaChecked = await page.getAttribute('#gen-level-aaa', 'aria-checked');
if (aaaChecked !== 'true') throw new Error('expected AAA button aria-checked=true after click');

// The library's returned theme object should expose level: 'AAA'.
const libLevel = await page.evaluate(() => {
  const t = window.rendsGen.generateTheme('#4F46E5', { level: 'AAA' });
  return { level: t.level, reportLevel: t.report.level, passes: t.report.passes.length };
});
if (libLevel.level !== 'AAA' || libLevel.reportLevel !== 'AAA') {
  throw new Error('expected level/reportLevel to be AAA, got ' + JSON.stringify(libLevel));
}
if (libLevel.passes < 1) throw new Error('expected ≥1 pass in AAA report for indigo, got ' + libLevel.passes);
console.log('✓ AAA toggle re-runs analyzer + library returns level:AAA');

// Toggle back to AA — heading should return.
await page.click('#gen-level-aa');
await page.waitForFunction(() => /WCAG AA\b/.test(document.getElementById('gen-report-heading').textContent));
console.log('✓ AA toggle restores AA heading');

// 9) Press Esc on still-open modal closes it.
await page.keyboard.press('Escape');
await page.waitForFunction(() => document.getElementById('generator-modal').style.display === 'none');
console.log('✓ Escape closes the modal');

// 10) No console errors anywhere.
if (errors.length) { console.error('✗ errors:'); errors.forEach(e => console.error('  ' + e)); process.exitCode = 1; }
else console.log('✓ no console / page errors');

await browser.close();
server.close();
