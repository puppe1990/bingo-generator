import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

const sourceFiles = ['**/*.{js,jsx}']
const configFiles = ['*.config.js', 'eslint.config.js']
const testFiles = ['src/**/*.test.{js,jsx}']

export default [
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**']
  },
  {
    files: sourceFiles,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ]
    }
  },
  {
    files: configFiles,
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: testFiles,
    languageOptions: {
      globals: {
        ...globals.browser
      }
    }
  }
]
