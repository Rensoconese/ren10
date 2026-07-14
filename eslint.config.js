import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'dist/**', 'tests/**/playwright-report/**'] },
  { files: ['**/*.js', '**/*.mjs'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.browser, ...globals.node } }, rules: { 'no-unused-vars': ['warn', { args: 'none' }], 'no-undef': 'error', semi: ['error', 'always'] } },
  { files: ['scripts/smoke-create-generator.mjs'], rules: { 'no-undef': 'off' } },
];
