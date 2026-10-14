import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'dist/**', 'create/vendor/lucide-1.16.0.min.js', 'create/vendor/jszip-3.10.1.min.js', 'tests/**/playwright-report/**'] },
  { files: ['**/*.js', '**/*.mjs'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: { ...globals.browser, ...globals.node } }, rules: { 'no-unused-vars': ['warn', { args: 'none' }], 'no-undef': 'error', semi: ['error', 'always'] } },
  { files: ['scripts/smoke-create-generator.mjs'], rules: { 'no-undef': 'off' } },
];
