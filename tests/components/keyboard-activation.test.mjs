/**
 * Exact-source event/state regressions without browser dependencies.
 * The minimal DOM below does not test layout, native activation, or browser
 * focus behavior. keyboard-activation.spec.cjs covers those in Playwright.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { element, fire, key, installMinimalDOM } from '../utils/minimal-dom.mjs';

installMinimalDOM();

const { RenTabs } = await import('../../components/composites/ren-tabs/ren-tabs.js');
const { RenCombobox } = await import('../../components/composites/ren-combobox/ren-combobox.js');
const { RenNumberField } = await import('../../components/composites/ren-number-field/ren-number-field.js');

function tabsFixture(t, { activation = 'manual', disabled = { disabled: '' }, disabledIndex = 1, defaultValue = null, allDisabled = false } = {}) {
  const host = new RenTabs();
  host.setAttribute('activation', activation);
  if (defaultValue !== null) host.setAttribute('default-value', defaultValue);
  const list = element('div', { role: 'tablist' });
  host.append(list);
  for (const [index, name] of ['A', 'B', 'C'].entries()) {
    list.append(element('button', { role: 'tab', id: `tab-${name}`, ...(allDisabled || index === disabledIndex ? disabled : {}) }, name));
    host.append(element('div', { role: 'tabpanel', id: `panel-${name}` }, name));
  }
  host.connectedCallback();
  t.after(() => host.disconnectedCallback());
  return { host, list };
}
function comboFixture(t, states = ['true', 'false', 'true', null, 'true']) {
  const host = new RenCombobox();
  states.forEach((state, index) => host.append(element('div', {
    class: 'ren-combobox-item', 'data-value': String(index),
    ...(state === null ? {} : { 'aria-disabled': state }),
  }, `Option ${index}`)));
  host.connectedCallback();
  t.after(() => host.disconnectedCallback());
  return { host, input: host.querySelector('.ren-combobox-input'), list: host.querySelector('.ren-combobox-list'), options: host.querySelectorAll('.ren-combobox-item') };
}
function numberFixture(t) {
  const host = new RenNumberField();
  host.setAttribute('value', '2');
  host.connectedCallback();
  t.after(() => host.disconnectedCallback());
  return host;
}

for (const activation of ['manual', 'automatic']) {
  for (const disabled of [{ disabled: '' }, { 'aria-disabled': 'true' }]) {
    test(`tabs ${activation}: skipped ${Object.keys(disabled)[0]} tab preserves panel index`, (t) => {
      const { host, list } = tabsFixture(t, { activation, disabled });
      const changes = [];
      host.addEventListener('ren-tab-change', (event) => changes.push(event.detail));
      key(list, 'ArrowRight');
      assert.equal(document.activeElement.id, 'tab-C');
      if (activation === 'manual') {
        assert.equal(host.selectedIndex, 0);
        key(list, 'Enter');
      }
      assert.equal(host.selectedIndex, 2);
      assert.equal(host.selectedPanel.id, 'panel-C');
      assert.equal(host.panels[1].hasAttribute('hidden'), true);
      assert.equal(host.panels[2].hasAttribute('hidden'), false);
      assert.equal(changes.at(-1).index, 2);
      assert.equal(changes.at(-1).tab.id, 'tab-C');
    });
  }
}
for (const disabled of [{ disabled: '' }, { 'aria-disabled': 'true' }]) {
  test(`tabs reject ${Object.keys(disabled)[0]} selection by click and public methods`, (t) => {
    const { host, list } = tabsFixture(t, { disabled });
    let changes = 0;
    host.addEventListener('ren-tab-change', () => changes++);
    fire(list, 'click', { target: host.tabs[1] });
    assert.equal(host.selectedIndex, 0);
    host.selectTabByIndex(1);
    host.selectTabById('tab-B');
    assert.equal(host.selectedIndex, 0);
    assert.equal(changes, 0);
  });
}
test('tabs initially select the first enabled tab', (t) => {
  const { host } = tabsFixture(t, { disabledIndex: 0 });
  assert.equal(host.selectedIndex, 1);
});
for (const disabled of [{ disabled: '' }, { 'aria-disabled': 'true' }]) {
  for (const defaultValue of ['1', 'tab-B']) {
    test(`tabs fall back from ${Object.keys(disabled)[0]} default ${defaultValue}`, (t) => {
      const { host } = tabsFixture(t, { disabled, defaultValue });
      assert.equal(host.selectedIndex, 0);
      assert.deepEqual(host.tabs.map((tab) => tab.getAttribute('aria-selected')), ['true', 'false', 'false']);
      assert.deepEqual(host.tabs.map((tab) => tab.getAttribute('data-state')), ['active', 'inactive', 'inactive']);
      assert.deepEqual(host.panels.map((panel) => panel.hasAttribute('hidden')), [false, true, true]);
    });
  }
  test(`tabs with every tab ${Object.keys(disabled)[0]} leave every panel hidden`, (t) => {
    const { host } = tabsFixture(t, { disabled, allDisabled: true });
    assert.equal(host.selectedIndex, -1);
    assert.equal(host.selectedTab, null);
    assert.equal(host.selectedPanel, null);
    assert.ok(host.tabs.every((tab) => tab.getAttribute('aria-selected') === 'false'));
    assert.ok(host.panels.every((panel) => panel.hasAttribute('hidden')));
    assert.ok(host.tabs.every((tab) => tab.getAttribute('data-state') === 'inactive'));
  });
}
test('tabs allow aria-disabled=false', (t) => {
  const { host } = tabsFixture(t, { disabled: { 'aria-disabled': 'false' } });
  host.selectTabByIndex(1);
  assert.equal(host.selectedIndex, 1);
});

test('combobox ArrowDown, ArrowUp, Home and End skip disabled options', (t) => {
  const { input, options } = comboFixture(t);
  const highlight = (index) => assert.equal(input.getAttribute('aria-activedescendant'), options[index].id);
  key(input, 'ArrowDown'); highlight(1);
  key(input, 'ArrowDown'); highlight(3);
  key(input, 'ArrowUp'); highlight(1);
  key(input, 'End'); highlight(3);
  key(input, 'Home'); highlight(1);
});
test('combobox Enter cannot select an all-disabled list', (t) => {
  const { host, input } = comboFixture(t, ['true']);
  let changes = 0;
  host.addEventListener('ren-change', () => changes++);
  key(input, 'ArrowDown');
  key(input, 'Enter');
  assert.equal(host.value, '');
  assert.equal(input.hasAttribute('aria-activedescendant'), false);
  assert.equal(changes, 0);
});
test('combobox click accepts aria-disabled=false but rejects true', (t) => {
  const { host, list, options } = comboFixture(t);
  let changes = 0;
  host.addEventListener('ren-change', () => changes++);
  fire(list, 'click', { target: options[0] });
  assert.equal(host.value, '');
  fire(list, 'click', { target: options[1] });
  assert.equal(host.value, '1');
  assert.equal(changes, 1);
});
test('combobox hover cannot highlight disabled options', (t) => {
  const { host, input, list, options } = comboFixture(t);
  host.open();
  fire(list, 'mouseover', { target: options[0] });
  assert.equal(input.hasAttribute('aria-activedescendant'), false);
  key(input, 'Enter');
  assert.equal(host.value, '');
});

for (const direction of ['increment', 'decrement']) {
  test(`number field ${direction}: native zero-detail click changes value once`, (t) => {
    const host = numberFixture(t);
    const values = [];
    host.addEventListener('ren-change', (event) => values.push(event.detail.value));
    fire(host[`${direction}Btn`], 'click', { detail: 0 });
    const expected = direction === 'increment' ? 3 : 1;
    assert.equal(host.getValue(), expected);
    assert.deepEqual(values, [expected]);
  });
  test(`number field ${direction}: pointer press plus click changes value once`, (t) => {
    const host = numberFixture(t);
    const button = host[`${direction}Btn`];
    fire(button, 'mousedown');
    fire(button, 'mouseup');
    fire(button, 'click', { detail: 1 });
    assert.equal(host.getValue(), direction === 'increment' ? 3 : 1);
    assert.equal(host.pressTimeout, null);
    assert.equal(host.pressInterval, null);
  });
}
test('number field ignores zero-detail click when disabled', (t) => {
  const host = numberFixture(t);
  host.disabled = true;
  fire(host.incrementBtn, 'click', { detail: 0 });
  fire(host.decrementBtn, 'click', { detail: 0 });
  assert.equal(host.getValue(), 2);
});

test('number field hold repeats, then release and click stop without an extra step', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  const host = numberFixture(t);
  fire(host.incrementBtn, 'mousedown');
  assert.equal(host.getValue(), 3);
  t.mock.timers.tick(host.pressRepeatDelay);
  t.mock.timers.tick(host.pressRepeatInterval);
  assert.equal(host.getValue(), 4);
  fire(host.incrementBtn, 'mouseup');
  fire(host.incrementBtn, 'click', { detail: 1 });
  t.mock.timers.tick(1000);
  assert.equal(host.getValue(), 4);
  assert.equal(host.pressTimeout, null);
  assert.equal(host.pressInterval, null);
});
test('number field touch press and its compatibility click count once', (t) => {
  const host = numberFixture(t);
  fire(host.incrementBtn, 'touchstart');
  fire(host.incrementBtn, 'touchend');
  fire(host.incrementBtn, 'click', { detail: 1 });
  assert.equal(host.getValue(), 3);
});
test('number field native click listeners are removed and reattached once', (t) => {
  const host = numberFixture(t);
  host.disconnectedCallback();
  fire(host.incrementBtn, 'click', { detail: 0 });
  assert.equal(host.getValue(), 2);
  host.connectedCallback();
  fire(host.incrementBtn, 'click', { detail: 0 });
  assert.equal(host.getValue(), 3);
});
test('number field native click continues to clamp at bounds', (t) => {
  const host = numberFixture(t);
  host.setValue(host.max);
  fire(host.incrementBtn, 'click', { detail: 0 });
  assert.equal(host.getValue(), host.max);
  host.setValue(host.min);
  fire(host.decrementBtn, 'click', { detail: 0 });
  assert.equal(host.getValue(), host.min);
});
