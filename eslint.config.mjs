import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  {
    files: ['shared-lib/**/*.ts', 'server/**/*.ts', 'frontend/**/*.ts'],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: [
          './shared-lib/tsconfig.json',
          './server/tsconfig.test.json',
          './frontend/tsconfig.app.json',
          './frontend/tsconfig.spec.json'
        ]
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
      // later: add eslint-plugin-ban
      // later: add eslint-plugin-deprecation
      // later: add eslint-plugin-tsdoc
      // later: add angular specific plugins
    },
    rules: {
      ...tseslint.configs.recommendedTypeChecked,
      'no-console': 'error',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      '@typescript-eslint/array-type': [
        2,
        {
          default: 'generic'
        }
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true
        }
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true, allowNullish: true }
      ],
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-return': 'error'
    }
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      'old',
      'frontend/.angular',
      'server/jest.*.config.ts'
      // 'frontend',
      // 'server',
      // 'shared-lib'
    ]
  }
];
