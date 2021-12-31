'use strict'

module.exports = {
  env: {
    node: true,
    es2020: true
  },
  extends: [
    '@supercharge/typescript'
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    '@typescript-eslint/method-signature-style': 0
  }
}
