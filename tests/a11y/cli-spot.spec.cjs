// Superseded in F7.10 by ./docs.spec.cjs, which covers every page under docs/ (including cli.html)
// with the same axe-core rules. File kept as an empty describe because the sandbox can't delete
// this path; remove it at first opportunity.
const { test } = require('@playwright/test');

test.describe.skip('docs/cli.html — moved to docs.spec.cjs', () => {
  test('see docs.spec.cjs', () => {});
});
