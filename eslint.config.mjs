import expo from 'eslint-config-expo/flat.js'

export default [
  { ignores: ['dist/**', 'web-build/**'] },
  ...expo,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
]
