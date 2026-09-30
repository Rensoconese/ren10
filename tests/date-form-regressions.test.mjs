import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { element, installMinimalDOM, key } from './utils/minimal-dom.mjs';

// Exact production modules; this stand-in checks state, not native FormData,
// focus, event bubbling, or radio exclusivity. Those have browser specs below.
installMinimalDOM();
const { RenDatePicker } = await import('../components/composites/ren-date-picker/ren-date-picker.js');
const { RenForm } = await import('../components/patterns/ren-form/ren-form.js');
const pickers = [];
afterEach(() => { pickers.splice(0).forEach((picker) => picker.disconnectedCallback()); });

function pickerFor(locale = 'en-US', { value, range = false, hidden = false } = {}) {
  const picker = new RenDatePicker();
  picker.setAttribute('locale', locale);
  picker.setAttribute('name', 'day');
  if (value) picker.setAttribute('value', value);
  if (range) picker.setAttribute('mode', 'range');
  const trigger = element('button', { class: 'ren-date-picker-trigger' });
  trigger.append(element('span', { class: 'ren-date-picker-value' }));
  const dropdown = element('div', { popover: 'manual' });
  const calendar = element('ren-calendar');
  calendar.setValue = () => {};
  calendar.setRange = () => {};
  dropdown.append(calendar);
  picker.append(trigger, dropdown);
  if (hidden) picker.append(element('input', { type: 'hidden', name: 'day' }));
  picker.connectedCallback();
  pickers.push(picker);
  return picker;
}

for (const locale of ['en-US', 'es-AR']) {
  for (const hidden of [false, true]) {
    test(`date picker initializes ${hidden ? 'adopted' : 'generated'} input with ISO in ${locale}`, () => {
      const picker = pickerFor(locale, { value: '2026-09-30', hidden });
      assert.equal(picker.getValue(), '2026-09-30');
      assert.equal(picker.hiddenInput.value, '2026-09-30');
    });
  }
  test(`date picker setValue keeps submission ISO and label localized in ${locale}`, () => {
    const picker = pickerFor(locale);
    picker.setValue('2026-10-01');
    assert.equal(picker.hiddenInput.value, '2026-10-01');
    assert.equal(picker.trigger.querySelector('span').textContent, new Intl.DateTimeFormat(locale, {
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date(2026, 9, 1)));
  });
  test(`date picker calendar selection submits ISO in ${locale}`, () => {
    const picker = pickerFor(locale);
    let detail;
    picker.addEventListener('ren-change', (event) => { detail = event.detail; });
    picker.handleCalendarSelect({ detail: { date: new Date(2026, 10, 2) } });
    assert.equal(picker.hiddenInput.value, '2026-11-02');
    assert.equal(detail.value, '2026-11-02');
  });
}

test('date picker range submits an ISO interval, empty until complete', () => {
  const picker = pickerFor('es-AR', { range: true });
  picker.handleCalendarSelect({ detail: { range: { start: new Date(2026, 8, 30), end: null } } });
  assert.equal(picker.hiddenInput.value, '');
  picker.setValue({ start: '2026-09-30', end: '2026-10-02' });
  assert.equal(picker.hiddenInput.value, '2026-09-30/2026-10-02');
});

function restore(saved) {
  const form = new RenForm();
  form.setAttribute('data-persist', 'test');
  const controls = [
    { type: 'radio', name: 'plan', value: 'a', checked: false },
    { type: 'radio', name: 'plan', value: 'b', checked: true },
    { type: 'checkbox', name: 'extras', value: 'a', checked: true },
    { type: 'checkbox', name: 'extras', value: 'b', checked: false },
    { type: 'text', name: 'title', value: 'default' },
  ];
  form._form = { querySelectorAll: () => controls };
  globalThis.localStorage = { getItem: () => saved === null ? null : JSON.stringify(saved) };
  form._restorePersisted();
  return controls;
}

test('persisted radio restores the matching value, not every radio', () => {
  assert.deepEqual(restore({ plan: 'a' }).slice(0, 2).map((input) => input.checked), [true, false]);
});
test('one persisted checkbox restores only its matching value', () => {
  assert.deepEqual(restore({ extras: 'b' }).slice(2, 4).map((input) => input.checked), [false, true]);
});
test('multiple persisted checkboxes restore value membership', () => {
  assert.deepEqual(restore({ extras: ['a', 'b'] }).slice(2, 4).map((input) => input.checked), [true, true]);
});
test('stored empty selection clears checked markup defaults', () => {
  assert.deepEqual(restore({}).slice(0, 4).map((input) => input.checked), [false, false, false, false]);
});
test('no persisted record preserves markup defaults', () => {
  assert.deepEqual(restore(null).slice(0, 4).map((input) => input.checked), [false, true, true, false]);
});
test('persistence restores text without changing absent text values', () => {
  assert.equal(restore({ title: 'saved' })[4].value, 'saved');
  assert.equal(restore({})[4].value, 'default');
});


test('date picker closes on Escape received by the calendar dropdown', () => {
  const picker = pickerFor();
  picker.isOpen = true;
  key(picker.dropdown, 'Escape');
  assert.equal(picker.isOpen, false);
  assert.equal(document.activeElement, picker.trigger);
});

const { RenDateRangePicker } = await import('../components/composites/ren-date-range-picker/ren-date-range-picker.js');
function rangePicker() {
  const picker = new RenDateRangePicker();
  picker.trigger = element('button');
  picker.dropdown = element('div', { popover: 'manual' });
  picker.calendarLeft = element('ren-calendar');
  picker.calendarRight = element('ren-calendar');
  picker.applyBtn = element('button');
  picker.cancelBtn = element('button');
  picker.setupEventListeners();
  picker.confirmedStart = new Date(2026, 8, 30);
  picker.confirmedEnd = new Date(2026, 9, 2);
  picker.draftStart = new Date(2026, 10, 1);
  picker.draftEnd = new Date(2026, 10, 2);
  picker.isOpen = true;
  pickers.push(picker);
  return picker;
}
for (const target of ['dropdown', 'trigger']) {
  test(`date range picker Escape on ${target} cancels draft and restores focus`, () => {
    const picker = rangePicker();
    key(picker[target], 'Escape');
    assert.equal(picker.isOpen, false);
    assert.deepEqual(picker.draftStart, picker.confirmedStart);
    assert.deepEqual(picker.draftEnd, picker.confirmedEnd);
    assert.equal(document.activeElement, picker.trigger);
  });
}
