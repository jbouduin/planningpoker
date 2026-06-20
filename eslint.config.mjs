import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import { fileURLToPath } from 'url';
import path from 'path';
// import angular from '@angular-eslint/eslint-plugin';
// import angularTemplate from '@angular-eslint/eslint-plugin-template';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  // js.configs.recommended,
  {
    files: [
      // '**/*.ts'
      'shared-lib/**/*.ts',
      'server/**/*.ts',
      'frontend/**/*.ts'
    ],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: ['./shared-lib/tsconfig.json', './server/tsconfig.json', './frontend/tsconfig.json'],
        tsconfigRootDir: __dirname
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
      // '@stylistic': stylistic
    },
    rules: {
      ...tseslint.configs.recommendedTypeChecked,
      'no-console': 'error',
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
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
      ]
    }
  },

  // ✅ Angular TS → does not work with flat file config
  // {
  //   files: ['frontend/**/*.ts'],
  //   plugins: {
  //     '@angular-eslint': angular
  //   },
  //   rules: {
  //     ...angular.configs['recommended']
  //   }
  // },

  // ✅ Angular templates → does not work with flat file config
  // {
  //   files: ['frontend/**/*.html'],
  //   plugins: {
  //     '@angular-eslint/template': angularTemplate
  //   },
  //   languageOptions: {
  //     parser: angularTemplate.parsers['.html']
  //   },
  //   rules: {
  //     ...angularTemplate.configs['recommended'].rules
  //   }
  // },

  // ✅ replaces .eslintignore
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      'old',
      'frontend',
      'server'
      // add whatever is needed later
    ]
  }
];
