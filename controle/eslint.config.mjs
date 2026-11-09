/* Zoekt echte fouten in de JavaScript (geen stijlregels). */
import globals from 'globals';
export default [{
  files: ['**/*.js'],
  languageOptions: { ecmaVersion: 2023, sourceType: 'script', globals: { ...globals.browser, ...globals.node } },
  rules: { 'no-undef': 'error', 'no-redeclare': 'error', 'no-dupe-keys': 'error', 'no-unreachable': 'error', 'no-unused-vars': 'off' }
}];
