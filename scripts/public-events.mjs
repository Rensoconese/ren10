/**
 * Structured public-event metadata for contracts whose detail payload is
 * richer than a single scalar. Extend this list whenever a public event is
 * added or its payload changes; check-public-contracts verifies runtime and
 * documentation against it.
 */
export const PUBLIC_EVENTS = [
  { component: 'ren-form', source: 'components/patterns/ren-form/ren-form.js', event: 'ren-field-validated', bubbles: true, composed: true, cancelable: false, detail: ['name', 'valid', 'error'] },
  { component: 'ren-form', source: 'components/patterns/ren-form/ren-form.js', event: 'ren-invalid', bubbles: true, composed: true, cancelable: false, detail: ['errors'] },
  { component: 'ren-form', source: 'components/patterns/ren-form/ren-form.js', event: 'ren-submit', bubbles: true, composed: true, cancelable: true, detail: ['values', 'form', 'waitUntil'] },
  { component: 'ren-form', source: 'components/patterns/ren-form/ren-form.js', event: 'ren-submit-error', bubbles: true, composed: true, cancelable: false, detail: ['error'] },
  { component: 'ren-form', source: 'components/patterns/ren-form/ren-form.js', event: 'ren-step-change', bubbles: true, composed: true, cancelable: false, detail: ['step', 'totalSteps'] },
];
