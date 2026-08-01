import assert from 'node:assert/strict';
import test from 'node:test';

import ren10Astro from './integration.js';

function setup(options) {
  const injected = [];
  const integration = ren10Astro(options);
  integration.hooks['astro:config:setup']({
    injectScript(stage, content) {
      injected.push({ stage, content });
    },
  });
  return { integration, injected };
}

test('integration injects foundation and appearance CSS by default', () => {
  const { integration, injected } = setup();
  assert.equal(integration.name, '@ren10/astro');
  assert.deepEqual(injected, [
    { stage: 'page-ssr', content: 'import "ren10/foundation.css";' },
    { stage: 'page-ssr', content: 'import "ren10/themes/appearance.css";' },
  ]);
});

test('integration supports full CSS and explicit opt-outs', () => {
  assert.deepEqual(setup({ css: 'all', appearance: false }).injected, [
    { stage: 'page-ssr', content: 'import "ren10";' },
  ]);
  assert.deepEqual(setup({ css: 'none', appearance: false }).injected, []);
});

test('integration rejects invalid options early', () => {
  assert.throws(() => ren10Astro({ css: 'components' }), /css must be/);
  assert.throws(() => ren10Astro({ appearance: 'yes' }), /appearance must be/);
});
