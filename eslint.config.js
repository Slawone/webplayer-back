import js from '@eslint/js';
import globals from 'globals';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    ignores: ['node_modules', '_temp'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      eqeqeq: ['error', 'always'],
      'prefer-const': 'warn',
      indent: ['error', 2],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'key-spacing': ['error', { beforeColon: false }],
      // 'space-before-function-paren': ['error', 'never'],
      'max-len': ['warn', { code: 100 }],
      // 'prefer-arrow-callback': 'error',
      'no-template-curly-in-string': 'warn',
      'object-shorthand': ['error', 'always'],
      'prefer-destructuring': 'warn',
      'eol-last': ['error', 'always'],
      // "no-console": "off",
      'id-match': [
        'error',
        '^[a-zA-Z_$][a-zA-Z0-9_$]*$',
        {
          properties: true,
          onlyDeclarations: false,
          ignoreDestructuring: false,
        },
      ],
    },
  },
];
