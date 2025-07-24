import globals from 'globals';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default await (async () => {
  return [
    {
      files: ['**/*.{js,jsx,ts,tsx}'],
      languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: (await import('@typescript-eslint/parser')).default,
        globals: {
          ...globals.browser,
          ...globals.es2021,
        },
      },
      plugins: {
        react: (await import('eslint-plugin-react')).default,
        'react-hooks': (await import('eslint-plugin-react-hooks')).default,
        'react-native': (await import('eslint-plugin-react-native')).default,
        '@typescript-eslint': (await import('@typescript-eslint/eslint-plugin')).default,
        import: (await import('eslint-plugin-import')).default,
        prettier: (await import('eslint-plugin-prettier')).default,
      },
      rules: {
        'prettier/prettier': ['warn'],
        'react/react-in-jsx-scope': 'off',
        'react-native/no-inline-styles': 'warn',
        'react-native/split-platform-components': 'off',
        'react-native/no-color-literals': 'off',
        'react-native/no-raw-text': 'off',
        '@typescript-eslint/no-unused-vars': ['warn'],
        'import/order': [
          'warn',
          {
            groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
            'newlines-between': 'always',
          },
        ],
      },
    },
  ];
})();
