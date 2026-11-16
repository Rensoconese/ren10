// @ts-check
/**
 * APG conformance, one component and one pattern at a time.
 *
 * The keyboard contracts (keyboard-contracts.spec.cjs) check what each
 * component.md promises. This suite checks those promises against the
 * WAI-ARIA Authoring Practices Guide pattern the component implements: the
 * roles, states and properties the pattern requires, that every ARIA
 * relationship points at an element that exists and every state follows the
 * real state as it changes, and the keyboard interaction the pattern lists.
 *
 *   tests/utils/apg/pattern-map.cjs    component → pattern, parts, deviations
 *   tests/utils/apg/patterns.cjs       what each pattern requires
 *   tests/utils/apg/check-pattern.cjs  the engine
 *
 * Each test mounts the component's registry usage (what `ren10 add` copies)
 * and carries `@<component> @pattern`, which `npm run coverage:check` counts:
 * every component in the map owes a `pattern` cell.
 */
const { test, expect } = require('@playwright/test');
const { startStaticServer } = require('../utils/static-server.cjs');
const { REGISTRY, ROOT, mountRegistry } = require('../utils/mount-registry.cjs');
const { PATTERN_MAP } = require('../utils/apg/pattern-map.cjs');
const { PATTERNS } = require('../utils/apg/patterns.cjs');
const { checkPattern } = require('../utils/apg/check-pattern.cjs');

let server;
test.beforeAll(async () => { server = await startStaticServer(ROOT); });
test.afterAll(async () => { await server?.close(); });

test('the pattern map only names registry components and known patterns', () => {
  for (const [key, entry] of Object.entries(PATTERN_MAP)) {
    expect(REGISTRY[key], `"${key}" is not a registry component`).toBeTruthy();
    expect(entry.implements.length, `${key} lists no pattern`).toBeGreaterThan(0);
    // A check that waits on another change proves nothing: every component
    // keeps at least one pattern that really runs.
    expect(entry.implements.some((implementation) => !implementation.fixme), `${key} has no pattern check that runs`).toBe(true);
    for (const implementation of entry.implements) {
      const pattern = PATTERNS[implementation.pattern];
      expect(pattern, `${key}: unknown pattern "${implementation.pattern}"`).toBeTruthy();
      expect(pattern.url, `${pattern.name} has no APG URL`).toMatch(/^https:\/\/www\.w3\.org\/WAI\/ARIA\/apg\/patterns\/[a-z-]+\/$/);
      for (const deviation of implementation.deviations ?? []) {
        expect(['native', 'deliberate', 'defect'], `${key}: deviation "${deviation.rule}" needs a kind`).toContain(deviation.kind);
        expect(deviation.reason, `${key}: deviation "${deviation.rule}" needs a reason`).toMatch(/\S/);
        expect(typeof deviation.instead, `${key}: deviation "${deviation.rule}" must assert what the component does instead`).toBe('function');
      }
    }
  }
});

for (const [key, entry] of Object.entries(PATTERN_MAP)) {
  const dir = REGISTRY[key]?.dir;
  for (const implementation of entry.implements) {
    const pattern = PATTERNS[implementation.pattern];
    // An unknown component or pattern is reported by the test above; there is
    // nothing to generate for it.
    if (!dir || !pattern) continue;
    // A check that waits on another change is written and declared fixme, with
    // the reason in the pattern map. APG_RUN_FIXME=1 runs those too, to see
    // whether the change they wait on has landed.
    const declare = implementation.fixme && !process.env.APG_RUN_FIXME ? test.fixme : test;
    const variant = implementation.label ? ` (${implementation.label})` : '';
    declare(`${dir} follows the APG ${pattern.name} pattern${variant}`, { tag: [`@${dir}`, '@pattern'] }, async ({ page }) => {
      if (implementation.viewport) await page.setViewportSize(implementation.viewport);
      const errors = await mountRegistry(page, server.origin, key, implementation.edit);
      await checkPattern(page, { key, dir, pattern, implementation });
      expect(errors, 'threw while being driven').toEqual([]);
    });
  }
}
