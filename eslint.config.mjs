import expo from 'eslint-config-expo/flat.js'

export default [
  ...expo,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
]
