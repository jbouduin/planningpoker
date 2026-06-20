module.exports = {
  root: true,

  parser: '@typescript-eslint/parser',

  plugins: ['@typescript-eslint'],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],

  rules: {
    quotes: ['error', 'single'],
    semi: ['error', 'always']
  },

  overrides: [
    // ✅ Angular TypeScript files
    {
      files: ['frontend/**/*.ts'],
      extends: ['plugin:@angular-eslint/recommended']
    },

    // ✅ Angular templates
    {
      files: ['frontend/**/*.html'],
      parser: '@angular-eslint/template-parser',
      extends: ['plugin:@angular-eslint/template/recommended']
    }
  ]
};
