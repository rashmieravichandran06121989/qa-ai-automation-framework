/**
 * ESLint config for qa-ai-automation-framework.
 *
 * Keeps the rule set lean on purpose — the goal is catching real bugs
 * (unused imports, misused promises, no-floating-promises) not enforcing
 * style (Prettier owns style).
 */
module.exports = {
  root: true,
  env: { node: true, es2022: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'playwright'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:playwright/recommended',
  ],
  rules: {
    // Prettier owns formatting — don't double-report.
    'max-len': 'off',
    'quotes': 'off',
    'semi': 'off',

    // Promises are everywhere in Playwright; these catch the subtle bugs.
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',

    // `_`-prefixed vars are intentional.
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // Allow the occasional `any` but prefer explicit unknown + narrowing.
    '@typescript-eslint/no-explicit-any': 'warn',

    // playwright-bdd step defs legitimately use non-null assertions on
    // fixture-injected POMs. Warn, don't error.
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // Playwright plugin tweaks — feature files + step defs don't follow
    // the one-expect-per-test rule and aren't Playwright-native tests.
    'playwright/expect-expect': 'off',
    'playwright/no-conditional-in-test': 'off',
  },
  overrides: [
    {
      // Step definitions are called inside Playwright tests at runtime,
      // but ESLint sees them as standalone modules. Disable the rules
      // that assume a `test(...)` wrapper is visible in the same file.
      files: ['steps/**/*.ts', 'fixtures/**/*.ts'],
      rules: {
        'playwright/no-standalone-expect': 'off',
      },
    },
    {
      // Page objects aren't tests — they're helper classes used by tests.
      // The Playwright plugin's wait-strategy rules produce false positives
      // here. We keep these banned in actual tests/ but relax in POMs.
      files: ['pages/**/*.ts'],
      rules: {
        'playwright/no-networkidle': 'off',
        'playwright/no-wait-for-timeout': 'off',
        'playwright/no-standalone-expect': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'playwright-report/',
    'test-results/',
    'allure-results/',
    'allure-report/',
    '.features-gen/',
    'server/', // Phase 2 backend, separate TS config
  ],
};
